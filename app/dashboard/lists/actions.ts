"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

async function requireUser() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login?next=/dashboard/lists");
  return { supabase, user };
}

export async function createList(formData: FormData) {
  const { supabase, user } = await requireUser();
  const name = String(formData.get("name") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim();
  const color = String(formData.get("color") ?? "").trim();

  if (!name) {
    redirect(
      `/dashboard/lists?error=${encodeURIComponent("Name is required")}`,
    );
  }

  const { error } = await supabase.from("lists").insert({
    profile_id: user.id,
    name,
    description: description || null,
    color: color || null,
  });

  if (error) {
    redirect(`/dashboard/lists?error=${encodeURIComponent(error.message)}`);
  }
  revalidatePath("/dashboard/lists");
}

export async function updateList(listId: string, formData: FormData) {
  const { supabase, user } = await requireUser();
  const name = String(formData.get("name") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim();
  const color = String(formData.get("color") ?? "").trim();

  if (!name) {
    redirect(
      `/dashboard/lists?error=${encodeURIComponent("Name is required")}`,
    );
  }

  const { error } = await supabase
    .from("lists")
    .update({
      name,
      description: description || null,
      color: color || null,
    })
    .eq("id", listId)
    .eq("profile_id", user.id);

  if (error) {
    redirect(`/dashboard/lists?error=${encodeURIComponent(error.message)}`);
  }
  revalidatePath("/dashboard/lists");
}

export async function deleteList(listId: string) {
  const { supabase, user } = await requireUser();
  const { error } = await supabase
    .from("lists")
    .delete()
    .eq("id", listId)
    .eq("profile_id", user.id);
  if (error) {
    redirect(`/dashboard/lists?error=${encodeURIComponent(error.message)}`);
  }
  revalidatePath("/dashboard/lists");
}
