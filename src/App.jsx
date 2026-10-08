import React, { useState, useEffect, useMemo } from 'react';
import Navbar from './components/Navbar';
import PreferenceInput from './components/PreferenceInput';
import ProductCard from './components/ProductCard';
import RecommendationSummary from './components/RecommendationSummary';
import FilterBar from './components/FilterBar';
import SettingsModal from './components/SettingsModal';
import { PRODUCTS } from './data/products';
import { getStoredConfig, getAIRecommendations } from './services/aiService';
import { Sparkles, PackageSearch, Filter, CheckCircle2, Sliders } from 'lucide-react';

export default function App() {
  const [aiConfig, setAiConfig] = useState(getStoredConfig());
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Recommendations state
  const [recommendationData, setRecommendationData] = useState(null);
  const [activePrompt, setActivePrompt] = useState('');
  const [onlyRecommendedView, setOnlyRecommendedView] = useState(true);

  // Filter & sort state
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('featured');

  // Handle AI Recommendation Search
  const handleRecommend = async (prompt) => {
    setActivePrompt(prompt);
    setIsLoading(true);

    try {
      const result = await getAIRecommendations(prompt, PRODUCTS, aiConfig);
      setRecommendationData(result);
      setOnlyRecommendedView(true);
      setSortBy('ai-rank');
      setSelectedCategory('All');
    } catch (err) {
      console.error("Recommendation error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  // Reset recommendations to browse full catalog
  const handleResetRecommendations = () => {
    setRecommendationData(null);
    setActivePrompt('');
    setSortBy('featured');
    setSelectedCategory('All');
    setSearchQuery('');
  };

  // Compute filtered & sorted product list
  const displayedProducts = useMemo(() => {
    let list = [...PRODUCTS];

    const hasRecommendations = Boolean(
      recommendationData && 
      recommendationData.recommendedProductIds && 
      recommendationData.recommendedProductIds.length > 0
    );

    // If recommendation mode is active and user has "only recommended" toggled
    if (hasRecommendations && onlyRecommendedView) {
      const recIds = new Set(recommendationData.recommendedProductIds);
      list = list.filter(p => recIds.has(p.id));
    }

    // Category filter
    if (selectedCategory !== 'All') {
      list = list.filter(p => p.category === selectedCategory);
    }

    // Local search filter
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      list = list.filter(p => 
        p.name.toLowerCase().includes(q) ||
        p.description.toLowerCase().includes(q) ||
        p.tags.some(t => t.toLowerCase().includes(q))
      );
    }

    // Sorting
    list.sort((a, b) => {
      if (sortBy === 'ai-rank' && hasRecommendations) {
        const indexA = recommendationData.recommendedProductIds.indexOf(a.id);
        const indexB = recommendationData.recommendedProductIds.indexOf(b.id);
        const rankA = indexA !== -1 ? indexA : 999;
        const rankB = indexB !== -1 ? indexB : 999;
        return rankA - rankB;
      }
      if (sortBy === 'price-asc') return a.price - b.price;
      if (sortBy === 'price-desc') return b.price - a.price;
      if (sortBy === 'rating') return b.rating - a.rating;
      return 0; // 'featured' retains natural catalog order
    });

    return list;
  }, [recommendationData, onlyRecommendedView, selectedCategory, searchQuery, sortBy]);

  const recommendedSet = useMemo(() => {
    if (!recommendationData?.recommendedProductIds) return new Set();
    return new Set(recommendationData.recommendedProductIds);
  }, [recommendationData]);

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      {/* Navigation Bar */}
      <Navbar
        config={aiConfig}
        onOpenSettings={() => setIsSettingsOpen(true)}
        isRecommending={isLoading}
      />

      {/* Hero / Preference Input Card */}
      <PreferenceInput
        onSearch={handleRecommend}
        isLoading={isLoading}
        currentPrompt={activePrompt}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Recommendation Analysis Banner */}
        {recommendationData && (
          <RecommendationSummary
            recommendationData={recommendationData}
            onReset={handleResetRecommendations}
            totalCatalogCount={PRODUCTS.length}
            matchedCount={recommendationData.recommendedProductIds?.length || 0}
          />
        )}

        {/* View Toggle Bar (Only shown when recommendations are active) */}
        {recommendationData && (
          <div className="mb-6 flex flex-wrap items-center justify-between gap-3 p-3 bg-white rounded-2xl border border-slate-200">
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-slate-700">Display:</span>
              <button
                onClick={() => setOnlyRecommendedView(true)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition ${
                  onlyRecommendedView
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                Filtered AI Recommendations ({recommendationData.recommendedProductIds?.length || 0})
              </button>
              <button
                onClick={() => setOnlyRecommendedView(false)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition ${
                  !onlyRecommendedView
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                Entire Catalog ({PRODUCTS.length})
              </button>
            </div>

            <span className="text-xs text-slate-400">
              {onlyRecommendedView ? 'Filtering products based on AI match' : 'Showing all products with AI badges'}
            </span>
          </div>
        )}

        {/* Category & Sorting Controls */}
        <FilterBar
          selectedCategory={selectedCategory}
          onSelectCategory={setSelectedCategory}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          sortBy={sortBy}
          onSortChange={setSortBy}
          isRecommendationActive={Boolean(recommendationData)}
        />

        {/* Product Grid / Loading / Empty State */}
        {isLoading ? (
          /* Loading State */
          <div className="py-20 text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-indigo-50 text-indigo-600 mb-4 animate-bounce">
              <Sparkles className="w-8 h-8" />
            </div>
            <h3 className="text-lg font-bold text-slate-800 mb-1">
              Analyzing Products with AI...
            </h3>
            <p className="text-sm text-slate-500 max-w-md mx-auto">
              Scanning catalog specifications, pricing constraints, and feature tags to find your best matches.
            </p>
          </div>
        ) : displayedProducts.length === 0 ? (
          /* Empty State */
          <div className="py-16 text-center bg-white rounded-3xl border border-slate-200 p-8">
            <PackageSearch className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <h3 className="text-base font-bold text-slate-800 mb-1">
              No matching products found
            </h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto mb-4">
              Try adjusting your search filters or resetting recommendations to view our complete collection.
            </p>
            <button
              onClick={handleResetRecommendations}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-xl transition shadow-sm"
            >
              Reset to Full Catalog
            </button>
          </div>
        ) : (
          /* Product Cards Grid */
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {displayedProducts.map((product) => {
              const isRecommended = recommendedSet.has(product.id);
              const rank = isRecommended 
                ? recommendationData.recommendedProductIds.indexOf(product.id) + 1 
                : null;
              const aiReason = recommendationData?.itemReasons?.[product.id];

              return (
                <ProductCard
                  key={product.id}
                  product={product}
                  isRecommended={isRecommended}
                  recommendationRank={rank}
                  aiReason={aiReason}
                />
              );
            })}
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="mt-auto border-t border-slate-200 bg-white py-6 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p>© 2026 SmartPick AI - Product Recommendation Assessment Project</p>
          <div className="flex items-center gap-4 text-slate-400">
            <span>React + Vite</span>
            <span>•</span>
            <span>Tailwind CSS</span>
            <span>•</span>
            <span>OpenAI API & Smart Fallback</span>
          </div>
        </div>
      </footer>

      {/* API Key & Provider Settings Modal */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        onConfigSaved={(newConfig) => setAiConfig(newConfig)}
      />
    </div>
  );
}
