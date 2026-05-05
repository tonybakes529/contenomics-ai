"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

const USERNAME_RE = /^[a-z0-9_]{3,30}$/;
const AVATAR_BUCKET = "avatars";

async function requireUser() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login?next=/dashboard/settings");
  return { supabase, user };
}

export async function updateProfile(formData: FormData) {
  const { supabase, user } = await requireUser();
  const username = String(formData.get("username") ?? "").toLowerCase().trim();
  const display_name = String(formData.get("display_name") ?? "").trim();
  const bio = String(formData.get("bio") ?? "").trim();

  if (!USERNAME_RE.test(username)) {
    redirect(
      `/dashboard/settings?error=${encodeURIComponent(
        "Username must be 3–30 characters: lowercase letters, numbers, underscores",
      )}`,
    );
  }

  const { error } = await supabase
    .from("profiles")
    .update({
      username,
      display_name: display_name || null,
      bio: bio || null,
    })
    .eq("id", user.id);

  if (error) {
    if (error.code === "23505") {
      redirect(
        `/dashboard/settings?error=${encodeURIComponent(
          "That username is already taken.",
        )}`,
      );
    }
    redirect(
      `/dashboard/settings?error=${encodeURIComponent(error.message)}`,
    );
  }

  revalidatePath("/dashboard/settings");
  revalidatePath("/dashboard");
  revalidatePath("/[username]", "page");
  redirect("/dashboard/settings?saved=1");
}

export async function uploadAvatar(formData: FormData) {
  const { supabase, user } = await requireUser();
  const file = formData.get("avatar");
  if (!(file instanceof File) || file.size === 0) {
    redirect(
      `/dashboard/settings?error=${encodeURIComponent("Please choose a file")}`,
    );
  }

  if (file.size > 2 * 1024 * 1024) {
    redirect(
      `/dashboard/settings?error=${encodeURIComponent(
        "Avatar must be under 2 MB",
      )}`,
    );
  }

  // Determine extension from name or mime.
  const fromName = file.name.match(/\.([a-zA-Z0-9]+)$/)?.[1]?.toLowerCase();
  const fromMime = file.type.split("/")[1]?.toLowerCase();
  const ext = (fromName ?? fromMime ?? "png").replace(/[^a-z0-9]/g, "");

  const path = `${user.id}/avatar.${ext}`;

  const { error: uploadErr } = await supabase.storage
    .from(AVATAR_BUCKET)
    .upload(path, file, {
      cacheControl: "3600",
      upsert: true,
      contentType: file.type || undefined,
    });

  if (uploadErr) {
    redirect(
      `/dashboard/settings?error=${encodeURIComponent(uploadErr.message)}`,
    );
  }

  const { data: pub } = supabase.storage.from(AVATAR_BUCKET).getPublicUrl(path);
  const publicUrl = `${pub.publicUrl}?v=${Date.now()}`;

  const { error: updateErr } = await supabase
    .from("profiles")
    .update({ avatar_url: publicUrl })
    .eq("id", user.id);

  if (updateErr) {
    redirect(
      `/dashboard/settings?error=${encodeURIComponent(updateErr.message)}`,
    );
  }

  revalidatePath("/dashboard/settings");
  revalidatePath("/[username]", "page");
  redirect("/dashboard/settings?saved=1");
}
