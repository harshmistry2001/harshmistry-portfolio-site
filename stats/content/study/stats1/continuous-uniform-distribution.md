# Continuous Uniform Distribution

> Course part: Stats 1

## Overview

The continuous uniform distribution is the model of "any value in a range is equally likely": a random arrival time within a window, a rounding error, or the output of a random number generator. It is the simplest continuous distribution and the starting point of simulation.

## Concept

$X\sim U(a,b)$ has a constant density on the interval $[a,b]$:

$$f_X(x)=\frac1{b-a}\ \ (a\le x\le b),\qquad F_X(x)=\frac{x-a}{b-a}\ \ (a\le x\le b),$$
with $F_X=0$ left of $a$ and $F_X=1$ right of $b$. The mean and variance are

$$E(X)=\frac{a+b}{2},\qquad Var(X)=\frac{(b-a)^2}{12}.$$

(See [continuous uniform distribution](https://en.wikipedia.org/wiki/Continuous_uniform_distribution).) The probability of a sub-interval depends only on its **width**: $P(c<X\le d)=\dfrac{d-c}{b-a}$ for $a\le c<d\le b$. As for every continuous variable, $P(X=x)=0$.

## Worked Example

A bus arrives at a random moment within a 10-minute window, $X\sim U(0,10)$.

- $P(X\le3)=3/10=0.3$ and $P(2<X\le7)=5/10=0.5$.
- $E(X)=5$ minutes, $Var(X)=100/12\approx8.33$, $\sigma\approx2.89$.

**Unknown bound.** If $X\sim U(12000,\theta)$ has expected value 14000, then $\frac{12000+\theta}{2}=14000$ gives $\theta=16000$.

## Common Mistakes

- Using the density value $\frac1{b-a}$ as a probability. It can exceed 1 when the interval is shorter than 1.
- Forgetting that outside $[a,b]$ the density is 0 and $F$ is constant.
- Dividing by 12 incorrectly: the variance uses $(b-a)^2/12$, not $(b-a)/12$.

## When It's Used

The continuous uniform is the model of "no information beyond the range": random arrival within a time window, rounding errors, a random number generator. It is also the starting point of simulation (every random variable can be generated from a uniform one).

**Exam tip (gas station):** $E(X) = \frac{a+b}{2}$ lets you solve for an unknown bound: $\frac{12000 + \theta}{2} = 14000 \Rightarrow \theta = 16000$. Probabilities are widths divided by $b - a$; $P(X = x) = 0$.

## R Code

```r
a <- 12000
theta <- 2 * 14000 - a            # from E(X) = (a + theta) / 2
theta

punif(14200, a, theta) - punif(12200, a, theta)    # P(12200 <= X <= 14200)
punif(15000, a, theta, lower.tail = FALSE)         # P(X >= 15000)
0                                                  # P(X = 14500), continuous

c(E = (a + theta) / 2, Var = (theta - a)^2 / 12)
```

## Python Code

```python
from scipy import stats

a = 12000
theta = 2 * 14000 - a
X = stats.uniform(loc=a, scale=theta - a)          # SciPy: loc = a, scale = b - a
print("theta =", theta)
print(X.cdf(14200) - X.cdf(12200), X.sf(15000))
print("E, Var:", X.mean(), X.var())
```

## Practice Questions

*✎ new question added for this site (worked solution below)*

- ✎ For $X\sim U(2,8)$ find $E(X)$, $Var(X)$ and $P(X>6)$.
- ✎ $X\sim U(0,\theta)$ has expected value 12. Find $\theta$ and $P(X\le 6)$.
- ✎ A measurement is rounded to the nearest integer, so the rounding error is uniform on $[-0.5,0.5]$. Find its variance and standard deviation.

## Solutions

*✎ solution written for this site*

- ✎ Q1: $E(X)=5$; $Var(X)=\frac{36}{12}=3$; $P(X>6)=\frac{2}{6}=\frac13$.
- ✎ Q2: $\theta/2=12\Rightarrow\theta=24$; $P(X\le6)=6/24=0.25$.
- ✎ Q3: $Var=\frac{1^2}{12}\approx0.0833$, $\sigma\approx0.289$.
