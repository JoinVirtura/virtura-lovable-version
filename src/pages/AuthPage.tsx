import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Loader2, Eye, EyeOff, AlertCircle, CheckCircle, Shield, ArrowLeft, RotateCcw } from "lucide-react";
import { useRateLimiting } from "@/hooks/useRateLimiting";
import { useSecurityHeaders } from "@/hooks/useSecurityHeaders";
import { WelcomeModal } from "@/components/WelcomeModal";
import { useOnboarding } from "@/hooks/useOnboarding";

// Normalize email for rate limiting key
const normalizeEmail = (email: string) => email.trim().toLowerCase() || 'unknown';

export default function AuthPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [showWelcomeModal, setShowWelcomeModal] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState({
    hasMinLength: false,
    hasNumber: false,
    hasLetter: false,
    isValid: false
  });
  const navigate = useNavigate();
  const { isOnboardingComplete, loading: onboardingLoading } = useOnboarding();

  // Security enhancements
  useSecurityHeaders();
  
  // Compute rate limit keys based on email
  const normalizedEmail = useMemo(() => normalizeEmail(email), [email]);
  
  // Rate limiting for authentication attempts - per email, relaxed thresholds
  const signInRateLimit = useRateLimiting(`signin:${normalizedEmail}`, {
    maxAttempts: 5,
    windowMs: 15 * 60 * 1000, // 15 minutes
    blockDurationMs: 30 * 60 * 1000, // 30 minutes block
  });

  const signUpRateLimit = useRateLimiting(`signup:${normalizedEmail}`, {
    maxAttempts: 10, // Increased from 3
    windowMs: 60 * 60 * 1000, // 1 hour
    blockDurationMs: 15 * 60 * 1000, // 15 minutes block (reduced from 1 hour)
  });

  const passwordResetRateLimit = useRateLimiting(`password-reset:${normalizedEmail}`, {
    maxAttempts: 3,
    windowMs: 60 * 60 * 1000, // 1 hour
    blockDurationMs: 60 * 60 * 1000, // 1 hour block
  });

  // Enhanced password validation
  const validatePassword = (password: string) => {
    const hasMinLength = password.length >= 8;
    const hasNumber = /[0-9]/.test(password);
    const hasLetter = /[a-zA-Z]/.test(password);
    const isValid = hasMinLength && hasNumber && hasLetter;
    
    setPasswordStrength({
      hasMinLength,
      hasNumber,
      hasLetter,
      isValid
    });
    
    return isValid;
  };

  useEffect(() => {
    // Check if user is already logged in
    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        // Check if onboarding is complete
        if (!onboardingLoading && !isOnboardingComplete) {
          setShowWelcomeModal(true);
        } else {
          navigate("/dashboard");
        }
      }
    };
    checkUser();
  }, [navigate, isOnboardingComplete, onboardingLoading]);

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Check rate limiting
    if (signUpRateLimit.isBlocked) {
      const minutes = Math.ceil(signUpRateLimit.remainingTime / (60 * 1000));
      toast.error(`Too many signup attempts. Please try again in ${minutes} minutes.`);
      return;
    }
    
    // Validate password strength before proceeding
    if (!validatePassword(password)) {
      toast.error("Password does not meet security requirements");
      return;
    }
    
    setLoading(true);

    try {
      const redirectUrl = `${window.location.origin}/dashboard`;
      
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: redirectUrl
        }
      });

      if (error) {
        // Record attempt only on actual failure from Supabase
        signUpRateLimit.recordAttempt();
        
        // Track failed signup attempt
        trackAuthAttempt(email, "signup", false, error.message);
        
        // Enhanced error handling with security context
        if (error.message.includes("Password")) {
          toast.error("Password requirements not met. Please use a stronger password.");
        } else if (error.message.includes("already registered")) {
          toast.error("This email is already registered. Please sign in instead.");
        } else {
          toast.error(error.message || "Failed to sign up");
        }
        return;
      }
      
      // If signup successful and user is created, show success with signup bonus info
      if (data.user) {
        // Track successful signup
        trackAuthAttempt(email, "signup", true);
        
        // Track landing page signup conversion
        try {
          await fetch('https://ujaoziqnxhjqlmnvlxav.supabase.co/functions/v1/track-landing-analytics', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              event_type: 'signup_completed',
              session_id: sessionStorage.getItem('landing_session'),
              metadata: { email }
            })
          });
        } catch (trackingError) {
          // Silently ignore tracking errors
        }

        toast.success("Welcome! Check your email for the confirmation link. You've received 50 free tokens! 🎉", {
          duration: 5000,
        });
      } else {
        trackAuthAttempt(email, "signup", true);
        toast.success("Check your email for the confirmation link!");
      }
      
      // Reset rate limiting on successful signup
      signUpRateLimit.reset();
      
      // Clear sensitive data
      setPassword("");
    } catch (error: any) {
      signUpRateLimit.recordAttempt();
      trackAuthAttempt(email, "signup", false, "Unexpected error");
      toast.error("An unexpected error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Helper function to track auth attempts
  const trackAuthAttempt = async (
    attemptEmail: string,
    attemptType: "login" | "signup",
    success: boolean,
    failureReason?: string
  ) => {
    try {
      await fetch('https://ujaoziqnxhjqlmnvlxav.supabase.co/functions/v1/track-auth-attempt', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: attemptEmail,
          attempt_type: attemptType,
          success,
          failure_reason: failureReason || null,
          metadata: { source: 'auth_page' }
        })
      });
    } catch (e) {
      // Silently ignore tracking errors - don't block auth flow
      console.debug('[AuthPage] Failed to track auth attempt:', e);
    }
  };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Check rate limiting
    if (signInRateLimit.isBlocked) {
      const minutes = Math.ceil(signInRateLimit.remainingTime / (60 * 1000));
      toast.error(`Too many signin attempts. Please try again in ${minutes} minutes.`);
      return;
    }
    
    setLoading(true);

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        // Record attempt only on actual failure
        signInRateLimit.recordAttempt();
        
        // Track failed login attempt
        trackAuthAttempt(email, "login", false, error.message);
        
        // Enhanced error handling for security
        if (error.message.includes("Invalid login credentials")) {
          toast.error("Invalid email or password. Please check your credentials.");
        } else if (error.message.includes("Email not confirmed")) {
          toast.error("Please check your email and click the confirmation link before signing in.");
        } else {
          toast.error(error.message || "Failed to sign in");
        }
        return;
      }
      
      // Track successful login
      trackAuthAttempt(email, "login", true);
      
      toast.success("Welcome back!");
      
      // Reset rate limiting on successful signin
      signInRateLimit.reset();
      
      navigate("/dashboard");
      
      // Clear sensitive data
      setPassword("");
    } catch (error: any) {
      signInRateLimit.recordAttempt();
      trackAuthAttempt(email, "login", false, "Unexpected error");
      toast.error("An unexpected error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordReset = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Check rate limiting
    if (passwordResetRateLimit.isBlocked) {
      const minutes = Math.ceil(passwordResetRateLimit.remainingTime / (60 * 1000));
      toast.error(`Too many password reset attempts. Please try again in ${minutes} minutes.`);
      return;
    }
    
    setLoading(true);

    try {
      const redirectUrl = `${window.location.origin}/auth`;
      
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: redirectUrl,
      });

      if (error) {
        passwordResetRateLimit.recordAttempt();
        toast.error(error.message || "Failed to send reset email");
        return;
      }
      
      toast.success("Password reset email sent! Check your inbox.");
      passwordResetRateLimit.reset();
      setShowForgotPassword(false);
      setEmail("");
    } catch (error: any) {
      passwordResetRateLimit.recordAttempt();
      toast.error("An unexpected error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleResetLockout = (resetFn: () => void, type: string) => {
    resetFn();
    toast.success(`${type} lockout has been reset. You can try again.`);
  };

  return (
    <>
      <WelcomeModal 
        open={showWelcomeModal} 
        onOpenChange={(open) => {
          setShowWelcomeModal(open);
          if (!open) navigate("/dashboard");
        }} 
      />
      
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-muted p-4">
        <Card className="w-full max-w-md relative">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate("/")}
            className="absolute top-4 left-4 text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          
          <CardHeader className="text-center">
            <div className="flex items-center justify-center gap-2 mb-2">
              <Shield className="h-6 w-6 text-primary" />
              <CardTitle className="text-2xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
                Virtura AI
              </CardTitle>
            </div>
            <CardDescription>
              Your AI-powered content creation studio
            </CardDescription>
          </CardHeader>
        <CardContent>
          <Tabs defaultValue="signin" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="signin">Sign In</TabsTrigger>
              <TabsTrigger value="signup">Sign Up</TabsTrigger>
            </TabsList>
            
            <TabsContent value="signin">
              {!showForgotPassword ? (
                <form onSubmit={handleSignIn} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="email-signin">Email</Label>
                    <Input
                      id="email-signin"
                      type="email"
                      placeholder="Enter your email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="password-signin">Password</Label>
                      <Button
                        type="button"
                        variant="link"
                        size="sm"
                        className="px-0 text-xs h-auto"
                        onClick={() => setShowForgotPassword(true)}
                      >
                        Forgot Password?
                      </Button>
                    </div>
                    <div className="relative">
                      <Input
                        id="password-signin"
                        type={showPassword ? "text" : "password"}
                        placeholder="Enter your password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </Button>
                    </div>
                  </div>
                  <Button type="submit" className="w-full" disabled={loading || signInRateLimit.isBlocked}>
                    {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Sign In
                  </Button>
                  {signInRateLimit.isBlocked && (
                    <div className="text-center space-y-2">
                      <p className="text-sm text-destructive">
                        Too many attempts. Try again in {Math.ceil(signInRateLimit.remainingTime / (60 * 1000))} minutes.
                      </p>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="text-xs text-muted-foreground hover:text-foreground"
                        onClick={() => handleResetLockout(signInRateLimit.reset, 'Sign in')}
                      >
                        <RotateCcw className="h-3 w-3 mr-1" />
                        Reset lockout on this device
                      </Button>
                    </div>
                  )}
                </form>
              ) : (
                <form onSubmit={handlePasswordReset} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="email-reset">Email</Label>
                    <Input
                      id="email-reset"
                      type="email"
                      placeholder="Enter your email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                  </div>
                  <p className="text-sm text-muted-foreground">
                    We'll send you a link to reset your password.
                  </p>
                  <div className="flex gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      className="flex-1"
                      onClick={() => {
                        setShowForgotPassword(false);
                        setEmail("");
                      }}
                    >
                      Back
                    </Button>
                    <Button 
                      type="submit" 
                      className="flex-1" 
                      disabled={loading || passwordResetRateLimit.isBlocked}
                    >
                      {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                      Send Reset Link
                    </Button>
                  </div>
                  {passwordResetRateLimit.isBlocked && (
                    <div className="text-center space-y-2">
                      <p className="text-sm text-destructive">
                        Too many attempts. Try again in {Math.ceil(passwordResetRateLimit.remainingTime / (60 * 1000))} minutes.
                      </p>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="text-xs text-muted-foreground hover:text-foreground"
                        onClick={() => handleResetLockout(passwordResetRateLimit.reset, 'Password reset')}
                      >
                        <RotateCcw className="h-3 w-3 mr-1" />
                        Reset lockout on this device
                      </Button>
                    </div>
                  )}
                </form>
              )}
            </TabsContent>
            
            <TabsContent value="signup">
              <form onSubmit={handleSignUp} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email-signup">Email</Label>
                  <Input
                    id="email-signup"
                    type="email"
                    placeholder="Enter your email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password-signup">Password</Label>
                  <div className="relative">
                    <Input
                      id="password-signup"
                      type={showPassword ? "text" : "password"}
                      placeholder="Create a secure password"
                      value={password}
                      onChange={(e) => {
                        setPassword(e.target.value);
                        validatePassword(e.target.value);
                      }}
                      required
                      minLength={8}
                      className={`pr-10 ${password && !passwordStrength.isValid ? 'border-destructive' : password && passwordStrength.isValid ? 'border-green-500' : ''}`}
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </Button>
                  </div>
                  
                  {/* Password Strength Indicator */}
                  {password && (
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center gap-2">
                        {passwordStrength.hasMinLength ? (
                          <CheckCircle className="h-4 w-4 text-green-500" />
                        ) : (
                          <AlertCircle className="h-4 w-4 text-destructive" />
                        )}
                        <span className={passwordStrength.hasMinLength ? "text-green-600" : "text-destructive"}>
                          At least 8 characters
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        {passwordStrength.hasNumber ? (
                          <CheckCircle className="h-4 w-4 text-green-500" />
                        ) : (
                          <AlertCircle className="h-4 w-4 text-destructive" />
                        )}
                        <span className={passwordStrength.hasNumber ? "text-green-600" : "text-destructive"}>
                          Contains at least one number
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        {passwordStrength.hasLetter ? (
                          <CheckCircle className="h-4 w-4 text-green-500" />
                        ) : (
                          <AlertCircle className="h-4 w-4 text-destructive" />
                        )}
                        <span className={passwordStrength.hasLetter ? "text-green-600" : "text-destructive"}>
                          Contains at least one letter
                        </span>
                      </div>
                    </div>
                  )}
                </div>
                <Button 
                  type="submit" 
                  className="w-full" 
                  disabled={loading || (password && !passwordStrength.isValid) || signUpRateLimit.isBlocked}
                >
                  {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Sign Up
                </Button>
                {signUpRateLimit.isBlocked && (
                  <div className="text-center space-y-2">
                    <p className="text-sm text-destructive">
                      Too many attempts. Try again in {Math.ceil(signUpRateLimit.remainingTime / (60 * 1000))} minutes.
                    </p>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="text-xs text-muted-foreground hover:text-foreground"
                      onClick={() => handleResetLockout(signUpRateLimit.reset, 'Sign up')}
                    >
                      <RotateCcw className="h-3 w-3 mr-1" />
                      Reset lockout on this device
                    </Button>
                  </div>
                )}
              </form>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
    </>
  );
}
