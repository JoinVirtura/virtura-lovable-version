import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { useCreatePost } from '@/hooks/useCreatePost';
import { useSchedulePost } from '@/hooks/useSchedulePost';
import { Upload, X, Loader2, Calendar as CalendarIcon, Sparkles, Image, Video, Type } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';

interface CreatePostModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultScheduled?: boolean;
}

type ContentType = 'image' | 'video' | 'text';

export function CreatePostModal({ isOpen, onClose, defaultScheduled = false }: CreatePostModalProps) {
  const [caption, setCaption] = useState('');
  const [isPaid, setIsPaid] = useState(false);
  const [price, setPrice] = useState('');
  const [files, setFiles] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const [isScheduled, setIsScheduled] = useState(defaultScheduled);
  const [scheduledDate, setScheduledDate] = useState<Date | undefined>();
  const [scheduledTime, setScheduledTime] = useState('12:00');
  const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>(['feed']);
  const [isAIGenerated, setIsAIGenerated] = useState(false);
  const [selectedContentType, setSelectedContentType] = useState<ContentType>('image');
  const { createPost, uploading } = useCreatePost();
  const { schedulePost, scheduling } = useSchedulePost();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(e.target.files || []);
    setFiles(selectedFiles);

    // Generate previews
    const newPreviews = selectedFiles.map(file => URL.createObjectURL(file));
    setPreviews(newPreviews);

    // Auto-detect content type
    if (selectedFiles[0]?.type.startsWith('video/')) {
      setSelectedContentType('video');
    } else if (selectedFiles.length > 0) {
      setSelectedContentType('image');
    }
  };

  const removeFile = (index: number) => {
    setFiles(files.filter((_, i) => i !== index));
    setPreviews(previews.filter((_, i) => i !== index));
  };

  const handleSubmit = async () => {
    const contentType = files[0]?.type.startsWith('video/') ? 'video' : 
                       files.length > 1 ? 'carousel' : 
                       files.length === 1 ? 'image' : 'text';

    // Add AI indicator to caption if marked as AI-generated
    const finalCaption = isAIGenerated && !caption.includes('#AI') 
      ? `${caption}\n\n#AI #AIGenerated`
      : caption;

    let success = false;

    if (isScheduled && scheduledDate) {
      const scheduledFor = new Date(
        scheduledDate.getFullYear(),
        scheduledDate.getMonth(),
        scheduledDate.getDate(),
        parseInt(scheduledTime.split(':')[0]),
        parseInt(scheduledTime.split(':')[1])
      );

      success = await schedulePost({
        contentType,
        caption: finalCaption,
        mediaFiles: files,
        isPaid,
        priceCents: isPaid ? Math.round(parseFloat(price) * 100) : 0,
        scheduledFor,
        platforms: selectedPlatforms,
      });
    } else {
      success = await createPost({
        contentType,
        caption: finalCaption,
        mediaFiles: files,
        isPaid,
        priceCents: isPaid ? Math.round(parseFloat(price) * 100) : 0,
      });
    }

    if (success) {
      // Reset form
      setCaption('');
      setIsPaid(false);
      setPrice('');
      setFiles([]);
      setPreviews([]);
      setIsScheduled(false);
      setScheduledDate(undefined);
      setScheduledTime('12:00');
      setSelectedPlatforms(['feed']);
      setIsAIGenerated(false);
      onClose();
    }
  };

  const isValid = caption.trim() && (!isPaid || (price && parseFloat(price) > 0)) && (!isScheduled || scheduledDate);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-lg sm:max-w-xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            Create Post
            <Badge variant="secondary" className="text-xs">Free to post</Badge>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Content Type Selector */}
          <div className="flex gap-2">
            <Button
              type="button"
              size="sm"
              variant={selectedContentType === 'image' ? 'default' : 'outline'}
              onClick={() => setSelectedContentType('image')}
              className="flex-1"
            >
              <Image className="h-4 w-4 mr-2" />
              Photo
            </Button>
            <Button
              type="button"
              size="sm"
              variant={selectedContentType === 'video' ? 'default' : 'outline'}
              onClick={() => setSelectedContentType('video')}
              className="flex-1"
            >
              <Video className="h-4 w-4 mr-2" />
              Video
            </Button>
            <Button
              type="button"
              size="sm"
              variant={selectedContentType === 'text' ? 'default' : 'outline'}
              onClick={() => setSelectedContentType('text')}
              className="flex-1"
            >
              <Type className="h-4 w-4 mr-2" />
              Text
            </Button>
          </div>

          {/* File Upload */}
          {selectedContentType !== 'text' && (
            <div>
              <div className="mt-2">
                <label
                  htmlFor="media-upload"
                  className="flex items-center justify-center w-full h-32 border-2 border-dashed border-border rounded-xl cursor-pointer hover:border-primary hover:bg-primary/5 transition-all"
                >
                  <div className="text-center">
                    <Upload className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                    <p className="text-sm text-muted-foreground">
                      {selectedContentType === 'video' ? 'Click to upload video' : 'Click to upload images'}
                    </p>
                  </div>
                  <input
                    id="media-upload"
                    type="file"
                    accept={selectedContentType === 'video' ? 'video/*' : 'image/*'}
                    multiple={selectedContentType === 'image'}
                    onChange={handleFileChange}
                    className="hidden"
                  />
                </label>
              </div>

              {/* Preview */}
              {previews.length > 0 && (
                <div className="grid grid-cols-3 gap-2 mt-4">
                  {previews.map((preview, index) => (
                    <div key={index} className="relative aspect-square">
                      {files[index]?.type.startsWith('video/') ? (
                        <video
                          src={preview}
                          className="w-full h-full object-cover rounded-lg"
                        />
                      ) : (
                        <img
                          src={preview}
                          alt={`Preview ${index + 1}`}
                          className="w-full h-full object-cover rounded-lg"
                        />
                      )}
                      <Button
                        size="icon"
                        variant="destructive"
                        className="absolute top-1 right-1 h-6 w-6"
                        onClick={() => removeFile(index)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Caption */}
          <div>
            <Textarea
              id="caption"
              placeholder="What's on your mind? Share your creation..."
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              rows={4}
              className="resize-none"
            />
            <p className="text-xs text-muted-foreground mt-1">
              {caption.length}/2000 characters
            </p>
          </div>

          {/* AI Generated Toggle */}
          <div className="flex items-center justify-between p-3 rounded-lg bg-gradient-to-r from-violet-500/10 to-purple-500/10 border border-violet-500/20">
            <div className="flex items-center gap-3">
              <Sparkles className="h-5 w-5 text-violet-400" />
              <div>
                <Label className="font-medium">AI-Generated Content</Label>
                <p className="text-xs text-muted-foreground">
                  Mark if this was created with AI tools
                </p>
              </div>
            </div>
            <Switch checked={isAIGenerated} onCheckedChange={setIsAIGenerated} />
          </div>

          {/* Paid Post */}
          <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
            <div>
              <Label className="font-medium">Paid Post</Label>
              <p className="text-xs text-muted-foreground">
                Users pay to unlock this content
              </p>
            </div>
            <Switch checked={isPaid} onCheckedChange={setIsPaid} />
          </div>

          {isPaid && (
            <div>
              <Label htmlFor="price">Price (USD)</Label>
              <Input
                id="price"
                type="number"
                step="0.01"
                min="0.50"
                placeholder="4.99"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                className="mt-2"
              />
              <p className="text-xs text-muted-foreground mt-1">
                You receive 90% · Platform fee 10%
              </p>
            </div>
          )}

          {/* Scheduling */}
          <div className="border-t pt-4">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <CalendarIcon className="h-4 w-4 text-muted-foreground" />
                <Label>Schedule for later</Label>
              </div>
              <Switch checked={isScheduled} onCheckedChange={setIsScheduled} />
            </div>

            {isScheduled && (
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-xs">Date</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="outline" className="w-full justify-start mt-1 text-sm">
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {scheduledDate ? format(scheduledDate, 'MMM d, yyyy') : 'Pick date'}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={scheduledDate}
                        onSelect={setScheduledDate}
                        disabled={(date) => date < new Date()}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>

                <div>
                  <Label htmlFor="time" className="text-xs">Time</Label>
                  <Input
                    id="time"
                    type="time"
                    value={scheduledTime}
                    onChange={(e) => setScheduledTime(e.target.value)}
                    className="mt-1"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex gap-2 pt-2">
            <Button variant="outline" onClick={onClose} className="flex-1">
              Cancel
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={!isValid || uploading || scheduling}
              className="flex-1 bg-gradient-to-r from-violet-500 to-purple-500 hover:from-violet-600 hover:to-purple-600"
            >
              {uploading || scheduling ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  {isScheduled ? 'Scheduling...' : 'Posting...'}
                </>
              ) : (
                isScheduled ? 'Schedule Post' : 'Post Now'
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}