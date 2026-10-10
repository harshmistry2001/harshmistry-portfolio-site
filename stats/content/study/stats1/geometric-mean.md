# Geometric Mean

> Course part: Stats 1

## Overview

When quantities are **multiplied** over time (investment returns, inflation, growth) the ordinary average gives the wrong answer. The **geometric mean** is the "average factor" that, applied repeatedly, produces the same overall change.

## Concept

### Definition

For strictly positive observations $x_1,\dots,x_n$ the [geometric mean](https://en.wikipedia.org/wiki/Geometric_mean) is

$$\overline{x}_G = \sqrt[n]{x_1 x_2\cdots x_n} = \left(\prod_{j=1}^n x_j\right)^{1/n}.$$

Equivalently, it is the exponential of the arithmetic mean of the logarithms: $\overline{x}_G = \exp\!\big(\tfrac1n\sum \ln x_j\big)$.

- Requires **ratio-scaled, strictly positive** data.
- For growth rates work with **growth factors**: +5% corresponds to the factor $1.05$, −20% to $0.80$.
- The geometric mean is never larger than the arithmetic mean, and equal only if all values are identical.

## Worked Example

An investment returns +10%, −20% and +30% in three years. The growth factors are 1.10, 0.80 and 1.30.

- Total growth factor: $1.10 \cdot 0.80 \cdot 1.30 = 1.144$ (+14.4% in total).
- Geometric mean: $1.144^{1/3} \approx 1.0459$, an average of **+4.59% per year**. Check: $1.0459^3 \approx 1.144$.
- Arithmetic mean of the factors: $(1.10+0.80+1.30)/3 \approx 1.0667$ (+6.67% per year) would predict $1.0667^3 \approx 1.214$, overstating the real result.

## Common Mistakes

- Averaging percentages (+10, −20, +30) instead of growth factors.
- Using the geometric mean when a value is zero or negative: the product is zero or the root is undefined.
- Reporting the geometric mean factor (1.0459) as if it were the rate (4.59%).

## When It's Used

Whenever quantities multiply over time the geometric mean is the correct average: average annual return of an investment, average inflation rate, average growth rate of users or sales. Using the arithmetic mean of growth factors overstates performance. See also the [compound annual growth rate](https://en.wikipedia.org/wiki/Compound_annual_growth_rate).

**Exam tip:** work with growth *factors* ($1.05$ for +5%), not percentages; all values must be strictly positive.

## R Code

```r
returns <- c(0.10, -0.05, 0.20, -0.15, 0.08)   # yearly returns
factors <- 1 + returns

g <- prod(factors)^(1 / length(factors))         # geometric mean factor
g_log <- exp(mean(log(factors)))                 # same, numerically safer
c(g, g_log)
g - 1                                            # average annual return

# Check: compounding at g gives the same final value
c(prod(factors), g^length(factors))
mean(factors) - 1                                # arithmetic mean overstates
```

## Python Code

```python
import numpy as np
from scipy.stats import gmean

returns = np.array([0.10, -0.05, 0.20, -0.15, 0.08])
factors = 1 + returns

g = gmean(factors)
print(g, np.exp(np.mean(np.log(factors))))
print("average annual return:", g - 1)
print("final value check:", factors.prod(), g ** len(factors))
print("arithmetic mean (overstated):", factors.mean() - 1)
```

## Practice Questions

*✎ new question added for this site (worked solution below)*

- ✎ A price rises by 20% in year 1 and falls by 20% in year 2. What is the average yearly growth rate (geometric mean)? Is the price back at its starting level?
- ✎ Annual revenue grew from 100 to 162 over 4 years. Find the average annual growth rate.

## Solutions

*✎ solution written for this site*

- ✎ Q1: Factors 1.2 and 0.8: product $0.96$, geometric mean $\sqrt{0.96} \approx 0.980$, i.e. about −2.0% per year. The price ends at 96% of its start, not back at 100%.
- ✎ Q2: Total factor 1.62 over 4 years: $1.62^{1/4} \approx 1.128$, i.e. about +12.8% per year.
