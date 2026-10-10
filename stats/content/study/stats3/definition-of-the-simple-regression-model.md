# Definition of the Simple Regression Model

> Course part: Stats 3

## Overview

The simple regression model is the basic tool for describing how one variable $y$ (the outcome) is related to one other variable $x$ (the explanatory variable). It has a deliberately simple form (a straight line plus a catch-all error term), but understanding exactly what it assumes is essential for everything that follows in econometrics.

## Concept

### The model

$$y=\beta_0+\beta_1x+u .$$

- $y$: dependent variable (explained variable, outcome); $x$: independent variable (explanatory variable, regressor).
- $\beta_0$: intercept; $\beta_1$: **slope parameter**.
- $u$: **error term** (disturbance): all factors other than $x$ that affect $y$, including unobserved ones and measurement error.

If the other factors in $u$ are held fixed ($\Delta u=0$), then $\Delta y=\beta_1\Delta x$. So the model is **linear**: a one-unit change in $x$ changes $y$ by $\beta_1$ units, no matter what the initial value of $x$ is. $\beta_1$ is the partial (ceteris paribus) effect $\partial y/\partial x$.

### Assumptions about the error

1. $E(u)=0$. This is harmless: if the average of $u$ were not zero, it could be absorbed into the intercept.
2. **Mean independence**: $E(u\mid x)=E(u)$. The average of the unobserved factors does not depend on $x$.

Together they form the **zero conditional mean assumption**
$$E(u\mid x)=0 .$$
It is the crucial assumption. For example, in a wage equation with $x$ = education, it says that average ability is the same at all education levels, which is questionable.

### Population regression function

Taking the conditional expectation gives the [population regression function](https://en.wikipedia.org/wiki/Regression_analysis) (PRF)
$$E(y\mid x)=\beta_0+\beta_1x ,$$
the average of $y$ for each value of $x$. The actual $y$ scatters around this line by the amount $u$.

## Worked Example

Suppose the wage equation is $wage=\beta_0+\beta_1\,educ+u$ and the PRF is $E(wage\mid educ)=-0.90+0.54\,educ$ (dollars per hour).

- Interpretation: each additional year of education raises the *average* hourly wage by 0.54 dollars.
- Prediction: for 12 years of education the average wage is $-0.90+0.54\cdot12=5.58$ dollars.
- The intercept $-0.90$ is the average wage at zero years of education, which is a mere extrapolation (a negative wage has no meaning).
- Causal reading requires $E(u\mid educ)=0$. If more able people obtain more education and ability raises wages, then $E(u\mid educ)$ increases with education and 0.54 overstates the true effect of schooling.

## Common Mistakes

- Reading $\beta_1$ as the effect of $x$ on $y$ for each individual; it is an average effect under the assumption.
- Forgetting that $u$ includes everything unobserved, so $E(u\mid x)=0$ is an assumption that must be argued, not a mathematical truth.
- Interpreting the intercept literally when $x=0$ is outside the data range.

## When It's Used

The simple regression model $y = \beta_0 + \beta_1x + u$ is the starting point for quantifying a relationship: wage vs. education, crop yield vs. fertiliser, test scores vs. class size. Its causal interpretation hinges on the zero conditional mean assumption $E(u|x) = 0$ — the unobserved factors must be unrelated to $x$ on average.

**Exam tip:** $E(u) = 0$ is harmless (the intercept absorbs any constant). The critical assumption is $E(u|x) = E(u)$; then the population regression function is $E(y|x) = \beta_0 + \beta_1 x$.

## R Code

```r
set.seed(5)
n <- 5000
educ <- sample(8:20, n, replace = TRUE)
u <- rnorm(n, 0, 3)                                       # E(u | educ) = 0 holds
wage <- -1 + 0.6 * educ + u

# The PRF: conditional means of wage given educ lie on the line b0 + b1 educ
cond_means <- tapply(wage, educ, mean)
cbind(E_wage_given_educ = round(cond_means, 2), PRF = -1 + 0.6 * as.numeric(names(cond_means)))

# E(u) != 0 only shifts the intercept (Practice P 2.2)
wage2 <- -1 + 0.6 * educ + (u + 2)                        # alpha_0 = E(u) = 2
coef(lm(wage2 ~ educ))                                    # slope unchanged, intercept + 2
```

## Python Code

```python
import numpy as np
import pandas as pd

rng = np.random.default_rng(5)
n = 5000
educ = rng.integers(8, 21, n)
u = rng.normal(0, 3, n)
wage = -1 + 0.6 * educ + u

cm = pd.Series(wage).groupby(educ).mean()
print(pd.DataFrame({"E(wage|educ)": cm.round(2), "PRF": -1 + 0.6 * cm.index}))

wage2 = -1 + 0.6 * educ + (u + 2)
print(np.polyfit(educ, wage2, 1))          # [slope, intercept]: slope unchanged
```

## Practice Questions

*✎ new question added for this site (worked solution below)*

- ✎ In the model $score=\beta_0+\beta_1\,hours+u$ with PRF $E(score\mid hours)=20+3\,hours$, interpret the slope and predict the average score for 10 hours.
- ✎ A model relates a crop yield to fertiliser use. Give one factor in $u$ and say whether it is likely to violate $E(u\mid x)=0$.
- ✎ Suppose $E(u)=2$ in $y=\beta_0+\beta_1x+u$. Show that the model can be rewritten with a zero-mean error without changing the slope.

## Solutions

*✎ solution written for this site*

- ✎ Q1: Each additional hour of study raises the average score by 3 points. For 10 hours: $20+3\cdot10=50$.
- ✎ Q2: Soil quality is in $u$. If farmers with better soil use more fertiliser, $E(u\mid x)$ rises with $x$ and the assumption is violated (the estimated effect is too large).
- ✎ Q3: Let $\alpha_0=E(u)=2$ and $\tilde u=u-\alpha_0$. Then $y=(\beta_0+\alpha_0)+\beta_1x+\tilde u$ with $E(\tilde u)=0$: same slope, new intercept $\beta_0+2$.
