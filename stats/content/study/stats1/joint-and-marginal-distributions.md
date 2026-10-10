# Joint and Marginal Distributions

> Course part: Stats 1

## Overview

Often two quantities are observed together: claim frequency and claim size, region and product, height and weight. The **joint distribution** describes how they behave *together*; the **marginal distributions** describe each one alone (ignoring the other). Marginals are just the row and column totals of a cross-table.

## Concept

### Discrete case

The joint probability mass function is
$$p(x_j,y_k)=P(X=x_j,\,Y=y_k)=P(\{X=x_j\}\cap\{Y=y_k\}).$$
The [marginal distributions](https://en.wikipedia.org/wiki/Marginal_distribution) are obtained by summing over the other variable:
$$P(X=x_j)=\sum_{k}p(x_j,y_k),\qquad P(Y=y_k)=\sum_{j}p(x_j,y_k).$$

### Continuous case

$X,Y$ are *jointly continuous* with joint density $f(x,y)\ge0$ if
$$P(a<X\le b,\ c<Y\le d)=\int_a^b\!\!\int_c^d f(x,y)\,dy\,dx,\qquad \iint f=1 .$$
The marginal densities are obtained by integrating out the other variable:
$$f_X(x)=\int_{-\infty}^{\infty}f(x,y)\,dy,\qquad f_Y(y)=\int_{-\infty}^{\infty}f(x,y)\,dx.$$

**Key point:** the marginals do *not* determine the joint distribution. Many different joint distributions share the same marginals; the joint carries the information about the dependence.

## Worked Example

**Discrete.** Customers by region and plan:

| | Basic | Premium | Row total |
|---|---|---|---|
| North | 0.3 | 0.2 | **0.5** |
| South | 0.1 | 0.4 | **0.5** |
| Column total | **0.4** | **0.6** | 1 |

The marginals are $P(\text{Basic})=0.4$, $P(\text{Premium})=0.6$. The conditional probability $P(\text{Premium}\mid\text{South})=0.4/0.5=0.8$ is much larger than the marginal 0.6, so region and plan are dependent.

**Continuous.** $f(x,y)=x+y$ on $[0,1]^2$. Check $\int_0^1\!\!\int_0^1(x+y)\,dy\,dx=\int_0^1(x+\tfrac12)\,dx=1$ ✓. Marginal: $f_X(x)=\int_0^1(x+y)\,dy=x+\tfrac12$. And $P(X\le0.5,\,Y\le0.5)=\int_0^{0.5}\!\!\int_0^{0.5}(x+y)\,dy\,dx=0.125$.

## Common Mistakes

- Treating the marginals as enough to describe the pair.
- Integrating over the wrong variable (to get $f_X$ integrate out $y$).
- Forgetting the integration limits when the joint density is positive only on part of the plane.

## When It's Used

Joint distributions describe two quantities together: claim frequency and claim size, product category and region, height and weight. Marginals recover each variable alone — exactly what row and column totals of a cross-table do in a sales report.

**Exam tip:** discrete marginals = row/column sums of the joint table; continuous marginals = integrate the joint density over the other variable. Marginals alone do **not** determine the joint distribution.

## R Code

```r
# Discrete joint pmf: X = number of claims, Y = policy type
joint <- matrix(c(0.30, 0.10, 0.05,
                  0.20, 0.20, 0.15),
                nrow = 2, byrow = TRUE,
                dimnames = list(Y = c("basic", "premium"), X = 0:2))
sum(joint)                          # = 1
rowSums(joint)                      # marginal of Y
colSums(joint)                      # marginal of X

# Continuous: f(x, y) = x + y on the unit square
f <- function(x, y) x + y
fX <- function(x) integrate(function(y) f(x, y), 0, 1)$value
c(fX(0.3), 0.3 + 0.5)               # marginal f_X(x) = x + 1/2

# P(X <= 0.5, Y <= 0.5) by double integration
integrate(function(x) sapply(x, function(u) integrate(function(y) f(u, y), 0, 0.5)$value), 0, 0.5)$value
```

## Python Code

```python
import numpy as np
from scipy import integrate

joint = np.array([[0.30, 0.10, 0.05],
                  [0.20, 0.20, 0.15]])        # rows: Y, columns: X = 0, 1, 2
print(joint.sum(), joint.sum(axis=1), joint.sum(axis=0))

f = lambda y, x: x + y                          # dblquad integrates f(y, x)
fX = lambda x: integrate.quad(lambda y: f(y, x), 0, 1)[0]
print(fX(0.3), 0.3 + 0.5)
print(integrate.dblquad(f, 0, 0.5, 0, 0.5)[0])  # P(X <= .5, Y <= .5)
```

## Practice Questions

*✎ new question added for this site (worked solution below)*

- ✎ From the region/plan table above, compute $P(\text{North}\mid\text{Basic})$.
- ✎ For $f(x,y)=x+y$ on $[0,1]^2$ compute $P(X>0.5)$.

## Solutions

*✎ solution written for this site*

- ✎ Q1: $P(\text{North}\mid\text{Basic})=\dfrac{0.3}{0.4}=0.75$.
- ✎ Q2: $P(X>0.5)=\int_{0.5}^{1}\big(x+\tfrac12\big)dx=\Big[\tfrac{x^2}{2}+\tfrac x2\Big]_{0.5}^{1}=1-0.375=0.625$.
