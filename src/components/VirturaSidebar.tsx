import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import virturaLogo from "/lovable-uploads/f264298f-2877-485b-affc-d705994fc848.png";
import { useProfile } from "@/hooks/useProfile";
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
  Menu,
  Image,
  LifeBuoy,
  Shield
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";

interface VirturaSidebarProps {
  activeView: string;
  onViewChange: (view: string) => void;
  onClearEditState?: () => void;
}

export function VirturaSidebar({ activeView, onViewChange, onClearEditState }: VirturaSidebarProps) {
  const { state, setOpenMobile, isMobile } = useSidebar();
  const { user, signOut } = useAuth();
  const { profile } = useProfile();
  const navigate = useNavigate();
  const isCollapsed = state === "collapsed";
  const [isAdmin, setIsAdmin] = useState(false);
  
  useEffect(() => {
    const checkAdmin = async () => {
      if (!user) return;
      
      const { data } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", user.id)
        .eq("role", "admin")
        .maybeSingle();
      
      setIsAdmin(!!data);
    };
    
    checkAdmin();
  }, [user]);
  
  const mainItems = [
    ...(isAdmin ? [{ id: "admin-dashboard", label: "Dashboard", icon: Shield }] : []),
    { id: "overview", label: "Home", icon: Home },
    { id: "talking-avatar", label: "Style", icon: Image },
    { id: "video-pro", label: "Video", icon: Video },
    { id: "library", label: "Library", icon: Library },
  ];

  const navigationTabs = [
    { id: "studio", label: "Copilot", icon: Command },
    { id: "brands", label: "Brands", icon: Building2 },
    { id: "guide", label: "Tutorial", icon: BookOpen },
    { id: "support", label: "Support", icon: LifeBuoy },
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
      <SidebarHeader className={!isMobile && isCollapsed ? "p-2" : "p-4"}>
        <div className="flex items-center justify-between gap-2">
          {(isMobile || !isCollapsed) && (
            <div className="flex-1">
              <h1 className="text-xl font-display font-bold text-gradient-primary drop-shadow-[0_0_10px_rgba(212,110,255,0.6)] leading-tight">
                Virtura
              </h1>
              <p className="text-xs text-violet-300">Where Identity Evolves</p>
            </div>
          )}
          <SidebarTrigger className={`h-10 w-10 min-h-[44px] min-w-[44px] p-0 text-violet-400 hover:text-violet-300 hover:bg-violet-500/20 rounded-lg transition-colors ${!isMobile && isCollapsed ? "mx-auto" : ""}`} />
        </div>
      </SidebarHeader>

      <SidebarContent className={!isMobile && isCollapsed ? "px-1 pb-0" : "px-3 pb-0"}>
        <SidebarGroup>
          <SidebarGroupLabel className={`text-muted-foreground px-0 ${!isMobile && isCollapsed ? "hidden" : "block"}`}>Quick Actions</SidebarGroupLabel>
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
                      if (item.id === "admin-dashboard") {
                        navigate("/admin/unified");
                      } else {
                        onViewChange(item.id);
                      }
                      if (isMobile) {
                        setOpenMobile(false);
                      }
                    }}
                    isActive={activeView === item.id}
                    className={`w-full min-h-[44px] transition-all duration-200 ${!isMobile && isCollapsed ? "justify-center" : "justify-start gap-3 px-3"} ${
                      activeView === item.id 
                        ? "bg-violet-500/20 text-violet-300 shadow-[inset_0_0_20px_rgba(212,110,255,0.2)] border border-violet-400/30" 
                        : "hover:bg-violet-500/5 hover:text-violet-300 text-gray-400"
                    }`}
                  >
                    <item.icon className="w-5 h-5 shrink-0" />
                    {(isMobile || !isCollapsed) && <span className="font-medium">{item.label}</span>}
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarSeparator />

        <SidebarGroup className="pb-0">
          <SidebarGroupLabel className={`text-muted-foreground px-0 ${!isMobile && isCollapsed ? "hidden" : "block"}`}>Navigation</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {navigationTabs.map((item) => (
                <SidebarMenuItem key={item.id}>
                  <SidebarMenuButton 
                    onClick={() => {
                      onClearEditState?.();
                      onViewChange(item.id);
                      if (isMobile) {
                        setOpenMobile(false);
                      }
                    }}
                    isActive={activeView === item.id}
                    className={`w-full min-h-[44px] transition-all duration-200 ${!isMobile && isCollapsed ? "justify-center" : "justify-start gap-3 px-3"} ${
                      activeView === item.id 
                        ? "bg-violet-500/20 text-violet-300 shadow-[inset_0_0_20px_rgba(212,110,255,0.2)] border border-violet-400/30" 
                        : "hover:bg-violet-500/5 hover:text-violet-300 text-gray-400"
                    }`}
                  >
                    <item.icon className="w-5 h-5 shrink-0" />
                    {(isMobile || !isCollapsed) && <span className="font-medium">{item.label}</span>}
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

      </SidebarContent>

      <SidebarFooter className="p-0">
        <SidebarSeparator className={!isMobile && isCollapsed ? "mx-1" : "mx-3"} />
        
        <button 
          onClick={() => {
            onViewChange('settings');
            setOpenMobile(false);
          }}
          className={`flex items-center transition-colors rounded-lg ml-3 mr-3 min-h-[44px] ${!isMobile && isCollapsed ? "py-3 justify-center" : "pl-4 pr-4 py-3 gap-3 justify-start"} hover:bg-violet-500/5 hover:text-violet-300 text-white`}
        >
          <Avatar className="w-10 h-10 ring-2 ring-violet-500/30 shrink-0">
            <AvatarImage src={profile?.avatar_url || undefined} />
            <AvatarFallback className="bg-violet-500/20 text-violet-300">
              {profile?.display_name
                ? profile.display_name
                    .split(' ')
                    .map((n) => n[0])
                    .join('')
                    .toUpperCase()
                    .slice(0, 2)
                : user?.email?.[0].toUpperCase() || 'U'}
            </AvatarFallback>
          </Avatar>
          {(isMobile || !isCollapsed) && (
            <div className="flex-1 min-w-0 text-left">
              <p className="font-medium text-sm text-white">
                {profile?.display_name || user?.email?.split('@')[0] || 'User'}
              </p>
            </div>
          )}
        </button>
        
        <div className={!isMobile && isCollapsed ? "px-2 pb-3" : "px-3 pb-3"}>
          <SidebarMenuButton 
            onClick={handleLogout}
            className={`w-full min-h-[44px] ${!isMobile && isCollapsed ? "justify-center" : "justify-start gap-3 pl-5"} text-destructive hover:bg-destructive/10 h-auto py-2`}
          >
            <LogOut className="w-5 h-5 shrink-0" />
            {(isMobile || !isCollapsed) && <span className="font-medium">Logout</span>}
          </SidebarMenuButton>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}