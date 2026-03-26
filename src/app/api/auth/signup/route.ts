import { NextResponse } from "next/server";
import crypto from 'crypto';
import { getDb, hashPassword, createSession } from "@/lib/db";

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

    const db = getDb();

    const existing = db.prepare("SELECT id FROM users WHERE email = ? OR username = ?").get(email.toLowerCase(), username);
    if (existing) {
      return NextResponse.json({ error: "A user with this email or username already exists." }, { status: 409 });
    }

    const { hash, salt } = hashPassword(password);
    const userId = crypto.randomUUID();

    db.prepare(
      "INSERT INTO users (id, username, email, password_hash, salt, initial_wealth, preferred_markets) VALUES (?, ?, ?, ?, ?, ?, ?)"
    ).run(userId, username, email.toLowerCase(), hash, salt, initialWealth ? Number(initialWealth) : 0, preferredMarkets ? JSON.stringify(preferredMarkets) : "[]");

    const token = createSession(userId);

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
