import { NextResponse } from "next/server";
import { hashPassword, findUserByEmail, findUserByUsername, createUser, upgradeSession, getSessionUser } from "@/lib/db";
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

    const sessionUser = await getSessionUser(token);
    if (!sessionUser || !sessionUser.isGuest) {
      return NextResponse.json({ error: "Invalid guest session." }, { status: 400 });
    }

    // Check if user already exists
    const existingEmail = await findUserByEmail(email);
    if (existingEmail) return NextResponse.json({ error: "Email already in use." }, { status: 409 });

    const existingUser = await findUserByUsername(username);
    if (existingUser) return NextResponse.json({ error: "Username taken." }, { status: 409 });

    const userId = crypto.randomUUID();
    const { hash, salt } = hashPassword(password);

    // Create user and upgrade session
    await createUser({
      id: userId,
      username,
      email,
      password_hash: hash,
      salt
    });

    await upgradeSession(token, userId);

    return NextResponse.json({ message: "Account upgraded successfully.", user: { id: userId, username, email, isGuest: false } }, { status: 201 });
  } catch (error: any) {
    console.error("[Auth Upgrade]", error);
    return NextResponse.json({ error: "Internal server error." }, { status: 500 });
  }
}
