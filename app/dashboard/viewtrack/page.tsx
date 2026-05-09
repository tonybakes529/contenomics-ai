import Link from "next/link";
import {
  Sparkles,
  TrendingUp,
  Trophy,
  Users,
  Video as VideoIcon,
} from "lucide-react";
import { getViewtrackContext } from "@/lib/viewtrack/queries";
import {
  avg,
  bestPerformer,
  biggestDropOffTimestamp,
  categoryStats,
  fmtNum,
  fmtPct,
  sum,
  topByCtr7d,
} from "@/lib/viewtrack/aggregates";

export default async function ViewtrackDashboardPage() {
  const { videos } = await getViewtrackContext();

  const totalVideos = videos.length;
  const avgCtr7d = avg(videos.map((v) => v.ctr_7d));
  const totalCalls = sum(videos.map((v) => v.calls_booked));
  const bestStyle = bestPerformer(videos, (v) => v.winning_style);
  const bestHook = bestPerformer(videos, (v) => v.hook_style);
  const bestFace = bestPerformer(videos, (v) =>
    v.face_yn ? `Face ${v.face_yn}` : null,
  );
  const top5 = topByCtr7d(videos, 5);
  const topDropOff = biggestDropOffTimestamp(videos);

  if (totalVideos === 0) {
    return <EmptyState />;
  }

  return (
    <div className="space-y-6">
      {/* Stat cards */}
      <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          icon={<VideoIcon className="size-4" />}
          label="Total Videos"
          value={fmtNum(totalVideos)}
        />
        <StatCard
          icon={<TrendingUp className="size-4" />}
          label="Avg 7-Day CTR"
          value={fmtPct(avgCtr7d, 2)}
        />
        <StatCard
          icon={<Trophy className="size-4" />}
          label="Best Hook Style"
          value={bestHook?.key ?? "—"}
          sub={
            bestHook
              ? `${fmtPct(bestHook.avg7dCtr, 2)} avg CTR`
              : "Need more data"
          }
        />
        <StatCard
          icon={<Users className="size-4" />}
          label="Calls Booked"
          value={fmtNum(totalCalls)}
        />
      </section>

      {/* What's working */}
      <section className="space-y-3">
        <div className="flex items-center gap-2">
          <Sparkles className="text-muted-foreground size-4" />
          <h2 className="text-sm font-semibold tracking-tight">
            What&apos;s working
          </h2>
        </div>

        <div className="grid gap-3 lg:grid-cols-2">
          {/* Top 5 */}
          <Panel title="Top 5 Videos by 7-Day CTR">
            {top5.length === 0 ? (
              <Empty msg="No videos with 7-day CTR yet." />
            ) : (
              <ol className="space-y-2">
                {top5.map((v, i) => (
                  <li
                    key={v.id}
                    className="flex items-center justify-between gap-3"
                  >
                    <div className="flex min-w-0 items-center gap-3">
                      <span className="text-muted-foreground w-5 shrink-0 text-xs tabular-nums">
                        {i + 1}.
                      </span>
                      <div className="min-w-0">
                        <p className="text-foreground truncate text-sm font-medium">
                          {v.final_title || v.video_external_id || "Untitled"}
                        </p>
                        <p className="text-muted-foreground truncate text-xs">
                          {v.video_external_id ?? "—"}
                          {v.winning_style ? ` · ${v.winning_style}` : ""}
                          {v.hook_style ? ` · ${v.hook_style} hook` : ""}
                        </p>
                      </div>
                    </div>
                    <span className="text-foreground shrink-0 text-sm font-semibold tabular-nums">
                      {fmtPct(v.ctr_7d, 2)}
                    </span>
                  </li>
                ))}
              </ol>
            )}
          </Panel>

          <Panel title="Best title style">
            <BestSlot stat={bestStyle} unit="avg 7-day CTR" />
          </Panel>

          <Panel title="Best face strategy">
            <BestSlot stat={bestFace} unit="avg 7-day CTR" />
          </Panel>

          <Panel title="Biggest drop-off pattern">
            {topDropOff ? (
              <p className="text-foreground text-2xl font-semibold tracking-tight">
                {topDropOff}
              </p>
            ) : (
              <Empty msg="No drop-off timestamps logged." />
            )}
            <p className="text-muted-foreground mt-1 text-xs">
              Most common timestamp where viewers stop watching.
            </p>
          </Panel>
        </div>
      </section>

      {/* Pattern Recognition */}
      <section className="space-y-3">
        <div className="flex items-center gap-2">
          <TrendingUp className="text-muted-foreground size-4" />
          <h2 className="text-sm font-semibold tracking-tight">
            Pattern recognition
          </h2>
        </div>

        <div className="grid gap-3 lg:grid-cols-2">
          <PatternTable
            title="By title style"
            rows={categoryStats(videos, (v) => v.winning_style)}
          />
          <PatternTable
            title="By hook style"
            rows={categoryStats(videos, (v) => v.hook_style)}
          />
          <PatternTable
            title="By face on thumbnail"
            rows={categoryStats(videos, (v) =>
              v.face_yn ? `Face ${v.face_yn}` : null,
            )}
          />
          <PatternTable
            title="By color palette"
            rows={categoryStats(videos, (v) => v.color_palette)}
          />
        </div>
      </section>
    </div>
  );
}

function StatCard({
  icon,
  label,
  value,
  sub,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  sub?: string;
}) {
  return (
    <div className="border-border bg-card rounded-lg border p-4">
      <div className="text-muted-foreground flex items-center gap-1.5 text-xs">
        {icon}
        <span>{label}</span>
      </div>
      <p className="text-foreground mt-2 text-2xl font-semibold tracking-tight">
        {value}
      </p>
      {sub ? (
        <p className="text-muted-foreground mt-1 text-xs">{sub}</p>
      ) : null}
    </div>
  );
}

function Panel({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="border-border bg-card rounded-lg border p-4">
      <h3 className="text-foreground mb-3 text-xs font-semibold tracking-wide uppercase">
        {title}
      </h3>
      {children}
    </div>
  );
}

function BestSlot({
  stat,
  unit,
}: {
  stat: { key: string; avg7dCtr: number | null; count: number } | null;
  unit: string;
}) {
  if (!stat || stat.avg7dCtr == null) {
    return <Empty msg="Need more data." />;
  }
  return (
    <div>
      <p className="text-foreground text-2xl font-semibold tracking-tight">
        {stat.key}
      </p>
      <p className="text-muted-foreground mt-1 text-xs">
        {fmtPct(stat.avg7dCtr, 2)} {unit} · {stat.count} video
        {stat.count === 1 ? "" : "s"}
      </p>
    </div>
  );
}

function PatternTable({
  title,
  rows,
}: {
  title: string;
  rows: ReturnType<typeof categoryStats>;
}) {
  return (
    <Panel title={title}>
      {rows.length === 0 ? (
        <Empty msg="Tag some videos to see this pattern." />
      ) : (
        <table className="w-full text-sm">
          <thead>
            <tr className="text-muted-foreground text-xs">
              <th className="py-1 text-left font-medium">Group</th>
              <th className="py-1 text-right font-medium">Videos</th>
              <th className="py-1 text-right font-medium">Avg 7d CTR</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.key} className="border-border border-t">
                <td className="text-foreground py-1.5">{r.key}</td>
                <td className="text-muted-foreground py-1.5 text-right tabular-nums">
                  {r.count}
                </td>
                <td className="text-foreground py-1.5 text-right tabular-nums">
                  {fmtPct(r.avg7dCtr, 2)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </Panel>
  );
}

function Empty({ msg }: { msg: string }) {
  return <p className="text-muted-foreground text-xs">{msg}</p>;
}

function EmptyState() {
  return (
    <div className="border-border bg-muted/30 flex flex-col items-center justify-center gap-3 rounded-lg border border-dashed p-16 text-center">
      <div className="bg-background flex size-12 items-center justify-center rounded-full border">
        <VideoIcon className="text-muted-foreground size-5" />
      </div>
      <div className="space-y-1">
        <p className="text-sm font-medium">No videos yet</p>
        <p className="text-muted-foreground max-w-md text-xs">
          Add your first video on the Identity tab. As soon as one row has
          data, this dashboard fills in automatically.
        </p>
      </div>
      <Link
        href="/dashboard/viewtrack/identity"
        className="bg-foreground text-background hover:opacity-90 inline-flex h-9 items-center rounded-md px-3.5 text-sm font-medium transition-opacity"
      >
        Add a video
      </Link>
    </div>
  );
}
