# Kruskal-Wallis test

> Course part: Stats 2

## Overview

ANOVA needs normal data with equal variances. When the data are skewed, have outliers or are only ordinal (ratings), the **Kruskal–Wallis test** is the standard alternative for comparing three or more groups. It replaces every value by its rank and asks whether the groups' rank sums differ more than chance allows.

## Concept

### Test procedure

Let there be $k\ge3$ independent samples with sizes $n_i$ and total $n$. Under $H_0$ all densities are equal, $f_1=\dots=f_k$; the alternative is that at least two differ (typically in location).

1. Pool all $n$ observations and rank them from 1 to $n$ (ties receive average ranks).
2. Compute the rank sum $W_i$ of each sample.
3. Test statistic:
$$T=\frac{12}{n(n+1)}\sum_{i=1}^k\frac1{n_i}\Big(W_i-n_i\frac{n+1}2\Big)^2 .$$
Here $n_i\frac{n+1}{2}$ is the rank sum expected under $H_0$, so $T$ measures the total squared deviation from it.
4. Reject $H_0$ if $T>\chi^2_{k-1,1-\alpha}$ (a chi-squared approximation that needs all $n_i\ge5$). With many ties a correction is needed.

See [Kruskal–Wallis test](https://en.wikipedia.org/wiki/Kruskal%E2%80%93Wallis_test).

### Which groups differ?

After a significant result, compare pairs using the adjusted level $\alpha^\circ=\frac{\alpha}{k(k-1)}$: groups $i$ and $j$ differ if
$$\Big|\frac{W_i}{n_i}-\frac{W_j}{n_j}\Big|\ \ge\ c_{1-\alpha^\circ}\sqrt{\frac{n(n+1)}{12}\Big(\frac1{n_i}+\frac1{n_j}\Big)},$$
where $c_{1-\alpha^\circ}$ is the $(1-\alpha^\circ)$ quantile of the standard normal distribution.

## Worked Example

Three groups of five exam scores each. Suppose group A occupies ranks 1 to 5, group B ranks 6 to 10 and group C ranks 11 to 15 (complete separation). Then $W_A=15$, $W_B=40$, $W_C=65$, $n=15$ and the expected rank sum is $5\cdot8=40$ for each group.
$$T=\frac{12}{15\cdot16}\cdot\frac15\big[(15-40)^2+0+(65-40)^2\big]=0.05\cdot0.2\cdot1250=12.5 .$$
Since $12.5>\chi^2_{2,0.95}=5.99$, reject $H_0$ ($p\approx0.002$). This is the largest value of $T$ possible for these sizes.

## Common Mistakes

- Forgetting that the approximation needs all $n_i\ge5$.
- Ranking within groups instead of in the pooled sample.
- Reading a significant result as "the medians differ" without checking that the distributions have a similar shape.

## When It's Used

Kruskal-Wallis compares three or more groups when normality is doubtful or data are ordinal: customer ratings across stores, response times across servers with heavy-tailed delays, exam grades across programs. It works on ranks, so outliers have limited influence.

**Exam tip:** rank all observations together, sum the ranks per group ($W_i$), compute $T = \frac{12}{n(n+1)}\sum \frac{1}{n_i}(W_i - n_i\frac{n+1}{2})^2$ and compare with $\chi^2_{k-1,1-\alpha}$ (needs $n_i \ge 5$). Pairwise comparisons use $\alpha^\circ = \alpha / (k(k-1))$.

## R Code

```r
set.seed(10)
g <- factor(rep(c("P1", "P2", "P3"), times = c(6, 7, 6)))
score <- c(rexp(6, 1/50), rexp(7, 1/80), rexp(6, 1/55))     # skewed exam scores

R <- rank(score); n <- length(score); n_i <- table(g)
W <- tapply(R, g, sum)
T_stat <- 12 / (n * (n + 1)) * sum((W - n_i * (n + 1) / 2)^2 / n_i)
c(T = T_stat, crit = qchisq(0.90, df = nlevels(g) - 1))

kruskal.test(score ~ g)                                     # same statistic (no ties)

# Pairwise comparisons with the adjusted level
alpha <- 0.1; k <- nlevels(g); a0 <- alpha / (k * (k - 1))
c_crit <- qnorm(1 - a0)
for (p in combn(levels(g), 2, simplify = FALSE)) {
  lhs <- abs(W[p[1]] / n_i[p[1]] - W[p[2]] / n_i[p[2]])
  rhs <- c_crit * sqrt(n * (n + 1) / 12 * (1 / n_i[p[1]] + 1 / n_i[p[2]]))
  cat(p, ":", round(lhs, 2), "vs", round(rhs, 2), "\n")
}
```

## Python Code

```python
import numpy as np
from itertools import combinations
from scipy import stats

rng = np.random.default_rng(10)
groups = {"P1": rng.exponential(50, 6), "P2": rng.exponential(80, 7), "P3": rng.exponential(55, 6)}
allv = np.concatenate(list(groups.values()))
R = stats.rankdata(allv); n = len(allv)
idx = np.cumsum([0] + [len(v) for v in groups.values()])
W = {k: R[idx[i]:idx[i + 1]].sum() for i, k in enumerate(groups)}
n_i = {k: len(v) for k, v in groups.items()}
T = 12 / (n * (n + 1)) * sum((W[k] - n_i[k] * (n + 1) / 2) ** 2 / n_i[k] for k in groups)
print("T =", T, " crit =", stats.chi2.ppf(0.90, 2))
print(stats.kruskal(*groups.values()))

alpha, k = 0.1, 3
c = stats.norm.ppf(1 - alpha / (k * (k - 1)))
for a, b in combinations(groups, 2):
    lhs = abs(W[a] / n_i[a] - W[b] / n_i[b])
    rhs = c * np.sqrt(n * (n + 1) / 12 * (1 / n_i[a] + 1 / n_i[b]))
    print(a, b, round(lhs, 2), "vs", round(rhs, 2))
```

## Practice Questions

*◆ original question from the course material · ✎ new question added for this site (worked solution below)*

- ◆ Practice Sheet 12, Problem 1 (b): (b) Test without Gaussianity at level $\alpha=0.1$...
- ✎ Four groups with $n_i=5$ each ($n=20$) have rank sums 30, 45, 60, 75. Compute $T$ and test at $\alpha=0.05$.

## Solutions

*✎ solution written for this site*

- ✎ Sheet 12, Problem 1 (b): Rank the pooled exam scores of the three programs, compute the rank sums $W_i$ and $T$, and compare with $\chi^2_{2,0.9}=4.61$ (level $\alpha=0.1$, $k=3$). The data table is not reproduced here.
- ✎ Q2 (new question): The expected rank sum is $5\cdot\frac{21}{2}=52.5$. Deviations: $-22.5,\,-7.5,\,7.5,\,22.5$; squares sum to $2\cdot506.25+2\cdot56.25=1125$. $T=\frac{12}{20\cdot21}\cdot\frac15\cdot1125=\frac{12}{420}\cdot225=6.43$. The critical value is $\chi^2_{3,0.95}=7.81$; since $6.43<7.81$ we cannot reject $H_0$.
