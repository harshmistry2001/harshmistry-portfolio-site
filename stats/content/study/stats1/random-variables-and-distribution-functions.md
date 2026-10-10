# Random Variables and Distribution Functions

> Course part: Stats 1

## Overview

Outcomes of experiments are often not numbers ("heads", "defective", "Tuesday"). A **random variable** attaches a number to each outcome so that we can compute with it. Its **distribution function** then tells us everything about how likely the different values are.

## Concept

### Random variable

A [random variable](https://en.wikipedia.org/wiki/Random_variable) (RV) $X$ is a function that maps each outcome $\omega\in\Omega$ to a real number $X(\omega)$. Typical examples: the number of heads in 10 tosses, the daily demand for a product, the waiting time until a bus arrives. Before the experiment the value is uncertain; after the experiment it is observed.

- **Discrete** RVs take countably many values and are described by the **probability mass function** (pmf) $p_X(x_k)=P(X=x_k)$, with $\sum_k p_X(x_k)=1$.
- **Continuous** RVs take values in an interval and are described by a density (see next topic).

### Distribution function

The [cumulative distribution function](https://en.wikipedia.org/wiki/Cumulative_distribution_function) (distribution function, DF) is defined for every RV by
$$F(t)=P(X\le t),\qquad t\in\mathbb{R}.$$

Properties: $F$ is non-decreasing, right-continuous, $F(-\infty)=0$ and $F(+\infty)=1$. It gives all interval probabilities:
$$P(a<X\le b)=F(b)-F(a),\qquad P(X>a)=1-F(a).$$

For a discrete RV, $F$ is a **step function**: it jumps at each possible value $x_k$ by exactly $P(X=x_k)$.

## Worked Example

Toss two fair coins; let $X$ be the number of heads. Then $P(X=0)=\frac14$, $P(X=1)=\frac12$, $P(X=2)=\frac14$.

| $t$ | $t<0$ | $0\le t<1$ | $1\le t<2$ | $t\ge2$ |
|---|---|---|---|---|
| $F(t)$ | 0 | 0.25 | 0.75 | 1 |

Then $P(0<X\le1)=F(1)-F(0)=0.75-0.25=0.5$, and the jump of $F$ at $t=1$ is $0.75-0.25=0.5=P(X=1)$.

## Common Mistakes

- Writing $F(t)=P(X<t)$. The definition uses $\le$, which matters for discrete variables.
- Forgetting that $P(a<X\le b)$ excludes $a$ but includes $b$.
- Treating the pmf of a continuous variable as meaningful: for continuous $X$, $P(X=x)=0$.

## When It's Used

Random variables turn outcomes into numbers you can compute with: number of claims per policy, daily demand, number of defective items per batch. The distribution function $F(t) = P(X \le t)$ gives every "at most" probability directly and is what statistical software tabulates.

**Exam tip:** for discrete $X$, $F$ is a step function; $P(a < X \le b) = F(b) - F(a)$, and $P(X = x) =$ jump height at $x$.

## R Code

```r
# X = sum of two dice
dice <- expand.grid(1:6, 1:6)
X <- rowSums(dice)
pmf <- table(X) / nrow(dice)
cdf <- cumsum(pmf)
rbind(pmf = round(pmf, 3), cdf = round(cdf, 3))

# P(4 < X <= 8) = F(8) - F(4)
cdf["8"] - cdf["4"]

plot(stepfun(as.numeric(names(cdf)), c(0, cdf)), main = "Distribution function F(t)",
     xlab = "t", ylab = "F(t)", verticals = FALSE)
```

## Python Code

```python
import numpy as np
import matplotlib.pyplot as plt
from itertools import product

X = np.array([a + b for a, b in product(range(1, 7), repeat=2)])
values, counts = np.unique(X, return_counts=True)
pmf = counts / counts.sum()
cdf = np.cumsum(pmf)
for v, p, F in zip(values, pmf, cdf):
    print(v, round(p, 3), round(F, 3))

F = dict(zip(values, cdf))
print("P(4 < X <= 8) =", F[8] - F[4])

plt.step(values, cdf, where="post")
plt.title("Distribution function F(t)")
plt.show()
```

## Practice Questions

*✎ new question added for this site (worked solution below)*

- ✎ A discrete RV has $P(X=1)=0.2$, $P(X=2)=0.5$, $P(X=3)=0.3$. Compute $F(2)$, $P(X>1)$ and $P(1<X\le3)$.
- ✎ A distribution function of a discrete RV takes the values $F(0)=0.1$, $F(1)=0.4$, $F(2)=1$ at the points of increase 0, 1, 2. Find the pmf.

## Solutions

*✎ solution written for this site*

- ✎ Q1: $F(2)=0.2+0.5=0.7$; $P(X>1)=1-F(1)=1-0.2=0.8$; $P(1<X\le3)=F(3)-F(1)=1-0.2=0.8$.
- ✎ Q2: The pmf equals the jump heights: $P(X=0)=0.1$, $P(X=1)=0.4-0.1=0.3$, $P(X=2)=1-0.4=0.6$.
