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

export type TestimonialConfig = {
  quote: string;
  author: string;
  role?: string;
  avatar_url?: string;
  // Optional video testimonial. When set, replaces the avatar with an
  // embedded video. Aspect determines whether to render portrait (9:16,
  // for vertical phone-style clips) or landscape (16:9, default).
  video_url?: string;
  video_aspect?: "9:16" | "16:9";
};

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
  | EmbedConfig;

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
