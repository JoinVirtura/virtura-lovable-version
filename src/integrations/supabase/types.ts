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
      admin_audit_logs: {
        Row: {
          action_type: string
          admin_email: string
          admin_id: string
          created_at: string | null
          details: Json | null
          id: string
          ip_address: string | null
          target_id: string | null
          target_type: string | null
          user_agent: string | null
        }
        Insert: {
          action_type: string
          admin_email: string
          admin_id: string
          created_at?: string | null
          details?: Json | null
          id?: string
          ip_address?: string | null
          target_id?: string | null
          target_type?: string | null
          user_agent?: string | null
        }
        Update: {
          action_type?: string
          admin_email?: string
          admin_id?: string
          created_at?: string | null
          details?: Json | null
          id?: string
          ip_address?: string | null
          target_id?: string | null
          target_type?: string | null
          user_agent?: string | null
        }
        Relationships: []
      }
      admin_digest_preferences: {
        Row: {
          admin_email: string
          admin_id: string
          created_at: string | null
          daily_enabled: boolean | null
          id: string
          include_charts: boolean | null
          include_failed_jobs: boolean | null
          include_metrics: boolean | null
          include_top_users: boolean | null
          monthly_enabled: boolean | null
          send_time: number | null
          timezone: string | null
          updated_at: string | null
          weekly_enabled: boolean | null
        }
        Insert: {
          admin_email: string
          admin_id: string
          created_at?: string | null
          daily_enabled?: boolean | null
          id?: string
          include_charts?: boolean | null
          include_failed_jobs?: boolean | null
          include_metrics?: boolean | null
          include_top_users?: boolean | null
          monthly_enabled?: boolean | null
          send_time?: number | null
          timezone?: string | null
          updated_at?: string | null
          weekly_enabled?: boolean | null
        }
        Update: {
          admin_email?: string
          admin_id?: string
          created_at?: string | null
          daily_enabled?: boolean | null
          id?: string
          include_charts?: boolean | null
          include_failed_jobs?: boolean | null
          include_metrics?: boolean | null
          include_top_users?: boolean | null
          monthly_enabled?: boolean | null
          send_time?: number | null
          timezone?: string | null
          updated_at?: string | null
          weekly_enabled?: boolean | null
        }
        Relationships: []
      }
      admin_notifications: {
        Row: {
          admin_email: string
          admin_id: string
          created_at: string | null
          id: string
          message: string
          notification_type: string
          recipient_count: number
          scheduled_for: string | null
          sent_at: string | null
          subject: string
          target_audience: string
        }
        Insert: {
          admin_email: string
          admin_id: string
          created_at?: string | null
          id?: string
          message: string
          notification_type: string
          recipient_count: number
          scheduled_for?: string | null
          sent_at?: string | null
          subject: string
          target_audience: string
        }
        Update: {
          admin_email?: string
          admin_id?: string
          created_at?: string | null
          id?: string
          message?: string
          notification_type?: string
          recipient_count?: number
          scheduled_for?: string | null
          sent_at?: string | null
          subject?: string
          target_audience?: string
        }
        Relationships: []
      }
      api_cost_tracking: {
        Row: {
          api_provider: string
          cost_usd: number
          created_at: string
          id: string
          metadata: Json | null
          model_used: string | null
          resource_type: string
          tokens_charged: number | null
          user_id: string
        }
        Insert: {
          api_provider: string
          cost_usd?: number
          created_at?: string
          id?: string
          metadata?: Json | null
          model_used?: string | null
          resource_type: string
          tokens_charged?: number | null
          user_id: string
        }
        Update: {
          api_provider?: string
          cost_usd?: number
          created_at?: string
          id?: string
          metadata?: Json | null
          model_used?: string | null
          resource_type?: string
          tokens_charged?: number | null
          user_id?: string
        }
        Relationships: []
      }
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
      content_unlocks: {
        Row: {
          amount_cents: number
          content_id: string
          content_type: string
          creator_id: string
          id: string
          stripe_payment_intent_id: string | null
          unlocked_at: string | null
          user_id: string
        }
        Insert: {
          amount_cents: number
          content_id: string
          content_type: string
          creator_id: string
          id?: string
          stripe_payment_intent_id?: string | null
          unlocked_at?: string | null
          user_id: string
        }
        Update: {
          amount_cents?: number
          content_id?: string
          content_type?: string
          creator_id?: string
          id?: string
          stripe_payment_intent_id?: string | null
          unlocked_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "content_unlocks_creator_id_fkey"
            columns: ["creator_id"]
            isOneToOne: false
            referencedRelation: "creator_accounts"
            referencedColumns: ["id"]
          },
        ]
      }
      creator_accounts: {
        Row: {
          charges_enabled: boolean | null
          created_at: string | null
          details_submitted: boolean | null
          id: string
          onboarding_complete: boolean | null
          paid_out_cents: number | null
          payouts_enabled: boolean | null
          pending_earnings_cents: number | null
          platform_fee_percentage: number | null
          stripe_account_id: string | null
          total_earnings_cents: number | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          charges_enabled?: boolean | null
          created_at?: string | null
          details_submitted?: boolean | null
          id?: string
          onboarding_complete?: boolean | null
          paid_out_cents?: number | null
          payouts_enabled?: boolean | null
          pending_earnings_cents?: number | null
          platform_fee_percentage?: number | null
          stripe_account_id?: string | null
          total_earnings_cents?: number | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          charges_enabled?: boolean | null
          created_at?: string | null
          details_submitted?: boolean | null
          id?: string
          onboarding_complete?: boolean | null
          paid_out_cents?: number | null
          payouts_enabled?: boolean | null
          pending_earnings_cents?: number | null
          platform_fee_percentage?: number | null
          stripe_account_id?: string | null
          total_earnings_cents?: number | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      creator_earnings: {
        Row: {
          amount_cents: number
          created_at: string | null
          creator_amount_cents: number
          creator_id: string
          id: string
          metadata: Json | null
          net_earnings_cents: number | null
          payout_date: string | null
          platform_fee_cents: number
          revenue_type: string | null
          source_id: string | null
          source_type: string
          status: string | null
          stripe_payout_id: string | null
        }
        Insert: {
          amount_cents: number
          created_at?: string | null
          creator_amount_cents: number
          creator_id: string
          id?: string
          metadata?: Json | null
          net_earnings_cents?: number | null
          payout_date?: string | null
          platform_fee_cents: number
          revenue_type?: string | null
          source_id?: string | null
          source_type: string
          status?: string | null
          stripe_payout_id?: string | null
        }
        Update: {
          amount_cents?: number
          created_at?: string | null
          creator_amount_cents?: number
          creator_id?: string
          id?: string
          metadata?: Json | null
          net_earnings_cents?: number | null
          payout_date?: string | null
          platform_fee_cents?: number
          revenue_type?: string | null
          source_id?: string | null
          source_type?: string
          status?: string | null
          stripe_payout_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "creator_earnings_creator_id_fkey"
            columns: ["creator_id"]
            isOneToOne: false
            referencedRelation: "creator_accounts"
            referencedColumns: ["id"]
          },
        ]
      }
      creator_subscriptions: {
        Row: {
          amount_cents: number
          cancel_at_period_end: boolean | null
          created_at: string | null
          creator_id: string
          current_period_end: string
          current_period_start: string
          id: string
          status: string | null
          stripe_subscription_id: string | null
          subscriber_id: string
          tier: string
          updated_at: string | null
        }
        Insert: {
          amount_cents: number
          cancel_at_period_end?: boolean | null
          created_at?: string | null
          creator_id: string
          current_period_end: string
          current_period_start: string
          id?: string
          status?: string | null
          stripe_subscription_id?: string | null
          subscriber_id: string
          tier: string
          updated_at?: string | null
        }
        Update: {
          amount_cents?: number
          cancel_at_period_end?: boolean | null
          created_at?: string | null
          creator_id?: string
          current_period_end?: string
          current_period_start?: string
          id?: string
          status?: string | null
          stripe_subscription_id?: string | null
          subscriber_id?: string
          tier?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "creator_subscriptions_creator_id_fkey"
            columns: ["creator_id"]
            isOneToOne: false
            referencedRelation: "creator_accounts"
            referencedColumns: ["id"]
          },
        ]
      }
      creator_tips: {
        Row: {
          amount_cents: number
          created_at: string | null
          creator_id: string
          id: string
          message: string | null
          stripe_payment_intent_id: string | null
          tipper_id: string
        }
        Insert: {
          amount_cents: number
          created_at?: string | null
          creator_id: string
          id?: string
          message?: string | null
          stripe_payment_intent_id?: string | null
          tipper_id: string
        }
        Update: {
          amount_cents?: number
          created_at?: string | null
          creator_id?: string
          id?: string
          message?: string | null
          stripe_payment_intent_id?: string | null
          tipper_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "creator_tips_creator_id_fkey"
            columns: ["creator_id"]
            isOneToOne: false
            referencedRelation: "creator_accounts"
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
      feature_suggestions: {
        Row: {
          category: string
          created_at: string
          description: string
          email: string
          id: string
          name: string
          priority: string
          status: string
          title: string
          updated_at: string
          use_case: string
          user_id: string
          votes: number
        }
        Insert: {
          category: string
          created_at?: string
          description: string
          email: string
          id?: string
          name: string
          priority: string
          status?: string
          title: string
          updated_at?: string
          use_case: string
          user_id: string
          votes?: number
        }
        Update: {
          category?: string
          created_at?: string
          description?: string
          email?: string
          id?: string
          name?: string
          priority?: string
          status?: string
          title?: string
          updated_at?: string
          use_case?: string
          user_id?: string
          votes?: number
        }
        Relationships: []
      }
      follows: {
        Row: {
          created_at: string | null
          follower_id: string
          following_id: string
          id: string
        }
        Insert: {
          created_at?: string | null
          follower_id: string
          following_id: string
          id?: string
        }
        Update: {
          created_at?: string | null
          follower_id?: string
          following_id?: string
          id?: string
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
      landing_analytics: {
        Row: {
          created_at: string | null
          event_type: string
          id: string
          metadata: Json | null
          prompt: string | null
          session_id: string | null
          user_ip: string | null
        }
        Insert: {
          created_at?: string | null
          event_type: string
          id?: string
          metadata?: Json | null
          prompt?: string | null
          session_id?: string | null
          user_ip?: string | null
        }
        Update: {
          created_at?: string | null
          event_type?: string
          id?: string
          metadata?: Json | null
          prompt?: string | null
          session_id?: string | null
          user_ip?: string | null
        }
        Relationships: []
      }
      marketplace_access: {
        Row: {
          created_at: string | null
          denial_reason: string | null
          experience: string | null
          id: string
          pitch: string | null
          portfolio_links: string[] | null
          reviewed_at: string | null
          reviewed_by: string | null
          role_requested: string
          status: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          denial_reason?: string | null
          experience?: string | null
          id?: string
          pitch?: string | null
          portfolio_links?: string[] | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          role_requested: string
          status?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          denial_reason?: string | null
          experience?: string | null
          id?: string
          pitch?: string | null
          portfolio_links?: string[] | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          role_requested?: string
          status?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      marketplace_applications: {
        Row: {
          applied_at: string | null
          campaign_id: string
          creator_id: string
          id: string
          pitch: string
          portfolio_links: string[] | null
          proposed_rate_cents: number
          reviewed_at: string | null
          status: string | null
        }
        Insert: {
          applied_at?: string | null
          campaign_id: string
          creator_id: string
          id?: string
          pitch: string
          portfolio_links?: string[] | null
          proposed_rate_cents: number
          reviewed_at?: string | null
          status?: string | null
        }
        Update: {
          applied_at?: string | null
          campaign_id?: string
          creator_id?: string
          id?: string
          pitch?: string
          portfolio_links?: string[] | null
          proposed_rate_cents?: number
          reviewed_at?: string | null
          status?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "marketplace_applications_campaign_id_fkey"
            columns: ["campaign_id"]
            isOneToOne: false
            referencedRelation: "marketplace_campaigns"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "marketplace_applications_creator_id_fkey"
            columns: ["creator_id"]
            isOneToOne: false
            referencedRelation: "creator_accounts"
            referencedColumns: ["id"]
          },
        ]
      }
      marketplace_campaigns: {
        Row: {
          brand_id: string
          budget_cents: number
          category: string | null
          created_at: string | null
          creator_id: string | null
          creator_rate_cents: number | null
          deadline: string | null
          deliverables: Json
          description: string | null
          id: string
          requirements: Json | null
          status: string | null
          title: string
          updated_at: string | null
          visibility: string | null
        }
        Insert: {
          brand_id: string
          budget_cents: number
          category?: string | null
          created_at?: string | null
          creator_id?: string | null
          creator_rate_cents?: number | null
          deadline?: string | null
          deliverables?: Json
          description?: string | null
          id?: string
          requirements?: Json | null
          status?: string | null
          title: string
          updated_at?: string | null
          visibility?: string | null
        }
        Update: {
          brand_id?: string
          budget_cents?: number
          category?: string | null
          created_at?: string | null
          creator_id?: string | null
          creator_rate_cents?: number | null
          deadline?: string | null
          deliverables?: Json
          description?: string | null
          id?: string
          requirements?: Json | null
          status?: string | null
          title?: string
          updated_at?: string | null
          visibility?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "marketplace_campaigns_brand_id_fkey"
            columns: ["brand_id"]
            isOneToOne: false
            referencedRelation: "brands"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "marketplace_campaigns_creator_id_fkey"
            columns: ["creator_id"]
            isOneToOne: false
            referencedRelation: "creator_accounts"
            referencedColumns: ["id"]
          },
        ]
      }
      marketplace_deliverables: {
        Row: {
          approved_at: string | null
          asset_id: string | null
          campaign_id: string
          created_at: string | null
          creator_id: string
          deliverable_type: string
          feedback: string | null
          id: string
          status: string | null
          submitted_at: string | null
        }
        Insert: {
          approved_at?: string | null
          asset_id?: string | null
          campaign_id: string
          created_at?: string | null
          creator_id: string
          deliverable_type: string
          feedback?: string | null
          id?: string
          status?: string | null
          submitted_at?: string | null
        }
        Update: {
          approved_at?: string | null
          asset_id?: string | null
          campaign_id?: string
          created_at?: string | null
          creator_id?: string
          deliverable_type?: string
          feedback?: string | null
          id?: string
          status?: string | null
          submitted_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "marketplace_deliverables_asset_id_fkey"
            columns: ["asset_id"]
            isOneToOne: false
            referencedRelation: "brand_assets"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "marketplace_deliverables_campaign_id_fkey"
            columns: ["campaign_id"]
            isOneToOne: false
            referencedRelation: "marketplace_campaigns"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "marketplace_deliverables_creator_id_fkey"
            columns: ["creator_id"]
            isOneToOne: false
            referencedRelation: "creator_accounts"
            referencedColumns: ["id"]
          },
        ]
      }
      marketplace_payments: {
        Row: {
          brand_id: string
          campaign_id: string
          created_at: string | null
          creator_amount_cents: number
          creator_id: string
          id: string
          paid_at: string | null
          platform_fee_cents: number
          status: string | null
          stripe_payment_intent_id: string | null
          stripe_transfer_id: string | null
          total_amount_cents: number
        }
        Insert: {
          brand_id: string
          campaign_id: string
          created_at?: string | null
          creator_amount_cents: number
          creator_id: string
          id?: string
          paid_at?: string | null
          platform_fee_cents: number
          status?: string | null
          stripe_payment_intent_id?: string | null
          stripe_transfer_id?: string | null
          total_amount_cents: number
        }
        Update: {
          brand_id?: string
          campaign_id?: string
          created_at?: string | null
          creator_amount_cents?: number
          creator_id?: string
          id?: string
          paid_at?: string | null
          platform_fee_cents?: number
          status?: string | null
          stripe_payment_intent_id?: string | null
          stripe_transfer_id?: string | null
          total_amount_cents?: number
        }
        Relationships: [
          {
            foreignKeyName: "marketplace_payments_brand_id_fkey"
            columns: ["brand_id"]
            isOneToOne: false
            referencedRelation: "brands"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "marketplace_payments_campaign_id_fkey"
            columns: ["campaign_id"]
            isOneToOne: false
            referencedRelation: "marketplace_campaigns"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "marketplace_payments_creator_id_fkey"
            columns: ["creator_id"]
            isOneToOne: false
            referencedRelation: "creator_accounts"
            referencedColumns: ["id"]
          },
        ]
      }
      notification_ab_assignments: {
        Row: {
          assigned_at: string | null
          id: string
          notification_id: string | null
          test_id: string
          user_id: string
          variant_id: string
        }
        Insert: {
          assigned_at?: string | null
          id?: string
          notification_id?: string | null
          test_id: string
          user_id: string
          variant_id: string
        }
        Update: {
          assigned_at?: string | null
          id?: string
          notification_id?: string | null
          test_id?: string
          user_id?: string
          variant_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "notification_ab_assignments_notification_id_fkey"
            columns: ["notification_id"]
            isOneToOne: false
            referencedRelation: "notifications"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "notification_ab_assignments_test_id_fkey"
            columns: ["test_id"]
            isOneToOne: false
            referencedRelation: "notification_ab_tests"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "notification_ab_assignments_variant_id_fkey"
            columns: ["variant_id"]
            isOneToOne: false
            referencedRelation: "notification_ab_variants"
            referencedColumns: ["id"]
          },
        ]
      }
      notification_ab_metrics: {
        Row: {
          clicked_at: string | null
          created_at: string | null
          dismissed_at: string | null
          id: string
          notification_clicked: boolean | null
          notification_dismissed: boolean | null
          notification_read: boolean | null
          notification_received: boolean | null
          notification_sent: boolean | null
          read_at: string | null
          received_at: string | null
          sent_at: string | null
          test_id: string
          time_to_click: number | null
          time_to_read: number | null
          user_id: string
          variant_id: string
        }
        Insert: {
          clicked_at?: string | null
          created_at?: string | null
          dismissed_at?: string | null
          id?: string
          notification_clicked?: boolean | null
          notification_dismissed?: boolean | null
          notification_read?: boolean | null
          notification_received?: boolean | null
          notification_sent?: boolean | null
          read_at?: string | null
          received_at?: string | null
          sent_at?: string | null
          test_id: string
          time_to_click?: number | null
          time_to_read?: number | null
          user_id: string
          variant_id: string
        }
        Update: {
          clicked_at?: string | null
          created_at?: string | null
          dismissed_at?: string | null
          id?: string
          notification_clicked?: boolean | null
          notification_dismissed?: boolean | null
          notification_read?: boolean | null
          notification_received?: boolean | null
          notification_sent?: boolean | null
          read_at?: string | null
          received_at?: string | null
          sent_at?: string | null
          test_id?: string
          time_to_click?: number | null
          time_to_read?: number | null
          user_id?: string
          variant_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "notification_ab_metrics_test_id_fkey"
            columns: ["test_id"]
            isOneToOne: false
            referencedRelation: "notification_ab_tests"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "notification_ab_metrics_variant_id_fkey"
            columns: ["variant_id"]
            isOneToOne: false
            referencedRelation: "notification_ab_variants"
            referencedColumns: ["id"]
          },
        ]
      }
      notification_ab_tests: {
        Row: {
          control_group_percentage: number | null
          created_at: string | null
          created_by: string
          description: string | null
          end_date: string | null
          id: string
          name: string
          start_date: string | null
          status: string | null
          updated_at: string | null
        }
        Insert: {
          control_group_percentage?: number | null
          created_at?: string | null
          created_by: string
          description?: string | null
          end_date?: string | null
          id?: string
          name: string
          start_date?: string | null
          status?: string | null
          updated_at?: string | null
        }
        Update: {
          control_group_percentage?: number | null
          created_at?: string | null
          created_by?: string
          description?: string | null
          end_date?: string | null
          id?: string
          name?: string
          start_date?: string | null
          status?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      notification_ab_variants: {
        Row: {
          category: Database["public"]["Enums"]["notification_category"] | null
          created_at: string | null
          id: string
          message: string
          metadata: Json | null
          priority: string | null
          test_id: string
          title: string
          variant_name: string
        }
        Insert: {
          category?: Database["public"]["Enums"]["notification_category"] | null
          created_at?: string | null
          id?: string
          message: string
          metadata?: Json | null
          priority?: string | null
          test_id: string
          title: string
          variant_name: string
        }
        Update: {
          category?: Database["public"]["Enums"]["notification_category"] | null
          created_at?: string | null
          id?: string
          message?: string
          metadata?: Json | null
          priority?: string | null
          test_id?: string
          title?: string
          variant_name?: string
        }
        Relationships: [
          {
            foreignKeyName: "notification_ab_variants_test_id_fkey"
            columns: ["test_id"]
            isOneToOne: false
            referencedRelation: "notification_ab_tests"
            referencedColumns: ["id"]
          },
        ]
      }
      notification_analytics: {
        Row: {
          browser: string | null
          device_type: string | null
          event_data: Json | null
          event_timestamp: string | null
          event_type: string
          id: string
          notification_id: string | null
          os: string | null
          user_id: string
        }
        Insert: {
          browser?: string | null
          device_type?: string | null
          event_data?: Json | null
          event_timestamp?: string | null
          event_type: string
          id?: string
          notification_id?: string | null
          os?: string | null
          user_id: string
        }
        Update: {
          browser?: string | null
          device_type?: string | null
          event_data?: Json | null
          event_timestamp?: string | null
          event_type?: string
          id?: string
          notification_id?: string | null
          os?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "notification_analytics_notification_id_fkey"
            columns: ["notification_id"]
            isOneToOne: false
            referencedRelation: "notifications"
            referencedColumns: ["id"]
          },
        ]
      }
      notification_preferences: {
        Row: {
          account_enabled: boolean | null
          billing_enabled: boolean | null
          created_at: string | null
          daily_digest: boolean | null
          desktop_notifications: boolean | null
          digest_time: number | null
          email_enabled: boolean | null
          id: string
          in_app_enabled: boolean | null
          marketing_enabled: boolean | null
          phone_number: string | null
          phone_verified: boolean | null
          product_enabled: boolean | null
          push_enabled: boolean | null
          quiet_hours_enabled: boolean | null
          quiet_hours_end: number | null
          quiet_hours_start: number | null
          quiet_hours_timezone: string | null
          security_enabled: boolean | null
          sms_enabled: boolean | null
          sound_enabled: boolean | null
          sound_file: string | null
          system_enabled: boolean | null
          updated_at: string | null
          user_id: string
          weekly_digest: boolean | null
        }
        Insert: {
          account_enabled?: boolean | null
          billing_enabled?: boolean | null
          created_at?: string | null
          daily_digest?: boolean | null
          desktop_notifications?: boolean | null
          digest_time?: number | null
          email_enabled?: boolean | null
          id?: string
          in_app_enabled?: boolean | null
          marketing_enabled?: boolean | null
          phone_number?: string | null
          phone_verified?: boolean | null
          product_enabled?: boolean | null
          push_enabled?: boolean | null
          quiet_hours_enabled?: boolean | null
          quiet_hours_end?: number | null
          quiet_hours_start?: number | null
          quiet_hours_timezone?: string | null
          security_enabled?: boolean | null
          sms_enabled?: boolean | null
          sound_enabled?: boolean | null
          sound_file?: string | null
          system_enabled?: boolean | null
          updated_at?: string | null
          user_id: string
          weekly_digest?: boolean | null
        }
        Update: {
          account_enabled?: boolean | null
          billing_enabled?: boolean | null
          created_at?: string | null
          daily_digest?: boolean | null
          desktop_notifications?: boolean | null
          digest_time?: number | null
          email_enabled?: boolean | null
          id?: string
          in_app_enabled?: boolean | null
          marketing_enabled?: boolean | null
          phone_number?: string | null
          phone_verified?: boolean | null
          product_enabled?: boolean | null
          push_enabled?: boolean | null
          quiet_hours_enabled?: boolean | null
          quiet_hours_end?: number | null
          quiet_hours_start?: number | null
          quiet_hours_timezone?: string | null
          security_enabled?: boolean | null
          sms_enabled?: boolean | null
          sound_enabled?: boolean | null
          sound_file?: string | null
          system_enabled?: boolean | null
          updated_at?: string | null
          user_id?: string
          weekly_digest?: boolean | null
        }
        Relationships: []
      }
      notification_sms_limits: {
        Row: {
          daily_count: number | null
          last_reset_date: string | null
          last_reset_month: number | null
          last_reset_week: number | null
          monthly_count: number | null
          user_id: string
          weekly_count: number | null
        }
        Insert: {
          daily_count?: number | null
          last_reset_date?: string | null
          last_reset_month?: number | null
          last_reset_week?: number | null
          monthly_count?: number | null
          user_id: string
          weekly_count?: number | null
        }
        Update: {
          daily_count?: number | null
          last_reset_date?: string | null
          last_reset_month?: number | null
          last_reset_week?: number | null
          monthly_count?: number | null
          user_id?: string
          weekly_count?: number | null
        }
        Relationships: []
      }
      notification_sms_log: {
        Row: {
          created_at: string | null
          delivered_at: string | null
          error_message: string | null
          from_phone: string
          id: string
          message_body: string
          notification_id: string | null
          sent_at: string | null
          status: string | null
          to_phone: string
          twilio_sid: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          delivered_at?: string | null
          error_message?: string | null
          from_phone: string
          id?: string
          message_body: string
          notification_id?: string | null
          sent_at?: string | null
          status?: string | null
          to_phone: string
          twilio_sid?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          delivered_at?: string | null
          error_message?: string | null
          from_phone?: string
          id?: string
          message_body?: string
          notification_id?: string | null
          sent_at?: string | null
          status?: string | null
          to_phone?: string
          twilio_sid?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "notification_sms_log_notification_id_fkey"
            columns: ["notification_id"]
            isOneToOne: false
            referencedRelation: "notifications"
            referencedColumns: ["id"]
          },
        ]
      }
      notifications: {
        Row: {
          category: Database["public"]["Enums"]["notification_category"] | null
          created_at: string | null
          id: string
          message: string
          metadata: Json | null
          priority: string | null
          read: boolean | null
          title: string
          user_id: string
        }
        Insert: {
          category?: Database["public"]["Enums"]["notification_category"] | null
          created_at?: string | null
          id?: string
          message: string
          metadata?: Json | null
          priority?: string | null
          read?: boolean | null
          title: string
          user_id: string
        }
        Update: {
          category?: Database["public"]["Enums"]["notification_category"] | null
          created_at?: string | null
          id?: string
          message?: string
          metadata?: Json | null
          priority?: string | null
          read?: boolean | null
          title?: string
          user_id?: string
        }
        Relationships: []
      }
      phone_verification_codes: {
        Row: {
          code: string
          created_at: string | null
          expires_at: string
          id: string
          phone_number: string
          user_id: string
        }
        Insert: {
          code: string
          created_at?: string | null
          expires_at: string
          id?: string
          phone_number: string
          user_id: string
        }
        Update: {
          code?: string
          created_at?: string | null
          expires_at?: string
          id?: string
          phone_number?: string
          user_id?: string
        }
        Relationships: []
      }
      post_comments: {
        Row: {
          content: string
          created_at: string | null
          id: string
          parent_comment_id: string | null
          post_id: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          content: string
          created_at?: string | null
          id?: string
          parent_comment_id?: string | null
          post_id: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          content?: string
          created_at?: string | null
          id?: string
          parent_comment_id?: string | null
          post_id?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "post_comments_parent_comment_id_fkey"
            columns: ["parent_comment_id"]
            isOneToOne: false
            referencedRelation: "post_comments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "post_comments_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "social_posts"
            referencedColumns: ["id"]
          },
        ]
      }
      post_likes: {
        Row: {
          created_at: string | null
          id: string
          post_id: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          post_id: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          post_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "post_likes_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "social_posts"
            referencedColumns: ["id"]
          },
        ]
      }
      post_unlocks: {
        Row: {
          amount_cents: number
          id: string
          post_id: string
          stripe_payment_intent_id: string | null
          unlocked_at: string | null
          user_id: string
        }
        Insert: {
          amount_cents: number
          id?: string
          post_id: string
          stripe_payment_intent_id?: string | null
          unlocked_at?: string | null
          user_id: string
        }
        Update: {
          amount_cents?: number
          id?: string
          post_id?: string
          stripe_payment_intent_id?: string | null
          unlocked_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "post_unlocks_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "social_posts"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          ai_training_opt_in: boolean | null
          auto_delete_old_projects: boolean | null
          avatar_url: string | null
          content_visibility_default: string | null
          created_at: string
          display_name: string | null
          download_protection: boolean | null
          id: string
          library_public: boolean | null
          onboarding_completed: boolean | null
          onboarding_step: number | null
          save_voice_clones: boolean | null
          signup_bonus_claimed: boolean | null
          updated_at: string
        }
        Insert: {
          ai_training_opt_in?: boolean | null
          auto_delete_old_projects?: boolean | null
          avatar_url?: string | null
          content_visibility_default?: string | null
          created_at?: string
          display_name?: string | null
          download_protection?: boolean | null
          id: string
          library_public?: boolean | null
          onboarding_completed?: boolean | null
          onboarding_step?: number | null
          save_voice_clones?: boolean | null
          signup_bonus_claimed?: boolean | null
          updated_at?: string
        }
        Update: {
          ai_training_opt_in?: boolean | null
          auto_delete_old_projects?: boolean | null
          avatar_url?: string | null
          content_visibility_default?: string | null
          created_at?: string
          display_name?: string | null
          download_protection?: boolean | null
          id?: string
          library_public?: boolean | null
          onboarding_completed?: boolean | null
          onboarding_step?: number | null
          save_voice_clones?: boolean | null
          signup_bonus_claimed?: boolean | null
          updated_at?: string
        }
        Relationships: []
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
      scheduled_notifications: {
        Row: {
          admin_email: string
          admin_id: string
          category: Database["public"]["Enums"]["notification_category"] | null
          created_at: string | null
          error_message: string | null
          id: string
          message: string
          metadata: Json | null
          priority: string | null
          recipient_count: number | null
          recurrence_end_date: string | null
          recurrence_pattern: string | null
          recurring: boolean | null
          scheduled_for: string
          sent_at: string | null
          status: string | null
          subject: string
          target_audience: string
          target_user_ids: Json | null
          timezone: string | null
          updated_at: string | null
        }
        Insert: {
          admin_email: string
          admin_id: string
          category?: Database["public"]["Enums"]["notification_category"] | null
          created_at?: string | null
          error_message?: string | null
          id?: string
          message: string
          metadata?: Json | null
          priority?: string | null
          recipient_count?: number | null
          recurrence_end_date?: string | null
          recurrence_pattern?: string | null
          recurring?: boolean | null
          scheduled_for: string
          sent_at?: string | null
          status?: string | null
          subject: string
          target_audience: string
          target_user_ids?: Json | null
          timezone?: string | null
          updated_at?: string | null
        }
        Update: {
          admin_email?: string
          admin_id?: string
          category?: Database["public"]["Enums"]["notification_category"] | null
          created_at?: string | null
          error_message?: string | null
          id?: string
          message?: string
          metadata?: Json | null
          priority?: string | null
          recipient_count?: number | null
          recurrence_end_date?: string | null
          recurrence_pattern?: string | null
          recurring?: boolean | null
          scheduled_for?: string
          sent_at?: string | null
          status?: string | null
          subject?: string
          target_audience?: string
          target_user_ids?: Json | null
          timezone?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      scheduled_posts: {
        Row: {
          caption: string | null
          created_at: string | null
          error_message: string | null
          hashtags: string[] | null
          id: string
          media_urls: Json | null
          platforms: string[]
          post_id: string | null
          published_to: Json | null
          scheduled_for: string
          status: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          caption?: string | null
          created_at?: string | null
          error_message?: string | null
          hashtags?: string[] | null
          id?: string
          media_urls?: Json | null
          platforms: string[]
          post_id?: string | null
          published_to?: Json | null
          scheduled_for: string
          status?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          caption?: string | null
          created_at?: string | null
          error_message?: string | null
          hashtags?: string[] | null
          id?: string
          media_urls?: Json | null
          platforms?: string[]
          post_id?: string | null
          published_to?: Json | null
          scheduled_for?: string
          status?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "scheduled_posts_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "social_posts"
            referencedColumns: ["id"]
          },
        ]
      }
      social_posts: {
        Row: {
          ai_metadata: Json | null
          caption: string | null
          comment_count: number | null
          content_type: string
          created_at: string | null
          cross_posted_to: Json | null
          id: string
          is_ai_generated: boolean | null
          is_paid: boolean | null
          like_count: number | null
          media_urls: Json | null
          price_cents: number | null
          published_at: string | null
          scheduled_for: string | null
          share_count: number | null
          status: string | null
          thumbnail_url: string | null
          updated_at: string | null
          user_id: string
          view_count: number | null
        }
        Insert: {
          ai_metadata?: Json | null
          caption?: string | null
          comment_count?: number | null
          content_type: string
          created_at?: string | null
          cross_posted_to?: Json | null
          id?: string
          is_ai_generated?: boolean | null
          is_paid?: boolean | null
          like_count?: number | null
          media_urls?: Json | null
          price_cents?: number | null
          published_at?: string | null
          scheduled_for?: string | null
          share_count?: number | null
          status?: string | null
          thumbnail_url?: string | null
          updated_at?: string | null
          user_id: string
          view_count?: number | null
        }
        Update: {
          ai_metadata?: Json | null
          caption?: string | null
          comment_count?: number | null
          content_type?: string
          created_at?: string | null
          cross_posted_to?: Json | null
          id?: string
          is_ai_generated?: boolean | null
          is_paid?: boolean | null
          like_count?: number | null
          media_urls?: Json | null
          price_cents?: number | null
          published_at?: string | null
          scheduled_for?: string | null
          share_count?: number | null
          status?: string | null
          thumbnail_url?: string | null
          updated_at?: string | null
          user_id?: string
          view_count?: number | null
        }
        Relationships: []
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
      support_tickets: {
        Row: {
          attachment_url: string | null
          created_at: string
          description: string
          email: string
          id: string
          issue_type: string
          name: string
          priority: string
          status: string
          subject: string
          updated_at: string
          user_id: string
        }
        Insert: {
          attachment_url?: string | null
          created_at?: string
          description: string
          email: string
          id?: string
          issue_type: string
          name: string
          priority: string
          status?: string
          subject: string
          updated_at?: string
          user_id: string
        }
        Update: {
          attachment_url?: string | null
          created_at?: string
          description?: string
          email?: string
          id?: string
          issue_type?: string
          name?: string
          priority?: string
          status?: string
          subject?: string
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
      token_transactions: {
        Row: {
          amount: number
          cost_usd: number | null
          created_at: string
          id: string
          metadata: Json | null
          resource_id: string | null
          resource_type: string | null
          transaction_type: string
          user_id: string
        }
        Insert: {
          amount: number
          cost_usd?: number | null
          created_at?: string
          id?: string
          metadata?: Json | null
          resource_id?: string | null
          resource_type?: string | null
          transaction_type: string
          user_id: string
        }
        Update: {
          amount?: number
          cost_usd?: number | null
          created_at?: string
          id?: string
          metadata?: Json | null
          resource_id?: string | null
          resource_type?: string | null
          transaction_type?: string
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
      user_tokens: {
        Row: {
          balance: number
          created_at: string
          id: string
          lifetime_purchased: number
          lifetime_used: number
          updated_at: string
          user_id: string
        }
        Insert: {
          balance?: number
          created_at?: string
          id?: string
          lifetime_purchased?: number
          lifetime_used?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          balance?: number
          created_at?: string
          id?: string
          lifetime_purchased?: number
          lifetime_used?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      user_verification: {
        Row: {
          created_at: string | null
          denial_reason: string | null
          id: string
          id_document_type: string | null
          id_document_url: string | null
          reviewed_at: string | null
          reviewed_by: string | null
          status: string | null
          subscription_started_at: string | null
          subscription_status: string | null
          updated_at: string | null
          user_id: string
          verification_subscription_id: string | null
        }
        Insert: {
          created_at?: string | null
          denial_reason?: string | null
          id?: string
          id_document_type?: string | null
          id_document_url?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string | null
          subscription_started_at?: string | null
          subscription_status?: string | null
          updated_at?: string | null
          user_id: string
          verification_subscription_id?: string | null
        }
        Update: {
          created_at?: string | null
          denial_reason?: string | null
          id?: string
          id_document_type?: string | null
          id_document_url?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string | null
          subscription_started_at?: string | null
          subscription_status?: string | null
          updated_at?: string | null
          user_id?: string
          verification_subscription_id?: string | null
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
      notification_ctr_metrics: {
        Row: {
          category: Database["public"]["Enums"]["notification_category"] | null
          ctr: number | null
          date: string | null
          open_rate: number | null
          priority: string | null
          total_clicked: number | null
          total_read: number | null
          total_sent: number | null
        }
        Relationships: []
      }
    }
    Functions: {
      add_tokens: {
        Args: {
          p_amount: number
          p_metadata?: Json
          p_transaction_type?: string
          p_user_id: string
        }
        Returns: boolean
      }
      assign_job_to_gpu: {
        Args: { job_id_param: string; required_vram?: number }
        Returns: string
      }
      check_sms_limit: {
        Args: {
          daily_limit?: number
          monthly_limit?: number
          p_user_id: string
          weekly_limit?: number
        }
        Returns: boolean
      }
      check_usage_limit: {
        Args: {
          daily_limit: number
          resource_type_param: string
          user_uuid: string
        }
        Returns: boolean
      }
      deduct_tokens: {
        Args: {
          p_amount: number
          p_cost_usd?: number
          p_metadata?: Json
          p_resource_id?: string
          p_resource_type: string
          p_user_id: string
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
      notification_category:
        | "system"
        | "account"
        | "billing"
        | "marketing"
        | "product"
        | "security"
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
      notification_category: [
        "system",
        "account",
        "billing",
        "marketing",
        "product",
        "security",
      ],
      user_role: ["owner", "admin", "editor", "viewer"],
    },
  },
} as const
