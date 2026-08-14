import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

function isCuratorMode(): boolean {
  if (process.env.NEXT_PUBLIC_CURATOR_MODE === "true") return true;
  if (process.env.NODE_ENV === "development") return true;
  return false;
}

/**
 * Workbench gating only. Public HTML routes must not pay Middleware Active CPU.
 * Chrome is chosen by App Router layouts — not request headers.
 */
export function middleware(request: NextRequest) {
  if (isCuratorMode()) {
    return NextResponse.next();
  }

  const rewriteUrl = request.nextUrl.clone();
  // Non-disclosing 404 — same surface as any missing public route.
  rewriteUrl.pathname = "/__not-found";
  return NextResponse.rewrite(rewriteUrl);
}

export const config = {
  matcher: ["/workbench", "/workbench/:path*"],
};
