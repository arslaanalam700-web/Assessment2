import React from 'react';
import { Sparkles, Key, Cpu, CheckCircle2, SlidersHorizontal } from 'lucide-react';

export default function Navbar({ config, onOpenSettings, isRecommending }) {
  const hasKey = Boolean(config.apiKey && config.apiKey.trim().length > 0);

  return (
    <header className="sticky top-0 z-30 bg-white/90 backdrop-blur-md border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-purple-500 flex items-center justify-center text-white shadow-md shadow-indigo-200">
              <Sparkles className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-lg text-slate-900 tracking-tight">SmartPick</span>
                <span className="px-1.5 py-0.5 text-[10px] font-semibold tracking-wider uppercase bg-indigo-100 text-indigo-700 rounded-md">
                  AI
                </span>
              </div>
              <p className="text-xs text-slate-500 hidden sm:block">Intelligent Product Recommendation Engine</p>
            </div>
          </div>

          {/* Right Action / Status */}
          <div className="flex items-center gap-3">
            {/* Status indicator */}
            <div 
              onClick={onOpenSettings}
              className="cursor-pointer group flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium border border-slate-200 bg-slate-50 hover:bg-slate-100 transition"
              title="Click to configure AI API settings"
            >
              {hasKey ? (
                <>
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>
                  <span className="text-emerald-700 font-medium hidden md:inline">Live AI API Connected</span>
                  <span className="text-slate-600 font-mono text-[11px]">({config.model})</span>
                </>
              ) : (
                <>
                  <Cpu className="w-3.5 h-3.5 text-indigo-600" />
                  <span className="text-slate-700 font-medium">Built-in AI Engine</span>
                  <span className="px-1.5 py-0.2 text-[10px] bg-slate-200 text-slate-600 rounded">Zero-Config</span>
                </>
              )}
            </div>

            {/* API Settings Button */}
            <button
              onClick={onOpenSettings}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 hover:text-indigo-600 bg-white hover:bg-indigo-50 border border-slate-200 hover:border-indigo-200 rounded-lg transition shadow-sm"
            >
              <Key className="w-3.5 h-3.5" />
              <span>API Settings</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
