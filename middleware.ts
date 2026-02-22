import { NextResponse, type NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";

type CookieToSet = {
  name: string;
  value: string;
  options?: Parameters<NextResponse["cookies"]["set"]>[2];
};

export async function middleware(req: NextRequest) {
  const res = NextResponse.next();

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () => req.cookies.getAll(),
        setAll: (cookies: CookieToSet[]) => {
          cookies.forEach(({ name, value, options }) => {
            res.cookies.set(name, value, options);
          });
        }
      }
    }
  );

  // Touch the session so cookies refresh if needed
  await supabase.auth.getSession();

  // If you're gating routes, keep your existing logic below.
  // (No changes needed for typing.)
  return res;
}

/**
 * Adjust matchers to what you want protected.
 * If you already have a matcher block, keep yours.
 */
export const config = {
  matcher: ["/admin/:path*", "/events/:path*"]
};