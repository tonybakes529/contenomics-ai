import Link from "next/link";
import { ImageIcon } from "lucide-react";
import { getViewtrackContext } from "@/lib/viewtrack/queries";
import {
  VIEWTRACK_BACKGROUNDS,
  VIEWTRACK_COLOR_PALETTES,
  VIEWTRACK_FACE_EMOTIONS,
  VIEWTRACK_HOOK_STYLES,
  VIEWTRACK_TITLE_STYLES,
} from "@/lib/types/database";
import { VideoList } from "@/components/dashboard/viewtrack/video-list";
import {
  Field,
  Input,
  Select,
  Textarea,
} from "@/components/dashboard/viewtrack/form-fields";
import {
  FlashBanner,
  SaveButton,
} from "@/components/dashboard/viewtrack/save-bar";
import { updateVideo } from "../actions";

export const metadata = { title: "Creative — Viewtrack" };

export default async function CreativeTabPage({
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
        basePath="/dashboard/viewtrack/creative"
      />

      {selected ? (
        <CreativeEditor
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

function CreativeEditor({
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

      <form action={update} className="space-y-4">
        <input
          type="hidden"
          name="__next"
          value="/dashboard/viewtrack/creative"
        />

        {/* Title Testing */}
        <Card title="Title Testing" subtitle="A/B variants and the winner.">
          <div className="grid gap-3 sm:grid-cols-2">
            <Field label="A/B Title 1" span={2}>
              <Input name="ab_title_1" defaultValue={v.ab_title_1 ?? ""} />
            </Field>
            <Field label="A/B Title 2" span={2}>
              <Input name="ab_title_2" defaultValue={v.ab_title_2 ?? ""} />
            </Field>
            <Field label="A/B Title 3" span={2}>
              <Input name="ab_title_3" defaultValue={v.ab_title_3 ?? ""} />
            </Field>
            <Field label="Winning Title #">
              <Select
                name="winning_title_num"
                defaultValue={v.winning_title_num?.toString() ?? null}
                options={[
                  { value: "1", label: "1" },
                  { value: "2", label: "2" },
                  { value: "3", label: "3" },
                ]}
              />
            </Field>
            <Field label="Winning Style">
              <Select
                name="winning_style"
                defaultValue={v.winning_style ?? null}
                options={VIEWTRACK_TITLE_STYLES.map((s) => ({
                  value: s,
                  label: s,
                }))}
              />
            </Field>
          </div>
        </Card>

        {/* Hook */}
        <Card
          title="Hook"
          subtitle="The first 3 seconds. The most important thing on the page."
        >
          <div className="grid gap-3 sm:grid-cols-2">
            <Field label="Hook Script" span={2}>
              <Textarea
                name="hook_script"
                defaultValue={v.hook_script ?? ""}
                placeholder="What you actually said in the opening seconds…"
              />
            </Field>
            <Field label="Hook Style">
              <Select
                name="hook_style"
                defaultValue={v.hook_style ?? null}
                options={VIEWTRACK_HOOK_STYLES.map((s) => ({
                  value: s,
                  label: s,
                }))}
              />
            </Field>
            <Field label="Intro Length (sec)">
              <Input
                type="number"
                step="0.1"
                name="intro_length_sec"
                defaultValue={v.intro_length_sec?.toString() ?? ""}
                placeholder="e.g. 12"
              />
            </Field>
            <Field label="Time-to-Value (sec)">
              <Input
                type="number"
                step="0.1"
                name="time_to_value_sec"
                defaultValue={v.time_to_value_sec?.toString() ?? ""}
                placeholder="When the payoff begins"
              />
            </Field>
          </div>
        </Card>

        {/* Thumbnail */}
        <Card
          title="Thumbnail"
          subtitle="Upload the actual thumbnail and tag the visual choices behind it."
        >
          <div className="grid gap-4 sm:grid-cols-[200px_1fr]">
            {/* Upload + preview */}
            <div className="space-y-2">
              <div className="border-border bg-muted/30 relative aspect-video w-full overflow-hidden rounded-md border">
                {v.thumbnail_url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={v.thumbnail_url}
                    alt="Thumbnail"
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="flex h-full items-center justify-center">
                    <ImageIcon className="text-muted-foreground size-6" />
                  </div>
                )}
              </div>
              <input
                type="file"
                name="thumbnail_file"
                accept="image/*"
                className="text-foreground file:bg-foreground file:text-background hover:file:opacity-90 block w-full text-xs file:mr-2 file:rounded-md file:border-0 file:px-2.5 file:py-1.5 file:text-xs file:font-medium"
              />
              <p className="text-muted-foreground text-[10px]">
                JPG/PNG/WebP. Replaces existing thumbnail when saved.
              </p>
            </div>

            {/* Tags */}
            <div className="grid gap-3 sm:grid-cols-2">
              <Field label="Face Y/N">
                <Select
                  name="face_yn"
                  defaultValue={v.face_yn ?? null}
                  options={[
                    { value: "Y", label: "Yes" },
                    { value: "N", label: "No" },
                  ]}
                />
              </Field>
              <Field label="Face Emotion">
                <Select
                  name="face_emotion"
                  defaultValue={v.face_emotion ?? null}
                  options={VIEWTRACK_FACE_EMOTIONS.map((s) => ({
                    value: s,
                    label: s,
                  }))}
                />
              </Field>
              <Field label="Background">
                <Select
                  name="background"
                  defaultValue={v.background ?? null}
                  options={VIEWTRACK_BACKGROUNDS.map((s) => ({
                    value: s,
                    label: s,
                  }))}
                />
              </Field>
              <Field label="Color Palette">
                <Select
                  name="color_palette"
                  defaultValue={v.color_palette ?? null}
                  options={VIEWTRACK_COLOR_PALETTES.map((s) => ({
                    value: s,
                    label: s,
                  }))}
                />
              </Field>
              <Field label="Word Count">
                <Input
                  type="number"
                  name="word_count"
                  defaultValue={v.word_count?.toString() ?? ""}
                  placeholder="Words on the thumbnail"
                />
              </Field>
              <Field label="Words Used">
                <Input
                  name="words_used"
                  defaultValue={v.words_used ?? ""}
                  placeholder="The actual words"
                />
              </Field>
              <Field label="Thumbnail Notes" span={2}>
                <Textarea
                  name="thumbnail_notes"
                  defaultValue={v.thumbnail_notes ?? ""}
                  placeholder="Anything else worth remembering about the thumb."
                />
              </Field>
            </div>
          </div>
        </Card>

        <div className="border-border flex items-center justify-end gap-2 border-t pt-4">
          <SaveButton />
        </div>
      </form>
    </section>
  );
}

function Card({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="border-border bg-card rounded-lg border p-5">
      <header className="mb-3">
        <h3 className="text-foreground text-sm font-semibold tracking-tight">
          {title}
        </h3>
        {subtitle ? (
          <p className="text-muted-foreground text-xs">{subtitle}</p>
        ) : null}
      </header>
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
