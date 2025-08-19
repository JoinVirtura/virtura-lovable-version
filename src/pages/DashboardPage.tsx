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

export default function DashboardPage() {
  const [activeTab, setActiveTab] = useState("overview")
  const navigate = useNavigate()

  const handleLogout = () => {
    navigate('/')
  }

  const recentAvatars = [
    { id: 1, name: "Aria", style: "Realistic", status: "completed", image: "/src/assets/model-aria.jpg" },
    { id: 2, name: "Luna", style: "Anime", status: "processing", image: "/src/assets/model-luna.jpg" },
    { id: 3, name: "Maya", style: "Realistic", status: "completed", image: "/src/assets/model-maya.jpg" },
    { id: 4, name: "Nova", style: "Fantasy", status: "completed", image: "/src/assets/model-nova.jpg" },
  ]

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
                <Sparkles className="h-6 w-6 text-primary" />
                <span className="text-lg">AI Studio</span>
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
                  <AvatarImage src="/src/assets/avatar-1.jpg" />
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
          <header className="flex h-14 items-center border-b bg-card/30 backdrop-blur-sm px-6">
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
          <main className="p-6">
            {activeTab === "overview" && (
              <div className="space-y-6">
                {/* Stats */}
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                  {stats.map((stat) => (
                    <Card key={stat.label} className="bg-gradient-to-br from-card to-card/50">
                      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">
                          {stat.label}
                        </CardTitle>
                        <stat.icon className="h-4 w-4 text-muted-foreground" />
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold">{stat.value}</div>
                        <p className="text-xs text-muted-foreground">
                          <span className="text-green-600">{stat.change}</span> from last month
                        </p>
                      </CardContent>
                    </Card>
                  ))}
                </div>

                {/* Recent Avatars */}
                <Card className="bg-gradient-to-br from-card to-card/50">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle>Recent Avatars</CardTitle>
                        <CardDescription>
                          Your latest AI-generated avatars
                        </CardDescription>
                      </div>
                      <Button size="sm">
                        <Plus className="mr-2 h-4 w-4" />
                        Create New
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                      {recentAvatars.map((avatar) => (
                        <div key={avatar.id} className="group relative overflow-hidden rounded-lg border bg-card transition-all hover:shadow-lg">
                          <div className="aspect-[3/4] overflow-hidden">
                            <img
                              src={avatar.image}
                              alt={avatar.name}
                              className="h-full w-full object-cover transition-transform group-hover:scale-105"
                            />
                          </div>
                          <div className="p-3">
                            <div className="flex items-center justify-between mb-2">
                              <h4 className="font-semibold">{avatar.name}</h4>
                              <Badge variant={avatar.status === 'completed' ? 'default' : 'secondary'}>
                                {avatar.status}
                              </Badge>
                            </div>
                            <p className="text-sm text-muted-foreground mb-3">{avatar.style}</p>
                            <div className="flex gap-1">
                              <Button size="icon" variant="ghost" className="h-8 w-8">
                                <Heart className="h-3 w-3" />
                              </Button>
                              <Button size="icon" variant="ghost" className="h-8 w-8">
                                <Download className="h-3 w-3" />
                              </Button>
                              <Button size="icon" variant="ghost" className="h-8 w-8">
                                <Share2 className="h-3 w-3" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Usage Progress */}
                <div className="grid gap-4 md:grid-cols-2">
                  <Card className="bg-gradient-to-br from-card to-card/50">
                    <CardHeader>
                      <CardTitle className="text-base">Monthly Usage</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <div className="flex justify-between text-sm">
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
                    <CardHeader>
                      <CardTitle className="text-base">Generation Streak</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <div className="text-2xl font-bold">7 days</div>
                        <p className="text-sm text-muted-foreground">
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
    </div>
  )
}
