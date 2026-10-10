# Asymptotic Normality and Large Sample Inference

> Course part: Stats 3

## Overview

The exact t and F tests of the classical linear model require normally distributed errors. But wages, prices and durations are skewed, so that assumption is rarely true. The **central limit theorem** comes to the rescue: with enough observations, OLS estimators are approximately normal *whatever* the error distribution, and the usual tests remain approximately valid.

## Concept

### Asymptotic normality

Under MLR.1–MLR.5 (without MLR.6!), as $n$ grows,
$$\sqrt n\,(\hat\beta_j-\beta_j)\ \overset{a}{\sim}\ N\!\Big(0,\ \frac{\sigma^2}{a_j^2}\Big),\qquad \frac{\hat\beta_j-\beta_j}{se(\hat\beta_j)}\ \overset{a}{\sim}\ N(0,1),$$
where $a_j^2=\text{plim}\,\frac1n SST_j(1-R_j^2)$ is a constant. Because the $t_{n-k-1}$ distribution is close to the standard normal for large $n$, the usual t statistics, confidence intervals and F tests can be used as before. See the [central limit theorem](https://en.wikipedia.org/wiki/Central_limit_theorem).

### Standard errors shrink at rate $1/\sqrt n$

$se(\hat\beta_j)\approx c_j/\sqrt n$ for a constant $c_j$. Quadrupling the sample size halves the standard error; to gain one more decimal digit of precision, you need 100 times as much data.

### What is still required?

Asymptotic normality does not repair a violated MLR.4 (bias and inconsistency) and it still needs homoskedasticity for the standard formula for $se(\hat\beta_j)$ (otherwise use heteroskedasticity-robust standard errors). "Large" is a matter of judgement: with very skewed errors, a few hundred observations are often needed.

## Worked Example

A regression with $n=100$ has $se(\hat\beta_j)=0.20$. With $n=400$ (four times the data), $se\approx0.20/\sqrt4=0.10$. If $\hat\beta_j=0.35$ then $t=1.75$ (insignificant at 5% two-sided) for $n=100$, but if the same estimate were found with $n=400$ then $t=3.5$ (highly significant).

## Common Mistakes

- Thinking the data themselves become normal in large samples. It is the distribution of the *estimator* that becomes normal.
- Believing that large $n$ makes heteroskedasticity irrelevant for the standard errors.
- Interpreting significance in huge samples as importance.

## When It's Used

Real error terms are rarely normal (wages, prices and durations are skewed), yet t-tests and confidence intervals from regression output are used everywhere. Asymptotic normality is the reason: with enough observations the OLS estimator is approximately normal regardless of the error distribution, and standard errors shrink at the rate $1/\sqrt{n}$.

**Exam tip:** MLR.6 (normal errors) is not needed for valid inference in large samples. Quadrupling the sample size halves the standard error.

## R Code

```r
set.seed(22)
tstat <- function(n) {
  x <- runif(n, 0, 10)
  u <- rexp(n) - 1                                  # skewed, mean-zero errors
  fit <- lm(1 + 0.5 * x + u ~ x)
  (coef(fit)[2] - 0.5) / coef(summary(fit))[2, 2]
}
t_small <- replicate(4000, tstat(10))
t_large <- replicate(4000, tstat(500))
# Rejection rates of a nominal 5% two-sided test
c(n10 = mean(abs(t_small) > qt(0.975, 8)), n500 = mean(abs(t_large) > qt(0.975, 498)))

# Standard errors shrink like 1 / sqrt(n)
se <- sapply(c(100, 400, 1600), function(n) {
  x <- runif(n, 0, 10); coef(summary(lm(1 + 0.5 * x + rexp(n) - 1 ~ x)))[2, 2]
})
se; se[1] / se
```

## Python Code

```python
import numpy as np
from scipy import stats
import statsmodels.api as sm

rng = np.random.default_rng(22)
def tstat(n):
    x = rng.uniform(0, 10, n)
    y = 1 + 0.5 * x + rng.exponential(size=n) - 1
    fit = sm.OLS(y, sm.add_constant(x)).fit()
    return (fit.params[1] - 0.5) / fit.bse[1], fit.bse[1]

for n in (10, 500):
    t = np.array([tstat(n)[0] for _ in range(4000)])
    print(n, "rejection rate:", np.mean(np.abs(t) > stats.t.ppf(0.975, n - 2)))

se = np.array([tstat(n)[1] for n in (100, 400, 1600)])
print("se:", se, " ratios:", se[0] / se)
```

## Practice Questions

*✎ new question added for this site (worked solution below)*

- ✎ A standard error is 0.08 with $n=250$. What standard error do you expect with $n=1000$ and with $n=62{,}500$?
- ✎ Why can you use the usual t test in a wage regression with skewed errors and $n=5000$?

## Solutions

*✎ solution written for this site*

- ✎ Q1: $n=1000$ is four times as large: $se\approx0.04$. $n=62{,}500$ is $250$ times as large: $se\approx0.08/\sqrt{250}=0.0051$.
- ✎ Q2: By the central limit theorem, $\hat\beta_j$ is approximately normal for large $n$ even if the errors are skewed (MLR.6 fails), so the t statistic is approximately $N(0,1)$.
