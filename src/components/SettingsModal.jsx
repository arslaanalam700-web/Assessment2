import React, { useState, useEffect } from 'react';
import { X, Key, CheckCircle, AlertCircle, RefreshCw, Eye, EyeOff, ShieldCheck, Sparkles, HelpCircle } from 'lucide-react';
import { AI_PROVIDERS, getStoredConfig, saveStoredConfig, clearStoredConfig, testApiKeyConnection } from '../services/aiService';

export default function SettingsModal({ isOpen, onClose, onConfigSaved }) {
  const [config, setConfig] = useState({
    apiKey: '',
    provider: 'openai',
    model: 'gpt-4o-mini',
    baseUrl: 'https://api.openai.com/v1'
  });
  const [showKey, setShowKey] = useState(false);
  const [isTesting, setIsTesting] = useState(false);
  const [testResult, setTestResult] = useState(null); // { success: boolean, message: string }
  const [savedSuccess, setSavedSuccess] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setConfig(getStoredConfig());
      setTestResult(null);
      setSavedSuccess(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleProviderChange = (providerId) => {
    const selected = AI_PROVIDERS.find(p => p.id === providerId);
    setConfig(prev => ({
      ...prev,
      provider: providerId,
      model: selected?.defaultModel || prev.model,
      baseUrl: selected?.baseUrl || prev.baseUrl
    }));
    setTestResult(null);
  };

  const handleTestConnection = async () => {
    if (!config.apiKey.trim()) {
      setTestResult({ success: false, message: 'Please enter an API key first.' });
      return;
    }
    setIsTesting(true);
    setTestResult(null);
    const result = await testApiKeyConnection(config.apiKey, config.baseUrl, config.model);
    setIsTesting(false);
    if (result.success) {
      setTestResult({ success: true, message: 'Connection successful! Ready to recommend.' });
    } else {
      setTestResult({ success: false, message: `Connection failed: ${result.error}` });
    }
  };

  const handleSave = (e) => {
    e.preventDefault();
    saveStoredConfig(config);
    setSavedSuccess(true);
    onConfigSaved(config);
    setTimeout(() => {
      onClose();
    }, 600);
  };

  const handleReset = () => {
    clearStoredConfig();
    setConfig({
      apiKey: '',
      provider: 'openai',
      model: 'gpt-4o-mini',
      baseUrl: 'https://api.openai.com/v1'
    });
    setTestResult(null);
    onConfigSaved({
      apiKey: '',
      provider: 'openai',
      model: 'gpt-4o-mini',
      baseUrl: 'https://api.openai.com/v1'
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
      <div className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/70">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-indigo-100 text-indigo-600 rounded-xl">
              <Key className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-base">AI Configuration</h3>
              <p className="text-xs text-slate-500">Configure external AI provider or use built-in engine</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-200/50 rounded-xl transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSave} className="p-6 space-y-4">
          {/* Note Box */}
          <div className="p-3.5 rounded-2xl bg-indigo-50/70 border border-indigo-100 text-xs text-indigo-900 space-y-1">
            <div className="flex items-center gap-1.5 font-semibold text-indigo-950">
              <Sparkles className="w-4 h-4 text-indigo-600" />
              <span>Zero-Setup Fallback Enabled</span>
            </div>
            <p className="text-slate-600 leading-relaxed">
              If no API key is provided, the application automatically uses the <strong>Built-in Intelligent Recommendation Engine</strong>. You can test prompts immediately without entering a key!
            </p>
          </div>

          {/* Provider Selection */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              AI Provider
            </label>
            <div className="grid grid-cols-3 gap-2">
              {AI_PROVIDERS.map(p => (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => handleProviderChange(p.id)}
                  className={`px-3 py-2 rounded-xl text-xs font-medium border text-center transition ${
                    config.provider === p.id
                      ? 'border-indigo-600 bg-indigo-50/80 text-indigo-700 font-bold'
                      : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  {p.name.split(' ')[0]}
                </button>
              ))}
            </div>
          </div>

          {/* API Key Input */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-semibold text-slate-700">
                API Key
              </label>
              <span className="text-[11px] text-slate-400">Stored locally in your browser</span>
            </div>
            <div className="relative">
              <input
                type={showKey ? 'text' : 'password'}
                value={config.apiKey}
                onChange={(e) => {
                  setConfig({ ...config, apiKey: e.target.value });
                  setTestResult(null);
                }}
                placeholder="sk-..."
                className="w-full px-3.5 py-2.5 text-xs font-mono bg-white border border-slate-200 rounded-xl focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 pr-10"
              />
              <button
                type="button"
                onClick={() => setShowKey(!showKey)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                {showKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Model Name */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Model Name
              </label>
              <input
                type="text"
                value={config.model}
                onChange={(e) => setConfig({ ...config, model: e.target.value })}
                placeholder="gpt-4o-mini"
                className="w-full px-3 py-2 text-xs bg-white border border-slate-200 rounded-xl focus:outline-none focus:border-indigo-500 font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Base URL
              </label>
              <input
                type="text"
                value={config.baseUrl}
                onChange={(e) => setConfig({ ...config, baseUrl: e.target.value })}
                placeholder="https://api.openai.com/v1"
                className="w-full px-3 py-2 text-xs bg-white border border-slate-200 rounded-xl focus:outline-none focus:border-indigo-500 font-mono"
              />
            </div>
          </div>

          {/* Test Connection Button & Status */}
          <div className="pt-1">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleTestConnection}
                disabled={isTesting || !config.apiKey.trim()}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-300 hover:bg-slate-50 text-slate-700 text-xs font-medium transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isTesting ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin text-indigo-600" />
                    <span>Verifying...</span>
                  </>
                ) : (
                  <>
                    <ShieldCheck className="w-3.5 h-3.5 text-indigo-600" />
                    <span>Test API Key</span>
                  </>
                )}
              </button>

              {testResult && (
                <div className={`flex items-center gap-1 text-xs ${testResult.success ? 'text-emerald-600 font-medium' : 'text-rose-600'}`}>
                  {testResult.success ? <CheckCircle className="w-4 h-4 shrink-0" /> : <AlertCircle className="w-4 h-4 shrink-0" />}
                  <span className="line-clamp-1">{testResult.message}</span>
                </div>
              )}
            </div>
          </div>

          {/* Footer Actions */}
          <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
            <button
              type="button"
              onClick={handleReset}
              className="text-xs text-rose-600 hover:text-rose-700 font-medium hover:underline"
            >
              Clear Key & Reset
            </button>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 transition"
              >
                Cancel
              </button>

              <button
                type="submit"
                className="px-5 py-2 rounded-xl text-xs font-semibold bg-indigo-600 hover:bg-indigo-700 text-white shadow-md shadow-indigo-200 transition"
              >
                {savedSuccess ? 'Saved!' : 'Save Settings'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
