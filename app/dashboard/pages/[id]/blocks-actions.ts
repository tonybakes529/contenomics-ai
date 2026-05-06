"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import type { Json } from "@/lib/types/database";

const VALID_TYPES = [
  "link",
  "header",
  "text",
  "email_form",
  "video_embed",
  "social_icons",
  "image",
  "divider",
  "product",
  "hero",
  "testimonial",
  "features",
  "cta",
  "faq",
  "pricing",
  "stats",
  "button",
  "embed",
] as const;
type BlockType = (typeof VALID_TYPES)[number];

const KNOWN_PLATFORMS = [
  "youtube",
  "twitter",
  "instagram",
  "tiktok",
  "github",
  "linkedin",
  "twitch",
  "facebook",
  "website",
];

function defaultConfig(type: BlockType): Json {
  switch (type) {
    case "link":
      return { url: "", text: "Link" } as Json;
    case "header":
      return { text: "Section heading" } as Json;
    case "text":
      return { text: "" } as Json;
    case "email_form":
      return {
        heading: "Join my newsletter",
        button_text: "Subscribe",
      } as Json;
    case "video_embed":
      return { url: "" } as Json;
    case "social_icons":
      return { platforms: [] } as Json;
    case "image":
      return { url: "", alt: "" } as Json;
    case "divider":
      return {} as Json;
    case "product":
      return { url: "", title: "" } as Json;
    case "hero":
      return {
        heading: "Headline that earns the click",
        subheading: "One sentence on what you do and who it's for.",
        cta_text: "",
        cta_url: "",
        align: "center",
      } as Json;
    case "testimonial":
      return {
        quote: "",
        author: "",
        role: "",
      } as Json;
    case "features":
      return {
        heading: "What you get",
        items: [],
      } as Json;
    case "cta":
      return {
        heading: "Ready to start?",
        button_text: "Get started",
        button_url: "",
      } as Json;
    case "faq":
      return {
        heading: "Frequently asked questions",
        items: [],
      } as Json;
    case "pricing":
      return {
        heading: "Simple pricing",
        tiers: [],
      } as Json;
    case "stats":
      return {
        heading: "",
        items: [],
      } as Json;
    case "button":
      return {
        text: "Book a call",
        url: "",
        style: "primary",
        align: "center",
      } as Json;
    case "embed":
      return {
        url: "",
        title: "",
        aspect: "16:9",
        height: 720,
      } as Json;
  }
}

function configFromFormData(type: BlockType, fd: FormData): Json {
  const get = (k: string) => String(fd.get(k) ?? "").trim();
  switch (type) {
    case "link":
      return { url: get("url"), text: get("text") } as Json;
    case "header":
    case "text":
      return { text: get("text") } as Json;
    case "email_form":
      return {
        heading: get("heading") || undefined,
        description: get("description") || undefined,
        button_text: get("button_text") || undefined,
      } as Json;
    case "video_embed":
      return {
        url: get("url"),
        title: get("title") || undefined,
      } as Json;
    case "social_icons": {
      const platforms = KNOWN_PLATFORMS.map((p) => ({
        type: p,
        url: get(`platform_${p}`),
      })).filter((p) => p.url);
      return { platforms } as Json;
    }
    case "image":
      return { url: get("url"), alt: get("alt") || undefined } as Json;
    case "divider":
      return {} as Json;
    case "product":
      return {
        url: get("url"),
        title: get("title"),
        price: get("price") || undefined,
        image: get("image") || undefined,
      } as Json;

    case "hero":
      return {
        heading: get("heading"),
        subheading: get("subheading") || undefined,
        cta_text: get("cta_text") || undefined,
        cta_url: get("cta_url") || undefined,
        image_url: get("image_url") || undefined,
        video_url: get("video_url") || undefined,
        align: get("align") === "left" ? "left" : "center",
      } as Json;

    case "testimonial":
      return {
        quote: get("quote") || undefined,
        author: get("author"),
        role: get("role") || undefined,
        avatar_url: get("avatar_url") || undefined,
        video_url: get("video_url") || undefined,
        video_aspect:
          get("video_aspect") === "9:16" ? "9:16" : "16:9",
      } as Json;

    case "features": {
      const items: { title: string; description?: string; icon?: string }[] = [];
      // The form supplies a hidden feature_count so we know exactly how
      // many slots to read (dynamic add/remove). Cap at a sane maximum
      // to defend against absurd payloads.
      const rawCount = parseInt(get("feature_count") || "0", 10);
      const count = Number.isFinite(rawCount)
        ? Math.min(Math.max(rawCount, 0), 50)
        : 0;
      for (let i = 0; i < count; i++) {
        const title = get(`feature_title_${i}`);
        if (!title) continue;
        items.push({
          title,
          description: get(`feature_description_${i}`) || undefined,
          icon: get(`feature_icon_${i}`) || undefined,
        });
      }
      return {
        heading: get("heading") || undefined,
        subheading: get("subheading") || undefined,
        items,
      } as Json;
    }

    case "cta":
      return {
        heading: get("heading"),
        subheading: get("subheading") || undefined,
        button_text: get("button_text") || "Get started",
        button_url: get("button_url"),
      } as Json;

    case "faq": {
      const items: { question: string; answer: string }[] = [];
      for (let i = 0; i < 5; i++) {
        const question = get(`faq_question_${i}`);
        if (!question) continue;
        items.push({
          question,
          answer: get(`faq_answer_${i}`),
        });
      }
      return {
        heading: get("heading") || undefined,
        items,
      } as Json;
    }

    case "pricing": {
      const tiers: {
        name: string;
        price: string;
        description?: string;
        features?: string[];
        cta_text?: string;
        cta_url?: string;
        highlighted?: boolean;
      }[] = [];
      for (let i = 0; i < 3; i++) {
        const name = get(`tier_name_${i}`);
        if (!name) continue;
        const featuresText = get(`tier_features_${i}`);
        const features = featuresText
          .split(/\r?\n/)
          .map((s) => s.trim())
          .filter(Boolean);
        tiers.push({
          name,
          price: get(`tier_price_${i}`),
          description: get(`tier_description_${i}`) || undefined,
          features: features.length > 0 ? features : undefined,
          cta_text: get(`tier_cta_text_${i}`) || undefined,
          cta_url: get(`tier_cta_url_${i}`) || undefined,
          highlighted: fd.get(`tier_highlighted_${i}`) === "on",
        });
      }
      return {
        heading: get("heading") || undefined,
        subheading: get("subheading") || undefined,
        tiers,
      } as Json;
    }

    case "stats": {
      const items: { value: string; label: string }[] = [];
      for (let i = 0; i < 4; i++) {
        const value = get(`stat_value_${i}`);
        const label = get(`stat_label_${i}`);
        if (!value && !label) continue;
        items.push({ value, label });
      }
      return {
        heading: get("heading") || undefined,
        items,
      } as Json;
    }

    case "button":
      return {
        text: get("text") || "Book a call",
        url: get("url"),
        style: get("style") === "outline" ? "outline" : "primary",
        align:
          get("align") === "left"
            ? "left"
            : get("align") === "right"
              ? "right"
              : "center",
      } as Json;

    case "embed": {
      const aspect = get("aspect");
      const validAspects = ["16:9", "9:16", "1:1", "4:3", "auto"];
      const heightStr = get("height");
      const heightNum = parseInt(heightStr, 10);
      return {
        url: get("url"),
        title: get("title") || undefined,
        aspect: validAspects.includes(aspect) ? aspect : "16:9",
        height: Number.isFinite(heightNum) ? heightNum : undefined,
      } as Json;
    }
  }
}

async function requireUser(pageId: string) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect(`/login?next=/dashboard/pages/${pageId}`);

  // Verify the page belongs to the user (defense in depth — RLS also enforces).
  const { data: page } = await supabase
    .from("pages")
    .select("id")
    .eq("id", pageId)
    .eq("profile_id", user.id)
    .maybeSingle();
  if (!page) redirect("/dashboard/pages");

  return { supabase, user };
}

export async function createBlock(pageId: string, formData: FormData) {
  const { supabase } = await requireUser(pageId);

  const type = String(formData.get("type") ?? "");
  if (!VALID_TYPES.includes(type as BlockType)) {
    redirect(
      `/dashboard/pages/${pageId}?error=${encodeURIComponent(
        "Unknown block type",
      )}`,
    );
  }

  // Place new block at the end.
  const { data: maxRow } = await supabase
    .from("blocks")
    .select("position")
    .eq("page_id", pageId)
    .order("position", { ascending: false })
    .limit(1)
    .maybeSingle();
  const nextPos = (maxRow?.position ?? 0) + 1;

  const { error } = await supabase.from("blocks").insert({
    page_id: pageId,
    type: type as BlockType,
    position: nextPos,
    config: defaultConfig(type as BlockType),
    is_visible: true,
  });

  if (error) {
    redirect(
      `/dashboard/pages/${pageId}?error=${encodeURIComponent(error.message)}`,
    );
  }

  revalidatePath(`/dashboard/pages/${pageId}`);
  revalidatePath("/[username]", "page");
}

export async function updateBlock(
  pageId: string,
  blockId: string,
  formData: FormData,
) {
  const { supabase } = await requireUser(pageId);

  const type = String(formData.get("type") ?? "");
  if (!VALID_TYPES.includes(type as BlockType)) {
    redirect(
      `/dashboard/pages/${pageId}?error=${encodeURIComponent(
        "Unknown block type",
      )}`,
    );
  }

  const config = configFromFormData(type as BlockType, formData);
  const isVisible = formData.get("is_visible") !== "off";

  const { error } = await supabase
    .from("blocks")
    .update({ config, is_visible: isVisible })
    .eq("id", blockId)
    .eq("page_id", pageId);

  if (error) {
    redirect(
      `/dashboard/pages/${pageId}?error=${encodeURIComponent(error.message)}`,
    );
  }

  revalidatePath(`/dashboard/pages/${pageId}`);
  revalidatePath("/[username]", "page");
}

export async function toggleBlockVisibility(pageId: string, blockId: string) {
  const { supabase } = await requireUser(pageId);

  const { data: block } = await supabase
    .from("blocks")
    .select("is_visible")
    .eq("id", blockId)
    .eq("page_id", pageId)
    .maybeSingle();
  if (!block) return;

  await supabase
    .from("blocks")
    .update({ is_visible: !block.is_visible })
    .eq("id", blockId)
    .eq("page_id", pageId);

  revalidatePath(`/dashboard/pages/${pageId}`);
  revalidatePath("/[username]", "page");
}

export async function deleteBlock(pageId: string, blockId: string) {
  const { supabase } = await requireUser(pageId);

  const { error } = await supabase
    .from("blocks")
    .delete()
    .eq("id", blockId)
    .eq("page_id", pageId);

  if (error) {
    redirect(
      `/dashboard/pages/${pageId}?error=${encodeURIComponent(error.message)}`,
    );
  }

  revalidatePath(`/dashboard/pages/${pageId}`);
  revalidatePath("/[username]", "page");
}

// ─── Starter packs ──────────────────────────────────────────────────────

type StarterKind = "bio" | "landing";

function bioStarter(): { type: BlockType; config: Json }[] {
  return [
    {
      type: "header",
      config: { text: "👋 Welcome" } as Json,
    },
    {
      type: "link",
      config: {
        text: "Latest video",
        url: "https://youtube.com/@yourchannel",
      } as Json,
    },
    {
      type: "link",
      config: {
        text: "Subscribe on YouTube",
        url: "https://youtube.com/@yourchannel?sub_confirmation=1",
      } as Json,
    },
    {
      type: "email_form",
      config: {
        heading: "Join my list",
        description: "I send a short note when I publish something new.",
        button_text: "Subscribe",
      } as Json,
    },
    {
      type: "social_icons",
      config: {
        platforms: [
          { type: "youtube", url: "" },
          { type: "instagram", url: "" },
          { type: "twitter", url: "" },
        ],
      } as Json,
    },
  ];
}

function landingStarter(): { type: BlockType; config: Json }[] {
  return [
    {
      type: "hero",
      config: {
        heading: "The headline that earns the click",
        subheading:
          "One sentence on what you do and who it's for. Short and clear.",
        cta_text: "Get started",
        cta_url: "",
        align: "center",
      } as Json,
    },
    {
      type: "features",
      config: {
        heading: "What you get",
        items: [
          { title: "Feature one", description: "Explain the benefit, not the feature.", icon: "✨" },
          { title: "Feature two", description: "Make it about your audience.", icon: "🚀" },
          { title: "Feature three", description: "Concrete and short wins.", icon: "🎯" },
        ],
      } as Json,
    },
    {
      type: "testimonial",
      config: {
        quote: "This was easily the best decision I made this year.",
        author: "Real Person",
        role: "Their role / @handle",
      } as Json,
    },
    {
      type: "cta",
      config: {
        heading: "Ready when you are.",
        subheading: "Skip the waiting list — start today.",
        button_text: "Start now",
        button_url: "",
      } as Json,
    },
  ];
}

export async function seedStarterBlocks(
  pageId: string,
  kind: StarterKind,
) {
  const { supabase } = await requireUser(pageId);

  // Reject if the page already has blocks — starter packs are for empty pages.
  const { count } = await supabase
    .from("blocks")
    .select("id", { count: "exact", head: true })
    .eq("page_id", pageId);
  if ((count ?? 0) > 0) {
    redirect(
      `/dashboard/pages/${pageId}?error=${encodeURIComponent(
        "Starter packs are only for empty pages. Delete existing blocks first.",
      )}`,
    );
  }

  const starter = kind === "landing" ? landingStarter() : bioStarter();
  const rows = starter.map((b, i) => ({
    page_id: pageId,
    type: b.type,
    config: b.config,
    position: i + 1,
    is_visible: true,
  }));

  const { error } = await supabase.from("blocks").insert(rows);
  if (error) {
    redirect(
      `/dashboard/pages/${pageId}?error=${encodeURIComponent(error.message)}`,
    );
  }

  revalidatePath(`/dashboard/pages/${pageId}`);
  revalidatePath("/[username]", "page");
}

export async function moveBlock(
  pageId: string,
  blockId: string,
  direction: "up" | "down",
) {
  const { supabase } = await requireUser(pageId);

  const { data: blocks } = await supabase
    .from("blocks")
    .select("id, position")
    .eq("page_id", pageId)
    .order("position", { ascending: true });

  if (!blocks) return;

  const idx = blocks.findIndex((b) => b.id === blockId);
  if (idx === -1) return;

  const swapWith =
    direction === "up" ? blocks[idx - 1] : blocks[idx + 1];
  if (!swapWith) return;

  const me = blocks[idx];

  // Swap positions in two updates.
  await supabase
    .from("blocks")
    .update({ position: swapWith.position })
    .eq("id", me.id)
    .eq("page_id", pageId);
  await supabase
    .from("blocks")
    .update({ position: me.position })
    .eq("id", swapWith.id)
    .eq("page_id", pageId);

  revalidatePath(`/dashboard/pages/${pageId}`);
  revalidatePath("/[username]", "page");
}
