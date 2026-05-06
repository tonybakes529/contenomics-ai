"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

async function requireUser() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login?next=/dashboard/subscribers");
  return { supabase, user };
}

// Bulk-assign one list to many subscribers. Idempotent thanks to the
// (subscriber_id, list_id) unique constraint on subscriber_lists.
export async function assignSubscribersToList(
  subscriberIds: string[],
  listId: string,
) {
  const { supabase, user } = await requireUser();

  if (!Array.isArray(subscriberIds) || subscriberIds.length === 0) return;
  if (!listId || typeof listId !== "string") return;

  // Defense in depth: confirm the list belongs to this user before
  // building the junction rows. RLS will also enforce this on insert.
  const { data: list } = await supabase
    .from("lists")
    .select("id")
    .eq("id", listId)
    .eq("profile_id", user.id)
    .maybeSingle();
  if (!list) {
    redirect(
      `/dashboard/subscribers?error=${encodeURIComponent("List not found")}`,
    );
  }

  // Filter to subscribers actually owned by this user. Anyone could
  // theoretically pass arbitrary ids in the form action, so we narrow
  // first before building the junction rows.
  const { data: ownedSubs } = await supabase
    .from("subscribers")
    .select("id")
    .eq("profile_id", user.id)
    .in("id", subscriberIds);

  const safeIds = (ownedSubs ?? []).map((s) => s.id);
  if (safeIds.length === 0) return;

  const rows = safeIds.map((subscriber_id) => ({
    subscriber_id,
    list_id: listId,
  }));

  const { error } = await supabase
    .from("subscriber_lists")
    .upsert(rows, { onConflict: "subscriber_id,list_id" });

  if (error) {
    redirect(
      `/dashboard/subscribers?error=${encodeURIComponent(error.message)}`,
    );
  }

  revalidatePath("/dashboard/subscribers");
  revalidatePath("/dashboard/lists");
}

// Remove one subscriber from one list.
export async function removeSubscriberFromList(
  subscriberId: string,
  listId: string,
) {
  const { supabase, user } = await requireUser();

  if (!subscriberId || !listId) return;

  // Make sure the subscriber belongs to this user before deleting.
  const { data: sub } = await supabase
    .from("subscribers")
    .select("id")
    .eq("id", subscriberId)
    .eq("profile_id", user.id)
    .maybeSingle();
  if (!sub) return;

  const { error } = await supabase
    .from("subscriber_lists")
    .delete()
    .eq("subscriber_id", subscriberId)
    .eq("list_id", listId);

  if (error) {
    redirect(
      `/dashboard/subscribers?error=${encodeURIComponent(error.message)}`,
    );
  }

  revalidatePath("/dashboard/subscribers");
  revalidatePath("/dashboard/lists");
}

// Bulk-remove a list from many subscribers (used for "Remove from list"
// while filtering by that list).
export async function removeSubscribersFromList(
  subscriberIds: string[],
  listId: string,
) {
  const { supabase, user } = await requireUser();

  if (!Array.isArray(subscriberIds) || subscriberIds.length === 0) return;
  if (!listId) return;

  const { data: ownedSubs } = await supabase
    .from("subscribers")
    .select("id")
    .eq("profile_id", user.id)
    .in("id", subscriberIds);

  const safeIds = (ownedSubs ?? []).map((s) => s.id);
  if (safeIds.length === 0) return;

  const { error } = await supabase
    .from("subscriber_lists")
    .delete()
    .eq("list_id", listId)
    .in("subscriber_id", safeIds);

  if (error) {
    redirect(
      `/dashboard/subscribers?error=${encodeURIComponent(error.message)}`,
    );
  }

  revalidatePath("/dashboard/subscribers");
  revalidatePath("/dashboard/lists");
}
