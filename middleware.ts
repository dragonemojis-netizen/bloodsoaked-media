import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { isCuratorMode, isWorkbenchPath } from "@/lib/curator-gate";

/**
 * Workbench gating only. Archives are omitted from the production build and
 * already 404 as missing routes — do not pay Middleware Active CPU for the
 * leftover crawl of /the-archives/*.
 */
export function middleware(request: NextRequest) {
  if (!isWorkbenchPath(request.nextUrl.pathname)) {
    return NextResponse.next();
  }

  if (isCuratorMode()) {
    return NextResponse.next();
  }

  const rewriteUrl = request.nextUrl.clone();
  rewriteUrl.pathname = "/__not-found";
  return NextResponse.rewrite(rewriteUrl);
}

export const config = {
  matcher: ["/workbench", "/workbench/:path*"],
};
