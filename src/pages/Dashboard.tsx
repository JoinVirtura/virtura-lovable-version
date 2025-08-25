import { useState } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { CreateAvatar } from "@/components/CreateAvatar"
import { AvatarStudio } from "@/components/AvatarStudio"
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/AppSidebar"
import { Button } from "@/components/ui/button"
import { supabase } from "@/integrations/supabase/client"
import { toast } from "sonner"

export default function Dashboard() {
  const [verifying, setVerifying] = useState(false)

  const handleVerify = async () => {
    try {
      setVerifying(true)
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
      ])

      const openaiOk = !openai.error && (openai.data?.success ?? openai.data?.ok ?? true)
      const hfOk = !hf.error && Boolean(hf.data?.success)

      if (openaiOk && hfOk) {
        toast.success('OpenAI and Hugging Face are configured correctly.')
      } else {
        if (!openaiOk) toast.error(`OpenAI test failed: ${openai.error?.message || openai.data?.error || 'unknown error'}`)
        if (!hfOk) toast.error(`Hugging Face test failed: ${hf.error?.message || hf.data?.error || 'unknown error'}`)
      }
    } catch (e) {
      console.error('Verification error:', e)
      toast.error(e instanceof Error ? e.message : 'Verification failed')
    } finally {
      setVerifying(false)
    }
  }

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-background">
        <AppSidebar />
        
        <div className="flex-1 flex flex-col">
          <header className="h-14 flex items-center justify-between px-6 border-b border-border bg-card">
            <div className="flex items-center gap-4">
              <SidebarTrigger />
              <h1 className="text-xl font-bold text-foreground">Virtura</h1>
            </div>
            <div className="flex items-center gap-3">
              <Button size="sm" variant="outline" onClick={handleVerify} disabled={verifying} className="border-border/50">
                {verifying ? 'Verifying...' : 'Verify AI Setup'}
              </Button>
            </div>
          </header>

          {/* Main Content */}
          <main className="flex-1 p-6">
            <Tabs defaultValue="create" className="w-full">
              <TabsList className="grid w-full grid-cols-2 max-w-md mb-6">
                <TabsTrigger value="create">Create Avatar</TabsTrigger>
                <TabsTrigger value="studio">Avatar Studio</TabsTrigger>
              </TabsList>
              
              <TabsContent value="create" className="space-y-6">
                <CreateAvatar />
              </TabsContent>
              
              <TabsContent value="studio" className="space-y-6">
                <AvatarStudio />
              </TabsContent>
            </Tabs>
          </main>
        </div>
      </div>
    </SidebarProvider>
  )
}