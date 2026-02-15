/**
 * Tests for Income Projection Calculator
 */

const fs = require('fs');
const path = require('path');

// Load calculator code
const incomeCode = fs.readFileSync(
  path.join(__dirname, '..', 'src', 'calculators', 'income-projection.js'),
  'utf8'
);

eval(incomeCode);

describe('Income Projection Calculator', () => {
  
  describe('Basic calculations', () => {
    test('should return correct structure', () => {
      const result = calculateIncomeProjection(100000);
      
      expect(result).toHaveProperty('taxFreeLumpSum');
      expect(result).toHaveProperty('drawdownPot');
      expect(result).toHaveProperty('annualIncome');
      expect(result).toHaveProperty('monthlyIncome');
    });

    test('should calculate tax-free lump sum at 25%', () => {
      const pot = 100000;
      const result = calculateIncomeProjection(pot);
      
      expect(result.taxFreeLumpSum).toBe(pot * 0.25);
    });

    test('should apply max tax-free lump sum cap', () => {
      const largePot = 2000000; // Over the cap
      const result = calculateIncomeProjection(largePot);
      
      expect(result.taxFreeLumpSum).toBe(268275); // UK limit
    });

    test('should calculate remaining drawdown pot correctly', () => {
      const pot = 100000;
      const result = calculateIncomeProjection(pot);
      
      expect(result.drawdownPot).toBe(pot - result.taxFreeLumpSum);
    });

    test('should apply 4% safe withdrawal rate', () => {
      const pot = 100000;
      const result = calculateIncomeProjection(pot);
      const expectedDrawdown = pot - (pot * 0.25); // drawdown pot
      
      expect(result.annualIncome).toBeCloseTo(expectedDrawdown * 0.04, 2);
    });

    test('should calculate monthly income correctly', () => {
      const pot = 100000;
      const result = calculateIncomeProjection(pot);
      
      expect(result.monthlyIncome).toBeCloseTo(result.annualIncome / 12, 2);
    });
  });

  describe('Edge cases', () => {
    test('should handle small pots', () => {
      const result = calculateIncomeProjection(1000);
      
      expect(result.taxFreeLumpSum).toBe(250);
      expect(result.annualIncome).toBeGreaterThan(0);
    });

    test('should handle zero pot', () => {
      const result = calculateIncomeProjection(0);
      
      expect(result.annualIncome).toBe(0);
      expect(result.monthlyIncome).toBe(0);
    });

    test('should handle very large pots', () => {
      const result = calculateIncomeProjection(10000000);
      
      expect(result.taxFreeLumpSum).toBe(268275); // Capped at limit
    });
  });

  describe('Percentage calculations', () => {
    test('income should be 3% of original pot (after tax-free)', () => {
      const pot = 1000000;
      const result = calculateIncomeProjection(pot);
      
      // (pot - 25% lump sum) * 4% withdrawal
      const expectedIncome = (pot * 0.75) * 0.04;
      
      expect(result.annualIncome).toBeCloseTo(expectedIncome, 2);
    });
  });
});
