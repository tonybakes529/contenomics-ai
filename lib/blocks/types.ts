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

export type AnyBlockConfig =
  | LinkConfig
  | HeaderConfig
  | TextConfig
  | EmailFormConfig
  | VideoEmbedConfig
  | SocialIconsConfig
  | ImageConfig
  | DividerConfig
  | ProductConfig;

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
