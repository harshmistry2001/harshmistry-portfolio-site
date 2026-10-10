# Confidence Bounds and Intervals

> Course part: Stats 2

## Overview

A point estimate such as "the mean drying time is 10.2 hours" says nothing about how far off it might be. A **confidence interval** gives a range of plausible values for the unknown parameter together with a confidence level (for example 95%). It is how uncertainty is reported in polls, lab measurements and A/B tests.

## Concept

### What "confidence" means

The true parameter is a fixed number; the **interval is random**, because it is computed from random data. A $(1-\alpha)$ confidence interval is constructed so that, over repeated samples, it contains the true value in about $(1-\alpha)\cdot100\%$ of the cases. It does *not* say that the parameter lies in the one computed interval with probability $1-\alpha$.

### Intervals for the expected value (normal data)

- **Variance $\sigma^2$ known** (see [confidence interval](https://en.wikipedia.org/wiki/Confidence_interval)):
$$\Big[\overline X_n-z_{1-\alpha/2}\frac{\sigma}{\sqrt n},\ \overline X_n+z_{1-\alpha/2}\frac{\sigma}{\sqrt n}\Big]$$
- **Variance unknown**: replace $\sigma$ by $S_n$ and the normal quantile by the $t$ quantile with $n-1$ degrees of freedom ([Student's t-distribution](https://en.wikipedia.org/wiki/Student's_t-distribution)):
$$\Big[\overline X_n-t_{n-1,1-\alpha/2}\frac{S_n}{\sqrt n},\ \overline X_n+t_{n-1,1-\alpha/2}\frac{S_n}{\sqrt n}\Big]$$
- A **one-sided** (upper) confidence bound uses $t_{n-1,1-\alpha}$ and has the form $\overline X_n+t_{n-1,1-\alpha}\,S_n/\sqrt n$.

### Interval for the variance

Using the [chi-squared distribution](https://en.wikipedia.org/wiki/Chi-squared_distribution) with $n-1$ degrees of freedom:
$$\Big[\frac{(n-1)S_n^2}{\chi^2_{n-1,1-\alpha/2}},\ \frac{(n-1)S_n^2}{\chi^2_{n-1,\alpha/2}}\Big]$$
Note that the *upper* quantile goes in the *lower* bound. This interval is sensitive to non-normality.

### Intervals for a proportion

For a probability $p$ with estimate $\hat p$ the Wald interval is $\hat p\pm z_{1-\alpha/2}\sqrt{\hat p(1-\hat p)/n}$ (approximate, relies on the normal approximation); the Clopper–Pearson interval is exact but wider.

### What determines the length?

The length of the interval **shrinks** when the sample size $n$ grows (like $1/\sqrt n$) or when the variance is smaller; it **grows** when the confidence level $1-\alpha$ is raised. For a desired maximal length $l$ with known $\sigma$:
$$n\ge\Big(\frac{2\,\sigma\,z_{1-\alpha/2}}{l}\Big)^2 .$$

## Worked Example

A quality inspector measures the drying time of paint on $n=125$ houses: mean 10.2 hours, $s=1.1$ hours (assume normal data).
$s/\sqrt n=1.1/\sqrt{125}=0.0984$ and $t_{124,0.975}=1.979$, so the 95% CI is $10.2\pm1.979\cdot0.0984=[10.005,\ 10.395]$ hours. A 99% interval uses $t_{124,0.995}=2.616$ and is wider: $[9.943,\ 10.457]$.

## Common Mistakes

- Saying "there is a 95% probability that $\mu$ lies in this interval".
- Using $z$ instead of $t$ when $\sigma$ is estimated from a small sample.
- Swapping the $\chi^2$ quantiles in the variance interval.
- Using the Wald interval for very small $n$ or $\hat p$ near 0 or 1.

## When It's Used

Confidence intervals are how uncertainty is reported everywhere: the margin of error in an opinion poll, the precision of a lab measurement, the range for an A/B test uplift, tolerance claims in manufacturing. Sample-size planning ("how many respondents for a ±3 point margin?") inverts the interval formula.

**Exam tip:** pick the right pivot — $z$ if $\sigma$ is known, $t_{n-1}$ if estimated, $\chi^2_{n-1}$ for a variance (note the quantiles swap: the *upper* quantile goes in the *lower* bound). Length shrinks like $1/\sqrt{n}$.

## R Code

```r
z_ci <- function(m, sigma, n, level) m + c(-1, 1) * qnorm(1 - (1 - level) / 2) * sigma / sqrt(n)
t_ci <- function(m, s, n, level) m + c(-1, 1) * qt(1 - (1 - level) / 2, n - 1) * s / sqrt(n)

# Practice Sheet 05, Problem 2: paint drying time, n = 125, mean 10.2, s = 1.1
10.2 + qt(0.95, 124) * 1.1 / sqrt(125)        # (a) upper 95% confidence bound
t_ci(10.2, 1.1, 125, 0.95)                    # (b)
t_ci(10.2, 1.1, 125, 0.99)                    # (c) wider

# Practice Sheet 05, Problem 3: stock returns, n = 18
z_ci(1.1811, 0.01, 18, 0.95)                  # (a) variance known
t_ci(1.1811, sqrt(1.2658), 18, 0.95)          # (b) variance unknown

# Practice Sheet 06, Problem 2: pages per hour, n = 10
t_ci(41.8, 6.0137, 10, 0.99)
(10 - 1) * 6.0137^2 / qchisq(c(0.975, 0.025), df = 9)   # 95% CI for the variance

# Practice Sheet 06, Problem 3: 35 of 125 magazines with errors
p_hat <- 35 / 125
p_hat + c(-1, 1) * qnorm(0.975) * sqrt(p_hat * (1 - p_hat) / 125)   # Wald
binom.test(35, 125)$conf.int                                         # Clopper-Pearson (exact)
ceiling((2 * qnorm(0.975) / 0.10)^2 * p_hat * (1 - p_hat))           # n for length < 0.10
```

## Python Code

```python
import numpy as np
from scipy import stats

def t_ci(m, s, n, level):
    h = stats.t.ppf(1 - (1 - level) / 2, n - 1) * s / np.sqrt(n)
    return m - h, m + h

def z_ci(m, sigma, n, level):
    h = stats.norm.ppf(1 - (1 - level) / 2) * sigma / np.sqrt(n)
    return m - h, m + h

print("paint upper bound:", 10.2 + stats.t.ppf(0.95, 124) * 1.1 / np.sqrt(125))
print("paint 95%:", t_ci(10.2, 1.1, 125, 0.95), " 99%:", t_ci(10.2, 1.1, 125, 0.99))
print("stock known sigma:", z_ci(1.1811, 0.01, 18, 0.95))
print("stock unknown:", t_ci(1.1811, np.sqrt(1.2658), 18, 0.95))
print("pages 99%:", t_ci(41.8, 6.0137, 10, 0.99))
print("variance 95%:", 9 * 6.0137**2 / stats.chi2.ppf([0.975, 0.025], 9))

p_hat, n = 35 / 125, 125
h = stats.norm.ppf(0.975) * np.sqrt(p_hat * (1 - p_hat) / n)
print("Wald:", (p_hat - h, p_hat + h))
print("Clopper-Pearson:", stats.binomtest(35, 125).proportion_ci(method="exact"))
print("n needed:", int(np.ceil((2 * stats.norm.ppf(0.975) / 0.10) ** 2 * p_hat * (1 - p_hat))))
```

## Practice Questions

*◆ original question from the course material*

- ◆ Practice Sheet 05, Problem 2: A quality inspector analyses the new exterior paint product... 125 freshly painted houses... mean drying time of $\overline{x}_{n}=10.2$ hours and standard deviation of $s_{n}=1.1$ hours. Assume normal distribution.
  - (a) Compute the upper confidence bound for the expectation $\mu$ at level 95%.
  - (b) Determine a 95%-confidence interval for $\mu$.
  - (c) Determine a 99%-confidence interval for $\mu$ and compare the resulting interval with the interval from part (b).
- ◆ Practice Sheet 05, Problem 3: The monthly relative return (in %) of a stock... We model the returns as i.i.d. $N(\mu,\sigma^{2})$. Sample of 18 stocks: $\overline{x}_{18}=1.1811,$ $s_{18}^{2}=1.2658.$
  - (a) Assume the variance is known and has the value $\sigma^{2}=0.01^{2}$. Compute the confidence interval for $\mu$ at level 95%.
  - (b) Compute the confidence interval for $\mu$ at level 95% in the case of unknown variance.
- ◆ Practice Sheet 05, Problem 4: Consider independent and identically normally distributed random variables $X_{1},...,X_{n},$ where $\mu$ and $\sigma^{2}$ are unknown. Show that for all $\alpha\in(0,1)$: $P_{(\mu,\sigma^{2})}(\overline{X}_{n}-t_{n-1;1-\alpha/2}\frac{\sqrt{S_{n}^{2}}}{\sqrt{n}}\le\mu\le\overline{X}_{n}+t_{n-1;1-\alpha/2}\frac{\sqrt{S_{n}^{2}}}{\sqrt{n}})=1-\alpha.$
- ◆ Practice Sheet 06, Problem 1: A $1-\alpha$ confidence interval for the mean value with given variance $\sigma^{2}$ has the form $[\overline{X}_{n}-z_{1-\frac{\alpha}{2}}\frac{\sigma}{\sqrt{n}},\overline{X}_{n}+z_{1-\frac{\alpha}{2}}\frac{\sigma}{\sqrt{n}}]$. How does the lenght of the interval change if
  - (a) The confidence level $(1-\alpha)$ is increased?
  - (b) The sample size is doubled?
  - (c) The variance is tripled?
- ◆ Practice Sheet 06, Problem 2: 10 randomly selected people were asked about their average number of pages read per hour... $\overline{x}_{10}=41.8$, $s_{10}=6.0137$.
  - (a) Determine a confidence interval for the mean number of pages at level 0.99.
  - (b) Determine a 95% confidence interval for the variance of the number of pages.
- ◆ Practice Sheet 06, Problem 3: After the proofreading process... out of 125 issues, 35 contained at least one error.
  - (a) Estimate the proportion of magazines with at least one error.
  - (b) Determine a 95% Wald confidence interval for the proportion.
  - (c) Determine the minimal sample size guaranteeing that... the length of the 95% Wald confidence interval is smaller than 10 percentage points.
  - (d) Based on the confidence interval obtained in (b), would you expect your result to be a good approximation for the exact confidence interval?

## Solutions

*✎ solution written for this site*

*Problem 4 of Sheet 05 is a proof; the others are computed numerically.*

- ✎ Sheet 05, Problem 2: $s/\sqrt n=0.0984$. (a) Upper 95% bound: $10.2+t_{124,0.95}\cdot0.0984=10.2+1.657\cdot0.0984\approx10.363$. (b) $10.2\pm1.979\cdot0.0984=[10.005,\,10.395]$. (c) $10.2\pm2.616\cdot0.0984=[9.943,\,10.457]$, which is **wider** than the 95% interval: more confidence requires a longer interval.
- ✎ Sheet 05, Problem 3: (a) $\sigma=0.01$ known: $1.1811\pm1.96\cdot\frac{0.01}{\sqrt{18}}=[1.1765,\,1.1857]$. (b) $s=\sqrt{1.2658}=1.1251$ unknown: $1.1811\pm t_{17,0.975}\frac{s}{\sqrt{18}}=1.1811\pm2.110\cdot0.2652=[0.622,\,1.741]$. The variance is not assumed known, so the interval is far wider.
- ✎ Sheet 05, Problem 4: Under normality $T=\frac{\overline X_n-\mu}{S_n/\sqrt n}\sim t_{n-1}$ exactly. Hence $P(-t_{n-1;1-\alpha/2}\le T\le t_{n-1;1-\alpha/2})=1-\alpha$. Multiplying by $S_n/\sqrt n>0$ and rearranging the inequalities to isolate $\mu$ gives the stated probability statement.
- ✎ Sheet 06, Problem 1: The length is $2z_{1-\alpha/2}\sigma/\sqrt n$. (a) Higher confidence level $\Rightarrow$ larger $z_{1-\alpha/2}\Rightarrow$ the interval becomes **longer**. (b) Doubling $n$ multiplies the length by $1/\sqrt2\approx0.71$. (c) Tripling the variance multiplies $\sigma$, and hence the length, by $\sqrt3\approx1.73$.
- ✎ Sheet 06, Problem 2: (a) $41.8\pm t_{9,0.995}\frac{6.0137}{\sqrt{10}}=41.8\pm3.250\cdot1.902=[35.62,\,47.98]$. (b) $s^2=36.16$; $\Big[\frac{9\cdot36.16}{\chi^2_{9,0.975}},\frac{9\cdot36.16}{\chi^2_{9,0.025}}\Big]=\Big[\frac{325.5}{19.02},\frac{325.5}{2.70}\Big]=[17.1,\,120.5]$.
- ✎ Sheet 06, Problem 3: (a) $\hat p=35/125=0.28$. (b) Wald: $0.28\pm1.96\sqrt{0.28\cdot0.72/125}=0.28\pm0.0787=[0.201,\,0.359]$. (c) Length $\le0.10$: $n\ge\big(\frac{2\cdot1.96}{0.10}\big)^2\hat p(1-\hat p)=1536.6\cdot0.2016\approx309.8$, so $n\ge310$ (using the estimate $\hat p$). (d) Yes: both $n\hat p=35$ and $n(1-\hat p)=90$ are comfortably large, and the exact Clopper–Pearson interval $[0.203,\,0.367]$ is close to the Wald interval.
