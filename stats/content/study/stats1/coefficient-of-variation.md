# Coefficient of Variation

> Course part: Stats 1

## Overview

A standard deviation of 5 means something very different for a stock priced around 50 than for one priced around 5,000. The **coefficient of variation** expresses variability *relative to the mean*, which makes spreads comparable across variables with different levels or units.

## Concept

For a sample with mean $\overline{x}_n > 0$ and standard deviation $s_x$,

$$cv = \frac{s_x}{\overline{x}_n}.$$

(See [coefficient of variation](https://en.wikipedia.org/wiki/Coefficient_of_variation).) It is often quoted as a percentage.

- **Scale invariant**: multiplying all data by $a>0$ leaves it unchanged, $cv(ax_1,\dots,ax_n) = cv(x_1,\dots,x_n)$. Converting EUR to USD or metres to feet does not change it.
- **Not shift invariant**: adding a constant changes the mean but not $s_x$, so $cv$ changes.
- Only meaningful for **ratio-scaled, positive** data with a mean clearly away from zero.

## Worked Example

Two stocks over the past year:

| | Mean price | Standard deviation | $cv$ |
|---|---|---|---|
| Stock A | 50 | 5 | $5/50 = 0.10$ (10%) |
| Stock B | 200 | 16 | $16/200 = 0.08$ (8%) |

Stock B has the larger absolute fluctuation (16 vs. 5), but relative to its price it is the *less* volatile one.

Scale check: in USD at a rate of 1.1, Stock A has mean 55 and sd 5.5, still $cv = 0.10$. Shift check: adding 100 to every price of stock A gives mean 150, sd 5, $cv = 0.033$.

## Common Mistakes

- Using $cv$ for interval-scaled data such as temperature in °C, where the zero is arbitrary and the $cv$ depends on the unit.
- Applying it when the mean is close to 0, where it explodes and is uninformative.
- Comparing $s_x$ values directly across series with very different means.

## When It's Used

The coefficient of variation compares variability across series with different levels or units: volatility of a cheap vs. an expensive stock, precision of lab assays at different concentrations, demand variability of fast- vs. slow-moving products in inventory planning.

**Exam tip:** $cv$ is unchanged by rescaling (EUR to USD) but changes under shifts, so it only makes sense for ratio-scaled, positive data.

## R Code

```r
stock_a <- c(102, 98, 105, 110, 95, 101)
stock_b <- c(21, 19, 24, 18, 25, 20)

cv <- function(x) sd(x) / mean(x)
c(A = cv(stock_a), B = cv(stock_b))    # B is relatively riskier despite smaller sd

c(sd_A = sd(stock_a), sd_B = sd(stock_b))

# Scale invariance vs. shift sensitivity
c(cv(stock_a), cv(1.08 * stock_a), cv(stock_a + 50))
```

## Python Code

```python
import numpy as np

stock_a = np.array([102, 98, 105, 110, 95, 101])
stock_b = np.array([21, 19, 24, 18, 25, 20])

def cv(x):
    return x.std(ddof=1) / x.mean()

print("cv A:", cv(stock_a), " cv B:", cv(stock_b))
print("sd A:", stock_a.std(ddof=1), " sd B:", stock_b.std(ddof=1))
print(cv(stock_a), cv(1.08 * stock_a), cv(stock_a + 50))
```

## Practice Questions

*✎ new question added for this site (worked solution below)*

- ✎ A series has mean 25 and standard deviation 4. Compute $cv$.
- ✎ Series 1 has mean 10 and sd 2; series 2 has mean 1000 and sd 150. Which varies more in relative terms?

## Solutions

*✎ solution written for this site*

- ✎ Q1: $cv = 4/25 = 0.16$ (16%).
- ✎ Q2: $cv_1 = 2/10 = 0.20$ and $cv_2 = 150/1000 = 0.15$. Series 1 varies more relative to its level, although its absolute sd is much smaller.
