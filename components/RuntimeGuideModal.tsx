'use client';

import React, { useState } from 'react';
import { ModelMetadata } from '@/types/model';
import { HardwareSpecs } from '@/types/hardware';
import { X, Terminal, Copy, Check, ExternalLink, Play, Sparkles } from 'lucide-react';

interface RuntimeGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
  model: ModelMetadata | null;
  specs: HardwareSpecs;
}

export const RuntimeGuideModal: React.FC<RuntimeGuideModalProps> = ({
  isOpen,
  onClose,
  model,
  specs,
}) => {
  const [activeTab, setActiveTab] = useState<'ollama' | 'lmstudio' | 'llamacpp'>('ollama');
  const [copied, setCopied] = useState<string | null>(null);

  if (!isOpen || !model) return null;

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopied(id);
    setTimeout(() => setCopied(null), 2000);
  };

  const ollamaCmd = `ollama run ${model.ollamaTag || model.id}`;
  const llamacppCmd = `./llama-cli -m ${model.id}-Q4_K_M.gguf -ngl 99 -c ${specs.targetContext} -p "You are a helpful local assistant."`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs overflow-y-auto">
      <div className="bg-[#18181b] border border-white/10 rounded-2xl w-full max-w-2xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="p-5 border-b border-white/5 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-blue-600/20 text-blue-400 flex items-center justify-center">
              <Terminal className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-white flex items-center gap-2">
                <span>Setup & Run: {model.name}</span>
              </h2>
              <p className="text-xs text-slate-400">
                Step-by-step local runner instructions for your {specs.os} system
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

        {/* Runner Tabs */}
        <div className="flex border-b border-white/5 bg-black/40 px-5 pt-3 gap-2">
          {[
            { id: 'ollama', label: 'Ollama (Easiest / CLI)' },
            { id: 'lmstudio', label: 'LM Studio (GUI / Desktop)' },
            { id: 'llamacpp', label: 'llama.cpp (Advanced / Max Performance)' },
          ].map((t) => (
            <button
              key={t.id}
              onClick={() => setActiveTab(t.id as typeof activeTab)}
              className={`pb-2.5 px-3 text-xs font-semibold border-b-2 transition-colors ${
                activeTab === t.id
                  ? 'border-blue-500 text-white'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div className="p-6 overflow-y-auto space-y-4 flex-1 text-xs sm:text-sm text-slate-300">
          {activeTab === 'ollama' && (
            <div className="space-y-4">
              <p className="text-xs text-slate-400">
                Ollama handles downloading, quant selection, GPU acceleration, and REST API serving automatically.
              </p>

              <div className="space-y-2">
                <span className="text-xs font-semibold text-white">1. Run via terminal:</span>
                <div className="p-3 rounded-lg bg-black border border-white/10 flex items-center justify-between font-mono text-xs text-green-400">
                  <span className="truncate">{ollamaCmd}</span>
                  <button
                    onClick={() => handleCopy(ollamaCmd, 'ollama')}
                    className="p-1 rounded text-slate-400 hover:text-white hover:bg-white/10 ml-2"
                  >
                    {copied === 'ollama' ? <Check className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="p-3.5 rounded-lg bg-black/40 border border-white/5 space-y-1.5 text-xs text-slate-400">
                <span className="font-semibold text-white">Configured Parameters:</span>
                <ul className="list-disc list-inside space-y-0.5 text-slate-400">
                  <li>Context window will auto-scale to {specs.targetContext} tokens</li>
                  <li>GPU layers will offload according to your {specs.vramGB} GB VRAM limit</li>
                  <li>Local OpenAI API served at <code className="text-blue-400">http://localhost:11434/v1</code></li>
                </ul>
              </div>
            </div>
          )}

          {activeTab === 'lmstudio' && (
            <div className="space-y-4">
              <p className="text-xs text-slate-400">
                LM Studio gives you an intuitive chat interface, GPU offload slider, and Hugging Face model search.
              </p>

              <ol className="list-decimal list-inside space-y-2 text-xs text-slate-300">
                <li>
                  Open <strong>LM Studio</strong> and click the <strong>Discover / Search (Magnifying Glass)</strong> tab.
                </li>
                <li>
                  Search for <code className="px-1.5 py-0.5 rounded bg-black text-blue-400 font-mono">{model.name}</code>.
                </li>
                <li>
                  Select the <strong className="text-white">{model.defaultQuantization.toUpperCase()}</strong> GGUF quantization file.
                </li>
                <li>
                  In the right-hand sidebar, set <strong>GPU Offload</strong> to max ({specs.vramGB > 0 ? 'Full' : 'CPU'}).
                </li>
                <li>Set Context Length to <strong>{specs.targetContext}</strong> tokens.</li>
              </ol>
            </div>
          )}

          {activeTab === 'llamacpp' && (
            <div className="space-y-4">
              <p className="text-xs text-slate-400">
                llama.cpp provides bare-metal C++ inference with zero runtime overhead for maximum throughput.
              </p>

              <div className="space-y-2">
                <span className="text-xs font-semibold text-white">CLI execution command:</span>
                <div className="p-3 rounded-lg bg-black border border-white/10 flex items-center justify-between font-mono text-xs text-green-400">
                  <span className="break-all">{llamacppCmd}</span>
                  <button
                    onClick={() => handleCopy(llamacppCmd, 'llamacpp')}
                    className="p-1 rounded text-slate-400 hover:text-white hover:bg-white/10 ml-2 shrink-0"
                  >
                    {copied === 'llamacpp' ? <Check className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-white/5 bg-black/40 flex items-center justify-between">
          <a
            href={model.officialUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-xs text-slate-400 hover:text-white transition-colors"
          >
            <span>Hugging Face Repository</span>
            <ExternalLink className="w-3 h-3" />
          </a>

          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg text-xs font-semibold bg-blue-600 hover:bg-blue-500 text-white transition-colors shadow-lg shadow-blue-900/20"
          >
            Close Guide
          </button>
        </div>
      </div>
    </div>
  );
};
