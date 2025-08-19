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
      <DialogContent className="max-w-4xl h-[80vh] overflow-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">Edit {avatar.name}</DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Preview Section */}
          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Eye className="w-5 h-5" />
                  Preview
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="aspect-[3/4] relative overflow-hidden rounded-lg bg-gradient-to-br from-primary/10 to-secondary/10">
                  <img 
                    src={avatar.image} 
                    alt={avatar.name}
                    className="w-full h-full object-cover transition-all duration-300"
                    style={{
                      filter: `brightness(${brightness[0]}%) contrast(${contrast[0]}%) saturate(${saturation[0]}%)`
                    }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Controls Section */}
          <div className="space-y-4">
            <Tabs defaultValue="appearance" className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="appearance">Appearance</TabsTrigger>
                <TabsTrigger value="mood">Mood</TabsTrigger>
                <TabsTrigger value="effects">Effects</TabsTrigger>
              </TabsList>

              <TabsContent value="appearance" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Palette className="w-5 h-5" />
                      Appearance Settings
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Brightness</label>
                      <Slider
                        value={brightness}
                        onValueChange={setBrightness}
                        max={200}
                        min={50}
                        step={1}
                        className="w-full"
                      />
                      <span className="text-xs text-muted-foreground">{brightness[0]}%</span>
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium">Contrast</label>
                      <Slider
                        value={contrast}
                        onValueChange={setContrast}
                        max={200}
                        min={50}
                        step={1}
                        className="w-full"
                      />
                      <span className="text-xs text-muted-foreground">{contrast[0]}%</span>
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium">Saturation</label>
                      <Slider
                        value={saturation}
                        onValueChange={setSaturation}
                        max={200}
                        min={0}
                        step={1}
                        className="w-full"
                      />
                      <span className="text-xs text-muted-foreground">{saturation[0]}%</span>
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium">Style</label>
                      <div className="grid grid-cols-2 gap-2">
                        {styles.map((styleOption) => (
                          <Button
                            key={styleOption.id}
                            variant={style === styleOption.id ? "default" : "outline"}
                            size="sm"
                            onClick={() => setStyle(styleOption.id)}
                            className="justify-center"
                          >
                            {styleOption.label}
                          </Button>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="mood" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Mood & Expression</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 gap-3">
                      {moods.map((moodOption) => {
                        const Icon = moodOption.icon
                        return (
                          <Button
                            key={moodOption.id}
                            variant={mood === moodOption.id ? "default" : "outline"}
                            className="h-16 flex-col gap-2"
                            onClick={() => setMood(moodOption.id)}
                          >
                            <div className={`w-6 h-6 rounded-full ${moodOption.color} flex items-center justify-center`}>
                              <Icon className="w-4 h-4 text-white" />
                            </div>
                            <span className="text-xs">{moodOption.label}</span>
                          </Button>
                        )
                      })}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="effects" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Zap className="w-5 h-5" />
                      Special Effects
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <Button variant="outline" className="w-full justify-start">
                      <Sparkles className="w-4 h-4 mr-2" />
                      Add Glow Effect
                    </Button>
                    <Button variant="outline" className="w-full justify-start">
                      <Sun className="w-4 h-4 mr-2" />
                      Enhance Lighting
                    </Button>
                    <Button variant="outline" className="w-full justify-start">
                      <Eye className="w-4 h-4 mr-2" />
                      Sharpen Details
                    </Button>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>

            {/* Action Buttons */}
            <div className="flex gap-2 pt-4">
              <Button variant="outline" className="flex-1">
                <Undo className="w-4 h-4 mr-2" />
                Reset
              </Button>
              <Button variant="outline" className="flex-1">
                <Download className="w-4 h-4 mr-2" />
                Download
              </Button>
              <Button variant="outline" className="flex-1">
                <Share2 className="w-4 h-4 mr-2" />
                Share
              </Button>
              <Button className="flex-1">
                <Save className="w-4 h-4 mr-2" />
                Save
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}