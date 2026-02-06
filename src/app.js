/**
 * Main Application Logic
 * Connects all components for v0.2
 */

document.getElementById('calculateBtn').addEventListener('click', calculateRetirement);
document.getElementById('recalculateBtn').addEventListener('click', function() {
    document.getElementById('results').style.display = 'none';
    document.getElementById('calculator-form').scrollIntoView({ behavior: 'smooth' });
});

function calculateRetirement() {
    const birthDate = document.getElementById('birthDate').value;
    const retirementDate = document.getElementById('retirementDate').value;
    const currentPot = parseFloat(document.getElementById('currentPot').value) || 0;
    const monthlyContribution = parseFloat(document.getElementById('monthlyContribution').value) || 0;
    const investmentGrowth = parseFloat(document.getElementById('investmentGrowth').value) || 5;

    const validation = validateInputs(birthDate, retirementDate, currentPot, monthlyContribution, investmentGrowth);
    
    if (!validation.isValid) {
        alert('Please fix the following errors:\n\n' + validation.errors.join('\n'));
        return;
    }

    const years = calculateYearsUntilRetirement(birthDate, retirementDate);
    const projection = calculatePensionProjection(currentPot, monthlyContribution, years, investmentGrowth / 100);
    const income = calculateIncomeProjection(projection.finalPot);

    document.getElementById('projectedPot').textContent = formatCurrency(projection.finalPot);
    document.getElementById('taxFreeLump').textContent = formatCurrency(income.taxFreeLumpSum);
    document.getElementById('annualIncome').textContent = formatCurrency(income.annualIncome);
    document.getElementById('monthlyIncome').textContent = formatCurrency(income.monthlyIncome);
    document.getElementById('resultsGrowthRate').textContent = investmentGrowth.toFixed(1) + '%';
    document.getElementById('cardGrowthRate').textContent = investmentGrowth.toFixed(1) + '%';

    document.getElementById('results').style.display = 'block';
    document.getElementById('results').scrollIntoView({ behavior: 'smooth' });

    createGrowthChart(projection.yearByYear);
}

function formatCurrency(amount) {
    return '£' + amount.toLocaleString('en-GB', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    });
}
