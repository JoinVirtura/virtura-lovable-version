import { useState } from "react";
import { SidebarProvider } from "@/components/ui/sidebar";
import { VirturaSidebar } from "@/components/VirturaSidebar";
import { OverviewPage } from "@/components/OverviewPage";
import { CreateAvatar } from "@/components/CreateAvatar";
import { AvatarStudio } from "@/components/AvatarStudio";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export default function Dashboard() {
  const [activeView, setActiveView] = useState("overview");
  const [verifying, setVerifying] = useState(false);

  const handleVerify = async () => {
    try {
      setVerifying(true);
      const [openai, hf] = await Promise.all([
        supabase.functions.invoke('test-openai'),
        supabase.functions.invoke('generate-avatar-hf', {
          body: {
            prompt: 'sanity check portrait, plain background',
            style: 'photorealistic',
            resolution: '512x512',
            creativity: 0.2,
          },
        }),
      ]);

      const openaiOk = !openai.error && (openai.data?.success ?? openai.data?.ok ?? true);
      const hfOk = !hf.error && Boolean(hf.data?.success);

      if (openaiOk && hfOk) {
        toast.success('OpenAI and Hugging Face are configured correctly.');
      } else {
        if (!openaiOk) toast.error(`OpenAI test failed: ${openai.error?.message || openai.data?.error || 'unknown error'}`);
        if (!hfOk) toast.error(`Hugging Face test failed: ${hf.error?.message || hf.data?.error || 'unknown error'}`);
      }
    } catch (e) {
      console.error('Verification error:', e);
      toast.error(e instanceof Error ? e.message : 'Verification failed');
    } finally {
      setVerifying(false);
    }
  };

  const renderContent = () => {
    switch (activeView) {
      case "overview":
        return <OverviewPage />;
      case "create":
        return <CreateAvatar />;
      case "studio":
        return <AvatarStudio />;
      default:
        return <OverviewPage />;
    }
  };

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-background">
        <VirturaSidebar activeView={activeView} onViewChange={setActiveView} />
        
        <div className="flex-1 flex flex-col">
          {/* Optional header for additional actions */}
          <header className="h-14 flex items-center justify-end px-6 border-b border-border bg-card/50">
            <Button 
              size="sm" 
              variant="outline" 
              onClick={handleVerify} 
              disabled={verifying} 
              className="border-border/50"
            >
              {verifying ? 'Verifying...' : 'Verify AI Setup'}
            </Button>
          </header>

          {/* Main Content */}
          <main className="flex-1 p-6">
            {renderContent()}
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}