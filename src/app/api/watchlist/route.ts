import { NextResponse } from "next/server";
import { getSessionUser, getWatchlist, addToWatchlist, removeFromWatchlist } from "@/lib/db";
import { cookies } from "next/headers";

async function getUser() {
  const cookieStore = await cookies();
  const token = cookieStore.get("avkast_session")?.value;
  if (!token) return null;
  return await getSessionUser(token);
}

export async function GET() {
  try {
    const user = await getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    if (user.isGuest) return NextResponse.json({ items: [] });

    const items = await getWatchlist(user.id);
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

    const watchlist = await getWatchlist(user.id);
    const existing = watchlist.find(item => item.ticker === ticker.toUpperCase());
    if (existing) return NextResponse.json({ error: "Already in watchlist." }, { status: 409 });

    const id = crypto.randomUUID();
    await addToWatchlist(user.id, {
      id,
      ticker: ticker.toUpperCase(),
      name: name || "",
      sector: sector || ""
    });

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

    await removeFromWatchlist(user.id, ticker);
    return NextResponse.json({ message: "Removed from watchlist." });
  } catch (error) {
    console.error("[Watchlist DELETE]", error);
    return NextResponse.json({ error: "Internal server error." }, { status: 500 });
  }
}
