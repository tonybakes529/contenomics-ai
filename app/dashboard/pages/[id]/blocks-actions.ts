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
