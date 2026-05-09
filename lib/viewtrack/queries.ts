// Shared Viewtrack data helpers. The layout has already gated auth, but
// each tab page still calls these to keep server-side queries colocated
// with the page that needs them. React's request-level cache dedups any
// duplicate fetches within a single request.

import { cache } from "react";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import type { ViewtrackVideo } from "@/lib/types/database";

export const getViewtrackContext = cache(async () => {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login?next=/dashboard/viewtrack");

  const { data, error } = await supabase
    .from("viewtrack_videos")
    .select("*")
    .eq("profile_id", user.id)
    .order("date_posted", { ascending: false, nullsFirst: false })
    .order("created_at", { ascending: false });

  if (error) {
    console.error("[viewtrack] failed to load videos", error);
    return { user, videos: [] as ViewtrackVideo[] };
  }
  return { user, videos: (data ?? []) as ViewtrackVideo[] };
});

// Auto-suggest the next LF-### ID based on what's already used.
export function suggestNextExternalId(videos: ViewtrackVideo[]): string {
  let max = 0;
  for (const v of videos) {
    const m = v.video_external_id?.match(/^LF-(\d+)$/);
    if (m) {
      const n = parseInt(m[1], 10);
      if (n > max) max = n;
    }
  }
  return `LF-${String(max + 1).padStart(3, "0")}`;
}
