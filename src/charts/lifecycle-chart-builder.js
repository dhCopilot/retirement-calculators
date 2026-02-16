/**
 * Combined Lifecycle Chart Builder
 * Renders the accumulation → drawdown chart for one scenario at a time.
 * Toggle between Weak / Average / Strong via selector buttons.
 * Includes D-Stages milestone markers on the timeline.
 *
 * Depends on: config.js, utils/formatting.js, utils/date-utils.js, utils/drawdown.js
 * @module charts/lifecycle-chart-builder
 * @version 0.6.0
 */

/** @type {Chart|null} */
let lifecycleChartInstance = null;

/** Active D-Stage milestones for the current chart render */
let _activeDStages = [];

/** Cached lifecycle data for scenario toggling */
let _lcChartCache = null;

/** Currently selected lifecycle scenario key */
let _lcSelectedScenario = 'average';

/** Set of event IDs currently visible on the chart (e.g. 'worldCup', 'olympics') */
let _visibleEventIds = new Set();

/** Whether sporting events panel is expanded */
let _sportingPanelOpen = false;

/** Whether political events panel is expanded */
let _politicalPanelOpen = false;

/** Cached sporting events for the current chart */
let _sportingEventsCache = null;

/**
 * Sporting & World Events configuration.
 */
const SPORTING_EVENTS = Object.freeze([
    { id: 'worldCup',    label: 'World Cup',          emoji: '⚽', startYear: 2026, interval: 4, color: '#0d6efd', category: 'sport' },
    { id: 'olympics',    label: 'Olympics',            emoji: '🏅', startYear: 2028, interval: 4, color: '#ff8c00', category: 'sport' },
    { id: 'rugbyWC',     label: 'Rugby World Cup',     emoji: '🏉', startYear: 2027, interval: 4, color: '#2e8b57', category: 'sport' },
    { id: 'cricketWC',   label: 'Cricket World Cup',   emoji: '🏏', startYear: 2027, interval: 4, color: '#8b4513', category: 'sport' },
    { id: 'usElection',  label: 'US Election',         emoji: '🇺🇸', startYear: 2028, interval: 4, color: '#b22234', category: 'political' },
    { id: 'ukElection',  label: 'UK General Election', emoji: '🇬🇧', startYear: 2029, interval: 5, color: '#00247d', category: 'political' }
]);

/**
 * Compute sporting events that fall within the chart age range.
 * @param {number} birthYear - User's birth year
 * @param {number} currentAge - User's current age
 * @param {number} targetAge - Life expectancy age
 * @returns {{ events: Array, summary: Object }}
 */
function _computeSportingEvents(birthYear, currentAge, targetAge) {
    const events = [];
    const summary = {};
    const currentYear = new Date().getFullYear();

    SPORTING_EVENTS.forEach(function (ev) {
        let remaining = 0;
        let nextAge = null;
        let nextYear = null;

        // Find first event year >= startYear that is also >= current calendar year
        let year = ev.startYear;
        while (year < currentYear) {
            year += ev.interval;
        }

        // Iterate through future event years within lifetime
        for (; year <= birthYear + targetAge; year += ev.interval) {
            const ageAtEvent = year - birthYear;
            if (ageAtEvent >= currentAge && ageAtEvent <= targetAge) {
                events.push({
                    id: ev.id,
                    emoji: ev.emoji,
                    label: ev.label,
                    color: ev.color,
                    age: ageAtEvent,
                    year: year,
                    category: ev.category || 'sport'
                });
                remaining++;
                if (nextAge === null) {
                    nextAge = ageAtEvent;
                    nextYear = year;
                }
            }
        }

        summary[ev.id] = {
            emoji: ev.emoji,
            label: ev.label,
            remaining: remaining,
            nextAge: nextAge,
            nextYear: nextYear,
            category: ev.category || 'sport',
            color: ev.color
        };
    });

    // Sort by age
    events.sort(function (a, b) { return a.age - b.age; });
    return { events: events, summary: summary };
}

/**
 * Render a clickable chip panel for a given category of events.
 * Each chip toggles that event type on/off on the chart.
 * @param {string} boxId - DOM element id for the summary box
 * @param {Object} summary - Summary from _computeSportingEvents
 * @param {string} category - 'sport' or 'political'
 */
function _renderEventsSummaryBox(boxId, summary, category) {
    const box = getElement(boxId);
    if (!box) return;

    const filtered = Object.entries(summary).filter(function (entry) { return entry[1].category === category; });
    const items = filtered.map(function (entry) {
        const id = entry[0];
        const s = entry[1];
        const isActive = _visibleEventIds.has(id);
        const activeClass = isActive ? ' active' : '';
        const nextInfo = s.nextAge
            ? ' — next at age ' + s.nextAge + ' (' + s.nextYear + ')'
            : '';
        return '<button class="event-type-chip' + activeClass + '" data-event-id="' + id + '" ' +
            'style="--chip-color:' + (s.color || '#667eea') + '">' +
            s.emoji + ' ' + s.label + ' <span class="chip-count">' + s.remaining + '</span>' +
            '<span class="chip-detail">' + s.remaining + ' left to enjoy' + nextInfo + '</span>' +
            '</button>';
    });

    box.innerHTML = items.join('');

    // Wire chip click handlers — only one event type at a time (globally)
    box.querySelectorAll('.event-type-chip').forEach(function (chip) {
        chip.addEventListener('click', function () {
            const eventId = chip.dataset.eventId;
            if (_visibleEventIds.has(eventId)) {
                // Toggle off
                _visibleEventIds.delete(eventId);
                chip.classList.remove('active');
            } else {
                // Deselect ALL active chips across every category
                _visibleEventIds.clear();
                document.querySelectorAll('.event-type-chip.active').forEach(function (other) {
                    other.classList.remove('active');
                });
                _visibleEventIds.add(eventId);
                chip.classList.add('active');
            }
            // Re-render chart
            if (_lcChartCache) {
                const ctx = getElement('growthChart')?.getContext('2d');
                if (ctx) _renderLifecycleScenario(ctx, _lcChartCache, _lcSelectedScenario);
            }
        });
    });
}

/**
 * Chart.js plugin – draws event markers ABOVE the milestone pills.
 * Each marker shows the event emoji + year in a small coloured pill.
 */
const sportingEventsPlugin = {
    id: 'sportingEventsPlugin',
    afterDraw: function (chart) {
        const events = chart.options?.plugins?.sportingEventsPlugin?.events;
        if (!events || events.length === 0) return;

        const { ctx, chartArea } = chart;
        const xScale = chart.scales.x;
        const pad = 6;
        const pillH = 24;
        const rowGap = 4;

        ctx.save();

        // ── Pre-compute positions ─────────────────────────────
        ctx.font = 'bold 13px sans-serif';
        const items = events.map(function (ev) {
            const labelIdx = chart.data.labels.indexOf('' + ev.age);
            if (labelIdx < 0) return null;
            const x = xScale.getPixelForValue(labelIdx);
            const text = ev.emoji + ' ' + ev.year;
            const textW = ctx.measureText(text).width;
            const pillW = textW + pad * 2 + 4;
            const minX = chartArea.left;
            const maxX = chartArea.right - pillW;
            const pillX = Math.max(minX, Math.min(x - pillW / 2, maxX));
            return { ev: ev, x: x, text: text, pillW: pillW, pillX: pillX, row: 0 };
        }).filter(Boolean);

        // Stagger rows for overlapping pills
        for (let i = 1; i < items.length; i++) {
            const prev = items[i - 1];
            const curr = items[i];
            if (curr.pillX < prev.pillX + prev.pillW + 3) {
                curr.row = (prev.row + 1) % 3;
            }
        }

        // How many D-Stage rows are already above? Check the dStagesPlugin config
        const dStages = chart.options?.plugins?.dStagesPlugin?.stages || [];
        const dStageRows = dStages.length > 1 ? 2 : (dStages.length > 0 ? 1 : 0);
        const dStagePillH = 16 + (APP_CONFIG.DSTAGES.LABEL_BG_PADDING || 4) * 2;
        const dStageRowGap = 4;
        const dStageSpace = dStageRows * (dStagePillH + dStageRowGap) + APP_CONFIG.DSTAGES.LABEL_PADDING;

        // Draw pills above the milestone row(s)
        items.forEach(function (item) {
            const baseY = chartArea.top - dStageSpace - 6;
            const pillY = baseY - pillH - item.row * (pillH + rowGap);

            // Dotted coloured line from pill down to x-axis
            ctx.beginPath();
            ctx.strokeStyle = item.ev.color;
            ctx.globalAlpha = 0.35;
            ctx.lineWidth = 1.5;
            ctx.setLineDash([4, 5]);
            ctx.moveTo(item.x, pillY + pillH);
            ctx.lineTo(item.x, chartArea.bottom + 18);
            ctx.stroke();
            ctx.setLineDash([]);
            ctx.globalAlpha = 1;

            // Pill background
            ctx.fillStyle = item.ev.color;
            ctx.globalAlpha = 0.15;
            ctx.beginPath();
            ctx.roundRect(item.pillX, pillY, item.pillW, pillH, 5);
            ctx.fill();
            ctx.globalAlpha = 1;

            // Pill border
            ctx.strokeStyle = item.ev.color;
            ctx.lineWidth = 1.5;
            ctx.beginPath();
            ctx.roundRect(item.pillX, pillY, item.pillW, pillH, 5);
            ctx.stroke();

            // Text (emoji + year)
            ctx.fillStyle = item.ev.color;
            ctx.font = 'bold 13px sans-serif';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText(item.text, item.pillX + item.pillW / 2, pillY + pillH / 2);
        });

        ctx.restore();
    }
};

Chart.register(sportingEventsPlugin);

/**
 * Chart.js plugin – draws vertical milestone lines and labels with background.
 */
const dStagesPlugin = {
    id: 'dStagesPlugin',
    afterDraw(chart) {
        const stages = chart.options?.plugins?.dStagesPlugin?.stages;
        if (!stages || stages.length === 0) return;

        const { ctx, chartArea } = chart;
        const xScale = chart.scales.x;
        const yScale = chart.scales.y;
        const { DSTAGES } = APP_CONFIG;
        const pad = DSTAGES.LABEL_BG_PADDING || 4;
        const pillH = 16 + pad * 2;
        const rowGap = 4;

        // ── Pre-compute label positions & detect overlaps ─────────
        ctx.save();
        ctx.font = DSTAGES.LABEL_FONT;

        const items = stages.map(stage => {
            const labelIdx = chart.data.labels.indexOf('' + stage.age);
            if (labelIdx < 0) return null;
            const text = stage.emoji + ' ' + stage.label;
            const textW = ctx.measureText(text).width;
            const pillW = textW + pad * 2;
            const rawX = xScale.getPixelForValue(labelIdx);
            // Clamp pill so it stays within chart area
            const minX = chartArea.left;
            const maxX = chartArea.right - pillW;
            const pillX = Math.max(minX, Math.min(rawX - pillW / 2, maxX));
            return { stage, text, textW, pillW, pillX, lineX: rawX, row: 0 };
        }).filter(Boolean);

        // Assign rows to avoid horizontal overlap
        for (let i = 1; i < items.length; i++) {
            const prev = items[i - 1];
            const curr = items[i];
            if (curr.pillX < prev.pillX + prev.pillW + 4) {
                // Overlaps previous — put on next row down
                curr.row = (prev.row + 1) % 2;
            }
        }

        // ── Draw each milestone ──────────────────────────────────
        items.forEach(item => {
            const { stage, text, pillW, pillX, lineX, row } = item;
            const yTop = yScale.top;
            const yBottom = yScale.bottom;

            // Dashed vertical line
            ctx.beginPath();
            ctx.setLineDash(DSTAGES.DASH_PATTERN);
            ctx.lineWidth = DSTAGES.LINE_WIDTH;
            ctx.strokeStyle = stage.color;
            ctx.moveTo(lineX, yTop);
            ctx.lineTo(lineX, yBottom);
            ctx.stroke();
            ctx.setLineDash([]);

            // Position: row 0 is nearest the chart, row 1 is higher
            const pillY = yTop - DSTAGES.LABEL_PADDING - pillH - row * (pillH + rowGap);
            const textCenterX = pillX + pillW / 2;
            const textCenterY = pillY + pillH / 2;

            // Background pill
            ctx.fillStyle = DSTAGES.LABEL_BG || 'rgba(255,255,255,0.85)';
            ctx.beginPath();
            ctx.roundRect(pillX, pillY, pillW, pillH, 4);
            ctx.fill();

            // Border
            ctx.strokeStyle = stage.color;
            ctx.lineWidth = 1.5;
            ctx.stroke();

            // Text
            ctx.fillStyle = stage.color;
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.font = DSTAGES.LABEL_FONT;
            ctx.fillText(text, textCenterX, textCenterY);
        });

        ctx.restore();
    }
};

// Register the plugin globally
Chart.register(dStagesPlugin);

/**
 * Build the D-Stages milestone array from current form state.
 * Returns an array of { id, label, emoji, color, age, priority }.
 *
 * @param {number} currentAge - User's current age
 * @param {number} retirementAge - Target retirement age
 * @param {number} targetAge - Life expectancy / plan-to age
 * @returns {Array<Object>}
 */
function _buildDStages(currentAge, retirementAge, targetAge) {
    const defaults = APP_CONFIG.DSTAGES.DEFAULTS;
    const stages = [];

    // 1. Retirement – always present
    const retDef = defaults.find(d => d.id === 'retirement');
    if (retDef && retirementAge > currentAge) {
        stages.push({ ...retDef, age: retirementAge });
    }

    // 2. State Pension Age – if different from retirement
    const spAge = parseInt(getElement('statePensionAge')?.value) || 67;
    const spDef = defaults.find(d => d.id === 'statePension');
    if (spDef && spAge !== retirementAge && spAge > currentAge && spAge <= targetAge) {
        stages.push({ ...spDef, age: spAge });
    }

    // 3. DB Pension Age – if other income enabled and DB pension > 0
    const hasOtherIncome = getElement('includeOtherIncome')?.checked;
    const dbAmount = parseCurrencyInput(getElement('dbPension')?.value) || 0;
    const dbAge = parseInt(getElement('dbPensionAge')?.value) || 65;
    const dbDef = defaults.find(d => d.id === 'dbPension');
    if (dbDef && hasOtherIncome && dbAmount > 0 && dbAge !== retirementAge && dbAge > currentAge && dbAge <= targetAge) {
        stages.push({ ...dbDef, age: dbAge });
    }

    // 4. Life Expectancy – if within chart range
    const leDef = defaults.find(d => d.id === 'lifeExpectancy');
    if (leDef && targetAge > retirementAge && targetAge > currentAge) {
        stages.push({ ...leDef, age: targetAge });
    }

    // Sort by age, then priority
    stages.sort((a, b) => a.age - b.age || a.priority - b.priority);
    return stages;
}

/**
 * Render the D-Stages legend strip below the chart.
 * @param {Array<Object>} stages
 */
function _renderDStagesLegend(stages) {
    const legend = getElement('dStagesLegend');
    if (!legend) return;

    if (!stages || stages.length === 0) {
        legend.style.display = 'none';
        return;
    }

    legend.innerHTML = '<span class="dstages-title">D-Stages</span>' +
        stages.map(s =>
            '<span class="dstages-item" style="--stage-color:' + s.color + '">' +
            '<span class="dstages-dot"></span>' +
            s.emoji + ' ' + s.label + ' <strong>' + s.age + '</strong>' +
            '</span>'
        ).join('');

    legend.style.display = '';
}

/**
 * Convert a hex colour string to rgba.
 * @param {string} hex - e.g. '#dc3545'
 * @param {number} alpha - 0–1
 * @returns {string} e.g. 'rgba(220, 53, 69, 0.5)'
 */
function _hexToRgba(hex, alpha) {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return 'rgba(' + r + ', ' + g + ', ' + b + ', ' + alpha + ')';
}

/**
 * Build and render the combined lifecycle chart.
 * Computes all 3 scenarios, caches them, then renders the selected one.
 *
 * @param {Array} longevityData - Drawdown data array (used for spending amount)
 */
function createCombinedLifecycleChart(longevityData) {
    if (!growthProjectionData.average) {
        console.warn('Growth projection data not available. Creating drawdown-only chart.');
        createDrawdownOnlyChart(longevityData);
        return;
    }

    const ctxElement = getElement('growthChart');
    if (!ctxElement) {
        console.error('Chart canvas element "growthChart" not found');
        return;
    }

    try {
        const currentAge = calculateCurrentAge(growthProjectionData.birthDate);
        const annualSpending = longevityData.length > 0 ? longevityData[0].spending : 0;
        const retirementAge = growthProjectionData.retirementAge;
        const targetAge = (typeof currentLifeExpectancy !== 'undefined') ? currentLifeExpectancy : APP_CONFIG.TARGET_AGE;
        const chartEndAge = targetAge;
        const yearsInRetirement = chartEndAge - retirementAge;

        // ── Phase 1: Accumulation labels & per-scenario data ──────
        const combinedLabels = [];
        const accData = { weak: [], average: [], strong: [] };

        growthProjectionData.average.forEach((yearData, index) => {
            const age = currentAge + yearData.year;
            combinedLabels.push('' + age);
            accData.weak.push(growthProjectionData.weak[index]?.pot || null);
            accData.average.push(yearData.pot);
            accData.strong.push(growthProjectionData.strong[index]?.pot || null);
        });

        const retirementPots = {
            weak:    growthProjectionData.weak[growthProjectionData.weak.length - 1]?.pot || 0,
            average: growthProjectionData.average[growthProjectionData.average.length - 1]?.pot || 0,
            strong:  growthProjectionData.strong[growthProjectionData.strong.length - 1]?.pot || 0
        };

        // ── Phase 2: Drawdown simulation ─────────────────────────
        const retirementPointIndex = growthProjectionData.average.length - 1;

        const hasOtherIncome = (typeof getOtherIncomeAtAge === 'function');
        const spendingAtAge = hasOtherIncome
            ? (age) => Math.max(0, annualSpending - getOtherIncomeAtAge(age))
            : undefined;

        const drawdownResults = simulateAllScenarios({
            annualSpending,
            years: yearsInRetirement,
            retirementAge,
            retirementPots,
            getSpendingAtAge: spendingAtAge
        });

        // ── Phase 3: Build full timeline per scenario ────────────
        const scenarioFull = {};
        const shortfallByScenario = {};

        ['weak', 'average', 'strong'].forEach(key => {
            const acc = accData[key].slice();
            const draw = acc.map(() => null);
            draw[retirementPointIndex] = retirementPots[key];

            const sf = acc.map(() => null);

            for (let year = 1; year <= yearsInRetirement; year++) {
                if (key === 'weak' || key === 'average' || key === 'strong') {
                    combinedLabels.length <= retirementPointIndex + year &&
                        combinedLabels.push('' + (retirementAge + year));
                }
                acc.push(null);
                const res = drawdownResults[key].results[year];
                draw.push(res ? res.potAfter : 0);
                sf.push(res && res.shortfall > 0 ? res.shortfall : null);
            }

            // Merge: prefer accumulation, fall back to drawdown
            const merged = acc.map((v, i) => v !== null ? v : draw[i]);
            const mergedSf = sf.slice();

            // Zero out everything after life expectancy (person has died)
            const leIndex = retirementPointIndex + (targetAge - retirementAge);
            for (let i = leIndex + 1; i < merged.length; i++) {
                merged[i] = 0;
                mergedSf[i] = null;
            }

            scenarioFull[key] = merged;
            shortfallByScenario[key] = mergedSf;
        });

        // ── Phase 4: D-Stages milestones ─────────────────────────
        _activeDStages = _buildDStages(currentAge, retirementAge, targetAge);

        // ── Phase 4b: Sporting events ────────────────────────────
        const birthYear = new Date(growthProjectionData.birthDate).getFullYear();
        _sportingEventsCache = _computeSportingEvents(birthYear, currentAge, targetAge);

        // ── Phase 5: Cache everything for toggling ───────────────
        _lcChartCache = {
            combinedLabels,
            retirementPointIndex,
            retirementAge,
            targetAge,
            annualSpending,
            retirementPots,
            scenarioFull,
            shortfallByScenario,
            dStages: _activeDStages,
            sportingEvents: _sportingEventsCache
        };

        // ── Phase 6: Render selected scenario ────────────────────
        const ctx = ctxElement.getContext('2d');
        _renderLifecycleScenario(ctx, _lcChartCache, _lcSelectedScenario);

        // Render D-Stages legend strip
        _renderDStagesLegend(_activeDStages);

        // Update events chip panels (but only display if panel toggled open)
        if (_sportingEventsCache) {
            _renderEventsSummaryBox('sportingEventsSummary', _sportingEventsCache.summary, 'sport');
            _renderEventsSummaryBox('politicalEventsSummary', _sportingEventsCache.summary, 'political');

            const sportBox = getElement('sportingEventsSummary');
            if (sportBox) sportBox.style.display = _sportingPanelOpen ? '' : 'none';
            const sportBtn = getElement('sportingEventsToggle');
            if (sportBtn) sportBtn.classList.toggle('active', _sportingPanelOpen);

            const polBox = getElement('politicalEventsSummary');
            if (polBox) polBox.style.display = _politicalPanelOpen ? '' : 'none';
            const polBtn = getElement('politicalEventsToggle');
            if (polBtn) polBtn.classList.toggle('active', _politicalPanelOpen);
        }

        // Generate narrative cards
        generateLifecycleNarrative(
            retirementAge, annualSpending,
            retirementPots.weak, retirementPots.average, retirementPots.strong,
            scenarioFull.weak, scenarioFull.average, scenarioFull.strong,
            retirementPointIndex
        );

    } catch (err) {
        console.error('Error creating lifecycle chart:', err);
    }
}

/**
 * Render (or re-render) the lifecycle chart for a single scenario.
 */
function _renderLifecycleScenario(ctx, cache, scenarioKey) {
    if (lifecycleChartInstance && lifecycleChartInstance instanceof Chart) {
        lifecycleChartInstance.destroy();
    }

    const data = cache.scenarioFull[scenarioKey];
    const shortfallData = cache.shortfallByScenario[scenarioKey];
    if (!data) return;

    const { CHART } = APP_CONFIG;
    const retIdx = cache.retirementPointIndex;

    const palettes = {
        weak:    { color: '#dc3545', label: 'Weak Growth' },
        average: { color: '#667eea', label: 'Average Growth' },
        strong:  { color: '#28a745', label: 'Strong Growth' }
    };
    const pal = palettes[scenarioKey] || palettes.average;

    const bgLight = _hexToRgba(pal.color, 0.5);
    const bgDark  = _hexToRgba(pal.color, 0.75);

    const datasets = [
        {
            label: pal.label,
            data: data,
            backgroundColor: function (context) {
                return context.dataIndex <= retIdx ? bgLight : bgDark;
            },
            borderColor: pal.color,
            borderWidth: 0,
            stack: 'lifecycle'
        },
        {
            label: 'Shortfall',
            data: shortfallData,
            backgroundColor: CHART.SHORTFALL_BG,
            borderColor: CHART.SHORTFALL_BORDER,
            borderWidth: 1,
            borderDash: CHART.SHORTFALL_BORDER_DASH,
            stack: 'lifecycle'
        }
    ];

    const chartOptions = _buildLifecycleChartOptions(retIdx, data, scenarioKey, 'Pension Pot Value (£)', cache.targetAge, cache.retirementAge);
    chartOptions.plugins.dStagesPlugin = { stages: cache.dStages };

    // Events overlay (filter by individually selected event types)
    const visibleEvents = [];
    if (cache.sportingEvents) {
        cache.sportingEvents.events.forEach(function (ev) {
            if (_visibleEventIds.has(ev.id)) visibleEvents.push(ev);
        });
    }
    chartOptions.plugins.sportingEventsPlugin = { events: visibleEvents };

    const anyEventsVisible = visibleEvents.length > 0;
    if (cache.dStages.length > 0) {
        const hasOverlap = cache.dStages.length > 1;
        // Base space for milestones: 2 rows = 75, 1 row = 40
        // Add extra space above for event pills when visible (up to 3 stagger rows)
        const eventRows = anyEventsVisible ? 3 : 0;
        const eventSpace = eventRows * 22;
        const topPad = (hasOverlap ? 75 : 40) + eventSpace;
        chartOptions.layout = chartOptions.layout || {};
        chartOptions.layout.padding = { top: topPad, right: 30 };
    } else if (anyEventsVisible) {
        chartOptions.layout = chartOptions.layout || {};
        chartOptions.layout.padding = { top: 75, right: 30 };
    }

    lifecycleChartInstance = new Chart(ctx, {
        type: 'bar',
        data: { labels: cache.combinedLabels, datasets },
        options: chartOptions
    });

    window.growthChartInstance = lifecycleChartInstance;

    setTimeout(function () {
        if (lifecycleChartInstance) lifecycleChartInstance.resize();
    }, 50);
}

/**
 * Fallback line chart when growth data is unavailable.
 */
function createDrawdownOnlyChart(longevityData) {
    const ctxElement = getElement('growthChart');
    if (!ctxElement) return;

    const labels   = longevityData.map(item => '' + item.age);
    const balances = longevityData.map(item => item.balance);

    if (lifecycleChartInstance && lifecycleChartInstance instanceof Chart) {
        lifecycleChartInstance.destroy();
    }

    const ctx = ctxElement.getContext('2d');
    lifecycleChartInstance = new Chart(ctx, {
        type: 'line',
        data: {
            labels,
            datasets: [{
                label: 'Spending Burn-Down (Avg 5%)',
                data: balances,
                borderColor: '#ff6b6b',
                backgroundColor: 'rgba(255, 107, 107, 0.2)',
                borderWidth: 3,
                fill: true,
                tension: 0.4,
                pointRadius: 3,
                pointBackgroundColor: '#ff6b6b'
            }]
        },
        options: {
            responsive: true,
            plugins: {
                legend: { display: true, position: 'bottom' },
                tooltip: {
                    backgroundColor: APP_CONFIG.CHART.TOOLTIP_BG,
                    padding: APP_CONFIG.CHART.TOOLTIP_PADDING,
                    callbacks: {
                        label: ctx => 'Remaining Pot: £' + ctx.parsed.y.toLocaleString(APP_CONFIG.LOCALE, { maximumFractionDigits: 0 })
                    }
                }
            },
            scales: {
                y: { beginAtZero: true, ticks: { callback: v => formatChartCurrency(v) }, title: { display: true, text: 'Pot Value (£)' } },
                x: { title: { display: true, text: 'Age Timeline (Retirement Drawdown)' } }
            }
        }
    });
    window.growthChartInstance = lifecycleChartInstance;
}

// ── Private helpers ──────────────────────────────────────────────

function _buildLifecycleChartOptions(retirementPointIndex, scenarioData, scenarioKey, yLabel, targetAge, retirementAge) {
    const { CHART } = APP_CONFIG;
    const lifeExpIndex = retirementPointIndex + (targetAge - retirementAge);
    return {
        responsive: true,
        maintainAspectRatio: false,
        interaction: { mode: 'index', intersect: false },
        plugins: {
            legend: { display: true, position: 'bottom', labels: { font: { size: 12 }, padding: 15 } },
            tooltip: {
                backgroundColor: CHART.TOOLTIP_BG,
                padding: CHART.TOOLTIP_PADDING,
                titleFont: { size: 13, weight: 'bold' },
                bodyFont: { size: 12 },
                callbacks: {
                    afterTitle: function (tooltipItems) {
                        const idx = tooltipItems[0].dataIndex;
                        const ageLabel = tooltipItems[0].label;
                        let phase;
                        if (idx < retirementPointIndex) phase = '📈 Accumulation Phase';
                        else if (idx === retirementPointIndex) phase = '🎯 Retirement Starts';
                        else if (idx <= lifeExpIndex) phase = '📉 Drawdown Phase';
                        else phase = '🪦 Beyond Life Expectancy';

                        const milestone = _activeDStages.find(s => '' + s.age === ageLabel);
                        if (milestone) {
                            phase += '\n' + milestone.emoji + ' ' + milestone.label + ' (age ' + milestone.age + ')';
                        }
                        return phase;
                    },
                    label: function (context) {
                        if (context.parsed.y === null) return null;
                        if (context.datasetIndex === 1) {
                            return context.parsed.y > 0
                                ? '⚠️ Shortfall: £' + Math.round(context.parsed.y).toLocaleString(APP_CONFIG.LOCALE) + '/yr unfunded'
                                : null;
                        }
                        const val = scenarioData[context.dataIndex];
                        if (val == null) return null;
                        return context.dataset.label + ': £' +
                            val.toLocaleString(APP_CONFIG.LOCALE, { minimumFractionDigits: 0, maximumFractionDigits: 0 });
                    }
                }
            }
        },
        scales: {
            y: {
                stacked: true,
                beginAtZero: true,
                ticks: { callback: v => formatChartCurrency(v) },
                title: { display: true, text: yLabel, font: { weight: 'bold' } }
            },
            x: {
                stacked: true,
                title: { display: true, text: 'Age', font: { weight: 'bold' } },
                ticks: { maxTicksLimit: CHART.MAX_TICKS, maxRotation: CHART.MAX_ROTATION, autoSkip: true }
            }
        }
    };
}

// ── Shared scenario toggle wiring (controls both charts) ─────────
document.addEventListener('DOMContentLoaded', function () {
    const header = document.getElementById('chartViewHeader');
    if (!header) return;
    header.querySelectorAll('.shared-scenario-btn').forEach(function (btn) {
        btn.addEventListener('click', function () {
            const key = btn.dataset.scenario;
            if (!key) return;

            // Update shared button active state
            header.querySelectorAll('.shared-scenario-btn').forEach(function (b) { b.classList.remove('active'); });
            btn.classList.add('active');

            // Update lifecycle chart
            _lcSelectedScenario = key;
            if (_lcChartCache) {
                const ctx = getElement('growthChart')?.getContext('2d');
                if (ctx) _renderLifecycleScenario(ctx, _lcChartCache, key);
            }

            // Update cash flow chart
            if (typeof _cfSelectedScenario !== 'undefined') {
                _cfSelectedScenario = key;
                if (typeof _cfChartCache !== 'undefined' && _cfChartCache) {
                    const cfCtx = getElement('cashFlowChart')?.getContext('2d');
                    if (cfCtx && typeof _renderCashFlowScenario === 'function') {
                        _renderCashFlowScenario(cfCtx, _cfChartCache, key);
                    }
                }
            }
        });
    });

    // ── Sporting Events panel toggle ────────────────────────────
    const sportToggle = document.getElementById('sportingEventsToggle');
    if (sportToggle) {
        sportToggle.addEventListener('click', function () {
            _sportingPanelOpen = !_sportingPanelOpen;
            sportToggle.classList.toggle('active', _sportingPanelOpen);

            const summaryBox = document.getElementById('sportingEventsSummary');
            if (summaryBox) summaryBox.style.display = _sportingPanelOpen ? '' : 'none';
        });
    }

    // ── Political Events panel toggle ───────────────────────────
    const polToggle = document.getElementById('politicalEventsToggle');
    if (polToggle) {
        polToggle.addEventListener('click', function () {
            _politicalPanelOpen = !_politicalPanelOpen;
            polToggle.classList.toggle('active', _politicalPanelOpen);

            const summaryBox = document.getElementById('politicalEventsSummary');
            if (summaryBox) summaryBox.style.display = _politicalPanelOpen ? '' : 'none';
        });
    }
});
