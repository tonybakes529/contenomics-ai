// Block config shapes — what we expect inside `blocks.config` jsonb.
// These are the canonical shapes the renderer reads. The dashboard editor
// (Step 7) writes against these too.

export type LinkConfig = { url: string; text: string };

export type HeaderConfig = { text: string };

export type TextConfig = { text: string };

export type EmailFormConfig = {
  heading?: string;
  description?: string;
  button_text?: string;
  list_ids?: string[];
};

export type VideoEmbedConfig = { url: string; title?: string };

export type SocialPlatform = {
  type: string; // "youtube" | "twitter" | "instagram" | "tiktok" | "linkedin" | "github" | "twitch" | "facebook" | "website" | string
  url: string;
  label?: string;
};

export type SocialIconsConfig = { platforms: SocialPlatform[] };

export type ImageConfig = { url: string; alt?: string };

export type DividerConfig = Record<string, never>;

export type ProductConfig = {
  url: string;
  title: string;
  price?: string;
  image?: string;
};

// ─── Landing-page sections ─────────────────────────────────────────────

export type HeroConfig = {
  heading: string;
  subheading?: string;
  cta_text?: string;
  cta_url?: string;
  image_url?: string;
  // Optional embedded video shown between subheading and CTA. Accepts
  // YouTube, Vimeo, or any direct embed URL — passed through toEmbedUrl().
  video_url?: string;
  align?: "left" | "center";
};

export type TestimonialItem = {
  quote?: string;
  author: string;
  role?: string;
  avatar_url?: string;
  // Optional video testimonial. When set, replaces the avatar with an
  // embedded video. Aspect determines portrait (9:16, vertical clips)
  // vs landscape (16:9, default).
  video_url?: string;
  video_aspect?: "9:16" | "16:9";
};

export type TestimonialConfig = {
  // Canonical: array of 1-3 testimonials, rendered side-by-side.
  items?: TestimonialItem[];

  // Legacy single-item fields (pre-2026-05). Read on render for backward
  // compat; new edits always write the items array.
  quote?: string;
  author?: string;
  role?: string;
  avatar_url?: string;
  video_url?: string;
  video_aspect?: "9:16" | "16:9";
};

// Normalize either format into a list.
export function normalizeTestimonials(
  cfg: TestimonialConfig,
): TestimonialItem[] {
  if (Array.isArray(cfg.items) && cfg.items.length > 0) {
    return cfg.items.filter((i) => i.author || i.quote || i.video_url);
  }
  if (cfg.author || cfg.quote || cfg.video_url) {
    return [
      {
        author: cfg.author ?? "",
        quote: cfg.quote,
        role: cfg.role,
        avatar_url: cfg.avatar_url,
        video_url: cfg.video_url,
        video_aspect: cfg.video_aspect,
      },
    ];
  }
  return [];
}

// Standalone CTA button — a single button creators can drop anywhere
// in a page. Distinct from `cta` (which is a full-width dark band) and
// from `link` (a bio-style outline pill); this one is the primary
// "Book a call" / "Get started" affordance.
export type ButtonConfig = {
  text: string;
  url: string;
  style?: "primary" | "outline";
  align?: "left" | "center" | "right";
};

// Generic iframe embed for things like Calendly, Substack signup,
// Tally form, etc. Accepts the embed URL directly.
export type EmbedConfig = {
  url: string;
  title?: string;
  // Aspect ratio. Use "auto" for fixed-height embeds where you want
  // the iframe to size to its content (rare; most need an aspect).
  aspect?: "16:9" | "9:16" | "1:1" | "4:3" | "auto";
  // Pixel height when aspect is "auto" (e.g. Calendly inline ~720).
  height?: number;
};

// Lead magnet — gated download. Visitors enter their email, get added
// to the subscriber list, and immediately see a download button to the
// gated content (PDF, Notion page, course preview, etc.). The standard
// double-opt-in email still goes out for list verification, so the
// instant-access download is bonus access for the visitor's convenience.
export type LeadMagnetConfig = {
  heading: string;
  description?: string;
  // What the gated content is — shown on the download button.
  file_label?: string; // e.g. "Free PDF guide"
  // Where the gated content lives — any URL.
  download_url: string;
  button_text?: string;
  list_ids?: string[];
};

// Multi-question form (Typeform-style). Answers are saved to the
// subscriber's metadata.form_submissions array via the /submit-form
// edge function. The submitter's email is required and becomes their
// subscriber email; their name (if asked) becomes the subscriber name.
export type FormQuestionType =
  | "short_text"
  | "long_text"
  | "email"
  | "name"
  | "choice"
  | "multi_choice"
  | "number"
  | "url";

export type FormQuestion = {
  id: string; // stable identifier so renaming the label doesn't lose history
  type: FormQuestionType;
  label: string;
  description?: string;
  required?: boolean;
  // For choice / multi_choice
  options?: string[];
  placeholder?: string;
};

export type FormConfig = {
  heading?: string;
  description?: string;
  // "stepped" = one question per screen with Next/Back (Typeform-like).
  // "single" = all questions on one page.
  layout?: "stepped" | "single";
  submit_text?: string;
  // Where to send the visitor after a successful submission. Optional —
  // when blank, we just show a success message.
  redirect_url?: string;
  // Message shown briefly before redirecting (or as the final state if
  // there's no redirect).
  thank_you_heading?: string;
  thank_you_message?: string;
  // Optional list assignment, like email_form / lead_magnet.
  list_ids?: string[];
  questions: FormQuestion[];
};

export type FeatureItem = {
  title: string;
  description?: string;
  icon?: string; // emoji or short label
};

export type FeaturesConfig = {
  heading?: string;
  subheading?: string;
  items: FeatureItem[];
};

export type CtaConfig = {
  heading: string;
  subheading?: string;
  button_text: string;
  button_url: string;
};

export type FaqItem = {
  question: string;
  answer: string;
};

export type FaqConfig = {
  heading?: string;
  items: FaqItem[];
};

export type PricingTier = {
  name: string;
  price: string;
  description?: string;
  features?: string[];
  cta_text?: string;
  cta_url?: string;
  highlighted?: boolean;
};

export type PricingConfig = {
  heading?: string;
  subheading?: string;
  tiers: PricingTier[];
};

export type StatItem = {
  value: string;
  label: string;
};

export type StatsConfig = {
  heading?: string;
  items: StatItem[];
};

export type AnyBlockConfig =
  | LinkConfig
  | HeaderConfig
  | TextConfig
  | EmailFormConfig
  | VideoEmbedConfig
  | SocialIconsConfig
  | ImageConfig
  | DividerConfig
  | ProductConfig
  | HeroConfig
  | TestimonialConfig
  | FeaturesConfig
  | CtaConfig
  | FaqConfig
  | PricingConfig
  | StatsConfig
  | ButtonConfig
  | EmbedConfig
  | LeadMagnetConfig
  | FormConfig;

// Convert YouTube/Vimeo watch URL to embeddable URL.
export function toEmbedUrl(url: string): string {
  const yt = url.match(
    /(?:youtube\.com\/(?:watch\?v=|shorts\/)|youtu\.be\/)([\w-]{11})/,
  );
  if (yt) return `https://www.youtube.com/embed/${yt[1]}`;

  const vimeo = url.match(/vimeo\.com\/(\d+)/);
  if (vimeo) return `https://player.vimeo.com/video/${vimeo[1]}`;

  return url;
}
