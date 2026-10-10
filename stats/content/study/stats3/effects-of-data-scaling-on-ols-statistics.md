# Effects of Data Scaling on OLS Statistics

> Course part: Stats 3

## Overview

Whether wages are in dollars or thousands of dollars, or pollution in parts per million or percent, the economics is the same. This page shows exactly which numbers change when you rescale the variables, and which do not. It also introduces **standardised (beta) coefficients**, which make effects of differently-scaled variables comparable.

## Concept

### Rescaling variables

| Change | Effect on coefficients and standard errors | Unchanged |
|---|---|---|
| $y^*=c\,y$ (dependent variable multiplied by $c$) | **all** coefficients (including the intercept) and standard errors are multiplied by $c$ | $t$ statistics, $p$-values, $R^2$ |
| $x_j^*=x_j/c$ (regressor divided by $c$) | only $\hat\beta_j$ and $se(\hat\beta_j)$ are multiplied by $c$ | $t$ statistics, $R^2$, all other coefficients and fitted values |

Confidence intervals scale in the same way. The *economic content* never changes.

### Beta coefficients

To compare which regressor has the largest effect irrespective of units, standardise every variable by subtracting its mean and dividing by its standard deviation (z-scores):
$$z_y=\hat b_1z_1+\hat b_2z_2+\dots+\hat b_kz_k+\text{error},\qquad \hat b_j=\frac{\hat\sigma_j}{\hat\sigma_y}\,\hat\beta_j .$$
$\hat b_j$ is the change in $y$, in standard deviations of $y$, when $x_j$ rises by one standard deviation (holding the others fixed).

## Worked Example

Birth weight in ounces: $\widehat{bwght}=116.97-0.4634\,cigs+0.0927\,faminc$.

- **Dependent variable in pounds** ($y^*=y/16$): $\widehat{bwght}_{lbs}=7.31-0.0290\,cigs+0.0058\,faminc$; the standard errors are divided by 16 too, so every t statistic is as before.
- **Regressor in packs** (1 pack = 20 cigarettes, $x^*=cigs/20$, i.e. $c=20$): the slope becomes $-0.4634\cdot20=-9.27$ ounces per pack per day; the t statistic is unchanged.

Beta coefficient: if $\hat\beta_j=0.5$, $\hat\sigma_j=4$ and $\hat\sigma_y=10$, then $\hat b_j=\frac{4}{10}\cdot0.5=0.2$: one standard deviation more of $x_j$ is associated with 0.2 standard deviations more of $y$.

## Common Mistakes

- Thinking that a variable becomes "more significant" by changing its units.
- Comparing raw coefficients of variables measured in different units to judge importance (use beta coefficients or meaningful ranges instead).
- Mixing up the direction: dividing $x$ by $c$ *multiplies* its coefficient by $c$.

## When It's Used

Analysts routinely rescale variables — dollars to thousands, percentages to shares — to make coefficients readable. Scaling changes coefficients and standard errors in predictable ways but never t-statistics, p-values or $R^2$. Standardised (beta) coefficients express effects in standard deviations so that regressors in different units can be compared, e.g. which pollution or school variable matters most.

**Exam tip:** dividing $x_j$ by $c$ multiplies $\hat\beta_j$ and its se by $c$; multiplying $y$ by $c$ multiplies *all* coefficients and se's by $c$. Beta coefficient: $\hat b_j = (\hat\sigma_j/\hat\sigma_y)\hat\beta_j$.

## R Code

```r
set.seed(23)
n <- 506
nox <- runif(n, 4, 9); crime <- rexp(n, 1/4); rooms <- rnorm(n, 6.3, 0.7)
price <- 20000 - 2500 * nox - 300 * crime + 8000 * rooms + rnorm(n, 0, 6000)

m_dollars <- lm(price ~ nox + crime + rooms)
m_thousand <- lm(I(price / 1000) ~ nox + crime + rooms)
rbind(coef(m_dollars) / 1000, coef(m_thousand))                     # same after rescaling
rbind(coef(summary(m_dollars))[, "t value"], coef(summary(m_thousand))[, "t value"])

# Beta (standardised) coefficients
m_std <- lm(scale(price) ~ scale(nox) + scale(crime) + scale(rooms))
coef(m_std)[-1]
coef(m_dollars)[-1] * c(sd(nox), sd(crime), sd(rooms)) / sd(price)  # same via formula
```

## Python Code

```python
import numpy as np
import pandas as pd
from statsmodels.formula.api import ols

rng = np.random.default_rng(23)
n = 506
df = pd.DataFrame({"nox": rng.uniform(4, 9, n), "crime": rng.exponential(4, n),
                   "rooms": rng.normal(6.3, 0.7, n)})
df["price"] = 20000 - 2500 * df.nox - 300 * df.crime + 8000 * df.rooms + rng.normal(0, 6000, n)

m1 = ols("price ~ nox + crime + rooms", df).fit()
m2 = ols("I(price / 1000) ~ nox + crime + rooms", df).fit()
print(pd.DataFrame({"dollars/1000": m1.params / 1000, "thousands": m2.params}))
print(pd.DataFrame({"t dollars": m1.tvalues, "t thousands": m2.tvalues}))

z = (df - df.mean()) / df.std()
print(ols("price ~ nox + crime + rooms", z).fit().params[1:])
```

## Practice Questions

*✎ new question added for this site (worked solution below)*

- ✎ In $\widehat{salary}=800+18\,roe$ (salary in thousand dollars, $se(\hat\beta_{roe})=6$), express the equation in dollars. What happens to the t statistic?
- ✎ Two regressors have $\hat\beta_1=2$, $\hat\sigma_1=1$ and $\hat\beta_2=0.5$, $\hat\sigma_2=8$, and $\hat\sigma_y=5$. Compute the beta coefficients and say which regressor matters more.

## Solutions

*✎ solution written for this site*

- ✎ Q1: In dollars ($y^*=1000\,y$): $\widehat{salary}=800{,}000+18{,}000\,roe$; the standard error becomes $6{,}000$. The t statistic is $18/6=18{,}000/6{,}000=3$: unchanged.
- ✎ Q2: $\hat b_1=\frac15\cdot2=0.4$; $\hat b_2=\frac85\cdot0.5=0.8$. A one-standard-deviation change in regressor 2 has twice the effect of one in regressor 1, even though its raw coefficient is smaller.
