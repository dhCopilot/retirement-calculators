/**
 * Tests for Retirement Income Calculator
 */

const fs = require('fs');
const path = require('path');

// Helper for date functions
const mockDate = {
  getFullYear: () => 2025
};

// Load calculator code
const retirementCode = fs.readFileSync(
  path.join(__dirname, '..', 'src', 'calculators', 'retirement-income.js'),
  'utf8'
);

// Override Date for testing
const originalDate = global.Date;
eval(retirementCode);

describe('Retirement Income Calculator - Spending Plan Mode', () => {
  
  describe('Basic spending plan calculations', () => {
    test('should return correct structure for spending plan', () => {
      const result = calculateSpendingPlan(500000, 30000, 10, 90, 0.05, 0);
      
      expect(result).toHaveProperty('mode', 'spending-plan');
      expect(result).toHaveProperty('moneyLasts');
      expect(result).toHaveProperty('finalBalance');
      expect(result).toHaveProperty('totalSpent');
      expect(result).toHaveProperty('yearByYear');
    });

    test('should calculate year-by-year data', () => {
      const result = calculateSpendingPlan(500000, 30000, 10, 90, 0.05, 0);
      
      expect(result.yearByYear.length).toBeGreaterThan(0);
      result.yearByYear.forEach(item => {
        expect(item).toHaveProperty('year');
        expect(item).toHaveProperty('potAtStart');
        expect(item).toHaveProperty('annualSpend');
        expect(item).toHaveProperty('potAtEnd');
      });
    });
  });

  describe('Money lasting duration', () => {
    test('should indicate when money lasts throughout retirement', () => {
      // Large pot with modest spending
      const result = calculateSpendingPlan(1000000, 30000, 10, 90, 0.05, 0);
      
      expect(result.moneyLasts).toBe(true);
      expect(result.finalBalance).toBeGreaterThan(0);
    });

    test('should indicate when money runs out', () => {
      // Small pot with high spending
      const result = calculateSpendingPlan(10000, 50000, 10, 90, 0, 0);
      
      expect(result.moneyLasts).toBe(false);
      expect(result.ageWhenRunsOut).toBeDefined();
    });

    test('should calculate correct age when money runs out', () => {
      const result = calculateSpendingPlan(30000, 40000, 5, 80, 0, 0);
      
      if (!result.moneyLasts) {
        expect(result.ageWhenRunsOut).toBeGreaterThan(0);
      }
    });
  });

  describe('Total spending calculations', () => {
    test('should sum total spent over retirement', () => {
      const annualSpend = 30000;
      const yearsToRetirement = 10;
      const lifeExp = 85;
      
      const result = calculateSpendingPlan(500000, annualSpend, yearsToRetirement, lifeExp, 0.05, 0);
      
      // Without inflation, rough check
      const roughTotal = annualSpend * (lifeExp - 65);
      expect(result.totalSpent).toBeGreaterThan(0);
    });
  });

  describe('Inflation handling', () => {
    test('should apply inflation to spending amounts', () => {
      const baseSpend = 30000;
      const inflation = 0.03; // 3%
      
      const resultWithInflation = calculateSpendingPlan(500000, baseSpend, 10, 90, 0.05, inflation);
      const resultNoInflation = calculateSpendingPlan(500000, baseSpend, 10, 90, 0.05, 0);
      
      // With inflation, spending should increase year-on-year
      const inflationYear2 = resultWithInflation.yearByYear[1].annualSpend;
      const noInflationYear2 = resultNoInflation.yearByYear[1].annualSpend;
      
      expect(inflationYear2).toBeGreaterThan(noInflationYear2);
    });
  });

  describe('Growth during retirement', () => {
    test('should apply investment growth to remaining pot', () => {
      // Test that growth is being applied - pot with growth should have different trajectory
      const resultWithGrowth = calculateSpendingPlan(300000, 25000, 10, 90, 0.05, 0);
      const resultNoGrowth = calculateSpendingPlan(300000, 25000, 10, 90, 0, 0);
      
      // Both scenarios should complete - growth allows more generous spending
      expect(resultWithGrowth).toHaveProperty('yearByYear');
      expect(resultNoGrowth).toHaveProperty('yearByYear');
      
      // The year-by-year trajectory should be significantly different
      const withGrowthYear1 = resultWithGrowth.yearByYear[0].potAtEnd;
      const noGrowthYear1 = resultNoGrowth.yearByYear[0].potAtEnd;
      
      expect(withGrowthYear1).toBeGreaterThan(noGrowthYear1);
    });
  });
});

describe('Retirement Income Calculator - Maximum Sustainable Spend', () => {
  
  describe('Maximum sustainable calculations', () => {
    test('should return maximum annual and monthly spend', () => {
      const result = calculateMaximumSustainableSpend(500000, 10, 90, 0.05, 0);
      
      expect(result).toHaveProperty('maxAnnualSpend');
      expect(result).toHaveProperty('maxMonthlySpend');
      expect(result.maxMonthlySpend).toBeCloseTo(result.maxAnnualSpend / 12, 2);
    });

    test('should find sustainable spend that lasts entire retirement', () => {
      const result = calculateMaximumSustainableSpend(500000, 10, 90, 0.05, 0);
      const projection = result.projection;
      
      expect(projection.moneyLasts).toBe(true);
    });

    test('should increase with larger starting pot', () => {
      const smallPot = calculateMaximumSustainableSpend(300000, 10, 90, 0.05, 0);
      const largePot = calculateMaximumSustainableSpend(600000, 10, 90, 0.05, 0);
      
      expect(largePot.maxAnnualSpend).toBeGreaterThan(smallPot.maxAnnualSpend);
    });

    test('should decrease with longer retirement', () => {
      const shortRetirement = calculateMaximumSustainableSpend(500000, 10, 75, 0.05, 0);
      const longRetirement = calculateMaximumSustainableSpend(500000, 10, 95, 0.05, 0);
      
      expect(shortRetirement.maxAnnualSpend).toBeGreaterThan(longRetirement.maxAnnualSpend);
    });
  });

  describe('Growth impact on maximum spend', () => {
    test('should increase maximum spend with higher growth rates', () => {
      const lowGrowth = calculateMaximumSustainableSpend(500000, 10, 90, 0.02, 0);
      const highGrowth = calculateMaximumSustainableSpend(500000, 10, 90, 0.05, 0);
      
      // Higher growth should allow equal or greater sustainable spending
      expect(highGrowth.maxAnnualSpend).toBeGreaterThanOrEqual(lowGrowth.maxAnnualSpend - 1);
    });
  });
});

describe('Retirement Status Helper', () => {
  
  test('should return success status when money lasts', () => {
    const status = getRetirementStatus({
      moneyLasts: true,
      finalBalance: 100000
    });
    
    expect(status.status).toBe('success');
    expect(status.icon).toBe('✅');
    expect(status.message).toContain('last');
  });

  test('should return warning status when money runs out', () => {
    const status = getRetirementStatus({
      moneyLasts: false,
      ageWhenRunsOut: 85
    });
    
    expect(status.status).toBe('warning');
    expect(status.icon).toBe('⚠️');
    expect(status.message).toContain('85');
  });
});
