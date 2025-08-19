import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { MessageCircle, Heart } from "lucide-react"

interface AvatarCardProps {
  name: string
  description: string
  image: string
  onChat: () => void
  onCreate: () => void
}

export function AvatarCard({ name, description, image, onChat, onCreate }: AvatarCardProps) {
  return (
    <Card className="group relative overflow-hidden bg-card border-border hover:shadow-warm transition-all duration-500 hover:-translate-y-2 hover:scale-105 animate-flirty">
      <div className="aspect-[3/4] relative overflow-hidden">
        <img 
          src={image} 
          alt={name}
          className="w-full h-full object-cover transition-all duration-700 group-hover:scale-115 group-hover:brightness-110 flirty-hover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
        <div className="absolute top-4 right-4 w-3 h-3 bg-destructive rounded-full animate-pulse" />
        
        <div className="absolute bottom-0 left-0 right-0 p-4 text-white">
          <h3 className="font-bold text-lg mb-1">{name}</h3>
          <p className="text-sm text-gray-200 mb-3 line-clamp-2">{description}</p>
          
          <div className="flex gap-2">
            <Button 
              size="sm" 
              variant="destructive"
              className="bg-destructive hover:bg-destructive/90 text-destructive-foreground flex-1 animate-glow-pulse"
              onClick={onChat}
            >
              <MessageCircle className="w-4 h-4 mr-1" />
              Chat
            </Button>
            <Button 
              size="sm" 
              variant="outline"
              className="border-white/20 text-white hover:bg-white/10 flex-1"
              onClick={onCreate}
            >
              <Heart className="w-4 h-4 mr-1" />
              Create
            </Button>
          </div>
        </div>
      </div>
    </Card>
  )
}