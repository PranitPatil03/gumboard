import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const token = searchParams.get("token");
  const redirectTo = searchParams.get("redirectTo") || "/dashboard";

  if (!token) {
    return NextResponse.redirect(new URL("/auth/signin", request.url));
  }

  try {
    // Find the session in the database
    const session = await db.session.findUnique({
      where: { token },
      include: { user: true },
    });

    if (!session || session.expiresAt < new Date()) {
      return NextResponse.redirect(new URL("/auth/signin", request.url));
    }

    // Create a response that sets the session cookie
    const response = NextResponse.redirect(new URL(redirectTo, request.url));
    
    // Set the Better Auth session cookie
    response.cookies.set("better-auth.session-token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 30 * 24 * 60 * 60, // 30 days
    });

    return response;
  } catch (error) {
    console.error("Error setting session:", error);
    return NextResponse.redirect(new URL("/auth/signin", request.url));
  }
} 