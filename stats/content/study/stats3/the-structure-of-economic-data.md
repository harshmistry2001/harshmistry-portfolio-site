# The Structure of Economic Data

> Course part: Stats 3

## Overview

Before choosing a method you must know how your data are organised. Economic datasets come in four standard shapes, and each one has different strengths, typical problems and tools. Recognising the structure is the first step of any analysis.

## Concept

| Structure | What it contains | Example | Typical feature |
|---|---|---|---|
| [Cross-sectional data](https://en.wikipedia.org/wiki/Cross-sectional_data) | many units at **one point in time** | survey of 500 households in 2020 | often a random sample; observations are independent |
| [Time series](https://en.wikipedia.org/wiki/Time_series) | **one unit over time** | quarterly GDP, daily stock price | observations ordered in time; trends, seasonality and **serial correlation** |
| Pooled cross sections | independent cross-sections from **different years**, stacked | house prices from separate surveys in 2010 and 2020 | the units differ in each year; allows before/after comparisons |
| [Panel (longitudinal) data](https://en.wikipedia.org/wiki/Panel_data) | the **same units** followed over time | 1,000 firms observed for 10 years | allows controlling for unobserved characteristics that do not change over time |

Notes:

- In a **cross-section** the order of observations does not matter, and random sampling is often plausible: each unit is drawn independently from the population.
- In a **time series**, today's value usually depends on yesterday's, so observations are *not* independent; this requires special methods.
- A **panel** differs from pooled cross sections because the *same* units reappear, so each unit can serve as its own control.

## Worked Example

Classify the datasets:

1. Monthly inflation rate of Germany from 2000 to 2020: **time series** (one unit, 240 months).
2. A survey of 2,000 randomly chosen workers in 2022 recording wage and education: **cross-section**.
3. Two independent surveys of households, one in 2015 and one in 2020, with different households each time: **pooled cross section**.
4. The same 300 firms observed every year from 2010 to 2020: **panel**.

## Common Mistakes

- Calling pooled cross sections a panel. If different units appear in each period, it is not a panel.
- Ignoring serial correlation when analysing time series as if they were random samples.
- Forgetting that a panel with $N$ units and $T$ periods has $NT$ observations that are *not* independent within a unit.

## When It's Used

The data structure determines the method: cross-sections (a survey of households in one year) are the basis of Topics 2-6; time series (GDP, prices, stock returns) need methods for serial correlation; pooled cross-sections compare independent samples across years (before/after a policy); panel data follow the *same* units over time and let you control for fixed unobserved traits.

**Exam tip:** classify a described dataset and explain why random sampling is plausible for a cross-section but not for a time series (observations are serially correlated).

## R Code

```r
set.seed(3)
# Cross-section: one observation per person, one point in time
cs <- data.frame(id = 1:5, wage = round(rlnorm(5, 2.5, 0.4), 2), educ = sample(10:18, 5))

# Time series: one unit over time, typically serially correlated
gdp_growth <- arima.sim(model = list(ar = 0.7), n = 40) + 2
acf(gdp_growth, plot = FALSE)$acf[2]           # first-order autocorrelation

# Pooled cross-section: independent samples from two years
pooled <- rbind(data.frame(year = 1985, price = rlnorm(4, 11, 0.3)),
                data.frame(year = 1993, price = rlnorm(4, 11.3, 0.3)))

# Panel (long format): the same cities observed in several years
panel <- expand.grid(city = c("A", "B", "C"), year = 2020:2022)
panel$crime <- round(rnorm(9, 50, 5))
panel[order(panel$city, panel$year), ]
```

## Python Code

```python
import numpy as np
import pandas as pd

rng = np.random.default_rng(3)
cs = pd.DataFrame({"id": range(1, 6), "wage": rng.lognormal(2.5, 0.4, 5).round(2),
                   "educ": rng.integers(10, 19, 5)})

g = np.zeros(40)                                   # AR(1) time series
for t in range(1, 40):
    g[t] = 0.7 * g[t - 1] + rng.normal()
gdp_growth = pd.Series(g + 2, index=pd.period_range("2010Q1", periods=40, freq="Q"))
print("lag-1 autocorrelation:", gdp_growth.autocorr(1))

pooled = pd.concat([pd.DataFrame({"year": 1985, "price": rng.lognormal(11, 0.3, 4)}),
                    pd.DataFrame({"year": 1993, "price": rng.lognormal(11.3, 0.3, 4)})])

panel = (pd.MultiIndex.from_product([["A", "B", "C"], [2020, 2021, 2022]], names=["city", "year"])
         .to_frame(index=False))
panel["crime"] = rng.normal(50, 5, len(panel)).round()
print(panel.set_index(["city", "year"]))
```

## Practice Questions

*✎ new question added for this site (worked solution below)*

- ✎ Classify: (a) the closing price of a share on 250 trading days; (b) wages of 800 randomly selected employees in 2023; (c) the same 800 employees' wages in 2022, 2023 and 2024; (d) unemployment rates in 20 countries in 2023.
- ✎ Why is the assumption of a random sample plausible for (b) but not for (a)?

## Solutions

*✎ solution written for this site*

- ✎ Q1: (a) time series; (b) cross-section; (c) panel; (d) cross-section (of countries).
- ✎ Q2: In (b) each employee is drawn independently from the population. In (a) the price today depends on the price yesterday (serial correlation), so the 250 observations are not independent draws.
