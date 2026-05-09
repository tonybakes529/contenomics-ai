import Link from "next/link";
import { getViewtrackContext } from "@/lib/viewtrack/queries";
import { fmtPct } from "@/lib/viewtrack/aggregates";
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
import { CtrChart } from "@/components/dashboard/viewtrack/ctr-chart";
import { updateVideo } from "../actions";

export const metadata = { title: "Performance — Viewtrack" };

export default async function PerformanceTabPage({
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
        basePath="/dashboard/viewtrack/performance"
      />

      {selected ? (
        <PerformanceEditor
          videoId={selected.id}
          v={selected}
          saved={searchParams.saved === "1"}
          error={searchParams.error ?? null}
        />
      ) : (
        <NoSelection />
      )}
    </div>
  );
}

function PerformanceEditor({
  videoId,
  v,
  saved,
  error,
}: {
  videoId: string;
  v: Awaited<ReturnType<typeof getViewtrackContext>>["videos"][number];
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

      {/* KPI row — pure read-only */}
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
        <Kpi label="24hr CTR" value={fmtPct(v.ctr_24h, 2)} />
        <Kpi label="7-day CTR" value={fmtPct(v.ctr_7d, 2)} />
        <Kpi label="30-day CTR" value={fmtPct(v.ctr_30d, 2)} />
        <Kpi label="AVD" value={v.avd ?? "—"} />
        <Kpi label="Drop-off Rate" value={fmtPct(v.drop_off_rate, 1)} />
      </div>

      <div>
        <h3 className="text-foreground mb-2 text-xs font-semibold tracking-wide uppercase">
          CTR trend
        </h3>
        <CtrChart
          ctr24h={v.ctr_24h}
          ctr7d={v.ctr_7d}
          ctr30d={v.ctr_30d}
        />
      </div>

      <form action={update} className="space-y-4">
        <input
          type="hidden"
          name="__next"
          value="/dashboard/viewtrack/performance"
        />

        <Card title="Edit metrics">
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            <Field label="24hr CTR" hint="Enter as %, e.g. 5">
              <Input
                name="ctr_24h"
                inputMode="decimal"
                defaultValue={pctToDisplay(v.ctr_24h)}
                placeholder="5"
              />
            </Field>
            <Field label="7-day CTR">
              <Input
                name="ctr_7d"
                inputMode="decimal"
                defaultValue={pctToDisplay(v.ctr_7d)}
                placeholder="5"
              />
            </Field>
            <Field label="30-day CTR">
              <Input
                name="ctr_30d"
                inputMode="decimal"
                defaultValue={pctToDisplay(v.ctr_30d)}
                placeholder="5"
              />
            </Field>
            <Field label="Drop-off Rate" hint="Enter as %">
              <Input
                name="drop_off_rate"
                inputMode="decimal"
                defaultValue={pctToDisplay(v.drop_off_rate)}
                placeholder="35"
              />
            </Field>
            <Field label="Drop-off Timestamp" hint="e.g. 0:42">
              <Input
                name="drop_off_timestamp"
                defaultValue={v.drop_off_timestamp ?? ""}
                placeholder="0:42"
              />
            </Field>
            <Field label="AVD" hint="Average view duration, e.g. 4:32">
              <Input name="avd" defaultValue={v.avd ?? ""} placeholder="4:32" />
            </Field>
            <Field label="7-day Views">
              <Input
                type="number"
                name="views_7d"
                defaultValue={v.views_7d?.toString() ?? ""}
                placeholder="0"
              />
            </Field>
            <Field label="30-day Views">
              <Input
                type="number"
                name="views_30d"
                defaultValue={v.views_30d?.toString() ?? ""}
                placeholder="0"
              />
            </Field>
          </div>
        </Card>

        <Card title="Drop-off notes">
          <Field label="Notes" span={2}>
            <Textarea
              name="notes"
              defaultValue={v.notes ?? ""}
              placeholder="Why did people stop watching here?"
            />
          </Field>
          <p className="text-muted-foreground mt-1 text-[10px]">
            Note: this writes to the same Notes field used on the Conversion
            tab.
          </p>
        </Card>

        <div className="border-border flex items-center justify-end gap-2 border-t pt-4">
          <SaveButton />
        </div>
      </form>
    </section>
  );
}

function Kpi({ label, value }: { label: string; value: string }) {
  return (
    <div className="border-border bg-card rounded-lg border p-3">
      <p className="text-muted-foreground text-[10px] tracking-wide uppercase">
        {label}
      </p>
      <p className="text-foreground mt-1 text-xl font-semibold tabular-nums">
        {value}
      </p>
    </div>
  );
}

function Card({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="border-border bg-card rounded-lg border p-5">
      <h3 className="text-foreground mb-3 text-sm font-semibold tracking-tight">
        {title}
      </h3>
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
