import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { ListsManager } from "@/components/dashboard/lists-manager";
import { createList, deleteList, updateList } from "./actions";

export const metadata = { title: "Lists — Contenomics" };
export const dynamic = "force-dynamic";

export default async function ListsPage({
  searchParams,
}: {
  searchParams: { error?: string };
}) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login?next=/dashboard/lists");

  const { data: lists } = await supabase
    .from("lists")
    .select("id, name, description, color")
    .eq("profile_id", user.id)
    .order("name", { ascending: true });

  // Count subscribers per list (one query, group manually).
  const listIds = (lists ?? []).map((l) => l.id);
  const counts = new Map<string, number>();
  if (listIds.length > 0) {
    const { data: junctions } = await supabase
      .from("subscriber_lists")
      .select("list_id")
      .in("list_id", listIds);
    junctions?.forEach((j) => {
      counts.set(j.list_id, (counts.get(j.list_id) ?? 0) + 1);
    });
  }

  return (
    <div className="space-y-6 px-4 py-8 md:px-8">
      <div className="space-y-1">
        <h1 className="text-2xl font-semibold tracking-tight">Lists</h1>
        <p className="text-muted-foreground text-sm">
          Segment your subscribers. Email forms can target specific lists.
        </p>
      </div>

      {searchParams.error ? (
        <div
          role="alert"
          className="border-destructive/30 bg-destructive/5 text-destructive rounded-md border px-4 py-3 text-sm"
        >
          {searchParams.error}
        </div>
      ) : null}

      <ListsManager
        lists={(lists ?? []).map((l) => ({
          id: l.id,
          name: l.name,
          description: l.description,
          color: l.color,
          subscriber_count: counts.get(l.id) ?? 0,
        }))}
        onCreate={createList}
        onUpdate={updateList}
        onDelete={deleteList}
      />
    </div>
  );
}
