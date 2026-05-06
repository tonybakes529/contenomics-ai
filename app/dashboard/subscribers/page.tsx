import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Button, buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { Download, Search } from "lucide-react";
import {
  SubscribersTable,
  type ListRow,
  type SubscriberRow,
} from "@/components/dashboard/subscribers-table";
import {
  assignSubscribersToList,
  removeSubscriberFromList,
} from "./actions";

export const metadata = { title: "Subscribers — Contenomics" };
export const dynamic = "force-dynamic";

const PAGE_SIZE = 50;

type SearchParams = {
  q?: string;
  status?: string;
  list?: string;
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
  const listFilter = searchParams.list;

  // Lists are needed for the picker AND for rendering pills.
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

  // If filtering by list, first fetch the subscriber ids in that list
  // (RLS scopes both tables to the owner so this is safe).
  let listSubscriberIds: string[] | null = null;
  if (listFilter) {
    const { data: junction } = await supabase
      .from("subscriber_lists")
      .select("subscriber_id")
      .eq("list_id", listFilter);
    listSubscriberIds = (junction ?? []).map((j) => j.subscriber_id);
    // Empty list -> no rows match
    if (listSubscriberIds.length === 0) {
      // Short-circuit to an empty result so we don't issue a `.in('id', [])`
      // query (Supabase treats that as "no filter" for some clients).
    }
  }

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
    query = query.or(`email.ilike.%${q}%,name.ilike.%${q}%`);
  }
  const validStatuses = ["pending", "confirmed", "unsubscribed", "bounced"] as const;
  type ValidStatus = (typeof validStatuses)[number];
  if (status && (validStatuses as readonly string[]).includes(status)) {
    query = query.eq("status", status as ValidStatus);
  }
  if (listSubscriberIds) {
    if (listSubscriberIds.length === 0) {
      // Force empty result
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

  // List memberships for the visible subscribers.
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
      ? meta.form_submissions.length
      : 0;
    return {
      id: s.id,
      email: s.email,
      name: s.name,
      status: s.status,
      source_page_id: s.source_page_id,
      source_slug: s.source_page_id
        ? pageSlugByIdMap.get(s.source_page_id) ?? null
        : null,
      created_at: s.created_at,
      form_submissions_count: submissions,
      list_ids: membershipsBySub.get(s.id) ?? [],
    };
  });

  const activeListName = listFilter
    ? lists.find((l) => l.id === listFilter)?.name ?? "Unknown list"
    : null;

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
        emptyMessage={
          q || status || listFilter
            ? "No subscribers match those filters."
            : "No subscribers yet. Add an email or form block to your page to start collecting."
        }
        onAssign={assignSubscribersToList}
        onRemoveFromList={removeSubscriberFromList}
      />

      {rows.length === PAGE_SIZE ? (
        <p className="text-muted-foreground text-center text-xs">
          Showing the most recent {PAGE_SIZE}. Pagination coming in v1.1.
        </p>
      ) : null}
    </div>
  );
}
