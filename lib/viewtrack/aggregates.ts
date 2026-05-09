// Pure aggregations used by Dashboard / Performance / Conversion / AI Export.
// No database access — operates on already-fetched ViewtrackVideo rows so
// each tab can pick what it needs without re-querying.

import type { ViewtrackVideo } from "@/lib/types/database";

export type AggregateNumber = number | null;

export function avg(nums: (number | null | undefined)[]): AggregateNumber {
  const xs = nums.filter((n): n is number => typeof n === "number");
  if (xs.length === 0) return null;
  return xs.reduce((a, b) => a + b, 0) / xs.length;
}

export function sum(nums: (number | null | undefined)[]): number {
  return nums
    .filter((n): n is number => typeof n === "number")
    .reduce((a, b) => a + b, 0);
}

export function fmtPct(value: number | null | undefined, digits = 1): string {
  if (typeof value !== "number" || Number.isNaN(value)) return "—";
  return `${(value * 100).toFixed(digits)}%`;
}

export function fmtNum(value: number | null | undefined): string {
  if (typeof value !== "number" || Number.isNaN(value)) return "—";
  return value.toLocaleString();
}

export type CategoryStat = {
  key: string;
  count: number;
  avg7dCtr: number | null;
  totalViews7d: number;
  totalCalls: number;
};

export function groupBy<K extends string>(
  videos: ViewtrackVideo[],
  pick: (v: ViewtrackVideo) => K | null | undefined,
): Map<K, ViewtrackVideo[]> {
  const map = new Map<K, ViewtrackVideo[]>();
  for (const v of videos) {
    const k = pick(v);
    if (!k) continue;
    const list = map.get(k) ?? [];
    list.push(v);
    map.set(k, list);
  }
  return map;
}

export function categoryStats<K extends string>(
  videos: ViewtrackVideo[],
  pick: (v: ViewtrackVideo) => K | null | undefined,
): CategoryStat[] {
  const grouped = groupBy(videos, pick);
  const out: CategoryStat[] = [];
  grouped.forEach((list, key) => {
    out.push({
      key,
      count: list.length,
      avg7dCtr: avg(list.map((v) => v.ctr_7d)),
      totalViews7d: sum(list.map((v) => v.views_7d)),
      totalCalls: sum(list.map((v) => v.calls_booked)),
    });
  });
  return out.sort((a, b) => (b.avg7dCtr ?? -1) - (a.avg7dCtr ?? -1));
}

export function bestPerformer<K extends string>(
  videos: ViewtrackVideo[],
  pick: (v: ViewtrackVideo) => K | null | undefined,
): CategoryStat | null {
  const stats = categoryStats(videos, pick).filter(
    (s) => s.avg7dCtr !== null,
  );
  return stats[0] ?? null;
}

export function topByCtr7d(
  videos: ViewtrackVideo[],
  n = 5,
): ViewtrackVideo[] {
  return [...videos]
    .filter((v) => typeof v.ctr_7d === "number")
    .sort((a, b) => (b.ctr_7d ?? 0) - (a.ctr_7d ?? 0))
    .slice(0, n);
}

// Most common drop-off timestamp across videos that have one logged.
export function biggestDropOffTimestamp(videos: ViewtrackVideo[]): string | null {
  const counts = new Map<string, number>();
  for (const v of videos) {
    const t = v.drop_off_timestamp?.trim();
    if (!t) continue;
    counts.set(t, (counts.get(t) ?? 0) + 1);
  }
  let best: [string, number] | null = null;
  counts.forEach((count, ts) => {
    if (!best || count > best[1]) best = [ts, count];
  });
  return best ? (best as [string, number])[0] : null;
}

export function videosWithViewsButNoConversion(
  videos: ViewtrackVideo[],
): ViewtrackVideo[] {
  return videos.filter(
    (v) =>
      typeof v.views_7d === "number" &&
      v.views_7d > 0 &&
      (v.calls_booked == null || v.calls_booked === 0) &&
      (v.click_throughs == null || v.click_throughs === 0),
  );
}

export function correlationIntroVsDropoff(
  videos: ViewtrackVideo[],
): number | null {
  const pairs = videos
    .map((v) => [v.intro_length_sec, v.drop_off_rate] as const)
    .filter(
      (p): p is readonly [number, number] =>
        typeof p[0] === "number" && typeof p[1] === "number",
    );
  if (pairs.length < 3) return null;
  const n = pairs.length;
  const mx = pairs.reduce((s, [x]) => s + x, 0) / n;
  const my = pairs.reduce((s, [, y]) => s + y, 0) / n;
  let num = 0;
  let dx2 = 0;
  let dy2 = 0;
  for (const [x, y] of pairs) {
    const dx = x - mx;
    const dy = y - my;
    num += dx * dy;
    dx2 += dx * dx;
    dy2 += dy * dy;
  }
  const denom = Math.sqrt(dx2 * dy2);
  if (denom === 0) return null;
  return num / denom;
}
