
import Navigation from "@/components/Navigation";
import { Hero } from "@/components/Hero";
import { AvatarCard } from "@/components/AvatarCard";

// Import model images
import modelJenna from "@/assets/model-jenna.jpg"
import modelHaley from "@/assets/model-haley.jpg"
import modelLena from "@/assets/model-lena.jpg"
import modelRaven from "@/assets/model-raven.jpg"
import modelSofia from "@/assets/model-sofia.jpg"
import modelMaya from "@/assets/model-maya.jpg"
import modelLuna from "@/assets/model-luna.jpg"
import modelAria from "@/assets/model-aria.jpg"
import modelNova from "@/assets/model-nova.jpg"
import modelZara from "@/assets/model-zara.jpg"
import modelIris from "@/assets/model-iris.jpg"
import modelSage from "@/assets/model-sage.jpg"

const models = [
  {
    id: 1,
    name: "Jenna",
    description: "Hey guys Jenna here, I love gaming, anime and having deep conversations 💕",
    image: modelJenna
  },
  {
    id: 2,
    name: "Haley", 
    description: "Small-town gym rat with big energy 💪 Ready for fun adventures and good vibes",
    image: modelHaley
  },
  {
    id: 3,
    name: "Lena",
    description: "Bavarian soul 🏔️ Sweet, relaxed, and always up for meaningful connections",
    image: modelLena
  },
  {
    id: 4,
    name: "Raven",
    description: "Goth soul 🖤 Artist 🎨 | Dark humor and creative conversations are my thing",
    image: modelRaven
  },
  {
    id: 5,
    name: "Sofia",
    description: "Professional photographer 📸 Love capturing beauty in everyday moments",
    image: modelSofia
  },
  {
    id: 6,
    name: "Maya",
    description: "Yoga instructor and wellness coach 🧘‍♀️ Finding balance in everything",
    image: modelMaya
  },
  {
    id: 7,
    name: "Luna",
    description: "Night owl and stargazer ⭐ Philosophy and deep thoughts under moonlight",
    image: modelLuna
  },
  {
    id: 8,
    name: "Aria",
    description: "Music producer and DJ 🎵 Creating beats that move souls and hearts",
    image: modelAria
  },
  {
    id: 9,
    name: "Nova",
    description: "Tech entrepreneur and innovator 💡 Building the future one idea at a time",
    image: modelNova
  },
  {
    id: 10,
    name: "Zara",
    description: "Fashion designer and trendsetter ✨ Creating styles that inspire confidence",
    image: modelZara
  },
  {
    id: 11,
    name: "Iris",
    description: "Travel blogger and adventurer 🌎 Discovering hidden gems around the world",
    image: modelIris
  },
  {
    id: 12,
    name: "Sage",
    description: "Mindfulness coach and writer 📚 Helping others find peace in chaos",
    image: modelSage
  }
]

export default function Index() {
  const handleChat = (name: string) => {
    console.log(`Starting chat with ${name}`)
  }

  const handleCreate = (name: string) => {
    console.log(`Creating content with ${name}`)
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      {/* Hero Section */}
      <Hero />

      {/* Avatar Grid Section */}
      <section className="container mx-auto px-6 py-16">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 animate-fade-in">
          {models.map((model, index) => (
            <div 
              key={model.id}
              className="animate-flirty flirty-hover"
              style={{animationDelay: `${index * 0.2}s`}}
            >
              <AvatarCard
                name={model.name}
                description={model.description}
                image={model.image}
                onChat={() => handleChat(model.name)}
                onCreate={() => handleCreate(model.name)}
              />
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}
