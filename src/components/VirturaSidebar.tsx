import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
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
  Shield,
  Briefcase,
  FolderKanban,
  DollarSign,
  Bell,
  Bookmark,
  BarChart3,
  Calendar,
  BadgeCheck,
} from "lucide-react";
import { NotificationBell } from "@/components/NotificationBell";
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
  const location = useLocation();
  const isCollapsed = state === "collapsed";
  const [isAdmin, setIsAdmin] = useState(false);
  const [hasCreatorAccount, setHasCreatorAccount] = useState(false);
  const [hasBrands, setHasBrands] = useState(false);

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

    const checkCreatorStatus = async () => {
      if (!user) return;

      const { data } = await supabase.from("creator_accounts").select("id").eq("user_id", user.id).maybeSingle();

      setHasCreatorAccount(!!data);
    };

    const checkBrands = async () => {
      if (!user) return;

      const { data } = await supabase.from("brands").select("id").eq("user_id", user.id).limit(1);

      setHasBrands((data?.length ?? 0) > 0);
    };

    checkAdmin();
    checkCreatorStatus();
    checkBrands();
  }, [user]);

  // Main navigation items
  const mainItems = [
    ...(isAdmin ? [{ id: "admin-dashboard", label: "Dashboard", icon: Shield }] : []),
    { id: "overview", label: "Home", icon: Home },
    { id: "talking-avatar", label: "Style", icon: Image },
    { id: "video-pro", label: "Video", icon: Video },
    { id: "library", label: "Library", icon: Library },
  ];

  // Social section with notification bell
  const socialItems = [
    { id: "social-feed", label: "Feed", icon: Home, path: "/social" },
  ];
  
  const socialHeaderActions = (
    <div className="flex items-center gap-2">
      <NotificationBell />
    </div>
  );

  // Creator Hub - consolidated creator features
  const creatorItems = [
    { id: "creator-dashboard", label: "Dashboard", icon: DollarSign, path: "/creator-dashboard" },
    { id: "scheduled-posts", label: "Scheduled", icon: Calendar, path: "/scheduled-posts" },
    { id: "verification", label: "Verification", icon: BadgeCheck, path: "/verification" },
    { id: "marketplace", label: "Marketplace", icon: Briefcase, path: "/marketplace" },
  ];

  // More section - utilities and support
  const moreItems = [
    { id: "studio", label: "Copilot", icon: Command },
    { id: "brands", label: "Brands", icon: Building2 },
    { id: "guide", label: "Tutorial", icon: BookOpen },
    { id: "support", label: "Support", icon: LifeBuoy, path: "/support" },
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
    <Sidebar className="bg-black/90 backdrop-blur-xl border-r border-violet-500/20" collapsible="icon">
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
          <SidebarTrigger
            className={`h-10 w-10 min-h-[44px] min-w-[44px] p-0 text-violet-400 hover:text-violet-300 hover:bg-violet-500/20 rounded-lg transition-colors ${!isMobile && isCollapsed ? "mx-auto" : ""}`}
          />
        </div>
      </SidebarHeader>

      <SidebarContent className={!isMobile && isCollapsed ? "px-1 pb-0" : "px-3 pb-0"}>
        {/* Main Section */}
        <SidebarGroup>
          <SidebarGroupLabel className={`text-muted-foreground px-0 text-xs py-1 ${!isMobile && isCollapsed ? "hidden" : "block"}`}>
            Main
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {mainItems.map((item) => (
                <SidebarMenuItem key={item.id}>
                  <SidebarMenuButton
                    onClick={() => {
                      if (item.id === "studio" && onClearEditState) {
                        onClearEditState();
                      }
                      onViewChange(item.id);
                      if (isMobile) {
                        setOpenMobile(false);
                      }
                    }}
                    isActive={activeView === item.id}
                    className={`w-full min-h-[40px] transition-all duration-200 ${!isMobile && isCollapsed ? "justify-center" : "justify-start gap-3 px-3"} ${
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

        <SidebarSeparator className="my-2" />

        {/* Social Section */}
        <SidebarGroup className="pb-0">
          <div className="flex items-center justify-between px-0 mb-1">
            <SidebarGroupLabel
              className={`text-muted-foreground m-0 text-xs py-1 ${!isMobile && isCollapsed ? "hidden" : "block"}`}
            >
              Social
            </SidebarGroupLabel>
            {!isCollapsed && socialHeaderActions}
          </div>
          <SidebarGroupContent>
            <SidebarMenu>
              {socialItems.map((item) => (
                <SidebarMenuItem key={item.id}>
                  <SidebarMenuButton
                    onClick={() => {
                      if (item.path) {
                        navigate(item.path);
                      } else {
                        onViewChange(item.id);
                      }
                      if (isMobile) {
                        setOpenMobile(false);
                      }
                    }}
                    isActive={item.path ? location.pathname === item.path : activeView === item.id}
                    className={`w-full min-h-[40px] transition-all duration-200 ${!isMobile && isCollapsed ? "justify-center" : "justify-start gap-3 px-3"} ${
                      (item.path ? location.pathname === item.path : activeView === item.id)
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

        <SidebarSeparator className="my-2" />

        {/* Creator Hub Section */}
        <SidebarGroup className="pb-0">
          <SidebarGroupLabel
            className={`text-muted-foreground px-0 text-xs py-1 ${!isMobile && isCollapsed ? "hidden" : "block"}`}
          >
            Creator Hub
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {creatorItems.map((item) => (
                <SidebarMenuItem key={item.id}>
                  <SidebarMenuButton
                    onClick={() => {
                      if (item.path) {
                        navigate(item.path);
                      } else {
                        onViewChange(item.id);
                      }
                      if (isMobile) {
                        setOpenMobile(false);
                      }
                    }}
                    isActive={item.path ? location.pathname === item.path : activeView === item.id}
                    className={`w-full min-h-[40px] transition-all duration-200 ${!isMobile && isCollapsed ? "justify-center" : "justify-start gap-3 px-3"} ${
                      (item.path ? location.pathname === item.path : activeView === item.id)
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

        <SidebarSeparator className="my-2" />

        {/* More Section */}
        <SidebarGroup className="pb-0">
          <SidebarGroupLabel
            className={`text-muted-foreground px-0 text-xs py-1 ${!isMobile && isCollapsed ? "hidden" : "block"}`}
          >
            More
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {moreItems.map((item) => (
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
                    className={`w-full min-h-[40px] transition-all duration-200 ${!isMobile && isCollapsed ? "justify-center" : "justify-start gap-3 px-3"} ${
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
            if (user?.id) {
              navigate(`/profile/${user.id}`);
            }
            setOpenMobile(false);
          }}
          className={`flex items-center transition-colors rounded-lg ml-3 mr-3 min-h-[44px] ${!isMobile && isCollapsed ? "py-3 justify-center" : "pl-4 pr-4 py-3 gap-3 justify-start"} hover:bg-violet-500/5 hover:text-violet-300 text-white`}
        >
          <Avatar className="w-10 h-10 ring-2 ring-violet-500/30 shrink-0">
            <AvatarImage src={profile?.avatar_url || undefined} />
            <AvatarFallback className="bg-violet-500/20 text-violet-300">
              {profile?.display_name
                ? profile.display_name
                    .split(" ")
                    .map((n) => n[0])
                    .join("")
                    .toUpperCase()
                    .slice(0, 2)
                : user?.email?.[0].toUpperCase() || "U"}
            </AvatarFallback>
          </Avatar>
          {(isMobile || !isCollapsed) && (
            <div className="flex-1 min-w-0 text-left">
              <p className="font-medium text-sm text-white">
                {profile?.display_name || user?.email?.split("@")[0] || "User"}
              </p>
            </div>
          )}
        </button>

        <div className={!isMobile && isCollapsed ? "px-2 pb-2" : "px-3 pb-2"}>
          <SidebarMenuButton
            onClick={() => {
              navigate("/settings");
              setOpenMobile(false);
            }}
            isActive={activeView === "settings"}
            className={`w-full min-h-[44px] ${!isMobile && isCollapsed ? "justify-center" : "justify-start gap-3 pl-5"} text-gray-400 hover:bg-violet-500/5 hover:text-violet-300 h-auto py-2`}
          >
            <Settings className="w-5 h-5 shrink-0" />
            {(isMobile || !isCollapsed) && <span className="font-medium">Settings</span>}
          </SidebarMenuButton>
        </div>

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
