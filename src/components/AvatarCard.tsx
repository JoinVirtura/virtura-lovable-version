
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
    <Card className="group relative overflow-hidden hover:shadow-[0_0_40px_rgba(212,110,255,0.3)] transition-all duration-500 hover:-translate-y-2 hover:scale-105 animate-flirty cursor-pointer">
      <div className="aspect-[3/4] relative overflow-hidden">
        <img 
          src={image} 
          alt={name}
          className="w-full h-full object-cover transition-all duration-700 group-hover:scale-115 group-hover:brightness-110 group-hover:contrast-105 flirty-hover"
        />
        
        {/* Enhanced gradient overlay with violet tones */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent group-hover:from-violet-900/50 group-hover:via-black/10 transition-all duration-500" />
        
        {/* Animated status indicator with violet glow */}
        <div className="absolute top-4 right-4 w-3 h-3 bg-violet-500 rounded-full animate-pulse group-hover:animate-ping shadow-[0_0_10px_rgba(212,110,255,0.8)]" />
        
        {/* Interactive violet glow effect */}
        <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-gradient-to-t from-violet-500/20 via-transparent to-transparent" />
        
        {/* Floating violet elements that appear on hover */}
        <div className="absolute top-6 left-6 opacity-0 group-hover:opacity-100 transition-all duration-500 transform translate-y-2 group-hover:translate-y-0">
          <div className="w-2 h-2 bg-violet-400 rounded-full animate-pulse shadow-[0_0_10px_rgba(212,110,255,0.8)]" />
        </div>
        <div className="absolute top-12 left-8 opacity-0 group-hover:opacity-100 transition-all duration-700 transform translate-y-3 group-hover:translate-y-0">
          <div className="w-1 h-1 bg-blue-400 rounded-full animate-pulse shadow-[0_0_8px_rgba(59,130,246,0.6)]" style={{animationDelay: '0.3s'}} />
        </div>
        <div className="absolute top-8 right-8 opacity-0 group-hover:opacity-100 transition-all duration-600 transform translate-x-2 group-hover:translate-x-0">
          <div className="w-1.5 h-1.5 bg-purple-400 rounded-full animate-pulse shadow-[0_0_8px_rgba(168,85,247,0.6)]" style={{animationDelay: '0.1s'}} />
        </div>
        
        <div className="absolute bottom-0 left-0 right-0 p-4 text-white transform translate-y-2 group-hover:translate-y-0 transition-transform duration-300">
          <h3 className="font-bold text-lg mb-1 group-hover:text-violet-300 transition-colors duration-300 drop-shadow-[0_0_8px_rgba(212,110,255,0.6)]">{name}</h3>
          <p className="text-sm text-gray-200 mb-3 line-clamp-2 group-hover:text-white transition-colors duration-300">{description}</p>
          
          <div className="flex gap-2 opacity-90 group-hover:opacity-100 transition-opacity duration-300">
            <Button 
              size="sm" 
              variant="destructive"
              className="flex-1 group-hover:scale-105 transition-transform duration-200"
              onClick={onEdit}
            >
              <MessageCircle className="w-4 h-4 mr-1" />
              Edit
            </Button>
            <Button 
              size="sm" 
              variant="outline"
              className="flex-1 group-hover:scale-105 transition-all duration-200"
              onClick={onShare}
            >
              <Heart className="w-4 h-4 mr-1 group-hover:text-violet-300 transition-colors duration-200" />
              Share
            </Button>
          </div>
        </div>
      </div>
      
      {/* Violet corner accents */}
      <div className="absolute top-0 left-0 w-0 h-0 border-l-4 border-t-4 border-violet-500 opacity-0 group-hover:opacity-100 transition-all duration-300 group-hover:border-l-8 group-hover:border-t-8 shadow-[0_0_10px_rgba(212,110,255,0.6)]" />
      <div className="absolute bottom-0 right-0 w-0 h-0 border-r-4 border-b-4 border-violet-500 opacity-0 group-hover:opacity-100 transition-all duration-300 group-hover:border-r-8 group-hover:border-b-8 shadow-[0_0_10px_rgba(212,110,255,0.6)]" />
    </Card>
  )
}
