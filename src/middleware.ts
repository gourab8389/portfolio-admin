import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  // FIXED: Use the correct cookie name
  const token = request.cookies.get("portfolio-admin-token")?.value;
  const pathname = request.nextUrl.pathname;

  const publicRoutes = ["/", "/auth/login", "/auth/signup"];
  const isPublicRoute = publicRoutes.some((route) => pathname === route);

  if (!token && !isPublicRoute) {
    return NextResponse.redirect(new URL("/auth/login", request.url));
  }

  if (token && pathname === "/auth/login") {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  if (pathname === "/" && token) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    "/(api|trpc)(.*)",
  ],
};