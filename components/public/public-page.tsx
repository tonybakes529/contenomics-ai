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
    // The contenomics-dark wrapper overrides theme CSS vars so all
    // descendant blocks (which use bg-background, text-foreground,
    // border-border, etc.) automatically pick up the dark/glass palette
    // — no per-block code changes needed. Bio template is untouched.
    return (
      <main className="contenomics-dark relative min-h-screen overflow-hidden">
        {/* Decorative ambient glows. Absolute, non-interactive. */}
        <div
          className="glow-emerald"
          style={{
            top: "-100px",
            left: "50%",
            transform: "translateX(-50%)",
            width: "800px",
            height: "600px",
          }}
          aria-hidden
        />
        <div
          className="glow-blue"
          style={{
            top: "30%",
            right: "5%",
            width: "400px",
            height: "400px",
          }}
          aria-hidden
        />

        {/*
          Slim nav at the top — a real landing page has a thin header,
          not a centered avatar+bio block.
        */}
        <header className="glass-header sticky top-0 z-30">
          <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3 sm:px-8">
            <div className="flex items-center gap-2.5">
              <div
                className="flex size-7 items-center justify-center overflow-hidden rounded-full"
                style={{ background: "rgba(255,255,255,0.06)" }}
              >
                {profile.avatar_url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={profile.avatar_url}
                    alt=""
                    className="size-full object-cover"
                  />
                ) : (
                  <span className="text-[10px] font-semibold text-[#9BA5B3]">
                    {initials}
                  </span>
                )}
              </div>
              <span
                className="text-sm font-semibold tracking-tight text-[#E8EDF2]"
                style={{ letterSpacing: "-0.3px" }}
              >
                {profile.display_name ?? `@${profile.username}`}
              </span>
            </div>
          </div>
        </header>

        {/* Blocks. Full-bleed sections, themed via cascading CSS vars. */}
        <div className="relative z-10">
          <BlockRenderer
            blocks={blocks}
            pageId={page.id}
            template="landing"
          />
        </div>

        {blocks.length === 0 ? (
          <div className="relative z-10 mx-auto max-w-2xl px-4 py-32 text-center sm:px-8">
            <h1
              className="text-2xl font-semibold text-[#E8EDF2] sm:text-3xl"
              style={{ letterSpacing: "-1.5px" }}
            >
              Nothing to show yet
            </h1>
            <p className="mt-3 text-sm text-[#9BA5B3] sm:text-base">
              {profile.display_name ?? `@${profile.username}`} hasn&apos;t
              published this landing page yet. Check back soon.
            </p>
          </div>
        ) : null}

        <footer
          className="relative z-10"
          style={{
            background: "rgba(15,20,25,0.6)",
            backdropFilter: "blur(20px)",
            WebkitBackdropFilter: "blur(20px)",
            borderTop: "1px solid rgba(255,255,255,0.08)",
          }}
        >
          <div className="mx-auto flex max-w-5xl flex-col items-center gap-3 px-4 py-10 text-center sm:flex-row sm:justify-between sm:text-left sm:px-8">
            <div className="flex items-center gap-2.5">
              <div
                className="flex size-8 items-center justify-center overflow-hidden rounded-full"
                style={{ background: "rgba(255,255,255,0.06)" }}
              >
                {profile.avatar_url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={profile.avatar_url}
                    alt=""
                    className="size-full object-cover"
                  />
                ) : (
                  <span className="text-xs font-semibold text-[#9BA5B3]">
                    {initials}
                  </span>
                )}
              </div>
              <div className="leading-tight">
                <p className="text-sm font-medium text-[#E8EDF2]">
                  {profile.display_name ?? `@${profile.username}`}
                </p>
                {profile.display_name ? (
                  <p className="text-xs text-[#7D8A99]">
                    @{profile.username}
                  </p>
                ) : null}
              </div>
            </div>
            <p className="text-xs text-[#7D8A99]">
              Powered by{" "}
              <a
                href="/"
                className="underline underline-offset-2 hover:text-[#E8EDF2]"
              >
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
