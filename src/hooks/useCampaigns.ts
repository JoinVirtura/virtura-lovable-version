import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface Campaign {
  id: string;
  brand_id: string;
  user_id: string;
  name: string;
  description: string | null;
  campaign_type: string;
  status: string;
  start_date: string;
  end_date: string | null;
  budget: number | null;
  target_platforms: string[];
  target_audience: any;
  kpis: any;
  performance_data: any;
  brief: string | null;
  created_at: string;
  updated_at: string;
}

export interface CampaignContent {
  id: string;
  campaign_id: string;
  asset_id: string;
  platform: string;
  caption: string | null;
  hashtags: string[];
  status: string;
  scheduled_time: string | null;
  published_at: string | null;
  engagement_metrics: any;
  platform_post_id: string | null;
  created_at: string;
  updated_at: string;
}

export const useCampaigns = () => {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [campaignContent, setCampaignContent] = useState<CampaignContent[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadCampaigns = async (brandId: string) => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('brand_campaigns')
        .select('*')
        .eq('brand_id', brandId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setCampaigns(data || []);
      return data || [];
    } catch (err: any) {
      console.error('Error loading campaigns:', err);
      setError(err.message);
      toast.error('Failed to load campaigns');
      return [];
    } finally {
      setLoading(false);
    }
  };

  const loadCampaignContent = async (campaignId: string) => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('campaign_content')
        .select('*')
        .eq('campaign_id', campaignId)
        .order('scheduled_time', { ascending: true });

      if (error) throw error;
      setCampaignContent(data || []);
      return data || [];
    } catch (err: any) {
      console.error('Error loading campaign content:', err);
      setError(err.message);
      toast.error('Failed to load campaign content');
      return [];
    } finally {
      setLoading(false);
    }
  };

  const createCampaign = async (campaignData: Partial<Campaign>) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      if (!campaignData.brand_id || !campaignData.name) {
        throw new Error('Brand ID and campaign name are required');
      }

      const { data, error } = await supabase
        .from('brand_campaigns')
        .insert([{
          brand_id: campaignData.brand_id,
          user_id: user.id,
          name: campaignData.name,
          description: campaignData.description,
          campaign_type: campaignData.campaign_type,
          status: campaignData.status,
          start_date: campaignData.start_date,
          end_date: campaignData.end_date,
          budget: campaignData.budget,
          target_platforms: campaignData.target_platforms,
          target_audience: campaignData.target_audience,
          kpis: campaignData.kpis,
          performance_data: campaignData.performance_data,
          brief: campaignData.brief,
        }])
        .select()
        .single();

      if (error) throw error;
      setCampaigns([data, ...campaigns]);
      toast.success('Campaign created successfully');
      return data;
    } catch (err: any) {
      console.error('Error creating campaign:', err);
      toast.error('Failed to create campaign');
      throw err;
    }
  };

  const updateCampaign = async (campaignId: string, updates: Partial<Campaign>) => {
    try {
      const { error } = await supabase
        .from('brand_campaigns')
        .update(updates)
        .eq('id', campaignId);

      if (error) throw error;

      setCampaigns(
        campaigns.map((c) => (c.id === campaignId ? { ...c, ...updates } : c))
      );
      toast.success('Campaign updated successfully');
    } catch (err: any) {
      console.error('Error updating campaign:', err);
      toast.error('Failed to update campaign');
      throw err;
    }
  };

  const deleteCampaign = async (campaignId: string) => {
    try {
      const { error } = await supabase
        .from('brand_campaigns')
        .delete()
        .eq('id', campaignId);

      if (error) throw error;

      setCampaigns(campaigns.filter((c) => c.id !== campaignId));
      toast.success('Campaign deleted successfully');
    } catch (err: any) {
      console.error('Error deleting campaign:', err);
      toast.error('Failed to delete campaign');
      throw err;
    }
  };

  const addContentToCampaign = async (contentData: Partial<CampaignContent>) => {
    try {
      if (!contentData.campaign_id || !contentData.asset_id || !contentData.platform) {
        throw new Error('Campaign ID, Asset ID, and Platform are required');
      }

      const { data, error } = await supabase
        .from('campaign_content')
        .insert([{
          campaign_id: contentData.campaign_id,
          asset_id: contentData.asset_id,
          platform: contentData.platform,
          caption: contentData.caption,
          hashtags: contentData.hashtags,
          status: contentData.status,
          scheduled_time: contentData.scheduled_time,
          published_at: contentData.published_at,
          engagement_metrics: contentData.engagement_metrics,
          platform_post_id: contentData.platform_post_id,
        }])
        .select()
        .single();

      if (error) throw error;
      setCampaignContent([...campaignContent, data]);
      toast.success('Content added to campaign');
      return data;
    } catch (err: any) {
      console.error('Error adding content:', err);
      toast.error('Failed to add content');
      throw err;
    }
  };

  const updateCampaignContent = async (
    contentId: string,
    updates: Partial<CampaignContent>
  ) => {
    try {
      const { error } = await supabase
        .from('campaign_content')
        .update(updates)
        .eq('id', contentId);

      if (error) throw error;

      setCampaignContent(
        campaignContent.map((c) => (c.id === contentId ? { ...c, ...updates } : c))
      );
      toast.success('Content updated successfully');
    } catch (err: any) {
      console.error('Error updating content:', err);
      toast.error('Failed to update content');
      throw err;
    }
  };

  const deleteCampaignContent = async (contentId: string) => {
    try {
      const { error } = await supabase
        .from('campaign_content')
        .delete()
        .eq('id', contentId);

      if (error) throw error;

      setCampaignContent(campaignContent.filter((c) => c.id !== contentId));
      toast.success('Content removed from campaign');
    } catch (err: any) {
      console.error('Error deleting content:', err);
      toast.error('Failed to remove content');
      throw err;
    }
  };

  return {
    campaigns,
    campaignContent,
    loading,
    error,
    loadCampaigns,
    loadCampaignContent,
    createCampaign,
    updateCampaign,
    deleteCampaign,
    addContentToCampaign,
    updateCampaignContent,
    deleteCampaignContent,
  };
};
