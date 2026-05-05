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
        <header className="border-b border-zinc-200/70">
          <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-4 sm:px-8">
            <div className="flex items-center gap-3">
              <div className="bg-muted flex size-9 items-center justify-center overflow-hidden rounded-full">
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
                <p className="text-sm font-semibold">
                  {profile.display_name ?? `@${profile.username}`}
                </p>
                {profile.display_name ? (
                  <p className="text-muted-foreground text-xs">
                    @{profile.username}
                  </p>
                ) : null}
              </div>
            </div>
          </div>
        </header>

        <div className="mx-auto max-w-5xl px-4 py-10 sm:px-8 sm:py-16">
          <BlockRenderer
            blocks={blocks}
            pageId={page.id}
            template="landing"
          />

          {blocks.length === 0 ? (
            <p className="text-muted-foreground py-12 text-center text-sm">
              This page is empty for now. Check back soon.
            </p>
          ) : null}
        </div>

        <footer className="border-t border-zinc-200/70 px-4 py-8 text-center sm:px-8">
          <p className="text-muted-foreground text-xs">
            Powered by{" "}
            <a href="/" className="underline">
              Contenomics
            </a>
          </p>
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
