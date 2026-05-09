// Flat denormalized CSV export. Mirrors the AI Export sheet in tracker.xlsx
// — every column from Identity / Creative / Performance / Conversion as one
// row per video. CTR / drop-off / engagement stay as decimals (0.05) so AI
// tools don't have to parse "%" out of strings.

import type { ViewtrackVideo } from "@/lib/types/database";

export const AI_CONTEXT = `CONTEXT FOR AI: This dataset is a flat denormalized export of a YouTube content tracker. Each row is one video. Columns are merged from four sections: Identity (publishing metadata), Creative (title/thumbnail/hook design choices and A/B variants), Performance (click-through and retention metrics at 24hr / 7-day / 30-day windows plus drop-off and average view duration), and Conversion (CTAs, click-throughs, engagement rate, calls booked, free-form notes). CTR / drop-off / engagement values are stored as decimals (e.g., 0.05 = 5%). Use this view to identify which creative levers (title style, hook style, face on thumbnail, word count, intro length) correlate with higher CTR, lower drop-off, and more calls booked. Empty cells mean no data was logged.`;

export const AI_EXPORT_HEADERS = [
  "video_id",
  "external_id",
  "platform",
  "date_posted",
  "final_title",
  "video_url",
  "length",
  "topic",
  "ab_title_1",
  "ab_title_2",
  "ab_title_3",
  "winning_title_num",
  "winning_style",
  "thumbnail_url",
  "face_yn",
  "face_emotion",
  "word_count",
  "words_used",
  "background",
  "color_palette",
  "hook_script",
  "hook_style",
  "intro_length_sec",
  "time_to_value_sec",
  "thumbnail_notes",
  "ctr_24h",
  "ctr_7d",
  "ctr_30d",
  "drop_off_rate",
  "drop_off_timestamp",
  "avd",
  "views_7d",
  "views_30d",
  "ctas_used",
  "click_throughs",
  "engagement_rate",
  "calls_booked",
  "notes",
];

function csvEscape(value: unknown): string {
  if (value == null) return "";
  const s = String(value);
  if (/[",\n\r]/.test(s)) {
    return `"${s.replace(/"/g, '""')}"`;
  }
  return s;
}

export function videoToRow(v: ViewtrackVideo): string[] {
  return [
    v.id,
    v.video_external_id ?? "",
    v.platform,
    v.date_posted ?? "",
    v.final_title ?? "",
    v.video_url ?? "",
    v.length_text ?? "",
    v.topic ?? "",
    v.ab_title_1 ?? "",
    v.ab_title_2 ?? "",
    v.ab_title_3 ?? "",
    v.winning_title_num?.toString() ?? "",
    v.winning_style ?? "",
    v.thumbnail_url ?? "",
    v.face_yn ?? "",
    v.face_emotion ?? "",
    v.word_count?.toString() ?? "",
    v.words_used ?? "",
    v.background ?? "",
    v.color_palette ?? "",
    v.hook_script ?? "",
    v.hook_style ?? "",
    v.intro_length_sec?.toString() ?? "",
    v.time_to_value_sec?.toString() ?? "",
    v.thumbnail_notes ?? "",
    v.ctr_24h?.toString() ?? "",
    v.ctr_7d?.toString() ?? "",
    v.ctr_30d?.toString() ?? "",
    v.drop_off_rate?.toString() ?? "",
    v.drop_off_timestamp ?? "",
    v.avd ?? "",
    v.views_7d?.toString() ?? "",
    v.views_30d?.toString() ?? "",
    v.ctas_used ?? "",
    v.click_throughs?.toString() ?? "",
    v.engagement_rate?.toString() ?? "",
    v.calls_booked?.toString() ?? "",
    v.notes ?? "",
  ];
}

export function buildCsv(videos: ViewtrackVideo[]): string {
  const lines: string[] = [];
  lines.push(AI_EXPORT_HEADERS.join(","));
  for (const v of videos) {
    lines.push(videoToRow(v).map(csvEscape).join(","));
  }
  return lines.join("\n");
}
