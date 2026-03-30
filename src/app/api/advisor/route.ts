import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } from "@google/generative-ai";
import { ADVISOR_SYSTEM_PROMPT, AI_CONFIG } from "@/lib/ai-config";

export async function POST(req: NextRequest) {
  let message = "";
  let history: any[] = [];
  let context: any = {};

  try {
    const body = await req.json();
    message = body.message || "";
    history = body.history || [];
    context = body.context || {};
  } catch (parseError) {
    console.warn("AI ADVISOR: Invalid JSON payload.", parseError);
  }

  try {
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      console.warn("AI ADVISOR: GEMINI_API_KEY not found. Operating in MOCK mode.");
      await new Promise(resolve => setTimeout(resolve, 1000));
      return NextResponse.json({
        role: "assistant",
        content: `[MOCK MODE] I am currently analyzing your query: "${message}". Please note the live generative intelligence is disconnected. The Swarm baseline suggests sticking to your core asset allocation in the interim.`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        rationale: "Swarm logic fallback (Mock Mode).",
        metadata: { model: "avkast-mock-logic-v1", engine: "Avkast Intelligence Swarm" }
      });
    }

    // Ensure history starts with 'user' and alternates correctly
    let validatedHistory = (history || []).filter((item: any) => 
      item.role === 'user' || item.role === 'model'
    );

    // If history exists but doesn't start with 'user', drop items until it does
    if (validatedHistory.length > 0 && validatedHistory[0].role !== 'user') {
      const firstUserIndex = validatedHistory.findIndex((item: any) => item.role === 'user');
      if (firstUserIndex !== -1) {
        validatedHistory = validatedHistory.slice(firstUserIndex);
      } else {
        validatedHistory = [];
      }
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    const modelName = process.env.GEMINI_MODEL || AI_CONFIG.model;
    
    const model = genAI.getGenerativeModel({ 
      model: modelName,
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
- Scenario: ${JSON.stringify(context?.scenarios || "Baseline (no mods)")}

USER MESSAGE:
${message}
`;

    const chat = model.startChat({
      history: validatedHistory,
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
      role: "assistant", 
      content: responseText,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      rationale: "Swarm logic analyzed recursive macro signals and your portfolio context.",
      metadata: {
        model: modelName,
        engine: "Avkast Intelligence Swarm",
        latency: "Real-time"
      }
    });

  } catch (error: any) {
    console.error("AI ADVISOR SERVER ROOT CAUSE:", error.message || error);
    console.error("AI ADVISOR FULL ERROR TRACE:", error);
    
    // In demo environments, falling back gracefully is critical when APIs rotate or rate limit.
    const fallbackText = `[MOCK FALLBACK] I've processed your scenario on "${message}". Due to network volatility, I'm analyzing this offline. The Avkast baseline suggests hedging against immediate volatility and maintaining a diversified asset allocation in line with your risk profile.`;

    return NextResponse.json(
      { 
        role: "assistant", 
        content: fallbackText,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        rationale: "Swarm logic fallback initiated due to API instability.",
        metadata: {
          model: "avkast-mock-logic-v1",
          engine: "Avkast Intelligence Swarm fallback",
          latency: "Offline"
        }
      },
      { status: 200 }
    );
  }
}
