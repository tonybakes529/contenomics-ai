"use client";

import { Button } from "@/components/ui/button";

export function DeletePageButton({ action }: { action: () => Promise<void> }) {
  return (
    <form
      action={action}
      onSubmit={(e) => {
        if (
          !confirm(
            "Delete this page and all its blocks? This cannot be undone.",
          )
        ) {
          e.preventDefault();
        }
      }}
    >
      <Button type="submit" variant="destructive" size="sm">
        Delete page
      </Button>
    </form>
  );
}
