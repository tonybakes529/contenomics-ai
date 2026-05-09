"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import {
  VIEWTRACK_BACKGROUNDS,
  VIEWTRACK_COLOR_PALETTES,
  VIEWTRACK_FACE_EMOTIONS,
  VIEWTRACK_HOOK_STYLES,
  VIEWTRACK_PLATFORMS,
  VIEWTRACK_TITLE_STYLES,
  type ViewtrackVideoInsert,
} from "@/lib/types/database";

const VT_BUCKET = "viewtrack-thumbnails";

async function requireUser() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login?next=/dashboard/viewtrack");
  return { supabase, user };
}

function s(form: FormData, key: string): string | null {
  const raw = form.get(key);
  if (raw == null) return null;
  const trimmed = String(raw).trim();
  return trimmed === "" ? null : trimmed;
}

function n(form: FormData, key: string): number | null {
  const v = s(form, key);
  if (v == null) return null;
  const num = Number(v);
  return Number.isFinite(num) ? num : null;
}

// CTR / drop-off / engagement come in as "5" or "5%" — store as 0.05.
function pct(form: FormData, key: string): number | null {
  const v = s(form, key);
  if (v == null) return null;
  const cleaned = v.replace("%", "").trim();
  const num = Number(cleaned);
  if (!Number.isFinite(num)) return null;
  return num > 1 ? num / 100 : num;
}

function oneOf<T extends string>(
  form: FormData,
  key: string,
  allowed: readonly T[],
): T | null {
  const v = s(form, key);
  if (v == null) return null;
  return (allowed as readonly string[]).includes(v) ? (v as T) : null;
}

function buildPayload(
  form: FormData,
  profileId: string,
): ViewtrackVideoInsert {
  return {
    profile_id: profileId,
    // Identity
    video_external_id: s(form, "video_external_id"),
    date_posted: s(form, "date_posted"),
    final_title: s(form, "final_title"),
    video_url: s(form, "video_url"),
    length_text: s(form, "length_text"),
    topic: s(form, "topic"),
    platform:
      oneOf(form, "platform", VIEWTRACK_PLATFORMS) ?? "youtube",
    // Creative
    ab_title_1: s(form, "ab_title_1"),
    ab_title_2: s(form, "ab_title_2"),
    ab_title_3: s(form, "ab_title_3"),
    winning_title_num: (() => {
      const v = n(form, "winning_title_num");
      return v != null && v >= 1 && v <= 3 ? Math.round(v) : null;
    })(),
    winning_style: oneOf(form, "winning_style", VIEWTRACK_TITLE_STYLES),
    face_yn: (() => {
      const v = s(form, "face_yn");
      return v === "Y" || v === "N" ? v : null;
    })(),
    face_emotion: oneOf(form, "face_emotion", VIEWTRACK_FACE_EMOTIONS),
    word_count: (() => {
      const v = n(form, "word_count");
      return v != null ? Math.round(v) : null;
    })(),
    words_used: s(form, "words_used"),
    background: oneOf(form, "background", VIEWTRACK_BACKGROUNDS),
    color_palette: oneOf(form, "color_palette", VIEWTRACK_COLOR_PALETTES),
    hook_script: s(form, "hook_script"),
    hook_style: oneOf(form, "hook_style", VIEWTRACK_HOOK_STYLES),
    intro_length_sec: n(form, "intro_length_sec"),
    time_to_value_sec: n(form, "time_to_value_sec"),
    thumbnail_notes: s(form, "thumbnail_notes"),
    // Performance
    ctr_24h: pct(form, "ctr_24h"),
    ctr_7d: pct(form, "ctr_7d"),
    ctr_30d: pct(form, "ctr_30d"),
    drop_off_rate: pct(form, "drop_off_rate"),
    drop_off_timestamp: s(form, "drop_off_timestamp"),
    avd: s(form, "avd"),
    views_7d: (() => {
      const v = n(form, "views_7d");
      return v != null ? Math.round(v) : null;
    })(),
    views_30d: (() => {
      const v = n(form, "views_30d");
      return v != null ? Math.round(v) : null;
    })(),
    // Conversion
    ctas_used: s(form, "ctas_used"),
    click_throughs: (() => {
      const v = n(form, "click_throughs");
      return v != null ? Math.round(v) : null;
    })(),
    engagement_rate: pct(form, "engagement_rate"),
    calls_booked: (() => {
      const v = n(form, "calls_booked");
      return v != null ? Math.round(v) : null;
    })(),
    notes: s(form, "notes"),
  };
}

async function maybeUploadThumbnail(
  supabase: ReturnType<typeof createClient>,
  userId: string,
  videoId: string,
  file: File | null,
): Promise<{ url: string; path: string } | null> {
  if (!file || file.size === 0) return null;
  const ext = (file.name.split(".").pop() || "jpg").toLowerCase();
  const path = `${userId}/${videoId}.${ext}`;
  const { error } = await supabase.storage
    .from(VT_BUCKET)
    .upload(path, file, { upsert: true, cacheControl: "3600" });
  if (error) {
    console.error("[viewtrack] thumbnail upload failed", error);
    return null;
  }
  const {
    data: { publicUrl },
  } = supabase.storage.from(VT_BUCKET).getPublicUrl(path);
  return { url: `${publicUrl}?v=${Date.now()}`, path };
}

export async function createVideo(formData: FormData) {
  const { supabase, user } = await requireUser();
  const payload = buildPayload(formData, user.id);

  const { data: inserted, error } = await supabase
    .from("viewtrack_videos")
    .insert(payload)
    .select("id")
    .single();

  if (error || !inserted) {
    redirect(
      `/dashboard/viewtrack/identity?error=${encodeURIComponent(
        error?.message || "Failed to create video",
      )}`,
    );
  }

  // Optional thumbnail on create.
  const thumb = formData.get("thumbnail_file");
  if (thumb instanceof File && thumb.size > 0) {
    const result = await maybeUploadThumbnail(
      supabase,
      user.id,
      inserted.id,
      thumb,
    );
    if (result) {
      await supabase
        .from("viewtrack_videos")
        .update({
          thumbnail_url: result.url,
          thumbnail_path: result.path,
        })
        .eq("id", inserted.id);
    }
  }

  revalidatePath("/dashboard/viewtrack", "layout");
  redirect(`/dashboard/viewtrack/identity?selected=${inserted.id}&saved=1`);
}

export async function updateVideo(videoId: string, formData: FormData) {
  const { supabase, user } = await requireUser();

  const fullPayload = buildPayload(formData, user.id);
  // Don't overwrite profile_id on update (it's already correct via RLS).
  const updates = { ...fullPayload };
  delete (updates as Partial<typeof fullPayload>).profile_id;

  const thumb = formData.get("thumbnail_file");
  let thumbResult: { url: string; path: string } | null = null;
  if (thumb instanceof File && thumb.size > 0) {
    thumbResult = await maybeUploadThumbnail(supabase, user.id, videoId, thumb);
  }

  const { error } = await supabase
    .from("viewtrack_videos")
    .update({
      ...updates,
      ...(thumbResult
        ? { thumbnail_url: thumbResult.url, thumbnail_path: thumbResult.path }
        : {}),
    })
    .eq("id", videoId)
    .eq("profile_id", user.id);

  if (error) {
    redirect(
      `/dashboard/viewtrack/identity?selected=${videoId}&error=${encodeURIComponent(error.message)}`,
    );
  }

  revalidatePath("/dashboard/viewtrack", "layout");
  // Stay on whichever tab the form was submitted from.
  const next = String(formData.get("__next") || "/dashboard/viewtrack/identity");
  redirect(`${next}?selected=${videoId}&saved=1`);
}

export async function deleteVideo(videoId: string) {
  const { supabase, user } = await requireUser();

  // Best-effort thumbnail cleanup.
  const { data: existing } = await supabase
    .from("viewtrack_videos")
    .select("thumbnail_path")
    .eq("id", videoId)
    .eq("profile_id", user.id)
    .maybeSingle();
  if (existing?.thumbnail_path) {
    await supabase.storage
      .from(VT_BUCKET)
      .remove([existing.thumbnail_path]);
  }

  const { error } = await supabase
    .from("viewtrack_videos")
    .delete()
    .eq("id", videoId)
    .eq("profile_id", user.id);

  if (error) {
    redirect(
      `/dashboard/viewtrack/identity?error=${encodeURIComponent(error.message)}`,
    );
  }

  revalidatePath("/dashboard/viewtrack", "layout");
  redirect("/dashboard/viewtrack/identity?deleted=1");
}
