# Testing Hypotheses about a Single Linear Combination of the Parameters

> Course part: Stats 3

## Overview

Many economic questions compare two coefficients: Is a year at a two-year college worth the same as a year at a university? Is the effect of a price increase exactly offset by an equal income increase? These hypotheses involve **two parameters at once**, for example $H_0:\beta_1=\beta_2$. The usual t statistic needs the standard error of a *difference*, which regression output does not show directly.

## Concept

### The problem

Test $H_0:\beta_1=\beta_2$ (equivalently $\beta_1-\beta_2=0$). The natural statistic is
$$t=\frac{\hat\beta_1-\hat\beta_2}{se(\hat\beta_1-\hat\beta_2)},\qquad se(\hat\beta_1-\hat\beta_2)=\sqrt{se(\hat\beta_1)^2+se(\hat\beta_2)^2-2\,s_{12}},$$
where $s_{12}$ is the estimated covariance of $\hat\beta_1$ and $\hat\beta_2$. This covariance is not part of the standard output, so one cannot simply combine the two printed standard errors. (Software can supply it through a "linear hypothesis" or `lincom` command.)

### Reparameterisation trick

Define the new parameter $\theta_1=\beta_1-\beta_2$, so $\beta_1=\theta_1+\beta_2$, and substitute into the model:
$$y=\beta_0+(\theta_1+\beta_2)x_1+\beta_2x_2+\dots=\beta_0+\theta_1x_1+\beta_2(x_1+x_2)+\dots+u .$$
Regress $y$ on $x_1$ and the *sum* $(x_1+x_2)$: the coefficient on $x_1$ is $\hat\theta_1$ and its reported standard error is exactly $se(\hat\beta_1-\hat\beta_2)$. Then test $H_0:\theta_1=0$ with an ordinary t test. The same idea works for any single linear combination.

## Worked Example

$\ln(wage)=\beta_0+\beta_1\,jc+\beta_2\,univ+\beta_3\,exper+u$ with $jc$ = years at two-year colleges and $univ$ = years at universities. Estimates: $\hat\beta_1=0.0667$ ($se=0.0068$), $\hat\beta_2=0.0769$ ($se=0.0023$). Question: is a year at a two-year college worth as much as a year at university?

After reparameterising ($\theta_1=\beta_1-\beta_2$; regress $\ln(wage)$ on $jc$, $totcoll=jc+univ$ and $exper$), the coefficient on $jc$ is $\hat\theta_1=-0.0102$ with standard error $0.0069$ (this implies $s_{12}\approx0.000002$ in the first formula). Then $t=-0.0102/0.0069=-1.48$. The two-sided p-value is about 0.14, so $H_0$ is not rejected at 5%: the data do not show that the two kinds of college differ in their returns.

## Common Mistakes

- Combining two standard errors as $\sqrt{se_1^2+se_2^2}$ (this ignores the covariance term and is only correct if the estimates are uncorrelated).
- Looking at the two separate t-statistics and concluding that the coefficients differ because one is significant and the other is not.
- Forgetting that the reparameterised regression changes the interpretation of the other coefficients.

## When It's Used

Many economic questions compare two coefficients: is a year at a junior college worth as much as a year at university ($\beta_{jc} = \beta_{univ}$)? Is the effect of price equal and opposite to the effect of income? The trick is either to use the covariance of the estimates or to reparameterise the model so the difference becomes a single coefficient.

**Exam tip:** $se(\hat\beta_1 - \hat\beta_2) = \sqrt{se_1^2 + se_2^2 - 2s_{12}}$. Reparameterisation: with $\theta = \beta_1 - \beta_2$, regress $y$ on $x_1$ and $(x_1 + x_2)$; the coefficient on $x_1$ is $\hat\theta$ with its own se.

## R Code

```r
set.seed(18)
n <- 1000
jc <- rpois(n, 0.4); univ <- rpois(n, 1.5); exper <- runif(n, 0, 30)
lwage <- 1.5 + 0.067 * jc + 0.077 * univ + 0.005 * exper + rnorm(n, 0, 0.43)
fit <- lm(lwage ~ jc + univ + exper)

# Using the covariance matrix
V <- vcov(fit)
theta <- coef(fit)["jc"] - coef(fit)["univ"]
se <- sqrt(V["jc", "jc"] + V["univ", "univ"] - 2 * V["jc", "univ"])
c(theta = unname(theta), se = se, t = unname(theta / se))

# Reparameterisation: totcoll = jc + univ
totcoll <- jc + univ
coef(summary(lm(lwage ~ jc + totcoll + exper)))["jc", ]
```

## Python Code

```python
import numpy as np
import pandas as pd
from statsmodels.formula.api import ols

rng = np.random.default_rng(18)
n = 1000
df = pd.DataFrame({"jc": rng.poisson(0.4, n), "univ": rng.poisson(1.5, n),
                   "exper": rng.uniform(0, 30, n)})
df["lwage"] = 1.5 + 0.067 * df.jc + 0.077 * df.univ + 0.005 * df.exper + rng.normal(0, 0.43, n)
fit = ols("lwage ~ jc + univ + exper", df).fit()

print(fit.t_test("jc - univ = 0"))              # uses the covariance automatically

df["totcoll"] = df.jc + df.univ
rep = ols("lwage ~ jc + totcoll + exper", df).fit()
print("theta:", rep.params["jc"], " se:", rep.bse["jc"], " t:", rep.tvalues["jc"])
```

## Practice Questions

*✎ new question added for this site (worked solution below)*

- ✎ With $se(\hat\beta_1)=0.05$, $se(\hat\beta_2)=0.03$ and covariance $s_{12}=0.0004$, compute $se(\hat\beta_1-\hat\beta_2)$.
- ✎ Write the reparameterised regression for testing $H_0:\beta_1=2\beta_2$ in $y=\beta_0+\beta_1x_1+\beta_2x_2+u$.

## Solutions

*✎ solution written for this site*

- ✎ Q1: $se=\sqrt{0.05^2+0.03^2-2\cdot0.0004}=\sqrt{0.0025+0.0009-0.0008}=\sqrt{0.0026}\approx0.051$.
- ✎ Q2: Let $\theta=\beta_1-2\beta_2$, so $\beta_1=\theta+2\beta_2$. Then $y=\beta_0+\theta x_1+\beta_2(2x_1+x_2)+u$: regress $y$ on $x_1$ and $(2x_1+x_2)$, and test whether the coefficient on $x_1$ is zero.
