import { ContextLength, HardwareSpecs } from '@/types/hardware';
import { ModelMetadata, QuantizationType, MemoryBreakdown } from '@/types/model';

/**
 * Realistically estimates the memory requirements for a model running at a specific context length.
 * Accounts for:
 * 1. Quantized model weights + tensor metadata
 * 2. KV Cache for attention mechanisms (scales with context length)
 * 3. Runtime allocator buffers, framework overhead, CUDA/Metal context
 * 4. Operating System & desktop compositor headroom
 */
export function estimateMemoryBreakdown(
  model: ModelMetadata,
  quantType: QuantizationType,
  specs: HardwareSpecs,
  targetContext?: ContextLength
): MemoryBreakdown {
  const context = targetContext || specs.targetContext || 8192;
  const quantDetail = model.quantizations[quantType] || model.quantizations[model.defaultQuantization];

  // 1. Model Weights Memory (GB)
  // Base weights size from verified quantization specs
  const modelWeightsGB = quantDetail.baseMemoryGB;

  // 2. KV Cache Estimation (GB)
  // Modern open models mostly use GQA (Grouped Query Attention, e.g. 8 KV heads vs 32 Q heads).
  // Approximated GQA KV Cache per token: ~0.00003 GB (30 KB) for 8B, ~0.00006 GB (60 KB) for 14B, ~0.00015 GB for 70B.
  // Standard float16 KV Cache formula: 2 * num_layers * num_kv_heads * head_dim * context * 2 bytes
  const gqaMultiplier = model.parametersB >= 60 ? 0.00005 : model.parametersB >= 20 ? 0.00003 : model.parametersB >= 10 ? 0.00002 : 0.000012;
  const kvCacheGB = Math.max(0.15, Math.round(model.parametersB * gqaMultiplier * context * 100) / 100);

  // 3. Runtime Overhead (GB)
  // CUDA driver context (approx 400MB - 600MB), scratch buffers, compute graph, tokenizer
  const runtimeOverheadGB = model.parametersB >= 30 ? 1.2 : model.parametersB >= 10 ? 0.8 : 0.5;

  // Total required memory
  const totalRequiredGB = Math.round((modelWeightsGB + kvCacheGB + runtimeOverheadGB) * 10) / 10;

  // 4. Usable Hardware Safety Margins
  // OS & display rendering reserves
  let reservedVRAM = 0.8; // Windows DWM, Linux X11/Wayland, background monitors
  let reservedRAM = 3.5; // Windows 11 / Linux baseline background processes

  if (specs.os === 'macos') {
    reservedVRAM = 0.5;
    reservedRAM = 3.0;
  }

  // Unified Memory handling (Apple Silicon or modern AMD APU)
  const isUnified = specs.isUnifiedMemory ?? (specs.os === 'macos' && (specs.gpuName.toLowerCase().includes('apple') || specs.gpuName.toLowerCase().includes('m1') || specs.gpuName.toLowerCase().includes('m2') || specs.gpuName.toLowerCase().includes('m3') || specs.gpuName.toLowerCase().includes('m4')));

  let usableVRAMGB = 0;
  let usableRAMGB = 0;

  if (isUnified) {
    // macOS Unified Memory allocates up to ~75% of total system RAM dynamically for GPU/Metal
    const maxMetalAllocation = specs.ramGB * 0.75;
    usableVRAMGB = Math.max(0, Math.round(maxMetalAllocation * 10) / 10);
    usableRAMGB = Math.max(0, Math.round((specs.ramGB - reservedRAM) * 10) / 10);
  } else {
    usableVRAMGB = Math.max(0, Math.round((specs.vramGB - (specs.vramGB > 2 ? reservedVRAM : 0.2)) * 10) / 10);
    usableRAMGB = Math.max(0, Math.round((specs.ramGB - reservedRAM) * 10) / 10);
  }

  const vramDeficitGB = Math.max(0, Math.round((totalRequiredGB - usableVRAMGB) * 10) / 10);
  const storageRequiredGB = quantDetail.downloadSizeGB;

  return {
    modelWeightsGB,
    kvCacheGB,
    runtimeOverheadGB,
    totalRequiredGB,
    usableVRAMGB,
    usableRAMGB,
    vramDeficitGB,
    storageRequiredGB,
  };
}
