# Independence of Random Variables

> Course part: Stats 1

## Overview

Two random variables are independent if knowing the value of one tells you nothing about the other. This assumption underlies almost every standard method (random samples, portfolio variance formulas, reliability of systems), so it is important to know how to check it and what it does and does not imply.

## Concept

### Definition

Random variables $X$ and $Y$ are [independent](https://en.wikipedia.org/wiki/Independence_%28probability_theory%29) if their joint distribution factorises into the marginals.

- **Discrete**: for all values $x_j,y_k$
$$P(X=x_j,\,Y=y_k)=P(X=x_j)\,P(Y=y_k).$$
- **Continuous** (jointly continuous): the joint density is the product of the marginal densities,
$$f(x,y)=f_X(x)\,f_Y(y),$$
equivalently $P(a<X\le b,\,c<Y\le d)=P(a<X\le b)\,P(c<Y\le d)$ for all intervals.

### Facts

- **Every** cell must satisfy the product rule; one failing cell proves dependence.
- **Independence is passed on**: if $X_1,\dots,X_n$ are independent, then functions of disjoint groups of them, such as $g(X_1,\dots,X_k)$ and $h(X_{k+1},\dots,X_n)$, are independent.
- Random variables from independent random experiments that do not influence each other are independent.
- Independent $\Rightarrow$ uncorrelated ($Cov=0$), but **not** the other way round (exception: the bivariate normal distribution).

## Worked Example

| $P(X=x,Y=y)$ | $Y=0$ | $Y=1$ | $P(X=x)$ |
|---|---|---|---|
| $X=0$ | 0.12 | 0.28 | 0.4 |
| $X=1$ | 0.18 | 0.42 | 0.6 |
| $P(Y=y)$ | 0.3 | 0.7 | 1 |

Products of marginals: $0.4\cdot0.3=0.12$, $0.4\cdot0.7=0.28$, $0.6\cdot0.3=0.18$, $0.6\cdot0.7=0.42$. All four cells match, so $X$ and $Y$ are **independent**.

**Uncorrelated but dependent.** Let $X$ take $-1,0,1$ with probability $\frac13$ each and $Y=X^2$. Then $E(XY)=E(X^3)=0=E(X)E(Y)$, so $Cov(X,Y)=0$. But $P(X=0,Y=0)=\frac13\ne\frac13\cdot\frac13$: $Y$ is a function of $X$, hence completely dependent.

## Common Mistakes

- Concluding independence from zero correlation.
- Checking only some cells of the table.
- Assuming independence because variables "look unrelated", rather than testing it.

## When It's Used

Independence is the assumption behind almost every standard method: i.i.d. samples, portfolio variance formulas, reliability of systems with separate components. In practice you check it (e.g. by comparing the joint table with the product of marginals) rather than assume it.

**Exam tip:** $X, Y$ are independent iff *every* cell satisfies $p(x,y) = p_X(x)p_Y(y)$ — one failing cell is enough to reject independence. Independence implies zero correlation, not conversely.

## R Code

```r
joint <- matrix(c(0.12, 0.28,
                  0.18, 0.42), nrow = 2, byrow = TRUE)
product <- outer(rowSums(joint), colSums(joint))
all.equal(joint, product, check.attributes = FALSE)      # TRUE -> independent

joint2 <- matrix(c(0.30, 0.10,
                   0.20, 0.40), nrow = 2, byrow = TRUE)
joint2 - outer(rowSums(joint2), colSums(joint2))         # non-zero -> dependent

# Uncorrelated but dependent: X ~ U(-1, 1), Y = X^2
set.seed(10)
x <- runif(1e5, -1, 1)
cor(x, x^2)
```

## Python Code

```python
import numpy as np

joint = np.array([[0.12, 0.28], [0.18, 0.42]])
product = np.outer(joint.sum(axis=1), joint.sum(axis=0))
print(np.allclose(joint, product))                         # True -> independent

joint2 = np.array([[0.30, 0.10], [0.20, 0.40]])
print(joint2 - np.outer(joint2.sum(axis=1), joint2.sum(axis=0)))

rng = np.random.default_rng(10)
x = rng.uniform(-1, 1, 100_000)
print("corr(X, X^2) =", np.corrcoef(x, x**2)[0, 1])
```

## Practice Questions

*✎ new question added for this site (worked solution below)*

- ✎ A joint pmf is $p(0,0)=0.2$, $p(0,1)=0.2$, $p(1,0)=0.3$, $p(1,1)=0.3$. Are $X$ and $Y$ independent?
- ✎ Let $f(x,y)=x+y$ on $[0,1]^2$. Are $X$ and $Y$ independent? (Marginal: $f_X(x)=x+\tfrac12$.)
- ✎ Three components work independently with probability 0.9 each. What is the probability that a system of the three connected in series (all must work) functions?

## Solutions

*✎ solution written for this site*

- ✎ Q1: Marginals: $P(X=0)=0.4$, $P(X=1)=0.6$, $P(Y=0)=0.5$, $P(Y=1)=0.5$. Products: $0.4\cdot0.5=0.2$ ✓, $0.4\cdot0.5=0.2$ ✓, $0.6\cdot0.5=0.3$ ✓, $0.6\cdot0.5=0.3$ ✓. Independent.
- ✎ Q2: By symmetry $f_Y(y)=y+\frac12$. The product $(x+\frac12)(y+\frac12)=xy+\frac{x+y}{2}+\frac14\ne x+y$ (at $x=y=0$ it is $\frac14$, while $f=0$). Dependent.
- ✎ Q3: $0.9^3=0.729$.
