/**
 * Input Validation
 * @user-story US#1 - Calculator Input
 * @version 0.1.0
 */

function validateInputs(birthDate, retirementDate, currentPot, monthlyContribution) {
    const errors = [];
    const birth = new Date(birthDate);
    const retirement = new Date(retirementDate);
    const today = new Date();

    const age = today.getFullYear() - birth.getFullYear();
    const retirementAge = retirement.getFullYear() - birth.getFullYear();

    if (age < 18) errors.push("You must be at least 18 years old");
    if (age > 75) errors.push("Please enter a valid date of birth");
    if (retirement <= today) errors.push("Retirement date must be in the future");
    if (retirementAge < 55) errors.push("UK minimum pension access age is 55");
    if (retirementAge > 75) errors.push("Please choose a retirement age under 75");
    if (currentPot < 0 || currentPot > 10000000) errors.push("Pension pot must be between £0 and £10,000,000");
    if (monthlyContribution < 0 || monthlyContribution > 100000) errors.push("Monthly contribution must be between £0 and £100,000");

    return {
        isValid: errors.length === 0,
        errors: errors
    };
}

function calculateYearsUntilRetirement(birthDate, retirementDate) {
    const retirement = new Date(retirementDate);
    return retirement.getFullYear() - new Date().getFullYear();
}
