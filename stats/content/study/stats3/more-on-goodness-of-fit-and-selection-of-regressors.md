# More on Goodness-of-Fit and Selection of Regressors

> Course part: Stats 3

## Overview

$R^2$ tells how much of the variation in $y$ the model explains, but it has two weaknesses for choosing a model: it *always* rises when you add a variable (even a useless one), and a low value is often misread as "the regression is bad". This page explains the adjusted $R^2$ and how to use it (and not use it).

## Concept

### What a low $R^2$ means

A small $R^2$ only means that the error variance is large relative to the total variance of $y$. It does **not** mean that OLS is biased, that the coefficients are meaningless, or that the estimated ceteris paribus effects are uninformative. In micro data (wages, individual behaviour), values of 0.1–0.3 are common.

### Adjusted $R^2$

[Adjusted R-squared](https://en.wikipedia.org/wiki/Coefficient_of_determination) penalises extra regressors by using degrees of freedom:
$$\overline R^2=1-\frac{SSR/(n-k-1)}{SST/(n-1)} .$$
Properties: it can fall when a variable is added; it can even be negative; and $\overline R^2$ increases **if and only if** the added variable has $|t|>1$.

### Use in model selection

- Compare **non-nested** models (neither contains the other, e.g. different sets or functional forms of regressors) with the same dependent variable by choosing the larger $\overline R^2$.
- **Do not** compare $R^2$ or $\overline R^2$ of a model with $y$ and one with $\ln y$: they explain different quantities.
- Do not add variables solely to push up $R^2$. Control variables should be included for a reason (to remove omitted variable bias), and variables that are themselves the outcome of the variable of interest should be left out.

## Worked Example

$n=50$, $k=2$ regressors, $R^2=0.40$: $\overline R^2=1-0.60\cdot\frac{49}{47}=0.375$. A useless third regressor ($|t|<1$) raises $R^2$ to $0.405$ but $\overline R^2=1-0.595\cdot\frac{49}{46}=0.366$ falls. A regressor with $|t|>1$ would raise $\overline R^2$.

## Common Mistakes

- Dropping a statistically sound regression because $R^2$ is small.
- Using $R^2$ to select among models with different dependent variables.
- Treating higher $R^2$ as evidence of causality.

## When It's Used

Model selection in practice — which controls to include, which functional form to use — relies on adjusted $R^2$ and information criteria rather than raw $R^2$, which always rises when variables are added. A low $R^2$ is common in cross-sectional microdata and does not invalidate causal estimates.

**Exam tip:** $\bar R^2 = 1 - \frac{SSR/(n-k-1)}{SST/(n-1)}$ rises when a variable is added **iff** its $|t| > 1$. Use $\bar R^2$ to compare non-nested models with the same dependent variable — not $y$ vs. $\log y$.

## R Code

```r
set.seed(25)
n <- 150
x1 <- rnorm(n); x2 <- rnorm(n); noise <- rnorm(n)
y <- 1 + 0.8 * x1 + 0.3 * x2 + rnorm(n)

adj <- function(m) {
  n <- nobs(m); k <- length(coef(m)) - 1
  SSR <- sum(resid(m)^2); SST <- sum((model.response(model.frame(m)) - mean(model.response(model.frame(m))))^2)
  1 - (SSR / (n - k - 1)) / (SST / (n - 1))
}
m1 <- lm(y ~ x1 + x2); m2 <- lm(y ~ x1 + x2 + noise)
rbind(R2 = c(summary(m1)$r.squared, summary(m2)$r.squared),
      adjR2 = c(adj(m1), adj(m2)),
      adjR2_lm = c(summary(m1)$adj.r.squared, summary(m2)$adj.r.squared))
abs(coef(summary(m2))["noise", "t value"]) > 1       # predicts whether adjusted R2 rose

# Non-nested comparison: log(x) vs quadratic in x (same y)
z <- runif(n, 1, 10); w <- 2 + 1.5 * log(z) + rnorm(n, 0, 0.4)
c(log_model = summary(lm(w ~ log(z)))$adj.r.squared,
  quad_model = summary(lm(w ~ z + I(z^2)))$adj.r.squared)
```

## Python Code

```python
import numpy as np
import statsmodels.api as sm

rng = np.random.default_rng(25)
n = 150
x1, x2, noise = rng.normal(size=(3, n))
y = 1 + 0.8 * x1 + 0.3 * x2 + rng.normal(size=n)

m1 = sm.OLS(y, sm.add_constant(np.column_stack([x1, x2]))).fit()
m2 = sm.OLS(y, sm.add_constant(np.column_stack([x1, x2, noise]))).fit()
adj = lambda m: 1 - (m.ssr / m.df_resid) / (m.centered_tss / (m.nobs - 1))
print("R2:   ", m1.rsquared, m2.rsquared)
print("adjR2:", adj(m1), adj(m2), "| statsmodels:", m1.rsquared_adj, m2.rsquared_adj)
print("|t_noise| > 1:", abs(m2.tvalues[3]) > 1)

z = rng.uniform(1, 10, n); w = 2 + 1.5 * np.log(z) + rng.normal(0, 0.4, n)
print("log:", sm.OLS(w, sm.add_constant(np.log(z))).fit().rsquared_adj,
      " quad:", sm.OLS(w, sm.add_constant(np.column_stack([z, z**2]))).fit().rsquared_adj)
```

## Practice Questions

*✎ new question added for this site (worked solution below)*

- ✎ Compute $\overline R^2$ for $n=30$, $k=4$, $R^2=0.50$.
- ✎ Adding a variable raises $R^2$ from 0.30 to 0.31 and its t statistic is 0.8. Will $\overline R^2$ rise or fall?
- ✎ Can you compare the $R^2$ of $wage=\dots$ with that of $\ln(wage)=\dots$ to decide which functional form is better? Why not?

## Solutions

*✎ solution written for this site*

- ✎ Q1: $\overline R^2=1-0.5\cdot\frac{29}{25}=1-0.58=0.42$.
- ✎ Q2: $|t|=0.8<1$, so $\overline R^2$ falls even though $R^2$ rises.
- ✎ Q3: No: the two $R^2$ measure the share of variation in different variables ($wage$ versus $\ln wage$), so they are not comparable.
