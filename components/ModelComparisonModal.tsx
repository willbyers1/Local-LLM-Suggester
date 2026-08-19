'use client';

import React from 'react';
import { ModelMetadata, CompatibilityEvaluation } from '@/types/model';
import { HardwareSpecs } from '@/types/hardware';
import { evaluateModelCompatibility } from '@/lib/compatibility/engine';
import { CompatibilityBadge } from './CompatibilityBadge';
import { ExecutionModeBadge } from './ExecutionModeBadge';
import { X, ExternalLink, Sparkles, Check, AlertTriangle } from 'lucide-react';

interface ModelComparisonModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedModels: ModelMetadata[];
  specs: HardwareSpecs;
  onRemoveModel: (id: string) => void;
}

export const ModelComparisonModal: React.FC<ModelComparisonModalProps> = ({
  isOpen,
  onClose,
  selectedModels,
  specs,
  onRemoveModel,
}) => {
  if (!isOpen || selectedModels.length === 0) return null;

  const evaluations: CompatibilityEvaluation[] = selectedModels.map((m) =>
    evaluateModelCompatibility(m, m.defaultQuantization, specs, specs.targetContext)
  );

  // Find best score model
  const bestScore = Math.max(...evaluations.map((e) => e.score));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs overflow-y-auto">
      <div className="bg-[#18181b] border border-white/10 rounded-2xl w-full max-w-5xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
        {/* Modal Header */}
        <div className="p-5 border-b border-white/5 flex items-center justify-between">
          <div>
            <h2 className="text-base font-semibold text-white flex items-center gap-2">
              <span>Side-by-Side Model Hardware Fit Comparison</span>
              <span className="text-xs font-mono font-medium px-2 py-0.5 rounded bg-white/5 text-slate-400 border border-white/10">
                {selectedModels.length} / 3 Selected
              </span>
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Evaluating on your {specs.gpuName || 'System'} ({specs.vramGB} GB VRAM / {specs.ramGB} GB RAM)
            </p>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/5 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body / Table */}
        <div className="p-5 overflow-x-auto overflow-y-auto flex-1">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-white/10">
                <th className="py-3 px-4 text-[11px] font-bold text-slate-500 uppercase tracking-widest w-1/4">
                  Specification
                </th>
                {evaluations.map(({ model, score }) => (
                  <th key={model.id} className="py-3 px-4 text-sm font-semibold text-white">
                    <div className="flex items-center justify-between">
                      <span className="truncate">{model.name}</span>
                      <button
                        onClick={() => onRemoveModel(model.id)}
                        className="text-xs text-slate-500 hover:text-rose-400 ml-2"
                        title="Remove from comparison"
                      >
                        &times;
                      </button>
                    </div>
                    {score === bestScore && (
                      <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-green-400 mt-0.5">
                        <Sparkles className="w-3 h-3" /> Best Hardware Fit
                      </span>
                    )}
                  </th>
                ))}
              </tr>
            </thead>

            <tbody className="divide-y divide-white/5 text-xs">
              {/* Compatibility Rating */}
              <tr>
                <td className="py-3 px-4 font-semibold text-slate-400">Compatibility Rating</td>
                {evaluations.map((e) => (
                  <td key={e.modelId} className="py-3 px-4">
                    <CompatibilityBadge rating={e.rating} score={e.score} showScore={true} />
                  </td>
                ))}
              </tr>

              {/* Execution Mode */}
              <tr>
                <td className="py-3 px-4 font-semibold text-slate-400">Execution Mode</td>
                {evaluations.map((e) => (
                  <td key={e.modelId} className="py-3 px-4">
                    <ExecutionModeBadge mode={e.executionMode} />
                  </td>
                ))}
              </tr>

              {/* Parameters & Family */}
              <tr>
                <td className="py-3 px-4 font-semibold text-slate-400">Parameters / Family</td>
                {evaluations.map((e) => (
                  <td key={e.modelId} className="py-3 px-4 font-mono font-medium text-slate-300">
                    {e.model.parametersB}B &middot; {e.model.family}
                  </td>
                ))}
              </tr>

              {/* Estimated Total Memory */}
              <tr>
                <td className="py-3 px-4 font-semibold text-slate-400">Est. Total Memory Req.</td>
                {evaluations.map((e) => (
                  <td key={e.modelId} className="py-3 px-4 font-mono font-bold text-white">
                    ~{e.memoryBreakdown.totalRequiredGB} GB
                    <div className="text-[11px] font-normal text-slate-500">
                      (Weights: {e.memoryBreakdown.modelWeightsGB}G, KV: {e.memoryBreakdown.kvCacheGB}G)
                    </div>
                  </td>
                ))}
              </tr>

              {/* Download Size (Q4) */}
              <tr>
                <td className="py-3 px-4 font-semibold text-slate-400">Download Size (Q4_K_M)</td>
                {evaluations.map((e) => (
                  <td key={e.modelId} className="py-3 px-4 font-mono text-slate-300">
                    ~{e.memoryBreakdown.storageRequiredGB} GB
                  </td>
                ))}
              </tr>

              {/* Max Context Window */}
              <tr>
                <td className="py-3 px-4 font-semibold text-slate-400">Max Context Window</td>
                {evaluations.map((e) => (
                  <td key={e.modelId} className="py-3 px-4 font-mono text-slate-300">
                    {e.model.maxContext / 1024}k tokens
                  </td>
                ))}
              </tr>

              {/* Vision Support */}
              <tr>
                <td className="py-3 px-4 font-semibold text-slate-400">Vision Multimodal</td>
                {evaluations.map((e) => (
                  <td key={e.modelId} className="py-3 px-4">
                    {e.model.hasVision ? (
                      <span className="font-semibold text-purple-400">Yes (Images/OCR)</span>
                    ) : (
                      <span className="text-slate-500">Text Only</span>
                    )}
                  </td>
                ))}
              </tr>

              {/* Architecture & License */}
              <tr>
                <td className="py-3 px-4 font-semibold text-slate-400">Architecture / License</td>
                {evaluations.map((e) => (
                  <td key={e.modelId} className="py-3 px-4 text-slate-400">
                    <div>{e.model.architecture}</div>
                    <div className="text-[10px] text-slate-500 font-mono">{e.model.license}</div>
                  </td>
                ))}
              </tr>

              {/* Primary Assessment */}
              <tr>
                <td className="py-3 px-4 font-semibold text-slate-400">Hardware Assessment</td>
                {evaluations.map((e) => (
                  <td key={e.modelId} className="py-3 px-4 text-slate-300 leading-relaxed">
                    {e.headlineExplanation}
                  </td>
                ))}
              </tr>

              {/* Official Source Link */}
              <tr>
                <td className="py-3 px-4 font-semibold text-slate-400">Official Source</td>
                {evaluations.map((e) => (
                  <td key={e.modelId} className="py-3 px-4">
                    <a
                      href={e.model.officialUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 font-semibold text-blue-400 hover:text-blue-300 hover:underline"
                    >
                      <span>Hugging Face</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-white/5 bg-black/40 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-lg text-xs font-semibold bg-blue-600 hover:bg-blue-500 text-white transition-colors shadow-lg shadow-blue-900/20"
          >
            Close Comparison
          </button>
        </div>
      </div>
    </div>
  );
};
