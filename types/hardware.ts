export type OperatingSystem = 'windows' | 'macos' | 'linux';

export type UseCase =
  | 'general'
  | 'coding'
  | 'reasoning'
  | 'writing'
  | 'roleplay'
  | 'research'
  | 'summarization'
  | 'translation'
  | 'vision'
  | 'offline_privacy';

export type ContextLength = 2048 | 4096 | 8192 | 16384 | 32768 | 65536 | 131072;

export interface HardwareSpecs {
  gpuName: string;
  vramGB: number;
  ramGB: number;
  cpuName: string;
  cpuCores?: number;
  storageGB: number; // total storage
  availableDiskGB: number; // free disk space
  os: OperatingSystem;
  useCase: UseCase;
  targetContext: ContextLength;
  isUnifiedMemory?: boolean; // e.g. Apple Silicon Mac
}

export interface HardwarePreset {
  id: string;
  name: string;
  description: string;
  specs: HardwareSpecs;
}

export interface DetectedHardware {
  gpuRenderer?: string;
  estimatedVRAMGB?: number;
  deviceMemoryGB?: number;
  logicalCores?: number;
  os?: OperatingSystem;
  isLikelyAppleSilicon?: boolean;
}
