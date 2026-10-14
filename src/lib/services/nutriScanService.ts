import { 
  HealthGoal, 
  HealthGoalMeta, 
  ScannedProduct, 
  ProductAdditiveInfo, 
  MetabolicSpikePrediction, 
  PersonalizedVerdict, 
  DailyLogItem, 
  DailyMetabolicSummary,
  CrowdsourcedProductSubmission,
  DietaryPreference,
  DietaryWarning,
  DuelComparison
} from '@/types';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';

// 1. HEALTH GOAL PROFILES
export const HEALTH_GOALS: HealthGoalMeta[] = [
  {
    id: 'blood_sugar',
    name: 'Blood Sugar & Diabetes Prevention',
    tagline: 'Avoid insulin spikes and glucose surges',
    icon: 'Activity',
    accentColor: 'indigo',
    focusNutrients: ['Sugars', 'Glycemic Load', 'Refined Carbohydrates']
  },
  {
    id: 'weight_loss',
    name: 'Weight Loss & Calorie Management',
    tagline: 'Target high-satiety, nutrient-dense choices',
    icon: 'Scale',
    accentColor: 'emerald',
    focusNutrients: ['Calories', 'Saturated Fat', 'Dietary Fiber', 'Protein']
  },
  {
    id: 'heart_health',
    name: 'Cardiovascular & Blood Pressure',
    tagline: 'Reduce arterial strain, sodium, and trans fats',
    icon: 'Heart',
    accentColor: 'rose',
    focusNutrients: ['Sodium / Salt', 'Saturated Fat', 'Palm Oil']
  },
  {
    id: 'clean_eating',
    name: 'Clean Eating & Additive-Free',
    tagline: 'Eliminate artificial dyes, chemical preservatives, and NOVA 4',
    icon: 'ShieldCheck',
    accentColor: 'amber',
    focusNutrients: ['Synthetic Additives', 'Artificial Sweeteners', 'NOVA Group']
  },
  {
    id: 'energy_focus',
    name: 'Sustained Energy & Anti-Crash',
    tagline: 'Prevent 3 PM brain fog and reactive hypoglycemia',
    icon: 'Zap',
    accentColor: 'sky',
    focusNutrients: ['Free Sugars', 'Caffeine Spikes', 'Complex Fiber']
  }
];

// 2. CHEMICAL ADDITIVES & E-NUMBERS KNOWLEDGE REPOSITORY
export const ADDITIVES_CATALOG: Record<string, ProductAdditiveInfo> = {
  'e150d': {
    code: 'E150d',
    name: 'Caramel IV (Ammonia Sulphite Caramel)',
    purpose: 'Artificial Brown Colouring',
    riskLevel: 'caution',
    description: 'Manufactured by heating carbohydrates with ammonium and sulphite compounds. Trace by-product 4-MEI is under continued global safety review; heavily consumed in dark sodas.'
  },
  'e338': {
    code: 'E338',
    name: 'Phosphoric Acid',
    purpose: 'Sharp Acidulant & Preservative',
    riskLevel: 'caution',
    description: 'Provides tart acidity in colas. Lowers beverage pH to ~2.5, which directly accelerates tooth enamel demineralization and can compete with bone calcium absorption.'
  },
  'e211': {
    code: 'E211',
    name: 'Sodium Benzoate',
    purpose: 'Antimicrobial Chemical Preservative',
    riskLevel: 'caution',
    description: 'Suppresses yeast and mold in acidic drinks. When combined with Vitamin C (Ascorbic Acid) under heat/light exposure, trace benzene formation can occur.'
  },
  'e951': {
    code: 'E951',
    name: 'Aspartame',
    purpose: 'Intense Low-Calorie Artificial Sweetener',
    riskLevel: 'caution',
    description: '200x sweeter than table sugar. Classified as Group 2B (possibly carcinogenic) by WHO IARC, with acceptable daily intake limits under ongoing international observation.'
  },
  'e950': {
    code: 'E950',
    name: 'Acesulfame Potassium (Ace-K)',
    purpose: 'Artificial Intense Sweetener',
    riskLevel: 'safe',
    description: 'Heat-stable zero-calorie sweetener often paired with aspartame to blend sweetness curves. Excreted mostly unchanged by kidneys.'
  },
  'e955': {
    code: 'E955',
    name: 'Sucralose',
    purpose: 'High-Intensity Synthetic Sweetener',
    riskLevel: 'safe',
    description: 'Chlorinated sugar derivative, 600x sweeter than sucrose. Negligible metabolic calorie contribution.'
  },
  'e102': {
    code: 'E102',
    name: 'Tartrazine (FD&C Yellow 5)',
    purpose: 'Synthetic Azo Colouring',
    riskLevel: 'caution',
    description: 'Petroleum-derived yellow dye common in confectionery, flavored sodas, and snacks. Requires hyperactivity warning label in the European Union.'
  },
  'e129': {
    code: 'E129',
    name: 'Allura Red AC (Red 40)',
    purpose: 'Synthetic Azo Red Colouring',
    riskLevel: 'caution',
    description: 'Widespread red food dye in sodas and packaged sweets. Can trigger mild allergic reactions in aspirin-sensitive consumers.'
  },
  'e250': {
    code: 'E250',
    name: 'Sodium Nitrite',
    purpose: 'Curing Salt & Botulism Inhibitor',
    riskLevel: 'high_concern',
    description: 'Preserves pink hue in hotdogs and sausages. When fried at high temperatures, reacts with meat amines to produce carcinogenic nitrosamines.'
  },
  'e621': {
    code: 'E621',
    name: 'Monosodium Glutamate (MSG)',
    purpose: 'Umami Savory Flavor Enhancer',
    riskLevel: 'safe',
    description: 'Glutamic acid sodium salt. Recognized as non-toxic by JECFA/FDA; safe for general consumption despite occasional individual sensitivity.'
  },
  'e407': {
    code: 'E407',
    name: 'Carrageenan',
    purpose: 'Hydrocolloid Stabilizer & Thickener',
    riskLevel: 'caution',
    description: 'Extracted from red edible seaweeds to stabilize plant milks and ice cream. May provoke intestinal bloating in sensitive digestive tracts.'
  },
  'e322': {
    code: 'E322',
    name: 'Lecithins (Soy / Sunflower)',
    purpose: 'Natural Emulsifier',
    riskLevel: 'safe',
    description: 'Natural plant phospholipid. Prevents oil and water separation in chocolates and baked goods with high safety profile.'
  },
  'e300': {
    code: 'E300',
    name: 'Ascorbic Acid (Vitamin C)',
    purpose: 'Antioxidant & Nutrient Preservative',
    riskLevel: 'safe',
    description: 'Essential nutrient used as an antioxidant to prevent discolouration in juices and foods.'
  }
};

// 3. CURATED DEMO PRODUCTS (High-fidelity realistic reference benchmarks)
export const SAMPLE_PRODUCTS: ScannedProduct[] = [
  {
    barcode: '5449000000996',
    name: 'Classic Cola Carbonated Soda (Original Recipe)',
    brand: 'The Coca-Cola Company',
    category: 'Carbonated Soft Drinks',
    imageUrl: 'https://images.openfoodfacts.org/images/products/544/900/000/0996/front_en.1121.400.jpg',
    ingredientsText: 'Carbonated water, sugar, caramel color (E150d), phosphoric acid (E338), natural flavorings, caffeine.',
    ingredientsList: [
      'Carbonated Water',
      'Sugar (Refined High Fructose/Sucrose)',
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
      sodiumPer100g: 0,
      fiberPer100g: 0
    },
    nutriscoreGrade: 'e',
    novaGroup: 4,
    servingSize: '330 ml (Standard Can)',
    sugarCubesCount: 9, // ~35g per can
    additives: [
      ADDITIVES_CATALOG['e150d'],
      ADDITIVES_CATALOG['e338']
    ],
    allergens: [],
    metabolicPrediction: {
      spikeLevel: 'severe',
      glycemicIndexEstimate: 'High (70+)',
      estimatedCrashRisk: 'High (Rapid Crash in 60-90m)',
      summary: 'Absorbs within 10-15 minutes due to zero fiber and zero lipids. Triggers an acute insulin surge followed by an energy slump and hunger rebound.'
    },
    personalVerdicts: {
      blood_sugar: {
        goal: 'blood_sugar',
        status: 'not_recommended',
        headline: 'Critical Glucose Spike Risk',
        coachingAdvice: 'Delivers 35g of rapid liquid sugar in one serving without fiber. Highly taxing for pancreatic beta cells.'
      },
      weight_loss: {
        goal: 'weight_loss',
        status: 'not_recommended',
        headline: 'Empty Liquid Calories (139 kcal)',
        coachingAdvice: 'Liquid sugars fail to activate leptin satiety signaling. You consume nearly 140 kcal without feeling full.'
      },
      heart_health: {
        goal: 'heart_health',
        status: 'moderate_caution',
        headline: 'Indirect Vascular Inflammation Risk',
        coachingAdvice: 'Zero sodium, but high chronic fructose intake contributes to visceral fat accumulation and uric acid production.'
      },
      clean_eating: {
        goal: 'clean_eating',
        status: 'not_recommended',
        headline: 'Ultra-Processed Formulation (NOVA 4)',
        coachingAdvice: 'Formulated with chemical acidulant E338 and ammonium-treated caramel dye E150d.'
      },
      energy_focus: {
        goal: 'energy_focus',
        status: 'not_recommended',
        headline: 'Guaranteed Afternoon Crash',
        coachingAdvice: 'Gives a quick 20-minute caffeine/sugar boost followed by a sharp reactive dip in alertness.'
      }
    },
    healthImpacts: [
      {
        type: 'concern',
        title: '35g Free Sugars per Can',
        description: 'Exceeds the World Health Organization (WHO) adult daily recommended maximum (25g) in a single beverage.'
      },
      {
        type: 'concern',
        title: 'High Enamel Demineralization Potential',
        description: 'Phosphoric acid maintains an acidic pH (~2.5) that attacks protective dental enamel surfaces.'
      },
      {
        type: 'positive',
        title: '100% Fat & Cholesterol Free',
        description: 'Contains zero dietary lipids or trans fats.'
      }
    ],
    alternatives: [
      {
        name: 'Naturally Carbonated Sparkling Water with Fresh Lime',
        category: 'Effervescent Soda Alternative',
        whyBetter: 'Retains crisp carbonated throat hit with 0g sugar and zero industrial acidifiers.',
        sugarComparison: '0g vs 35g refined sugar'
      },
      {
        name: 'Cold-Brewed Hibiscus & Mint Herbal Tea',
        category: 'Unsweetened Iced Infusion',
        whyBetter: 'Rich in natural anthocyanin polyphenols with tart citric acidity and zero tooth demineralization.',
        sugarComparison: '0g vs 35g sugar'
      },
      {
        name: 'Fresh Young Coconut Water (Chilled)',
        category: 'Natural Electrolyte Beverage',
        whyBetter: 'Rich in whole potassium and magnesium electrolytes without artificial caramel coloring.',
        sugarComparison: 'Natural potassium electrolytes'
      }
    ],
    source: 'reference_database'
  },
  {
    barcode: '7622210449283',
    name: 'Vanilla Creme Chocolate Sandwich Biscuits',
    brand: 'Mondelez / Oreo',
    category: 'Biscuits, Cookies & Snacks',
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
      fiberPer100g: 2.7,
      sodiumPer100g: 0.3
    },
    nutriscoreGrade: 'e',
    novaGroup: 4,
    servingSize: '4 cookies (44g)',
    sugarCubesCount: 4,
    additives: [
      ADDITIVES_CATALOG['e322']
    ],
    allergens: ['Wheat (Gluten)', 'Soya'],
    metabolicPrediction: {
      spikeLevel: 'high',
      glycemicIndexEstimate: 'High (70+)',
      estimatedCrashRisk: 'Moderate',
      summary: 'High sugar combined with refined palm fats slows acute gastric emptying slightly, but drives high insulin requirement due to fast-digesting starch.'
    },
    personalVerdicts: {
      blood_sugar: {
        goal: 'blood_sugar',
        status: 'not_recommended',
        headline: 'Double Carbohydrate Surge',
        coachingAdvice: 'Contains both simple cane sugar and refined wheat flour that quickly convert into blood glucose.'
      },
      weight_loss: {
        goal: 'weight_loss',
        status: 'not_recommended',
        headline: 'Hyper-Palatable Calorie Density (474 kcal/100g)',
        coachingAdvice: 'Engineered sensory combination of 38% sugar and 19% fat triggers hedonic overeating.'
      },
      heart_health: {
        goal: 'heart_health',
        status: 'moderate_caution',
        headline: 'Fractionated Palm Oil Fats',
        coachingAdvice: '5.2g saturated fat per 100g sourced from palm oil; consume occasionally rather than daily.'
      },
      clean_eating: {
        goal: 'clean_eating',
        status: 'not_recommended',
        headline: 'NOVA 4 Ultra-Processed Cookie',
        coachingAdvice: 'Contains high-fructose corn syrup, isolated starches, and vanillin aroma.'
      },
      energy_focus: {
        goal: 'energy_focus',
        status: 'moderate_caution',
        headline: 'Short Energy Burst with Subsequent Slump',
        coachingAdvice: 'Satisfies immediate sweet cravings but lacks sustained complex carbohydrates.'
      }
    },
    healthImpacts: [
      {
        type: 'concern',
        title: '38% Refined Sugars by Weight',
        description: 'High free sugar content coupled with high-fructose syrup promotes glycemic volatility.'
      },
      {
        type: 'concern',
        title: 'Palm Oil Saturated Fat Content',
        description: 'Contains 5.2g saturated fats per 100g from industrial refined palm lipids.'
      },
      {
        type: 'positive',
        title: 'Real Cocoa Solids Included (4.3%)',
        description: 'Provides genuine flavanol cocoa components and low sodium.'
      }
    ],
    alternatives: [
      {
        name: 'Whole Rolled Oat Bake with Banana & Walnuts',
        category: 'Whole Grain Bakery Alternative',
        whyBetter: 'Beta-glucan soluble oat fiber slows glucose uptake, stabilizing energy across 3-4 hours.',
        sugarComparison: 'Naturally sweetened'
      },
      {
        name: 'Roasted Peanuts with 70% Dark Chocolate Nibs',
        category: 'Whole Nut & Cacao Snack',
        whyBetter: 'Plant protein and heart-healthy monounsaturated fats provide lasting satiety with zero palm oil.',
        sugarComparison: '7g vs 38g sugar'
      }
    ],
    source: 'reference_database'
  },
  {
    barcode: '3017620422003',
    name: 'Hazelnut & Cocoa Breakfast Spread',
    brand: 'Ferrero / Nutella',
    category: 'Spreads & Confectionery',
    imageUrl: 'https://images.openfoodfacts.org/images/products/301/762/042/2003/front_en.551.400.jpg',
    ingredientsText: 'Sugar, palm oil, hazelnuts (13%), skimmed milk powder (8.7%), fat-reduced cocoa (7.4%), emulsifier: lecithins (soya E322), vanillin.',
    ingredientsList: [
      'Sugar (Primary Ingredient - >50%)',
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
      proteinsPer100g: 6.3,
      fiberPer100g: 3.4
    },
    nutriscoreGrade: 'e',
    novaGroup: 4,
    servingSize: '15g (1 Heaping Tablespoon)',
    sugarCubesCount: 2,
    additives: [
      ADDITIVES_CATALOG['e322']
    ],
    allergens: ['Tree Nuts (Hazelnuts)', 'Milk', 'Soya'],
    metabolicPrediction: {
      spikeLevel: 'high',
      glycemicIndexEstimate: 'Medium (55-69)',
      estimatedCrashRisk: 'Moderate',
      summary: 'Heavy lipid load (30.9% fat) blunts the speed of the glucose curve, but total carbohydrate load remains intense (56.3% sugar).'
    },
    personalVerdicts: {
      blood_sugar: {
        goal: 'blood_sugar',
        status: 'not_recommended',
        headline: 'Over Half the Jar is Pure Cane Sugar',
        coachingAdvice: '56g of sugar per 100g. Even a single 15g spoonful contains ~8.5g of pure sugar.'
      },
      weight_loss: {
        goal: 'weight_loss',
        status: 'not_recommended',
        headline: 'Extreme Caloric Density (539 kcal/100g)',
        coachingAdvice: 'Very easy to overshoot daily calorie goals. 2 tablespoons exceed 160 kcal.'
      },
      heart_health: {
        goal: 'heart_health',
        status: 'moderate_caution',
        headline: '10.6g Saturated Palm Fats',
        coachingAdvice: 'High proportion of palmitic saturated fatty acids. Restrict to occasional treat.'
      },
      clean_eating: {
        goal: 'clean_eating',
        status: 'moderate_caution',
        headline: 'Palm Oil & Refined Sugar Base',
        coachingAdvice: 'Nut percentage is 13%; the remaining 87% is predominantly sugar and processed fats.'
      },
      energy_focus: {
        goal: 'energy_focus',
        status: 'moderate_caution',
        headline: 'Heavy Digestion Burden',
        coachingAdvice: 'High fat and sugar combo can cause postprandial lethargy if consumed in the morning.'
      }
    },
    healthImpacts: [
      {
        type: 'concern',
        title: 'Over 56% Pure Sugar by Volume',
        description: 'First ingredient on label is sugar, dominating the nutritional profile.'
      },
      {
        type: 'concern',
        title: 'High Saturated Fat Concentration (10.6g)',
        description: 'Fractionated palm oil supplies elevated saturated lipid levels.'
      },
      {
        type: 'positive',
        title: 'Contains Genuine Whole Hazelnuts (13%)',
        description: 'Delivers Vitamin E, magnesium, and plant phytosterols from whole nuts.'
      }
    ],
    alternatives: [
      {
        name: '100% Roasted Hazelnut Butter (Single Ingredient)',
        category: 'Pure Nut Butter Alternative',
        whyBetter: 'Stone-ground purely from whole roasted nuts with 0 added sugar and 0 palm oil.',
        sugarComparison: '4g natural vs 56g refined sugar'
      },
      {
        name: 'Avocado Cacao Mousse (Raw Honey Sweetened)',
        category: 'Fresh Plant-Based Spread',
        whyBetter: 'Rich in heart-protective oleic monounsaturated fats with raw antioxidant flavonoids.',
        sugarComparison: '85% less simple sugar'
      }
    ],
    source: 'reference_database'
  }
];

// 4. METABOLIC INTELLIGENCE ENGINE

/**
 * Predicts glycemic metabolic spike intensity from nutrient data
 */
export function calculateMetabolicSpike(sugars100g: number, fiber100g: number, protein100g: number): MetabolicSpikePrediction {
  const netQuickCarbs = Math.max(0, sugars100g - (fiber100g * 0.7));

  if (netQuickCarbs > 20) {
    return {
      spikeLevel: 'severe',
      glycemicIndexEstimate: 'High (70+)',
      estimatedCrashRisk: 'High (Rapid Crash in 60-90m)',
      summary: 'High density of free simple sugars without sufficient dietary fiber buffer. Fast intestinal absorption drives steep glycemic elevation and rapid reactive insulin release.'
    };
  }

  if (netQuickCarbs > 10) {
    return {
      spikeLevel: 'high',
      glycemicIndexEstimate: 'Medium (55-69)',
      estimatedCrashRisk: 'Moderate',
      summary: 'Moderate-high glycemic impact. Causes an elevated glucose curve; combining with protein or dietary fiber is strongly recommended.'
    };
  }

  if (sugars100g <= 5 || protein100g >= 8) {
    return {
      spikeLevel: 'low',
      glycemicIndexEstimate: 'Low (<55)',
      estimatedCrashRisk: 'Very Low',
      summary: 'Minimal blood sugar disturbance. Slower digestive breakdown maintains balanced, long-lasting energy release.'
    };
  }

  return {
    spikeLevel: 'moderate',
    glycemicIndexEstimate: 'Low (<55)',
    estimatedCrashRisk: 'Moderate',
    summary: 'Balanced metabolic profile with steady glucose absorption rate.'
  };
}

/**
 * Generates personalized coaching verdicts for all 5 health lenses
 */
export function generatePersonalVerdicts(
  pName: string,
  sugars: number,
  satFat: number,
  salt: number,
  calories: number,
  novaGroup?: number,
  additivesCount: number = 0
): Record<HealthGoal, PersonalizedVerdict> {
  // Blood Sugar Verdict
  let bsStatus: PersonalizedVerdict['status'] = 'recommended';
  let bsHeadline = 'Gentle on Blood Sugar';
  let bsAdvice = 'Low glycemic impact with minimal insulin demand.';
  if (sugars > 15) {
    bsStatus = 'not_recommended';
    bsHeadline = 'Acute Sugar Spike Hazard';
    bsAdvice = `Contains ${sugars}g sugar/100g. Drives severe blood sugar surges and pancreatic stress.`;
  } else if (sugars > 7) {
    bsStatus = 'moderate_caution';
    bsHeadline = 'Moderate Glucose Impact';
    bsAdvice = 'Consume alongside protein or leafy vegetables to slow glucose absorption.';
  }

  // Weight Loss Verdict
  let wlStatus: PersonalizedVerdict['status'] = 'recommended';
  let wlHeadline = 'Weight-Loss Friendly';
  let wlAdvice = 'Low calorie density with supportive nutrient balance.';
  if (calories > 350 || (sugars > 15 && satFat > 5)) {
    wlStatus = 'not_recommended';
    wlHeadline = 'High Calorie & Energy Dense';
    wlAdvice = `Supplies ${calories} kcal/100g. High likelihood of exceeding calorie deficit targets.`;
  } else if (calories > 200 || sugars > 10) {
    wlStatus = 'moderate_caution';
    wlHeadline = 'Portion Control Essential';
    wlAdvice = 'Moderate energy density; measure serving portions carefully.';
  }

  // Heart Health Verdict
  let hhStatus: PersonalizedVerdict['status'] = 'recommended';
  let hhHeadline = 'Heart & Arterial Friendly';
  let hhAdvice = 'Low in sodium and saturated lipids.';
  if (satFat > 5 || salt > 1.5) {
    hhStatus = 'not_recommended';
    hhHeadline = 'Arterial Strain Concern';
    hhAdvice = `Contains ${satFat}g saturated fat and ${salt}g salt/100g. Restrict if managing blood pressure.`;
  } else if (satFat > 2.5 || salt > 0.8) {
    hhStatus = 'moderate_caution';
    hhHeadline = 'Moderate Sodium/Lipid Load';
    hhAdvice = 'Keep daily cumulative sodium intake in mind when balancing meals.';
  }

  // Clean Eating Verdict
  let ceStatus: PersonalizedVerdict['status'] = 'recommended';
  let ceHeadline = 'Clean & Wholesome Profile';
  let ceAdvice = 'Minimal industrial processing and clean additive score.';
  if (novaGroup === 4 || additivesCount >= 3) {
    ceStatus = 'not_recommended';
    ceHeadline = 'Ultra-Processed (NOVA 4)';
    ceAdvice = `Formulated with industrial ingredients and ${additivesCount} chemical additives.`;
  } else if (novaGroup === 3 || additivesCount > 0) {
    ceStatus = 'moderate_caution';
    ceHeadline = 'Processed Ingredients';
    ceAdvice = 'Contains standard food additives; suitable for occasional meals.';
  }

  // Energy & Focus Verdict
  let efStatus: PersonalizedVerdict['status'] = 'recommended';
  let efHeadline = 'Sustained All-Day Energy';
  let efAdvice = 'Provides steady, crash-free cognitive alertness.';
  if (sugars > 15) {
    efStatus = 'not_recommended';
    efHeadline = 'Rapid Sugar Crash Predicted';
    efAdvice = 'Quick energy burst followed by sudden fatigue and brain fog within 60-90 minutes.';
  } else if (sugars > 8) {
    efStatus = 'moderate_caution';
    efHeadline = 'Mild Energy Fluctuation';
    efAdvice = 'Pair with a handful of nuts to prevent post-snack lethargy.';
  }

  return {
    blood_sugar: { goal: 'blood_sugar', status: bsStatus, headline: bsHeadline, coachingAdvice: bsAdvice },
    weight_loss: { goal: 'weight_loss', status: wlStatus, headline: wlHeadline, coachingAdvice: wlAdvice },
    heart_health: { goal: 'heart_health', status: hhStatus, headline: hhHeadline, coachingAdvice: hhAdvice },
    clean_eating: { goal: 'clean_eating', status: ceStatus, headline: ceHeadline, coachingAdvice: ceAdvice },
    energy_focus: { goal: 'energy_focus', status: efStatus, headline: efHeadline, coachingAdvice: efAdvice }
  };
}

/**
 * Normalizes Open Food Facts payload into comprehensive ScannedProduct
 */
export function normalizeProductData(data: Record<string, unknown>, barcode: string): ScannedProduct {
  const p = (data.product as Record<string, unknown>) || {};
  const nutriments = (p.nutriments as Record<string, unknown>) || {};

  const sugar100g = Number(nutriments['sugars_100g'] ?? nutriments['sugars'] ?? 0);
  const calories = Number(nutriments['energy-kcal_100g'] ?? nutriments['energy-kcal'] ?? 0);
  const fat = Number(nutriments['fat_100g'] ?? nutriments['fat'] ?? 0);
  const satFat = Number(nutriments['saturated-fat_100g'] ?? nutriments['saturated-fat'] ?? 0);
  const salt = Number(nutriments['salt_100g'] ?? nutriments['salt'] ?? 0);
  const sodium = Number(nutriments['sodium_100g'] ?? nutriments['sodium'] ?? 0);
  const protein = Number(nutriments['proteins_100g'] ?? nutriments['proteins'] ?? 0);
  const fiber = Number(nutriments['fiber_100g'] ?? nutriments['fiber'] ?? 0);

  // Map Additives
  const additives: ProductAdditiveInfo[] = [];
  const rawAdditives: string[] = Array.isArray(p.additives_tags) ? p.additives_tags : [];
  for (const tag of rawAdditives) {
    const cleanCode = tag.replace(/^en:/i, '').toLowerCase();
    if (ADDITIVES_CATALOG[cleanCode]) {
      additives.push(ADDITIVES_CATALOG[cleanCode]);
    } else {
      additives.push({
        code: cleanCode.toUpperCase(),
        name: `Additive ${cleanCode.toUpperCase()}`,
        purpose: 'Regulated Food Additive',
        riskLevel: 'safe',
        description: 'Standard additive catalogued under the FAO/WHO Codex Alimentarius GSFA standard.'
      });
    }
  }

  // Calculate sugar cubes (approx 4g of sugar per standard sugar cube)
  const servingGram = parseFloat(String(p.serving_size || '100')) || 100;
  const servingFactor = servingGram / 100;
  const sugarPerServing = sugar100g * (servingFactor > 0 ? servingFactor : 1);
  const sugarCubes = Math.max(0, Math.round(sugarPerServing / 4));

  // Metabolic prediction & Personalized verdicts
  const metabolicPrediction = calculateMetabolicSpike(sugar100g, fiber, protein);
  const novaGroup = (p.nova_group as 1 | 2 | 3 | 4) || undefined;
  const personalVerdicts = generatePersonalVerdicts(
    String(p.product_name || 'Food Item'),
    sugar100g,
    satFat,
    salt,
    calories,
    novaGroup,
    additives.length
  );

  // Health Trade-Offs
  const healthImpacts = [];
  if (sugar100g > 15) {
    healthImpacts.push({
      type: 'concern' as const,
      title: 'Elevated Free Sugar Content',
      description: `Contains ${sugar100g.toFixed(1)}g sugar per 100g. Accelerates insulin release and metabolic fat storage.`
    });
  } else if (sugar100g <= 3 && sugar100g > 0) {
    healthImpacts.push({
      type: 'positive' as const,
      title: 'Very Low Added Sugars',
      description: 'Excellent choice for stabilizing daily glycemic fluctuations.'
    });
  }

  if (satFat > 5) {
    healthImpacts.push({
      type: 'concern' as const,
      title: 'High Saturated Lipid Concentration',
      description: `${satFat.toFixed(1)}g saturated fat per 100g. May increase cardiovascular LDL markers if consumed frequently.`
    });
  }

  if (protein >= 8) {
    healthImpacts.push({
      type: 'positive' as const,
      title: 'High Protein Content',
      description: `Supplies ${protein.toFixed(1)}g protein per 100g to support muscular repair and prolonged fullness.`
    });
  }

  if (fiber >= 3) {
    healthImpacts.push({
      type: 'positive' as const,
      title: 'Beneficial Soluble/Insoluble Fiber',
      description: `Supplies ${fiber.toFixed(1)}g fiber per 100g, nourishing gut microbiome and slowing digestion.`
    });
  }

  const alternatives = generateCategoryAlternatives(String(p.categories || p.product_name || ''));

  return {
    barcode,
    name: String(p.product_name || 'Packaged Grocery Product'),
    brand: p.brands ? String(p.brands) : undefined,
    category: p.categories ? String(p.categories) : 'Packaged Grocery',
    imageUrl: p.image_url ? String(p.image_url) : undefined,
    ingredientsText: p.ingredients_text ? String(p.ingredients_text) : undefined,
    ingredientsList: p.ingredients_text ? String(p.ingredients_text).split(/,\s*/).map(s => s.trim()) : undefined,
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
    novaGroup,
    servingSize: p.serving_size ? String(p.serving_size) : undefined,
    additives,
    allergens: Array.isArray(p.allergens_tags) ? p.allergens_tags.map(a => String(a).replace(/^en:/i, '')) : [],
    healthImpacts,
    sugarCubesCount: sugarCubes,
    metabolicPrediction,
    personalVerdicts,
    alternatives,
    source: 'open_food_facts'
  };
}

/**
 * Generates sensible healthier alternative products
 */
function generateCategoryAlternatives(category: string) {
  const lower = category.toLowerCase();
  if (lower.includes('soda') || lower.includes('cola') || lower.includes('carbonated')) {
    return [
      {
        name: 'Naturally Carbonated Spring Water + Fresh Lime',
        category: 'Effervescent Soda Alternative',
        whyBetter: 'Maintains crisp throat sensation with zero sugar and zero synthetic dyes.',
        sugarComparison: '0g vs 35g sugar'
      },
      {
        name: 'Cold-Brew Hibiscus & Mint Infusion',
        category: 'Herbal Iced Drink',
        whyBetter: 'Natural tart flavor with antioxidant anthocyanins and zero enamel demineralization.',
        sugarComparison: '0g added sugar'
      }
    ];
  }

  if (lower.includes('biscuit') || lower.includes('cookie') || lower.includes('snack')) {
    return [
      {
        name: 'Artisan Rolled Oat Bake with Banana',
        category: 'Whole Grain Bakery',
        whyBetter: 'Rich in beta-glucan soluble fiber that prevents sudden glucose spikes.',
        sugarComparison: 'Naturally sweetened'
      },
      {
        name: 'Dry Roasted Almonds & 70% Dark Cacao Nibs',
        category: 'Whole Food Snack',
        whyBetter: 'Sustained satiety from healthy plant monounsaturated fats with zero palm oil.',
        sugarComparison: 'Low glycemic load'
      }
    ];
  }

  return [
    {
      name: 'Whole Natural Food Alternative',
      category: 'Unprocessed Grocery',
      whyBetter: 'Preserves complete micronutrient matrix with zero industrial stabilizers.',
      sugarComparison: 'Natural baseline'
    }
  ];
}

// 5. EXTERNAL LOOKUP & SEARCH API (With Offline Supermarket Cache)
export async function lookupProductByBarcode(barcode: string): Promise<ScannedProduct | null> {
  const cleanBarcode = barcode.trim().replace(/\s+/g, '');

  // 1. Check offline demo list first
  const demoMatch = SAMPLE_PRODUCTS.find(p => p.barcode === cleanBarcode);
  if (demoMatch) return demoMatch;

  // 2. Check offline supermarket cache (previously scanned items work with 0 internet)
  const cached = getCachedProducts().find(p => p.barcode === cleanBarcode);
  if (cached) return cached;

  // 3. Query Open Food Facts API (Free public endpoint)
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 6500);

    const res = await fetch(
      `https://world.openfoodfacts.org/api/v2/product/${encodeURIComponent(cleanBarcode)}.json`,
      {
        headers: { 'User-Agent': 'NutriScan - Health & Metabolic Tracker - 1.0' },
        signal: controller.signal
      }
    );
    clearTimeout(timeoutId);

    if (res.ok) {
      const data = await res.json();
      if (data.status === 1 && data.product) {
        const normalized = normalizeProductData(data, cleanBarcode);
        saveProductToOfflineCache(normalized);
        return normalized;
      }
    }
  } catch (err) {
    console.warn('Open Food Facts API lookup notice:', err);
  }

  return null;
}

export async function searchProducts(query: string): Promise<ScannedProduct[]> {
  const trimmed = query.trim().toLowerCase();
  if (!trimmed) return [];

  // Match demo samples + offline cache
  const cachedMatches = getCachedProducts().filter(
    p => p.name.toLowerCase().includes(trimmed) || (p.brand && p.brand.toLowerCase().includes(trimmed))
  );

  const demoMatches = SAMPLE_PRODUCTS.filter(
    p => p.name.toLowerCase().includes(trimmed) || (p.brand && p.brand.toLowerCase().includes(trimmed))
  );

  const localPool = [...demoMatches];
  for (const c of cachedMatches) {
    if (!localPool.some(p => p.barcode === c.barcode)) {
      localPool.push(c);
    }
  }

  // Search Open Food Facts
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 6000);

    const res = await fetch(
      `https://world.openfoodfacts.org/cgi/search.pl?search_terms=${encodeURIComponent(trimmed)}&search_simple=1&action=process&json=1&page_size=8`,
      {
        headers: { 'User-Agent': 'NutriScan - Health & Metabolic Tracker - 1.0' },
        signal: controller.signal
      }
    );
    clearTimeout(timeoutId);

    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data.products)) {
        const remoteResults: ScannedProduct[] = [];
        for (const item of data.products) {
          if (item.code && item.product_name) {
            if (!localPool.some(d => d.barcode === item.code)) {
              const norm = normalizeProductData({ product: item }, item.code);
              remoteResults.push(norm);
              saveProductToOfflineCache(norm);
            }
          }
        }
        return [...localPool, ...remoteResults];
      }
    }
  } catch (err) {
    console.warn('Open Food Facts search notice:', err);
  }

  return localPool;
}

// 6. DAILY INTAKE JOURNAL & METABOLIC LOG HELPERS (LocalStorage)
const STORAGE_KEY = 'nutriscan_daily_log_v1';

export function getStoredDailyLogs(): DailyLogItem[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function saveDailyLogItem(product: ScannedProduct, servings: number = 1): DailyLogItem[] {
  if (typeof window === 'undefined') return [];
  const current = getStoredDailyLogs();
  const newItem: DailyLogItem = {
    id: `log-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    product,
    loggedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    servingsCount: servings
  };
  const updated = [newItem, ...current];
  localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  return updated;
}

export function removeDailyLogItem(id: string): DailyLogItem[] {
  if (typeof window === 'undefined') return [];
  const current = getStoredDailyLogs();
  const updated = current.filter(item => item.id !== id);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  return updated;
}

export function clearDailyLogs(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(STORAGE_KEY);
}

export function calculateDailySummary(logs: DailyLogItem[]): DailyMetabolicSummary {
  let totalCalories = 0;
  let totalSugar = 0;
  let totalSalt = 0;
  let totalProtein = 0;
  let ultraProcessedCount = 0;
  let chemicalAdditivesCount = 0;

  for (const item of logs) {
    const p = item.product;
    const factor = item.servingsCount;
    const nut = p.nutriments;

    totalCalories += (nut.caloriesPer100g || 0) * factor;
    totalSugar += (nut.sugarsPer100g || 0) * factor;
    totalSalt += (nut.saltPer100g || 0) * factor;
    totalProtein += (nut.proteinsPer100g || 0) * factor;

    if (p.novaGroup === 4) {
      ultraProcessedCount += 1;
    }
    chemicalAdditivesCount += (p.additives.length || 0);
  }

  // Calculate Clean Eating Score (Starts at 100, drops with excess sugar, NOVA 4, and high-risk additives)
  const sugarPenalty = Math.min(40, (totalSugar / 25) * 20); // Penalty if over 25g WHO target
  const novaPenalty = Math.min(30, ultraProcessedCount * 12);
  const additivePenalty = Math.min(20, chemicalAdditivesCount * 4);
  const cleanScore = Math.max(10, Math.round(100 - sugarPenalty - novaPenalty - additivePenalty));

  return {
    totalCalories: Math.round(totalCalories),
    totalSugarGrams: Math.round(totalSugar * 10) / 10,
    sugarDailyLimitPercent: Math.round((totalSugar / 25) * 100),
    totalSaltGrams: Math.round(totalSalt * 10) / 10,
    totalProteinGrams: Math.round(totalProtein * 10) / 10,
    ultraProcessedItemsCount: ultraProcessedCount,
    chemicalAdditivesCount,
    cleanEatingScore: cleanScore
  };
}

export async function submitCrowdsourcedProduct(
  submission: CrowdsourcedProductSubmission
): Promise<{ success: boolean; message: string }> {
  try {
    if (isSupabaseConfigured && supabase) {
      const { error } = await supabase.from('crowdsourced_products').insert([
        {
          barcode: submission.barcode,
          name: submission.name,
          brand: submission.brand || null,
          ingredients_text: submission.ingredientsText || null,
          sugars_100g: submission.sugarsPer100g || null,
          calories_100g: submission.caloriesPer100g || null,
          notes: submission.notes || null,
          created_at: new Date().toISOString()
        }
      ]);
      if (!error) {
        return { success: true, message: 'Thank you! Product saved to NutriScan community registry.' };
      }
    }

    // Fallback: store locally in browser
    if (typeof window !== 'undefined') {
      const existing = JSON.parse(localStorage.getItem('nutriscan_community_submissions') || '[]');
      existing.unshift({ ...submission, submittedAt: new Date().toISOString() });
      localStorage.setItem('nutriscan_community_submissions', JSON.stringify(existing.slice(0, 50)));
    }

    return { 
      success: true, 
      message: 'Product submission saved! Our team will verify and index this item.' 
    };
  } catch (err) {
    return { 
      success: false, 
      message: err instanceof Error ? err.message : 'Unable to submit product at this time.' 
    };
  }
}

// 7. OFFLINE SUPERMARKET CACHE
const CACHE_KEY = 'nutriscan_cached_products_v1';

export function getCachedProducts(): ScannedProduct[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(CACHE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function saveProductToOfflineCache(product: ScannedProduct): void {
  if (typeof window === 'undefined') return;
  try {
    const existing = getCachedProducts().filter(p => p.barcode !== product.barcode);
    const updated = [product, ...existing].slice(0, 40); // keep recent 40 items offline
    localStorage.setItem(CACHE_KEY, JSON.stringify(updated));
  } catch {
    // quota safe
  }
}

// 8. SUPERMARKET AUDIO & HAPTIC FEEDBACK
export function playScannerBeep(): void {
  if (typeof window === 'undefined') return;
  try {
    const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(1850, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(2600, ctx.currentTime + 0.08);
    gain.gain.setValueAtTime(0.2, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.12);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.12);
  } catch {
    // Audio gesture policy fallback
  }
}

export function triggerHapticFeedback(): void {
  if (typeof window !== 'undefined' && 'vibrate' in navigator) {
    try {
      navigator.vibrate([35, 40, 35]);
    } catch {
      // not supported
    }
  }
}

// 9. GLOBAL DIETARY & ALLERGEN REPUTATION ENGINE
export function evaluateDietaryWarnings(
  product: ScannedProduct,
  activePrefs: DietaryPreference[]
): DietaryWarning[] {
  if (!activePrefs || activePrefs.length === 0) return [];

  const warnings: DietaryWarning[] = [];
  const fullText = (
    (product.ingredientsText || '') + ' ' + 
    (product.ingredientsList ? product.ingredientsList.join(' ') : '') + ' ' +
    product.name + ' ' + 
    (product.category || '')
  ).toLowerCase();

  const additivesCodes = product.additives.map(a => a.code.toLowerCase());
  const declaredAllergens = (product.allergens || []).map(a => a.toLowerCase());

  // Check 1: Vegan
  if (activePrefs.includes('vegan')) {
    const nonVeganKeywords = [
      'milk', 'dairy', 'whey', 'casein', 'cheese', 'butter', 'lactose', 'yogurt',
      'egg', 'albumin', 'honey', 'gelatin', 'gelatine', 'collagen', 'lard', 'tallow',
      'carmine', 'cochineal', 'shellac', 'bone phosphate'
    ];
    const nonVeganAdditives = ['e120', 'e904', 'e542', 'e441'];
    
    const hitKeyword = nonVeganKeywords.find(k => fullText.includes(k));
    const hitAdditive = additivesCodes.find(c => nonVeganAdditives.includes(c));

    if (hitKeyword || hitAdditive) {
      warnings.push({
        preference: 'vegan',
        type: 'violation',
        title: 'Not Vegan Compliant',
        reason: hitAdditive 
          ? `Contains animal-derived additive (${hitAdditive.toUpperCase()}).`
          : `Contains animal/dairy-derived ingredient (${hitKeyword}).`
      });
    }
  }

  // Check 2: Vegetarian
  if (activePrefs.includes('vegetarian')) {
    const nonVegKeywords = ['gelatin', 'gelatine', 'collagen', 'lard', 'tallow', 'carmine', 'cochineal', 'rennet', 'beef', 'chicken', 'pork', 'fish'];
    const nonVegAdditives = ['e120', 'e441', 'e542'];

    const hit = nonVegKeywords.find(k => fullText.includes(k));
    const hitAdd = additivesCodes.find(c => nonVegAdditives.includes(c));

    if (hit || hitAdd) {
      warnings.push({
        preference: 'vegetarian',
        type: 'violation',
        title: 'Not Vegetarian',
        reason: hitAdd 
          ? `Contains animal-sourced additive (${hitAdd.toUpperCase()}).`
          : `Contains animal tissue/gelatin byproduct (${hit}).`
      });
    }
  }

  // Check 3: Halal
  if (activePrefs.includes('halal')) {
    const nonHalalKeywords = ['pork', 'bacon', 'ham', 'lard', 'alcohol', 'ethanol', 'wine', 'beer', 'rum', 'carmine', 'cochineal'];
    const nonHalalAdditives = ['e120'];

    const hit = nonHalalKeywords.find(k => fullText.includes(k));
    const hitAdd = additivesCodes.find(c => nonHalalAdditives.includes(c));

    if (hit || hitAdd) {
      warnings.push({
        preference: 'halal',
        type: 'violation',
        title: 'Halal Compliance Concern',
        reason: hitAdd 
          ? `Contains cochineal insect dye (${hitAdd.toUpperCase()}).`
          : `Contains restricted animal or alcohol element (${hit}).`
      });
    }
  }

  // Check 4: Kosher
  if (activePrefs.includes('kosher')) {
    const nonKosherKeywords = ['pork', 'shellfish', 'shrimp', 'crab', 'lobster', 'carmine', 'cochineal'];
    const hit = nonKosherKeywords.find(k => fullText.includes(k));

    if (hit) {
      warnings.push({
        preference: 'kosher',
        type: 'violation',
        title: 'Kosher Restriction Flag',
        reason: `Contains non-kosher ingredient (${hit}).`
      });
    }
  }

  // Check 5: Gluten-Free
  if (activePrefs.includes('gluten_free')) {
    const glutenKeywords = ['wheat', 'barley', 'rye', 'malt', 'spelt', 'semolina', 'couscous', 'gluten'];
    const hit = glutenKeywords.find(k => fullText.includes(k)) || declaredAllergens.some(a => a.includes('gluten') || a.includes('wheat'));

    if (hit) {
      warnings.push({
        preference: 'gluten_free',
        type: 'violation',
        title: 'Contains Gluten / Wheat',
        reason: 'Detected wheat, malt, or gluten derivatives in ingredients or allergen registry.'
      });
    }
  }

  // Check 6: Dairy-Free
  if (activePrefs.includes('dairy_free')) {
    const dairyKeywords = ['milk', 'dairy', 'whey', 'casein', 'cheese', 'butter', 'lactose', 'cream'];
    const hit = dairyKeywords.find(k => fullText.includes(k)) || declaredAllergens.some(a => a.includes('milk') || a.includes('lactose'));

    if (hit) {
      warnings.push({
        preference: 'dairy_free',
        type: 'violation',
        title: 'Contains Dairy / Lactose',
        reason: 'Detected milk proteins, lactose, or whey solids.'
      });
    }
  }

  // Check 7: Nut-Free
  if (activePrefs.includes('nut_free')) {
    const nutKeywords = ['peanut', 'almond', 'hazelnut', 'walnut', 'cashew', 'pistachio', 'pecan', 'macadamia'];
    const hit = nutKeywords.find(k => fullText.includes(k)) || declaredAllergens.some(a => a.includes('nut') || a.includes('peanut'));

    if (hit) {
      warnings.push({
        preference: 'nut_free',
        type: 'violation',
        title: 'Nut Allergen Detected',
        reason: 'Contains tree nuts or peanuts.'
      });
    }
  }

  return warnings;
}

// 10. NUTRIDUEL: SIDE-BY-SIDE METABOLIC COMPARISON
export function compareProductsForDuel(
  productA: ScannedProduct,
  productB: ScannedProduct,
  activeGoal: HealthGoal
): DuelComparison {
  const sugarA = productA.nutriments.sugarsPer100g || 0;
  const sugarB = productB.nutriments.sugarsPer100g || 0;
  const sugarDiff = Math.round((sugarA - sugarB) * 10) / 10;
  const sugarCubesDiff = Math.round(productA.sugarCubesCount - productB.sugarCubesCount);

  const calA = productA.nutriments.caloriesPer100g || 0;
  const calB = productB.nutriments.caloriesPer100g || 0;
  const calDiff = Math.round(calA - calB);

  const addA = productA.additives.length;
  const addB = productB.additives.length;
  const addDiff = addA - addB;

  let scoreA = 0;
  let scoreB = 0;

  switch (activeGoal) {
    case 'blood_sugar':
      if (sugarA < sugarB) scoreA += 3; else if (sugarB < sugarA) scoreB += 3;
      if (productA.metabolicPrediction.spikeLevel === 'low') scoreA += 2;
      if (productB.metabolicPrediction.spikeLevel === 'low') scoreB += 2;
      break;
    case 'weight_loss':
      if (calA < calB) scoreA += 2; else if (calB < calA) scoreB += 2;
      if (sugarA < sugarB) scoreA += 2; else if (sugarB < sugarA) scoreB += 2;
      break;
    case 'heart_health':
      const saltA = productA.nutriments.saltPer100g || 0;
      const saltB = productB.nutriments.saltPer100g || 0;
      if (saltA < saltB) scoreA += 2; else if (saltB < saltA) scoreB += 2;
      const fatA = productA.nutriments.saturatedFatPer100g || 0;
      const fatB = productB.nutriments.saturatedFatPer100g || 0;
      if (fatA < fatB) scoreA += 2; else if (fatB < fatA) scoreB += 2;
      break;
    case 'clean_eating':
      if (addA < addB) scoreA += 3; else if (addB < addA) scoreB += 3;
      if ((productA.novaGroup || 4) < (productB.novaGroup || 4)) scoreA += 2;
      if ((productB.novaGroup || 4) < (productA.novaGroup || 4)) scoreB += 2;
      break;
    case 'energy_focus':
      if (sugarA < sugarB) scoreA += 2; else if (sugarB < sugarA) scoreB += 2;
      const fiberA = productA.nutriments.fiberPer100g || 0;
      const fiberB = productB.nutriments.fiberPer100g || 0;
      if (fiberA > fiberB) scoreA += 2; else if (fiberB > fiberA) scoreB += 2;
      break;
  }

  let winner: 'productA' | 'productB' | 'tie' = 'tie';
  let winnerHeadline = 'Even Matchup';
  let verdictReason = 'Both products exhibit comparable health and metabolic markers.';

  if (scoreA > scoreB) {
    winner = 'productA';
    winnerHeadline = `${productA.name.split(' ')[0]} Wins`;
    verdictReason = `${productA.name} is the superior metabolic choice with lower glycemic volatility and cleaner formulation.`;
  } else if (scoreB > scoreA) {
    winner = 'productB';
    winnerHeadline = `${productB.name.split(' ')[0]} Wins`;
    verdictReason = `${productB.name} is superior for your ${activeGoal.replace('_', ' ')} goal, saving ${Math.abs(sugarDiff)}g of sugar.`;
  }

  return {
    winner,
    winnerHeadline,
    verdictReason,
    sugarDiffGrams: Math.abs(sugarDiff),
    sugarCubesDiff: Math.abs(sugarCubesDiff),
    caloriesDiff: Math.abs(calDiff),
    additivesDiff: Math.abs(addDiff)
  };
}

// 11. SNAP-A-LABEL & SMART TEXT / OCR NUTRITION PARSER
export function parseNutritionAndIngredientsFromText(
  rawText: string,
  productName: string = 'Scanned Food Label'
): ScannedProduct {
  const clean = rawText.toLowerCase();

  // Extract sugars: e.g. "sugars: 12g", "sugar 14.5 g", "10g sugars"
  let sugars = 0;
  const sugarMatch = clean.match(/(?:sugars?|total sugars?)\s*[:\-]?\s*(\d+(?:\.\d+)?)\s*g?/i) 
    || clean.match(/(\d+(?:\.\d+)?)\s*g?\s*(?:of\s*)?sugars?/i);
  if (sugarMatch) {
    sugars = parseFloat(sugarMatch[1]);
  }

  // Extract calories: e.g. "calories: 250", "140 kcal", "energy: 1500kj / 350kcal"
  let calories = 0;
  const calMatch = clean.match(/(?:calories|energy|energy value)\s*[:\-]?\s*(\d+)/i)
    || clean.match(/(\d+)\s*k?cal/i);
  if (calMatch) {
    calories = parseInt(calMatch[1], 10);
  }

  // Extract fats & saturated fat
  let fat = 0;
  const fatMatch = clean.match(/(?:total fat|fat)\s*[:\-]?\s*(\d+(?:\.\d+)?)\s*g?/i);
  if (fatMatch) fat = parseFloat(fatMatch[1]);

  let saturatedFat = 0;
  const satMatch = clean.match(/(?:saturated fat|saturates)\s*[:\-]?\s*(\d+(?:\.\d+)?)\s*g?/i);
  if (satMatch) saturatedFat = parseFloat(satMatch[1]);

  // Extract protein
  let protein = 0;
  const protMatch = clean.match(/(?:protein|proteins)\s*[:\-]?\s*(\d+(?:\.\d+)?)\s*g?/i);
  if (protMatch) protein = parseFloat(protMatch[1]);

  // Extract fiber
  let fiber = 0;
  const fibMatch = clean.match(/(?:fiber|dietary fiber|fibres)\s*[:\-]?\s*(\d+(?:\.\d+)?)\s*g?/i);
  if (fibMatch) fiber = parseFloat(fibMatch[1]);

  // Extract salt/sodium
  let salt = 0;
  const saltMatch = clean.match(/(?:salt|sodium)\s*[:\-]?\s*(\d+(?:\.\d+)?)\s*(?:g|mg)?/i);
  if (saltMatch) {
    const val = parseFloat(saltMatch[1]);
    salt = clean.includes('mg') ? val / 1000 : val;
  }

  // Detect additives from text
  const detectedAdditives: ProductAdditiveInfo[] = [];
  for (const [codeKey, info] of Object.entries(ADDITIVES_CATALOG)) {
    if (clean.includes(codeKey) || clean.includes(info.name.toLowerCase())) {
      detectedAdditives.push(info);
    }
  }

  const barcode = `label-${Date.now()}`;
  const mockRawData = {
    product: {
      product_name: productName,
      brands: 'Label Reader Import',
      categories: 'Smart OCR Packaged Food',
      ingredients_text: rawText,
      nutriments: {
        'energy-kcal_100g': calories,
        sugars_100g: sugars,
        fat_100g: fat,
        'saturated-fat_100g': saturatedFat,
        proteins_100g: protein,
        fiber_100g: fiber,
        salt_100g: salt
      },
      additives_tags: detectedAdditives.map(a => `en:${a.code.toLowerCase()}`),
      nova_group: detectedAdditives.length > 0 || sugars > 15 ? 4 : 2
    }
  };

  const product = normalizeProductData(mockRawData, barcode);
  saveProductToOfflineCache(product);
  return product;
}

