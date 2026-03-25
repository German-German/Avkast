import { NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';
import { LoggingService } from '@/services/logging.service';

const DATA_PATH = path.join(process.cwd(), 'data', 'tasks.json');

export async function GET() {
  try {
    const data = await fs.readFile(DATA_PATH, 'utf-8');
    return NextResponse.json(JSON.parse(data));
  } catch (error) {
    console.error('[Avkast API Error] Failed to read tasks:', error);
    return NextResponse.json(
      { error: 'Internal Server Error: Could not retrieve tasks from centralized memory.' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const dataString = await fs.readFile(DATA_PATH, 'utf-8');
    const data = JSON.parse(dataString);

    const newTask = {
      id: crypto.randomUUID(),
      ...body,
      timestamp: new Date().toISOString(),
      status: 'pending_approval',
    };

    data.active_signals.push(newTask);
    await fs.writeFile(DATA_PATH, JSON.stringify(data, null, 4));

    try {
      await LoggingService.logDecision('00000000-0000-0000-0000-000000000000', {
        agentId: newTask.source_agents?.[0] || 'Swarm',
        recommendation: `${newTask.action} ${newTask.ticker}`,
        confidenceScore: newTask.confidence_score || 0,
        rationale: newTask.reasoning || 'Task created via API',
        dataSources: [],
        agentConfidenceScores: {}
      });
    } catch (logError) {
      console.warn('[Avkast Audit Warning] Log cached:', logError);
    }

    return NextResponse.json({ message: 'Task captured.', task: newTask }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'System failure.' }, { status: 500 });
  }
}
