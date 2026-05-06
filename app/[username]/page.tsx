import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { PublicPage } from "@/components/public/public-page";

// Reserved single-segment paths that must not be matched as usernames.
// Static routes win in Next.js, but this prevents a user signing up as
// "dashboard" from breaking their own URL.
const RESERVED = new Set([
  "login",
  "signup",
  "logout",
  "dashboard",
  "auth",
  "api",
  "settings",
  "admin",
  "_next",
]);

export const dynamic = "force-dynamic";

type Props = { params: { username: string } };

export async function generateMetadata({ params }: Props) {
  const username = decodeURIComponent(params.username).toLowerCase();
  if (RESERVED.has(username)) return { title: "Not found" };

  const supabase = createClient();
  const { data: profile } = await supabase
    .from("profiles")
    .select("display_name, username, bio")
    .eq("username", username)
    .maybeSingle();

  if (!profile) return { title: "Not found" };

  const title = profile.display_name
    ? `${profile.display_name} (@${profile.username})`
    : `@${profile.username}`;

  return {
    title,
    description: profile.bio ?? `Find ${profile.username} on Contenomics`,
    openGraph: {
      title,
      description: profile.bio ?? undefined,
    },
  };
}

export default async function PublicBioPage({ params }: Props) {
  const username = decodeURIComponent(params.username).toLowerCase();
  if (RESERVED.has(username)) notFound();

  const supabase = createClient();

  const { data: profile } = await supabase
    .from("profiles")
    .select("id, username, display_name, avatar_url, bio")
    .eq("username", username)
    .maybeSingle();

  if (!profile) notFound();

  // The owner viewing their own page sees unpublished drafts too —
  // makes the iframe in the dashboard editor work without a separate
  // /preview route, and lets the creator self-preview by just visiting
  // /{username} while signed in.
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const isOwner = !!user && user.id === profile.id;

  let pageQuery = supabase
    .from("pages")
    .select("id, title, description, is_published, is_default, template")
    .eq("profile_id", profile.id)
    .eq("is_default", true);
  if (!isOwner) pageQuery = pageQuery.eq("is_published", true);

  const { data: page } = await pageQuery.maybeSingle();
  if (!page) notFound();

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
