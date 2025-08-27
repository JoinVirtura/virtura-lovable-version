import { useState } from "react";
import { 
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarFooter,
  SidebarSeparator,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarGroupContent,
} from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  Activity, 
  Plus, 
  Settings as SettingsIcon, 
  Zap, 
  Crown,
  LogOut,
  Sparkles,
  User,
  Building2,
  Library,
  BookOpen,
  Settings
} from "lucide-react";

interface VirturaSidebarProps {
  activeView: string;
  onViewChange: (view: string) => void;
}

export function VirturaSidebar({ activeView, onViewChange }: VirturaSidebarProps) {
  const mainItems = [
    { id: "overview", label: "Overview", icon: Activity },
    { id: "create", label: "Create Avatar", icon: Plus },
    { id: "studio", label: "Avatar Studio", icon: SettingsIcon },
  ];

  const navigationTabs = [
    { id: "individuals", label: "Individuals", icon: User },
    { id: "brands", label: "Brands", icon: Building2 },
    { id: "library", label: "My Library", icon: Library },
    { id: "guide", label: "To-Do Guide", icon: BookOpen },
    { id: "settings", label: "Settings", icon: Settings },
  ];

  return (
    <Sidebar className="border-r border-border">
      <SidebarHeader className="p-4">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-gradient-gold rounded-lg flex items-center justify-center">
            <Sparkles className="w-5 h-5 text-primary-foreground" />
          </div>
          <h1 className="text-xl font-display font-bold bg-gradient-gold bg-clip-text text-transparent">
            Virtura
          </h1>
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {mainItems.map((item) => (
                <SidebarMenuItem key={item.id}>
                  <SidebarMenuButton 
                    onClick={() => onViewChange(item.id)}
                    isActive={activeView === item.id}
                    className={`w-full justify-start gap-3 ${
                      activeView === item.id 
                        ? "bg-primary text-primary-foreground shadow-gold" 
                        : "hover:bg-accent"
                    }`}
                  >
                    <item.icon className="w-5 h-5" />
                    <span className="font-medium">{item.label}</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarSeparator />

        <SidebarGroup>
          <SidebarGroupLabel className="text-muted-foreground">Navigation</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {navigationTabs.map((item) => (
                <SidebarMenuItem key={item.id}>
                  <SidebarMenuButton 
                    onClick={() => onViewChange(item.id)}
                    isActive={activeView === item.id}
                    className={`w-full justify-start gap-3 ${
                      activeView === item.id 
                        ? "bg-primary text-primary-foreground shadow-gold" 
                        : "hover:bg-accent"
                    }`}
                  >
                    <item.icon className="w-5 h-5" />
                    <span className="font-medium">{item.label}</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarSeparator />

        <SidebarGroup>
          <SidebarGroupLabel className="text-muted-foreground">Quick Actions</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton className="w-full justify-start gap-3 text-primary hover:bg-primary/10">
                  <Zap className="w-5 h-5" />
                  <span className="font-medium">Generate Random</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton className="w-full justify-start gap-3 hover:bg-accent">
                  <Crown className="w-5 h-5" />
                  <span className="font-medium">Upgrade Plan</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="p-4">
        <div className="flex items-center gap-3 mb-4">
          <Avatar className="w-10 h-10">
            <AvatarImage src="/api/placeholder/40/40" />
            <AvatarFallback>U</AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <p className="font-medium text-sm">User</p>
            <p className="text-xs text-muted-foreground">Pro Plan</p>
          </div>
        </div>
        
        <Button 
          variant="ghost" 
          className="w-full justify-start gap-3 text-destructive hover:bg-destructive/10"
        >
          <LogOut className="w-4 h-4" />
          Logout
        </Button>
      </SidebarFooter>
    </Sidebar>
  );
}