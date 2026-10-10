# Chi-square goodness-of-fit test

> Course part: Stats 2

## Overview

Before relying on a model you should check that it fits. Is this die fair? Are the arrivals Poisson? Do default classes occur in the proportions 9:3:3:1? The **$\chi^2$ goodness-of-fit test** compares the observed counts in $s$ categories with the counts expected under the hypothesised distribution.

## Concept

### Test

Observations fall into $s$ categories with counts $n_1,\dots,n_s$ ($\sum n_j=n$). Under $H_0$ the category probabilities are $q_1,\dots,q_s$, so the expected counts are $nq_j$.
$$H_0:\ p_j=q_j\ (j=1,\dots,s),\qquad X^2=\sum_{j=1}^s\frac{(n_j-nq_j)^2}{nq_j}=\frac1n\sum_{j=1}^s\frac{n_j^2}{q_j}-n .$$
Under $H_0$, $X^2$ is approximately $\chi^2_{s-1}$-distributed ([Pearson's chi-squared test](https://en.wikipedia.org/wiki/Pearson's_chi-squared_test)); reject if $X^2>\chi^2_{s-1,1-\alpha}$.

- **Rule of thumb:** all expected frequencies $nq_j\ge5$; otherwise merge neighbouring categories.
- **Composite hypotheses:** if the hypothesised distribution has parameters that are estimated from the data (for instance $\lambda$ of a Poisson distribution), reduce the degrees of freedom:
$$df=s-1-(\text{number of estimated parameters}).$$
- Continuous or count data must first be grouped into categories.
- **Not rejecting does not prove $H_0$**: it only means that the data are compatible with it.

## Worked Example

A die is rolled $n=120$ times: counts for faces 1 to 6 are 25, 17, 15, 23, 24, 16. Under fairness $q_j=\frac16$ and the expected count is 20 per face.
$$X^2=\frac{5^2+3^2+5^2+3^2+4^2+4^2}{20}=\frac{100}{20}=5.0 .$$
$df=5$, $\chi^2_{5,0.95}=11.07$; since $5.0<11.07$ ($p\approx0.42$) we cannot reject fairness.

**Composite example.** To test whether call durations are Poisson, estimate $\hat\lambda=\overline x$ from the data, group into $s=6$ categories and use $df=6-1-1=4$.

## Common Mistakes

- Forgetting to reduce the degrees of freedom when parameters were estimated.
- Using the test with expected counts well below 5.
- Treating a non-significant result as evidence that the distribution is correct.
- Using percentages instead of counts.

## When It's Used

Goodness-of-fit tests check whether data follow an assumed distribution: are default classes in the expected 9:3:3:1 proportions, are call durations geometric, are arrivals Poisson, is a die fair? Actuaries, reliability engineers and fraud analysts (Benford's law) use it before relying on a model.

**Exam tip:** expected counts $n q_j$ must be $\ge 5$ (merge categories otherwise). Degrees of freedom $= s - 1 - $ (number of parameters estimated from the data). Not rejecting does **not** prove $H_0$.

## R Code

```r
# Practice Sheet 14, Problem 1: credit risk classes with odds 9:3:3:1
counts <- c(A = 95, B = 38, C = 26, D = 9)              # example observed counts
q <- c(9, 3, 3, 1) / 16
X2 <- sum((counts - sum(counts) * q)^2 / (sum(counts) * q))
c(X2 = X2, crit = qchisq(0.90, df = length(q) - 1))
chisq.test(counts, p = q)

# Composite hypothesis: geometric distribution for 80 call durations (minutes)
dur <- rep(0:6, times = c(22, 19, 13, 10, 7, 5, 4))     # example data, n = 80
p_hat <- 1 / (1 + mean(dur))                            # MLE, geometric counting failures
probs <- dgeom(0:4, p_hat); probs <- c(probs, 1 - sum(probs))   # last class: 5 or more
obs <- c(table(factor(pmin(dur, 5), levels = 0:5)))
exp_ <- length(dur) * probs
rbind(obs, expected = round(exp_, 1))
X2g <- sum((obs - exp_)^2 / exp_)
df <- length(obs) - 1 - 1                               # one estimated parameter
c(X2 = X2g, df = df, crit = qchisq(0.95, df))
```

## Python Code

```python
import numpy as np
from scipy import stats

counts = np.array([95, 38, 26, 9])
q = np.array([9, 3, 3, 1]) / 16
print(stats.chisquare(counts, f_exp=counts.sum() * q), " crit:", stats.chi2.ppf(0.90, 3))

dur = np.repeat(np.arange(7), [22, 19, 13, 10, 7, 5, 4])
p_hat = 1 / (1 + dur.mean())
G = stats.geom(p_hat, loc=-1)                           # counts failures
probs = np.r_[G.pmf(np.arange(5)), G.sf(4)]             # last class: 5 or more
obs = np.bincount(np.minimum(dur, 5), minlength=6)
exp_ = len(dur) * probs
X2 = ((obs - exp_) ** 2 / exp_).sum()
print("obs:", obs, " expected:", exp_.round(1))
print("X2 =", X2, " df = 4  crit =", stats.chi2.ppf(0.95, 4))
print(stats.chisquare(obs, exp_, ddof=1))               # ddof=1 for the estimated p
```

## Practice Questions

*◆ original question from the course material · ✎ new question added for this site (worked solution below)*

- ◆ Practice Sheet 14, Problem 1: The credit department of a bank investigates the default risk for their loans and arrived at the following classification... Test at level $\alpha=0.1$ that the odds of the different credit risks are $9:3:3:1$. Note: Odds are a way to compare the probabilities of different outcomes by only looking at their ratios.
- ◆ Practice Sheet 14, Problem 2: The following table reports the durations of 80 phone calls (rounded to full minutes)... Check if the durations follow a geometric distribution.
- ✎ In a genetics experiment 160 plants are classified into four types with observed counts 85, 33, 28, 14. Test at $\alpha=0.10$ whether the types occur in the ratio 9:3:3:1.

## Solutions

*✎ solution written for this site*

*Sheet 14 Problems 1 and 2 refer to tables that are not reproduced here and are answered by method.*

- ✎ Sheet 14, Problem 1: $H_0$: the four risk classes have probabilities $\frac9{16},\frac3{16},\frac3{16},\frac1{16}$. Expected counts are $n$ times these probabilities. Compute $X^2$ and compare with $\chi^2_{3,0.9}=6.25$ (level $\alpha=0.1$, $df=s-1=3$).
- ✎ Sheet 14, Problem 2: For the geometric distribution (number of failures before the first success) estimate $\hat p=\frac1{1+\overline x}$ from the data. Compute the expected counts $80\cdot(1-\hat p)^k\hat p$ for $k=0,1,\dots$, merge tail categories so that every expected count is at least 5, compute $X^2$ and use $df=s-1-1$ (one estimated parameter).
- ✎ Q3 (new question): Expected counts $160\cdot\frac{9}{16}=90$, $30$, $30$, $10$. $X^2=\frac{25}{90}+\frac{9}{30}+\frac{4}{30}+\frac{16}{10}=0.278+0.3+0.133+1.6=2.31$. $df=3$, $\chi^2_{3,0.9}=6.25$: not rejected ($p\approx0.51$); the data are compatible with 9:3:3:1.
