import { type NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";

export async function middleware(request: NextRequest) {
  return await updateSession(request);
}

export const config = {
  matcher: [
    /*
     * Run on every request except:
     *  - _next/static, _next/image, favicon.ico
     *  - common image/file extensions
     *
     * Public bio routes (/[username]) DO go through middleware because we still
     * want session cookies refreshed when a logged-in creator views their own page.
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|woff|woff2|ttf)$).*)",
  ],
};
