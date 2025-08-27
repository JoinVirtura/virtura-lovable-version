import { useState } from "react";
import virturaLogo from "/lovable-uploads/f264298f-2877-485b-affc-d705994fc848.png";
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
  Settings,
  Upload,
  Download
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
    { id: "upload", label: "Upload", icon: Upload },
    { id: "individuals", label: "Individuals", icon: User },
    { id: "brands", label: "Brands", icon: Building2 },
    { id: "library", label: "My Library", icon: Library },
    { id: "guide", label: "To-Do Guide", icon: BookOpen },
  ];

  return (
    <Sidebar className="border-r border-border">
      <SidebarHeader className="p-4">
        <div>
          <h1 className="text-xl font-display font-bold text-foreground leading-tight">
            Virtura
          </h1>
          <p className="text-xs text-muted-foreground">Where Identity Evolves</p>
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel className="text-muted-foreground">Quick Actions</SidebarGroupLabel>
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
      </SidebarContent>

      <SidebarFooter className="p-4 space-y-2">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton className="w-full justify-start gap-3 hover:bg-accent">
              <Crown className="w-5 h-5" />
              <span className="font-medium">Upgrade Plan</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton 
              onClick={() => onViewChange("export")}
              isActive={activeView === "export"}
              className={`w-full justify-start gap-3 ${
                activeView === "export" 
                  ? "bg-primary text-primary-foreground shadow-gold" 
                  : "hover:bg-accent"
              }`}
            >
              <Download className="w-5 h-5" />
              <span className="font-medium">Export</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton 
              onClick={() => onViewChange("settings")}
              isActive={activeView === "settings"}
              className={`w-full justify-start gap-3 ${
                activeView === "settings" 
                  ? "bg-primary text-primary-foreground shadow-gold" 
                  : "hover:bg-accent"
              }`}
            >
              <Settings className="w-5 h-5" />
              <span className="font-medium">Settings</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
        
        <SidebarSeparator />
        
        <div className="flex items-center gap-3 py-2">
          <Avatar className="w-10 h-10">
            <AvatarImage src="/lovable-uploads/517f5d9c-c223-4625-9aa5-5f2ef255f576.png" />
            <AvatarFallback>J</AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <p className="font-medium text-sm">Jeff</p>
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