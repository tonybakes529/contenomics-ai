"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

const SLUG_RE = /^[a-z0-9_-]{1,50}$/;

function slugify(input: string): string {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9_-]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 50);
}

async function requireUser() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login?next=/dashboard/pages");
  return { supabase, user };
}

export async function createPage() {
  const { supabase, user } = await requireUser();

  // Find a unique slug like "page-2", "page-3" by counting existing pages.
  const { count } = await supabase
    .from("pages")
    .select("id", { count: "exact", head: true })
    .eq("profile_id", user.id);

  const baseSlug = `page-${(count ?? 0) + 1}`;

  const { data, error } = await supabase
    .from("pages")
    .insert({
      profile_id: user.id,
      slug: baseSlug,
      title: "Untitled page",
      is_published: false,
      is_default: false,
    })
    .select("id")
    .single();

  if (error) {
    redirect(
      `/dashboard/pages?error=${encodeURIComponent(error.message)}`,
    );
  }

  revalidatePath("/dashboard/pages");
  redirect(`/dashboard/pages/${data!.id}`);
}

export async function updatePageMeta(pageId: string, formData: FormData) {
  const { supabase, user } = await requireUser();

  const title = String(formData.get("title") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim();
  const rawSlug = String(formData.get("slug") ?? "").trim();
  const isPublished = formData.get("is_published") === "on";
  const isDefault = formData.get("is_default") === "on";

  const slug = rawSlug ? slugify(rawSlug) : "";
  if (!slug || !SLUG_RE.test(slug)) {
    redirect(
      `/dashboard/pages/${pageId}?error=${encodeURIComponent(
        "Slug must be 1–50 chars: lowercase letters, numbers, dashes, underscores",
      )}`,
    );
  }

  // If toggling is_default ON, flip everyone else off first (the DB partial
  // unique index also enforces this — we just want a friendly result).
  if (isDefault) {
    await supabase
      .from("pages")
      .update({ is_default: false })
      .eq("profile_id", user.id)
      .neq("id", pageId);
  }

  const { error } = await supabase
    .from("pages")
    .update({
      title: title || null,
      description: description || null,
      slug,
      is_published: isPublished,
      is_default: isDefault,
    })
    .eq("id", pageId)
    .eq("profile_id", user.id);

  if (error) {
    redirect(
      `/dashboard/pages/${pageId}?error=${encodeURIComponent(error.message)}`,
    );
  }

  revalidatePath("/dashboard/pages");
  revalidatePath(`/dashboard/pages/${pageId}`);
  revalidatePath("/[username]", "page");
  redirect(`/dashboard/pages/${pageId}?saved=1`);
}

export async function togglePagePublish(pageId: string) {
  const { supabase, user } = await requireUser();

  const { data: page, error: readErr } = await supabase
    .from("pages")
    .select("id, is_published")
    .eq("id", pageId)
    .eq("profile_id", user.id)
    .maybeSingle();

  if (readErr || !page) {
    redirect(
      `/dashboard/pages/${pageId}?error=${encodeURIComponent(
        readErr?.message ?? "Page not found",
      )}`,
    );
  }

  const next = !page.is_published;
  const { data: updated, error: updateErr } = await supabase
    .from("pages")
    .update({ is_published: next })
    .eq("id", pageId)
    .select("is_published")
    .single();

  if (updateErr) {
    redirect(
      `/dashboard/pages/${pageId}?error=${encodeURIComponent(updateErr.message)}`,
    );
  }
  if (updated && updated.is_published !== next) {
    redirect(
      `/dashboard/pages/${pageId}?error=${encodeURIComponent(
        "Publish flag did not change — RLS likely rejected the update",
      )}`,
    );
  }

  revalidatePath("/dashboard/pages");
  revalidatePath(`/dashboard/pages/${pageId}`);
  revalidatePath("/[username]", "page");
}

export async function deletePage(pageId: string) {
  const { supabase, user } = await requireUser();

  // Prevent deleting the default page — there must always be one.
  const { data: page } = await supabase
    .from("pages")
    .select("is_default")
    .eq("id", pageId)
    .eq("profile_id", user.id)
    .maybeSingle();

  if (!page) {
    redirect(`/dashboard/pages?error=${encodeURIComponent("Page not found")}`);
  }
  if (page.is_default) {
    redirect(
      `/dashboard/pages?error=${encodeURIComponent(
        "Cannot delete the default page. Make another page default first.",
      )}`,
    );
  }

  const { error } = await supabase
    .from("pages")
    .delete()
    .eq("id", pageId)
    .eq("profile_id", user.id);

  if (error) {
    redirect(`/dashboard/pages?error=${encodeURIComponent(error.message)}`);
  }

  revalidatePath("/dashboard/pages");
  redirect("/dashboard/pages?deleted=1");
}
