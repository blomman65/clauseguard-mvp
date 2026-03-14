import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  return new NextResponse("Site temporarily unavailable", { status: 503 });
}

export const config = {
  matcher: "/:path*",
};
