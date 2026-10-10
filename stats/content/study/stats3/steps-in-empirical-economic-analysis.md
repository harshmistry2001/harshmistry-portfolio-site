# Steps in Empirical Economic Analysis

> Course part: Stats 3

## Overview

Every empirical project in economics follows the same path: start from a question, use economic reasoning to decide which variables matter, turn the idea into an equation that can be estimated, collect data and finally estimate and test. This page explains the two kinds of models involved and how they link up.

## Concept

### Step 1: The question and the economic model

An **economic model** describes behaviour with mathematical equations derived from theory. A classic example is Gary Becker's economic model of crime: a person commits a crime if the expected benefit exceeds the expected cost, which leads to a relationship such as
$$crime = f(wage_m,\ othinc,\ freqarr,\ freqconv,\ avgsen,\ age,\ \dots),$$
where $wage_m$ is the legal wage, $othinc$ other income, $freqarr$ the probability of arrest and $avgsen$ the average sentence. Economic models state *which* variables matter but not the precise functional form.

### Step 2: The econometric model

To make the economic model estimable, one must (1) choose a functional form, (2) choose measurable variables, and (3) add an **error term** $u$ that captures everything not included (unobserved factors, measurement error). A [linear regression model](https://en.wikipedia.org/wiki/Linear_regression) for the example is
$$crime=\beta_0+\beta_1\,wage_m+\beta_2\,othinc+\beta_3\,freqarr+\beta_4\,avgsen+u .$$
In general: $y=\beta_0+\beta_1x_1+\dots+\beta_kx_k+u$, with dependent variable $y$, explanatory variables $x_j$, unknown parameters $\beta_j$ and error term $u$.

### Step 3: Hypotheses

Economic theory is translated into statements about parameters. "Higher legal wages reduce crime" becomes $H_0:\beta_1=0$ against $H_1:\beta_1<0$.

### Step 4: Data, estimation and testing

Data are collected (see the next topic on data structures), the parameters are estimated (usually by ordinary least squares), and the hypotheses are tested. Finally, results are interpreted and used for prediction or policy advice.

## Worked Example

*Question: does extra schooling increase wages?*

1. Economic model: wages depend on productivity, which depends on education, experience and ability.
2. Econometric model: $\ln(wage)=\beta_0+\beta_1\,educ+\beta_2\,exper+u$, where $u$ contains ability, family background, region and everything else not measured.
3. Hypothesis: $H_0:\beta_1=0$ against $H_1:\beta_1>0$.
4. Data: a survey of workers; estimate $\beta_1$ and test.

If the estimate is $\hat\beta_1=0.08$, one more year of schooling is associated with about 8% higher wages, holding experience fixed.

## Common Mistakes

- Putting variables into $u$ that are correlated with the explanatory variables (this causes bias, see later topics).
- Forgetting that the error term also absorbs measurement error.
- Stating the hypothesis after looking at the estimate.

## When It's Used

Every applied project follows the same path: an economic model (e.g. Becker's model of crime) motivates which variables matter, the econometric model makes it estimable by choosing measurable variables and an error term $u$ for everything left out, then data are collected and the parameters estimated and tested. Policy evaluations, consulting reports and theses all follow this template.

**Exam tip:** be able to turn a verbal economic model into $y = \beta_0 + \beta_1x_1 + \dots + u$, name what ends up in $u$, and state the hypothesis to test (e.g. $H_0: \beta_{wage} = 0$).

## R Code

```r
# Econometric model of crime: crime = b0 + b1 wage + b2 othinc + b3 freqarr + b4 avgsen + u
set.seed(2)
n <- 500
wage    <- runif(n, 5, 25)          # legal hourly wage
othinc  <- rexp(n, 1/5)             # other income
freqarr <- runif(n, 0, 0.5)         # frequency of prior arrests
avgsen  <- runif(n, 0, 3)           # average sentence length
crime   <- 10 - 0.3 * wage - 0.1 * othinc + 6 * freqarr - 0.8 * avgsen + rnorm(n, 0, 2)

fit <- lm(crime ~ wage + othinc + freqarr + avgsen)
summary(fit)$coefficients
# Economic theory predicts beta_wage < 0: test it one-sided
t_wage <- coef(summary(fit))["wage", "t value"]
pt(t_wage, df = fit$df.residual)
```

## Python Code

```python
import numpy as np
import pandas as pd
from scipy import stats
from statsmodels.formula.api import ols

rng = np.random.default_rng(2)
n = 500
df = pd.DataFrame({"wage": rng.uniform(5, 25, n), "othinc": rng.exponential(5, n),
                   "freqarr": rng.uniform(0, 0.5, n), "avgsen": rng.uniform(0, 3, n)})
df["crime"] = (10 - 0.3 * df.wage - 0.1 * df.othinc + 6 * df.freqarr - 0.8 * df.avgsen
               + rng.normal(0, 2, n))

fit = ols("crime ~ wage + othinc + freqarr + avgsen", data=df).fit()
print(fit.summary().tables[1])
print("one-sided p (beta_wage < 0):", stats.t.cdf(fit.tvalues["wage"], fit.df_resid))
```

## Practice Questions

*✎ new question added for this site (worked solution below)*

- ✎ A theory says that the demand for coffee falls when its price rises and rises with income. Write an econometric model and the hypotheses.
- ✎ Name three factors that end up in the error term of the wage equation above.

## Solutions

*✎ solution written for this site*

- ✎ Q1: $\ln(quantity)=\beta_0+\beta_1\ln(price)+\beta_2\ln(income)+u$. Hypotheses: $H_0:\beta_1=0$ vs $H_1:\beta_1<0$ (demand falls with price), and $H_0:\beta_2=0$ vs $H_1:\beta_2>0$.
- ✎ Q2: For example innate ability, quality of schooling, family background or the local labour market conditions; also measurement error in the reported wage.
