"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Pencil, Plus, Trash2 } from "lucide-react";

export type ListItem = {
  id: string;
  name: string;
  description: string | null;
  color: string | null;
  subscriber_count: number;
};

const DEFAULT_COLORS = [
  "#000000",
  "#374151",
  "#0ea5e9",
  "#10b981",
  "#f59e0b",
  "#ef4444",
  "#8b5cf6",
  "#ec4899",
];

export function ListsManager({
  lists,
  onCreate,
  onUpdate,
  onDelete,
}: {
  lists: ListItem[];
  onCreate: (formData: FormData) => Promise<void>;
  onUpdate: (listId: string, formData: FormData) => Promise<void>;
  onDelete: (listId: string) => Promise<void>;
}) {
  const [adding, setAdding] = useState(false);
  const [editing, setEditing] = useState<ListItem | null>(null);
  const [, startTransition] = useTransition();

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button size="sm" onClick={() => setAdding(true)}>
          <Plus className="size-4" />
          New list
        </Button>
      </div>

      {lists.length === 0 ? (
        <p className="text-muted-foreground rounded-md border border-dashed px-4 py-12 text-center text-sm">
          No lists yet. Create one to start segmenting your subscribers.
        </p>
      ) : (
        <ul className="space-y-2">
          {lists.map((l) => (
            <li
              key={l.id}
              className="border-border bg-background flex items-center gap-3 rounded-lg border p-3"
            >
              <span
                className="size-3 shrink-0 rounded-full"
                style={{ backgroundColor: l.color ?? "#9ca3af" }}
                aria-hidden
              />
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium">{l.name}</p>
                {l.description ? (
                  <p className="text-muted-foreground truncate text-xs">
                    {l.description}
                  </p>
                ) : null}
              </div>
              <span className="text-muted-foreground shrink-0 text-xs">
                {l.subscriber_count.toLocaleString()}
              </span>
              <div className="flex shrink-0 items-center gap-1">
                <button
                  type="button"
                  onClick={() => setEditing(l)}
                  title="Edit"
                  aria-label="Edit"
                  className="hover:bg-muted text-muted-foreground hover:text-foreground inline-flex size-7 items-center justify-center rounded-md transition-colors"
                >
                  <Pencil className="size-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => {
                    if (confirm(`Delete list "${l.name}"?`)) {
                      startTransition(() => {
                        onDelete(l.id);
                      });
                    }
                  }}
                  title="Delete"
                  aria-label="Delete"
                  className="hover:bg-muted text-muted-foreground hover:text-foreground inline-flex size-7 items-center justify-center rounded-md transition-colors"
                >
                  <Trash2 className="size-3.5" />
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}

      {/* Add list dialog */}
      <Dialog
        open={adding}
        onOpenChange={(open) => {
          if (!open) setAdding(false);
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>New list</DialogTitle>
            <DialogDescription>
              A list is a segment for subscribers (e.g. &quot;Newsletter&quot;,
              &quot;Course waitlist&quot;).
            </DialogDescription>
          </DialogHeader>
          <form
            action={(fd) => {
              startTransition(async () => {
                await onCreate(fd);
                setAdding(false);
              });
            }}
            className="space-y-4"
          >
            <ListFormFields />
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setAdding(false)}
              >
                Cancel
              </Button>
              <Button type="submit">Create list</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Edit list dialog */}
      <Dialog
        open={editing !== null}
        onOpenChange={(open) => {
          if (!open) setEditing(null);
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit list</DialogTitle>
          </DialogHeader>
          {editing ? (
            <form
              key={editing.id}
              action={(fd) => {
                startTransition(async () => {
                  await onUpdate(editing.id, fd);
                  setEditing(null);
                });
              }}
              className="space-y-4"
            >
              <ListFormFields list={editing} />
              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setEditing(null)}
                >
                  Cancel
                </Button>
                <Button type="submit">Save changes</Button>
              </DialogFooter>
            </form>
          ) : null}
        </DialogContent>
      </Dialog>
    </div>
  );
}

function ListFormFields({ list }: { list?: ListItem }) {
  return (
    <>
      <div className="space-y-1.5">
        <Label htmlFor="name">Name</Label>
        <Input
          id="name"
          name="name"
          defaultValue={list?.name ?? ""}
          required
          maxLength={60}
          placeholder="Newsletter"
        />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="description">Description (optional)</Label>
        <Textarea
          id="description"
          name="description"
          defaultValue={list?.description ?? ""}
          rows={2}
          placeholder="What this list is for"
        />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="color">Color</Label>
        <div className="flex flex-wrap gap-2">
          {DEFAULT_COLORS.map((c) => (
            <label key={c} className="cursor-pointer">
              <input
                type="radio"
                name="color"
                value={c}
                defaultChecked={list?.color === c}
                className="peer sr-only"
              />
              <span
                className="ring-border peer-checked:ring-foreground inline-block size-6 rounded-full ring-2 ring-offset-2 ring-offset-white transition-shadow"
                style={{ backgroundColor: c }}
              />
            </label>
          ))}
        </div>
      </div>
    </>
  );
}
