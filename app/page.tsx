'use client';

import React, { useState, useMemo, useRef } from 'react';
import { HardwareSpecs } from '@/types/hardware';
import { ModelMetadata, AIRecommendationResponse, CandidateSummary } from '@/types/model';
import { LOCAL_MODELS_CATALOG } from '@/data/models/catalog';
import { evaluateModelCompatibility, calculateHardwareSummary } from '@/lib/compatibility/engine';
import { ValidatedBYOKConfig } from '@/lib/validation/schemas';
import { Navbar } from '@/components/Navbar';
import { HardwareForm } from '@/components/HardwareForm';
import { HardwareSummaryCard } from '@/components/HardwareSummaryCard';
import { ModelFilters, FilterState } from '@/components/ModelFilters';
import { ModelCard } from '@/components/ModelCard';
import { AIRecommendationPanel } from '@/components/AIRecommendationPanel';
import { ModelComparisonModal } from '@/components/ModelComparisonModal';
import { BYOKModal } from '@/components/BYOKModal';
import { PresetsModal } from '@/components/PresetsModal';
import { AboutModal } from '@/components/AboutModal';
import { RuntimeGuideModal } from '@/components/RuntimeGuideModal';

const DEFAULT_SPECS: HardwareSpecs = {
  gpuName: 'NVIDIA GeForce RTX 4060',
  vramGB: 8,
  ramGB: 32,
  cpuName: 'AMD Ryzen 7 7800X3D',
  cpuCores: 8,
  storageGB: 1000,
  availableDiskGB: 250,
  os: 'windows',
  useCase: 'coding',
  targetContext: 8192,
  isUnifiedMemory: false,
};

const DEFAULT_BYOK_CONFIG: ValidatedBYOKConfig = {
  provider: 'gemini',
  apiKey: '',
  model: 'gemini-3.7-flash',
  baseUrl: '',
};

export default function LocalLLMAdvisorPage() {
  const [specs, setSpecs] = useState<HardwareSpecs>(DEFAULT_SPECS);
  const [byokConfig, setByokConfig] = useState<ValidatedBYOKConfig>(DEFAULT_BYOK_CONFIG);

  // Filters State
  const [filters, setFilters] = useState<FilterState>({
    searchQuery: '',
    family: 'ALL',
    sizeCategory: 'ALL',
    compatibility: 'ALL',
    executionMode: 'ALL',
    useCase: 'ALL',
    visionOnly: false,
    sortBy: 'best_fit',
  });

  // Selected for comparison (array of model IDs, max 3)
  const [selectedCompareIds, setSelectedCompareIds] = useState<string[]>([]);

  // Modals state
  const [isBYOKOpen, setIsBYOKOpen] = useState(false);
  const [isPresetsOpen, setIsPresetsOpen] = useState(false);
  const [isCompareOpen, setIsCompareOpen] = useState(false);
  const [isAboutOpen, setIsAboutOpen] = useState(false);
  const [guideModel, setGuideModel] = useState<ModelMetadata | null>(null);

  // AI Recommendation State
  const [aiRecommendation, setAiRecommendation] = useState<AIRecommendationResponse | null>(null);
  const [isAILoading, setIsAILoading] = useState(false);
  const [aiError, setAiError] = useState<string | null>(null);

  const modelsSectionRef = useRef<HTMLDivElement>(null);
  const aiSectionRef = useRef<HTMLDivElement>(null);

  // Hardware Analysis Summary
  const hardwareSummary = useMemo(() => calculateHardwareSummary(specs), [specs]);

  // Evaluated Models Map
  const evaluatedModels = useMemo(() => {
    return LOCAL_MODELS_CATALOG.map((model) => {
      const evaluation = evaluateModelCompatibility(
        model,
        model.defaultQuantization,
        specs,
        specs.targetContext
      );
      return {
        model,
        evaluation,
      };
    });
  }, [specs]);

  // Filter and Sort Models
  const filteredModels = useMemo(() => {
    let list = [...evaluatedModels];

    // Search query
    if (filters.searchQuery.trim()) {
      const q = filters.searchQuery.toLowerCase().trim();
      list = list.filter(
        ({ model }) =>
          model.name.toLowerCase().includes(q) ||
          model.family.toLowerCase().includes(q) ||
          model.tagline.toLowerCase().includes(q) ||
          (model.ollamaTag && model.ollamaTag.toLowerCase().includes(q)) ||
          model.supportedUseCases.some((u) => u.toLowerCase().includes(q))
      );
    }

    // Family Filter
    if (filters.family !== 'ALL') {
      list = list.filter(({ model }) => model.family === filters.family);
    }

    // Size Category Filter
    if (filters.sizeCategory !== 'ALL') {
      list = list.filter(({ model }) => {
        if (filters.sizeCategory === 'small') return model.parametersB < 4;
        if (filters.sizeCategory === 'medium') return model.parametersB >= 4 && model.parametersB <= 9;
        if (filters.sizeCategory === 'heavy') return model.parametersB > 9 && model.parametersB <= 34;
        if (filters.sizeCategory === 'frontier') return model.parametersB > 34;
        return true;
      });
    }

    // Compatibility Filter
    if (filters.compatibility === 'recommended') {
      list = list.filter(
        ({ evaluation }) => evaluation.rating === 'excellent' || evaluation.rating === 'good'
      );
    } else if (filters.compatibility === 'compatible_only') {
      list = list.filter(({ evaluation }) => evaluation.rating !== 'incompatible');
    }

    // Execution Mode Filter
    if (filters.executionMode !== 'ALL') {
      list = list.filter(({ evaluation }) => evaluation.executionMode === filters.executionMode);
    }

    // Use Case Filter
    if (filters.useCase !== 'ALL') {
      list = list.filter(({ model }) => model.supportedUseCases.includes(filters.useCase as any));
    }

    // Vision Only Filter
    if (filters.visionOnly) {
      list = list.filter(({ model }) => model.hasVision);
    }

    // Sorting
    list.sort((a, b) => {
      if (filters.sortBy === 'best_fit') {
        return b.evaluation.score - a.evaluation.score;
      }
      if (filters.sortBy === 'params_asc') {
        return a.model.parametersB - b.model.parametersB;
      }
      if (filters.sortBy === 'params_desc') {
        return b.model.parametersB - a.model.parametersB;
      }
      if (filters.sortBy === 'memory_asc') {
        return a.evaluation.memoryBreakdown.totalRequiredGB - b.evaluation.memoryBreakdown.totalRequiredGB;
      }
      if (filters.sortBy === 'name') {
        return a.model.name.localeCompare(b.model.name);
      }
      return 0;
    });

    return list;
  }, [evaluatedModels, filters]);

  // Selected models for comparison objects
  const selectedCompareModels = useMemo(() => {
    return LOCAL_MODELS_CATALOG.filter((m) => selectedCompareIds.includes(m.id));
  }, [selectedCompareIds]);

  const handleToggleCompare = (modelId: string) => {
    setSelectedCompareIds((prev) => {
      if (prev.includes(modelId)) {
        return prev.filter((id) => id !== modelId);
      }
      if (prev.length >= 3) {
        // Keep max 3
        return [...prev.slice(1), modelId];
      }
      return [...prev, modelId];
    });
  };

  const handleRemoveCompare = (modelId: string) => {
    setSelectedCompareIds((prev) => prev.filter((id) => id !== modelId));
  };

  // AI Recommendation Trigger
  const handleRequestAIRecommendation = async () => {
    setIsAILoading(true);
    setAiError(null);

    // Scroll to AI panel
    if (aiSectionRef.current) {
      aiSectionRef.current.scrollIntoView({ behavior: 'smooth' });
    }

    // Build compatible candidates summary
    const candidates: CandidateSummary[] = evaluatedModels
      .filter(({ evaluation }) => evaluation.rating !== 'incompatible')
      .map(({ model, evaluation }) => ({
        id: model.id,
        name: model.name,
        family: model.family,
        parametersB: model.parametersB,
        rating: evaluation.rating,
        executionMode: evaluation.executionMode,
        estimatedVRAM: evaluation.memoryBreakdown.usableVRAMGB,
        estimatedRAM: evaluation.memoryBreakdown.totalRequiredGB,
        hasVision: model.hasVision,
        useCases: model.supportedUseCases,
      }));

    try {
      const response = await fetch('/api/ai/recommend', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          hardware: {
            gpu: specs.gpuName,
            vramGB: specs.vramGB,
            ramGB: specs.ramGB,
            cpu: specs.cpuName,
            storageGB: specs.storageGB,
            availableDiskGB: specs.availableDiskGB,
            os: specs.os,
            useCase: specs.useCase,
            targetContext: specs.targetContext,
          },
          compatibleCandidates: candidates,
          byokConfig: byokConfig.apiKey || byokConfig.provider !== 'gemini' ? byokConfig : undefined,
        }),
      });

      const data = await response.json();
      if (!data.success) {
        throw new Error(data.error || 'Failed to retrieve recommendation from AI provider.');
      }

      setAiRecommendation(data.data);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Unknown AI query error';
      setAiError(msg);
    } finally {
      setIsAILoading(false);
    }
  };

  const scrollToModels = () => {
    if (modelsSectionRef.current) {
      modelsSectionRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="min-h-screen bg-[#09090b] text-slate-100 flex flex-col font-sans">
      {/* Top Navbar */}
      <Navbar
        onOpenBYOK={() => setIsBYOKOpen(true)}
        onOpenPresets={() => setIsPresetsOpen(true)}
        onOpenCompare={() => setIsCompareOpen(true)}
        onOpenAbout={() => setIsAboutOpen(true)}
        selectedCompareCount={selectedCompareIds.length}
        byokConfig={byokConfig}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6 sm:space-y-8">
        {/* Step 1: Hardware Specifications Form */}
        <section id="section-hardware-form">
          <HardwareForm
            specs={specs}
            onChange={(newSpecs) => setSpecs(newSpecs)}
            onAnalyze={scrollToModels}
          />
        </section>

        {/* Step 2: System Capability & Memory Breakdown Summary */}
        <section id="section-hardware-summary">
          <HardwareSummaryCard
            summary={hardwareSummary}
            specs={specs}
            onAskAI={handleRequestAIRecommendation}
            onScrollToModels={scrollToModels}
          />
        </section>

        {/* Step 3: AI Recommendation Advisor Section */}
        <section id="section-ai-recommendation" ref={aiSectionRef}>
          <AIRecommendationPanel
            recommendation={aiRecommendation}
            isLoading={isAILoading}
            error={aiError}
            onRefresh={handleRequestAIRecommendation}
            onOpenBYOK={() => setIsBYOKOpen(true)}
            byokConfig={byokConfig}
          />
        </section>

        {/* Step 4: Model Catalog Explorer & Filters */}
        <section id="section-model-catalog" ref={modelsSectionRef} className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                Local Models Engine
              </span>
              <h2 className="text-lg font-semibold text-white tracking-tight mt-0.5">
                Verified Local Open-Weight Models
              </h2>
              <p className="text-xs text-slate-400">
                Deterministic memory allocations calculated for {specs.gpuName || 'your system'} at{' '}
                {Math.round(specs.targetContext / 1024)}k working context.
              </p>
            </div>
          </div>

          {/* Filters and Search Bar */}
          <ModelFilters
            filters={filters}
            onChange={setFilters}
            totalModels={LOCAL_MODELS_CATALOG.length}
            filteredCount={filteredModels.length}
          />

          {/* Model Cards Grid */}
          {filteredModels.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {filteredModels.map(({ model }) => (
                <ModelCard
                  key={model.id}
                  model={model}
                  specs={specs}
                  isSelectedForCompare={selectedCompareIds.includes(model.id)}
                  onToggleCompare={handleToggleCompare}
                  onOpenRuntimeGuide={(m) => setGuideModel(m)}
                />
              ))}
            </div>
          ) : (
            <div className="py-12 text-center bg-[#18181b] border border-white/10 rounded-xl p-8 space-y-2 shadow-xl">
              <p className="text-sm font-semibold text-slate-200">
                No local models match your current filter selection.
              </p>
              <p className="text-xs text-slate-500">
                Try widening your rating filter or resetting the search query.
              </p>
              <button
                onClick={() =>
                  setFilters({
                    searchQuery: '',
                    family: 'ALL',
                    sizeCategory: 'ALL',
                    compatibility: 'ALL',
                    executionMode: 'ALL',
                    useCase: 'ALL',
                    visionOnly: false,
                    sortBy: 'best_fit',
                  })
                }
                className="mt-3 px-4 py-1.5 rounded-lg text-xs font-semibold bg-white/5 hover:bg-white/10 text-slate-200 border border-white/10 transition-colors"
              >
                Reset All Filters
              </button>
            </div>
          )}
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-white/5 bg-[#09090b] py-6 mt-12 text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div>
            <span className="font-semibold text-slate-400">Local LLM Advisor</span> &middot; Open-source hardware compatibility calculator for open weights.
          </div>
          <div className="flex items-center gap-4 text-slate-400">
            <button onClick={() => setIsAboutOpen(true)} className="hover:text-white transition-colors">
              Memory Math
            </button>
            <button onClick={() => setIsPresetsOpen(true)} className="hover:text-white transition-colors">
              Hardware Presets
            </button>
            <button onClick={() => setIsBYOKOpen(true)} className="hover:text-white transition-colors">
              BYOK Settings
            </button>
          </div>
        </div>
      </footer>

      {/* Modals */}
      <BYOKModal
        isOpen={isBYOKOpen}
        onClose={() => setIsBYOKOpen(false)}
        config={byokConfig}
        onSave={(updated) => setByokConfig(updated)}
      />

      <PresetsModal
        isOpen={isPresetsOpen}
        onClose={() => setIsPresetsOpen(false)}
        onSelectPreset={(newSpecs) => setSpecs(newSpecs)}
        currentSpecs={specs}
      />

      <ModelComparisonModal
        isOpen={isCompareOpen}
        onClose={() => setIsCompareOpen(false)}
        selectedModels={selectedCompareModels}
        specs={specs}
        onRemoveModel={handleRemoveCompare}
      />

      <AboutModal isOpen={isAboutOpen} onClose={() => setIsAboutOpen(false)} />

      <RuntimeGuideModal
        isOpen={guideModel !== null}
        onClose={() => setGuideModel(null)}
        model={guideModel}
        specs={specs}
      />
    </div>
  );
}
