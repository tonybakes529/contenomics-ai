// CSV download endpoint. Streams the current creator's videos as a flat
// denormalized CSV — same columns as lib/viewtrack/csv.ts.

import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { AI_CONTEXT, buildCsv } from "@/lib/viewtrack/csv";
import type { ViewtrackVideo } from "@/lib/types/database";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.redirect(
      new URL("/login?next=/dashboard/viewtrack/ai-export", request.url),
    );
  }

  const { data, error } = await supabase
    .from("viewtrack_videos")
    .select("*")
    .eq("profile_id", user.id)
    .order("date_posted", { ascending: false, nullsFirst: false })
    .order("created_at", { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const url = new URL(request.url);
  const includeContext = url.searchParams.get("with_context") === "1";
  const csv = buildCsv((data ?? []) as ViewtrackVideo[]);
  const body = includeContext ? `# ${AI_CONTEXT}\n${csv}` : csv;

  const stamp = new Date().toISOString().slice(0, 10);
  return new NextResponse(body, {
    status: 200,
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="viewtrack-${stamp}.csv"`,
      "Cache-Control": "no-store",
    },
  });
}
