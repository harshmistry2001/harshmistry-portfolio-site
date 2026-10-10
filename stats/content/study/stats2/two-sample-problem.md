# Two-Sample Problem

> Course part: Stats 2

## Overview

"Is machine A different from machine B?", "Did the new website increase revenue?", "Did the course improve exam scores?" These are all **two-sample problems**: compare the means (or locations) of two groups. The right test depends on one design question (are the samples *paired* or *independent*?) and on whether the usual assumptions hold.

## Concept

### Paired samples

If the two measurements come from the same units (before/after, left/right), compute the differences $d_i=y_i-x_i$ and apply a **one-sample t-test** to them. Pairing removes variation between units and is usually much more powerful. Without normality use the sign test or the Wilcoxon signed-rank test on the differences.

### Two independent samples: the t-test

Let $X_1,\dots,X_n\sim N(\mu,\sigma^2)$ and $Y_1,\dots,Y_m\sim N(\nu,\tau^2)$ be independent. Test $H_0:\mu=\nu$.

- **Pooled two-sample t-test** (assumes $\sigma^2=\tau^2$):
$$T=\frac{\sqrt{\frac{nm}{n+m}}\,(\overline X_n-\overline Y_m)}{\sqrt{\frac1{n+m-2}\big((n-1)S_X^2+(m-1)S_Y^2\big)}}\sim t_{n+m-2}.$$
- **[Welch test](https://en.wikipedia.org/wiki/Welch's_t-test)** (variances may differ):
$$T=\frac{\overline X_n-\overline Y_m}{\sqrt{S_X^2/n+S_Y^2/m}}\approx t_{df},$$
with degrees of freedom from the Welch–Satterthwaite formula. Welch is the safer default; it loses little when variances are equal.

### Checking equal variances: F-test

Under normality, $F=S_X^2/S_Y^2\sim F_{n-1,m-1}$ if $\sigma^2=\tau^2$. Reject equality if $F$ is outside the interval between the lower and upper $\alpha/2$ quantiles of that [F-distribution](https://en.wikipedia.org/wiki/F-distribution). This test is sensitive to non-normality.

### Without normality: Wilcoxon rank-sum test

Pool both samples, rank all $n+m$ observations and compare the rank sum of one sample with its null distribution. It tests whether one group tends to produce larger values (see [Mann–Whitney U test](https://en.wikipedia.org/wiki/Mann%E2%80%93Whitney_U_test)) and is robust to outliers and non-normality.

## Worked Example

Group A: 12, 14, 16 ($\overline x=14$, $s^2=4$); group B: 10, 11, 15 ($\overline y=12$, $s^2=7$); $n=m=3$.

Pooled variance $s_p^2=\frac{2\cdot4+2\cdot7}{4}=5.5$; $T=\sqrt{\tfrac{9}{6}}\cdot\frac{14-12}{\sqrt{5.5}}\approx1.04$ with $df=4$. The critical value $t_{4,0.975}=2.78$ is not exceeded ($p\approx0.36$): no significant difference between the groups.

## Common Mistakes

- Using the independent-samples test on paired data (it throws away the pairing) or the paired test on independent groups.
- Choosing between pooled and Welch *after* a significant F-test result in a way that distorts the error rate; when in doubt, use Welch.
- Concluding "equal means" from a non-significant result.

## When It's Used

Two-sample tests compare two groups: machine A vs. machine B, old vs. new website, treatment vs. control. Use the pooled t-test with equal variances, Welch's test when variances differ, the paired t-test for before/after measurements on the same units, and the Wilcoxon rank-sum test when normality is doubtful.

**Exam tip:** first decide *paired or independent*. For independent samples check the variances (F-test or rule of thumb), then choose pooled t (df $= n+m-2$) or Welch. Without normality use Wilcoxon (independent) or the sign / signed-rank test on differences (paired).

## R Code

```r
# Practice Sheet 10, Problem 2: 3D printers from summary statistics
n <- 15; mx <- 27.10; sx <- 0.88
m <- 20; my <- 26.39; sy <- 0.66

# (a) pooled two-sample t-test
sp2 <- ((n - 1) * sx^2 + (m - 1) * sy^2) / (n + m - 2)
T_pooled <- sqrt(n * m / (n + m)) * (mx - my) / sqrt(sp2)
c(T = T_pooled, crit = qt(0.975, n + m - 2), p = 2 * pt(-abs(T_pooled), n + m - 2))

# (b) Welch test
se <- sqrt(sx^2 / n + sy^2 / m)
df_w <- se^4 / ((sx^2 / n)^2 / (n - 1) + (sy^2 / m)^2 / (m - 1))
T_w <- (mx - my) / se
c(T = T_w, df = df_w, p = 2 * pt(-abs(T_w), df_w))

# (c) F-test for equal variances
F_stat <- sx^2 / sy^2
c(F = F_stat, lower = qf(0.025, n - 1, m - 1), upper = qf(0.975, n - 1, m - 1))

# With raw data the built-in functions do everything
set.seed(6)
before <- round(rnorm(12, 60, 10)); after <- before + round(rnorm(12, 4, 6))
t.test(after, before, paired = TRUE, alternative = "greater")$p.value
wilcox.test(after, before, paired = TRUE, alternative = "greater", exact = FALSE)$p.value
a <- rnorm(12, 50, 8); b <- rnorm(12, 58, 8)
wilcox.test(a, b)$p.value                                  # rank-sum (Mann-Whitney)
```

## Python Code

```python
import numpy as np
from scipy import stats

n, mx, sx = 15, 27.10, 0.88
m, my, sy = 20, 26.39, 0.66

print("pooled:", stats.ttest_ind_from_stats(mx, sx, n, my, sy, m, equal_var=True))
print("welch: ", stats.ttest_ind_from_stats(mx, sx, n, my, sy, m, equal_var=False))

F = sx**2 / sy**2
print("F =", F, " acceptance region:", stats.f.ppf([0.025, 0.975], n - 1, m - 1))

rng = np.random.default_rng(6)
before = np.round(rng.normal(60, 10, 12)); after = before + np.round(rng.normal(4, 6, 12))
print("paired t:", stats.ttest_rel(after, before, alternative="greater").pvalue)
print("signed-rank:", stats.wilcoxon(after, before, alternative="greater").pvalue)
a, b = rng.normal(50, 8, 12), rng.normal(58, 8, 12)
print("rank-sum:", stats.mannwhitneyu(a, b).pvalue)
```

## Practice Questions

*◆ original question from the course material · ✎ new question added for this site (worked solution below)*

- ◆ Practice Sheet 10, Problem 1: A group of 12 students was selected to assess the effect of a math course. They take part in two tests (before and after)... $d_{i}=y_{i}-x_{i}$.
  - (a) Assume normally distributed variables. Test at level $\alpha=0.05$ if expected results after the course are significantly better than before. Compute p-value.
  - (b) There is some concern that the normality assumption is not justified... choose the appropriate test and test at the level $\alpha=0.05$ the same hypothesis. Compute p-value.
- ◆ Practice Sheet 10, Problem 2: Two types of 3D printers, A and B... Printer A: $n=15$, $\overline{x}_n=27.1$, $s_x=0.88$; Printer B: $m=20$, $\overline{y}_m=26.39$, $s_y=0.66$. Assume normal distribution. Test at level $\alpha=0.05$, if the expected length of laptop stands produced by printer A are significantly different than... B. Test under the assumption:
  - (a) variances are equal.
  - (b) variances are not equal.
  - (c) Perform an F-test to the level $\alpha=0.05$ to decide which of the assumptions is better suited.
- ◆ Practice Sheet 10, Problem 3: A company that manufactures candles introduces two new scented candles... 12 comparable shops... Test (without Gaussianity) at level $\alpha=0.1$ if there is a significant difference in the sales numbers between the two new products.
- ✎ Group A has the observations 12, 14, 16 and group B the observations 10, 11, 15. Test $H_0:\mu_A=\mu_B$ with the pooled t-test at $\alpha=0.05$ and comment on the power.

## Solutions

*✎ solution written for this site*

*Problems 1 and 3 of Sheet 10 depend on data tables that are not reproduced here; they are answered by method.*

- ✎ Sheet 10, Problem 1: (a) Compute $d_i=y_i-x_i$ and run a one-sided one-sample t-test of $H_0:\mu_d\le0$ vs $H_1:\mu_d>0$ with $T=\sqrt{12}\,\bar d/s_d\sim t_{11}$; reject if $T>t_{11,0.95}=1.796$ (p-value $=P(t_{11}>T)$). (b) Without normality use the Wilcoxon signed-rank test (or the sign test) on the differences, one-sided, at $\alpha=0.05$.
- ✎ Sheet 10, Problem 2: $H_0:\mu_A=\mu_B$ vs $H_1:\mu_A\ne\mu_B$; $\overline x-\overline y=0.71$. (a) Equal variances: $s_p^2=\frac{14\cdot0.88^2+19\cdot0.66^2}{33}=0.5793$, $T=\sqrt{\tfrac{15\cdot20}{35}}\cdot\frac{0.71}{\sqrt{0.5793}}=2.73$, $df=33$, $t_{33,0.975}=2.035$: reject ($p\approx0.010$). (b) Welch: standard error $\sqrt{0.88^2/15+0.66^2/20}=0.271$, $T=2.62$, $df\approx25$, $t_{25,0.975}=2.059$: reject ($p\approx0.015$). (c) $F=0.88^2/0.66^2=1.78$ with $(14,19)$ degrees of freedom; the acceptance region is $[0.35,\,2.65]$, so equal variances are **not** rejected and the pooled test is justified. Both tests conclude that printer A produces significantly longer laptop stands.
- ✎ Sheet 10, Problem 3: The 12 shops sell both candles, so the data are paired. Compute the sales differences and apply the Wilcoxon signed-rank test (two-sided, $\alpha=0.1$): rank the absolute differences, sum the ranks of the positive differences and compare with the critical values for $n=12$.
- ✎ Q4 (new question): With $n=m=3$ the pooled t-test of the worked example gives no significant difference; with so few observations only very large differences can be detected, i.e. the power is low.
