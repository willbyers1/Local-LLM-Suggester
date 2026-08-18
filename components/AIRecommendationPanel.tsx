'use client';

import React, { useState } from 'react';
import { AIRecommendationResponse } from '@/types/model';
import { ValidatedBYOKConfig } from '@/lib/validation/schemas';
import {
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  Sliders,
  Layers,
  Cpu,
  Terminal,
  Key,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';

interface AIRecommendationPanelProps {
  recommendation: AIRecommendationResponse | null;
  isLoading: boolean;
  error: string | null;
  onRefresh: () => void;
  onOpenBYOK: () => void;
  byokConfig: ValidatedBYOKConfig;
}

export const AIRecommendationPanel: React.FC<AIRecommendationPanelProps> = ({
  recommendation,
  isLoading,
  error,
  onRefresh,
  onOpenBYOK,
  byokConfig,
}) => {
  const [showJson, setShowJson] = useState(false);

  const getProviderTitle = () => {
    if (byokConfig.provider === 'gemini') {
      return byokConfig.apiKey ? 'Gemini 3.7 Flash (BYOK)' : 'Gemini 3.7 Flash (Server API)';
    }
    if (byokConfig.provider === 'openai') return `OpenAI ${byokConfig.model || 'GPT-4o Mini'} (BYOK)`;
    if (byokConfig.provider === 'anthropic') return `Anthropic ${byokConfig.model || 'Claude 3.5 Haiku'} (BYOK)`;
    return `OpenAI-Compatible Custom Endpoint (BYOK)`;
  };

  return (
    <div
      id="ai-recommendation-section"
      className="bg-[#18181b] border border-white/10 rounded-xl p-5 sm:p-6 shadow-xl"
    >
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-5 border-b border-white/5">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-bold text-blue-400 uppercase tracking-widest">
              Neural Hardware Advisor
            </span>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-white/5 text-slate-400 border border-white/10">
              {getProviderTitle()}
            </span>
          </div>
          <h2 className="text-lg font-semibold text-white tracking-tight mt-0.5 flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-blue-400" />
            <span>Intelligent Local LLM Recommendations</span>
          </h2>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onOpenBYOK}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-slate-300 hover:bg-white/5 border border-white/10 transition-colors"
          >
            <Key className="w-3.5 h-3.5 text-slate-400" />
            <span>BYOK Settings</span>
          </button>

          <button
            type="button"
            onClick={onRefresh}
            disabled={isLoading}
            className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-xs font-semibold bg-blue-600 hover:bg-blue-500 text-white transition-colors disabled:opacity-50 shadow-md shadow-blue-900/20"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
            <span>{isLoading ? 'Analyzing...' : 'Re-Run Advice'}</span>
          </button>
        </div>
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className="py-12 flex flex-col items-center justify-center text-center space-y-3">
          <div className="w-8 h-8 rounded-full border-2 border-blue-500 border-t-transparent animate-spin" />
          <p className="text-sm font-semibold text-white">
            Synthesizing Hardware Constraints & LLM Memory Models...
          </p>
          <p className="text-xs text-slate-400 max-w-md">
            Querying provider to match your VRAM, RAM, and context parameters against verified open weights.
          </p>
        </div>
      )}

      {/* Error State */}
      {error && !isLoading && (
        <div className="my-5 p-4 rounded-xl bg-rose-950/30 border border-rose-800/40 text-xs text-rose-300 space-y-2">
          <div className="flex items-center gap-2 font-bold text-sm">
            <AlertTriangle className="w-4 h-4 text-rose-400" />
            <span>Unable to retrieve AI recommendation</span>
          </div>
          <p className="leading-relaxed text-slate-300">{error}</p>
          <div className="pt-2 flex items-center gap-3">
            <button
              onClick={onOpenBYOK}
              className="px-3 py-1.5 rounded-lg bg-rose-600 text-white font-semibold hover:bg-rose-500 transition-colors text-xs"
            >
              Configure BYOK API Key
            </button>
            <button
              onClick={onRefresh}
              className="px-3 py-1.5 rounded-lg border border-rose-700 font-semibold hover:bg-rose-900/40 transition-colors text-xs text-rose-300"
            >
              Retry
            </button>
          </div>
        </div>
      )}

      {/* Loaded Recommendation Content */}
      {recommendation && !isLoading && (
        <div className="mt-5 space-y-5">
          {/* Executive Summary */}
          <div className="p-4 rounded-xl bg-black/40 border border-white/5 text-xs sm:text-sm text-slate-300 leading-relaxed font-medium">
            <span className="font-bold text-white">Summary: </span>
            {recommendation.summary}
          </div>

          {/* Top Recommendation Box */}
          <div className="p-5 rounded-xl border border-green-500/30 bg-green-500/5 relative overflow-hidden">
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
              <div>
                <span className="inline-flex items-center gap-1 text-[10px] font-bold text-green-400 uppercase tracking-widest">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>#1 Best Hardware Fit</span>
                </span>
                <h3 className="text-lg font-bold text-white tracking-tight mt-1">
                  {recommendation.topRecommendation.modelName}
                </h3>
              </div>

              <div className="flex flex-wrap items-center gap-1.5">
                <span className="px-2.5 py-1 rounded text-xs font-mono font-semibold bg-green-500/10 text-green-400 border border-green-500/20">
                  {recommendation.topRecommendation.suggestedQuantization}
                </span>
                <span className="px-2.5 py-1 rounded text-xs font-mono font-medium bg-black/40 text-slate-300 border border-white/10">
                  Context: {recommendation.topRecommendation.suggestedContext}
                </span>
              </div>
            </div>

            <p className="text-xs sm:text-sm text-slate-300 mt-3 leading-relaxed">
              {recommendation.topRecommendation.reason}
            </p>

            {/* Strengths */}
            <div className="mt-4 pt-3 border-t border-green-500/20">
              <span className="text-xs font-bold text-white">
                Key Strengths for Your Workflow:
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 mt-2">
                {recommendation.topRecommendation.strengths.map((str, i) => (
                  <div
                    key={i}
                    className="p-2.5 rounded-lg bg-black/40 border border-green-500/20 text-xs text-slate-300 flex items-start gap-1.5"
                  >
                    <span className="text-green-400 font-bold">•</span>
                    <span>{str}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Alternatives Grid */}
          <div>
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block mb-2.5">
              Viable Alternatives
            </span>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {recommendation.alternatives.map((alt, idx) => (
                <div
                  key={idx}
                  className="p-4 rounded-xl bg-black/40 border border-white/5 flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-xs font-bold text-white">
                        {alt.modelName}
                      </span>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-white/5 text-slate-300 font-medium border border-white/10">
                        {alt.suggestedQuantization}
                      </span>
                    </div>
                    <span className="text-[11px] font-semibold text-blue-400 block mt-0.5">
                      Role: {alt.role}
                    </span>
                    <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                      {alt.reason}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Trade-offs & Practical Advice Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
            {/* CPU Offload & Runtime Advice */}
            <div className="p-4 rounded-xl bg-black/40 border border-white/5 space-y-3">
              <div>
                <div className="flex items-center gap-1.5 text-xs font-bold text-white">
                  <Cpu className="w-3.5 h-3.5 text-blue-400" />
                  <span>Execution & Offload Advice</span>
                </div>
                <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                  {recommendation.cpuOffloadAdvice}
                </p>
              </div>

              <div className="pt-2 border-t border-white/5">
                <div className="flex items-center gap-1.5 text-xs font-bold text-white">
                  <Terminal className="w-3.5 h-3.5 text-slate-400" />
                  <span>Recommended Local Runtime</span>
                </div>
                <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                  {recommendation.runtimeAdvice}
                </p>
              </div>
            </div>

            {/* Warnings & Trade-offs */}
            <div className="p-4 rounded-xl bg-amber-500/5 border border-amber-500/20 space-y-3">
              <div>
                <div className="flex items-center gap-1.5 text-xs font-bold text-amber-300">
                  <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
                  <span>Hardware Constraints & Trade-Offs</span>
                </div>
                <ul className="mt-1 space-y-1 text-xs text-amber-200">
                  {recommendation.tradeOffs.map((to, i) => (
                    <li key={i} className="flex items-start gap-1.5">
                      <span className="text-amber-400 font-bold">•</span>
                      <span>{to}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {recommendation.warnings.length > 0 && (
                <div className="pt-2 border-t border-amber-500/20">
                  <span className="text-[10px] font-bold text-amber-300 block uppercase tracking-wider">
                    Operational Note:
                  </span>
                  <p className="text-xs text-amber-200 mt-0.5">
                    {recommendation.warnings[0]}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Dev JSON Inspector Toggle */}
          <div className="pt-3 border-t border-white/5">
            <button
              onClick={() => setShowJson(!showJson)}
              className="text-xs text-slate-500 hover:text-slate-300 inline-flex items-center gap-1 transition-colors"
            >
              <span>{showJson ? 'Hide' : 'View'} Raw Structured JSON</span>
              {showJson ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            </button>

            {showJson && (
              <pre className="mt-2 p-3 rounded-lg bg-black text-slate-300 text-[11px] font-mono overflow-x-auto border border-white/10">
                {JSON.stringify(recommendation, null, 2)}
              </pre>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
