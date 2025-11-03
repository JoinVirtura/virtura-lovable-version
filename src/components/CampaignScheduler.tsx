import { useState } from "react";
import { Calendar } from "@/components/ui/calendar";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Clock, Image as ImageIcon, Loader2 } from "lucide-react";
import { format } from "date-fns";
import type { CampaignContent } from "@/hooks/useCampaigns";
import type { BrandAsset } from "@/hooks/useBrandAssets";

interface CampaignSchedulerProps {
  campaignContent: CampaignContent[];
  assets: BrandAsset[];
  onScheduleContent: (data: Partial<CampaignContent>) => Promise<void>;
  onUpdateContent: (id: string, data: Partial<CampaignContent>) => Promise<void>;
}

export function CampaignScheduler({
  campaignContent,
  assets,
  onScheduleContent,
  onUpdateContent,
}: CampaignSchedulerProps) {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [showScheduleDialog, setShowScheduleDialog] = useState(false);
  const [loading, setLoading] = useState(false);
  const [scheduleForm, setScheduleForm] = useState({
    asset_id: "",
    platform: "",
    caption: "",
    hashtags: "",
    time: "09:00",
  });

  const getContentForDate = (date: Date) => {
    return campaignContent.filter((content) => {
      if (!content.scheduled_time) return false;
      const contentDate = new Date(content.scheduled_time);
      return (
        contentDate.toDateString() === date.toDateString() &&
        content.status !== "published"
      );
    });
  };

  const datesWithContent = campaignContent
    .filter((c) => c.scheduled_time && c.status !== "published")
    .map((c) => new Date(c.scheduled_time!));

  const handleSchedule = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedDate || !scheduleForm.asset_id || !scheduleForm.platform) return;

    try {
      setLoading(true);

      const scheduledDateTime = new Date(selectedDate);
      const [hours, minutes] = scheduleForm.time.split(":");
      scheduledDateTime.setHours(parseInt(hours), parseInt(minutes));

      await onScheduleContent({
        asset_id: scheduleForm.asset_id,
        platform: scheduleForm.platform,
        caption: scheduleForm.caption || null,
        hashtags: scheduleForm.hashtags
          ? scheduleForm.hashtags.split(",").map((tag) => tag.trim())
          : [],
        scheduled_time: scheduledDateTime.toISOString(),
        status: "scheduled",
      });

      setShowScheduleDialog(false);
      setScheduleForm({
        asset_id: "",
        platform: "",
        caption: "",
        hashtags: "",
        time: "09:00",
      });
    } catch (err) {
      console.error("Error scheduling content:", err);
    } finally {
      setLoading(false);
    }
  };

  const selectedDateContent = selectedDate ? getContentForDate(selectedDate) : [];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Calendar */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Content Calendar</h3>
        <Calendar
          mode="single"
          selected={selectedDate}
          onSelect={setSelectedDate}
          className="rounded-md border"
          modifiers={{
            scheduled: datesWithContent,
          }}
          modifiersStyles={{
            scheduled: {
              backgroundColor: "hsl(var(--primary))",
              color: "white",
              fontWeight: "bold",
            },
          }}
        />
        <Button
          onClick={() => setShowScheduleDialog(true)}
          className="w-full mt-4"
          disabled={!selectedDate}
        >
          <Clock className="w-4 h-4 mr-2" />
          Schedule Content
        </Button>
      </Card>

      {/* Scheduled Content for Selected Date */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">
          {selectedDate ? format(selectedDate, "MMMM d, yyyy") : "Select a date"}
        </h3>

        {selectedDateContent.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            <Clock className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p>No content scheduled for this date</p>
          </div>
        ) : (
          <div className="space-y-4">
            {selectedDateContent.map((content) => {
              const asset = assets.find((a) => a.id === content.asset_id);
              return (
                <Card key={content.id} className="p-4">
                  <div className="flex gap-3">
                    {asset && (
                      <div className="w-16 h-16 rounded overflow-hidden bg-muted flex-shrink-0">
                        <img
                          src={asset.thumbnail_url || asset.file_url}
                          alt={asset.title}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-2">
                        <Badge variant="secondary" className="capitalize">
                          {content.platform}
                        </Badge>
                        <Badge variant="outline">
                          {content.scheduled_time &&
                            format(new Date(content.scheduled_time), "h:mm a")}
                        </Badge>
                      </div>
                      {content.caption && (
                        <p className="text-sm text-muted-foreground line-clamp-2">
                          {content.caption}
                        </p>
                      )}
                      {content.hashtags && content.hashtags.length > 0 && (
                        <div className="flex gap-1 mt-1 flex-wrap">
                          {content.hashtags.slice(0, 3).map((tag, i) => (
                            <span
                              key={i}
                              className="text-xs text-primary"
                            >
                              #{tag}
                            </span>
                          ))}
                          {content.hashtags.length > 3 && (
                            <span className="text-xs text-muted-foreground">
                              +{content.hashtags.length - 3}
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        )}
      </Card>

      {/* Schedule Dialog */}
      <Dialog open={showScheduleDialog} onOpenChange={setShowScheduleDialog}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Schedule Content</DialogTitle>
            <DialogDescription>
              Schedule a post for{" "}
              {selectedDate && format(selectedDate, "MMMM d, yyyy")}
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSchedule} className="space-y-4">
            <div className="space-y-2">
              <Label>Select Asset</Label>
              <Select
                value={scheduleForm.asset_id}
                onValueChange={(value) =>
                  setScheduleForm({ ...scheduleForm, asset_id: value })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Choose an asset..." />
                </SelectTrigger>
                <SelectContent>
                  {assets.map((asset) => (
                    <SelectItem key={asset.id} value={asset.id}>
                      <div className="flex items-center gap-2">
                        <ImageIcon className="w-4 h-4" />
                        {asset.title}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Platform</Label>
              <Select
                value={scheduleForm.platform}
                onValueChange={(value) =>
                  setScheduleForm({ ...scheduleForm, platform: value })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Choose platform..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="instagram">Instagram</SelectItem>
                  <SelectItem value="facebook">Facebook</SelectItem>
                  <SelectItem value="twitter">Twitter/X</SelectItem>
                  <SelectItem value="linkedin">LinkedIn</SelectItem>
                  <SelectItem value="tiktok">TikTok</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Time</Label>
              <Input
                type="time"
                value={scheduleForm.time}
                onChange={(e) =>
                  setScheduleForm({ ...scheduleForm, time: e.target.value })
                }
              />
            </div>

            <div className="space-y-2">
              <Label>Caption (Optional)</Label>
              <Textarea
                placeholder="Write your post caption..."
                value={scheduleForm.caption}
                onChange={(e) =>
                  setScheduleForm({ ...scheduleForm, caption: e.target.value })
                }
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label>Hashtags (Optional)</Label>
              <Input
                placeholder="tag1, tag2, tag3"
                value={scheduleForm.hashtags}
                onChange={(e) =>
                  setScheduleForm({ ...scheduleForm, hashtags: e.target.value })
                }
              />
            </div>

            <div className="flex justify-end gap-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowScheduleDialog(false)}
                disabled={loading}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={loading}>
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Schedule Post
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
