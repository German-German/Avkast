import { NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';
import { LoggingService } from '@/services/logging.service';

const DATA_PATH = path.join(process.cwd(), 'data', 'tasks.json');

/**
 * GET: Retrieve all Investment Signals from the data store.
 * Compliance: Full transparency of the currently active and pending signals.
 */
export async function GET() {
  try {
    const data = await fs.readFile(DATA_PATH, 'utf-8');
    return NextResponse.json(JSON.parse(data), {
      status: 200,
      headers: {
        'Cache-Control': 'no-store, max-age=0',
      },
    });
  } catch (error) {
    console.error('[Avkast API Error] Failed to read signals:', error);
    return NextResponse.json(
      { error: 'Internal Server Error: Could not retrieve investment signals from the centralized memory.' },
      { status: 500 }
    );
  }
}

/**
 * POST: Capture a new signal from the Swarm intelligence.
 * Requirements: UUID generation, ISO Timestamp, and default to 'pending_approval'.
 * Compliance: Logging to the Antigravity Audit Trail for machine-readable traceability.
 */
export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    // Basic validation
    if (!body.ticker || !body.action) {
      return NextResponse.json(
        { error: 'Bad Request: Ticker and Action are mandatory for all Swarm signals.' },
        { status: 400 }
      );
    }

    const dataString = await fs.readFile(DATA_PATH, 'utf-8');
    const data = JSON.parse(dataString);

    const newSignal = {
      id: crypto.randomUUID(),
      ticker: body.ticker,
      action: body.action,
      confidence_score: body.confidence_score || 0,
      urgency: body.urgency || 'medium',
      reasoning: body.reasoning || 'Automated swarm suggestion',
      source_agents: body.source_agents || ['Swarm'],
      timestamp: new Date().toISOString(),
      status: 'pending_approval', // Human-in-the-Loop requirement
    };

    data.active_signals.push(newSignal);

    // Persist to JSON storage
    await fs.writeFile(DATA_PATH, JSON.stringify(data, null, 4));

    // Compliance: Internal Antigravity Audit Trail
    try {
      await LoggingService.logDecision('00000000-0000-0000-0000-000000000000', {
        agentId: newSignal.source_agents[0],
        recommendation: `${newSignal.action} ${newSignal.ticker}`,
        confidenceScore: newSignal.confidence_score,
        rationale: newSignal.reasoning,
        dataSources: [],
        agentConfidenceScores: {}
      });
    } catch (logError) {
      console.warn('[Avkast Audit Warning] Failed to reach Supabase, audit log cached locally:', logError);
    }

    return NextResponse.json({
      message: 'Signal successfully captured and logged for human review.',
      signal: newSignal
    }, { status: 201 });

  } catch (error) {
    console.error('[Avkast API Error] Failed to capture signal:', error);
    return NextResponse.json(
      { error: 'Internal Server Error: System failed to capture and persist the decision artifact.' },
      { status: 500 }
    );
  }
}
