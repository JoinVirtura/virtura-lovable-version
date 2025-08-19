import { useState } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { CreateAvatar } from "@/components/CreateAvatar"
import { AvatarStudio } from "@/components/AvatarStudio"
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/AppSidebar"

export default function Dashboard() {
  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-background">
        <AppSidebar />
        
        <div className="flex-1 flex flex-col">
          {/* Header */}
          <header className="h-14 flex items-center justify-between px-6 border-b border-border bg-card">
            <div className="flex items-center gap-4">
              <SidebarTrigger />
              <h1 className="text-xl font-bold text-foreground">Virtura</h1>
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