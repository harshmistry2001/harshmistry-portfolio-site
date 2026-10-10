# Paired samples and Hotelling Test

> Course part: Stats 2

## Overview

If the *same* subjects are measured several times (blood pressure at baseline, after one month and after three months), the measurements are dependent, so ordinary ANOVA, which needs independent groups, is not valid. The solution is to work with **differences** per subject and test them jointly with **Hotelling's $T^2$ test**, the multivariate version of the one-sample t-test.

## Concept

### From repeated measurements to differences

For $n$ subjects with three measurements $(X_i,Y_i,Z_i)$, choose one as the reference (say $X_i$) and form
$$B_i=Y_i-X_i,\qquad D_i=Z_i-X_i .$$
If the conditions have no effect, the differences should fluctuate around zero. So test
$$H_0:\ E(B_i,D_i)=(0,0)\quad\text{vs.}\quad H_1:\ \text{at least one mean difference is non-zero.}$$

### Hotelling's test

Assume that the difference vectors are i.i.d. multivariate normal ($p$ components, here $p=2$). Let $\bar d=(\overline B,\overline D)^\top$ be their mean vector and $\hat\Sigma$ the sample covariance matrix. The [Hotelling's $T^2$](https://en.wikipedia.org/wiki/Hotelling's_T-squared_distribution) statistic is

$$T=n\,\bar d^\top\hat\Sigma^{-1}\bar d .$$

Reject $H_0$ if $T$ exceeds the critical value $\dfrac{(n-1)p}{n-p}F_{p,\,n-p,\,1-\alpha}$ (for $n\ge50$ one may use $\chi^2_{p,1-\alpha}$ instead). The statistic measures the distance of the mean difference vector from zero in units of its covariance (a Mahalanobis distance), so correlation between the differences is taken into account.

## Worked Example

Five subjects, differences $(B_i,D_i)=(1,2),(2,1),(3,3),(2,2),(2,2)$.

- Mean vector $\bar d=(2,2)$.
- Covariance matrix $\hat\Sigma=\begin{pmatrix}0.5&0.25\\0.25&0.5\end{pmatrix}$, inverse $\begin{pmatrix}2.667&-1.333\\-1.333&2.667\end{pmatrix}$.
- $T=5\cdot(2,2)\hat\Sigma^{-1}(2,2)^\top=5\cdot10.67=53.3$.
- Critical value: $\frac{4\cdot2}{3}F_{2,3,0.95}=2.667\cdot9.55=25.5$. Since $53.3>25.5$, reject $H_0$: the measurements differ significantly from the reference.

## Common Mistakes

- Treating repeated measurements as independent groups and running ANOVA.
- Testing the differences one at a time without correction, which ignores their correlation and inflates the error rate.
- Applying the test with $n\le p$: the covariance matrix is then singular.

## When It's Used

When the same subjects are measured several times — blood pressure at baseline, 1 month and 3 months; a product rated by the same panel under three conditions — the measurements are dependent and ordinary ANOVA is invalid. Taking differences to a reference measurement and testing them jointly with Hotelling's $T^2$ handles this.

**Exam tip:** build the difference vectors $(B_i, D_i)$, compute their mean vector and covariance matrix, then $T = n\,\bar d^\top \hat\Sigma^{-1}\bar d$. Critical value: $\frac{(n-1)p}{n-p}F_{p,n-p,1-\alpha}$ (or $\chi^2_p$ for $n \ge 50$).

## R Code

```r
set.seed(11)
n <- 15
X <- rnorm(n, 120, 10)                  # baseline
Y <- X + rnorm(n, -3, 4)                # after 1 month
Z <- X + rnorm(n, -5, 4)                # after 3 months

d <- cbind(B = Y - X, D = Z - X)
d_bar <- colMeans(d)
S <- cov(d)
T2 <- n * t(d_bar) %*% solve(S) %*% d_bar
p <- 2; alpha <- 0.05
crit <- (n - 1) * p / (n - p) * qf(1 - alpha, p, n - p)
c(T2 = T2, crit = crit, reject = T2 > crit,
  p_value = pf(T2 * (n - p) / ((n - 1) * p), p, n - p, lower.tail = FALSE))
```

## Python Code

```python
import numpy as np
from scipy import stats

rng = np.random.default_rng(11)
n = 15
X = rng.normal(120, 10, n)
Y = X + rng.normal(-3, 4, n)
Z = X + rng.normal(-5, 4, n)

d = np.column_stack([Y - X, Z - X])
d_bar = d.mean(axis=0)
S = np.cov(d, rowvar=False)
T2 = n * d_bar @ np.linalg.solve(S, d_bar)
p, alpha = 2, 0.05
crit = (n - 1) * p / (n - p) * stats.f.ppf(1 - alpha, p, n - p)
pval = stats.f.sf(T2 * (n - p) / ((n - 1) * p), p, n - p)
print(f"T2 = {T2:.3f}  crit = {crit:.3f}  reject = {T2 > crit}  p = {pval:.4g}")
```

## Practice Questions

*✎ new question added for this site (worked solution below)*

- ✎ Why is one-way ANOVA not appropriate for the blood pressure of the same 20 patients measured at three time points?
- ✎ With $n=30$ subjects and $p=2$ differences, what is the critical value of the Hotelling test at $\alpha=0.05$? ($F_{2,28,0.95}=3.34$)

## Solutions

*✎ solution written for this site*

- ✎ Q1: ANOVA assumes independent observations in different groups. Measurements on the same patient are dependent (a patient with high blood pressure at baseline tends to have high values later), so the assumptions are violated and the test would be unreliable. Use the differences to a reference measurement and Hotelling's test.
- ✎ Q2: $\frac{(n-1)p}{n-p}F_{p,n-p,1-\alpha}=\frac{29\cdot2}{28}\cdot3.34=2.071\cdot3.34\approx6.92$. Reject $H_0$ if $T>6.92$.
