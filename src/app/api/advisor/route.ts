import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } from "@google/generative-ai";
import { ADVISOR_SYSTEM_PROMPT, AI_CONFIG } from "@/lib/ai-config";

/**
 * Avkast AI Advisor API Route
 * Handles real-time financial intelligence requests using Google Gemini.
 * Falls back to high-quality mock if GEMINI_API_KEY is missing.
 */

interface AdvisorRequest {
  message: string;
  history?: { role: "user" | "model"; parts: { text: string }[] }[];
  context?: {
    portfolio?: any;
    riskProfile?: string;
    goals?: string[];
    marketFocus?: string[];
    clientBrainContext?: string; // Compact string from MemoryService
  };
}

export async function POST(req: NextRequest) {
  try {
    const body: AdvisorRequest = await req.json();
    const { message, history, context } = body;

    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      console.warn("AI ADVISOR: GEMINI_API_KEY not found. Operating in MOCK mode.");
      await new Promise(resolve => setTimeout(resolve, 1000));
      return NextResponse.json({
        role: "assistant",
        content: `[MOCK MODE] I've analyzed your query regarding "${message}". Based on your ${context?.riskProfile || "Moderate"} risk profile, I recommend maintaining a 5% liquidity buffer.`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        rationale: "Swarm logic analyzed recursive sentiment signals (Mock Logic).",
        metadata: { model: "avkast-mock-logic-v1", engine: "Avkast Intelligence Swarm" }
      });
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ 
      model: AI_CONFIG.model,
      systemInstruction: ADVISOR_SYSTEM_PROMPT
    });

    // Create prompt with context injection
    const contextPrompt = `
USER CONTEXT:
- Risk Profile: ${context?.riskProfile || "Moderate"}
- Preferred Markets: ${context?.marketFocus?.join(", ") || "Global Diversified"}
- Client Brain Summary: ${context?.clientBrainContext || "New client, no inferred traits yet."}
- Current Portfolio Snapshot: ${JSON.stringify(context?.portfolio || "Default baseline")}
- Active Goals: ${context?.goals?.join(", ") || "None specified"}

USER MESSAGE:
${message}
`;

    const chat = model.startChat({
      history: history || [],
      generationConfig: AI_CONFIG.generationConfig,
      safetySettings: [
        {
          category: HarmCategory.HARM_CATEGORY_HARASSMENT,
          threshold: HarmBlockThreshold.BLOCK_ONLY_HIGH,
        },
        {
          category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
          threshold: HarmBlockThreshold.BLOCK_ONLY_HIGH,
        },
        {
          category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT,
          threshold: HarmBlockThreshold.BLOCK_ONLY_HIGH,
        },
        {
          category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
          threshold: HarmBlockThreshold.BLOCK_ONLY_HIGH,
        },
      ],
    });

    const result = await chat.sendMessage(contextPrompt);
    const responseText = result.response.text();

    return NextResponse.json({
      role: "assistant", // UI expectation
      content: responseText,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      rationale: "Swarm logic analyzed recursive macro signals and your portfolio context.",
      metadata: {
        model: AI_CONFIG.model,
        engine: "Avkast Intelligence Swarm",
        latency: "Real-time"
      }
    });

  } catch (error: any) {
    console.error("AI ADVISOR ERROR:", error);
    
    // Extract specific Gemini details if available
    const errorDetails = error.response?.candidates?.[0]?.finishReason || error.message || "Unknown neural link failure";
    
    return NextResponse.json(
      { 
        error: "Neural logic failure. Re-synchronizing...", 
        details: errorDetails,
        code: error.status || 500
      },
      { status: 500 }
    );
  }
}
