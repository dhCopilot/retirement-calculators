/**
 * Browser Test Runner — Lightweight Jest-compatible test framework
 * Provides describe(), it(), test(), expect() with common matchers
 * for running the NestMapOS test suite directly in the browser.
 * @version 0.4.1
 */

const BrowserTestRunner = (() => {
    'use strict';

    // ── State ────────────────────────────────────────────────────
    let suites = [];
    let currentSuite = null;
    let results = { total: 0, passed: 0, failed: 0, suites: [] };
    let onTestComplete = null;
    let onSuiteComplete = null;
    let onAllComplete = null;

    // ── describe / it / test ─────────────────────────────────────
    function describe(name, fn) {
        const parentSuite = currentSuite;
        const suite = { name, tests: [], children: [], parent: parentSuite, passed: 0, failed: 0 };

        if (parentSuite) {
            parentSuite.children.push(suite);
        } else {
            suites.push(suite);
        }

        currentSuite = suite;
        try { fn(); } catch (e) {
            suite.tests.push({ name: '(suite setup error)', passed: false, error: e.message });
        }
        currentSuite = parentSuite;
    }

    function it(name, fn) {
        if (!currentSuite) throw new Error('it() must be called inside describe()');
        currentSuite.tests.push({ name, fn, passed: null, error: null });
    }
    const test = it; // Jest alias

    // ── expect() with matchers ───────────────────────────────────
    function expect(actual) {
        const matchers = {
            toBe(expected) {
                if (actual !== expected)
                    throw new Error(`Expected ${JSON.stringify(expected)} but got ${JSON.stringify(actual)}`);
            },
            toEqual(expected) {
                if (JSON.stringify(actual) !== JSON.stringify(expected))
                    throw new Error(`Expected deep equal ${JSON.stringify(expected)} but got ${JSON.stringify(actual)}`);
            },
            toBeGreaterThan(expected) {
                if (!(actual > expected))
                    throw new Error(`Expected ${actual} > ${expected}`);
            },
            toBeGreaterThanOrEqual(expected) {
                if (!(actual >= expected))
                    throw new Error(`Expected ${actual} >= ${expected}`);
            },
            toBeLessThan(expected) {
                if (!(actual < expected))
                    throw new Error(`Expected ${actual} < ${expected}`);
            },
            toBeLessThanOrEqual(expected) {
                if (!(actual <= expected))
                    throw new Error(`Expected ${actual} <= ${expected}`);
            },
            toBeCloseTo(expected, precision) {
                const p = precision !== undefined ? precision : 2;
                const diff = Math.abs(actual - expected);
                const threshold = Math.pow(10, -p) / 2;
                if (diff > threshold)
                    throw new Error(`Expected ${actual} to be close to ${expected} (precision ${p}, diff ${diff})`);
            },
            toHaveProperty(prop, value) {
                if (!(prop in actual))
                    throw new Error(`Expected object to have property "${prop}"`);
                if (value !== undefined && actual[prop] !== value)
                    throw new Error(`Expected property "${prop}" to be ${JSON.stringify(value)} but got ${JSON.stringify(actual[prop])}`);
            },
            toHaveLength(expected) {
                if (actual.length !== expected)
                    throw new Error(`Expected length ${expected} but got ${actual.length}`);
            },
            toContain(expected) {
                const haystack = typeof actual === 'string' ? actual : JSON.stringify(actual);
                if (!haystack.includes(expected))
                    throw new Error(`Expected "${haystack}" to contain "${expected}"`);
            },
            toMatch(pattern) {
                if (!pattern.test(actual))
                    throw new Error(`Expected "${actual}" to match ${pattern}`);
            },
            toBeDefined() {
                if (actual === undefined)
                    throw new Error(`Expected value to be defined but got undefined`);
            },
            toBeNull() {
                if (actual !== null)
                    throw new Error(`Expected null but got ${JSON.stringify(actual)}`);
            },
            toBeNaN() {
                if (!isNaN(actual))
                    throw new Error(`Expected NaN but got ${actual}`);
            }
        };
        return matchers;
    }

    // ── Run engine ───────────────────────────────────────────────
    function resetSuiteState(suite) {
        suite.passed = 0;
        suite.failed = 0;
        suite.tests.forEach(t => { t.passed = null; t.error = null; });
        suite.children.forEach(child => resetSuiteState(child));
    }

    function runSuite(suite, path) {
        const suitePath = path ? `${path} > ${suite.name}` : suite.name;

        suite.tests.forEach(t => {
            results.total++;
            try {
                t.fn();
                t.passed = true;
                results.passed++;
                suite.passed++;
            } catch (e) {
                t.passed = false;
                t.error = e.message || String(e);
                results.failed++;
                suite.failed++;
            }
            if (onTestComplete) onTestComplete(t, suitePath, suite);
        });

        suite.children.forEach(child => runSuite(child, suitePath));

        // Bubble child counts up
        suite.children.forEach(child => {
            suite.passed += child.passed;
            suite.failed += child.failed;
        });

        if (onSuiteComplete) onSuiteComplete(suite, suitePath);
    }

    function runAll() {
        results = { total: 0, passed: 0, failed: 0, suites: [], startTime: Date.now() };
        suites.forEach(s => resetSuiteState(s));
        suites.forEach(s => {
            runSuite(s, '');
            results.suites.push(s);
        });
        results.duration = Date.now() - results.startTime;
        if (onAllComplete) onAllComplete(results);
        return results;
    }

    function reset() {
        suites = [];
        currentSuite = null;
        results = { total: 0, passed: 0, failed: 0, suites: [] };
    }

    // ── Public API ───────────────────────────────────────────────
    return {
        describe,
        it,
        test,
        expect,
        runAll,
        reset,
        set onTestComplete(fn) { onTestComplete = fn; },
        set onSuiteComplete(fn) { onSuiteComplete = fn; },
        set onAllComplete(fn) { onAllComplete = fn; },
        get results() { return results; }
    };
})();

// Expose globally so test files can use describe/it/expect without prefix
const describe = BrowserTestRunner.describe;
const it = BrowserTestRunner.it;
const test = BrowserTestRunner.test;
const expect = BrowserTestRunner.expect;
