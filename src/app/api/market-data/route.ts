import { NextResponse } from "next/server";
import { getMarketData } from "@/lib/market-data";

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const tickers = searchParams.get("tickers")?.split(",") || [];
    
    if (tickers.length === 0) {
        return NextResponse.json({ error: "No tickers provided" }, { status: 400 });
    }
    
    const data = await getMarketData(tickers);
    return NextResponse.json(data);
}
