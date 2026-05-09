"use client";

import { useState } from "react";
import { Check, Copy, Download, Send } from "lucide-react";

export function CopyContextButton({ context }: { context: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <button
      type="button"
      onClick={async () => {
        try {
          await navigator.clipboard.writeText(context);
          setCopied(true);
          setTimeout(() => setCopied(false), 1500);
        } catch (err) {
          console.error("clipboard write failed", err);
        }
      }}
      className="border-border bg-background text-foreground hover:bg-muted inline-flex h-9 items-center gap-1.5 rounded-md border px-3.5 text-sm font-medium transition-colors"
    >
      {copied ? <Check className="size-4" /> : <Copy className="size-4" />}
      {copied ? "Copied" : "Copy AI Context"}
    </button>
  );
}

export function CopyAllButton({
  context,
  csv,
}: {
  context: string;
  csv: string;
}) {
  const [copied, setCopied] = useState(false);
  return (
    <button
      type="button"
      onClick={async () => {
        try {
          await navigator.clipboard.writeText(`${context}\n\n${csv}`);
          setCopied(true);
          // Open Gemini in a new tab so the user can paste straight in.
          window.open("https://gemini.google.com/app", "_blank");
          setTimeout(() => setCopied(false), 1500);
        } catch (err) {
          console.error("clipboard write failed", err);
        }
      }}
      className="bg-foreground text-background hover:opacity-90 inline-flex h-9 items-center gap-1.5 rounded-md px-3.5 text-sm font-medium transition-opacity"
    >
      <Send className="size-4" />
      {copied ? "Copied — paste into Gemini" : "Send to Gemini"}
    </button>
  );
}

export function DownloadCsvButton() {
  return (
    <a
      href="/dashboard/viewtrack/ai-export/download"
      className="border-border bg-background text-foreground hover:bg-muted inline-flex h-9 items-center gap-1.5 rounded-md border px-3.5 text-sm font-medium transition-colors"
    >
      <Download className="size-4" />
      Download CSV
    </a>
  );
}
