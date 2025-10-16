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
          created_at: string
          id: string
          image_url: string
          prompt: string
          tags: string[] | null
          title: string | null
          updated_at: string
          user_id: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          image_url: string
          prompt: string
          tags?: string[] | null
          title?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          image_url?: string
          prompt?: string
          tags?: string[] | null
          title?: string | null
          updated_at?: string
          user_id?: string | null
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
      is_admin: {
        Args: Record<PropertyKey, never>
        Returns: boolean
      }
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
