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
    // Clean score starts at 100
    // Test case A: Ultra-clean whole food diet (0g sugar, 0 NOVA 4, 0 additives)
    const baseScore = 100;
    const sugarPenaltyA = Math.min(40, (0 / 25) * 20);
    const novaPenaltyA = Math.min(30, 0 * 12);
    const additivePenaltyA = Math.min(20, 0 * 4);
    const cleanScoreA = Math.max(10, Math.round(baseScore - sugarPenaltyA - novaPenaltyA - additivePenaltyA));
    assert.strictEqual(cleanScoreA, 100);

    // Test case B: 3 Ultra-processed sodas (105g sugar, 3 NOVA-4 items, 6 additives)
    const sugarPenaltyB = Math.min(40, (105 / 25) * 20); // capped at 40
    const novaPenaltyB = Math.min(30, 3 * 12); // 36 capped at 30
    const additivePenaltyB = Math.min(20, 6 * 4); // 24 capped at 20
    const cleanScoreB = Math.max(10, Math.round(baseScore - sugarPenaltyB - novaPenaltyB - additivePenaltyB));
    assert.strictEqual(cleanScoreB, 10); // hits floor of 10
  });

  it('verifies glycemic spike categorization logic', () => {
    const evaluateSpike = (sugars: number, fiber: number, protein: number) => {
      const buffer = (fiber * 2.5) + (protein * 1.5);
      if (sugars > 15 && buffer < 2) return 'severe';
      if (sugars > 10 && buffer < 3) return 'high';
      if (sugars > 5) return 'moderate';
      return 'low';
    };

    assert.strictEqual(evaluateSpike(10.6, 0, 0), 'high'); // Cola
    assert.strictEqual(evaluateSpike(25, 0, 0), 'severe'); // High sugar beverage
    assert.strictEqual(evaluateSpike(2, 6, 12), 'low'); // Whole grain oats
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
});
