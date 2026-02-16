/**
 * User Data Storage Module
 * Saves and loads calculator form inputs per user.
 * Uses localStorage keyed by user email (will be replaced by backend API later).
 *
 * @module utils/user-data
 * @version 0.1.0
 */

const UserData = (function () {
    'use strict';

    const DATA_PREFIX = 'detractio_data_';

    /**
     * List of form field IDs to persist, with their type for correct serialisation.
     * 'value' = standard input value, 'checked' = checkbox, 'radio' = radio group
     */
    const FIELDS = [
        // Step 1 – Timeline
        { id: 'birthDate', type: 'value' },
        { id: 'genderSelect', type: 'value' },
        { id: 'retirementAgeSelect', type: 'value' },
        { id: 'postcode', type: 'value' },
        { id: 'manualTargetAge', type: 'value' },
        { id: 'lifeExpectancyMode', type: 'radio', name: 'lifeExpectancyMode' },

        // Step 2 – Pension
        { id: 'currentPot', type: 'value' },
        { id: 'monthlyContribution', type: 'value' },

        // Step 3 – Spending
        { id: 'retirementAnnualSpending', type: 'value' },

        // Step 4 – Assumptions
        { id: 'includeInflation', type: 'checked' },
        { id: 'inflationRate', type: 'value' },
        { id: 'scenarioWeakRate', type: 'value' },
        { id: 'scenarioAverageRate', type: 'value' },
        { id: 'scenarioStrongRate', type: 'value' },
        { id: 'includeFees', type: 'checked' },
        { id: 'platformFee', type: 'value' },
        { id: 'fundFee', type: 'value' },
        { id: 'adviserFee', type: 'value' },

        // Step 5 – Income
        { id: 'spQualifyingYears', type: 'value' },
        { id: 'statePension', type: 'value' },
        { id: 'statePensionAge', type: 'value' },
        { id: 'includeOtherIncome', type: 'checked' },
        { id: 'dbPension', type: 'value' },
        { id: 'dbPensionAge', type: 'value' },
        { id: 'annuityIncome', type: 'value' },
        { id: 'rentalIncome', type: 'value' },
        { id: 'otherIncomeGeneral', type: 'value' }
    ];

    /** Build the storage key for a given user email */
    function _key(email) {
        return DATA_PREFIX + email.toLowerCase();
    }

    /**
     * Save all calculator form fields for the current user.
     * @returns {{ success: boolean, error?: string }}
     */
    function saveFormData() {
        const user = Auth.getCurrentUser();
        if (!user) return { success: false, error: 'You must be logged in to save.' };

        const data = {};
        FIELDS.forEach(function (field) {
            if (field.type === 'radio') {
                const checked = document.querySelector('input[name="' + field.name + '"]:checked');
                data[field.id] = checked ? checked.value : null;
            } else if (field.type === 'checked') {
                const el = document.getElementById(field.id);
                data[field.id] = el ? el.checked : false;
            } else {
                const el = document.getElementById(field.id);
                data[field.id] = el ? el.value : '';
            }
        });

        data._savedAt = new Date().toISOString();
        data._version = '0.1.0';

        try {
            localStorage.setItem(_key(user.email), JSON.stringify(data));
            return { success: true };
        } catch (e) {
            return { success: false, error: 'Failed to save: ' + e.message };
        }
    }

    /**
     * Load saved form data for the current user and populate the calculator.
     * @returns {{ success: boolean, loaded: boolean, error?: string }}
     */
    function loadFormData() {
        const user = Auth.getCurrentUser();
        if (!user) return { success: false, loaded: false, error: 'Not logged in.' };

        try {
            const raw = localStorage.getItem(_key(user.email));
            if (!raw) return { success: true, loaded: false };

            const data = JSON.parse(raw);

            FIELDS.forEach(function (field) {
                if (!(field.id in data)) return;

                if (field.type === 'radio') {
                    const radio = document.querySelector(
                        'input[name="' + field.name + '"][value="' + data[field.id] + '"]'
                    );
                    if (radio) {
                        radio.checked = true;
                        radio.dispatchEvent(new Event('change', { bubbles: true }));
                    }
                } else if (field.type === 'checked') {
                    const el = document.getElementById(field.id);
                    if (el) {
                        el.checked = data[field.id];
                        el.dispatchEvent(new Event('change', { bubbles: true }));
                    }
                } else {
                    const el = document.getElementById(field.id);
                    if (el && data[field.id] !== '' && data[field.id] !== null) {
                        el.value = data[field.id];
                        el.dispatchEvent(new Event('input', { bubbles: true }));
                        el.dispatchEvent(new Event('change', { bubbles: true }));
                    }
                }
            });

            return { success: true, loaded: true, savedAt: data._savedAt };
        } catch (e) {
            return { success: false, loaded: false, error: 'Failed to load: ' + e.message };
        }
    }

    /**
     * Check if the current user has saved data.
     * @returns {boolean}
     */
    function hasSavedData() {
        const user = Auth.getCurrentUser();
        if (!user) return false;
        return localStorage.getItem(_key(user.email)) !== null;
    }

    /**
     * Get the timestamp of the last save, or null.
     * @returns {string|null}
     */
    function getLastSaved() {
        const user = Auth.getCurrentUser();
        if (!user) return null;
        try {
            const data = JSON.parse(localStorage.getItem(_key(user.email)));
            return data?._savedAt || null;
        } catch (_) {
            return null;
        }
    }

    /**
     * Delete saved data for the current user.
     */
    function clearSavedData() {
        const user = Auth.getCurrentUser();
        if (!user) return;
        localStorage.removeItem(_key(user.email));
    }

    return {
        saveFormData: saveFormData,
        loadFormData: loadFormData,
        hasSavedData: hasSavedData,
        getLastSaved: getLastSaved,
        clearSavedData: clearSavedData,
        FIELDS: FIELDS
    };
})();
