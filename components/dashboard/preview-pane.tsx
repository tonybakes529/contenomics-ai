"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ExternalLink, Monitor, RefreshCw, Smartphone, Tablet } from "lucide-react";
import { cn } from "@/lib/utils";

type Device = "desktop" | "tablet" | "mobile";

const DEVICE_WIDTHS: Record<Device, string> = {
  desktop: "w-full",
  tablet: "w-[820px] max-w-full",
  mobile: "w-[420px] max-w-full",
};

export function PreviewPane({
  src,
  refreshKey,
  publicHref,
}: {
  // URL the iframe loads. Should be the editor's /preview route.
  src: string;
  // Bumped on each save by the server (changes whenever page or block
  // data changes), so the iframe re-mounts with fresh content.
  refreshKey: string | number;
  // Href shown by "Open in new tab" — the actual public URL when the
  // page is published, otherwise the same preview src.
  publicHref?: string;
}) {
  const [device, setDevice] = useState<Device>("desktop");
  // Lets the user force a reload without changing data (refreshKey only
  // bumps on actual content changes).
  const [manualKey, setManualKey] = useState(0);

  return (
    <div className="bg-zinc-100 flex h-full flex-col">
      <div className="border-border flex flex-wrap items-center justify-between gap-2 border-b bg-white px-4 py-2">
        <div className="flex items-center gap-1">
          <DeviceButton
            current={device}
            value="desktop"
            label="Desktop"
            onChange={setDevice}
          >
            <Monitor className="size-3.5" />
          </DeviceButton>
          <DeviceButton
            current={device}
            value="tablet"
            label="Tablet"
            onChange={setDevice}
          >
            <Tablet className="size-3.5" />
          </DeviceButton>
          <DeviceButton
            current={device}
            value="mobile"
            label="Mobile"
            onChange={setDevice}
          >
            <Smartphone className="size-3.5" />
          </DeviceButton>
        </div>
        <div className="flex items-center gap-1">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => setManualKey((k) => k + 1)}
            title="Refresh preview"
            aria-label="Refresh preview"
          >
            <RefreshCw className="size-3.5" />
          </Button>
          {publicHref ? (
            <a
              href={publicHref}
              target="_blank"
              rel="noopener noreferrer"
              className="text-muted-foreground hover:text-foreground inline-flex h-7 items-center gap-1 rounded-md px-2 text-xs"
            >
              Open <ExternalLink className="size-3" />
            </a>
          ) : null}
        </div>
      </div>

      <div className="flex flex-1 items-start justify-center overflow-auto p-4">
        <iframe
          key={`${refreshKey}:${manualKey}`}
          src={src}
          title="Page preview"
          className={cn(
            "h-full min-h-full rounded-lg border border-zinc-300 bg-white shadow-sm",
            DEVICE_WIDTHS[device],
          )}
        />
      </div>
    </div>
  );
}

function DeviceButton({
  current,
  value,
  label,
  onChange,
  children,
}: {
  current: Device;
  value: Device;
  label: string;
  onChange: (v: Device) => void;
  children: React.ReactNode;
}) {
  const active = current === value;
  return (
    <button
      type="button"
      onClick={() => onChange(value)}
      title={label}
      aria-label={label}
      aria-pressed={active}
      className={cn(
        "inline-flex h-7 items-center justify-center rounded-md px-2 text-xs transition-colors",
        active
          ? "bg-foreground text-background"
          : "text-muted-foreground hover:bg-muted",
      )}
    >
      {children}
    </button>
  );
}
