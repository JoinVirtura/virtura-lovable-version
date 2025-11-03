import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon, Loader2 } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import type { Campaign } from "@/hooks/useCampaigns";

interface CampaignCreatorProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  brandId: string;
  onCampaignCreated: (campaign: Campaign) => void;
  onSubmit: (data: Partial<Campaign>) => Promise<Campaign>;
}

const platforms = [
  { id: "instagram", label: "Instagram" },
  { id: "facebook", label: "Facebook" },
  { id: "twitter", label: "Twitter/X" },
  { id: "linkedin", label: "LinkedIn" },
  { id: "tiktok", label: "TikTok" },
  { id: "youtube", label: "YouTube" },
  { id: "pinterest", label: "Pinterest" },
];

const campaignTypes = [
  { value: "product_launch", label: "Product Launch" },
  { value: "brand_awareness", label: "Brand Awareness" },
  { value: "seasonal", label: "Seasonal Campaign" },
  { value: "event", label: "Event Promotion" },
  { value: "sales", label: "Sales & Promotions" },
  { value: "custom", label: "Custom Campaign" },
];

export function CampaignCreator({
  open,
  onOpenChange,
  brandId,
  onCampaignCreated,
  onSubmit,
}: CampaignCreatorProps) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    campaign_type: "custom",
    start_date: new Date(),
    end_date: undefined as Date | undefined,
    budget: "",
    target_platforms: [] as string[],
    kpis: {
      reach: "",
      engagement: "",
      conversions: "",
    },
  });

  const handlePlatformToggle = (platformId: string) => {
    setFormData((prev) => ({
      ...prev,
      target_platforms: prev.target_platforms.includes(platformId)
        ? prev.target_platforms.filter((p) => p !== platformId)
        : [...prev.target_platforms, platformId],
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      return;
    }

    try {
      setLoading(true);

      const campaignData: Partial<Campaign> = {
        brand_id: brandId,
        name: formData.name,
        description: formData.description || null,
        campaign_type: formData.campaign_type,
        status: "planning",
        start_date: formData.start_date.toISOString(),
        end_date: formData.end_date?.toISOString() || null,
        budget: formData.budget ? parseFloat(formData.budget) : null,
        target_platforms: formData.target_platforms,
        kpis: formData.kpis,
      };

      const campaign = await onSubmit(campaignData);
      onCampaignCreated(campaign);
      onOpenChange(false);

      // Reset form
      setFormData({
        name: "",
        description: "",
        campaign_type: "custom",
        start_date: new Date(),
        end_date: undefined,
        budget: "",
        target_platforms: [],
        kpis: { reach: "", engagement: "", conversions: "" },
      });
    } catch (err) {
      console.error("Error creating campaign:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create New Campaign</DialogTitle>
          <DialogDescription>
            Set up a new marketing campaign with goals, platforms, and timeline
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Info */}
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Campaign Name *</Label>
              <Input
                id="name"
                placeholder="e.g., Summer Sale 2024"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                placeholder="Brief description of the campaign..."
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="type">Campaign Type</Label>
              <Select
                value={formData.campaign_type}
                onValueChange={(value) =>
                  setFormData({ ...formData, campaign_type: value })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {campaignTypes.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Timeline */}
          <div className="space-y-4">
            <h4 className="text-sm font-medium">Timeline</h4>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Start Date</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !formData.start_date && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {formData.start_date ? (
                        format(formData.start_date, "PPP")
                      ) : (
                        <span>Pick a date</span>
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={formData.start_date}
                      onSelect={(date) =>
                        date && setFormData({ ...formData, start_date: date })
                      }
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>

              <div className="space-y-2">
                <Label>End Date (Optional)</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !formData.end_date && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {formData.end_date ? (
                        format(formData.end_date, "PPP")
                      ) : (
                        <span>Pick a date</span>
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={formData.end_date}
                      onSelect={(date) =>
                        setFormData({ ...formData, end_date: date })
                      }
                      initialFocus
                      disabled={(date) => date < formData.start_date}
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="budget">Budget (Optional)</Label>
              <Input
                id="budget"
                type="number"
                placeholder="0.00"
                value={formData.budget}
                onChange={(e) => setFormData({ ...formData, budget: e.target.value })}
              />
            </div>
          </div>

          {/* Target Platforms */}
          <div className="space-y-3">
            <Label>Target Platforms</Label>
            <div className="grid grid-cols-2 gap-3">
              {platforms.map((platform) => (
                <div key={platform.id} className="flex items-center space-x-2">
                  <Checkbox
                    id={platform.id}
                    checked={formData.target_platforms.includes(platform.id)}
                    onCheckedChange={() => handlePlatformToggle(platform.id)}
                  />
                  <label
                    htmlFor={platform.id}
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                  >
                    {platform.label}
                  </label>
                </div>
              ))}
            </div>
          </div>

          {/* KPIs */}
          <div className="space-y-3">
            <Label>Key Performance Indicators (Optional)</Label>
            <div className="grid grid-cols-3 gap-3">
              <Input
                placeholder="Reach target"
                value={formData.kpis.reach}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    kpis: { ...formData.kpis, reach: e.target.value },
                  })
                }
              />
              <Input
                placeholder="Engagement %"
                value={formData.kpis.engagement}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    kpis: { ...formData.kpis, engagement: e.target.value },
                  })
                }
              />
              <Input
                placeholder="Conversions"
                value={formData.kpis.conversions}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    kpis: { ...formData.kpis, conversions: e.target.value },
                  })
                }
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Create Campaign
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
