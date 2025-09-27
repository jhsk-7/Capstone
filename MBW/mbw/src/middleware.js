import { NextResponse } from "next/server";

export function middleware(request) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get("token")?.value || "";

  // public pages anyone can visit
  const PUBLIC_PATHS = new Set(["/login", "/signup"]);
  const isPublic = PUBLIC_PATHS.has(pathname);

  // any route that should require login
  const PROTECTED_PREFIXES = ["/myBikes", "/addBike", "/appointment"];
  const needsAuth = PROTECTED_PREFIXES.some((p) =>
    pathname === p || pathname.startsWith(`${p}/`)
  );

  // already logged in -> block login/signup
  if (isPublic && token) {
    return NextResponse.redirect(new URL("/profile", request.url));
  }

  // not logged in -> block protected areas
  if (needsAuth && !token) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  // otherwise allow
  return NextResponse.next();
}

export const config = {
  // Run middleware on all routes you want to guard (supports globs)
  matcher: [
    "/profile",
    "/profile/:path*",   // nested routes
    "/bikes/:path*",
    "/myBikes",
    "/appointment/:path*",
    "/login",
    "/signup",
    "/addBike"
  ],
};