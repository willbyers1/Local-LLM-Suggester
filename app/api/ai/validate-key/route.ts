import { NextRequest, NextResponse } from 'next/server';
import { validateProviderApiKey } from '@/lib/ai/providers';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { provider, apiKey, baseUrl, model } = body;

    if (!provider) {
      return NextResponse.json({ valid: false, error: 'Provider is required.' }, { status: 400 });
    }

    const result = await validateProviderApiKey({
      provider,
      apiKey: apiKey || '',
      baseUrl,
      model,
    });

    return NextResponse.json(result);
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Internal Server Error';
    return NextResponse.json({ valid: false, error: msg }, { status: 500 });
  }
}
