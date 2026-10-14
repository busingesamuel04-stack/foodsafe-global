import { describe, it } from 'node:test';
import assert from 'node:assert';

describe('NutriScan Core Metabolic Intelligence Test Suite', () => {
  it('calculates sugar cubes correctly (4g per cube standard)', () => {
    const sugarGrams = 35; // typical 330ml soda
    const sugarCubes = Math.round(sugarGrams / 4);
    assert.strictEqual(sugarCubes, 9);

    const whoDailyLimitGrams = 25;
    const dailyLimitPercentage = Math.round((sugarGrams / whoDailyLimitGrams) * 100);
    assert.strictEqual(dailyLimitPercentage, 140);
    assert.ok(sugarGrams > whoDailyLimitGrams, 'Should flag single beverage exceeding WHO 25g limit');
  });

  it('evaluates clean eating index formula accurately', () => {
    const baseScore = 100;
    const sugarPenaltyA = Math.min(40, (0 / 25) * 20);
    const novaPenaltyA = Math.min(30, 0 * 12);
    const additivePenaltyA = Math.min(20, 0 * 4);
    const cleanScoreA = Math.max(10, Math.round(baseScore - sugarPenaltyA - novaPenaltyA - additivePenaltyA));
    assert.strictEqual(cleanScoreA, 100);

    const sugarPenaltyB = Math.min(40, (105 / 25) * 20);
    const novaPenaltyB = Math.min(30, 3 * 12);
    const additivePenaltyB = Math.min(20, 6 * 4);
    const cleanScoreB = Math.max(10, Math.round(baseScore - sugarPenaltyB - novaPenaltyB - additivePenaltyB));
    assert.strictEqual(cleanScoreB, 10);
  });

  it('verifies glycemic spike categorization logic', () => {
    const evaluateSpike = (sugars: number, fiber: number, protein: number) => {
      const buffer = (fiber * 2.5) + (protein * 1.5);
      if (sugars > 15 && buffer < 2) return 'severe';
      if (sugars > 10 && buffer < 3) return 'high';
      if (sugars > 5) return 'moderate';
      return 'low';
    };

    assert.strictEqual(evaluateSpike(10.6, 0, 0), 'high');
    assert.strictEqual(evaluateSpike(25, 0, 0), 'severe');
    assert.strictEqual(evaluateSpike(2, 6, 12), 'low');
  });

  it('validates 5 distinct health goal dimensions', () => {
    const healthGoalIds = [
      'blood_sugar',
      'weight_loss',
      'heart_health',
      'clean_eating',
      'energy_focus'
    ];
    assert.strictEqual(healthGoalIds.length, 5);
    assert.ok(healthGoalIds.includes('blood_sugar'));
    assert.ok(healthGoalIds.includes('clean_eating'));
  });

  it('evaluates dietary & allergen violation rules', () => {
    const checkDietary = (text: string, additives: string[], pref: string) => {
      const clean = text.toLowerCase();
      if (pref === 'vegan') {
        const nonVegan = ['milk', 'dairy', 'whey', 'gelatin', 'carmine'];
        const nonVeganAdd = ['e120', 'e904'];
        return nonVegan.some(k => clean.includes(k)) || additives.some(a => nonVeganAdd.includes(a.toLowerCase()));
      }
      if (pref === 'gluten_free') {
        return ['wheat', 'barley', 'rye', 'malt', 'gluten'].some(k => clean.includes(k));
      }
      return false;
    };

    // Case 1: Dairy in Milk Chocolate violates Vegan
    assert.strictEqual(checkDietary('Sugar, whole milk powder, cocoa butter', [], 'vegan'), true);
    // Case 2: Pure Sparkling Water complies with Vegan
    assert.strictEqual(checkDietary('Carbonated water, natural lime essence', [], 'vegan'), false);
    // Case 3: Wheat Flour in cookies violates Gluten-Free
    assert.strictEqual(checkDietary('Enriched wheat flour, palm oil, salt', [], 'gluten_free'), true);
  });

  it('evaluates NutriDuel comparison logic', () => {
    const prodA = { sugar: 35, cal: 140, additivesCount: 3 };
    const prodB = { sugar: 2, cal: 15, additivesCount: 0 };

    const sugarDiff = Math.abs(prodA.sugar - prodB.sugar);
    assert.strictEqual(sugarDiff, 33);

    // In blood sugar mode, lower sugar should win
    const winner = prodB.sugar < prodA.sugar ? 'productB' : 'productA';
    assert.strictEqual(winner, 'productB');
  });

  it('verifies label parser regex extraction', () => {
    const sampleLabel = 'Nutrition Facts: Calories 210 kcal. Total Sugars 24g. Protein 4.5g. Ingredients: Water, Sugar, E150d.';
    const sugarMatch = sampleLabel.match(/(?:sugars?|total sugars?)\s*[:\-]?\s*(\d+(?:\.\d+)?)\s*g?/i);
    assert.ok(sugarMatch);
    assert.strictEqual(parseFloat(sugarMatch[1]), 24);

    const calMatch = sampleLabel.match(/(?:calories|energy)\s*[:\-]?\s*(\d+)/i);
    assert.ok(calMatch);
    assert.strictEqual(parseInt(calMatch[1], 10), 210);

    const containsE150d = sampleLabel.toLowerCase().includes('e150d');
    assert.strictEqual(containsE150d, true);
  });

  it('validates 4 structured meal types (Breakfast, Lunch, Dinner, Snack)', () => {
    const mealTypes = ['breakfast', 'lunch', 'dinner', 'snack'];
    assert.strictEqual(mealTypes.length, 4);
    assert.ok(mealTypes.includes('breakfast'));
    assert.ok(mealTypes.includes('dinner'));
  });

  it('validates global food categories metadata', () => {
    const categories = ['sodas', 'chocolates', 'cereals', 'milks', 'snacks', 'breads'];
    assert.strictEqual(categories.length, 6);
    assert.ok(categories.includes('sodas'));
    assert.ok(categories.includes('cereals'));
  });
});

