import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { createPage } from "./actions";
import { Plus } from "lucide-react";

export const metadata = {
  title: "Pages — Contenomics",
};

export const dynamic = "force-dynamic";

export default async function PagesListPage({
  searchParams,
}: {
  searchParams: { error?: string; deleted?: string };
}) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login?next=/dashboard/pages");

  const { data: pages } = await supabase
    .from("pages")
    .select("id, slug, title, is_published, is_default, view_count, updated_at")
    .eq("profile_id", user.id)
    .order("is_default", { ascending: false })
    .order("updated_at", { ascending: false });

  return (
    <div className="space-y-6 px-4 py-8 md:px-8">
      <div className="flex items-end justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-2xl font-semibold tracking-tight">Pages</h1>
          <p className="text-muted-foreground text-sm">
            Each page is a public bio link. The default one shows at{" "}
            <code className="bg-muted rounded px-1 py-0.5 text-xs">
              /username
            </code>
            .
          </p>
        </div>
        <form action={createPage}>
          <Button type="submit" size="sm">
            <Plus className="size-4" />
            New page
          </Button>
        </form>
      </div>

      {searchParams.error ? (
        <div
          role="alert"
          className="border-destructive/30 bg-destructive/5 text-destructive rounded-md border px-4 py-3 text-sm"
        >
          {searchParams.error}
        </div>
      ) : null}
      {searchParams.deleted ? (
        <div
          role="status"
          className="border-border bg-muted/50 text-foreground rounded-md border px-4 py-3 text-sm"
        >
          Page deleted.
        </div>
      ) : null}

      <div className="border-border bg-background overflow-hidden rounded-xl border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Title</TableHead>
              <TableHead>Slug</TableHead>
              <TableHead className="text-right">Views</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Updated</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {pages && pages.length > 0 ? (
              pages.map((p) => (
                <TableRow key={p.id} className="cursor-pointer">
                  <TableCell>
                    <Link
                      href={`/dashboard/pages/${p.id}`}
                      className="block font-medium underline-offset-2 hover:underline"
                    >
                      {p.title || "(untitled)"}
                    </Link>
                    {p.is_default ? (
                      <span className="text-muted-foreground mt-0.5 block text-xs">
                        Default page
                      </span>
                    ) : null}
                  </TableCell>
                  <TableCell className="font-mono text-xs">{p.slug}</TableCell>
                  <TableCell className="text-right tabular-nums">
                    {(p.view_count ?? 0).toLocaleString()}
                  </TableCell>
                  <TableCell>
                    <StatusPill published={p.is_published} />
                  </TableCell>
                  <TableCell className="text-muted-foreground text-right text-xs">
                    {new Date(p.updated_at).toLocaleDateString()}
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={5} className="text-muted-foreground py-12 text-center text-sm">
                  No pages yet. Click <span className="font-medium">New page</span> to create one.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

function StatusPill({ published }: { published: boolean }) {
  return (
    <span
      className={
        published
          ? "bg-foreground text-background rounded-full px-2 py-0.5 text-xs"
          : "bg-muted text-muted-foreground rounded-full px-2 py-0.5 text-xs"
      }
    >
      {published ? "Published" : "Draft"}
    </span>
  );
}
