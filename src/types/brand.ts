export interface Brand {
  id: string;
  user_id: string;
  organization_id?: string;
  name: string;
  description?: string;
  logo_url?: string;
  brand_colors: {
    primary: string;
    secondary: string;
    accent: string;
  };
  brand_fonts: {
    heading: string;
    body: string;
  };
  tone_of_voice?: string;
  target_audience?: string;
  industry?: string;
  social_handles: {
    instagram?: string;
    tiktok?: string;
    twitter?: string;
    linkedin?: string;
  };
  website_url?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface BrandCollection {
  id: string;
  brand_id: string;
  user_id: string;
  name: string;
  description?: string;
  collection_type: 'campaign' | 'product' | 'character' | 'seasonal' | 'custom';
  color_label?: string;
  is_smart_folder: boolean;
  smart_rules?: {
    tags?: string[];
    dateRange?: { start: string; end: string };
    types?: string[];
  };
  parent_collection_id?: string;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

export interface BrandAsset {
  id: string;
  brand_id: string;
  collection_id?: string;
  user_id: string;
  title: string;
  description?: string;
  asset_type: 'image' | 'video' | 'animation' | 'logo' | 'icon';
  file_url: string;
  thumbnail_url?: string;
  generation_prompt?: string;
  ai_model_used?: string;
  dimensions: {
    width: number;
    height: number;
    aspectRatio: string;
  };
  file_size?: number;
  format?: string;
  tags: string[];
  labels: Record<string, string>;
  metadata: Record<string, any>;
  usage_count: number;
  performance_score?: number;
  is_favorite: boolean;
  is_archived: boolean;
  created_at: string;
  updated_at: string;
}

export interface BrandCampaign {
  id: string;
  brand_id: string;
  user_id: string;
  name: string;
  description?: string;
  campaign_type: 'launch' | 'seasonal' | 'promotion' | 'awareness' | 'custom';
  start_date: string;
  end_date?: string;
  budget?: number;
  target_platforms: string[];
  target_audience: Record<string, any>;
  kpis: Record<string, any>;
  brief?: string;
  status: 'planning' | 'active' | 'paused' | 'completed' | 'archived';
  performance_data: Record<string, any>;
  created_at: string;
  updated_at: string;
}

export interface CampaignContent {
  id: string;
  campaign_id: string;
  asset_id: string;
  platform: 'instagram' | 'tiktok' | 'twitter' | 'linkedin' | 'facebook';
  caption?: string;
  hashtags: string[];
  scheduled_time?: string;
  published_at?: string;
  status: 'draft' | 'scheduled' | 'published' | 'failed';
  platform_post_id?: string;
  engagement_metrics: Record<string, any>;
  auto_formatted: boolean;
  created_at: string;
  updated_at: string;
}

export interface BrandCharacter {
  id: string;
  brand_id: string;
  user_id: string;
  name: string;
  description?: string;
  avatar_url: string;
  character_traits: Record<string, any>;
  voice_settings: Record<string, any>;
  usage_guidelines?: string;
  tags: string[];
  created_at: string;
  updated_at: string;
}

export interface BrandBrief {
  id: string;
  brand_id: string;
  campaign_id?: string;
  user_id: string;
  title: string;
  objective: string;
  target_audience?: string;
  key_messages: string[];
  tone?: string;
  deliverables: any[];
  constraints?: string;
  inspiration_urls: string[];
  deadline?: string;
  ai_generated: boolean;
  created_at: string;
  updated_at: string;
}
