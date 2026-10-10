# Quantiles of Distributions and Skewness

> Course part: Stats 1

## Overview

Quantiles answer "below which value does a given share of the probability lie?" and are used for thresholds and risk limits. **Skewness** describes whether a distribution is symmetric or has a long tail to one side, which tells you whether the mean or the median is the better summary.

## Concept

### Theoretical quantile

The [$p$-quantile](https://en.wikipedia.org/wiki/Quantile) $q_p$ ($0<p<1$) of a random variable $X$ is the smallest value with $F_X(q_p)\ge p$. For a continuous variable with a strictly increasing distribution function it is simply the solution of
$$F_X(q_p)=\int_{-\infty}^{q_p}f_X(x)\,dx=p .$$
Special cases: $q_{0.5}$ is the **median**; $q_{0.25}$ and $q_{0.75}$ are the **quartiles**.

### Symmetry and skewness

The [skewness](https://en.wikipedia.org/wiki/Skewness) is the standardised third central moment
$$\gamma_1(X)=\frac{E\big[(X-E(X))^3\big]}{\sigma(X)^3}.$$

- $\gamma_1=0$ for symmetric distributions; then mode, median and mean coincide (for unimodal ones).
- $\gamma_1>0$: **right-skewed** (long right tail); typically mean > median.
- $\gamma_1<0$: **left-skewed** (long left tail); typically mean < median.

## Worked Example

For the density $f(x)=2x$ on $[0,1]$ we have $F(t)=t^2$, so the $p$-quantile solves $q_p^2=p$, i.e. $q_p=\sqrt p$.

- Median: $q_{0.5}=\sqrt{0.5}\approx0.707$.
- Upper quartile: $q_{0.75}=\sqrt{0.75}\approx0.866$.
- Mean: $E(X)=\frac23\approx0.667<0.707$ = median.

Mean below median indicates a **left-skewed** distribution: most mass sits near 1, and the thin tail towards 0 pulls the mean down.

## Common Mistakes

- Mixing up the quantile *level* $p$ (a probability) with the quantile *value* $q_p$ (on the scale of $X$).
- Using the rule "mean > median means right-skewed" as a theorem; it holds for most common distributions but not universally.
- Forgetting that skewness is standardised, so it is unit-free.

## When It's Used

Theoretical quantiles set thresholds: the 95% quantile of losses is Value-at-Risk, the 5% quantile of lifetime is a warranty period, the 97.5% normal quantile (1.96) builds confidence intervals. Skewness tells you whether mean or median is the better summary: income and claim sizes are strongly right-skewed.

**Exam tip:** for continuous $X$ solve $F(q_p) = p$. Right skew means mean > median.

## R Code

```r
# Quantiles by solving F(q) = p
qnorm(0.975)                     # 1.96
qexp(0.5, rate = 1/5)            # median waiting time when mean = 5
5 * log(2)                       # closed form

# Solve numerically for a custom F(x) = x^3 on [0, 1]
uniroot(function(q) q^3 - 0.9, c(0, 1))$root

# Skewness: gamma_1 = E[(X - mu)^3] / sigma^3
skew <- function(x) mean((x - mean(x))^3) / (mean((x - mean(x))^2))^(3/2)
set.seed(9)
c(normal = skew(rnorm(1e5)), exponential = skew(rexp(1e5)))   # about 0 and 2

y <- rexp(1e5)
c(mean = mean(y), median = median(y))                          # right skew: mean > median
```

## Python Code

```python
import numpy as np
from scipy import stats
from scipy.optimize import brentq

print(stats.norm.ppf(0.975))
print(stats.expon(scale=5).ppf(0.5), 5 * np.log(2))
print(brentq(lambda q: q**3 - 0.9, 0, 1))

rng = np.random.default_rng(9)
print("skew normal:", stats.skew(rng.normal(size=100_000)),
      " skew exponential:", stats.skew(rng.exponential(size=100_000)))
y = rng.exponential(size=100_000)
print("mean:", y.mean(), " median:", np.median(y))
```

## Practice Questions

*✎ new question added for this site (worked solution below)*

- ✎ For $F(x)=x^2$ on $[0,1]$ find the 90% quantile.
- ✎ A distribution of household incomes has mean 52,000 EUR and median 41,000 EUR. Is it more likely left- or right-skewed? Which summary would you report?
- ✎ A lifetime has $F(x)=1-e^{-x/10}$ for $x\ge0$. After which time have 5% of the items failed?

## Solutions

*✎ solution written for this site*

- ✎ Q1: $q_{0.9}=\sqrt{0.9}\approx0.949$.
- ✎ Q2: Mean above median points to right-skew (a long tail of high incomes). The median is the better summary of a typical household.
- ✎ Q3: Solve $1-e^{-q/10}=0.05$: $e^{-q/10}=0.95$, so $q=-10\ln0.95\approx0.513$ time units.
