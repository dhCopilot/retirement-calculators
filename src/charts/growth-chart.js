/**
 * Growth Chart Visualization
 * @user-story US#4 - Results Display
 * @version 0.2.0
 */

let growthChartInstance = null;

function createGrowthChart(yearByYear) {
    const ctx = document.getElementById('growthChart').getContext('2d');
    
    if (growthChartInstance) {
        growthChartInstance.destroy();
    }

    const labels = yearByYear.map(y => `Year ${y.year}`);
    const potValues = yearByYear.map(y => y.pot);
    const contributionValues = yearByYear.map(y => y.totalContributions);

    growthChartInstance = new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [
                {
                    label: 'Total Pot Value',
                    data: potValues,
                    borderColor: '#667eea',
                    backgroundColor: 'rgba(102, 126, 234, 0.1)',
                    fill: true,
                    tension: 0.4
                },
                {
                    label: 'Your Contributions',
                    data: contributionValues,
                    borderColor: '#764ba2',
                    backgroundColor: 'rgba(118, 75, 162, 0.1)',
                    fill: true,
                    tension: 0.4
                }
            ]
        },
        options: {
            responsive: true,
            plugins: {
                legend: {
                    display: true,
                    position: 'top'
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            return context.dataset.label + ': £' + 
                                   context.parsed.y.toLocaleString('en-GB', {
                                       minimumFractionDigits: 2,
                                       maximumFractionDigits: 2
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
                            return '£' + value.toLocaleString('en-GB');
                        }
                    }
                }
            }
        }
    });
}
