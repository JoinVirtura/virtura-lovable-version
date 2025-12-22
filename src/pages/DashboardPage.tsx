import { useState } from "react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Progress } from "@/components/ui/progress"
import { Separator } from "@/components/ui/separator"
import { useNavigate } from "react-router-dom"
import { 
  Search, 
  Plus, 
  Settings, 
  User, 
  Zap, 
  Crown, 
  Sparkles,
  Download,
  Share2,
  Heart,
  MoreHorizontal,
  Bell,
  Calendar,
  Activity,
  LogOut
} from "lucide-react"
import { CreateAvatar } from "@/components/CreateAvatar"
import { AvatarStudio } from "@/components/AvatarStudio"
import { AvatarCard } from "@/components/AvatarCard"
import { AvatarEditModal } from "@/components/AvatarEditModal"

// Import avatar images
import casualWomanImg from "@/assets/model-casual-woman.jpg"
import fitnessManImg from "@/assets/model-fitness-man.jpg"
import professionalManImg from "@/assets/model-professional-man.jpg"
import userAvatarImg from "@/assets/avatar-1.jpg"

export default function DashboardPage() {
  const [activeTab, setActiveTab] = useState("overview")
  const [selectedAvatar, setSelectedAvatar] = useState<any>(null)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const navigate = useNavigate()

  const handleLogout = () => {
    navigate('/')
  }

  const recentAvatars = [
    { 
      id: 1, 
      name: "Professional Headshot", 
      style: "Realistic", 
      status: "completed", 
      image: professionalManImg,
      description: "Confident business professional with navy suit and warm smile"
    },
    { 
      id: 2, 
      name: "Summer Campaign Ad", 
      style: "Realistic", 
      status: "completed", 
      image: casualWomanImg,
      description: "Beautiful model in casual white top with natural lighting"
    },
    { 
      id: 3, 
      name: "Casual Portrait", 
      style: "Realistic", 
      status: "completed", 
      image: fitnessManImg,
      description: "Athletic fitness model in gym setting with confident expression"
    },
  ]

  const handleAvatarEdit = (avatarId: number) => {
    const avatar = recentAvatars.find(a => a.id === avatarId)
    if (avatar) {
      setSelectedAvatar(avatar)
      setIsEditModalOpen(true)
    }
  }

  const handleAvatarShare = (avatarId: number) => {
    console.log("Share avatar:", avatarId)
    // Implement share functionality
  }

  const stats = [
    { label: "Total Avatars", value: "24", change: "+12%", icon: User },
    { label: "Credits Used", value: "156", change: "+23%", icon: Zap },
    { label: "Premium Features", value: "8", change: "+5%", icon: Crown },
    { label: "Generations Today", value: "12", change: "+18%", icon: Sparkles },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background/95 to-primary/5">
      <div className="flex h-screen">
        {/* Sidebar */}
        <div className="hidden w-64 border-r bg-card/50 backdrop-blur-sm lg:block">
          <div className="flex h-full flex-col">
            <div className="flex h-14 items-center border-b px-6">
              <div className="flex items-center gap-2 font-semibold">
                <svg className="h-6 w-6 text-primary" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12 2L13.09 8.26L17 4L15.74 9.74L22 12L15.74 14.26L17 20L13.09 15.74L12 22L10.91 15.74L7 20L8.26 14.26L2 12L8.26 9.74L7 4L10.91 8.26L12 2Z" fill="currentColor"/>
                  <circle cx="12" cy="12" r="3" fill="none" stroke="currentColor" strokeWidth="1.5"/>
                </svg>
                <span className="text-lg">Virtura</span>
              </div>
            </div>
            
            <div className="flex-1 overflow-auto p-4">
              <nav className="grid gap-2">
                <Button
                  variant={activeTab === "overview" ? "secondary" : "ghost"}
                  className="justify-start"
                  onClick={() => setActiveTab("overview")}
                >
                  <Activity className="mr-2 h-4 w-4" />
                  Overview
                </Button>
                <Button
                  variant={activeTab === "create" ? "secondary" : "ghost"}
                  className="justify-start"
                  onClick={() => setActiveTab("create")}
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Create Avatar
                </Button>
                <Button
                  variant={activeTab === "studio" ? "secondary" : "ghost"}
                  className="justify-start"
                  onClick={() => setActiveTab("studio")}
                >
                  <Settings className="mr-2 h-4 w-4" />
                  Avatar Studio
                </Button>
              </nav>
              
              <Separator className="my-4" />
              
              <div className="space-y-3">
                <h4 className="text-sm font-medium text-muted-foreground">Quick Actions</h4>
                <Button size="sm" className="w-full justify-start bg-primary/10 hover:bg-primary/20 text-primary border-primary/20">
                  <Zap className="mr-2 h-4 w-4" />
                  Generate Random
                </Button>
                <Button size="sm" variant="outline" className="w-full justify-start">
                  <Crown className="mr-2 h-4 w-4" />
                  Upgrade Plan
                </Button>
              </div>
            </div>
            
            <div className="border-t p-4">
              <div className="flex items-center gap-3 mb-3">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={userAvatarImg} />
                  <AvatarFallback>U</AvatarFallback>
                </Avatar>
                <div className="flex-1 text-sm">
                  <p className="font-medium">User</p>
                  <p className="text-muted-foreground">Pro Plan</p>
                </div>
              </div>
              <Button
                size="sm"
                variant="outline"
                className="w-full justify-start text-destructive hover:text-destructive"
                onClick={handleLogout}
              >
                <LogOut className="mr-2 h-4 w-4" />
                Logout
              </Button>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 overflow-auto">
          {/* Header */}
          <header className="flex h-14 items-center border-b bg-card/30 backdrop-blur-sm px-3 sm:px-6">
            <div className="flex-1">
              <div className="relative max-w-md">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Search avatars..."
                  className="pl-10 bg-background/50"
                />
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              <Button size="icon" variant="ghost">
                <Bell className="h-5 w-5" />
              </Button>
              <Button size="icon" variant="ghost">
                <Calendar className="h-5 w-5" />
              </Button>
              <Separator orientation="vertical" className="h-6" />
              <div className="flex items-center gap-2 text-sm">
                <Zap className="h-4 w-4 text-primary" />
                <span className="font-medium">150 credits</span>
              </div>
            </div>
          </header>

          {/* Content */}
          <main className="p-3 sm:p-6">
            {activeTab === "overview" && (
              <div className="space-y-6">
                {/* Stats */}
                <div className="grid gap-3 sm:gap-4 grid-cols-2 lg:grid-cols-4">
                  {stats.map((stat) => (
                    <Card key={stat.label} className="bg-gradient-to-br from-card to-card/50">
                      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1 sm:pb-2 p-3 sm:p-6 sm:pb-2">
                        <CardTitle className="text-xs sm:text-sm font-medium truncate pr-2">
                          {stat.label}
                        </CardTitle>
                        <stat.icon className="h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground flex-shrink-0" />
                      </CardHeader>
                      <CardContent className="p-3 pt-0 sm:p-6 sm:pt-0">
                        <div className="text-xl sm:text-2xl font-bold">{stat.value}</div>
                        <p className="text-[10px] sm:text-xs text-muted-foreground">
                          <span className="text-green-600">{stat.change}</span> from last month
                        </p>
                      </CardContent>
                    </Card>
                  ))}
                </div>

                {/* Recent Avatars */}
                <Card className="bg-gradient-to-br from-card to-card/50">
                  <CardHeader className="p-4 sm:p-6">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                      <div>
                        <CardTitle className="text-base sm:text-lg">Recent Avatars</CardTitle>
                        <CardDescription className="text-xs sm:text-sm">
                          Your latest AI-generated avatars
                        </CardDescription>
                      </div>
                      <Button size="sm" className="w-full sm:w-auto">
                        <Plus className="mr-2 h-4 w-4" />
                        <span className="sm:inline">Create New</span>
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent className="p-4 sm:p-6 pt-0 sm:pt-0">
                     <div className="grid gap-4 sm:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
                       {recentAvatars.filter(avatar => avatar.style === "Realistic").map((avatar) => (
                         <AvatarCard
                           key={avatar.id}
                           name={avatar.name}
                           description={avatar.description}
                           image={avatar.image}
                           onEdit={() => handleAvatarEdit(avatar.id)}
                           onShare={() => handleAvatarShare(avatar.id)}
                         />
                       ))}
                     </div>
                  </CardContent>
                </Card>

                {/* Usage Progress */}
                <div className="grid gap-3 sm:gap-4 grid-cols-1 sm:grid-cols-2">
                  <Card className="bg-gradient-to-br from-card to-card/50">
                    <CardHeader className="p-4 sm:p-6 pb-2 sm:pb-2">
                      <CardTitle className="text-sm sm:text-base">Monthly Usage</CardTitle>
                    </CardHeader>
                    <CardContent className="p-4 sm:p-6 pt-0 sm:pt-0">
                      <div className="space-y-2 sm:space-y-3">
                        <div className="flex justify-between text-xs sm:text-sm">
                          <span>Credits Used</span>
                          <span>156 / 300</span>
                        </div>
                        <Progress value={52} className="h-2" />
                        <p className="text-xs text-muted-foreground">
                          144 credits remaining this month
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card className="bg-gradient-to-br from-card to-card/50">
                    <CardHeader className="p-4 sm:p-6 pb-2 sm:pb-2">
                      <CardTitle className="text-sm sm:text-base">Generation Streak</CardTitle>
                    </CardHeader>
                    <CardContent className="p-4 sm:p-6 pt-0 sm:pt-0">
                      <div className="space-y-2 sm:space-y-3">
                        <div className="text-xl sm:text-2xl font-bold">7 days</div>
                        <p className="text-xs sm:text-sm text-muted-foreground">
                          Keep creating to maintain your streak!
                        </p>
                        <Button size="sm" className="w-full">
                          <Sparkles className="mr-2 h-4 w-4" />
                          Generate Today
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            )}

            {activeTab === "create" && (
              <div className="max-w-7xl mx-auto">
                <div className="mb-6">
                  <h1 className="text-3xl font-bold tracking-tight">Create Avatar</h1>
                  <p className="text-muted-foreground">
                    Design your perfect AI avatar with advanced customization
                  </p>
                </div>
                <CreateAvatar />
              </div>
            )}

            {activeTab === "studio" && (
              <div className="max-w-7xl mx-auto">
                <div className="mb-6">
                  <h1 className="text-3xl font-bold tracking-tight">Avatar Studio</h1>
                  <p className="text-muted-foreground">
                    Advanced avatar customization and generation tools
                  </p>
                </div>
                <AvatarStudio />
              </div>
            )}
          </main>
        </div>
      </div>

      {/* Edit Modal */}
      {selectedAvatar && (
        <AvatarEditModal
          isOpen={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
          avatar={selectedAvatar}
        />
      )}
    </div>
  )
}
