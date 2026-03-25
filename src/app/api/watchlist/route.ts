import { NextResponse } from "next/server";
import { getDb, getSessionUser } from "@/lib/db";
import { cookies } from "next/headers";

async function getUser() {
  const cookieStore = await cookies();
  const token = cookieStore.get("avkast_session")?.value;
  if (!token) return null;
  return getSessionUser(token);
}

export async function GET() {
  try {
    const user = await getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    if (user.isGuest) return NextResponse.json({ items: [] });

    const db = getDb();
    const items = db.prepare("SELECT * FROM watchlist WHERE user_id = ? ORDER BY added_at DESC").all(user.id);
    return NextResponse.json({ items });
  } catch (error) {
    console.error("[Watchlist GET]", error);
    return NextResponse.json({ error: "Internal server error." }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const user = await getUser();
    if (!user || user.isGuest) return NextResponse.json({ error: "Guests cannot save watchlist items. Sign up for a free account." }, { status: 403 });

    const { ticker, name, sector } = await request.json();
    if (!ticker) return NextResponse.json({ error: "Ticker is required." }, { status: 400 });

    const db = getDb();
    const existing = db.prepare("SELECT id FROM watchlist WHERE user_id = ? AND ticker = ?").get(user.id, ticker.toUpperCase());
    if (existing) return NextResponse.json({ error: "Already in watchlist." }, { status: 409 });

    const id = crypto.randomUUID();
    db.prepare("INSERT INTO watchlist (id, user_id, ticker, name, sector) VALUES (?, ?, ?, ?, ?)").run(
      id, user.id, ticker.toUpperCase(), name || "", sector || ""
    );

    return NextResponse.json({ message: "Added to watchlist.", id }, { status: 201 });
  } catch (error) {
    console.error("[Watchlist POST]", error);
    return NextResponse.json({ error: "Internal server error." }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const user = await getUser();
    if (!user || user.isGuest) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { ticker } = await request.json();
    if (!ticker) return NextResponse.json({ error: "Ticker is required." }, { status: 400 });

    const db = getDb();
    db.prepare("DELETE FROM watchlist WHERE user_id = ? AND ticker = ?").run(user.id, ticker.toUpperCase());
    return NextResponse.json({ message: "Removed from watchlist." });
  } catch (error) {
    console.error("[Watchlist DELETE]", error);
    return NextResponse.json({ error: "Internal server error." }, { status: 500 });
  }
}
