import { Heart, Search, MessageCircle, Image, User, Zap, Upload, Download } from "lucide-react"
import { NavLink, useLocation } from "react-router-dom"

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar"

const items = [
  { title: "Create", url: "/create", icon: Heart },
  { title: "Explore", url: "/", icon: Search },
  { title: "Chat", url: "/chat", icon: MessageCircle },
  { title: "Gallery", url: "/gallery", icon: Image },
  { title: "Upload", url: "/upload", icon: Upload },
  { title: "Export", url: "/export", icon: Download },
  { title: "Profile", url: "/profile", icon: User },
]

export function AppSidebar() {
  const { state } = useSidebar()
  const location = useLocation()
  const currentPath = location.pathname
  const collapsed = state === "collapsed"

  const isActive = (path: string) => {
    if (path === "/" && currentPath === "/") return true
    if (path !== "/" && currentPath.startsWith(path)) return true
    return false
  }

  const getNavCls = (path: string) =>
    isActive(path) 
      ? "bg-primary/20 text-primary font-medium border-r-2 border-primary" 
      : "hover:bg-accent/50 text-muted-foreground hover:text-foreground"

  return (
    <Sidebar
      className={`${collapsed ? "w-16" : "w-20"} border-r border-border bg-sidebar-background`}
      collapsible="icon"
    >
      <SidebarContent className="p-0">
        <div className="flex flex-col items-center pt-6 pb-4">
          <div className="w-8 h-8 bg-gradient-to-r from-primary to-primary/80 rounded-lg flex items-center justify-center mb-6">
            <Zap className="w-5 h-5 text-primary-foreground" />
          </div>
        </div>
        
        <SidebarGroup className="px-0">
          <SidebarGroupContent>
            <SidebarMenu className="space-y-2">
              {items.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild className="h-14 justify-center">
                    <NavLink 
                      to={item.url} 
                      className={`flex flex-col items-center gap-1 p-3 transition-all duration-200 ${getNavCls(item.url)}`}
                    >
                      <item.icon className="w-6 h-6" />
                      {!collapsed && (
                        <span className="text-xs font-medium">{item.title}</span>
                      )}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  )
}