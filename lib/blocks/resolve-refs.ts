import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/types/database";

type RawBlock = {
  id: string;
  type: string;
  position: number;
  config: unknown;
};

/**
 * Resolves cross-table block references before passing blocks to the
 * client renderer. Right now this only handles `lead_magnet` blocks
 * that reference a row in `lead_magnets`, but the same shape can
 * extend to other reference-type blocks later.
 *
 * For each lead_magnet block with `config.lead_magnet_id`:
 *   - Fetch the saved magnet (one batched .in() query, not N+1).
 *   - Merge: saved defaults (heading/description/url/button/file_label/list)
 *     are filled in for any field the inline config left blank/undefined.
 *   - Inline values always win.
 *
 * If the referenced magnet doesn't exist (deleted, etc.) the block is
 * left as-is. The renderer's empty-required-fields check will hide it.
 */
export async function resolveBlockRefs(
  supabase: SupabaseClient<Database>,
  blocks: RawBlock[],
): Promise<RawBlock[]> {
  const leadMagnetIds = new Set<string>();
  for (const b of blocks) {
    if (b.type !== "lead_magnet") continue;
    const cfg = (b.config as { lead_magnet_id?: string } | null) ?? {};
    if (cfg.lead_magnet_id) leadMagnetIds.add(cfg.lead_magnet_id);
  }
  if (leadMagnetIds.size === 0) return blocks;

  const { data: magnets } = await supabase
    .from("lead_magnets")
    .select(
      "id, download_url, file_label, default_heading, default_description, default_button_text, list_id",
    )
    .in("id", Array.from(leadMagnetIds));

  const byId = new Map((magnets ?? []).map((m) => [m.id, m]));

  return blocks.map((b) => {
    if (b.type !== "lead_magnet") return b;
    const cfg = (b.config as Record<string, unknown> | null) ?? {};
    const magnetId = cfg.lead_magnet_id as string | undefined;
    if (!magnetId) return b;
    const m = byId.get(magnetId);
    if (!m) return b;

    // Inline value wins; saved magnet fills the gap.
    const merged = {
      ...cfg,
      heading: (cfg.heading as string) || m.default_heading || undefined,
      description:
        (cfg.description as string) || m.default_description || undefined,
      button_text:
        (cfg.button_text as string) || m.default_button_text || undefined,
      file_label: (cfg.file_label as string) || m.file_label || undefined,
      download_url: (cfg.download_url as string) || m.download_url,
      // Explicit list_ids on the block are merged with the magnet's list_id.
      list_ids: dedupe([
        ...(Array.isArray(cfg.list_ids) ? (cfg.list_ids as string[]) : []),
        ...(m.list_id ? [m.list_id] : []),
      ]),
    };
    return { ...b, config: merged };
  });
}

function dedupe<T>(arr: T[]): T[] {
  return Array.from(new Set(arr));
}
