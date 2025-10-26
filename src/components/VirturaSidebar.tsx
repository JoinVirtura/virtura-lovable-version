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
  Home,
  Video,
  Plus, 
  Settings as SettingsIcon, 
  Zap, 
  Crown,
  LogOut,
  Command,
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
  onClearEditState?: () => void;
}

export function VirturaSidebar({ activeView, onViewChange, onClearEditState }: VirturaSidebarProps) {
  const { state } = useSidebar();
  const { signOut } = useAuth();
  const navigate = useNavigate();
  const isCollapsed = state === "collapsed";
  
  const mainItems = [
    { id: "overview", label: "Home", icon: Home },
    { id: "studio", label: "Copilot", icon: Command },
    { id: "talking-avatar", label: "Image Pro", icon: Video },
    { id: "video-pro", label: "Video Pro", icon: Video },
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
      className="bg-black/90 backdrop-blur-xl border-r border-violet-500/20"
      collapsible="icon"
    >
      <SidebarHeader className={isCollapsed ? "p-2" : "p-4"}>
        <div className="flex items-center justify-between">
          {!isCollapsed && (
            <div>
              <h1 className="text-xl font-display font-bold text-gradient-primary drop-shadow-[0_0_10px_rgba(212,110,255,0.6)] leading-tight">
                Virtura
              </h1>
              <p className="text-xs text-violet-300">Where Identity Evolves</p>
            </div>
          )}
          <SidebarTrigger className="h-8 w-8 p-0 ml-auto text-violet-400 hover:text-violet-300" />
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
                    onClick={() => {
                      // Clear edit state when navigating to studio normally
                      if (item.id === "studio" && onClearEditState) {
                        onClearEditState();
                      }
                      onViewChange(item.id);
                    }}
                    isActive={activeView === item.id}
                    className={`w-full ${isCollapsed ? "justify-center px-2" : "justify-start gap-3"} ${
                      activeView === item.id 
                        ? "bg-violet-500/20 text-violet-300 shadow-[inset_0_0_20px_rgba(212,110,255,0.2)] border border-violet-400/30" 
                        : "hover:bg-violet-500/5 hover:text-violet-300 text-gray-400"
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
                        ? "bg-violet-500/20 text-violet-300 shadow-[inset_0_0_20px_rgba(212,110,255,0.2)] border border-violet-400/30" 
                        : "hover:bg-violet-500/5 hover:text-violet-300 text-gray-400"
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

      </SidebarContent>

      <SidebarFooter className="p-0">
        <SidebarSeparator className={isCollapsed ? "mx-1" : "mx-3"} />
        
        <button 
          onClick={() => onViewChange("settings")}
          className={`flex items-center w-full transition-colors rounded-lg ${isCollapsed ? "px-2 py-3 justify-center" : "pl-6 pr-4 py-3 gap-3"} ${
            activeView === "settings" 
              ? "bg-violet-500/20 text-violet-300 shadow-[inset_0_0_20px_rgba(212,110,255,0.2)] border border-violet-400/30" 
              : "hover:bg-violet-500/5 hover:text-violet-300 text-white"
          }`}
        >
          <Avatar className="w-8 h-8 ring-2 ring-violet-500/30 shrink-0">
            <AvatarImage src="/lovable-uploads/517f5d9c-c223-4625-9aa5-5f2ef255f576.png" />
            <AvatarFallback className="bg-violet-500/20 text-violet-300">J</AvatarFallback>
          </Avatar>
          {!isCollapsed && (
            <div className="flex-1 min-w-0 text-left">
              <p className="font-medium text-sm text-white">Jeff Krammer</p>
            </div>
          )}
        </button>
        
        <div className={isCollapsed ? "px-2 pb-3" : "px-3 pb-3"}>
          <SidebarMenuButton 
            onClick={handleLogout}
            className={`w-full ${isCollapsed ? "justify-center px-2" : "justify-start gap-3 pl-5"} text-destructive hover:bg-destructive/10 h-auto py-2`}
          >
            <LogOut className="w-4 h-4 shrink-0" />
            {!isCollapsed && <span className="font-medium">Logout</span>}
          </SidebarMenuButton>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}