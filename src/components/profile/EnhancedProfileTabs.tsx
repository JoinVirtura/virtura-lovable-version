import { motion } from "framer-motion";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Grid3X3, 
  BookmarkIcon, 
  User, 
  BarChart3, 
  Briefcase, 
  FolderOpen 
} from "lucide-react";
import { cn } from "@/lib/utils";

interface TabConfig {
  value: string;
  label: string;
  icon: React.ReactNode;
  color: string;
  glowColor: string;
  showForOwner?: boolean;
}

interface EnhancedProfileTabsProps {
  activeTab: string;
  onTabChange: (value: string) => void;
  isOwnProfile: boolean;
  savedCount?: number;
}

const tabConfigs: TabConfig[] = [
  { 
    value: "grid", 
    label: "Posts", 
    icon: <Grid3X3 className="w-4 h-4" />,
    color: "violet",
    glowColor: "shadow-violet-500/40"
  },
  { 
    value: "portfolio", 
    label: "Portfolio", 
    icon: <FolderOpen className="w-4 h-4" />,
    color: "blue",
    glowColor: "shadow-blue-500/40"
  },
  { 
    value: "analytics", 
    label: "Analytics", 
    icon: <BarChart3 className="w-4 h-4" />,
    color: "emerald",
    glowColor: "shadow-emerald-500/40",
    showForOwner: true
  },
  { 
    value: "saved", 
    label: "Saved", 
    icon: <BookmarkIcon className="w-4 h-4" />,
    color: "pink",
    glowColor: "shadow-pink-500/40",
    showForOwner: true
  },
  { 
    value: "collaborations", 
    label: "Collabs", 
    icon: <Briefcase className="w-4 h-4" />,
    color: "amber",
    glowColor: "shadow-amber-500/40"
  },
  { 
    value: "about", 
    label: "About", 
    icon: <User className="w-4 h-4" />,
    color: "cyan",
    glowColor: "shadow-cyan-500/40"
  },
];

export function EnhancedProfileTabs({ 
  activeTab, 
  onTabChange, 
  isOwnProfile,
  savedCount = 0
}: EnhancedProfileTabsProps) {
  const visibleTabs = tabConfigs.filter(
    tab => !tab.showForOwner || isOwnProfile
  );

  return (
    <div className="relative mb-6">
      {/* Background glow */}
      <div className="absolute inset-0 bg-gradient-to-r from-violet-500/5 via-pink-500/5 to-cyan-500/5 rounded-2xl blur-xl" />
      
      <Tabs value={activeTab} onValueChange={onTabChange} className="w-full">
        <TabsList className="relative w-full h-auto p-2 bg-black/40 backdrop-blur-2xl border border-white/10 rounded-2xl flex justify-center gap-1 flex-wrap">
          {visibleTabs.map((tab) => {
            const isActive = activeTab === tab.value;
            
            return (
              <TabsTrigger
                key={tab.value}
                value={tab.value}
                className={cn(
                  "relative px-4 py-2.5 rounded-xl transition-all duration-300",
                  "text-muted-foreground hover:text-white",
                  "data-[state=active]:text-white",
                  "data-[state=active]:bg-transparent",
                  "border border-transparent",
                  "group"
                )}
              >
                {/* Active background with gradient */}
                {isActive && (
                  <motion.div
                    layoutId="active-tab-bg"
                    className={cn(
                      "absolute inset-0 rounded-xl",
                      "bg-gradient-to-r",
                      tab.color === "violet" && "from-violet-500/30 to-purple-500/20",
                      tab.color === "blue" && "from-blue-500/30 to-cyan-500/20",
                      tab.color === "emerald" && "from-emerald-500/30 to-teal-500/20",
                      tab.color === "pink" && "from-pink-500/30 to-rose-500/20",
                      tab.color === "amber" && "from-amber-500/30 to-orange-500/20",
                      tab.color === "cyan" && "from-cyan-500/30 to-blue-500/20",
                      "border",
                      tab.color === "violet" && "border-violet-500/40",
                      tab.color === "blue" && "border-blue-500/40",
                      tab.color === "emerald" && "border-emerald-500/40",
                      tab.color === "pink" && "border-pink-500/40",
                      tab.color === "amber" && "border-amber-500/40",
                      tab.color === "cyan" && "border-cyan-500/40",
                      tab.glowColor,
                      "shadow-lg"
                    )}
                    transition={{ type: "spring", stiffness: 400, damping: 30 }}
                  />
                )}

                {/* Hover glow effect */}
                <div className={cn(
                  "absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300",
                  !isActive && "bg-white/5"
                )} />

                {/* Content */}
                <div className="relative flex items-center gap-2 z-10">
                  <span className={cn(
                    "transition-colors duration-300",
                    isActive && tab.color === "violet" && "text-violet-300",
                    isActive && tab.color === "blue" && "text-blue-300",
                    isActive && tab.color === "emerald" && "text-emerald-300",
                    isActive && tab.color === "pink" && "text-pink-300",
                    isActive && tab.color === "amber" && "text-amber-300",
                    isActive && tab.color === "cyan" && "text-cyan-300",
                  )}>
                    {tab.icon}
                  </span>
                  <span className="hidden sm:inline font-medium">{tab.label}</span>
                  
                  {/* Badge for saved count */}
                  {tab.value === "saved" && savedCount > 0 && (
                    <span className="ml-1 px-1.5 py-0.5 text-[10px] font-bold rounded-full bg-pink-500/30 text-pink-300 border border-pink-500/40">
                      {savedCount > 99 ? "99+" : savedCount}
                    </span>
                  )}
                </div>
              </TabsTrigger>
            );
          })}
        </TabsList>
      </Tabs>
    </div>
  );
}
