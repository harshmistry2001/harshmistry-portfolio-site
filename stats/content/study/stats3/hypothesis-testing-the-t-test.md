# Hypothesis Testing: The t Test

> Course part: Stats 3

## Overview

"Does experience really raise wages, or could the estimate just be noise?" The **t test** on a regression coefficient answers this: it measures how many standard errors the estimate is away from a hypothesised value (usually zero) and judges whether such a distance could easily arise by chance.

## Concept

### The t statistic

Under MLR.1–MLR.6, for any hypothesised value $a_j$,
$$t=\frac{\hat\beta_j-a_j}{se(\hat\beta_j)}\ \sim\ t_{n-k-1}\quad\text{if } \beta_j=a_j .$$
The most common case, $H_0:\beta_j=0$ ("$x_j$ has no partial effect on $y$"), uses $t_{\hat\beta_j}=\hat\beta_j/se(\hat\beta_j)$. See the [t-test](https://en.wikipedia.org/wiki/Student's_t-test).

### Decision rules (significance level $\alpha$)

- **One-sided** $H_1:\beta_j>0$: reject if $t>c_{1-\alpha}$ (the $1-\alpha$ quantile of $t_{n-k-1}$). For $H_1:\beta_j<0$: reject if $t<-c_{1-\alpha}$.
- **Two-sided** $H_1:\beta_j\ne0$: reject if $|t|>c_{1-\alpha/2}$.
- **p-value:** the probability, under $H_0$, of a t value at least as extreme as the one observed. Reject if $p<\alpha$. For a one-sided test the p-value is half the two-sided one *if* $t$ has the sign stated in $H_1$.

For large degrees of freedom the critical values are close to normal ones: 1.96 (two-sided 5%), 1.645 (one-sided 5%).

### Statistical versus economic significance

A coefficient is **statistically significant** if it is distinguishable from zero; it is **economically significant** if its size matters in practice. With very large samples tiny effects become significant; with small samples large effects may be insignificant because the standard error is large. Always report and discuss the size of $\hat\beta_j$ as well as the t statistic.

## Worked Example

$\widehat{\ln(wage)}=0.284+0.092\,educ+0.0041\,exper+0.022\,tenure$, $n=526$, so $df=526-3-1=522$. Standard error of $exper$: $0.0017$.

- $t=0.0041/0.0017=2.41$. Two-sided critical value $\approx1.96$, so reject $H_0:\beta_{exper}=0$ at 5%; $p\approx0.016$.
- One-sided test of $H_1:\beta_{exper}>0$: $p\approx0.008$.
- Economic size: one more year of experience is associated with about $0.41\%$ higher wages, which is small.

## Common Mistakes

- Reading the p-value as the probability that $H_0$ is true.
- Confusing "not significant" with "no effect" (the estimate may just be imprecise).
- Using a one-sided test after seeing the sign of the estimate.
- Using $n-1$ instead of $n-k-1$ degrees of freedom.

## When It's Used

The t-test on a coefficient answers "is there evidence of an effect?": does experience raise wages, does a marketing channel increase sales, does a policy change outcomes. Reporting both statistical significance (t, p) and economic significance (the size of $\hat\beta_j$ in meaningful units) is the professional standard.

**Exam tip:** $t = \frac{\hat\beta_j - a_j}{se(\hat\beta_j)}$ with $n - k - 1$ df. One-sided $H_1: \beta_j > 0$: reject if $t > c_{1-\alpha}$; two-sided: $|t| > c_{1-\alpha/2}$. For a one-sided p-value halve the two-sided one only if $t$ has the sign of $H_1$.

## R Code

```r
set.seed(16)
n <- 526
educ <- sample(8:18, n, TRUE); exper <- runif(n, 0, 40); tenure <- runif(n, 0, 20)
lwage <- 0.3 + 0.09 * educ + 0.004 * exper + 0.02 * tenure + rnorm(n, 0, 0.44)
fit <- lm(lwage ~ educ + exper + tenure)
ct <- coef(summary(fit)); df <- fit$df.residual
ct

# H0: beta_exper = 0 vs H1: beta_exper > 0 at 5%
t_exp <- ct["exper", "t value"]
c(t = t_exp, crit = qt(0.95, df), p_one_sided = pt(t_exp, df, lower.tail = FALSE))

# H0: beta_educ = 0.1 (two-sided)
t_educ <- (ct["educ", "Estimate"] - 0.1) / ct["educ", "Std. Error"]
c(t = t_educ, p = 2 * pt(-abs(t_educ), df))
```

## Python Code

```python
import numpy as np
import pandas as pd
from scipy import stats
from statsmodels.formula.api import ols

rng = np.random.default_rng(16)
n = 526
df = pd.DataFrame({"educ": rng.integers(8, 19, n), "exper": rng.uniform(0, 40, n),
                   "tenure": rng.uniform(0, 20, n)})
df["lwage"] = 0.3 + 0.09 * df.educ + 0.004 * df.exper + 0.02 * df.tenure + rng.normal(0, 0.44, n)
fit = ols("lwage ~ educ + exper + tenure", df).fit()
print(fit.summary().tables[1])

t = fit.tvalues["exper"]
print("one-sided: t =", t, " crit =", stats.t.ppf(0.95, fit.df_resid), " p =", stats.t.sf(t, fit.df_resid))
print(fit.t_test("educ = 0.1"))
```

## Practice Questions

*✎ new question added for this site (worked solution below)*

- ✎ An estimate is $\hat\beta=0.15$ with $se=0.08$ and $df=60$. Test $H_0:\beta=0$ against $H_1:\beta\neq0$ at 5% ($t_{60,0.975}=2.00$).
- ✎ In the same case test $H_0:\beta=0$ against $H_1:\beta>0$ at 5% ($t_{60,0.95}=1.671$).
- ✎ An estimate $\hat\beta=0.0004$ with $se=0.0001$ in a sample of 100,000 observations is highly significant. Is it important?

## Solutions

*✎ solution written for this site*

- ✎ Q1: $t=0.15/0.08=1.875<2.00$: do not reject; the effect is not significant at 5% (two-sided).
- ✎ Q2: $t=1.875>1.671$: reject $H_0$ in favour of a positive effect (significant at 5% one-sided).
- ✎ Q3: Statistically yes ($t=4$), but economically it is small: the effect corresponds to a 0.04% change per unit of $x$. Large samples make even tiny effects significant, so the size of the coefficient must be judged separately.
