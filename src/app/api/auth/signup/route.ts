import { NextResponse } from "next/server";
import crypto from 'crypto';
import { hashPassword, createSession, findUserByEmail, findUserByUsername, createUser } from "@/lib/db";

export async function POST(request: Request) {
  try {
    const { username, email, password, initialWealth, preferredMarkets } = await request.json();

    if (!username || !email || !password) {
      return NextResponse.json({ error: "Username, email, and password are required." }, { status: 400 });
    }
    if (password.length < 6) {
      return NextResponse.json({ error: "Password must be at least 6 characters." }, { status: 400 });
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json({ error: "Invalid email format." }, { status: 400 });
    }
    if (username.length < 2 || username.length > 30) {
      return NextResponse.json({ error: "Username must be 2-30 characters." }, { status: 400 });
    }

    const existingEmail = await findUserByEmail(email);
    if (existingEmail) return NextResponse.json({ error: "A user with this email already exists." }, { status: 409 });

    const existingUser = await findUserByUsername(username);
    if (existingUser) return NextResponse.json({ error: "A user with this username already exists." }, { status: 409 });

    const { hash, salt } = hashPassword(password);
    const userId = crypto.randomUUID();

    await createUser({
      id: userId,
      username,
      email,
      password_hash: hash,
      salt,
      initial_wealth: initialWealth ? Number(initialWealth) : 0,
      preferred_markets: preferredMarkets ? JSON.stringify(preferredMarkets) : "[]"
    });

    const token = await createSession(userId);

    const response = NextResponse.json({
      message: "Account created successfully.",
      user: { id: userId, username, email: email.toLowerCase() },
    }, { status: 201 });

    response.cookies.set("avkast_session", token, {
      httpOnly: true,
      sameSite: "lax",
      path: "/",
      maxAge: 30 * 24 * 60 * 60,
    });

    return response;
  } catch (error: any) {
    console.error("[Auth Signup]", error);
    return NextResponse.json({ error: "Internal server error." }, { status: 500 });
  }
}
