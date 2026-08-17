import { z } from 'zod';

export const HardwareFormSchema = z.object({
  gpuName: z.string().min(1, 'GPU name is required'),
  vramGB: z.number().min(0, 'VRAM cannot be negative').max(512, 'VRAM value is unrealistically high'),
  ramGB: z.number().min(2, 'System RAM must be at least 2 GB').max(2048, 'RAM value is unrealistically high'),
  cpuName: z.string().min(1, 'CPU name is required'),
  cpuCores: z.number().min(1).max(256).optional(),
  storageGB: z.number().min(10, 'Total storage must be at least 10 GB').max(100000),
  availableDiskGB: z.number().min(1, 'Available disk space must be at least 1 GB').max(100000),
  os: z.enum(['windows', 'macos', 'linux']),
  useCase: z.enum([
    'general',
    'coding',
    'reasoning',
    'writing',
    'roleplay',
    'research',
    'summarization',
    'translation',
    'vision',
    'offline_privacy',
  ]),
  targetContext: z.union([
    z.literal(2048),
    z.literal(4096),
    z.literal(8192),
    z.literal(16384),
    z.literal(32768),
    z.literal(65536),
    z.literal(131072),
  ]),
  isUnifiedMemory: z.boolean().optional(),
});

export const BYOKConfigSchema = z.object({
  provider: z.enum(['gemini', 'openai', 'anthropic', 'openai_compatible']),
  apiKey: z.string().trim().optional(),
  model: z.string().trim().optional(),
  baseUrl: z.string().url('Invalid endpoint URL').optional().or(z.literal('')),
});

export const AIRecommendationResponseSchema = z.object({
  topRecommendation: z.object({
    modelId: z.string(),
    modelName: z.string(),
    suggestedQuantization: z.string(),
    suggestedContext: z.string(),
    executionMode: z.string(),
    reason: z.string(),
    strengths: z.array(z.string()),
  }),
  alternatives: z.array(
    z.object({
      modelId: z.string(),
      modelName: z.string(),
      suggestedQuantization: z.string(),
      role: z.string(),
      reason: z.string(),
    })
  ),
  tradeOffs: z.array(z.string()),
  warnings: z.array(z.string()),
  cpuOffloadAdvice: z.string(),
  runtimeAdvice: z.string(),
  summary: z.string(),
});

export type ValidatedHardwareForm = z.infer<typeof HardwareFormSchema>;
export type ValidatedBYOKConfig = z.infer<typeof BYOKConfigSchema>;
export type ValidatedAIRecommendation = z.infer<typeof AIRecommendationResponseSchema>;
