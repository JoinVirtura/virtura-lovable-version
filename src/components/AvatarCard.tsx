
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { MessageCircle, Heart } from "lucide-react"

interface AvatarCardProps {
  name: string
  description: string
  image: string
  onEdit: () => void
  onShare: () => void
}

export function AvatarCard({ name, description, image, onEdit, onShare }: AvatarCardProps) {
  return (
    <Card className="group relative overflow-hidden bg-card border-border hover:shadow-warm transition-all duration-500 hover:-translate-y-2 hover:scale-105 animate-flirty cursor-pointer">
      <div className="aspect-[3/4] relative overflow-hidden">
        <img 
          src={image} 
          alt={name}
          className="w-full h-full object-cover transition-all duration-700 group-hover:scale-115 group-hover:brightness-110 group-hover:contrast-105 flirty-hover"
        />
        
        {/* Enhanced gradient overlay with animation */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent group-hover:from-black/70 group-hover:via-black/10 transition-all duration-500" />
        
        {/* Animated status indicator */}
        <div className="absolute top-4 right-4 w-3 h-3 bg-destructive rounded-full animate-pulse group-hover:animate-ping" />
        
        {/* Interactive glow effect */}
        <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-gradient-to-t from-primary/20 via-transparent to-transparent" />
        
        {/* Floating elements that appear on hover */}
        <div className="absolute top-6 left-6 opacity-0 group-hover:opacity-100 transition-all duration-500 transform translate-y-2 group-hover:translate-y-0">
          <div className="w-2 h-2 bg-primary rounded-full animate-pulse" />
        </div>
        <div className="absolute top-12 left-8 opacity-0 group-hover:opacity-100 transition-all duration-700 transform translate-y-3 group-hover:translate-y-0">
          <div className="w-1 h-1 bg-secondary rounded-full animate-pulse" style={{animationDelay: '0.3s'}} />
        </div>
        <div className="absolute top-8 right-8 opacity-0 group-hover:opacity-100 transition-all duration-600 transform translate-x-2 group-hover:translate-x-0">
          <div className="w-1.5 h-1.5 bg-accent rounded-full animate-pulse" style={{animationDelay: '0.1s'}} />
        </div>
        
        <div className="absolute bottom-0 left-0 right-0 p-4 text-white transform translate-y-2 group-hover:translate-y-0 transition-transform duration-300">
          <h3 className="font-bold text-lg mb-1 group-hover:text-primary transition-colors duration-300">{name}</h3>
          <p className="text-sm text-gray-200 mb-3 line-clamp-2 group-hover:text-white transition-colors duration-300">{description}</p>
          
          <div className="flex gap-2 opacity-90 group-hover:opacity-100 transition-opacity duration-300">
            <Button 
              size="sm" 
              variant="destructive"
              className="bg-destructive hover:bg-destructive/90 text-destructive-foreground flex-1 animate-glow-pulse group-hover:scale-105 transition-transform duration-200"
              onClick={onEdit}
            >
              <MessageCircle className="w-4 h-4 mr-1" />
              Edit
            </Button>
            <Button 
              size="sm" 
              variant="outline"
              className="border-white/20 text-white hover:bg-white/10 flex-1 group-hover:border-primary/50 group-hover:bg-primary/10 group-hover:scale-105 transition-all duration-200"
              onClick={onShare}
            >
              <Heart className="w-4 h-4 mr-1 group-hover:text-primary transition-colors duration-200" />
              Share
            </Button>
          </div>
        </div>
      </div>
      
      {/* Additional hover effects - corner accents */}
      <div className="absolute top-0 left-0 w-0 h-0 border-l-4 border-t-4 border-primary opacity-0 group-hover:opacity-100 transition-all duration-300 group-hover:border-l-8 group-hover:border-t-8" />
      <div className="absolute bottom-0 right-0 w-0 h-0 border-r-4 border-b-4 border-primary opacity-0 group-hover:opacity-100 transition-all duration-300 group-hover:border-r-8 group-hover:border-b-8" />
    </Card>
  )
}
