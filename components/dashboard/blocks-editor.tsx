"use client";

import { useState, useTransition } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { BlockFormFields } from "./block-form-fields";
import {
  ArrowDown,
  ArrowUp,
  Eye,
  EyeOff,
  Pencil,
  Plus,
  Trash2,
} from "lucide-react";

export type EditorBlock = {
  id: string;
  type: string;
  position: number;
  config: Record<string, unknown> | null;
  is_visible: boolean;
};

const TYPE_LABELS: Record<string, string> = {
  hero: "Hero",
  link: "Link",
  header: "Heading",
  text: "Text",
  features: "Features grid",
  testimonial: "Testimonial",
  pricing: "Pricing",
  stats: "Stats",
  faq: "FAQ",
  cta: "Call to action",
  email_form: "Email form",
  video_embed: "Video",
  social_icons: "Social icons",
  image: "Image",
  divider: "Divider",
  product: "Product",
};

// Two groups in the picker: simple link-page blocks first, then full-width
// landing sections. Order roughly by what creators reach for most.
const TYPE_ORDER = [
  "link",
  "header",
  "text",
  "email_form",
  "video_embed",
  "social_icons",
  "image",
  "divider",
  "product",
  // landing-page section types
  "hero",
  "features",
  "testimonial",
  "pricing",
  "stats",
  "faq",
  "cta",
];

function summarize(block: EditorBlock): string {
  const c = (block.config ?? {}) as Record<string, unknown>;
  const truncate = (s: string) => (s.length > 80 ? `${s.slice(0, 77)}…` : s);
  switch (block.type) {
    case "link":
      return (c.text as string) || (c.url as string) || "—";
    case "header":
    case "text":
      return truncate((c.text as string) || "—");
    case "email_form":
      return (c.heading as string) || "Email signup";
    case "video_embed":
      return (c.url as string) || "—";
    case "social_icons": {
      const ps = Array.isArray(c.platforms)
        ? (c.platforms as { type: string }[])
        : [];
      return ps.length
        ? ps.map((p) => p.type).join(", ")
        : "(no platforms set)";
    }
    case "image":
      return (c.alt as string) || (c.url as string) || "—";
    case "divider":
      return "—";
    case "product":
      return (c.title as string) || (c.url as string) || "—";
    case "hero":
      return truncate((c.heading as string) || "(empty hero)");
    case "testimonial":
      return truncate((c.quote as string) || "(empty testimonial)");
    case "features": {
      const items = Array.isArray(c.items)
        ? (c.items as { title?: string }[])
        : [];
      const filled = items.filter((i) => i.title).length;
      return (c.heading as string)
        ? `${c.heading} · ${filled} item${filled === 1 ? "" : "s"}`
        : `${filled} feature${filled === 1 ? "" : "s"}`;
    }
    case "cta":
      return truncate((c.heading as string) || "(empty CTA)");
    case "faq": {
      const items = Array.isArray(c.items)
        ? (c.items as { question?: string }[])
        : [];
      const filled = items.filter((i) => i.question).length;
      return `${filled} question${filled === 1 ? "" : "s"}`;
    }
    case "pricing": {
      const tiers = Array.isArray(c.tiers)
        ? (c.tiers as { name?: string }[])
        : [];
      const filled = tiers.filter((t) => t.name).length;
      return `${filled} tier${filled === 1 ? "" : "s"}`;
    }
    case "stats": {
      const items = Array.isArray(c.items)
        ? (c.items as { value?: string }[])
        : [];
      const filled = items.filter((i) => i.value).length;
      return `${filled} stat${filled === 1 ? "" : "s"}`;
    }
    default:
      return "—";
  }
}

export function BlocksEditor({
  pageId,
  blocks,
  template,
  onCreate,
  onUpdate,
  onDelete,
  onToggleVisibility,
  onMove,
  onSeedStarter,
}: {
  pageId: string;
  blocks: EditorBlock[];
  template: "bio" | "landing";
  onCreate: (formData: FormData) => Promise<void>;
  onUpdate: (blockId: string, formData: FormData) => Promise<void>;
  onDelete: (blockId: string) => Promise<void>;
  onToggleVisibility: (blockId: string) => Promise<void>;
  onMove: (blockId: string, direction: "up" | "down") => Promise<void>;
  onSeedStarter: (kind: "bio" | "landing") => Promise<void>;
}) {
  const [editing, setEditing] = useState<EditorBlock | null>(null);
  const [adding, setAdding] = useState<string | null>(null);
  const [, startTransition] = useTransition();

  return (
    <div className="space-y-3">
      {blocks.length === 0 ? (
        <div className="rounded-md border border-dashed px-4 py-8 text-center">
          <p className="text-muted-foreground text-sm">
            No blocks yet. Start from a template, or build from scratch with
            the picker below.
          </p>
          <div className="mt-4 flex flex-wrap items-center justify-center gap-2">
            <Button
              type="button"
              size="sm"
              variant={template === "bio" ? "default" : "outline"}
              onClick={() => {
                startTransition(() => {
                  onSeedStarter("bio");
                });
              }}
            >
              Use bio starter
            </Button>
            <Button
              type="button"
              size="sm"
              variant={template === "landing" ? "default" : "outline"}
              onClick={() => {
                startTransition(() => {
                  onSeedStarter("landing");
                });
              }}
            >
              Use landing starter
            </Button>
          </div>
          <p className="text-muted-foreground mt-3 text-xs">
            Starter packs add 4–5 sample blocks you can edit or delete.
          </p>
        </div>
      ) : null}

      <ul className="space-y-2">
        {blocks.map((block, i) => (
          <li
            key={block.id}
            className="border-border bg-background flex items-center gap-3 rounded-lg border p-3"
          >
            <div className="min-w-0 flex-1">
              <div className="text-muted-foreground flex items-center gap-2 text-xs">
                <span className="bg-muted text-foreground rounded px-1.5 py-0.5 font-medium">
                  {TYPE_LABELS[block.type] ?? block.type}
                </span>
                {!block.is_visible ? (
                  <span className="text-amber-700 dark:text-amber-400">
                    hidden
                  </span>
                ) : null}
              </div>
              <p className="mt-1 truncate text-sm">{summarize(block)}</p>
            </div>

            <div className="flex shrink-0 items-center gap-1">
              <IconButton
                title="Move up"
                disabled={i === 0}
                onClick={() =>
                  startTransition(() => {
                    onMove(block.id, "up");
                  })
                }
              >
                <ArrowUp className="size-3.5" />
              </IconButton>
              <IconButton
                title="Move down"
                disabled={i === blocks.length - 1}
                onClick={() =>
                  startTransition(() => {
                    onMove(block.id, "down");
                  })
                }
              >
                <ArrowDown className="size-3.5" />
              </IconButton>
              <IconButton
                title={block.is_visible ? "Hide" : "Show"}
                onClick={() =>
                  startTransition(() => {
                    onToggleVisibility(block.id);
                  })
                }
              >
                {block.is_visible ? (
                  <Eye className="size-3.5" />
                ) : (
                  <EyeOff className="size-3.5" />
                )}
              </IconButton>
              <IconButton title="Edit" onClick={() => setEditing(block)}>
                <Pencil className="size-3.5" />
              </IconButton>
              <IconButton
                title="Delete"
                onClick={() => {
                  if (confirm("Delete this block?")) {
                    startTransition(() => {
                      onDelete(block.id);
                    });
                  }
                }}
              >
                <Trash2 className="size-3.5" />
              </IconButton>
            </div>
          </li>
        ))}
      </ul>

      <div className="pt-1">
        <DropdownMenu>
          <DropdownMenuTrigger
            render={(props) => (
              <Button {...props} variant="outline" size="sm">
                <Plus className="size-4" />
                Add block
              </Button>
            )}
          />
          <DropdownMenuContent>
            {TYPE_ORDER.map((t) => (
              <DropdownMenuItem
                key={t}
                onClick={() => {
                  setAdding(t);
                }}
              >
                {TYPE_LABELS[t]}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Add-block dialog: opens with the chosen type */}
      <Dialog
        open={adding !== null}
        onOpenChange={(open) => {
          if (!open) setAdding(null);
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              Add {adding ? (TYPE_LABELS[adding] ?? adding) : "block"}
            </DialogTitle>
            <DialogDescription>
              Configure the block, then save it to your page.
            </DialogDescription>
          </DialogHeader>
          {adding ? (
            <form
              action={(fd) => {
                fd.set("type", adding);
                startTransition(async () => {
                  await onCreate(fd);
                  setAdding(null);
                });
              }}
              className="space-y-4"
            >
              <input type="hidden" name="type" value={adding} />
              <BlockFormFields type={adding} config={{}} />
              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setAdding(null)}
                >
                  Cancel
                </Button>
                <Button type="submit">Add block</Button>
              </DialogFooter>
            </form>
          ) : null}
        </DialogContent>
      </Dialog>

      {/* Edit-block dialog */}
      <Dialog
        open={editing !== null}
        onOpenChange={(open) => {
          if (!open) setEditing(null);
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              Edit {editing ? (TYPE_LABELS[editing.type] ?? editing.type) : ""}
            </DialogTitle>
            <DialogDescription>
              Changes appear on your public page right after saving.
            </DialogDescription>
          </DialogHeader>
          {editing ? (
            <form
              key={editing.id}
              action={(fd) => {
                fd.set("type", editing.type);
                startTransition(async () => {
                  await onUpdate(editing.id, fd);
                  setEditing(null);
                });
              }}
              className="space-y-4"
            >
              <input type="hidden" name="type" value={editing.type} />
              <BlockFormFields
                type={editing.type}
                config={(editing.config ?? {}) as Record<string, unknown>}
              />
              <div className="border-border flex items-center justify-between rounded-md border px-3 py-2">
                <div className="space-y-0.5">
                  <Label htmlFor="is_visible" className="text-sm">
                    Visible on page
                  </Label>
                  <p className="text-muted-foreground text-xs">
                    Hidden blocks are still saved but won&apos;t render.
                  </p>
                </div>
                <Switch
                  id="is_visible"
                  name="is_visible"
                  defaultChecked={editing.is_visible}
                />
              </div>
              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setEditing(null)}
                >
                  Cancel
                </Button>
                <Button type="submit">Save block</Button>
              </DialogFooter>
            </form>
          ) : null}
        </DialogContent>
      </Dialog>

      {/* Suppress unused warning */}
      <input type="hidden" value={pageId} readOnly />
    </div>
  );
}

function IconButton({
  children,
  title,
  disabled,
  onClick,
}: {
  children: React.ReactNode;
  title: string;
  disabled?: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      title={title}
      aria-label={title}
      disabled={disabled}
      onClick={onClick}
      className="hover:bg-muted text-muted-foreground hover:text-foreground inline-flex size-7 items-center justify-center rounded-md transition-colors disabled:opacity-30"
    >
      {children}
    </button>
  );
}
