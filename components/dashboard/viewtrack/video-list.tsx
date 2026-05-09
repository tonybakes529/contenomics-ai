"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Plus, Search } from "lucide-react";
import { useMemo, useState } from "react";
import { cn } from "@/lib/utils";
import type { ViewtrackVideo } from "@/lib/types/database";

export function VideoList({
  videos,
  selectedId,
  basePath,
}: {
  videos: ViewtrackVideo[];
  selectedId: string | null;
  basePath: string;
}) {
  const router = useRouter();
  const search = useSearchParams();
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return videos;
    return videos.filter((v) =>
      [v.video_external_id, v.final_title, v.topic]
        .filter(Boolean)
        .some((s) => s!.toLowerCase().includes(q)),
    );
  }, [videos, query]);

  function selectId(id: string | null) {
    const params = new URLSearchParams(search.toString());
    if (id) params.set("selected", id);
    else params.delete("selected");
    params.delete("saved");
    params.delete("error");
    params.delete("deleted");
    router.push(`${basePath}?${params.toString()}`, { scroll: false });
  }

  return (
    <aside className="border-border bg-card flex flex-col rounded-lg border">
      <div className="border-border space-y-2 border-b p-3">
        <button
          type="button"
          onClick={() => selectId(null)}
          className={cn(
            "flex w-full items-center justify-center gap-1.5 rounded-md px-3 py-2 text-sm font-medium transition-colors",
            selectedId === null
              ? "bg-foreground text-background"
              : "border-border bg-background text-foreground hover:bg-muted border",
          )}
        >
          <Plus className="size-3.5" />
          Add a video
        </button>
        <div className="relative">
          <Search className="text-muted-foreground absolute left-2.5 top-1/2 size-3.5 -translate-y-1/2" />
          <input
            type="search"
            placeholder="Search videos…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="border-border bg-background focus:ring-foreground/30 placeholder:text-muted-foreground w-full rounded-md border py-1.5 pr-2.5 pl-8 text-xs focus:outline-none focus:ring-2"
          />
        </div>
      </div>
      <div className="max-h-[70vh] overflow-y-auto p-1.5">
        {filtered.length === 0 ? (
          <p className="text-muted-foreground p-3 text-center text-xs">
            {videos.length === 0 ? "No videos yet." : "No matches."}
          </p>
        ) : (
          <ul className="space-y-0.5">
            {filtered.map((v) => {
              const params = new URLSearchParams(search.toString());
              params.set("selected", v.id);
              params.delete("saved");
              params.delete("error");
              params.delete("deleted");
              const active = v.id === selectedId;
              return (
                <li key={v.id}>
                  <Link
                    href={`${basePath}?${params.toString()}`}
                    scroll={false}
                    className={cn(
                      "flex flex-col gap-0.5 rounded-md px-2.5 py-2 text-left transition-colors",
                      active
                        ? "bg-muted"
                        : "hover:bg-muted/60",
                    )}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-foreground truncate text-xs font-semibold">
                        {v.video_external_id ?? "—"}
                      </span>
                      {typeof v.ctr_7d === "number" ? (
                        <span className="text-muted-foreground shrink-0 text-[10px] tabular-nums">
                          {(v.ctr_7d * 100).toFixed(1)}% CTR
                        </span>
                      ) : null}
                    </div>
                    <span className="text-muted-foreground truncate text-xs">
                      {v.final_title || "Untitled"}
                    </span>
                  </Link>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </aside>
  );
}
