"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Plus, Trash2 } from "lucide-react";

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

    case "hero":
      return (
        <>
          <Field id="heading" label="Headline">
            <Input id="heading" name="heading" defaultValue={get("heading")} required />
          </Field>
          <Field id="subheading" label="Subheading (optional)">
            <Textarea
              id="subheading"
              name="subheading"
              defaultValue={get("subheading")}
              rows={2}
            />
          </Field>
          <Field
            id="video_url"
            label="Video URL (optional, YouTube/Vimeo)"
          >
            <Input
              id="video_url"
              name="video_url"
              type="url"
              defaultValue={get("video_url")}
              placeholder="https://youtube.com/watch?v=…"
            />
            <p className="text-muted-foreground mt-1 text-xs">
              Renders between the subheading and the button.
            </p>
          </Field>
          <div className="grid gap-3 sm:grid-cols-2">
            <Field id="cta_text" label="Button text (optional)">
              <Input id="cta_text" name="cta_text" defaultValue={get("cta_text")} />
            </Field>
            <Field id="cta_url" label="Button URL (optional)">
              <Input
                id="cta_url"
                name="cta_url"
                type="url"
                defaultValue={get("cta_url")}
              />
            </Field>
          </div>
          <Field id="image_url" label="Image URL (optional)">
            <Input
              id="image_url"
              name="image_url"
              type="url"
              defaultValue={get("image_url")}
            />
            <p className="text-muted-foreground mt-1 text-xs">
              Used only when no video is set. Image renders to the right
              when alignment is &quot;Left&quot;.
            </p>
          </Field>
          <Field id="align" label="Alignment">
            <select
              id="align"
              name="align"
              defaultValue={get("align") || "center"}
              className="border-border bg-background h-9 w-full rounded-md border px-2 text-sm"
            >
              <option value="center">Center</option>
              <option value="left">Left (with image to the right)</option>
            </select>
          </Field>
        </>
      );

    case "testimonial":
      return (
        <>
          <Field id="quote" label="Quote (optional if you set a video)">
            <Textarea
              id="quote"
              name="quote"
              defaultValue={get("quote")}
              rows={3}
            />
          </Field>
          <div className="grid gap-3 sm:grid-cols-2">
            <Field id="author" label="Author name">
              <Input id="author" name="author" defaultValue={get("author")} required />
            </Field>
            <Field id="role" label="Role / source (optional)">
              <Input
                id="role"
                name="role"
                defaultValue={get("role")}
                placeholder="@username or CEO at Acme"
              />
            </Field>
          </div>
          <Field id="video_url" label="Video URL (optional, YouTube/Vimeo)">
            <Input
              id="video_url"
              name="video_url"
              type="url"
              defaultValue={get("video_url")}
              placeholder="https://youtube.com/watch?v=…"
            />
            <p className="text-muted-foreground mt-1 text-xs">
              When set, replaces the avatar. Pick the right aspect for
              the source clip.
            </p>
          </Field>
          <div className="grid gap-3 sm:grid-cols-2">
            <Field id="video_aspect" label="Video aspect">
              <select
                id="video_aspect"
                name="video_aspect"
                defaultValue={get("video_aspect") || "16:9"}
                className="border-border bg-background h-9 w-full rounded-md border px-2 text-sm"
              >
                <option value="16:9">16:9 (landscape)</option>
                <option value="9:16">9:16 (vertical / Shorts / TikTok)</option>
              </select>
            </Field>
            <Field id="avatar_url" label="Avatar URL (used if no video)">
              <Input
                id="avatar_url"
                name="avatar_url"
                type="url"
                defaultValue={get("avatar_url")}
              />
            </Field>
          </div>
        </>
      );

    case "features":
      return (
        <FeaturesEditor
          heading={get("heading")}
          subheading={get("subheading")}
          initial={
            Array.isArray(c.items)
              ? (c.items as {
                  title?: string;
                  description?: string;
                  icon?: string;
                }[])
              : []
          }
        />
      );

    case "cta":
      return (
        <>
          <Field id="heading" label="Headline">
            <Input id="heading" name="heading" defaultValue={get("heading")} required />
          </Field>
          <Field id="subheading" label="Subheading (optional)">
            <Textarea
              id="subheading"
              name="subheading"
              defaultValue={get("subheading")}
              rows={2}
            />
          </Field>
          <div className="grid gap-3 sm:grid-cols-2">
            <Field id="button_text" label="Button text">
              <Input
                id="button_text"
                name="button_text"
                defaultValue={get("button_text") || "Get started"}
                required
              />
            </Field>
            <Field id="button_url" label="Button URL">
              <Input
                id="button_url"
                name="button_url"
                type="url"
                defaultValue={get("button_url")}
                required
              />
            </Field>
          </div>
        </>
      );

    case "faq": {
      const items = Array.isArray(c.items)
        ? (c.items as { question?: string; answer?: string }[])
        : [];
      const slots = 5;
      return (
        <div className="space-y-4">
          <Field id="heading" label="Section heading (optional)">
            <Input id="heading" name="heading" defaultValue={get("heading")} />
          </Field>
          <p className="text-muted-foreground text-xs">
            Up to 5 questions. Leave a row blank to skip it.
          </p>
          <div className="space-y-3">
            {Array.from({ length: slots }).map((_, i) => {
              const item = items[i] ?? {};
              return (
                <div
                  key={i}
                  className="border-border space-y-2 rounded-md border p-3"
                >
                  <Field id={`faq_question_${i}`} label="Question" dense>
                    <Input
                      id={`faq_question_${i}`}
                      name={`faq_question_${i}`}
                      defaultValue={item.question ?? ""}
                    />
                  </Field>
                  <Field id={`faq_answer_${i}`} label="Answer" dense>
                    <Textarea
                      id={`faq_answer_${i}`}
                      name={`faq_answer_${i}`}
                      defaultValue={item.answer ?? ""}
                      rows={3}
                    />
                  </Field>
                </div>
              );
            })}
          </div>
        </div>
      );
    }

    case "pricing": {
      const tiers = Array.isArray(c.tiers)
        ? (c.tiers as {
            name?: string;
            price?: string;
            description?: string;
            features?: string[];
            cta_text?: string;
            cta_url?: string;
            highlighted?: boolean;
          }[])
        : [];
      const slots = 3;
      return (
        <div className="space-y-4">
          <Field id="heading" label="Section heading (optional)">
            <Input id="heading" name="heading" defaultValue={get("heading")} />
          </Field>
          <Field id="subheading" label="Section subheading (optional)">
            <Input id="subheading" name="subheading" defaultValue={get("subheading")} />
          </Field>
          <p className="text-muted-foreground text-xs">
            Up to 3 pricing tiers. Leave a tier&apos;s name blank to skip it.
          </p>
          <div className="space-y-3">
            {Array.from({ length: slots }).map((_, i) => {
              const tier = tiers[i] ?? {};
              return (
                <div
                  key={i}
                  className="border-border space-y-2 rounded-md border p-3"
                >
                  <div className="grid gap-2 sm:grid-cols-2">
                    <Field id={`tier_name_${i}`} label="Tier name" dense>
                      <Input
                        id={`tier_name_${i}`}
                        name={`tier_name_${i}`}
                        defaultValue={tier.name ?? ""}
                        placeholder="Starter"
                      />
                    </Field>
                    <Field id={`tier_price_${i}`} label="Price" dense>
                      <Input
                        id={`tier_price_${i}`}
                        name={`tier_price_${i}`}
                        defaultValue={tier.price ?? ""}
                        placeholder="$0/mo"
                      />
                    </Field>
                  </div>
                  <Field id={`tier_description_${i}`} label="Description" dense>
                    <Input
                      id={`tier_description_${i}`}
                      name={`tier_description_${i}`}
                      defaultValue={tier.description ?? ""}
                    />
                  </Field>
                  <Field
                    id={`tier_features_${i}`}
                    label="Features (one per line)"
                    dense
                  >
                    <Textarea
                      id={`tier_features_${i}`}
                      name={`tier_features_${i}`}
                      defaultValue={(tier.features ?? []).join("\n")}
                      rows={3}
                      placeholder={"Up to 100 subscribers\nEmail forms\nLink tracking"}
                    />
                  </Field>
                  <div className="grid gap-2 sm:grid-cols-2">
                    <Field id={`tier_cta_text_${i}`} label="CTA text" dense>
                      <Input
                        id={`tier_cta_text_${i}`}
                        name={`tier_cta_text_${i}`}
                        defaultValue={tier.cta_text ?? ""}
                        placeholder="Get started"
                      />
                    </Field>
                    <Field id={`tier_cta_url_${i}`} label="CTA URL" dense>
                      <Input
                        id={`tier_cta_url_${i}`}
                        name={`tier_cta_url_${i}`}
                        type="url"
                        defaultValue={tier.cta_url ?? ""}
                      />
                    </Field>
                  </div>
                  <label className="flex items-center gap-2 text-xs">
                    <input
                      type="checkbox"
                      name={`tier_highlighted_${i}`}
                      defaultChecked={tier.highlighted ?? false}
                    />
                    Highlight this tier (recommended badge)
                  </label>
                </div>
              );
            })}
          </div>
        </div>
      );
    }

    case "stats": {
      const items = Array.isArray(c.items)
        ? (c.items as { value?: string; label?: string }[])
        : [];
      const slots = 4;
      return (
        <div className="space-y-4">
          <Field id="heading" label="Section heading (optional)">
            <Input id="heading" name="heading" defaultValue={get("heading")} />
          </Field>
          <p className="text-muted-foreground text-xs">
            Up to 4 stats (e.g. &quot;10K subscribers&quot;, &quot;500 hours
            saved&quot;).
          </p>
          <div className="space-y-3">
            {Array.from({ length: slots }).map((_, i) => {
              const item = items[i] ?? {};
              return (
                <div key={i} className="grid gap-2 sm:grid-cols-2">
                  <Field id={`stat_value_${i}`} label="Value" dense>
                    <Input
                      id={`stat_value_${i}`}
                      name={`stat_value_${i}`}
                      defaultValue={item.value ?? ""}
                      placeholder="10K"
                    />
                  </Field>
                  <Field id={`stat_label_${i}`} label="Label" dense>
                    <Input
                      id={`stat_label_${i}`}
                      name={`stat_label_${i}`}
                      defaultValue={item.label ?? ""}
                      placeholder="Subscribers"
                    />
                  </Field>
                </div>
              );
            })}
          </div>
        </div>
      );
    }

    case "button":
      return (
        <>
          <Field id="text" label="Button text">
            <Input
              id="text"
              name="text"
              defaultValue={get("text") || "Book a call"}
              required
            />
          </Field>
          <Field id="url" label="Button URL">
            <Input
              id="url"
              name="url"
              type="url"
              defaultValue={get("url")}
              required
              placeholder="https://cal.com/yourname"
            />
          </Field>
          <div className="grid gap-3 sm:grid-cols-2">
            <Field id="style" label="Style">
              <select
                id="style"
                name="style"
                defaultValue={get("style") || "primary"}
                className="border-border bg-background h-9 w-full rounded-md border px-2 text-sm"
              >
                <option value="primary">Primary (filled)</option>
                <option value="outline">Outline</option>
              </select>
            </Field>
            <Field id="align" label="Alignment">
              <select
                id="align"
                name="align"
                defaultValue={get("align") || "center"}
                className="border-border bg-background h-9 w-full rounded-md border px-2 text-sm"
              >
                <option value="center">Center</option>
                <option value="left">Left</option>
                <option value="right">Right</option>
              </select>
            </Field>
          </div>
        </>
      );

    case "embed":
      return (
        <>
          <Field id="url" label="Embed URL">
            <Input
              id="url"
              name="url"
              type="url"
              defaultValue={get("url")}
              required
              placeholder="https://cal.com/yourname or any iframe-able URL"
            />
            <p className="text-muted-foreground mt-1 text-xs">
              Paste the iframe src directly (e.g. Calendly inline URL,
              Tally form URL, Substack embed URL).
            </p>
          </Field>
          <Field id="title" label="Title (for accessibility)">
            <Input id="title" name="title" defaultValue={get("title")} />
          </Field>
          <div className="grid gap-3 sm:grid-cols-2">
            <Field id="aspect" label="Aspect ratio">
              <select
                id="aspect"
                name="aspect"
                defaultValue={get("aspect") || "16:9"}
                className="border-border bg-background h-9 w-full rounded-md border px-2 text-sm"
              >
                <option value="16:9">16:9 (default)</option>
                <option value="4:3">4:3</option>
                <option value="1:1">1:1 (square)</option>
                <option value="9:16">9:16 (vertical)</option>
                <option value="auto">Auto (use fixed height)</option>
              </select>
            </Field>
            <Field id="height" label="Height in px (auto only)">
              <Input
                id="height"
                name="height"
                type="number"
                min={100}
                max={2000}
                defaultValue={get("height") || "720"}
              />
            </Field>
          </div>
        </>
      );

    default:
      return null;
  }
}

// ─── Stateful features editor with add/remove ────────────────────────────

type FeatureItem = { title: string; description: string; icon: string };

function FeaturesEditor({
  heading,
  subheading,
  initial,
}: {
  heading: string;
  subheading: string;
  initial: { title?: string; description?: string; icon?: string }[];
}) {
  // Always start with at least one row so creators have something to edit.
  const seeded: FeatureItem[] =
    initial.length > 0
      ? initial.map((i) => ({
          title: i.title ?? "",
          description: i.description ?? "",
          icon: i.icon ?? "",
        }))
      : [{ title: "", description: "", icon: "" }];

  const [items, setItems] = useState<FeatureItem[]>(seeded);

  const update = (idx: number, patch: Partial<FeatureItem>) => {
    setItems((prev) =>
      prev.map((it, i) => (i === idx ? { ...it, ...patch } : it)),
    );
  };
  const remove = (idx: number) => {
    setItems((prev) => prev.filter((_, i) => i !== idx));
  };
  const add = () => {
    setItems((prev) => [...prev, { title: "", description: "", icon: "" }]);
  };

  return (
    <div className="space-y-4">
      <Field id="heading" label="Section heading (optional)">
        <Input id="heading" name="heading" defaultValue={heading} />
      </Field>
      <Field id="subheading" label="Section subheading (optional)">
        <Input
          id="subheading"
          name="subheading"
          defaultValue={subheading}
        />
      </Field>

      <div className="flex items-center justify-between">
        <p className="text-muted-foreground text-xs">
          Add as many features as you need. Empty rows are dropped on save.
        </p>
        <span className="text-muted-foreground text-xs tabular-nums">
          {items.length} item{items.length === 1 ? "" : "s"}
        </span>
      </div>

      {/* Hidden field tells the action how many slots to read. */}
      <input type="hidden" name="feature_count" value={items.length} />

      <div className="space-y-3">
        {items.map((item, i) => (
          <div
            key={i}
            className="border-border space-y-2 rounded-md border p-3"
          >
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground text-xs">
                Feature {i + 1}
              </span>
              {items.length > 1 ? (
                <button
                  type="button"
                  onClick={() => remove(i)}
                  className="text-muted-foreground hover:text-destructive inline-flex items-center gap-1 text-xs"
                  aria-label={`Remove feature ${i + 1}`}
                >
                  <Trash2 className="size-3" />
                  Remove
                </button>
              ) : null}
            </div>
            <div className="grid gap-2 sm:grid-cols-[80px_1fr]">
              <Field id={`feature_icon_${i}`} label="Icon" dense>
                <Input
                  id={`feature_icon_${i}`}
                  name={`feature_icon_${i}`}
                  value={item.icon}
                  onChange={(e) => update(i, { icon: e.target.value })}
                  placeholder="🔥"
                  maxLength={4}
                />
              </Field>
              <Field id={`feature_title_${i}`} label="Title" dense>
                <Input
                  id={`feature_title_${i}`}
                  name={`feature_title_${i}`}
                  value={item.title}
                  onChange={(e) => update(i, { title: e.target.value })}
                />
              </Field>
            </div>
            <Field
              id={`feature_description_${i}`}
              label="Description"
              dense
            >
              <Textarea
                id={`feature_description_${i}`}
                name={`feature_description_${i}`}
                value={item.description}
                onChange={(e) =>
                  update(i, { description: e.target.value })
                }
                rows={2}
              />
            </Field>
          </div>
        ))}
      </div>

      <Button type="button" size="sm" variant="outline" onClick={add}>
        <Plus className="size-4" />
        Add feature
      </Button>
    </div>
  );
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
