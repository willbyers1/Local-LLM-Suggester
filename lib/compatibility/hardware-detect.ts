import { DetectedHardware, OperatingSystem } from '@/types/hardware';

/**
 * Attempts to probe available client-side hardware indicators using standard Web APIs.
 * Note: Browsers deliberately restrict direct low-level GPU VRAM inspection for privacy/fingerprinting.
 * Values are provided as starting hints and must be verified by the user.
 */
export function detectClientHardware(): DetectedHardware {
  if (typeof window === 'undefined') {
    return {};
  }

  const result: DetectedHardware = {};

  // 1. Detect OS
  const ua = window.navigator.userAgent.toLowerCase();
  if (ua.includes('mac') || ua.includes('darwin')) {
    result.os = 'macos';
  } else if (ua.includes('linux') || ua.includes('x11')) {
    result.os = 'linux';
  } else {
    result.os = 'windows';
  }

  // 2. Detect CPU Cores
  if (navigator.hardwareConcurrency) {
    result.logicalCores = navigator.hardwareConcurrency;
  }

  // 3. Detect Approximate Device Memory (RAM)
  // Supported in Chromium browsers (returns 2, 4, 8, etc.)
  const navMemory = (navigator as { deviceMemory?: number }).deviceMemory;
  if (navMemory) {
    result.deviceMemoryGB = navMemory >= 8 ? navMemory * 2 : navMemory; // Browsers cap at 8GB for anti-fingerprinting
  }

  // 4. Detect GPU via WebGL Debug Renderer Info
  try {
    const canvas = document.createElement('canvas');
    const gl =
      canvas.getContext('webgl') ||
      (canvas.getContext('experimental-webgl') as WebGLRenderingContext | null);

    if (gl) {
      const debugInfo = gl.getExtension('WEBGL_debug_renderer_info');
      if (debugInfo) {
        const renderer = gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL);
        if (typeof renderer === 'string' && renderer.length > 0) {
          result.gpuRenderer = cleanGpuRendererName(renderer);

          // Detect Apple Silicon
          if (renderer.toLowerCase().includes('apple') || (result.os === 'macos' && !renderer.toLowerCase().includes('intel') && !renderer.toLowerCase().includes('amd'))) {
            result.isLikelyAppleSilicon = true;
          }

          // Rough heuristic for estimated VRAM if recognizable GPU is detected
          result.estimatedVRAMGB = estimateVramFromGpuName(result.gpuRenderer);
        }
      }
    }
  } catch {
    // Canvas WebGL blocked or disabled
  }

  return result;
}

function cleanGpuRendererName(raw: string): string {
  return raw
    .replace(/^ANGLE \(([^,]+), /, '')
    .replace(/ Direct3D.*$/, '')
    .replace(/ vs_.*$/, '')
    .replace(/, .*\)$/, '')
    .trim();
}

function estimateVramFromGpuName(name: string): number | undefined {
  const lower = name.toLowerCase();

  // RTX 4090 / 3090
  if (lower.includes('4090') || lower.includes('3090')) return 24;
  // RTX 4080
  if (lower.includes('4080')) return 16;
  // RTX 4070 Ti / 4070
  if (lower.includes('4070 ti super')) return 16;
  if (lower.includes('4070')) return 12;
  // RTX 3080
  if (lower.includes('3080 ti')) return 12;
  if (lower.includes('3080')) return 10;
  // RTX 4060 Ti
  if (lower.includes('4060 ti 16gb')) return 16;
  if (lower.includes('4060') || lower.includes('5050')) return 8;
  // RTX 3060
  if (lower.includes('3060 12gb')) return 12;
  if (lower.includes('3060')) return 6;
  // RTX 3050 / 2060
  if (lower.includes('3050') || lower.includes('2060')) return 6;
  // AMD RX 7900 XTX
  if (lower.includes('7900 xtx')) return 24;
  if (lower.includes('7900 xt')) return 20;
  if (lower.includes('7800 xt')) return 16;
  if (lower.includes('7700 xt')) return 12;
  if (lower.includes('7600')) return 8;

  return undefined;
}
