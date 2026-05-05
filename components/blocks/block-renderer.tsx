"use client";

import { useMemo, useState } from "react";
import { cn } from "@/lib/utils";
import {
  toEmbedUrl,
  type CtaConfig,
  type EmailFormConfig,
  type FaqConfig,
  type FeaturesConfig,
  type HeaderConfig,
  type HeroConfig,
  type ImageConfig,
  type LinkConfig,
  type PricingConfig,
  type ProductConfig,
  type SocialIconsConfig,
  type StatsConfig,
  type TestimonialConfig,
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
  const gap = template === "landing" ? "gap-12 sm:gap-16" : "gap-3";
  return (
    <div className={cn("flex w-full flex-col", gap)}>
      {blocks.map((b) => (
        <BlockItem key={b.id} block={b} pageId={pageId} />
      ))}
    </div>
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
  return (
    <section
      className={cn(
        "w-full py-6 sm:py-12",
        align === "center" ? "text-center" : "text-left",
      )}
    >
      <div
        className={cn(
          "grid items-center gap-8 sm:gap-12",
          cfg.image_url && align !== "center" ? "sm:grid-cols-2" : "",
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
        {cfg.image_url ? (
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
  if (!cfg?.quote) return null;
  return (
    <figure className="border-border bg-background w-full rounded-2xl border p-6 shadow-sm sm:p-8">
      <blockquote className="text-base leading-relaxed sm:text-lg">
        &ldquo;{cfg.quote}&rdquo;
      </blockquote>
      <figcaption className="mt-4 flex items-center gap-3">
        {cfg.avatar_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={cfg.avatar_url}
            alt=""
            className="size-10 rounded-full object-cover"
          />
        ) : (
          <div className="bg-muted text-muted-foreground flex size-10 items-center justify-center rounded-full text-xs font-semibold">
            {(cfg.author ?? "?").slice(0, 2).toUpperCase()}
          </div>
        )}
        <div className="text-sm">
          <p className="font-medium">{cfg.author}</p>
          {cfg.role ? (
            <p className="text-muted-foreground text-xs">{cfg.role}</p>
          ) : null}
        </div>
      </figcaption>
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
