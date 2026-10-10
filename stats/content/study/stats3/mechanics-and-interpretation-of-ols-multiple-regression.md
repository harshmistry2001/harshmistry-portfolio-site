# Mechanics and Interpretation of OLS (Multiple Regression)

> Course part: Stats 3

## Overview

With several regressors, OLS still chooses the coefficients that minimise the sum of squared residuals. The key question is how to **read** a coefficient: as the effect of its variable *holding the other included variables fixed*. This page also explains how the multiple regression coefficient relates to the simple regression one.

## Concept

### Estimation and interpretation

The OLS estimates $\hat\beta_0,\dots,\hat\beta_k$ minimise $\sum_i(y_i-\hat\beta_0-\hat\beta_1x_{i1}-\dots-\hat\beta_kx_{ik})^2$. The fitted equation is
$$\hat y=\hat\beta_0+\hat\beta_1x_1+\dots+\hat\beta_kx_k ,\qquad \Delta\hat y=\hat\beta_j\,\Delta x_j\ \text{(other } x\text{ fixed)}.$$
The properties of the simple case carry over: residuals sum to zero, are uncorrelated with every regressor, and $R^2=1-SSR/SST$. $R^2$ never decreases when a regressor is added.

### "Partialling out" (Frisch–Waugh–Lovell)

The coefficient on $x_1$ can be obtained in two steps:

1. Regress $x_1$ on all other regressors; keep the residuals $\hat r_{i1}$ (the part of $x_1$ that is not explained by the other variables).
2. Then
$$\hat\beta_1=\frac{\sum_i\hat r_{i1}\,y_i}{\sum_i\hat r_{i1}^2}.$$
So $\hat\beta_1$ measures the relationship between $y$ and the variation in $x_1$ that is *unrelated* to the other regressors. See [partial regression](https://en.wikipedia.org/wiki/Frisch%E2%80%93Waugh%E2%80%93Lovell_theorem).

### Simple versus multiple regression

Let $\tilde\beta_1$ be the slope from the simple regression of $y$ on $x_1$ alone, and $\tilde\delta_1$ the slope from regressing $x_2$ on $x_1$. For two regressors,
$$\tilde\beta_1=\hat\beta_1+\hat\beta_2\,\tilde\delta_1 .$$
The two estimates coincide only if $\hat\beta_2=0$ (the second variable has no partial effect) or $\tilde\delta_1=0$ ($x_1$ and $x_2$ are uncorrelated in the sample).

## Worked Example

Multiple regression: $\widehat{wage}=-3+0.60\,educ+0.05\,exper$. People with more education have on average less experience: regressing $exper$ on $educ$ gives $\tilde\delta_1=-0.8$. Then the simple regression slope is
$$\tilde\beta_1=0.60+0.05\cdot(-0.8)=0.56 .$$
It is slightly lower than 0.60 because part of education's raw association with wages is offset by the lower experience of the better educated.

## Common Mistakes

- Saying that $\hat\beta_j$ is the effect of $x_j$ "in general": it is the effect with the *other included* variables fixed.
- Comparing coefficients from models with different sets of regressors without considering the link above.
- Forgetting that, at fixed $x_1$, changing $x_2$ is not possible if $x_2$ is a function of $x_1$ (for example in quadratic models).

## When It's Used

Each multiple-regression coefficient is a partial effect: the change in predicted college GPA for one more SAT point *holding high-school GPA fixed*. The Frisch-Waugh-Lovell ("partialling out") result shows how: regress $x_1$ on the other regressors, keep the residual (the part of $x_1$ not explained by them), and regress $y$ on that residual.

**Exam tip:** simple and multiple estimates are linked by $\tilde\beta_1 = \hat\beta_1 + \hat\beta_2\tilde\delta_1$, where $\tilde\delta_1$ is the slope from regressing $x_2$ on $x_1$. They coincide only if $\hat\beta_2 = 0$ or $x_1, x_2$ are uncorrelated in the sample.

## R Code

```r
set.seed(11)
n <- 400
hsgpa <- rnorm(n, 3.2, 0.4)
act <- round(15 + 3 * hsgpa + rnorm(n, 0, 3))
colgpa <- 1.3 + 0.45 * hsgpa + 0.01 * act + rnorm(n, 0, 0.3)

full <- lm(colgpa ~ hsgpa + act)
coef(full)

# Partialling out: residualise hsgpa on act, then regress colgpa on the residual
r1 <- resid(lm(hsgpa ~ act))
c(FWL = sum(r1 * colgpa) / sum(r1^2), full = unname(coef(full)["hsgpa"]))

# Simple vs multiple: beta_tilde = beta_hat_1 + beta_hat_2 * delta_tilde
beta_tilde <- coef(lm(colgpa ~ hsgpa))["hsgpa"]
delta <- coef(lm(act ~ hsgpa))["hsgpa"]
c(simple = unname(beta_tilde), identity = unname(coef(full)["hsgpa"] + coef(full)["act"] * delta))
```

## Python Code

```python
import numpy as np
import statsmodels.api as sm

rng = np.random.default_rng(11)
n = 400
hsgpa = rng.normal(3.2, 0.4, n)
act = np.round(15 + 3 * hsgpa + rng.normal(0, 3, n))
colgpa = 1.3 + 0.45 * hsgpa + 0.01 * act + rng.normal(0, 0.3, n)

full = sm.OLS(colgpa, sm.add_constant(np.column_stack([hsgpa, act]))).fit()
print(full.params)

r1 = sm.OLS(hsgpa, sm.add_constant(act)).fit().resid
print("FWL:", np.sum(r1 * colgpa) / np.sum(r1**2), " full:", full.params[1])

beta_tilde = sm.OLS(colgpa, sm.add_constant(hsgpa)).fit().params[1]
delta = sm.OLS(act, sm.add_constant(hsgpa)).fit().params[1]
print("simple:", beta_tilde, " identity:", full.params[1] + full.params[2] * delta)
```

## Practice Questions

*✎ new question added for this site (worked solution below)*

- ✎ In $\widehat{colgpa}=1.4-0.01\,hsperc+0.0015\,sat$, interpret the coefficient on $sat$ and compute the predicted change in GPA for 100 more SAT points.
- ✎ The multiple regression slope on $x_1$ is $\hat\beta_1=2$ with $\hat\beta_2=3$ for $x_2$. Regressing $x_2$ on $x_1$ gives slope $0.5$. What is the slope of the simple regression of $y$ on $x_1$?
- ✎ Can the $R^2$ of a regression fall when a variable is added? Explain.

## Solutions

*✎ solution written for this site*

- ✎ Q1: Holding high-school percentile fixed, one more SAT point raises the predicted college GPA by 0.0015. For 100 points: $0.15$.
- ✎ Q2: $\tilde\beta_1=2+3\cdot0.5=3.5$.
- ✎ Q3: No. OLS minimises SSR; with an additional variable it could always set its coefficient to zero and reproduce the previous fit, so the minimal SSR cannot increase and $R^2$ cannot fall (adjusted $R^2$ can).
