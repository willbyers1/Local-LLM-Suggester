import { AIRecommendationRequest } from '@/types/model';

export const AI_SYSTEM_PROMPT = `You are an expert Local LLM Hardware Compatibility & Deployment Advisor.
Your job is to recommend the best local open-weight LLM models to run on a user's specific computer hardware.

CRITICAL RULES:
1. Base all recommendations STRICTLY on the provided deterministic compatibility calculations and candidate models.
2. DO NOT hallucinate or fabricate model requirements, parameter counts, or memory sizes.
3. Prioritize realistic compatibility:
   - Prefer models that fit into VRAM or Unified Memory for high generation speed.
   - If partial GPU offloading is necessary, clearly explain the PCIe bandwidth trade-off.
   - If CPU-only execution is selected, prefer smaller 1B-4B models and warn about slower token generation.
4. Align choices tightly with the user's specific use case (e.g., Coding -> Qwen 2.5 Coder / DeepSeek Coder, Reasoning -> DeepSeek R1 / Phi-4 / Qwen 2.5, Vision -> Qwen 2.5 VL / Llama 3.2 Vision).
5. Output valid, raw JSON adhering strictly to the required schema. Do NOT include markdown code fences (\`\`\`json).

Output JSON Schema:
{
  "topRecommendation": {
    "modelId": "model-id-string",
    "modelName": "Full Model Name",
    "suggestedQuantization": "e.g. Q4_K_M (Recommended 4-bit)",
    "suggestedContext": "e.g. 8192 (8k)",
    "executionMode": "full_gpu | partial_gpu | cpu_only | unified_memory",
    "reason": "Detailed justification of why this model is the #1 best fit for their hardware & use case.",
    "strengths": ["Key strength 1", "Key strength 2", "Key strength 3"]
  },
  "alternatives": [
    {
      "modelId": "model-id-string",
      "modelName": "Full Model Name",
      "suggestedQuantization": "e.g. Q4_K_M",
      "role": "e.g. Faster / Lower Memory alternative or Maximum Capability Option",
      "reason": "Why the user might pick this alternative."
    }
  ],
  "tradeOffs": [
    "Realistic trade-off point 1 (e.g. context limit impact on VRAM)",
    "Realistic trade-off point 2"
  ],
  "warnings": [
    "Practical warning regarding thermals, RAM overhead, or background applications"
  ],
  "cpuOffloadAdvice": "Specific guidance on layer offloading or thread configuration for their CPU/GPU combo.",
  "runtimeAdvice": "Recommended local runtime (e.g. Ollama or LM Studio) and configuration tip for their OS.",
  "summary": "Concise 2-sentence executive recommendation."
}`;

export function formatRecommendationPrompt(data: AIRecommendationRequest): string {
  const { hardware, compatibleCandidates } = data;

  const candidateSummary = compatibleCandidates
    .map(
      (c) =>
        `- Model: ${c.name} (ID: ${c.id}) | Family: ${c.family} | Params: ${c.parametersB}B | Rating: ${c.rating.toUpperCase()} | Mode: ${c.executionMode} | Est. VRAM: ~${c.estimatedVRAM}GB | Est. RAM: ~${c.estimatedRAM}GB | Vision: ${c.hasVision ? 'YES' : 'NO'} | UseCases: [${c.useCases.join(', ')}]`
    )
    .join('\n');

  return `USER HARDWARE SPECIFICATIONS:
- Operating System: ${hardware.os.toUpperCase()}
- GPU: ${hardware.gpu} (VRAM: ${hardware.vramGB} GB)
- CPU: ${hardware.cpu}
- System RAM: ${hardware.ramGB} GB
- Total Storage: ${hardware.storageGB} GB (Free Disk Space: ${hardware.availableDiskGB} GB)
- Desired Primary Use Case: ${hardware.useCase.toUpperCase()}
- Target Working Context: ${hardware.targetContext} tokens (~${Math.round(hardware.targetContext / 1024)}k)

CALCULATED COMPATIBLE LOCAL LLM CANDIDATES:
${candidateSummary}

INSTRUCTIONS:
Evaluate these candidates against the user's hardware and desired use case "${hardware.useCase}".
Select the #1 best model, provide 2 distinct alternatives (e.g., one lighter/faster and one higher-capability), detail realistic memory trade-offs, and recommend the best local runtime (Ollama or LM Studio) for ${hardware.os}.
Return ONLY the raw JSON object conforming to the schema.`;
}
