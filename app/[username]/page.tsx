import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { BlockRenderer } from "@/components/blocks/block-renderer";

// Reserved single-segment paths that must not be matched as usernames.
// (Static routes win in Next.js, but if a user signs up as "dashboard"
// they'd never be able to share their own URL — block at fetch time.)
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

  const { data: page } = await supabase
    .from("pages")
    .select("id, title, description, is_published, is_default")
    .eq("profile_id", profile.id)
    .eq("is_default", true)
    .eq("is_published", true)
    .maybeSingle();

  if (!page) notFound();

  const { data: blocks } = await supabase
    .from("blocks")
    .select("id, type, position, config")
    .eq("page_id", page.id)
    .eq("is_visible", true)
    .order("position", { ascending: true });

  const initials =
    (profile.display_name ?? profile.username).slice(0, 2).toUpperCase() || "??";

  return (
    <main className="flex min-h-screen flex-col items-center bg-white px-4 pt-10 pb-16 text-black">
      <div className="flex w-full max-w-md flex-col items-center gap-5">
        <div className="bg-muted flex size-24 items-center justify-center overflow-hidden rounded-full">
          {profile.avatar_url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={profile.avatar_url}
              alt={profile.display_name ?? profile.username}
              className="size-full object-cover"
            />
          ) : (
            <span className="text-muted-foreground text-2xl font-semibold">
              {initials}
            </span>
          )}
        </div>

        <div className="space-y-1 text-center">
          <h1 className="text-xl font-semibold">
            {profile.display_name ?? `@${profile.username}`}
          </h1>
          {profile.display_name ? (
            <p className="text-muted-foreground text-sm">@{profile.username}</p>
          ) : null}
          {profile.bio ? (
            <p className="text-muted-foreground mt-2 text-sm whitespace-pre-line">
              {profile.bio}
            </p>
          ) : null}
        </div>

        <BlockRenderer blocks={blocks ?? []} pageId={page.id} />

        {(blocks?.length ?? 0) === 0 ? (
          <p className="text-muted-foreground mt-6 text-center text-xs">
            This page is empty for now. Check back soon.
          </p>
        ) : null}
      </div>

      <footer className="text-muted-foreground mt-auto pt-12 text-xs">
        Powered by{" "}
        <a href="/" className="underline">
          Contenomics
        </a>
      </footer>
    </main>
  );
}
