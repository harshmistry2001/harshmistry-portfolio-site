# Spearman Rank Correlation Coefficient

> Course part: Stats 1

## Overview

Pearson's coefficient only sees *linear* relationships and reacts strongly to outliers. **Spearman's rank correlation** replaces every value by its **rank** (1 for the smallest, 2 for the next, …) and then measures how well the two rankings agree. It detects any monotone relationship, works for ordinal data and is robust to outliers.

## Concept

### Ranks

Sort each variable separately and assign ranks $r_{x,i}$ and $r_{y,i}$. If several observations are tied, each receives the **average** of the ranks they occupy: the values 10, 20, 20, 30 get ranks 1, 2.5, 2.5, 4.

### Definition

With rank differences $d_i = r_{x,i} - r_{y,i}$ and **no ties**, the [Spearman rank correlation](https://en.wikipedia.org/wiki/Spearman's_rank_correlation_coefficient) is

$$r_{S,xy} = 1 - \frac{6\sum_{i=1}^{n} d_i^2}{n^3 - n}.$$

With ties, compute Pearson's $r$ on the ranks instead; the shortcut formula is then only approximate.

### Properties

- $-1 \le r_S \le 1$; $r_S = 1$ for any perfectly *increasing* relationship (not only linear), $-1$ for perfectly decreasing.
- Unchanged by any **strictly increasing** transformation of $x$ or $y$ (for example squaring positive values or taking logarithms).
- Applicable to **ordinal** data and robust against outliers, because only the order matters.

## Worked Example

Two judges rank five candidates:

| Candidate | A | B | C | D | E |
|---|---|---|---|---|---|
| Judge 1 | 1 | 2 | 3 | 4 | 5 |
| Judge 2 | 2 | 1 | 4 | 3 | 5 |
| $d_i$ | −1 | 1 | −1 | 1 | 0 |

$\sum d_i^2 = 4$, so $r_S = 1 - \dfrac{6\cdot4}{5^3-5} = 1 - \dfrac{24}{120} = 0.8$: the judges largely agree.

Outlier robustness: for $x = 1,2,3,4,100$ and $y = 2,4,6,8,10$ the relation is perfectly increasing, so $r_S = 1$, whereas Pearson's $r \approx 0.72$ is dragged down by the extreme value 100.

## Common Mistakes

- Giving tied values different ranks instead of the average rank.
- Using the shortcut formula when there are many ties.
- Treating $r_S=0$ as "no relationship": non-monotone relations (such as a U-shape) also give values near 0.

## When It's Used

Spearman's $r_S$ is used for ordinal data (rankings, Likert scales) and for monotone but non-linear or outlier-prone relationships: agreement of two judges' rankings, customer satisfaction vs. loyalty tiers, age vs. reaction time.

**Exam tip:** ties get the *average* rank. The shortcut $1 - \frac{6\sum d_i^2}{n^3 - n}$ is exact only without ties; with ties compute Pearson's $r$ on the ranks. $r_S$ is unchanged by any strictly increasing transformation (e.g. squaring positive values).

## R Code

```r
reaction <- c(0.42, 0.38, 0.51, 0.45, 0.60, 0.39, 0.55, 0.47, 0.44, 0.58, 0.40, 0.52)
age      <- c(19, 22, 31, 25, 45, 22, 38, 29, 27, 41, 20, 33)

r_x <- rank(reaction)          # ties -> average rank
r_y <- rank(age)
cbind(reaction, r_x, age, r_y)

d <- r_x - r_y
n <- length(d)
c(shortcut = 1 - 6 * sum(d^2) / (n^3 - n),
  pearson_on_ranks = cor(r_x, r_y),
  cor_spearman = cor(reaction, age, method = "spearman"))

# Invariance under strictly increasing transformations
cor(reaction^2, log(age), method = "spearman")
```

## Python Code

```python
import numpy as np
from scipy import stats

reaction = np.array([0.42, 0.38, 0.51, 0.45, 0.60, 0.39, 0.55, 0.47, 0.44, 0.58, 0.40, 0.52])
age = np.array([19, 22, 31, 25, 45, 22, 38, 29, 27, 41, 20, 33])

r_x = stats.rankdata(reaction)          # 'average' method for ties
r_y = stats.rankdata(age)
d = r_x - r_y
n = len(d)
print("shortcut:        ", 1 - 6 * np.sum(d**2) / (n**3 - n))
print("pearson on ranks:", np.corrcoef(r_x, r_y)[0, 1])
print("scipy spearmanr: ", stats.spearmanr(reaction, age).statistic)
print("after monotone transforms:", stats.spearmanr(reaction**2, np.log(age)).statistic)
```

## Practice Questions

*✎ new question added for this site (worked solution below)*

- ✎ For $n=6$ pairs the squared rank differences sum to $\sum d_i^2 = 14$. Compute $r_S$.
- ✎ Assign ranks to the values 7, 3, 3, 9.
- ✎ If $r_S(x,y) = 0.5$, what is $r_S(x^3, y)$ for positive $x$?

## Solutions

*✎ solution written for this site*

- ✎ Q1: $r_S = 1 - 6\cdot14/(6^3-6) = 1 - 84/210 = 0.6$.
- ✎ Q2: Sorted: 3, 3, 7, 9. The two 3s occupy ranks 1 and 2 and get 1.5 each; 7 gets rank 3; 9 gets rank 4. So the ranks are 3, 1.5, 1.5, 4.
- ✎ Q3: $x\mapsto x^3$ is strictly increasing on positive numbers, so the ranks do not change and $r_S$ stays $0.5$.
