# Consistency

> Course part: Stats 3

## Overview

Unbiasedness is a statement about *repeated samples of a fixed size*. **Consistency** is the large-sample counterpart: does the estimate settle on the true value as we collect more and more data? It is the minimum requirement for an estimator, and it explains why some problems (like omitted variables) cannot be solved with "more data".

## Concept

### Definition

An estimator $\hat\beta_j$ is [consistent](https://en.wikipedia.org/wiki/Consistent_estimator) for $\beta_j$ if its sampling distribution collapses onto the true value as the sample size $n\to\infty$. Formally, $\hat\beta_j\to\beta_j$ in probability: $\text{plim}\,\hat\beta_j=\beta_j$.

### OLS

Under MLR.1–MLR.4, OLS is consistent. In the simple regression,
$$\text{plim}\,\hat\beta_1=\beta_1+\frac{Cov(x,u)}{Var(x)},$$
so $\hat\beta_1$ is consistent exactly when $Cov(x,u)=0$. For consistency a weaker assumption than MLR.4 suffices: $E(u)=0$ and $Cov(x_j,u)=0$ for all $j$.

If $x$ and $u$ are correlated (omitted variable, measurement error, simultaneity), OLS is **inconsistent**: the bias does not disappear as $n$ grows; the estimate converges to the *wrong* number $\beta_1+Cov(x,u)/Var(x)$.

### Unbiased versus consistent

| | Unbiased | Consistent |
|---|---|---|
| Concerns | expected value for fixed $n$ | the limit as $n\to\infty$ |
| Example | $Y_1$ (first observation only) as estimator of $\mu$ | $\overline Y_n$ |
| Possible without the other? | yes, $Y_1$ is unbiased but not consistent | yes, estimators can be biased in finite samples but consistent |

## Worked Example

Omitted variable. True model $\ln(wage)=\beta_0+\beta_1educ+\beta_2abil+u$ with $\beta_1=0.08$, $\beta_2=0.02$. Ability is omitted, and $Cov(educ,abil)/Var(educ)=\delta_1=0.5$. The regression of wage on education alone converges to
$$\text{plim}\,\tilde\beta_1=0.08+0.02\cdot0.5=0.09 ,$$
no matter whether $n=500$ or $n=5{,}000{,}000$: more data give a very precise estimate of 0.09, which is the wrong answer.

## Common Mistakes

- Thinking that a very large sample solves bias caused by omitted variables or measurement error.
- Confusing "consistent" with "unbiased".
- Forgetting that consistency needs $Cov(x,u)=0$, not necessarily $E(u\mid x)=0$.

## When It's Used

Consistency is the minimal requirement for an estimator used with large datasets: as $n$ grows, the estimate should settle on the true value. OLS is consistent when regressors are uncorrelated with the error; if they are correlated (omitted variables, measurement error, simultaneity), collecting more data does **not** fix the problem — the estimate converges to the wrong number.

**Exam tip:** $\text{plim}\,\hat\beta_1 = \beta_1 + \frac{Cov(x,u)}{Var(x)}$. Unbiasedness is a finite-sample property; consistency is about $n \to \infty$.

## R Code

```r
set.seed(21)
beta1 <- 2
est <- function(n, endogenous) {
  x <- rnorm(n)
  u <- if (endogenous) 0.5 * x + rnorm(n) else rnorm(n)     # Cov(x, u) = 0.5 or 0
  coef(lm(1 + beta1 * x + u ~ x))[2]
}
sizes <- c(20, 100, 1000, 10000, 100000)
rbind(n = sizes,
      exogenous = sapply(sizes, est, endogenous = FALSE),
      endogenous = sapply(sizes, est, endogenous = TRUE))   # converges to 2 + 0.5 / 1 = 2.5
```

## Python Code

```python
import numpy as np

rng = np.random.default_rng(21)
def est(n, endogenous):
    x = rng.normal(size=n)
    u = 0.5 * x + rng.normal(size=n) if endogenous else rng.normal(size=n)
    y = 1 + 2 * x + u
    return np.polyfit(x, y, 1)[0]

for n in [20, 100, 1000, 10_000, 100_000]:
    print(f"n={n:>6}  exogenous={est(n, False):.4f}  endogenous={est(n, True):.4f}")
```

## Practice Questions

*✎ new question added for this site (worked solution below)*

- ✎ In a simple regression $\beta_1=2$, $Cov(x,u)=0.3$ and $Var(x)=1.5$. What does the OLS slope converge to?
- ✎ Give an estimator of a population mean that is unbiased but not consistent.

## Solutions

*✎ solution written for this site*

- ✎ Q1: $\text{plim}\,\hat\beta_1=2+0.3/1.5=2.2$: OLS is inconsistent, with an asymptotic bias of $+0.2$.
- ✎ Q2: Using only the first observation, $\hat\mu=Y_1$: $E(Y_1)=\mu$, but its distribution does not concentrate around $\mu$ as $n$ grows.
