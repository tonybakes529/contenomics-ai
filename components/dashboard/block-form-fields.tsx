"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

const KNOWN_PLATFORMS = [
  "youtube",
  "twitter",
  "instagram",
  "tiktok",
  "github",
  "linkedin",
  "twitch",
  "facebook",
  "website",
];

type AnyConfig = Record<string, unknown>;

export function BlockFormFields({
  type,
  config,
}: {
  type: string;
  config: AnyConfig;
}) {
  const c = config ?? {};
  const get = (k: string): string => {
    const v = c[k];
    return typeof v === "string" ? v : "";
  };

  switch (type) {
    case "link":
      return (
        <>
          <Field id="text" label="Button text">
            <Input id="text" name="text" defaultValue={get("text")} required />
          </Field>
          <Field id="url" label="URL">
            <Input
              id="url"
              name="url"
              type="url"
              defaultValue={get("url")}
              placeholder="https://example.com"
              required
            />
          </Field>
        </>
      );

    case "header":
      return (
        <Field id="text" label="Heading text">
          <Input id="text" name="text" defaultValue={get("text")} required />
        </Field>
      );

    case "text":
      return (
        <Field id="text" label="Body text">
          <Textarea
            id="text"
            name="text"
            defaultValue={get("text")}
            rows={4}
            required
          />
        </Field>
      );

    case "email_form":
      return (
        <>
          <Field id="heading" label="Heading (optional)">
            <Input id="heading" name="heading" defaultValue={get("heading")} />
          </Field>
          <Field id="description" label="Description (optional)">
            <Textarea
              id="description"
              name="description"
              defaultValue={get("description")}
              rows={2}
            />
          </Field>
          <Field id="button_text" label="Button text">
            <Input
              id="button_text"
              name="button_text"
              defaultValue={get("button_text") || "Subscribe"}
            />
          </Field>
        </>
      );

    case "video_embed":
      return (
        <>
          <Field id="url" label="YouTube or Vimeo URL">
            <Input
              id="url"
              name="url"
              type="url"
              defaultValue={get("url")}
              placeholder="https://youtube.com/watch?v=…"
              required
            />
          </Field>
          <Field id="title" label="Title (optional, for accessibility)">
            <Input id="title" name="title" defaultValue={get("title")} />
          </Field>
        </>
      );

    case "social_icons": {
      const platforms =
        Array.isArray(c.platforms) ? (c.platforms as { type: string; url: string }[]) : [];
      const byType = new Map(platforms.map((p) => [p.type, p.url]));
      return (
        <div className="space-y-2">
          <p className="text-muted-foreground text-xs">
            Leave a field blank to skip that platform.
          </p>
          {KNOWN_PLATFORMS.map((p) => (
            <Field key={p} id={`platform_${p}`} label={p} dense>
              <Input
                id={`platform_${p}`}
                name={`platform_${p}`}
                type="url"
                defaultValue={byType.get(p) ?? ""}
                placeholder={`https://${p}.com/yourname`}
              />
            </Field>
          ))}
        </div>
      );
    }

    case "image":
      return (
        <>
          <Field id="url" label="Image URL">
            <Input
              id="url"
              name="url"
              type="url"
              defaultValue={get("url")}
              placeholder="https://…"
              required
            />
          </Field>
          <Field id="alt" label="Alt text (for accessibility)">
            <Input id="alt" name="alt" defaultValue={get("alt")} />
          </Field>
        </>
      );

    case "divider":
      return (
        <p className="text-muted-foreground text-sm">
          A divider has no content. It just adds visual separation.
        </p>
      );

    case "product":
      return (
        <>
          <Field id="title" label="Product title">
            <Input id="title" name="title" defaultValue={get("title")} required />
          </Field>
          <Field id="url" label="Product URL">
            <Input
              id="url"
              name="url"
              type="url"
              defaultValue={get("url")}
              required
            />
          </Field>
          <Field id="price" label="Price (e.g. $29)">
            <Input id="price" name="price" defaultValue={get("price")} />
          </Field>
          <Field id="image" label="Image URL (optional)">
            <Input
              id="image"
              name="image"
              type="url"
              defaultValue={get("image")}
            />
          </Field>
        </>
      );

    default:
      return null;
  }
}

function Field({
  id,
  label,
  children,
  dense,
}: {
  id: string;
  label: string;
  children: React.ReactNode;
  dense?: boolean;
}) {
  return (
    <div className={dense ? "space-y-1" : "space-y-1.5"}>
      <Label htmlFor={id} className={dense ? "text-xs capitalize" : undefined}>
        {label}
      </Label>
      {children}
    </div>
  );
}
