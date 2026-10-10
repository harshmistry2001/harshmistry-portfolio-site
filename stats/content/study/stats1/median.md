# Median

> Course part: Stats 1

## Overview

The **median** is the "middle value" of a sorted sample: half of the observations are at most as large, half are at least as large. It is the standard summary for skewed data or data with outliers, which is why official statistics report *median* income rather than mean income.

## Concept

### Definition

Order the sample: $x_{(1)} \le x_{(2)} \le \dots \le x_{(n)}$. The [median](https://en.wikipedia.org/wiki/Median) is

$$x_{med} = \begin{cases} x_{\left(\frac{n+1}{2}\right)} & n \text{ odd},\\[4pt] \tfrac12\left(x_{\left(\frac n2\right)} + x_{\left(\frac n2 + 1\right)}\right) & n \text{ even.}\end{cases}$$

### Properties

- Needs a **sortable** variable, so the data must be at least ordinal.
- **Robust**: changing the largest value, however drastically, does not move the median (it is a [robust statistic](https://en.wikipedia.org/wiki/Robust_statistics)).
- **Compatible with strictly monotone transformations**: if $g$ is strictly increasing then $\text{median}(g(x_1),\dots,g(x_n)) = g(\text{median}(x_1,\dots,x_n))$. The mean does not have this property (except for linear $g$).

## Worked Example

Widths (m) of nine storefronts in "Squaretown": 5.4, 6.5, 13.2, 4.1, 7.5, 5.4, 6.3, 6.7, 7.3.

1. Sort: 4.1, 5.4, 5.4, 6.3, **6.5**, 6.7, 7.3, 7.5, 13.2.
2. $n = 9$ is odd, so the median is the $(9+1)/2 = 5$th value: **6.5 m**.
3. The mean is $62.4/9 \approx 6.93$ m; the single wide store (13.2 m) pulls it above the median.

Robustness: adding one more store of 80 m changes the median only to $(6.5+6.7)/2 = 6.6$ m, whereas the mean jumps to $142.4/10 = 14.24$ m.

Monotone transformation: if the base area is $2.5\,w^2$, then $\text{median(area)} = 2.5 \cdot 6.5^2 = 105.6$ m², but the mean area is *not* $2.5 \cdot \bar w^2$.

## Common Mistakes

- Forgetting to **sort** before picking the middle value.
- Using $\frac{n+1}{2}$ as a *value* instead of as a *position*.
- Applying the "median of the transformed data = transformed median" trick to non-monotone functions (such as $w \mapsto (w-6)^2$).

## When It's Used

The median is the preferred "typical value" whenever data are skewed or contain outliers: household income, house prices, salaries, delivery times. Official statistics report median income precisely because a few very large incomes would pull the mean upward.

**Exam tip:** the median commutes with strictly monotone transformations. In the Squaretown problem the base area is $2.5 \cdot w^2$, so $\text{median(area)} = 2.5 \cdot \text{median}(w)^2$, but the same trick does **not** work for the mean.

## R Code

```r
widths <- c(5.4, 6.5, 13.2, 4.1, 7.5, 5.4, 6.3, 6.7, 7.3)   # Squaretown storefronts (m)

median(widths)
mean(widths)

# Course formula for the ordered sample
x <- sort(widths); n <- length(x)
if (n %% 2 == 1) x[(n + 1) / 2] else (x[n / 2] + x[n / 2 + 1]) / 2

# Monotone transformation: base area = width * (2.5 * width)
area <- 2.5 * widths^2
c(median_area = median(area), transformed_median = 2.5 * median(widths)^2)
c(mean_area = mean(area), transformed_mean = 2.5 * mean(widths)^2)   # differ!

# Robustness: one extreme value barely moves the median
c(median = median(c(widths, 80)), mean = mean(c(widths, 80)))
```

## Python Code

```python
import numpy as np

widths = np.array([5.4, 6.5, 13.2, 4.1, 7.5, 5.4, 6.3, 6.7, 7.3])   # Squaretown storefronts (m)
print("median:", np.median(widths), " mean:", widths.mean().round(3))

# Course formula for the ordered sample
x = np.sort(widths); n = len(x)
med = x[(n + 1) // 2 - 1] if n % 2 else (x[n // 2 - 1] + x[n // 2]) / 2
print("formula:", med)

# Monotone transformation: base area = width * (2.5 * width)
area = 2.5 * widths**2
print("median area:", np.median(area), " 2.5*median^2:", 2.5 * np.median(widths)**2)
print("mean area:", area.mean().round(3), " 2.5*mean^2:", (2.5 * widths.mean()**2).round(3))

# Robustness against an outlier
y = np.append(widths, 80)
print("with outlier -> median:", np.median(y), " mean:", y.mean().round(2))
```

## Practice Questions

*✎ new question added for this site (worked solution below)*

- ✎ Find the median of 3, 9, 1, 7 and of 3, 9, 1, 7, 100.
- ✎ Ten employees earn 30, 32, 33, 35, 36, 38, 40, 41, 42 and 250 (thousand EUR). Compare mean and median and say which better describes a "typical" salary.

## Solutions

*✎ solution written for this site*

- ✎ Q1: Sorted: 1, 3, 7, 9 → median $(3+7)/2 = 5$. With 100 added: 1, 3, 7, 9, 100 → median 7.
- ✎ Q2: The sum is 577, so the mean is 57.7; the median is $(36+38)/2 = 37$. The one very high salary pulls the mean far above what nine of ten employees earn, so the median (37) describes a typical salary better.
