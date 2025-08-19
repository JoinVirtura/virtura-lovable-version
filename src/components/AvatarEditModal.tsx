import { useState } from "react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Save, Download, Share2, Palette, User, Camera, Sparkles } from "lucide-react"

interface AvatarEditModalProps {
  avatar: {
    id: number
    name: string
    description: string
    image: string
    style: string
  }
  isOpen: boolean
  onClose: () => void
}

export function AvatarEditModal({ avatar, isOpen, onClose }: AvatarEditModalProps) {
  const [editedName, setEditedName] = useState(avatar.name)
  const [lighting, setLighting] = useState([50])
  const [contrast, setContrast] = useState([50])
  const [saturation, setSaturation] = useState([50])
  const [mood, setMood] = useState("neutral")

  const handleSave = () => {
    console.log("Saving avatar changes:", { name: editedName, lighting, contrast, saturation, mood })
    onClose()
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto bg-card border-border">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <Palette className="h-5 w-5 text-primary" />
            Edit Avatar - {avatar.name}
          </DialogTitle>
          <DialogDescription>
            Customize and enhance your avatar with advanced editing tools
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Preview Section */}
          <div className="space-y-4">
            <Card className="bg-gradient-to-br from-card to-card/50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <Camera className="h-4 w-4" />
                  Preview
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="aspect-[3/4] relative overflow-hidden rounded-lg bg-muted/20">
                  <img
                    src={avatar.image}
                    alt={avatar.name}
                    className="w-full h-full object-cover transition-all duration-300"
                    style={{
                      filter: `brightness(${lighting[0]}%) contrast(${contrast[0]}%) saturate(${saturation[0]}%)`
                    }}
                  />
                  <div className="absolute top-3 right-3">
                    <Badge className="bg-primary/90 text-primary-foreground">
                      {avatar.style}
                    </Badge>
                  </div>
                </div>
                
                <div className="mt-4 space-y-2">
                  <Label htmlFor="avatar-name">Avatar Name</Label>
                  <Input
                    id="avatar-name"
                    value={editedName}
                    onChange={(e) => setEditedName(e.target.value)}
                    className="bg-background/50"
                  />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Edit Controls */}
          <div className="space-y-4">
            <Tabs defaultValue="appearance" className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="appearance">Appearance</TabsTrigger>
                <TabsTrigger value="mood">Mood</TabsTrigger>
                <TabsTrigger value="effects">Effects</TabsTrigger>
              </TabsList>

              <TabsContent value="appearance" className="space-y-4">
                <Card className="bg-gradient-to-br from-card to-card/50">
                  <CardHeader>
                    <CardTitle className="text-base">Visual Adjustments</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="space-y-2">
                      <Label>Lighting: {lighting[0]}%</Label>
                      <Slider
                        value={lighting}
                        onValueChange={setLighting}
                        min={20}
                        max={150}
                        step={1}
                        className="w-full"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label>Contrast: {contrast[0]}%</Label>
                      <Slider
                        value={contrast}
                        onValueChange={setContrast}
                        min={20}
                        max={150}
                        step={1}
                        className="w-full"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label>Saturation: {saturation[0]}%</Label>
                      <Slider
                        value={saturation}
                        onValueChange={setSaturation}
                        min={0}
                        max={150}
                        step={1}
                        className="w-full"
                      />
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="mood" className="space-y-4">
                <Card className="bg-gradient-to-br from-card to-card/50">
                  <CardHeader>
                    <CardTitle className="text-base">Expression & Mood</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <Label>Mood Setting</Label>
                      <Select value={mood} onValueChange={setMood}>
                        <SelectTrigger className="bg-background/50">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="happy">Happy & Cheerful</SelectItem>
                          <SelectItem value="confident">Confident & Bold</SelectItem>
                          <SelectItem value="neutral">Neutral & Professional</SelectItem>
                          <SelectItem value="mysterious">Mysterious & Alluring</SelectItem>
                          <SelectItem value="serious">Serious & Focused</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="effects" className="space-y-4">
                <Card className="bg-gradient-to-br from-card to-card/50">
                  <CardHeader>
                    <CardTitle className="text-base">Special Effects</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <Button variant="outline" className="w-full justify-start">
                      <Sparkles className="mr-2 h-4 w-4" />
                      Add Glow Effect
                    </Button>
                    <Button variant="outline" className="w-full justify-start">
                      <User className="mr-2 h-4 w-4" />
                      Enhance Features
                    </Button>
                    <Button variant="outline" className="w-full justify-start">
                      <Camera className="mr-2 h-4 w-4" />
                      Background Blur
                    </Button>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </div>

        <Separator />

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3 pt-4">
          <Button onClick={handleSave} className="flex-1 bg-primary hover:bg-primary/90">
            <Save className="mr-2 h-4 w-4" />
            Save Changes
          </Button>
          <Button variant="outline" className="flex-1">
            <Download className="mr-2 h-4 w-4" />
            Download
          </Button>
          <Button variant="outline" className="flex-1">
            <Share2 className="mr-2 h-4 w-4" />
            Share
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}