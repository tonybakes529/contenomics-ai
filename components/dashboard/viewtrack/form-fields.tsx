// Shared low-level inputs used by every Viewtrack tab form. Plain HTML —
// matches the rest of the dashboard's form aesthetic. Server actions read
// the values via FormData so no client-side state is required.

import { cn } from "@/lib/utils";

export function Field({
  label,
  hint,
  children,
  span = 1,
}: {
  label: string;
  hint?: string;
  children: React.ReactNode;
  span?: 1 | 2;
}) {
  return (
    <label
      className={cn(
        "flex flex-col gap-1",
        span === 2 && "sm:col-span-2",
      )}
    >
      <span className="text-foreground text-xs font-medium">{label}</span>
      {children}
      {hint ? (
        <span className="text-muted-foreground text-[10px]">{hint}</span>
      ) : null}
    </label>
  );
}

const inputCls =
  "border-border bg-background focus:ring-foreground/30 placeholder:text-muted-foreground rounded-md border px-2.5 py-1.5 text-sm focus:outline-none focus:ring-2";

export function Input({
  defaultValue,
  ...props
}: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      {...props}
      defaultValue={
        defaultValue == null ? undefined : (defaultValue as string)
      }
      className={cn(inputCls, props.className)}
    />
  );
}

export function Textarea(
  props: React.TextareaHTMLAttributes<HTMLTextAreaElement>,
) {
  return (
    <textarea
      rows={3}
      {...props}
      className={cn(
        inputCls,
        "min-h-[72px] resize-y leading-relaxed",
        props.className,
      )}
    />
  );
}

export function Select({
  options,
  defaultValue,
  ...props
}: Omit<
  React.SelectHTMLAttributes<HTMLSelectElement>,
  "children" | "defaultValue"
> & {
  options: readonly { value: string; label: string }[];
  defaultValue?: string | null;
}) {
  return (
    <select
      {...props}
      defaultValue={defaultValue ?? ""}
      className={cn(inputCls, "bg-background", props.className)}
    >
      <option value="">—</option>
      {options.map((o) => (
        <option key={o.value} value={o.value}>
          {o.label}
        </option>
      ))}
    </select>
  );
}

// Convert a stored decimal (0.05) back to display string (5).
export function pctToDisplay(v: number | null | undefined): string {
  if (typeof v !== "number" || Number.isNaN(v)) return "";
  return (v * 100).toFixed(2).replace(/\.?0+$/, "");
}
