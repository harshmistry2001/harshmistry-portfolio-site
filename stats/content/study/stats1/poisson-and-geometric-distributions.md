# Poisson and Geometric Distributions

> Course part: Stats 1

## Overview

Two more discrete models. The **Poisson** distribution counts how many rare events occur in a fixed time or space window (calls per minute, errors per page). The **geometric** distribution counts how many failures occur *before the first success*.

## Concept

### Poisson distribution

$X\sim Poi(\lambda)$ with rate parameter $\lambda>0$ (the average number of events per window):

$$P(X=k)=\frac{e^{-\lambda}\lambda^k}{k!},\quad k=0,1,2,\dots,\qquad E(X)=\lambda,\quad Var(X)=\lambda .$$

The equality of mean and variance is a quick diagnostic for Poisson data. The [Poisson distribution](https://en.wikipedia.org/wiki/Poisson_distribution) fits when events occur independently, at a constant average rate, and (practically) one at a time.

**Law of rare events:** if $n$ is large and $p$ small (rule of thumb $n>20$, $p<0.05$), then $Bin(n,p)\approx Poi(\lambda)$ with $\lambda=np$.

### Geometric distribution

Repeat independent Bernoulli trials with success probability $p$. Let $X$ be the number of **failures before the first success**. Then $X\sim geo(p)$ and the [geometric distribution](https://en.wikipedia.org/wiki/Geometric_distribution) is

$$P(X=k)=(1-p)^k\,p,\quad k=0,1,2,\dots,\qquad E(X)=\frac{1-p}{p},\quad Var(X)=\frac{1-p}{p^2}.$$

**Convention warning:** some books (and SciPy's `geom`) count the number of *trials* up to and including the first success, which shifts $X$ by one. R's `dgeom` counts failures, like this course.

## Worked Example

**Poisson.** A help desk receives on average $\lambda=3$ calls per minute.

- $P(X=0)=e^{-3}\approx0.0498$.
- $P(X\le2)=e^{-3}\big(1+3+\tfrac{9}{2}\big)=8.5\,e^{-3}\approx0.423$.

**Approximation.** For $Bin(100,0.02)$: $P(X=0)=0.98^{100}\approx0.1326$, and the Poisson approximation with $\lambda=2$ gives $e^{-2}\approx0.1353$.

**Geometric.** Each sales call succeeds with probability $p=0.2$. $P(\text{exactly 3 failures before the first sale})=0.8^3\cdot0.2=0.1024$, and the expected number of failures before the first sale is $\frac{0.8}{0.2}=4$.

## Common Mistakes

- Using Poisson with a rate for a window of different length without rescaling $\lambda$ (3 calls/min means $\lambda=15$ for 5 minutes).
- Mixing the two geometric conventions (failures vs. trials).
- Applying Poisson to counts with clustering (events that trigger each other), where the variance exceeds the mean.

## When It's Used

The Poisson distribution models counts of rare events in a fixed window: calls per minute in a call center, claims per month, website errors per day, typos per page. The geometric distribution models "how many failures until the first success": attempts until a sale, days until the first breakdown.

**Exam tip:** the Poisson approximates $Bin(n,p)$ with $\lambda = np$ when $n > 20$, $p < 0.05$. The course geometric counts **failures** ($k = 0, 1, \dots$) — R's `dgeom` does too, but SciPy's `geom` counts trials, so shift it by one.

## R Code

```r
lambda <- 3                               # calls per minute
dpois(5, lambda)                          # P(X = 5)
ppois(2, lambda, lower.tail = FALSE)      # P(X >= 3)

# Law of rare events: Bin(100, 0.02) vs Poi(2)
k <- 0:6
round(rbind(binomial = dbinom(k, 100, 0.02), poisson = dpois(k, 2)), 4)

# Geometric: failures before first success, p = 0.2
p <- 0.2
dgeom(3, p)                               # (1 - p)^3 * p
c(E = (1 - p) / p, Var = (1 - p) / p^2)
set.seed(6); g <- rgeom(1e5, p); c(mean(g), var(g))
```

## Python Code

```python
import numpy as np
from scipy import stats

lam = 3
print(stats.poisson(lam).pmf(5), stats.poisson(lam).sf(2))

k = np.arange(7)
print(np.round(np.vstack([stats.binom(100, 0.02).pmf(k), stats.poisson(2).pmf(k)]), 4))

# Geometric counting failures (course definition): shift SciPy's geom by -1
p = 0.2
G = stats.geom(p, loc=-1)
print(G.pmf(3), (1 - p)**3 * p)
print("E, Var:", G.mean(), G.var(), (1 - p) / p, (1 - p) / p**2)
```

## Practice Questions

*✎ new question added for this site (worked solution below)*

- ✎ For $X\sim Poi(4)$ compute $P(X=2)$.
- ✎ A sales call succeeds with probability 0.25. What is the probability that the first success comes at the third call, and how many failures do you expect before the first success?
- ✎ 1% of items are defective. Use the Poisson approximation to estimate the probability of at most one defective item in a batch of 200.

## Solutions

*✎ solution written for this site*

- ✎ Q1: $P(X=2)=e^{-4}\cdot\frac{16}{2}=8e^{-4}\approx0.1465$.
- ✎ Q2: The first success at the third call means 2 failures first: $0.75^2\cdot0.25=0.1406$. Expected failures: $\frac{0.75}{0.25}=3$.
- ✎ Q3: $\lambda=200\cdot0.01=2$, so $P(X\le1)=e^{-2}(1+2)=3e^{-2}\approx0.406$ (the exact binomial value is $0.405$).
