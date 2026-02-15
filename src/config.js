/**
 * Application Configuration & Constants
 * Centralised source of truth for all magic numbers and settings.
 *
 * @module config
 * @version 0.4.0
 */

const APP_CONFIG = Object.freeze({

    // ── Scenario Growth Rates ──────────────────────────────────────
    SCENARIOS: Object.freeze({
        WEAK:    { rate: 0.02, label: 'Weak Growth (2%)',    color: '#dc3545', bgAlpha: 0.7, bgAlphaLight: 0.5 },
        AVERAGE: { rate: 0.05, label: 'Average Growth (5%)', color: '#667eea', bgAlpha: 0.7, bgAlphaLight: 0.5 },
        STRONG:  { rate: 0.08, label: 'Strong Growth (8%)',  color: '#28a745', bgAlpha: 0.7, bgAlphaLight: 0.5 }
    }),

    /** Ordered array for iteration */
    SCENARIO_LIST: Object.freeze([
        { id: 'WEAK',    rate: 0.02, label: 'Weak Growth (2%)',    color: '#dc3545' },
        { id: 'AVERAGE', rate: 0.05, label: 'Average Growth (5%)', color: '#667eea' },
        { id: 'STRONG',  rate: 0.08, label: 'Strong Growth (8%)',  color: '#28a745' }
    ]),

    // ── Retirement Defaults ────────────────────────────────────────
    TARGET_AGE: 100,
    SAFE_WITHDRAWAL_RATE: 0.04,
    DEFAULT_INFLATION_RATE: 2.5,    // percentage
    DEFAULT_GROWTH_RATE: 5,         // percentage (selected scenario)

    // ── UK Pension Rules ───────────────────────────────────────────
    UK_MIN_PENSION_AGE: 55,
    UK_MAX_PENSION_AGE: 75,
    UK_STATE_PENSION_AGE: 65,
    TAX_FREE_LUMP_SUM_RATE: 0.25,
    MAX_TAX_FREE_LUMP: 268275,

    // ── Validation Bounds ──────────────────────────────────────────
    MIN_USER_AGE: 18,
    MAX_USER_AGE: 75,
    MAX_PENSION_POT: 10_000_000,
    MAX_MONTHLY_CONTRIBUTION: 100_000,
    MAX_GROWTH_RATE: 15,
    MAX_INFLATION_RATE: 5,

    // ── Chart Appearance ───────────────────────────────────────────
    CHART: Object.freeze({
        SHORTFALL_BG: 'rgba(220, 53, 69, 0.15)',
        SHORTFALL_BORDER: 'rgba(220, 53, 69, 0.4)',
        SHORTFALL_BORDER_DASH: [4, 4],
        TOOLTIP_BG: 'rgba(0, 0, 0, 0.85)',
        TOOLTIP_PADDING: 12,
        MIN_HEIGHT: 450,
        MAX_TICKS: 20,
        MAX_ROTATION: 45
    }),

    // ── Currency / Locale ──────────────────────────────────────────
    LOCALE: 'en-GB',
    CURRENCY_SYMBOL: '£'
});
