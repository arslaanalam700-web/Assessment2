import React from 'react';
import { Sparkles, CheckCircle2, RotateCcw, AlertTriangle, Layers } from 'lucide-react';

export default function RecommendationSummary({
  recommendationData,
  onReset,
  totalCatalogCount,
  matchedCount
}) {
  if (!recommendationData) return null;

  const { analysis, confidence, source, warning } = recommendationData;

  return (
    <div className="mb-8 bg-gradient-to-r from-indigo-50 via-purple-50 to-pink-50/40 border border-indigo-200/80 rounded-2xl p-5 shadow-sm">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Left: AI Icon + Analysis */}
        <div className="flex items-start gap-3.5">
          <div className="mt-0.5 p-2.5 rounded-xl bg-indigo-600 text-white shadow-sm shadow-indigo-300 shrink-0">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2 mb-1">
              <h2 className="text-sm font-bold uppercase tracking-wider text-indigo-900">
                AI Recommendation Analysis
              </h2>
              {confidence && (
                <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" />
                  {confidence}% Match Confidence
                </span>
              )}
              {source && (
                <span className="text-[11px] font-medium px-2 py-0.5 rounded-full bg-indigo-100/80 text-indigo-800">
                  Engine: {source}
                </span>
              )}
            </div>
            <p className="text-sm text-slate-700 leading-relaxed font-normal">
              {analysis}
            </p>
            {warning && (
              <div className="mt-2 flex items-center gap-1.5 text-xs text-amber-800 bg-amber-50 border border-amber-200 px-2.5 py-1 rounded-lg">
                <AlertTriangle className="w-3.5 h-3.5 shrink-0 text-amber-600" />
                <span>{warning}</span>
              </div>
            )}
          </div>
        </div>

        {/* Right: Controls & Stats */}
        <div className="flex items-center gap-3 shrink-0 self-end md:self-center">
          <div className="text-right hidden sm:block">
            <div className="text-xs text-slate-500">Showing matches</div>
            <div className="text-sm font-bold text-slate-800">
              {matchedCount} of {totalCatalogCount} products
            </div>
          </div>

          <button
            onClick={onReset}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-slate-700 hover:text-indigo-700 bg-white hover:bg-slate-50 border border-slate-300 rounded-xl transition shadow-2xs"
            title="Reset to full catalog"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Show All Products</span>
          </button>
        </div>
      </div>
    </div>
  );
}
