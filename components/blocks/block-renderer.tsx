"use client";

import { useMemo, useState } from "react";
import { cn } from "@/lib/utils";
import {
  toEmbedUrl,
  type EmailFormConfig,
  type HeaderConfig,
  type ImageConfig,
  type LinkConfig,
  type ProductConfig,
  type SocialIconsConfig,
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
}: {
  blocks: RendererBlock[];
  pageId: string;
}) {
  return (
    <div className="flex w-full flex-col gap-3">
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
