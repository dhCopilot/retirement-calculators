/**
 * Tests for Inflation Calculator
 */

const fs = require('fs');
const path = require('path');

// Load calculator code
const inflationCode = fs.readFileSync(
  path.join(__dirname, '..', 'src', 'calculators', 'inflation-calculator.js'),
  'utf8'
);

eval(inflationCode);

describe('Inflation Calculator', () => {
  
  describe('Real value conversion', () => {
    test('should convert future value to real value', () => {
      const futureValue = 100000;
      const yearsAhead = 10;
      const inflationRate = 0.025; // 2.5%
      
      const realValue = adjustForInflation(futureValue, yearsAhead, inflationRate);
      
      // Real value should be less than future value
      expect(realValue).toBeLessThan(futureValue);
      
      // Verify calculation: 100000 / (1.025^10)
      const expected = futureValue / Math.pow(1 + inflationRate, yearsAhead);
      expect(realValue).toBeCloseTo(expected, 2);
    });

    test('should handle zero inflation', () => {
      const value = 100000;
      const realValue = adjustForInflation(value, 10, 0);
      
      expect(realValue).toBe(value);
    });

    test('should handle zero years', () => {
      const value = 100000;
      const realValue = adjustForInflation(value, 0, 0.025);
      
      expect(realValue).toBe(value);
    });
  });

  describe('Nominal value inflation', () => {
    test('should inflate real value to future value', () => {
      const realValue = 50000;
      const yearsAhead = 10;
      const inflationRate = 0.025; // 2.5%
      
      const nominalValue = inflateValue(realValue, yearsAhead, inflationRate);
      
      // Nominal value should be greater than real value
      expect(nominalValue).toBeGreaterThan(realValue);
      
      // Reverse calculation to verify
      const expected = realValue * Math.pow(1 + inflationRate, yearsAhead);
      expect(nominalValue).toBeCloseTo(expected, 2);
    });

    test('should be inverse of real value conversion', () => {
      const originalValue = 100000;
      const years = 10;
      const inflation = 0.025;
      
      // Start with a value, convert to real, then back to nominal
      const realValue = adjustForInflation(originalValue, years, inflation);
      const backToNominal = inflateValue(realValue, years, inflation);
      
      expect(backToNominal).toBeCloseTo(originalValue, 1); // Allow rounding
    });
  });

  describe('Income adjustments', () => {
    test('should provide both real and nominal income', () => {
      const annualIncome = 30000;
      const yearsUntilRetirement = 10;
      const inflationRate = 0.025;
      
      const result = getInflationAdjustedIncome(annualIncome, yearsUntilRetirement, inflationRate);
      
      expect(result).toHaveProperty('realAnnualIncome');
      expect(result).toHaveProperty('nominalAnnualIncome');
      expect(result).toHaveProperty('realMonthlyIncome');
      expect(result).toHaveProperty('nominalMonthlyIncome');
    });

    test('should calculate correct real and nominal income', () => {
      const annualIncome = 40000;
      const years = 10;
      const inflation = 0.025;
      
      const result = getInflationAdjustedIncome(annualIncome, years, inflation);
      
      // Real annual income should be the base amount
      expect(result.realAnnualIncome).toBe(annualIncome);
      
      // Nominal should be inflated
      expect(result.nominalAnnualIncome).toBeGreaterThan(annualIncome);
      
      // Monthly incomes should be 1/12 of annual
      expect(result.realMonthlyIncome).toBeCloseTo(annualIncome / 12, 2);
      expect(result.nominalMonthlyIncome).toBeCloseTo(result.nominalAnnualIncome / 12, 2);
    });

    test('should handle zero years until retirement', () => {
      const result = getInflationAdjustedIncome(30000, 0, 0.025);
      
      expect(result.realAnnualIncome).toBe(result.nominalAnnualIncome);
      expect(result.realMonthlyIncome).toBe(result.nominalMonthlyIncome);
    });
  });

  describe('Year-by-year adjustments', () => {
    test('should include both real and nominal values', () => {
      const data = [
        { year: 1, pot: 100000, totalContributions: 50000 },
        { year: 2, pot: 105000, totalContributions: 55000 }
      ];
      
      const result = calculateRealAndNominal(data, 0.025);
      
      expect(result).toHaveLength(2);
      result.forEach(item => {
        expect(item).toHaveProperty('realPot');
        expect(item).toHaveProperty('nominalPot');
        expect(item).toHaveProperty('realContributions');
        expect(item).toHaveProperty('nominalContributions');
      });
    });

    test('should show real values adjusted for inflation impact', () => {
      const data = [
        { year: 1, pot: 100000, totalContributions: 50000 },
        { year: 2, pot: 105000, totalContributions: 55000 },
        { year: 3, pot: 110000, totalContributions: 60000 }
      ];
      
      const result = calculateRealAndNominal(data, 0.025);
      
      // Real pot values should be less than nominal for future years
      expect(result[0].realPot).toBeGreaterThan(0);
      expect(result[1].realPot).toBeLessThan(result[1].nominalPot);
      expect(result[2].realPot).toBeLessThan(result[2].nominalPot);
    });
  });

  describe('High inflation scenarios', () => {
    test('should handle 5% inflation', () => {
      const value = 100000;
      const realValue = adjustForInflation(value, 10, 0.05);
      
      // 100000 / 1.05^10 ≈ 61391
      expect(realValue).toBeCloseTo(61391, 0);
    });

    test('should handle very high inflation', () => {
      const value = 100000;
      const realValue = adjustForInflation(value, 10, 0.10);
      
      // Even with 10% inflation, should still calculate
      expect(realValue).toBeGreaterThan(0);
      expect(realValue).toBeLessThan(value);
    });
  });
});
