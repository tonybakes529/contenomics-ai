import {
  getViewtrackContext,
  suggestNextExternalId,
} from "@/lib/viewtrack/queries";
import { VIEWTRACK_PLATFORMS } from "@/lib/types/database";
import { VideoList } from "@/components/dashboard/viewtrack/video-list";
import {
  Field,
  Input,
  Select,
} from "@/components/dashboard/viewtrack/form-fields";
import {
  DeleteButton,
  FlashBanner,
  SaveButton,
} from "@/components/dashboard/viewtrack/save-bar";
import { createVideo, deleteVideo, updateVideo } from "../actions";

export const metadata = { title: "Identity — Viewtrack" };

export default async function IdentityTabPage({
  searchParams,
}: {
  searchParams: { selected?: string; saved?: string; error?: string; deleted?: string };
}) {
  const { videos } = await getViewtrackContext();
  const selectedId = searchParams.selected ?? null;
  const selected = selectedId
    ? videos.find((v) => v.id === selectedId) ?? null
    : null;
  const isNew = selected === null;
  const suggestedId = suggestNextExternalId(videos);

  return (
    <div className="grid gap-4 lg:grid-cols-[280px_1fr]">
      <VideoList
        videos={videos}
        selectedId={selected?.id ?? null}
        basePath="/dashboard/viewtrack/identity"
      />

      <section className="border-border bg-card space-y-4 rounded-lg border p-5">
        <FlashBanner
          saved={searchParams.saved === "1"}
          error={searchParams.error ?? null}
          deleted={searchParams.deleted === "1"}
        />

        <header>
          <h2 className="text-base font-semibold tracking-tight">
            {isNew ? "Add a new video" : selected?.final_title || "Edit video"}
          </h2>
          <p className="text-muted-foreground text-xs">
            Identity captures publishing metadata. Fill what you have — every
            field is optional.
          </p>
        </header>

        <FormBody
          isNew={isNew}
          videoId={selected?.id ?? null}
          defaults={{
            video_external_id: selected?.video_external_id ?? suggestedId,
            date_posted: selected?.date_posted ?? null,
            final_title: selected?.final_title ?? null,
            video_url: selected?.video_url ?? null,
            length_text: selected?.length_text ?? null,
            topic: selected?.topic ?? null,
            platform: selected?.platform ?? "youtube",
          }}
        />
      </section>
    </div>
  );
}

function FormBody({
  isNew,
  videoId,
  defaults,
}: {
  isNew: boolean;
  videoId: string | null;
  defaults: {
    video_external_id: string | null;
    date_posted: string | null;
    final_title: string | null;
    video_url: string | null;
    length_text: string | null;
    topic: string | null;
    platform: string;
  };
}) {
  const action = isNew
    ? createVideo
    : async (formData: FormData) => {
        "use server";
        await updateVideo(videoId!, formData);
      };

  const onDelete = async () => {
    "use server";
    if (videoId) await deleteVideo(videoId);
  };

  return (
    <div className="space-y-4">
      <form action={action} className="space-y-4">
        <input
          type="hidden"
          name="__next"
          value="/dashboard/viewtrack/identity"
        />
        <div className="grid gap-3 sm:grid-cols-2">
          <Field label="Video ID" hint="Auto-suggested as LF-001, LF-002…">
            <Input
              name="video_external_id"
              defaultValue={defaults.video_external_id ?? ""}
              placeholder="LF-001"
            />
          </Field>
          <Field label="Date Posted">
            <Input
              type="date"
              name="date_posted"
              defaultValue={defaults.date_posted ?? ""}
            />
          </Field>
          <Field label="Final Title" span={2}>
            <Input
              name="final_title"
              defaultValue={defaults.final_title ?? ""}
              placeholder="The video's actual title at publish"
            />
          </Field>
          <Field label="Video URL" span={2}>
            <Input
              type="url"
              name="video_url"
              defaultValue={defaults.video_url ?? ""}
              placeholder="https://www.youtube.com/watch?v=…"
            />
          </Field>
          <Field label="Length" hint="Free-form, e.g. 8:42">
            <Input
              name="length_text"
              defaultValue={defaults.length_text ?? ""}
              placeholder="8:42"
            />
          </Field>
          <Field label="Topic">
            <Input
              name="topic"
              defaultValue={defaults.topic ?? ""}
              placeholder="What it's about"
            />
          </Field>
          <Field label="Platform">
            <Select
              name="platform"
              defaultValue={defaults.platform}
              options={VIEWTRACK_PLATFORMS.map((p) => ({
                value: p,
                label: p === "youtube" ? "YouTube" : p === "shorts" ? "Shorts" : "LinkedIn",
              }))}
            />
          </Field>
        </div>

        <div className="border-border flex items-center justify-end gap-2 border-t pt-4">
          <SaveButton label={isNew ? "Add video" : "Save"} />
        </div>
      </form>

      {!isNew ? (
        <form action={onDelete} className="border-border border-t pt-4">
          <DeleteButton />
        </form>
      ) : null}
    </div>
  );
}
