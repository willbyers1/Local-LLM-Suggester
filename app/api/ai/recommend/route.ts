import { NextRequest, NextResponse } from 'next/server';
import { executeAIRecommendation } from '@/lib/ai/providers';
import { AIRecommendationRequest } from '@/types/model';

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as AIRecommendationRequest;

    if (!body || !body.hardware || !body.compatibleCandidates) {
      return NextResponse.json(
        { success: false, error: 'Missing hardware or compatible candidates in request payload.' },
        { status: 400 }
      );
    }

    const result = await executeAIRecommendation(body);

    if (!result.success) {
      return NextResponse.json(
        { success: false, error: result.error || 'Failed to generate recommendation.' },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, data: result.data });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Internal Server Error';
    return NextResponse.json({ success: false, error: msg }, { status: 500 });
  }
}
