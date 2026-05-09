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
  | "lead_magnet"
  | "form";

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
      lead_magnets: {
        Row: {
          id: string;
          profile_id: string;
          name: string;
          description: string | null;
          download_url: string;
          file_label: string | null;
          default_heading: string | null;
          default_description: string | null;
          default_button_text: string | null;
          list_id: string | null;
          download_count: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          profile_id: string;
          name: string;
          description?: string | null;
          download_url: string;
          file_label?: string | null;
          default_heading?: string | null;
          default_description?: string | null;
          default_button_text?: string | null;
          list_id?: string | null;
          download_count?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          profile_id?: string;
          name?: string;
          description?: string | null;
          download_url?: string;
          file_label?: string | null;
          default_heading?: string | null;
          default_description?: string | null;
          default_button_text?: string | null;
          list_id?: string | null;
          download_count?: number;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "lead_magnets_profile_id_fkey";
            columns: ["profile_id"];
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "lead_magnets_list_id_fkey";
            columns: ["list_id"];
            referencedRelation: "lists";
            referencedColumns: ["id"];
          },
        ];
      };
      page_default_lists: {
        Row: {
          page_id: string;
          list_id: string;
          created_at: string;
        };
        Insert: {
          page_id: string;
          list_id: string;
          created_at?: string;
        };
        Update: {
          page_id?: string;
          list_id?: string;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "page_default_lists_page_id_fkey";
            columns: ["page_id"];
            referencedRelation: "pages";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "page_default_lists_list_id_fkey";
            columns: ["list_id"];
            referencedRelation: "lists";
            referencedColumns: ["id"];
          },
        ];
      };
      viewtrack_videos: {
        Row: {
          id: string;
          profile_id: string;
          // Identity
          video_external_id: string | null;
          date_posted: string | null;
          final_title: string | null;
          video_url: string | null;
          length_text: string | null;
          topic: string | null;
          platform: "youtube" | "shorts" | "linkedin";
          // Creative
          ab_title_1: string | null;
          ab_title_2: string | null;
          ab_title_3: string | null;
          winning_title_num: number | null;
          winning_style:
            | "Curiosity"
            | "List"
            | "How-To"
            | "Question"
            | "Shock"
            | null;
          thumbnail_url: string | null;
          thumbnail_path: string | null;
          face_yn: "Y" | "N" | null;
          face_emotion:
            | "Shock"
            | "Smile"
            | "Serious"
            | "Curious"
            | "None"
            | null;
          word_count: number | null;
          words_used: string | null;
          background: "Solid" | "Scene" | "Gradient" | "Photo" | null;
          color_palette: "Bright" | "Dark" | "Mixed" | null;
          hook_script: string | null;
          hook_style:
            | "Question"
            | "Stat"
            | "Story"
            | "Bold Claim"
            | "Pattern Interrupt"
            | null;
          intro_length_sec: number | null;
          time_to_value_sec: number | null;
          thumbnail_notes: string | null;
          // Performance
          ctr_24h: number | null;
          ctr_7d: number | null;
          ctr_30d: number | null;
          drop_off_rate: number | null;
          drop_off_timestamp: string | null;
          avd: string | null;
          views_7d: number | null;
          views_30d: number | null;
          // Conversion
          ctas_used: string | null;
          click_throughs: number | null;
          engagement_rate: number | null;
          calls_booked: number | null;
          notes: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          profile_id: string;
          video_external_id?: string | null;
          date_posted?: string | null;
          final_title?: string | null;
          video_url?: string | null;
          length_text?: string | null;
          topic?: string | null;
          platform?: "youtube" | "shorts" | "linkedin";
          ab_title_1?: string | null;
          ab_title_2?: string | null;
          ab_title_3?: string | null;
          winning_title_num?: number | null;
          winning_style?:
            | "Curiosity"
            | "List"
            | "How-To"
            | "Question"
            | "Shock"
            | null;
          thumbnail_url?: string | null;
          thumbnail_path?: string | null;
          face_yn?: "Y" | "N" | null;
          face_emotion?:
            | "Shock"
            | "Smile"
            | "Serious"
            | "Curious"
            | "None"
            | null;
          word_count?: number | null;
          words_used?: string | null;
          background?: "Solid" | "Scene" | "Gradient" | "Photo" | null;
          color_palette?: "Bright" | "Dark" | "Mixed" | null;
          hook_script?: string | null;
          hook_style?:
            | "Question"
            | "Stat"
            | "Story"
            | "Bold Claim"
            | "Pattern Interrupt"
            | null;
          intro_length_sec?: number | null;
          time_to_value_sec?: number | null;
          thumbnail_notes?: string | null;
          ctr_24h?: number | null;
          ctr_7d?: number | null;
          ctr_30d?: number | null;
          drop_off_rate?: number | null;
          drop_off_timestamp?: string | null;
          avd?: string | null;
          views_7d?: number | null;
          views_30d?: number | null;
          ctas_used?: string | null;
          click_throughs?: number | null;
          engagement_rate?: number | null;
          calls_booked?: number | null;
          notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<
          Database["public"]["Tables"]["viewtrack_videos"]["Insert"]
        >;
        Relationships: [
          {
            foreignKeyName: "viewtrack_videos_profile_id_fkey";
            columns: ["profile_id"];
            referencedRelation: "profiles";
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
export type LeadMagnet = Database["public"]["Tables"]["lead_magnets"]["Row"];
export type ViewtrackVideo =
  Database["public"]["Tables"]["viewtrack_videos"]["Row"];
export type ViewtrackVideoInsert =
  Database["public"]["Tables"]["viewtrack_videos"]["Insert"];
export type ViewtrackVideoUpdate =
  Database["public"]["Tables"]["viewtrack_videos"]["Update"];

// Dropdown enum values — used by both the form UI and server-side validation.
export const VIEWTRACK_TITLE_STYLES = [
  "Curiosity",
  "List",
  "How-To",
  "Question",
  "Shock",
] as const;
export const VIEWTRACK_FACE_EMOTIONS = [
  "Shock",
  "Smile",
  "Serious",
  "Curious",
  "None",
] as const;
export const VIEWTRACK_BACKGROUNDS = [
  "Solid",
  "Scene",
  "Gradient",
  "Photo",
] as const;
export const VIEWTRACK_COLOR_PALETTES = ["Bright", "Dark", "Mixed"] as const;
export const VIEWTRACK_HOOK_STYLES = [
  "Question",
  "Stat",
  "Story",
  "Bold Claim",
  "Pattern Interrupt",
] as const;
export const VIEWTRACK_PLATFORMS = ["youtube", "shorts", "linkedin"] as const;
