# Data Visualization

## Overview

A chart is an argument made with shapes. The right chart type depends on the question (distribution, comparison, relationship, change over time) and on the variable types. The golden rule is honesty: a chart should let the reader see the data and should never exaggerate a difference.

## Concept

A good chart shows the **distribution** of data or the **relationship** between variables faster and more honestly than a table of numbers. The chart type follows from the variable types and the question.

### Choosing a chart

| Question | Variable types | Chart |
|---|---|---|
| How are values distributed? | one numeric | histogram, density plot, box plot, ECDF |
| How often does each category occur? | one categorical | bar chart (sorted), Pareto chart |
| How do groups compare? | numeric by categorical | side-by-side box plots, [violin plots](https://en.wikipedia.org/wiki/Violin_plot), dot plots |
| Are two numeric variables related? | two numeric | scatter plot (+ trend line) |
| How does something change over time? | numeric by time | line chart |
| How do two categoricals combine? | two categorical | stacked / grouped bars, mosaic plot, heatmap of a cross-table |
| Part-to-whole at one moment | categorical shares | bar chart (preferred) or pie chart with few slices |

### Distribution plots in detail

- **Histogram** — bins the data; bar *area* is proportional to frequency. The number of bins changes the picture: rules of thumb are $k \approx \sqrt n$, [Sturges](https://en.wikipedia.org/wiki/Sturges's_rule) ($k = \lceil \log_2 n \rceil + 1$) or [Freedman-Diaconis](https://en.wikipedia.org/wiki/Freedman%E2%80%93Diaconis_rule) (bin width $2\,IQR/n^{1/3}$).
- **Density plot** — a smoothed histogram ([kernel density estimate](https://en.wikipedia.org/wiki/Kernel_density_estimation)); good for comparing a few groups by overlay.
- **Box plot** — median, quartiles, whiskers to the most extreme non-outlier values, and individual outliers beyond $1.5\,IQR$. Compact for many groups, but hides multimodality.
- **ECDF** — plots the share of observations $\le x$; shows every data point and makes percentiles readable directly.
- **[QQ plot](https://en.wikipedia.org/wiki/Q%E2%80%93Q_plot)** — sample quantiles vs. theoretical quantiles; a straight line means the data follow the reference distribution (usually normal).

### Principles of honest charts

1. **Start bar charts at zero** — bar length encodes the value; a truncated axis exaggerates differences. (Line charts and scatter plots need not start at zero.)
2. **Sort categories** by frequency unless they have a natural order.
3. **Avoid 3-D effects, dual axes and pie charts with many slices** — they distort perception of size.
4. **Label axes with units**, and state the sample size and the data source.
5. **Show the data, not only summaries** — bar charts of means hide spread; add points or use box/violin plots.
6. **Use colour meaningfully and accessibly** — one highlight colour for the message, colour-blind-safe palettes, no rainbow scales for ordered data.
7. **[Anscombe's quartet](https://en.wikipedia.org/wiki/Anscombe's_quartet)** is the classic warning: four datasets with identical means, variances, correlation and regression line look completely different when plotted.

## Common Mistakes

- Truncating the y-axis of a bar chart so that a 2% difference looks like a doubling.
- Using pie charts for many categories or dual axes that suggest a false relationship.
- Showing only group means; the spread and the individual points are often the interesting part.

## When It's Used

Visualisation is used in every phase of analysis: exploratory data analysis (spotting skew, outliers and data errors before modelling), model diagnostics (residual plots, QQ plots), and communication (dashboards, board presentations, papers). Operations teams monitor KPIs with line charts and control limits; analysts use scatter plots before any regression; product managers read funnel and cohort charts daily.

## R Code

```r
set.seed(1)
n <- 300
orders <- data.frame(
  channel = sample(c("web", "app", "store", "phone"), n, replace = TRUE, prob = c(.45, .3, .2, .05)),
  value   = round(rlnorm(n, meanlog = 4, sdlog = 0.6), 2),
  items   = rpois(n, 3) + 1
)
orders$value <- orders$value + 8 * orders$items
daily <- data.frame(day = seq(as.Date("2024-01-01"), by = "day", length.out = 90))
daily$revenue <- 5000 + 20 * seq_len(90) + 800 * sin(2 * pi * seq_len(90) / 7) + rnorm(90, 0, 300)

op <- par(mfrow = c(2, 3), mar = c(4, 4, 2.5, 1))

# 1. Histogram with Freedman-Diaconis bins
hist(orders$value, breaks = "FD", col = "grey85", border = "white",
     main = "Order value", xlab = "EUR")

# 2. Density comparison of two channels
plot(density(orders$value[orders$channel == "web"]), main = "Web vs app", xlab = "EUR")
lines(density(orders$value[orders$channel == "app"]), lty = 2)
legend("topright", c("web", "app"), lty = 1:2, bty = "n")

# 3. Box plots by group
boxplot(value ~ channel, data = orders, main = "Value by channel", ylab = "EUR")

# 4. Sorted bar chart of a categorical variable
barplot(sort(table(orders$channel), decreasing = TRUE), main = "Orders by channel")

# 5. Scatter plot with a trend line
plot(value ~ items, data = orders, pch = 19, col = rgb(0, 0, 0, 0.3),
     main = "Items vs value", xlab = "items", ylab = "EUR")
abline(lm(value ~ items, data = orders), lwd = 2)

# 6. Time series line chart with a 7-day moving average
plot(daily$day, daily$revenue, type = "l", col = "grey60", main = "Daily revenue",
     xlab = "", ylab = "EUR")
lines(daily$day, stats::filter(daily$revenue, rep(1 / 7, 7), sides = 2), lwd = 2)

par(op)

# ECDF and QQ plot for distribution checks
plot(ecdf(orders$value), main = "ECDF of order value", xlab = "EUR")
qqnorm(log(orders$value)); qqline(log(orders$value))
```

## Python Code

```python
import numpy as np
import pandas as pd
import matplotlib.pyplot as plt
from scipy import stats

rng = np.random.default_rng(1)
n = 300
orders = pd.DataFrame({
    "channel": rng.choice(["web", "app", "store", "phone"], n, p=[.45, .3, .2, .05]),
    "items": rng.poisson(3, n) + 1,
})
orders["value"] = np.round(rng.lognormal(4, 0.6, n), 2) + 8 * orders["items"]
days = pd.date_range("2024-01-01", periods=90, freq="D")
t = np.arange(1, 91)
revenue = pd.Series(5000 + 20 * t + 800 * np.sin(2 * np.pi * t / 7) + rng.normal(0, 300, 90), index=days)

fig, ax = plt.subplots(2, 3, figsize=(15, 8))

ax[0, 0].hist(orders["value"], bins="fd", color="0.8", edgecolor="white")
ax[0, 0].set(title="Order value", xlabel="EUR")

for ch, ls in [("web", "-"), ("app", "--")]:
    kde = stats.gaussian_kde(orders.loc[orders.channel == ch, "value"])
    grid = np.linspace(orders["value"].min(), orders["value"].max(), 200)
    ax[0, 1].plot(grid, kde(grid), ls, label=ch)
ax[0, 1].legend(); ax[0, 1].set(title="Web vs app", xlabel="EUR")

groups = orders.groupby("channel")["value"]
ax[0, 2].boxplot([g.values for _, g in groups], tick_labels=list(groups.groups))
ax[0, 2].set(title="Value by channel", ylabel="EUR")

counts = orders["channel"].value_counts()          # already sorted descending
ax[1, 0].bar(counts.index, counts.values); ax[1, 0].set(title="Orders by channel")

ax[1, 1].scatter(orders["items"], orders["value"], alpha=0.3)
slope, intercept = np.polyfit(orders["items"], orders["value"], 1)
xs = np.array([orders["items"].min(), orders["items"].max()])
ax[1, 1].plot(xs, intercept + slope * xs, lw=2)
ax[1, 1].set(title="Items vs value", xlabel="items", ylabel="EUR")

ax[1, 2].plot(revenue, color="0.6")
ax[1, 2].plot(revenue.rolling(7, center=True).mean(), lw=2)
ax[1, 2].set(title="Daily revenue")
ax[1, 2].tick_params(axis="x", rotation=45)

plt.tight_layout()
plt.show()

# ECDF and QQ plot
fig, ax = plt.subplots(1, 2, figsize=(10, 4))
x = np.sort(orders["value"])
ax[0].step(x, np.arange(1, n + 1) / n, where="post"); ax[0].set(title="ECDF", xlabel="EUR")
stats.probplot(np.log(orders["value"]), dist="norm", plot=ax[1])
plt.tight_layout()
plt.show()
```

## Software Shortcuts

- **Excel:** select data → Insert → **Recommended Charts**; Insert → Statistic Chart → **Histogram**, **Box and Whisker** or **Pareto** (Excel 2016+). Right-click an axis → Format Axis → Bounds to control the start value; right-click a series → Add Trendline for scatter plots. Sparklines (Insert → Sparklines) give tiny in-cell trend charts.
- **SPSS:** Graphs → **Chart Builder** (drag a gallery type, then variables); Analyze → Descriptive Statistics → **Explore** → Plots for histograms, box plots and normality plots with tests; Analyze → Descriptive Statistics → **Q-Q Plots**.
- **Stata:** `histogram value, normal`, `graph box value, over(channel)`, `scatter value items || lfit value items`, `tsline revenue`, `qnorm value`.
- **Google Sheets:** Insert → Chart → Chart type (Histogram, Candlestick, Scatter, …); Customize → Series → Trendline.
- **Tableau / Power BI:** drag a measure to Rows and a dimension to Columns; use *Show Me* (Tableau) or the Visualizations pane (Power BI); add reference lines/bands from the Analytics pane.

## Industry Examples

**E-commerce — checkout funnel.** A product team plots a histogram of time-to-checkout for 2 million sessions and sees two peaks: one around 3 minutes and a second around 25 minutes. Splitting by device with overlaid density plots shows the second peak is almost entirely mobile users who leave and return. The team adds a saved-cart reminder for mobile; a follow-up ECDF shows the 75th percentile of checkout time falling from 19 to 11 minutes.

**Energy utilities — demand monitoring.** A grid operator's control room shows hourly load as a line chart with a 7-day moving average and a shaded band of the historical 5th–95th percentiles for the same hour and weekday. When load leaves the band during a heat wave, operators dispatch peaking plants early. A scatter plot of load against temperature, coloured by weekday/weekend, reveals the familiar U-shape (heating and cooling) used in the forecasting model.

**Pharmaceuticals — clinical trial reporting.** Regulators expect Kaplan-Meier curves, forest plots of subgroup effects and box plots of lab values by visit. A biostatistics team replaces bar charts of mean liver-enzyme levels with individual-patient spaghetti plots and box plots; this reveals three patients with sharp spikes at week 8 that the means had hidden, triggering a safety review — a direct application of "show the data, not only summaries".

## Practice Questions

*✎ new question added for this site (worked solution below)*

- ✎ Which chart type suits (a) the distribution of delivery times, (b) the relationship between advertising spend and sales, (c) monthly revenue over three years?
- ✎ A bar chart of average satisfaction scores starts its axis at 3.8 and shows two bars of heights 4.0 and 4.2. What is misleading about it, and how would you improve it?

## Solutions

*✎ solution written for this site*

- ✎ Q1: (a) histogram, density plot or box plot; (b) scatter plot (with a trend line); (c) line chart.
- ✎ Q2: Because bar length encodes the value, starting at 3.8 makes 4.2 look about twice as long as 4.0 although the difference is 5%. Start the bar axis at 0 (or use a dot plot with an honest axis), label the units and show the spread, for example with individual points or error bars.
