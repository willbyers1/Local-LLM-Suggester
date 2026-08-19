'use client';

import React, { useState } from 'react';
import { HardwareSpecs, OperatingSystem, UseCase, ContextLength } from '@/types/hardware';
import { detectClientHardware } from '@/lib/compatibility/hardware-detect';
import { Cpu, HardDrive, Monitor, Sparkles, Layers, Sliders, Check, RefreshCw } from 'lucide-react';

interface HardwareFormProps {
  specs: HardwareSpecs;
  onChange: (updated: HardwareSpecs) => void;
  onAnalyze: () => void;
  isAnalyzing?: boolean;
}

const GPU_SUGGESTIONS = [
  { name: 'NVIDIA GeForce RTX 4060', vram: 8 },
  { name: 'NVIDIA GeForce RTX 5050', vram: 8 },
  { name: 'NVIDIA GeForce RTX 4070', vram: 12 },
  { name: 'NVIDIA GeForce RTX 4080', vram: 16 },
  { name: 'NVIDIA GeForce RTX 4090', vram: 24 },
  { name: 'Apple M3 Pro (14-Core)', vram: 18, isUnified: true, os: 'macos' as OperatingSystem },
  { name: 'Intel Iris Xe / AMD iGPU', vram: 0 },
];

const USE_CASES: { id: UseCase; label: string; desc: string; icon: string }[] = [
  { id: 'coding', label: 'Coding & Debugging', desc: 'Code generation, refactoring, algorithms', icon: '💻' },
  { id: 'general', label: 'General Assistant', desc: 'Everyday Q&A, chat, multi-tasking', icon: '🤖' },
  { id: 'reasoning', label: 'Math & Deep Reasoning', desc: 'Chain-of-thought, logic, problem solving', icon: '🧠' },
  { id: 'writing', label: 'Writing & Creative', desc: 'Articles, copywriting, storytelling', icon: '✍️' },
  { id: 'research', label: 'Research & Analysis', desc: 'Document ingestion, synthesis, deep dive', icon: '🔬' },
  { id: 'vision', label: 'Vision & Multimodal', desc: 'Image OCR, diagrams, screenshots', icon: '👁️' },
  { id: 'summarization', label: 'Summarization', desc: 'Extracting key takeaways from text', icon: '📝' },
  { id: 'translation', label: 'Translation', desc: 'Cross-language translation & localization', icon: '🌐' },
  { id: 'roleplay', label: 'Roleplay & Character', desc: 'Persona emulation, interactive fiction', icon: '🎭' },
  { id: 'offline_privacy', label: 'Offline / 100% Private', desc: 'Zero data leakage, local air-gapped run', icon: '🔒' },
];

export const HardwareForm: React.FC<HardwareFormProps> = ({
  specs,
  onChange,
  onAnalyze,
  isAnalyzing = false,
}) => {
  const [detectNotice, setDetectNotice] = useState<string | null>(null);
  const [isDetecting, setIsDetecting] = useState(false);

  const handleDetect = () => {
    setIsDetecting(true);
    setTimeout(() => {
      const detected = detectClientHardware();
      const newSpecs: HardwareSpecs = { ...specs };

      if (detected.os) newSpecs.os = detected.os;
      if (detected.gpuRenderer) {
        newSpecs.gpuName = detected.gpuRenderer;
      }
      if (detected.estimatedVRAMGB !== undefined) {
        newSpecs.vramGB = detected.estimatedVRAMGB;
      }
      if (detected.deviceMemoryGB) {
        newSpecs.ramGB = Math.max(specs.ramGB, detected.deviceMemoryGB);
      }
      if (detected.logicalCores) {
        newSpecs.cpuCores = detected.logicalCores;
      }
      if (detected.isLikelyAppleSilicon) {
        newSpecs.isUnifiedMemory = true;
        newSpecs.os = 'macos';
        if (newSpecs.gpuName.includes('Intel')) {
          newSpecs.gpuName = 'Apple Silicon GPU (Unified)';
        }
      }

      onChange(newSpecs);
      setIsDetecting(false);
      setDetectNotice(
        `Probed browser indicators: ${detected.logicalCores || '?'} CPU threads, ~${detected.deviceMemoryGB || '?'} GB RAM detected, GPU: "${detected.gpuRenderer || 'Default'}". Please verify your actual VRAM.`
      );
    }, 400);
  };

  const handleContextChange = (ctx: ContextLength) => {
    onChange({ ...specs, targetContext: ctx });
  };

  return (
    <div className="bg-[#18181b] border border-white/10 rounded-xl p-5 sm:p-6 shadow-xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-5 border-b border-white/5">
        <div>
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">
            Configuration Panel
          </span>
          <h2 className="text-lg font-semibold text-white tracking-tight flex items-center gap-2 mt-0.5">
            <Sliders className="w-4 h-4 text-blue-500" />
            <span>Hardware Profile & System Specifications</span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Provide your exact GPU, VRAM, and RAM to determine real local LLM memory headroom.
          </p>
        </div>

        {/* Auto Detect Button */}
        <button
          id="btn-detect-hardware"
          type="button"
          onClick={handleDetect}
          disabled={isDetecting}
          className="inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-white/5 hover:bg-white/10 text-slate-200 transition-colors self-start sm:self-auto border border-white/10"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isDetecting ? 'animate-spin text-blue-400' : 'text-slate-400'}`} />
          <span>{isDetecting ? 'Detecting...' : 'Detect Hardware'}</span>
        </button>
      </div>

      {detectNotice && (
        <div className="mt-3 p-3 rounded-lg bg-blue-500/10 border border-blue-500/20 text-xs text-blue-300 flex items-start justify-between gap-2">
          <span>{detectNotice}</span>
          <button
            onClick={() => setDetectNotice(null)}
            className="text-blue-400 hover:text-blue-200 font-bold ml-2"
          >
            &times;
          </button>
        </div>
      )}

      {/* Form Fields Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 mt-5">
        {/* GPU Section */}
        <div className="space-y-1.5">
          <label className="block text-[11px] text-slate-400 font-medium">
            GPU Architecture / Model
          </label>
          <div className="relative">
            <input
              id="input-gpu-name"
              type="text"
              value={specs.gpuName}
              onChange={(e) => onChange({ ...specs, gpuName: e.target.value })}
              placeholder="e.g. RTX 4060 / RTX 5050"
              className="w-full px-3 py-2 text-sm rounded-lg border border-white/10 bg-[#09090b] text-slate-100 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
            />
          </div>

          {/* Quick GPU suggestions */}
          <div className="flex flex-wrap gap-1 pt-1">
            {GPU_SUGGESTIONS.map((g) => (
              <button
                key={g.name}
                type="button"
                onClick={() =>
                  onChange({
                    ...specs,
                    gpuName: g.name,
                    vramGB: g.vram,
                    isUnifiedMemory: g.isUnified ?? false,
                    os: g.os || specs.os,
                  })
                }
                className="px-2 py-0.5 rounded text-[10px] font-mono bg-white/5 text-slate-400 hover:bg-white/10 hover:text-slate-200 border border-white/5 transition-colors"
              >
                {g.name.replace('NVIDIA GeForce ', '').replace(' (14-Core)', '')}
              </button>
            ))}
          </div>
        </div>

        {/* VRAM (GB) */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <label className="block text-[11px] text-slate-400 font-medium">
              GPU Dedicated VRAM
            </label>
            <span className="text-[11px] font-mono font-medium text-green-400">
              {specs.vramGB} GB
            </span>
          </div>
          <div className="flex items-center gap-2">
            <input
              id="input-vram-gb"
              type="number"
              min={0}
              max={128}
              step={1}
              value={specs.vramGB}
              onChange={(e) =>
                onChange({ ...specs, vramGB: Math.max(0, parseFloat(e.target.value) || 0) })
              }
              className="w-full px-3 py-2 text-sm rounded-lg border border-white/10 bg-[#09090b] text-slate-100 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 font-mono transition-colors"
            />
            <span className="text-xs font-mono text-slate-400">GB</span>
          </div>

          <div className="flex items-center gap-1 pt-1">
            {[0, 6, 8, 12, 16, 24].map((v) => (
              <button
                key={v}
                type="button"
                onClick={() => onChange({ ...specs, vramGB: v })}
                className={`px-2 py-0.5 rounded text-[11px] font-mono transition-colors ${
                  specs.vramGB === v
                    ? 'bg-blue-600 text-white font-bold'
                    : 'bg-white/5 text-slate-400 hover:bg-white/10 hover:text-slate-200 border border-white/5'
                }`}
              >
                {v}G
              </button>
            ))}
          </div>
        </div>

        {/* System RAM (GB) */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <label className="block text-[11px] text-slate-400 font-medium">
              System RAM Buffer
            </label>
            <span className="text-[11px] font-mono font-medium text-blue-400">
              {specs.ramGB} GB
            </span>
          </div>
          <div className="flex items-center gap-2">
            <input
              id="input-ram-gb"
              type="number"
              min={2}
              max={512}
              step={1}
              value={specs.ramGB}
              onChange={(e) =>
                onChange({ ...specs, ramGB: Math.max(2, parseFloat(e.target.value) || 2) })
              }
              className="w-full px-3 py-2 text-sm rounded-lg border border-white/10 bg-[#09090b] text-slate-100 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 font-mono transition-colors"
            />
            <span className="text-xs font-mono text-slate-400">GB</span>
          </div>

          <div className="flex items-center gap-1 pt-1">
            {[8, 16, 32, 64, 128].map((r) => (
              <button
                key={r}
                type="button"
                onClick={() => onChange({ ...specs, ramGB: r })}
                className={`px-2 py-0.5 rounded text-[11px] font-mono transition-colors ${
                  specs.ramGB === r
                    ? 'bg-blue-600 text-white font-bold'
                    : 'bg-white/5 text-slate-400 hover:bg-white/10 hover:text-slate-200 border border-white/5'
                }`}
              >
                {r}G
              </button>
            ))}
          </div>
        </div>

        {/* CPU Model */}
        <div className="space-y-1.5">
          <label className="block text-[11px] text-slate-400 font-medium">
            CPU Processor Model
          </label>
          <input
            id="input-cpu-name"
            type="text"
            value={specs.cpuName}
            onChange={(e) => onChange({ ...specs, cpuName: e.target.value })}
            placeholder="e.g. AMD Ryzen 7 7800X3D"
            className="w-full px-3 py-2 text-sm rounded-lg border border-white/10 bg-[#09090b] text-slate-100 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
          />
          <div className="flex items-center justify-between text-[11px] text-slate-500 font-mono">
            <span>Threads: {specs.cpuCores || 8}</span>
            <span>AVX-512 / AVX2</span>
          </div>
        </div>

        {/* Storage / Available Disk Space */}
        <div className="space-y-1.5">
          <label className="block text-[11px] text-slate-400 font-medium">
            Available SSD Storage for Weights
          </label>
          <div className="flex items-center gap-2">
            <input
              id="input-disk-space"
              type="number"
              min={1}
              max={10000}
              value={specs.availableDiskGB}
              onChange={(e) =>
                onChange({
                  ...specs,
                  availableDiskGB: Math.max(1, parseFloat(e.target.value) || 1),
                })
              }
              className="w-full px-3 py-2 text-sm rounded-lg border border-white/10 bg-[#09090b] text-slate-100 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 font-mono transition-colors"
            />
            <span className="text-xs font-mono text-slate-400">GB Free</span>
          </div>
          <p className="text-[11px] text-slate-500">
            Total SSD: {specs.storageGB} GB (Models take ~4GB–30GB)
          </p>
        </div>

        {/* Operating System */}
        <div className="space-y-1.5">
          <label className="block text-[11px] text-slate-400 font-medium">
            Operating System
          </label>
          <div className="grid grid-cols-3 gap-1.5">
            {(['windows', 'macos', 'linux'] as OperatingSystem[]).map((os) => (
              <button
                key={os}
                type="button"
                id={`btn-os-${os}`}
                onClick={() =>
                  onChange({
                    ...specs,
                    os,
                    isUnifiedMemory: os === 'macos' ? specs.isUnifiedMemory : false,
                  })
                }
                className={`py-2 px-2 text-xs font-medium rounded-lg capitalize border transition-all ${
                  specs.os === os
                    ? 'bg-blue-600 text-white border-blue-500 font-semibold shadow-md shadow-blue-900/20'
                    : 'bg-[#09090b] text-slate-400 border-white/10 hover:bg-white/5 hover:text-slate-200'
                }`}
              >
                {os === 'macos' ? 'macOS' : os}
              </button>
            ))}
          </div>

          {/* Unified Memory checkbox */}
          {specs.os === 'macos' && (
            <label className="flex items-center gap-2 pt-1 text-xs text-slate-300 cursor-pointer">
              <input
                type="checkbox"
                checked={specs.isUnifiedMemory ?? true}
                onChange={(e) => onChange({ ...specs, isUnifiedMemory: e.target.checked })}
                className="rounded border-white/10 bg-black/40 text-blue-600 focus:ring-blue-500"
              />
              <span>Apple Silicon Unified Memory (M1/M2/M3/M4)</span>
            </label>
          )}
        </div>
      </div>

      {/* Target Working Context Length */}
      <div className="mt-6 pt-5 border-t border-white/5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2.5">
          <div>
            <label className="text-xs font-semibold text-slate-200 flex items-center gap-1.5">
              <span>Target Working Context Length:</span>
              <span className="font-mono text-green-400 font-bold">
                {specs.targetContext} tokens (~{Math.round(specs.targetContext / 1024)}k)
              </span>
            </label>
            <p className="text-[11px] text-slate-500">
              Higher context increases KV cache RAM/VRAM usage proportionally during execution.
            </p>
          </div>

          {/* Context preset buttons */}
          <div className="flex items-center gap-1">
            {([4096, 8192, 16384, 32768, 65536] as ContextLength[]).map((ctx) => (
              <button
                key={ctx}
                type="button"
                onClick={() => handleContextChange(ctx)}
                className={`px-2.5 py-1 rounded text-xs font-mono transition-colors ${
                  specs.targetContext === ctx
                    ? 'bg-green-500 text-black font-bold shadow-xs'
                    : 'bg-white/5 text-slate-400 hover:bg-white/10 hover:text-slate-200 border border-white/5'
                }`}
              >
                {Math.round(ctx / 1024)}K
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Desired Use Case Selection */}
      <div className="mt-5 pt-5 border-t border-white/5">
        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block mb-2">
          Desired Use Case
        </span>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2">
          {USE_CASES.map((u) => {
            const isSelected = specs.useCase === u.id;
            return (
              <button
                key={u.id}
                type="button"
                id={`btn-usecase-${u.id}`}
                onClick={() => onChange({ ...specs, useCase: u.id })}
                className={`p-2.5 rounded-lg text-left border transition-all ${
                  isSelected
                    ? 'bg-blue-600/10 text-white border-blue-500/40 shadow-xs'
                    : 'bg-[#09090b]/60 text-slate-300 border-white/5 hover:border-white/15 hover:bg-[#09090b]'
                }`}
              >
                <div className="flex items-center gap-1.5 text-xs font-semibold truncate">
                  <span>{u.icon}</span>
                  <span className="truncate">{u.label}</span>
                </div>
                <p
                  className={`text-[10px] mt-1 line-clamp-1 ${
                    isSelected ? 'text-blue-300' : 'text-slate-500'
                  }`}
                >
                  {u.desc}
                </p>
              </button>
            );
          })}
        </div>
      </div>

      {/* Analyze CTA */}
      <div className="mt-6 pt-5 border-t border-white/5 flex flex-col sm:flex-row items-center justify-between gap-3">
        <p className="text-[11px] text-slate-500 italic text-center sm:text-left">
          Predictions based on deterministic FP16/GGUF quantization variants & KV Cache math.
        </p>

        <button
          id="btn-analyze-hardware"
          type="button"
          onClick={onAnalyze}
          disabled={isAnalyzing}
          className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg font-medium text-sm transition-colors shadow-lg shadow-blue-900/20 active:scale-98"
        >
          <Cpu className="w-4 h-4" />
          <span>{isAnalyzing ? 'Calculating Compatibility...' : 'Analyze Hardware'}</span>
        </button>
      </div>
    </div>
  );
};

