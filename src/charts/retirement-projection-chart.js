/**
 * Retirement Spending Projection Chart
 * @user-story US#5 - Retirement Planning & Visualization
 * @version 0.3.0
 */

let spendingChartInstance = null;

function createSpendingChart(yearByYearData) {
    const ctx = document.getElementById('spendingChart')?.getContext('2d');
    if (!ctx) return;

    // Destroy existing chart if it exists
    if (spendingChartInstance) {
        spendingChartInstance.destroy();
    }

    // Create labels showing age (if available) or year
    const labels = yearByYearData.map(item => {
        if (item.age !== undefined) {
            return `Age ${item.age}`;
        }
        return `Year ${item.year}`;
    });
    const potData = yearByYearData.map(item => item.potAtEnd || item.balance);
    const spendingData = yearByYearData.map(item => item.annualSpend || item.spending);

    spendingChartInstance = new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [
                {
                    label: 'Remaining Pot',
                    data: potData,
                    borderColor: '#667eea',
                    backgroundColor: 'rgba(102, 126, 234, 0.1)',
                    borderWidth: 3,
                    fill: true,
                    tension: 0.3,
                    yAxisID: 'y'
                },
                {
                    label: 'Annual Spending',
                    data: spendingData,
                    borderColor: '#764ba2',
                    backgroundColor: 'rgba(118, 75, 162, 0.1)',
                    borderWidth: 2,
                    fill: false,
                    tension: 0.3,
                    yAxisID: 'y1'
                }
            ]
        },
        options: {
            responsive: true,
            interaction: {
                mode: 'index',
                intersect: false
            },
            plugins: {
                legend: {
                    display: true,
                    position: 'top'
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            let label = context.dataset.label || '';
                            if (label) {
                                label += ': ';
                            }
                            if (context.parsed.y !== null) {
                                label += '£' + context.parsed.y.toLocaleString('en-GB', {
                                    minimumFractionDigits: 0,
                                    maximumFractionDigits: 0
                                });
                            }
                            return label;
                        }
                    }
                }
            },
            scales: {
                y: {
                    type: 'linear',
                    display: true,
                    position: 'left',
                    title: {
                        display: true,
                        text: 'Remaining Pot (£)'
                    },
                    ticks: {
                        callback: function(value) {
                            return '£' + (value / 1000).toFixed(0) + 'k';
                        }
                    }
                },
                y1: {
                    type: 'linear',
                    display: true,
                    position: 'right',
                    title: {
                        display: true,
                        text: 'Annual Spending (£)'
                    },
                    ticks: {
                        callback: function(value) {
                            return '£' + (value / 1000).toFixed(0) + 'k';
                        }
                    },
                    grid: {
                        drawOnChartArea: false
                    }
                },
                x: {
                    title: {
                        display: true,
                        text: 'Age During Retirement'
                    }
                }
            }
        }
    });
}
