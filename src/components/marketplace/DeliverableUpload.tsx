import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useMarketplacePayments } from '@/hooks/useMarketplacePayments';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Loader2, Upload, CheckCircle2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface DeliverableUploadProps {
  campaignId: string;
  onClose: () => void;
}

export function DeliverableUpload({ campaignId, onClose }: DeliverableUploadProps) {
  const [campaign, setCampaign] = useState<any>(null);
  const [assets, setAssets] = useState<any[]>([]);
  const [selectedAssets, setSelectedAssets] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);
  const { submitDeliverable } = useMarketplacePayments();
  const navigate = useNavigate();

  useEffect(() => {
    fetchData();
  }, [campaignId]);

  const fetchData = async () => {
    try {
      const { data: campaignData } = await supabase
        .from('marketplace_campaigns')
        .select('*')
        .eq('id', campaignId)
        .single();

      setCampaign(campaignData);

      // Fetch user's assets
      const { data: assetsData } = await supabase
        .from('brand_assets')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(20);

      setAssets(assetsData || []);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      const submissions = Object.entries(selectedAssets);
      
      for (const [deliverableType, assetId] of submissions) {
        await submitDeliverable({
          campaign_id: campaignId,
          asset_id: assetId,
          deliverable_type: deliverableType,
        });
      }

      onClose();
    } catch (error) {
      console.error('Error submitting deliverables:', error);
    } finally {
      setSubmitting(false);
    }
  };

  const getDeliverableTypes = () => {
    if (!campaign?.deliverables) return [];
    return Object.entries(campaign.deliverables).map(([key, value]) => ({
      type: key,
      count: value,
    }));
  };

  if (loading) {
    return (
      <Dialog open={true} onOpenChange={onClose}>
        <DialogContent>
          <div className="flex justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin" />
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  const deliverableTypes = getDeliverableTypes();
  const allSelected = deliverableTypes.every((d) => selectedAssets[d.type]);

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Upload Deliverables</DialogTitle>
          <DialogDescription>
            Select assets from your library to submit for this campaign
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Campaign Details */}
          <div className="p-4 bg-muted rounded-lg">
            <h3 className="font-semibold">{campaign?.title}</h3>
            <p className="text-sm text-muted-foreground mt-1">
              Required deliverables:
            </p>
              <div className="flex flex-wrap gap-2 mt-2">
              {deliverableTypes.map(({ type, count }: { type: string; count: any }) => (
                <span key={type} className="text-sm">
                  {count}x {type}
                  {selectedAssets[type] && (
                    <CheckCircle2 className="inline ml-1 h-4 w-4 text-green-500" />
                  )}
                </span>
              ))}
            </div>
          </div>

          {/* Deliverable Selection */}
          {deliverableTypes.map(({ type }) => (
            <div key={type} className="space-y-3">
              <h4 className="font-semibold capitalize">{type}</h4>
              
              {assets.length === 0 ? (
                <div className="p-6 border-2 border-dashed rounded-lg text-center">
                  <Upload className="mx-auto h-8 w-8 text-muted-foreground mb-2" />
                  <p className="text-sm text-muted-foreground">
                    No assets in library
                  </p>
                  <Button
                    variant="link"
                    onClick={() => navigate('/upload')}
                    className="mt-2"
                  >
                    Upload New Asset
                  </Button>
                </div>
              ) : (
                <div className="grid grid-cols-3 gap-3">
                  {assets.map((asset) => (
                    <div
                      key={asset.id}
                      className={`relative border-2 rounded-lg overflow-hidden cursor-pointer transition-all ${
                        selectedAssets[type] === asset.id
                          ? 'border-primary ring-2 ring-primary'
                          : 'border-border hover:border-primary/50'
                      }`}
                      onClick={() =>
                        setSelectedAssets((prev) => ({
                          ...prev,
                          [type]: prev[type] === asset.id ? '' : asset.id,
                        }))
                      }
                    >
                      {asset.thumbnail_url ? (
                        <img
                          src={asset.thumbnail_url}
                          alt={asset.title}
                          className="w-full h-32 object-cover"
                        />
                      ) : (
                        <div className="w-full h-32 bg-muted flex items-center justify-center">
                          <Upload className="h-8 w-8 text-muted-foreground" />
                        </div>
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                      <div className="absolute bottom-0 left-0 right-0 p-2">
                        <p className="text-white text-xs font-medium truncate">
                          {asset.title}
                        </p>
                      </div>
                      {selectedAssets[type] === asset.id && (
                        <div className="absolute top-2 right-2">
                          <CheckCircle2 className="h-5 w-5 text-primary bg-white rounded-full" />
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}

          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button onClick={handleSubmit} disabled={!allSelected || submitting}>
              {submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Submit All
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
