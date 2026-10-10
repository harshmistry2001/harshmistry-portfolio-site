# Deriving the Ordinary Least Squares Estimates

> Course part: Stats 3

## Overview

The parameters $\beta_0$ and $\beta_1$ are unknown population quantities. **Ordinary least squares (OLS)** estimates them from a sample by choosing the line that fits the data best in the sense of the smallest sum of squared vertical distances. This page shows where the formulas come from, using two equivalent routes.

## Concept

### Route 1: minimise the squared residuals

For estimates $\hat\beta_0,\hat\beta_1$, the **fitted value** is $\hat y_i=\hat\beta_0+\hat\beta_1x_i$ and the **residual** is $\hat u_i=y_i-\hat y_i$. OLS solves
$$\min_{\hat\beta_0,\hat\beta_1}\ \sum_{i=1}^n\hat u_i^2=\sum_{i=1}^n(y_i-\hat\beta_0-\hat\beta_1x_i)^2 .$$
Setting the derivatives with respect to $\hat\beta_0$ and $\hat\beta_1$ to zero gives the **normal equations**
$$\sum_i(y_i-\hat\beta_0-\hat\beta_1x_i)=0,\qquad \sum_ix_i(y_i-\hat\beta_0-\hat\beta_1x_i)=0 .$$

### Route 2: method of moments

The model assumptions $E(u)=0$ and $E(xu)=0$ (a consequence of $E(u\mid x)=0$) are replaced by their sample analogues
$$\frac1n\sum\hat u_i=0,\qquad\frac1n\sum x_i\hat u_i=0,$$
which are exactly the normal equations: both routes give the same estimator. See also [ordinary least squares](https://en.wikipedia.org/wiki/Ordinary_least_squares).

### Solution

$$\hat\beta_1=\frac{\sum_{i=1}^n(x_i-\bar x)(y_i-\bar y)}{\sum_{i=1}^n(x_i-\bar x)^2},\qquad\hat\beta_0=\bar y-\hat\beta_1\bar x .$$
The slope requires sample variation in $x$ (the denominator must be nonzero). The resulting **sample regression function** is $\hat y=\hat\beta_0+\hat\beta_1x$, and it always passes through $(\bar x,\bar y)$.

## Worked Example

Data: $x=2,4,6$ and $y=3,7,8$.

$\bar x=4$, $\bar y=6$. $\sum(x_i-\bar x)(y_i-\bar y)=(-2)(-3)+0\cdot1+2\cdot2=10$; $\sum(x_i-\bar x)^2=4+0+4=8$.
$$\hat\beta_1=\frac{10}{8}=1.25,\qquad\hat\beta_0=6-1.25\cdot4=1 .$$
The fitted line is $\hat y=1+1.25x$ with fitted values $3.5,\,6,\,8.5$ and residuals $-0.5,\,1,\,-0.5$, which sum to zero.

## Common Mistakes

- Dividing by the wrong quantity: the denominator is the variation of $x$, not of $y$.
- Forgetting the intercept formula $\hat\beta_0=\bar y-\hat\beta_1\bar x$.
- Confusing the *residual* $\hat u_i$ (computed from data) with the *error* $u_i$ (unobservable).

## When It's Used

OLS is the default estimator in economics, finance and business analytics because it has closed-form estimates and clear properties. It can be derived either by minimising the sum of squared residuals or by the method of moments using $E(u) = 0$ and $E(xu) = 0$ — both give the same formulas.

**Exam tip:** $\hat\beta_1 = \frac{\sum(x_i - \bar x)(y_i - \bar y)}{\sum(x_i - \bar x)^2}$, $\hat\beta_0 = \bar y - \hat\beta_1\bar x$. Be able to compute them from a small table by hand.

## R Code

```r
set.seed(6)
x <- round(runif(15, 8, 18))                      # education
y <- round(1 + 0.55 * x + rnorm(15, 0, 1.5), 2)   # hourly wage

b1 <- sum((x - mean(x)) * (y - mean(y))) / sum((x - mean(x))^2)
b0 <- mean(y) - b1 * mean(x)
c(b0 = b0, b1 = b1)
coef(lm(y ~ x))

# Method-of-moments conditions hold for the OLS residuals
u_hat <- y - b0 - b1 * x
c(mean_u = mean(u_hat), mean_xu = mean(x * u_hat))

# Direct numerical minimisation of the SSR gives the same answer
optim(c(0, 0), function(b) sum((y - b[1] - b[2] * x)^2))$par
```

## Python Code

```python
import numpy as np
from scipy.optimize import minimize

rng = np.random.default_rng(6)
x = np.round(rng.uniform(8, 18, 15))
y = np.round(1 + 0.55 * x + rng.normal(0, 1.5, 15), 2)

b1 = np.sum((x - x.mean()) * (y - y.mean())) / np.sum((x - x.mean()) ** 2)
b0 = y.mean() - b1 * x.mean()
print("by formula:", b0, b1)
print("np.polyfit:", np.polyfit(x, y, 1)[::-1])

u = y - b0 - b1 * x
print("moment conditions:", u.mean().round(12), (x * u).mean().round(12))
print("min SSR:", minimize(lambda b: np.sum((y - b[0] - b[1] * x) ** 2), [0, 0]).x)
```

## Practice Questions

*✎ new question added for this site (worked solution below)*

- ✎ Compute the OLS line for $x=1,2,3,4$ and $y=2,3,5,6$.
- ✎ Show that the OLS line passes through $(\bar x,\bar y)$.
- ✎ What happens to the OLS slope formula if all $x_i$ are identical?

## Solutions

*✎ solution written for this site*

- ✎ Q1: $\bar x=2.5$, $\bar y=4$. $\sum(x-\bar x)(y-\bar y)=(-1.5)(-2)+(-0.5)(-1)+(0.5)(1)+(1.5)(2)=3+0.5+0.5+3=7$; $\sum(x-\bar x)^2=5$. So $\hat\beta_1=1.4$ and $\hat\beta_0=4-1.4\cdot2.5=0.5$: $\hat y=0.5+1.4x$.
- ✎ Q2: Evaluate the line at $\bar x$: $\hat\beta_0+\hat\beta_1\bar x=(\bar y-\hat\beta_1\bar x)+\hat\beta_1\bar x=\bar y$.
- ✎ Q3: Then $x_i=\bar x$ for all $i$ and the denominator $\sum(x_i-\bar x)^2$ is zero; the slope is undefined. Without variation in $x$ one cannot learn how $y$ changes with $x$.
