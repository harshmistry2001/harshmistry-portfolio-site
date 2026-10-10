# Simultaneous comparisons (Tukey-Kramer method)

> Course part: Stats 2

## Overview

A significant ANOVA says that *not all* group means are equal, but not **which** ones differ. Comparing every pair with ordinary t-tests would raise the overall false-alarm probability (the multiple testing problem). The **Tukey–Kramer method** compares all pairs *simultaneously* so that the probability of even one false rejection stays at most $\alpha$.

## Concept

After a one-way ANOVA with $k$ groups, group sizes $n_i$, total $n$, the pairwise means $\overline X_{i+}$ and $\overline X_{j+}$ are declared significantly different if
$$\big|\overline X_{i+}-\overline X_{j+}\big|>d(i,j),$$
with the critical difference
$$d(i,j)=q_{k,\,n-k,\,1-\alpha}\ \sqrt{\frac{SSW}{n-k}\cdot\frac12\Big(\frac1{n_i}+\frac1{n_j}\Big)} .$$

- $q_{k,n-k,1-\alpha}$ is a quantile of the [studentized range distribution](https://en.wikipedia.org/wiki/Studentized_range_distribution) (tables; `qtukey` in R, `studentized_range` in SciPy).
- $SSW/(n-k)$ is the pooled within-group variance estimate from the ANOVA.
- The method is called Tukey–Kramer (instead of just Tukey) because the factor $\frac12(\frac1{n_i}+\frac1{n_j})$ allows **unequal group sizes**.
- It controls the family-wise error rate at $\alpha$; it is more powerful than Bonferroni-corrected t-tests for all pairwise comparisons.

## Worked Example

Continue the ANOVA example (groups A, B, C with means 6, 9, 5; $SSW=6$, $n-k=6$, $n_i=3$). With $q_{3,6,0.95}=4.339$:
$$d=4.339\sqrt{\frac66\cdot\frac12\Big(\frac13+\frac13\Big)}=4.339\cdot0.577=2.505 .$$

| Pair | Difference | Significant? |
|---|---|---|
| B − A | 3 | yes (3 > 2.505) |
| B − C | 4 | yes |
| A − C | 1 | no |

So program B differs from both others, while A and C cannot be distinguished.

## Common Mistakes

- Running the comparisons even though the overall ANOVA was not significant.
- Using the ordinary $t$ quantile instead of the studentized range quantile.
- Interpreting "not significantly different" as "equal".

## When It's Used

After ANOVA says "not all means are equal", management wants to know *which* groups differ: which branches, which cities, which drug doses. Tukey-Kramer compares all pairs while keeping the family-wise error at $\alpha$, unlike naive pairwise t-tests.

**Exam tip:** compute the critical difference $d(i,j) = q_{k,n-k,1-\alpha}\sqrt{\frac{SSW}{n-k}\cdot\frac12\left(\frac1{n_i}+\frac1{n_j}\right)}$ for each pair and flag $|\bar X_{i+} - \bar X_{j+}| > d(i,j)$. $q$ comes from the studentized range table (`qtukey`).

## R Code

```r
set.seed(8)
tourists <- data.frame(city = factor(rep(c("A", "B", "C", "D"), times = c(5, 6, 5, 6))),
                       n = c(rnorm(5, 120, 10), rnorm(6, 150, 10), rnorm(5, 125, 10), rnorm(6, 160, 10)))
fit <- aov(n ~ city, data = tourists)

# By hand with the course formula
k <- 4; N <- nrow(tourists); alpha <- 0.05
SSW <- sum(resid(fit)^2)
q <- qtukey(1 - alpha, nmeans = k, df = N - k)
means <- tapply(tourists$n, tourists$city, mean); n_i <- table(tourists$city)
pairs <- combn(levels(tourists$city), 2)
res <- apply(pairs, 2, function(p) {
  d <- q * sqrt(SSW / (N - k) * 0.5 * (1 / n_i[p[1]] + 1 / n_i[p[2]]))
  diff <- means[p[1]] - means[p[2]]
  c(diff = unname(diff), d = unname(d), significant = abs(diff) > d)
})
colnames(res) <- apply(pairs, 2, paste, collapse = "-")
round(res, 2)

TukeyHSD(fit, conf.level = 0.95)                   # built-in, same decisions
```

## Python Code

```python
import numpy as np
import pandas as pd
from itertools import combinations
from scipy import stats
from statsmodels.stats.multicomp import pairwise_tukeyhsd

rng = np.random.default_rng(8)
sizes, mus = [5, 6, 5, 6], [120, 150, 125, 160]
df = pd.DataFrame({"city": np.repeat(list("ABCD"), sizes),
                   "n": np.concatenate([rng.normal(m, 10, s) for m, s in zip(mus, sizes)])})

k, N = 4, len(df)
g = df.groupby("city")["n"]
SSW = ((df.n - g.transform("mean")) ** 2).sum()
q = stats.studentized_range.ppf(0.95, k, N - k)
for a, b in combinations("ABCD", 2):
    d = q * np.sqrt(SSW / (N - k) * 0.5 * (1 / g.size()[a] + 1 / g.size()[b]))
    diff = g.mean()[a] - g.mean()[b]
    print(f"{a}-{b}: diff={diff:7.2f}  d={d:6.2f}  significant={abs(diff) > d}")

print(pairwise_tukeyhsd(df.n, df.city, alpha=0.05))
```

## Practice Questions

*◆ original question from the course material · ✎ new question added for this site (worked solution below)*

- ◆ Practice Sheet 12, Problem 2 (b): (b) If there is a significant difference, which of the cities differ? Test simultaneously at level $\alpha=0.05$.
- ✎ In the machine example (means 11, 14, 11; $SSW=6$, $n-k=6$, $n_i=3$, $q_{3,6,0.95}=4.339$) find out which machines differ at $\alpha=0.05$.

## Solutions

*✎ solution written for this site*

- ✎ Sheet 12, Problem 2 (b): Take $SSW$, $n-k$ and the city sample sizes from the ANOVA in part (a), look up $q_{k,n-k,0.95}$, compute $d(i,j)$ for every pair of cities and mark the pairs with $|\overline x_{i+}-\overline x_{j+}|>d(i,j)$ as significantly different.
- ✎ Q2 (new question): $d=4.339\cdot\sqrt{1\cdot\frac12\cdot\frac23}=2.505$. Differences: machine 2 vs 1: 3; machine 2 vs 3: 3; machine 1 vs 3: 0. Machine 2 differs significantly from both others (3 > 2.505), machines 1 and 3 do not differ.
