// Service to handle AI-powered product recommendations

const STORAGE_KEYS = {
  API_KEY: 'ai_recom_api_key',
  PROVIDER: 'ai_recom_provider',
  MODEL: 'ai_recom_model',
  BASE_URL: 'ai_recom_base_url'
};

export const AI_PROVIDERS = [
  { id: 'openai', name: 'OpenAI (GPT-4o mini)', defaultModel: 'gpt-4o-mini', baseUrl: 'https://api.openai.com/v1' },
  { id: 'groq', name: 'Groq (Llama 3.3 70B)', defaultModel: 'llama-3.3-70b-versatile', baseUrl: 'https://api.groq.com/openai/v1' },
  { id: 'custom', name: 'OpenAI-Compatible Custom Endpoint', defaultModel: 'gpt-3.5-turbo', baseUrl: '' }
];

export function getStoredConfig() {
  const envKey = (typeof import.meta !== 'undefined' && import.meta.env?.VITE_OPENAI_API_KEY) || '';
  const storage = typeof localStorage !== 'undefined' ? localStorage : { getItem: () => null, setItem: () => {}, removeItem: () => {} };
  return {
    apiKey: storage.getItem(STORAGE_KEYS.API_KEY) || envKey,
    provider: storage.getItem(STORAGE_KEYS.PROVIDER) || 'openai',
    model: storage.getItem(STORAGE_KEYS.MODEL) || 'gpt-4o-mini',
    baseUrl: storage.getItem(STORAGE_KEYS.BASE_URL) || 'https://api.openai.com/v1'
  };
}

export function saveStoredConfig({ apiKey, provider, model, baseUrl }) {
  if (apiKey !== undefined) localStorage.setItem(STORAGE_KEYS.API_KEY, apiKey.trim());
  if (provider !== undefined) localStorage.setItem(STORAGE_KEYS.PROVIDER, provider);
  if (model !== undefined) localStorage.setItem(STORAGE_KEYS.MODEL, model.trim());
  if (baseUrl !== undefined) localStorage.setItem(STORAGE_KEYS.BASE_URL, baseUrl.trim());
}

export function clearStoredConfig() {
  localStorage.removeItem(STORAGE_KEYS.API_KEY);
  localStorage.removeItem(STORAGE_KEYS.PROVIDER);
  localStorage.removeItem(STORAGE_KEYS.MODEL);
  localStorage.removeItem(STORAGE_KEYS.BASE_URL);
}

/**
 * Intelligent client-side NLP recommendation engine.
 * Serves as an immediate, zero-setup AI simulator when no API key is provided,
 * accurately matching budgets, categories, specs, and user intents.
 */
export function getSimulatedRecommendations(userPrompt, products) {
  const promptLower = userPrompt.toLowerCase().trim();

  // Extract budget constraint
  let maxBudget = null;
  let minBudget = null;

  // Patterns like "under $500", "under 500", "below $300", "< 400", "less than $1000"
  const underMatch = promptLower.match(/(?:under|below|less than|max|budget of|\<|\<\=)\s*\$?(\d+(?:\.\d+)?)/i);
  if (underMatch) {
    maxBudget = parseFloat(underMatch[1]);
  }

  // Patterns like "above $100", "more than $500", "> 200"
  const aboveMatch = promptLower.match(/(?:above|more than|over|at least|\>|\>\=)\s*\$?(\d+(?:\.\d+)?)/i);
  if (aboveMatch) {
    minBudget = parseFloat(aboveMatch[1]);
  }

  // Patterns like "between 300 and 600"
  const betweenMatch = promptLower.match(/between\s*\$?(\d+)\s*(?:and|to|-)\s*\$?(\d+)/i);
  if (betweenMatch) {
    minBudget = parseFloat(betweenMatch[1]);
    maxBudget = parseFloat(betweenMatch[2]);
  }

  // Keyword intents
  const intentKeywords = {
    Smartphones: ['phone', 'phones', 'smartphone', 'smartphones', 'mobile', 'android', 'iphone', 'pixel', 'samsung', '5g', 'cellular'],
    Laptops: ['laptop', 'laptops', 'macbook', 'notebook', 'computer', 'pc', 'ideapad', 'rog', 'zenbook'],
    Audio: ['headphone', 'headphones', 'earbud', 'earbuds', 'audio', 'sound', 'music', 'anc', 'noise cancel', 'airpods', 'soundcore'],
    Wearables: ['watch', 'smartwatch', 'tracker', 'fitness', 'garmin', 'band', 'apple watch', 'wearable', 'health', 'steps', 'running'],
    Accessories: ['accessory', 'accessories', 'mouse', 'keyboard', 'monitor', 'display', 'screen', 'desk', 'ergonomic', 'mechanical']
  };

  const featureKeywords = {
    gaming: ['gaming', 'game', 'gpu', 'fps', 'rtx'],
    coding: ['coding', 'developer', 'programming', 'code', 'software'],
    travel: ['travel', 'flight', 'airplane', 'commute', 'noise cancelling', 'portable'],
    battery: ['battery', 'all-day', 'long lasting', 'endurance'],
    camera: ['camera', 'photo', 'photography', 'video', 'pictures'],
    budget: ['budget', 'cheap', 'affordable', 'inexpensive', 'value', 'low cost'],
    premium: ['premium', 'flagship', 'luxury', 'pro', 'best', 'high-end', 'top']
  };

  // Detect explicit user category preferences with proper word boundary matching
  const hasWord = (text, word) => {
    // If the keyword contains spaces, use includes; otherwise match whole word
    if (word.includes(' ')) {
      return text.includes(word);
    }
    const regex = new RegExp(`\\b${word}\\b`, 'i');
    return regex.test(text);
  };

  const requestedCategories = [];
  for (const [catName, words] of Object.entries(intentKeywords)) {
    if (words.some(w => hasWord(promptLower, w))) {
      requestedCategories.push(catName);
    }
  }

  const scoredProducts = products.map(product => {
    let score = 0;
    const reasons = [];

    // Category match enforcement
    if (requestedCategories.length > 0) {
      if (requestedCategories.includes(product.category)) {
        score += 60;
        reasons.push(`Direct match for requested category (${product.category})`);
      } else {
        score -= 200; // Strong penalty if user explicitly asked for another category
      }
    }

    // Budget check
    if (maxBudget !== null) {
      if (product.price <= maxBudget) {
        score += 45;
        reasons.push(`Priced at $${product.price}, well within your $${maxBudget} budget`);
      } else {
        score -= 200; // Disqualify products exceeding the requested maximum budget
      }
    }

    if (minBudget !== null) {
      if (product.price >= minBudget) {
        score += 20;
      } else {
        score -= 200;
      }
    }

    // Direct name / brand / tag mentions
    const searchString = `${product.name} ${product.description} ${product.features.join(' ')} ${product.tags.join(' ')}`.toLowerCase();

    // Check specific feature words
    for (const [feat, words] of Object.entries(featureKeywords)) {
      if (words.some(w => hasWord(promptLower, w))) {
        if (words.some(w => hasWord(searchString, w))) {
          score += 20;
          reasons.push(`Optimized for ${feat} requirements`);
        }
      }
    }

    // Exact word overlap
    const queryTokens = promptLower.replace(/[^a-z0-9\s]/g, '').split(/\s+/).filter(t => t.length > 2);
    for (const token of queryTokens) {
      if (['the', 'and', 'for', 'with', 'want', 'need', 'under', 'below', 'from', 'best'].includes(token)) continue;
      if (searchString.includes(token)) {
        score += 10;
      }
    }

    // Bonus for high ratings
    if (product.rating >= 4.7) {
      score += 5;
    }

    // Default reason fallback
    let customReason = reasons.length > 0 
      ? reasons.join('. ') + '.'
      : `Matches relevant features with a strong ${product.rating}★ user rating.`;

    return {
      product,
      score,
      reason: customReason
    };
  });

  // Filter products with score > 0 and sort descending
  let recommendations = scoredProducts
    .filter(item => item.score > 10)
    .sort((a, b) => b.score - a.score);

  // If no match found or query was very broad, fall back to top rated matching or general top picks
  if (recommendations.length === 0) {
    recommendations = scoredProducts
      .filter(item => {
        if (maxBudget !== null && item.product.price > maxBudget) return false;
        return true;
      })
      .sort((a, b) => b.product.rating - a.product.rating)
      .slice(0, 4)
      .map(item => ({
        ...item,
        reason: maxBudget !== null 
          ? `Fits your $${maxBudget} budget constraint with an outstanding ${item.product.rating}★ rating.`
          : `Selected based on popularity and versatile feature set.`
      }));
  }

  const topItems = recommendations.slice(0, 6);
  const recommendedProductIds = topItems.map(item => item.product.id);
  const itemReasons = {};
  topItems.forEach(item => {
    itemReasons[item.product.id] = item.reason;
  });

  const analysis = topItems.length > 0
    ? `Identified ${topItems.length} product${topItems.length > 1 ? 's' : ''} tailored to your request "${userPrompt}". ${
        maxBudget ? `All recommendations respect your budget threshold of $${maxBudget}.` : ''
      }`
    : `Could not find exact matches for "${userPrompt}". Showing best alternatives.`;

  return {
    recommendedProductIds,
    analysis,
    itemReasons,
    confidence: topItems.length > 0 ? 94 : 50,
    source: 'built-in-engine'
  };
}

/**
 * Request recommendations from OpenAI or compatible LLM API.
 */
export async function getAIRecommendations(userPrompt, products, configOverrides = {}) {
  const config = { ...getStoredConfig(), ...configOverrides };

  // If no API key is configured, transparently use the simulated engine
  if (!config.apiKey) {
    // Add realistic AI processing delay for realistic UX
    await new Promise(res => setTimeout(res, 600));
    return getSimulatedRecommendations(userPrompt, products);
  }

  // Prepare condensed catalog to send to AI
  const catalogContext = products.map(p => ({
    id: p.id,
    name: p.name,
    category: p.category,
    price: p.price,
    rating: p.rating,
    features: p.features,
    tags: p.tags,
    description: p.description
  }));

  const systemPrompt = `You are an expert e-commerce product recommendation AI.
Your goal is to analyze the user's natural language preferences and recommend the most suitable products strictly from the provided catalog.

Rules:
1. Strictly follow constraints mentioned by the user (e.g., budget limits like "under $500", category, use cases like "gaming" or "coding").
2. Only select products whose ID exists in the catalog.
3. Provide a clear, natural-sounding reason for why each selected product fits the user's specific request.
4. Return ONLY a valid JSON object matching the requested schema with no extra commentary or markdown codeblocks outside JSON.

JSON Schema:
{
  "recommendedProductIds": ["prod-1", "prod-2"],
  "analysis": "A concise 1-2 sentence overview explaining the recommendation strategy.",
  "itemReasons": {
    "prod-1": "Specific reason why this product fits the user's preference...",
    "prod-2": "Specific reason why this product fits the user's preference..."
  },
  "confidence": 95
}`;

  const userMessage = `User Preference: "${userPrompt}"

Available Product Catalog:
${JSON.stringify(catalogContext, null, 2)}

Provide your recommendations strictly as JSON.`;

  const baseUrl = config.baseUrl.replace(/\/+$/, '');
  const endpoint = `${baseUrl}/chat/completions`;

  try {
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${config.apiKey}`
      },
      body: JSON.stringify({
        model: config.model || 'gpt-4o-mini',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userMessage }
        ],
        temperature: 0.3,
        response_format: { type: 'json_object' }
      })
    });

    if (!response.ok) {
      const errBody = await response.json().catch(() => ({}));
      const errMsg = errBody.error?.message || `API Error: ${response.status} ${response.statusText}`;
      throw new Error(errMsg);
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;
    if (!content) {
      throw new Error("No response content received from AI API.");
    }

    // Parse JSON safely
    const cleaned = content.trim().replace(/^```json/i, '').replace(/```$/i, '').trim();
    const parsed = JSON.parse(cleaned);

    // Validate structure
    const recommendedProductIds = Array.isArray(parsed.recommendedProductIds) 
      ? parsed.recommendedProductIds.filter(id => products.some(p => p.id === id))
      : [];

    return {
      recommendedProductIds,
      analysis: parsed.analysis || `Found ${recommendedProductIds.length} recommendations matching your preferences.`,
      itemReasons: parsed.itemReasons || {},
      confidence: parsed.confidence || 95,
      source: `api (${config.model})`
    };
  } catch (error) {
    console.warn("External AI API failed, falling back to built-in recommendation engine:", error);
    const fallback = getSimulatedRecommendations(userPrompt, products);
    return {
      ...fallback,
      warning: `External AI API failed (${error.message}). Switched to built-in recommendation engine.`,
      source: 'built-in-engine (fallback)'
    };
  }
}

/**
 * Simple test ping to verify user API key
 */
export async function testApiKeyConnection(apiKey, baseUrl = 'https://api.openai.com/v1', model = 'gpt-4o-mini') {
  try {
    const endpoint = `${baseUrl.replace(/\/+$/, '')}/chat/completions`;
    const res = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey.trim()}`
      },
      body: JSON.stringify({
        model,
        messages: [{ role: 'user', content: 'Say "OK"' }],
        max_tokens: 5
      })
    });

    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      return { success: false, error: data.error?.message || `Status ${res.status}` };
    }

    return { success: true };
  } catch (err) {
    return { success: false, error: err.message };
  }
}
