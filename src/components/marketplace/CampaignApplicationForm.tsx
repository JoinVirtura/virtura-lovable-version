import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useMarketplaceApplications } from '@/hooks/useMarketplaceApplications';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Loader2 } from 'lucide-react';

const formSchema = z.object({
  pitch: z.string().min(50, 'Pitch must be at least 50 characters').max(1000),
  proposed_rate_cents: z.number().min(1, 'Rate must be positive'),
  portfolio_link1: z.string().url().optional().or(z.literal('')),
  portfolio_link2: z.string().url().optional().or(z.literal('')),
  portfolio_link3: z.string().url().optional().or(z.literal('')),
});

interface CampaignApplicationFormProps {
  campaignId: string;
  onClose: () => void;
}

export function CampaignApplicationForm({ campaignId, onClose }: CampaignApplicationFormProps) {
  const [campaign, setCampaign] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const { applyToCampaign } = useMarketplaceApplications();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      pitch: '',
      proposed_rate_cents: 0,
      portfolio_link1: '',
      portfolio_link2: '',
      portfolio_link3: '',
    },
  });

  useEffect(() => {
    const fetchCampaign = async () => {
      const { data, error } = await supabase
        .from('marketplace_campaigns')
        .select(`
          *,
          brands!inner(name, logo_url)
        `)
        .eq('id', campaignId)
        .single();

      if (data) {
        setCampaign(data);
        form.setValue('proposed_rate_cents', data.budget_cents);
      }
      setLoading(false);
    };

    fetchCampaign();
  }, [campaignId]);

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      const portfolio_links = [
        values.portfolio_link1,
        values.portfolio_link2,
        values.portfolio_link3,
      ].filter((link) => link && link.length > 0);

      await applyToCampaign({
        campaign_id: campaignId,
        pitch: values.pitch,
        proposed_rate_cents: values.proposed_rate_cents,
        portfolio_links,
      });

      onClose();
    } catch (error) {
      console.error('Error submitting application:', error);
    }
  };

  const formatBudget = (cents: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
    }).format(cents / 100);
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Apply to Campaign</DialogTitle>
          <DialogDescription>
            Submit your application and portfolio to be considered for this campaign
          </DialogDescription>
        </DialogHeader>

        {loading ? (
          <div className="flex justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin" />
          </div>
        ) : campaign ? (
          <div className="space-y-6">
            {/* Campaign Details */}
            <div className="p-4 bg-muted rounded-lg space-y-2">
              <h3 className="font-semibold text-lg">{campaign.title}</h3>
              <p className="text-sm text-muted-foreground">{campaign.brands?.name}</p>
              <div className="flex items-center gap-4 text-sm">
                <div>
                  <span className="font-medium">Budget: </span>
                  {formatBudget(campaign.budget_cents)}
                </div>
                {campaign.deadline && (
                  <div>
                    <span className="font-medium">Deadline: </span>
                    {new Date(campaign.deadline).toLocaleDateString()}
                  </div>
                )}
              </div>
              {campaign.deliverables && (
                <div className="flex flex-wrap gap-1 mt-2">
                  {Object.entries(campaign.deliverables).map(([key, value]: [string, any]) => (
                    <Badge key={key} variant="outline">
                      {value}x {key}
                    </Badge>
                  ))}
                </div>
              )}
            </div>

            {/* Application Form */}
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="pitch"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Your Pitch</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Explain why you're perfect for this campaign..."
                          className="min-h-32"
                          {...field}
                        />
                      </FormControl>
                      <FormDescription>
                        {field.value.length}/1000 characters
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="proposed_rate_cents"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Proposed Rate</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          min={campaign.budget_cents * 0.5}
                          max={campaign.budget_cents}
                          {...field}
                          onChange={(e) => field.onChange(parseInt(e.target.value))}
                        />
                      </FormControl>
                      <FormDescription>
                        Min: {formatBudget(campaign.budget_cents * 0.5)} | Max:{' '}
                        {formatBudget(campaign.budget_cents)}
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="space-y-2">
                  <FormLabel>Portfolio Links (Optional)</FormLabel>
                  <FormField
                    control={form.control}
                    name="portfolio_link1"
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <Input placeholder="https://..." {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="portfolio_link2"
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <Input placeholder="https://..." {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="portfolio_link3"
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <Input placeholder="https://..." {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="flex justify-end gap-2">
                  <Button type="button" variant="outline" onClick={onClose}>
                    Cancel
                  </Button>
                  <Button type="submit" disabled={form.formState.isSubmitting}>
                    {form.formState.isSubmitting && (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    )}
                    Submit Application
                  </Button>
                </div>
              </form>
            </Form>
          </div>
        ) : (
          <p className="text-center text-muted-foreground">Campaign not found</p>
        )}
      </DialogContent>
    </Dialog>
  );
}
