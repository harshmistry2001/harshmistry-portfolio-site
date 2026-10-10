# Binomial Distribution

> Course part: Stats 1

## Overview

The binomial distribution counts **how many times something happens in a fixed number of independent attempts**: defective parts in a sample, converting visitors out of 500, patients who respond to a treatment. It is the most widely used discrete distribution.

## Concept

### Model

Perform $n$ independent trials, each a [Bernoulli trial](https://en.wikipedia.org/wiki/Bernoulli_trial) with the same success probability $p$. The number of successes $X$ follows a [binomial distribution](https://en.wikipedia.org/wiki/Binomial_distribution), written $X\sim Bin(n,p)$:

$$P(X=k)=\binom{n}{k}p^k(1-p)^{n-k},\qquad k=0,1,\dots,n .$$

The factor $\binom nk$ counts *which* of the $n$ trials are the successes; each such pattern has probability $p^k(1-p)^{n-k}$.

$$E(X)=np,\qquad Var(X)=np(1-p).$$

### Conditions to check

1. Fixed number of trials $n$.
2. Each trial has only two outcomes (success / failure).
3. Same success probability $p$ in every trial.
4. Trials are **independent**. In urn language: drawing **with replacement**. For draws without replacement use the hypergeometric distribution.

"At least" probabilities use the complement: $P(X\ge k)=1-P(X\le k-1)$.

## Worked Example

A call centre resolves 30% of calls at first contact ($p=0.3$). Of $n=10$ calls, $X\sim Bin(10,0.3)$.

- $P(X=3)=\binom{10}{3}0.3^3\,0.7^7=120\cdot0.027\cdot0.0824\approx0.267$.
- $P(X\ge1)=1-P(X=0)=1-0.7^{10}\approx0.972$.
- $E(X)=3$, $Var(X)=10\cdot0.3\cdot0.7=2.1$, so $\sigma\approx1.45$.

## Common Mistakes

- Using the binomial for draws **without** replacement from a small population.
- Forgetting the binomial coefficient.
- Misreading "at least" / "more than" / "at most" (for integers, "more than 2" means $X\ge3$).

## When It's Used

The binomial counts successes in $n$ independent trials: number of defective items in a sample of 20, number of customers who convert out of 500 visitors, number of patients who respond to treatment. It is the model behind acceptance sampling and the binomial test of Stats 2.

**Exam tip:** check the conditions — fixed $n$, independent trials, same $p$ (drawing *with* replacement). "At least" questions: $P(X \ge k) = 1 - P(X \le k-1)$.

## R Code

```r
n <- 20; p <- 0.1                       # 20 items, 10% defect rate

dbinom(2, n, p)                          # P(X = 2)
pbinom(2, n, p)                          # P(X <= 2)
1 - pbinom(2, n, p)                      # P(X >= 3)
pbinom(2, n, p, lower.tail = FALSE)      # same

c(E = n * p, Var = n * p * (1 - p))
choose(n, 2) * p^2 * (1 - p)^(n - 2)     # formula check

barplot(dbinom(0:10, n, p), names.arg = 0:10, main = "Bin(20, 0.1)")
```

## Python Code

```python
from math import comb
from scipy import stats
import matplotlib.pyplot as plt
import numpy as np

n, p = 20, 0.1
X = stats.binom(n, p)
print("P(X=2) =", X.pmf(2), " P(X<=2) =", X.cdf(2), " P(X>=3) =", X.sf(2))
print("E, Var:", X.mean(), X.var())
print("formula:", comb(n, 2) * p**2 * (1 - p)**(n - 2))

k = np.arange(0, 11)
plt.bar(k, X.pmf(k)); plt.title("Bin(20, 0.1)")
plt.show()
```

## Practice Questions

*✎ new question added for this site (worked solution below)*

- ✎ A fair coin is tossed 5 times. What is the probability of exactly 2 heads?
- ✎ 5% of items are defective. In a sample of 20 items, what is the probability that none is defective, and what are the expected number and variance of defective items?
- ✎ For $X\sim Bin(10,0.3)$ compute $P(X\ge2)$.

## Solutions

*✎ solution written for this site*

- ✎ Q1: $\binom52(0.5)^5=10/32=0.3125$.
- ✎ Q2: $P(X=0)=0.95^{20}\approx0.358$; $E(X)=20\cdot0.05=1$; $Var(X)=20\cdot0.05\cdot0.95=0.95$.
- ✎ Q3: $P(X\ge2)=1-P(0)-P(1)=1-0.0282-10\cdot0.3\cdot0.7^9=1-0.0282-0.1211\approx0.851$.
