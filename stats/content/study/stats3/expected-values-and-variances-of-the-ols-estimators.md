# Expected Values and Variances of the OLS Estimators

> Course part: Stats 3

## Overview

OLS gives an estimate from one sample. But a different sample would give a different estimate. Two questions tell us how far to trust a single estimate: Is the estimator **right on average** (unbiasedness)? And **how much does it vary** from sample to sample (its variance)? Both are answered by a short list of assumptions.

## Concept

### Assumptions SLR.1–SLR.5

1. **SLR.1 Linear in parameters:** $y=\beta_0+\beta_1x+u$.
2. **SLR.2 Random sampling:** the data $(x_i,y_i)$ are an i.i.d. sample from the population model.
3. **SLR.3 Sample variation in $x$:** the $x_i$ are not all equal.
4. **SLR.4 Zero conditional mean:** $E(u\mid x)=0$.
5. **SLR.5 Homoskedasticity:** $Var(u\mid x)=\sigma^2$ (constant error variance).

### Unbiasedness

Under SLR.1–SLR.4 the OLS estimators are [unbiased](https://en.wikipedia.org/wiki/Bias_of_an_estimator):
$$E(\hat\beta_0)=\beta_0,\qquad E(\hat\beta_1)=\beta_1 .$$
Unbiasedness is a property of the *procedure* over repeated samples, not of the particular estimate. If SLR.4 fails (an omitted variable correlated with $x$, "spurious correlation"), OLS is biased, however large the sample.

### Sampling variance

Under SLR.1–SLR.5,
$$Var(\hat\beta_1)=\frac{\sigma^2}{\sum(x_i-\bar x)^2}=\frac{\sigma^2}{SST_x}.$$
The variance is smaller when the error variance $\sigma^2$ is small and when $x$ varies a lot. [Homoskedasticity](https://en.wikipedia.org/wiki/Homoscedasticity_and_heteroscedasticity) is not needed for unbiasedness, only for this variance formula (and for OLS efficiency).

### Estimating the error variance

$\sigma^2$ is unknown and estimated from the residuals:
$$\hat\sigma^2=\frac1{n-2}\sum\hat u_i^2=\frac{SSR}{n-2},\qquad se(\hat\beta_1)=\frac{\hat\sigma}{\sqrt{SST_x}} .$$
Division by $n-2$ (instead of $n$) corrects for the two estimated parameters and makes $\hat\sigma^2$ unbiased.

## Worked Example

Data $x=1,\dots,5$, $y=2,4,5,4,5$: $SST_x=10$, $SSR=2.4$, $n=5$.
$$\hat\sigma^2=\frac{2.4}{3}=0.8,\quad \hat\sigma=0.894,\quad se(\hat\beta_1)=\frac{0.894}{\sqrt{10}}=0.283 .$$
With $\hat\beta_1=0.6$ the estimate is about 2.1 standard errors from zero. Doubling the spread of $x$ (so that $SST_x$ is four times as large) would halve the standard error.

## Common Mistakes

- Saying "the estimate is unbiased" for a particular sample.
- Requiring homoskedasticity for unbiasedness (not needed).
- Using $n$ instead of $n-2$ in $\hat\sigma^2$.
- Forgetting that a large sample does not remove bias caused by a violation of SLR.4.

## When It's Used

Unbiasedness and sampling variance tell you how much to trust an estimate from one sample. Under SLR.1-SLR.4 OLS is right on average; under homoskedasticity (SLR.5) $Var(\hat\beta_1) = \sigma^2/SST_x$ — more variation in $x$ and less noise give more precise estimates, which is why study designs try to spread the regressor.

**Exam tip:** $\hat\sigma^2 = SSR/(n-2)$ and $se(\hat\beta_1) = \hat\sigma/\sqrt{SST_x}$. If $E(u|x) \ne 0$ (omitted variable correlated with $x$), OLS is biased no matter how large $n$ is.

## R Code

```r
set.seed(9)
n <- 50; beta0 <- 1; beta1 <- 0.5; sigma <- 2
x <- runif(n, 0, 10)                             # keep x fixed across replications
SSTx <- sum((x - mean(x))^2)

b1 <- replicate(10000, coef(lm(beta0 + beta1 * x + rnorm(n, 0, sigma) ~ x))[2])
c(mean_b1 = mean(b1), true = beta1)                   # unbiased
c(var_sim = var(b1), var_formula = sigma^2 / SSTx)    # Var = sigma^2 / SST_x

# Standard error from one sample
y <- beta0 + beta1 * x + rnorm(n, 0, sigma)
fit <- lm(y ~ x)
sigma_hat <- sqrt(sum(resid(fit)^2) / (n - 2))
c(se_formula = sigma_hat / sqrt(SSTx), se_lm = coef(summary(fit))["x", "Std. Error"])
```

## Python Code

```python
import numpy as np
import statsmodels.api as sm

rng = np.random.default_rng(9)
n, b0, b1, sigma = 50, 1, 0.5, 2
x = rng.uniform(0, 10, n)
X = sm.add_constant(x)
SSTx = np.sum((x - x.mean()) ** 2)

Y = b0 + b1 * x + rng.normal(0, sigma, (10_000, n))
slopes = np.linalg.lstsq(X, Y.T, rcond=None)[0][1]      # 10,000 regressions at once
print("mean b1:", slopes.mean(), " var sim:", slopes.var(), " formula:", sigma**2 / SSTx)

fit = sm.OLS(Y[0], X).fit()
sigma_hat = np.sqrt(fit.ssr / (n - 2))
print("se formula:", sigma_hat / np.sqrt(SSTx), " se statsmodels:", fit.bse[1])
```

## Practice Questions

*✎ new question added for this site (worked solution below)*

- ✎ A regression with $n=32$ observations has $SSR=120$ and $SST_x=50$. Compute $\hat\sigma^2$ and $se(\hat\beta_1)$.
- ✎ Which assumption is violated if (a) the sample consists only of observations with $x>10$ chosen by the researcher because $y$ is large, (b) all $x_i$ are equal, (c) the variance of $u$ increases with $x$? Which of the properties (unbiasedness, variance formula) is affected?

## Solutions

*✎ solution written for this site*

- ✎ Q1: $\hat\sigma^2=120/30=4$; $se(\hat\beta_1)=\sqrt{4/50}=0.283$.
- ✎ Q2: (a) Selection on $y$ breaks SLR.2/SLR.4 (the sample is not random, $E(u\mid x)\ne0$ in the selected data) and causes bias. (b) SLR.3 fails: the slope cannot be computed. (c) SLR.5 fails (heteroskedasticity): OLS stays unbiased, but the formula $\sigma^2/SST_x$ and the usual standard errors are wrong.
