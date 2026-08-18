'use client';

import React from 'react';
import { X, HelpCircle, HardDrive, Cpu, Zap, ShieldCheck } from 'lucide-react';

interface AboutModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AboutModal: React.FC<AboutModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs overflow-y-auto">
      <div className="bg-[#18181b] border border-white/10 rounded-2xl w-full max-w-2xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="p-5 border-b border-white/5 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-blue-600/20 text-blue-400 flex items-center justify-center">
              <HelpCircle className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-white">
                How Local LLM Memory Estimation Works
              </h2>
              <p className="text-xs text-slate-400">
                Understanding the mathematical models behind our VRAM calculations
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

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-5 flex-1 text-xs sm:text-sm text-slate-300 leading-relaxed">
          <div className="p-4 rounded-xl bg-black/40 border border-white/5 space-y-2">
            <h3 className="font-bold text-white text-sm flex items-center gap-2">
              <Zap className="w-4 h-4 text-green-400" />
              <span>1. Total Required Memory Equation</span>
            </h3>
            <p className="text-xs text-slate-400 font-mono p-2.5 rounded bg-[#09090b] border border-white/5 text-slate-200">
              Total Memory = (Weights Memory) + (KV Cache Memory) + (Runtime & CUDA Overhead)
            </p>
            <ul className="space-y-1.5 text-xs text-slate-400 pt-1">
              <li>
                <strong className="text-slate-200">Weights Memory:</strong> Model Parameters (Billion) × (Quant Bits / 8) × 1.15 metadata expansion.
              </li>
              <li>
                <strong className="text-slate-200">KV Cache Memory:</strong> 2 × Layers × Heads × HeadDim × BytesPerParam × Context Length. (e.g. 32k context uses ~2GB–4GB additional memory).
              </li>
              <li>
                <strong className="text-slate-200">CUDA / OS Overhead:</strong> ~0.6 GB – 1.0 GB reserved for GPU buffers, CUDA context, and context activations.
              </li>
            </ul>
          </div>

          <div className="p-4 rounded-xl bg-black/40 border border-white/5 space-y-2">
            <h3 className="font-bold text-white text-sm flex items-center gap-2">
              <Cpu className="w-4 h-4 text-blue-400" />
              <span>2. Quantization Trade-offs</span>
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-1 text-xs">
              <div className="p-2.5 rounded bg-[#09090b] border border-white/5">
                <span className="font-bold text-green-400">Q4_K_M (4-bit)</span>
                <p className="text-[11px] text-slate-400 mt-1">Sweet spot. 99% human-perceived quality retention with ~50% VRAM reduction.</p>
              </div>
              <div className="p-2.5 rounded bg-[#09090b] border border-white/5">
                <span className="font-bold text-blue-400">Q8_0 (8-bit)</span>
                <p className="text-[11px] text-slate-400 mt-1">Near-zero loss vs FP16. Ideal when you have surplus VRAM.</p>
              </div>
              <div className="p-2.5 rounded bg-[#09090b] border border-white/5">
                <span className="font-bold text-purple-400">FP16 (16-bit)</span>
                <p className="text-[11px] text-slate-400 mt-1">Full uncompressed precision. Requires double the memory of Q4.</p>
              </div>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-black/40 border border-white/5 space-y-2">
            <h3 className="font-bold text-white text-sm flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-purple-400" />
              <span>3. Bring Your Own Key (BYOK) Security</span>
            </h3>
            <p className="text-xs text-slate-400">
              When using the AI Advisor feature, all your API keys (Gemini, OpenAI, Anthropic, or Groq) are stored only in your active browser memory session. They are never written to any persistent external database or shared with third parties.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-white/5 bg-black/40 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg text-xs font-semibold bg-blue-600 hover:bg-blue-500 text-white transition-colors shadow-lg shadow-blue-900/20"
          >
            Got It
          </button>
        </div>
      </div>
    </div>
  );
};
