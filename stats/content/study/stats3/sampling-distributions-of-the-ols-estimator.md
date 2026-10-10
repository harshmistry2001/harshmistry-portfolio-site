# Sampling Distributions of the OLS Estimator

> Course part: Stats 3

## Overview

To construct tests and confidence intervals we need to know more than the mean and variance of $\hat\beta_j$: we need its whole **distribution** over repeated samples. Adding one more assumption, normally distributed errors, gives an exact answer and leads directly to the t statistic that every regression package prints.

## Concept

### The classical linear model (CLM)

The CLM consists of MLR.1–MLR.5 (the Gauss–Markov assumptions) plus

**MLR.6 (normality):** the error $u$ is independent of the explanatory variables and $u\sim N(0,\sigma^2)$.

Equivalently, conditional on the regressors, $y\mid x_1,\dots,x_k\sim N(\beta_0+\beta_1x_1+\dots+\beta_kx_k,\ \sigma^2)$.

### Consequences

- Each $\hat\beta_j$ is a linear function of the $y_i$, hence **normally distributed** (conditional on the sample values of the regressors):
$$\frac{\hat\beta_j-\beta_j}{sd(\hat\beta_j)}\sim N(0,1).$$
- Replacing the unknown $sd(\hat\beta_j)$ by the standard error $se(\hat\beta_j)$ gives the **t distribution** with $n-k-1$ degrees of freedom (next topic).
- Under the CLM, OLS is the *minimum variance unbiased* estimator: the smallest variance among all unbiased estimators, not only linear ones.

### How realistic is normality?

Normality is an empirical question. Wages, prices or counts are typically skewed, so $u$ cannot be exactly normal; taking logarithms sometimes makes the distribution closer to normal. Even without normality, the central limit theorem makes the sampling distribution of $\hat\beta_j$ approximately normal in large samples (see the topic on asymptotics), so the same tests remain approximately valid.

## Worked Example

In $\widehat{\ln(wage)}=0.284+0.092\,educ+\dots$ let $\hat\beta_{educ}=0.092$ with $se=0.007$. Under the CLM, the interval $\hat\beta\pm 2\,se$ covers the true $\beta_{educ}$ in about 95% of repeated samples. In 1,000 different samples of workers the estimates would scatter in a bell-shaped way around the true value, with standard deviation about 0.007.

## Common Mistakes

- Thinking the *data* ($x$ or $y$) have to be normal; the assumption concerns the error $u$ (given the regressors).
- Believing that normality is needed for unbiasedness; it is not (it is needed for exact finite-sample tests).
- Using the normal instead of the t distribution when $\sigma^2$ is estimated and the sample is small.

## When It's Used

To build confidence intervals and tests we need the distribution of $\hat\beta_j$, not just its mean and variance. Under the classical linear model (MLR.1-6, normal errors) $\hat\beta_j$ is exactly normal; with non-normal errors it is approximately normal in large samples (Topic 5). This is what licenses the t-statistics printed by every regression package.

**Exam tip:** $\frac{\hat\beta_j - \beta_j}{sd(\hat\beta_j)} \sim N(0,1)$; replacing $sd$ by $se$ gives $t_{n-k-1}$.

## R Code

```r
set.seed(15)
n <- 25
x <- runif(n, 0, 10)
sd_b1 <- 2 / sqrt(sum((x - mean(x))^2))

z <- replicate(10000, (coef(lm(1 + 0.5 * x + rnorm(n, 0, 2) ~ x))[2] - 0.5) / sd_b1)
c(mean = mean(z), sd = sd(z))                           # approx 0 and 1

hist(z, breaks = 60, freq = FALSE, main = "Standardised OLS slope")
curve(dnorm(x), add = TRUE, lwd = 2)
```

## Python Code

```python
import numpy as np
import matplotlib.pyplot as plt
from scipy import stats
import statsmodels.api as sm

rng = np.random.default_rng(15)
n = 25
x = rng.uniform(0, 10, n)
X = sm.add_constant(x)
sd_b1 = 2 / np.sqrt(np.sum((x - x.mean()) ** 2))
Y = 1 + 0.5 * x + rng.normal(0, 2, (10_000, n))
z = (np.linalg.lstsq(X, Y.T, rcond=None)[0][1] - 0.5) / sd_b1
print("mean", z.mean(), " sd", z.std())

plt.hist(z, bins=60, density=True)
g = np.linspace(-4, 4, 200)
plt.plot(g, stats.norm.pdf(g))
plt.title("Standardised OLS slope")
plt.show()
```

## Practice Questions

*✎ new question added for this site (worked solution below)*

- ✎ Which assumption is added to MLR.1–MLR.5 to obtain the classical linear model, and what does it imply for $\hat\beta_j$?
- ✎ Salaries are right-skewed. Why may a regression of $\ln(salary)$ be more compatible with MLR.6 than one of $salary$?

## Solutions

*✎ solution written for this site*

- ✎ Q1: MLR.6, normality of the error given the regressors. It implies that $\hat\beta_j$ is normally distributed and that $(\hat\beta_j-\beta_j)/se(\hat\beta_j)$ follows an exact $t_{n-k-1}$ distribution.
- ✎ Q2: The logarithm compresses large values and often makes a right-skewed variable much more symmetric, so the error of the log model is closer to normal than the error of the level model.
