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
      bookings: {
        Row: {
          check_in: string
          check_out: string
          created_at: string
          currency_snapshot: string
          guest_email: string
          guest_name: string
          guest_whatsapp: string
          guests: number
          id: string
          operator_id: string
          price_per_night_snapshot: number
          review_requested_at: string | null
          review_token: string
          room_type_id: string
          special_requests: string | null
          status: string
          stay_range: unknown
          total_price: number
          updated_at: string
          utm_campaign: string | null
          utm_medium: string | null
          utm_source: string | null
        }
        Insert: {
          check_in: string
          check_out: string
          created_at?: string
          currency_snapshot: string
          guest_email: string
          guest_name: string
          guest_whatsapp: string
          guests: number
          id?: string
          operator_id: string
          price_per_night_snapshot: number
          review_requested_at?: string | null
          review_token?: string
          room_type_id: string
          special_requests?: string | null
          status?: string
          stay_range?: unknown
          total_price: number
          updated_at?: string
          utm_campaign?: string | null
          utm_medium?: string | null
          utm_source?: string | null
        }
        Update: {
          check_in?: string
          check_out?: string
          created_at?: string
          currency_snapshot?: string
          guest_email?: string
          guest_name?: string
          guest_whatsapp?: string
          guests?: number
          id?: string
          operator_id?: string
          price_per_night_snapshot?: number
          review_requested_at?: string | null
          review_token?: string
          room_type_id?: string
          special_requests?: string | null
          status?: string
          stay_range?: unknown
          total_price?: number
          updated_at?: string
          utm_campaign?: string | null
          utm_medium?: string | null
          utm_source?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "bookings_operator_id_fkey"
            columns: ["operator_id"]
            isOneToOne: false
            referencedRelation: "operators"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bookings_room_type_id_fkey"
            columns: ["room_type_id"]
            isOneToOne: false
            referencedRelation: "room_types"
            referencedColumns: ["id"]
          },
        ]
      }
      chat_messages: {
        Row: {
          channel: string
          created_at: string
          id: string
          is_read: boolean
          language: string
          message: string
          operator_id: string | null
          sender_type: string
          session_id: string
          visitor_email: string | null
          visitor_name: string
        }
        Insert: {
          channel?: string
          created_at?: string
          id?: string
          is_read?: boolean
          language?: string
          message: string
          operator_id?: string | null
          sender_type?: string
          session_id?: string
          visitor_email?: string | null
          visitor_name?: string
        }
        Update: {
          channel?: string
          created_at?: string
          id?: string
          is_read?: boolean
          language?: string
          message?: string
          operator_id?: string | null
          sender_type?: string
          session_id?: string
          visitor_email?: string | null
          visitor_name?: string
        }
        Relationships: [
          {
            foreignKeyName: "chat_messages_operator_id_fkey"
            columns: ["operator_id"]
            isOneToOne: false
            referencedRelation: "operators"
            referencedColumns: ["id"]
          },
        ]
      }
      discoverability_tests: {
        Row: {
          competitors_mentioned: string[] | null
          created_at: string
          engine: string
          fichua_cited: boolean
          id: string
          notes: string | null
          operator_id: string | null
          operator_mentioned: boolean
          phase: string
          position: number | null
          price_quoted_correctly: boolean | null
          query_text: string
          response_excerpt: string | null
          screenshot_url: string | null
          tested_at: string
          updated_at: string
        }
        Insert: {
          competitors_mentioned?: string[] | null
          created_at?: string
          engine: string
          fichua_cited?: boolean
          id?: string
          notes?: string | null
          operator_id?: string | null
          operator_mentioned?: boolean
          phase: string
          position?: number | null
          price_quoted_correctly?: boolean | null
          query_text: string
          response_excerpt?: string | null
          screenshot_url?: string | null
          tested_at?: string
          updated_at?: string
        }
        Update: {
          competitors_mentioned?: string[] | null
          created_at?: string
          engine?: string
          fichua_cited?: boolean
          id?: string
          notes?: string | null
          operator_id?: string | null
          operator_mentioned?: boolean
          phase?: string
          position?: number | null
          price_quoted_correctly?: boolean | null
          query_text?: string
          response_excerpt?: string | null
          screenshot_url?: string | null
          tested_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "discoverability_tests_operator_id_fkey"
            columns: ["operator_id"]
            isOneToOne: false
            referencedRelation: "operators"
            referencedColumns: ["id"]
          },
        ]
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
      enquiries: {
        Row: {
          channel: string
          created_at: string
          id: string
          initial_message: string | null
          operator_id: string
          operator_nudged_at: string | null
          outcome: string
          reference: string
          responded_at: string | null
          responded_via: string | null
          team_escalated_at: string | null
          traveller_contact: string | null
          traveller_name: string | null
        }
        Insert: {
          channel: string
          created_at?: string
          id?: string
          initial_message?: string | null
          operator_id: string
          operator_nudged_at?: string | null
          outcome?: string
          reference?: string
          responded_at?: string | null
          responded_via?: string | null
          team_escalated_at?: string | null
          traveller_contact?: string | null
          traveller_name?: string | null
        }
        Update: {
          channel?: string
          created_at?: string
          id?: string
          initial_message?: string | null
          operator_id?: string
          operator_nudged_at?: string | null
          outcome?: string
          reference?: string
          responded_at?: string | null
          responded_via?: string | null
          team_escalated_at?: string | null
          traveller_contact?: string | null
          traveller_name?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "enquiries_operator_id_fkey"
            columns: ["operator_id"]
            isOneToOne: false
            referencedRelation: "operators"
            referencedColumns: ["id"]
          },
        ]
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
          billing_started_at: string | null
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
          lifecycle_changed_at: string
          lifecycle_stage: Database["public"]["Enums"]["operator_lifecycle_stage"]
          lng: number | null
          local_hire_percent: number | null
          name: string
          payment_accepted: string[]
          payout_verified: boolean
          phone: string | null
          photo_gps_verified: boolean
          price_range: string | null
          price_snapshot_at: string | null
          slug: string
          solar_powered: boolean
          star_rating: number | null
          status: string
          subscription_currency: string | null
          subscription_price: number | null
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
          billing_started_at?: string | null
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
          lifecycle_changed_at?: string
          lifecycle_stage?: Database["public"]["Enums"]["operator_lifecycle_stage"]
          lng?: number | null
          local_hire_percent?: number | null
          name: string
          payment_accepted?: string[]
          payout_verified?: boolean
          phone?: string | null
          photo_gps_verified?: boolean
          price_range?: string | null
          price_snapshot_at?: string | null
          slug: string
          solar_powered?: boolean
          star_rating?: number | null
          status?: string
          subscription_currency?: string | null
          subscription_price?: number | null
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
          billing_started_at?: string | null
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
          lifecycle_changed_at?: string
          lifecycle_stage?: Database["public"]["Enums"]["operator_lifecycle_stage"]
          lng?: number | null
          local_hire_percent?: number | null
          name?: string
          payment_accepted?: string[]
          payout_verified?: boolean
          phone?: string | null
          photo_gps_verified?: boolean
          price_range?: string | null
          price_snapshot_at?: string | null
          slug?: string
          solar_powered?: boolean
          star_rating?: number | null
          status?: string
          subscription_currency?: string | null
          subscription_price?: number | null
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
      reviews: {
        Row: {
          booking_id: string | null
          created_at: string
          external_url: string | null
          id: string
          language: string
          moderation_status: string
          operator_id: string
          rating: number
          review_date: string
          review_text: string | null
          reviewer_name: string
          source: string
          updated_at: string
        }
        Insert: {
          booking_id?: string | null
          created_at?: string
          external_url?: string | null
          id?: string
          language?: string
          moderation_status?: string
          operator_id: string
          rating: number
          review_date?: string
          review_text?: string | null
          reviewer_name: string
          source: string
          updated_at?: string
        }
        Update: {
          booking_id?: string | null
          created_at?: string
          external_url?: string | null
          id?: string
          language?: string
          moderation_status?: string
          operator_id?: string
          rating?: number
          review_date?: string
          review_text?: string | null
          reviewer_name?: string
          source?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "reviews_booking_id_fkey"
            columns: ["booking_id"]
            isOneToOne: false
            referencedRelation: "bookings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reviews_operator_id_fkey"
            columns: ["operator_id"]
            isOneToOne: false
            referencedRelation: "operators"
            referencedColumns: ["id"]
          },
        ]
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
      support_requests: {
        Row: {
          booking_id: string | null
          created_at: string
          id: string
          message: string
          operator_id: string | null
          reporter_contact: string
          reporter_name: string | null
          resolved_at: string | null
          status: string
        }
        Insert: {
          booking_id?: string | null
          created_at?: string
          id?: string
          message: string
          operator_id?: string | null
          reporter_contact: string
          reporter_name?: string | null
          resolved_at?: string | null
          status?: string
        }
        Update: {
          booking_id?: string | null
          created_at?: string
          id?: string
          message?: string
          operator_id?: string | null
          reporter_contact?: string
          reporter_name?: string | null
          resolved_at?: string | null
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "support_requests_booking_id_fkey"
            columns: ["booking_id"]
            isOneToOne: false
            referencedRelation: "bookings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "support_requests_operator_id_fkey"
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
      system_alerts: {
        Row: {
          context: Json | null
          created_at: string
          detail: string
          id: string
          kind: string
          resolved_at: string | null
        }
        Insert: {
          context?: Json | null
          created_at?: string
          detail: string
          id?: string
          kind: string
          resolved_at?: string | null
        }
        Update: {
          context?: Json | null
          created_at?: string
          detail?: string
          id?: string
          kind?: string
          resolved_at?: string | null
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
      acknowledge_enquiry: {
        Args: { p_reference: string; p_via?: string }
        Returns: boolean
      }
      booking_reference: { Args: { p_booking_id: string }; Returns: string }
      calculate_subscription_price: {
        Args: { p_operator_id: string }
        Returns: {
          cheapest_room_rate: number
          currency: string
          price: number
          room_type_count: number
        }[]
      }
      check_room_availability: {
        Args: {
          p_check_in: string
          p_check_out: string
          p_room_type_id: string
        }
        Returns: boolean
      }
      confirm_booking: {
        Args: { p_booking_id: string }
        Returns: {
          booking_id: string
          notified_operator: boolean
          notified_traveller: boolean
          reference: string
          status: string
        }[]
      }
      create_booking: {
        Args: {
          p_check_in: string
          p_check_out: string
          p_guest_email: string
          p_guest_name: string
          p_guest_whatsapp: string
          p_guests: number
          p_operator_id: string
          p_room_type_id: string
          p_special_requests?: string
          p_utm_campaign?: string
          p_utm_medium?: string
          p_utm_source?: string
        }
        Returns: {
          booking_id: string
          review_token: string
        }[]
      }
      create_enquiry: {
        Args: {
          p_channel: string
          p_initial_message?: string
          p_operator_id: string
        }
        Returns: string
      }
      delete_email: {
        Args: { message_id: number; queue_name: string }
        Returns: boolean
      }
      delivered_booking_count: {
        Args: { p_operator_id: string }
        Returns: number
      }
      delivered_bookings_detail: {
        Args: { p_operator_id: string }
        Returns: {
          booking_id: string
          check_in: string
          check_out: string
          counted_at: string
          currency: string
          guest_name: string
          total_price: number
        }[]
      }
      email_queue_dispatch: { Args: never; Returns: undefined }
      enqueue_email: {
        Args: { payload: Json; queue_name: string }
        Returns: number
      }
      enquiry_queue: {
        Args: never
        Returns: {
          channel: string
          created_at: string
          id: string
          initial_message: string
          minutes_waiting: number
          operator_id: string
          operator_name: string
          operator_nudged_at: string
          outcome: string
          reference: string
          responded_at: string
          team_escalated_at: string
        }[]
      }
      escalate_unanswered_enquiries: {
        Args: {
          p_escalate_after_minutes?: number
          p_nudge_after_minutes?: number
        }
        Returns: {
          escalated: number
          nudged: number
        }[]
      }
      evaluate_operator_lifecycle: {
        Args: { p_operator_id: string }
        Returns: Database["public"]["Enums"]["operator_lifecycle_stage"]
      }
      expire_stale_pending_bookings: { Args: never; Returns: number }
      generate_baseline_queries: {
        Args: { p_operator_id: string }
        Returns: {
          engine: string
          query_text: string
        }[]
      }
      generate_enquiry_reference: { Args: never; Returns: string }
      get_booking_for_review: {
        Args: { p_booking_id: string; p_token: string }
        Returns: {
          already_reviewed: boolean
          check_in: string
          check_out: string
          operator_name: string
        }[]
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
      log_system_alert: {
        Args: { p_context?: Json; p_detail: string; p_kind: string }
        Returns: undefined
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
      open_system_alerts: {
        Args: never
        Returns: {
          context: Json
          created_at: string
          detail: string
          id: string
          kind: string
        }[]
      }
      operator_lifecycle_overview: {
        Args: never
        Returns: {
          billing_started_at: string
          bookings_until_billing: number
          cheapest_room_rate: number
          days_in_stage: number
          delivered_bookings: number
          is_verified: boolean
          last_booking_at: string
          lifecycle_changed_at: string
          lifecycle_stage: Database["public"]["Enums"]["operator_lifecycle_stage"]
          name: string
          operator_id: string
          projected_currency: string
          projected_price: number
          room_type_count: number
          slug: string
          status: string
          subscription_currency: string
          subscription_price: number
        }[]
      }
      operator_responsiveness: {
        Args: { p_operator_id: string }
        Returns: {
          answered_count: number
          answered_within_hour_pct: number
          is_publishable: boolean
          median_minutes: number
          total_count: number
        }[]
      }
      publish_readiness: {
        Args: { p_operator_id: string }
        Returns: {
          all_checks_passed: boolean
          baseline_count: number
          blocking_reasons: string[]
          has_baselines: boolean
          has_gps: boolean
          has_room_types: boolean
          identity_verified: boolean
          payout_verified: boolean
          photo_gps_verified: boolean
          whatsapp_verified: boolean
        }[]
      }
      read_email_batch: {
        Args: { batch_size: number; queue_name: string; vt: number }
        Returns: {
          message: Json
          msg_id: number
          read_ct: number
        }[]
      }
      run_enquiry_escalation: {
        Args: never
        Returns: {
          escalated: number
          nudged: number
        }[]
      }
      seed_baseline_tests: { Args: { p_operator_id: string }; Returns: number }
      send_pending_review_requests: { Args: never; Returns: undefined }
      submit_verified_review: {
        Args: {
          p_booking_id: string
          p_rating: number
          p_review_text: string
          p_token: string
        }
        Returns: string
      }
    }
    Enums: {
      app_role: "admin" | "moderator" | "user"
      operator_lifecycle_stage:
        | "lead"
        | "verifying"
        | "ready"
        | "live_free"
        | "live_subscribed"
        | "dormant"
        | "paused"
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
      operator_lifecycle_stage: [
        "lead",
        "verifying",
        "ready",
        "live_free",
        "live_subscribed",
        "dormant",
        "paused",
      ],
    },
  },
} as const
