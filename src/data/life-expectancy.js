/**
 * UK Life Expectancy Data
 * Based on ONS National Life Tables (2020-2022) and regional adjustments.
 *
 * National baseline: life expectancy at birth (ONS 2020-2022)
 *   Male:   78.6 years
 *   Female: 82.6 years
 *
 * Regional adjustments derived from ONS Health State Life Expectancy data,
 * mapped by postcode area prefix to broad region.
 *
 * @module data/life-expectancy
 * @version 0.5.0
 */

const LIFE_EXPECTANCY_DATA = Object.freeze({

    // ── National baselines (ONS 2020-2022) ─────────────────────────
    national: Object.freeze({
        male:   78.6,
        female: 82.6
    }),

    // ── Age-based adjustment ───────────────────────────────────────
    // If you've already reached a certain age, your remaining life
    // expectancy is higher than at-birth figures. ONS period life
    // tables give remaining years. We store total expected age.
    // Key = current age bracket, value = { male, female } expected age.
    ageAdjusted: Object.freeze({
        20: { male: 79.5, female: 83.3 },
        25: { male: 79.6, female: 83.4 },
        30: { male: 79.8, female: 83.5 },
        35: { male: 80.0, female: 83.6 },
        40: { male: 80.2, female: 83.8 },
        45: { male: 80.5, female: 84.0 },
        50: { male: 81.0, female: 84.3 },
        55: { male: 81.7, female: 84.8 },
        60: { male: 82.7, female: 85.5 },
        65: { male: 83.9, female: 86.4 },
        70: { male: 85.5, female: 87.6 },
        75: { male: 87.3, female: 89.1 }
    }),

    // ── Regional adjustments (years added/subtracted from national) ─
    // Mapped by postcode area prefix → region → adjustment.
    // Positive = longer life expectancy than national average.
    // Source: ONS Health State Life Expectancy by local authority, aggregated.
    regionAdjustments: Object.freeze({
        // South East England (+1.0 to +1.5)
        'BN': 1.0, 'CT': 0.8, 'GU': 1.5, 'KT': 1.3, 'ME': 0.5,
        'OX': 1.5, 'PO': 0.8, 'RG': 1.3, 'RH': 1.3, 'SL': 1.0,
        'SO': 0.8, 'TN': 1.0, 'HP': 1.2, 'MK': 0.8, 'SG': 1.0,
        'AL': 1.2, 'LU': 0.3, 'SS': 0.5, 'CM': 0.8, 'CO': 0.5,

        // South West England (+0.8 to +1.2)
        'BA': 1.0, 'BS': 0.5, 'DT': 1.0, 'EX': 1.0, 'GL': 1.0,
        'PL': 0.5, 'SN': 1.0, 'SP': 1.2, 'TA': 1.0, 'TQ': 0.8,
        'TR': 0.8, 'BH': 1.0,

        // London (mixed: +0.5 to +1.5 depending on borough)
        'E':  0.3, 'EC': 1.5, 'N':  0.5, 'NW': 0.8, 'SE': 0.3,
        'SW': 1.5, 'W':  1.2, 'WC': 1.5, 'BR': 1.0, 'CR': 0.8,
        'DA': 0.5, 'EN': 0.8, 'HA': 1.0, 'IG': 0.5, 'KT': 1.3,
        'RM': 0.3, 'SM': 1.0, 'TW': 1.2, 'UB': 0.5, 'WD': 1.0,

        // East of England (+0.5 to +1.0)
        'CB': 1.2, 'IP': 0.5, 'NR': 0.5, 'PE': 0.3,

        // East Midlands (0 to +0.5)
        'DE': 0.0, 'LE': -0.2, 'NG': -0.2, 'NN': 0.3, 'LN': 0.0,

        // West Midlands (-0.5 to +0.5)
        'B':  -0.8, 'CV': 0.0, 'DY': -0.3, 'HR': 0.5, 'ST': -0.5,
        'TF': -0.3, 'WR': 0.5, 'WS': -0.3, 'WV': -0.8,

        // Yorkshire & Humber (-0.5 to +0.3)
        'BD': -0.8, 'DN': -0.5, 'HD': 0.0, 'HG': 1.0, 'HU': -1.0,
        'HX': -0.3, 'LS': -0.3, 'S':  -0.5, 'WF': -0.5, 'YO': 0.5,

        // North West (-0.8 to +0.3)
        'BB': -1.0, 'BL': -0.5, 'CA': -0.3, 'CH': 0.3, 'CW': 0.3,
        'FY': -0.5, 'L':  -1.2, 'LA': 0.3, 'M':  -0.8, 'OL': -0.8,
        'PR': -0.3, 'SK': 0.3, 'WA': -0.3, 'WN': -0.8,

        // North East (-1.0 to -0.3)
        'DH': -0.8, 'DL': 0.0, 'NE': -0.8, 'SR': -1.0, 'TS': -1.0,

        // Wales (-0.3 to +0.3)
        'CF': -0.5, 'LD': 0.5, 'LL': 0.0, 'NP': -0.5, 'SA': 0.0, 'SY': 0.0,

        // Scotland (-0.8 to +0.5)
        'AB': 0.0, 'DD': -0.5, 'DG': 0.0, 'EH': 0.3, 'FK': 0.0,
        'G':  -1.5, 'IV': 0.0, 'KA': -1.0, 'KW': -0.3, 'KY': -0.3,
        'ML': -1.0, 'PA': -0.8, 'PH': 0.3, 'TD': 0.5, 'ZE': 0.0,

        // Northern Ireland (-0.3 to +0.3)
        'BT': -0.3
    })
});

/**
 * Extract the area prefix from a UK postcode.
 * E.g. "SW1A 1AA" → "SW", "M1 1AA" → "M", "LS1 1BA" → "LS"
 * @param {string} postcode
 * @returns {string|null}
 */
function extractPostcodeArea(postcode) {
    if (!postcode) return null;
    const cleaned = postcode.trim().toUpperCase().replace(/\s+/g, '');
    // UK postcode area is 1-2 letters at the start
    const match = cleaned.match(/^([A-Z]{1,2})/);
    return match ? match[1] : null;
}

/**
 * Get the nearest age bracket for age-adjusted life expectancy.
 * Rounds down to the nearest 5-year bracket.
 * @param {number} currentAge
 * @returns {number}
 */
function getNearestAgeBracket(currentAge) {
    const brackets = Object.keys(LIFE_EXPECTANCY_DATA.ageAdjusted)
        .map(Number)
        .sort((a, b) => a - b);

    // Clamp to available range
    if (currentAge <= brackets[0]) return brackets[0];
    if (currentAge >= brackets[brackets.length - 1]) return brackets[brackets.length - 1];

    // Find nearest lower bracket
    for (let i = brackets.length - 1; i >= 0; i--) {
        if (currentAge >= brackets[i]) return brackets[i];
    }
    return brackets[0];
}

/**
 * Calculate life expectancy based on gender, current age, and optional postcode.
 * @param {string} gender - 'male' or 'female'
 * @param {number} currentAge - Current age in years
 * @param {string} [postcode] - Optional UK postcode for regional adjustment
 * @returns {{ lifeExpectancy: number, source: string, regionName: string|null, adjustment: number }}
 */
function calculateLifeExpectancy(gender, currentAge, postcode) {
    if (!gender || !['male', 'female'].includes(gender)) {
        return { lifeExpectancy: null, source: '', regionName: null, adjustment: 0 };
    }

    // Start with age-adjusted baseline
    const bracket = getNearestAgeBracket(currentAge);
    const ageData = LIFE_EXPECTANCY_DATA.ageAdjusted[bracket];
    let baseExpectancy = ageData[gender];
    let source = `ONS life tables (age ${bracket} cohort)`;

    // Apply regional adjustment if postcode provided
    let adjustment = 0;
    let regionName = null;
    const area = extractPostcodeArea(postcode);

    if (area && LIFE_EXPECTANCY_DATA.regionAdjustments[area] !== undefined) {
        adjustment = LIFE_EXPECTANCY_DATA.regionAdjustments[area];
        baseExpectancy += adjustment;
        regionName = area;
        const sign = adjustment >= 0 ? '+' : '';
        source += ` | Regional adjustment: ${sign}${adjustment.toFixed(1)} years (${area} area)`;
    } else if (postcode && postcode.trim()) {
        source += ' | Postcode not recognised — using national average';
    }

    return {
        lifeExpectancy: Math.round(baseExpectancy * 10) / 10,
        source,
        regionName,
        adjustment
    };
}
