# Testing Multiple Linear Restrictions: The F Test

> Course part: Stats 3

## Overview

The t test checks one coefficient. Often the question is about a **group** of variables: Do the performance statistics of baseball players matter for salary once experience is controlled for? Do several demographic controls matter at all? The **F test** tests several restrictions jointly, and it can detect groups of variables that are individually insignificant (because they are highly correlated) but jointly important.

## Concept

### Exclusion restrictions

In $y=\beta_0+\beta_1x_1+\dots+\beta_kx_k+u$ test whether the last $q$ variables have no partial effect:
$$H_0:\ \beta_{k-q+1}=\dots=\beta_k=0\quad\text{vs.}\quad H_1:\ H_0\text{ is false (at least one is non-zero).}$$

Estimate two models:

- **Unrestricted** model: all $k$ variables, with residual sum of squares $SSR_{ur}$.
- **Restricted** model: the $q$ variables dropped, with $SSR_r\ge SSR_{ur}$.

If dropping the variables raises the SSR a lot, they matter. The [F statistic](https://en.wikipedia.org/wiki/F-test) is
$$F=\frac{(SSR_r-SSR_{ur})/q}{SSR_{ur}/(n-k-1)}\ \sim\ F_{q,\,n-k-1}\ \text{under } H_0 .$$
Reject if $F>c$, the $1-\alpha$ quantile of $F_{q,n-k-1}$. $q$ = number of restrictions (numerator df); $n-k-1$ = denominator df from the unrestricted model.

**$R^2$ form** (only valid if $y$ is the same in both models):
$$F=\frac{(R^2_{ur}-R^2_r)/q}{(1-R^2_{ur})/(n-k-1)} .$$

### Overall significance

Testing $H_0:\beta_1=\dots=\beta_k=0$ (the restricted model has only an intercept, $R_r^2=0$) gives
$$F=\frac{R^2/k}{(1-R^2)/(n-k-1)} ,$$
the F statistic reported at the top of every regression output.

For $q=1$ the F test is equivalent to the two-sided t test ($F=t^2$).

## Worked Example

Baseball salaries: $\ln(salary)=\beta_0+\beta_1years+\beta_2gamesyr+\beta_3bavg+\beta_4hrunsyr+\beta_5rbisyr+u$, $n=353$. Test whether the three performance measures $bavg$, $hrunsyr$, $rbisyr$ matter jointly ($q=3$): $SSR_{ur}=183.186$ (full model, $n-k-1=347$), $SSR_r=198.311$.
$$F=\frac{(198.311-183.186)/3}{183.186/347}=\frac{5.042}{0.528}=9.55 .$$
The 5% critical value of $F_{3,347}$ is about 2.63, so $H_0$ is rejected decisively ($p<0.001$): performance matters. The $R^2$ form gives the same result: $\frac{(0.6278-0.5971)/3}{(1-0.6278)/347}=9.54$. Individually, each of the three performance variables may be insignificant because they are strongly correlated.

## Common Mistakes

- Concluding that variables are irrelevant because every individual t statistic is small.
- Using the $R^2$ form when the dependent variable differs between the two models.
- Taking the wrong degrees of freedom: numerator $q$, denominator $n-k-1$ of the **unrestricted** model.

## When It's Used

The F-test asks whether a *group* of variables matters jointly: do the performance statistics of baseball players affect salary once experience is controlled for, do several demographic controls matter, is the whole model useful? Individually insignificant variables can be jointly highly significant when they are correlated.

**Exam tip:** $F = \frac{(SSR_r - SSR_{ur})/q}{SSR_{ur}/(n-k-1)}$ or the $R^2$ form (only if $y$ is the same in both models). $q$ = number of restrictions; compare with $F_{q,n-k-1}$.

## R Code

```r
set.seed(19)
n <- 353
years <- runif(n, 1, 18); gamesyr <- runif(n, 20, 160)
bavg <- rnorm(n, 260, 20); hrunsyr <- rpois(n, 12); rbisyr <- hrunsyr * 3 + rpois(n, 20)
lsalary <- 11 + 0.07 * years + 0.013 * gamesyr + 0.001 * bavg + 0.01 * hrunsyr + 0.005 * rbisyr +
  rnorm(n, 0, 0.73)

ur <- lm(lsalary ~ years + gamesyr + bavg + hrunsyr + rbisyr)
r  <- lm(lsalary ~ years + gamesyr)                # H0: bavg = hrunsyr = rbisyr = 0
q <- 3; df_ur <- ur$df.residual

SSR_ur <- sum(resid(ur)^2); SSR_r <- sum(resid(r)^2)
F_ssr <- ((SSR_r - SSR_ur) / q) / (SSR_ur / df_ur)
R2u <- summary(ur)$r.squared; R2r <- summary(r)$r.squared
F_r2 <- ((R2u - R2r) / q) / ((1 - R2u) / df_ur)
c(F_ssr = F_ssr, F_r2 = F_r2, crit = qf(0.95, q, df_ur), p = pf(F_ssr, q, df_ur, lower.tail = FALSE))

anova(r, ur)                                        # same F test
summary(ur)$fstatistic                              # overall significance
```

## Python Code

```python
import numpy as np
import pandas as pd
from scipy import stats
from statsmodels.formula.api import ols

rng = np.random.default_rng(19)
n = 353
df = pd.DataFrame({"years": rng.uniform(1, 18, n), "gamesyr": rng.uniform(20, 160, n),
                   "bavg": rng.normal(260, 20, n), "hrunsyr": rng.poisson(12, n)})
df["rbisyr"] = df.hrunsyr * 3 + rng.poisson(20, n)
df["lsalary"] = (11 + 0.07 * df.years + 0.013 * df.gamesyr + 0.001 * df.bavg
                 + 0.01 * df.hrunsyr + 0.005 * df.rbisyr + rng.normal(0, 0.73, n))

ur = ols("lsalary ~ years + gamesyr + bavg + hrunsyr + rbisyr", df).fit()
r = ols("lsalary ~ years + gamesyr", df).fit()
q = 3
F = ((r.ssr - ur.ssr) / q) / (ur.ssr / ur.df_resid)
print("F =", F, " crit =", stats.f.ppf(0.95, q, ur.df_resid), " p =", stats.f.sf(F, q, ur.df_resid))
print(ur.f_test("bavg = 0, hrunsyr = 0, rbisyr = 0"))
print(ur.compare_f_test(r))                         # (F, p, df_diff)
```

## Practice Questions

*✎ new question added for this site (worked solution below)*

- ✎ A model with $k=4$ regressors and $n=60$ has $R^2_{ur}=0.40$. The restricted model without 2 of the variables has $R^2_r=0.34$. Test the exclusion of these 2 variables at 5% ($F_{2,55,0.95}=3.17$).
- ✎ Compute the overall F statistic for $R^2=0.25$, $k=3$, $n=44$.

## Solutions

*✎ solution written for this site*

- ✎ Q1: $q=2$, $n-k-1=55$: $F=\frac{(0.40-0.34)/2}{(1-0.40)/55}=\frac{0.03}{0.010909}=2.75<3.17$: do not reject; the two variables are not jointly significant at 5%.
- ✎ Q2: $n-k-1=40$: $F=\frac{0.25/3}{0.75/40}=\frac{0.08333}{0.01875}=4.44$ (compare with $F_{3,40,0.95}=2.84$: the model is significant).
