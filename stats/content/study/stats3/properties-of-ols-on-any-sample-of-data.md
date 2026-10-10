# Properties of OLS on Any Sample of Data

> Course part: Stats 3

## Overview

Some properties of OLS are pure arithmetic: they hold for **every** dataset, whatever the true relationship is. They are useful to check software output and to understand what $R^2$ really measures.

## Concept

### Fitted values and residuals

Fitted values $\hat y_i=\hat\beta_0+\hat\beta_1x_i$ are the model's predictions; residuals $\hat u_i=y_i-\hat y_i$ are the prediction errors. A positive residual means the model *under*-predicts that observation; a negative residual means it over-predicts.

### Algebraic properties

1. The OLS residuals sum (and average) to zero: $\sum\hat u_i=0$.
2. The residuals are uncorrelated with the regressor: $\sum x_i\hat u_i=0$ (and thus with the fitted values).
3. The point $(\bar x,\bar y)$ always lies on the regression line.

These are direct consequences of the normal equations.

### Goodness of fit

Decompose the variation in $y$:
$$\underbrace{\sum(y_i-\bar y)^2}_{SST}=\underbrace{\sum(\hat y_i-\bar y)^2}_{SSE}+\underbrace{\sum\hat u_i^2}_{SSR}.$$
Total (SST), explained (SSE) and residual (SSR) sums of squares. The [coefficient of determination](https://en.wikipedia.org/wiki/Coefficient_of_determination) is
$$R^2=\frac{SSE}{SST}=1-\frac{SSR}{SST}\in[0,1],$$
the fraction of the sample variation in $y$ that is explained by $x$. In simple regression $R^2$ equals the squared sample correlation of $x$ and $y$.

## Worked Example

Data $x=1,\dots,5$, $y=2,4,5,4,5$ with fitted line $\hat y=2.2+0.6x$.

| $x$ | $y$ | $\hat y$ | $\hat u$ | $x\hat u$ |
|---|---|---|---|---|
| 1 | 2 | 2.8 | −0.8 | −0.8 |
| 2 | 4 | 3.4 | 0.6 | 1.2 |
| 3 | 5 | 4.0 | 1.0 | 3.0 |
| 4 | 4 | 4.6 | −0.6 | −2.4 |
| 5 | 5 | 5.2 | −0.2 | −1.0 |

Both $\sum\hat u=0$ and $\sum x\hat u=0$ ✓. $SST=6$, $SSE=3.6$, $SSR=2.4$, so $R^2=3.6/6=0.60$: 60% of the variation of $y$ is explained by $x$.

## Common Mistakes

- Thinking a low $R^2$ makes OLS biased or useless; it only says that much variation remains in $u$.
- Reading a high $R^2$ as proof of causality.
- Confusing residuals (computed) with errors (unobservable).

## When It's Used

These algebraic facts hold for *every* OLS fit and are used to check software output and to interpret fit: residuals average zero, residuals are uncorrelated with the regressor, the line passes through the means, and $SST = SSE + SSR$ gives $R^2$ — the share of variation in, say, CEO salaries explained by firm performance.

**Exam tip:** a low $R^2$ does not make OLS biased or useless; it only says much variation is left in $u$. Positive residual = the model under-predicts.

## R Code

```r
set.seed(7)
roe <- runif(100, 0, 40)
salary <- 900 + 18 * roe + rnorm(100, 0, 350)
fit <- lm(salary ~ roe)
u <- resid(fit); yhat <- fitted(fit)

c(sum_resid = sum(u), cov_x_resid = cov(roe, u))           # both 0 (up to rounding)
predict(fit, data.frame(roe = mean(roe))) - mean(salary)   # line through (x-bar, y-bar)

SST <- sum((salary - mean(salary))^2)
SSE <- sum((yhat - mean(salary))^2)
SSR <- sum(u^2)
c(SST = SST, SSE_plus_SSR = SSE + SSR, R2 = SSE / SST, R2_lm = summary(fit)$r.squared)
```

## Python Code

```python
import numpy as np
import statsmodels.api as sm

rng = np.random.default_rng(7)
roe = rng.uniform(0, 40, 100)
salary = 900 + 18 * roe + rng.normal(0, 350, 100)
fit = sm.OLS(salary, sm.add_constant(roe)).fit()
u, yhat = fit.resid, fit.fittedvalues

print("sum resid:", u.sum().round(8), " cov(x, u):", np.cov(roe, u)[0, 1].round(8))
print("through means:", fit.params[0] + fit.params[1] * roe.mean() - salary.mean())
SST = np.sum((salary - salary.mean()) ** 2)
SSE = np.sum((yhat - salary.mean()) ** 2)
SSR = np.sum(u**2)
print(SST, SSE + SSR, "R2:", SSE / SST, fit.rsquared)
```

## Practice Questions

*✎ new question added for this site (worked solution below)*

- ✎ A regression has $SST=100$ and $SSR=36$. Find $SSE$ and $R^2$.
- ✎ A regression has $R^2=0.25$ and $SST=80$. Find $SSE$ and $SSR$.
- ✎ A simple regression has $r_{xy}=-0.8$. What is $R^2$?

## Solutions

*✎ solution written for this site*

- ✎ Q1: $SSE=100-36=64$; $R^2=0.64$.
- ✎ Q2: $SSE=0.25\cdot80=20$; $SSR=80-20=60$.
- ✎ Q3: In simple regression $R^2=r_{xy}^2=0.64$ (the sign of the correlation does not matter).
