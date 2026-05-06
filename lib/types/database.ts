// Hand-crafted types matching the live Supabase schema.
// Replace this file by running:
//   npx supabase gen types typescript --project-id frepzfazvqkjuetqsiln > lib/types/database.ts
// (Requires SUPABASE_ACCESS_TOKEN or `supabase login`.)

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type BlockType =
  | "link"
  | "header"
  | "text"
  | "email_form"
  | "video_embed"
  | "social_icons"
  | "image"
  | "divider"
  | "product"
  | "hero"
  | "testimonial"
  | "features"
  | "cta"
  | "faq"
  | "pricing"
  | "stats"
  | "button"
  | "embed"
  | "lead_magnet";

export type PageTemplate = "bio" | "landing";

export type SubscriberStatus =
  | "pending"
  | "confirmed"
  | "unsubscribed"
  | "bounced";

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          username: string;
          display_name: string | null;
          avatar_url: string | null;
          bio: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          username: string;
          display_name?: string | null;
          avatar_url?: string | null;
          bio?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          username?: string;
          display_name?: string | null;
          avatar_url?: string | null;
          bio?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      pages: {
        Row: {
          id: string;
          profile_id: string;
          slug: string;
          title: string | null;
          description: string | null;
          theme: Json;
          template: PageTemplate;
          is_published: boolean;
          is_default: boolean;
          view_count: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          profile_id: string;
          slug?: string;
          title?: string | null;
          description?: string | null;
          theme?: Json;
          template?: PageTemplate;
          is_published?: boolean;
          is_default?: boolean;
          view_count?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          profile_id?: string;
          slug?: string;
          title?: string | null;
          description?: string | null;
          theme?: Json;
          template?: PageTemplate;
          is_published?: boolean;
          is_default?: boolean;
          view_count?: number;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "pages_profile_id_fkey";
            columns: ["profile_id"];
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      blocks: {
        Row: {
          id: string;
          page_id: string;
          type: BlockType;
          position: number;
          config: Json;
          is_visible: boolean;
          click_count: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          page_id: string;
          type: BlockType;
          position: number;
          config?: Json;
          is_visible?: boolean;
          click_count?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          page_id?: string;
          type?: BlockType;
          position?: number;
          config?: Json;
          is_visible?: boolean;
          click_count?: number;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "blocks_page_id_fkey";
            columns: ["page_id"];
            referencedRelation: "pages";
            referencedColumns: ["id"];
          },
        ];
      };
      subscribers: {
        Row: {
          id: string;
          profile_id: string;
          email: string;
          name: string | null;
          source_page_id: string | null;
          source_block_id: string | null;
          status: SubscriberStatus;
          confirmation_token: string | null;
          confirmed_at: string | null;
          unsubscribed_at: string | null;
          metadata: Json;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          profile_id: string;
          email: string;
          name?: string | null;
          source_page_id?: string | null;
          source_block_id?: string | null;
          status?: SubscriberStatus;
          confirmation_token?: string | null;
          confirmed_at?: string | null;
          unsubscribed_at?: string | null;
          metadata?: Json;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          profile_id?: string;
          email?: string;
          name?: string | null;
          source_page_id?: string | null;
          source_block_id?: string | null;
          status?: SubscriberStatus;
          confirmation_token?: string | null;
          confirmed_at?: string | null;
          unsubscribed_at?: string | null;
          metadata?: Json;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "subscribers_profile_id_fkey";
            columns: ["profile_id"];
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "subscribers_source_page_id_fkey";
            columns: ["source_page_id"];
            referencedRelation: "pages";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "subscribers_source_block_id_fkey";
            columns: ["source_block_id"];
            referencedRelation: "blocks";
            referencedColumns: ["id"];
          },
        ];
      };
      lists: {
        Row: {
          id: string;
          profile_id: string;
          name: string;
          description: string | null;
          color: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          profile_id: string;
          name: string;
          description?: string | null;
          color?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          profile_id?: string;
          name?: string;
          description?: string | null;
          color?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "lists_profile_id_fkey";
            columns: ["profile_id"];
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      subscriber_lists: {
        Row: {
          subscriber_id: string;
          list_id: string;
          added_at: string;
        };
        Insert: {
          subscriber_id: string;
          list_id: string;
          added_at?: string;
        };
        Update: {
          subscriber_id?: string;
          list_id?: string;
          added_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "subscriber_lists_subscriber_id_fkey";
            columns: ["subscriber_id"];
            referencedRelation: "subscribers";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "subscriber_lists_list_id_fkey";
            columns: ["list_id"];
            referencedRelation: "lists";
            referencedColumns: ["id"];
          },
        ];
      };
      clicks: {
        Row: {
          id: string;
          block_id: string | null;
          page_id: string | null;
          profile_id: string | null;
          ip_hash: string | null;
          user_agent: string | null;
          referrer: string | null;
          country: string | null;
          device_type: string | null;
          utm_source: string | null;
          utm_medium: string | null;
          utm_campaign: string | null;
          utm_term: string | null;
          utm_content: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          block_id?: string | null;
          page_id?: string | null;
          profile_id?: string | null;
          ip_hash?: string | null;
          user_agent?: string | null;
          referrer?: string | null;
          country?: string | null;
          device_type?: string | null;
          utm_source?: string | null;
          utm_medium?: string | null;
          utm_campaign?: string | null;
          utm_term?: string | null;
          utm_content?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          block_id?: string | null;
          page_id?: string | null;
          profile_id?: string | null;
          ip_hash?: string | null;
          user_agent?: string | null;
          referrer?: string | null;
          country?: string | null;
          device_type?: string | null;
          utm_source?: string | null;
          utm_medium?: string | null;
          utm_campaign?: string | null;
          utm_term?: string | null;
          utm_content?: string | null;
          created_at?: string;
        };
        Relationships: [];
      };
    };
    Views: { [_ in never]: never };
    Functions: { [_ in never]: never };
    Enums: {
      block_type: BlockType;
      subscriber_status: SubscriberStatus;
    };
    CompositeTypes: { [_ in never]: never };
  };
}

// Convenience aliases — use these in queries instead of the deep paths.
export type Profile = Database["public"]["Tables"]["profiles"]["Row"];
export type Page = Database["public"]["Tables"]["pages"]["Row"];
export type Block = Database["public"]["Tables"]["blocks"]["Row"];
export type Subscriber = Database["public"]["Tables"]["subscribers"]["Row"];
export type List = Database["public"]["Tables"]["lists"]["Row"];
export type SubscriberList =
  Database["public"]["Tables"]["subscriber_lists"]["Row"];
export type Click = Database["public"]["Tables"]["clicks"]["Row"];
