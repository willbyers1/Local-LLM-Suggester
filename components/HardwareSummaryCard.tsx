'use client';

import React from 'react';
import { HardwareAnalysisSummary } from '@/types/model';
import { HardwareSpecs } from '@/types/hardware';
import { Cpu, HardDrive, Monitor, Zap, AlertTriangle, ArrowDown, Sparkles } from 'lucide-react';

interface HardwareSummaryCardProps {
  summary: HardwareAnalysisSummary;
  specs: HardwareSpecs;
  onAskAI: () => void;
  onScrollToModels: () => void;
}

export const HardwareSummaryCard: React.FC<HardwareSummaryCardProps> = ({
  summary,
  specs,
  onAskAI,
  onScrollToModels,
}) => {
  return (
    <div className="bg-[#18181b] border border-white/10 rounded-xl p-5 sm:p-6 shadow-xl">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-5 border-b border-white/5">
        <div>
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">
            Deterministic Engine
          </span>
          <h2 className="text-lg font-semibold text-white tracking-tight mt-0.5">
            System Memory & Local LLM Capability Breakdown
          </h2>
        </div>

        <div className="flex items-center gap-2">
          <button
            id="btn-trigger-ai-recommendation"
            onClick={onAskAI}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-semibold bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-900/20 transition-colors"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Generate AI Recommendation</span>
          </button>
        </div>
      </div>

      {/* Hardware Specs Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 my-5">
        {/* GPU & VRAM */}
        <div className="p-4 rounded-lg bg-black/40 border border-white/5 space-y-1">
          <div className="flex items-center gap-1.5 text-slate-400 text-xs">
            <Zap className="w-3.5 h-3.5 text-green-400" />
            <span className="text-[11px] font-medium">GPU & VRAM</span>
          </div>
          <div className="mt-1 font-bold text-sm text-white truncate font-mono">
            {summary.gpuName || 'Integrated GPU'}
          </div>
          <div className="mt-1 flex items-baseline gap-1.5 font-mono text-xs">
            <span className="font-semibold text-green-400">
              {summary.usableVRAMGB} GB Usable
            </span>
            <span className="text-slate-500 text-[10px]">({summary.totalVRAMGB}G total)</span>
          </div>
        </div>

        {/* RAM */}
        <div className="p-4 rounded-lg bg-black/40 border border-white/5 space-y-1">
          <div className="flex items-center gap-1.5 text-slate-400 text-xs">
            <Cpu className="w-3.5 h-3.5 text-blue-400" />
            <span className="text-[11px] font-medium">System RAM</span>
          </div>
          <div className="mt-1 font-bold text-sm text-white truncate font-mono">
            {summary.totalRAMGB} GB Memory
          </div>
          <div className="mt-1 flex items-baseline gap-1.5 font-mono text-xs">
            <span className="font-semibold text-blue-400">
              ~{summary.usableRAMGB} GB Usable
            </span>
            <span className="text-slate-500 text-[10px]">(OS Buffer: ~3.5G)</span>
          </div>
        </div>

        {/* CPU */}
        <div className="p-4 rounded-lg bg-black/40 border border-white/5 space-y-1">
          <div className="flex items-center gap-1.5 text-slate-400 text-xs">
            <Monitor className="w-3.5 h-3.5 text-purple-400" />
            <span className="text-[11px] font-medium">Processor & OS</span>
          </div>
          <div className="mt-1 font-bold text-sm text-white truncate">
            {summary.cpuName}
          </div>
          <div className="mt-1 text-xs text-slate-400 capitalize">
            {summary.os} &middot; {summary.isUnifiedMemory ? 'Unified Memory' : 'Discrete Bus'}
          </div>
        </div>

        {/* Storage */}
        <div className="p-4 rounded-lg bg-black/40 border border-white/5 space-y-1">
          <div className="flex items-center gap-1.5 text-slate-400 text-xs">
            <HardDrive className="w-3.5 h-3.5 text-amber-400" />
            <span className="text-[11px] font-medium">SSD Headroom</span>
          </div>
          <div className="mt-1 font-bold text-sm text-white font-mono">
            {summary.availableDiskGB} GB Available
          </div>
          <div className="mt-1 text-[11px] text-slate-400">
            Context: {Math.round(specs.targetContext / 1024)}k tokens
          </div>
        </div>
      </div>

      {/* Bottleneck Warning */}
      {summary.bottleneckNotice && (
        <div className="mb-5 p-3.5 rounded-lg bg-amber-500/10 border border-amber-500/20 text-xs text-amber-300 flex items-start gap-2.5">
          <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
          <div>
            <span className="font-semibold text-amber-200">Hardware Consideration: </span>
            {summary.bottleneckNotice}
          </div>
        </div>
      )}

      {/* Tier Capabilities Breakdown */}
      <div>
        <div className="flex items-center justify-between mb-2.5">
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">
            Estimated Local LLM Tier Capability
          </span>
          <button
            onClick={onScrollToModels}
            className="text-xs text-slate-400 hover:text-white inline-flex items-center gap-1 font-medium transition-colors"
          >
            <span>View all candidate models</span>
            <ArrowDown className="w-3 h-3" />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-2.5">
          {summary.tierCapabilities.map((tier) => {
            const statusConfig = {
              excellent: {
                border: 'border-green-500/20 bg-green-500/5',
                text: 'text-green-400 font-bold',
                label: '🟢 EXCELLENT',
              },
              good: {
                border: 'border-blue-500/20 bg-blue-500/5',
                text: 'text-blue-400 font-bold',
                label: '🔵 GOOD FIT',
              },
              possible: {
                border: 'border-amber-500/20 bg-amber-500/5',
                text: 'text-amber-400 font-bold',
                label: '🟡 POSSIBLE',
              },
              not_recommended: {
                border: 'border-rose-500/20 bg-rose-500/5',
                text: 'text-rose-400 font-bold',
                label: '🔴 NOT RECOMMENDED',
              },
            }[tier.status];

            return (
              <div
                key={tier.tier}
                className={`p-3.5 rounded-lg border ${statusConfig.border} flex flex-col justify-between`}
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-white">
                      {tier.tier}
                    </span>
                  </div>
                  <div className="text-[11px] font-mono text-slate-400 mt-0.5">{tier.range}</div>
                  <div className={`text-[10px] mt-2 ${statusConfig.text}`}>
                    {statusConfig.label}
                  </div>
                </div>
                <p className="text-[10px] text-slate-400 mt-2 line-clamp-2 leading-relaxed">
                  {tier.note}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
