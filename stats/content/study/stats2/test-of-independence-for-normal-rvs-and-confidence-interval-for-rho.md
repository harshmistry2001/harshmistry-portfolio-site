# Test of independence for normal RVs and Confidence interval for $\rho$

> Course part: Stats 2

## Overview

For two *numerical* variables, the natural question "are they related?" becomes "is the correlation different from zero?". If the data are (bivariate) normal, zero correlation is the same as independence, so a test of $\rho=0$ is a test of independence. Fisher's $z$-transformation then gives a confidence interval for the true correlation $\rho$.

## Concept

### Test of $H_0:\rho=0$

With the sample correlation $R_{xy}=\dfrac{\frac1{n-1}\sum(X_j-\overline X)(Y_j-\overline Y)}{S_xS_y}$ and bivariate normal data,
$$T=\sqrt{n-2}\,\frac{R_{xy}}{\sqrt{1-R_{xy}^2}}\ \sim\ t_{n-2}\quad\text{under } H_0:\rho=0 .$$
Reject (two-sided) if $|T|>t_{n-2,1-\alpha/2}$. **Caution:** the test relies on normality and is not robust against deviations; for ordinal or non-normal data use Spearman's rank correlation test.

### Confidence interval via Fisher's transformation

The sampling distribution of $R_{xy}$ is skewed (it cannot exceed 1), so one transforms it with the [Fisher transformation](https://en.wikipedia.org/wiki/Fisher_transformation):
$$z=\operatorname{artanh}(r)=\tfrac12\ln\frac{1+r}{1-r},$$
which is approximately normal with standard deviation $1/\sqrt{n-3}$. The steps are:

1. Compute $z=\operatorname{artanh}(r)$.
2. Interval for the transformed value: $z_l=z-\dfrac{c_{1-\alpha/2}}{\sqrt{n-3}}$, $z_u=z+\dfrac{c_{1-\alpha/2}}{\sqrt{n-3}}$, with $c$ the standard normal quantile.
3. Back-transform: $\rho_l=\tanh(z_l)$, $\rho_u=\tanh(z_u)$, where $\tanh(z)=\dfrac{e^{2z}-1}{e^{2z}+1}$.

The resulting interval is asymmetric around $r$, which is correct.

## Worked Example

$n=27$ pairs and $r=0.5$.

- Test: $T=\sqrt{25}\cdot\frac{0.5}{\sqrt{0.75}}=2.89$, $t_{25,0.975}=2.06$: reject $\rho=0$ ($p\approx0.008$).
- Interval: $z=\operatorname{artanh}(0.5)=0.549$; $\frac{1.96}{\sqrt{24}}=0.400$; $[z_l,z_u]=[0.149,\,0.949]$; back-transformed $[\tanh 0.149,\tanh0.949]=[0.148,\,0.740]$. The interval excludes 0, consistent with the test.

## Common Mistakes

- Using the test for strongly non-normal data or in the presence of outliers.
- Taking the interval $r\pm\ldots$ directly without the transformation.
- Using $n-2$ instead of $n-3$ in the Fisher standard error.
- Equating "$\rho=0$" with independence outside the normal model.

## When It's Used

Testing $\rho = 0$ and giving a confidence interval for $\rho$ is standard whenever correlations are reported: finance (is the correlation between two assets real?), psychology (test-retest reliability), medicine (biomarker vs. outcome). Fisher's $z$-transformation makes the sampling distribution approximately normal so an interval can be built.

**Exam tip:** $T = \sqrt{n-2}\,\frac{R}{\sqrt{1-R^2}} \sim t_{n-2}$ under $H_0$. For the CI: $z = \text{artanh}(r)$, $z \pm \frac{c_{1-\alpha/2}}{\sqrt{n-3}}$, then back-transform with $\tanh$. Valid only under (bivariate) normality.

## R Code

```r
set.seed(12)
n <- 40
x <- rnorm(n); y <- 0.4 * x + rnorm(n)
r <- cor(x, y)

T_stat <- sqrt(n - 2) * r / sqrt(1 - r^2)
c(r = r, T = T_stat, p = 2 * pt(-abs(T_stat), n - 2))

z <- atanh(r)                                      # 0.5 * log((1 + r) / (1 - r))
ci_z <- z + c(-1, 1) * qnorm(0.975) / sqrt(n - 3)
tanh(ci_z)                                         # 95% CI for rho

cor.test(x, y)                                     # same t, p and Fisher CI
```

## Python Code

```python
import numpy as np
from scipy import stats

rng = np.random.default_rng(12)
n = 40
x = rng.normal(size=n); y = 0.4 * x + rng.normal(size=n)
r = np.corrcoef(x, y)[0, 1]

T = np.sqrt(n - 2) * r / np.sqrt(1 - r**2)
print("r =", r, " T =", T, " p =", 2 * stats.t.sf(abs(T), n - 2))

z = np.arctanh(r)
lo, hi = np.tanh(z + np.array([-1, 1]) * stats.norm.ppf(0.975) / np.sqrt(n - 3))
print("95% CI for rho:", lo, hi)
res = stats.pearsonr(x, y)
print(res.pvalue, res.confidence_interval(0.95))
```

## Practice Questions

*✎ new question added for this site (worked solution below)*

- ✎ From $n=12$ pairs of normal data the sample correlation is $r=-0.4$. Test $H_0:\rho=0$ at $\alpha=0.05$.
- ✎ Compute a 95% confidence interval for $\rho$ from the same data.

## Solutions

*✎ solution written for this site*

- ✎ Q1: $T=\sqrt{10}\cdot\frac{-0.4}{\sqrt{0.84}}=-1.38$. With $df=10$, $t_{10,0.975}=2.228$. Since $|T|<2.228$ ($p\approx0.20$), $H_0$ is not rejected: no significant correlation.
- ✎ Q2: $z=\operatorname{artanh}(-0.4)=-0.424$; $\frac{1.96}{\sqrt9}=0.653$; $[z_l,z_u]=[-1.077,\,0.230]$; back-transformed $[\tanh(-1.077),\tanh(0.230)]=[-0.792,\,0.226]$. The interval contains 0, consistent with the test, but it is also wide: with $n=12$ the correlation is very uncertain.
