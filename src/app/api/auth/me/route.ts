import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/db";
import { cookies } from "next/headers";

export async function GET() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("avkast_session")?.value;

    if (!token) {
      return NextResponse.json({ user: null }, { status: 401 });
    }

    const user = await getSessionUser(token);
    if (!user) {
      return NextResponse.json({ user: null }, { status: 401 });
    }

    return NextResponse.json({ user });
  } catch (error: any) {
    console.error("[Auth Me]", error);
    return NextResponse.json({ error: "Internal server error." }, { status: 500 });
  }
}
