# $\chi^2$-test of homogeneity

> Course part: Stats 2

## Overview

Do several groups behave the same way when it comes to a categorical outcome? For example: do customers in three regions buy a product equally often? Do the defect types look the same in all plants? The **$\chi^2$ test of homogeneity** compares the observed counts in a contingency table with the counts we would expect if all groups had the same distribution.

## Concept

### Setting

There are $k$ **fixed groups** (regions, plants, age groups) whose sizes $n_{i+}$ are decided in advance. In each group, every unit falls into one of $m$ categories. Let $n_{il}$ be the count in group $i$ and category $l$, so the data form a $k\times m$ contingency table with row totals $n_{i+}$, column totals $n_{+l}$ and grand total $n$.

$$H_0:\ \text{the probabilities of the } m \text{ categories are the same in all } k \text{ groups.}$$

### Expected counts and test statistic

If $H_0$ holds, the best estimate of the common category probability is $n_{+l}/n$, so the expected count in cell $(i,l)$ is $\dfrac{n_{i+}\,n_{+l}}{n}$. The [chi-squared test](https://en.wikipedia.org/wiki/Chi-squared_test) statistic adds up the standardised squared deviations:

$$X^2=\sum_{i=1}^{k}\sum_{l=1}^{m}\frac{\Big(n_{il}-\frac{n_{i+}n_{+l}}{n}\Big)^2}{\frac{n_{i+}n_{+l}}{n}}\ \approx\ \chi^2_{(k-1)(m-1)}\quad\text{under } H_0 .$$

Reject $H_0$ if $X^2>\chi^2_{(k-1)(m-1),\,1-\alpha}$. The approximation is reliable if all expected counts are at least about 5 (otherwise merge categories). The test is always one-sided (large values of $X^2$ indicate a deviation).

## Worked Example

Three regions, 100 surveyed persons each, purchases per month (low / medium / high):

| Region | Low | Medium | High | Total |
|---|---|---|---|---|
| A | 30 | 40 | 30 | 100 |
| B | 20 | 45 | 35 | 100 |
| C | 40 | 30 | 30 | 100 |
| Total | 90 | 115 | 95 | 300 |

Expected counts (identical in each row): $100\cdot\frac{90}{300}=30$, $100\cdot\frac{115}{300}=38.33$, $100\cdot\frac{95}{300}=31.67$.

$$X^2=\frac{(30-30)^2}{30}+\frac{(40-38.33)^2}{38.33}+\dots=10.24 .$$

With $(3-1)(3-1)=4$ degrees of freedom the critical value is $\chi^2_{4,0.95}=9.49$. Since $10.24>9.49$ (p ≈ 0.037), reject $H_0$: purchase behaviour differs between the regions.

## Common Mistakes

- Using percentages instead of counts in the formula.
- Wrong degrees of freedom: it is $(k-1)(m-1)$, not $km-1$.
- Applying the test with many expected counts below 5.
- Treating a significant result as "which groups differ": it only says that not all groups are the same; compare standardised residuals $\frac{O-E}{\sqrt E}$ to find the responsible cells.

## When It's Used

The homogeneity test asks whether several *fixed groups* share the same distribution over categories: purchase frequency across regions, product preference across age groups sampled separately, defect types across plants. Market researchers use it to decide whether one campaign can be rolled out everywhere.

**Exam tip:** expected counts $= \frac{n_{i+}n_{+l}}{n}$, df $= (k-1)(m-1)$. All expected counts should be at least about 5. In R use `correct = FALSE` to match the course formula for 2×2 tables.

## R Code

```r
# Purchases per month in three regions (group sizes fixed by design)
obs <- matrix(c(120, 150, 80,
                100, 170, 60,
                140, 120, 60),
              nrow = 3, byrow = TRUE,
              dimnames = list(region = c("A", "B", "C"), purchases = c("0-1", "2-3", "4+")))

expected <- outer(rowSums(obs), colSums(obs)) / sum(obs)
X2 <- sum((obs - expected)^2 / expected)
df <- (nrow(obs) - 1) * (ncol(obs) - 1)
c(X2 = X2, df = df, crit = qchisq(0.95, df), p = pchisq(X2, df, lower.tail = FALSE))

chisq.test(obs, correct = FALSE)
```

## Python Code

```python
import numpy as np
from scipy import stats

obs = np.array([[120, 150, 80],
                [100, 170, 60],
                [140, 120, 60]])
expected = np.outer(obs.sum(1), obs.sum(0)) / obs.sum()
X2 = ((obs - expected) ** 2 / expected).sum()
df = (obs.shape[0] - 1) * (obs.shape[1] - 1)
print(f"X2={X2:.3f} df={df} crit={stats.chi2.ppf(0.95, df):.3f} p={stats.chi2.sf(X2, df):.4g}")
print(stats.chi2_contingency(obs, correction=False))
```

## Practice Questions

*✎ new question added for this site (worked solution below)*

- ✎ Two stores sell 200 (store 1) and 300 (store 2) units of a product; the share of customers who buy the premium version is 30% in store 1 and 20% in store 2. Test at $\alpha=0.05$ whether the premium share is the same in both stores.
- ✎ For a $4\times3$ table, how many degrees of freedom does the test have, and what is the critical value at $\alpha=0.05$?

## Solutions

*✎ solution written for this site*

- ✎ Q1: Counts: store 1: premium 60, standard 140; store 2: premium 60, standard 240. Totals: premium 120, standard 380, $n=500$. Expected: store 1 premium $200\cdot\frac{120}{500}=48$, standard 152; store 2 premium 72, standard 228. $X^2=\frac{(60-48)^2}{48}+\frac{(140-152)^2}{152}+\frac{(60-72)^2}{72}+\frac{(240-228)^2}{228}=3+0.947+2+0.632=6.58$. With $df=1$ the critical value is $3.84$: reject $H_0$ ($p\approx0.010$); the premium share differs between the stores.
- ✎ Q2: $df=(4-1)(3-1)=6$; $\chi^2_{6,0.95}=12.59$.
