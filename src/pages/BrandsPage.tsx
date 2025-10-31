import { useState } from 'react';
import { SidebarProvider } from '@/components/ui/sidebar';
import { VirturaSidebar } from '@/components/VirturaSidebar';
import { BrandManager } from '@/components/brands/BrandManager';
import { MotionBackground } from '@/components/MotionBackground';

export default function BrandsPage() {
  const [activeView, setActiveView] = useState('brands');

  return (
    <SidebarProvider defaultOpen={true}>
      <div className="min-h-screen flex w-full bg-background relative overflow-hidden">
        <MotionBackground />
        <VirturaSidebar 
          activeView={activeView} 
          onViewChange={setActiveView}
        />
        <main className="flex-1 overflow-auto">
          <BrandManager />
        </main>
      </div>
    </SidebarProvider>
  );
}
