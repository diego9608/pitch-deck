import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

export const config = { matcher: ["/deck/:path*","/summary","/hub"] };

export function middleware(req: NextRequest) {
  const ok = req.cookies.get("deck_session");
  if (!ok) return NextResponse.redirect(new URL("/invite/demo", req.url));
  return NextResponse.next();
}
