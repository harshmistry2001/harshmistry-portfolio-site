# Multinomial Distribution

> Course part: Stats 1

## Overview

The binomial distribution counts successes versus failures. When each trial has **more than two possible outcomes** (party A, B or C; product 1, 2, 3 or 4), the vector of counts for all categories follows the multinomial distribution.

## Concept

Perform $n$ independent trials. Each trial results in category $i$ ($i=1,\dots,s$) with probability $p_i$, where $p_1+\dots+p_s=1$. Let $X_i$ be the number of trials that give category $i$. Then $(X_1,\dots,X_s)$ has a [multinomial distribution](https://en.wikipedia.org/wiki/Multinomial_distribution):

$$P(X_1=k_1,\dots,X_s=k_s)=\frac{n!}{k_1!\cdots k_s!}\;p_1^{k_1}\cdots p_s^{k_s},\qquad k_1+\dots+k_s=n .$$

- The factor $\frac{n!}{k_1!\cdots k_s!}$ counts the distinct orderings of the outcomes (a generalisation of $\binom nk$).
- Each single count is binomial: $X_i\sim Bin(n,p_i)$, so $E(X_i)=np_i$ and $Var(X_i)=np_i(1-p_i)$.
- The counts are **not** independent: they must add up to $n$, so a high count in one category forces lower counts elsewhere.
- For $s=2$ it is the binomial distribution.

## Worked Example

A poll of $n=10$ voters; the true shares are 50%, 30% and 20% for parties A, B, C. The probability of observing exactly 5, 3 and 2 votes is

$$\frac{10!}{5!\,3!\,2!}\,0.5^5\,0.3^3\,0.2^2=2520\cdot0.03125\cdot0.027\cdot0.04\approx0.0851 .$$

## Common Mistakes

- Forgetting the multinomial coefficient and multiplying only the probabilities.
- Using counts that do not add up to $n$.
- Treating the category counts as independent.

## When It's Used

The multinomial generalizes the binomial to more than two categories: counts of votes for several parties in a poll, counts of customers choosing each of $s$ products, dice outcomes. It is the sampling model behind the $\chi^2$ goodness-of-fit test in Stats 2.

**Exam tip:** the $k_i$ must add up to $n$ and the $p_i$ to 1; each single count $X_i$ is $Bin(n, p_i)$.

## R Code

```r
p <- c(red = 0.5, blue = 0.3, green = 0.2)

dmultinom(c(2, 1, 1), prob = p)                              # n = 4 draws
factorial(4) / (factorial(2) * factorial(1) * factorial(1)) * 0.5^2 * 0.3 * 0.2

set.seed(13)
draws <- rmultinom(10000, size = 10, prob = p)
rowMeans(draws)                                               # about n * p_i
10 * p
```

## Python Code

```python
import numpy as np
from math import factorial
from scipy import stats

p = [0.5, 0.3, 0.2]
print(stats.multinomial(4, p).pmf([2, 1, 1]))
print(factorial(4) / (factorial(2) * factorial(1) * factorial(1)) * 0.5**2 * 0.3 * 0.2)

rng = np.random.default_rng(13)
draws = rng.multinomial(10, p, size=10_000)
print(draws.mean(axis=0), 10 * np.array(p))
```

## Practice Questions

*✎ new question added for this site (worked solution below)*

- ✎ A fair die is rolled 6 times. What is the probability that each face appears exactly once?
- ✎ A trial has three outcomes with probabilities 0.5, 0.25, 0.25. In $n=4$ independent trials, what is the probability of the counts $(2,1,1)$?

## Solutions

*✎ solution written for this site*

- ✎ Q1: $\dfrac{6!}{1!\cdots1!}\big(\tfrac16\big)^6=\dfrac{720}{46656}\approx0.0154$.
- ✎ Q2: $\dfrac{4!}{2!\,1!\,1!}\cdot0.5^2\cdot0.25\cdot0.25=12\cdot0.015625=0.1875$.
