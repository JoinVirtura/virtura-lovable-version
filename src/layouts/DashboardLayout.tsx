import { ReactNode, useState } from 'react';
import { SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';
import { VirturaSidebar } from '@/components/VirturaSidebar';
import { MotionBackground } from '@/components/MotionBackground';
import { useNavigate } from 'react-router-dom';

interface DashboardLayoutProps {
  children: ReactNode;
  noPadding?: boolean;
  noBackground?: boolean;
}

export function DashboardLayout({ 
  children, 
  noPadding = false,
  noBackground = false 
}: DashboardLayoutProps) {
  const navigate = useNavigate();
  const [activeView, setActiveView] = useState("");

  // Handle navigation from sidebar - redirect to dashboard with the view
  const handleViewChange = (view: string) => {
    navigate('/dashboard', { state: { view } });
  };

  return (
    <SidebarProvider defaultOpen={false}>
      <div className="min-h-screen flex w-full bg-background relative overflow-hidden">
        {!noBackground && <MotionBackground />}
        
        {/* Fixed Mobile Header */}
        <header className="fixed top-0 left-0 right-0 z-50 md:hidden bg-black/90 backdrop-blur-xl border-b border-violet-500/20" style={{ paddingTop: 'env(safe-area-inset-top)' }}>
          <div className="flex items-center justify-between px-4 h-14">
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                Virtura AI
              </h1>
              <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20">
                v1.1.10
              </span>
            </div>
            <SidebarTrigger className="h-10 w-10 min-h-[44px] min-w-[44px] text-violet-400 hover:text-violet-300 hover:bg-violet-500/20 rounded-lg" />
          </div>
        </header>
        
        <VirturaSidebar 
          activeView={activeView}
          onViewChange={handleViewChange}
          onClearEditState={() => {}}
        />
      
        <div className="flex-1 flex flex-col relative z-10 overflow-x-hidden">
          <main className={noPadding ? 'flex-1 w-full pt-16 md:pt-6 pwa-safe-top' : 'flex-1 w-full p-4 md:p-6 pt-16 md:pt-6 pwa-safe-top'}>
            {children}
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}
