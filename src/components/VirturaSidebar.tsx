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
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Home,
  Video,
  Film,
  Settings,
  LogOut,
  Command,
  Building2,
  Library,
  BookOpen,
  Image,
  LifeBuoy,
  Shield,
  Briefcase,
  DollarSign,
  Calendar,
  BadgeCheck,
  User,
} from "lucide-react";
// Notifications moved to UserProfile
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

  // All items now use onViewChange - no path/navigate
  // Items 0-6: Admin, Home, Photo Editor, Video Editor, Copilot, Library, Feed
  const mainItems = [
    ...(isAdmin ? [{ id: "admin-dashboard", label: "Admin", icon: Shield }] : []),
    { id: "overview", label: "Home", icon: Home },
    { id: "talking-avatar", label: "Photo Editor", icon: Image },
    { id: "video-pro", label: "Video Editor", icon: Video },
    { id: "video-gen", label: "Video Gen", icon: Film },
    { id: "studio", label: "Copilot", icon: Command },
    { id: "library", label: "Library", icon: Library },
    { id: "social-feed", label: "Feed", icon: Home },
  ];

  // Items 7-8: Brand Manager, Marketplace
  const businessItems = [
    { id: "brands", label: "Brand Manager", icon: Building2 },
    { id: "marketplace", label: "Marketplace", icon: Briefcase },
  ];

  // Items 9-11: Creator Dashboard, Posting Calendar, Verification
  const creatorItems = [
    { id: "creator-dashboard", label: "Creator Dashboard", icon: DollarSign },
    { id: "scheduled-posts", label: "Posting Calendar", icon: Calendar },
    { id: "verification", label: "Verification", icon: BadgeCheck },
  ];

  // Items 12-13: Tutorials, Support
  const supportItems = [
    { id: "guide", label: "Tutorials", icon: BookOpen },
    { id: "support", label: "Support", icon: LifeBuoy },
  ];

  // Items 14-16: User Profile, Settings, Logout (in footer)

  const handleLogout = async () => {
    try {
      await signOut();
      navigate("/auth");
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  const handleItemClick = (itemId: string) => {
    if (itemId === "studio" && onClearEditState) {
      onClearEditState();
    }
    onViewChange(itemId);
    if (isMobile) {
      setOpenMobile(false);
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
        <SidebarGroup>
          <SidebarGroupLabel className={`text-muted-foreground px-0 ${!isMobile && isCollapsed ? "hidden" : "block"}`}>
            Quick Actions
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {mainItems.map((item) => (
                <SidebarMenuItem key={item.id}>
                  <SidebarMenuButton
                    onClick={() => handleItemClick(item.id)}
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

        {/* Business Section */}
        <SidebarGroup className="pb-0">
          <SidebarGroupLabel className={`text-muted-foreground px-0 ${!isMobile && isCollapsed ? "hidden" : "block"}`}>
            Business
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {businessItems.map((item) => (
                <SidebarMenuItem key={item.id}>
                  <SidebarMenuButton
                    onClick={() => handleItemClick(item.id)}
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

        {/* Creator Section */}
        <SidebarGroup className="pb-0">
          <SidebarGroupLabel className={`text-muted-foreground px-0 ${!isMobile && isCollapsed ? "hidden" : "block"}`}>
            Creator
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {creatorItems.map((item) => (
                <SidebarMenuItem key={item.id}>
                  <SidebarMenuButton
                    onClick={() => handleItemClick(item.id)}
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

        {/* Support Section */}
        <SidebarGroup className="pb-0">
          <SidebarGroupLabel className={`text-muted-foreground px-0 ${!isMobile && isCollapsed ? "hidden" : "block"}`}>
            Support
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {supportItems.map((item) => (
                <SidebarMenuItem key={item.id}>
                  <SidebarMenuButton
                    onClick={() => handleItemClick(item.id)}
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
            onViewChange("profile");
            if (isMobile) {
              setOpenMobile(false);
            }
          }}
          className={`flex items-center transition-colors rounded-lg min-h-[44px] w-full ${!isMobile && isCollapsed ? "py-2 justify-center" : "px-3 py-3 gap-3 justify-start"} hover:bg-violet-500/5 hover:text-violet-300 text-white ${activeView === "profile" ? "bg-violet-500/20 border border-violet-400/30" : ""}`}
        >
          <Avatar className={`ring-2 ring-violet-500/30 shrink-0 ${!isMobile && isCollapsed ? "w-7 h-7" : "w-10 h-10"}`}>
            <AvatarImage src={profile?.avatar_url || undefined} />
            <AvatarFallback className="bg-violet-500/20 text-violet-300 text-xs">
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

        <div className={!isMobile && isCollapsed ? "px-1 pb-2" : "px-3 pb-2"}>
          <SidebarMenuButton
            onClick={() => handleItemClick("settings")}
            isActive={activeView === "settings"}
            className={`w-full min-h-[44px] ${!isMobile && isCollapsed ? "" : "gap-3 px-3"} ${
              activeView === "settings"
                ? "bg-violet-500/20 text-violet-300 border border-violet-400/30"
                : "text-gray-400 hover:bg-violet-500/5 hover:text-violet-300"
            } h-auto py-2`}
          >
            <Settings className="w-5 h-5 shrink-0" />
            {(isMobile || !isCollapsed) && <span className="font-medium">Settings</span>}
          </SidebarMenuButton>
          {/* Version label below Settings */}
          <div className="flex justify-center mt-1">
            <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20">
              v1.0.3
            </span>
          </div>
        </div>

        <div className={!isMobile && isCollapsed ? "px-1 pb-3" : "px-3 pb-3"}>
          <SidebarMenuButton
            onClick={handleLogout}
            className={`w-full min-h-[44px] ${!isMobile && isCollapsed ? "" : "gap-3 px-3"} text-destructive hover:bg-destructive/10 h-auto py-2`}
          >
            <LogOut className="w-5 h-5 shrink-0" />
            {(isMobile || !isCollapsed) && <span className="font-medium">Logout</span>}
          </SidebarMenuButton>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
