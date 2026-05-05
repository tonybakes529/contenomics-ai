import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export const metadata = {
  title: "Contenomics — Link in bio + email CRM for YouTubers",
  description:
    "Stop sending viewers to a static link tree. Build a page that captures emails, routes fans where you want, and shows you what's working.",
};

export default function Home() {
  return (
    <main className="min-h-screen bg-white text-black">
      <Header />
      <Hero />
      <SocialProof />
      <Features />
      <HowItWorks />
      <Comparison />
      <Faq />
      <FinalCta />
      <Footer />
    </main>
  );
}

function Header() {
  return (
    <header className="border-b border-zinc-200/70">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4 sm:px-8">
        <Link href="/" className="text-base font-semibold tracking-tight">
          Contenomics
        </Link>
        <nav className="flex items-center gap-3">
          <Link
            href="/login"
            className="text-muted-foreground hover:text-foreground hidden text-sm sm:inline"
          >
            Sign in
          </Link>
          <Link
            href="/signup"
            className={cn(buttonVariants({ size: "sm" }))}
          >
            Start free
          </Link>
        </nav>
      </div>
    </header>
  );
}

function Hero() {
  return (
    <section className="px-4 sm:px-8">
      <div className="mx-auto max-w-4xl py-16 text-center sm:py-28">
        <p className="text-muted-foreground mb-4 text-xs font-medium uppercase tracking-widest">
          For YouTubers
        </p>
        <h1 className="text-4xl font-semibold tracking-tight text-balance sm:text-6xl">
          Your link in bio, with a CRM that pays you back.
        </h1>
        <p className="text-muted-foreground mx-auto mt-6 max-w-2xl text-base text-balance sm:text-lg">
          Stop pointing viewers at a static link tree. Build a page that
          captures emails, routes fans where you want them, and shows you what
          actually drives clicks.
        </p>
        <div className="mt-10 flex flex-wrap items-center justify-center gap-3">
          <Link
            href="/signup"
            className={cn(buttonVariants({ size: "lg" }))}
          >
            Start free — no credit card
          </Link>
          <a
            href="#how-it-works"
            className={cn(
              buttonVariants({ variant: "outline", size: "lg" }),
            )}
          >
            How it works
          </a>
        </div>
        <p className="text-muted-foreground mt-4 text-xs">
          Free during beta. No card required.
        </p>
      </div>
    </section>
  );
}

function SocialProof() {
  return (
    <section className="border-y border-zinc-200/70 bg-zinc-50 px-4 py-8 sm:px-8">
      <div className="mx-auto flex max-w-6xl flex-col items-center gap-3 text-center">
        <p className="text-muted-foreground text-xs font-medium uppercase tracking-widest">
          Built for the platforms YouTubers actually use
        </p>
        <div className="text-muted-foreground flex flex-wrap items-center justify-center gap-x-8 gap-y-2 text-sm">
          <span>YouTube</span>
          <span>·</span>
          <span>Instagram</span>
          <span>·</span>
          <span>TikTok</span>
          <span>·</span>
          <span>Twitter / X</span>
          <span>·</span>
          <span>Twitch</span>
        </div>
      </div>
    </section>
  );
}

function Features() {
  const items = [
    {
      icon: "🔗",
      title: "Link in bio + landing page",
      body: "Pick a mobile-first link list for your YouTube description, or a wide landing page for product launches. Switch any time.",
    },
    {
      icon: "✉️",
      title: "Email capture with double opt-in",
      body: "Drop an email block on any page. Subscribers get a confirmation email and land in your CRM, organized by source.",
    },
    {
      icon: "📊",
      title: "Click tracking that's actually useful",
      body: "Every link tracks UTMs and source. See which video and which block sent the best fans, in plain numbers.",
    },
    {
      icon: "🎯",
      title: "Lists for segmentation",
      body: "Tag subscribers by where they came from. Send the right message to the right group, when you're ready.",
    },
    {
      icon: "🧱",
      title: "Editable blocks",
      body: "Hero, features, testimonials, FAQ, pricing, video embeds, and more. Add, reorder, hide, ship.",
    },
    {
      icon: "🚀",
      title: "Yours from day one",
      body: "Custom domain, your data exportable as CSV, no platform that owns your audience.",
    },
  ];
  return (
    <section className="px-4 py-20 sm:px-8 sm:py-28">
      <div className="mx-auto max-w-6xl">
        <div className="mx-auto max-w-2xl space-y-3 text-center">
          <h2 className="text-3xl font-semibold tracking-tight sm:text-4xl">
            Everything you need to grow off-platform.
          </h2>
          <p className="text-muted-foreground text-base sm:text-lg">
            One link in your description, a real list of fans on the other end.
          </p>
        </div>
        <div className="mt-12 grid gap-5 sm:grid-cols-2 md:grid-cols-3">
          {items.map((it) => (
            <div
              key={it.title}
              className="rounded-2xl border border-zinc-200/80 p-6"
            >
              <div className="text-2xl">{it.icon}</div>
              <h3 className="mt-3 text-base font-semibold">{it.title}</h3>
              <p className="text-muted-foreground mt-2 text-sm">{it.body}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function HowItWorks() {
  const steps = [
    {
      n: "01",
      title: "Sign up free",
      body: "Email + password. Your username becomes your URL — contenomics.ai/yourname.",
    },
    {
      n: "02",
      title: "Build your page",
      body: "Drop in blocks: links, an email form, your latest video, a testimonial. Pick the link-in-bio template or the landing page template.",
    },
    {
      n: "03",
      title: "Drop your URL in your YouTube description",
      body: "Then watch the dashboard fill up. See which video is converting, which links get clicks, and who's joining your list.",
    },
  ];
  return (
    <section
      id="how-it-works"
      className="border-y border-zinc-200/70 bg-zinc-50 px-4 py-20 sm:px-8 sm:py-28"
    >
      <div className="mx-auto max-w-6xl">
        <div className="mx-auto max-w-2xl space-y-3 text-center">
          <h2 className="text-3xl font-semibold tracking-tight sm:text-4xl">
            Up in five minutes.
          </h2>
          <p className="text-muted-foreground text-base sm:text-lg">
            No funnel-builder courses. No setup wizards. Just three steps.
          </p>
        </div>
        <ol className="mt-12 grid gap-5 sm:grid-cols-3">
          {steps.map((s) => (
            <li key={s.n} className="rounded-2xl bg-white p-6">
              <div className="text-muted-foreground text-xs font-semibold tracking-widest">
                {s.n}
              </div>
              <h3 className="mt-2 text-base font-semibold">{s.title}</h3>
              <p className="text-muted-foreground mt-2 text-sm">{s.body}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}

function Comparison() {
  const rows = [
    {
      label: "Link in bio",
      contenomics: true,
      others: true,
    },
    {
      label: "Landing-page template (hero, features, pricing)",
      contenomics: true,
      others: false,
    },
    {
      label: "Email capture into your own CRM",
      contenomics: true,
      others: "Locked behind upsells",
    },
    {
      label: "Per-block click tracking with UTM",
      contenomics: true,
      others: "Aggregate only",
    },
    {
      label: "Export your subscribers as CSV",
      contenomics: true,
      others: "Sometimes paid",
    },
    {
      label: "Multiple pages per profile",
      contenomics: true,
      others: false,
    },
  ];
  return (
    <section className="px-4 py-20 sm:px-8 sm:py-28">
      <div className="mx-auto max-w-4xl">
        <div className="space-y-3 text-center">
          <h2 className="text-3xl font-semibold tracking-tight sm:text-4xl">
            Why not Linktree, Beacons, or Stan?
          </h2>
          <p className="text-muted-foreground text-base sm:text-lg">
            Those tools were built to keep you on their platform. Contenomics
            was built to grow your list off-platform.
          </p>
        </div>
        <div className="mt-12 overflow-hidden rounded-2xl border border-zinc-200/80">
          <table className="w-full text-sm">
            <thead className="bg-zinc-50">
              <tr>
                <th className="px-4 py-3 text-left font-medium">Feature</th>
                <th className="px-4 py-3 text-left font-medium">Contenomics</th>
                <th className="px-4 py-3 text-left font-medium">Most others</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-200/80">
              {rows.map((r) => (
                <tr key={r.label}>
                  <td className="px-4 py-3">{r.label}</td>
                  <td className="px-4 py-3">
                    {typeof r.contenomics === "boolean" ? (
                      r.contenomics ? (
                        <span aria-label="Yes">✓</span>
                      ) : (
                        <span className="text-muted-foreground" aria-label="No">
                          —
                        </span>
                      )
                    ) : (
                      r.contenomics
                    )}
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">
                    {typeof r.others === "boolean" ? (
                      r.others ? (
                        <span>✓</span>
                      ) : (
                        <span aria-label="No">—</span>
                      )
                    ) : (
                      r.others
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}

function Faq() {
  const items = [
    {
      q: "Is there a free plan?",
      a: "Yes — Contenomics is free during beta. No credit card, no row caps. Pricing comes later, and beta users get grandfathered.",
    },
    {
      q: "How is this different from Mailchimp?",
      a: "Mailchimp is for sending email campaigns. Contenomics is the link in your bio that captures the addresses in the first place. The two complement each other — you can export your CSV and import it anywhere.",
    },
    {
      q: "Can I bring my own domain?",
      a: "Yes. The default URL is contenomics.ai/yourname, and custom domains are coming as soon as the beta wraps.",
    },
    {
      q: "Where's my data?",
      a: "On Supabase Postgres, in your account, exportable as CSV at any time. We don't sell, scrape, or train on your subscriber list.",
    },
    {
      q: "Why YouTubers specifically?",
      a: "YouTubers have an audience but no easy way to own them off-platform. Most link-in-bio tools weren't built for the sub→email handoff. We were.",
    },
  ];
  return (
    <section className="border-y border-zinc-200/70 bg-zinc-50 px-4 py-20 sm:px-8 sm:py-28">
      <div className="mx-auto max-w-3xl">
        <div className="space-y-3 text-center">
          <h2 className="text-3xl font-semibold tracking-tight sm:text-4xl">
            Honest answers
          </h2>
        </div>
        <div className="mt-10 divide-y divide-zinc-200/80 rounded-2xl bg-white">
          {items.map((it) => (
            <details key={it.q} className="group p-5">
              <summary className="flex cursor-pointer items-center justify-between gap-4 text-sm font-medium [&::-webkit-details-marker]:hidden">
                <span>{it.q}</span>
                <span
                  className="text-muted-foreground transition-transform group-open:rotate-45"
                  aria-hidden
                >
                  +
                </span>
              </summary>
              <p className="text-muted-foreground mt-3 text-sm">{it.a}</p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}

function FinalCta() {
  return (
    <section className="px-4 py-20 sm:px-8 sm:py-28">
      <div className="bg-foreground text-background mx-auto max-w-5xl rounded-3xl px-6 py-14 text-center sm:px-12 sm:py-20">
        <h2 className="text-3xl font-semibold tracking-tight sm:text-4xl">
          Stop renting your audience.
        </h2>
        <p className="mx-auto mt-4 max-w-xl text-base opacity-80 sm:text-lg">
          Build your link in bio, capture emails, and own your list. Free
          during beta.
        </p>
        <div className="mt-8">
          <Link
            href="/signup"
            className="bg-background text-foreground inline-flex h-12 items-center rounded-xl px-6 text-sm font-medium transition-opacity hover:opacity-90"
          >
            Start free →
          </Link>
        </div>
      </div>
    </section>
  );
}

function Footer() {
  return (
    <footer className="border-t border-zinc-200/70 px-4 py-10 sm:px-8">
      <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-3 text-xs text-muted-foreground sm:flex-row">
        <p>© {new Date().getFullYear()} Contenomics</p>
        <div className="flex items-center gap-4">
          <Link href="/login" className="hover:text-foreground">
            Sign in
          </Link>
          <Link href="/signup" className="hover:text-foreground">
            Sign up
          </Link>
        </div>
      </div>
    </footer>
  );
}
