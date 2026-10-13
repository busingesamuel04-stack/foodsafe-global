import { ScannedProduct, ProductAdditiveInfo, HealthImpact, ProductAlternative, FoodAlert } from '@/types';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import { mockAlerts } from '@/lib/data/mockAlerts';

// 1. ADDITIVES KNOWLEDGE BASE (E-Numbers & Plain Language Explanations)
export const ADDITIVES_DATABASE: Record<string, ProductAdditiveInfo> = {
  'e150d': {
    code: 'E150d',
    name: 'Caramel IV (Sulphite Ammonia Caramel)',
    purpose: 'Artificial Brown Colouring',
    riskLevel: 'caution',
    description: 'Produced by heating sugars with ammonia and sulphites. Contains trace manufacturing by-products (4-MEI) that are under continued international toxicological review.'
  },
  'e338': {
    code: 'E338',
    name: 'Phosphoric Acid',
    purpose: 'Acidifier & Sharp Flavor Enhancer',
    riskLevel: 'caution',
    description: 'Provides tart, acidic bite in dark colas. Regular heavy consumption accelerates dental enamel erosion and can affect mineral balance in bones.'
  },
  'e211': {
    code: 'E211',
    name: 'Sodium Benzoate',
    purpose: 'Chemical Antimicrobial Preservative',
    riskLevel: 'caution',
    description: 'Inhibits yeast, mold, and bacteria in acidic beverages. When combined with Vitamin C (Ascorbic Acid) under heat, trace benzene formation can occur.'
  },
  'e951': {
    code: 'E951',
    name: 'Aspartame',
    purpose: 'Intense Low-Calorie Artificial Sweetener',
    riskLevel: 'caution',
    description: '200x sweeter than sugar. Evaluated by WHO IARC as Group 2B (possibly carcinogenic) while acceptable daily intake (ADI) limits remain monitored.'
  },
  'e950': {
    code: 'E950',
    name: 'Acesulfame Potassium (Ace-K)',
    purpose: 'Non-Nutritive Artificial Sweetener',
    riskLevel: 'safe',
    description: 'Calorie-free sweetener often combined with aspartame or sucralose to mask bitter aftertastes. Excreted unchanged by the kidneys.'
  },
  'e955': {
    code: 'E955',
    name: 'Sucralose',
    purpose: 'Chlorinated High-Intensity Sweetener',
    riskLevel: 'safe',
    description: 'Derived from sucrose through selective chlorination. 600x sweeter than sugar with zero caloric yield.'
  },
  'e102': {
    code: 'E102',
    name: 'Tartrazine (Yellow 5)',
    purpose: 'Synthetic Azo Colouring',
    riskLevel: 'caution',
    description: 'Synthetic yellow dye derived from petroleum. Banned or required to carry childhood attention deficit warnings in the EU.'
  },
  'e129': {
    code: 'E129',
    name: 'Allura Red AC (Red 40)',
    purpose: 'Synthetic Azo Red Colouring',
    riskLevel: 'caution',
    description: 'Common red dye found in sodas, candies, and fruit snacks. Can provoke mild allergic reactions in aspirin-sensitive consumers.'
  },
  'e250': {
    code: 'E250',
    name: 'Sodium Nitrite',
    purpose: 'Curing Salt & Botulism Inhibitor',
    riskLevel: 'high_concern',
    description: 'Used in cured and processed meats (bacon, sausages). Reacts with amines in meat during high-heat frying to generate carcinogenic nitrosamines.'
  },
  'e621': {
    code: 'E621',
    name: 'Monosodium Glutamate (MSG)',
    purpose: 'Umami Savory Flavor Enhancer',
    riskLevel: 'safe',
    description: 'Naturally occurring amino acid salt. Extensively tested by JECFA and recognized as non-toxic for general consumption.'
  },
  'e407': {
    code: 'E407',
    name: 'Carrageenan',
    purpose: 'Seaweed Hydrocolloid Thickener',
    riskLevel: 'caution',
    description: 'Extracted from red seaweed to stabilize plant milks and ice cream. May cause mild intestinal bloating in sensitive individuals.'
  },
  'e300': {
    code: 'E300',
    name: 'Ascorbic Acid (Vitamin C)',
    purpose: 'Natural Antioxidant & Nutrient',
    riskLevel: 'safe',
    description: 'Essential nutrient used safely as an antioxidant to prevent browning and preserve freshness.'
  },
  'e322': {
    code: 'E322',
    name: 'Lecithins (Soy / Sunflower)',
    purpose: 'Natural Emulsifier',
    riskLevel: 'safe',
    description: 'Natural phospholipid derived from seeds. Keeps oils and water blended smoothly in chocolate and baked goods.'
  }
};

// 2. CURATED SAMPLE DEMO PRODUCTS (For immediate 1-click testing & offline use)
export const DEMO_PRODUCTS: ScannedProduct[] = [
  {
    barcode: '5449000000996',
    name: 'Classic Carbonated Cola (Original Formula)',
    brand: 'The Coca-Cola Company',
    category: 'Carbonated Soft Drinks',
    imageUrl: 'https://images.openfoodfacts.org/images/products/544/900/000/0996/front_en.1121.400.jpg',
    ingredientsText: 'Carbonated water, sugar, caramel color (E150d), phosphoric acid (E338), natural flavorings, caffeine.',
    ingredientsList: [
      'Carbonated Water',
      'Sugar',
      'Caramel Color (E150d)',
      'Phosphoric Acid (E338)',
      'Natural Flavorings',
      'Caffeine'
    ],
    nutriments: {
      caloriesPer100g: 42,
      sugarsPer100g: 10.6,
      fatPer100g: 0,
      saturatedFatPer100g: 0,
      saltPer100g: 0,
      proteinsPer100g: 0,
      sodiumPer100g: 0
    },
    nutriscoreGrade: 'e',
    novaGroup: 4,
    servingSize: '330 ml (Can)',
    sugarCubesCount: 9, // ~35g per can / 4g per cube = ~9 cubes
    additives: [
      ADDITIVES_DATABASE['e150d'],
      ADDITIVES_DATABASE['e338']
    ],
    allergens: [],
    healthImpacts: [
      {
        type: 'concern',
        title: 'Very High Simple Sugar Load',
        description: 'Contains 10.6g of free sugar per 100ml. A standard 330ml can delivers 35g of sugar — exceeding the recommended WHO daily adult maximum (25g).'
      },
      {
        type: 'concern',
        title: 'Dental Enamel Erosion Risk',
        description: 'Phosphoric acid lowers drink pH to approximately 2.5, causing direct surface demineralization of tooth enamel if consumed frequently.'
      },
      {
        type: 'concern',
        title: 'Ultra-Processed Formulation (NOVA 4)',
        description: 'Industrial blend with chemical coloring and isolated acidifiers with negligible micronutrient density.'
      },
      {
        type: 'positive',
        title: 'Zero Fat & Saturated Fat',
        description: 'Contains no saturated lipids or animal fats.'
      }
    ],
    alternatives: [
      {
        name: 'Sparkling Spring Water with Fresh Lime Slice',
        category: 'Effervescent Beverage',
        whyBetter: 'Maintains crisp carbonation with zero added sugar and 0 chemical additives.',
        sugarComparison: '0g vs 35g sugar'
      },
      {
        name: 'Cold-Brewed Hibiscus & Berry Iced Tea',
        category: 'Herbal Infusion',
        whyBetter: 'Naturally rich in anthocyanin antioxidants, tart citric notes, and naturally caffeine-free.',
        sugarComparison: '0g vs 35g sugar'
      },
      {
        name: 'Raw Coconut Water (Unsweetened)',
        category: 'Electrolyte Hydration',
        whyBetter: 'Provides natural potassium and magnesium electrolytes without processed caramel IV dye.',
        sugarComparison: '8g natural vs 35g refined sugar'
      }
    ],
    source: 'open_food_facts'
  },
  {
    barcode: '7622210449283',
    name: 'Vanilla Creme Sandwich Cookies',
    brand: 'Mondelez / Oreo',
    category: 'Biscuits & Confectionery',
    imageUrl: 'https://images.openfoodfacts.org/images/products/762/221/044/9283/front_en.165.400.jpg',
    ingredientsText: 'Wheat flour, sugar, palm oil, fat reduced cocoa powder (4.3%), wheat starch, glucose-fructose syrup, raising agents (E501, E503, E500), salt, emulsifier (soya lecithin E322), acidity regulator (E524), vanillin flavoring.',
    ingredientsList: [
      'Wheat Flour',
      'Sugar',
      'Palm Oil',
      'Fat Reduced Cocoa Powder (4.3%)',
      'Wheat Starch',
      'Glucose-Fructose Syrup',
      'Raising Agents (E500, E501, E503)',
      'Salt',
      'Soya Lecithin (E322)',
      'Vanillin Flavoring'
    ],
    nutriments: {
      caloriesPer100g: 474,
      sugarsPer100g: 38,
      fatPer100g: 19,
      saturatedFatPer100g: 5.2,
      saltPer100g: 0.74,
      proteinsPer100g: 5.4,
      fiberPer100g: 2.7
    },
    nutriscoreGrade: 'e',
    novaGroup: 4,
    servingSize: '4 cookies (44g)',
    sugarCubesCount: 4,
    additives: [
      ADDITIVES_DATABASE['e322']
    ],
    allergens: ['Wheat (Gluten)', 'Soya'],
    healthImpacts: [
      {
        type: 'concern',
        title: 'High Calorie & Refined Fat Density',
        description: 'Contains 474 kcal/100g driven by refined palm oil fats and high-fructose corn syrup.'
      },
      {
        type: 'concern',
        title: 'Refined Carbohydrate Blend',
        description: 'Over 38% refined simple sugars combined with bleached wheat starch, leading to sharp glycemic spikes.'
      },
      {
        type: 'positive',
        title: 'Contains Flavanol Cocoa & Low Salt',
        description: 'Includes genuine cocoa solids and moderate overall sodium levels.'
      }
    ],
    alternatives: [
      {
        name: 'Artisan Rolled Oat & Honey Crisps',
        category: 'Whole Grain Bakery',
        whyBetter: 'Baked with complex beta-glucan fiber oats instead of refined starch, promoting steady digestion.',
        sugarComparison: '12g vs 38g sugar'
      },
      {
        name: 'Roasted Peanuts with 70% Dark Chocolate Nibs',
        category: 'Whole Food Snack',
        whyBetter: 'High satiety from plant-based monounsaturated fats and essential minerals without palm oil.',
        sugarComparison: '7g vs 38g sugar'
      }
    ],
    source: 'open_food_facts'
  },
  {
    barcode: '3017620422003',
    name: 'Hazelnut Cocoa Spread',
    brand: 'Ferrero / Nutella',
    category: 'Breakfast Spreads',
    imageUrl: 'https://images.openfoodfacts.org/images/products/301/762/042/2003/front_en.551.400.jpg',
    ingredientsText: 'Sugar, palm oil, hazelnuts (13%), skimmed milk powder (8.7%), fat-reduced cocoa (7.4%), emulsifier: lecithins (soya E322), vanillin.',
    ingredientsList: [
      'Sugar (Over 50% by volume)',
      'Palm Oil',
      'Hazelnuts (13%)',
      'Skimmed Milk Powder (8.7%)',
      'Fat-reduced Cocoa (7.4%)',
      'Soya Lecithins (E322)',
      'Vanillin'
    ],
    nutriments: {
      caloriesPer100g: 539,
      sugarsPer100g: 56.3,
      fatPer100g: 30.9,
      saturatedFatPer100g: 10.6,
      saltPer100g: 0.107,
      proteinsPer100g: 6.3
    },
    nutriscoreGrade: 'e',
    novaGroup: 4,
    servingSize: '15g (1 Tablespoon)',
    sugarCubesCount: 2,
    additives: [
      ADDITIVES_DATABASE['e322']
    ],
    allergens: ['Tree Nuts (Hazelnuts)', 'Milk', 'Soya'],
    healthImpacts: [
      {
        type: 'concern',
        title: 'Over 56% Pure Sugar by Weight',
        description: 'Sugar is the primary ingredient, making up more than half of the jar.'
      },
      {
        type: 'concern',
        title: 'High Saturated Fat from Palm Oil',
        description: '10.6g of saturated fatty acids per 100g, derived from fractionated palm oils.'
      },
      {
        type: 'positive',
        title: 'Contains Whole Hazelnuts (13%)',
        description: 'Provides micronutrients from real tree nuts including Vitamin E and copper.'
      }
    ],
    alternatives: [
      {
        name: '100% Pure Roasted Hazelnut Butter (No Added Sugar)',
        category: 'Nut Butter',
        whyBetter: 'Ground solely from whole hazelnuts with 0 palm oil and 0 refined sugar.',
        sugarComparison: '4g natural vs 56g refined sugar'
      },
      {
        name: 'Avocado Cacao Mousse (Natural Honey Sweetened)',
        category: 'Fresh Spread',
        whyBetter: 'Rich in heart-healthy oleic acid, potassium, and magnesium with zero industrial trans or saturated palm fats.',
        sugarComparison: '8g vs 56g sugar'
      }
    ],
    source: 'open_food_facts'
  }
];

export interface RawOpenFoodFactsProduct {
  product_name?: string;
  brands?: string;
  categories?: string;
  image_url?: string;
  ingredients_text?: string;
  serving_size?: string;
  nutriscore_grade?: string;
  nova_group?: number;
  additives_tags?: string[];
  allergens_tags?: string[];
  nutriments?: Record<string, number | string | undefined>;
}

// 3. CORE SCANNER SERVICE FUNCTIONS

/**
 * Normalizes Open Food Facts raw API response into clean ScannedProduct
 */
export function normalizeOpenFoodFactsProduct(data: { product?: RawOpenFoodFactsProduct }, barcode: string): ScannedProduct {
  const p = data.product || {};
  const nutriments = p.nutriments || {};

  const sugar100g = Number(nutriments['sugars_100g'] ?? nutriments['sugars'] ?? 0);
  const calories = Number(nutriments['energy-kcal_100g'] ?? nutriments['energy-kcal'] ?? 0);
  const fat = Number(nutriments['fat_100g'] ?? nutriments['fat'] ?? 0);
  const satFat = Number(nutriments['saturated-fat_100g'] ?? nutriments['saturated-fat'] ?? 0);
  const salt = Number(nutriments['salt_100g'] ?? nutriments['salt'] ?? 0);
  const sodium = Number(nutriments['sodium_100g'] ?? nutriments['sodium'] ?? 0);
  const protein = Number(nutriments['proteins_100g'] ?? nutriments['proteins'] ?? 0);
  const fiber = Number(nutriments['fiber_100g'] ?? nutriments['fiber'] ?? 0);

  // Extract additives
  const additives: ProductAdditiveInfo[] = [];
  const rawAdditives: string[] = Array.isArray(p.additives_tags) ? p.additives_tags : [];
  for (const tag of rawAdditives) {
    const cleanCode = tag.replace(/^en:/i, '').toLowerCase();
    if (ADDITIVES_DATABASE[cleanCode]) {
      additives.push(ADDITIVES_DATABASE[cleanCode]);
    } else {
      additives.push({
        code: cleanCode.toUpperCase(),
        name: `Additive ${cleanCode.toUpperCase()}`,
        purpose: 'Food Processing Additive',
        riskLevel: 'safe',
        description: 'Standard internationally indexed food additive registered in the Codex General Standard for Food Additives (GSFA).'
      });
    }
  }

  // Calculate sugar cubes (approx 4g of sugar = 1 standard cube)
  const servingGram = parseFloat(p.serving_size || '100') || 100;
  const servingFactor = servingGram / 100;
  const sugarPerServing = sugar100g * (servingFactor > 0 ? servingFactor : 1);
  const sugarCubes = Math.max(0, Math.round(sugarPerServing / 4));

  // Determine health impacts
  const healthImpacts: HealthImpact[] = [];
  if (sugar100g > 15) {
    healthImpacts.push({
      type: 'concern',
      title: 'High Free Sugar Concentration',
      description: `Contains ${sugar100g.toFixed(1)}g sugar per 100g. Promotes metabolic strain, rapid blood glucose fluctuations, and tooth decay.`
    });
  } else if (sugar100g <= 2.5 && sugar100g > 0) {
    healthImpacts.push({
      type: 'positive',
      title: 'Very Low Simple Sugars',
      description: 'Virtually no added sugars, suitable for low-glycemic dietary regimens.'
    });
  }

  if (satFat > 5) {
    healthImpacts.push({
      type: 'concern',
      title: 'Elevated Saturated Fats',
      description: `${satFat.toFixed(1)}g saturated fat per 100g. High regular consumption contributes to elevated LDL cholesterol.`
    });
  }

  if (salt > 1.5) {
    healthImpacts.push({
      type: 'concern',
      title: 'High Sodium / Salt Level',
      description: `${salt.toFixed(1)}g salt per 100g. Excess sodium intake increases hypertension and cardiovascular risks.`
    });
  }

  if (protein >= 8) {
    healthImpacts.push({
      type: 'positive',
      title: 'Good Protein Source',
      description: `Supplies ${protein.toFixed(1)}g protein per 100g to support muscle repair and satiety.`
    });
  }

  if (fiber >= 3) {
    healthImpacts.push({
      type: 'positive',
      title: 'Beneficial Dietary Fiber',
      description: `Contains ${fiber.toFixed(1)}g fiber per 100g, supporting gut microbiome and digestive health.`
    });
  }

  if (p.nova_group === 4) {
    healthImpacts.push({
      type: 'concern',
      title: 'Ultra-Processed Formulation (NOVA Group 4)',
      description: 'Contains industrial compounds and texturizers not commonly found in domestic kitchens.'
    });
  }

  // Generate sensible alternatives based on category
  const alternatives = generateAlternatives(p.categories || p.product_name || '', sugar100g);

  // Parse allergens
  const allergens: string[] = [];
  if (Array.isArray(p.allergens_tags)) {
    p.allergens_tags.forEach((a: string) => {
      allergens.push(a.replace(/^en:/i, '').replace(/-/g, ' '));
    });
  }

  return {
    barcode,
    name: p.product_name || 'Scanned Packaged Product',
    brand: p.brands || undefined,
    category: p.categories || 'Packaged Food / Beverage',
    imageUrl: p.image_url || undefined,
    ingredientsText: p.ingredients_text || undefined,
    ingredientsList: p.ingredients_text ? p.ingredients_text.split(/,\s*/).map((s: string) => s.trim()) : undefined,
    nutriments: {
      caloriesPer100g: calories || undefined,
      sugarsPer100g: sugar100g || undefined,
      fatPer100g: fat || undefined,
      saturatedFatPer100g: satFat || undefined,
      saltPer100g: salt || undefined,
      sodiumPer100g: sodium || undefined,
      proteinsPer100g: protein || undefined,
      fiberPer100g: fiber || undefined
    },
    nutriscoreGrade: (p.nutriscore_grade as ScannedProduct['nutriscoreGrade']) || undefined,
    novaGroup: (p.nova_group as ScannedProduct['novaGroup']) || undefined,
    servingSize: p.serving_size || undefined,
    additives,
    allergens,
    healthImpacts,
    sugarCubesCount: sugarCubes,
    alternatives,
    source: 'open_food_facts'
  };
}

/**
 * Generates smart healthier alternatives for product categories
 */
function generateAlternatives(category: string, currentSugar: number): ProductAlternative[] {
  const lower = category.toLowerCase();

  if (lower.includes('soda') || lower.includes('cola') || lower.includes('beverage') || lower.includes('carbonated')) {
    return [
      {
        name: 'Naturally Carbonated Sparkling Water + Fresh Citrus Slice',
        category: 'Effervescent Beverage',
        whyBetter: 'Pure hydration without artificial sweeteners, E150d dye, or phosphoric acid.',
        sugarComparison: '0g vs current high sugar'
      },
      {
        name: 'Unsweetened Cold-Brew Hibiscus & Mint Infusion',
        category: 'Antioxidant Herbal Drink',
        whyBetter: 'Naturally tart with polyphenol antioxidants and zero tooth enamel demineralization.',
        sugarComparison: '0g added sugar'
      },
      {
        name: 'Fresh Coconut Water',
        category: 'Natural Electrolytes',
        whyBetter: 'Real potassium and magnesium without refined high-fructose syrups.',
        sugarComparison: 'Natural electrolytes'
      }
    ];
  }

  if (lower.includes('biscuit') || lower.includes('cookie') || lower.includes('snack') || lower.includes('cake')) {
    return [
      {
        name: 'Whole Rolled Oat Bake with Banana & Walnuts',
        category: 'Whole Grain Snack',
        whyBetter: 'Complex carbohydrates with dietary beta-glucan fiber rather than refined bleached flour.',
        sugarComparison: 'Naturally sweetened'
      },
      {
        name: 'Dry Roasted Almonds & 75% Dark Cacao',
        category: 'Nut & Superfood Snack',
        whyBetter: 'Healthy unsaturated fats and sustained satiety without industrial palm fat.',
        sugarComparison: 'Low glycemic load'
      }
    ];
  }

  if (lower.includes('spread') || lower.includes('chocolate') || lower.includes('confectionery')) {
    return [
      {
        name: '100% Single-Ingredient Roasted Nut Butter',
        category: 'Pure Nut Spread',
        whyBetter: 'Contains only nuts, with zero hydrogenated fats, zero palm oils, and no added cane sugar.',
        sugarComparison: 'Up to 90% less sugar'
      }
    ];
  }

  return [
    {
      name: 'Unprocessed Whole Food Alternative',
      category: 'Natural Whole Food',
      whyBetter: 'Minimizes additives and maintains natural fiber matrix and micronutrients.',
      sugarComparison: 'Naturally balanced'
    }
  ];
}

/**
 * Cross-references scanned product against official active recalls & safety notices
 */
export async function crossReferenceRecalls(productName: string, brand?: string): Promise<FoodAlert | undefined> {
  const searchTerms = [productName, brand].filter(Boolean) as string[];

  // 1. Check local mock alerts first
  for (const alert of mockAlerts) {
    for (const term of searchTerms) {
      if (
        alert.productName.toLowerCase().includes(term.toLowerCase()) ||
        term.toLowerCase().includes(alert.productName.toLowerCase())
      ) {
        return alert;
      }
    }
  }

  // 2. Check live Supabase food_alerts table if configured
  if (isSupabaseConfigured && supabase) {
    try {
      const { data } = await supabase
        .from('food_alerts')
        .select('*')
        .limit(15);

      if (data && data.length > 0) {
        for (const row of data) {
          for (const term of searchTerms) {
            if (
              row.product_name.toLowerCase().includes(term.toLowerCase()) ||
              term.toLowerCase().includes(row.product_name.toLowerCase())
            ) {
              return {
                id: row.id,
                title: row.title,
                productName: row.product_name,
                batchOrLotNumber: row.batch_or_lot_number,
                contaminant: row.contaminant,
                status: row.status,
                severity: row.severity,
                issuingAuthorityOrSource: row.issuing_authority_or_source,
                sourceUrl: row.source_url,
                publishedAt: row.published_at,
                affectedRegions: row.affected_regions || ['Global'],
                recommendedAction: row.recommended_action,
                region: row.region || 'Global'
              };
            }
          }
        }
      }
    } catch (err) {
      console.warn('Supabase recall check notice:', err);
    }
  }

  return undefined;
}

/**
 * Look up product by Barcode (Open Food Facts + Local Fallback)
 */
export async function fetchProductByBarcode(barcode: string): Promise<ScannedProduct | null> {
  const cleanBarcode = barcode.trim().replace(/\s+/g, '');

  // Check demo database first for rapid response
  const demoMatch = DEMO_PRODUCTS.find((p) => p.barcode === cleanBarcode);
  if (demoMatch) {
    const recall = await crossReferenceRecalls(demoMatch.name, demoMatch.brand);
    return { ...demoMatch, matchedRecall: recall };
  }

  // Query Open Food Facts API (Free public endpoint)
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 6500); // 6.5s timeout

    const response = await fetch(
      `https://world.openfoodfacts.org/api/v2/product/${encodeURIComponent(cleanBarcode)}.json`,
      {
        headers: {
          'User-Agent': 'FoodSafeGlobal - WebScanner - Version 1.0 (https://foodsafe-global.pages.dev)'
        },
        signal: controller.signal
      }
    );
    clearTimeout(timeoutId);

    if (response.ok) {
      const data = await response.json();
      if (data.status === 1 && data.product) {
        const product = normalizeOpenFoodFactsProduct(data, cleanBarcode);
        const recall = await crossReferenceRecalls(product.name, product.brand);
        product.matchedRecall = recall;
        return product;
      }
    }
  } catch (err) {
    console.warn(`Open Food Facts API fetch for ${cleanBarcode} encountered an issue, checking fallback.`, err);
  }

  return null;
}

/**
 * Search products by text/name query
 */
export async function searchProductsByName(query: string): Promise<ScannedProduct[]> {
  const trimmed = query.trim().toLowerCase();
  if (!trimmed) return [];

  // Match demo products first
  const demoResults = DEMO_PRODUCTS.filter(
    (p) =>
      p.name.toLowerCase().includes(trimmed) ||
      (p.brand && p.brand.toLowerCase().includes(trimmed)) ||
      (p.category && p.category.toLowerCase().includes(trimmed))
  );

  // Query Open Food Facts search
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 6000);

    const res = await fetch(
      `https://world.openfoodfacts.org/cgi/search.pl?search_terms=${encodeURIComponent(trimmed)}&search_simple=1&action=process&json=1&page_size=8`,
      {
        headers: {
          'User-Agent': 'FoodSafeGlobal - WebScanner - Version 1.0'
        },
        signal: controller.signal
      }
    );
    clearTimeout(timeoutId);

    if (res.ok) {
      const json = await res.json();
      if (Array.isArray(json.products)) {
        const remoteResults: ScannedProduct[] = [];
        for (const p of json.products) {
          if (p.code && p.product_name) {
            // Avoid duplicate barcodes
            if (!demoResults.some((d) => d.barcode === p.code)) {
              remoteResults.push(normalizeOpenFoodFactsProduct({ product: p }, p.code));
            }
          }
        }
        return [...demoResults, ...remoteResults];
      }
    }
  } catch (err) {
    console.warn('Open Food Facts search error:', err);
  }

  return demoResults;
}
