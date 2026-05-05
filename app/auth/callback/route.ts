import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const tokenHash = searchParams.get("token_hash");
  const type = searchParams.get("type");
  const next = searchParams.get("next") ?? "/dashboard";
  const errParam =
    searchParams.get("error_description") ??
    searchParams.get("error") ??
    null;

  // Supabase sometimes redirects here with an error (expired link, etc.)
  // Surface that to the login page rather than swallowing it.
  if (errParam && !code && !tokenHash) {
    return NextResponse.redirect(
      `${origin}/login?error=${encodeURIComponent(errParam)}`,
    );
  }

  const supabase = createClient();

  // PKCE flow — used by signInWithOAuth and SSR signUp
  if (code) {
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      return NextResponse.redirect(`${origin}${next}`);
    }
    return NextResponse.redirect(
      `${origin}/login?error=${encodeURIComponent(error.message)}`,
    );
  }

  // OTP flow — used by some email templates with {{ .TokenHash }}
  if (tokenHash && type) {
    // Cast: type ranges over "signup" | "magiclink" | "recovery" | "invite" | "email"
    const { error } = await supabase.auth.verifyOtp({
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      type: type as any,
      token_hash: tokenHash,
    });
    if (!error) {
      return NextResponse.redirect(`${origin}${next}`);
    }
    return NextResponse.redirect(
      `${origin}/login?error=${encodeURIComponent(error.message)}`,
    );
  }

  return NextResponse.redirect(
    `${origin}/login?error=${encodeURIComponent(
      "Missing confirmation code or token",
    )}`,
  );
}
