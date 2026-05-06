import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { PublicPage } from "@/components/public/public-page";

// Live preview of the page being edited. Auth-protected (under /dashboard
// so middleware enforces it). Bypasses the is_published check because
// we're scoped to the owner's own row via RLS.
export const dynamic = "force-dynamic";

// Don't expose this route in indexes; it's strictly an editor iframe target.
export const metadata = { robots: "noindex, nofollow" };

export default async function PagePreview({
  params,
}: {
  params: { id: string };
}) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect(`/login?next=/dashboard/pages/${params.id}/preview`);

  const { data: page } = await supabase
    .from("pages")
    .select("id, slug, title, description, template, is_default")
    .eq("id", params.id)
    .eq("profile_id", user.id)
    .maybeSingle();
  if (!page) notFound();

  const { data: profile } = await supabase
    .from("profiles")
    .select("id, username, display_name, avatar_url, bio")
    .eq("id", user.id)
    .maybeSingle();
  if (!profile) notFound();

  const { data: blocks } = await supabase
    .from("blocks")
    .select("id, type, position, config")
    .eq("page_id", page.id)
    .eq("is_visible", true)
    .order("position", { ascending: true });

  return (
    <PublicPage
      profile={profile}
      page={{ id: page.id, template: page.template }}
      blocks={blocks ?? []}
    />
  );
}
