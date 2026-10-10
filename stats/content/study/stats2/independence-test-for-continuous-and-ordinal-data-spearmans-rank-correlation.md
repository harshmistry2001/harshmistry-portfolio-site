# Independence test for continuous and ordinal data (Spearman's rank correlation)

> Course part: Stats 2

## Overview

Pearson's correlation test needs normal data. When the data are ordinal (ratings, rankings), contain outliers, or are related in a curved but steadily increasing way, use the **Spearman rank correlation test**. It works only with the ranks of the observations, so it makes no assumption about the shape of the distribution.

## Concept

### Rank correlation

Rank the $x$-values and the $y$-values separately (ties receive average ranks) and let $D_i=R_{x,i}-R_{y,i}$ be the rank differences. Spearman's coefficient is
$$R_{S,xy}=1-\frac{6\sum_{i=1}^nD_i^2}{n^3-n}\in[-1,1].$$
It measures **monotone** dependence: $+1$ if one variable is a strictly increasing function of the other. It is robust against outliers and unchanged by any strictly increasing transformation of the data. See [Spearman's rank correlation coefficient](https://en.wikipedia.org/wiki/Spearman's_rank_correlation_coefficient).

### Test

$$H_0:\ X,Y\text{ are independent (no monotone dependence)}\quad\text{vs.}\quad H_1:\ \text{they are dependent.}$$
Test statistic $T=R_{S,xy}\sqrt{n-1}$, which is approximately $N(0,1)$ under $H_0$ for $n\ge30$. Reject if $|T|>z_{1-\alpha/2}$. For small samples exact tables are used.

**Important:** a significant rank correlation shows association only. Countries with more TV sets per 1000 inhabitants tend to have higher life expectancy, but TVs do not make people live longer: national wealth drives both.

## Worked Example

For $n=8$ pairs the squared rank differences sum to $\sum D_i^2=40$:
$$R_S=1-\frac{6\cdot40}{8^3-8}=1-\frac{240}{504}=0.524 .$$
For a larger study, $n=32$ countries with $R_S=0.45$: $T=0.45\sqrt{31}=2.51>1.96$, so the hypothesis of independence is rejected at the 5% level.

## Common Mistakes

- Using the normal approximation for small $n$.
- Giving tied values different ranks instead of average ranks.
- Interpreting a significant $R_S$ causally.
- Using $\sqrt{n-2}$ (Pearson test) in place of $\sqrt{n-1}$.

## When It's Used

The Spearman test detects monotone dependence without assuming normality: TV sets per 1,000 people vs. life expectancy, ranking agreement between two raters, income bracket vs. satisfaction level. It is robust to outliers and to any increasing transformation of the data.

**Exam tip:** compute $R_S$ from rank differences, then $T = R_S\sqrt{n-1}$ and reject if $|T| > z_{1-\alpha/2}$ (for $n \ge 30$). A strong rank correlation between TV sets and life expectancy does not mean TVs cause longevity — wealth drives both.

## R Code

```r
set.seed(13)
n <- 32
tv <- round(rlnorm(n, log(200), 0.9))                         # TV sets per 1000 people
life <- round(55 + 5 * log(tv) + rnorm(n, 0, 3), 1)          # life expectancy

d <- rank(tv) - rank(life)
r_s <- 1 - 6 * sum(d^2) / (n^3 - n)
T_stat <- r_s * sqrt(n - 1)
c(r_s = r_s, T = T_stat, crit = qnorm(0.975), p = 2 * pnorm(-abs(T_stat)))

cor(tv, life, method = "spearman")                           # equals r_s without ties
plot(rank(tv), rank(life), xlab = "rank TV sets", ylab = "rank life expectancy")
```

## Python Code

```python
import numpy as np
from scipy import stats

rng = np.random.default_rng(13)
n = 32
tv = np.round(rng.lognormal(np.log(200), 0.9, n))
life = np.round(55 + 5 * np.log(tv) + rng.normal(0, 3, n), 1)

d = stats.rankdata(tv) - stats.rankdata(life)
r_s = 1 - 6 * np.sum(d**2) / (n**3 - n)
T = r_s * np.sqrt(n - 1)
print(f"r_s={r_s:.4f} T={T:.3f} crit={stats.norm.ppf(0.975):.3f} p={2 * stats.norm.sf(abs(T)):.4g}")
print(stats.spearmanr(tv, life))
```

## Practice Questions

*◆ original question from the course material · ✎ new question added for this site (worked solution below)*

- ◆ Practice Sheet 14, Problem 4: The following table shows the average number of TV sets per 1000 people and the life expectancy (in years) for 32 countries...
- ✎ In a survey of $n=40$ people the Spearman correlation between income class and satisfaction is $R_S=0.25$. Test independence at $\alpha=0.05$.

## Solutions

*✎ solution written for this site*

- ✎ Sheet 14, Problem 4: Rank the TV figures and the life expectancies separately (average ranks for ties), compute $D_i$, $R_S=1-\frac{6\sum D_i^2}{32^3-32}$ and $T=R_S\sqrt{31}$; reject independence if $|T|>1.96$ (level 5%). Interpret the result as association, not causation. The data table is not reproduced here.
- ✎ Q2 (new question): $T=0.25\sqrt{39}=1.56<1.96$: do not reject. With $n=40$ a rank correlation of 0.25 is not significant at the 5% level.
