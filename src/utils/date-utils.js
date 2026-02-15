/**
 * Date Calculation Utilities
 * Centralised age and date functions — eliminates 7+ duplicate calculations.
 *
 * @module utils/date-utils
 * @version 0.4.0
 */

/**
 * Calculate a person's precise age in years, months, and days.
 * @param {Date|string} birthDate - Date of birth
 * @param {Date} [asOf=new Date()] - Reference date (defaults to today)
 * @returns {{ years: number, months: number, days: number }}
 */
function calculateExactAge(birthDate, asOf) {
    const dob = birthDate instanceof Date ? birthDate : new Date(birthDate);
    const ref = asOf || new Date();

    let years = ref.getFullYear() - dob.getFullYear();
    let months = ref.getMonth() - dob.getMonth();
    let days = ref.getDate() - dob.getDate();

    if (days < 0) {
        months--;
        const prevMonth = new Date(ref.getFullYear(), ref.getMonth(), 0);
        days += prevMonth.getDate();
    }
    if (months < 0) {
        years--;
        months += 12;
    }

    return { years, months, days };
}

/**
 * Calculate current age in whole years (birthday-aware).
 * @param {Date|string} birthDate
 * @returns {number}
 */
function calculateCurrentAge(birthDate) {
    const dob = birthDate instanceof Date ? birthDate : new Date(birthDate);
    const today = new Date();
    let age = today.getFullYear() - dob.getFullYear();
    const monthDiff = today.getMonth() - dob.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < dob.getDate())) {
        age--;
    }
    return age;
}

/**
 * Calculate retirement age from DOB and retirement date.
 * @param {Date|string} birthDate
 * @param {Date|string} retirementDate
 * @returns {number}
 */
function calculateRetirementAge(birthDate, retirementDate) {
    const dob = birthDate instanceof Date ? birthDate : new Date(birthDate);
    const ret = retirementDate instanceof Date ? retirementDate : new Date(retirementDate);
    return ret.getFullYear() - dob.getFullYear();
}

/**
 * Format an exact age object as a human-readable string.
 * @param {{ years: number, months: number, days: number }} age
 * @returns {string}
 */
function formatAge(age) {
    return `${age.years} years, ${age.months} months, and ${age.days} days old`;
}
