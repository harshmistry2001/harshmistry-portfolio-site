# The Expected Value of the OLS Estimators

> Course part: Stats 3

## Overview

When is multiple regression OLS **right on average**? The answer is four assumptions. This page states them and focuses on the most important failure: leaving out a relevant variable (**omitted variable bias**), which is the most common criticism of empirical studies.

## Concept

### Assumptions MLR.1–MLR.4

1. **Linear in parameters:** $y=\beta_0+\beta_1x_1+\dots+\beta_kx_k+u$.
2. **Random sampling** of the $n$ observations.
3. **No perfect collinearity:** no regressor is constant and none is an exact linear combination of the others (for example $x_2=2x_1$, or a full set of dummies plus the intercept).
4. **Zero conditional mean:** $E(u\mid x_1,\dots,x_k)=0$.

Under MLR.1–MLR.4, the OLS estimators are unbiased: $E(\hat\beta_j)=\beta_j$ for all $j$.

### Irrelevant variables

Including a variable that has coefficient 0 in the population does **not** bias the other estimates, but it can increase their variance.

### Omitted variable bias

Suppose the true model is $y=\beta_0+\beta_1x_1+\beta_2x_2+u$ but we regress $y$ on $x_1$ only. The simple regression slope $\tilde\beta_1$ satisfies
$$E(\tilde\beta_1)=\beta_1+\beta_2\,\tilde\delta_1,$$
where $\tilde\delta_1$ is the slope of $x_2$ on $x_1$. The bias $\beta_2\tilde\delta_1$ vanishes only if $x_2$ has no effect ($\beta_2=0$) or is uncorrelated with $x_1$. See [omitted-variable bias](https://en.wikipedia.org/wiki/Omitted-variable_bias). The direction:

| | $Corr(x_1,x_2)>0$ | $Corr(x_1,x_2)<0$ |
|---|---|---|
| $\beta_2>0$ | positive bias | negative bias |
| $\beta_2<0$ | negative bias | positive bias |

## Worked Example

*Returns to education.* True model: $\ln(wage)=\beta_0+\beta_1\,educ+\beta_2\,abil+u$ with $\beta_1=0.08$, $\beta_2=0.02$. Ability is positively correlated with education ($\tilde\delta_1=0.5$). A regression that omits ability gives on average $0.08+0.02\cdot0.5=0.09$: the return to education is **overstated** by about one percentage point (positive bias). If ability were not available, the estimate is best viewed as an upper bound.

## Common Mistakes

- Thinking that a larger sample reduces omitted variable bias; it does not.
- Judging the sign of the bias without considering both $\beta_2$ and the correlation.
- Including a variable that is a consequence of $x_1$ ("bad control") in order to "reduce bias".
- Estimating a model with perfectly collinear dummies (the "dummy variable trap"): software returns `NA` or an error.

## When It's Used

Omitted variable bias is the most common criticism of any regression study: returns to education without controlling for ability, effects of police on crime without controlling for city characteristics. Knowing the *direction* of the bias lets you say whether an estimate is an upper or lower bound.

**Exam tip:** $E(\tilde\beta_1) = \beta_1 + \beta_2\tilde\delta_1$. Bias is positive if $\beta_2$ and $Corr(x_1, x_2)$ have the same sign, negative otherwise. Including an irrelevant variable causes no bias. Perfect collinearity makes OLS impossible (R reports `NA`).

## R Code

```r
set.seed(12)
n <- 1000
ability <- rnorm(n)
educ <- 12 + 1.5 * ability + rnorm(n, 0, 2)          # corr(educ, ability) > 0
lwage <- 0.5 + 0.08 * educ + 0.10 * ability + rnorm(n, 0, 0.3)   # beta_ability > 0

b_short <- replicate(2000, {
  e <- rnorm(n, 0, 0.3)
  coef(lm(0.5 + 0.08 * educ + 0.10 * ability + e ~ educ))[2]
})
c(true = 0.08, mean_short = mean(b_short))          # upward bias: + * + = +

# Predicted bias beta_2 * delta_1
0.10 * coef(lm(ability ~ educ))[2]

# Irrelevant regressor: no bias
coef(lm(lwage ~ educ + ability + rnorm(n)))[2]

# Perfect collinearity: coefficient cannot be estimated
educ_months <- 12 * educ
coef(lm(lwage ~ educ + educ_months + ability))
```

## Python Code

```python
import numpy as np
import statsmodels.api as sm

rng = np.random.default_rng(12)
n = 1000
ability = rng.normal(size=n)
educ = 12 + 1.5 * ability + rng.normal(0, 2, n)
X_short = sm.add_constant(educ)

Y = 0.5 + 0.08 * educ + 0.10 * ability + rng.normal(0, 0.3, (2000, n))
b_short = np.linalg.lstsq(X_short, Y.T, rcond=None)[0][1]
delta = sm.OLS(ability, X_short).fit().params[1]
print("true 0.08 | mean short:", b_short.mean(), "| predicted:", 0.08 + 0.10 * delta)

X_full = sm.add_constant(np.column_stack([educ, ability, rng.normal(size=n)]))
print("with irrelevant regressor:", sm.OLS(Y[0], X_full).fit().params[1])

X_coll = np.column_stack([np.ones(n), educ, 12 * educ])
print("rank of collinear design:", np.linalg.matrix_rank(X_coll), "of", X_coll.shape[1])
```

## Practice Questions

*✎ new question added for this site (worked solution below)*

- ✎ In a regression of test scores on class size, the omitted variable "family income" lowers class size (richer districts have smaller classes, $Corr<0$) and raises scores ($\beta_2>0$). What is the direction of the bias in the class-size coefficient?
- ✎ A model contains both $x_1$ and $x_2=3x_1$. What goes wrong?

## Solutions

*✎ solution written for this site*

- ✎ Q1: $\beta_2>0$ and $Corr(x_1,x_2)<0$ give a **negative bias**: the class-size coefficient is too small (more negative), so the benefit of smaller classes is overstated.
- ✎ Q2: This violates MLR.3 (perfect collinearity): the effect of $x_1$ cannot be separated from that of $x_2$; there is no unique OLS solution.
