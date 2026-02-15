/**
 * Growth Chart Visualization
 * @user-story US#3 - Scenario Analysis
 * @user-story US#4 - Results Display
 * @version 0.3.0
 */

let growthChartInstance = null;

function createGrowthChart(weakYearByYear, averageYearByYear, strongYearByYear) {
    const ctx = document.getElementById('growthChart')?.getContext('2d');
    if (!ctx) return;
    
    if (growthChartInstance) {
        growthChartInstance.destroy();
    }

    // Use average scenario labels
    const labels = averageYearByYear.map(y => `Year ${y.year}`);
    
    // Extract pot values for each scenario
    const weakPots = weakYearByYear.map(y => y.pot);
    const averagePots = averageYearByYear.map(y => y.pot);
    const strongPots = strongYearByYear.map(y => y.pot);
    
    // Extract contributions (same for all scenarios)
    const contributionValues = averageYearByYear.map(y => y.totalContributions);

    growthChartInstance = new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [
                {
                    label: 'Total Pot - Weak (2%)',
                    data: weakPots,
                    borderColor: '#dc3545',
                    backgroundColor: 'rgba(220, 53, 69, 0.1)',
                    fill: false,
                    tension: 0.4,
                    borderWidth: 2,
                    borderDash: [5, 5]
                },
                {
                    label: 'Total Pot - Average (5%)',
                    data: averagePots,
                    borderColor: '#667eea',
                    backgroundColor: 'rgba(102, 126, 234, 0.15)',
                    fill: true,
                    tension: 0.4,
                    borderWidth: 3
                },
                {
                    label: 'Total Pot - Strong (8%)',
                    data: strongPots,
                    borderColor: '#28a745',
                    backgroundColor: 'rgba(40, 167, 69, 0.1)',
                    fill: false,
                    tension: 0.4,
                    borderWidth: 2,
                    borderDash: [5, 5]
                },
                {
                    label: 'Your Contributions',
                    data: contributionValues,
                    borderColor: '#764ba2',
                    backgroundColor: 'rgba(118, 75, 162, 0.15)',
                    fill: false,
                    tension: 0.4,
                    borderWidth: 2,
                    borderDash: [2, 4]
                }
            ]
        },
        options: {
            responsive: true,
            plugins: {
                legend: {
                    display: true,
                    position: 'top',
                    labels: {
                        font: { size: 12 },
                        padding: 15
                    }
                },
                tooltip: {
                    backgroundColor: 'rgba(0, 0, 0, 0.8)',
                    padding: 12,
                    titleFont: { size: 13, weight: 'bold' },
                    bodyFont: { size: 12 },
                    callbacks: {
                        label: function(context) {
                            return context.dataset.label + ': £' + 
                                   context.parsed.y.toLocaleString('en-GB', {
                                       minimumFractionDigits: 2,
                                       maximumFractionDigits: 0
                                   });
                        }
                    }
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        callback: function(value) {
                            return '£' + (value / 1000).toFixed(0) + 'k';
                        }
                    },
                    title: {
                        display: true,
                        text: 'Pot Value (£)'
                    }
                },
                x: {
                    title: {
                        display: true,
                        text: 'Years to Retirement'
                    }
                }
            }
        }
    });
}
