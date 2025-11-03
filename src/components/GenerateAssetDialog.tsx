import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Progress } from '@/components/ui/progress';
import { Sparkles, Wand2 } from 'lucide-react';
import { ImageGenerationService } from '@/services/imageGenerationService';
import { toast } from 'sonner';

interface GenerateAssetDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  brandId: string;
  collectionId?: string | null;
  collections: Array<{ id: string; name: string }>;
  onAssetGenerated: () => void;
  saveGeneratedAsset: (
    brandId: string,
    imageDataUrl: string,
    prompt: string,
    collectionId?: string | null,
    metadata?: any
  ) => Promise<any>;
}

export function GenerateAssetDialog({
  open,
  onOpenChange,
  brandId,
  collectionId,
  collections,
  onAssetGenerated,
  saveGeneratedAsset,
}: GenerateAssetDialogProps) {
  const [prompt, setPrompt] = useState('');
  const [style, setStyle] = useState('photorealistic');
  const [aspectRatio, setAspectRatio] = useState<'1:1' | '16:9' | '9:16' | '4:3' | '3:4'>('1:1');
  const [selectedCollection, setSelectedCollection] = useState<string | null>(collectionId || null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentStage, setCurrentStage] = useState('');

  const styles = [
    { value: 'photorealistic', label: 'Photorealistic' },
    { value: 'corporate', label: 'Corporate' },
    { value: 'creative', label: 'Creative' },
    { value: 'lifestyle', label: 'Lifestyle' },
    { value: 'minimalist', label: 'Minimalist' },
    { value: 'bold', label: 'Bold' },
  ];

  const handleGenerate = async () => {
    if (!prompt.trim()) {
      toast.error('Please enter a prompt');
      return;
    }

    setIsGenerating(true);
    setProgress(10);
    setCurrentStage('Initializing generation...');

    try {
      // Generate image
      setProgress(30);
      setCurrentStage('Generating image with AI...');
      
      const result = await ImageGenerationService.generateImage({
        prompt,
        style,
        aspectRatio,
        quality: 'ultra',
        contentType: 'auto',
      });

      if (!result.success || !result.image) {
        throw new Error(result.error || 'Failed to generate image');
      }

      // Save to brand assets
      setProgress(70);
      setCurrentStage('Saving to brand library...');

      await saveGeneratedAsset(
        brandId,
        result.image,
        prompt,
        selectedCollection,
        {
          style,
          aspectRatio,
          contentType: result.metadata?.contentType,
        }
      );

      setProgress(100);
      setCurrentStage('Complete!');
      
      toast.success('Asset generated and saved successfully!');
      onAssetGenerated();
      
      // Reset and close
      setTimeout(() => {
        setPrompt('');
        setProgress(0);
        setCurrentStage('');
        setIsGenerating(false);
        onOpenChange(false);
      }, 1000);

    } catch (error: any) {
      console.error('Generation error:', error);
      toast.error(error.message || 'Failed to generate asset');
      setIsGenerating(false);
      setProgress(0);
      setCurrentStage('');
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] bg-gray-900 border-violet-500/30">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <Sparkles className="w-5 h-5 text-violet-400" />
            Generate Brand Asset with AI
          </DialogTitle>
          <DialogDescription className="text-muted-foreground">
            Create custom images for your brand using AI generation
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Prompt Input */}
          <div className="space-y-2">
            <Label htmlFor="prompt" className="text-sm font-medium">
              Describe what you want to create
            </Label>
            <Textarea
              id="prompt"
              placeholder="A professional marketing image for social media with vibrant colors and modern design..."
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              rows={4}
              className="bg-black/60 border-violet-500/30 focus:border-violet-500/50 resize-none"
              disabled={isGenerating}
            />
          </div>

          {/* Style Selector */}
          <div className="space-y-2">
            <Label htmlFor="style" className="text-sm font-medium">
              Style
            </Label>
            <Select value={style} onValueChange={setStyle} disabled={isGenerating}>
              <SelectTrigger id="style" className="bg-black/60 border-violet-500/30">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-gray-900 border-violet-500/30">
                {styles.map((s) => (
                  <SelectItem key={s.value} value={s.value}>
                    {s.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Aspect Ratio */}
          <div className="space-y-2">
            <Label htmlFor="aspect" className="text-sm font-medium">
              Aspect Ratio
            </Label>
            <Select
              value={aspectRatio}
              onValueChange={(value: any) => setAspectRatio(value)}
              disabled={isGenerating}
            >
              <SelectTrigger id="aspect" className="bg-black/60 border-violet-500/30">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-gray-900 border-violet-500/30">
                <SelectItem value="1:1">Square (1:1)</SelectItem>
                <SelectItem value="16:9">Landscape (16:9)</SelectItem>
                <SelectItem value="9:16">Portrait (9:16)</SelectItem>
                <SelectItem value="4:3">Standard (4:3)</SelectItem>
                <SelectItem value="3:4">Tall (3:4)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Collection Selector */}
          <div className="space-y-2">
            <Label htmlFor="collection" className="text-sm font-medium">
              Save to Folder
            </Label>
            <Select
              value={selectedCollection || 'none'}
              onValueChange={(value) => setSelectedCollection(value === 'none' ? null : value)}
              disabled={isGenerating}
            >
              <SelectTrigger id="collection" className="bg-black/60 border-violet-500/30">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-gray-900 border-violet-500/30">
                <SelectItem value="none">All Assets</SelectItem>
                {collections.map((col) => (
                  <SelectItem key={col.id} value={col.id}>
                    {col.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Progress */}
          {isGenerating && (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">{currentStage}</span>
                <span className="text-violet-400">{progress}%</span>
              </div>
              <Progress value={progress} className="h-2" />
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex gap-3 justify-end pt-4 border-t border-violet-500/20">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isGenerating}
            className="border-violet-500/30"
          >
            Cancel
          </Button>
          <Button
            onClick={handleGenerate}
            disabled={isGenerating || !prompt.trim()}
            className="bg-violet-600 hover:bg-violet-700"
          >
            {isGenerating ? (
              <>
                <Wand2 className="w-4 h-4 mr-2 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 mr-2" />
                Generate Asset
              </>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
