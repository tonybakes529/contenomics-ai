import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

function csvEscape(val: string | null | undefined): string {
  if (val == null) return "";
  if (/[",\n\r]/.test(val)) {
    return `"${val.replace(/"/g, '""')}"`;
  }
  return val;
}

export async function GET() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.redirect(
      new URL("/login?next=/dashboard/subscribers", "http://placeholder"),
    );
  }

  const { data: subscribers, error } = await supabase
    .from("subscribers")
    .select(
      "email, name, status, confirmed_at, source_page_id, source_block_id, created_at",
    )
    .eq("profile_id", user.id)
    .order("created_at", { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const rows = subscribers ?? [];
  const header = [
    "email",
    "name",
    "status",
    "confirmed_at",
    "source_page_id",
    "source_block_id",
    "created_at",
  ];
  const lines = [header.join(",")];
  for (const r of rows) {
    lines.push(
      [
        r.email,
        r.name,
        r.status,
        r.confirmed_at,
        r.source_page_id,
        r.source_block_id,
        r.created_at,
      ]
        .map(csvEscape)
        .join(","),
    );
  }
  const csv = lines.join("\n");
  const today = new Date().toISOString().slice(0, 10);

  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="contenomics-subscribers-${today}.csv"`,
    },
  });
}
