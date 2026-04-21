---
title: "Oil Prices: A Simple Time Series Walk-Through"
author: "Humberto Godinez"
date: "April 21, 2026"
layout: post
categories: Finance
---

Crude oil is one of the most-watched time series in finance &mdash; and one of the hardest to forecast. Geopolitics, OPEC+ quota changes, inventories, the dollar, and the demand cycle all push prices around on very different time scales.

This post is a short, reproducible walk-through of how I'd approach a fresh oil price series: look at it, make it stationary, summarise it, and produce a naive probabilistic forecast. Everything below is computed in the browser from the raw price array, so you can open the page source and trace every number.

## Data

Monthly average spot prices for West Texas Intermediate (WTI) crude from **January 2020 through December 2024**, rounded from the Federal Reserve's FRED series `DCOILWTICO` (monthly averages of daily closes). Sixty observations &mdash; enough to see regime shifts without drowning in noise.

<div class="chart-wrap">
  <canvas id="oilPriceChart" height="260"></canvas>
</div>

Three regimes jump out:

- **2020 &mdash; the COVID demand shock.** WTI collapsed from the high 50s in January to a monthly average near $17 in April (intraday it briefly went negative). Recovery was fast but partial.
- **2021–2022 &mdash; reopening + war premium.** Prices climbed through 2021 and spiked above $110 in mid-2022 as the invasion of Ukraine layered a geopolitical risk premium on top of an already tight physical market.
- **2023–2024 &mdash; range-bound.** Roughly $70–$90, with OPEC+ managing supply against softer global demand.

## Making it stationary

Price levels are non-stationary &mdash; the mean clearly shifts across regimes and the variance explodes around March&ndash;April 2020. Before fitting any statistical model you need a stationary transformation. The standard move for asset prices is the **log return**:

```
r[t] = ln( P[t] / P[t-1] )
```

Log returns approximately centre around zero, are dimensionless (comparable across assets and across time), and are additive over time (a useful algebraic property you don't get with simple returns).

<div class="chart-wrap">
  <canvas id="oilReturnsChart" height="260"></canvas>
</div>

The April 2020 observation is visibly an outlier &mdash; a roughly &minus;55% monthly log return. Outside of that, returns look roughly stationary with occasional volatility clusters (a well-known stylised fact that motivates GARCH-style models).

## Summary statistics

<div id="oilStats" class="stats-grid"></div>

Sharpe-style ratios on commodity spot prices are usually poor &mdash; crude is not a buy-and-hold asset, it's an exposure you take a view on. But knowing the empirical drift and volatility is exactly what you need to build the simplest honest forecast.

## A naive forecast: random walk with drift

If we're willing to assume log returns are approximately i.i.d. with mean `μ̂` and standard deviation `σ̂` &mdash; a classic **random walk with drift** &mdash; then the `h`-step-ahead point forecast and 95% confidence band are:

```
point:   P[t+h] = P[t] · exp( h · μ̂ )
95% CI:  P[t]   · exp( h · μ̂  ±  1.96 · σ̂ · sqrt(h) )
```

The `sqrt(h)` term is the hallmark of the diffusion: uncertainty grows with the square root of the horizon, not linearly. The chart below projects the next **12 months** from the end of our sample.

<div class="chart-wrap">
  <canvas id="oilForecastChart" height="260"></canvas>
</div>

That band is wide on purpose. Crude is volatile enough that a one-year 95% interval easily spans $40&ndash;$120, which is honest about the limits of a simple model. Any tighter forecast has to earn that width by bringing in structure the random walk ignores: supply curves, inventory, macro factors, options-implied volatility, or regime-switching dynamics.

## Takeaways

1. **Always transform before modelling.** Prices are non-stationary; log returns are a far better canvas for any statistical model.
2. **Know your empirical $\mu$ and $\sigma$.** Before you add complexity (AR, ARIMA, GARCH, VAR, machine learning), the drift-and-vol pair is the benchmark everything else has to beat.
3. **Respect the uncertainty.** A wide forecast band isn't a failure of the model; it's the model being honest about what a stationary random walk can know.

In future posts I'll extend this into a proper ARIMA fit, compare against a GARCH variance model, and layer in exogenous regressors (the DXY, inventories, refinery utilisation). For a one-pager, though, random walk with drift is a surprisingly strong baseline.

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
    '2020-01','2020-02','2020-03','2020-04','2020-05','2020-06','2020-07','2020-08','2020-09','2020-10','2020-11','2020-12',
    '2021-01','2021-02','2021-03','2021-04','2021-05','2021-06','2021-07','2021-08','2021-09','2021-10','2021-11','2021-12',
    '2022-01','2022-02','2022-03','2022-04','2022-05','2022-06','2022-07','2022-08','2022-09','2022-10','2022-11','2022-12',
    '2023-01','2023-02','2023-03','2023-04','2023-05','2023-06','2023-07','2023-08','2023-09','2023-10','2023-11','2023-12',
    '2024-01','2024-02','2024-03','2024-04','2024-05','2024-06','2024-07','2024-08','2024-09','2024-10','2024-11','2024-12'
  ];
  var prices = [
    57.5, 50.5, 29.2, 16.6, 28.6, 38.3, 40.7, 42.3, 39.6, 39.4, 40.9, 47.0,
    52.0, 59.0, 62.3, 61.7, 65.2, 71.4, 72.5, 67.7, 71.7, 81.5, 79.2, 71.7,
    83.2, 91.6,108.5,101.8,109.6,114.3,101.6, 91.5, 84.3, 87.6, 84.4, 76.5,
    78.1, 76.8, 73.3, 79.4, 71.6, 70.3, 76.0, 81.4, 89.4, 85.6, 77.6, 71.9,
    74.1, 76.6, 81.3, 85.3, 80.0, 79.8, 81.8, 76.7, 70.2, 71.8, 69.9, 70.1
  ];

  var returns = [], retLabels = [];
  for (var i = 1; i < prices.length; i++) {
    returns.push(Math.log(prices[i] / prices[i-1]));
    retLabels.push(labels[i]);
  }

  var mean = returns.reduce(function (a, b) { return a + b; }, 0) / returns.length;
  var variance = returns.reduce(function (acc, r) { return acc + (r - mean) * (r - mean); }, 0) / (returns.length - 1);
  var std = Math.sqrt(variance);
  var minR = Math.min.apply(null, returns);
  var maxR = Math.max.apply(null, returns);

  var muAnn = mean * 12;
  var sigAnn = std * Math.sqrt(12);

  function runningMax(arr) {
    var out = [], m = -Infinity;
    arr.forEach(function (x) { if (x > m) m = x; out.push(m); });
    return out;
  }
  var rmax = runningMax(prices);
  var drawdowns = prices.map(function (p, i) { return p / rmax[i] - 1; });
  var maxDD = Math.min.apply(null, drawdowns);

  function fmtPct(x) { return (x * 100).toFixed(1) + '%'; }
  function fmtPctSigned(x) { return (x >= 0 ? '+' : '') + (x * 100).toFixed(1) + '%'; }

  var statsEl = document.getElementById('oilStats');
  if (statsEl) {
    statsEl.innerHTML =
      '<div class="stat"><div class="stat-label">Observations</div><div class="stat-value">' + prices.length + '</div></div>' +
      '<div class="stat"><div class="stat-label">Mean monthly log-return</div><div class="stat-value">' + fmtPctSigned(mean) + '</div></div>' +
      '<div class="stat"><div class="stat-label">Monthly volatility</div><div class="stat-value">' + fmtPct(std) + '</div></div>' +
      '<div class="stat"><div class="stat-label">Annualised drift</div><div class="stat-value">' + fmtPctSigned(muAnn) + '</div></div>' +
      '<div class="stat"><div class="stat-label">Annualised vol</div><div class="stat-value">' + fmtPct(sigAnn) + '</div></div>' +
      '<div class="stat"><div class="stat-label">Worst month</div><div class="stat-value">' + fmtPctSigned(minR) + '</div></div>' +
      '<div class="stat"><div class="stat-label">Best month</div><div class="stat-value">' + fmtPctSigned(maxR) + '</div></div>' +
      '<div class="stat"><div class="stat-label">Max drawdown</div><div class="stat-value">' + fmtPct(maxDD) + '</div></div>';
  }

  var accent = '#b8532a';
  var ink = '#0f172a';
  var muted = '#9ca3af';
  var grid = 'rgba(15,23,42,.06)';

  var baseOpts = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: { mode: 'index', intersect: false },
    plugins: {
      legend: { display: false },
      tooltip: { backgroundColor: ink, padding: 10, titleFont: { weight: '600' } }
    },
    scales: {
      x: { ticks: { maxTicksLimit: 10, color: muted }, grid: { color: grid } },
      y: { ticks: { color: muted }, grid: { color: grid } }
    }
  };

  var priceCtx = document.getElementById('oilPriceChart');
  if (priceCtx) {
    new Chart(priceCtx, {
      type: 'line',
      data: { labels: labels, datasets: [{
        label: 'WTI (USD/bbl)', data: prices,
        borderColor: accent, borderWidth: 2,
        backgroundColor: 'rgba(184,83,42,.08)',
        pointRadius: 0, pointHoverRadius: 4, fill: true, tension: 0.2
      }] },
      options: Object.assign({}, baseOpts, {
        plugins: Object.assign({}, baseOpts.plugins, { title: { display: true, text: 'Monthly WTI spot price', color: ink, font: { size: 14, weight: '600' } } })
      })
    });
  }

  var retCtx = document.getElementById('oilReturnsChart');
  if (retCtx) {
    new Chart(retCtx, {
      type: 'bar',
      data: { labels: retLabels, datasets: [{
        label: 'Monthly log return',
        data: returns,
        backgroundColor: returns.map(function (r) { return r >= 0 ? 'rgba(34,197,94,.75)' : 'rgba(220,38,38,.75)'; }),
        borderWidth: 0
      }] },
      options: Object.assign({}, baseOpts, {
        plugins: Object.assign({}, baseOpts.plugins, {
          title: { display: true, text: 'Monthly log-returns', color: ink, font: { size: 14, weight: '600' } },
          tooltip: {
            backgroundColor: ink, padding: 10,
            callbacks: { label: function (ctx) { return 'r = ' + fmtPctSigned(ctx.parsed.y); } }
          }
        }),
        scales: {
          x: { ticks: { maxTicksLimit: 10, color: muted }, grid: { color: grid } },
          y: { ticks: { color: muted, callback: function (v) { return (v * 100).toFixed(0) + '%'; } }, grid: { color: grid } }
        }
      })
    });
  }

  var horizon = 12;
  var lastPrice = prices[prices.length - 1];
  var lastLabel = labels[labels.length - 1];
  var fcLabels = [lastLabel];
  var fcMean = [lastPrice];
  var fcUp = [lastPrice];
  var fcLo = [lastPrice];

  function shiftLabel(lbl, k) {
    var parts = lbl.split('-');
    var y = parseInt(parts[0], 10);
    var m = parseInt(parts[1], 10) - 1 + k;
    y += Math.floor(m / 12);
    m = ((m % 12) + 12) % 12;
    return y + '-' + String(m + 1).padStart(2, '0');
  }

  for (var h = 1; h <= horizon; h++) {
    fcLabels.push(shiftLabel(lastLabel, h));
    fcMean.push(lastPrice * Math.exp(h * mean));
    fcUp.push(lastPrice * Math.exp(h * mean + 1.96 * std * Math.sqrt(h)));
    fcLo.push(lastPrice * Math.exp(h * mean - 1.96 * std * Math.sqrt(h)));
  }

  var allLabels = labels.concat(fcLabels.slice(1));
  var historySeries = prices.concat(new Array(horizon).fill(null));
  var meanSeries = new Array(prices.length - 1).fill(null).concat(fcMean);
  var upSeries = new Array(prices.length - 1).fill(null).concat(fcUp);
  var loSeries = new Array(prices.length - 1).fill(null).concat(fcLo);

  var fcCtx = document.getElementById('oilForecastChart');
  if (fcCtx) {
    new Chart(fcCtx, {
      type: 'line',
      data: {
        labels: allLabels,
        datasets: [
          { label: '95% upper', data: upSeries, borderColor: 'rgba(184,83,42,0)', backgroundColor: 'rgba(184,83,42,.15)', pointRadius: 0, fill: '+1', tension: 0.2 },
          { label: '95% lower', data: loSeries, borderColor: 'rgba(184,83,42,0)', backgroundColor: 'rgba(184,83,42,.15)', pointRadius: 0, fill: false, tension: 0.2 },
          { label: 'History', data: historySeries, borderColor: ink, borderWidth: 2, pointRadius: 0, fill: false, tension: 0.2 },
          { label: 'Point forecast', data: meanSeries, borderColor: accent, borderWidth: 2, borderDash: [6, 4], pointRadius: 0, fill: false, tension: 0.2 }
        ]
      },
      options: Object.assign({}, baseOpts, {
        plugins: Object.assign({}, baseOpts.plugins, {
          legend: { display: true, labels: { color: muted, boxWidth: 12, filter: function (item) { return item.text !== '95% upper' && item.text !== '95% lower'; } } },
          title: { display: true, text: '12-month random-walk-with-drift forecast', color: ink, font: { size: 14, weight: '600' } }
        }),
        scales: {
          x: { ticks: { maxTicksLimit: 10, color: muted }, grid: { color: grid } },
          y: { ticks: { color: muted, callback: function (v) { return '$' + v; } }, grid: { color: grid } }
        }
      })
    });
  }
})();
</script>
