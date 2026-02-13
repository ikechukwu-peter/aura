import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { decrypt } from "@/lib/auth";

const publicRoutes = ["/", "/login", "/register", "/events"];
const authRoutes = ["/login", "/register"];

export async function middleware(req: NextRequest) {
  const path = req.nextUrl.pathname;
  const isPublicRoute = publicRoutes.some(route => path === route || path.startsWith("/events/"));
  const isAuthRoute = authRoutes.includes(path);
  const isAdminRoute = path.startsWith("/admin");
  const isOrganizerRoute = path.startsWith("/organizer");

  const cookie = req.cookies.get(process.env.SESSION_COOKIE_NAME || "auth_session")?.value;
  const session = cookie ? await decrypt(cookie) : null;

  // 1. Redirect to login if not authenticated and trying to access protected route
  if (!isPublicRoute && !isAuthRoute && !session) {
    return NextResponse.redirect(new URL("/login", req.nextUrl));
  }

  // 2. Redirect to dashboard if authenticated and trying to access auth routes
  if (isAuthRoute && session) {
    return NextResponse.redirect(new URL("/dashboard", req.nextUrl));
  }

  // 3. Admin protection
  if (isAdminRoute && (session?.role as string) !== "ADMIN" && (session?.role as string) !== "SUPER_ADMIN") {
    return NextResponse.redirect(new URL("/", req.nextUrl));
  }

  // 4. Organizer protection
  if (isOrganizerRoute && 
      (session?.role as string) !== "ORGANIZER" && 
      (session?.role as string) !== "ADMIN" && 
      (session?.role as string) !== "SUPER_ADMIN") {
    return NextResponse.redirect(new URL("/", req.nextUrl));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
