import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

function isCuratorMode(): boolean {
  if (process.env.NEXT_PUBLIC_CURATOR_MODE === "true") return true;
  if (process.env.NODE_ENV === "development") return true;
  return false;
}

function isWorkbenchPath(pathname: string): boolean {
  return pathname === "/workbench" || pathname.startsWith("/workbench/");
}

export function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;
  const requestHeaders = new Headers(request.headers);

  // Public deployments: Workbench does not exist.
  if (isWorkbenchPath(pathname) && !isCuratorMode()) {
    const rewriteUrl = request.nextUrl.clone();
    // Non-disclosing 404 — same surface as any missing public route.
    rewriteUrl.pathname = "/__not-found";
    requestHeaders.set("x-pathname", rewriteUrl.pathname);
    return NextResponse.rewrite(rewriteUrl, {
      request: { headers: requestHeaders },
    });
  }

  requestHeaders.set("x-pathname", pathname);
  return NextResponse.next({
    request: { headers: requestHeaders },
  });
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\..*).*)"],
};
