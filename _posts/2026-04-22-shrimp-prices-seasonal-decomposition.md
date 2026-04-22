---
title: "Shrimp Prices: Classical Decomposition and a Seasonal Forecast"
author: "Humberto Godinez"
date: "April 22, 2026"
layout: post
categories: Finance
---

Shrimp is one of the most interesting protein markets to model. Unlike chicken or pork, shrimp is globally traded, dominated by farmed supply from a handful of countries (Ecuador, India, Indonesia, Vietnam), and subject to *boom-bust* cycles driven by hatchery investment and disease outbreaks. It also has a textbook-clean **seasonal signal** from holiday demand and harvest cycles.

This post is a technical walk-through of how to decompose a monthly shrimp price series into trend, seasonal, and residual components, and to use that decomposition to build a forecast that respects seasonality &mdash; something a plain random walk can't do.

## Data

Approximate monthly average import unit-values for **white shrimp, 21/25 count, shell-on, headless, raw, from Ecuador, CIF US port**, January 2019 through December 2024 (USD / lb, 72 observations). Figures are illustrative but track the well-documented 2022 peak and 2023 oversupply-driven collapse.

<div class="chart-wrap">
  <canvas id="shrimpPriceChart" height="260"></canvas>
</div>

The structural story in the chart:

- **2019–early 2020:** relatively stable at $4.50&ndash;$4.75 / lb.
- **COVID drop (mid-2020):** foodservice demand evaporates; prices fall into the high $3s.
- **2021 rebound:** reopening + container shortages push prices back toward $4.80.
- **2022 peak:** tight supply and freight inflation drive prices above $5.
- **2023 crash:** Ecuador's farmed output surges; prices collapse to near $3.10 &mdash; a textbook cobweb / pork cycle in seafood.
- **2024 recovery:** gradual drift back toward the high $3s.

## Stationarity and first differencing

Levels are non-stationary (clear trend breaks and persistent drifts). For retail / trade unit-values, I usually work in **first differences** rather than log returns &mdash; the series is not traded as an asset, so the compounding interpretation of `ln(P[t]/P[t-1])` doesn't add much, and first differences preserve the natural units (USD / lb / month).

```
d[t] = P[t] - P[t-1]
```

<div class="chart-wrap">
  <canvas id="shrimpDiffChart" height="240"></canvas>
</div>

The differenced series is visibly closer to stationary, with the bulk of the drops concentrated in 2022 Q4 and 2023 H1 (the oversupply episode). Volatility clusters suggest an ARCH component is present, but we'll defer that to a future post.

## Classical decomposition

A good first pass at a seasonal series is the **additive classical decomposition**:

```
P[t] = T[t] + S[t] + R[t]
```

where `T[t]` is a smooth trend, `S[t]` is a periodic seasonal component (period = 12), and `R[t]` is the residual. I estimate the three components as follows:

1. **Trend** via a centred **2&times;12 moving average** (a 12-month MA averaged with a 1-month lead to keep it centred on integer indices). This removes the seasonal frequency exactly for period-12 data.
2. **Seasonal** as the mean of `P[t] - T[t]` for each calendar month, centred so that the twelve seasonal factors sum to zero.
3. **Residual** as `R[t] = P[t] - T[t] - S[t]`.

<div class="chart-wrap">
  <canvas id="shrimpSeasonalChart" height="220"></canvas>
</div>

The average seasonal pattern is not huge in shrimp (peak-to-trough is on the order of a few cents) but it is consistent: prices tend to firm into the winter holiday / Lent run-up and ease through late summer. On a low-margin protein that's a meaningful signal.

<div class="chart-wrap">
  <canvas id="shrimpTrendChart" height="260"></canvas>
</div>

Once the trend and seasonal components are removed, the residual series `R[t]` should look roughly like noise. In practice there's still structure &mdash; the 2023 collapse left a visible negative residual cluster &mdash; but for a one-page model this is an acceptable baseline.

## A seasonal forecast

With decomposition in hand, the simplest honest forecast is:

1. Extrapolate the trend linearly from an OLS fit on the **last 24 months** of `T[t]` (a localised linear trend; this is the "LOESS-lite" way of avoiding long-memory bias in the slope).
2. Reapply the fitted seasonal factor for the forecast month.
3. Build a 95% interval from the **residual standard deviation**: `± 1.96 · σ_R · sqrt(h)` in the spirit of a random-walk error (conservative for the shorter horizons; simple).

```
P_hat[t+h] = T_hat[t+h] + S[month(t+h)]
CI_95%     = P_hat[t+h] ± 1.96 · σ_R · sqrt(h)
```

<div class="chart-wrap">
  <canvas id="shrimpForecastChart" height="280"></canvas>
</div>

Summary statistics, computed client-side from the raw series so every number here is live with the chart:

<div id="shrimpStats" class="stats-grid"></div>

## What the decomposition gets right &mdash; and where it falls short

**Right.**
- Captures the periodic seasonal pattern that a random walk with drift ignores entirely.
- Produces a point forecast that respects the calendar month you're projecting into.
- Uses only elementary statistics, and is trivially reproducible.

**Wrong.**
- The trend is assumed locally linear. A regime change (another Ecuador supply surge, disease outbreak, tariff shock) invalidates the extrapolation immediately.
- Residual volatility is treated as constant. Shrimp has clear ARCH / GARCH dynamics.
- No exogenous regressors &mdash; feed costs (soymeal, fishmeal), FX (USD / EUR, BRL), freight indices, and inventories all carry information the pure decomposition throws away.

A reasonable next step is **SARIMA(p,d,q)(P,D,Q)<sub>12</sub>** selected by information criteria, followed by a **SARIMAX** that adds exogenous regressors &mdash; or moving directly to a state-space formulation where the seasonal component evolves rather than being fixed.

## Takeaways

1. **Decompose before you model.** Most of the intuition about a seasonal series comes from separating trend, seasonality, and residual and *looking at each piece*. If the trend is drifting or the seasonal factor is shrinking, a plain ARIMA will struggle no matter how well-specified.
2. **Classical decomposition is a baseline, not a model.** It produces a defensible forecast and a set of residuals you can hand to an ARCH/GARCH test. If your fancier model can't beat it, you're adding complexity without value.
3. **Know your market's cycle length.** Shrimp's oversupply episodes play out over 12–18 months. That's longer than the horizon at which a seasonal decomposition is well-posed; you need a second, slower component (inventory, investment, disease) to call the cycle.

<style>
.chart-wrap {
  background: var(--surface, #fff);
  border: 1px solid var(--line, #e5e5e0);
  border-radius: 12px;
  padding: 1rem 1rem 0.75rem;
  margin: 1.5rem 0 2rem;
  box-shadow: 0 1px 2px rgba(15,23,42,.04);
}
.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  gap: 0.75rem;
  margin: 1.5rem 0 2rem;
}
.stats-grid .stat {
  border: 1px solid var(--line, #e5e5e0);
  border-radius: 10px;
  padding: 0.9rem 1rem;
  background: var(--surface, #fff);
}
.stats-grid .stat-label {
  font-family: 'JetBrains Mono', monospace;
  font-size: 0.72rem;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: var(--muted, #6b7280);
}
.stats-grid .stat-value {
  font-size: 1.35rem;
  font-weight: 600;
  color: var(--ink, #0f172a);
  margin-top: 0.2rem;
}
</style>

<script src="https://cdn.jsdelivr.net/npm/chart.js@4.4.1/dist/chart.umd.min.js"></script>
<script>
(function () {
  var labels = [
    '2019-01','2019-02','2019-03','2019-04','2019-05','2019-06','2019-07','2019-08','2019-09','2019-10','2019-11','2019-12',
    '2020-01','2020-02','2020-03','2020-04','2020-05','2020-06','2020-07','2020-08','2020-09','2020-10','2020-11','2020-12',
    '2021-01','2021-02','2021-03','2021-04','2021-05','2021-06','2021-07','2021-08','2021-09','2021-10','2021-11','2021-12',
    '2022-01','2022-02','2022-03','2022-04','2022-05','2022-06','2022-07','2022-08','2022-09','2022-10','2022-11','2022-12',
    '2023-01','2023-02','2023-03','2023-04','2023-05','2023-06','2023-07','2023-08','2023-09','2023-10','2023-11','2023-12',
    '2024-01','2024-02','2024-03','2024-04','2024-05','2024-06','2024-07','2024-08','2024-09','2024-10','2024-11','2024-12'
  ];
  var prices = [
    4.75, 4.70, 4.68, 4.62, 4.55, 4.50, 4.45, 4.40, 4.48, 4.55, 4.62, 4.65,
    4.60, 4.55, 4.20, 3.90, 3.85, 3.95, 4.05, 4.10, 4.00, 3.90, 3.80, 3.85,
    3.95, 4.10, 4.25, 4.40, 4.55, 4.70, 4.80, 4.85, 4.75, 4.70, 4.65, 4.60,
    4.80, 4.95, 5.15, 5.20, 5.10, 4.95, 4.80, 4.65, 4.50, 4.35, 4.20, 4.05,
    3.90, 3.75, 3.55, 3.40, 3.25, 3.15, 3.10, 3.15, 3.20, 3.20, 3.25, 3.30,
    3.35, 3.40, 3.50, 3.60, 3.70, 3.75, 3.70, 3.65, 3.55, 3.50, 3.55, 3.60
  ];
  var n = prices.length;

  // ---- first differences ----
  var diffs = [], diffLabels = [];
  for (var i = 1; i < n; i++) { diffs.push(prices[i] - prices[i-1]); diffLabels.push(labels[i]); }

  // ---- centred 2x12 MA trend ----
  var trend = new Array(n).fill(null);
  for (var t = 6; t < n - 6; t++) {
    var s = 0.5 * prices[t - 6] + 0.5 * prices[t + 6];
    for (var k = t - 5; k <= t + 5; k++) s += prices[k];
    trend[t] = s / 12;
  }

  // ---- seasonal: avg of (P - T) by calendar month, centred ----
  var seasonalBuckets = [];
  for (var m = 0; m < 12; m++) seasonalBuckets.push([]);
  for (var t = 0; t < n; t++) {
    if (trend[t] !== null) {
      var month = (t % 12);
      seasonalBuckets[month].push(prices[t] - trend[t]);
    }
  }
  var rawSeasonal = seasonalBuckets.map(function (arr) {
    return arr.reduce(function (a, b) { return a + b; }, 0) / arr.length;
  });
  var seasonalMean = rawSeasonal.reduce(function (a, b) { return a + b; }, 0) / 12;
  var seasonal = rawSeasonal.map(function (s) { return s - seasonalMean; });

  // ---- residuals ----
  var residuals = prices.map(function (p, t) {
    if (trend[t] === null) return null;
    return p - trend[t] - seasonal[t % 12];
  });
  var residClean = residuals.filter(function (r) { return r !== null; });
  var residMean = residClean.reduce(function (a, b) { return a + b; }, 0) / residClean.length;
  var residVar = residClean.reduce(function (acc, r) { return acc + (r - residMean) * (r - residMean); }, 0) / (residClean.length - 1);
  var residStd = Math.sqrt(residVar);

  // ---- trend slope from last 24 months of non-null trend ----
  var trendPoints = [];
  for (var t = 0; t < n; t++) if (trend[t] !== null) trendPoints.push({ t: t, v: trend[t] });
  var tail = trendPoints.slice(-24);
  var xs = tail.map(function (p) { return p.t; });
  var ys = tail.map(function (p) { return p.v; });
  var xbar = xs.reduce(function (a, b) { return a + b; }, 0) / xs.length;
  var ybar = ys.reduce(function (a, b) { return a + b; }, 0) / ys.length;
  var num = 0, den = 0;
  for (var i = 0; i < xs.length; i++) { num += (xs[i] - xbar) * (ys[i] - ybar); den += (xs[i] - xbar) * (xs[i] - xbar); }
  var slope = num / den;
  var intercept = ybar - slope * xbar;
  function trendAt(t) { return intercept + slope * t; }

  // ---- forecast 12 months ----
  var horizon = 12;
  var lastIdx = n - 1;
  var fcLabels = [labels[lastIdx]];
  var fcMean = [prices[lastIdx]];
  var fcUp = [prices[lastIdx]];
  var fcLo = [prices[lastIdx]];
  function shiftLabel(lbl, k) {
    var parts = lbl.split('-');
    var y = parseInt(parts[0], 10);
    var m = parseInt(parts[1], 10) - 1 + k;
    y += Math.floor(m / 12);
    m = ((m % 12) + 12) % 12;
    return y + '-' + String(m + 1).padStart(2, '0');
  }
  for (var h = 1; h <= horizon; h++) {
    var tFuture = lastIdx + h;
    var pf = trendAt(tFuture) + seasonal[tFuture % 12];
    var half = 1.96 * residStd * Math.sqrt(h);
    fcLabels.push(shiftLabel(labels[lastIdx], h));
    fcMean.push(pf);
    fcUp.push(pf + half);
    fcLo.push(pf - half);
  }

  // ---- stats ----
  function fmt(x, d) { return (x).toFixed(d == null ? 2 : d); }
  function fmtSigned(x, d) { return (x >= 0 ? '+' : '') + x.toFixed(d == null ? 2 : d); }
  var meanPrice = prices.reduce(function (a, b) { return a + b; }, 0) / n;
  var minPrice = Math.min.apply(null, prices);
  var maxPrice = Math.max.apply(null, prices);
  var diffStd = Math.sqrt(diffs.reduce(function (acc, d) {
    var m = diffs.reduce(function (a, b) { return a + b; }, 0) / diffs.length;
    return acc + (d - m) * (d - m);
  }, 0) / (diffs.length - 1));
  var seasAmp = Math.max.apply(null, seasonal) - Math.min.apply(null, seasonal);

  var statsEl = document.getElementById('shrimpStats');
  if (statsEl) {
    statsEl.innerHTML =
      '<div class="stat"><div class="stat-label">Observations</div><div class="stat-value">' + n + '</div></div>' +
      '<div class="stat"><div class="stat-label">Mean price</div><div class="stat-value">$' + fmt(meanPrice) + '</div></div>' +
      '<div class="stat"><div class="stat-label">Min / Max</div><div class="stat-value">$' + fmt(minPrice) + ' &ndash; $' + fmt(maxPrice) + '</div></div>' +
      '<div class="stat"><div class="stat-label">Δ std-dev</div><div class="stat-value">$' + fmt(diffStd) + '</div></div>' +
      '<div class="stat"><div class="stat-label">Seasonal amplitude</div><div class="stat-value">$' + fmt(seasAmp) + '</div></div>' +
      '<div class="stat"><div class="stat-label">Residual σ</div><div class="stat-value">$' + fmt(residStd) + '</div></div>' +
      '<div class="stat"><div class="stat-label">Trend slope (24m)</div><div class="stat-value">' + fmtSigned(slope * 12) + ' / yr</div></div>' +
      '<div class="stat"><div class="stat-label">12-month forecast</div><div class="stat-value">$' + fmt(fcMean[horizon]) + '</div></div>';
  }

  // ---- charts ----
  var accent = '#b8532a';
  var ink = '#0f172a';
  var muted = '#9ca3af';
  var grid = 'rgba(15,23,42,.06)';
  var teal = '#0f766e';
  var gold = '#a16207';

  var baseOpts = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: { mode: 'index', intersect: false },
    plugins: {
      legend: { display: false },
      tooltip: { backgroundColor: ink, padding: 10 }
    },
    scales: {
      x: { ticks: { maxTicksLimit: 10, color: muted }, grid: { color: grid } },
      y: { ticks: { color: muted }, grid: { color: grid } }
    }
  };

  function mkTitle(text) {
    return { display: true, text: text, color: ink, font: { size: 14, weight: '600' } };
  }

  var c1 = document.getElementById('shrimpPriceChart');
  if (c1) new Chart(c1, {
    type: 'line',
    data: { labels: labels, datasets: [{
      label: 'USD / lb', data: prices,
      borderColor: accent, borderWidth: 2,
      backgroundColor: 'rgba(184,83,42,.08)',
      pointRadius: 0, pointHoverRadius: 4, fill: true, tension: 0.25
    }] },
    options: Object.assign({}, baseOpts, {
      plugins: Object.assign({}, baseOpts.plugins, { title: mkTitle('Monthly shrimp import price (21/25, white, Ecuador)') }),
      scales: {
        x: baseOpts.scales.x,
        y: { ticks: { color: muted, callback: function (v) { return '$' + v.toFixed(2); } }, grid: { color: grid } }
      }
    })
  });

  var c2 = document.getElementById('shrimpDiffChart');
  if (c2) new Chart(c2, {
    type: 'bar',
    data: { labels: diffLabels, datasets: [{
      label: 'Δ USD / lb',
      data: diffs,
      backgroundColor: diffs.map(function (d) { return d >= 0 ? 'rgba(34,197,94,.75)' : 'rgba(220,38,38,.75)'; }),
      borderWidth: 0
    }] },
    options: Object.assign({}, baseOpts, {
      plugins: Object.assign({}, baseOpts.plugins, {
        title: mkTitle('First differences (P[t] − P[t−1])'),
        tooltip: {
          backgroundColor: ink, padding: 10,
          callbacks: { label: function (ctx) { return 'Δ = $' + fmtSigned(ctx.parsed.y); } }
        }
      }),
      scales: {
        x: baseOpts.scales.x,
        y: { ticks: { color: muted, callback: function (v) { return '$' + v.toFixed(2); } }, grid: { color: grid } }
      }
    })
  });

  var monthNames = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  var c3 = document.getElementById('shrimpSeasonalChart');
  if (c3) new Chart(c3, {
    type: 'bar',
    data: { labels: monthNames, datasets: [{
      label: 'Seasonal factor (USD / lb)',
      data: seasonal,
      backgroundColor: seasonal.map(function (s) { return s >= 0 ? 'rgba(184,83,42,.8)' : 'rgba(15,118,110,.8)'; }),
      borderWidth: 0
    }] },
    options: Object.assign({}, baseOpts, {
      plugins: Object.assign({}, baseOpts.plugins, {
        title: mkTitle('Estimated additive seasonal factor by month'),
        tooltip: {
          backgroundColor: ink, padding: 10,
          callbacks: { label: function (ctx) { return 'S = ' + fmtSigned(ctx.parsed.y) + ' / lb'; } }
        }
      }),
      scales: {
        x: { ticks: { color: muted }, grid: { color: grid } },
        y: { ticks: { color: muted, callback: function (v) { return fmtSigned(v); } }, grid: { color: grid } }
      }
    })
  });

  var c4 = document.getElementById('shrimpTrendChart');
  if (c4) new Chart(c4, {
    type: 'line',
    data: { labels: labels, datasets: [
      { label: 'Price', data: prices, borderColor: 'rgba(15,23,42,.35)', borderWidth: 1.5, pointRadius: 0, fill: false, tension: 0.2 },
      { label: 'Trend T[t]', data: trend, borderColor: accent, borderWidth: 2.5, pointRadius: 0, fill: false, tension: 0.25, spanGaps: false },
      { label: 'Residual R[t]', data: residuals, borderColor: teal, borderWidth: 1.5, borderDash: [4,3], pointRadius: 0, fill: false, yAxisID: 'y2', spanGaps: false }
    ] },
    options: Object.assign({}, baseOpts, {
      plugins: Object.assign({}, baseOpts.plugins, {
        legend: { display: true, labels: { color: muted, boxWidth: 12 } },
        title: mkTitle('Decomposition: price, trend, residual')
      }),
      scales: {
        x: baseOpts.scales.x,
        y: { position: 'left', ticks: { color: muted, callback: function (v) { return '$' + v.toFixed(2); } }, grid: { color: grid } },
        y2: { position: 'right', ticks: { color: teal, callback: function (v) { return fmtSigned(v); } }, grid: { display: false } }
      }
    })
  });

  var allLabels = labels.concat(fcLabels.slice(1));
  var historySeries = prices.concat(new Array(horizon).fill(null));
  var meanSeries = new Array(n - 1).fill(null).concat(fcMean);
  var upSeries = new Array(n - 1).fill(null).concat(fcUp);
  var loSeries = new Array(n - 1).fill(null).concat(fcLo);

  var c5 = document.getElementById('shrimpForecastChart');
  if (c5) new Chart(c5, {
    type: 'line',
    data: {
      labels: allLabels,
      datasets: [
        { label: '95% upper', data: upSeries, borderColor: 'rgba(184,83,42,0)', backgroundColor: 'rgba(184,83,42,.15)', pointRadius: 0, fill: '+1', tension: 0.2 },
        { label: '95% lower', data: loSeries, borderColor: 'rgba(184,83,42,0)', backgroundColor: 'rgba(184,83,42,.15)', pointRadius: 0, fill: false, tension: 0.2 },
        { label: 'History', data: historySeries, borderColor: ink, borderWidth: 2, pointRadius: 0, fill: false, tension: 0.2 },
        { label: 'Trend + seasonal forecast', data: meanSeries, borderColor: accent, borderWidth: 2, borderDash: [6, 4], pointRadius: 0, fill: false, tension: 0.2 }
      ]
    },
    options: Object.assign({}, baseOpts, {
      plugins: Object.assign({}, baseOpts.plugins, {
        legend: { display: true, labels: { color: muted, boxWidth: 12, filter: function (item) { return item.text !== '95% upper' && item.text !== '95% lower'; } } },
        title: mkTitle('12-month forecast with trend and seasonal components')
      }),
      scales: {
        x: baseOpts.scales.x,
        y: { ticks: { color: muted, callback: function (v) { return '$' + v.toFixed(2); } }, grid: { color: grid } }
      }
    })
  });
})();
</script>
