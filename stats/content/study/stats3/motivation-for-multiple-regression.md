# Motivation for Multiple Regression

> Course part: Stats 3

## Overview

A simple regression of wages on education has a problem: many other factors (experience, ability, region) also affect wages and may be correlated with education. **Multiple regression** puts several explanatory variables into the model at once, so that the effect of each can be estimated *holding the others fixed*. It is the standard tool for approximating ceteris paribus effects from observational data.

## Concept

### The model

$$y=\beta_0+\beta_1x_1+\beta_2x_2+\dots+\beta_kx_k+u .$$
- $\beta_j$ is the change in $y$ when $x_j$ increases by one unit and the other included variables $x_l$ ($l\ne j$) are held fixed.
- Factors that are not included remain in $u$. The key assumption is still $E(u\mid x_1,\dots,x_k)=0$.

### Benefits

1. **Control for other factors explicitly:** observed confounders can be removed from the error term and thus no longer bias the estimate of interest.
2. **Better fit:** more variation in $y$ is explained, so the error variance $\sigma^2$ is smaller and estimates are more precise.
3. **Flexible functional forms**, for example quadratics: $wage=\beta_0+\beta_1exper+\beta_2exper^2+u$.

### Interpreting quadratic terms

With a squared term, $\beta_1$ alone is no longer "the effect of experience". The effect depends on the level of the variable:
$$\frac{\Delta wage}{\Delta exper}\approx\beta_1+2\beta_2\,exper .$$
If $\beta_2<0$ the returns diminish and the wage curve reaches a maximum at $exper^*=-\beta_1/(2\beta_2)$.

## Worked Example

Suppose $\widehat{wage}=3.7+0.30\,exper-0.006\,exper^2$.

- Effect of one more year at $exper=10$: $0.30-2\cdot0.006\cdot10=0.18$ dollars per hour.
- Effect at $exper=20$: $0.30-0.24=0.06$ dollars.
- Turning point: $exper^*=0.30/(2\cdot0.006)=25$ years; beyond it, further experience lowers predicted wages (an extrapolation to be treated with care).

## Common Mistakes

- Interpreting $\beta_1$ in a quadratic model as the effect of $x$ for all levels of $x$.
- Believing that adding variables always removes bias; only variables that are correlated with $x_1$ *and* affect $y$ matter for bias.
- Adding variables that are themselves outcomes of the variable of interest.

## When It's Used

Multiple regression lets you hold other observed factors fixed: the wage effect of education *for given experience*, the effect of class size on test scores *for given family income*, house prices *for given size and location*. It also allows flexible shapes such as quadratics (diminishing returns to experience).

**Exam tip:** in $wage = \beta_0 + \beta_1 exper + \beta_2 exper^2$ the effect of experience is $\beta_1 + 2\beta_2\,exper$ — no single coefficient is "the effect".

## R Code

```r
set.seed(10)
n <- 800
exper <- runif(n, 0, 40)
educ  <- round(pmin(20, pmax(8, 16 - 0.1 * exper + rnorm(n, 0, 2))))   # older cohorts: less educ
wage  <- 2 + 0.9 * educ + 0.35 * exper - 0.006 * exper^2 + rnorm(n, 0, 3)

coef(lm(wage ~ educ))["educ"]                                # biased: ignores experience
fit <- lm(wage ~ educ + exper + I(exper^2))
coef(fit)

# Marginal effect of experience at 5, 20 and 35 years
b <- coef(fit)
b["exper"] + 2 * b["I(exper^2)"] * c(5, 20, 35)
```

## Python Code

```python
import numpy as np
import pandas as pd
from statsmodels.formula.api import ols

rng = np.random.default_rng(10)
n = 800
exper = rng.uniform(0, 40, n)
educ = np.round(np.clip(16 - 0.1 * exper + rng.normal(0, 2, n), 8, 20))
wage = 2 + 0.9 * educ + 0.35 * exper - 0.006 * exper**2 + rng.normal(0, 3, n)
df = pd.DataFrame(dict(wage=wage, educ=educ, exper=exper))

print("simple:", ols("wage ~ educ", df).fit().params["educ"])
fit = ols("wage ~ educ + exper + I(exper**2)", df).fit()
print(fit.params)
b = fit.params
print("marginal effect of exper:", b["exper"] + 2 * b["I(exper ** 2)"] * np.array([5, 20, 35]))
```

## Practice Questions

*✎ new question added for this site (worked solution below)*

- ✎ In $\widehat{price}=20+8\,size-0.02\,size^2$ (size in 10 m²) compute the effect of one more unit of size at $size=50$ and the size at which the price is maximal.
- ✎ Why can a multiple regression of wages on education and experience give a different education coefficient than a simple regression of wages on education?

## Solutions

*✎ solution written for this site*

- ✎ Q1: Effect: $8-2\cdot0.02\cdot50=8-2=6$. Maximum at $size^*=8/(2\cdot0.02)=200$.
- ✎ Q2: Education and experience are related (more schooling often means fewer years of work experience), and experience affects wages. In the simple regression the effect of experience is hidden in $u$ and partly attributed to education; the multiple regression separates the two.
