# Normal goodness-of-fit tests (Shapiro-Wilk, Jarque-Bera)

> Course part: Stats 2

## Overview

Many methods (t-tests, ANOVA, variance tests, regression inference) assume normal data. Special-purpose tests check the **normality** assumption directly. They exploit properties that only the normal distribution has, and so are more powerful for this purpose than general goodness-of-fit tests.

## Concept

### Shapiro–Wilk test

The [Shapiro–Wilk test](https://en.wikipedia.org/wiki/Shapiro%E2%80%93Wilk_test) is a correlation-type test: it checks how close the correlation between the ordered data and the corresponding normal quantiles is to 1. This is the numerical version of a straight line in the normal QQ plot. A small value of the statistic (equivalently a small p-value) speaks against normality. It is regarded as the most powerful general normality test for small samples.

### Jarque–Bera test

A normal distribution has **skewness 0** and **kurtosis 3**. With
$$\widehat{Sk}=\frac{\frac1n\sum(X_i-\overline X_n)^3}{S_n^3},\qquad \widehat K=\frac{\frac1n\sum(X_i-\overline X_n)^4}{S_n^4},$$
the [Jarque–Bera statistic](https://en.wikipedia.org/wiki/Jarque%E2%80%93Bera_test) is
$$JB=\frac n6\Big(\widehat{Sk}^{\,2}+\frac14\big(\widehat K-3\big)^2\Big).$$
It is large if the sample is skewed or has heavier/lighter tails than the normal distribution. For large $n$, $JB\approx\chi^2_2$ under normality (critical value $5.99$ at 5%); for small samples special critical values are used (for $n=12$ at 5% the course gives $2.87$).

## Worked Example

Daily returns of a stock, $n=100$: $\widehat{Sk}=0.3$, $\widehat K=3.8$.
$$JB=\frac{100}{6}\Big(0.09+\frac{0.8^2}{4}\Big)=16.67\cdot0.25=4.17<5.99 :$$
normality is not rejected at 5%. If instead $\widehat K$ were 5 (fat tails) one would get $JB=16.67\,(0.09+1)=18.2$, a clear rejection.

## Common Mistakes

- Treating "not rejected" as proof of normality, especially with small samples where the tests have little power.
- Using the $\chi^2_2$ critical value 5.99 for very small $n$.
- Applying normality tests to huge samples, where trivial deviations become "significant": look at the QQ plot too.

## When It's Used

Normality tests are run before t-tests, ANOVA and variance tests, and on regression residuals: checking daily returns (which are usually *not* normal — fat tails), measurement errors in labs, CO₂ readings. Shapiro-Wilk is the most powerful general test for small samples; Jarque-Bera looks only at skewness and kurtosis and is popular in finance and econometrics.

**Exam tip:** $JB = \frac{n}{6}\left(\hat{Sk}^2 + \frac14(\hat K - 3)^2\right)$; normal data have skewness 0 and kurtosis 3. In the CO₂ exercise reject if $T > 2.87$ (small-sample critical value given).

## R Code

```r
set.seed(15)
co2 <- round(rnorm(12, 420, 8), 1)                 # 12 daily CO2 readings (ppm)

jb <- function(x) {
  n <- length(x); m <- mean(x); s <- sd(x)
  Sk <- mean((x - m)^3) / s^3
  K  <- mean((x - m)^4) / s^4
  c(skewness = Sk, kurtosis = K, JB = n / 6 * (Sk^2 + (K - 3)^2 / 4))
}
res <- jb(co2)
res
res["JB"] > 2.87                                    # course small-sample critical value

shapiro.test(co2)

# Heavy-tailed "returns" are rejected
returns <- rt(500, df = 3)
jb(returns)["JB"] > qchisq(0.95, 2)
shapiro.test(returns)$p.value
```

## Python Code

```python
import numpy as np
from scipy import stats

rng = np.random.default_rng(15)
co2 = np.round(rng.normal(420, 8, 12), 1)

def jb(x):
    n, m, s = len(x), x.mean(), x.std(ddof=1)
    Sk = np.mean((x - m) ** 3) / s**3
    K = np.mean((x - m) ** 4) / s**4
    return Sk, K, n / 6 * (Sk**2 + (K - 3) ** 2 / 4)

Sk, K, JB = jb(co2)
print(f"skew={Sk:.3f} kurt={K:.3f} JB={JB:.3f} reject={JB > 2.87}")
print(stats.shapiro(co2))

returns = stats.t.rvs(df=3, size=500, random_state=rng)
print("JB returns:", jb(returns)[2], " scipy:", stats.jarque_bera(returns))
```

## Practice Questions

*◆ original question from the course material · ✎ new question added for this site (worked solution below)*

- ◆ Practice Sheet 14, Problem 3: To estimate the $CO_{2}$ level in air in an area with heavy-traffic independent measurements have been taken at 12 different days... Assess if the normality assumption of the data is plausible by using the Jarque-Bera test. For this sample size and level 5% the test rejects if $T>2.87$.
- ✎ A sample of $n=50$ has skewness $0.8$ and kurtosis $4$. Compute the Jarque–Bera statistic and test normality at 5% using the asymptotic critical value $5.99$.

## Solutions

*✎ solution written for this site*

- ✎ Sheet 14, Problem 3: From the 12 CO₂ measurements compute $\overline x$, $S_n$, the skewness $\widehat{Sk}$ and kurtosis $\widehat K$ with the formulas above, then $T=JB=\frac{12}{6}\big(\widehat{Sk}^2+\frac14(\widehat K-3)^2\big)$. If $T>2.87$, reject the normality assumption; otherwise it is plausible. The data table is not reproduced here.
- ✎ Q2 (new question): $JB=\frac{50}{6}\big(0.64+\frac14\cdot1\big)=8.33\cdot0.89=7.42>5.99$: normality is rejected at 5%.
