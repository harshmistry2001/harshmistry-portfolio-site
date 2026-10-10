# Continuous Random Variables and Densities

> Course part: Stats 1

## Overview

A waiting time or a weight can take any value in an interval, so there are uncountably many possible values and each single value has probability zero. Instead we describe the distribution with a **density function**: probabilities are *areas* under its graph.

## Concept

A random variable $X$ is [continuous](https://en.wikipedia.org/wiki/Probability_density_function) if its distribution function can be written as an integral of a **density** $f_X\ge0$:
$$F_X(t)=\int_{-\infty}^{t} f_X(x)\,dx .$$

Consequences:

- **Probabilities are areas**: $P(a<X\le b)=\int_a^b f_X(x)\,dx$.
- **Normalisation**: $\int_{-\infty}^{\infty} f_X(x)\,dx=1$.
- **Density from DF**: $f_X(x)=\dfrac{d}{dx}F_X(x)$ wherever $F_X$ is differentiable.
- **Single points have probability zero**: $P(X=x)=0$. Therefore $P(a<X\le b)=P(a\le X\le b)$; for continuous variables it does not matter whether the end points are included.
- A density value $f(x)$ is **not** a probability and can exceed 1; only integrals over intervals are probabilities.
- Mixed distributions exist as well (for instance insurance claims: a point mass at 0 for "no claim" plus a continuous part, or precipitation: dry days plus continuous amounts).

## Worked Example

Let $f(x)=2x$ for $0\le x\le1$ and $0$ otherwise.

- Valid density: $f\ge0$ and $\int_0^1 2x\,dx=1$ ✓.
- Distribution function: $F(t)=t^2$ for $0\le t\le1$.
- $P(0.5<X\le1)=F(1)-F(0.5)=1-0.25=0.75$.
- $P(X=0.5)=0$, although $f(0.5)=1\neq0$: the density is not a probability.

## Common Mistakes

- Reading $f(x)$ as $P(X=x)$.
- Forgetting to check $\int f=1$ when a constant in the density is unknown.
- Differentiating $F$ across a kink or jump without checking where $F$ is actually differentiable.

## When It's Used

Continuous random variables model measurements: time until a machine fails, amount of an insurance claim, rainfall, weight of a package. Probabilities are areas under the density; single values have probability zero, which is why specifications are always intervals (e.g. 495-505 g).

**Exam tip:** check a density by verifying $f \ge 0$ and $\int f = 1$; get probabilities by integrating; get the density from $F$ by differentiating.

## R Code

```r
f <- function(x) ifelse(x >= 0 & x <= 1, 3 * x^2, 0)   # density on [0, 1]

integrate(f, 0, 1)$value                   # total probability = 1
integrate(f, 0.2, 0.5)$value               # P(0.2 < X <= 0.5)

F <- function(t) sapply(t, function(u) integrate(f, 0, min(max(u, 0), 1))$value)
F(0.5)                                     # = 0.5^3

# Density is the derivative of F (numerical check at x = 0.5)
h <- 1e-5
(F(0.5 + h) - F(0.5 - h)) / (2 * h)
f(0.5)
```

## Python Code

```python
import numpy as np
from scipy.integrate import quad

f = lambda x: 3 * x**2 if 0 <= x <= 1 else 0.0

print(quad(f, 0, 1)[0])                    # = 1
print(quad(f, 0.2, 0.5)[0])                # P(0.2 < X <= 0.5)

F = lambda t: quad(f, 0, min(max(t, 0), 1))[0]
print(F(0.5), 0.5**3)

h = 1e-5
print((F(0.5 + h) - F(0.5 - h)) / (2 * h), f(0.5))   # derivative of F = f
```

## Practice Questions

*✎ new question added for this site (worked solution below)*

- ✎ Find the constant $c$ such that $f(x)=c\,x^2$ on $[0,3]$ (and 0 elsewhere) is a density, and compute $P(1<X\le2)$.
- ✎ A waiting time has distribution function $F(x)=1-e^{-x/2}$ for $x\ge0$. Find the density and $P(X>4)$.

## Solutions

*✎ solution written for this site*

- ✎ Q1: $\int_0^3 c x^2\,dx=9c=1$, so $c=\frac19$. Then $P(1<X\le2)=\int_1^2\frac{x^2}{9}dx=\frac{8-1}{27}=\frac{7}{27}\approx0.259$.
- ✎ Q2: $f(x)=F'(x)=\tfrac12e^{-x/2}$ for $x\ge0$. $P(X>4)=1-F(4)=e^{-2}\approx0.135$.
