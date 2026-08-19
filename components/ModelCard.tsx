'use client';

import React, { useState } from 'react';
import { ModelMetadata, QuantizationType, CompatibilityEvaluation } from '@/types/model';
import { HardwareSpecs } from '@/types/hardware';
import { evaluateModelCompatibility } from '@/lib/compatibility/engine';
import { CompatibilityBadge } from './CompatibilityBadge';
import { ExecutionModeBadge } from './ExecutionModeBadge';
import {
  ExternalLink,
  Copy,
  Check,
  HardDrive,
  Cpu,
  Zap,
  Eye,
  AlertTriangle,
  Terminal,
  Layers,
} from 'lucide-react';

interface ModelCardProps {
  model: ModelMetadata;
  specs: HardwareSpecs;
  isSelectedForCompare: boolean;
  onToggleCompare: (modelId: string) => void;
  onOpenRuntimeGuide: (model: ModelMetadata) => void;
}

export const ModelCard: React.FC<ModelCardProps> = ({
  model,
  specs,
  isSelectedForCompare,
  onToggleCompare,
  onOpenRuntimeGuide,
}) => {
  const [selectedQuant, setSelectedQuant] = useState<QuantizationType>(model.defaultQuantization);
  const [copiedCmd, setCopiedCmd] = useState(false);

  // Evaluate dynamically based on selected quantization and current specs
  const evaluation: CompatibilityEvaluation = evaluateModelCompatibility(
    model,
    selectedQuant,
    specs,
    specs.targetContext
  );

  const { memoryBreakdown, rating, score, executionMode, headlineExplanation, technicalDetails, warnings } =
    evaluation;

  const quantDetails = model.quantizations[selectedQuant] || model.quantizations[model.defaultQuantization];

  const handleCopyOllama = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (model.ollamaTag) {
      navigator.clipboard.writeText(`ollama run ${model.ollamaTag}`);
      setCopiedCmd(true);
      setTimeout(() => setCopiedCmd(false), 2000);
    }
  };

  // Calculate percentage of VRAM used (or cap at 100)
  const isUnified = specs.isUnifiedMemory ?? false;
  const targetMemoryBudget = isUnified ? memoryBreakdown.usableVRAMGB : specs.vramGB;
  const memoryUtilizationPercent = targetMemoryBudget > 0
    ? Math.min(100, Math.round((memoryBreakdown.totalRequiredGB / targetMemoryBudget) * 100))
    : 100;

  return (
    <div
      id={`model-card-${model.id}`}
      className={`rounded-xl border transition-all flex flex-col justify-between bg-[#18181b] ${
        isSelectedForCompare
          ? 'border-blue-500 ring-2 ring-blue-500/20 shadow-xl shadow-blue-950/30'
          : 'border-white/10 hover:border-white/20 shadow-lg'
      }`}
    >
      {/* Top Card Body */}
      <div className="p-5">
        {/* Top Header: Family, Parameters, Vision, Compare Toggle */}
        <div className="flex items-start justify-between gap-3">
          <div>
            <div className="flex flex-wrap items-center gap-1.5 mb-1.5">
              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-white/5 text-slate-300 uppercase tracking-widest border border-white/5">
                {model.family}
              </span>
              <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded bg-white/5 text-slate-400 border border-white/5">
                {model.parametersB}B Params
              </span>
              {model.isMoE && (
                <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded bg-purple-500/10 text-purple-300 border border-purple-500/20">
                  MoE ({model.activeParametersB}B active)
                </span>
              )}
              {model.hasVision && (
                <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded bg-indigo-500/10 text-indigo-300 border border-indigo-500/20 flex items-center gap-1">
                  <Eye className="w-3 h-3" />
                  <span>Vision</span>
                </span>
              )}
            </div>

            <h3 className="text-base font-semibold text-white tracking-tight">
              {model.name}
            </h3>
            <p className="text-xs text-slate-400 mt-0.5 line-clamp-1">
              {model.tagline}
            </p>
          </div>

          {/* Compare Checkbox */}
          <button
            type="button"
            onClick={() => onToggleCompare(model.id)}
            title="Add to side-by-side comparison"
            className={`shrink-0 flex items-center gap-1 px-2.5 py-1 rounded text-xs font-medium border transition-colors ${
              isSelectedForCompare
                ? 'bg-blue-600 text-white border-blue-500 font-semibold'
                : 'text-slate-400 border-white/10 hover:bg-white/5 hover:text-white'
            }`}
          >
            {isSelectedForCompare && <Check className="w-3.5 h-3.5" />}
            <span>Compare</span>
          </button>
        </div>

        {/* Compatibility & Execution Badges */}
        <div className="flex flex-wrap items-center gap-2 mt-4 pt-3 border-t border-white/5">
          <CompatibilityBadge rating={rating} score={score} showScore={true} />
          <ExecutionModeBadge mode={executionMode} />
        </div>

        {/* Headline Explanation */}
        <p className="text-xs text-slate-300 mt-2.5 leading-relaxed font-medium">
          {headlineExplanation}
        </p>

        {/* Quantization Picker */}
        <div className="mt-4 p-3 rounded-lg bg-black/40 border border-white/5">
          <div className="flex items-center justify-between text-xs mb-2">
            <span className="font-semibold text-slate-300 flex items-center gap-1">
              <Layers className="w-3 h-3 text-slate-400" />
              <span>Quantization:</span>
            </span>
            <span className="font-mono text-[11px] text-slate-400">
              {quantDetails.downloadSizeGB} GB Download
            </span>
          </div>
          <div className="flex flex-wrap gap-1">
            {(Object.keys(model.quantizations) as QuantizationType[]).map((qKey) => (
              <button
                key={qKey}
                type="button"
                onClick={() => setSelectedQuant(qKey)}
                className={`px-2 py-1 rounded text-[11px] font-mono transition-colors ${
                  selectedQuant === qKey
                    ? 'bg-blue-600 text-white font-bold'
                    : 'bg-[#18181b] text-slate-400 border border-white/10 hover:bg-white/5 hover:text-slate-200'
                }`}
              >
                {qKey.replace('_', ' ')}
              </button>
            ))}
          </div>
        </div>

        {/* Memory Footprint Breakdown */}
        <div className="mt-3.5 space-y-1.5">
          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-400">Estimated Total Memory Req:</span>
            <span className="font-mono font-bold text-white">
              ~{memoryBreakdown.totalRequiredGB} GB
            </span>
          </div>

          <div className="grid grid-cols-3 gap-1 text-[11px] font-mono text-slate-400">
            <div className="p-1.5 rounded bg-black/40 border border-white/5 text-center">
              <span className="text-slate-500">Weights: </span>
              <span className="font-semibold text-slate-200">
                {memoryBreakdown.modelWeightsGB}G
              </span>
            </div>
            <div className="p-1.5 rounded bg-black/40 border border-white/5 text-center">
              <span className="text-slate-500">KV ({Math.round(evaluation.targetContext / 1024)}k): </span>
              <span className="font-semibold text-slate-200">
                {memoryBreakdown.kvCacheGB}G
              </span>
            </div>
            <div className="p-1.5 rounded bg-black/40 border border-white/5 text-center">
              <span className="text-slate-500">Runtime: </span>
              <span className="font-semibold text-slate-200">
                {memoryBreakdown.runtimeOverheadGB}G
              </span>
            </div>
          </div>

          {/* VRAM vs Hardware progress bar */}
          <div className="pt-1">
            <div className="h-1.5 w-full rounded-full bg-white/5 overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-300 ${
                  rating === 'excellent'
                    ? 'bg-green-500'
                    : rating === 'good'
                    ? 'bg-blue-500'
                    : rating === 'possible'
                    ? 'bg-amber-500'
                    : 'bg-rose-500'
                }`}
                style={{ width: `${Math.min(100, memoryUtilizationPercent)}%` }}
              />
            </div>
          </div>
        </div>

        {/* Technical Details & Warnings */}
        <div className="mt-3.5 space-y-1">
          {technicalDetails.slice(0, 2).map((detail, idx) => (
            <div key={idx} className="text-[11px] text-slate-400 flex items-start gap-1.5">
              <span className="text-slate-600">•</span>
              <span>{detail}</span>
            </div>
          ))}
          {warnings.length > 0 && (
            <div className="text-[11px] text-amber-300 flex items-start gap-1.5 font-medium pt-0.5">
              <AlertTriangle className="w-3 h-3 shrink-0 mt-0.5 text-amber-400" />
              <span>{warnings[0]}</span>
            </div>
          )}
        </div>

        {/* Use Cases Pills */}
        <div className="mt-3.5 flex flex-wrap gap-1">
          {model.supportedUseCases.map((uc) => (
            <span
              key={uc}
              className={`text-[10px] px-2 py-0.5 rounded capitalize ${
                specs.useCase === uc
                  ? 'bg-blue-500/10 text-blue-300 font-semibold border border-blue-500/20'
                  : 'bg-white/5 text-slate-400 border border-white/5'
              }`}
            >
              {uc.replace('_', ' ')}
            </span>
          ))}
        </div>
      </div>

      {/* Bottom Footer Actions */}
      <div className="p-4 border-t border-white/5 bg-black/20 rounded-b-xl flex flex-wrap items-center justify-between gap-2">
        {/* Ollama Tag Quick Run */}
        {model.ollamaTag ? (
          <button
            type="button"
            onClick={handleCopyOllama}
            title="Click to copy run command for terminal"
            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded text-xs font-mono bg-black/40 border border-white/10 text-slate-300 hover:bg-white/5 hover:text-white transition-colors"
          >
            <Terminal className="w-3 h-3 text-slate-400" />
            <span>ollama run {model.ollamaTag}</span>
            {copiedCmd ? <Check className="w-3 h-3 text-green-400" /> : <Copy className="w-3 h-3 text-slate-500" />}
          </button>
        ) : (
          <button
            type="button"
            onClick={() => onOpenRuntimeGuide(model)}
            className="text-xs text-slate-400 hover:text-white font-medium transition-colors"
          >
            View LM Studio Guide
          </button>
        )}

        {/* View Official Hugging Face / Model Source */}
        <a
          href={model.officialUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1 text-xs font-semibold text-slate-300 hover:text-white hover:underline transition-colors"
        >
          <span>Official Model</span>
          <ExternalLink className="w-3 h-3" />
        </a>
      </div>
    </div>
  );
};
