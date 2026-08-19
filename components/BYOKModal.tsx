'use client';

import React, { useState } from 'react';
import { ValidatedBYOKConfig } from '@/lib/validation/schemas';
import { Key, CheckCircle2, AlertTriangle, RefreshCw, X, Eye, EyeOff, ShieldCheck, Server } from 'lucide-react';

interface BYOKModalProps {
  isOpen: boolean;
  onClose: () => void;
  config: ValidatedBYOKConfig;
  onSave: (updated: ValidatedBYOKConfig) => void;
}

export const BYOKModal: React.FC<BYOKModalProps> = ({
  isOpen,
  onClose,
  config,
  onSave,
}) => {
  const [provider, setProvider] = useState<ValidatedBYOKConfig['provider']>(config.provider);
  const [apiKey, setApiKey] = useState(config.apiKey || '');
  const [model, setModel] = useState(config.model || '');
  const [baseUrl, setBaseUrl] = useState(config.baseUrl || '');
  const [showKey, setShowKey] = useState(false);

  const [isValidating, setIsValidating] = useState(false);
  const [validationResult, setValidationResult] = useState<{
    success?: boolean;
    message?: string;
  } | null>(null);

  if (!isOpen) return null;

  const handleTestKey = async () => {
    setIsValidating(true);
    setValidationResult(null);

    try {
      const res = await fetch('/api/ai/validate-key', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          provider,
          apiKey,
          model,
          baseUrl,
        }),
      });

      const data = await res.json();
      if (data.valid) {
        setValidationResult({
          success: true,
          message: 'Connection verified successfully! Your API key is active.',
        });
      } else {
        setValidationResult({
          success: false,
          message: data.error || 'Key validation failed. Please check your credentials.',
        });
      }
    } catch {
      setValidationResult({
        success: false,
        message: 'Network error while validating key.',
      });
    } finally {
      setIsValidating(false);
    }
  };

  const handleSave = () => {
    onSave({
      provider,
      apiKey: apiKey.trim(),
      model: model.trim(),
      baseUrl: baseUrl.trim(),
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs overflow-y-auto">
      <div className="bg-[#18181b] border border-white/10 rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="p-5 border-b border-white/5 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-blue-600/20 text-blue-400 flex items-center justify-center">
              <Key className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-white">
                BYOK — Bring Your Own Key Settings
              </h2>
              <p className="text-xs text-slate-400">
                Configure your AI recommendation model provider
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

        {/* Body */}
        <div className="p-5 space-y-4">
          {/* Provider Selection */}
          <div>
            <label className="block text-[11px] text-slate-400 font-medium mb-1.5">
              Select AI Provider
            </label>
            <div className="grid grid-cols-2 gap-2">
              {[
                { id: 'gemini', label: 'Google Gemini', sub: 'Server Key / Custom' },
                { id: 'openai', label: 'OpenAI', sub: 'GPT-4o / Mini' },
                { id: 'anthropic', label: 'Anthropic', sub: 'Claude 3.5 Haiku' },
                { id: 'openai_compatible', label: 'Custom Endpoint', sub: 'Groq / DeepSeek / Ollama' },
              ].map((p) => (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => {
                    setProvider(p.id as ValidatedBYOKConfig['provider']);
                    setValidationResult(null);
                  }}
                  className={`p-2.5 rounded-lg text-left border transition-all ${
                    provider === p.id
                      ? 'bg-blue-600/10 text-white border-blue-500 shadow-xs'
                      : 'bg-[#09090b] text-slate-300 border-white/10 hover:bg-white/5 hover:border-white/20'
                  }`}
                >
                  <div className="text-xs font-semibold">{p.label}</div>
                  <div
                    className={`text-[10px] ${
                      provider === p.id ? 'text-blue-300' : 'text-slate-500'
                    }`}
                  >
                    {p.sub}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Gemini Default note */}
          {provider === 'gemini' && (
            <div className="p-3 rounded-lg bg-blue-500/10 border border-blue-500/20 text-xs text-blue-300 flex items-start gap-2">
              <Server className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
              <span>
                Default mode uses the server-side <strong>Gemini 3.7 Flash</strong> engine. You can leave the API key blank to use the built-in server environment key, or provide your personal Gemini key below.
              </span>
            </div>
          )}

          {/* API Key Input */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-[11px] text-slate-400 font-medium">
                {provider === 'gemini' ? 'Custom Gemini API Key (Optional)' : 'API Key'}
              </label>
              <button
                type="button"
                onClick={() => setShowKey(!showKey)}
                className="text-[11px] text-slate-400 hover:text-white flex items-center gap-1"
              >
                {showKey ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                <span>{showKey ? 'Hide' : 'Show'}</span>
              </button>
            </div>
            <input
              id="input-byok-api-key"
              type={showKey ? 'text' : 'password'}
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder={
                provider === 'gemini'
                  ? 'Leave empty for server default or enter AIza...'
                  : provider === 'openai'
                  ? 'sk-...'
                  : provider === 'anthropic'
                  ? 'sk-ant-...'
                  : 'Bearer token or custom key'
              }
              className="w-full px-3 py-2 text-xs font-mono rounded-lg border border-white/10 bg-[#09090b] text-slate-100 placeholder-slate-600 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
            />
          </div>

          {/* Custom Endpoint URL (for openai_compatible) */}
          {provider === 'openai_compatible' && (
            <div>
              <label className="block text-[11px] text-slate-400 font-medium mb-1.5">
                Base URL / Endpoint
              </label>
              <input
                type="text"
                value={baseUrl}
                onChange={(e) => setBaseUrl(e.target.value)}
                placeholder="e.g. https://api.groq.com/openai/v1 or http://localhost:11434/v1"
                className="w-full px-3 py-2 text-xs font-mono rounded-lg border border-white/10 bg-[#09090b] text-slate-100 placeholder-slate-600 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
              />
            </div>
          )}

          {/* Model Name Override */}
          <div>
            <label className="block text-[11px] text-slate-400 font-medium mb-1.5">
              Model Identifier (Optional Override)
            </label>
            <input
              type="text"
              value={model}
              onChange={(e) => setModel(e.target.value)}
              placeholder={
                provider === 'gemini'
                  ? 'gemini-3.7-flash'
                  : provider === 'openai'
                  ? 'gpt-4o-mini'
                  : provider === 'anthropic'
                  ? 'claude-3-5-haiku-20241022'
                  : 'llama-3.3-70b-versatile'
              }
              className="w-full px-3 py-2 text-xs font-mono rounded-lg border border-white/10 bg-[#09090b] text-slate-100 placeholder-slate-600 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
            />
          </div>

          {/* Validation Feedback */}
          {validationResult && (
            <div
              className={`p-3 rounded-lg text-xs flex items-start gap-2 ${
                validationResult.success
                  ? 'bg-green-500/10 border border-green-500/20 text-green-300'
                  : 'bg-rose-500/10 border border-rose-500/20 text-rose-300'
              }`}
            >
              {validationResult.success ? (
                <CheckCircle2 className="w-4 h-4 text-green-400 shrink-0 mt-0.5" />
              ) : (
                <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
              )}
              <span>{validationResult.message}</span>
            </div>
          )}

          {/* Privacy Note */}
          <div className="flex items-start gap-2 pt-2 border-t border-white/5 text-[11px] text-slate-500">
            <ShieldCheck className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
            <span>
              <strong>Privacy Assurance:</strong> BYOK keys are maintained strictly in memory during your active browser session and proxied directly to the official provider endpoint.
            </span>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-4 border-t border-white/5 bg-black/40 flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={handleTestKey}
            disabled={isValidating || (!apiKey && provider !== 'gemini')}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-medium text-slate-300 hover:bg-white/5 border border-white/10 transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isValidating ? 'animate-spin' : ''}`} />
            <span>{isValidating ? 'Testing...' : 'Test Connection'}</span>
          </button>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-3.5 py-2 rounded-lg text-xs font-medium text-slate-400 hover:text-white transition-colors"
            >
              Cancel
            </button>
            <button
              type="button"
              id="btn-save-byok"
              onClick={handleSave}
              className="px-4 py-2 rounded-lg text-xs font-semibold bg-blue-600 hover:bg-blue-500 text-white transition-colors shadow-lg shadow-blue-900/20"
            >
              Save Settings
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
