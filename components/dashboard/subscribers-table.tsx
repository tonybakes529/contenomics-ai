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
import { ListPlus, X } from "lucide-react";

export type SubscriberRow = {
  id: string;
  email: string;
  name: string | null;
  status: string;
  source_page_id: string | null;
  source_slug: string | null;
  created_at: string;
  form_submissions_count: number;
  // List ids the subscriber currently belongs to.
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
  onAssign,
  onRemoveFromList,
}: {
  rows: SubscriberRow[];
  lists: ListRow[];
  emptyMessage: string;
  // Server action: bulk-assign selected subscribers to a list.
  onAssign: (subscriberIds: string[], listId: string) => Promise<void>;
  // Server action: remove a single subscriber from a list (used for the
  // tiny × on each list pill in a row).
  onRemoveFromList: (subscriberId: string, listId: string) => Promise<void>;
}) {
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [picker, setPicker] = useState(false);
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

  return (
    <div className="space-y-3">
      {/*
        Selection toolbar — sticks to the top of the table when at
        least one row is selected. Disabled state when no lists exist
        is handled below in the dialog itself.
      */}
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
                  // Indeterminate state when some but not all are selected
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
                  <TableCell className="font-medium">{r.email}</TableCell>
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
                    {r.form_submissions_count > 0 ? (
                      <span className="bg-muted text-foreground rounded-full px-2 py-0.5">
                        {r.form_submissions_count}
                      </span>
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
