/**
 * Tests for Utility Modules
 * Tests formatting, date-utils, and drawdown engine.
 */

const fs = require('fs');
const path = require('path');

// Load utility modules (they're plain functions, no DOM dependency)
// Note: eval() makes function declarations available in scope,
// but const/let declarations do not escape eval scope in strict mode.
// We replace `const APP_CONFIG` with `var APP_CONFIG` so it's accessible.

const configCode = fs.readFileSync(path.join(__dirname, '..', 'src', 'config.js'), 'utf8');
eval(configCode.replace(/^const APP_CONFIG/m, 'var APP_CONFIG'));

const formattingCode = fs.readFileSync(path.join(__dirname, '..', 'src', 'utils', 'formatting.js'), 'utf8');
eval(formattingCode);

const dateUtilsCode = fs.readFileSync(path.join(__dirname, '..', 'src', 'utils', 'date-utils.js'), 'utf8');
eval(dateUtilsCode);

const drawdownCode = fs.readFileSync(path.join(__dirname, '..', 'src', 'utils', 'drawdown.js'), 'utf8');
eval(drawdownCode);

// ══════════════════════════════════════════════════════════════════
//  FORMATTING TESTS
// ══════════════════════════════════════════════════════════════════
describe('Formatting Utilities', () => {

    describe('unformatNumber', () => {
        test('should remove commas from formatted string', () => {
            expect(unformatNumber('600,000')).toBe('600000');
        });
        test('should handle string without commas', () => {
            expect(unformatNumber('50000')).toBe('50000');
        });
        test('should handle non-string input', () => {
            expect(unformatNumber(12345)).toBe('12345');
        });
    });

    describe('formatNumberWithCommas', () => {
        test('should add thousands separators', () => {
            expect(formatNumberWithCommas(1234567)).toBe('1,234,567');
        });
        test('should not format numbers under 1000', () => {
            expect(formatNumberWithCommas(999)).toBe('999');
        });
    });

    describe('formatCurrency', () => {
        test('should format with £ symbol and 2 decimals', () => {
            const result = formatCurrency(1234.5);
            expect(result).toMatch(/^£1,234\.50$/);
        });
        test('should handle zero', () => {
            expect(formatCurrency(0)).toBe('£0.00');
        });
    });

    describe('formatChartCurrency', () => {
        test('should abbreviate thousands as k', () => {
            expect(formatChartCurrency(250000)).toBe('£250k');
        });
        test('should abbreviate millions as M', () => {
            expect(formatChartCurrency(1500000)).toBe('£1.5M');
        });
    });

    describe('parseCurrencyInput', () => {
        test('should parse formatted currency string', () => {
            expect(parseCurrencyInput('600,000')).toBe(600000);
        });
        test('should return 0 for invalid input', () => {
            expect(parseCurrencyInput('abc')).toBe(0);
        });
        test('should return 0 for empty string', () => {
            expect(parseCurrencyInput('')).toBe(0);
        });
    });
});

// ══════════════════════════════════════════════════════════════════
//  DATE UTILITY TESTS
// ══════════════════════════════════════════════════════════════════
describe('Date Utilities', () => {

    describe('calculateExactAge', () => {
        test('should calculate exact age with years, months, days', () => {
            const refDate = new Date(2025, 5, 15); // June 15, 2025
            const age = calculateExactAge('1990-01-01', refDate);
            expect(age.years).toBe(35);
            expect(age.months).toBe(5);
            expect(age.days).toBe(14);
        });
        test('should handle birthday not yet occurred this year', () => {
            const refDate = new Date(2025, 0, 1); // Jan 1, 2025
            const age = calculateExactAge('1990-06-15', refDate);
            expect(age.years).toBe(34);
        });
    });

    describe('calculateCurrentAge', () => {
        test('should return whole years', () => {
            const age = calculateCurrentAge('1990-01-01');
            expect(typeof age).toBe('number');
            expect(age).toBeGreaterThan(30);
            expect(age).toBeLessThan(40);
        });
    });

    describe('calculateRetirementAge', () => {
        test('should compute difference in years', () => {
            expect(calculateRetirementAge('1972-01-01', '2032-01-01')).toBe(60);
        });
        test('should handle Date objects', () => {
            expect(calculateRetirementAge(new Date('1972-01-01'), new Date('2037-01-01'))).toBe(65);
        });
    });

    describe('formatAge', () => {
        test('should format as readable string', () => {
            const result = formatAge({ years: 52, months: 5, days: 14 });
            expect(result).toBe('52 years, 5 months, and 14 days old');
        });
    });
});

// ══════════════════════════════════════════════════════════════════
//  DRAWDOWN ENGINE TESTS
// ══════════════════════════════════════════════════════════════════
describe('Drawdown Simulation Engine', () => {

    describe('simulateDrawdown', () => {
        test('should return correct structure', () => {
            const result = simulateDrawdown({
                startingPot: 500000, annualSpending: 20000,
                growthRate: 0.05, years: 30, retirementAge: 65
            });
            expect(result).toHaveProperty('results');
            expect(result).toHaveProperty('finalBalance');
            expect(result).toHaveProperty('moneyLasts');
            expect(result).toHaveProperty('depletionAge');
        });

        test('year 0 should have no spending applied', () => {
            const result = simulateDrawdown({
                startingPot: 500000, annualSpending: 20000,
                growthRate: 0.05, years: 5, retirementAge: 65
            });
            expect(result.results[0].funded).toBe(0);
            expect(result.results[0].potAfter).toBe(500000);
        });

        test('should track depletion age', () => {
            const result = simulateDrawdown({
                startingPot: 100000, annualSpending: 50000,
                growthRate: 0.02, years: 40, retirementAge: 60
            });
            expect(result.moneyLasts).toBe(false);
            expect(result.depletionAge).toBeLessThan(100);
        });

        test('should last when pot is large enough', () => {
            const result = simulateDrawdown({
                startingPot: 2000000, annualSpending: 20000,
                growthRate: 0.05, years: 35, retirementAge: 65
            });
            expect(result.moneyLasts).toBe(true);
            expect(result.depletionAge).toBeNull();
        });

        test('shortfall + funded should equal annual spending', () => {
            const result = simulateDrawdown({
                startingPot: 100000, annualSpending: 50000,
                growthRate: 0.02, years: 10, retirementAge: 60
            });
            result.results.slice(1).forEach(r => {
                expect(r.funded + r.shortfall).toBeCloseTo(50000, 0);
            });
        });
    });

    describe('computeStackingBands', () => {
        test('bands should sum to absolute values', () => {
            const weak    = [100, 200, 300];
            const avg     = [150, 250, 350];
            const strong  = [200, 300, 400];
            const { bandWeak, bandAvgExtra, bandStrongExtra } = computeStackingBands(weak, avg, strong);

            for (let i = 0; i < weak.length; i++) {
                expect(bandWeak[i] + bandAvgExtra[i] + bandStrongExtra[i]).toBe(strong[i]);
            }
        });

        test('should handle null values', () => {
            const { bandWeak, bandAvgExtra, bandStrongExtra } = computeStackingBands(
                [null, 100], [null, 200], [null, 300]
            );
            expect(bandWeak[0]).toBeNull();
            expect(bandAvgExtra[0]).toBeNull();
            expect(bandStrongExtra[0]).toBeNull();
        });

        test('bands should never be negative', () => {
            const { bandWeak, bandAvgExtra, bandStrongExtra } = computeStackingBands(
                [100, 0, 50], [80, 0, 100], [120, 0, 200]
            );
            bandAvgExtra.forEach(v => { if (v !== null) expect(v).toBeGreaterThanOrEqual(0); });
            bandStrongExtra.forEach(v => { if (v !== null) expect(v).toBeGreaterThanOrEqual(0); });
        });
    });

    describe('simulateAllScenarios', () => {
        test('should return weak, average, strong results', () => {
            const result = simulateAllScenarios({
                annualSpending: 25000, years: 35, retirementAge: 65,
                retirementPots: { weak: 400000, average: 600000, strong: 900000 }
            });
            expect(result).toHaveProperty('weak');
            expect(result).toHaveProperty('average');
            expect(result).toHaveProperty('strong');
        });

        test('strong should last longer than weak', () => {
            const result = simulateAllScenarios({
                annualSpending: 40000, years: 40, retirementAge: 60,
                retirementPots: { weak: 300000, average: 500000, strong: 800000 }
            });
            const weakLastYear = result.weak.results.filter(r => r.potAfter > 0).length;
            const strongLastYear = result.strong.results.filter(r => r.potAfter > 0).length;
            expect(strongLastYear).toBeGreaterThanOrEqual(weakLastYear);
        });
    });
});

// ══════════════════════════════════════════════════════════════════
//  CONFIG TESTS
// ══════════════════════════════════════════════════════════════════
describe('APP_CONFIG', () => {
    test('should be frozen (immutable)', () => {
        expect(Object.isFrozen(APP_CONFIG)).toBe(true);
    });

    test('should have correct scenario rates', () => {
        expect(APP_CONFIG.SCENARIOS.WEAK.rate).toBe(0.02);
        expect(APP_CONFIG.SCENARIOS.AVERAGE.rate).toBe(0.05);
        expect(APP_CONFIG.SCENARIOS.STRONG.rate).toBe(0.08);
    });

    test('should have correct UK pension rules', () => {
        expect(APP_CONFIG.UK_MIN_PENSION_AGE).toBe(55);
        expect(APP_CONFIG.TAX_FREE_LUMP_SUM_RATE).toBe(0.25);
        expect(APP_CONFIG.MAX_TAX_FREE_LUMP).toBe(268275);
    });

    test('SCENARIO_LIST should have 3 entries', () => {
        expect(APP_CONFIG.SCENARIO_LIST).toHaveLength(3);
    });

    test('TARGET_AGE should be 100', () => {
        expect(APP_CONFIG.TARGET_AGE).toBe(100);
    });
});
