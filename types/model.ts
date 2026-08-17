import { OperatingSystem, UseCase, ContextLength } from './hardware';

export type QuantizationType =
  | 'Q4_K_M'
  | 'Q5_K_M'
  | 'Q8_0'
  | 'FP16'
  | 'AWQ_4bit'
  | 'GPTQ_4bit';

export type CompatibilityRating =
  | 'excellent'
  | 'good'
  | 'possible'
  | 'not_recommended'
  | 'incompatible';

export type ExecutionMode =
  | 'full_gpu'
  | 'partial_gpu'
  | 'cpu_only'
  | 'unified_memory';

export type ModelFamily =
  | 'Qwen'
  | 'Llama'
  | 'Mistral'
  | 'DeepSeek'
  | 'Gemma'
  | 'Phi'
  | 'Other';

export type LocalRuntime =
  | 'ollama'
  | 'lm_studio'
  | 'llama_cpp'
  | 'kobold_cpp'
  | 'vllm'
  | 'jan';

export interface QuantizationDetail {
  quantType: QuantizationType;
  label: string; // e.g. "Q4_K_M (Recommended 4-bit)"
  bitsPerWeight: number; // e.g. 4.5
  downloadSizeGB: number;
  baseMemoryGB: number; // Model weights in memory
}

export interface ModelMetadata {
  id: string;
  name: string;
  family: ModelFamily;
  parametersB: number; // e.g. 8 for 8B, 0.5 for 500M, 70 for 70B
  tagline: string;
  description: string;
  defaultQuantization: QuantizationType;
  quantizations: Record<QuantizationType, QuantizationDetail>;
  maxContext: ContextLength;
  nativeContext: ContextLength;
  supportedUseCases: UseCase[];
  hasVision: boolean;
  supportedRuntimes: LocalRuntime[];
  recommendedRuntime: Record<OperatingSystem, LocalRuntime>;
  officialUrl: string; // HuggingFace or official GitHub/Ollama
  ollamaTag?: string; // e.g. "llama3.2:3b"
  architecture: string; // e.g. "Llama-3", "Qwen2.5", "Dense MoE"
  isMoE?: boolean;
  activeParametersB?: number; // for MoE models like Mixtral 8x7B (active ~13B)
  license: string;
  releaseYear: number;
}

export interface MemoryBreakdown {
  modelWeightsGB: number;
  kvCacheGB: number;
  runtimeOverheadGB: number;
  totalRequiredGB: number;
  usableVRAMGB: number;
  usableRAMGB: number;
  vramDeficitGB: number;
  storageRequiredGB: number;
}

export interface CompatibilityEvaluation {
  modelId: string;
  model: ModelMetadata;
  selectedQuantization: QuantizationType;
  targetContext: ContextLength;
  rating: CompatibilityRating;
  score: number; // 0 - 100 score
  executionMode: ExecutionMode;
  memoryBreakdown: MemoryBreakdown;
  headlineExplanation: string;
  technicalDetails: string[];
  warnings: string[];
  recommendedRuntime: LocalRuntime;
  fitsStorage: boolean;
  isUseCaseMatch: boolean;
}

export interface HardwareAnalysisSummary {
  gpuName: string;
  cpuName: string;
  os: OperatingSystem;
  totalVRAMGB: number;
  usableVRAMGB: number;
  totalRAMGB: number;
  usableRAMGB: number;
  availableDiskGB: number;
  isUnifiedMemory: boolean;
  tierCapabilities: {
    tier: string;
    range: string;
    status: 'excellent' | 'good' | 'possible' | 'not_recommended';
    note: string;
  }[];
  bottleneckNotice?: string;
}

export interface CandidateSummary {
  id: string;
  name: string;
  family: string;
  parametersB: number;
  rating: CompatibilityRating;
  executionMode: ExecutionMode;
  estimatedVRAM: number;
  estimatedRAM: number;
  useCases: string[];
  hasVision: boolean;
}

export interface AIRecommendationRequest {
  hardware: {
    gpu: string;
    vramGB: number;
    ramGB: number;
    cpu: string;
    storageGB: number;
    availableDiskGB: number;
    os: OperatingSystem;
    useCase: UseCase;
    targetContext: ContextLength;
  };
  compatibleCandidates: CandidateSummary[];
  byokConfig?: {
    provider: 'gemini' | 'openai' | 'anthropic' | 'openai_compatible';
    apiKey?: string;
    model?: string;
    baseUrl?: string;
  };
}

export interface AIRecommendationResponse {
  topRecommendation: {
    modelId: string;
    modelName: string;
    suggestedQuantization: string;
    suggestedContext: string;
    executionMode: string;
    reason: string;
    strengths: string[];
  };
  alternatives: {
    modelId: string;
    modelName: string;
    suggestedQuantization: string;
    role: string; // e.g. "Faster lightweight alternative", "Maximum capability option"
    reason: string;
  }[];
  tradeOffs: string[];
  warnings: string[];
  cpuOffloadAdvice: string;
  runtimeAdvice: string;
  summary: string;
}
