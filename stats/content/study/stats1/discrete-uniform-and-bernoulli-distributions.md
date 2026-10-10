# Discrete Uniform and Bernoulli Distributions

> Course part: Stats 1

## Overview

These are the two simplest discrete distributions. The **discrete uniform** describes "all outcomes equally likely" (a fair die, a random draw of an ID). The **Bernoulli** distribution describes a single yes/no experiment and is the building block of the binomial and geometric distributions.

## Concept

### Discrete uniform distribution

If $X$ takes the values $1,2,\dots,s$ with equal probability, it follows a [discrete uniform distribution](https://en.wikipedia.org/wiki/Discrete_uniform_distribution):
$$P(X=k)=\frac1s,\qquad E(X)=\frac{s+1}{2},\qquad Var(X)=\frac{s^2-1}{12}.$$

### Bernoulli distribution

A random experiment with exactly two outcomes, "success" ($X=1$) and "failure" ($X=0$), with $P(X=1)=p$, is described by the Bernoulli distribution:
$$P(X=1)=p,\ P(X=0)=1-p,\qquad E(X)=p,\qquad Var(X)=p(1-p).$$

Derivation of the variance: since $X^2=X$, $E(X^2)=p$ and $Var(X)=p-p^2=p(1-p)$. The variance is largest, $0.25$, at $p=0.5$ (maximal uncertainty) and shrinks to 0 as $p\to0$ or $p\to1$. The sum of $n$ independent Bernoulli variables is binomial.

## Worked Example

**Fair die** ($s=6$): $E(X)=3.5$, $Var(X)=\frac{36-1}{12}=\frac{35}{12}\approx2.92$ (matching the direct computation on the Expectation page).

**Click-through.** An ad is clicked with probability $p=0.2$. Let $X=1$ if clicked: $E(X)=0.2$, $Var(X)=0.2\cdot0.8=0.16$. Over 1000 independent impressions the number of clicks is $Bin(1000,0.2)$ with mean 200.

## Common Mistakes

- Applying the uniform formulas to values not coded $1,\dots,s$. For values $a,\dots,b$ shift and use $E=\frac{a+b}{2}$, $Var=\frac{(b-a+1)^2-1}{12}$.
- Forgetting that the Bernoulli mean $p$ equals the success probability, not a possible outcome of $X$.

## When It's Used

The Bernoulli variable is the building block of every yes/no outcome: click or no click, default or no default, defective or not. The discrete uniform models fair games and random selection (drawing a random ID, a fair die). Sums of Bernoullis give the binomial distribution.

**Exam tip:** for a fair die ($s = 6$): $E = 3.5$, $Var = 35/12$. For Bernoulli: $Var = p(1-p)$ is largest at $p = 0.5$.

## R Code

```r
s <- 6
c(E = (s + 1) / 2, Var = (s^2 - 1) / 12)
x <- 1:s
c(E = mean(x), Var = mean(x^2) - mean(x)^2)       # direct check

p <- 0.3
c(E = p, Var = p * (1 - p))
set.seed(4)
clicks <- rbinom(10000, size = 1, prob = p)       # Bernoulli sample
c(mean(clicks), var(clicks))

curve(x * (1 - x), 0, 1, ylab = "Var = p(1 - p)", xlab = "p")
```

## Python Code

```python
import numpy as np
from scipy import stats

s = 6
print("uniform:", (s + 1) / 2, (s**2 - 1) / 12, stats.randint(1, s + 1).stats(moments="mv"))

p = 0.3
print("bernoulli:", stats.bernoulli(p).stats(moments="mv"))
rng = np.random.default_rng(4)
clicks = rng.binomial(1, p, size=10_000)
print(clicks.mean(), clicks.var(ddof=1))
```

## Practice Questions

*✎ new question added for this site (worked solution below)*

- ✎ $X$ is uniformly distributed on $\{1,\dots,10\}$. Find $E(X)$, $Var(X)$ and $P(X\le3)$.
- ✎ A conversion happens with probability 0.04. Compute mean and variance of the Bernoulli indicator, and decide for which $p$ the variance is largest.

## Solutions

*✎ solution written for this site*

- ✎ Q1: $E(X)=5.5$; $Var(X)=\frac{100-1}{12}=8.25$; $P(X\le3)=0.3$.
- ✎ Q2: $E=0.04$, $Var=0.04\cdot0.96=0.0384$. The variance $p(1-p)$ is maximal at $p=0.5$, where it equals $0.25$.
