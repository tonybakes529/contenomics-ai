import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { signIn } from "./actions";

export const metadata = {
  title: "Sign in — Contenomics",
};

type SearchParams = { error?: string; next?: string; message?: string };

export default function LoginPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const error = searchParams.error;
  const message = searchParams.message;
  const next = searchParams.next ?? "/dashboard";

  return (
    <main className="flex min-h-screen items-center justify-center px-4 py-12">
      <Card className="w-full max-w-sm">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl">Welcome back</CardTitle>
          <CardDescription>
            Sign in to your Contenomics account.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form action={signIn} className="space-y-4">
            <input type="hidden" name="next" value={next} />
            <div className="space-y-1.5">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                placeholder="you@example.com"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
              />
            </div>
            {message ? (
              <p className="text-muted-foreground text-sm">{message}</p>
            ) : null}
            {error ? (
              <p
                className="text-destructive text-sm"
                role="alert"
                aria-live="polite"
              >
                {error}
              </p>
            ) : null}
            <Button type="submit" className="w-full">
              Sign in
            </Button>
            <p className="text-muted-foreground text-center text-sm">
              No account?{" "}
              <Link href="/signup" className="text-foreground underline">
                Sign up
              </Link>
            </p>
          </form>
        </CardContent>
      </Card>
    </main>
  );
}
