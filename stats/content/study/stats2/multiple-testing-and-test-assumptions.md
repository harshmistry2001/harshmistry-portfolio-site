# Multiple Testing and Test Assumptions

> Course part: Stats 2

## Overview

Two warnings for anyone who uses tests in practice. First: **every extra test is an extra chance of a false alarm**, so running many tests without correction produces "discoveries" from pure noise. Second: tests are only valid if their **assumptions** (such as normality) hold approximately, and you should check them.

## Concept

### The multiple testing problem

If one test is run at level $\alpha$ and $H_0$ is true, the chance of a false rejection is $\alpha$. For $m$ independent tests with all null hypotheses true, the probability of **at least one** false positive (the [family-wise error rate](https://en.wikipedia.org/wiki/Family-wise_error_rate), FWER) is
$$1-(1-\alpha)^m .$$
For $\alpha=0.05$ this is 0.40 for $m=10$ and 0.64 for $m=20$.

### Controlling the error

- **Bonferroni correction**: test each hypothesis at level $\alpha/m$, i.e. reject $H_i$ if $p_i<\alpha/m$. This guarantees FWER $\le\alpha$ (also under dependence) but is conservative.
- **[False discovery rate](https://en.wikipedia.org/wiki/False_discovery_rate) (FDR)**: controls the expected *proportion* of false rejections among all rejections; less strict than FWER and therefore more powerful. The Benjamini–Hochberg procedure sorts the p-values $p_{(1)}\le\dots\le p_{(m)}$ and rejects all hypotheses up to the largest $i$ with $p_{(i)}\le\frac{i}{m}\alpha$.

### Checking assumptions

- Gauß and t-tests for means are fairly **robust** to non-normality when $n$ is large (central limit theorem); tests for **variances** are very sensitive to non-normality.
- A [Q–Q plot](https://en.wikipedia.org/wiki/Q%E2%80%93Q_plot) compares the ordered data with theoretical quantiles. For a normal Q–Q plot, plot the sorted observations $x_{(i)}$ against $\Phi^{-1}(p_i)$ with plotting positions $p_i=\frac{i-0.5}{n}$. Points close to a straight line indicate that the normal model fits; curvature indicates skewness, S-shapes indicate heavy or light tails.

## Worked Example

Five p-values from five tests: $0.001,\ 0.008,\ 0.020,\ 0.040,\ 0.300$ ($\alpha=0.05$).

- **Bonferroni:** threshold $0.05/5=0.01$: reject the first two.
- **Benjamini–Hochberg:** thresholds $\frac i5\cdot0.05=0.01,\,0.02,\,0.03,\,0.04,\,0.05$. The p-values $0.001,0.008,0.020,0.040$ lie below their thresholds, $0.300$ does not: reject the first **four**.

Q–Q positions for $n=5$: $p_i=0.1,0.3,0.5,0.7,0.9$ giving the theoretical quantiles $-1.28,-0.52,0,0.52,1.28$.

## Common Mistakes

- Testing many hypotheses and reporting only the significant ones.
- Using Bonferroni when the number of tests is huge and a few false leads are acceptable (FDR would be better), or using FDR when any false positive is costly.
- Judging a Q–Q plot of a very small sample too strictly: with $n=5$ almost any pattern is possible.

## When It's Used

Running many tests inflates false discoveries: genomics screens thousands of genes, marketing teams test dozens of segments, dashboards flag many KPIs. Bonferroni (FWER) is used when any false positive is costly (clinical endpoints); FDR control (Benjamini-Hochberg) when a small share of false leads is acceptable (screening). QQ plots check the normality assumption behind t- and variance tests.

**Exam tip:** with $m$ independent tests at level $\alpha$, $P(\text{at least one false positive}) = 1 - (1-\alpha)^m$. Bonferroni: reject if $p_i < \alpha/m$. QQ plot positions: $p_i = (i - 0.5)/n$.

## R Code

```r
m <- 20; alpha <- 0.05
1 - (1 - alpha)^m                                # FWER without correction

set.seed(5)
p <- c(runif(17), 0.001, 0.004, 0.012)           # 17 true nulls, 3 real effects
data.frame(raw = p < alpha,
           bonferroni = p < alpha / m,
           BH = p.adjust(p, "BH") < alpha)[18:20, ]
sum(p < alpha)                                   # how many "discoveries" without correction

# Normal QQ plot by hand with plotting positions (i - 0.5) / n
x <- sort(rexp(25))
theo <- qnorm((seq_along(x) - 0.5) / length(x))
plot(theo, x, main = "QQ plot: exponential data vs normal", xlab = "theoretical", ylab = "sample")
abline(lm(x ~ theo))                              # curvature -> not normal
```

## Python Code

```python
import numpy as np
import matplotlib.pyplot as plt
from scipy import stats
from statsmodels.stats.multitest import multipletests

m, alpha = 20, 0.05
print("FWER without correction:", 1 - (1 - alpha) ** m)

rng = np.random.default_rng(5)
p = np.r_[rng.uniform(size=17), 0.001, 0.004, 0.012]
print("raw:", (p < alpha).sum())
print("bonferroni:", multipletests(p, alpha, method="bonferroni")[0].sum())
print("BH (FDR):  ", multipletests(p, alpha, method="fdr_bh")[0].sum())

x = np.sort(rng.exponential(size=25))
theo = stats.norm.ppf((np.arange(1, 26) - 0.5) / 25)
plt.scatter(theo, x)
plt.plot(theo, np.polyval(np.polyfit(theo, x, 1), theo))
plt.title("QQ plot: exponential data vs normal")
plt.show()
```

## Practice Questions

*◆ original question from the course material · ✎ new question added for this site (worked solution below)*

- ◆ Practice Sheet 11, Problem 1: To compare the age of students in two different study programs, five students in each of the programs are surveyed...
  - (a) Make a graphical comparison of the two data sets by drawing the blox-plots next to each other.
  - (b) Draw the normal-qq-plots for both data sets $(\Phi^{-1}(0.7)=0.52)$.
  - (c) Based on the qq-plots, use an appropriate test to decide whether there is a significant difference $(\alpha=10\%)$ of the ages for the two study programs.
- ✎ A marketing team tests 20 customer segments at $\alpha=0.05$ and finds 2 "significant" segments. If in truth no segment differs, how likely is it to see at least one significant result? What Bonferroni threshold would you use?
- ✎ Six p-values are $0.004,\ 0.011,\ 0.012,\ 0.030,\ 0.200,\ 0.600$. Which hypotheses are rejected at $\alpha=0.05$ by Bonferroni and by Benjamini–Hochberg?

## Solutions

*✎ solution written for this site*

- ✎ Sheet 11, Problem 1: (a) Draw one box for each program on a common axis (median, quartiles, whiskers). (b) Sort each sample, plot $x_{(i)}$ against $\Phi^{-1}(0.1),\Phi^{-1}(0.3),\Phi^{-1}(0.5),\Phi^{-1}(0.7),\Phi^{-1}(0.9)=-1.28,-0.52,0,0.52,1.28$; roughly straight lines support normality. (c) If both Q–Q plots look approximately straight, compare the two programs with a two-sample t-test (Welch if the variances differ) at $\alpha=0.10$; otherwise use the Wilcoxon rank-sum test. The data table is not reproduced here.
- ✎ Q2 (new question): $P(\text{at least one false positive})=1-0.95^{20}\approx0.64$; Bonferroni threshold $0.05/20=0.0025$. The two "discoveries" must have $p<0.0025$ to be believed.
- ✎ Q3 (new question): Bonferroni: threshold $0.05/6\approx0.0083$: only $0.004$ is rejected. Benjamini–Hochberg thresholds $\frac i6\cdot0.05=0.0083,\,0.0167,\,0.025,\,0.0333,\,0.0417,\,0.05$: $0.004\le0.0083$ ✓, $0.011\le0.0167$ ✓, $0.012\le0.025$ ✓, $0.030\le0.0333$ ✓, $0.200>0.0417$ ✗: the first **four** are rejected. FDR control rejects more than Bonferroni.
