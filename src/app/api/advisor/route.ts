import { NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { getSessionUser } from "@/lib/db";
import { cookies } from "next/headers";

export async function POST(request: Request) {
  try {
    const { message, history, context } = await request.json();

    const cookieStore = await cookies();
    const token = cookieStore.get("avkast_session")?.value;
    const user = token ? getSessionUser(token) : null;

    if (!process.env.GEMINI_API_KEY) {
      console.error("GEMINI_API_KEY is not set in environment variables.");
      return NextResponse.json({ error: "API configuration missing." }, { status: 500 });
    }

    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const wealth = context?.portfolio?.wealth || user?.initialWealth || 100000;
    const markets = context?.marketFocus || user?.preferredMarkets || "Global Tech";

    const systemPrompt = `
      You are Avkast AI Advisor, an institutional-grade wealth management assistant.
      Current User Context:
      - Wealth: $${Number(wealth).toLocaleString()}
      - Market Focus: ${Array.isArray(markets) ? markets.join(", ") : markets}
      - Risk Profile: ${context?.riskProfile || "Moderate"}
      
      Respond with professional, data-driven financial insights. 
      Keep it concise and aligned with institutional risk standards.
      Always respond in plain text, do not use markdown formatting for the main body.
    `;

    // Initialize chat with history if provided
    const chat = model.startChat({
      history: history || [],
      generationConfig: {
        maxOutputTokens: 500,
      },
    });

    const result = await chat.sendMessage(`${systemPrompt}\n\nUser Message: ${message}`);
    const responseText = result.response.text();

    return NextResponse.json({
      content: responseText,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      rationale: `Neural logic applied to your $${Number(wealth).toLocaleString()} capital and focus on ${Array.isArray(markets) ? markets[0] : markets}.`
    });
  } catch (error: any) {
    console.error("[Advisor API Entry]", error);
    return NextResponse.json({ 
      error: "Neural link unstable.", 
      details: error.message 
    }, { status: 500 });
  }
}
