"use client";

import { useFormStatus } from "react-dom";
import { Save, Trash2 } from "lucide-react";

export function SaveButton({ label = "Save" }: { label?: string }) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="bg-foreground text-background hover:opacity-90 inline-flex h-9 items-center gap-1.5 rounded-md px-3.5 text-sm font-medium transition-opacity disabled:opacity-60"
    >
      <Save className="size-4" />
      {pending ? "Saving…" : label}
    </button>
  );
}

export function DeleteButton({ label = "Delete" }: { label?: string }) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      onClick={(e) => {
        if (
          !confirm(
            "Delete this video? This removes its data from Viewtrack permanently.",
          )
        ) {
          e.preventDefault();
        }
      }}
      className="border-border text-muted-foreground hover:text-destructive hover:border-destructive/50 inline-flex h-9 items-center gap-1.5 rounded-md border px-3 text-sm font-medium transition-colors disabled:opacity-60"
    >
      <Trash2 className="size-4" />
      {pending ? "Deleting…" : label}
    </button>
  );
}

export function FlashBanner({
  saved,
  error,
  deleted,
}: {
  saved?: boolean;
  error?: string | null;
  deleted?: boolean;
}) {
  if (!saved && !error && !deleted) return null;
  if (error) {
    return (
      <div className="border-destructive/30 bg-destructive/5 text-destructive rounded-md border px-3 py-2 text-xs">
        {error}
      </div>
    );
  }
  if (deleted) {
    return (
      <div className="border-border bg-muted/40 text-muted-foreground rounded-md border px-3 py-2 text-xs">
        Video deleted.
      </div>
    );
  }
  return (
    <div className="border-border bg-muted/40 text-foreground rounded-md border px-3 py-2 text-xs">
      Saved.
    </div>
  );
}
