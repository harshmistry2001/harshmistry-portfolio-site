# Efficiency of OLS: The Gauss-Markov Theorem

> Course part: Stats 3

## Overview

Why do we use OLS rather than some other way of fitting a line? The **Gauss–Markov theorem** gives the answer: under a small set of assumptions, OLS has the smallest variance among a broad class of sensible estimators. It is the theoretical justification for OLS as the default method.

## Concept

### The Gauss–Markov assumptions

MLR.1 to MLR.5: linearity in parameters, random sampling, no perfect collinearity, zero conditional mean $E(u\mid x_1,\dots,x_k)=0$ and homoskedasticity $Var(u\mid x_1,\dots,x_k)=\sigma^2$.

### The theorem

Under these assumptions, the OLS estimators $\hat\beta_0,\dots,\hat\beta_k$ are the **best linear unbiased estimators** (BLUE) of $\beta_0,\dots,\beta_k$. See the [Gauss–Markov theorem](https://en.wikipedia.org/wiki/Gauss%E2%80%93Markov_theorem).

- **Linear** means that the estimator is a linear function of the $y_i$: $\tilde\beta_j=\sum_iw_{ij}y_i$.
- **Unbiased**: $E(\tilde\beta_j)=\beta_j$.
- **Best**: smallest variance among all linear unbiased estimators.

### What if an assumption fails?

- If homoskedasticity (MLR.5) fails, OLS remains unbiased but is **no longer BLUE** (a weighted estimator can be more precise), and the usual standard errors are wrong.
- If MLR.4 fails, OLS is biased and the theorem does not apply at all.
- The theorem says nothing about nonlinear or biased estimators (which can have smaller mean squared error in some situations).

## Worked Example

Simple regression with $x=1,\dots,5$ ($SST_x=10$). OLS has $Var(\hat\beta_1)=\sigma^2/10=0.100\,\sigma^2$.

An alternative linear unbiased estimator uses only the endpoints: $\tilde\beta_1=\frac{y_5-y_1}{x_5-x_1}=\frac{y_5-y_1}{4}$. It is unbiased, but $Var(\tilde\beta_1)=\frac{2\sigma^2}{16}=0.125\,\sigma^2>0.100\,\sigma^2$. As the theorem promises, OLS is better because it uses all the observations.

## Common Mistakes

- Reading "BLUE" as "the best possible estimator": it is the best only among linear unbiased ones.
- Believing that normality of errors is needed (it is not; it is needed for exact t and F tests).
- Using the theorem to claim OLS is good when the zero conditional mean assumption is doubtful.

## When It's Used

The Gauss-Markov theorem is the justification for using OLS by default: among all *linear unbiased* estimators it has the smallest variance (BLUE) under MLR.1-MLR.5. When homoskedasticity fails (e.g. spending variance growing with income), OLS is still unbiased but no longer best, and the usual standard errors are wrong.

**Exam tip:** know the five assumptions by name and which one each property needs: unbiasedness needs MLR.1-4, the variance formula and BLUE need MLR.5 as well.

## R Code

```r
set.seed(14)
n <- 30
x <- sort(runif(n, 0, 10))
sims <- replicate(10000, {
  y <- 2 + 0.7 * x + rnorm(n, 0, 2)
  c(ols = unname(coef(lm(y ~ x))[2]),
    endpoints = (y[n] - y[1]) / (x[n] - x[1]))       # another linear unbiased estimator
})
rbind(mean = rowMeans(sims), variance = apply(sims, 1, var))   # both unbiased, OLS smaller variance

# Heteroskedasticity: OLS still unbiased, but the usual se is off
library(lmtest)
income <- runif(500, 10, 100)
spend <- 5 + 0.3 * income + rnorm(500, 0, 0.05 * income)
bptest(lm(spend ~ income))                            # Breusch-Pagan test detects it
```

## Python Code

```python
import numpy as np
import statsmodels.api as sm
from statsmodels.stats.diagnostic import het_breuschpagan

rng = np.random.default_rng(14)
n = 30
x = np.sort(rng.uniform(0, 10, n))
X = sm.add_constant(x)
Y = 2 + 0.7 * x + rng.normal(0, 2, (10_000, n))
ols = np.linalg.lstsq(X, Y.T, rcond=None)[0][1]
endpoints = (Y[:, -1] - Y[:, 0]) / (x[-1] - x[0])
print("OLS:       mean", ols.mean().round(4), " var", ols.var().round(5))
print("endpoints: mean", endpoints.mean().round(4), " var", endpoints.var().round(5))

income = rng.uniform(10, 100, 500)
spend = 5 + 0.3 * income + rng.normal(0, 0.05 * income)
fit = sm.OLS(spend, sm.add_constant(income)).fit()
print("Breusch-Pagan p-value:", het_breuschpagan(fit.resid, fit.model.exog)[1])
```

## Practice Questions

*✎ new question added for this site (worked solution below)*

- ✎ List the Gauss–Markov assumptions and say which one is needed for unbiasedness and which additionally for BLUE.
- ✎ A regression has error variance increasing with income. Which properties of OLS survive and which do not?

## Solutions

*✎ solution written for this site*

- ✎ Q1: MLR.1 linearity, MLR.2 random sampling, MLR.3 no perfect collinearity, MLR.4 zero conditional mean, MLR.5 homoskedasticity. Unbiasedness needs MLR.1–MLR.4; BLUE (and the variance formula) also needs MLR.5.
- ✎ Q2: Heteroskedasticity violates MLR.5. OLS remains unbiased and consistent, but it is no longer BLUE and the usual standard errors, t and F statistics are invalid; robust standard errors or a weighted estimator should be used.
