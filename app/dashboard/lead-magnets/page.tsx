import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import {
  LeadMagnetsManager,
  type LeadMagnetItem,
  type ListChoice,
} from "@/components/dashboard/lead-magnets-manager";
import {
  createLeadMagnet,
  deleteLeadMagnet,
  updateLeadMagnet,
} from "./actions";

export const metadata = { title: "Lead magnets — Contenomics" };
export const dynamic = "force-dynamic";

export default async function LeadMagnetsPage({
  searchParams,
}: {
  searchParams: { error?: string };
}) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login?next=/dashboard/lead-magnets");

  const [magnetsRes, listsRes] = await Promise.all([
    supabase
      .from("lead_magnets")
      .select(
        "id, name, description, download_url, file_label, default_heading, default_description, default_button_text, list_id, download_count, updated_at",
      )
      .eq("profile_id", user.id)
      .order("updated_at", { ascending: false }),
    supabase
      .from("lists")
      .select("id, name, color")
      .eq("profile_id", user.id)
      .order("name", { ascending: true }),
  ]);

  const magnetsRaw = magnetsRes.data ?? [];
  const lists: ListChoice[] = (listsRes.data ?? []).map((l) => ({
    id: l.id,
    name: l.name,
    color: l.color,
  }));

  // Count how many lead_magnet blocks reference each magnet so creators
  // know what's actually in use.
  const useCountByMagnet = new Map<string, number>();
  if (magnetsRaw.length > 0) {
    // Pull all lead_magnet-typed blocks for pages owned by this user.
    // Faster than a function-based filter and easier to reason about.
    const { data: blocks } = await supabase
      .from("blocks")
      .select("config, page_id, pages!inner(profile_id)")
      .eq("type", "lead_magnet")
      .eq("pages.profile_id", user.id);
    for (const b of blocks ?? []) {
      const cfg = (b.config as { lead_magnet_id?: string } | null) ?? {};
      if (cfg.lead_magnet_id) {
        useCountByMagnet.set(
          cfg.lead_magnet_id,
          (useCountByMagnet.get(cfg.lead_magnet_id) ?? 0) + 1,
        );
      }
    }
  }

  const magnets: LeadMagnetItem[] = magnetsRaw.map((m) => ({
    id: m.id,
    name: m.name,
    description: m.description,
    download_url: m.download_url,
    file_label: m.file_label,
    default_heading: m.default_heading,
    default_description: m.default_description,
    default_button_text: m.default_button_text,
    list_id: m.list_id,
    download_count: m.download_count,
    block_use_count: useCountByMagnet.get(m.id) ?? 0,
    updated_at: m.updated_at,
  }));

  return (
    <div className="space-y-6 px-4 py-8 md:px-8">
      <div className="space-y-1">
        <h1 className="text-2xl font-semibold tracking-tight">Lead magnets</h1>
        <p className="text-muted-foreground text-sm">
          Reusable gated content. Reference these from{" "}
          <code className="bg-muted rounded px-1 text-xs">Lead magnet</code>{" "}
          blocks on any page.
        </p>
      </div>

      {searchParams.error ? (
        <div
          role="alert"
          className="border-destructive/30 bg-destructive/5 text-destructive rounded-md border px-4 py-3 text-sm"
        >
          {searchParams.error}
        </div>
      ) : null}

      <LeadMagnetsManager
        magnets={magnets}
        lists={lists}
        onCreate={createLeadMagnet}
        onUpdate={updateLeadMagnet}
        onDelete={deleteLeadMagnet}
      />
    </div>
  );
}
