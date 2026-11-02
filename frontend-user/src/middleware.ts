import { NextResponse, type NextRequest } from "next/server";

/**
 * Middleware to enforce role-based access control
 * Only users with role KONSUMEN can access this frontend
 */
export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Public routes that don't require authentication
  const publicRoutes = [
    "/",
    "/login",
    "/register",
    "/forgot-password",
    "/katalog",
    "/produk",
    "/toko",
    "/auth",
    "/chat/guest",
    "/api",
    "/_next",
    "/favicon.ico",
  ];

  const isPublicRoute = publicRoutes.some(
    (route) => pathname === route || pathname.startsWith(route),
  );

  // Allow public routes
  if (isPublicRoute) {
    return NextResponse.next();
  }

  // Check for JWT token in cookies
  const token = request.cookies.get("accessToken")?.value;

  if (!token) {
    // No token, redirect to login
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    url.searchParams.set("redirect", pathname);
    return NextResponse.redirect(url);
  }

  // Decode JWT to check role (basic check, not cryptographically verified)
  try {
    const payload = JSON.parse(
      Buffer.from(token.split(".")[1], "base64").toString(),
    );

    const ALLOWED_ROLE = "KONSUMEN";

    // STRICT: Only KONSUMEN role allowed
    if (payload.peran !== ALLOWED_ROLE) {
      console.warn(
        `🚫 Middleware blocked access: Role ${payload.peran} attempted to access ${pathname}`,
      );

      // Clear the token and redirect to login with error
      const response = NextResponse.redirect(
        new URL("/login?error=unauthorized_role", request.url),
      );
      response.cookies.delete("accessToken");
      return response;
    }
  } catch (error) {
    console.error("Failed to decode JWT token:", error);
    // Invalid token, redirect to login
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
