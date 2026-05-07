"use client";

import { useMemo, useState } from "react";
import { cn } from "@/lib/utils";
import {
  normalizeTestimonials,
  toEmbedUrl,
  type ButtonConfig,
  type CtaConfig,
  type EmailFormConfig,
  type EmbedConfig,
  type FaqConfig,
  type FeaturesConfig,
  type FormConfig,
  type FormQuestion,
  type HeaderConfig,
  type HeroConfig,
  type ImageConfig,
  type LeadMagnetConfig,
  type LinkConfig,
  type PricingConfig,
  type ProductConfig,
  type SocialIconsConfig,
  type StatsConfig,
  type TestimonialConfig,
  type TestimonialItem,
  type TextConfig,
  type VideoEmbedConfig,
} from "@/lib/blocks/types";

export type RendererBlock = {
  id: string;
  type: string;
  position: number;
  config: unknown;
};

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "";

function pickUtm(): Record<string, string> {
  if (typeof window === "undefined") return {};
  const sp = new URLSearchParams(window.location.search);
  const out: Record<string, string> = {};
  for (const k of [
    "utm_source",
    "utm_medium",
    "utm_campaign",
    "utm_term",
    "utm_content",
  ]) {
    const v = sp.get(k);
    if (v) out[k] = v;
  }
  return out;
}

function fireTrackClick(blockId: string) {
  if (!SUPABASE_URL) return;
  const body = JSON.stringify({
    block_id: blockId,
    referrer: document.referrer || undefined,
    ...pickUtm(),
  });
  // keepalive lets the request complete after navigation begins.
  fetch(`${SUPABASE_URL}/functions/v1/track-click`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      apikey: SUPABASE_ANON_KEY,
    },
    body,
    keepalive: true,
  }).catch(() => {
    // Tracking failure must not block the user — silently swallow.
  });
}

export function BlockRenderer({
  blocks,
  pageId,
  template = "bio",
}: {
  blocks: RendererBlock[];
  pageId: string;
  template?: "bio" | "landing";
}) {
  if (template === "landing") {
    // Landing: each block becomes its own full-bleed section. Generous
    // vertical padding so the page reads like a real landing page rather
    // than a stretched-wide link-list. Some block types fill the full
    // width naturally (hero, features, pricing, stats) — narrower content
    // (links, headers, text, email forms) gets centered in a max-w-2xl
    // column so it doesn't drift in space.
    return (
      <div className="w-full">
        {blocks.map((block) => (
          <LandingSection key={block.id} block={block} pageId={pageId} />
        ))}
      </div>
    );
  }

  // Bio: tight stacked column, blocks render edge-to-edge inside the
  // parent's max-w-md wrapper.
  return (
    <div className="flex w-full flex-col gap-3">
      {blocks.map((b) => (
        <BlockItem key={b.id} block={b} pageId={pageId} />
      ))}
    </div>
  );
}

// Block types that already fill the section visually (their own headings,
// grids, dark bands). They get max-w-5xl inner content, full vertical padding.
const WIDE_BLOCK_TYPES = new Set([
  "hero",
  "features",
  "pricing",
  "stats",
  "faq",
  "video_embed",
  "image",
  "embed",
  "testimonial",
]);

// Block types that already render edge-to-edge with their own background
// (e.g. CTA's dark band). Don't add another wrapper background.
const FULL_BLEED_TYPES = new Set(["cta"]);

function LandingSection({
  block,
  pageId,
}: {
  block: RendererBlock;
  pageId: string;
}) {
  if (block.type === "divider") {
    return (
      <div className="mx-auto w-full max-w-5xl px-4 sm:px-8">
        <hr className="border-border" />
      </div>
    );
  }

  // Hero pulls extra vertical room and removes its own internal py so
  // the section padding owns spacing.
  const isHero = block.type === "hero";
  const isWide = WIDE_BLOCK_TYPES.has(block.type);
  const isFullBleed = FULL_BLEED_TYPES.has(block.type);

  if (isFullBleed) {
    // CTA renders its own colored band — give it top/bottom margin via padding.
    return (
      <section className="w-full px-4 py-10 sm:px-8 sm:py-16">
        <div className="mx-auto max-w-5xl">
          <BlockItem block={block} pageId={pageId} />
        </div>
      </section>
    );
  }

  return (
    <section
      className={cn(
        "w-full px-4 sm:px-8",
        isHero ? "py-12 sm:py-24" : "py-12 sm:py-20",
      )}
    >
      <div
        className={cn(
          "mx-auto",
          isWide ? "max-w-5xl" : "max-w-2xl",
        )}
      >
        <BlockItem block={block} pageId={pageId} />
      </div>
    </section>
  );
}

function BlockItem({
  block,
  pageId,
}: {
  block: RendererBlock;
  pageId: string;
}) {
  switch (block.type) {
    case "link":
      return <LinkBlock block={block} />;
    case "hero":
      return <HeroBlock block={block} />;
    case "testimonial":
      return <TestimonialBlock block={block} />;
    case "features":
      return <FeaturesBlock block={block} />;
    case "cta":
      return <CtaBlock block={block} />;
    case "faq":
      return <FaqBlock block={block} />;
    case "pricing":
      return <PricingBlock block={block} />;
    case "stats":
      return <StatsBlock block={block} />;
    case "header":
      return <HeaderBlock block={block} />;
    case "text":
      return <TextBlock block={block} />;
    case "email_form":
      return <EmailFormBlock block={block} pageId={pageId} />;
    case "video_embed":
      return <VideoEmbedBlock block={block} />;
    case "social_icons":
      return <SocialIconsBlock block={block} />;
    case "image":
      return <ImageBlock block={block} />;
    case "divider":
      return <hr className="border-border my-2" />;
    case "product":
      return <ProductBlock block={block} />;
    case "button":
      return <ButtonBlock block={block} />;
    case "embed":
      return <EmbedBlock block={block} />;
    case "lead_magnet":
      return <LeadMagnetBlock block={block} pageId={pageId} />;
    case "form":
      return <FormBlock block={block} pageId={pageId} />;
    default:
      return null;
  }
}

function LinkBlock({ block }: { block: RendererBlock }) {
  const cfg = block.config as LinkConfig;
  if (!cfg?.url) return null;
  return (
    <a
      href={cfg.url}
      target="_blank"
      rel="noopener noreferrer"
      onClick={() => fireTrackClick(block.id)}
      className={cn(
        "border-border bg-background hover:bg-muted block w-full rounded-xl border px-5 py-3.5 text-center text-base font-medium shadow-sm transition-colors",
      )}
    >
      {cfg.text || cfg.url}
    </a>
  );
}

function HeaderBlock({ block }: { block: RendererBlock }) {
  const cfg = block.config as HeaderConfig;
  if (!cfg?.text) return null;
  return (
    <h2 className="mt-4 text-center text-lg font-semibold tracking-tight">
      {cfg.text}
    </h2>
  );
}

function TextBlock({ block }: { block: RendererBlock }) {
  const cfg = block.config as TextConfig;
  if (!cfg?.text) return null;
  return (
    <p className="text-muted-foreground text-center text-sm whitespace-pre-line">
      {cfg.text}
    </p>
  );
}

function ImageBlock({ block }: { block: RendererBlock }) {
  const cfg = block.config as ImageConfig;
  if (!cfg?.url) return null;
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={cfg.url}
      alt={cfg.alt ?? ""}
      className="w-full rounded-xl object-cover"
    />
  );
}

function VideoEmbedBlock({ block }: { block: RendererBlock }) {
  const cfg = block.config as VideoEmbedConfig;
  const embed = useMemo(() => (cfg?.url ? toEmbedUrl(cfg.url) : null), [
    cfg?.url,
  ]);
  if (!embed) return null;
  return (
    <div className="aspect-video w-full overflow-hidden rounded-xl">
      <iframe
        src={embed}
        title={cfg.title ?? "Video"}
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
        className="h-full w-full border-0"
      />
    </div>
  );
}

function SocialIconsBlock({ block }: { block: RendererBlock }) {
  const cfg = block.config as SocialIconsConfig;
  if (!cfg?.platforms?.length) return null;
  return (
    <div className="flex flex-wrap items-center justify-center gap-2 py-1">
      {cfg.platforms.map((p, i) => (
        <a
          key={`${p.type}-${i}`}
          href={p.url}
          target="_blank"
          rel="noopener noreferrer"
          onClick={() => fireTrackClick(block.id)}
          aria-label={p.label ?? p.type}
          className="border-border hover:bg-muted inline-flex h-9 items-center justify-center rounded-full border px-3 text-xs font-medium capitalize transition-colors"
        >
          {p.label ?? p.type}
        </a>
      ))}
    </div>
  );
}

function ProductBlock({ block }: { block: RendererBlock }) {
  const cfg = block.config as ProductConfig;
  if (!cfg?.url || !cfg.title) return null;
  return (
    <a
      href={cfg.url}
      target="_blank"
      rel="noopener noreferrer"
      onClick={() => fireTrackClick(block.id)}
      className="border-border bg-background hover:bg-muted flex w-full items-center gap-3 rounded-xl border p-3 shadow-sm transition-colors"
    >
      {cfg.image ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={cfg.image}
          alt=""
          className="size-14 shrink-0 rounded-md object-cover"
        />
      ) : null}
      <div className="min-w-0 flex-1 text-left">
        <p className="truncate text-sm font-medium">{cfg.title}</p>
        {cfg.price ? (
          <p className="text-muted-foreground text-xs">{cfg.price}</p>
        ) : null}
      </div>
    </a>
  );
}

function EmailFormBlock({
  block,
  pageId,
}: {
  block: RendererBlock;
  pageId: string;
}) {
  const cfg = (block.config as EmailFormConfig) ?? {};
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [status, setStatus] = useState<
    "idle" | "submitting" | "success" | "error"
  >("idle");
  const [errorMsg, setErrorMsg] = useState("");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (status === "submitting") return;
    setStatus("submitting");
    setErrorMsg("");
    try {
      const res = await fetch(`${SUPABASE_URL}/functions/v1/subscribe`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          apikey: SUPABASE_ANON_KEY,
        },
        body: JSON.stringify({
          email: email.trim(),
          name: name.trim() || undefined,
          page_id: pageId,
          block_id: block.id,
          list_ids: cfg.list_ids,
        }),
      });
      const data = (await res.json().catch(() => ({}))) as {
        ok?: boolean;
        error?: string;
        requires_confirmation?: boolean;
      };
      if (!res.ok || !data.ok) {
        throw new Error(data.error ?? "Could not subscribe right now.");
      }
      setStatus("success");
    } catch (err) {
      setStatus("error");
      setErrorMsg(err instanceof Error ? err.message : "Something went wrong.");
    }
  }

  if (status === "success") {
    return (
      <div className="border-border bg-background rounded-xl border p-4 text-center shadow-sm">
        <p className="text-sm font-semibold">Almost there.</p>
        <p className="text-muted-foreground mt-1 text-sm">
          Check your inbox for a confirmation email.
        </p>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="border-border bg-background flex flex-col gap-2 rounded-xl border p-4 shadow-sm"
    >
      {cfg.heading ? (
        <p className="text-center text-sm font-semibold">{cfg.heading}</p>
      ) : null}
      {cfg.description ? (
        <p className="text-muted-foreground text-center text-xs">
          {cfg.description}
        </p>
      ) : null}
      <input
        type="text"
        name="name"
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="Your name (optional)"
        autoComplete="name"
        className="border-border bg-background h-10 rounded-md border px-3 text-sm outline-none focus:ring-2 focus:ring-black/20"
      />
      <input
        type="email"
        name="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="you@example.com"
        autoComplete="email"
        required
        className="border-border bg-background h-10 rounded-md border px-3 text-sm outline-none focus:ring-2 focus:ring-black/20"
      />
      <button
        type="submit"
        disabled={status === "submitting"}
        className="bg-foreground text-background mt-1 h-10 rounded-md text-sm font-medium transition-colors hover:opacity-90 disabled:opacity-50"
      >
        {status === "submitting"
          ? "Subscribing…"
          : (cfg.button_text ?? "Subscribe")}
      </button>
      {errorMsg ? (
        <p className="text-destructive text-center text-xs" role="alert">
          {errorMsg}
        </p>
      ) : null}
    </form>
  );
}

// ─── Landing-page section blocks ────────────────────────────────────────

function HeroBlock({ block }: { block: RendererBlock }) {
  const cfg = block.config as HeroConfig;
  if (!cfg?.heading) return null;
  const align = cfg.align ?? "center";

  // Hero supports either a side image (left-aligned only) OR an inline
  // video between subheading and CTA. Video takes precedence if both
  // are set so the embed is what creators actually see.
  const heroVideoEmbed = cfg.video_url ? toEmbedUrl(cfg.video_url) : null;

  return (
    <section
      className={cn(
        "w-full",
        align === "center" ? "text-center" : "text-left",
      )}
    >
      <div
        className={cn(
          "grid items-center gap-8 sm:gap-12",
          cfg.image_url && align !== "center" && !heroVideoEmbed
            ? "sm:grid-cols-2"
            : "",
        )}
      >
        <div
          className={cn(
            "space-y-4",
            align === "center" ? "mx-auto max-w-2xl" : "",
          )}
        >
          <h1 className="text-3xl font-semibold tracking-tight sm:text-5xl">
            {cfg.heading}
          </h1>
          {cfg.subheading ? (
            <p className="text-muted-foreground text-base sm:text-lg">
              {cfg.subheading}
            </p>
          ) : null}

          {heroVideoEmbed ? (
            <div className="mx-auto aspect-video w-full max-w-3xl overflow-hidden rounded-xl border border-zinc-200/70 shadow-sm">
              <iframe
                src={heroVideoEmbed}
                title="Hero video"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                className="h-full w-full border-0"
              />
            </div>
          ) : null}

          {cfg.cta_url && cfg.cta_text ? (
            <div
              className={cn(
                "pt-1",
                align === "center" ? "flex justify-center" : "",
              )}
            >
              <a
                href={cfg.cta_url}
                onClick={() => fireTrackClick(block.id)}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-foreground text-background inline-flex h-11 items-center rounded-xl px-5 text-sm font-medium shadow-sm transition-opacity hover:opacity-90"
              >
                {cfg.cta_text}
              </a>
            </div>
          ) : null}
        </div>
        {cfg.image_url && !heroVideoEmbed ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={cfg.image_url}
            alt=""
            className="w-full rounded-2xl object-cover"
          />
        ) : null}
      </div>
    </section>
  );
}

function TestimonialBlock({ block }: { block: RendererBlock }) {
  const cfg = block.config as TestimonialConfig;
  const items = normalizeTestimonials(cfg).slice(0, 3);
  if (items.length === 0) return null;

  // Single testimonial: centered narrow card. Multi: side-by-side grid.
  if (items.length === 1) {
    return (
      <div className="mx-auto w-full max-w-2xl">
        <TestimonialCard item={items[0]} />
      </div>
    );
  }

  return (
    <div
      className={cn(
        "mx-auto grid w-full gap-4 sm:gap-6",
        items.length === 2
          ? "max-w-4xl grid-cols-1 sm:grid-cols-2"
          : "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3",
      )}
    >
      {items.map((item, i) => (
        <TestimonialCard key={i} item={item} />
      ))}
    </div>
  );
}

function TestimonialCard({ item }: { item: TestimonialItem }) {
  const videoEmbed = item.video_url ? toEmbedUrl(item.video_url) : null;
  const aspect = item.video_aspect ?? "16:9";

  // Portrait videos cap narrower so vertical clips don't dominate the card.
  const videoMaxWidth =
    aspect === "9:16" ? "max-w-[260px]" : "max-w-2xl";

  return (
    <figure className="border-border bg-background flex h-full flex-col rounded-2xl border p-6 shadow-sm sm:p-7">
      {videoEmbed ? (
        <div
          className={cn(
            "mx-auto mb-4 w-full overflow-hidden rounded-xl",
            aspect === "9:16" ? "aspect-[9/16]" : "aspect-video",
            videoMaxWidth,
          )}
        >
          <iframe
            src={videoEmbed}
            title={`Testimonial — ${item.author || "video"}`}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            className="h-full w-full border-0"
          />
        </div>
      ) : null}

      {item.quote ? (
        <blockquote className="text-base leading-relaxed">
          &ldquo;{item.quote}&rdquo;
        </blockquote>
      ) : null}

      {item.author ? (
        <figcaption
          className={cn(
            "flex items-center gap-3",
            item.quote || videoEmbed ? "mt-4" : "",
            // Push attribution to bottom in grid mode for vertical alignment
            "mt-auto",
          )}
        >
          {item.avatar_url && !videoEmbed ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={item.avatar_url}
              alt=""
              className="size-10 rounded-full object-cover"
            />
          ) : !videoEmbed ? (
            <div className="bg-muted text-muted-foreground flex size-10 items-center justify-center rounded-full text-xs font-semibold">
              {(item.author ?? "?").slice(0, 2).toUpperCase()}
            </div>
          ) : null}
          <div className="text-sm">
            <p className="font-medium">{item.author}</p>
            {item.role ? (
              <p className="text-muted-foreground text-xs">{item.role}</p>
            ) : null}
          </div>
        </figcaption>
      ) : null}
    </figure>
  );
}

function FeaturesBlock({ block }: { block: RendererBlock }) {
  const cfg = block.config as FeaturesConfig;
  const items = (cfg?.items ?? []).filter((i) => i.title);
  if (items.length === 0) return null;
  return (
    <section className="w-full space-y-6">
      {cfg.heading ? (
        <div className="space-y-2 text-center">
          <h2 className="text-2xl font-semibold tracking-tight sm:text-3xl">
            {cfg.heading}
          </h2>
          {cfg.subheading ? (
            <p className="text-muted-foreground mx-auto max-w-2xl text-sm sm:text-base">
              {cfg.subheading}
            </p>
          ) : null}
        </div>
      ) : null}
      <div
        className={cn(
          "grid gap-4 sm:gap-6",
          items.length >= 3 ? "sm:grid-cols-2 md:grid-cols-3" : "sm:grid-cols-2",
        )}
      >
        {items.map((item, i) => (
          <div
            key={i}
            className="border-border bg-background rounded-xl border p-5"
          >
            {item.icon ? (
              <div className="mb-3 text-2xl">{item.icon}</div>
            ) : null}
            <h3 className="text-sm font-semibold">{item.title}</h3>
            {item.description ? (
              <p className="text-muted-foreground mt-1 text-sm">
                {item.description}
              </p>
            ) : null}
          </div>
        ))}
      </div>
    </section>
  );
}

function CtaBlock({ block }: { block: RendererBlock }) {
  const cfg = block.config as CtaConfig;
  if (!cfg?.heading || !cfg?.button_text || !cfg?.button_url) return null;
  return (
    <section className="bg-foreground text-background w-full rounded-2xl px-6 py-10 text-center sm:px-12 sm:py-14">
      <h2 className="text-2xl font-semibold tracking-tight sm:text-3xl">
        {cfg.heading}
      </h2>
      {cfg.subheading ? (
        <p className="mx-auto mt-3 max-w-xl text-sm opacity-80 sm:text-base">
          {cfg.subheading}
        </p>
      ) : null}
      <div className="mt-6">
        <a
          href={cfg.button_url}
          onClick={() => fireTrackClick(block.id)}
          target="_blank"
          rel="noopener noreferrer"
          className="bg-background text-foreground inline-flex h-11 items-center rounded-xl px-5 text-sm font-medium transition-opacity hover:opacity-90"
        >
          {cfg.button_text}
        </a>
      </div>
    </section>
  );
}

function FaqBlock({ block }: { block: RendererBlock }) {
  const cfg = block.config as FaqConfig;
  const items = (cfg?.items ?? []).filter((i) => i.question);
  if (items.length === 0) return null;
  return (
    <section className="w-full space-y-6">
      {cfg.heading ? (
        <h2 className="text-center text-2xl font-semibold tracking-tight sm:text-3xl">
          {cfg.heading}
        </h2>
      ) : null}
      <div className="border-border bg-background mx-auto w-full max-w-3xl divide-y rounded-xl border">
        {items.map((item, i) => (
          <details key={i} className="group p-5">
            <summary className="flex cursor-pointer items-center justify-between gap-4 text-sm font-medium [&::-webkit-details-marker]:hidden">
              <span>{item.question}</span>
              <span
                className="text-muted-foreground transition-transform group-open:rotate-45"
                aria-hidden
              >
                +
              </span>
            </summary>
            {item.answer ? (
              <p className="text-muted-foreground mt-3 text-sm whitespace-pre-line">
                {item.answer}
              </p>
            ) : null}
          </details>
        ))}
      </div>
    </section>
  );
}

function PricingBlock({ block }: { block: RendererBlock }) {
  const cfg = block.config as PricingConfig;
  const tiers = (cfg?.tiers ?? []).filter((t) => t.name);
  if (tiers.length === 0) return null;
  return (
    <section className="w-full space-y-6">
      {cfg.heading ? (
        <div className="space-y-2 text-center">
          <h2 className="text-2xl font-semibold tracking-tight sm:text-3xl">
            {cfg.heading}
          </h2>
          {cfg.subheading ? (
            <p className="text-muted-foreground mx-auto max-w-2xl text-sm sm:text-base">
              {cfg.subheading}
            </p>
          ) : null}
        </div>
      ) : null}
      <div
        className={cn(
          "grid gap-4 sm:gap-6",
          tiers.length >= 3 ? "sm:grid-cols-3" : "sm:grid-cols-2",
        )}
      >
        {tiers.map((tier, i) => (
          <div
            key={i}
            className={cn(
              "rounded-2xl border p-6 transition-shadow",
              tier.highlighted
                ? "border-foreground bg-foreground text-background shadow-lg"
                : "border-border bg-background",
            )}
          >
            <h3 className="text-sm font-semibold">{tier.name}</h3>
            <p className="mt-2 text-3xl font-semibold tracking-tight">
              {tier.price}
            </p>
            {tier.description ? (
              <p
                className={cn(
                  "mt-2 text-sm",
                  tier.highlighted ? "opacity-80" : "text-muted-foreground",
                )}
              >
                {tier.description}
              </p>
            ) : null}
            {tier.features && tier.features.length > 0 ? (
              <ul className="mt-4 space-y-2 text-sm">
                {tier.features.map((f, j) => (
                  <li key={j} className="flex items-start gap-2">
                    <span aria-hidden>✓</span>
                    <span>{f}</span>
                  </li>
                ))}
              </ul>
            ) : null}
            {tier.cta_text && tier.cta_url ? (
              <a
                href={tier.cta_url}
                onClick={() => fireTrackClick(block.id)}
                target="_blank"
                rel="noopener noreferrer"
                className={cn(
                  "mt-6 inline-flex h-10 w-full items-center justify-center rounded-md text-sm font-medium transition-opacity hover:opacity-90",
                  tier.highlighted
                    ? "bg-background text-foreground"
                    : "bg-foreground text-background",
                )}
              >
                {tier.cta_text}
              </a>
            ) : null}
          </div>
        ))}
      </div>
    </section>
  );
}

function StatsBlock({ block }: { block: RendererBlock }) {
  const cfg = block.config as StatsConfig;
  const items = (cfg?.items ?? []).filter((i) => i.value || i.label);
  if (items.length === 0) return null;
  return (
    <section className="w-full space-y-6">
      {cfg.heading ? (
        <h2 className="text-center text-2xl font-semibold tracking-tight sm:text-3xl">
          {cfg.heading}
        </h2>
      ) : null}
      <div
        className={cn(
          "grid gap-4 text-center sm:gap-6",
          items.length >= 4
            ? "grid-cols-2 sm:grid-cols-4"
            : items.length === 3
              ? "grid-cols-1 sm:grid-cols-3"
              : "grid-cols-2",
        )}
      >
        {items.map((item, i) => (
          <div
            key={i}
            className="border-border bg-background rounded-xl border p-5"
          >
            <p className="text-3xl font-semibold tabular-nums tracking-tight sm:text-4xl">
              {item.value}
            </p>
            <p className="text-muted-foreground mt-1 text-xs uppercase tracking-wide">
              {item.label}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}

// Standalone CTA button. Uniform styling so creators can drop multiple
// across a page without each looking different. Distinct from `cta`
// (full dark band) and `link` (bio outline pill).
function ButtonBlock({ block }: { block: RendererBlock }) {
  const cfg = block.config as ButtonConfig;
  if (!cfg?.text || !cfg?.url) return null;

  const align = cfg.align ?? "center";
  const isPrimary = (cfg.style ?? "primary") === "primary";

  const justify =
    align === "left" ? "justify-start" : align === "right" ? "justify-end" : "justify-center";

  return (
    <div className={cn("flex w-full", justify)}>
      <a
        href={cfg.url}
        onClick={() => fireTrackClick(block.id)}
        target="_blank"
        rel="noopener noreferrer"
        className={cn(
          "inline-flex h-11 items-center rounded-xl px-6 text-sm font-medium transition-opacity hover:opacity-90",
          isPrimary
            ? "bg-foreground text-background shadow-sm"
            : "border-border bg-background text-foreground border shadow-sm",
        )}
      >
        {cfg.text}
      </a>
    </div>
  );
}

// Generic iframe embed. Uniform styling — rounded card with border —
// so any third-party embed (Calendly, Substack, Tally, Twitter, etc.)
// looks like it belongs on the page.
function EmbedBlock({ block }: { block: RendererBlock }) {
  const cfg = block.config as EmbedConfig;
  if (!cfg?.url) return null;

  const aspect = cfg.aspect ?? "16:9";
  const aspectClass =
    aspect === "9:16"
      ? "aspect-[9/16]"
      : aspect === "1:1"
        ? "aspect-square"
        : aspect === "4:3"
          ? "aspect-[4/3]"
          : aspect === "auto"
            ? ""
            : "aspect-video";

  // For "auto" aspect, fall back to a sensible fixed pixel height.
  const fixedHeightStyle =
    aspect === "auto" ? { height: cfg.height ?? 720 } : undefined;

  // Portrait embeds cap at a narrower width.
  const widthCap =
    aspect === "9:16" ? "max-w-[360px]" : aspect === "1:1" ? "max-w-xl" : "max-w-4xl";

  return (
    <div
      className={cn(
        "border-border mx-auto w-full overflow-hidden rounded-xl border bg-white shadow-sm",
        widthCap,
        aspectClass,
      )}
      style={fixedHeightStyle}
    >
      <iframe
        src={cfg.url}
        title={cfg.title ?? "Embedded content"}
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen"
        allowFullScreen
        loading="lazy"
        className="h-full w-full border-0"
      />
    </div>
  );
}

// Lead magnet — email gate + immediate download. Visitor enters email,
// gets subscribed to the creator's list (with double-opt-in via the
// existing /subscribe edge function), and immediately sees the download
// link as a button. The email confirmation still goes out so the
// subscriber list stays clean.
function LeadMagnetBlock({
  block,
  pageId,
}: {
  block: RendererBlock;
  pageId: string;
}) {
  const cfg = block.config as LeadMagnetConfig;
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [status, setStatus] = useState<
    "idle" | "submitting" | "success" | "error"
  >("idle");
  const [errorMsg, setErrorMsg] = useState("");

  // Heading + download_url are required for the block to make sense.
  // If a lead_magnet_id is set, the server-side resolver should have
  // filled these in already — see resolveLeadMagnets in the public
  // page route.
  if (!cfg?.heading || !cfg?.download_url) return null;

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (status === "submitting") return;
    setStatus("submitting");
    setErrorMsg("");
    try {
      const res = await fetch(`${SUPABASE_URL}/functions/v1/subscribe`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          apikey: SUPABASE_ANON_KEY,
        },
        body: JSON.stringify({
          email: email.trim(),
          name: name.trim() || undefined,
          page_id: pageId,
          block_id: block.id,
          list_ids: cfg.list_ids,
        }),
      });
      const data = (await res.json().catch(() => ({}))) as {
        ok?: boolean;
        error?: string;
      };
      if (!res.ok || !data.ok) {
        throw new Error(data.error ?? "Could not sign you up right now.");
      }
      // Track-click as an attribution signal so creators can see the
      // download as a conversion event.
      fireTrackClick(block.id);
      setStatus("success");
    } catch (err) {
      setStatus("error");
      setErrorMsg(err instanceof Error ? err.message : "Something went wrong.");
    }
  }

  if (status === "success") {
    return (
      <div className="border-border bg-background mx-auto w-full max-w-xl rounded-2xl border p-6 text-center shadow-sm sm:p-8">
        <p className="text-base font-semibold sm:text-lg">
          You&apos;re in. {cfg.file_label ? `Here's your ${cfg.file_label}:` : "Here's your download:"}
        </p>
        <a
          href={cfg.download_url}
          target="_blank"
          rel="noopener noreferrer"
          onClick={() => fireTrackClick(block.id)}
          className="bg-foreground text-background mt-4 inline-flex h-11 items-center rounded-xl px-5 text-sm font-medium shadow-sm transition-opacity hover:opacity-90"
        >
          Download {cfg.file_label || "now"}
        </a>
        <p className="text-muted-foreground mt-4 text-xs">
          We also sent a copy to your inbox — check your email to confirm
          your subscription.
        </p>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="border-border bg-background mx-auto flex w-full max-w-xl flex-col gap-3 rounded-2xl border p-6 shadow-sm sm:p-8"
    >
      <div className="space-y-1.5 text-center">
        <p className="text-base font-semibold sm:text-lg">{cfg.heading}</p>
        {cfg.description ? (
          <p className="text-muted-foreground text-sm">{cfg.description}</p>
        ) : null}
      </div>
      <input
        type="text"
        name="name"
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="Your name (optional)"
        autoComplete="name"
        className="border-border bg-background h-10 rounded-md border px-3 text-sm outline-none focus:ring-2 focus:ring-black/20"
      />
      <input
        type="email"
        name="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="you@example.com"
        autoComplete="email"
        required
        className="border-border bg-background h-10 rounded-md border px-3 text-sm outline-none focus:ring-2 focus:ring-black/20"
      />
      <button
        type="submit"
        disabled={status === "submitting"}
        className="bg-foreground text-background mt-1 h-11 rounded-md text-sm font-medium transition-opacity hover:opacity-90 disabled:opacity-50"
      >
        {status === "submitting"
          ? "Sending…"
          : (cfg.button_text ?? `Send me ${cfg.file_label || "the link"}`)}
      </button>
      {errorMsg ? (
        <p className="text-destructive text-center text-xs" role="alert">
          {errorMsg}
        </p>
      ) : null}
    </form>
  );
}

// ─── Form (Typeform-style) ──────────────────────────────────────────────

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

function FormBlock({
  block,
  pageId,
}: {
  block: RendererBlock;
  pageId: string;
}) {
  const cfg = block.config as FormConfig;
  const questions = (cfg?.questions ?? []).filter(
    (q) => q && q.id && q.label,
  );

  // Local answer state, keyed by question id. Strings for everything
  // except multi_choice (string[]) and number (string in input, parsed
  // on submit).
  type AnswerValue = string | string[];
  const [answers, setAnswers] = useState<Record<string, AnswerValue>>({});
  const [step, setStep] = useState(0);
  const [status, setStatus] = useState<
    "idle" | "submitting" | "success" | "error"
  >("idle");
  const [errorMsg, setErrorMsg] = useState("");
  const [submittedAt, setSubmittedAt] = useState<number | null>(null);

  if (questions.length === 0 || !cfg?.heading) {
    // Editor placeholder rather than nothing — helps creators see the
    // block exists even when empty.
    return (
      <div className="border-border bg-background mx-auto w-full max-w-xl rounded-2xl border p-6 text-center text-sm shadow-sm sm:p-8">
        <p className="text-muted-foreground">
          {cfg?.heading || "Form"}
        </p>
        <p className="text-muted-foreground mt-2 text-xs">
          {questions.length === 0
            ? "Add at least one question in the editor."
            : "Add a heading in the editor."}
        </p>
      </div>
    );
  }

  // Auto-redirect after 1.5s if a redirect_url is set, so the visitor
  // sees the thank-you message briefly before being sent off.
  if (status === "success" && cfg.redirect_url && submittedAt) {
    if (typeof window !== "undefined") {
      const elapsed = Date.now() - submittedAt;
      const delay = Math.max(0, 1500 - elapsed);
      window.setTimeout(() => {
        window.location.href = cfg.redirect_url!;
      }, delay);
    }
  }

  const layout = cfg.layout ?? "stepped";
  const isStepped = layout === "stepped";

  function setAnswer(qid: string, value: AnswerValue) {
    setAnswers((prev) => ({ ...prev, [qid]: value }));
  }

  function validate(qs: FormQuestion[]): string | null {
    for (const q of qs) {
      const v = answers[q.id];
      const hasValue = Array.isArray(v) ? v.length > 0 : !!(v && v.trim());
      if (q.required && !hasValue) {
        return `"${q.label}" is required.`;
      }
      if (q.type === "email" && hasValue && typeof v === "string") {
        if (!EMAIL_RE.test(v.trim())) return `"${q.label}" must be a valid email.`;
      }
      if (q.type === "url" && hasValue && typeof v === "string") {
        try {
          new URL(v);
        } catch {
          return `"${q.label}" must be a valid URL.`;
        }
      }
      if (q.type === "number" && hasValue && typeof v === "string") {
        if (Number.isNaN(Number(v))) {
          return `"${q.label}" must be a number.`;
        }
      }
    }
    return null;
  }

  async function submitAll() {
    const err = validate(questions);
    if (err) {
      setErrorMsg(err);
      setStatus("error");
      return;
    }

    // Find email from any email-type question (the first one wins).
    const emailQ = questions.find((q) => q.type === "email");
    const emailValue = emailQ
      ? (answers[emailQ.id] as string | undefined)
      : undefined;
    if (!emailQ || !emailValue) {
      setErrorMsg(
        "This form is missing an email field — ask the creator to add one.",
      );
      setStatus("error");
      return;
    }

    const nameQ = questions.find((q) => q.type === "name");
    const nameValue = nameQ
      ? (answers[nameQ.id] as string | undefined)
      : undefined;

    setStatus("submitting");
    setErrorMsg("");

    const payload = {
      email: emailValue.trim(),
      name: nameValue?.trim() || undefined,
      page_id: pageId,
      block_id: block.id,
      list_ids: cfg.list_ids,
      answers: questions.map((q) => {
        const raw = answers[q.id];
        let value: unknown = raw ?? null;
        if (q.type === "number" && typeof raw === "string" && raw.trim()) {
          const n = Number(raw);
          value = Number.isFinite(n) ? n : null;
        }
        return {
          question_id: q.id,
          label: q.label,
          type: q.type,
          value,
        };
      }),
    };

    try {
      const res = await fetch(
        `${SUPABASE_URL}/functions/v1/submit-form`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            apikey: SUPABASE_ANON_KEY,
          },
          body: JSON.stringify(payload),
        },
      );
      const data = (await res.json().catch(() => ({}))) as {
        ok?: boolean;
        error?: string;
      };
      if (!res.ok || !data.ok) {
        throw new Error(data.error ?? "Could not submit the form.");
      }
      fireTrackClick(block.id);
      setStatus("success");
      setSubmittedAt(Date.now());
    } catch (err) {
      setStatus("error");
      setErrorMsg(
        err instanceof Error ? err.message : "Something went wrong.",
      );
    }
  }

  // ── Success state ──
  if (status === "success") {
    return (
      <div className="border-border bg-background mx-auto w-full max-w-xl rounded-2xl border p-6 text-center shadow-sm sm:p-8">
        <p className="text-base font-semibold sm:text-lg">
          {cfg.thank_you_heading || "Thanks — we got your answers."}
        </p>
        {cfg.thank_you_message ? (
          <p className="text-muted-foreground mt-2 text-sm">
            {cfg.thank_you_message}
          </p>
        ) : null}
        {cfg.redirect_url ? (
          <p className="text-muted-foreground mt-4 text-xs">
            Redirecting…
          </p>
        ) : null}
      </div>
    );
  }

  // ── Stepped UI: one question per screen ──
  if (isStepped) {
    const current = questions[step];
    const isLast = step === questions.length - 1;
    const onNext = () => {
      const err = validate([current]);
      if (err) {
        setErrorMsg(err);
        return;
      }
      setErrorMsg("");
      if (isLast) {
        submitAll();
      } else {
        setStep((s) => s + 1);
      }
    };
    return (
      <div className="border-border bg-background mx-auto w-full max-w-xl rounded-2xl border p-6 shadow-sm sm:p-8">
        {/* Progress + heading */}
        <div className="space-y-2">
          {step === 0 && cfg.heading ? (
            <p className="text-lg font-semibold sm:text-xl">{cfg.heading}</p>
          ) : null}
          {step === 0 && cfg.description ? (
            <p className="text-muted-foreground text-sm">{cfg.description}</p>
          ) : null}
          <div className="flex items-center gap-3">
            <div className="bg-muted h-1 flex-1 overflow-hidden rounded-full">
              <div
                className="bg-foreground h-full transition-all"
                style={{
                  width: `${((step + 1) / questions.length) * 100}%`,
                }}
              />
            </div>
            <span className="text-muted-foreground text-xs tabular-nums">
              {step + 1} / {questions.length}
            </span>
          </div>
        </div>

        <div className="mt-6">
          <QuestionField
            question={current}
            value={answers[current.id]}
            onChange={(v) => setAnswer(current.id, v)}
          />
        </div>

        {errorMsg ? (
          <p className="text-destructive mt-3 text-xs" role="alert">
            {errorMsg}
          </p>
        ) : null}

        <div className="mt-6 flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={() => {
              setErrorMsg("");
              setStep((s) => Math.max(0, s - 1));
            }}
            disabled={step === 0}
            className="text-muted-foreground hover:text-foreground inline-flex h-10 items-center gap-1 rounded-md px-3 text-sm transition-colors disabled:opacity-30"
          >
            ← Back
          </button>
          <button
            type="button"
            onClick={onNext}
            disabled={status === "submitting"}
            className="bg-foreground text-background inline-flex h-11 items-center rounded-xl px-5 text-sm font-medium transition-opacity hover:opacity-90 disabled:opacity-50"
          >
            {status === "submitting"
              ? "Submitting…"
              : isLast
                ? cfg.submit_text || "Submit"
                : "Next →"}
          </button>
        </div>
      </div>
    );
  }

  // ── Single-page UI: all questions at once ──
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        submitAll();
      }}
      className="border-border bg-background mx-auto w-full max-w-xl space-y-5 rounded-2xl border p-6 shadow-sm sm:p-8"
    >
      <div className="space-y-2 text-center">
        <p className="text-lg font-semibold sm:text-xl">{cfg.heading}</p>
        {cfg.description ? (
          <p className="text-muted-foreground text-sm">{cfg.description}</p>
        ) : null}
      </div>
      <div className="space-y-4">
        {questions.map((q) => (
          <QuestionField
            key={q.id}
            question={q}
            value={answers[q.id]}
            onChange={(v) => setAnswer(q.id, v)}
          />
        ))}
      </div>
      {errorMsg ? (
        <p className="text-destructive text-center text-xs" role="alert">
          {errorMsg}
        </p>
      ) : null}
      <button
        type="submit"
        disabled={status === "submitting"}
        className="bg-foreground text-background h-11 w-full rounded-xl text-sm font-medium transition-opacity hover:opacity-90 disabled:opacity-50"
      >
        {status === "submitting"
          ? "Submitting…"
          : cfg.submit_text || "Submit"}
      </button>
    </form>
  );
}

function QuestionField({
  question: q,
  value,
  onChange,
}: {
  question: FormQuestion;
  value: string | string[] | undefined;
  onChange: (v: string | string[]) => void;
}) {
  const labelEl = (
    <div className="space-y-1">
      <label
        htmlFor={q.id}
        className="block text-sm font-medium"
      >
        {q.label}
        {q.required ? (
          <span className="text-destructive ml-0.5">*</span>
        ) : null}
      </label>
      {q.description ? (
        <p className="text-muted-foreground text-xs">{q.description}</p>
      ) : null}
    </div>
  );

  const inputClass =
    "border-border bg-background w-full rounded-md border px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-black/20";

  switch (q.type) {
    case "long_text":
      return (
        <div className="space-y-2">
          {labelEl}
          <textarea
            id={q.id}
            rows={4}
            value={(value as string) ?? ""}
            onChange={(e) => onChange(e.target.value)}
            placeholder={q.placeholder}
            className={inputClass}
          />
        </div>
      );

    case "choice": {
      const opts = q.options ?? [];
      return (
        <fieldset className="space-y-2">
          <legend>{labelEl}</legend>
          <div className="space-y-1.5">
            {opts.map((opt) => (
              <label
                key={opt}
                className="border-border hover:bg-muted/50 flex cursor-pointer items-center gap-2 rounded-md border p-2.5 text-sm"
              >
                <input
                  type="radio"
                  name={q.id}
                  value={opt}
                  checked={value === opt}
                  onChange={() => onChange(opt)}
                />
                <span>{opt}</span>
              </label>
            ))}
          </div>
        </fieldset>
      );
    }

    case "multi_choice": {
      const opts = q.options ?? [];
      const selected = (Array.isArray(value) ? value : []) as string[];
      return (
        <fieldset className="space-y-2">
          <legend>{labelEl}</legend>
          <div className="space-y-1.5">
            {opts.map((opt) => (
              <label
                key={opt}
                className="border-border hover:bg-muted/50 flex cursor-pointer items-center gap-2 rounded-md border p-2.5 text-sm"
              >
                <input
                  type="checkbox"
                  name={q.id}
                  value={opt}
                  checked={selected.includes(opt)}
                  onChange={() => {
                    if (selected.includes(opt)) {
                      onChange(selected.filter((s) => s !== opt));
                    } else {
                      onChange([...selected, opt]);
                    }
                  }}
                />
                <span>{opt}</span>
              </label>
            ))}
          </div>
        </fieldset>
      );
    }

    case "number":
      return (
        <div className="space-y-2">
          {labelEl}
          <input
            id={q.id}
            type="number"
            value={(value as string) ?? ""}
            onChange={(e) => onChange(e.target.value)}
            placeholder={q.placeholder}
            className={inputClass}
          />
        </div>
      );

    case "url":
      return (
        <div className="space-y-2">
          {labelEl}
          <input
            id={q.id}
            type="url"
            value={(value as string) ?? ""}
            onChange={(e) => onChange(e.target.value)}
            placeholder={q.placeholder ?? "https://"}
            className={inputClass}
          />
        </div>
      );

    case "email":
      return (
        <div className="space-y-2">
          {labelEl}
          <input
            id={q.id}
            type="email"
            autoComplete="email"
            value={(value as string) ?? ""}
            onChange={(e) => onChange(e.target.value)}
            placeholder={q.placeholder ?? "you@example.com"}
            className={inputClass}
          />
        </div>
      );

    case "name":
      return (
        <div className="space-y-2">
          {labelEl}
          <input
            id={q.id}
            type="text"
            autoComplete="name"
            value={(value as string) ?? ""}
            onChange={(e) => onChange(e.target.value)}
            placeholder={q.placeholder ?? "Your name"}
            className={inputClass}
          />
        </div>
      );

    case "short_text":
    default:
      return (
        <div className="space-y-2">
          {labelEl}
          <input
            id={q.id}
            type="text"
            value={(value as string) ?? ""}
            onChange={(e) => onChange(e.target.value)}
            placeholder={q.placeholder}
            className={inputClass}
          />
        </div>
      );
  }
}
