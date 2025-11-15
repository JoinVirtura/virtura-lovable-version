import { SettingsContent } from "@/components/SettingsContent";
import { useToast } from "@/hooks/use-toast";
import { useProfile } from "@/hooks/useProfile";
import { useAuth } from "@/hooks/useAuth";
import { useUsageTracking } from "@/hooks/useUsageTracking";
import { supabase } from "@/integrations/supabase/client";
import { useState, useEffect, useRef } from "react";

export const DashboardSettingsContent = () => {
  const { toast } = useToast();
  const { user } = useAuth();
  const { profile, loading: profileLoading, uploadAvatar, updateProfile, uploading } = useProfile();
  const { usage, subscription, loading: usageLoading } = useUsageTracking();
  
  const [displayName, setDisplayName] = useState("");
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Password change dialog state
  const [showPasswordDialog, setShowPasswordDialog] = useState(false);
  const [passwordForm, setPasswordForm] = useState({
    newPassword: '',
    confirmPassword: ''
  });
  const [changingPassword, setChangingPassword] = useState(false);

  // Privacy & Security settings
  const [contentVisibility, setContentVisibility] = useState('private');
  const [libraryPublic, setLibraryPublic] = useState(false);
  const [aiTrainingOptIn, setAiTrainingOptIn] = useState(false);
  const [autoDeleteOld, setAutoDeleteOld] = useState(false);
  const [saveVoiceClones, setSaveVoiceClones] = useState(true);
  const [downloadProtection, setDownloadProtection] = useState(false);
  
  // Billing history state
  const [showBillingHistory, setShowBillingHistory] = useState(false);
  const [billingHistory, setBillingHistory] = useState<any[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(false);

  // Pre-fill form when profile loads
  useEffect(() => {
    if (profile) {
      setDisplayName(profile.display_name || "");
      setPreviewUrl(profile.avatar_url);
      
      // Load privacy settings
      setContentVisibility(profile.content_visibility_default || 'private');
      setLibraryPublic(profile.library_public || false);
      setAiTrainingOptIn(profile.ai_training_opt_in || false);
      setAutoDeleteOld(profile.auto_delete_old_projects || false);
      setSaveVoiceClones(profile.save_voice_clones !== false);
      setDownloadProtection(profile.download_protection || false);
    }
  }, [profile]);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      toast({
        title: "File too large",
        description: "Avatar must be less than 2MB",
        variant: "destructive",
      });
      return;
    }

    if (!['image/png', 'image/jpeg', 'image/jpg', 'image/webp'].includes(file.type)) {
      toast({
        title: "Invalid file type",
        description: "Please upload a PNG, JPG, or WEBP image",
        variant: "destructive",
      });
      return;
    }

    setAvatarFile(file);
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreviewUrl(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleSaveProfile = async () => {
    try {
      setSaving(true);

      if (avatarFile) {
        const avatarUrl = await uploadAvatar(avatarFile);
        if (avatarUrl) {
          setPreviewUrl(avatarUrl);
          setAvatarFile(null);
        }
      }

      if (displayName !== profile?.display_name) {
        await updateProfile({ display_name: displayName });
      }

      toast({
        title: "Profile updated",
        description: "Your changes have been saved successfully",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to update profile",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const handlePasswordChange = async () => {
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      toast({
        title: "Passwords don't match",
        description: "Please make sure both passwords are the same",
        variant: "destructive",
      });
      return;
    }

    if (passwordForm.newPassword.length < 6) {
      toast({
        title: "Password too short",
        description: "Password must be at least 6 characters long",
        variant: "destructive",
      });
      return;
    }

    try {
      setChangingPassword(true);
      
      const { error } = await supabase.auth.updateUser({
        password: passwordForm.newPassword
      });

      if (error) throw error;

      toast({
        title: "Password changed",
        description: "Your password has been updated successfully",
      });
      
      setShowPasswordDialog(false);
      setPasswordForm({ newPassword: '', confirmPassword: '' });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to change password",
        variant: "destructive",
      });
    } finally {
      setChangingPassword(false);
    }
  };

  const getInitials = (name: string) => {
    if (!name) return "U";
    const parts = name.trim().split(/\s+/);
    if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
    return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
  };

  const openCustomerPortal = async () => {
    try {
      const { data, error } = await supabase.functions.invoke('customer-portal');
      
      if (error) throw error;
      
      if (data?.url) {
        window.location.href = data.url;
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to open customer portal",
        variant: "destructive",
      });
    }
  };

  const fetchBillingHistory = async () => {
    try {
      setLoadingHistory(true);
      const { data, error } = await supabase.functions.invoke('get-billing-history');
      
      if (error) throw error;
      
      setBillingHistory(data?.invoices || []);
      setShowBillingHistory(true);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to fetch billing history",
        variant: "destructive",
      });
    } finally {
      setLoadingHistory(false);
    }
  };

  const startSubscription = async (planId: string) => {
    try {
      const { data, error } = await supabase.functions.invoke('create-checkout', {
        body: { planId }
      });
      
      if (error) throw error;
      
      if (data?.url) {
        window.location.href = data.url;
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to start subscription",
        variant: "destructive",
      });
    }
  };

  const buyTokens = async (tokens: number, price: string) => {
    try {
      const { data, error } = await supabase.functions.invoke('create-payment', {
        body: { tokens, price }
      });
      
      if (error) throw error;
      
      if (data?.url) {
        window.location.href = data.url;
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to initiate token purchase",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-8 pb-20">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl sm:text-3xl lg:text-4xl font-display font-bold text-foreground mb-2">Settings</h1>
        <p className="text-sm sm:text-base text-muted-foreground">Manage your account and preferences</p>
      </div>

      <SettingsContent
        profile={profile}
        profileLoading={profileLoading}
        user={user}
        usage={usage}
        subscription={subscription}
        usageLoading={usageLoading}
        displayName={displayName}
        setDisplayName={setDisplayName}
        previewUrl={previewUrl}
        fileInputRef={fileInputRef}
        handleFileSelect={handleFileSelect}
        uploading={uploading}
        saving={saving}
        handleSaveProfile={handleSaveProfile}
        getInitials={getInitials}
        showPasswordDialog={showPasswordDialog}
        setShowPasswordDialog={setShowPasswordDialog}
        passwordForm={passwordForm}
        setPasswordForm={setPasswordForm}
        changingPassword={changingPassword}
        handlePasswordChange={handlePasswordChange}
        contentVisibility={contentVisibility}
        setContentVisibility={setContentVisibility}
        libraryPublic={libraryPublic}
        setLibraryPublic={setLibraryPublic}
        aiTrainingOptIn={aiTrainingOptIn}
        setAiTrainingOptIn={setAiTrainingOptIn}
        autoDeleteOld={autoDeleteOld}
        setAutoDeleteOld={setAutoDeleteOld}
        saveVoiceClones={saveVoiceClones}
        setSaveVoiceClones={setSaveVoiceClones}
        downloadProtection={downloadProtection}
        setDownloadProtection={setDownloadProtection}
        updateProfile={updateProfile}
        openCustomerPortal={openCustomerPortal}
        fetchBillingHistory={fetchBillingHistory}
        showBillingHistory={showBillingHistory}
        setShowBillingHistory={setShowBillingHistory}
        billingHistory={billingHistory}
        loadingHistory={loadingHistory}
        startSubscription={startSubscription}
        buyTokens={buyTokens}
      />
    </div>
  );
};
