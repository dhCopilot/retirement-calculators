/**
 * Tests for Pension Projection Calculator
 * 
 * To run: npm test
 * To run with coverage: npm run test:coverage
 */

// Load the calculator function
// Note: Since the code uses plain functions (not ES modules),
// we need to load it in a way Jest can use
const fs = require('fs');
const path = require('path');

// Load the calculator source code
const calculatorCode = fs.readFileSync(
  path.join(__dirname, '..', 'src', 'calculators', 'pension-projection.js'),
  'utf8'
);

// Execute in test context to make function available
eval(calculatorCode);

describe('Pension Projection Calculator', () => {
  
  describe('Basic calculations', () => {
    test('should return correct structure', () => {
      const result = calculatePensionProjection(10000, 500, 10, 0.05);
      
      expect(result).toHaveProperty('finalPot');
      expect(result).toHaveProperty('yearByYear');
      expect(result).toHaveProperty('totalContributed');
      expect(result).toHaveProperty('growthAmount');
      expect(result).toHaveProperty('annualGrowthRate');
    });

    test('should calculate with default growth rate of 5%', () => {
      const result = calculatePensionProjection(10000, 500, 10);
      
      expect(result.annualGrowthRate).toBe(0.05);
      expect(result.finalPot).toBeGreaterThan(10000);
    });

    test('should have correct number of yearly entries', () => {
      const years = 10;
      const result = calculatePensionProjection(10000, 500, years, 0.05);
      
      expect(result.yearByYear).toHaveLength(years);
    });

    test('should calculate total contributed correctly', () => {
      const currentPot = 10000;
      const monthly = 500;
      const years = 10;
      const result = calculatePensionProjection(currentPot, monthly, years, 0.05);
      
      expect(result.totalContributed).toBe(currentPot + (monthly * 12 * years));
    });
  });

  describe('Growth calculations', () => {
    test('should grow with positive growth rate', () => {
      const result = calculatePensionProjection(10000, 500, 10, 0.05);
      
      expect(result.finalPot).toBeGreaterThan(result.totalContributed);
      expect(result.growthAmount).toBeGreaterThan(0);
    });

    test('should not grow with 0% growth rate', () => {
      const currentPot = 10000;
      const monthly = 500;
      const years = 5;
      const result = calculatePensionProjection(currentPot, monthly, years, 0);
      
      expect(result.finalPot).toBe(result.totalContributed);
      expect(result.growthAmount).toBe(0);
    });

    test('year by year pot should increase over time', () => {
      const result = calculatePensionProjection(10000, 500, 10, 0.05);
      
      for (let i = 1; i < result.yearByYear.length; i++) {
        expect(result.yearByYear[i].pot).toBeGreaterThan(result.yearByYear[i-1].pot);
      }
    });
  });

  describe('Edge cases', () => {
    test('should handle zero monthly contribution', () => {
      const result = calculatePensionProjection(10000, 0, 10, 0.05);
      
      expect(result.finalPot).toBeGreaterThan(10000);
      expect(result.totalContributed).toBe(10000);
    });

    test('should handle zero initial pot', () => {
      const result = calculatePensionProjection(0, 500, 10, 0.05);
      
      expect(result.finalPot).toBeGreaterThan(0);
    });

    test('should handle 1 year projection', () => {
      const result = calculatePensionProjection(10000, 500, 1, 0.05);
      
      expect(result.yearByYear).toHaveLength(1);
      expect(result.finalPot).toBeGreaterThan(10000);
    });
  });
});
