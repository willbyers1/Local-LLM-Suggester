'use client';

import React from 'react';
import { Cpu, Key, GitCompare, HelpCircle, Sparkles, Sliders } from 'lucide-react';
import { ValidatedBYOKConfig } from '@/lib/validation/schemas';

interface NavbarProps {
  onOpenBYOK: () => void;
  onOpenPresets: () => void;
  onOpenCompare: () => void;
  onOpenAbout: () => void;
  selectedCompareCount: number;
  byokConfig: ValidatedBYOKConfig;
}

export const Navbar: React.FC<NavbarProps> = ({
  onOpenBYOK,
  onOpenPresets,
  onOpenCompare,
  onOpenAbout,
  selectedCompareCount,
  byokConfig,
}) => {
  const getProviderLabel = () => {
    if (byokConfig.provider === 'gemini') {
      return byokConfig.apiKey ? 'BYOK: Gemini Configured' : 'Gemini 3.7 Server';
    }
    if (byokConfig.provider === 'openai') return 'BYOK: OpenAI Configured';
    if (byokConfig.provider === 'anthropic') return 'BYOK: Anthropic Configured';
    return 'BYOK: Custom Endpoint';
  };

  const isByokConfigured = byokConfig.provider !== 'gemini' || !!byokConfig.apiKey;

  return (
    <header className="sticky top-0 z-30 w-full h-16 border-b border-white/10 bg-[#09090b]/90 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full flex items-center justify-between">
        {/* Brand */}
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-blue-600 rounded flex items-center justify-center font-bold text-white shadow-md shadow-blue-900/30">
            LA
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-semibold tracking-tight text-white">
                Local LLM <span className="text-blue-500">Advisor</span>
              </h1>
              <span className="text-[10px] font-mono font-medium px-2 py-0.5 rounded bg-white/5 text-slate-400 border border-white/10">
                PRO HARDWARE ENGINE
              </span>
            </div>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-3">
          {/* Quick Presets */}
          <button
            id="nav-btn-presets"
            onClick={onOpenPresets}
            className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded bg-[#18181b] hover:bg-white/5 border border-white/10 text-xs font-medium text-slate-300 transition-colors"
          >
            <Sparkles className="w-3.5 h-3.5 text-blue-400" />
            <span>Hardware Presets</span>
          </button>

          {/* Model Compare Button */}
          <button
            id="nav-btn-compare"
            onClick={onOpenCompare}
            disabled={selectedCompareCount === 0}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-medium border transition-colors ${
              selectedCompareCount > 0
                ? 'bg-blue-600 hover:bg-blue-500 text-white border-transparent shadow-md shadow-blue-900/30 font-semibold'
                : 'text-slate-500 border-white/10 bg-[#18181b]/50 cursor-not-allowed opacity-50'
            }`}
          >
            <GitCompare className="w-3.5 h-3.5" />
            <span>Compare</span>
            {selectedCompareCount > 0 && (
              <span className="ml-1 px-1.5 py-0.2 rounded-full text-[10px] font-mono bg-white text-blue-900 font-bold">
                {selectedCompareCount}
              </span>
            )}
          </button>

          {/* BYOK Status Pill */}
          <button
            id="nav-btn-byok"
            onClick={onOpenBYOK}
            className={`inline-flex items-center gap-2 text-xs font-medium px-3 py-1.5 rounded-full border transition-all ${
              isByokConfigured
                ? 'bg-green-500/10 text-green-400 border-green-500/20 hover:bg-green-500/20'
                : 'bg-blue-500/10 text-blue-400 border-blue-500/20 hover:bg-blue-500/20'
            }`}
          >
            <span
              className={`w-2 h-2 rounded-full ${
                isByokConfigured ? 'bg-green-500 animate-pulse' : 'bg-blue-500'
              }`}
            />
            <span className="hidden sm:inline">{getProviderLabel()}</span>
            <span className="sm:hidden font-mono">BYOK</span>
          </button>

          {/* Settings / Help */}
          <button
            id="nav-btn-about"
            onClick={onOpenAbout}
            title="How memory estimation works"
            className="p-2 rounded text-slate-400 hover:text-white hover:bg-white/5 border border-transparent hover:border-white/10 transition-colors"
          >
            <HelpCircle className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
};

