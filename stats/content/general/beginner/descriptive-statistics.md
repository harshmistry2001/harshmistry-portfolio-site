# Descriptive Statistics

## Overview

Descriptive statistics answer three simple questions about a data set: where is the centre, how spread out are the values, and what is the shape of the distribution? A good summary always reports a centre together with a spread, and chooses robust measures when the data are skewed or contain outliers.

## Concept

[Descriptive statistics](https://en.wikipedia.org/wiki/Descriptive_statistics) condense a dataset into a few numbers that describe its **centre**, **spread** and **shape**. They make no claims beyond the data at hand — that is the job of inferential statistics — but every inferential analysis starts here.

### Measures of central tendency

- **Mean** $\bar x = \frac{1}{n}\sum_{i=1}^n x_i$ — the balance point; uses every value, so it is sensitive to outliers.
- **Median** — the middle value of the sorted data (average of the two middle values if $n$ is even); robust to outliers.
- **Mode** — the most frequent value; the only centre for nominal data.
- **[Trimmed mean](https://en.wikipedia.org/wiki/Truncated_mean)** — the mean after dropping the lowest and highest $k\%$; a compromise between mean and median.
- **Weighted mean** $\bar x_w = \frac{\sum w_i x_i}{\sum w_i}$ — for pooled groups or survey weights.
- **Geometric mean** $\left(\prod x_i\right)^{1/n}$ — for growth factors and ratios.

### Measures of spread

- **Range** $= \max - \min$ — simple, but driven entirely by two extreme values.
- **Variance** $s^2 = \frac{1}{n-1}\sum (x_i - \bar x)^2$ and **standard deviation** $s = \sqrt{s^2}$. The $n-1$ ([Bessel's correction](https://en.wikipedia.org/wiki/Bessel's_correction)) makes $s^2$ an unbiased estimator of the population variance.
- **Interquartile range** $IQR = Q_3 - Q_1$ — the spread of the middle 50%, robust.
- **Median absolute deviation** $MAD = \text{median}(|x_i - \text{median}(x)|)$ — the most robust spread measure.
- **Coefficient of variation** $CV = s / \bar x$ — relative spread for positive, ratio-scaled data.

### Position and standardisation

- **Percentiles / quantiles**: $Q_1$ (25th), median (50th), $Q_3$ (75th). Different software uses slightly different interpolation rules; results can differ in small samples.
- **[z-score](https://en.wikipedia.org/wiki/Standard_score)** $z_i = (x_i - \bar x)/s$ — how many standard deviations a value lies from the mean; used to compare values on different scales and to flag outliers ($|z| > 3$).
- **Five-number summary**: min, $Q_1$, median, $Q_3$, max — the basis of the box plot. The usual outlier fences are $Q_1 - 1.5\,IQR$ and $Q_3 + 1.5\,IQR$.

### Shape

- **[Skewness](https://en.wikipedia.org/wiki/Skewness)** $g_1 = \frac{\frac1n\sum(x_i-\bar x)^3}{s^3}$: $> 0$ right tail (mean > median), $< 0$ left tail.
- **[Kurtosis](https://en.wikipedia.org/wiki/Kurtosis)** $g_2 = \frac{\frac1n\sum(x_i-\bar x)^4}{s^4}$: normal data have kurtosis 3 (excess kurtosis 0); larger values mean heavier tails and more extreme outliers.

### Choosing the right summary

| Data | Report |
|---|---|
| Symmetric, no outliers | mean ± SD |
| Skewed or with outliers (income, prices, durations) | median and IQR |
| Categorical | counts and percentages, mode |
| Comparing variability across different units | CV |

Always pair a centre with a spread — "average delivery time 2.1 days" means little without knowing whether the SD is 0.3 or 3 days.

## Common Mistakes

- Reporting the mean of a strongly skewed variable (income, prices) without the median.
- Quoting a centre without a spread ("the average is 2.1 days").
- Treating every point beyond 3 standard deviations as an error: it is a flag to inspect, not a verdict.

## When It's Used

Descriptive statistics are the first table in every report: the "Table 1" of a clinical paper, the KPI tiles of a sales dashboard, the data-profiling step of a machine-learning pipeline, and the monthly summary a finance team sends to management. They are also the fastest data-quality check — impossible minima, suspicious maxima and unexpected modes reveal entry errors before any model is fitted.

## R Code

```r
set.seed(42)
# Delivery times in days for two warehouses; B has a few very late deliveries
deliveries <- data.frame(
  warehouse = rep(c("A", "B"), each = 60),
  days = c(rgamma(60, shape = 9, rate = 4),
           c(rgamma(55, shape = 9, rate = 4.5), c(7.5, 9.0, 11.2, 12.8, 15.4)))
)

describe <- function(x) {
  q <- quantile(x, c(0.25, 0.5, 0.75))
  m <- mean(x); s <- sd(x); n <- length(x)
  c(n = n, mean = m, trimmed_10 = mean(x, trim = 0.1), median = unname(q[2]),
    sd = s, IQR = unname(q[3] - q[1]), MAD = mad(x, constant = 1),
    CV = s / m, min = min(x), max = max(x),
    skewness = mean((x - m)^3) / (mean((x - m)^2))^1.5,
    kurtosis = mean((x - m)^4) / (mean((x - m)^2))^2)
}
round(t(sapply(split(deliveries$days, deliveries$warehouse), describe)), 3)

# Five-number summary and box-plot outliers for warehouse B
b <- deliveries$days[deliveries$warehouse == "B"]
fivenum(b)
q <- quantile(b, c(0.25, 0.75)); iqr <- diff(q)
b[b < q[1] - 1.5 * iqr | b > q[2] + 1.5 * iqr]

# z-scores and the |z| > 3 rule
z <- (b - mean(b)) / sd(b)
round(b[abs(z) > 3], 2)

# Summary by group in one call
aggregate(days ~ warehouse, data = deliveries,
          FUN = function(x) c(mean = mean(x), median = median(x), sd = sd(x)))

boxplot(days ~ warehouse, data = deliveries, horizontal = TRUE,
        main = "Delivery time by warehouse", xlab = "days")
```

## Python Code

```python
import numpy as np
import pandas as pd
from scipy import stats
import matplotlib.pyplot as plt

rng = np.random.default_rng(42)
deliveries = pd.DataFrame({
    "warehouse": np.repeat(["A", "B"], 60),
    "days": np.r_[rng.gamma(9, 1 / 4, 60),
                  rng.gamma(9, 1 / 4.5, 55), [7.5, 9.0, 11.2, 12.8, 15.4]],
})


def describe(x: pd.Series) -> pd.Series:
    q1, med, q3 = x.quantile([0.25, 0.5, 0.75])
    return pd.Series({
        "n": x.size, "mean": x.mean(), "trimmed_10": stats.trim_mean(x, 0.1), "median": med,
        "sd": x.std(), "IQR": q3 - q1, "MAD": stats.median_abs_deviation(x),
        "CV": x.std() / x.mean(), "min": x.min(), "max": x.max(),
        "skewness": stats.skew(x), "kurtosis": stats.kurtosis(x, fisher=False),
    })


print(deliveries.groupby("warehouse")["days"].apply(describe).unstack().round(3))

b = deliveries.loc[deliveries.warehouse == "B", "days"]
q1, q3 = b.quantile([0.25, 0.75])
iqr = q3 - q1
print("box-plot outliers:", b[(b < q1 - 1.5 * iqr) | (b > q3 + 1.5 * iqr)].round(2).tolist())
print("|z| > 3:", b[np.abs(stats.zscore(b, ddof=1)) > 3].round(2).tolist())

# pandas' built-in profile
print(deliveries.groupby("warehouse")["days"].describe().round(2))

deliveries.boxplot(column="days", by="warehouse", vert=False)
plt.suptitle(""); plt.title("Delivery time by warehouse"); plt.xlabel("days")
plt.show()
```

## Software Shortcuts

- **Excel functions:** `=AVERAGE()`, `=MEDIAN()`, `=MODE.SNGL()` / `=MODE.MULT()`, `=TRIMMEAN(range, 0.2)` (trims 10% each side), `=STDEV.S()`, `=VAR.S()`, `=QUARTILE.INC(range, 1)`, `=PERCENTILE.INC(range, 0.9)`, `=SKEW()`, `=KURT()` (excess kurtosis), `=STANDARDIZE(x, mean, sd)`, `=GEOMEAN()`.
- **Excel ToolPak:** Data → Data Analysis → **Descriptive Statistics** → tick *Summary statistics* for a full table in one click. (Enable via File → Options → Add-ins → Analysis ToolPak.)
- **Excel PivotTable:** Insert → PivotTable, drag the numeric field to Values and change *Summarize Values By* to Average, Max, StdDev, etc. — group summaries without formulas.
- **SPSS:** Analyze → Descriptive Statistics → **Descriptives** (mean, SD, z-scores via *Save standardized values*), **Frequencies** (quartiles, percentiles, mode) or **Explore** (trimmed mean, box plots, outliers, split by a factor).
- **Stata:** `summarize days, detail` (percentiles, skewness, kurtosis); `tabstat days, by(warehouse) stat(n mean p50 sd iqr cv)`.
- **Google Sheets:** same function names as Excel; Explore panel (bottom right) gives automatic summaries.

## Industry Examples

**Logistics — carrier performance.** A 3PL company compares two regional carriers with the same mean delivery time of 2.4 days. The descriptive table shows carrier B's SD is 1.9 days versus 0.6 for carrier A, and B's 95th percentile is 6 days. Because retail clients penalise late deliveries per order, the contract is priced on the 95th percentile and the IQR rather than the mean, and B receives a service-improvement plan.

**Human resources — pay equity review.** An HR analytics team profiles salaries for 4,200 employees. Salaries are right-skewed (skewness ≈ 1.8) because of a small executive group, so the review reports median and IQR by job level and gender instead of means. The CV within each level highlights two levels with unusually high dispersion, which turn out to be driven by inconsistent use of sign-on bonuses.

**Manufacturing — incoming inspection.** A tier-1 automotive supplier measures the diameter of 50 bolts from each incoming lot. Mean and SD feed the process-capability index $C_{pk}$; a lot whose kurtosis jumps from ≈3 to 6 signals a mixture of two production runs, which the supplier confirms after tracing the lot to two machines. The descriptive profile catches the issue before any parts reach the assembly line.

## Practice Questions

*✎ new question added for this site (worked solution below)*

- ✎ For the data 3, 5, 5, 7, 10, 40 compute the mean, median, mode and IQR (use the linear-interpolation quartiles of R/NumPy), and decide whether 40 is an outlier by the 1.5·IQR rule.
- ✎ Exam scores have mean 70 and standard deviation 10. What is the z-score of a student with 85 points, and what does it mean?

## Solutions

*✎ solution written for this site*

- ✎ Q1: Mean $=70/6\approx11.7$, median $=(5+7)/2=6$, mode $=5$. Quartiles: $Q_1=5$, $Q_3=9.25$, so $IQR=4.25$. The upper fence is $9.25+1.5\cdot4.25=15.6$; since $40>15.6$ it is an outlier. The mean is pulled far above the median by this one value.
- ✎ Q2: $z=(85-70)/10=1.5$: the student scored 1.5 standard deviations above the mean.
