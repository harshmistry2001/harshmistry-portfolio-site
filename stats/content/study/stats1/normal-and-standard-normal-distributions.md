# Normal and Standard Normal Distributions

> Course part: Stats 1

## Overview

The bell curve. The normal distribution is the single most important distribution in statistics: measurement errors, heights and test scores are roughly normal, and, thanks to the Central Limit Theorem, so are averages and sums of almost anything. Most methods in the later courses are built on it.

## Concept

### The normal distribution

$X\sim N(\mu,\sigma^2)$ has the [density](https://en.wikipedia.org/wiki/Normal_distribution)
$$f(x)=\frac1{\sigma\sqrt{2\pi}}\exp\!\Big(-\frac{(x-\mu)^2}{2\sigma^2}\Big),\qquad E(X)=\mu,\quad Var(X)=\sigma^2.$$

It is symmetric about $\mu$ (mean = median = mode); $\sigma$ controls the width. The central limit theorem states that sums and averages of many independent, similar random variables are approximately normal.

### Standard normal and standardisation

$Z\sim N(0,1)$ is the standard normal with density $\varphi(z)=\frac1{\sqrt{2\pi}}e^{-z^2/2}$ and distribution function $\Phi(z)$, which has no closed form and is tabulated or computed by software. Any normal variable is standardised by
$$Z=\frac{X-\mu}{\sigma}\sim N(0,1),\qquad F_X(x)=\Phi\!\Big(\frac{x-\mu}{\sigma}\Big).$$
By symmetry $\Phi(-z)=1-\Phi(z)$.

### Useful numbers

- Within $\mu\pm\sigma$: about 68% of the probability; within $\mu\pm2\sigma$: 95%; within $\mu\pm3\sigma$: 99.7%.
- Quantiles: $z_{0.95}\approx1.645$, $z_{0.975}\approx1.96$, $z_{0.99}\approx2.326$.

**Notation warning:** the course writes $N(\mu,\sigma^2)$ with the *variance*; R and SciPy expect the *standard deviation*. For $N(3,4)$ use `sd = 2`.

## Worked Example

Heights are $N(170, 10^2)$ cm.

- $P(X\le180)=\Phi\big(\frac{180-170}{10}\big)=\Phi(1)\approx0.841$.
- $P(160<X\le190)=\Phi(2)-\Phi(-1)=0.977-0.159\approx0.819$.
- The 95% quantile: $170+1.645\cdot10\approx186.4$ cm.

## Common Mistakes

- Plugging the variance where the standard deviation belongs when standardising.
- Forgetting the symmetry rule and looking up negative $z$ values incorrectly.
- Assuming that real data are normal without a check (histogram, QQ plot).

## When It's Used

The normal distribution models measurement errors, heights, test scores and — through the Central Limit Theorem — averages and sums of almost anything. It drives quality control (control limits at $\mu \pm 3\sigma$), confidence intervals and most tests in Stats 2.

**Exam tip:** standardize $z = (x - \mu)/\sigma$ and use $\Phi$. The course writes $N(\mu, \sigma^2)$ with the *variance*; R and SciPy want the *standard deviation* — for $N(3, 4)$ use `sd = 2`. Symmetry: $\Phi(-z) = 1 - \Phi(z)$.

## R Code

```r
mu <- 3; sigma <- 2                                  # X ~ N(3, 4): variance 4 -> sd 2

pnorm(2.5, mu, sigma, lower.tail = FALSE)            # (a) P(X >= 2.5)
1 - pnorm((2.5 - mu) / sigma)                        # via standardization

pnorm(3.3, mu, sigma) - pnorm(1.2, mu, sigma)        # (b) P(1.2 <= X <= 3.3)

qnorm(0.975) * sigma                                 # (c) c with P(|X - 3| < c) = 0.95

curve(dnorm(x, mu, sigma), -5, 11, ylab = "density")
abline(v = mu + c(-1, 1) * qnorm(0.975) * sigma, lty = 2)
```

## Python Code

```python
from scipy import stats

X = stats.norm(loc=3, scale=2)          # N(3, 4): scale is the sd
print("(a)", X.sf(2.5), 1 - stats.norm.cdf((2.5 - 3) / 2))
print("(b)", X.cdf(3.3) - X.cdf(1.2))
c = stats.norm.ppf(0.975) * 2
print("(c) c =", c, " check:", X.cdf(3 + c) - X.cdf(3 - c))
```

## Practice Questions

*✎ new question added for this site (worked solution below)*

- ✎ IQ scores are $N(100,15^2)$. What is the probability that a person has an IQ above 130?
- ✎ $X\sim N(3,4)$. Compute $P(X\le5)$.
- ✎ A filling machine fills bottles with $N(500,\,2^2)$ g. Below which weight do the lightest 1% of bottles fall?

## Solutions

*✎ solution written for this site*

- ✎ Q1: $z=\frac{130-100}{15}=2$; $P(X>130)=1-\Phi(2)\approx0.0228$.
- ✎ Q2: $\sigma=2$, so $P(X\le5)=\Phi\big(\frac{5-3}{2}\big)=\Phi(1)\approx0.841$.
- ✎ Q3: $500+z_{0.01}\cdot2=500-2.326\cdot2\approx495.3$ g.
