import { NextResponse } from "next/server";
import { verifyPassword, createSession, findUserByEmail } from "@/lib/db";

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json({ error: "Email and password are required." }, { status: 400 });
    }

    const user = await findUserByEmail(email);
    if (!user || !verifyPassword(password, user.password_hash, user.salt)) {
      return NextResponse.json({ error: "Invalid email or password." }, { status: 401 });
    }

    const token = await createSession(user.id);

    const response = NextResponse.json({
      success: true,
      message: "Signed in successfully.",
      user: { id: user.id, username: user.username, email: user.email },
    });

    response.cookies.set("avkast_session", token, {
      httpOnly: true,
      sameSite: "lax",
      path: "/",
      maxAge: 30 * 24 * 60 * 60,
    });

    return response;
  } catch (error: any) {
    console.error("[Auth Signin]", error);
    return NextResponse.json({ error: "Internal server error." }, { status: 500 });
  }
}
