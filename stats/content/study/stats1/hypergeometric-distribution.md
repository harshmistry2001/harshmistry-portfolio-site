# Hypergeometric Distribution

> Course part: Stats 1

## Overview

Draw cards from a deck, or sample parts from a delivery of a fixed size, **without putting them back**. The chance of success changes with every draw because the population shrinks, so the binomial distribution no longer applies exactly. The hypergeometric distribution is the exact model.

## Concept

An urn contains $r$ red and $b$ blue balls ($N=r+b$ in total). Draw $n$ balls **without replacement**; let $X$ be the number of red balls drawn. Then $X$ follows a [hypergeometric distribution](https://en.wikipedia.org/wiki/Hypergeometric_distribution), $X\sim Hyp(n,r,b)$:

$$P(X=k)=\frac{\binom rk\binom b{n-k}}{\binom{r+b}{n}} .$$

The numerator counts the ways to choose $k$ of the $r$ red and $n-k$ of the $b$ blue balls; the denominator counts all ways to choose $n$ of the $r+b$ balls (a Laplace experiment). The mean is $E(X)=n\,\dfrac{r}{r+b}$.

**Relation to the binomial:** if the population is very large compared with the sample size, removing a few items barely changes the success probability and $Hyp(n,r,b)\approx Bin\!\big(n,\tfrac{r}{r+b}\big)$.

**Parameter naming warning:** textbooks, R (`dhyper(k, m, n, k)`) and SciPy (`hypergeom(M, n, N)`) all use different letters for the same quantities. Always map them by meaning (red, blue, sample size).

## Worked Example

A bag holds 12 cookies, 3 salty ($r=3$) and 9 normal ($b=9$). You take $n=4$ cookies.

- $P(X=0)=\dfrac{\binom30\binom94}{\binom{12}4}=\dfrac{126}{495}\approx0.255$.
- $P(X=1)=\dfrac{\binom31\binom93}{\binom{12}4}=\dfrac{3\cdot84}{495}=\dfrac{252}{495}\approx0.509$.
- $P(X\le1)=\dfrac{378}{495}\approx0.764$.
- Expected number of salty cookies: $4\cdot\frac{3}{12}=1$.

## Common Mistakes

- Using the binomial (with a fixed $p$) for draws without replacement from a small population.
- Mixing up the parameter order between sources.
- Forgetting that $k$ is limited: $\max(0,\,n-b)\le k\le\min(n,\,r)$.

## When It's Used

The hypergeometric distribution is the exact model for sampling *without* replacement from a finite lot: acceptance sampling of a delivery, auditing a sample of invoices, drawing cards, the lottery. When the lot is large relative to the sample it is close to the binomial.

**Exam tip (cookies):** 12 cookies, 3 salty ($r$), 9 normal ($b$), take $n = 4$: $P(X \le 1) = \frac{\binom{3}{0}\binom{9}{4} + \binom{3}{1}\binom{9}{3}}{\binom{12}{4}}$. Watch the parameter names — they differ between the course, R and SciPy.

## R Code

```r
# R: phyper(q, m = successes in urn, n = failures in urn, k = draws)
r <- 3; b <- 9; n <- 4
dhyper(0:3, m = r, n = b, k = n)
phyper(1, m = r, n = b, k = n)                         # P(X <= 1)

(choose(3, 0) * choose(9, 4) + choose(3, 1) * choose(9, 3)) / choose(12, 4)

# Large population: close to binomial
round(rbind(hyper = dhyper(0:3, 300, 900, 4), binom = dbinom(0:3, 4, 0.25)), 4)
```

## Python Code

```python
from math import comb
from scipy import stats

# SciPy: hypergeom(M = population size, n = successes in population, N = draws)
X = stats.hypergeom(M=12, n=3, N=4)
print(X.pmf(range(4)))
print("P(X <= 1) =", X.cdf(1))
print((comb(3, 0) * comb(9, 4) + comb(3, 1) * comb(9, 3)) / comb(12, 4))

print(stats.hypergeom(1200, 300, 4).pmf(range(4)).round(4), stats.binom(4, 0.25).pmf(range(4)).round(4))
```

## Practice Questions

*✎ new question added for this site (worked solution below)*

- ✎ Five cards are dealt from a standard 52-card deck. What is the probability of exactly 2 hearts?
- ✎ A lot of 50 parts contains 5 defective ones. An inspector tests 5 parts. What is the probability that none is defective?

## Solutions

*✎ solution written for this site*

- ✎ Q1: Red = hearts ($r=13$), blue = other cards ($b=39$), $n=5$: $\dfrac{\binom{13}{2}\binom{39}{3}}{\binom{52}{5}}=\dfrac{78\cdot9139}{2{,}598{,}960}\approx0.274$.
- ✎ Q2: $\dfrac{\binom{45}{5}}{\binom{50}{5}}=\dfrac{1{,}221{,}759}{2{,}118{,}760}\approx0.577$.
