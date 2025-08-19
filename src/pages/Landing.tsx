import { Button } from "@/components/ui/button"
import { AvatarCard } from "@/components/AvatarCard"
import { Zap } from "lucide-react"

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
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="flex items-center justify-between p-4 border-b border-border">
        <div className="flex items-center gap-4">
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
      <main className="container mx-auto px-6 py-8">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-6">
            Explore the Best XXX AI Porn Maker Free
          </h1>
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
  )
}