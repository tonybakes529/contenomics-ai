import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { DashboardSidebar } from "@/components/dashboard/sidebar";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login?next=/dashboard");

  const { data: profile } = await supabase
    .from("profiles")
    .select("username")
    .eq("id", user.id)
    .maybeSingle();

  return (
    <div className="bg-muted/30 flex min-h-screen">
      <DashboardSidebar
        username={profile?.username ?? null}
        email={user.email ?? ""}
      />
      <div className="flex flex-1 flex-col">
        <header className="border-border bg-background flex h-14 items-center justify-between border-b px-4 md:hidden">
          <span className="text-base font-semibold tracking-tight">
            Contenomics
          </span>
          <form action="/logout" method="get">
            <button
              type="submit"
              className="text-muted-foreground text-xs underline"
            >
              Sign out
            </button>
          </form>
        </header>
        <main className="flex-1">{children}</main>
      </div>
    </div>
  );
}
