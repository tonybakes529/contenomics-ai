import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { BarChart3 } from "lucide-react";

export const metadata = { title: "Viewtrack — Contenomics" };
export const dynamic = "force-dynamic";

export default async function ViewtrackPage() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login?next=/dashboard/viewtrack");

  return (
    <div className="mx-auto w-full max-w-5xl space-y-6 p-6">
      <header className="space-y-1">
        <h1 className="text-2xl font-semibold tracking-tight">Viewtrack</h1>
        <p className="text-muted-foreground text-sm">
          Video analytics and actionable insights for your content.
        </p>
      </header>

      <div className="border-border bg-muted/30 flex flex-col items-center justify-center gap-3 rounded-lg border border-dashed p-16 text-center">
        <div className="bg-background flex size-12 items-center justify-center rounded-full border">
          <BarChart3 className="text-muted-foreground size-5" />
        </div>
        <div className="space-y-1">
          <p className="text-sm font-medium">Viewtrack is coming together</p>
          <p className="text-muted-foreground max-w-md text-xs">
            This is where you&apos;ll connect videos, pull analytics, and surface
            insights to understand what&apos;s working. We&apos;ll start building
            it out next.
          </p>
        </div>
      </div>
    </div>
  );
}
