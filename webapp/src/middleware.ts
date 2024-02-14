import { NextResponse } from "next/server";
import { NextRequest } from "next/server";
import { jwtDecode } from "jwt-decode";

// This function can be marked `async` if using `await` inside
export function middleware(request: NextRequest) {
  const jwtCookie = request.cookies.get(
    process.env.NEXT_PUBLIC_JWT_NAME ?? "cje-jwt"
  );
  let jwtRole: null | "user" | "supervisor" = null;

  if (jwtCookie?.value) {
    const decoded = jwtDecode(jwtCookie.value);
    const collection = (decoded as any)["collection"] as string;
    switch (collection) {
      case "users":
        jwtRole = "user";
        break;
      case "supervisors":
        jwtRole = "supervisor";
        break;
    }
  }

  if (!jwtCookie && request.nextUrl.pathname.startsWith("/dashboard")) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  if (!jwtCookie && request.nextUrl.pathname.startsWith("/supervisor/form")) {
    return NextResponse.redirect(new URL("/supervisor", request.url));
  }

  if (
    !!jwtCookie &&
    jwtRole === "user" &&
    !request.nextUrl.pathname.startsWith("/dashboard")
  ) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  if (
    !!jwtCookie &&
    jwtRole === "supervisor" &&
    !request.nextUrl.pathname.startsWith("/supervisor/form")
  ) {
    return NextResponse.redirect(new URL("/supervisor/form", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    "/((?!api|_next/static|_next/image|favicon.ico|images|pwa|admin|sw|workbox).*)",
  ],
};
