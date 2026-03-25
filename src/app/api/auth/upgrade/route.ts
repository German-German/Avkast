import { NextResponse } from "next/server";
import { getDb, hashPassword } from "@/lib/db";
import { cookies } from "next/headers";
import crypto from "crypto";

export async function POST(request: Request) {
  try {
    const { username, email, password } = await request.json();

    if (!username || !email || !password) {
      return NextResponse.json({ error: "All fields are required." }, { status: 400 });
    }

    const cookieStore = await cookies();
    const token = cookieStore.get("avkast_session")?.value;

    if (!token) {
      return NextResponse.json({ error: "Session expired or invalid." }, { status: 401 });
    }

    const db = getDb();
    const session = db.prepare("SELECT * FROM sessions WHERE token = ?").get(token) as any;

    if (!session || session.is_guest !== 1) {
      return NextResponse.json({ error: "Invalid guest session." }, { status: 400 });
    }

    // Check if user already exists
    const existing = db.prepare("SELECT username, email FROM users WHERE username = ? OR email = ?").get(username, email) as any;
    if (existing) {
      if (existing.email === email) return NextResponse.json({ error: "Email already in use." }, { status: 409 });
      if (existing.username === username) return NextResponse.json({ error: "Username taken." }, { status: 409 });
    }

    const userId = crypto.randomUUID();
    const { hash, salt } = hashPassword(password);

    db.transaction(() => {
      // Insert new user
      db.prepare(
        "INSERT INTO users (id, username, email, password_hash, salt) VALUES (?, ?, ?, ?, ?)"
      ).run(userId, username, email, hash, salt);

      // Upgrade session
      const expires = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(); // 30 days
      db.prepare(
        "UPDATE sessions SET user_id = ?, is_guest = 0, expires_at = ? WHERE token = ?"
      ).run(userId, expires, token);
    })();

    return NextResponse.json({ message: "Account upgraded successfully.", user: { id: userId, username, email, isGuest: false } }, { status: 201 });
  } catch (error: any) {
    console.error("[Auth Upgrade]", error);
    return NextResponse.json({ error: "Internal server error." }, { status: 500 });
  }
}
