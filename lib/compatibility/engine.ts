import { HardwareSpecs, ContextLength } from '@/types/hardware';
import {
  ModelMetadata,
  QuantizationType,
  CompatibilityEvaluation,
  CompatibilityRating,
  ExecutionMode,
  HardwareAnalysisSummary,
  LocalRuntime,
} from '@/types/model';
import { estimateMemoryBreakdown } from './memory';

/**
 * Deterministically evaluates compatibility between user PC hardware and a specific local LLM.
 */
export function evaluateModelCompatibility(
  model: ModelMetadata,
  quantType: QuantizationType,
  specs: HardwareSpecs,
  targetContext?: ContextLength
): CompatibilityEvaluation {
  const context = targetContext || specs.targetContext || 8192;
  const memoryBreakdown = estimateMemoryBreakdown(model, quantType, specs, context);

  const isUnified =
    specs.isUnifiedMemory ??
    (specs.os === 'macos' &&
      (specs.gpuName.toLowerCase().includes('apple') ||
        specs.gpuName.toLowerCase().includes('m1') ||
        specs.gpuName.toLowerCase().includes('m2') ||
        specs.gpuName.toLowerCase().includes('m3') ||
        specs.gpuName.toLowerCase().includes('m4')));

  const totalRequired = memoryBreakdown.totalRequiredGB;
  const usableVRAM = memoryBreakdown.usableVRAMGB;
  const usableRAM = memoryBreakdown.usableRAMGB;
  const storageRequired = memoryBreakdown.storageRequiredGB;

  // 1. Determine Execution Mode
  let executionMode: ExecutionMode = 'cpu_only';

  if (isUnified) {
    executionMode = 'unified_memory';
  } else if (usableVRAM >= totalRequired) {
    executionMode = 'full_gpu';
  } else if (usableVRAM >= 3.0 && (usableVRAM + usableRAM) >= totalRequired) {
    executionMode = 'partial_gpu';
  } else {
    executionMode = 'cpu_only';
  }

  // 2. Determine Rating and Score
  let rating: CompatibilityRating = 'incompatible';
  let score = 0;
  const technicalDetails: string[] = [];
  const warnings: string[] = [];

  // Check Storage
  const fitsStorage = specs.availableDiskGB >= storageRequired;
  if (!fitsStorage) {
    warnings.push(
      `Insufficient disk space: Model requires ~${storageRequired} GB download + decompression space, but only ${specs.availableDiskGB} GB is available.`
    );
  }

  // Evaluate Execution Capabilities
  if (isUnified) {
    // Apple Silicon Unified Memory
    if (usableVRAM >= totalRequired * 1.15) {
      rating = 'excellent';
      score = 95;
      technicalDetails.push(`Fits comfortably in Apple Silicon Unified Memory (~${totalRequired} GB needed vs ~${usableVRAM} GB allocated).`);
    } else if (usableVRAM >= totalRequired) {
      rating = 'good';
      score = 82;
      technicalDetails.push(`Fits within Unified Memory with modest headroom. Close heavy applications before loading.`);
    } else if (usableRAM >= totalRequired) {
      rating = 'possible';
      score = 60;
      warnings.push(`May trigger macOS memory compression/swap under high context load.`);
      technicalDetails.push(`Requires most of your available system memory (${specs.ramGB} GB total).`);
    } else {
      rating = 'incompatible';
      score = 15;
      warnings.push(`Total memory requirement (~${totalRequired} GB) exceeds available RAM (${specs.ramGB} GB).`);
    }
  } else {
    // Discrete GPU / CPU architecture
    if (usableVRAM >= totalRequired * 1.15) {
      // 100% fits on GPU with headroom
      rating = 'excellent';
      score = 96;
      technicalDetails.push(`100% GPU acceleration. Full weights and ${Math.round(context / 1024)}k context fit entirely inside your ${specs.vramGB} GB VRAM.`);
    } else if (usableVRAM >= totalRequired) {
      // 100% fits on GPU tightly
      rating = 'good';
      score = 85;
      technicalDetails.push(`Fits in ${specs.vramGB} GB VRAM with minimal margin. High context generation will use ~${totalRequired} GB.`);
    } else if (usableVRAM >= 3.0 && (usableVRAM + usableRAM) >= totalRequired * 1.05) {
      // Partial Offload (Hybrid GPU + CPU)
      const offloadedLayersEstimate = Math.round((usableVRAM / totalRequired) * 100);
      if (offloadedLayersEstimate >= 60) {
        rating = 'possible';
        score = 68;
        technicalDetails.push(
          `Partial GPU offloading: ~${offloadedLayersEstimate}% of layers fit in VRAM (${usableVRAM} GB), remaining ~${memoryBreakdown.vramDeficitGB} GB stored in System RAM.`
        );
        warnings.push(`Expect 3x–6x lower token generation speed compared to 100% GPU execution due to PCIe memory bandwidth limits.`);
      } else {
        rating = 'not_recommended';
        score = 45;
        technicalDetails.push(
          `Only ~${offloadedLayersEstimate}% of layers fit in GPU VRAM. Heavy CPU-RAM PCIe bandwidth bottleneck.`
        );
        warnings.push(`Inference speed will be sluggish (1–4 tokens/sec) due to frequent PCIe tensor transfers.`);
      }
    } else if (usableRAM >= totalRequired * 1.1) {
      // CPU Only Execution
      if (model.parametersB <= 4.0) {
        rating = 'good';
        score = 75;
        technicalDetails.push(`Small model runs well on modern CPU multi-threading (${specs.cpuName}). Fits in ${specs.ramGB} GB RAM.`);
      } else if (model.parametersB <= 9.0) {
        rating = 'possible';
        score = 58;
        technicalDetails.push(`Runs on CPU with ~${totalRequired} GB RAM usage. Expect 4–8 tokens/sec depending on AVX-512 / AVX2 support.`);
        warnings.push(`CPU-only execution uses significant processor cycles and generates more heat than GPU inference.`);
      } else {
        rating = 'not_recommended';
        score = 35;
        technicalDetails.push(`Model parameter size (${model.parametersB}B) is too heavy for comfortable CPU inference without dedicated VRAM.`);
        warnings.push(`CPU generation will be very slow (< 2 tokens/sec). Recommended to run a smaller 3B–8B model instead.`);
      }
    } else {
      rating = 'incompatible';
      score = 10;
      warnings.push(`Total memory requirement (~${totalRequired} GB) exceeds both GPU VRAM (${specs.vramGB} GB) and usable system RAM (${specs.ramGB} GB).`);
      technicalDetails.push(`System will crash with Out Of Memory (OOM) or thrash virtual pagefile excessively.`);
    }
  }

  // Adjust score based on storage
  if (!fitsStorage) {
    score = Math.max(5, score - 25);
  }

  // Use Case Match
  const isUseCaseMatch = model.supportedUseCases.includes(specs.useCase);
  if (isUseCaseMatch && rating !== 'incompatible') {
    score = Math.min(100, score + 4);
  }

  // Context length limit check
  if (context > model.maxContext) {
    warnings.push(`Target context (${context / 1024}k) exceeds model's supported limit (${model.maxContext / 1024}k).`);
  }

  // Generate Headline Explanation
  let headlineExplanation = '';
  switch (rating) {
    case 'excellent':
      headlineExplanation = `Fits comfortably in your hardware with plenty of headroom. High speed inference expected.`;
      break;
    case 'good':
      headlineExplanation = `Runs smoothly on your system with standard memory buffers.`;
      break;
    case 'possible':
      headlineExplanation = `Will run with acceptable performance, but requires memory offloading or CPU sharing.`;
      break;
    case 'not_recommended':
      headlineExplanation = `Hardware is heavily constrained for this model size. Noticeable latency expected.`;
      break;
    case 'incompatible':
      headlineExplanation = `Exceeds your available memory. Model cannot run reliably without crashing.`;
      break;
  }

  // Recommended runtime for user's OS
  const recommendedRuntime: LocalRuntime = model.recommendedRuntime[specs.os] || 'ollama';

  return {
    modelId: model.id,
    model,
    selectedQuantization: quantType,
    targetContext: context,
    rating,
    score,
    executionMode,
    memoryBreakdown,
    headlineExplanation,
    technicalDetails,
    warnings,
    recommendedRuntime,
    fitsStorage,
    isUseCaseMatch,
  };
}

/**
 * Calculates a high-level summary of the user's PC capabilities for local LLMs.
 */
export function calculateHardwareSummary(specs: HardwareSpecs): HardwareAnalysisSummary {
  const isUnified =
    specs.isUnifiedMemory ??
    (specs.os === 'macos' &&
      (specs.gpuName.toLowerCase().includes('apple') ||
        specs.gpuName.toLowerCase().includes('m1') ||
        specs.gpuName.toLowerCase().includes('m2') ||
        specs.gpuName.toLowerCase().includes('m3') ||
        specs.gpuName.toLowerCase().includes('m4')));

  let usableVRAM = 0;
  let usableRAM = 0;

  if (isUnified) {
    usableVRAM = Math.max(0, Math.round(specs.ramGB * 0.75 * 10) / 10);
    usableRAM = Math.max(0, Math.round((specs.ramGB - 3.0) * 10) / 10);
  } else {
    usableVRAM = Math.max(0, Math.round((specs.vramGB - (specs.vramGB > 2 ? 0.8 : 0.2)) * 10) / 10);
    usableRAM = Math.max(0, Math.round((specs.ramGB - 3.5) * 10) / 10);
  }

  const effectiveGPUVRAM = isUnified ? usableVRAM : usableVRAM;

  // Determine Tier Capabilities
  const tierCapabilities: HardwareAnalysisSummary['tierCapabilities'] = [
    {
      tier: 'Small & Edge Models',
      range: '0.5B – 3B (Q4/Q8)',
      status: effectiveGPUVRAM >= 2.5 || usableRAM >= 4.0 ? 'excellent' : 'good',
      note: 'Ideal for fast text summarization, low-latency code completions, and embedded agents.',
    },
    {
      tier: 'Standard 7B – 8B Models',
      range: '7B – 9B (Q4_K_M)',
      status:
        effectiveGPUVRAM >= 6.0
          ? 'excellent'
          : effectiveGPUVRAM >= 4.5 || usableRAM >= 8.0
          ? 'good'
          : usableRAM >= 6.0
          ? 'possible'
          : 'not_recommended',
      note: 'The most popular open-weight class (Llama 3.1 8B, Qwen 2.5 7B, Mistral 7B).',
    },
    {
      tier: 'Mid-Range 12B – 14B Models',
      range: '12B – 14B (Q4_K_M)',
      status:
        effectiveGPUVRAM >= 11.0
          ? 'excellent'
          : effectiveGPUVRAM >= 8.0 || (effectiveGPUVRAM >= 4.0 && usableRAM >= 12.0)
          ? 'good'
          : usableRAM >= 14.0
          ? 'possible'
          : 'not_recommended',
      note: 'Substantially higher reasoning and coding IQ (Qwen 2.5 14B, Phi-4 14B, Mistral NeMo).',
    },
    {
      tier: 'Heavy 27B – 32B Models',
      range: '27B – 32B (Q4_K_M)',
      status:
        effectiveGPUVRAM >= 22.0
          ? 'excellent'
          : effectiveGPUVRAM >= 16.0 || (effectiveGPUVRAM >= 8.0 && usableRAM >= 24.0)
          ? 'possible'
          : usableRAM >= 30.0
          ? 'possible'
          : 'not_recommended',
      note: 'Flagship reasoning and code architecture (Qwen 2.5 32B, DeepSeek R1 32B, Gemma 2 27B).',
    },
    {
      tier: 'Frontier 70B+ & Large MoE',
      range: '70B / 8x7B (Q4_K_M)',
      status:
        effectiveGPUVRAM >= 44.0
          ? 'excellent'
          : effectiveGPUVRAM >= 24.0 || (effectiveGPUVRAM >= 12.0 && usableRAM >= 48.0)
          ? 'possible'
          : usableRAM >= 48.0
          ? 'possible'
          : 'not_recommended',
      note: 'Near GPT-4 intelligence (Llama 3.3 70B, Mixtral 8x7B). Requires 48GB+ RAM or dual GPUs.',
    },
  ];

  let bottleneckNotice: string | undefined;
  if (!isUnified && specs.vramGB <= 4 && specs.ramGB >= 32) {
    bottleneckNotice = `Your system has abundant system RAM (${specs.ramGB} GB) but low GPU VRAM (${specs.vramGB} GB). Models larger than 3B will rely on CPU/PCIe offload.`;
  } else if (!isUnified && specs.vramGB >= 12 && specs.ramGB <= 16) {
    bottleneckNotice = `Your GPU VRAM (${specs.vramGB} GB) is strong, but system RAM (${specs.ramGB} GB) is relatively tight. Keep background browser tabs closed.`;
  } else if (specs.availableDiskGB < 20) {
    bottleneckNotice = `Available disk space is low (${specs.availableDiskGB} GB). 8B–14B models need 5–12 GB each to store on disk.`;
  }

  return {
    gpuName: specs.gpuName,
    cpuName: specs.cpuName,
    os: specs.os,
    totalVRAMGB: specs.vramGB,
    usableVRAMGB: usableVRAM,
    totalRAMGB: specs.ramGB,
    usableRAMGB: usableRAM,
    availableDiskGB: specs.availableDiskGB,
    isUnifiedMemory: isUnified,
    tierCapabilities,
    bottleneckNotice,
  };
}
