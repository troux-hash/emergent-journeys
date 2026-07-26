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
    PostgrestVersion: "14.4"
  }
  public: {
    Tables: {
      chat_messages: {
        Row: {
          created_at: string
          id: string
          is_read: boolean
          language: string
          message: string
          sender_type: string
          session_id: string
          visitor_email: string | null
          visitor_name: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_read?: boolean
          language?: string
          message: string
          sender_type?: string
          session_id?: string
          visitor_email?: string | null
          visitor_name?: string
        }
        Update: {
          created_at?: string
          id?: string
          is_read?: boolean
          language?: string
          message?: string
          sender_type?: string
          session_id?: string
          visitor_email?: string | null
          visitor_name?: string
        }
        Relationships: []
      }
      email_send_log: {
        Row: {
          created_at: string
          error_message: string | null
          id: string
          message_id: string | null
          metadata: Json | null
          recipient_email: string
          status: string
          template_name: string
        }
        Insert: {
          created_at?: string
          error_message?: string | null
          id?: string
          message_id?: string | null
          metadata?: Json | null
          recipient_email: string
          status: string
          template_name: string
        }
        Update: {
          created_at?: string
          error_message?: string | null
          id?: string
          message_id?: string | null
          metadata?: Json | null
          recipient_email?: string
          status?: string
          template_name?: string
        }
        Relationships: []
      }
      email_send_state: {
        Row: {
          auth_email_ttl_minutes: number
          batch_size: number
          id: number
          retry_after_until: string | null
          send_delay_ms: number
          transactional_email_ttl_minutes: number
          updated_at: string
        }
        Insert: {
          auth_email_ttl_minutes?: number
          batch_size?: number
          id?: number
          retry_after_until?: string | null
          send_delay_ms?: number
          transactional_email_ttl_minutes?: number
          updated_at?: string
        }
        Update: {
          auth_email_ttl_minutes?: number
          batch_size?: number
          id?: number
          retry_after_until?: string | null
          send_delay_ms?: number
          transactional_email_ttl_minutes?: number
          updated_at?: string
        }
        Relationships: []
      }
      email_unsubscribe_tokens: {
        Row: {
          created_at: string
          email: string
          id: string
          token: string
          used_at: string | null
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          token: string
          used_at?: string | null
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          token?: string
          used_at?: string | null
        }
        Relationships: []
      }
      intranet_attachments: {
        Row: {
          content_type: string
          created_at: string
          document_id: string
          file_name: string
          file_path: string
          file_size: number
          id: string
          uploaded_by: string
        }
        Insert: {
          content_type?: string
          created_at?: string
          document_id: string
          file_name: string
          file_path: string
          file_size?: number
          id?: string
          uploaded_by: string
        }
        Update: {
          content_type?: string
          created_at?: string
          document_id?: string
          file_name?: string
          file_path?: string
          file_size?: number
          id?: string
          uploaded_by?: string
        }
        Relationships: [
          {
            foreignKeyName: "intranet_attachments_document_id_fkey"
            columns: ["document_id"]
            isOneToOne: false
            referencedRelation: "intranet_documents"
            referencedColumns: ["id"]
          },
        ]
      }
      intranet_documents: {
        Row: {
          category: string
          content: string | null
          created_at: string
          created_by: string
          id: string
          title: string
          updated_at: string
        }
        Insert: {
          category?: string
          content?: string | null
          created_at?: string
          created_by: string
          id?: string
          title: string
          updated_at?: string
        }
        Update: {
          category?: string
          content?: string | null
          created_at?: string
          created_by?: string
          id?: string
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      intranet_projects: {
        Row: {
          color: string | null
          created_at: string
          created_by: string
          description: string | null
          id: string
          name: string
          status: string
          updated_at: string
        }
        Insert: {
          color?: string | null
          created_at?: string
          created_by: string
          description?: string | null
          id?: string
          name: string
          status?: string
          updated_at?: string
        }
        Update: {
          color?: string | null
          created_at?: string
          created_by?: string
          description?: string | null
          id?: string
          name?: string
          status?: string
          updated_at?: string
        }
        Relationships: []
      }
      intranet_tasks: {
        Row: {
          assigned_to: string | null
          created_at: string
          created_by: string
          description: string | null
          due_date: string | null
          id: string
          priority: string
          project_id: string | null
          status: string
          title: string
          updated_at: string
        }
        Insert: {
          assigned_to?: string | null
          created_at?: string
          created_by: string
          description?: string | null
          due_date?: string | null
          id?: string
          priority?: string
          project_id?: string | null
          status?: string
          title: string
          updated_at?: string
        }
        Update: {
          assigned_to?: string | null
          created_at?: string
          created_by?: string
          description?: string | null
          due_date?: string | null
          id?: string
          priority?: string
          project_id?: string | null
          status?: string
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "intranet_tasks_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "intranet_projects"
            referencedColumns: ["id"]
          },
        ]
      }
      operator_leads: {
        Row: {
          created_at: string
          email: string | null
          facebook_handle: string | null
          id: string
          instagram_handle: string | null
          name: string | null
          notes: string | null
          num_rooms: number | null
          phone: string | null
          price_max: number | null
          price_min: number | null
          property_name: string
          source: string | null
          status: string
          tiktok_handle: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          email?: string | null
          facebook_handle?: string | null
          id?: string
          instagram_handle?: string | null
          name?: string | null
          notes?: string | null
          num_rooms?: number | null
          phone?: string | null
          price_max?: number | null
          price_min?: number | null
          property_name: string
          source?: string | null
          status?: string
          tiktok_handle?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          email?: string | null
          facebook_handle?: string | null
          id?: string
          instagram_handle?: string | null
          name?: string | null
          notes?: string | null
          num_rooms?: number | null
          phone?: string | null
          price_max?: number | null
          price_min?: number | null
          property_name?: string
          source?: string | null
          status?: string
          tiktok_handle?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      operators: {
        Row: {
          address: string | null
          amenities: string[]
          check_in: string | null
          check_out: string | null
          city: string | null
          community_percent: number | null
          country: string | null
          created_at: string
          currencies_accepted: string[]
          description: string | null
          email: string | null
          hero_image: string | null
          id: string
          identity_verified: boolean
          images: string[]
          instagram_url: string | null
          is_verified: boolean | null
          lat: number | null
          lead_id: string | null
          local_hire_percent: number | null
          lng: number | null
          name: string
          payment_accepted: string[]
          payout_verified: boolean
          phone: string | null
          photo_gps_verified: boolean
          price_range: string | null
          slug: string
          solar_powered: boolean
          star_rating: number | null
          status: string
          tagline: string | null
          tripadvisor_url: string | null
          updated_at: string
          water_conservation: boolean
          website: string | null
          whatsapp_verified: boolean
          years_operating: number | null
        }
        Insert: {
          address?: string | null
          amenities?: string[]
          check_in?: string | null
          check_out?: string | null
          city?: string | null
          community_percent?: number | null
          country?: string | null
          created_at?: string
          currencies_accepted?: string[]
          description?: string | null
          email?: string | null
          hero_image?: string | null
          id?: string
          identity_verified?: boolean
          images?: string[]
          instagram_url?: string | null
          is_verified?: boolean | null
          lat?: number | null
          lead_id?: string | null
          local_hire_percent?: number | null
          lng?: number | null
          name: string
          payment_accepted?: string[]
          payout_verified?: boolean
          phone?: string | null
          photo_gps_verified?: boolean
          price_range?: string | null
          slug: string
          solar_powered?: boolean
          star_rating?: number | null
          status?: string
          tagline?: string | null
          tripadvisor_url?: string | null
          updated_at?: string
          water_conservation?: boolean
          website?: string | null
          whatsapp_verified?: boolean
          years_operating?: number | null
        }
        Update: {
          address?: string | null
          amenities?: string[]
          check_in?: string | null
          check_out?: string | null
          city?: string | null
          community_percent?: number | null
          country?: string | null
          created_at?: string
          currencies_accepted?: string[]
          description?: string | null
          email?: string | null
          hero_image?: string | null
          id?: string
          identity_verified?: boolean
          images?: string[]
          instagram_url?: string | null
          is_verified?: boolean | null
          lat?: number | null
          lead_id?: string | null
          local_hire_percent?: number | null
          lng?: number | null
          name?: string
          payment_accepted?: string[]
          payout_verified?: boolean
          phone?: string | null
          photo_gps_verified?: boolean
          price_range?: string | null
          slug?: string
          solar_powered?: boolean
          star_rating?: number | null
          status?: string
          tagline?: string | null
          tripadvisor_url?: string | null
          updated_at?: string
          water_conservation?: boolean
          website?: string | null
          whatsapp_verified?: boolean
          years_operating?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "operators_lead_id_fkey"
            columns: ["lead_id"]
            isOneToOne: false
            referencedRelation: "operator_leads"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          display_name: string | null
          id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          display_name?: string | null
          id?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          display_name?: string | null
          id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      room_types: {
        Row: {
          created_at: string
          currency: string
          description: string | null
          id: string
          max_guests: number
          name: string
          operator_id: string
          price_per_night: number
          sort_order: number
          updated_at: string
        }
        Insert: {
          created_at?: string
          currency?: string
          description?: string | null
          id?: string
          max_guests?: number
          name: string
          operator_id: string
          price_per_night: number
          sort_order?: number
          updated_at?: string
        }
        Update: {
          created_at?: string
          currency?: string
          description?: string | null
          id?: string
          max_guests?: number
          name?: string
          operator_id?: string
          price_per_night?: number
          sort_order?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "room_types_operator_id_fkey"
            columns: ["operator_id"]
            isOneToOne: false
            referencedRelation: "operators"
            referencedColumns: ["id"]
          },
        ]
      }
      suppressed_emails: {
        Row: {
          created_at: string
          email: string
          id: string
          metadata: Json | null
          reason: string
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          metadata?: Json | null
          reason: string
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          metadata?: Json | null
          reason?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      delete_email: {
        Args: { message_id: number; queue_name: string }
        Returns: boolean
      }
      email_queue_dispatch: { Args: never; Returns: undefined }
      enqueue_email: {
        Args: { payload: Json; queue_name: string }
        Returns: number
      }
      get_chat_session_messages: {
        Args: { p_session_id: string }
        Returns: {
          created_at: string
          id: string
          message: string
          sender_type: string
          visitor_name: string
        }[]
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      move_to_dlq: {
        Args: {
          dlq_name: string
          message_id: number
          payload: Json
          source_queue: string
        }
        Returns: number
      }
      read_email_batch: {
        Args: { batch_size: number; queue_name: string; vt: number }
        Returns: {
          message: Json
          msg_id: number
          read_ct: number
        }[]
      }
    }
    Enums: {
      app_role: "admin" | "moderator" | "user"
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
      app_role: ["admin", "moderator", "user"],
    },
  },
} as const
