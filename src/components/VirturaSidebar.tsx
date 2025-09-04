import { useState } from "react";
import { useNavigate } from "react-router-dom";
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
  SidebarTrigger,
  useSidebar,
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
  Download,
  Menu
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

interface VirturaSidebarProps {
  activeView: string;
  onViewChange: (view: string) => void;
}

export function VirturaSidebar({ activeView, onViewChange }: VirturaSidebarProps) {
  const { state } = useSidebar();
  const { signOut } = useAuth();
  const navigate = useNavigate();
  const isCollapsed = state === "collapsed";
  
  const mainItems = [
    { id: "overview", label: "Home", icon: Activity },
    { id: "talking-avatar", label: "Avatar", icon: Sparkles },
    { id: "studio", label: "Studio", icon: SettingsIcon },
  ];

  const navigationTabs = [
    { id: "individuals", label: "Individuals", icon: User },
    { id: "brands", label: "Brands", icon: Building2 },
    { id: "library", label: "Library", icon: Library },
    { id: "guide", label: "Tutorial", icon: BookOpen },
  ];
  
  const handleLogout = async () => {
    try {
      await signOut();
      navigate("/auth");
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  return (
    <Sidebar 
      className="border-r border-border"
      collapsible="icon"
    >
      <SidebarHeader className={isCollapsed ? "p-2" : "p-4"}>
        <div className="flex items-center justify-between">
          {!isCollapsed && (
            <div>
              <h1 className="text-xl font-display font-bold text-foreground leading-tight">
                Virtura
              </h1>
              <p className="text-xs text-muted-foreground">Where Identity Evolves</p>
            </div>
          )}
          <SidebarTrigger className="h-8 w-8 p-0 ml-auto" />
        </div>
      </SidebarHeader>

      <SidebarContent className={isCollapsed ? "px-1 pb-0" : "px-3 pb-0"}>
        <SidebarGroup>
          <SidebarGroupLabel className={`text-muted-foreground px-0 ${isCollapsed ? "hidden" : "block"}`}>Quick Actions</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {mainItems.map((item) => (
                <SidebarMenuItem key={item.id}>
                  <SidebarMenuButton 
                    onClick={() => onViewChange(item.id)}
                    isActive={activeView === item.id}
                    className={`w-full ${isCollapsed ? "justify-center px-2" : "justify-start gap-3"} ${
                      activeView === item.id 
                        ? "bg-primary text-primary-foreground shadow-gold" 
                        : "hover:bg-accent"
                    }`}
                  >
                    <item.icon className="w-4 h-4 shrink-0" />
                    {!isCollapsed && <span className="font-medium">{item.label}</span>}
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarSeparator />

        <SidebarGroup className="pb-0">
          <SidebarGroupLabel className={`text-muted-foreground px-0 ${isCollapsed ? "hidden" : "block"}`}>Navigation</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {navigationTabs.map((item) => (
                <SidebarMenuItem key={item.id}>
                  <SidebarMenuButton 
                    onClick={() => onViewChange(item.id)}
                    isActive={activeView === item.id}
                    className={`w-full ${isCollapsed ? "justify-center px-2" : "justify-start gap-3"} ${
                      activeView === item.id 
                        ? "bg-primary text-primary-foreground shadow-gold" 
                        : "hover:bg-accent"
                    }`}
                  >
                    <item.icon className="w-4 h-4 shrink-0" />
                    {!isCollapsed && <span className="font-medium">{item.label}</span>}
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup className="pb-0">
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton 
                  onClick={() => onViewChange("export")}
                  isActive={activeView === "export"}
                  className={`w-full ${isCollapsed ? "justify-center px-2" : "justify-start gap-3"} ${
                    activeView === "export" 
                      ? "bg-primary text-primary-foreground shadow-gold" 
                      : "hover:bg-accent"
                  }`}
                >
                  <Download className="w-4 h-4 shrink-0" />
                  {!isCollapsed && <span className="font-medium">Export</span>}
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton 
                  onClick={() => onViewChange("settings")}
                  isActive={activeView === "settings"}
                  className={`w-full ${isCollapsed ? "justify-center px-2" : "justify-start gap-3"} ${
                    activeView === "settings" 
                      ? "bg-primary text-primary-foreground shadow-gold" 
                      : "hover:bg-accent"
                  }`}
                >
                  <Settings className="w-4 h-4 shrink-0" />
                  {!isCollapsed && <span className="font-medium">Settings</span>}
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton 
                  onClick={() => onViewChange("upgrade")}
                  isActive={activeView === "upgrade"}
                  className={`w-full ${isCollapsed ? "justify-center px-2" : "justify-start gap-3"} ${
                    activeView === "upgrade" 
                      ? "bg-primary text-primary-foreground shadow-gold" 
                      : "hover:bg-accent"
                  }`}
                >
                  <Crown className="w-4 h-4 shrink-0" />
                  {!isCollapsed && <span className="font-medium">Upgrade</span>}
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="p-0">
        <SidebarSeparator className={isCollapsed ? "mx-1" : "mx-3"} />
        
        <div className={`flex items-center gap-3 ${isCollapsed ? "px-1 py-3 justify-center" : "px-3 py-3"}`}>
          <Avatar className="w-8 h-8">
            <AvatarImage src="/lovable-uploads/517f5d9c-c223-4625-9aa5-5f2ef255f576.png" />
            <AvatarFallback>J</AvatarFallback>
          </Avatar>
          {!isCollapsed && (
            <div className="flex-1 min-w-0">
              <p className="font-medium text-sm">Jeff Krammer</p>
              <p className="text-xs text-muted-foreground">Pro Plan</p>
            </div>
          )}
        </div>
        
        <div className={isCollapsed ? "px-1 pb-3" : "px-3 pb-3"}>
          <Button 
            variant="ghost" 
            onClick={handleLogout}
            className={`w-full ${isCollapsed ? "justify-center px-2" : "justify-start gap-3"} text-destructive hover:bg-destructive/10 h-auto py-2`}
          >
            <LogOut className="w-4 h-4 shrink-0" />
            {!isCollapsed && <span className="font-medium">Logout</span>}
          </Button>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}