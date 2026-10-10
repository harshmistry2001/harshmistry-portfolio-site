# Further Goodness-of-fit tests (Kolmogorov-Smirnov, Anderson-Darling, QQ-Plots)

> Course part: Stats 2

## Overview

The $\chi^2$ test needs the data to be grouped into categories, which loses information for continuous data. The **Kolmogorov–Smirnov** and **Anderson–Darling** tests compare the *whole* empirical distribution function with the hypothesised one, without binning. **QQ plots** give the graphical counterpart.

## Concept

### Empirical distribution function

$F_n(t)=\frac1n\sum_{j=1}^n\mathbf 1_{\{X_j\le t\}}$ is the share of observations up to $t$. The hypothesis is $H_0:\ F=F_0$ for a given distribution function $F_0$ (or $F_{\hat\vartheta}$ with estimated parameters).

### Kolmogorov–Smirnov test

The [Kolmogorov–Smirnov test](https://en.wikipedia.org/wiki/Kolmogorov%E2%80%93Smirnov_test) uses the largest vertical distance:
$$D_n=\max_t\,|F_n(t)-F_0(t)| .$$
Because $F_n$ jumps at the ordered observations $x_{(i)}$, the maximum is found at those points as
$$D_n=\max_i\max\Big\{\frac in-F_0(x_{(i)}),\ F_0(x_{(i)})-\frac{i-1}n\Big\}.$$
Reject $H_0$ if $D_n$ exceeds the tabulated critical value. If the parameters of $F_0$ are *estimated from the same data*, the standard critical values are too lenient (use adjusted ones such as Lilliefors').

### Anderson–Darling test

The [Anderson–Darling test](https://en.wikipedia.org/wiki/Anderson%E2%80%93Darling_test) uses a weighted squared distance,
$$\int w(t)\,\big(F_n(t)-F_0(t)\big)^2\,dt ,$$
with weights that emphasise the tails. It usually has more power than Kolmogorov–Smirnov, especially against tail deviations.

### QQ plots

Plot the sorted data $x_{(i)}$ against the theoretical quantiles $F_0^{-1}(p_i)$ with plotting positions $p_i=\frac{i-1/2}{n}$. If $F_0$ fits (up to location and scale for the normal distribution), the points lie close to a straight line. Typical patterns: curved ends signal heavy or light tails, a bend signals skewness.

## Worked Example

Does the sample 0.1, 0.4, 0.9 come from the uniform distribution on $[0,1]$ ($F_0(x)=x$)?

| $x_{(i)}$ | $i/n$ | $F_0$ | $i/n-F_0$ | $F_0-(i-1)/n$ |
|---|---|---|---|---|
| 0.1 | 0.333 | 0.1 | 0.233 | 0.100 |
| 0.4 | 0.667 | 0.4 | 0.267 | 0.067 |
| 0.9 | 1.000 | 0.9 | 0.100 | 0.233 |

$D_3=0.267$, far below the 5% critical value $0.708$ for $n=3$: no rejection (with three observations almost anything is compatible with the model).

## Common Mistakes

- Using the standard KS critical values after estimating parameters from the same data.
- Treating a QQ plot of a tiny sample too strictly.
- Using KS for discrete data without adjustment.

## When It's Used

EDF-based tests compare the whole empirical distribution with a hypothesised one without binning: checking whether transaction amounts are log-normal, whether simulation output is uniform, whether residuals look normal. Anderson-Darling weights the tails more and is preferred in risk applications where the tails matter.

**Exam tip:** KS statistic $= \max_t |F_n(t) - F_0(t)|$. If you *estimate* the parameters from the same data, the standard KS critical values are too lenient. QQ plot: points on a straight line = good fit.

## R Code

```r
set.seed(14)
x <- rgamma(60, shape = 2, rate = 0.5)

# Kolmogorov-Smirnov against a fully specified N(4, 3^2)
ks.test(x, "pnorm", mean = 4, sd = 3)

# KS statistic by hand
xs <- sort(x); n <- length(xs); F0 <- pnorm(xs, 4, 3)
max(pmax(seq_len(n) / n - F0, F0 - (seq_len(n) - 1) / n))

# Anderson-Darling statistic (computational form) against the same F0
AD <- -n - mean((2 * seq_len(n) - 1) * (log(F0) + log(1 - rev(F0))))
AD

# QQ plot with plotting positions (i - 0.5) / n
plot(qnorm((seq_len(n) - 0.5) / n), xs, xlab = "theoretical N(0,1) quantiles", ylab = "sample")
qqline(x)
```

## Python Code

```python
import numpy as np
import matplotlib.pyplot as plt
from scipy import stats

rng = np.random.default_rng(14)
x = rng.gamma(shape=2, scale=2, size=60)

print(stats.kstest(x, stats.norm(4, 3).cdf))

xs = np.sort(x); n = len(xs); F0 = stats.norm(4, 3).cdf(xs)
i = np.arange(1, n + 1)
print("KS by hand:", np.max(np.maximum(i / n - F0, F0 - (i - 1) / n)))
AD = -n - np.mean((2 * i - 1) * (np.log(F0) + np.log(1 - F0[::-1])))
print("AD by hand:", AD)
print(stats.anderson(x, dist="norm"))          # AD with estimated mean/sd

stats.probplot(x, dist="norm", plot=plt)
plt.show()
```

## Practice Questions

*✎ new question added for this site (worked solution below)*

- ✎ Compute the Kolmogorov–Smirnov statistic for the sample 0.2, 0.5, 0.6, 0.95 against the uniform distribution on $[0,1]$.
- ✎ A normal QQ plot of daily returns shows points that bend upward at the right end and downward at the left end (an S-shape). What does this indicate?

## Solutions

*✎ solution written for this site*

- ✎ Q1: $n=4$. For each ordered value compute $i/n-x$ and $x-(i-1)/n$: 0.2: $0.25-0.2=0.05$ and $0.2$; 0.5: $0.5-0.5=0$ and $0.5-0.25=0.25$; 0.6: $0.75-0.6=0.15$ and $0.6-0.5=0.10$; 0.95: $1-0.95=0.05$ and $0.95-0.75=0.20$. The maximum is $D_4=0.25$, below the critical value $0.624$ ($n=4$, $\alpha=0.05$): no rejection.
- ✎ Q2: Extreme values are more extreme than a normal distribution would produce, so the distribution has heavier tails than the normal (typical for financial returns).
