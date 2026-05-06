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
      return <TestimonialsEditor config={c} />;

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

    case "form":
      return <FormQuestionsEditor config={c} />;

    case "lead_magnet":
      return (
        <>
          <Field id="heading" label="Heading">
            <Input
              id="heading"
              name="heading"
              defaultValue={get("heading") || "Get my free guide"}
              required
            />
          </Field>
          <Field id="description" label="Description (optional)">
            <Textarea
              id="description"
              name="description"
              defaultValue={get("description")}
              rows={2}
              placeholder="Drop your email and I'll send you the link."
            />
          </Field>
          <div className="grid gap-3 sm:grid-cols-2">
            <Field id="file_label" label="What you're sending">
              <Input
                id="file_label"
                name="file_label"
                defaultValue={get("file_label") || "the guide"}
                placeholder="Free PDF guide"
              />
              <p className="text-muted-foreground mt-1 text-xs">
                Shown on the download button.
              </p>
            </Field>
            <Field id="button_text" label="Button text (optional)">
              <Input
                id="button_text"
                name="button_text"
                defaultValue={get("button_text")}
                placeholder="Send it to me"
              />
            </Field>
          </div>
          <Field id="download_url" label="Download URL (gated content)">
            <Input
              id="download_url"
              name="download_url"
              type="url"
              defaultValue={get("download_url")}
              required
              placeholder="https://example.com/my-guide.pdf"
            />
            <p className="text-muted-foreground mt-1 text-xs">
              Shown after a visitor confirms their email. Anything URL-able
              works — PDF, Notion page, Google Drive link, or any website.
            </p>
          </Field>
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

// ─── Stateful testimonials editor (1-3 items, side-by-side on render) ───

type TestimonialItemForm = {
  quote: string;
  author: string;
  role: string;
  avatar_url: string;
  video_url: string;
  video_aspect: "9:16" | "16:9";
};

function TestimonialsEditor({ config }: { config: AnyConfig }) {
  // Read either the new items array or the legacy single-item shape.
  const initialItems: TestimonialItemForm[] = (() => {
    const items = Array.isArray(config.items)
      ? (config.items as Partial<TestimonialItemForm>[])
      : null;
    if (items && items.length > 0) {
      return items.slice(0, 3).map(toForm);
    }
    if (config.author || config.quote || config.video_url) {
      return [
        toForm({
          quote: (config.quote as string) ?? "",
          author: (config.author as string) ?? "",
          role: (config.role as string) ?? "",
          avatar_url: (config.avatar_url as string) ?? "",
          video_url: (config.video_url as string) ?? "",
          video_aspect:
            (config.video_aspect as "9:16" | "16:9") ?? "16:9",
        }),
      ];
    }
    return [toForm({})];
  })();

  const [items, setItems] = useState<TestimonialItemForm[]>(initialItems);

  const update = (idx: number, patch: Partial<TestimonialItemForm>) => {
    setItems((prev) =>
      prev.map((it, i) => (i === idx ? { ...it, ...patch } : it)),
    );
  };
  const remove = (idx: number) => {
    setItems((prev) => prev.filter((_, i) => i !== idx));
  };
  const add = () => {
    if (items.length >= 3) return;
    setItems((prev) => [...prev, toForm({})]);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-muted-foreground text-xs">
          Up to 3 testimonials. They render side-by-side on the public
          page.
        </p>
        <span className="text-muted-foreground text-xs tabular-nums">
          {items.length} / 3
        </span>
      </div>

      <input
        type="hidden"
        name="testimonial_count"
        value={items.length}
      />

      <div className="space-y-3">
        {items.map((item, i) => (
          <div
            key={i}
            className="border-border space-y-3 rounded-md border p-3"
          >
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground text-xs">
                Testimonial {i + 1}
              </span>
              {items.length > 1 ? (
                <button
                  type="button"
                  onClick={() => remove(i)}
                  className="text-muted-foreground hover:text-destructive inline-flex items-center gap-1 text-xs"
                  aria-label={`Remove testimonial ${i + 1}`}
                >
                  <Trash2 className="size-3" />
                  Remove
                </button>
              ) : null}
            </div>
            <Field
              id={`testimonial_quote_${i}`}
              label="Quote (optional if a video is set)"
              dense
            >
              <Textarea
                id={`testimonial_quote_${i}`}
                name={`testimonial_quote_${i}`}
                value={item.quote}
                onChange={(e) => update(i, { quote: e.target.value })}
                rows={3}
              />
            </Field>
            <div className="grid gap-2 sm:grid-cols-2">
              <Field
                id={`testimonial_author_${i}`}
                label="Author name"
                dense
              >
                <Input
                  id={`testimonial_author_${i}`}
                  name={`testimonial_author_${i}`}
                  value={item.author}
                  onChange={(e) =>
                    update(i, { author: e.target.value })
                  }
                />
              </Field>
              <Field
                id={`testimonial_role_${i}`}
                label="Role / source"
                dense
              >
                <Input
                  id={`testimonial_role_${i}`}
                  name={`testimonial_role_${i}`}
                  value={item.role}
                  onChange={(e) => update(i, { role: e.target.value })}
                  placeholder="@user or Title at Co"
                />
              </Field>
            </div>
            <Field
              id={`testimonial_video_url_${i}`}
              label="Video URL (optional)"
              dense
            >
              <Input
                id={`testimonial_video_url_${i}`}
                name={`testimonial_video_url_${i}`}
                type="url"
                value={item.video_url}
                onChange={(e) =>
                  update(i, { video_url: e.target.value })
                }
                placeholder="https://youtube.com/watch?v=…"
              />
            </Field>
            <div className="grid gap-2 sm:grid-cols-2">
              <Field
                id={`testimonial_video_aspect_${i}`}
                label="Video aspect"
                dense
              >
                <select
                  id={`testimonial_video_aspect_${i}`}
                  name={`testimonial_video_aspect_${i}`}
                  value={item.video_aspect}
                  onChange={(e) =>
                    update(i, {
                      video_aspect: e.target.value as "9:16" | "16:9",
                    })
                  }
                  className="border-border bg-background h-9 w-full rounded-md border px-2 text-sm"
                >
                  <option value="16:9">16:9 (landscape)</option>
                  <option value="9:16">9:16 (vertical)</option>
                </select>
              </Field>
              <Field
                id={`testimonial_avatar_url_${i}`}
                label="Avatar URL (used if no video)"
                dense
              >
                <Input
                  id={`testimonial_avatar_url_${i}`}
                  name={`testimonial_avatar_url_${i}`}
                  type="url"
                  value={item.avatar_url}
                  onChange={(e) =>
                    update(i, { avatar_url: e.target.value })
                  }
                />
              </Field>
            </div>
          </div>
        ))}
      </div>

      {items.length < 3 ? (
        <Button type="button" size="sm" variant="outline" onClick={add}>
          <Plus className="size-4" />
          Add testimonial
        </Button>
      ) : null}
    </div>
  );
}

function toForm(
  raw: Partial<TestimonialItemForm>,
): TestimonialItemForm {
  return {
    quote: raw.quote ?? "",
    author: raw.author ?? "",
    role: raw.role ?? "",
    avatar_url: raw.avatar_url ?? "",
    video_url: raw.video_url ?? "",
    video_aspect: raw.video_aspect === "9:16" ? "9:16" : "16:9",
  };
}

// ─── Stateful form questions editor ──────────────────────────────────────

type QuestionType =
  | "short_text"
  | "long_text"
  | "email"
  | "name"
  | "choice"
  | "multi_choice"
  | "number"
  | "url";

type QuestionForm = {
  id: string;
  type: QuestionType;
  label: string;
  description: string;
  required: boolean;
  // Newline-separated in the editor for ease of typing.
  options: string;
  placeholder: string;
};

const QUESTION_TYPE_LABELS: Record<QuestionType, string> = {
  short_text: "Short text",
  long_text: "Long text",
  email: "Email *",
  name: "Name",
  choice: "Single choice",
  multi_choice: "Multi choice",
  number: "Number",
  url: "URL",
};

function newQuestion(): QuestionForm {
  return {
    id: `q_${Math.random().toString(36).slice(2, 10)}`,
    type: "short_text",
    label: "",
    description: "",
    required: false,
    options: "",
    placeholder: "",
  };
}

function FormQuestionsEditor({ config }: { config: AnyConfig }) {
  const get = (k: string): string => {
    const v = config[k];
    return typeof v === "string" ? v : "";
  };

  // Hydrate from existing config
  const initialQuestions: QuestionForm[] = (() => {
    const raw = Array.isArray(config.questions)
      ? (config.questions as Partial<QuestionForm & { options?: string[] }>[])
      : [];
    if (raw.length === 0) {
      return [
        // Sensible default: at least one email question (required for submission)
        { ...newQuestion(), type: "email", label: "Email", required: true },
      ];
    }
    return raw.map((q) => ({
      id: q.id ?? `q_${Math.random().toString(36).slice(2, 10)}`,
      type: (q.type as QuestionType) ?? "short_text",
      label: q.label ?? "",
      description: q.description ?? "",
      required: !!q.required,
      options: Array.isArray(q.options) ? q.options.join("\n") : "",
      placeholder: q.placeholder ?? "",
    }));
  })();

  const [questions, setQuestions] = useState<QuestionForm[]>(initialQuestions);

  const update = (idx: number, patch: Partial<QuestionForm>) =>
    setQuestions((prev) =>
      prev.map((q, i) => (i === idx ? { ...q, ...patch } : q)),
    );
  const remove = (idx: number) =>
    setQuestions((prev) => prev.filter((_, i) => i !== idx));
  const add = () =>
    setQuestions((prev) => [...prev, newQuestion()]);
  const move = (idx: number, dir: -1 | 1) => {
    setQuestions((prev) => {
      const next = [...prev];
      const target = idx + dir;
      if (target < 0 || target >= next.length) return next;
      [next[idx], next[target]] = [next[target], next[idx]];
      return next;
    });
  };

  const hasEmail = questions.some((q) => q.type === "email" && q.label);

  return (
    <div className="space-y-4">
      <Field id="heading" label="Form heading">
        <Input
          id="heading"
          name="heading"
          defaultValue={get("heading") || "Quick survey"}
          required
        />
      </Field>
      <Field id="description" label="Form description (optional)">
        <Textarea
          id="description"
          name="description"
          defaultValue={get("description")}
          rows={2}
        />
      </Field>
      <div className="grid gap-3 sm:grid-cols-2">
        <Field id="layout" label="Layout">
          <select
            id="layout"
            name="layout"
            defaultValue={get("layout") || "stepped"}
            className="border-border bg-background h-9 w-full rounded-md border px-2 text-sm"
          >
            <option value="stepped">Stepped (one question at a time)</option>
            <option value="single">Single page (all questions)</option>
          </select>
        </Field>
        <Field id="submit_text" label="Submit button text">
          <Input
            id="submit_text"
            name="submit_text"
            defaultValue={get("submit_text") || "Submit"}
          />
        </Field>
      </div>
      <Field
        id="redirect_url"
        label="Redirect after submit (optional)"
      >
        <Input
          id="redirect_url"
          name="redirect_url"
          type="url"
          defaultValue={get("redirect_url")}
          placeholder="https://example.com/thanks"
        />
        <p className="text-muted-foreground mt-1 text-xs">
          Where to send the visitor after they submit. Leave blank to just
          show a thank-you message.
        </p>
      </Field>
      <div className="grid gap-3 sm:grid-cols-2">
        <Field id="thank_you_heading" label="Thank-you heading">
          <Input
            id="thank_you_heading"
            name="thank_you_heading"
            defaultValue={get("thank_you_heading") || "Thanks!"}
          />
        </Field>
        <Field id="thank_you_message" label="Thank-you message">
          <Input
            id="thank_you_message"
            name="thank_you_message"
            defaultValue={get("thank_you_message")}
            placeholder="We'll be in touch soon."
          />
        </Field>
      </div>

      {!hasEmail ? (
        <div className="border-amber-300 bg-amber-50 text-amber-900 rounded-md border px-3 py-2 text-xs">
          Add at least one <strong>Email</strong> question — submissions are
          saved against the visitor&apos;s email so they appear in your
          subscriber list.
        </div>
      ) : null}

      <div className="border-border space-y-3 border-t pt-4">
        <div className="flex items-center justify-between">
          <p className="text-sm font-medium">Questions</p>
          <span className="text-muted-foreground text-xs tabular-nums">
            {questions.length} question{questions.length === 1 ? "" : "s"}
          </span>
        </div>

        <input type="hidden" name="question_count" value={questions.length} />

        {questions.map((q, i) => (
          <div
            key={q.id}
            className="border-border space-y-2 rounded-md border p-3"
          >
            <input
              type="hidden"
              name={`q_id_${i}`}
              value={q.id}
            />
            <div className="flex items-center justify-between gap-2">
              <span className="text-muted-foreground text-xs">
                Question {i + 1}
              </span>
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => move(i, -1)}
                  disabled={i === 0}
                  className="text-muted-foreground hover:text-foreground inline-flex size-6 items-center justify-center rounded transition-colors disabled:opacity-30"
                  title="Move up"
                  aria-label="Move up"
                >
                  ↑
                </button>
                <button
                  type="button"
                  onClick={() => move(i, 1)}
                  disabled={i === questions.length - 1}
                  className="text-muted-foreground hover:text-foreground inline-flex size-6 items-center justify-center rounded transition-colors disabled:opacity-30"
                  title="Move down"
                  aria-label="Move down"
                >
                  ↓
                </button>
                {questions.length > 1 ? (
                  <button
                    type="button"
                    onClick={() => remove(i)}
                    className="text-muted-foreground hover:text-destructive inline-flex items-center gap-1 text-xs"
                    aria-label={`Remove question ${i + 1}`}
                  >
                    <Trash2 className="size-3" />
                    Remove
                  </button>
                ) : null}
              </div>
            </div>
            <div className="grid gap-2 sm:grid-cols-[160px_1fr]">
              <Field id={`q_type_${i}`} label="Type" dense>
                <select
                  id={`q_type_${i}`}
                  name={`q_type_${i}`}
                  value={q.type}
                  onChange={(e) =>
                    update(i, { type: e.target.value as QuestionType })
                  }
                  className="border-border bg-background h-9 w-full rounded-md border px-2 text-sm"
                >
                  {(Object.keys(QUESTION_TYPE_LABELS) as QuestionType[]).map(
                    (t) => (
                      <option key={t} value={t}>
                        {QUESTION_TYPE_LABELS[t]}
                      </option>
                    ),
                  )}
                </select>
              </Field>
              <Field id={`q_label_${i}`} label="Question" dense>
                <Input
                  id={`q_label_${i}`}
                  name={`q_label_${i}`}
                  value={q.label}
                  onChange={(e) => update(i, { label: e.target.value })}
                  placeholder="What's your goal?"
                />
              </Field>
            </div>
            <Field
              id={`q_description_${i}`}
              label="Help text (optional)"
              dense
            >
              <Input
                id={`q_description_${i}`}
                name={`q_description_${i}`}
                value={q.description}
                onChange={(e) =>
                  update(i, { description: e.target.value })
                }
              />
            </Field>
            {q.type === "choice" || q.type === "multi_choice" ? (
              <Field
                id={`q_options_${i}`}
                label="Options (one per line)"
                dense
              >
                <Textarea
                  id={`q_options_${i}`}
                  name={`q_options_${i}`}
                  value={q.options}
                  onChange={(e) => update(i, { options: e.target.value })}
                  rows={3}
                  placeholder={"Option A\nOption B\nOption C"}
                />
              </Field>
            ) : (
              <Field
                id={`q_placeholder_${i}`}
                label="Placeholder (optional)"
                dense
              >
                <Input
                  id={`q_placeholder_${i}`}
                  name={`q_placeholder_${i}`}
                  value={q.placeholder}
                  onChange={(e) =>
                    update(i, { placeholder: e.target.value })
                  }
                />
              </Field>
            )}
            <label className="flex items-center gap-2 text-xs">
              <input
                type="checkbox"
                name={`q_required_${i}`}
                checked={q.required}
                onChange={(e) =>
                  update(i, { required: e.target.checked })
                }
              />
              Required
            </label>
          </div>
        ))}

        <Button type="button" size="sm" variant="outline" onClick={add}>
          <Plus className="size-4" />
          Add question
        </Button>
      </div>
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
