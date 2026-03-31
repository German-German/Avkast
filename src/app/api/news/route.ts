import { NextResponse } from "next/server";
import { getLatestNews } from "@/lib/news-service";

export async function GET() {
    const news = await getLatestNews();
    return NextResponse.json(news);
}
