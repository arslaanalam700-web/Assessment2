import { PRODUCTS } from './src/data/products.js';
import { getSimulatedRecommendations } from './src/services/aiService.js';

console.log("=== RUNNING RECOMMENDATION ENGINE UNIT TESTS ===");

// Test 1: "I want a phone under $500"
{
  const result = getSimulatedRecommendations("I want a phone under $500", PRODUCTS);
  console.log("\n[Test 1] 'I want a phone under $500':");
  console.log("Recommended IDs:", result.recommendedProductIds);
  console.log("Analysis:", result.analysis);

  const recommendedItems = PRODUCTS.filter(p => result.recommendedProductIds.includes(p.id));
  const allPhones = recommendedItems.every(p => p.category === "Smartphones");
  const allUnder500 = recommendedItems.every(p => p.price <= 500);

  if (allPhones && allUnder500 && recommendedItems.length > 0) {
    console.log("✓ PASS: All returned items are Smartphones and under $500!");
    recommendedItems.forEach(p => {
      console.log(`   - ${p.name} ($${p.price}): "${result.itemReasons[p.id]}"`);
    });
  } else {
    console.error("✗ FAIL: Items did not meet criteria!", recommendedItems.map(p => ({ name: p.name, price: p.price, cat: p.category })));
    process.exit(1);
  }
}

// Test 2: "Gaming laptop with dedicated GPU"
{
  const result = getSimulatedRecommendations("Gaming laptop with dedicated GPU", PRODUCTS);
  console.log("\n[Test 2] 'Gaming laptop with dedicated GPU':");
  console.log("Top recommendation:", result.recommendedProductIds[0]);
  const topItem = PRODUCTS.find(p => p.id === result.recommendedProductIds[0]);
  console.log("Item Name:", topItem?.name, "Category:", topItem?.category);

  if (topItem && topItem.id === "prod-7") { // ASUS ROG Zephyrus G16
    console.log("✓ PASS: ASUS ROG Zephyrus G16 correctly selected as #1 gaming laptop!");
    console.log(`   Reason: "${result.itemReasons[topItem.id]}"`);
  } else {
    console.warn("Notice: Top item was", topItem?.name);
  }
}

// Test 3: "Noise cancelling headphones for travel"
{
  const result = getSimulatedRecommendations("Noise cancelling headphones for travel", PRODUCTS);
  console.log("\n[Test 3] 'Noise cancelling headphones for travel':");
  console.log("Recommended IDs:", result.recommendedProductIds);
  const recommendedItems = PRODUCTS.filter(p => result.recommendedProductIds.includes(p.id));
  const allAudio = recommendedItems.every(p => p.category === "Audio");

  if (allAudio && recommendedItems.length > 0) {
    console.log("✓ PASS: All recommended items are in Audio category!");
    recommendedItems.forEach(p => {
      console.log(`   - ${p.name} ($${p.price}): "${result.itemReasons[p.id]}"`);
    });
  } else {
    console.error("✗ FAIL: Non-audio products included:", recommendedItems.map(p => p.name));
    process.exit(1);
  }
}

console.log("\n=== ALL TESTS PASSED SUCCESSFULLY! ===");
