import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { PublicPage } from "@/components/public/public-page";

export const dynamic = "force-dynamic";

type Props = { params: { username: string; slug: string } };

export async function generateMetadata({ params }: Props) {
  const username = decodeURIComponent(params.username).toLowerCase();
  const slug = decodeURIComponent(params.slug).toLowerCase();
  const supabase = createClient();

  const { data: profile } = await supabase
    .from("profiles")
    .select("id, display_name, username, bio")
    .eq("username", username)
    .maybeSingle();
  if (!profile) return { title: "Not found" };

  const { data: page } = await supabase
    .from("pages")
    .select("title, description")
    .eq("profile_id", profile.id)
    .eq("slug", slug)
    .eq("is_published", true)
    .maybeSingle();
  if (!page) return { title: "Not found" };

  const titleBase = profile.display_name ?? `@${profile.username}`;
  const title = page.title ? `${page.title} — ${titleBase}` : titleBase;

  return {
    title,
    description: page.description ?? profile.bio ?? undefined,
    openGraph: {
      title,
      description: page.description ?? profile.bio ?? undefined,
    },
  };
}

export default async function PublicSlugPage({ params }: Props) {
  const username = decodeURIComponent(params.username).toLowerCase();
  const slug = decodeURIComponent(params.slug).toLowerCase();
  const supabase = createClient();

  const { data: profile } = await supabase
    .from("profiles")
    .select("id, username, display_name, avatar_url, bio")
    .eq("username", username)
    .maybeSingle();
  if (!profile) notFound();

  // Owner sees their own unpublished drafts (lets the editor's preview
  // iframe show in-progress pages without a separate /preview route).
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const isOwner = !!user && user.id === profile.id;

  let pageQuery = supabase
    .from("pages")
    .select("id, title, description, is_published, is_default, template, slug")
    .eq("profile_id", profile.id)
    .eq("slug", slug);
  if (!isOwner) pageQuery = pageQuery.eq("is_published", true);

  const { data: page } = await pageQuery.maybeSingle();
  if (!page) notFound();

  // If this is the default page, the canonical URL is /username — but we
  // still render here rather than redirecting, since the URL is valid.
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
