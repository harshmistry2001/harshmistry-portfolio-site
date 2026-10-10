# $\chi^2$-test of homogeneity and independence

> Course part: Stats 2

## Overview

This practice topic puts the two $\chi^2$ tests for contingency tables side by side. They use **exactly the same calculation** but answer different questions depending on how the data were collected. The skill being trained is choosing the right wording for $H_0$ and the right conclusion.

## Concept

| | Homogeneity | Independence |
|---|---|---|
| Design | $k$ **fixed groups** sampled separately | **one** random sample classified by two variables |
| $H_0$ | all groups have the same distribution over the $m$ categories | the two variables are independent |
| Typical wording | "purchases are distributed identically in regions A, B and C" | "interest in cycling does not depend on age" |

For both, with counts $n_{il}$ in a $k\times m$ table, expected counts $\frac{n_{i+}n_{+l}}{n}$ and
$$X^2=\sum_{i=1}^k\sum_{l=1}^m\frac{\big(n_{il}-\frac{n_{i+}n_{+l}}{n}\big)^2}{\frac{n_{i+}n_{+l}}{n}},\qquad df=(k-1)(m-1),$$
reject when $X^2>\chi^2_{df,1-\alpha}$ (see the [chi-squared test](https://en.wikipedia.org/wiki/Chi-squared_test)).

**Procedure:** (1) decide which design applies and write $H_0$ in words, (2) compute row and column totals, (3) compute the expected counts and check they are at least about 5, (4) compute $X^2$, (5) compare with the critical value and state the conclusion in the language of the design.

## When It's Used

This practice topic puts both $\chi^2$ tests side by side. The arithmetic is identical; what changes is the design (fixed group sizes vs. one random sample classified twice) and therefore the hypothesis you state and the conclusion you write.

**Exam tip:** write $H_0$ in words that match the design — "the distribution of purchases is the same in regions A, B and C" (homogeneity) vs. "interest in cycling and age are independent" (independence). Then compute expected counts, $X^2$, df $=(k-1)(m-1)$ and compare with $\chi^2_{df,1-\alpha}$.

## R Code

```r
chi2_by_hand <- function(obs, alpha = 0.05) {
  e <- outer(rowSums(obs), colSums(obs)) / sum(obs)
  X2 <- sum((obs - e)^2 / e)
  df <- (nrow(obs) - 1) * (ncol(obs) - 1)
  c(X2 = X2, df = df, crit = qchisq(1 - alpha, df), reject = X2 > qchisq(1 - alpha, df))
}

# Homogeneity: three regions with fixed sample sizes
regions <- matrix(c(120, 150, 80, 100, 170, 60, 140, 120, 60), 3, byrow = TRUE)
chi2_by_hand(regions)

# Independence: one random sample of 395 people classified by interest and age
cycling <- matrix(c(40, 55, 30, 45, 50, 45, 20, 40, 70), 3, byrow = TRUE)
chi2_by_hand(cycling, alpha = 0.05)
```

## Python Code

```python
import numpy as np
from scipy import stats

def chi2_by_hand(obs, alpha=0.05):
    obs = np.asarray(obs)
    e = np.outer(obs.sum(1), obs.sum(0)) / obs.sum()
    X2 = ((obs - e) ** 2 / e).sum()
    df = (obs.shape[0] - 1) * (obs.shape[1] - 1)
    crit = stats.chi2.ppf(1 - alpha, df)
    return dict(X2=round(X2, 3), df=df, crit=round(crit, 3), reject=X2 > crit)

print("homogeneity: ", chi2_by_hand([[120, 150, 80], [100, 170, 60], [140, 120, 60]]))
print("independence:", chi2_by_hand([[40, 55, 30], [45, 50, 45], [20, 40, 70]]))
```

## Practice Questions

*◆ original question from the course material · ✎ new question added for this site (worked solution below)*

- ◆ Practice Sheet 13, Problem 1: In three different regions (A,B,C) a total number of 1000 persons is surveyed on their monthly purchases of products of a certain category. The possible answers are "0-1", "2-3" and "4 and more" purchases per month. Absolute frequencies and the expected values (grey) assuming equal distributions among the regions, are given in the following table...
- ◆ Practice Sheet 13, Problem 2: A group of psychologists claims that the interest to ride a bicycle does not depend on age. A random sample of 395 people was surveyed. All the people were asked about their interest in riding a bicycle and their age. The data that resulted from the survey are summarized in the following table... At a level of 5%, is there significant evidence for rejecting the psychologists' claim?
- ✎ For each situation say whether a homogeneity or an independence test is appropriate and state $H_0$: (a) 500 randomly chosen employees are asked about their department and their satisfaction level; (b) 200 customers are recruited in each of three cities and asked which of four brands they prefer.

## Solutions

*✎ solution written for this site*

*Sheet 13 Problems 1 and 2 depend on tables that are not reproduced here, so they are answered by method.*

- ✎ Sheet 13, Problem 1: Design: three fixed regions with a total of 1000 persons, so a **homogeneity** test. $H_0$: the distribution of monthly purchases ("0–1", "2–3", "4 and more") is the same in regions A, B and C. Compute $X^2$ from the table of observed and (given) expected counts, with $df=(3-1)(3-1)=4$ and compare with $\chi^2_{4,0.95}=9.49$ (for $\alpha=0.05$).
- ✎ Sheet 13, Problem 2: Design: one random sample of 395 people classified by interest in cycling and by age, so an **independence** test. $H_0$: interest in cycling and age are independent (the psychologists' claim). Compute the expected counts, $X^2$ and $df=(k-1)(m-1)$ and compare with $\chi^2_{df,0.95}$; reject the claim if $X^2$ is larger.
- ✎ Q3 (new question): (a) One random sample classified twice: **independence** test; $H_0$: satisfaction level and department are independent. (b) Three fixed groups (200 per city): **homogeneity** test; $H_0$: the brand preference distribution is the same in all three cities. For (b) $df=(3-1)(4-1)=6$.
