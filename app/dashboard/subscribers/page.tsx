import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Button, buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { Download, Search } from "lucide-react";
import {
  SubscribersTable,
  type FormSubmission,
  type ListRow,
  type SubscriberRow,
} from "@/components/dashboard/subscribers-table";
import {
  assignSubscribersToList,
  removeSubscriberFromList,
  removeSubscribersFromList,
} from "./actions";

export const metadata = { title: "Subscribers — Contenomics" };
export const dynamic = "force-dynamic";

const PAGE_SIZE = 50;

type SearchParams = {
  q?: string;
  status?: string;
  list?: string;
  page?: string;
  error?: string;
};

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
  const listFilter = searchParams.list ?? null;

  // Parse + clamp the page number to a sane range.
  const rawPage = parseInt(searchParams.page ?? "1", 10);
  const pageNum =
    Number.isFinite(rawPage) && rawPage >= 1 ? Math.min(rawPage, 10000) : 1;
  const from = (pageNum - 1) * PAGE_SIZE;
  const to = from + PAGE_SIZE - 1;

  // Lists for the picker, pills, and filter dropdown.
  const { data: listsRaw } = await supabase
    .from("lists")
    .select("id, name, color")
    .eq("profile_id", user.id)
    .order("name", { ascending: true });
  const lists: ListRow[] = (listsRaw ?? []).map((l) => ({
    id: l.id,
    name: l.name,
    color: l.color,
  }));

  // Resolve subscriber-id whitelist when filtering by list.
  let listSubscriberIds: string[] | null = null;
  if (listFilter) {
    const { data: junction } = await supabase
      .from("subscriber_lists")
      .select("subscriber_id")
      .eq("list_id", listFilter);
    listSubscriberIds = (junction ?? []).map((j) => j.subscriber_id);
  }

  let query = supabase
    .from("subscribers")
    .select(
      "id, email, name, status, source_page_id, source_block_id, confirmed_at, unsubscribed_at, created_at, metadata",
      { count: "exact" },
    )
    .eq("profile_id", user.id)
    .order("created_at", { ascending: false })
    .range(from, to);

  if (q) {
    query = query.or(`email.ilike.%${q}%,name.ilike.%${q}%`);
  }
  const validStatuses = [
    "pending",
    "confirmed",
    "unsubscribed",
    "bounced",
  ] as const;
  type ValidStatus = (typeof validStatuses)[number];
  if (status && (validStatuses as readonly string[]).includes(status)) {
    query = query.eq("status", status as ValidStatus);
  }
  if (listSubscriberIds) {
    if (listSubscriberIds.length === 0) {
      query = query.eq("id", "00000000-0000-0000-0000-000000000000");
    } else {
      query = query.in("id", listSubscriberIds);
    }
  }

  const { data: subs, count } = await query;

  // Resolve source page slugs.
  const pageIds = Array.from(
    new Set(subs?.map((r) => r.source_page_id).filter(Boolean) as string[]),
  );
  const pageSlugByIdMap = new Map<string, string>();
  if (pageIds.length > 0) {
    const { data: pages } = await supabase
      .from("pages")
      .select("id, slug")
      .in("id", pageIds);
    pages?.forEach((p) => pageSlugByIdMap.set(p.id, p.slug));
  }

  // List memberships for visible rows.
  const subIds = (subs ?? []).map((s) => s.id);
  const membershipsBySub = new Map<string, string[]>();
  if (subIds.length > 0) {
    const { data: memberships } = await supabase
      .from("subscriber_lists")
      .select("subscriber_id, list_id")
      .in("subscriber_id", subIds);
    memberships?.forEach((m) => {
      const arr = membershipsBySub.get(m.subscriber_id) ?? [];
      arr.push(m.list_id);
      membershipsBySub.set(m.subscriber_id, arr);
    });
  }

  const rows: SubscriberRow[] = (subs ?? []).map((s) => {
    const meta = (s.metadata as { form_submissions?: unknown[] } | null) ?? {};
    const submissions = Array.isArray(meta.form_submissions)
      ? (meta.form_submissions as FormSubmission[])
      : [];
    return {
      id: s.id,
      email: s.email,
      name: s.name,
      status: s.status,
      source_page_id: s.source_page_id,
      source_block_id: s.source_block_id,
      source_slug: s.source_page_id
        ? (pageSlugByIdMap.get(s.source_page_id) ?? null)
        : null,
      created_at: s.created_at,
      confirmed_at: s.confirmed_at,
      unsubscribed_at: s.unsubscribed_at,
      form_submissions: submissions,
      list_ids: membershipsBySub.get(s.id) ?? [],
    };
  });

  const activeListName = listFilter
    ? (lists.find((l) => l.id === listFilter)?.name ?? "Unknown list")
    : null;

  const totalCount = count ?? 0;
  const totalPages = Math.max(1, Math.ceil(totalCount / PAGE_SIZE));
  const showingFrom = totalCount === 0 ? 0 : from + 1;
  const showingTo = Math.min(from + rows.length, totalCount);

  // Build a query string for prev/next links that preserves filters.
  const buildHref = (page: number) => {
    const params = new URLSearchParams();
    if (q) params.set("q", q);
    if (status) params.set("status", status);
    if (listFilter) params.set("list", listFilter);
    if (page > 1) params.set("page", String(page));
    const qs = params.toString();
    return `/dashboard/subscribers${qs ? `?${qs}` : ""}`;
  };

  return (
    <div className="space-y-6 px-4 py-8 md:px-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-2xl font-semibold tracking-tight">Subscribers</h1>
          <p className="text-muted-foreground text-sm">
            Everyone who&apos;s opted in via your bio pages.{" "}
            {totalCount > 0 ? (
              <span>
                {totalCount.toLocaleString()} total
                {q || status || listFilter ? " matching" : ""}.
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

      {searchParams.error ? (
        <div
          role="alert"
          className="border-destructive/30 bg-destructive/5 text-destructive rounded-md border px-4 py-3 text-sm"
        >
          {searchParams.error}
        </div>
      ) : null}

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
        <select
          name="list"
          defaultValue={listFilter ?? ""}
          className="border-border bg-background h-8 rounded-md border px-2 text-sm"
        >
          <option value="">All lists</option>
          {lists.map((l) => (
            <option key={l.id} value={l.id}>
              {l.name}
            </option>
          ))}
        </select>
        <Button type="submit" size="sm">
          Filter
        </Button>
        {q || status || listFilter ? (
          <Link
            href="/dashboard/subscribers"
            className={cn(buttonVariants({ variant: "ghost", size: "sm" }))}
          >
            Clear
          </Link>
        ) : null}
      </form>

      {activeListName ? (
        <div className="border-border bg-muted/40 rounded-md border px-3 py-2 text-xs">
          Filtering by list <strong>{activeListName}</strong>.{" "}
          <Link
            href="/dashboard/subscribers"
            className="text-foreground underline"
          >
            Show all
          </Link>
        </div>
      ) : null}

      <SubscribersTable
        rows={rows}
        lists={lists}
        filterListId={listFilter}
        emptyMessage={
          q || status || listFilter
            ? "No subscribers match those filters."
            : "No subscribers yet. Add an email or form block to your page to start collecting."
        }
        onAssign={assignSubscribersToList}
        onRemoveFromList={removeSubscriberFromList}
        onBulkRemoveFromList={removeSubscribersFromList}
      />

      {totalCount > 0 ? (
        <div className="flex flex-wrap items-center justify-between gap-3 text-xs">
          <span className="text-muted-foreground tabular-nums">
            Showing {showingFrom}–{showingTo} of{" "}
            {totalCount.toLocaleString()}
          </span>
          {totalPages > 1 ? (
            <div className="flex items-center gap-1">
              {pageNum > 1 ? (
                <Link
                  href={buildHref(pageNum - 1)}
                  className={cn(buttonVariants({ variant: "outline", size: "sm" }))}
                >
                  ← Prev
                </Link>
              ) : (
                <span
                  className={cn(
                    buttonVariants({ variant: "outline", size: "sm" }),
                    "pointer-events-none opacity-40",
                  )}
                >
                  ← Prev
                </span>
              )}
              <span className="text-muted-foreground tabular-nums px-2">
                Page {pageNum} of {totalPages}
              </span>
              {pageNum < totalPages ? (
                <Link
                  href={buildHref(pageNum + 1)}
                  className={cn(buttonVariants({ variant: "outline", size: "sm" }))}
                >
                  Next →
                </Link>
              ) : (
                <span
                  className={cn(
                    buttonVariants({ variant: "outline", size: "sm" }),
                    "pointer-events-none opacity-40",
                  )}
                >
                  Next →
                </span>
              )}
            </div>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
