import { Sparkles } from "lucide-react";
import { getViewtrackContext } from "@/lib/viewtrack/queries";
import {
  AI_CONTEXT,
  AI_EXPORT_HEADERS,
  buildCsv,
  videoToRow,
} from "@/lib/viewtrack/csv";
import {
  CopyAllButton,
  CopyContextButton,
  DownloadCsvButton,
} from "@/components/dashboard/viewtrack/ai-export-actions";

export const metadata = { title: "AI Export — Viewtrack" };

const PREVIEW_COLS = [
  "external_id",
  "final_title",
  "winning_style",
  "hook_style",
  "ctr_7d",
  "drop_off_rate",
  "calls_booked",
];

export default async function AiExportTabPage() {
  const { videos } = await getViewtrackContext();
  const csv = buildCsv(videos);

  return (
    <div className="space-y-6">
      {/* Hero card */}
      <section className="border-border bg-card rounded-lg border p-5">
        <div className="flex items-start gap-3">
          <div className="bg-muted flex size-10 shrink-0 items-center justify-center rounded-md border">
            <Sparkles className="text-muted-foreground size-5" />
          </div>
          <div className="space-y-1">
            <h2 className="text-base font-semibold tracking-tight">
              AI Context Export
            </h2>
            <p className="text-muted-foreground max-w-xl text-sm">
              Export clean video performance data for AI analysis. Copy the
              context, download the CSV, or send straight to Gemini.
            </p>
          </div>
        </div>

        <div className="mt-5 flex flex-wrap items-center gap-2">
          <CopyContextButton context={AI_CONTEXT} />
          <DownloadCsvButton />
          <CopyAllButton context={AI_CONTEXT} csv={csv} />
        </div>

        <details className="border-border mt-4 rounded-md border">
          <summary className="text-muted-foreground hover:text-foreground cursor-pointer px-3 py-2 text-xs font-medium">
            View AI context
          </summary>
          <pre className="border-border bg-muted/30 text-muted-foreground border-t p-3 text-[11px] leading-relaxed whitespace-pre-wrap">
            {AI_CONTEXT}
          </pre>
        </details>
      </section>

      {/* Preview table */}
      <section className="space-y-2">
        <h3 className="text-foreground text-sm font-semibold tracking-tight">
          Preview ({videos.length} video{videos.length === 1 ? "" : "s"})
        </h3>
        {videos.length === 0 ? (
          <div className="border-border bg-muted/30 rounded-lg border border-dashed p-12 text-center">
            <p className="text-muted-foreground text-xs">
              No videos to export yet. Add a video on the Identity tab first.
            </p>
          </div>
        ) : (
          <div className="border-border bg-card overflow-hidden rounded-lg border">
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead className="bg-muted/30 border-border border-b">
                  <tr>
                    {PREVIEW_COLS.map((col) => (
                      <th
                        key={col}
                        className="text-muted-foreground px-3 py-2 text-left font-medium tracking-wide uppercase"
                      >
                        {col}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {videos.map((v) => {
                    const row = videoToRow(v);
                    return (
                      <tr
                        key={v.id}
                        className="border-border border-t"
                      >
                        {PREVIEW_COLS.map((col) => {
                          const idx = AI_EXPORT_HEADERS.indexOf(col);
                          const cell = idx >= 0 ? row[idx] : "";
                          // Format CTR-ish columns as %
                          const isPct =
                            col === "ctr_7d" || col === "drop_off_rate";
                          let display: string = cell;
                          if (isPct && cell) {
                            const n = Number(cell);
                            if (Number.isFinite(n)) {
                              display = `${(n * 100).toFixed(2)}%`;
                            }
                          }
                          return (
                            <td
                              key={col}
                              className="text-foreground max-w-[240px] truncate px-3 py-2"
                            >
                              {display || (
                                <span className="text-muted-foreground">
                                  —
                                </span>
                              )}
                            </td>
                          );
                        })}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
        <p className="text-muted-foreground text-[11px]">
          Showing {PREVIEW_COLS.length} of {AI_EXPORT_HEADERS.length} columns.
          The full set ships in the CSV download.
        </p>
      </section>
    </div>
  );
}
