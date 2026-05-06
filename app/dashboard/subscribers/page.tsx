import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Button, buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Download, Search } from "lucide-react";

export const metadata = { title: "Subscribers — Contenomics" };
export const dynamic = "force-dynamic";

const PAGE_SIZE = 50;

type SearchParams = { q?: string; status?: string };

export default async function SubscribersPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login?next=/dashboard/subscribers");

  const q = (searchParams.q ?? "").trim();
  const status = searchParams.status;

  let query = supabase
    .from("subscribers")
    .select(
      "id, email, name, status, source_page_id, created_at, metadata",
      { count: "exact" },
    )
    .eq("profile_id", user.id)
    .order("created_at", { ascending: false })
    .limit(PAGE_SIZE);

  if (q) {
    // Match on email or name
    query = query.or(`email.ilike.%${q}%,name.ilike.%${q}%`);
  }
  const validStatuses = ["pending", "confirmed", "unsubscribed", "bounced"] as const;
  type ValidStatus = (typeof validStatuses)[number];
  if (status && (validStatuses as readonly string[]).includes(status)) {
    query = query.eq("status", status as ValidStatus);
  }

  const { data: rows, count } = await query;

  // Resolve source page slugs for the rows we got back.
  const pageIds = Array.from(
    new Set(rows?.map((r) => r.source_page_id).filter(Boolean) as string[]),
  );
  const pageSlugByIdMap = new Map<string, string>();
  if (pageIds.length > 0) {
    const { data: pages } = await supabase
      .from("pages")
      .select("id, slug")
      .in("id", pageIds);
    pages?.forEach((p) => pageSlugByIdMap.set(p.id, p.slug));
  }

  return (
    <div className="space-y-6 px-4 py-8 md:px-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-2xl font-semibold tracking-tight">Subscribers</h1>
          <p className="text-muted-foreground text-sm">
            Everyone who&apos;s opted in via your bio pages.{" "}
            {typeof count === "number" ? (
              <span>
                {count.toLocaleString()} total
                {q || status ? " matching" : ""}.
              </span>
            ) : null}
          </p>
        </div>
        <Link
          href="/dashboard/subscribers/export"
          className={cn(buttonVariants({ variant: "outline", size: "sm" }))}
          prefetch={false}
        >
          <Download className="size-4" />
          Export CSV
        </Link>
      </div>

      <form className="flex flex-wrap items-center gap-2" action="">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="text-muted-foreground absolute left-3 top-1/2 size-4 -translate-y-1/2" />
          <Input
            name="q"
            defaultValue={q}
            placeholder="Search email or name…"
            className="pl-9"
          />
        </div>
        <select
          name="status"
          defaultValue={status ?? ""}
          className="border-border bg-background h-8 rounded-md border px-2 text-sm"
        >
          <option value="">All statuses</option>
          <option value="confirmed">Confirmed</option>
          <option value="pending">Pending</option>
          <option value="unsubscribed">Unsubscribed</option>
          <option value="bounced">Bounced</option>
        </select>
        <Button type="submit" size="sm">
          Filter
        </Button>
        {q || status ? (
          <Link
            href="/dashboard/subscribers"
            className={cn(buttonVariants({ variant: "ghost", size: "sm" }))}
          >
            Clear
          </Link>
        ) : null}
      </form>

      <div className="border-border bg-background overflow-hidden rounded-xl border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Email</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Source</TableHead>
              <TableHead className="text-right">Form responses</TableHead>
              <TableHead className="text-right">Subscribed</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows && rows.length > 0 ? (
              rows.map((r) => {
                const meta = (r.metadata as
                  | { form_submissions?: unknown[] }
                  | null) ?? {};
                const submissions = Array.isArray(meta.form_submissions)
                  ? meta.form_submissions.length
                  : 0;
                return (
                <TableRow key={r.id}>
                  <TableCell className="font-medium">{r.email}</TableCell>
                  <TableCell className="text-muted-foreground">
                    {r.name ?? "—"}
                  </TableCell>
                  <TableCell>
                    <StatusPill status={r.status} />
                  </TableCell>
                  <TableCell className="text-muted-foreground font-mono text-xs">
                    {r.source_page_id
                      ? (pageSlugByIdMap.get(r.source_page_id) ?? "—")
                      : "—"}
                  </TableCell>
                  <TableCell className="text-right text-xs tabular-nums">
                    {submissions > 0 ? (
                      <span className="bg-muted text-foreground rounded-full px-2 py-0.5">
                        {submissions}
                      </span>
                    ) : (
                      <span className="text-muted-foreground">—</span>
                    )}
                  </TableCell>
                  <TableCell className="text-muted-foreground text-right text-xs">
                    {new Date(r.created_at).toLocaleDateString()}
                  </TableCell>
                </TableRow>
                );
              })
            ) : (
              <TableRow>
                <TableCell
                  colSpan={6}
                  className="text-muted-foreground py-12 text-center text-sm"
                >
                  {q || status
                    ? "No subscribers match those filters."
                    : "No subscribers yet. Add an email block to your page to start collecting."}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {rows && rows.length === PAGE_SIZE ? (
        <p className="text-muted-foreground text-center text-xs">
          Showing the most recent {PAGE_SIZE}. Pagination coming in v1.1.
        </p>
      ) : null}
    </div>
  );
}

function StatusPill({ status }: { status: string }) {
  const styles: Record<string, string> = {
    confirmed: "bg-foreground text-background",
    pending: "bg-amber-100 text-amber-900 dark:bg-amber-900/30 dark:text-amber-300",
    unsubscribed: "bg-muted text-muted-foreground",
    bounced: "bg-destructive/15 text-destructive",
  };
  return (
    <span
      className={cn(
        "rounded-full px-2 py-0.5 text-xs",
        styles[status] ?? "bg-muted text-muted-foreground",
      )}
    >
      {status}
    </span>
  );
}
