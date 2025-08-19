import { Button } from "@/components/ui/button"
import { AvatarCard } from "@/components/AvatarCard"
import { Zap, Heart } from "lucide-react"
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/AppSidebar"

// Import avatar images
import avatar1 from "@/assets/avatar-1.jpg"
import avatar2 from "@/assets/avatar-2.jpg"
import avatar3 from "@/assets/avatar-3.jpg"
import avatar4 from "@/assets/avatar-4.jpg"

const avatars = [
  {
    id: 1,
    name: "Jenna",
    description: "Hey guys Jenna here, I love gaming, anime and having deep conversations 💕",
    image: avatar1
  },
  {
    id: 2,
    name: "Haley", 
    description: "Small-town gym rat with big energy 💪 Ready for fun adventures and good vibes",
    image: avatar2
  },
  {
    id: 3,
    name: "Lena",
    description: "Bavarian soul 🏔️ Sweet, relaxed, and always up for meaningful connections",
    image: avatar3
  },
  {
    id: 4,
    name: "Raven",
    description: "Goth soul 🖤 Artist 🎨 | Dark humor and creative conversations are my thing",
    image: avatar4
  },
  {
    id: 5,
    name: "Sofia",
    description: "Professional photographer 📸 Love capturing beauty in everyday moments",
    image: avatar1
  },
  {
    id: 6,
    name: "Maya",
    description: "Yoga instructor and wellness coach 🧘‍♀️ Finding balance in everything",
    image: avatar2
  },
  {
    id: 7,
    name: "Luna",
    description: "Night owl and stargazer ⭐ Philosophy and deep thoughts under moonlight",
    image: avatar3
  },
  {
    id: 8,
    name: "Aria",
    description: "Music producer and DJ 🎵 Creating beats that move souls and hearts",
    image: avatar4
  }
]

export default function Landing() {
  const handleChat = (name: string) => {
    console.log(`Starting chat with ${name}`)
  }

  const handleCreate = (name: string) => {
    console.log(`Creating content with ${name}`)
  }

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-background">
        <AppSidebar />
        
        <div className="flex-1 flex flex-col">
          {/* Header */}
          <header className="h-14 flex items-center justify-between px-6 border-b border-border">
            <div className="flex items-center gap-4">
              <SidebarTrigger />
              <div className="flex items-center gap-2 text-foreground">
                <span className="text-2xl font-bold">{`{B}`}</span>
                <span className="text-sm">2 Characters</span>
              </div>
            </div>
            
            <Button className="bg-primary hover:bg-primary/90 text-primary-foreground">
              <Zap className="w-4 h-4 mr-2" />
              Join Premium
            </Button>
          </header>

          {/* Main Content */}
          <main className="flex-1 p-6">
            {/* Hero Section */}
            <div className="mb-12">
              <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
                AI Porn Generator
              </h1>
              <p className="text-lg text-muted-foreground mb-8 max-w-2xl">
                Take control of your XXX sex fantasies and create uncensored free AI porn with best AI porn generator. 
                Ready to create your own interactive AI porn, hentai, furry, anime nudes and more on Sugarlab AI. Use our 
                free AI porn generator for AI porn pics, AI porn videos, and AI porn chat. Just type a prompt and get 
                sexy results.
              </p>
              <Button className="bg-primary hover:bg-primary/90 text-primary-foreground px-8 py-3 text-lg">
                <Heart className="w-5 h-5 mr-2" />
                Try For Free
              </Button>
            </div>

            {/* Avatar Grid */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {avatars.map((avatar) => (
                <AvatarCard
                  key={avatar.id}
                  name={avatar.name}
                  description={avatar.description}
                  image={avatar.image}
                  onChat={() => handleChat(avatar.name)}
                  onCreate={() => handleCreate(avatar.name)}
                />
              ))}
            </div>
          </main>
        </div>
      </div>
    </SidebarProvider>
  )
}