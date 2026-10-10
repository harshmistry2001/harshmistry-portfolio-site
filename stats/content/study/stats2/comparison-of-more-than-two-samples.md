# Comparison of More Than Two Samples

> Course part: Stats 2

## Overview

With two groups a t-test is enough. With three or more groups (three bakery branches, three exam-preparation programs) running all pairwise t-tests would inflate the chance of a false alarm. **One-way analysis of variance (ANOVA)** compares all group means in a single test. This page also covers the Wilcoxon rank-sum test, the rank-based alternative for two groups.

## Concept

### Wilcoxon rank-sum (Mann–Whitney) test

For two independent samples, combine and rank all observations from smallest to largest. The statistic $W=\sum_{i=1}^{n}R_{Z,i}$ is the sum of the ranks of the first sample. If both groups come from the same distribution, $W$ is close to its expected value; very large or small values of $W$ speak against $H_0$. It needs no normality assumption. Ties get average ranks.

### One-way ANOVA

Observations $X_{ij}$ ($i=1,\dots,k$ groups, $j=1,\dots,n_i$ values, $n=\sum n_i$ in total) are modelled as independent $N(\mu_i,\sigma^2)$: normal with a common variance. Test
$$H_0:\ \mu_1=\dots=\mu_k\quad\text{vs.}\quad H_1:\ \text{at least two means differ.}$$

The idea of [analysis of variance](https://en.wikipedia.org/wiki/Analysis_of_variance) is to split the total variation:

$$SSB=\sum_{i=1}^k n_i(\overline X_{i+}-\overline X_{++})^2\ \ (\text{between groups}),\qquad SSW=\sum_{i=1}^k\sum_{j=1}^{n_i}(X_{ij}-\overline X_{i+})^2\ \ (\text{within groups}).$$

Here $\overline X_{i+}$ is the mean of group $i$ and $\overline X_{++}$ the overall mean. The test statistic is the ratio of the mean squares,
$$F=\frac{SSB/(k-1)}{SSW/(n-k)}\ \sim\ F_{k-1,\,n-k}\ \text{under } H_0,$$
and $H_0$ is rejected if $F>F_{k-1,n-k,1-\alpha}$. Intuition: if the group means differ, the variation *between* groups is large compared with the random variation *within* groups.

**Assumptions:** independent observations, normal distribution in each group, **equal variances**. A significant result only says that *some* means differ; to find out which, use simultaneous comparisons (Tukey–Kramer, next topic).

## Worked Example

Exam scores for three preparation programs:

| Program | Scores | Mean |
|---|---|---|
| A | 5, 7, 6 | 6 |
| B | 8, 9, 10 | 9 |
| C | 4, 5, 6 | 5 |

Grand mean $=60/9=6.67$. $SSB=3\big[(6-6.67)^2+(9-6.67)^2+(5-6.67)^2\big]=26$ with $k-1=2$ degrees of freedom; $SSW=2+2+2=6$ with $n-k=6$.
$$F=\frac{26/2}{6/6}=13>F_{2,6,0.95}=5.14$$
Reject $H_0$ ($p\approx0.007$): the programs lead to different mean scores.

Wilcoxon: for $X=1.2,\,2.2,\,3.4$ and $Y=2.8,\,4.1,\,5.0$ the pooled ranks of $X$ are 1, 2, 4, so $W=7$ (expected value under $H_0$ is $3\cdot7/2=10.5$).

## Common Mistakes

- Running multiple t-tests instead of ANOVA, or interpreting a significant ANOVA as "all means differ".
- Ignoring the equal-variance assumption when group sizes are very unequal.
- Mixing up the two degrees of freedom: numerator $k-1$, denominator $n-k$.

## When It's Used

One-way ANOVA compares the means of three or more groups in one test: sales across store formats, yields across fertilisers, exam scores across preparation programs. Running all pairwise t-tests instead would inflate the type-I error. The Wilcoxon rank-sum test (two groups) is the rank-based alternative when normality fails.

**Exam tip:** build the table — $SSB$ with $k-1$ df, $SSW$ with $n-k$ df, $F = \frac{SSB/(k-1)}{SSW/(n-k)}$, reject if $F > F_{k-1,n-k,1-\alpha}$. Assumptions: independence, normality, **equal variances**.

## R Code

```r
set.seed(7)
returns <- data.frame(
  branch = factor(rep(c("North", "Centre", "South"), each = 6)),
  value  = c(rnorm(6, 52, 4), rnorm(6, 58, 4), rnorm(6, 50, 4))   # monthly returns, 1000 EUR
)

# By hand
k <- nlevels(returns$branch); n <- nrow(returns)
grand <- mean(returns$value)
means <- tapply(returns$value, returns$branch, mean)
n_i <- table(returns$branch)
SSB <- sum(n_i * (means - grand)^2)
SSW <- sum((returns$value - means[returns$branch])^2)
F_stat <- (SSB / (k - 1)) / (SSW / (n - k))
c(SSB = SSB, SSW = SSW, F = F_stat, crit = qf(0.90, k - 1, n - k),
  p = pf(F_stat, k - 1, n - k, lower.tail = FALSE))

summary(aov(value ~ branch, data = returns))           # same table
boxplot(value ~ branch, data = returns)
```

## Python Code

```python
import numpy as np
import pandas as pd
from scipy import stats
import statsmodels.api as sm
from statsmodels.formula.api import ols

rng = np.random.default_rng(7)
df = pd.DataFrame({
    "branch": np.repeat(["North", "Centre", "South"], 6),
    "value": np.r_[rng.normal(52, 4, 6), rng.normal(58, 4, 6), rng.normal(50, 4, 6)],
})

k, n = df.branch.nunique(), len(df)
g = df.groupby("branch")["value"]
SSB = (g.size() * (g.mean() - df.value.mean()) ** 2).sum()
SSW = ((df.value - g.transform("mean")) ** 2).sum()
F = (SSB / (k - 1)) / (SSW / (n - k))
print(f"SSB={SSB:.2f} SSW={SSW:.2f} F={F:.3f} crit={stats.f.ppf(0.90, k - 1, n - k):.3f}")

print(stats.f_oneway(*[v.values for _, v in g]))
print(sm.stats.anova_lm(ols("value ~ C(branch)", data=df).fit()))
```

## Practice Questions

*◆ original question from the course material · ✎ new question added for this site (worked solution below)*

- ◆ Practice Sheet 11, Problem 2: A backery chain has three branches in different areas of a city and wants to know whether the monthly returns differ between those branches. The following numbers are reported (in 1000 euros)...
- ◆ Practice Sheet 12, Problem 1 (a): The examination office in a university would like to know whether the three different exam preparation programs lead to different mean scores on a math exam. To test this, students were randomly selected to participate in the study...
  - (a) Assuming that students grades are normally distributed with equal variances, test at level 10% if there is a significant difference in the grades.
- ◆ Practice Sheet 12, Problem 2 (a):
  - (a) Test at level $\alpha=0.05$, if there is a significant difference in the tourists numbers. Assume that the numbers of tourists are independent normally distributed with equal variances.
- ✎ Three machines produce the following part diameters (mm): machine 1: 10, 12, 11; machine 2: 14, 15, 13; machine 3: 11, 10, 12. Test at $\alpha=0.05$ whether the mean diameters differ.

## Solutions

*✎ solution written for this site*

*Sheet 11 Problem 2 and Sheet 12 Problems 1(a), 2(a) refer to data tables that are not reproduced here; the procedure is described.*

- ✎ Sheet 11, Problem 2 and Sheet 12, Problems 1(a), 2(a): Compute the group means $\overline x_{i+}$, the overall mean $\overline x_{++}$, then $SSB$ and $SSW$. Form $F=\frac{SSB/(k-1)}{SSW/(n-k)}$ and reject the equality of all means if $F>F_{k-1,n-k,1-\alpha}$ (for Sheet 12 Problem 1(a) use $\alpha=0.10$, for Problem 2(a) $\alpha=0.05$; $k=3$ groups in each case).
- ✎ Q4 (new question): Group means 11, 14, 11; grand mean 12. $SSB=3[(11-12)^2+(14-12)^2+(11-12)^2]=18$ with 2 df. Within each machine the squared deviations from the machine mean add up to 2 (for machine 1: $(-1)^2+1^2+0^2$, and likewise for the others), so $SSW=2+2+2=6$ with 6 df. $F=\frac{18/2}{6/6}=9>F_{2,6,0.95}=5.14$: reject $H_0$; the machines differ ($p\approx0.016$).
