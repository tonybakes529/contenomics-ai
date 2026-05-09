import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import {
  BarChart3,
  Download,
  FileSpreadsheet,
  Sparkles,
  Video,
} from "lucide-react";

export const metadata = { title: "Viewtrack — Contenomics" };
export const dynamic = "force-dynamic";

type SheetSummary = {
  name: string;
  blurb: string;
  highlights: string[];
};

const SHEETS: SheetSummary[] = [
  {
    name: "Identity",
    blurb:
      "Publishing metadata. 50 pre-formatted rows with auto Video IDs (LF-001…LF-050).",
    highlights: [
      "Video ID",
      "Date Posted",
      "Final Title",
      "Video URL",
      "Length",
      "Topic",
    ],
  },
  {
    name: "Creative",
    blurb:
      "Title, thumbnail, and hook design choices — including A/B variants and dropdown-driven style tags.",
    highlights: [
      "A/B Title 1-3 + Winning Title #",
      "Winning Style (Curiosity / List / How-To / Question / Shock)",
      "Face Y/N + Face Emotion",
      "Hook Script + Hook Style",
      "Intro Length + Time-to-Value",
    ],
  },
  {
    name: "Performance",
    blurb:
      "CTR and retention at 24hr / 7-day / 30-day windows. Drop-off rate, drop-off timestamp, AVD.",
    highlights: [
      "24hr / 7-day / 30-day CTR%",
      "Drop-off Rate% + Timestamp",
      "AVD",
      "7-day + 30-day Views",
    ],
  },
  {
    name: "Conversion",
    blurb:
      "Where attention turns into action: CTAs, click-throughs, engagement, calls booked.",
    highlights: [
      "CTAs Used",
      "Click-throughs",
      "Engagement Rate",
      "Calls Booked",
      "Notes",
    ],
  },
  {
    name: "Dashboard",
    blurb:
      "Three-zone overview computed from the four data sheets via INDEX/MATCH + AVERAGEIFS.",
    highlights: [
      "Overall Health — totals, averages, best/worst by 7-day CTR",
      "Pattern Recognition — avg CTR by title style, hook style, face Y/N, word count bucket; correlation intro length vs drop-off",
      "Top 5 by 7-day CTR with full context",
    ],
  },
  {
    name: "AI Export",
    blurb:
      "Flat denormalized view, joined by Video ID. A1 holds an AI context blurb. Export as CSV → drop into Gemini.",
    highlights: [
      "All four sheets merged into one row per video",
      "Schema description in A1 for the model",
      "Ready-to-export for prompt context",
    ],
  },
];

export default async function ViewtrackPage() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login?next=/dashboard/viewtrack");

  return (
    <div className="mx-auto w-full max-w-5xl space-y-6 p-6">
      {/* Header */}
      <header className="space-y-1.5">
        <div className="flex items-center gap-2">
          <BarChart3 className="text-muted-foreground size-5" />
          <h1 className="text-2xl font-semibold tracking-tight">Viewtrack</h1>
        </div>
        <p className="text-muted-foreground max-w-2xl text-sm">
          Track every video, surface what&apos;s working, and feed the data
          straight into AI for actionable insights. YouTube first — Shorts and
          LinkedIn coming next.
        </p>
      </header>

      {/* Hero card: download tracker */}
      <section className="border-border bg-card rounded-lg border p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex items-start gap-3">
            <div className="bg-muted flex size-10 shrink-0 items-center justify-center rounded-md border">
              <FileSpreadsheet className="text-muted-foreground size-5" />
            </div>
            <div className="space-y-1">
              <h2 className="text-base font-semibold tracking-tight">
                YouTube Content Tracker (.xlsx)
              </h2>
              <p className="text-muted-foreground max-w-xl text-sm">
                Six-sheet workbook: Identity, Creative, Performance, Conversion,
                Dashboard, and AI Export. Built with openpyxl. Arial throughout,
                clean default formatting, dropdowns + INDEX/MATCH /
                AVERAGEIFS-driven dashboard.
              </p>
            </div>
          </div>
          <a
            href="/viewtrack/tracker.xlsx"
            download="contenomics-viewtrack-tracker.xlsx"
            className="bg-foreground text-background hover:opacity-90 inline-flex h-9 shrink-0 items-center gap-1.5 rounded-md px-3.5 text-sm font-medium transition-opacity"
          >
            <Download className="size-4" />
            Download tracker
          </a>
        </div>
      </section>

      {/* Sheets grid */}
      <section className="space-y-3">
        <h2 className="text-sm font-semibold tracking-tight">
          What&apos;s in the workbook
        </h2>
        <div className="grid gap-3 sm:grid-cols-2">
          {SHEETS.map((sheet) => (
            <div
              key={sheet.name}
              className="border-border bg-card rounded-lg border p-4"
            >
              <div className="flex items-center gap-2">
                <span className="text-foreground text-sm font-semibold">
                  {sheet.name}
                </span>
              </div>
              <p className="text-muted-foreground mt-1.5 text-xs leading-relaxed">
                {sheet.blurb}
              </p>
              <ul className="mt-3 space-y-1">
                {sheet.highlights.map((h) => (
                  <li
                    key={h}
                    className="text-muted-foreground flex items-start gap-1.5 text-xs"
                  >
                    <span className="text-foreground/40 mt-1 inline-block size-1 shrink-0 rounded-full bg-current" />
                    <span>{h}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>

      {/* What's next */}
      <section className="border-border bg-muted/30 rounded-lg border p-5">
        <div className="flex items-start gap-3">
          <div className="bg-background flex size-9 shrink-0 items-center justify-center rounded-md border">
            <Sparkles className="text-muted-foreground size-4" />
          </div>
          <div className="space-y-2">
            <h3 className="text-sm font-semibold tracking-tight">
              What&apos;s next
            </h3>
            <ul className="text-muted-foreground space-y-1.5 text-xs">
              <li className="flex items-start gap-1.5">
                <Video className="mt-0.5 size-3.5 shrink-0" />
                <span>
                  Auto-pull YouTube analytics into the Performance sheet
                  (impressions, CTR, retention) by connecting your channel.
                </span>
              </li>
              <li className="flex items-start gap-1.5">
                <Sparkles className="mt-0.5 size-3.5 shrink-0" />
                <span>
                  One-click AI insights — push the AI Export sheet to Gemini
                  with the schema context already embedded in cell A1.
                </span>
              </li>
              <li className="flex items-start gap-1.5">
                <BarChart3 className="mt-0.5 size-3.5 shrink-0" />
                <span>
                  Shorts + LinkedIn tabs alongside YouTube — same shape, per
                  platform.
                </span>
              </li>
            </ul>
          </div>
        </div>
      </section>
    </div>
  );
}
