import { NextResponse, type NextRequest } from "next/server";
import { env } from "@/config/env";
import {
  decodeTokenUnsafe,
  verifyToken,
  extractRoles,
  hasAdminOrStaffRole,
  isCustomerOnly,
} from "@/lib/jwt";

const TOKEN_KEY = env.accessTokenKey;
const PROTECTED_PREFIX = "/admin";
const AUTH_ROUTES = [
  "/login",
  "/register",
  "/forgot-password",
  "/reset-password",
  "/verify-otp",
];

/**
 * Get JWT payload from token
 * Uses verification if JWT_SECRET is available, otherwise decodes without verification
 */
async function getTokenPayload(token: string) {
  if (env.jwtSecret) {
    // Verify token with secret (more secure)
    return await verifyToken(token, env.jwtSecret);
  } else {
    // Decode without verification (faster, less secure)
    // Note: In production, you should always provide JWT_SECRET
    return decodeTokenUnsafe(token);
  }
}

export async function middleware(request: NextRequest) {
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

  // If token exists, check role for RBAC
  if (token && isProtected) {
    try {
      const payload = await getTokenPayload(token);

      if (!payload) {
        // Invalid token, redirect to login
        const loginUrl = new URL("/login", request.url);
        loginUrl.searchParams.set("error", "invalid_token");
        return NextResponse.redirect(loginUrl);
      }

      const roles = extractRoles(payload);

      // Block CUSTOMER from accessing admin routes
      if (isCustomerOnly(roles)) {
        // Redirect customer to home page or show 403
        const forbiddenUrl = new URL("/", request.url);
        forbiddenUrl.searchParams.set("error", "forbidden");
        return NextResponse.redirect(forbiddenUrl);
      }

      // Only allow ADMIN and STAFF to access admin routes
      if (!hasAdminOrStaffRole(roles)) {
        // User has no admin/staff role, redirect to home
        const forbiddenUrl = new URL("/", request.url);
        forbiddenUrl.searchParams.set("error", "unauthorized");
        return NextResponse.redirect(forbiddenUrl);
      }

      // User has admin/staff role, allow access
    } catch (error) {
      console.error("Error checking token in middleware:", error);
      // On error, redirect to login for safety
      const loginUrl = new URL("/login", request.url);
      loginUrl.searchParams.set("error", "token_error");
      return NextResponse.redirect(loginUrl);
    }
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

    // Check role before redirecting to dashboard
    try {
      const payload = await getTokenPayload(token);
      if (payload) {
        const roles = extractRoles(payload);
        // Only redirect to dashboard if user has admin/staff role
        if (hasAdminOrStaffRole(roles)) {
          const nextUrl = request.nextUrl.searchParams.get("next");
          const redirectUrl = nextUrl || "/admin/dashboard";
          return NextResponse.redirect(new URL(redirectUrl, request.url));
        }
      }
    } catch (error) {
      // If token check fails, allow auth route to proceed
      console.error("Error checking token in auth route:", error);
    }
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
