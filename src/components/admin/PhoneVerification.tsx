import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Phone, ShieldCheck } from "lucide-react";

interface PhoneVerificationProps {
  userId: string;
  onVerified: () => void;
}

export function PhoneVerification({ userId, onVerified }: PhoneVerificationProps) {
  const [phoneNumber, setPhoneNumber] = useState("");
  const [verificationCode, setVerificationCode] = useState("");
  const [codeSent, setCodeSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const sendVerificationCode = async () => {
    if (!phoneNumber) {
      toast({
        title: "Error",
        description: "Please enter a phone number",
        variant: "destructive",
      });
      return;
    }

    // Validate phone number format (basic validation)
    const phoneRegex = /^\+?[1-9]\d{1,14}$/;
    if (!phoneRegex.test(phoneNumber.replace(/\s/g, ''))) {
      toast({
        title: "Invalid Phone Number",
        description: "Please enter a valid phone number with country code (e.g., +1234567890)",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    try {
      // Generate 6-digit code
      const code = Math.floor(100000 + Math.random() * 900000).toString();
      
      // Store code in database with 10-minute expiry
      const expiresAt = new Date(Date.now() + 10 * 60 * 1000).toISOString();
      
      const { error: insertError } = await supabase
        .from('phone_verification_codes')
        .insert({
          user_id: userId,
          phone_number: phoneNumber,
          code: code,
          expires_at: expiresAt,
        });

      if (insertError) throw insertError;

      // Send SMS with verification code
      const { error: smsError } = await supabase.functions.invoke('send-sms-notification', {
        body: {
          userId: userId,
          message: `Your Virtura verification code is: ${code}. Valid for 10 minutes.`,
          notificationId: null,
        },
      });

      if (smsError) {
        console.error('SMS error:', smsError);
        toast({
          title: "SMS Service Error",
          description: "SMS service is not configured yet. Please add Twilio credentials.",
          variant: "destructive",
        });
        return;
      }

      setCodeSent(true);
      toast({
        title: "Code Sent",
        description: "Verification code sent to your phone",
      });
    } catch (error) {
      console.error('Error sending code:', error);
      toast({
        title: "Error",
        description: "Failed to send verification code",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const verifyCode = async () => {
    if (!verificationCode) {
      toast({
        title: "Error",
        description: "Please enter the verification code",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    try {
      // Check if code is valid
      const { data: codeData, error: codeError } = await supabase
        .from('phone_verification_codes')
        .select('*')
        .eq('user_id', userId)
        .eq('code', verificationCode)
        .gt('expires_at', new Date().toISOString())
        .single();

      if (codeError || !codeData) {
        toast({
          title: "Invalid Code",
          description: "The verification code is incorrect or has expired",
          variant: "destructive",
        });
        return;
      }

      // Mark phone as verified
      const { error: updateError } = await supabase
        .from('notification_preferences')
        .update({ 
          phone_number: codeData.phone_number,
          phone_verified: true 
        })
        .eq('user_id', userId);

      if (updateError) throw updateError;

      // Delete used verification code
      await supabase
        .from('phone_verification_codes')
        .delete()
        .eq('user_id', userId);

      toast({
        title: "Phone Verified",
        description: "Your phone number has been verified successfully",
      });

      onVerified();
    } catch (error) {
      console.error('Error verifying code:', error);
      toast({
        title: "Error",
        description: "Failed to verify code",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Phone className="h-5 w-5" />
          Phone Verification
        </CardTitle>
        <CardDescription>
          Verify your phone number to enable SMS notifications
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {!codeSent ? (
          <>
            <div className="space-y-2">
              <Label htmlFor="phone">Phone Number</Label>
              <Input
                id="phone"
                type="tel"
                placeholder="+1234567890"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                disabled={loading}
              />
              <p className="text-sm text-muted-foreground">
                Include country code (e.g., +1 for US)
              </p>
            </div>

            <Button
              onClick={sendVerificationCode}
              disabled={loading || !phoneNumber}
              className="w-full"
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Sending...
                </>
              ) : (
                "Send Verification Code"
              )}
            </Button>
          </>
        ) : (
          <>
            <Alert>
              <ShieldCheck className="h-4 w-4" />
              <AlertDescription>
                A verification code has been sent to {phoneNumber}
              </AlertDescription>
            </Alert>

            <div className="space-y-2">
              <Label htmlFor="code">Verification Code</Label>
              <Input
                id="code"
                type="text"
                placeholder="Enter 6-digit code"
                value={verificationCode}
                onChange={(e) => setVerificationCode(e.target.value)}
                disabled={loading}
                maxLength={6}
              />
            </div>

            <div className="flex gap-2">
              <Button
                onClick={verifyCode}
                disabled={loading || verificationCode.length !== 6}
                className="flex-1"
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Verifying...
                  </>
                ) : (
                  "Verify Code"
                )}
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  setCodeSent(false);
                  setVerificationCode("");
                }}
                disabled={loading}
              >
                Change Number
              </Button>
            </div>

            <Button
              variant="link"
              onClick={sendVerificationCode}
              disabled={loading}
              className="w-full"
            >
              Resend Code
            </Button>
          </>
        )}
      </CardContent>
    </Card>
  );
}
