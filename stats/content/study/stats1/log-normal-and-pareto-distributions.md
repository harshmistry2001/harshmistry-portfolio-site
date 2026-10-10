# Log-Normal and Pareto Distributions

> Course part: Stats 1

## Overview

Many quantities are positive and strongly right-skewed: prices, incomes, claim sizes, file sizes. The normal distribution does not fit them (it allows negative values and is symmetric). The **log-normal** and **Pareto** distributions are the two standard models, differing mainly in how heavy the right tail is.

## Concept

### Log-normal distribution

$X\sim LN(\mu,\sigma^2)$ means that $\ln X\sim N(\mu,\sigma^2)$, equivalently $X=e^{Y}$ with $Y$ normal. See [log-normal distribution](https://en.wikipedia.org/wiki/Log-normal_distribution). It arises when many independent *multiplicative* effects act together (just as the normal arises from additive effects).

$$E(X)=e^{\mu+\sigma^2/2},\qquad \text{median}(X)=e^{\mu}.$$

The mean is larger than the median: the distribution is right-skewed. Probabilities are computed by taking logarithms: $P(X\le x)=\Phi\!\big(\frac{\ln x-\mu}{\sigma}\big)$.

### Pareto distribution

The [Pareto distribution](https://en.wikipedia.org/wiki/Pareto_distribution) (in its simplest form with minimum 1) has density
$$f_X(x)=a\,x^{-(a+1)},\quad x\ge1,\ a>0,\qquad P(X>x)=x^{-a}.$$
The tail decays only like a power, so very large values are not extremely rare ("heavy tail"). The mean $E(X)=\frac{a}{a-1}$ exists only for $a>1$ and the variance only for $a>2$.

## Worked Example

**Log-normal.** Let $\ln X\sim N(1,\,0.5^2)$. Median: $e^{1}\approx2.72$. Mean: $e^{1+0.125}\approx3.08$. $P(X\le e^2)=\Phi\big(\frac{2-1}{0.5}\big)=\Phi(2)\approx0.977$.

**Pareto.** With $a=2$: $P(X>10)=10^{-2}=0.01$ and $E(X)=2$. A normal distribution with the same mean and a modest spread would make a value above 10 virtually impossible, whereas here it happens once in a hundred cases. Underestimating the tail this way is a classic source of mispriced risk.

## Common Mistakes

- Using $e^{\mu}$ as the mean of a log-normal variable; it is the median.
- Treating $\mu$ and $\sigma^2$ as the mean and variance of $X$ itself; they belong to $\ln X$.
- Applying variance-based methods to a Pareto distribution with $a\le2$ (the variance is infinite).

## When It's Used

Log-normal and Pareto distributions model positive, right-skewed quantities with large values: stock prices and returns over longer horizons (log-normal), city sizes, incomes, insurance losses and file sizes (Pareto, heavy tail). Underestimating the tail — e.g. by assuming normality — is a classic cause of mispriced risk.

**Exam tip:** if $\ln X \sim N(\mu, \sigma^2)$ then $E(X) = e^{\mu + \sigma^2/2}$, **not** $e^{\mu}$ (that is the median).

## R Code

```r
set.seed(12)
mu <- 0.5; sigma <- 0.8
x <- rlnorm(1e5, meanlog = mu, sdlog = sigma)
c(sim_mean = mean(x), formula = exp(mu + sigma^2 / 2), median = exp(mu))

# Pareto with density a x^-(a+1), x >= 1, via inverse transform: X = U^(-1/a)
a <- 2.5
p <- runif(1e5)^(-1 / a)
c(sim_mean = mean(p), formula = a / (a - 1))      # mean exists for a > 1
mean(p > 10); 10^(-a)                             # heavy tail: P(X > 10) = 10^-a
```

## Python Code

```python
import numpy as np
from scipy import stats

rng = np.random.default_rng(12)
mu, sigma = 0.5, 0.8
LN = stats.lognorm(s=sigma, scale=np.exp(mu))       # SciPy parameterization
x = LN.rvs(100_000, random_state=rng)
print(x.mean(), np.exp(mu + sigma**2 / 2), LN.mean(), "median:", LN.median())

a = 2.5
P = stats.pareto(b=a)                               # density a x^-(a+1) on x >= 1
print(P.mean(), a / (a - 1), P.sf(10), 10**-a)
```

## Practice Questions

*✎ new question added for this site (worked solution below)*

- ✎ If $\ln X\sim N(0,1)$, find the median and the mean of $X$.
- ✎ For a Pareto variable with $a=3$ find $P(X>2)$ and $E(X)$.
- ✎ Why can a Pareto distribution with $a=1$ not be used to compute an "average loss"?

## Solutions

*✎ solution written for this site*

- ✎ Q1: Median $=e^0=1$; mean $=e^{0+1/2}=e^{0.5}\approx1.649$.
- ✎ Q2: $P(X>2)=2^{-3}=0.125$; $E(X)=\frac{3}{3-1}=1.5$.
- ✎ Q3: For $a\le1$ the integral $\int_1^\infty x\cdot a x^{-a-1}dx$ diverges: the expected value is infinite, so sample averages never settle.
