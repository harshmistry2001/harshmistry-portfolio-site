# Exponential Distribution

> Course part: Stats 1

## Overview

How long until the next customer arrives, the next machine fails, the next claim is filed? When such events happen at random with a constant average rate, the waiting time follows an **exponential distribution**. It is the continuous companion of the Poisson distribution.

## Concept

$X\sim Exp(\lambda)$ with rate $\lambda>0$ (events per unit of time):

$$f_X(x)=\lambda e^{-\lambda x}\ \ (x\ge0),\qquad F_X(x)=1-e^{-\lambda x},\qquad P(X>t)=e^{-\lambda t},$$
$$E(X)=\frac1\lambda,\qquad Var(X)=\frac1{\lambda^2}.$$

(See [exponential distribution](https://en.wikipedia.org/wiki/Exponential_distribution).) The median is $\ln 2/\lambda$, smaller than the mean $1/\lambda$ because the distribution is right-skewed.

### Memorylessness

The exponential distribution is the only continuous distribution that is [memoryless](https://en.wikipedia.org/wiki/Memorylessness):
$$P(X>t+s\mid X>t)=P(X>s).$$
A component that has survived $t$ time units is "as good as new". This fits random shocks but not wear-out processes.

If the number of events in a unit window is Poisson with rate $\lambda$, the waiting time between consecutive events is $Exp(\lambda)$.

**Software warning:** R uses `rate = λ`; SciPy uses `scale = 1/λ`.

## Worked Example

Customers arrive on average every 4 minutes, so $\lambda=\frac14=0.25$ per minute.

- $E(X)=4$ min, $Var(X)=16$.
- $P(X>6)=e^{-0.25\cdot6}=e^{-1.5}\approx0.223$.
- Memorylessness: given that nobody has arrived for 4 minutes, $P(X>10\mid X>4)=P(X>6)\approx0.223$.
- Median: $\ln2/0.25\approx2.77$ min.

## Common Mistakes

- Using the mean $\mu$ where the rate $\lambda=1/\mu$ is needed.
- Assuming memorylessness for lifetimes that wear out (people, mechanical parts).
- Mixing the rate and the scale parametrisations between R and Python.

## When It's Used

The exponential distribution models waiting times between random events: time between customer arrivals, time to failure of electronics, time until an insurance claim. Its memorylessness means a component that has survived so far is "as good as new" — reasonable for random shocks, not for wear-out.

**Exam tip:** $P(X > t) = e^{-\lambda t}$. R uses `rate = lambda`; SciPy uses `scale = 1/lambda`. Insurance problem: $\lambda_i = 1/(5i^2)$.

## R Code

```r
lam <- function(i) 1 / (5 * i^2)

# (a) group 1: no accident in the first 6 months
pexp(6, rate = lam(1), lower.tail = FALSE)
exp(-6 * lam(1))

# (b) group 2: accident during the second year (12 < X <= 24)
pexp(24, lam(2)) - pexp(12, lam(2))

# (c) group 3: accident strictly before month 10
pexp(10, lam(3))

# Memorylessness check: P(X > t + s | X > t) = P(X > s)
t <- 5; s <- 3; l <- 0.2
c((1 - pexp(t + s, l)) / (1 - pexp(t, l)), 1 - pexp(s, l))
```

## Python Code

```python
import numpy as np
from scipy import stats

lam = lambda i: 1 / (5 * i**2)
E = lambda i: stats.expon(scale=1 / lam(i))        # SciPy: scale = 1 / lambda

print("(a)", E(1).sf(6), np.exp(-6 * lam(1)))
print("(b)", E(2).cdf(24) - E(2).cdf(12))
print("(c)", E(3).cdf(10))

X = stats.expon(scale=1 / 0.2)
print("memoryless:", X.sf(8) / X.sf(5), X.sf(3))
```

## Practice Questions

*✎ new question added for this site (worked solution below)*

- ✎ A device fails at rate $\lambda=0.1$ per hour. Find the expected lifetime and the probability that it fails within 5 hours.
- ✎ A component with $\lambda=0.01$ per hour has already worked for 100 hours. What is the probability that it lasts at least 50 more hours?
- ✎ For mean waiting time 4 minutes, after how many minutes has a customer arrived with probability 90%?

## Solutions

*✎ solution written for this site*

- ✎ Q1: $E(X)=10$ h; $P(X\le5)=1-e^{-0.5}\approx0.393$.
- ✎ Q2: By memorylessness, $P(X>150\mid X>100)=P(X>50)=e^{-0.5}\approx0.607$.
- ✎ Q3: Solve $1-e^{-0.25t}=0.9$: $t=\frac{\ln10}{0.25}\approx9.21$ minutes.
