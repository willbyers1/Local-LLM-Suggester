'use client';

import React from 'react';
import { HardwareSpecs } from '@/types/hardware';
import { HARDWARE_PRESETS } from '@/lib/compatibility/presets';
import { X, Sparkles, Cpu, Zap, Check } from 'lucide-react';

interface PresetsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectPreset: (specs: HardwareSpecs) => void;
  currentSpecs: HardwareSpecs;
}

export const PresetsModal: React.FC<PresetsModalProps> = ({
  isOpen,
  onClose,
  onSelectPreset,
  currentSpecs,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs overflow-y-auto">
      <div className="bg-[#18181b] border border-white/10 rounded-2xl w-full max-w-3xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="p-5 border-b border-white/5 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-blue-600/20 text-blue-400 flex items-center justify-center">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-white">
                Hardware Benchmarks & Common Machine Presets
              </h2>
              <p className="text-xs text-slate-400">
                Instantly simulate popular consumer GPUs, laptops, and workstations
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/5 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Preset Cards Grid */}
        <div className="p-5 overflow-y-auto grid grid-cols-1 md:grid-cols-2 gap-3.5 flex-1">
          {HARDWARE_PRESETS.map((preset) => {
            const isMatch =
              currentSpecs.gpuName === preset.specs.gpuName &&
              currentSpecs.vramGB === preset.specs.vramGB &&
              currentSpecs.ramGB === preset.specs.ramGB;

            return (
              <button
                key={preset.id}
                type="button"
                onClick={() => {
                  onSelectPreset(preset.specs);
                  onClose();
                }}
                className={`p-4 rounded-xl border text-left transition-all flex flex-col justify-between ${
                  isMatch
                    ? 'bg-blue-600/10 border-blue-500 shadow-sm'
                    : 'bg-black/40 border-white/5 hover:border-white/15 hover:bg-black/60'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-sm font-semibold text-white">
                      {preset.name}
                    </span>
                    {isMatch && (
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-blue-600 text-white font-bold flex items-center gap-1">
                        <Check className="w-3 h-3" /> Active
                      </span>
                    )}
                  </div>

                  <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                    {preset.description}
                  </p>
                </div>

                <div className="mt-4 pt-3 border-t border-white/5 flex items-center justify-between text-[11px] font-mono text-slate-400">
                  <div className="flex items-center gap-1">
                    <Zap className="w-3 h-3 text-green-400" />
                    <span>{preset.specs.vramGB}GB VRAM</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Cpu className="w-3 h-3 text-blue-400" />
                    <span>{preset.specs.ramGB}GB RAM</span>
                  </div>
                  <div className="capitalize text-slate-400">
                    {preset.specs.os}
                  </div>
                </div>
              </button>
            );
          })}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-white/5 bg-black/40 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg text-xs font-semibold bg-white/5 hover:bg-white/10 text-slate-300 transition-colors border border-white/10"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
