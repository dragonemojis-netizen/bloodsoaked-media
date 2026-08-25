import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { isArchivesLocal, isArchivesPath } from "@/lib/archives-gate";
import { isCuratorMode, isWorkbenchPath } from "@/lib/curator-gate";

/**
 * Workbench and Archives gating only. Public HTML routes must not pay Middleware Active CPU.
 * Chrome is chosen by App Router layouts — not request headers.
 */
export function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  if (isWorkbenchPath(pathname)) {
    if (isCuratorMode()) return NextResponse.next();
    const rewriteUrl = request.nextUrl.clone();
    rewriteUrl.pathname = "/__not-found";
    return NextResponse.rewrite(rewriteUrl);
  }

  if (isArchivesPath(pathname)) {
    if (isArchivesLocal()) return NextResponse.next();
    const rewriteUrl = request.nextUrl.clone();
    rewriteUrl.pathname = "/__not-found";
    return NextResponse.rewrite(rewriteUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/workbench",
    "/workbench/:path*",
    "/the-archives",
    "/the-archives/:path*",
  ],
};
