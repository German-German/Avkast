import { NextResponse } from "next/server";
import { createSession } from "@/lib/db";

export async function POST() {
  try {
    const token = await createSession(null, true);

    const response = NextResponse.json({
      success: true,
      message: "Guest session started successfully.",
      user: { id: "guest", username: "Guest", email: "", isGuest: true },
    });

    response.cookies.set("avkast_session", token, {
      httpOnly: true,
      sameSite: "lax",
      path: "/",
      maxAge: 4 * 60 * 60, // 4 hours
    });

    return response;
  } catch (error: any) {
    console.error("[Auth Guest]", error);
    return NextResponse.json({ error: "Internal server error." }, { status: 500 });
  }
}
