'use client';

import React from 'react';
import { ModelFamily, CompatibilityRating, ExecutionMode } from '@/types/model';
import { UseCase } from '@/types/hardware';
import { Search, Filter, ArrowUpDown, Sparkles, X, Eye } from 'lucide-react';

export interface FilterState {
  searchQuery: string;
  family: ModelFamily | 'ALL';
  sizeCategory: 'ALL' | 'small' | 'medium' | 'heavy' | 'frontier';
  compatibility: 'ALL' | 'recommended' | 'compatible_only';
  executionMode: 'ALL' | ExecutionMode;
  useCase: 'ALL' | UseCase;
  visionOnly: boolean;
  sortBy: 'best_fit' | 'params_asc' | 'params_desc' | 'memory_asc' | 'name';
}

interface ModelFiltersProps {
  filters: FilterState;
  onChange: (updated: FilterState) => void;
  totalModels: number;
  filteredCount: number;
}

export const ModelFilters: React.FC<ModelFiltersProps> = ({
  filters,
  onChange,
  totalModels,
  filteredCount,
}) => {
  const resetFilters = () => {
    onChange({
      searchQuery: '',
      family: 'ALL',
      sizeCategory: 'ALL',
      compatibility: 'ALL',
      executionMode: 'ALL',
      useCase: 'ALL',
      visionOnly: false,
      sortBy: 'best_fit',
    });
  };

  const isFiltered =
    filters.searchQuery !== '' ||
    filters.family !== 'ALL' ||
    filters.sizeCategory !== 'ALL' ||
    filters.compatibility !== 'ALL' ||
    filters.executionMode !== 'ALL' ||
    filters.useCase !== 'ALL' ||
    filters.visionOnly;

  return (
    <div className="bg-[#18181b] border border-white/10 rounded-xl p-4 sm:p-5 shadow-xl space-y-4">
      {/* Search and Sort Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            id="input-model-search"
            type="text"
            value={filters.searchQuery}
            onChange={(e) => onChange({ ...filters, searchQuery: e.target.value })}
            placeholder="Search models (e.g. Qwen 2.5, DeepSeek R1, Llama 3.1, 7b, vision)..."
            className="w-full pl-9 pr-3 py-2 text-sm rounded-lg border border-white/10 bg-[#09090b] text-slate-100 placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
          />
          {filters.searchQuery && (
            <button
              onClick={() => onChange({ ...filters, searchQuery: '' })}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Sort By Dropdown */}
        <div className="flex items-center gap-2">
          <ArrowUpDown className="w-4 h-4 text-slate-500 shrink-0" />
          <select
            id="select-sort-by"
            value={filters.sortBy}
            onChange={(e) =>
              onChange({
                ...filters,
                sortBy: e.target.value as FilterState['sortBy'],
              })
            }
            className="px-3 py-2 text-xs font-medium rounded-lg border border-white/10 bg-[#09090b] text-slate-200 focus:outline-none focus:border-blue-500"
          >
            <option value="best_fit">Sort: Best Hardware Fit</option>
            <option value="params_asc">Sort: Smallest Models First</option>
            <option value="params_desc">Sort: Largest Models First</option>
            <option value="memory_asc">Sort: Lowest Memory Requirement</option>
            <option value="name">Sort: Alphabetical (A-Z)</option>
          </select>

          {isFiltered && (
            <button
              onClick={resetFilters}
              className="px-2.5 py-2 text-xs font-medium text-rose-400 hover:bg-rose-500/10 rounded-lg transition-colors flex items-center gap-1 shrink-0"
            >
              <X className="w-3.5 h-3.5" />
              <span>Reset</span>
            </button>
          )}
        </div>
      </div>

      {/* Model Family Tabs */}
      <div className="flex flex-wrap items-center gap-1.5 pt-1">
        <span className="text-[11px] font-medium text-slate-500 mr-1.5 flex items-center gap-1">
          <Filter className="w-3 h-3" />
          <span>Family:</span>
        </span>
        {(['ALL', 'Qwen', 'Llama', 'DeepSeek', 'Mistral', 'Gemma', 'Phi'] as const).map((fam) => (
          <button
            key={fam}
            type="button"
            onClick={() => onChange({ ...filters, family: fam })}
            className={`px-2.5 py-1 rounded text-xs font-medium transition-colors ${
              filters.family === fam
                ? 'bg-blue-600 text-white font-semibold shadow-xs'
                : 'bg-white/5 text-slate-400 hover:bg-white/10 hover:text-slate-200 border border-white/5'
            }`}
          >
            {fam === 'ALL' ? 'All Families' : fam}
          </button>
        ))}
      </div>

      {/* Secondary Filter Badges (Size, Compatibility, Vision) */}
      <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-white/5">
        <div className="flex flex-wrap items-center gap-1.5">
          {/* Size Category */}
          <span className="text-[11px] font-medium text-slate-500 mr-1">Size:</span>
          {[
            { id: 'ALL', label: 'All Sizes' },
            { id: 'small', label: '< 4B Edge' },
            { id: 'medium', label: '7B–9B Standard' },
            { id: 'heavy', label: '12B–32B Heavy' },
            { id: 'frontier', label: '70B+ Frontier' },
          ].map((s) => (
            <button
              key={s.id}
              type="button"
              onClick={() =>
                onChange({
                  ...filters,
                  sizeCategory: s.id as FilterState['sizeCategory'],
                })
              }
              className={`px-2 py-0.5 rounded text-[11px] font-medium transition-colors ${
                filters.sizeCategory === s.id
                  ? 'bg-blue-600 text-white font-semibold'
                  : 'bg-white/5 text-slate-400 hover:bg-white/10 hover:text-slate-200 border border-white/5'
              }`}
            >
              {s.label}
            </button>
          ))}

          {/* Compatibility Filter */}
          <span className="text-[11px] font-medium text-slate-500 ml-2 mr-1">Rating:</span>
          {[
            { id: 'ALL', label: 'All Models' },
            { id: 'recommended', label: 'Excellent & Good' },
            { id: 'compatible_only', label: 'Hide Incompatible' },
          ].map((c) => (
            <button
              key={c.id}
              type="button"
              onClick={() =>
                onChange({
                  ...filters,
                  compatibility: c.id as FilterState['compatibility'],
                })
              }
              className={`px-2 py-0.5 rounded text-[11px] font-medium transition-colors ${
                filters.compatibility === c.id
                  ? 'bg-green-500 text-black font-bold'
                  : 'bg-white/5 text-slate-400 hover:bg-white/10 hover:text-slate-200 border border-white/5'
              }`}
            >
              {c.label}
            </button>
          ))}

          {/* Vision Only */}
          <button
            type="button"
            onClick={() => onChange({ ...filters, visionOnly: !filters.visionOnly })}
            className={`ml-2 px-2 py-0.5 rounded text-[11px] font-medium inline-flex items-center gap-1 transition-colors ${
              filters.visionOnly
                ? 'bg-purple-600 text-white font-semibold'
                : 'bg-white/5 text-slate-400 hover:bg-white/10 hover:text-slate-200 border border-white/5'
            }`}
          >
            <Eye className="w-3 h-3" />
            <span>Vision Only</span>
          </button>
        </div>

        {/* Counter */}
        <div className="text-xs font-mono text-slate-400">
          Showing <span className="font-bold text-white">{filteredCount}</span> of {totalModels} models
        </div>
      </div>
    </div>
  );
};
