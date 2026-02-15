/**
 * Formatting Utilities
 * Centralised currency and number formatting functions.
 *
 * @module utils/formatting
 * @version 0.4.0
 */

/**
 * Remove thousands-separator commas from a formatted string.
 * @param {string} value - The formatted string (e.g. "600,000")
 * @returns {string} Raw numeric string (e.g. "600000")
 */
function unformatNumber(value) {
    if (typeof value !== 'string') return String(value);
    return value.replace(/,/g, '');
}

/**
 * Format a number with thousands-separator commas.
 * @param {number|string} value - The numeric value
 * @returns {string} Formatted string (e.g. "600,000")
 */
function formatNumberWithCommas(value) {
    return value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
}

/**
 * Format a value as GBP currency (e.g. "£1,234.56").
 * @param {number} amount - The monetary amount
 * @returns {string} Formatted currency string
 */
function formatCurrency(amount) {
    const locale = (typeof APP_CONFIG !== 'undefined') ? APP_CONFIG.LOCALE : 'en-GB';
    return '£' + amount.toLocaleString(locale, {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    });
}

/**
 * Format a pot value for chart tick labels (e.g. "£250k", "£1.2M").
 * @param {number} value - The numeric value
 * @returns {string} Abbreviated currency string
 */
function formatChartCurrency(value) {
    if (value >= 1_000_000) return '£' + (value / 1_000_000).toFixed(1) + 'M';
    return '£' + (value / 1_000).toFixed(0) + 'k';
}

/**
 * Parse a potentially-formatted currency input to a number.
 * Returns 0 for invalid input instead of NaN.
 * @param {string} value - Raw or formatted input
 * @returns {number}
 */
function parseCurrencyInput(value) {
    const num = parseFloat(unformatNumber(value));
    return isNaN(num) ? 0 : num;
}
