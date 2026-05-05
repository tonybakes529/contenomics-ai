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
import { signUp } from "./actions";

export const metadata = {
  title: "Create your account — Contenomics",
};

type SearchParams = { error?: string; message?: string };

export default function SignupPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const error = searchParams.error;
  const message = searchParams.message;

  return (
    <main className="flex min-h-screen items-center justify-center px-4 py-12">
      <Card className="w-full max-w-sm">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl">Create your account</CardTitle>
          <CardDescription>
            Start capturing fans from your YouTube description.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {message ? (
            <div
              className="bg-muted mb-4 rounded-md p-3 text-sm"
              role="status"
              aria-live="polite"
            >
              {message}
            </div>
          ) : null}
          <form action={signUp} className="space-y-4">
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
                autoComplete="new-password"
                required
                minLength={6}
              />
              <p className="text-muted-foreground text-xs">At least 6 characters.</p>
            </div>
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
              Sign up
            </Button>
            <p className="text-muted-foreground text-center text-sm">
              Already have an account?{" "}
              <Link href="/login" className="text-foreground underline">
                Sign in
              </Link>
            </p>
          </form>
        </CardContent>
      </Card>
    </main>
  );
}
