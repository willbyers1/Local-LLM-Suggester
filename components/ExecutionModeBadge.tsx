import React from 'react';
import { ExecutionMode } from '@/types/model';
import { Cpu, Zap, Layers, Apple } from 'lucide-react';

interface ExecutionModeBadgeProps {
  mode: ExecutionMode;
}

export const ExecutionModeBadge: React.FC<ExecutionModeBadgeProps> = ({ mode }) => {
  switch (mode) {
    case 'full_gpu':
      return (
        <span
          id="badge-mode-full-gpu"
          className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-medium bg-green-500/10 text-green-400 border border-green-500/20"
        >
          <Zap className="w-3 h-3 text-green-400" />
          <span>Full GPU (Fast)</span>
        </span>
      );
    case 'partial_gpu':
      return (
        <span
          id="badge-mode-partial-gpu"
          className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-medium bg-amber-500/10 text-amber-300 border border-amber-500/20"
        >
          <Layers className="w-3 h-3 text-amber-400" />
          <span>Partial GPU (Offload)</span>
        </span>
      );
    case 'cpu_only':
      return (
        <span
          id="badge-mode-cpu-only"
          className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-medium bg-white/5 text-slate-300 border border-white/10"
        >
          <Cpu className="w-3 h-3 text-slate-400" />
          <span>CPU Only</span>
        </span>
      );
    case 'unified_memory':
      return (
        <span
          id="badge-mode-unified"
          className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-medium bg-purple-500/10 text-purple-300 border border-purple-500/20"
        >
          <Apple className="w-3 h-3 text-purple-400" />
          <span>Unified Memory</span>
        </span>
      );
  }
};
