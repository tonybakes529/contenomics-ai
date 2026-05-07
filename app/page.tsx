import Link from "next/link";

export const metadata = {
  title: "Contenomics — Link in bio + email CRM for YouTubers",
  description:
    "Stop sending viewers to a static link tree. Build a page that captures emails, routes fans where you want, and shows you what's working.",
};

export default function Home() {
  return (
    // Wrapper enables scoped dark/glass theme via CSS var overrides in
    // globals.css (.contenomics-dark). Nothing here cascades outside.
    <main className="contenomics-dark relative min-h-screen overflow-hidden">
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
    <header className="glass-header sticky top-0 z-30">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4 sm:px-8">
        <Link
          href="/"
          className="text-base font-semibold tracking-tight text-[#E8EDF2]"
          style={{ letterSpacing: "-0.5px" }}
        >
          Contenomics
        </Link>
        <nav className="flex items-center gap-3">
          <Link
            href="/login"
            className="hidden text-sm text-[#9BA5B3] transition-colors hover:text-[#E8EDF2] sm:inline"
            style={{ letterSpacing: "-0.2px" }}
          >
            Sign in
          </Link>
          <Link
            href="/signup"
            className="accent-gradient inline-flex h-9 items-center rounded-[10px] px-4 text-sm font-medium"
            style={{ letterSpacing: "-0.2px" }}
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
    <section className="relative px-4 sm:px-8">
      {/* Decorative glows behind the hero. Absolute, non-interactive. */}
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
        style={{ top: "40%", right: "10%", width: "400px", height: "400px" }}
        aria-hidden
      />

      <div className="relative z-10 mx-auto max-w-4xl py-16 text-center sm:py-28">
        <span
          className="mb-6 inline-flex items-center rounded-full px-3 py-1 text-xs font-medium"
          style={{
            background: "rgba(16,185,129,0.1)",
            backdropFilter: "blur(10px)",
            WebkitBackdropFilter: "blur(10px)",
            border: "1px solid rgba(16,185,129,0.2)",
            color: "#10B981",
            letterSpacing: "-0.1px",
          }}
        >
          For YouTubers
        </span>
        <h1
          className="text-balance font-semibold text-[#E8EDF2]"
          style={{
            fontSize: "clamp(36px, 6vw, 52px)",
            lineHeight: 1.05,
            letterSpacing: "-2.5px",
          }}
        >
          Your link in bio, with a{" "}
          <span className="gradient-text">CRM</span> that pays you back.
        </h1>
        <p
          className="mx-auto mt-6 max-w-2xl text-balance text-base text-[#9BA5B3] sm:text-lg"
          style={{ letterSpacing: "-0.2px" }}
        >
          Stop pointing viewers at a static link tree. Build a page that
          captures emails, routes fans where you want them, and shows you
          what actually drives clicks.
        </p>
        <div className="mt-10 flex flex-wrap items-center justify-center gap-3">
          <Link
            href="/signup"
            className="accent-gradient inline-flex h-12 items-center rounded-[10px] px-6 text-sm font-medium"
            style={{ letterSpacing: "-0.2px" }}
          >
            Start free — no credit card
          </Link>
          <a
            href="#how-it-works"
            className="inline-flex h-12 items-center rounded-[10px] px-6 text-sm font-medium text-[#E8EDF2] transition-colors"
            style={{
              background: "rgba(255,255,255,0.05)",
              border: "1px solid rgba(255,255,255,0.1)",
              backdropFilter: "blur(10px)",
              WebkitBackdropFilter: "blur(10px)",
              letterSpacing: "-0.2px",
            }}
          >
            How it works
          </a>
        </div>
        <p className="mt-4 text-xs text-[#7D8A99]">
          Free during beta. No card required.
        </p>
      </div>
    </section>
  );
}

function SocialProof() {
  return (
    <section
      className="relative z-10 px-4 py-8 sm:px-8"
      style={{ borderTop: "1px solid rgba(255,255,255,0.08)", borderBottom: "1px solid rgba(255,255,255,0.08)" }}
    >
      <div className="mx-auto flex max-w-6xl flex-col items-center gap-3 text-center">
        <p className="text-xs font-medium uppercase tracking-widest text-[#7D8A99]">
          Built for the platforms YouTubers actually use
        </p>
        <div className="flex flex-wrap items-center justify-center gap-x-8 gap-y-2 text-sm text-[#9BA5B3]">
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
    <section className="relative z-10 px-4 py-20 sm:px-8 sm:py-28">
      <div className="mx-auto max-w-6xl">
        <div className="mx-auto max-w-2xl space-y-3 text-center">
          <h2
            className="text-3xl font-semibold text-[#E8EDF2] sm:text-4xl"
            style={{ letterSpacing: "-1.5px" }}
          >
            Everything you need to grow off-platform.
          </h2>
          <p className="text-base text-[#9BA5B3] sm:text-lg" style={{ letterSpacing: "-0.2px" }}>
            One link in your description, a real list of fans on the other end.
          </p>
        </div>
        <div className="mt-12 grid gap-5 sm:grid-cols-2 md:grid-cols-3">
          {items.map((it) => (
            <div
              key={it.title}
              className="glass-card rounded-2xl p-6"
            >
              <div className="text-2xl">{it.icon}</div>
              <h3 className="mt-3 text-base font-semibold text-[#E8EDF2]" style={{ letterSpacing: "-0.4px" }}>
                {it.title}
              </h3>
              <p className="mt-2 text-sm text-[#9BA5B3]">{it.body}</p>
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
      className="relative z-10 px-4 py-20 sm:px-8 sm:py-28"
      style={{
        borderTop: "1px solid rgba(255,255,255,0.08)",
        borderBottom: "1px solid rgba(255,255,255,0.08)",
        background: "rgba(15,20,25,0.4)",
      }}
    >
      <div className="mx-auto max-w-6xl">
        <div className="mx-auto max-w-2xl space-y-3 text-center">
          <h2 className="text-3xl font-semibold text-[#E8EDF2] sm:text-4xl" style={{ letterSpacing: "-1.5px" }}>
            Up in five minutes.
          </h2>
          <p className="text-base text-[#9BA5B3] sm:text-lg" style={{ letterSpacing: "-0.2px" }}>
            No funnel-builder courses. No setup wizards. Just three steps.
          </p>
        </div>
        <ol className="mt-12 grid gap-5 sm:grid-cols-3">
          {steps.map((s) => (
            <li key={s.n} className="glass-card rounded-2xl p-6">
              <div
                className="inline-flex size-8 items-center justify-center rounded-full text-xs font-semibold tabular-nums"
                style={{
                  background:
                    "linear-gradient(135deg, rgba(16,185,129,0.2) 0%, rgba(59,130,246,0.2) 100%)",
                  border: "1px solid rgba(16,185,129,0.3)",
                  color: "#10B981",
                }}
              >
                {s.n}
              </div>
              <h3 className="mt-3 text-base font-semibold text-[#E8EDF2]" style={{ letterSpacing: "-0.4px" }}>
                {s.title}
              </h3>
              <p className="mt-2 text-sm text-[#9BA5B3]">{s.body}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}

function Comparison() {
  const rows = [
    { label: "Link in bio", contenomics: true, others: true },
    { label: "Landing-page template (hero, features, pricing)", contenomics: true, others: false },
    { label: "Email capture into your own CRM", contenomics: true, others: "Locked behind upsells" },
    { label: "Per-block click tracking with UTM", contenomics: true, others: "Aggregate only" },
    { label: "Export your subscribers as CSV", contenomics: true, others: "Sometimes paid" },
    { label: "Multiple pages per profile", contenomics: true, others: false },
  ];
  return (
    <section className="relative z-10 px-4 py-20 sm:px-8 sm:py-28">
      <div className="mx-auto max-w-4xl">
        <div className="space-y-3 text-center">
          <h2 className="text-3xl font-semibold text-[#E8EDF2] sm:text-4xl" style={{ letterSpacing: "-1.5px" }}>
            Why not Linktree, Beacons, or Stan?
          </h2>
          <p className="text-base text-[#9BA5B3] sm:text-lg" style={{ letterSpacing: "-0.2px" }}>
            Those tools were built to keep you on their platform. Contenomics
            was built to grow your list off-platform.
          </p>
        </div>
        <div className="glass-card mt-12 overflow-hidden rounded-2xl">
          <table className="w-full text-sm">
            <thead style={{ background: "rgba(255,255,255,0.04)" }}>
              <tr>
                <th
                  className="px-4 py-3 text-left font-medium text-[#E8EDF2]"
                  style={{ letterSpacing: "-0.2px" }}
                >
                  Feature
                </th>
                <th
                  className="px-4 py-3 text-left font-medium text-[#10B981]"
                  style={{ letterSpacing: "-0.2px" }}
                >
                  Contenomics
                </th>
                <th
                  className="px-4 py-3 text-left font-medium text-[#9BA5B3]"
                  style={{ letterSpacing: "-0.2px" }}
                >
                  Most others
                </th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r, i) => (
                <tr
                  key={r.label}
                  style={{
                    borderTop:
                      i === 0 ? undefined : "1px solid rgba(255,255,255,0.05)",
                  }}
                >
                  <td className="px-4 py-3 text-[#E8EDF2]">{r.label}</td>
                  <td className="px-4 py-3">
                    {typeof r.contenomics === "boolean" ? (
                      r.contenomics ? (
                        <span className="text-[#10B981]" aria-label="Yes">
                          ✓
                        </span>
                      ) : (
                        <span className="text-[#7D8A99]" aria-label="No">
                          —
                        </span>
                      )
                    ) : (
                      <span className="text-[#E8EDF2]">{r.contenomics}</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-[#9BA5B3]">
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
    <section
      className="relative z-10 px-4 py-20 sm:px-8 sm:py-28"
      style={{
        borderTop: "1px solid rgba(255,255,255,0.08)",
        borderBottom: "1px solid rgba(255,255,255,0.08)",
        background: "rgba(15,20,25,0.4)",
      }}
    >
      <div className="mx-auto max-w-3xl">
        <div className="space-y-3 text-center">
          <h2 className="text-3xl font-semibold text-[#E8EDF2] sm:text-4xl" style={{ letterSpacing: "-1.5px" }}>
            Honest answers
          </h2>
        </div>
        <div className="glass-card mt-10 rounded-2xl">
          {items.map((it, i) => (
            <details
              key={it.q}
              className="group p-5"
              style={{
                borderTop:
                  i === 0 ? undefined : "1px solid rgba(255,255,255,0.05)",
              }}
            >
              <summary className="flex cursor-pointer items-center justify-between gap-4 text-sm font-medium text-[#E8EDF2] [&::-webkit-details-marker]:hidden">
                <span>{it.q}</span>
                <span
                  className="text-[#9BA5B3] transition-transform group-open:rotate-45"
                  aria-hidden
                >
                  +
                </span>
              </summary>
              <p className="mt-3 text-sm text-[#9BA5B3]">{it.a}</p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}

function FinalCta() {
  return (
    <section className="relative z-10 px-4 py-20 sm:px-8 sm:py-28">
      <div className="pro-card mx-auto max-w-5xl px-6 py-14 text-center sm:px-12 sm:py-20">
        <h2
          className="relative z-10 text-3xl font-semibold text-white sm:text-4xl"
          style={{ letterSpacing: "-1.5px" }}
        >
          Stop renting your audience.
        </h2>
        <p
          className="relative z-10 mx-auto mt-4 max-w-xl text-base text-white/85 sm:text-lg"
          style={{ letterSpacing: "-0.2px" }}
        >
          Build your link in bio, capture emails, and own your list. Free
          during beta.
        </p>
        <div className="relative z-10 mt-8">
          <Link
            href="/signup"
            className="inline-flex h-12 items-center rounded-[10px] bg-white px-6 text-sm font-medium text-[#0D9488] transition-opacity hover:opacity-90"
            style={{
              letterSpacing: "-0.2px",
              boxShadow: "0 4px 16px rgba(0,0,0,0.1)",
            }}
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
    <footer
      className="relative z-10 px-4 py-10 sm:px-8"
      style={{
        background: "rgba(15,20,25,0.6)",
        backdropFilter: "blur(20px)",
        WebkitBackdropFilter: "blur(20px)",
        borderTop: "1px solid rgba(255,255,255,0.08)",
      }}
    >
      <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-3 text-xs text-[#7D8A99] sm:flex-row">
        <p>© {new Date().getFullYear()} Contenomics</p>
        <div className="flex items-center gap-4">
          <Link href="/login" className="transition-colors hover:text-[#E8EDF2]">
            Sign in
          </Link>
          <Link href="/signup" className="transition-colors hover:text-[#E8EDF2]">
            Sign up
          </Link>
        </div>
      </div>
    </footer>
  );
}
