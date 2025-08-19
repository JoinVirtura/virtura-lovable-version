import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Slider } from "@/components/ui/slider"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { 
  Palette, 
  Sparkles, 
  Eye, 
  Smile, 
  Sun, 
  Moon, 
  Zap,
  Download,
  Share2,
  Undo,
  Save
} from "lucide-react"

interface AvatarEditModalProps {
  isOpen: boolean
  onClose: () => void
  avatar: {
    id: number
    name: string
    image: string
    description: string
  }
}

export function AvatarEditModal({ isOpen, onClose, avatar }: AvatarEditModalProps) {
  const [brightness, setBrightness] = useState([100])
  const [contrast, setContrast] = useState([100])
  const [saturation, setSaturation] = useState([100])
  const [mood, setMood] = useState("neutral")
  const [style, setStyle] = useState("realistic")

  const moods = [
    { id: "happy", label: "Happy", icon: Smile, color: "bg-yellow-500" },
    { id: "mysterious", label: "Mysterious", icon: Moon, color: "bg-purple-500" },
    { id: "confident", label: "Confident", icon: Sun, color: "bg-orange-500" },
    { id: "dreamy", label: "Dreamy", icon: Sparkles, color: "bg-pink-500" },
  ]

  const styles = [
    { id: "realistic", label: "Realistic" },
    { id: "artistic", label: "Artistic" },
    { id: "fantasy", label: "Fantasy" },
    { id: "vintage", label: "Vintage" },
  ]

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-7xl h-[90vh] overflow-hidden">
        <DialogHeader className="pb-6">
          <DialogTitle className="text-3xl font-bold gradient-text">Edit {avatar.name}</DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-1 xl:grid-cols-5 gap-8 h-full overflow-hidden">
          {/* Preview Section - Larger */}
          <div className="xl:col-span-3 space-y-6">
            <Card className="h-full">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center gap-3 text-xl">
                  <Eye className="w-6 h-6" />
                  Preview
                  <Badge variant="secondary" className="ml-auto">High Quality</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="h-full pb-6">
                <div className="relative w-full h-[600px] overflow-hidden rounded-xl bg-gradient-to-br from-primary/5 to-secondary/5 border border-border/50">
                  <img 
                    src={avatar.image} 
                    alt={avatar.name}
                    className="w-full h-full object-cover transition-all duration-500 hover:scale-105"
                    style={{
                      filter: `brightness(${brightness[0]}%) contrast(${contrast[0]}%) saturate(${saturation[0]}%)`,
                      imageRendering: 'crisp-edges'
                    }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/10 to-transparent" />
                  <div className="absolute bottom-4 left-4 right-4">
                    <div className="bg-black/70 backdrop-blur-sm rounded-lg p-3">
                      <p className="text-white text-sm font-medium">
                        Photorealistic Quality • {brightness[0]}% Brightness • {contrast[0]}% Contrast • {saturation[0]}% Saturation
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Controls Section - Better organized */}
          <div className="xl:col-span-2 space-y-6 overflow-y-auto">
            <Tabs defaultValue="appearance" className="w-full">
              <TabsList className="grid w-full grid-cols-3 mb-6">
                <TabsTrigger value="appearance" className="text-sm">Appearance</TabsTrigger>
                <TabsTrigger value="mood" className="text-sm">Mood</TabsTrigger>
                <TabsTrigger value="effects" className="text-sm">Effects</TabsTrigger>
              </TabsList>

              <TabsContent value="appearance" className="space-y-6">
                <Card>
                  <CardHeader className="pb-4">
                    <CardTitle className="flex items-center gap-2 text-lg">
                      <Palette className="w-5 h-5" />
                      Appearance Settings
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-8">
                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <label className="text-sm font-semibold">Brightness</label>
                        <span className="text-sm font-mono bg-muted px-2 py-1 rounded">{brightness[0]}%</span>
                      </div>
                      <Slider
                        value={brightness}
                        onValueChange={setBrightness}
                        max={150}
                        min={70}
                        step={1}
                        className="w-full"
                      />
                    </div>

                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <label className="text-sm font-semibold">Contrast</label>
                        <span className="text-sm font-mono bg-muted px-2 py-1 rounded">{contrast[0]}%</span>
                      </div>
                      <Slider
                        value={contrast}
                        onValueChange={setContrast}
                        max={150}
                        min={70}
                        step={1}
                        className="w-full"
                      />
                    </div>

                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <label className="text-sm font-semibold">Saturation</label>
                        <span className="text-sm font-mono bg-muted px-2 py-1 rounded">{saturation[0]}%</span>
                      </div>
                      <Slider
                        value={saturation}
                        onValueChange={setSaturation}
                        max={130}
                        min={80}
                        step={1}
                        className="w-full"
                      />
                    </div>

                    <div className="space-y-4">
                      <label className="text-sm font-semibold">Style Preset</label>
                      <div className="grid grid-cols-2 gap-3">
                        {styles.map((styleOption) => (
                          <Button
                            key={styleOption.id}
                            variant={style === styleOption.id ? "default" : "outline"}
                            size="lg"
                            onClick={() => setStyle(styleOption.id)}
                            className="h-12 text-sm font-medium"
                          >
                            {styleOption.label}
                          </Button>
                        ))}
                      </div>
                      <p className="text-xs text-muted-foreground text-center">
                        Realistic maintains photorealistic quality
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="mood" className="space-y-6">
                <Card>
                  <CardHeader className="pb-4">
                    <CardTitle className="text-lg">Mood & Expression</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 gap-4">
                      {moods.map((moodOption) => {
                        const Icon = moodOption.icon
                        return (
                          <Button
                            key={moodOption.id}
                            variant={mood === moodOption.id ? "default" : "outline"}
                            className="h-20 flex-col gap-3 text-sm"
                            onClick={() => setMood(moodOption.id)}
                          >
                            <div className={`w-8 h-8 rounded-full ${moodOption.color} flex items-center justify-center shadow-lg`}>
                              <Icon className="w-5 h-5 text-white" />
                            </div>
                            <span className="font-medium">{moodOption.label}</span>
                          </Button>
                        )
                      })}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="effects" className="space-y-6">
                <Card>
                  <CardHeader className="pb-4">
                    <CardTitle className="flex items-center gap-2 text-lg">
                      <Zap className="w-5 h-5" />
                      Enhancement Effects
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <Button variant="outline" className="w-full justify-start h-12 text-sm">
                      <Sparkles className="w-5 h-5 mr-3" />
                      Professional Glow Effect
                    </Button>
                    <Button variant="outline" className="w-full justify-start h-12 text-sm">
                      <Sun className="w-5 h-5 mr-3" />
                      Studio Lighting Enhancement
                    </Button>
                    <Button variant="outline" className="w-full justify-start h-12 text-sm">
                      <Eye className="w-5 h-5 mr-3" />
                      Ultra HD Detail Sharpening
                    </Button>
                    <div className="mt-6 p-4 bg-muted/50 rounded-lg border">
                      <p className="text-xs text-muted-foreground text-center">
                        All effects preserve photorealistic quality and maintain high resolution output
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>

            {/* Action Buttons - Better spacing */}
            <div className="grid grid-cols-2 gap-3 pt-6 border-t">
              <Button variant="outline" className="h-12">
                <Undo className="w-4 h-4 mr-2" />
                Reset
              </Button>
              <Button variant="outline" className="h-12">
                <Download className="w-4 h-4 mr-2" />
                Export HD
              </Button>
              <Button variant="outline" className="h-12">
                <Share2 className="w-4 h-4 mr-2" />
                Share
              </Button>
              <Button className="h-12 bg-gradient-to-r from-primary to-primary/80">
                <Save className="w-4 h-4 mr-2" />
                Save Changes
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}