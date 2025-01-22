import { NextResponse } from "next/server";
import { NextRequest } from "next/server";
import { jwtDecode } from "jwt-decode";

// This function can be marked `async` if using `await` inside
export function middleware(request: NextRequest) {
  const legalRoute =
    request.nextUrl.pathname.startsWith("/cgu") ||
    request.nextUrl.pathname.startsWith("/politique-de-confidentialite") ||
    request.nextUrl.pathname.startsWith("/mentions-legales");

  if (request.nextUrl.pathname !== "/maintenance" && !legalRoute) {
    return NextResponse.redirect(new URL("/maintenance", request.url));
  }

  // const jwtCookie = request.cookies.get(
  //   process.env.NEXT_PUBLIC_JWT_NAME ?? "cje-jwt"
  // );
  // let jwtRole: null | "user" | "supervisor" = null;
  // let isUserComplete = false;

  // if (jwtCookie?.value) {
  //   const decoded = jwtDecode(jwtCookie.value) as { [key: string]: any };
  //   const collection = (decoded as any)["collection"] as string;
  //   switch (collection) {
  //     case "users":
  //       jwtRole = "user";
  //       isUserComplete =
  //         decoded.firstName !== null &&
  //         decoded.firstName !== "" &&
  //         decoded.lastName !== null &&
  //         decoded.lastName !== "" &&
  //         decoded.userEmail !== null &&
  //         decoded.userEmail !== "";
  //       if (
  //         (decoded.firstName === null || decoded.firstName === "") &&
  //         !request.nextUrl.pathname.startsWith("/signup")
  //       ) {
  //         return NextResponse.redirect(new URL("/signup", request.url));
  //       }
  //       break;
  //     case "supervisors":
  //       jwtRole = "supervisor";
  //       break;
  //   }
  // }

  // if (
  //   !jwtCookie &&
  //   (request.nextUrl.pathname.startsWith("/dashboard") ||
  //     request.nextUrl.pathname.startsWith("/signup"))
  // ) {
  //   return NextResponse.redirect(new URL("/", request.url));
  // }

  // if (!jwtCookie && request.nextUrl.pathname.startsWith("/supervisor/form")) {
  //   return NextResponse.redirect(new URL("/supervisor", request.url));
  // }

  // if (
  //   !!jwtCookie &&
  //   jwtRole === "user" &&
  //   !(request.nextUrl.pathname.startsWith("/dashboard") || legalRoute) &&
  //   isUserComplete
  // ) {
  //   return NextResponse.redirect(new URL("/dashboard", request.url));
  // }

  // if (
  //   !!jwtCookie &&
  //   jwtRole === "supervisor" &&
  //   !request.nextUrl.pathname.startsWith("/supervisor/form")
  // ) {
  //   return NextResponse.redirect(new URL("/supervisor/form", request.url));
  // }

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
    "/((?!api|_next/static|_next/image|favicon.ico|images|static|pwa|admin|sw|workbox|worker).*)",
  ],
};
