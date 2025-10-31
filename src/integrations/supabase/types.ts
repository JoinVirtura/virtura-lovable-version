export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      avatar_library: {
        Row: {
          audio_url: string | null
          created_at: string
          duration: number | null
          id: string
          image_url: string
          is_video: boolean | null
          prompt: string
          tags: string[] | null
          thumbnail_url: string | null
          title: string | null
          updated_at: string
          user_id: string | null
          video_url: string | null
        }
        Insert: {
          audio_url?: string | null
          created_at?: string
          duration?: number | null
          id?: string
          image_url: string
          is_video?: boolean | null
          prompt: string
          tags?: string[] | null
          thumbnail_url?: string | null
          title?: string | null
          updated_at?: string
          user_id?: string | null
          video_url?: string | null
        }
        Update: {
          audio_url?: string | null
          created_at?: string
          duration?: number | null
          id?: string
          image_url?: string
          is_video?: boolean | null
          prompt?: string
          tags?: string[] | null
          thumbnail_url?: string | null
          title?: string | null
          updated_at?: string
          user_id?: string | null
          video_url?: string | null
        }
        Relationships: []
      }
      avatar_loras: {
        Row: {
          avatar_name: string
          consistency_score: number | null
          created_at: string | null
          id: string
          lora_model_path: string | null
          status: string | null
          training_images: string[] | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          avatar_name: string
          consistency_score?: number | null
          created_at?: string | null
          id?: string
          lora_model_path?: string | null
          status?: string | null
          training_images?: string[] | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          avatar_name?: string
          consistency_score?: number | null
          created_at?: string | null
          id?: string
          lora_model_path?: string | null
          status?: string | null
          training_images?: string[] | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      brand_analytics: {
        Row: {
          asset_id: string | null
          brand_id: string
          campaign_id: string | null
          created_at: string
          date: string
          id: string
          metadata: Json | null
          metric_type: string
          metric_value: number
          platform: string | null
        }
        Insert: {
          asset_id?: string | null
          brand_id: string
          campaign_id?: string | null
          created_at?: string
          date: string
          id?: string
          metadata?: Json | null
          metric_type: string
          metric_value: number
          platform?: string | null
        }
        Update: {
          asset_id?: string | null
          brand_id?: string
          campaign_id?: string | null
          created_at?: string
          date?: string
          id?: string
          metadata?: Json | null
          metric_type?: string
          metric_value?: number
          platform?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "brand_analytics_asset_id_fkey"
            columns: ["asset_id"]
            isOneToOne: false
            referencedRelation: "brand_assets"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "brand_analytics_brand_id_fkey"
            columns: ["brand_id"]
            isOneToOne: false
            referencedRelation: "brands"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "brand_analytics_campaign_id_fkey"
            columns: ["campaign_id"]
            isOneToOne: false
            referencedRelation: "brand_campaigns"
            referencedColumns: ["id"]
          },
        ]
      }
      brand_assets: {
        Row: {
          ai_model_used: string | null
          asset_type: string | null
          brand_id: string
          collection_id: string | null
          created_at: string
          description: string | null
          dimensions: Json | null
          file_size: number | null
          file_url: string
          format: string | null
          generation_prompt: string | null
          id: string
          is_archived: boolean | null
          is_favorite: boolean | null
          labels: Json | null
          metadata: Json | null
          performance_score: number | null
          tags: string[] | null
          thumbnail_url: string | null
          title: string
          updated_at: string
          usage_count: number | null
          user_id: string
        }
        Insert: {
          ai_model_used?: string | null
          asset_type?: string | null
          brand_id: string
          collection_id?: string | null
          created_at?: string
          description?: string | null
          dimensions?: Json | null
          file_size?: number | null
          file_url: string
          format?: string | null
          generation_prompt?: string | null
          id?: string
          is_archived?: boolean | null
          is_favorite?: boolean | null
          labels?: Json | null
          metadata?: Json | null
          performance_score?: number | null
          tags?: string[] | null
          thumbnail_url?: string | null
          title: string
          updated_at?: string
          usage_count?: number | null
          user_id: string
        }
        Update: {
          ai_model_used?: string | null
          asset_type?: string | null
          brand_id?: string
          collection_id?: string | null
          created_at?: string
          description?: string | null
          dimensions?: Json | null
          file_size?: number | null
          file_url?: string
          format?: string | null
          generation_prompt?: string | null
          id?: string
          is_archived?: boolean | null
          is_favorite?: boolean | null
          labels?: Json | null
          metadata?: Json | null
          performance_score?: number | null
          tags?: string[] | null
          thumbnail_url?: string | null
          title?: string
          updated_at?: string
          usage_count?: number | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "brand_assets_brand_id_fkey"
            columns: ["brand_id"]
            isOneToOne: false
            referencedRelation: "brands"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "brand_assets_collection_id_fkey"
            columns: ["collection_id"]
            isOneToOne: false
            referencedRelation: "brand_collections"
            referencedColumns: ["id"]
          },
        ]
      }
      brand_briefs: {
        Row: {
          ai_generated: boolean | null
          brand_id: string
          campaign_id: string | null
          constraints: string | null
          created_at: string
          deadline: string | null
          deliverables: Json | null
          id: string
          inspiration_urls: string[] | null
          key_messages: string[] | null
          objective: string
          target_audience: string | null
          title: string
          tone: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          ai_generated?: boolean | null
          brand_id: string
          campaign_id?: string | null
          constraints?: string | null
          created_at?: string
          deadline?: string | null
          deliverables?: Json | null
          id?: string
          inspiration_urls?: string[] | null
          key_messages?: string[] | null
          objective: string
          target_audience?: string | null
          title: string
          tone?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          ai_generated?: boolean | null
          brand_id?: string
          campaign_id?: string | null
          constraints?: string | null
          created_at?: string
          deadline?: string | null
          deliverables?: Json | null
          id?: string
          inspiration_urls?: string[] | null
          key_messages?: string[] | null
          objective?: string
          target_audience?: string | null
          title?: string
          tone?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "brand_briefs_brand_id_fkey"
            columns: ["brand_id"]
            isOneToOne: false
            referencedRelation: "brands"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "brand_briefs_campaign_id_fkey"
            columns: ["campaign_id"]
            isOneToOne: false
            referencedRelation: "brand_campaigns"
            referencedColumns: ["id"]
          },
        ]
      }
      brand_campaigns: {
        Row: {
          brand_id: string
          brief: string | null
          budget: number | null
          campaign_type: string | null
          created_at: string
          description: string | null
          end_date: string | null
          id: string
          kpis: Json | null
          name: string
          performance_data: Json | null
          start_date: string
          status: string | null
          target_audience: Json | null
          target_platforms: string[] | null
          updated_at: string
          user_id: string
        }
        Insert: {
          brand_id: string
          brief?: string | null
          budget?: number | null
          campaign_type?: string | null
          created_at?: string
          description?: string | null
          end_date?: string | null
          id?: string
          kpis?: Json | null
          name: string
          performance_data?: Json | null
          start_date: string
          status?: string | null
          target_audience?: Json | null
          target_platforms?: string[] | null
          updated_at?: string
          user_id: string
        }
        Update: {
          brand_id?: string
          brief?: string | null
          budget?: number | null
          campaign_type?: string | null
          created_at?: string
          description?: string | null
          end_date?: string | null
          id?: string
          kpis?: Json | null
          name?: string
          performance_data?: Json | null
          start_date?: string
          status?: string | null
          target_audience?: Json | null
          target_platforms?: string[] | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "brand_campaigns_brand_id_fkey"
            columns: ["brand_id"]
            isOneToOne: false
            referencedRelation: "brands"
            referencedColumns: ["id"]
          },
        ]
      }
      brand_characters: {
        Row: {
          avatar_url: string
          brand_id: string
          character_traits: Json | null
          created_at: string
          description: string | null
          id: string
          name: string
          tags: string[] | null
          updated_at: string
          usage_guidelines: string | null
          user_id: string
          voice_settings: Json | null
        }
        Insert: {
          avatar_url: string
          brand_id: string
          character_traits?: Json | null
          created_at?: string
          description?: string | null
          id?: string
          name: string
          tags?: string[] | null
          updated_at?: string
          usage_guidelines?: string | null
          user_id: string
          voice_settings?: Json | null
        }
        Update: {
          avatar_url?: string
          brand_id?: string
          character_traits?: Json | null
          created_at?: string
          description?: string | null
          id?: string
          name?: string
          tags?: string[] | null
          updated_at?: string
          usage_guidelines?: string | null
          user_id?: string
          voice_settings?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "brand_characters_brand_id_fkey"
            columns: ["brand_id"]
            isOneToOne: false
            referencedRelation: "brands"
            referencedColumns: ["id"]
          },
        ]
      }
      brand_collaborations: {
        Row: {
          accepted_at: string | null
          brand_id: string
          id: string
          invited_at: string
          inviter_id: string
          last_active: string | null
          permissions: Json | null
          role: string | null
          status: string | null
          user_id: string
        }
        Insert: {
          accepted_at?: string | null
          brand_id: string
          id?: string
          invited_at?: string
          inviter_id: string
          last_active?: string | null
          permissions?: Json | null
          role?: string | null
          status?: string | null
          user_id: string
        }
        Update: {
          accepted_at?: string | null
          brand_id?: string
          id?: string
          invited_at?: string
          inviter_id?: string
          last_active?: string | null
          permissions?: Json | null
          role?: string | null
          status?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "brand_collaborations_brand_id_fkey"
            columns: ["brand_id"]
            isOneToOne: false
            referencedRelation: "brands"
            referencedColumns: ["id"]
          },
        ]
      }
      brand_collections: {
        Row: {
          brand_id: string
          collection_type: string | null
          color_label: string | null
          created_at: string
          description: string | null
          id: string
          is_smart_folder: boolean | null
          name: string
          parent_collection_id: string | null
          smart_rules: Json | null
          sort_order: number | null
          updated_at: string
          user_id: string
        }
        Insert: {
          brand_id: string
          collection_type?: string | null
          color_label?: string | null
          created_at?: string
          description?: string | null
          id?: string
          is_smart_folder?: boolean | null
          name: string
          parent_collection_id?: string | null
          smart_rules?: Json | null
          sort_order?: number | null
          updated_at?: string
          user_id: string
        }
        Update: {
          brand_id?: string
          collection_type?: string | null
          color_label?: string | null
          created_at?: string
          description?: string | null
          id?: string
          is_smart_folder?: boolean | null
          name?: string
          parent_collection_id?: string | null
          smart_rules?: Json | null
          sort_order?: number | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "brand_collections_brand_id_fkey"
            columns: ["brand_id"]
            isOneToOne: false
            referencedRelation: "brands"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "brand_collections_parent_collection_id_fkey"
            columns: ["parent_collection_id"]
            isOneToOne: false
            referencedRelation: "brand_collections"
            referencedColumns: ["id"]
          },
        ]
      }
      brands: {
        Row: {
          brand_colors: Json | null
          brand_fonts: Json | null
          created_at: string
          description: string | null
          id: string
          industry: string | null
          is_active: boolean | null
          logo_url: string | null
          name: string
          organization_id: string | null
          social_handles: Json | null
          target_audience: string | null
          tone_of_voice: string | null
          updated_at: string
          user_id: string
          website_url: string | null
        }
        Insert: {
          brand_colors?: Json | null
          brand_fonts?: Json | null
          created_at?: string
          description?: string | null
          id?: string
          industry?: string | null
          is_active?: boolean | null
          logo_url?: string | null
          name: string
          organization_id?: string | null
          social_handles?: Json | null
          target_audience?: string | null
          tone_of_voice?: string | null
          updated_at?: string
          user_id: string
          website_url?: string | null
        }
        Update: {
          brand_colors?: Json | null
          brand_fonts?: Json | null
          created_at?: string
          description?: string | null
          id?: string
          industry?: string | null
          is_active?: boolean | null
          logo_url?: string | null
          name?: string
          organization_id?: string | null
          social_handles?: Json | null
          target_audience?: string | null
          tone_of_voice?: string | null
          updated_at?: string
          user_id?: string
          website_url?: string | null
        }
        Relationships: []
      }
      campaign_content: {
        Row: {
          asset_id: string
          auto_formatted: boolean | null
          campaign_id: string
          caption: string | null
          created_at: string
          engagement_metrics: Json | null
          hashtags: string[] | null
          id: string
          platform: string
          platform_post_id: string | null
          published_at: string | null
          scheduled_time: string | null
          status: string | null
          updated_at: string
        }
        Insert: {
          asset_id: string
          auto_formatted?: boolean | null
          campaign_id: string
          caption?: string | null
          created_at?: string
          engagement_metrics?: Json | null
          hashtags?: string[] | null
          id?: string
          platform: string
          platform_post_id?: string | null
          published_at?: string | null
          scheduled_time?: string | null
          status?: string | null
          updated_at?: string
        }
        Update: {
          asset_id?: string
          auto_formatted?: boolean | null
          campaign_id?: string
          caption?: string | null
          created_at?: string
          engagement_metrics?: Json | null
          hashtags?: string[] | null
          id?: string
          platform?: string
          platform_post_id?: string | null
          published_at?: string | null
          scheduled_time?: string | null
          status?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "campaign_content_asset_id_fkey"
            columns: ["asset_id"]
            isOneToOne: false
            referencedRelation: "brand_assets"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "campaign_content_campaign_id_fkey"
            columns: ["campaign_id"]
            isOneToOne: false
            referencedRelation: "brand_campaigns"
            referencedColumns: ["id"]
          },
        ]
      }
      error_logs: {
        Row: {
          context: Json | null
          created_at: string | null
          error_message: string
          error_stack: string | null
          error_type: string
          id: string
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          context?: Json | null
          created_at?: string | null
          error_message: string
          error_stack?: string | null
          error_type: string
          id?: string
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          context?: Json | null
          created_at?: string | null
          error_message?: string
          error_stack?: string | null
          error_type?: string
          id?: string
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      gpu_workers: {
        Row: {
          created_at: string | null
          current_job_id: string | null
          gpu_type: string
          id: string
          last_heartbeat: string | null
          status: string | null
          updated_at: string | null
          vram_available: number
          vram_total: number
          worker_id: string
        }
        Insert: {
          created_at?: string | null
          current_job_id?: string | null
          gpu_type: string
          id?: string
          last_heartbeat?: string | null
          status?: string | null
          updated_at?: string | null
          vram_available: number
          vram_total: number
          worker_id: string
        }
        Update: {
          created_at?: string | null
          current_job_id?: string | null
          gpu_type?: string
          id?: string
          last_heartbeat?: string | null
          status?: string | null
          updated_at?: string | null
          vram_available?: number
          vram_total?: number
          worker_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "gpu_workers_current_job_id_fkey"
            columns: ["current_job_id"]
            isOneToOne: false
            referencedRelation: "jobs"
            referencedColumns: ["id"]
          },
        ]
      }
      jobs: {
        Row: {
          completed_at: string | null
          created_at: string
          error_message: string | null
          estimated_completion: string | null
          gpu_requirements: Json | null
          id: string
          input_data: Json | null
          output_data: Json | null
          processing_phases: string[] | null
          progress: number
          project_id: string | null
          retry_count: number | null
          stage: string | null
          started_at: string | null
          status: string
          type: string
          updated_at: string
          user_id: string
          worker_id: string | null
        }
        Insert: {
          completed_at?: string | null
          created_at?: string
          error_message?: string | null
          estimated_completion?: string | null
          gpu_requirements?: Json | null
          id?: string
          input_data?: Json | null
          output_data?: Json | null
          processing_phases?: string[] | null
          progress?: number
          project_id?: string | null
          retry_count?: number | null
          stage?: string | null
          started_at?: string | null
          status?: string
          type: string
          updated_at?: string
          user_id: string
          worker_id?: string | null
        }
        Update: {
          completed_at?: string | null
          created_at?: string
          error_message?: string | null
          estimated_completion?: string | null
          gpu_requirements?: Json | null
          id?: string
          input_data?: Json | null
          output_data?: Json | null
          processing_phases?: string[] | null
          progress?: number
          project_id?: string | null
          retry_count?: number | null
          stage?: string | null
          started_at?: string | null
          status?: string
          type?: string
          updated_at?: string
          user_id?: string
          worker_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "jobs_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "jobs_worker_id_fkey"
            columns: ["worker_id"]
            isOneToOne: false
            referencedRelation: "gpu_workers"
            referencedColumns: ["worker_id"]
          },
        ]
      }
      projects: {
        Row: {
          created_at: string
          description: string | null
          id: string
          metadata: Json | null
          status: string
          thumbnail_url: string | null
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          metadata?: Json | null
          status?: string
          thumbnail_url?: string | null
          title: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          metadata?: Json | null
          status?: string
          thumbnail_url?: string | null
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      publishing_queue: {
        Row: {
          brand_id: string
          content_id: string
          created_at: string
          error_message: string | null
          id: string
          platform: string
          published_at: string | null
          retry_count: number | null
          scheduled_time: string
          status: string | null
          updated_at: string
        }
        Insert: {
          brand_id: string
          content_id: string
          created_at?: string
          error_message?: string | null
          id?: string
          platform: string
          published_at?: string | null
          retry_count?: number | null
          scheduled_time: string
          status?: string | null
          updated_at?: string
        }
        Update: {
          brand_id?: string
          content_id?: string
          created_at?: string
          error_message?: string | null
          id?: string
          platform?: string
          published_at?: string | null
          retry_count?: number | null
          scheduled_time?: string
          status?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "publishing_queue_brand_id_fkey"
            columns: ["brand_id"]
            isOneToOne: false
            referencedRelation: "brands"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "publishing_queue_content_id_fkey"
            columns: ["content_id"]
            isOneToOne: false
            referencedRelation: "campaign_content"
            referencedColumns: ["id"]
          },
        ]
      }
      render_analytics: {
        Row: {
          created_at: string | null
          error_count: number | null
          gpu_utilization: number | null
          id: string
          job_id: string | null
          pipeline_stage: string | null
          processing_time_seconds: number | null
          quality_score: number | null
          user_satisfaction: number | null
          vram_peak_usage: number | null
        }
        Insert: {
          created_at?: string | null
          error_count?: number | null
          gpu_utilization?: number | null
          id?: string
          job_id?: string | null
          pipeline_stage?: string | null
          processing_time_seconds?: number | null
          quality_score?: number | null
          user_satisfaction?: number | null
          vram_peak_usage?: number | null
        }
        Update: {
          created_at?: string | null
          error_count?: number | null
          gpu_utilization?: number | null
          id?: string
          job_id?: string | null
          pipeline_stage?: string | null
          processing_time_seconds?: number | null
          quality_score?: number | null
          user_satisfaction?: number | null
          vram_peak_usage?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "render_analytics_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "jobs"
            referencedColumns: ["id"]
          },
        ]
      }
      renders: {
        Row: {
          created_at: string
          description: string | null
          download_count: number | null
          duration: number | null
          file_size: number | null
          format: string | null
          id: string
          job_id: string | null
          metadata: Json | null
          project_id: string | null
          resolution: string | null
          share_url: string | null
          thumbnail_url: string | null
          title: string
          updated_at: string
          user_id: string
          video_url: string
          watermark: boolean | null
        }
        Insert: {
          created_at?: string
          description?: string | null
          download_count?: number | null
          duration?: number | null
          file_size?: number | null
          format?: string | null
          id?: string
          job_id?: string | null
          metadata?: Json | null
          project_id?: string | null
          resolution?: string | null
          share_url?: string | null
          thumbnail_url?: string | null
          title: string
          updated_at?: string
          user_id: string
          video_url: string
          watermark?: boolean | null
        }
        Update: {
          created_at?: string
          description?: string | null
          download_count?: number | null
          duration?: number | null
          file_size?: number | null
          format?: string | null
          id?: string
          job_id?: string | null
          metadata?: Json | null
          project_id?: string | null
          resolution?: string | null
          share_url?: string | null
          thumbnail_url?: string | null
          title?: string
          updated_at?: string
          user_id?: string
          video_url?: string
          watermark?: boolean | null
        }
        Relationships: [
          {
            foreignKeyName: "renders_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "jobs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "renders_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      style_templates: {
        Row: {
          brand_colors: string[] | null
          camera_settings: Json | null
          created_at: string | null
          id: string
          is_public: boolean | null
          lighting_preset: string | null
          lut_settings: Json | null
          template_name: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          brand_colors?: string[] | null
          camera_settings?: Json | null
          created_at?: string | null
          id?: string
          is_public?: boolean | null
          lighting_preset?: string | null
          lut_settings?: Json | null
          template_name: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          brand_colors?: string[] | null
          camera_settings?: Json | null
          created_at?: string | null
          id?: string
          is_public?: boolean | null
          lighting_preset?: string | null
          lut_settings?: Json | null
          template_name?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      subscriptions: {
        Row: {
          cancel_at_period_end: boolean | null
          created_at: string
          current_period_end: string | null
          current_period_start: string | null
          id: string
          plan_name: string | null
          price_id: string | null
          status: string
          stripe_customer_id: string | null
          stripe_subscription_id: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          cancel_at_period_end?: boolean | null
          created_at?: string
          current_period_end?: string | null
          current_period_start?: string | null
          id?: string
          plan_name?: string | null
          price_id?: string | null
          status?: string
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          cancel_at_period_end?: boolean | null
          created_at?: string
          current_period_end?: string | null
          current_period_start?: string | null
          id?: string
          plan_name?: string | null
          price_id?: string | null
          status?: string
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      talking_avatars: {
        Row: {
          created_at: string
          error_message: string | null
          heygen_avatar_id: string | null
          heygen_talking_photo_id: string | null
          heygen_video_id: string | null
          id: string
          kling_avatar_id: string | null
          krea_avatar_id: string | null
          metadata: Json | null
          openai_avatar_id: string | null
          openai_video_id: string | null
          original_image_url: string
          runway_avatar_id: string | null
          runwayml_avatar_id: string | null
          status: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          error_message?: string | null
          heygen_avatar_id?: string | null
          heygen_talking_photo_id?: string | null
          heygen_video_id?: string | null
          id?: string
          kling_avatar_id?: string | null
          krea_avatar_id?: string | null
          metadata?: Json | null
          openai_avatar_id?: string | null
          openai_video_id?: string | null
          original_image_url: string
          runway_avatar_id?: string | null
          runwayml_avatar_id?: string | null
          status?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          error_message?: string | null
          heygen_avatar_id?: string | null
          heygen_talking_photo_id?: string | null
          heygen_video_id?: string | null
          id?: string
          kling_avatar_id?: string | null
          krea_avatar_id?: string | null
          metadata?: Json | null
          openai_avatar_id?: string | null
          openai_video_id?: string | null
          original_image_url?: string
          runway_avatar_id?: string | null
          runwayml_avatar_id?: string | null
          status?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      usage_tracking: {
        Row: {
          amount: number
          created_at: string
          id: string
          metadata: Json | null
          resource_type: string
          updated_at: string
          user_id: string
        }
        Insert: {
          amount?: number
          created_at?: string
          id?: string
          metadata?: Json | null
          resource_type: string
          updated_at?: string
          user_id: string
        }
        Update: {
          amount?: number
          created_at?: string
          id?: string
          metadata?: Json | null
          resource_type?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          organization_id: string | null
          permissions: Json | null
          role: Database["public"]["Enums"]["user_role"]
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          organization_id?: string | null
          permissions?: Json | null
          role?: Database["public"]["Enums"]["user_role"]
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          organization_id?: string | null
          permissions?: Json | null
          role?: Database["public"]["Enums"]["user_role"]
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      voice_cache: {
        Row: {
          audio_url: string
          created_at: string
          duration: number | null
          id: string
          provider: string
          script_hash: string
          updated_at: string
          user_id: string
          voice_id: string
          voice_settings: Json
        }
        Insert: {
          audio_url: string
          created_at?: string
          duration?: number | null
          id?: string
          provider: string
          script_hash: string
          updated_at?: string
          user_id: string
          voice_id: string
          voice_settings: Json
        }
        Update: {
          audio_url?: string
          created_at?: string
          duration?: number | null
          id?: string
          provider?: string
          script_hash?: string
          updated_at?: string
          user_id?: string
          voice_id?: string
          voice_settings?: Json
        }
        Relationships: []
      }
      voice_clones: {
        Row: {
          audio_samples: string[] | null
          created_at: string
          id: string
          metadata: Json | null
          provider: string
          updated_at: string
          user_id: string
          voice_id: string
          voice_name: string
        }
        Insert: {
          audio_samples?: string[] | null
          created_at?: string
          id?: string
          metadata?: Json | null
          provider?: string
          updated_at?: string
          user_id: string
          voice_id: string
          voice_name: string
        }
        Update: {
          audio_samples?: string[] | null
          created_at?: string
          id?: string
          metadata?: Json | null
          provider?: string
          updated_at?: string
          user_id?: string
          voice_id?: string
          voice_name?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      assign_job_to_gpu: {
        Args: { job_id_param: string; required_vram?: number }
        Returns: string
      }
      check_usage_limit: {
        Args: {
          daily_limit: number
          resource_type_param: string
          user_uuid: string
        }
        Returns: boolean
      }
      get_user_role: {
        Args: { user_uuid: string }
        Returns: Database["public"]["Enums"]["user_role"]
      }
      get_user_subscription_status: {
        Args: { user_uuid?: string }
        Returns: {
          current_period_end: string
          has_active_subscription: boolean
          plan_name: string
          status: string
        }[]
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["user_role"]
          _user_id: string
        }
        Returns: boolean
      }
      is_admin: { Args: never; Returns: boolean }
      update_gpu_worker_heartbeat: {
        Args: { worker_id_param: string }
        Returns: undefined
      }
      validate_password_strength: {
        Args: { password_text: string }
        Returns: boolean
      }
    }
    Enums: {
      user_role: "owner" | "admin" | "editor" | "viewer"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      user_role: ["owner", "admin", "editor", "viewer"],
    },
  },
} as const
