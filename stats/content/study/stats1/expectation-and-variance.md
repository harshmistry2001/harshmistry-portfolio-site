# Expectation and Variance

> Course part: Stats 1

## Overview

A distribution is summarised by two numbers above all: where its centre lies and how widely it spreads. The **expected value** is the theoretical average (the long-run mean of repeated observations); the **variance** measures the typical squared distance from it. They are the theoretical counterparts of the sample mean and sample variance.

## Concept

### Expected value

For a discrete RV with values $x_k$ and pmf $p_X$, and for a continuous RV with density $f_X$,
$$E(X)=\sum_{k}x_k\,p_X(x_k)\qquad\text{and}\qquad E(X)=\int_{-\infty}^{\infty}x\,f_X(x)\,dx .$$
The [expected value](https://en.wikipedia.org/wiki/Expected_value) is the "center of gravity" of the distribution. For a function $g$: $E\,g(X)=\sum_k g(x_k)p_X(x_k)$ (or $\int g(x)f_X(x)\,dx$).

### Variance and standard deviation

The [variance](https://en.wikipedia.org/wiki/Variance) is the expected squared deviation from the mean:
$$Var(X)=E\big[(X-E(X))^2\big]=E(X^2)-\big(E(X)\big)^2 ,\qquad \sigma(X)=\sqrt{Var(X)} .$$
The second form is usually easier to compute.

### Linear transformations

$$E(aX+b)=a\,E(X)+b,\qquad Var(aX+b)=a^2\,Var(X),\qquad \sigma(aX+b)=|a|\,\sigma(X).$$
Shifting by $b$ moves the centre but does not change the spread.

## Worked Example

**Fair die.** $E(X)=\frac{1+\dots+6}{6}=3.5$. $E(X^2)=\frac{1+4+9+16+25+36}{6}=\frac{91}{6}\approx15.17$. So $Var(X)=\frac{91}{6}-3.5^2=\frac{35}{12}\approx2.92$ and $\sigma\approx1.71$.

A game pays $10X-5$ EUR: $E=10\cdot3.5-5=30$ EUR and $Var=100\cdot\frac{35}{12}\approx291.7$.

**Continuous.** For $f(x)=2x$ on $[0,1]$: $E(X)=\int_0^1 2x^2dx=\frac23$, $E(X^2)=\int_0^1 2x^3dx=\frac12$, so $Var(X)=\frac12-\frac49=\frac1{18}$.

## Common Mistakes

- Computing $Var(aX+b)$ as $a\,Var(X)+b$. The correct rule is $a^2\,Var(X)$.
- Using $E(X^2)=E(X)^2$; it is false unless the variance is zero.
- Confusing the theoretical $E(X)$ (a fixed number determined by the distribution) with the sample mean (a random quantity computed from data).

## When It's Used

Expected value and variance are the two numbers behind pricing and risk: expected claim cost sets an insurance premium, expected demand sets production, variance sets safety stock and capital buffers. The linear rules let you move between units (EUR to USD) or from cost to profit without recomputing.

**Exam tip:** use $Var(X) = E(X^2) - (E(X))^2$. $E(aX + b) = aE(X) + b$ but $Var(aX + b) = a^2Var(X)$ — the shift disappears.

## R Code

```r
# Discrete: number of claims per policy
x <- 0:3
p <- c(0.6, 0.25, 0.1, 0.05)
EX  <- sum(x * p)
EX2 <- sum(x^2 * p)
c(E = EX, Var = EX2 - EX^2)

# Continuous: f(x) = 3x^2 on [0, 1]
f <- function(x) 3 * x^2
E_c  <- integrate(function(x) x * f(x), 0, 1)$value
E2_c <- integrate(function(x) x^2 * f(x), 0, 1)$value
c(E = E_c, Var = E2_c - E_c^2)

# Linear transformation check by simulation: Y = 200 X + 50
set.seed(8)
sim <- sample(x, 1e5, replace = TRUE, prob = p)
c(mean(200 * sim + 50), 200 * EX + 50)
c(var(200 * sim + 50), 200^2 * (EX2 - EX^2))
```

## Python Code

```python
import numpy as np
from scipy.integrate import quad

x = np.array([0, 1, 2, 3]); p = np.array([0.6, 0.25, 0.1, 0.05])
EX, EX2 = np.sum(x * p), np.sum(x**2 * p)
print("E =", EX, " Var =", EX2 - EX**2)

f = lambda t: 3 * t**2
E_c = quad(lambda t: t * f(t), 0, 1)[0]
E2_c = quad(lambda t: t**2 * f(t), 0, 1)[0]
print("continuous: E =", E_c, " Var =", E2_c - E_c**2)

rng = np.random.default_rng(8)
sim = rng.choice(x, size=100_000, p=p)
y = 200 * sim + 50
print(y.mean(), 200 * EX + 50)
print(y.var(), 200**2 * (EX2 - EX**2))
```

## Practice Questions

*✎ new question added for this site (worked solution below)*

- ✎ $X$ takes the values 0, 1, 2 with probabilities 0.5, 0.3, 0.2. Compute $E(X)$ and $Var(X)$.
- ✎ $E(X)=10$ and $Var(X)=4$. Find the expected value, variance and standard deviation of $Y=3X-2$.

## Solutions

*✎ solution written for this site*

- ✎ Q1: $E(X)=0\cdot0.5+1\cdot0.3+2\cdot0.2=0.7$; $E(X^2)=0.3+4\cdot0.2=1.1$; $Var(X)=1.1-0.49=0.61$.
- ✎ Q2: $E(Y)=3\cdot10-2=28$; $Var(Y)=9\cdot4=36$; $\sigma(Y)=6$.
