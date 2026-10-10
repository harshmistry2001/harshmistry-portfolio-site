# The Variance of the OLS Estimators

> Course part: Stats 3

## Overview

Unbiasedness says OLS is right on average. How much a *single* estimate scatters around the truth is the question of the **sampling variance**. It decides how wide confidence intervals are and whether coefficients come out significant. Three things drive it: the noise in the data, the variation in the regressor and, new in multiple regression, the overlap between regressors (**multicollinearity**).

## Concept

### Homoskedasticity

Assumption **MLR.5**: $Var(u\mid x_1,\dots,x_k)=\sigma^2$ (constant error variance). With MLR.1–MLR.5,
$$Var(\hat\beta_j)=\frac{\sigma^2}{SST_j\,(1-R_j^2)},\qquad j=1,\dots,k,$$
where $SST_j=\sum(x_{ij}-\bar x_j)^2$ is the total sample variation of $x_j$ and $R_j^2$ is the $R^2$ from regressing $x_j$ on all the *other* regressors.

### The three components

1. **Error variance $\sigma^2$:** more noise means larger variance.
2. **Sample variation in $x_j$ ($SST_j$):** more variation (and more observations) means smaller variance.
3. **Correlation with other regressors ($R_j^2$):** the closer $R_j^2$ is to 1, the larger the variance. The factor $VIF_j=\frac1{1-R_j^2}$ is the [variance inflation factor](https://en.wikipedia.org/wiki/Variance_inflation_factor).

[Multicollinearity](https://en.wikipedia.org/wiki/Multicollinearity) (high but not perfect correlation among regressors) does **not** bias OLS; it only makes the estimates imprecise.

### Estimating $\sigma^2$

$$\hat\sigma^2=\frac{SSR}{n-k-1},\qquad se(\hat\beta_j)=\frac{\hat\sigma}{\sqrt{SST_j(1-R_j^2)}} ,$$
where $n-k-1$ are the degrees of freedom (observations minus estimated parameters). This estimator is unbiased.

## Worked Example

Suppose $\sigma^2=4$, $SST_j=100$.

- No collinearity ($R_j^2=0$): $Var(\hat\beta_j)=4/100=0.04$, $se=0.20$.
- Strong collinearity ($R_j^2=0.75$): $Var(\hat\beta_j)=\frac{4}{100\cdot0.25}=0.16$, $se=0.40$, since $VIF=4$: the standard error doubles.

Error variance estimate: $SSR=200$, $n=53$, $k=4$ regressors: $\hat\sigma^2=\frac{200}{53-4-1}=4.17$.

## Common Mistakes

- Using $n$ or $n-2$ as degrees of freedom in a multiple regression: it is $n-k-1$.
- Treating multicollinearity as a violation of the assumptions. Only *perfect* collinearity is; near collinearity merely inflates variances.
- Dropping a relevant correlated variable to "fix" multicollinearity: this trades variance for omitted variable bias.

## When It's Used

Precision of an estimate depends on noise, sample variation in the regressor and multicollinearity. In practice high correlation among regressors (e.g. several spending categories, or age and experience) produces large standard errors even with lots of data; the VIF quantifies this and guides model design.

**Exam tip:** $Var(\hat\beta_j) = \frac{\sigma^2}{SST_j(1 - R_j^2)}$, $VIF_j = \frac{1}{1 - R_j^2}$, $\hat\sigma^2 = \frac{SSR}{n-k-1}$. Multicollinearity does not bias OLS; it inflates variance.

## R Code

```r
set.seed(13)
n <- 200
x1 <- rnorm(n)
x2 <- 0.95 * x1 + sqrt(1 - 0.95^2) * rnorm(n)     # highly correlated with x1
x3 <- rnorm(n)
y <- 1 + 2 * x1 + 1 * x2 + 0.5 * x3 + rnorm(n)
fit <- lm(y ~ x1 + x2 + x3)

vif <- sapply(c("x1", "x2", "x3"), function(v) {
  others <- setdiff(c("x1", "x2", "x3"), v)
  R2 <- summary(lm(reformulate(others, v)))$r.squared
  1 / (1 - R2)
})
round(vif, 2)

# se(beta_j) = sigma_hat / sqrt(SST_j (1 - R_j^2))
sigma_hat <- sqrt(sum(resid(fit)^2) / (n - 3 - 1))
R2_1 <- summary(lm(x1 ~ x2 + x3))$r.squared
c(formula = sigma_hat / sqrt(sum((x1 - mean(x1))^2) * (1 - R2_1)),
  lm = coef(summary(fit))["x1", "Std. Error"])
```

## Python Code

```python
import numpy as np
import pandas as pd
import statsmodels.api as sm
from statsmodels.stats.outliers_influence import variance_inflation_factor

rng = np.random.default_rng(13)
n = 200
x1 = rng.normal(size=n)
x2 = 0.95 * x1 + np.sqrt(1 - 0.95**2) * rng.normal(size=n)
x3 = rng.normal(size=n)
y = 1 + 2 * x1 + x2 + 0.5 * x3 + rng.normal(size=n)
X = sm.add_constant(pd.DataFrame({"x1": x1, "x2": x2, "x3": x3}))
fit = sm.OLS(y, X).fit()

print({c: round(variance_inflation_factor(X.values, i), 2) for i, c in enumerate(X.columns) if c != "const"})
sigma_hat = np.sqrt(fit.ssr / (n - 3 - 1))
R2_1 = sm.OLS(x1, sm.add_constant(np.column_stack([x2, x3]))).fit().rsquared
print(sigma_hat / np.sqrt(np.sum((x1 - x1.mean()) ** 2) * (1 - R2_1)), fit.bse["x1"])
```

## Practice Questions

*✎ new question added for this site (worked solution below)*

- ✎ Compute the VIF and the factor by which the standard error is inflated for $R_j^2=0.9$.
- ✎ A regression with $n=40$ observations and $k=3$ regressors has $SSR=108$. Compute $\hat\sigma^2$.
- ✎ Name two ways to reduce the variance of $\hat\beta_j$.

## Solutions

*✎ solution written for this site*

- ✎ Q1: $VIF=1/0.1=10$; the standard error is $\sqrt{10}\approx3.16$ times as large as without collinearity.
- ✎ Q2: $\hat\sigma^2=108/(40-3-1)=108/36=3$.
- ✎ Q3: Increase the sample size (larger $SST_j$), collect data with more variation in $x_j$, add regressors that explain $y$ and reduce $\sigma^2$ (provided they are not highly correlated with $x_j$), or reduce collinearity (for example by combining highly correlated variables).
