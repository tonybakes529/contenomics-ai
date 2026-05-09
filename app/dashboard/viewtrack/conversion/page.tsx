import Link from "next/link";
import { getViewtrackContext } from "@/lib/viewtrack/queries";
import {
  fmtNum,
  fmtPct,
  videosWithViewsButNoConversion,
} from "@/lib/viewtrack/aggregates";
import type { ViewtrackVideo } from "@/lib/types/database";
import { VideoList } from "@/components/dashboard/viewtrack/video-list";
import {
  Field,
  Input,
  Textarea,
  pctToDisplay,
} from "@/components/dashboard/viewtrack/form-fields";
import {
  FlashBanner,
  SaveButton,
} from "@/components/dashboard/viewtrack/save-bar";
import { updateVideo } from "../actions";

export const metadata = { title: "Conversion — Viewtrack" };

export default async function ConversionTabPage({
  searchParams,
}: {
  searchParams: { selected?: string; saved?: string; error?: string };
}) {
  const { videos } = await getViewtrackContext();
  const selectedId = searchParams.selected ?? null;
  const selected = selectedId
    ? videos.find((v) => v.id === selectedId) ?? null
    : null;

  return (
    <div className="grid gap-4 lg:grid-cols-[280px_1fr]">
      <VideoList
        videos={videos}
        selectedId={selected?.id ?? null}
        basePath="/dashboard/viewtrack/conversion"
      />

      <div className="space-y-4">
        {selected ? (
          <ConversionEditor
            videoId={selected.id}
            v={selected}
            saved={searchParams.saved === "1"}
            error={searchParams.error ?? null}
          />
        ) : (
          <NoSelection />
        )}

        <CtaInsights videos={videos} />
      </div>
    </div>
  );
}

function ConversionEditor({
  videoId,
  v,
  saved,
  error,
}: {
  videoId: string;
  v: ViewtrackVideo;
  saved: boolean;
  error: string | null;
}) {
  const update = async (formData: FormData) => {
    "use server";
    await updateVideo(videoId, formData);
  };

  return (
    <section className="space-y-4">
      <FlashBanner saved={saved} error={error} />

      <header className="border-border bg-card rounded-lg border p-4">
        <p className="text-muted-foreground text-xs">
          {v.video_external_id ?? "—"}
        </p>
        <h2 className="text-base font-semibold tracking-tight">
          {v.final_title || "Untitled"}
        </h2>
      </header>

      <form
        action={update}
        className="border-border bg-card space-y-4 rounded-lg border p-5"
      >
        <input
          type="hidden"
          name="__next"
          value="/dashboard/viewtrack/conversion"
        />
        <div className="grid gap-3 sm:grid-cols-2">
          <Field label="CTAs Used" span={2}>
            <Input
              name="ctas_used"
              defaultValue={v.ctas_used ?? ""}
              placeholder="e.g. Free strategy call · Newsletter signup"
            />
          </Field>
          <Field label="Click-throughs">
            <Input
              type="number"
              name="click_throughs"
              defaultValue={v.click_throughs?.toString() ?? ""}
              placeholder="0"
            />
          </Field>
          <Field label="Engagement Rate" hint="Enter as %, e.g. 4.5">
            <Input
              name="engagement_rate"
              inputMode="decimal"
              defaultValue={pctToDisplay(v.engagement_rate)}
              placeholder="4.5"
            />
          </Field>
          <Field label="Calls Booked">
            <Input
              type="number"
              name="calls_booked"
              defaultValue={v.calls_booked?.toString() ?? ""}
              placeholder="0"
            />
          </Field>
          <Field label="Notes" span={2}>
            <Textarea
              name="notes"
              defaultValue={v.notes ?? ""}
              placeholder="What worked, what didn't, anything worth tracking."
            />
          </Field>
        </div>

        <div className="border-border flex items-center justify-end gap-2 border-t pt-4">
          <SaveButton />
        </div>
      </form>
    </section>
  );
}

function CtaInsights({ videos }: { videos: ViewtrackVideo[] }) {
  // Best CTA by calls booked (groups by cta string)
  type CtaAgg = {
    cta: string;
    calls: number;
    clicks: number;
    videos: number;
  };
  const aggMap = new Map<string, CtaAgg>();
  for (const v of videos) {
    const cta = v.ctas_used?.trim();
    if (!cta) continue;
    const cur =
      aggMap.get(cta) ??
      ({ cta, calls: 0, clicks: 0, videos: 0 } as CtaAgg);
    cur.calls += v.calls_booked ?? 0;
    cur.clicks += v.click_throughs ?? 0;
    cur.videos += 1;
    aggMap.set(cta, cur);
  }
  const aggregates: CtaAgg[] = [];
  aggMap.forEach((v) => aggregates.push(v));

  const bestByCalls = [...aggregates].sort((a, b) => b.calls - a.calls)[0];
  const bestByClicks = [...aggregates].sort(
    (a, b) => b.clicks - a.clicks,
  )[0];

  const noConversion = videosWithViewsButNoConversion(videos);

  return (
    <section className="space-y-3">
      <h3 className="text-foreground text-sm font-semibold tracking-tight">
        CTA insights
      </h3>
      <div className="grid gap-3 lg:grid-cols-3">
        <Insight title="Best CTA by Calls Booked">
          {bestByCalls && bestByCalls.calls > 0 ? (
            <>
              <p className="text-foreground text-base font-semibold">
                {bestByCalls.cta}
              </p>
              <p className="text-muted-foreground text-xs">
                {fmtNum(bestByCalls.calls)} calls across {bestByCalls.videos}{" "}
                video{bestByCalls.videos === 1 ? "" : "s"}
              </p>
            </>
          ) : (
            <p className="text-muted-foreground text-xs">No calls logged yet.</p>
          )}
        </Insight>

        <Insight title="Best CTA by Click-throughs">
          {bestByClicks && bestByClicks.clicks > 0 ? (
            <>
              <p className="text-foreground text-base font-semibold">
                {bestByClicks.cta}
              </p>
              <p className="text-muted-foreground text-xs">
                {fmtNum(bestByClicks.clicks)} clicks across{" "}
                {bestByClicks.videos} video
                {bestByClicks.videos === 1 ? "" : "s"}
              </p>
            </>
          ) : (
            <p className="text-muted-foreground text-xs">
              No click-throughs logged yet.
            </p>
          )}
        </Insight>

        <Insight title="Views but no conversion">
          {noConversion.length === 0 ? (
            <p className="text-muted-foreground text-xs">
              All videos with views have at least some conversion. Nice.
            </p>
          ) : (
            <>
              <p className="text-foreground text-base font-semibold">
                {noConversion.length} video
                {noConversion.length === 1 ? "" : "s"}
              </p>
              <ul className="text-muted-foreground mt-1 space-y-0.5 text-xs">
                {noConversion.slice(0, 4).map((v) => (
                  <li key={v.id} className="truncate">
                    {v.video_external_id ?? "—"} ·{" "}
                    {v.final_title || "Untitled"}
                    <span className="ml-1 tabular-nums">
                      ({fmtNum(v.views_7d)} views,{" "}
                      {fmtPct(v.ctr_7d, 2)} CTR)
                    </span>
                  </li>
                ))}
                {noConversion.length > 4 ? (
                  <li>+{noConversion.length - 4} more</li>
                ) : null}
              </ul>
            </>
          )}
        </Insight>
      </div>
    </section>
  );
}

function Insight({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="border-border bg-card rounded-lg border p-4">
      <p className="text-muted-foreground mb-2 text-xs tracking-wide uppercase">
        {title}
      </p>
      {children}
    </div>
  );
}

function NoSelection() {
  return (
    <div className="border-border bg-muted/30 flex items-center justify-center rounded-lg border border-dashed p-12">
      <div className="text-center">
        <p className="text-foreground text-sm font-medium">
          Pick a video on the left
        </p>
        <p className="text-muted-foreground mt-1 text-xs">
          Or{" "}
          <Link
            href="/dashboard/viewtrack/identity"
            className="underline underline-offset-2"
          >
            add a new one on the Identity tab
          </Link>
          .
        </p>
      </div>
    </div>
  );
}
