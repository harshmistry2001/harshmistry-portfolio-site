# Reporting Regression Results

> Course part: Stats 3

## Overview

Estimating a regression is only half the job; the results must be communicated so that others can judge them. Economics (and most applied fields) use a compact, standard format. Being able to **read** and **write** such a table quickly is an everyday skill.

## Concept

### What to report

- The **coefficient estimates**, with their units made clear (levels, logs, percentages).
- The **standard errors**, usually in parentheses *below* the estimates (sometimes t statistics or p-values instead; say which).
- The **number of observations** $n$ and a measure of fit ($R^2$, sometimes adjusted $R^2$).
- Optionally F statistics for joint tests, and the dependent variable.

### Formats

- **Equation form** for a single model:
$$\widehat{\ln(wage)}=\underset{(0.104)}{0.284}+\underset{(0.007)}{0.092}\,educ+\underset{(0.0017)}{0.0041}\,exper,\quad n=526,\ R^2=0.30 .$$
- **Table form** for several specifications side by side (one column per model), the usual choice in papers.
- **Stars** mark significance of a simple t test, commonly $^*$ $p<0.10$, $^{**}$ $p<0.05$, $^{***}$ $p<0.01$. State the convention below the table.

### Reading a table

- t statistic = coefficient / standard error. The rough rule "$|t|>2$ means significant at 5%" works for moderate or large samples.
- Compare the **size** of coefficients with an economic yardstick, not just the stars.
- Compare columns: if a coefficient changes a lot when a control is added, the omitted variable bias in the simpler model was important.

## Worked Example

| | (1) | (2) |
|---|---|---|
| educ | 0.083$^{***}$ | 0.092$^{***}$ |
| | (0.008) | (0.007) |
| exper | | 0.0041$^{**}$ |
| | | (0.0017) |
| $n$ | 526 | 526 |
| $R^2$ | 0.19 | 0.30 |

The t statistic of $exper$ is $0.0041/0.0017=2.4$, so it is significant at 5% (two stars) but not at 1%. The education coefficient rises from 0.083 to 0.092 when experience is controlled for (education and experience are negatively correlated), i.e. one more year of schooling is associated with about 9% higher wages, with experience held fixed.

## Common Mistakes

- Not stating whether the numbers in parentheses are standard errors, t statistics or p-values.
- Equating "more stars" with "bigger effect".
- Reporting only significant results.
- Omitting the units or the dependent variable.

## When It's Used

Results are communicated in a standard table: coefficients, standard errors in parentheses, stars for significance, number of observations and $R^2$, with several specifications side by side. This is the format of every economics paper, policy report and many business analyses — readers expect it.

**Exam tip:** be able to read such a table: compute a t-statistic as coefficient / se, judge significance, and interpret the coefficient in the units (or percentages, for logs) of the variables.

## R Code

```r
set.seed(20)
n <- 500
educ <- sample(8:18, n, TRUE); exper <- runif(n, 0, 30); female <- rbinom(n, 1, 0.5)
lwage <- 0.4 + 0.08 * educ + 0.01 * exper - 0.25 * female + rnorm(n, 0, 0.4)
m1 <- lm(lwage ~ educ); m2 <- lm(lwage ~ educ + exper); m3 <- lm(lwage ~ educ + exper + female)

stars <- function(p) ifelse(p < 0.01, "***", ifelse(p < 0.05, "**", ifelse(p < 0.1, "*", "")))
column <- function(m, vars) {
  ct <- coef(summary(m))
  cells <- sapply(vars, function(v) if (v %in% rownames(ct))
    sprintf("%.4f%s (%.4f)", ct[v, 1], stars(ct[v, 4]), ct[v, 2]) else "")
  c(cells, n = nobs(m), R2 = sprintf("%.3f", summary(m)$r.squared))
}
vars <- c("(Intercept)", "educ", "exper", "female")
tab <- sapply(list(`(1)` = m1, `(2)` = m2, `(3)` = m3), column, vars = vars)
print(noquote(tab))
# Optional packages: modelsummary::modelsummary(list(m1, m2, m3)) or stargazer::stargazer(m1, m2, m3)
```

## Python Code

```python
import numpy as np
import pandas as pd
from statsmodels.formula.api import ols
from statsmodels.iolib.summary2 import summary_col

rng = np.random.default_rng(20)
n = 500
df = pd.DataFrame({"educ": rng.integers(8, 19, n), "exper": rng.uniform(0, 30, n),
                   "female": rng.binomial(1, 0.5, n)})
df["lwage"] = 0.4 + 0.08 * df.educ + 0.01 * df.exper - 0.25 * df.female + rng.normal(0, 0.4, n)

models = [ols(f, df).fit() for f in
          ["lwage ~ educ", "lwage ~ educ + exper", "lwage ~ educ + exper + female"]]
print(summary_col(models, stars=True, model_names=["(1)", "(2)", "(3)"],
                  info_dict={"n": lambda m: f"{int(m.nobs)}"}))
```

## Practice Questions

*✎ new question added for this site (worked solution below)*

- ✎ A table reports a coefficient 0.35 with standard error (0.20) and $n=200$. Is it significant at 5% (two-sided)? How many stars would it get with the convention above?
- ✎ In a log–log regression a coefficient of 0.61 (se 0.05) is reported. Interpret it and state its approximate 95% confidence interval.

## Solutions

*✎ solution written for this site*

- ✎ Q1: $t=0.35/0.20=1.75<1.96$: not significant at 5% (two-sided). It is significant at 10% ($p\approx0.08$), so it would receive one star ($^*$).
- ✎ Q2: A 1% increase in the explanatory variable is associated with a 0.61% increase in the dependent variable (an elasticity). 95% CI: $0.61\pm1.96\cdot0.05=[0.51,\ 0.71]$.
