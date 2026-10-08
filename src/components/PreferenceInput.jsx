import React, { useState } from 'react';
import { Sparkles, ArrowRight, CornerDownLeft, X, Lightbulb } from 'lucide-react';

const SUGGESTIONS = [
  { label: '📱 Phone under $500', prompt: 'I want a phone under $500' },
  { label: '💻 Coding laptop with great battery', prompt: 'Lightweight laptop for coding with long battery life' },
  { label: '🎧 Noise-cancelling headphones', prompt: 'Best noise cancelling headphones for travel and flights' },
  { label: '⌚ Affordable fitness watch', prompt: 'Affordable fitness tracker under $100' },
  { label: '🎮 High performance gaming laptop', prompt: 'High performance gaming laptop with dedicated GPU' },
  { label: '⌨️ Ergonomic desk setup', prompt: 'Ergonomic keyboard and mouse accessories for long work hours' },
];

export default function PreferenceInput({ onSearch, isLoading, currentPrompt }) {
  const [input, setInput] = useState(currentPrompt || '');

  const handleSubmit = (e) => {
    if (e) e.preventDefault();
    if (!input.trim() || isLoading) return;
    onSearch(input.trim());
  };

  const handleSuggestionClick = (prompt) => {
    setInput(prompt);
    onSearch(prompt);
  };

  const handleClear = () => {
    setInput('');
  };

  return (
    <div className="bg-gradient-to-b from-indigo-50/60 via-slate-50 to-white pt-8 pb-10 border-b border-slate-200">
      <div className="max-w-4xl mx-auto px-4 sm:px-6">
        {/* Title */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-100/80 text-indigo-700 text-xs font-semibold mb-3">
            <Sparkles className="w-3.5 h-3.5" />
            AI-Powered Smart Recommendations
          </div>
          <h1 className="text-2xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            Find the perfect gear with AI
          </h1>
          <p className="mt-2 text-sm sm:text-base text-slate-600 max-w-xl mx-auto">
            Describe what you need in plain English — budget, specs, use-case, or brand — and let our AI match the best products.
          </p>
        </div>

        {/* Input Box */}
        <form onSubmit={handleSubmit} className="relative">
          <div className="relative flex items-center bg-white rounded-2xl shadow-lg shadow-indigo-100/50 border border-slate-200 focus-within:border-indigo-500 focus-within:ring-4 focus-within:ring-indigo-100 transition-all p-2">
            <div className="pl-3 pr-2 text-indigo-500">
              <Sparkles className={`w-5 h-5 ${isLoading ? 'animate-spin' : ''}`} />
            </div>

            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="e.g., I want a phone under $500, or a fast laptop for video editing..."
              className="w-full py-2.5 px-2 text-sm sm:text-base text-slate-800 placeholder-slate-400 bg-transparent focus:outline-none"
              disabled={isLoading}
            />

            {input && (
              <button
                type="button"
                onClick={handleClear}
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100 transition mr-1"
                title="Clear input"
              >
                <X className="w-4 h-4" />
              </button>
            )}

            <button
              type="submit"
              disabled={!input.trim() || isLoading}
              className="flex items-center gap-2 px-5 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white font-medium text-sm transition shadow-md shadow-indigo-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none"
            >
              {isLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  <span>Thinking...</span>
                </>
              ) : (
                <>
                  <span className="hidden sm:inline">Recommend</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </div>
        </form>

        {/* Quick Suggestion Chips */}
        <div className="mt-4 flex flex-wrap items-center gap-2">
          <span className="text-xs font-medium text-slate-500 flex items-center gap-1 mr-1">
            <Lightbulb className="w-3.5 h-3.5 text-amber-500" />
            Try:
          </span>
          {SUGGESTIONS.map((item, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => handleSuggestionClick(item.prompt)}
              disabled={isLoading}
              className="text-xs font-medium px-3 py-1.5 rounded-full bg-white border border-slate-200 hover:border-indigo-300 hover:bg-indigo-50/50 text-slate-700 hover:text-indigo-700 transition shadow-2xs"
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
