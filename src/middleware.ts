import { auth } from "~/server/auth";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export async function middleware(request: NextRequest) {
  const session = await auth();

  // Public routes that don't require authentication
  const publicRoutes = ["/", "/api/auth", "/invitations"];
  const isPublicRoute = publicRoutes.some((route) =>
    request.nextUrl.pathname.startsWith(route)
  );

  if (isPublicRoute) {
    return NextResponse.next();
  }

  // Protect all other routes
  if (!session?.user) {
    const signInUrl = new URL("/api/auth/signin", request.url);
    signInUrl.searchParams.set("callbackUrl", request.nextUrl.pathname);
    return NextResponse.redirect(signInUrl);
  }

  // Check if user has a workspace (for app routes)
  // Exclude workspace creation page from this check
  const isWorkspaceCreationPage = request.nextUrl.pathname === "/workspaces/new";
  const appRoutes = ["/dashboard", "/workspaces", "/meetings", "/upload", "/settings"];
  const isAppRoute = appRoutes.some((route) =>
    request.nextUrl.pathname.startsWith(route)
  );

  if (isAppRoute && !isWorkspaceCreationPage && (!session.user.workspaceId || session.user.workspaceId === "")) {
    // User is authenticated but has no workspace - redirect to workspace creation
    return NextResponse.redirect(new URL("/workspaces/new", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};

