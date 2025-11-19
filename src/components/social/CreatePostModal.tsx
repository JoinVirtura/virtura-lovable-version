import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { useCreatePost } from '@/hooks/useCreatePost';
import { useSchedulePost } from '@/hooks/useSchedulePost';
import { Upload, X, Loader2, Calendar as CalendarIcon } from 'lucide-react';
import { format } from 'date-fns';

interface CreatePostModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function CreatePostModal({ isOpen, onClose }: CreatePostModalProps) {
  const [caption, setCaption] = useState('');
  const [isPaid, setIsPaid] = useState(false);
  const [price, setPrice] = useState('');
  const [files, setFiles] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const [isScheduled, setIsScheduled] = useState(false);
  const [scheduledDate, setScheduledDate] = useState<Date | undefined>();
  const [scheduledTime, setScheduledTime] = useState('12:00');
  const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>(['feed']);
  const { createPost, uploading } = useCreatePost();
  const { schedulePost, scheduling } = useSchedulePost();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(e.target.files || []);
    setFiles(selectedFiles);

    // Generate previews
    const newPreviews = selectedFiles.map(file => URL.createObjectURL(file));
    setPreviews(newPreviews);
  };

  const removeFile = (index: number) => {
    setFiles(files.filter((_, i) => i !== index));
    setPreviews(previews.filter((_, i) => i !== index));
  };

  const handleSubmit = async () => {
    const contentType = files[0]?.type.startsWith('video/') ? 'video' : 
                       files.length > 1 ? 'carousel' : 
                       files.length === 1 ? 'image' : 'text';

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
        caption,
        mediaFiles: files,
        isPaid,
        priceCents: isPaid ? Math.round(parseFloat(price) * 100) : 0,
        scheduledFor,
        platforms: selectedPlatforms,
      });
    } else {
      success = await createPost({
        contentType,
        caption,
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
      onClose();
    }
  };

  const isValid = caption.trim() && (!isPaid || (price && parseFloat(price) > 0)) && (!isScheduled || scheduledDate);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Create Post</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* File Upload */}
          <div>
            <Label htmlFor="media-upload">Media (optional)</Label>
            <div className="mt-2">
              <label
                htmlFor="media-upload"
                className="flex items-center justify-center w-full h-32 border-2 border-dashed border-border rounded-lg cursor-pointer hover:border-primary transition"
              >
                <div className="text-center">
                  <Upload className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                  <p className="text-sm text-muted-foreground">
                    Click to upload images or videos
                  </p>
                </div>
                <input
                  id="media-upload"
                  type="file"
                  accept="image/*,video/*"
                  multiple
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

          {/* Caption */}
          <div>
            <Label htmlFor="caption">Caption</Label>
            <Textarea
              id="caption"
              placeholder="Write a caption..."
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              rows={4}
              className="mt-2"
            />
            <p className="text-xs text-muted-foreground mt-1">
              {caption.length}/2000 characters
            </p>
          </div>

          {/* Paid Post */}
          <div className="flex items-center justify-between">
            <div>
              <Label>Make this a paid post</Label>
              <p className="text-xs text-muted-foreground">
                Users will need to unlock to view
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
            </div>
          )}

          {/* Scheduling */}
          <div className="space-y-4 border-t pt-4">
            <div className="flex items-center justify-between">
              <Label>Schedule for later</Label>
              <Switch checked={isScheduled} onCheckedChange={setIsScheduled} />
            </div>

            {isScheduled && (
              <>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Date</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button variant="outline" className="w-full justify-start mt-2">
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {scheduledDate ? format(scheduledDate, 'PPP') : 'Pick a date'}
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
                    <Label htmlFor="time">Time</Label>
                    <Input
                      id="time"
                      type="time"
                      value={scheduledTime}
                      onChange={(e) => setScheduledTime(e.target.value)}
                      className="mt-2"
                    />
                  </div>
                </div>

                <div>
                  <Label>Platforms</Label>
                  <div className="flex gap-2 mt-2 flex-wrap">
                    {['feed', 'instagram', 'twitter', 'tiktok'].map((platform) => (
                      <Button
                        key={platform}
                        type="button"
                        size="sm"
                        variant={selectedPlatforms.includes(platform) ? 'default' : 'outline'}
                        onClick={() => {
                          setSelectedPlatforms((prev) =>
                            prev.includes(platform)
                              ? prev.filter((p) => p !== platform)
                              : [...prev, platform]
                          );
                        }}
                      >
                        {platform.charAt(0).toUpperCase() + platform.slice(1)}
                      </Button>
                    ))}
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    Note: Cross-platform posting coming soon (Phase 7)
                  </p>
                </div>
              </>
            )}
          </div>

          {/* Actions */}
          <div className="flex gap-2 pt-4">
            <Button variant="outline" onClick={onClose} className="flex-1">
              Cancel
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={!isValid || uploading || scheduling}
              className="flex-1"
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
