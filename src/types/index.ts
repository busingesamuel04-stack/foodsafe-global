// NutriScan Global - Core Domain Types

export type HealthGoal = 
  | 'blood_sugar'     // Blood Sugar & Diabetes Prevention (Glycemic spike focus)
  | 'weight_loss'     // Weight Management & Calorie Control (Calorie density & satiety)
  | 'heart_health'    // Cardiovascular & Blood Pressure (Sodium & saturated fats)
  | 'clean_eating'    // Clean Eating & Family Safe (Artificial dyes & chemical additives)
  | 'energy_focus';   // Sustained Energy & No Sugar Crashes (Energy stability)

export interface HealthGoalMeta {
  id: HealthGoal;
  name: string;
  tagline: string;
  icon: string;
  accentColor: string;
  focusNutrients: string[];
}

export interface ProductNutriments {
  caloriesPer100g?: number;
  sugarsPer100g?: number;
  fatPer100g?: number;
  saturatedFatPer100g?: number;
  saltPer100g?: number;
  sodiumPer100g?: number;
  proteinsPer100g?: number;
  fiberPer100g?: number;
}

export interface ProductAdditiveInfo {
  code: string;
  name: string;
  purpose: string;
  riskLevel: 'safe' | 'caution' | 'high_concern';
  description: string;
}

export interface HealthImpact {
  type: 'positive' | 'concern' | 'neutral';
  title: string;
  description: string;
}

export interface MetabolicSpikePrediction {
  spikeLevel: 'low' | 'moderate' | 'high' | 'severe';
  glycemicIndexEstimate: 'Low (<55)' | 'Medium (55-69)' | 'High (70+)';
  estimatedCrashRisk: 'Very Low' | 'Moderate' | 'High (Rapid Crash in 60-90m)';
  summary: string;
}

export interface PersonalizedVerdict {
  goal: HealthGoal;
  status: 'recommended' | 'moderate_caution' | 'not_recommended';
  headline: string;
  coachingAdvice: string;
}

export interface ProductAlternative {
  name: string;
  category: string;
  whyBetter: string;
  sugarComparison: string;
}

export interface FoodRecallWarning {
  id: string;
  title: string;
  hazard: string;
  authority: string;
  date: string;
  actionRequired: string;
}

export interface ScannedProduct {
  barcode: string;
  name: string;
  brand?: string;
  category?: string;
  imageUrl?: string;
  ingredientsText?: string;
  ingredientsList?: string[];
  nutriments: ProductNutriments;
  nutriscoreGrade?: 'a' | 'b' | 'c' | 'd' | 'e';
  novaGroup?: 1 | 2 | 3 | 4;
  servingSize?: string;
  additives: ProductAdditiveInfo[];
  allergens: string[];
  healthImpacts: HealthImpact[];
  sugarCubesCount: number; // 4g = 1 sugar cube
  metabolicPrediction: MetabolicSpikePrediction;
  personalVerdicts: Record<HealthGoal, PersonalizedVerdict>;
  alternatives: ProductAlternative[];
  source: 'open_food_facts' | 'crowdsourced' | 'reference_database';
  matchedRecall?: FoodRecallWarning;
  dietaryWarnings?: DietaryWarning[];
}

export type DietaryPreference = 
  | 'vegan'
  | 'vegetarian'
  | 'halal'
  | 'kosher'
  | 'gluten_free'
  | 'dairy_free'
  | 'nut_free';

export interface DietaryWarning {
  preference: DietaryPreference;
  type: 'violation' | 'caution';
  title: string;
  reason: string;
}

export interface DuelComparison {
  winner: 'productA' | 'productB' | 'tie';
  winnerHeadline: string;
  verdictReason: string;
  sugarDiffGrams: number;
  sugarCubesDiff: number;
  caloriesDiff: number;
  additivesDiff: number;
}

export type MealType = 'breakfast' | 'lunch' | 'dinner' | 'snack';

export interface DailyLogItem {
  id: string;
  product: ScannedProduct;
  loggedAt: string;
  servingsCount: number;
  mealType: MealType;
}

export interface FoodCategoryMeta {
  id: string;
  name: string;
  icon: string;
  query: string;
  desc: string;
}

export interface DailyMetabolicSummary {
  totalCalories: number;
  totalSugarGrams: number;
  sugarDailyLimitPercent: number; // vs WHO 25g target
  totalSaltGrams: number;
  totalProteinGrams: number;
  ultraProcessedItemsCount: number;
  chemicalAdditivesCount: number;
  cleanEatingScore: number; // 0 - 100 score
}

export interface CrowdsourcedProductSubmission {
  barcode: string;
  name: string;
  brand?: string;
  ingredientsText?: string;
  sugarsPer100g?: number;
  caloriesPer100g?: number;
  notes?: string;
}
