/**
 * Form Helpers
 * Centralised DOM interaction for reading and writing form values.
 * Eliminates scattered getElementById + parseFloat patterns.
 *
 * @module utils/form-helpers
 * @version 0.4.0
 */

/**
 * Safely read a DOM element by ID.
 * @param {string} id
 * @returns {HTMLElement|null}
 */
function getElement(id) {
    return document.getElementById(id);
}

/**
 * Read a numeric value from a formatted currency input.
 * @param {string} id - Element ID
 * @returns {number}
 */
function readCurrencyInput(id) {
    const el = getElement(id);
    if (!el) return 0;
    return parseCurrencyInput(el.value);
}

/**
 * Read the full set of form inputs needed for calculations.
 * Returns a validated, parsed object.
 * @returns {FormInputs}
 */
function readFormInputs() {
    return {
        birthDate:           getElement('birthDate')?.value || '',
        retirementDate:      getElement('retirementDate')?.value || '',
        currentPot:          readCurrencyInput('currentPot'),
        monthlyContribution: readCurrencyInput('monthlyContribution'),
        investmentGrowth:    parseFloat(getElement('investmentGrowth')?.value) || APP_CONFIG.DEFAULT_GROWTH_RATE,
        includeInflation:    getElement('includeInflation')?.checked || false,
        inflationRate:       parseFloat(getElement('inflationRate')?.value) || APP_CONFIG.DEFAULT_INFLATION_RATE,
        annualSpending:      readCurrencyInput('retirementAnnualSpending')
    };
}

/**
 * Show or hide a DOM element by ID.
 * @param {string} id
 * @param {boolean} visible
 */
function toggleVisibility(id, visible) {
    const el = getElement(id);
    if (el) el.style.display = visible ? 'block' : 'none';
}

/**
 * Set text content on an element by ID.
 * @param {string} id
 * @param {string} text
 */
function setText(id, text) {
    const el = getElement(id);
    if (el) el.textContent = text;
}

/**
 * Attach comma-formatting behaviour to currency text inputs.
 * @param {string[]} inputIds - Array of element IDs
 */
function attachCurrencyFormatting(inputIds) {
    inputIds.forEach(id => {
        const el = getElement(id);
        if (!el || el.type === 'number') return;

        el.addEventListener('blur', function () {
            if (this.value) {
                const num = parseCurrencyInput(this.value);
                if (!isNaN(num) && num >= 0) {
                    this.value = formatNumberWithCommas(Math.round(num));
                }
            }
        });

        el.addEventListener('focus', function () {
            if (this.value) {
                this.value = unformatNumber(this.value);
            }
        });
    });
}
