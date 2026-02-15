/**
 * Main Application Logic
 * Connects all components for v0.3
 */

let selectedScenarioRate = 5; // Default to Average

// ========== Retirement Date Calculator ==========
document.getElementById('calculateRetirementDateBtn')?.addEventListener('click', function() {
    const currentAge = parseInt(document.getElementById('currentAge').value);
    const retirementAge = parseInt(document.getElementById('retirementAgeSelect').value);
    
    if (isNaN(currentAge) || currentAge < 18 || currentAge > 75) {
        alert('Please enter a valid age (18-75)');
        return;
    }
    
    const today = new Date();
    const yearsToRetirement = retirementAge - currentAge;
    const retirementDate = new Date(today.getFullYear() + yearsToRetirement, today.getMonth(), today.getDate());
    
    // Format date as YYYY-MM-DD for input
    const dateString = retirementDate.toISOString().split('T')[0];
    document.getElementById('retirementDate').value = dateString;
    
    // Show confirmation message
    const retirementYear = retirementDate.getFullYear();
    alert(`Retirement date set to: ${retirementDate.toLocaleDateString('en-GB')} (Age ${retirementAge}, Year ${retirementYear})`);
});

// ========== Number Input Formatting (Thousands Separators) ==========
function formatNumberInput(value) {
    // Remove non-digit characters
    const numValue = value.replace(/[^\d]/g, '');
    // Format with commas
    return numValue.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
}

function unformatNumberInput(value) {
    // Remove all commas
    return value.replace(/,/g, '');
}

// Add formatting to number inputs
const numberInputs = [
    document.getElementById('currentPot'),
    document.getElementById('monthlyContribution'),
    document.getElementById('annualSpending')
];

numberInputs.forEach(input => {
    if (input) {
        // Format on input
        input.addEventListener('input', function() {
            const unformatted = unformatNumberInput(this.value);
            if (unformatted) {
                this.value = formatNumberInput(this.value);
            }
        });
        
        // Remove formatting on focus for easier editing
        input.addEventListener('focus', function() {
            this.value = unformatNumberInput(this.value);
        });
        
        // Re-format on blur
        input.addEventListener('blur', function() {
            if (this.value) {
                this.value = formatNumberInput(this.value);
            }
        });
    }
});

// ========== Event Handlers ==========
// Handle scenario selection
document.querySelectorAll('.scenario-btn').forEach(btn => {
    btn.addEventListener('click', function(e) {
        e.preventDefault();
        document.querySelectorAll('.scenario-btn').forEach(b => b.classList.remove('active'));
        this.classList.add('active');
        selectedScenarioRate = parseFloat(this.dataset.rate);
    });
});

// Handle inflation rate input visibility
document.getElementById('includeInflation').addEventListener('change', function(e) {
    document.getElementById('inflationRateGroup').style.display = e.target.checked ? 'block' : 'none';
});

document.getElementById('calculateBtn').addEventListener('click', calculateRetirement);
document.getElementById('recalculateBtn').addEventListener('click', function() {
    document.getElementById('results').style.display = 'none';
    document.getElementById('retirementSpending').style.display = 'none';
    document.getElementById('spendingToggle').style.display = 'none';
    document.getElementById('calculator-form').scrollIntoView({ behavior: 'smooth' });
});

document.getElementById('toggleSpendingAnalysisBtn')?.addEventListener('click', function() {
     document.getElementById('retirementSpending').style.display = 'block';
    document.getElementById('retirementSpending').scrollIntoView({ behavior: 'smooth' });
});

document.getElementById('analyzeSpendingBtn')?.addEventListener('click', analyzeRetirementSpending);

// Handle spending mode changes
document.querySelectorAll('input[name="spendingMode"]').forEach(radio => {
    radio.addEventListener('change', function() {
        const modeAInputs = document.getElementById('modeAInputs');
        if (this.value === 'mode-a') {
            modeAInputs.style.display = 'block';
        } else {
            modeAInputs.style.display = 'none';
        }
    });
});

function calculateRetirement() {
    const birthDate = document.getElementById('birthDate').value;
    const retirementDate = document.getElementById('retirementDate').value;
    const currentPot = parseFloat(unformatNumberInput(document.getElementById('currentPot').value)) || 0;
    const monthlyContribution = parseFloat(unformatNumberInput(document.getElementById('monthlyContribution').value)) || 0;
    const investmentGrowth = selectedScenarioRate; // Use selected scenario
    const includeInflation = document.getElementById('includeInflation').checked;
    const inflationRate = parseFloat(document.getElementById('inflationRate').value) || 2.5;

    const validation = validateInputs(birthDate, retirementDate, currentPot, monthlyContribution, investmentGrowth, inflationRate, includeInflation);
    
    if (!validation.isValid) {
        alert('Please fix the following errors:\n\n' + validation.errors.join('\n'));
        return;
    }

    const years = calculateYearsUntilRetirement(birthDate, retirementDate);
    
    // Calculate main projection for selected scenario
    const projection = calculatePensionProjection(currentPot, monthlyContribution, years, investmentGrowth / 100);
    const income = calculateIncomeProjection(projection.finalPot);

    // Handle inflation-adjusted display
    let displayPot = projection.finalPot;
    let displayIncome = income.annualIncome;
    let displayMonthly = income.monthlyIncome;

    if (includeInflation) {
        const realPot = adjustForInflation(projection.finalPot, years, inflationRate / 100);
        const inflationAdjusted = getInflationAdjustedIncome(income.annualIncome, years, inflationRate / 100);
        
        displayPot = realPot;
        displayIncome = inflationAdjusted.realAnnualIncome;
        displayMonthly = inflationAdjusted.realMonthlyIncome;

        // Show inflation badge and alternative values
        document.getElementById('inflationBadge').style.display = 'block';
        document.getElementById('projectedPotReal').style.display = 'block';
        document.getElementById('projectedPotNominal').style.display = 'block';
        document.getElementById('projectedPotNominal').textContent = 'Nominal: ' + formatCurrency(projection.finalPot);
        document.getElementById('incomeAlternative').style.display = 'block';
        document.getElementById('incomeAlternative').textContent = 'Nominal: £' + Math.round(inflationAdjusted.nominalAnnualIncome).toLocaleString('en-GB');
    } else {
        document.getElementById('inflationBadge').style.display = 'none';
        document.getElementById('projectedPotReal').style.display = 'none';
        document.getElementById('projectedPotNominal').style.display = 'none';
        document.getElementById('incomeAlternative').style.display = 'none';
    }

    document.getElementById('projectedPot').textContent = formatCurrency(displayPot);
    document.getElementById('taxFreeLump').textContent = formatCurrency(income.taxFreeLumpSum);
    document.getElementById('annualIncome').textContent = formatCurrency(displayIncome);
    document.getElementById('monthlyIncome').textContent = formatCurrency(displayMonthly);
    document.getElementById('resultsGrowthRate').textContent = investmentGrowth.toFixed(1) + '%';
    document.getElementById('cardGrowthRate').textContent = investmentGrowth.toFixed(1) + '%';
    
    // Add contributions and growth display
    document.getElementById('totalContributions').textContent = formatCurrency(projection.totalContributed);
    document.getElementById('growthAmount').textContent = formatCurrency(projection.growthAmount);
    const growthPercent = ((projection.growthAmount / projection.finalPot) * 100).toFixed(1);
    document.getElementById('growthPercentage').textContent = growthPercent + '% of final pot';
    document.getElementById('yearsToRetirement').textContent = years;

    // Calculate and display all 3 scenarios for comparison
    calculateScenarioComparison(currentPot, monthlyContribution, years, inflationRate / 100, includeInflation, investmentGrowth);

    // Calculate all 3 scenarios for chart display
    const weakProjection = calculatePensionProjection(currentPot, monthlyContribution, years, 0.02);
    const averageProjection = calculatePensionProjection(currentPot, monthlyContribution, years, 0.05);
    const strongProjection = calculatePensionProjection(currentPot, monthlyContribution, years, 0.08);

    document.getElementById('results').style.display = 'block';
    document.getElementById('spendingToggle').style.display = 'block';
    document.getElementById('results').scrollIntoView({ behavior: 'smooth' });

    // Display chart with all 3 scenarios
    createGrowthChart(weakProjection.yearByYear, averageProjection.yearByYear, strongProjection.yearByYear);
}

function calculateScenarioComparison(pot, monthly, years, inflationRate, includeInflation, selectedRate) {
    const scenarios = [
        { id: 'Weak', rate: 0.02, elemPot: 'scenarioWeakPot', elemIncome: 'scenarioWeakIncome', elemDiff: 'scenarioWeakDiff' },
        { id: 'Average', rate: 0.05, elemPot: 'scenarioAveragePot', elemIncome: 'scenarioAverageIncome', elemDiff: 'scenarioAverageDiff' },
        { id: 'Strong', rate: 0.08, elemPot: 'scenarioStrongPot', elemIncome: 'scenarioStrongIncome', elemDiff: 'scenarioStrongDiff' }
    ];

    let averageProjection = null;

    scenarios.forEach(scenario => {
        const projection = calculatePensionProjection(pot, monthly, years, scenario.rate);
        const income = calculateIncomeProjection(projection.finalPot);
        
        let displayPot = projection.finalPot;
        let displayIncome = income.annualIncome;

        // Store average scenario for comparison
        if (scenario.id === 'Average') {
            averageProjection = { pot: displayPot, income: displayIncome };
        }

        if (includeInflation) {
            const realPot = adjustForInflation(projection.finalPot, years, inflationRate);
            const inflationAdj = getInflationAdjustedIncome(income.annualIncome, years, inflationRate);
            displayPot = realPot;
            displayIncome = inflationAdj.realAnnualIncome;
        }

        // Update display
        document.getElementById(scenario.elemPot).textContent = formatCurrency(displayPot);
        document.getElementById(scenario.elemIncome).textContent = formatCurrency(displayIncome);

        // Show comparison for Weak and Strong
        if (scenario.id !== 'Average' && averageProjection) {
            const potDiff = displayPot - averageProjection.pot;
            const potDiffPercent = ((potDiff / averageProjection.pot) * 100).toFixed(1);
            const diffText = potDiff >= 0 ? `+${formatCurrency(potDiff)} (+${potDiffPercent}%)` : `${formatCurrency(potDiff)} (${potDiffPercent}%)`;
            document.getElementById(scenario.elemDiff).textContent = `vs Average: ${diffText}`;
        }
    });

    document.getElementById('scenarioComparison').style.display = 'block';
}

function formatCurrency(amount) {
    return '£' + amount.toLocaleString('en-GB', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    });
}

function analyzeRetirementSpending() {
    // Get values from form and spending analysis section
    const birthDate = document.getElementById('birthDate').value;
    const retirementDate = document.getElementById('retirementDate').value;
    const currentPot = parseFloat(unformatNumberInput(document.getElementById('currentPot').value)) || 0;
    const monthlyContribution = parseFloat(unformatNumberInput(document.getElementById('monthlyContribution').value)) || 0;
    const investmentGrowth = selectedScenarioRate / 100;
    const includeInflation = document.getElementById('includeInflation').checked;
    const inflationRate = parseFloat(document.getElementById('inflationRate').value) || 2.5;
    const lifeExpectancy = parseFloat(document.getElementById('lifeExpectancy').value) || 100;
    
    const spendingMode = document.querySelector('input[name="spendingMode"]:checked').value;
    const annualSpending = spendingMode === 'mode-a' ? parseFloat(unformatNumberInput(document.getElementById('annualSpending').value)) || 0 : 0;

    // Calculate years to retirement
    const years = calculateYearsUntilRetirement(birthDate, retirementDate);
    
    // Calculate projected pension pot
    const projection = calculatePensionProjection(currentPot, monthlyContribution, years, investmentGrowth);
    let startingPot = projection.finalPot;

    // If inflation is on, don't adjust - work with future pounds
    if (includeInflation) {
        const inflationAdj = getInflationAdjustedIncome(projection.finalPot, years, inflationRate / 100);
        // For spending analysis, show in nominal (future pounds)
    }

    // Run spending analysis
    let result;
    if (spendingMode === 'mode-a') {
        result = calculateSpendingPlan(startingPot, annualSpending, years, lifeExpectancy, investmentGrowth, includeInflation ? inflationRate / 100 : 0);
    } else {
        const maxResult = calculateMaximumSustainableSpend(startingPot, years, lifeExpectancy, investmentGrowth, includeInflation ? inflationRate / 100 : 0);
        result = {
            mode: 'maximum-spend',
            maxAnnualSpend: maxResult.maxAnnualSpend,
            maxMonthlySpend: maxResult.maxMonthlySpend,
            ...maxResult.projection
        };
    }

    // Display results
    displaySpendingResults(result, startingPot, years, lifeExpectancy, annualSpending, spendingMode);
}

function displaySpendingResults(result, pot, yearsUntilRetirement, lifeExpectancy, annualSpending, mode) {
    const statusCard = document.getElementById('spendingStatus');
    const retirementAge = new Date().getFullYear() - new Date().getFullYear() + yearsUntilRetirement + 65; // Assuming retirement at 65 +years
    
    // Create status card
    if (result.moneyLasts) {
        statusCard.className = 'spending-status-card success';
        statusCard.innerHTML = '✅ Success! Your money will last';
        if (result.finalBalance > 0) {
            statusCard.innerHTML += ` with a final balance of ${formatCurrency(result.finalBalance)}`;
        }
    } else {
        statusCard.className = 'spending-status-card warning';
        statusCard.innerHTML = `⚠️ Warning: Your money will run out at age ${result.ageWhenRunsOut}`;
    }

    // Update summary grid
    document.getElementById('summaryStartingPot').textContent = formatCurrency(pot);
    
    if (mode === 'mode-a') {
        document.getElementById('summaryAnnualSpending').textContent = formatCurrency(annualSpending);
    } else if (result.maxAnnualSpend) {
        document.getElementById('summaryAnnualSpending').textContent = formatCurrency(result.maxAnnualSpend);
    }
    
    document.getElementById('summaryRetirementYears').textContent = result.yearByYear.length + ' years';
    document.getElementById('summaryTotalSpent').textContent = formatCurrency(result.totalSpent);
    document.getElementById('summaryFinalBalance').textContent = formatCurrency(result.finalBalance);

    document.getElementById('spendingResults').style.display = 'block';

    // Create chart if possible
    if (result.yearByYear && result.yearByYear.length > 0) {
        createSpendingChart(result.yearByYear);
    }
}
