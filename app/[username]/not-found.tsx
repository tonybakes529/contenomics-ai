import Link from "next/link";

export default function NotFound() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-4 bg-white px-6 text-center text-black">
      <h1 className="text-3xl font-semibold tracking-tight">Page not found</h1>
      <p className="text-muted-foreground max-w-sm text-sm">
        That username doesn&apos;t have a public Contenomics page yet, or its
        page isn&apos;t published.
      </p>
      <Link href="/" className="text-sm underline">
        Go home
      </Link>
    </main>
  );
}
