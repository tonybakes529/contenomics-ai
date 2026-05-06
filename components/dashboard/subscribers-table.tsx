"use client";

import { useMemo, useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ListMinus, ListPlus, X } from "lucide-react";

export type FormSubmission = {
  block_id: string | null;
  page_id: string | null;
  submitted_at: string;
  answers: Array<{
    question_id: string;
    label: string;
    type: string;
    value: unknown;
  }>;
};

export type SubscriberRow = {
  id: string;
  email: string;
  name: string | null;
  status: string;
  source_page_id: string | null;
  source_slug: string | null;
  source_block_id: string | null;
  created_at: string;
  confirmed_at: string | null;
  unsubscribed_at: string | null;
  form_submissions: FormSubmission[];
  list_ids: string[];
};

export type ListRow = {
  id: string;
  name: string;
  color: string | null;
};

const STATUS_STYLES: Record<string, string> = {
  confirmed: "bg-foreground text-background",
  pending: "bg-amber-100 text-amber-900",
  unsubscribed: "bg-muted text-muted-foreground",
  bounced: "bg-destructive/15 text-destructive",
};

export function SubscribersTable({
  rows,
  lists,
  emptyMessage,
  filterListId,
  onAssign,
  onRemoveFromList,
  onBulkRemoveFromList,
}: {
  rows: SubscriberRow[];
  lists: ListRow[];
  emptyMessage: string;
  // When set, the table is currently filtered to a specific list, which
  // unlocks the "Remove from this list" bulk action.
  filterListId: string | null;
  onAssign: (subscriberIds: string[], listId: string) => Promise<void>;
  onRemoveFromList: (subscriberId: string, listId: string) => Promise<void>;
  onBulkRemoveFromList: (
    subscriberIds: string[],
    listId: string,
  ) => Promise<void>;
}) {
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [picker, setPicker] = useState(false);
  const [detail, setDetail] = useState<SubscriberRow | null>(null);
  const [, startTransition] = useTransition();

  const listsById = useMemo(
    () => new Map(lists.map((l) => [l.id, l])),
    [lists],
  );

  const allVisibleIds = useMemo(() => rows.map((r) => r.id), [rows]);
  const allSelected =
    rows.length > 0 && rows.every((r) => selected.has(r.id));
  const someSelected = selected.size > 0;

  function toggleAll() {
    setSelected((prev) => {
      const next = new Set(prev);
      if (allSelected) {
        for (const id of allVisibleIds) next.delete(id);
      } else {
        for (const id of allVisibleIds) next.add(id);
      }
      return next;
    });
  }

  function toggleOne(id: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function clearSelection() {
    setSelected(new Set());
  }

  function pickList(listId: string) {
    const ids = Array.from(selected);
    if (ids.length === 0) return;
    startTransition(async () => {
      await onAssign(ids, listId);
      setPicker(false);
      clearSelection();
    });
  }

  function bulkRemove() {
    if (!filterListId) return;
    const ids = Array.from(selected);
    if (ids.length === 0) return;
    if (
      !confirm(
        `Remove ${ids.length} subscriber${ids.length === 1 ? "" : "s"} from this list?`,
      )
    ) {
      return;
    }
    startTransition(async () => {
      await onBulkRemoveFromList(ids, filterListId);
      clearSelection();
    });
  }

  return (
    <div className="space-y-3">
      {someSelected ? (
        <div className="border-foreground/15 bg-foreground/5 flex flex-wrap items-center justify-between gap-2 rounded-md border px-3 py-2 text-sm">
          <span className="tabular-nums">
            {selected.size} selected
          </span>
          <div className="flex items-center gap-1.5">
            <Button
              type="button"
              size="sm"
              variant="outline"
              onClick={() => setPicker(true)}
              disabled={lists.length === 0}
              title={
                lists.length === 0
                  ? "Create a list first in /dashboard/lists"
                  : undefined
              }
            >
              <ListPlus className="size-4" />
              Add to list
            </Button>
            {filterListId ? (
              <Button
                type="button"
                size="sm"
                variant="outline"
                onClick={bulkRemove}
              >
                <ListMinus className="size-4" />
                Remove from this list
              </Button>
            ) : null}
            <Button
              type="button"
              size="sm"
              variant="ghost"
              onClick={clearSelection}
            >
              Clear
            </Button>
          </div>
        </div>
      ) : null}

      <div className="border-border bg-background overflow-hidden rounded-xl border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-10">
                <input
                  type="checkbox"
                  aria-label="Select all"
                  checked={allSelected}
                  onChange={toggleAll}
                  ref={(el) => {
                    if (el) {
                      el.indeterminate = !allSelected && someSelected;
                    }
                  }}
                />
              </TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Lists</TableHead>
              <TableHead>Source</TableHead>
              <TableHead className="text-right">Form responses</TableHead>
              <TableHead className="text-right">Subscribed</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.length > 0 ? (
              rows.map((r) => (
                <TableRow
                  key={r.id}
                  className={selected.has(r.id) ? "bg-muted/30" : undefined}
                >
                  <TableCell>
                    <input
                      type="checkbox"
                      aria-label={`Select ${r.email}`}
                      checked={selected.has(r.id)}
                      onChange={() => toggleOne(r.id)}
                    />
                  </TableCell>
                  <TableCell>
                    <button
                      type="button"
                      onClick={() => setDetail(r)}
                      className="hover:text-foreground/70 font-medium underline-offset-2 hover:underline"
                    >
                      {r.email}
                    </button>
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {r.name ?? "—"}
                  </TableCell>
                  <TableCell>
                    <span
                      className={cn(
                        "rounded-full px-2 py-0.5 text-xs",
                        STATUS_STYLES[r.status] ??
                          "bg-muted text-muted-foreground",
                      )}
                    >
                      {r.status}
                    </span>
                  </TableCell>
                  <TableCell>
                    <SubscriberListPills
                      subscriberId={r.id}
                      listIds={r.list_ids}
                      listsById={listsById}
                      onRemove={onRemoveFromList}
                    />
                  </TableCell>
                  <TableCell className="text-muted-foreground font-mono text-xs">
                    {r.source_slug ?? "—"}
                  </TableCell>
                  <TableCell className="text-right text-xs tabular-nums">
                    {r.form_submissions.length > 0 ? (
                      <button
                        type="button"
                        onClick={() => setDetail(r)}
                        className="bg-muted text-foreground hover:bg-muted/70 rounded-full px-2 py-0.5 transition-colors"
                      >
                        {r.form_submissions.length}
                      </button>
                    ) : (
                      <span className="text-muted-foreground">—</span>
                    )}
                  </TableCell>
                  <TableCell className="text-muted-foreground text-right text-xs">
                    {new Date(r.created_at).toLocaleDateString()}
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={8}
                  className="text-muted-foreground py-12 text-center text-sm"
                >
                  {emptyMessage}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* List picker dialog */}
      <Dialog
        open={picker}
        onOpenChange={(open) => {
          if (!open) setPicker(false);
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add to list</DialogTitle>
            <DialogDescription>
              Pick a list to add the {selected.size} selected
              subscriber{selected.size === 1 ? "" : "s"} to. Already-assigned
              subscribers are skipped.
            </DialogDescription>
          </DialogHeader>
          {lists.length === 0 ? (
            <p className="text-muted-foreground text-sm">
              You haven&apos;t created any lists yet. Head to{" "}
              <a
                href="/dashboard/lists"
                className="text-foreground underline"
              >
                Lists
              </a>{" "}
              to create one.
            </p>
          ) : (
            <div className="space-y-1.5">
              {lists.map((l) => (
                <button
                  key={l.id}
                  type="button"
                  onClick={() => pickList(l.id)}
                  className={cn(
                    "border-border hover:bg-muted/50 flex w-full items-center gap-2.5 rounded-md border p-2.5 text-left text-sm transition-colors",
                  )}
                >
                  <span
                    className="size-3 shrink-0 rounded-full"
                    style={{ backgroundColor: l.color ?? "#9ca3af" }}
                    aria-hidden
                  />
                  <span className="truncate">{l.name}</span>
                </button>
              ))}
            </div>
          )}
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setPicker(false)}
            >
              Cancel
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Detail drawer (Dialog used as a drawer for v1) */}
      <Dialog
        open={detail !== null}
        onOpenChange={(open) => {
          if (!open) setDetail(null);
        }}
      >
        <DialogContent>
          {detail ? (
            <SubscriberDetail
              row={detail}
              lists={lists}
              listsById={listsById}
              onRemoveFromList={onRemoveFromList}
              onAssign={onAssign}
            />
          ) : null}
        </DialogContent>
      </Dialog>
    </div>
  );
}

function SubscriberListPills({
  subscriberId,
  listIds,
  listsById,
  onRemove,
}: {
  subscriberId: string;
  listIds: string[];
  listsById: Map<string, ListRow>;
  onRemove: (subscriberId: string, listId: string) => Promise<void>;
}) {
  const [, startTransition] = useTransition();

  const items = listIds
    .map((id) => listsById.get(id))
    .filter((l): l is ListRow => !!l);

  if (items.length === 0) {
    return <span className="text-muted-foreground text-xs">—</span>;
  }

  return (
    <div className="flex flex-wrap gap-1">
      {items.map((l) => (
        <span
          key={l.id}
          className="border-border bg-background inline-flex items-center gap-1 rounded-full border py-0.5 pr-1 pl-2 text-xs"
        >
          <span
            className="size-2 shrink-0 rounded-full"
            style={{ backgroundColor: l.color ?? "#9ca3af" }}
            aria-hidden
          />
          <span className="truncate max-w-[120px]">{l.name}</span>
          <button
            type="button"
            onClick={() => {
              startTransition(() => {
                onRemove(subscriberId, l.id);
              });
            }}
            className="hover:bg-muted text-muted-foreground hover:text-foreground inline-flex size-4 items-center justify-center rounded-full transition-colors"
            title={`Remove from "${l.name}"`}
            aria-label={`Remove from ${l.name}`}
          >
            <X className="size-2.5" />
          </button>
        </span>
      ))}
    </div>
  );
}

function SubscriberDetail({
  row,
  lists,
  listsById,
  onRemoveFromList,
  onAssign,
}: {
  row: SubscriberRow;
  lists: ListRow[];
  listsById: Map<string, ListRow>;
  onRemoveFromList: (subscriberId: string, listId: string) => Promise<void>;
  onAssign: (subscriberIds: string[], listId: string) => Promise<void>;
}) {
  const [, startTransition] = useTransition();
  // Lists the subscriber isn't already in, for the inline picker.
  const availableLists = lists.filter((l) => !row.list_ids.includes(l.id));

  return (
    <>
      <DialogHeader>
        <DialogTitle className="break-all">{row.email}</DialogTitle>
        <DialogDescription>
          {row.name ?? "No name on file"}
        </DialogDescription>
      </DialogHeader>

      <div className="space-y-5 text-sm">
        {/* Identity / status grid */}
        <div className="grid grid-cols-2 gap-3">
          <Field label="Status">
            <span
              className={cn(
                "inline-flex rounded-full px-2 py-0.5 text-xs",
                STATUS_STYLES[row.status] ?? "bg-muted text-muted-foreground",
              )}
            >
              {row.status}
            </span>
          </Field>
          <Field label="Subscribed">
            {new Date(row.created_at).toLocaleString()}
          </Field>
          {row.confirmed_at ? (
            <Field label="Confirmed">
              {new Date(row.confirmed_at).toLocaleString()}
            </Field>
          ) : null}
          {row.unsubscribed_at ? (
            <Field label="Unsubscribed">
              {new Date(row.unsubscribed_at).toLocaleString()}
            </Field>
          ) : null}
          <Field label="Source page">
            {row.source_slug ? (
              <span className="font-mono text-xs">{row.source_slug}</span>
            ) : (
              <span className="text-muted-foreground">—</span>
            )}
          </Field>
          {row.source_block_id ? (
            <Field label="Source block">
              <span className="font-mono text-xs">
                {row.source_block_id.slice(0, 8)}…
              </span>
            </Field>
          ) : null}
        </div>

        {/* Lists */}
        <div className="space-y-2">
          <p className="text-muted-foreground text-xs font-medium uppercase tracking-wide">
            Lists
          </p>
          {row.list_ids.length === 0 ? (
            <p className="text-muted-foreground text-xs">
              Not in any lists yet.
            </p>
          ) : (
            <SubscriberListPills
              subscriberId={row.id}
              listIds={row.list_ids}
              listsById={listsById}
              onRemove={onRemoveFromList}
            />
          )}
          {availableLists.length > 0 ? (
            <div>
              <select
                onChange={(e) => {
                  const v = e.target.value;
                  if (!v) return;
                  startTransition(async () => {
                    await onAssign([row.id], v);
                  });
                  e.target.value = "";
                }}
                defaultValue=""
                className="border-border bg-background mt-1 h-8 rounded-md border px-2 text-xs"
              >
                <option value="">+ Add to a list…</option>
                {availableLists.map((l) => (
                  <option key={l.id} value={l.id}>
                    {l.name}
                  </option>
                ))}
              </select>
            </div>
          ) : null}
        </div>

        {/* Form submissions */}
        {row.form_submissions.length > 0 ? (
          <div className="space-y-2">
            <p className="text-muted-foreground text-xs font-medium uppercase tracking-wide">
              Form submissions ({row.form_submissions.length})
            </p>
            <div className="space-y-2">
              {row.form_submissions
                .slice()
                .reverse()
                .map((s, i) => (
                  <details
                    key={i}
                    open={i === 0}
                    className="border-border rounded-md border"
                  >
                    <summary className="hover:bg-muted/40 cursor-pointer px-3 py-2 text-xs">
                      <span className="font-medium">
                        {new Date(s.submitted_at).toLocaleString()}
                      </span>
                      <span className="text-muted-foreground ml-2">
                        · {s.answers.length} answer
                        {s.answers.length === 1 ? "" : "s"}
                      </span>
                    </summary>
                    <dl className="divide-border space-y-0 divide-y">
                      {s.answers.map((a, j) => (
                        <div key={j} className="px-3 py-2">
                          <dt className="text-muted-foreground text-xs">
                            {a.label}
                          </dt>
                          <dd className="mt-0.5 text-sm whitespace-pre-line break-words">
                            {Array.isArray(a.value)
                              ? a.value.join(", ")
                              : a.value === null || a.value === undefined
                                ? "—"
                                : String(a.value)}
                          </dd>
                        </div>
                      ))}
                    </dl>
                  </details>
                ))}
            </div>
          </div>
        ) : null}
      </div>
    </>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-0.5">
      <p className="text-muted-foreground text-xs">{label}</p>
      <div className="text-sm">{children}</div>
    </div>
  );
}
