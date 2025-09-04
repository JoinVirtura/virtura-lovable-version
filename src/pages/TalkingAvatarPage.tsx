import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from "@/components/ui/breadcrumb";
import { Card } from "@/components/ui/card";
import { motion } from "framer-motion";

// Placeholder components that will be implemented
const HeroCanvas = () => (
  <Card className="h-[400px] bg-gradient-to-br from-card/80 to-card/60 rounded-2xl border border-border/50 flex items-center justify-center">
    <motion.div 
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className="text-muted-foreground text-lg"
    >
      Hero Canvas Placeholder
    </motion.div>
  </Card>
);

const StudioTabs = () => (
  <Card className="mt-6 bg-gradient-to-br from-card/80 to-card/60 rounded-2xl border border-border/50 p-6">
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1 }}
      className="text-muted-foreground"
    >
      Studio Tabs Placeholder
    </motion.div>
  </Card>
);

const RightRail = () => (
  <motion.div 
    initial={{ opacity: 0, x: 20 }}
    animate={{ opacity: 1, x: 0 }}
    transition={{ delay: 0.2 }}
    className="w-[360px] space-y-4"
  >
    <Card className="bg-gradient-to-br from-card/80 to-card/60 rounded-2xl border border-border/50 p-6">
      <h3 className="text-lg font-semibold mb-4">Voice Settings</h3>
      <div className="text-muted-foreground">Voice controls placeholder</div>
    </Card>
    
    <Card className="bg-gradient-to-br from-card/80 to-card/60 rounded-2xl border border-border/50 p-6">
      <h3 className="text-lg font-semibold mb-4">Style Controls</h3>
      <div className="text-muted-foreground">Style controls placeholder</div>
    </Card>
    
    <Card className="bg-gradient-to-br from-card/80 to-card/60 rounded-2xl border border-border/50 p-6">
      <h3 className="text-lg font-semibold mb-4">Export Settings</h3>
      <div className="text-muted-foreground">Export settings placeholder</div>
    </Card>
  </motion.div>
);

export default function TalkingAvatarPage() {
  return (
    <div className="min-h-screen w-full" style={{ backgroundColor: '#0B0B0F' }}>
      <SidebarProvider>
        <div className="flex min-h-screen w-full">
          <AppSidebar />
          
          <main className="flex-1 flex flex-col min-h-screen">
            {/* Header with Breadcrumbs */}
            <header className="border-b border-border/50 bg-card/30 backdrop-blur-sm">
              <div className="flex items-center gap-4 px-6 py-4">
                <Breadcrumb>
                  <BreadcrumbList>
                    <BreadcrumbItem>
                      <BreadcrumbLink href="/dashboard">Dashboard</BreadcrumbLink>
                    </BreadcrumbItem>
                    <BreadcrumbSeparator />
                    <BreadcrumbItem>
                      <BreadcrumbPage>Talking Avatar</BreadcrumbPage>
                    </BreadcrumbItem>
                  </BreadcrumbList>
                </Breadcrumb>
              </div>
            </header>

            {/* Main Content */}
            <div className="flex-1 flex gap-6 p-6">
              {/* Main Column */}
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex-1 max-w-4xl"
              >
                <div className="space-y-6">
                  <div>
                    <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-primary-dark bg-clip-text text-transparent mb-2">
                      🎭 Talking Avatar
                    </h1>
                    <p className="text-muted-foreground">
                      Create lifelike AI avatars with voice synthesis and lip sync
                    </p>
                  </div>
                  
                  <HeroCanvas />
                  <StudioTabs />
                </div>
              </motion.div>

              {/* Right Rail */}
              <div className="sticky top-6 h-fit">
                <RightRail />
              </div>
            </div>
          </main>
        </div>
      </SidebarProvider>
    </div>
  );
}