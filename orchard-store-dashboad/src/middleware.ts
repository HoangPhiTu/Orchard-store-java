import { NextResponse, type NextRequest } from "next/server";
import { env } from "@/config/env";

const TOKEN_KEY = env.accessTokenKey;
const PROTECTED_PREFIX = "/admin";
const AUTH_ROUTES = [
  "/login",
  "/register",
  "/forgot-password",
  "/reset-password",
  "/verify-otp",
];

export function middleware(request: NextRequest) {
  const token = request.cookies.get(TOKEN_KEY)?.value;
  const { pathname } = request.nextUrl;

  const isProtected = pathname.startsWith(PROTECTED_PREFIX);
  const isAuthRoute = AUTH_ROUTES.some((route) => pathname.startsWith(route));

  // Redirect to login if accessing protected route without token
  if (!token && isProtected) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("next", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Redirect to dashboard if accessing auth routes with valid token
  // (except reset-password and verify-otp which might need query params)
  if (token && isAuthRoute) {
    // Allow reset-password and verify-otp only if they have required query params
    // Otherwise redirect to dashboard
    if (
      pathname.startsWith("/reset-password") ||
      pathname.startsWith("/verify-otp")
    ) {
      // These pages will handle client-side redirect if user is already authenticated
      return NextResponse.next();
    }
    const nextUrl = request.nextUrl.searchParams.get("next");
    const redirectUrl = nextUrl || "/admin/dashboard";
    return NextResponse.redirect(new URL(redirectUrl, request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/admin/:path*",
    "/login",
    "/register",
    "/forgot-password",
    "/reset-password",
    "/verify-otp",
  ],
};
