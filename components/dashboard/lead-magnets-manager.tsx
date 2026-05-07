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
import { Copy, ExternalLink, Pencil, Plus, Trash2 } from "lucide-react";

export type LeadMagnetItem = {
  id: string;
  name: string;
  description: string | null;
  download_url: string;
  file_label: string | null;
  default_heading: string | null;
  default_description: string | null;
  default_button_text: string | null;
  list_id: string | null;
  download_count: number;
  block_use_count: number;
  updated_at: string;
};

export type ListChoice = {
  id: string;
  name: string;
  color: string | null;
};

export function LeadMagnetsManager({
  magnets,
  lists,
  onCreate,
  onUpdate,
  onDelete,
}: {
  magnets: LeadMagnetItem[];
  lists: ListChoice[];
  onCreate: (formData: FormData) => Promise<void>;
  onUpdate: (id: string, formData: FormData) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
}) {
  const [adding, setAdding] = useState(false);
  const [editing, setEditing] = useState<LeadMagnetItem | null>(null);
  const [, startTransition] = useTransition();

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button size="sm" onClick={() => setAdding(true)}>
          <Plus className="size-4" />
          New lead magnet
        </Button>
      </div>

      {magnets.length === 0 ? (
        <div className="rounded-md border border-dashed px-4 py-12 text-center">
          <p className="text-muted-foreground text-sm">
            No lead magnets yet.
          </p>
          <p className="text-muted-foreground mt-1 text-xs">
            Create one and reference it from any{" "}
            <code className="bg-muted rounded px-1">Lead magnet</code> block —
            update the URL or copy in one place, and every page that uses
            it stays in sync.
          </p>
        </div>
      ) : (
        <ul className="space-y-2">
          {magnets.map((m) => (
            <li
              key={m.id}
              className="border-border bg-background flex items-center gap-3 rounded-lg border p-4"
            >
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <p className="truncate text-sm font-medium">{m.name}</p>
                  {m.block_use_count > 0 ? (
                    <span className="bg-muted text-muted-foreground rounded-full px-2 py-0.5 text-xs">
                      Used in {m.block_use_count} block
                      {m.block_use_count === 1 ? "" : "s"}
                    </span>
                  ) : (
                    <span className="text-muted-foreground rounded-full px-2 py-0.5 text-xs">
                      Not used yet
                    </span>
                  )}
                </div>
                <a
                  href={m.download_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-muted-foreground hover:text-foreground mt-0.5 inline-flex items-center gap-1 truncate font-mono text-xs"
                >
                  {m.download_url}
                  <ExternalLink className="size-3 shrink-0" />
                </a>
                {m.description ? (
                  <p className="text-muted-foreground mt-1 truncate text-xs">
                    {m.description}
                  </p>
                ) : null}
              </div>
              <div className="flex shrink-0 items-center gap-1">
                <button
                  type="button"
                  onClick={() => {
                    navigator.clipboard
                      .writeText(m.id)
                      .catch(() => undefined);
                  }}
                  title="Copy ID"
                  aria-label="Copy ID"
                  className="hover:bg-muted text-muted-foreground hover:text-foreground inline-flex size-7 items-center justify-center rounded-md transition-colors"
                >
                  <Copy className="size-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => setEditing(m)}
                  title="Edit"
                  aria-label="Edit"
                  className="hover:bg-muted text-muted-foreground hover:text-foreground inline-flex size-7 items-center justify-center rounded-md transition-colors"
                >
                  <Pencil className="size-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => {
                    if (confirm(`Delete "${m.name}"?`)) {
                      startTransition(() => {
                        onDelete(m.id);
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

      {/* Create dialog */}
      <Dialog
        open={adding}
        onOpenChange={(open) => {
          if (!open) setAdding(false);
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>New lead magnet</DialogTitle>
            <DialogDescription>
              A lead magnet is a piece of gated content (PDF, Notion page,
              course preview, etc.) you offer in exchange for an email.
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
            <LeadMagnetFormFields lists={lists} />
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setAdding(false)}
              >
                Cancel
              </Button>
              <Button type="submit">Create lead magnet</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Edit dialog */}
      <Dialog
        open={editing !== null}
        onOpenChange={(open) => {
          if (!open) setEditing(null);
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit lead magnet</DialogTitle>
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
              <LeadMagnetFormFields lists={lists} magnet={editing} />
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

function LeadMagnetFormFields({
  lists,
  magnet,
}: {
  lists: ListChoice[];
  magnet?: LeadMagnetItem;
}) {
  return (
    <>
      <div className="space-y-1.5">
        <Label htmlFor="name">Name</Label>
        <Input
          id="name"
          name="name"
          required
          maxLength={120}
          defaultValue={magnet?.name ?? ""}
          placeholder="YouTube Growth Guide"
        />
        <p className="text-muted-foreground text-xs">
          Internal label — only you see this.
        </p>
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="download_url">Download URL</Label>
        <Input
          id="download_url"
          name="download_url"
          type="url"
          required
          defaultValue={magnet?.download_url ?? ""}
          placeholder="https://example.com/guide.pdf"
        />
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label htmlFor="file_label">File label (optional)</Label>
          <Input
            id="file_label"
            name="file_label"
            defaultValue={magnet?.file_label ?? ""}
            placeholder="PDF guide"
          />
          <p className="text-muted-foreground text-xs">
            Shown on the download button.
          </p>
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="list_id">Auto-add to list (optional)</Label>
          <select
            id="list_id"
            name="list_id"
            defaultValue={magnet?.list_id ?? ""}
            className="border-border bg-background h-9 w-full rounded-md border px-2 text-sm"
          >
            <option value="">— none —</option>
            {lists.map((l) => (
              <option key={l.id} value={l.id}>
                {l.name}
              </option>
            ))}
          </select>
        </div>
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="description">Internal note (optional)</Label>
        <Textarea
          id="description"
          name="description"
          rows={2}
          defaultValue={magnet?.description ?? ""}
          placeholder="Where this magnet is used, what it contains, etc."
        />
      </div>
      <div className="border-border space-y-3 border-t pt-4">
        <p className="text-muted-foreground text-xs uppercase tracking-wide">
          Default copy
        </p>
        <p className="text-muted-foreground text-xs">
          What blocks referencing this magnet show by default. Each block
          can override locally.
        </p>
        <div className="space-y-1.5">
          <Label htmlFor="default_heading">Heading</Label>
          <Input
            id="default_heading"
            name="default_heading"
            defaultValue={magnet?.default_heading ?? ""}
            placeholder="Get my free guide"
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="default_description">Description</Label>
          <Textarea
            id="default_description"
            name="default_description"
            rows={2}
            defaultValue={magnet?.default_description ?? ""}
            placeholder="Drop your email and I'll send you the link."
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="default_button_text">Button text</Label>
          <Input
            id="default_button_text"
            name="default_button_text"
            defaultValue={magnet?.default_button_text ?? ""}
            placeholder="Send me the guide"
          />
        </div>
      </div>
    </>
  );
}
