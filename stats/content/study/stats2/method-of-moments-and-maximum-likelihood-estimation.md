# Method of Moments and Maximum Likelihood Estimation

> Course part: Stats 2

## Overview

Given a model with an unknown parameter, how do we actually *construct* an estimator? Two systematic recipes dominate. The **method of moments** matches theoretical moments to their sample counterparts. **Maximum likelihood** chooses the parameter value under which the observed data would have been most probable.

## Concept

### Method of moments (MM)

Express the parameter through a moment, for instance $\vartheta=g(E(X))$, then replace the unknown expectation by the sample mean:
$$\hat\vartheta_{MM}=g(\overline X_n).$$
If the model has several parameters, match as many moments as there are parameters (mean, then second moment, …). MM estimators are easy to compute, usually consistent and asymptotically unbiased, but often less efficient than maximum likelihood.

### Maximum likelihood (ML)

Given observations $x_1,\dots,x_n$ the [likelihood](https://en.wikipedia.org/wiki/Likelihood_function) is the probability (discrete case) or density (continuous case) of the sample, viewed as a function of $\vartheta$:
$$L(\vartheta)=\prod_{i=1}^nP_\vartheta(X_i=x_i)\quad\text{or}\quad L(\vartheta)=\prod_{i=1}^nf_\vartheta(x_i).$$
The [maximum likelihood estimator](https://en.wikipedia.org/wiki/Maximum_likelihood_estimation) $\hat\vartheta_{ML}$ maximises $L$. In practice maximise the **log-likelihood** $\ln L(\vartheta)=\sum_i\ln f_\vartheta(x_i)$, because it turns products into sums and has the same maximiser.

**Recipe:** (1) write $L$, (2) take logs, (3) differentiate with respect to $\vartheta$, (4) set to zero and solve, (5) check that it is a maximum (second derivative negative, or inspect the boundary).

**Invariance principle:** if $\hat\vartheta$ is the ML estimator of $\vartheta$, then $g(\hat\vartheta)$ is the ML estimator of $g(\vartheta)$.

### Standard results

| Model | MM / ML estimator |
|---|---|
| $Bernoulli(p)$ | $\hat p=\overline x$ |
| $Poi(\lambda)$ | $\hat\lambda=\overline x$ |
| $Exp(\lambda)$ | $\hat\lambda=1/\overline x$ |
| $N(\mu,\sigma^2)$ | ML: $\hat\mu=\overline x$, $\hat\sigma^2=\frac1n\sum(x_i-\overline x)^2$ |
| $U[0,\theta]$ | MM: $2\overline x$; ML: $\max_i x_i$ |

## Worked Example

**Exponential waiting times.** Observations $2,5,3$ minutes from $Exp(\lambda)$: $L(\lambda)=\lambda^3e^{-\lambda\cdot10}$, $\ln L=3\ln\lambda-10\lambda$. Setting $\frac{3}{\lambda}-10=0$ gives $\hat\lambda=0.3$ (equal to $1/\overline x$ with $\overline x=10/3$), and $\frac{d^2}{d\lambda^2}\ln L=-3/\lambda^2<0$ confirms a maximum.

**Uniform distribution.** For $U[0,\theta]$ the likelihood is $\theta^{-n}$ if all $x_i\le\theta$ and 0 otherwise, so it is largest at the smallest admissible $\theta$, namely $\max x_i$. This estimator is always $\le\theta$ (biased downward), whereas the MM estimator $2\overline x$ is unbiased but can even fall below the sample maximum, which is impossible.

## Common Mistakes

- Setting the derivative of $L$ (or $\ln L$) to zero without checking the maximum or the boundary (the uniform case has no zero derivative at all).
- Forgetting that ML for the normal variance divides by $n$, not $n-1$.
- Maximising over $x$ instead of over $\vartheta$: in the likelihood the data are fixed and the parameter varies.

## When It's Used

Maximum likelihood is how almost every model in practice is fitted: logistic regression for credit scoring, Poisson models for claim counts, survival models for churn, and distribution fitting in reliability engineering. The method of moments gives quick closed-form estimates and good starting values for numerical optimisation.

**Exam tip:** write the log-likelihood, differentiate, set to zero, check it is a maximum. For $Exp(\lambda)$: $\hat\lambda = 1/\bar x$; for $Poi(\lambda)$: $\hat\lambda = \bar x$; for $U[0,\theta]$: MM gives $2\bar x$, ML gives $\max x_i$.

## R Code

```r
set.seed(3)
x <- rexp(200, rate = 0.5)                    # waiting times

# Closed form MLE and MM coincide for the exponential: 1 / mean
1 / mean(x)

# Numerical MLE by maximizing the log-likelihood
loglik <- function(lambda) sum(dexp(x, rate = lambda, log = TRUE))
optimize(loglik, interval = c(0.01, 5), maximum = TRUE)$maximum

# Uniform[0, theta]: MM vs ML
u <- runif(50, 0, 10)
c(MM = 2 * mean(u), ML = max(u))

# Invariance: MLE of the mean waiting time 1/lambda is 1 / lambda_hat
1 / (1 / mean(x))

curve(sapply(x, loglik), 0.1, 1.5, xname = "x", ylab = "log-likelihood", xlab = "lambda")
```

## Python Code

```python
import numpy as np
from scipy import stats, optimize

rng = np.random.default_rng(3)
x = rng.exponential(scale=2, size=200)          # lambda = 0.5

print("closed form:", 1 / x.mean())
negll = lambda lam: -np.sum(stats.expon(scale=1 / lam).logpdf(x))
print("numerical:  ", optimize.minimize_scalar(negll, bounds=(0.01, 5), method="bounded").x)
loc, scale = stats.expon.fit(x, floc=0)          # SciPy's built-in MLE
print("scipy fit:  ", 1 / scale)

u = rng.uniform(0, 10, 50)
print("Uniform MM:", 2 * u.mean(), " ML:", u.max())
```

## Practice Questions

*✎ new question added for this site (worked solution below)*

- ✎ Claims per week are modelled as $Poi(\lambda)$; five weeks give $2,0,3,1,4$. Derive and compute the ML estimate of $\lambda$.
- ✎ A sample from $U[0,\theta]$ is $2.1,\,5.7,\,3.3,\,4.8$. Compute the MM and ML estimates of $\theta$. Show with the sample $1,1,6$ that the MM estimate can be impossible.
- ✎ In 20 trials a machine fails 7 times (Bernoulli model). Find the ML estimate of $p$ and, by the invariance principle, of the odds $p/(1-p)$.

## Solutions

*✎ solution written for this site*

- ✎ Q1: $L(\lambda)=\prod\frac{e^{-\lambda}\lambda^{x_i}}{x_i!}$, so $\ln L=-5\lambda+(\sum x_i)\ln\lambda-\text{const}$. With $\sum x_i=10$: $\frac{d}{d\lambda}\ln L=-5+\frac{10}\lambda=0$ gives $\hat\lambda=2=\overline x$.
- ✎ Q2: $\overline x=15.9/4=3.975$, so $\hat\theta_{MM}=7.95$; $\hat\theta_{ML}=\max x_i=5.7$. For the sample $1,1,6$: $\overline x=8/3$, $\hat\theta_{MM}=16/3\approx5.33<6=\max x_i$, but $\theta$ must be at least 6, so this estimate is impossible.
- ✎ Q3: $\hat p=7/20=0.35$; the ML estimate of the odds is $\frac{0.35}{0.65}\approx0.538$.
