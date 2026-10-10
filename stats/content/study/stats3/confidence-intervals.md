# Confidence Intervals

> Course part: Stats 3

## Overview

A coefficient estimate such as $\hat\beta=0.092$ is only one number from one sample. A **confidence interval** shows the range of values for the true $\beta$ that are consistent with the data, which tells decision makers far more than a bare "significant / not significant".

## Concept

Under the classical linear model, a $(1-\alpha)$ [confidence interval](https://en.wikipedia.org/wiki/Confidence_interval) for $\beta_j$ is
$$\hat\beta_j\pm c\cdot se(\hat\beta_j),\qquad c=t_{n-k-1,\,1-\alpha/2}\ (\approx1.96\text{ for a 95\% interval in large samples}).$$

- Interpretation: if we repeated the sampling many times, about $(1-\alpha)\cdot100\%$ of the intervals constructed this way would contain the true $\beta_j$. It is the *interval* that is random, not the parameter.
- **Link with testing:** a two-sided test of $H_0:\beta_j=a_j$ at level $\alpha$ rejects exactly when $a_j$ lies outside the $(1-\alpha)$ confidence interval.
- The width grows with $se(\hat\beta_j)$ and with the confidence level.
- The interval is only as reliable as the assumptions (unbiasedness, homoskedasticity, normality or a large sample).

## Worked Example

Return to education: $\hat\beta_{educ}=0.092$, $se=0.007$.

- 95% CI: $0.092\pm1.96\cdot0.007=[0.078,\ 0.106]$, i.e. each additional year of education is associated with 7.8% to 10.6% higher wages.
- 90% CI: $0.092\pm1.645\cdot0.007=[0.080,\ 0.104]$ (narrower).
- Since 0 is outside both intervals, $H_0:\beta_{educ}=0$ is rejected at 5% and 10%. A test of $H_0:\beta_{educ}=0.10$ is *not* rejected at 5% because 0.10 lies inside the 95% interval.

## Common Mistakes

- Saying "there is a 95% probability that $\beta$ lies in this interval".
- Using 1.96 for small samples where the t quantile is noticeably larger.
- Believing that a narrow interval guarantees the estimate is unbiased: the interval does not correct for omitted variable bias.

## When It's Used

A confidence interval for a coefficient gives the range of effect sizes compatible with the data — far more informative for decisions than a bare p-value: "each extra year of education raises wages by 7% to 11%". It is how consultancies and central banks report elasticities and policy effects.

**Exam tip:** $\hat\beta_j \pm c \cdot se(\hat\beta_j)$ with $c = t_{n-k-1,1-\alpha/2}$ (≈1.96 for large df at 95%). If the hypothesised value lies outside the 95% CI, reject it at 5% (two-sided).

## R Code

```r
set.seed(17)
n <- 90
rdintens <- runif(n, 0, 10); sales <- rlnorm(n, 7, 1)
lrd <- -4 + 1.1 * log(sales) + 0.02 * rdintens + rnorm(n, 0, 0.5)
fit <- lm(lrd ~ log(sales) + rdintens)

confint(fit, level = 0.95)

# By hand
b <- coef(fit)["log(sales)"]; se <- coef(summary(fit))["log(sales)", "Std. Error"]
b + c(-1, 1) * qt(0.975, fit$df.residual) * se

# Does the CI contain 1 (unit elasticity)?
ci <- confint(fit)["log(sales)", ]
ci[1] <= 1 & 1 <= ci[2]
```

## Python Code

```python
import numpy as np
import pandas as pd
from scipy import stats
from statsmodels.formula.api import ols

rng = np.random.default_rng(17)
n = 90
df = pd.DataFrame({"rdintens": rng.uniform(0, 10, n), "sales": rng.lognormal(7, 1, n)})
df["lrd"] = -4 + 1.1 * np.log(df.sales) + 0.02 * df.rdintens + rng.normal(0, 0.5, n)
fit = ols("lrd ~ np.log(sales) + rdintens", df).fit()
print(fit.conf_int(alpha=0.05))

b, se = fit.params["np.log(sales)"], fit.bse["np.log(sales)"]
c = stats.t.ppf(0.975, fit.df_resid)
print("by hand:", b - c * se, b + c * se)
```

## Practice Questions

*✎ new question added for this site (worked solution below)*

- ✎ Compute the 95% interval for $\hat\beta=0.5$, $se=0.2$, $df=40$ ($t_{40,0.975}=2.021$). Is $H_0:\beta=0$ rejected?
- ✎ A 95% interval for an elasticity is $[-1.6,\,-0.4]$. Is the hypothesis "elasticity $=-1$" rejected at 5%?

## Solutions

*✎ solution written for this site*

- ✎ Q1: $0.5\pm2.021\cdot0.2=[0.096,\ 0.904]$. It excludes 0, so $H_0$ is rejected at the 5% level.
- ✎ Q2: No: $-1$ lies inside $[-1.6,-0.4]$, so it is not rejected (the data are compatible with unit elasticity).
