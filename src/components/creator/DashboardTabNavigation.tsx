import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { LayoutDashboard, DollarSign, Wallet, BarChart3, Handshake } from 'lucide-react';

interface DashboardTabNavigationProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

export function DashboardTabNavigation({ activeTab, onTabChange }: DashboardTabNavigationProps) {
  const tabs = [
    { id: 'overview', label: 'Overview', icon: LayoutDashboard },
    { id: 'earnings', label: 'Earnings', icon: DollarSign },
    { id: 'payouts', label: 'Payouts', icon: Wallet },
    { id: 'content', label: 'Content', icon: BarChart3 },
    { id: 'deals', label: 'Deals', icon: Handshake },
  ];

  return (
    <Tabs value={activeTab} onValueChange={onTabChange} className="w-full">
      <TabsList className="grid w-full grid-cols-5 h-12">
        {tabs.map((tab) => (
          <TabsTrigger 
            key={tab.id} 
            value={tab.id}
            className="flex items-center gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
          >
            <tab.icon className="w-4 h-4" />
            <span className="hidden sm:inline">{tab.label}</span>
          </TabsTrigger>
        ))}
      </TabsList>
    </Tabs>
  );
}
