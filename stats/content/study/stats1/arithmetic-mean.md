# Arithmetic Mean

> Course part: Stats 1

## Overview

The **arithmetic mean** (average) is the most familiar measure of location: add up all values and divide by how many there are. It is the balance point of the data, which makes it ideal when totals matter, but also makes it sensitive to extreme values.

## Concept

### Definition

For observations $x_1,\dots,x_n$ the [arithmetic mean](https://en.wikipedia.org/wiki/Arithmetic_mean) (sample mean) is

$$\overline{x}_n = \frac1n\sum_{j=1}^{n} x_j .$$

- **Center of gravity**: if each observation is a unit weight on a number line, the mean is the point where the line balances. Consequently the deviations sum to zero: $\sum_j (x_j - \overline{x}_n) = 0$.
- **From a frequency table** with distinct values $a_1,\dots,a_k$ and relative frequencies $r_i$:
$$\overline{x}_n = \sum_{i=1}^{k} a_i\, r_i .$$
- **Linear transformations**: if $y_i = a + b\,x_i$, then $\overline{y}_n = a + b\,\overline{x}_n$. For non-linear transformations this fails in general.
- **Sensitive to outliers**, unlike the median.

## Worked Example

Data: 4, 8, 6, 10, 12.

1. Mean: $(4+8+6+10+12)/5 = 40/5 = 8$.
2. Deviations: $-4, 0, -2, 2, 4$, which sum to 0.
3. Outlier effect: adding the value 100 gives $140/6 \approx 23.3$, which is larger than five of the six observations.

From a frequency table: values 1, 2, 3 with relative frequencies 0.2, 0.5, 0.3 give $1\cdot0.2 + 2\cdot0.5 + 3\cdot0.3 = 2.1$.

Linear transformation: if costs $c$ have mean 100 and revenue is $r = 5c + 1500$, then mean revenue is $5\cdot100 + 1500 = 2000$.

## Common Mistakes

- Averaging percentages or rates of different group sizes without weights (use the [weighted mean](https://en.wikipedia.org/wiki/Weighted_arithmetic_mean), see Pooled Mean).
- Using the mean for strongly skewed data such as incomes, where the median is more representative.
- Applying $\overline{g(x)} = g(\overline{x})$ for non-linear $g$ (for example the mean of squares is *not* the square of the mean).

## When It's Used

The mean is the workhorse for metric data whenever totals matter: average order value times number of orders gives revenue, average consumption times households gives demand. Because it is the center of gravity, a single extreme value can move it a lot.

**Exam tip:** under a linear transformation $y = a + bx$ the mean transforms as $\bar y = a + b\bar x$ (costs to revenue $r_i = 5c_i + 1500$). For non-linear transformations this is false.

## R Code

```r
x <- c(12, 15, 11, 14, 18, 15, 13)
mean(x)
sum(x) / length(x)

# From a frequency table: mean = sum(a_i * r_i)
a <- c(1, 2, 3, 4)            # values
n_i <- c(3, 5, 8, 4)          # absolute frequencies
sum(a * n_i / sum(n_i))

# Linear transformation: production costs -> revenue r = 5c + 1500
mean_cost <- 3400
5 * mean_cost + 1500

set.seed(7)
costs <- rnorm(24, 3400, 500)
all.equal(mean(5 * costs + 1500), 5 * mean(costs) + 1500)
```

## Python Code

```python
import numpy as np

x = np.array([12, 15, 11, 14, 18, 15, 13])
print(x.mean(), x.sum() / len(x))

# From a frequency table: mean = sum(a_i * r_i)
a = np.array([1, 2, 3, 4])
n_i = np.array([3, 5, 8, 4])
print(np.sum(a * n_i / n_i.sum()), np.average(a, weights=n_i))

# Linear transformation: production costs -> revenue r = 5c + 1500
print(5 * 3400 + 1500)
rng = np.random.default_rng(7)
costs = rng.normal(3400, 500, 24)
print(np.isclose((5 * costs + 1500).mean(), 5 * costs.mean() + 1500))
```

## Practice Questions

*✎ new question added for this site (worked solution below)*

- ✎ Compute the mean and median of 3, 5, 7, 9, 26 and explain the difference.
- ✎ A frequency table has values 0, 1, 2, 3 with absolute frequencies 5, 10, 20, 15. Compute the mean.
- ✎ Daily temperatures in °C have mean 20. What is the mean in °F, given $F = 32 + 1.8\,C$?

## Solutions

*✎ solution written for this site*

- ✎ Q1: Mean $= 50/5 = 10$; median $= 7$. The outlier 26 pulls the mean up but does not affect the median.
- ✎ Q2: $n = 50$; mean $= (0\cdot5 + 1\cdot10 + 2\cdot20 + 3\cdot15)/50 = 95/50 = 1.9$.
- ✎ Q3: The transformation is linear, so the mean is $32 + 1.8\cdot20 = 68$ °F.
