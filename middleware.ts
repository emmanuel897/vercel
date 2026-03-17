import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Routes protégées (amis connectés requis)
const FRIEND_ROUTES = ["/profil"];
// Routes admin uniquement
const ADMIN_ROUTES = ["/admin"];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Anti-scraping headers sur toutes les pages
  const response = NextResponse.next();
  response.headers.set("X-Robots-Tag", "noindex, nofollow, noarchive, nosnippet");
  response.headers.set("X-Content-Type-Options", "nosniff");
  response.headers.set("X-Frame-Options", "DENY");
  response.headers.set("Referrer-Policy", "no-referrer");

  // Redirection login si accès à des routes protégées sans cookie de session
  const sessionCookie =
    request.cookies.get("sb-access-token") ??
    request.cookies.get("supabase-auth-token");

  const isProtectedFriend = FRIEND_ROUTES.some((r) => pathname.startsWith(r));
  const isProtectedAdmin = ADMIN_ROUTES.some((r) => pathname.startsWith(r));

  if ((isProtectedFriend || isProtectedAdmin) && !sessionCookie) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("redirect", pathname);
    return NextResponse.redirect(loginUrl);
  }

  return response;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml).*)",
  ],
};
