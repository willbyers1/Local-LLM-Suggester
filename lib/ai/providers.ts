import { GoogleGenAI, Type } from '@google/genai';
import { AIRecommendationRequest, AIRecommendationResponse } from '@/types/model';
import { AIRecommendationResponseSchema } from '@/lib/validation/schemas';
import { AI_SYSTEM_PROMPT, formatRecommendationPrompt } from './prompt';

export interface AIProviderResult {
  success: boolean;
  data?: AIRecommendationResponse;
  error?: string;
}

export interface KeyValidationResult {
  valid: boolean;
  error?: string;
  provider: string;
}

/**
 * Executes AI recommendation query across chosen provider (Gemini, OpenAI, Anthropic, OpenAI-compatible).
 */
export async function executeAIRecommendation(
  request: AIRecommendationRequest
): Promise<AIProviderResult> {
  const provider = request.byokConfig?.provider || 'gemini';
  const customKey = request.byokConfig?.apiKey?.trim();
  const customModel = request.byokConfig?.model?.trim();
  const customBaseUrl = request.byokConfig?.baseUrl?.trim();

  const userPrompt = formatRecommendationPrompt(request);

  try {
    let rawJsonText = '';

    if (provider === 'gemini') {
      // Use user's BYOK key if supplied; otherwise use server-side process.env.GEMINI_API_KEY
      const apiKey = customKey || process.env.GEMINI_API_KEY;
      if (!apiKey) {
        return {
          success: false,
          error: 'No Gemini API key available. Please configure your API key in BYOK settings or set GEMINI_API_KEY in environment secrets.',
        };
      }

      const ai = new GoogleGenAI({
        apiKey,
        httpOptions: {
          headers: {
            'User-Agent': 'aistudio-build',
          },
        },
      });

      const modelName = customModel || 'gemini-3.7-flash';

      const response = await ai.models.generateContent({
        model: modelName,
        contents: userPrompt,
        config: {
          systemInstruction: AI_SYSTEM_PROMPT,
          responseMimeType: 'application/json',
          temperature: 0.2,
        },
      });

      rawJsonText = response.text || '';
    } else if (provider === 'openai') {
      if (!customKey) {
        return { success: false, error: 'OpenAI API key is required for BYOK mode.' };
      }

      const modelName = customModel || 'gpt-4o-mini';
      const res = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${customKey}`,
        },
        body: JSON.stringify({
          model: modelName,
          temperature: 0.2,
          response_format: { type: 'json_object' },
          messages: [
            { role: 'system', content: AI_SYSTEM_PROMPT },
            { role: 'user', content: userPrompt },
          ],
        }),
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData?.error?.message || `OpenAI API returned status ${res.status}`);
      }

      const data = await res.json();
      rawJsonText = data?.choices?.[0]?.message?.content || '';
    } else if (provider === 'anthropic') {
      if (!customKey) {
        return { success: false, error: 'Anthropic API key is required for BYOK mode.' };
      }

      const modelName = customModel || 'claude-3-5-haiku-20241022';
      const res = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': customKey,
          'anthropic-version': '2023-06-01',
        },
        body: JSON.stringify({
          model: modelName,
          max_tokens: 2048,
          temperature: 0.2,
          system: AI_SYSTEM_PROMPT + '\nRespond ONLY with a JSON object. Do not include markdown ticks.',
          messages: [{ role: 'user', content: userPrompt }],
        }),
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData?.error?.message || `Anthropic API returned status ${res.status}`);
      }

      const data = await res.json();
      rawJsonText = data?.content?.[0]?.text || '';
    } else if (provider === 'openai_compatible') {
      const baseUrl = customBaseUrl || 'https://api.groq.com/openai/v1';
      const endpoint = baseUrl.endsWith('/chat/completions')
        ? baseUrl
        : `${baseUrl.replace(/\/$/, '')}/chat/completions`;

      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      };
      if (customKey) {
        headers['Authorization'] = `Bearer ${customKey}`;
      }

      const modelName = customModel || 'llama-3.3-70b-versatile';
      const res = await fetch(endpoint, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          model: modelName,
          temperature: 0.2,
          messages: [
            { role: 'system', content: AI_SYSTEM_PROMPT },
            { role: 'user', content: userPrompt },
          ],
        }),
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData?.error?.message || `Custom API returned status ${res.status}`);
      }

      const data = await res.json();
      rawJsonText = data?.choices?.[0]?.message?.content || '';
    }

    // Clean JSON text (strip any accidental markdown block)
    const cleaned = rawJsonText
      .replace(/^```json\s*/i, '')
      .replace(/^```\s*/i, '')
      .replace(/\s*```$/i, '')
      .trim();

    if (!cleaned) {
      throw new Error('Received empty response from AI model.');
    }

    const parsed = JSON.parse(cleaned);
    const validated = AIRecommendationResponseSchema.parse(parsed);

    return {
      success: true,
      data: validated,
    };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown AI provider error occurred';
    return {
      success: false,
      error: `AI Recommendation Failed: ${message}`,
    };
  }
}

/**
 * Validates a user's BYOK API key by sending a lightweight test query.
 */
export async function validateProviderApiKey(params: {
  provider: 'gemini' | 'openai' | 'anthropic' | 'openai_compatible';
  apiKey: string;
  baseUrl?: string;
  model?: string;
}): Promise<KeyValidationResult> {
  const { provider, apiKey, baseUrl, model } = params;

  if (!apiKey && provider !== 'openai_compatible') {
    return { valid: false, provider, error: 'API key cannot be empty.' };
  }

  try {
    if (provider === 'gemini') {
      const ai = new GoogleGenAI({
        apiKey,
        httpOptions: { headers: { 'User-Agent': 'aistudio-build' } },
      });
      const response = await ai.models.generateContent({
        model: model || 'gemini-3.7-flash',
        contents: 'Test connection. Reply with {"status":"ok"}',
      });
      if (response.text) {
        return { valid: true, provider };
      }
    } else if (provider === 'openai') {
      const res = await fetch('https://api.openai.com/v1/models', {
        headers: { Authorization: `Bearer ${apiKey}` },
      });
      if (res.ok) return { valid: true, provider };
      const err = await res.json().catch(() => ({}));
      return { valid: false, provider, error: err?.error?.message || `HTTP ${res.status}` };
    } else if (provider === 'anthropic') {
      const res = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': apiKey,
          'anthropic-version': '2023-06-01',
        },
        body: JSON.stringify({
          model: model || 'claude-3-5-haiku-20241022',
          max_tokens: 10,
          messages: [{ role: 'user', content: 'Ping' }],
        }),
      });
      if (res.ok) return { valid: true, provider };
      const err = await res.json().catch(() => ({}));
      return { valid: false, provider, error: err?.error?.message || `HTTP ${res.status}` };
    } else if (provider === 'openai_compatible') {
      const targetUrl = baseUrl ? `${baseUrl.replace(/\/$/, '')}/models` : 'https://api.groq.com/openai/v1/models';
      const headers: Record<string, string> = {};
      if (apiKey) headers['Authorization'] = `Bearer ${apiKey}`;

      const res = await fetch(targetUrl, { headers });
      if (res.ok) return { valid: true, provider };
      return { valid: false, provider, error: `Endpoint returned HTTP ${res.status}` };
    }

    return { valid: false, provider, error: 'Unsupported provider configuration.' };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Network or connection failed';
    return { valid: false, provider, error: msg };
  }
}
