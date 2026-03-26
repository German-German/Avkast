import { NextResponse } from "next/server";
import { deleteSession } from "@/lib/db";
import { cookies } from "next/headers";

export async function POST() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("avkast_session")?.value;
    if (token) await deleteSession(token);

    const response = NextResponse.json({ message: "Signed out." });
    response.cookies.set("avkast_session", "", {
      httpOnly: true,
      sameSite: "lax",
      path: "/",
      maxAge: 0,
    });
    return response;
  } catch (error: any) {
    console.error("[Auth Signout]", error);
    return NextResponse.json({ error: "Internal server error." }, { status: 500 });
  }
}
