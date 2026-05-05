import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-8 px-6 text-center">
      <div className="space-y-4">
        <h1 className="text-4xl font-semibold tracking-tight sm:text-5xl">
          Contenomics
        </h1>
        <p className="text-muted-foreground max-w-md text-balance text-base sm:text-lg">
          Link in bio + email CRM for YouTubers. Capture fans from your
          description, route them where you want, build your list.
        </p>
      </div>
      <div className="flex gap-3">
        <Link href="/signup" className={cn(buttonVariants({ size: "lg" }))}>
          Get started
        </Link>
        <Link
          href="/login"
          className={cn(buttonVariants({ variant: "outline", size: "lg" }))}
        >
          Sign in
        </Link>
      </div>
    </main>
  );
}
