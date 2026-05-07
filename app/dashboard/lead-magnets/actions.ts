"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

async function requireUser() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login?next=/dashboard/lead-magnets");
  return { supabase, user };
}

function readForm(fd: FormData) {
  const get = (k: string) => String(fd.get(k) ?? "").trim();
  const name = get("name");
  const download_url = get("download_url");
  const file_label = get("file_label");
  const description = get("description");
  const default_heading = get("default_heading");
  const default_description = get("default_description");
  const default_button_text = get("default_button_text");
  const list_id = get("list_id");

  return {
    name,
    description: description || null,
    download_url,
    file_label: file_label || null,
    default_heading: default_heading || null,
    default_description: default_description || null,
    default_button_text: default_button_text || null,
    list_id: list_id || null,
  };
}

export async function createLeadMagnet(formData: FormData) {
  const { supabase, user } = await requireUser();
  const data = readForm(formData);

  if (!data.name) {
    redirect(
      `/dashboard/lead-magnets?error=${encodeURIComponent("Name is required")}`,
    );
  }
  if (!data.download_url) {
    redirect(
      `/dashboard/lead-magnets?error=${encodeURIComponent(
        "Download URL is required",
      )}`,
    );
  }

  const { error } = await supabase.from("lead_magnets").insert({
    profile_id: user.id,
    ...data,
  });

  if (error) {
    redirect(
      `/dashboard/lead-magnets?error=${encodeURIComponent(error.message)}`,
    );
  }

  revalidatePath("/dashboard/lead-magnets");
}

export async function updateLeadMagnet(id: string, formData: FormData) {
  const { supabase, user } = await requireUser();
  const data = readForm(formData);

  if (!data.name || !data.download_url) {
    redirect(
      `/dashboard/lead-magnets?error=${encodeURIComponent(
        "Name and download URL are required",
      )}`,
    );
  }

  const { error } = await supabase
    .from("lead_magnets")
    .update(data)
    .eq("id", id)
    .eq("profile_id", user.id);

  if (error) {
    redirect(
      `/dashboard/lead-magnets?error=${encodeURIComponent(error.message)}`,
    );
  }

  revalidatePath("/dashboard/lead-magnets");
  // Public pages may render this magnet's copy/URL — invalidate them too.
  revalidatePath("/[username]", "page");
  revalidatePath("/[username]/[slug]", "page");
}

export async function deleteLeadMagnet(id: string) {
  const { supabase, user } = await requireUser();
  const { error } = await supabase
    .from("lead_magnets")
    .delete()
    .eq("id", id)
    .eq("profile_id", user.id);

  if (error) {
    redirect(
      `/dashboard/lead-magnets?error=${encodeURIComponent(error.message)}`,
    );
  }
  revalidatePath("/dashboard/lead-magnets");
}
