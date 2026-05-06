import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ArrowLeft, ExternalLink } from "lucide-react";
import {
  deletePage,
  togglePagePublish,
  updatePageMeta,
} from "../actions";
import { DeletePageButton } from "@/components/dashboard/delete-page-button";
import { BlocksEditor } from "@/components/dashboard/blocks-editor";
import { PreviewPane } from "@/components/dashboard/preview-pane";
import {
  createBlock,
  deleteBlock,
  moveBlock,
  seedStarterBlocks,
  toggleBlockVisibility,
  updateBlock,
} from "./blocks-actions";

export const metadata = { title: "Edit page — Contenomics" };
export const dynamic = "force-dynamic";

type SearchParams = { error?: string; saved?: string };

export default async function PageEditor({
  params,
  searchParams,
}: {
  params: { id: string };
  searchParams: SearchParams;
}) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect(`/login?next=/dashboard/pages/${params.id}`);

  const { data: page } = await supabase
    .from("pages")
    .select(
      "id, slug, title, description, is_published, is_default, template, view_count, updated_at",
    )
    .eq("id", params.id)
    .eq("profile_id", user.id)
    .maybeSingle();

  if (!page) notFound();

  const { data: profile } = await supabase
    .from("profiles")
    .select("username")
    .eq("id", user.id)
    .maybeSingle();

  const { data: blocks } = await supabase
    .from("blocks")
    .select("id, type, position, config, is_visible")
    .eq("page_id", page.id)
    .order("position", { ascending: true });

  const updatePageBound = updatePageMeta.bind(null, page.id);
  const togglePublishBound = togglePagePublish.bind(null, page.id);
  const deleteBound = deletePage.bind(null, page.id);

  const createBlockBound = createBlock.bind(null, page.id);
  const updateBlockBound = updateBlock.bind(null, page.id);
  const deleteBlockBound = deleteBlock.bind(null, page.id);
  const toggleBlockVisibilityBound = toggleBlockVisibility.bind(null, page.id);
  const moveBlockBound = moveBlock.bind(null, page.id);
  const seedStarterBound = seedStarterBlocks.bind(null, page.id);

  const publicUrl =
    profile?.username && page.is_default
      ? `/${profile.username}`
      : profile?.username
        ? `/${profile.username}/${page.slug}`
        : null;

  // Preview iframe loads the actual public URL. The public route shows
  // unpublished drafts when the visitor owns the profile (auth-scoped),
  // so the iframe renders without dashboard chrome and stays in lock-step
  // with what published visitors will eventually see.
  // refreshKey changes after every revalidatePath fired by an action, so
  // the iframe re-mounts with fresh content automatically.
  const previewSrc = publicUrl ?? "/";
  const refreshKey = `${page.updated_at}:${blocks?.length ?? 0}`;

  return (
    <div className="flex h-[calc(100vh-3.5rem)] md:h-screen">
      {/* ── Editor sidebar (left) ────────────────────────────────────── */}
      <aside className="border-border w-full space-y-6 overflow-y-auto border-r bg-white px-4 py-6 md:px-6 lg:max-w-[460px] lg:shrink-0">
      <div>
        <Link
          href="/dashboard/pages"
          className="text-muted-foreground hover:text-foreground inline-flex items-center gap-1 text-xs"
        >
          <ArrowLeft className="size-3" />
          All pages
        </Link>
        <div className="mt-2 flex flex-wrap items-end justify-between gap-3">
          <div className="space-y-1">
            <h1 className="text-2xl font-semibold tracking-tight">
              {page.title || "(untitled)"}
            </h1>
            <div className="text-muted-foreground flex items-center gap-2 text-xs">
              <span
                className={
                  page.is_published
                    ? "bg-foreground text-background rounded-full px-2 py-0.5"
                    : "bg-muted text-muted-foreground rounded-full px-2 py-0.5"
                }
              >
                {page.is_published ? "Published" : "Draft"}
              </span>
              {page.is_default ? (
                <span className="bg-muted text-muted-foreground rounded-full px-2 py-0.5">
                  Default
                </span>
              ) : null}
              {publicUrl ? (
                <a
                  href={publicUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 hover:text-foreground"
                >
                  {publicUrl}
                  <ExternalLink className="size-3" />
                </a>
              ) : null}
            </div>
          </div>
          <form action={togglePublishBound}>
            <Button
              type="submit"
              size="sm"
              variant={page.is_published ? "outline" : "default"}
            >
              {page.is_published ? "Unpublish" : "Publish"}
            </Button>
          </form>
        </div>
      </div>

      {searchParams.error ? (
        <div
          role="alert"
          className="border-destructive/30 bg-destructive/5 text-destructive rounded-md border px-4 py-3 text-sm"
        >
          {searchParams.error}
        </div>
      ) : null}
      {searchParams.saved ? (
        <div
          role="status"
          className="border-border bg-muted/50 rounded-md border px-4 py-3 text-sm"
        >
          Changes saved.
        </div>
      ) : null}

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Page details</CardTitle>
          <CardDescription>
            Title shows on the public page; slug is the URL.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form action={updatePageBound} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                name="title"
                defaultValue={page.title ?? ""}
                placeholder="My link page"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="slug">Slug</Label>
              <Input
                id="slug"
                name="slug"
                defaultValue={page.slug}
                placeholder="main"
                pattern="[a-z0-9_-]{1,50}"
                required
              />
              <p className="text-muted-foreground text-xs">
                Default page lives at <code>/{profile?.username ?? "username"}</code>.
                Other pages live at{" "}
                <code>/{profile?.username ?? "username"}/{page.slug}</code>.
              </p>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                name="description"
                defaultValue={page.description ?? ""}
                placeholder="What this page is about (optional, for SEO)."
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label>Template</Label>
              <div className="grid gap-3 sm:grid-cols-2">
                <TemplateOption
                  value="bio"
                  current={page.template}
                  title="Link in bio"
                  description="Mobile-first centered column. Best for the link in your YouTube description."
                />
                <TemplateOption
                  value="landing"
                  current={page.template}
                  title="Landing page"
                  description="Wide, sectioned, desktop-friendly. Good for product launches and sales pitches."
                />
              </div>
            </div>

            <div className="border-border flex items-center justify-between rounded-md border px-3 py-3">
              <div className="space-y-0.5">
                <Label htmlFor="is_published" className="text-sm">
                  Publish this page
                </Label>
                <p className="text-muted-foreground text-xs">
                  When off, visitors get a 404.
                </p>
              </div>
              <Switch
                id="is_published"
                name="is_published"
                defaultChecked={page.is_published}
              />
            </div>

            <div className="border-border flex items-center justify-between rounded-md border px-3 py-3">
              <div className="space-y-0.5">
                <Label htmlFor="is_default" className="text-sm">
                  Default page
                </Label>
                <p className="text-muted-foreground text-xs">
                  The page shown at <code>/username</code>. Only one page can
                  be default.
                </p>
              </div>
              <Switch
                id="is_default"
                name="is_default"
                defaultChecked={page.is_default}
              />
            </div>

            <div className="flex justify-end pt-2">
              <Button type="submit">Save changes</Button>
            </div>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Blocks</CardTitle>
          <CardDescription>
            Add links, headers, email forms, video embeds, and more. Drag-free
            ordering with the up/down arrows.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <BlocksEditor
            pageId={page.id}
            template={page.template}
            blocks={(blocks ?? []).map((b) => ({
              id: b.id,
              type: b.type,
              position: b.position,
              config: (b.config as Record<string, unknown>) ?? null,
              is_visible: b.is_visible,
            }))}
            onCreate={createBlockBound}
            onUpdate={updateBlockBound}
            onDelete={deleteBlockBound}
            onToggleVisibility={toggleBlockVisibilityBound}
            onMove={moveBlockBound}
            onSeedStarter={seedStarterBound}
          />
        </CardContent>
      </Card>

      {!page.is_default ? (
        <Card>
          <CardHeader>
            <CardTitle className="text-destructive text-base">
              Danger zone
            </CardTitle>
            <CardDescription>
              Deleting a page also deletes its blocks. This cannot be undone.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <DeletePageButton action={deleteBound} />
          </CardContent>
        </Card>
      ) : null}
      </aside>

      {/* ── Live preview (right) ─────────────────────────────────────── */}
      <div className="hidden flex-1 lg:block">
        <PreviewPane
          src={previewSrc}
          refreshKey={refreshKey}
          publicHref={publicUrl ?? previewSrc}
        />
      </div>
    </div>
  );
}

function TemplateOption({
  value,
  current,
  title,
  description,
}: {
  value: "bio" | "landing";
  current: string;
  title: string;
  description: string;
}) {
  const checked = current === value;
  return (
    <label
      className={
        checked
          ? "border-foreground bg-foreground/5 ring-foreground/20 cursor-pointer rounded-lg border p-3 ring-2"
          : "border-border hover:bg-muted/40 cursor-pointer rounded-lg border p-3"
      }
    >
      <div className="flex items-start gap-3">
        <input
          type="radio"
          name="template"
          value={value}
          defaultChecked={checked}
          className="mt-1"
        />
        <div className="space-y-1">
          <p className="text-sm font-medium">{title}</p>
          <p className="text-muted-foreground text-xs">{description}</p>
        </div>
      </div>
    </label>
  );
}
