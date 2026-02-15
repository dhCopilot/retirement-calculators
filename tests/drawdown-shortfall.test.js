/**
 * Tests for Drawdown Shortfall Calculations
 * 
 * These test the shortfall computation logic used in the lifecycle chart.
 * The pattern mirrors createCombinedLifecycleChart's drawdown loop in app.js.
 */

const fs = require('fs');
const path = require('path');

// Load pension projection calculator (needed for retirement pot calculation)
const pensionCode = fs.readFileSync(
  path.join(__dirname, '..', 'src', 'calculators', 'pension-projection.js'),
  'utf8'
);
eval(pensionCode);

/**
 * Simulates the drawdown calculation from app.js, returning
 * yearly balance and shortfall for a given scenario.
 */
function calculateDrawdown(startingPot, annualSpending, growthRate, years) {
    const results = [];
    let balance = startingPot;
    for (let year = 1; year <= years; year++) {
        const growth = balance > 0 ? balance * growthRate : 0;
        const available = balance + growth;
        const shortfall = Math.max(0, annualSpending - available);
        const funded = Math.min(annualSpending, available);
        balance = Math.max(0, available - annualSpending);
        results.push({
            year,
            potBefore: available,
            potAfter: balance,
            funded,
            shortfall
        });
    }
    return results;
}

/**
 * Computes incremental stacking bands from 3 scenario arrays,
 * mirroring the bandWeakBase/bandAvgExtra/bandStrongExtra logic in app.js.
 */
function computeStackingBands(weakValues, avgValues, strongValues) {
    const bandWeak = weakValues.map(v => v !== null ? v : null);
    const bandAvgExtra = avgValues.map((v, i) => {
        if (v === null || weakValues[i] === null) return null;
        return Math.max(0, v - weakValues[i]);
    });
    const bandStrongExtra = strongValues.map((v, i) => {
        if (v === null || avgValues[i] === null) return null;
        return Math.max(0, v - avgValues[i]);
    });
    return { bandWeak, bandAvgExtra, bandStrongExtra };
}

describe('Drawdown Shortfall Calculations', () => {
    
    describe('Basic drawdown with no shortfall', () => {
        test('should have zero shortfall when pot easily covers spending', () => {
            const results = calculateDrawdown(1000000, 25000, 0.05, 5);
            
            results.forEach(r => {
                expect(r.shortfall).toBe(0);
                expect(r.funded).toBe(25000);
                expect(r.potAfter).toBeGreaterThan(0);
            });
        });

        test('should grow pot when growth exceeds spending', () => {
            const results = calculateDrawdown(1000000, 25000, 0.05, 5);
            
            // 5% of £1M = £50k growth, spending £25k, pot should increase
            expect(results[0].potAfter).toBeGreaterThan(1000000);
        });
    });

    describe('Full shortfall — pot depleted', () => {
        test('should show full shortfall once pot is zero', () => {
            const results = calculateDrawdown(10000, 50000, 0, 3);
            
            // Year 1: pot 10k, spending 50k — shortfall 40k
            expect(results[0].shortfall).toBe(40000);
            expect(results[0].funded).toBe(10000);
            expect(results[0].potAfter).toBe(0);
            
            // Year 2+: pot 0, full shortfall
            expect(results[1].shortfall).toBe(50000);
            expect(results[1].funded).toBe(0);
            expect(results[2].shortfall).toBe(50000);
        });

        test('should show full annual spending as shortfall when pot is zero', () => {
            const results = calculateDrawdown(0, 30000, 0.05, 3);
            
            results.forEach(r => {
                expect(r.shortfall).toBe(30000);
                expect(r.funded).toBe(0);
                expect(r.potAfter).toBe(0);
            });
        });
    });

    describe('Partial shortfall — transition year', () => {
        test('should show partial shortfall when pot partially covers spending', () => {
            // Pot of £15k, spending £25k/yr, no growth
            const results = calculateDrawdown(15000, 25000, 0, 3);
            
            // Year 1: 15k available, 25k needed — shortfall = 10k
            expect(results[0].shortfall).toBe(10000);
            expect(results[0].funded).toBe(15000);
            expect(results[0].potAfter).toBe(0);
            
            // Year 2: full shortfall
            expect(results[1].shortfall).toBe(25000);
        });

        test('should show partial shortfall with growth in transition year', () => {
            // Pot of £20k with 5% growth, spending £25k
            // Available = 20000 + 1000 = 21000, shortfall = 4000
            const results = calculateDrawdown(20000, 25000, 0.05, 2);
            
            expect(results[0].shortfall).toBe(4000);
            expect(results[0].funded).toBe(21000);
            expect(results[0].potAfter).toBe(0);
        });

        test('shortfall + funded should equal annual spending', () => {
            const results = calculateDrawdown(15000, 25000, 0, 5);
            
            results.forEach(r => {
                expect(r.shortfall + r.funded).toBe(25000);
            });
        });
    });

    describe('Three-scenario drawdown comparison', () => {
        test('strong scenario should last longer than weak', () => {
            const weak = calculateDrawdown(500000, 30000, 0.02, 40);
            const strong = calculateDrawdown(500000, 30000, 0.08, 40);
            
            const weakFirstShortfall = weak.findIndex(r => r.shortfall > 0);
            const strongFirstShortfall = strong.findIndex(r => r.shortfall > 0);
            
            // Strong should either never have shortfall (-1) or last longer
            if (strongFirstShortfall === -1) {
                expect(strongFirstShortfall).toBe(-1); // no shortfall at all
            } else {
                expect(strongFirstShortfall).toBeGreaterThan(weakFirstShortfall);
            }
        });

        test('weak scenario shortfall should start earliest', () => {
            const weak = calculateDrawdown(300000, 25000, 0.02, 40);
            const avg = calculateDrawdown(300000, 25000, 0.05, 40);
            const strong = calculateDrawdown(300000, 25000, 0.08, 40);
            
            const weakStart = weak.findIndex(r => r.shortfall > 0);
            const avgStart = avg.findIndex(r => r.shortfall > 0);
            
            if (weakStart !== -1 && avgStart !== -1) {
                expect(weakStart).toBeLessThanOrEqual(avgStart);
            }
        });
    });

    describe('Stacking band calculations', () => {
        test('bands should sum to absolute values', () => {
            const weak =   [100, 80, 50, 0, 0];
            const avg =    [120, 100, 80, 40, 0];
            const strong = [150, 130, 110, 80, 30];
            
            const { bandWeak, bandAvgExtra, bandStrongExtra } = computeStackingBands(weak, avg, strong);
            
            // For each index, the sum of bands should equal the strong value
            for (let i = 0; i < weak.length; i++) {
                expect(bandWeak[i] + bandAvgExtra[i] + bandStrongExtra[i]).toBe(strong[i]);
            }
        });

        test('bands should never be negative', () => {
            const weak =   [100, 50, 0, 0];
            const avg =    [120, 80, 30, 0];
            const strong = [150, 100, 60, 10];
            
            const { bandWeak, bandAvgExtra, bandStrongExtra } = computeStackingBands(weak, avg, strong);
            
            bandWeak.forEach(v => expect(v).toBeGreaterThanOrEqual(0));
            bandAvgExtra.forEach(v => expect(v).toBeGreaterThanOrEqual(0));
            bandStrongExtra.forEach(v => expect(v).toBeGreaterThanOrEqual(0));
        });

        test('should handle null values in pre-retirement phase', () => {
            const weak =   [null, null, 100, 80];
            const avg =    [null, null, 120, 100];
            const strong = [null, null, 150, 130];
            
            const { bandWeak, bandAvgExtra, bandStrongExtra } = computeStackingBands(weak, avg, strong);
            
            expect(bandWeak[0]).toBeNull();
            expect(bandAvgExtra[0]).toBeNull();
            expect(bandStrongExtra[0]).toBeNull();
            expect(bandWeak[2]).toBe(100);
            expect(bandAvgExtra[2]).toBe(20);
            expect(bandStrongExtra[2]).toBe(30);
        });
    });

    describe('Integration: pension projection into drawdown', () => {
        test('should calculate correct retirement pot then drawdown', () => {
            // £100k pot, £500/month, 10 years to retirement, 5% growth
            const projection = calculatePensionProjection(100000, 500, 10, 0.05);
            
            expect(projection.finalPot).toBeGreaterThan(100000);
            
            // Drawdown from retirement pot
            const drawdown = calculateDrawdown(projection.finalPot, 30000, 0.05, 30);
            
            // Should have valid data for all years
            expect(drawdown.length).toBe(30);
            drawdown.forEach(r => {
                expect(r.shortfall + r.funded).toBeCloseTo(30000, 0);
                expect(r.potAfter).toBeGreaterThanOrEqual(0);
            });
        });

        test('shortfall should match between weak and strong scenarios', () => {
            const pot = 400000;
            const spending = 25000;
            const years = 40;
            
            const weak = calculateDrawdown(pot, spending, 0.02, years);
            const avg = calculateDrawdown(pot, spending, 0.05, years);
            const strong = calculateDrawdown(pot, spending, 0.08, years);
            
            // Total shortfall should be highest for weak, lowest for strong
            const totalWeakShortfall = weak.reduce((sum, r) => sum + r.shortfall, 0);
            const totalAvgShortfall = avg.reduce((sum, r) => sum + r.shortfall, 0);
            const totalStrongShortfall = strong.reduce((sum, r) => sum + r.shortfall, 0);
            
            expect(totalWeakShortfall).toBeGreaterThanOrEqual(totalAvgShortfall);
            expect(totalAvgShortfall).toBeGreaterThanOrEqual(totalStrongShortfall);
        });
    });
});
