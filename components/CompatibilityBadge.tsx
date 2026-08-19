import React from 'react';
import { CompatibilityRating } from '@/types/model';
import { CheckCircle2, AlertTriangle, AlertCircle, XCircle, Sparkles } from 'lucide-react';

interface CompatibilityBadgeProps {
  rating: CompatibilityRating;
  score?: number;
  showScore?: boolean;
}

export const CompatibilityBadge: React.FC<CompatibilityBadgeProps> = ({
  rating,
  score,
  showScore = false,
}) => {
  switch (rating) {
    case 'excellent':
      return (
        <span
          id="badge-excellent"
          className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded text-xs font-semibold bg-green-500/10 text-green-400 border border-green-500/20"
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>EXCELLENT</span>
          {showScore && score !== undefined && <span className="opacity-80 font-mono">({score})</span>}
        </span>
      );
    case 'good':
      return (
        <span
          id="badge-good"
          className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded text-xs font-semibold bg-blue-500/10 text-blue-400 border border-blue-500/20"
        >
          <CheckCircle2 className="w-3.5 h-3.5" />
          <span>GOOD FIT</span>
          {showScore && score !== undefined && <span className="opacity-80 font-mono">({score})</span>}
        </span>
      );
    case 'possible':
      return (
        <span
          id="badge-possible"
          className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded text-xs font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/20"
        >
          <AlertTriangle className="w-3.5 h-3.5" />
          <span>POSSIBLE</span>
          {showScore && score !== undefined && <span className="opacity-80 font-mono">({score})</span>}
        </span>
      );
    case 'not_recommended':
      return (
        <span
          id="badge-not-recommended"
          className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded text-xs font-semibold bg-orange-500/10 text-orange-400 border border-orange-500/20"
        >
          <AlertCircle className="w-3.5 h-3.5" />
          <span>OFFLOAD HEAVY</span>
          {showScore && score !== undefined && <span className="opacity-80 font-mono">({score})</span>}
        </span>
      );
    case 'incompatible':
      return (
        <span
          id="badge-incompatible"
          className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded text-xs font-semibold bg-rose-500/10 text-rose-400 border border-rose-500/20"
        >
          <XCircle className="w-3.5 h-3.5" />
          <span>INCOMPATIBLE</span>
          {showScore && score !== undefined && <span className="opacity-80 font-mono">({score})</span>}
        </span>
      );
  }
};
