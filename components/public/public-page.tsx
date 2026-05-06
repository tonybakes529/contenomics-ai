import { BlockRenderer } from "@/components/blocks/block-renderer";
import { cn } from "@/lib/utils";

export type PublicProfile = {
  username: string;
  display_name: string | null;
  avatar_url: string | null;
  bio: string | null;
};

export type PublicPageData = {
  id: string;
  template: "bio" | "landing";
};

export type PublicBlock = {
  id: string;
  type: string;
  position: number;
  config: unknown;
};

export function PublicPage({
  profile,
  page,
  blocks,
}: {
  profile: PublicProfile;
  page: PublicPageData;
  blocks: PublicBlock[];
}) {
  const isLanding = page.template === "landing";

  const initials =
    (profile.display_name ?? profile.username).slice(0, 2).toUpperCase() || "??";

  // ─── Landing template: wide, sectioned, desktop-friendly ──────────────
  if (isLanding) {
    return (
      <main className="min-h-screen bg-white text-black">
        {/*
          Slim nav at the top — a real landing page has a thin header,
          not a centered avatar+bio block. Just enough to brand the page;
          the hero block (or whatever the creator puts first) takes over
          from there.
        */}
        <header className="sticky top-0 z-10 border-b border-zinc-200/70 bg-white/80 backdrop-blur">
          <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3 sm:px-8">
            <div className="flex items-center gap-2.5">
              <div className="bg-muted flex size-7 items-center justify-center overflow-hidden rounded-full">
                {profile.avatar_url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={profile.avatar_url}
                    alt=""
                    className="size-full object-cover"
                  />
                ) : (
                  <span className="text-muted-foreground text-[10px] font-semibold">
                    {initials}
                  </span>
                )}
              </div>
              <span className="text-sm font-semibold tracking-tight">
                {profile.display_name ?? `@${profile.username}`}
              </span>
            </div>
          </div>
        </header>

        {/*
          Blocks are rendered as full-bleed sections by BlockRenderer when
          template="landing". No max-w wrapper here — each section owns its
          own padding and inner max-width.
        */}
        <BlockRenderer blocks={blocks} pageId={page.id} template="landing" />

        {blocks.length === 0 ? (
          <div className="mx-auto max-w-2xl px-4 py-32 text-center sm:px-8">
            <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">
              Nothing to show yet
            </h1>
            <p className="text-muted-foreground mt-3 text-sm sm:text-base">
              {profile.display_name ?? `@${profile.username}`} hasn&apos;t
              published this landing page yet. Check back soon.
            </p>
          </div>
        ) : null}

        <footer className="border-t border-zinc-200/70 bg-zinc-50">
          <div className="mx-auto flex max-w-5xl flex-col items-center gap-3 px-4 py-10 text-center sm:flex-row sm:justify-between sm:text-left sm:px-8">
            <div className="flex items-center gap-2.5">
              <div className="bg-muted flex size-8 items-center justify-center overflow-hidden rounded-full">
                {profile.avatar_url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={profile.avatar_url}
                    alt=""
                    className="size-full object-cover"
                  />
                ) : (
                  <span className="text-muted-foreground text-xs font-semibold">
                    {initials}
                  </span>
                )}
              </div>
              <div className="leading-tight">
                <p className="text-sm font-medium">
                  {profile.display_name ?? `@${profile.username}`}
                </p>
                {profile.display_name ? (
                  <p className="text-muted-foreground text-xs">
                    @{profile.username}
                  </p>
                ) : null}
              </div>
            </div>
            <p className="text-muted-foreground text-xs">
              Powered by{" "}
              <a href="/" className="underline underline-offset-2">
                Contenomics
              </a>
            </p>
          </div>
        </footer>
      </main>
    );
  }

  // ─── Bio template: mobile-first, centered, link-list ──────────────────
  return (
    <main
      className={cn(
        "flex min-h-screen flex-col items-center bg-white px-4 pt-10 pb-16 text-black",
      )}
    >
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

        <BlockRenderer blocks={blocks} pageId={page.id} template="bio" />

        {blocks.length === 0 ? (
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
