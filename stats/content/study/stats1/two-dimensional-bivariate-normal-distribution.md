# Two-Dimensional (Bivariate) Normal Distribution

> Course part: Stats 1

## Overview

When two measurements are each approximately normal *and* related (height and weight, returns of two stocks), the standard joint model is the bivariate normal distribution. It is described by the two means, the two variances and a single number $\rho$ for the strength of their linear relationship.

## Concept

### Parameters and density

$(X,Y)$ is [bivariate normal](https://en.wikipedia.org/wiki/Multivariate_normal_distribution) with parameters $\mu=E(X)$, $\nu=E(Y)$, $\sigma^2=Var(X)$, $\tau^2=Var(Y)$ and correlation $\rho\in(-1,1)$. With $\tilde x=\frac{x-\mu}{\sigma}$ and $\tilde y=\frac{y-\nu}{\tau}$ the joint density is

$$f(x,y)=\frac{1}{2\pi\sigma\tau\sqrt{1-\rho^2}}\exp\!\Big(-\frac{1}{2(1-\rho^2)}\big(\tilde x^2-2\rho\,\tilde x\,\tilde y+\tilde y^2\big)\Big).$$

### Properties

- The **marginals** are normal: $X\sim N(\mu,\sigma^2)$ and $Y\sim N(\nu,\tau^2)$.
- The **contour lines** $\{(x,y):f(x,y)=c\}$ are ellipses centred at $(\mu,\nu)$. For $\rho=0$ they are axis-parallel ellipses (circles if $\sigma=\tau$); for $\rho>0$ they tilt upwards, for $\rho<0$ downwards, and the larger $|\rho|$ the narrower they are.
- **$\rho=0$ implies independence.** This is special to the bivariate normal; for general distributions uncorrelated variables can still be dependent.
- **Conditional distribution:** given $X=x$,
$$Y\mid X=x\ \sim\ N\!\Big(\nu+\rho\,\frac{\tau}{\sigma}(x-\mu),\ \ \tau^2(1-\rho^2)\Big).$$
Knowing $x$ shifts the expected $y$ along a straight line (this is the link to linear regression) and reduces the uncertainty by the factor $1-\rho^2$.

## Worked Example

Height $X\sim N(170,10^2)$ cm and weight $Y\sim N(70,12^2)$ kg with $\rho=0.6$. For a person who is 180 cm tall:

- Expected weight: $70+0.6\cdot\frac{12}{10}\cdot(180-170)=70+7.2=77.2$ kg.
- Conditional variance: $144\cdot(1-0.36)=92.16$, so the standard deviation is $9.6$ kg (smaller than the unconditional 12 kg).

## Common Mistakes

- Using "uncorrelated implies independent" for distributions that are not jointly normal. Two normal marginals do not guarantee a bivariate normal joint distribution.
- Reading the covariance off the density without standardising ($Cov=\rho\sigma\tau$).
- Forgetting that $\rho$ only measures *linear* dependence.

## When It's Used

The bivariate normal is the standard model for two correlated measurements: returns of two assets, height and weight, test scores in two subjects. Its elliptical contours and the correlation $\rho$ are the basis of portfolio risk and of the correlation test in Stats 2.

**Exam tip:** for the bivariate normal (and only in this special case) $\rho = 0$ implies independence.

## R Code

```r
library(MASS)   # for mvrnorm (ships with R)

mu <- c(0, 0); sigma <- 1; tau <- 2; rho <- 0.7
Sigma <- matrix(c(sigma^2, rho * sigma * tau, rho * sigma * tau, tau^2), 2)

set.seed(14)
xy <- mvrnorm(5000, mu, Sigma)
cor(xy)[1, 2]                                  # about rho

# Density from the course formula
f <- function(x, y) {
  xt <- (x - mu[1]) / sigma; yt <- (y - mu[2]) / tau
  1 / (2 * pi * sigma * tau * sqrt(1 - rho^2)) *
    exp(-(xt^2 - 2 * rho * xt * yt + yt^2) / (2 * (1 - rho^2)))
}
gx <- seq(-3, 3, length.out = 60); gy <- seq(-6, 6, length.out = 60)
contour(gx, gy, outer(gx, gy, f), main = "Elliptical contours")
points(xy[1:300, ], pch = ".", col = "grey40")
```

## Python Code

```python
import numpy as np
import matplotlib.pyplot as plt
from scipy import stats

sigma, tau, rho = 1, 2, 0.7
cov = [[sigma**2, rho * sigma * tau], [rho * sigma * tau, tau**2]]
rng = np.random.default_rng(14)
xy = rng.multivariate_normal([0, 0], cov, size=5000)
print("sample rho:", np.corrcoef(xy.T)[0, 1])

def f(x, y):
    xt, yt = x / sigma, y / tau
    return np.exp(-(xt**2 - 2 * rho * xt * yt + yt**2) / (2 * (1 - rho**2))) / (
        2 * np.pi * sigma * tau * np.sqrt(1 - rho**2))

print(f(0.5, 1.0), stats.multivariate_normal([0, 0], cov).pdf([0.5, 1.0]))   # formula check

gx, gy = np.meshgrid(np.linspace(-3, 3, 60), np.linspace(-6, 6, 60))
plt.contour(gx, gy, f(gx, gy))
plt.scatter(*xy[:300].T, s=2, color="grey")
plt.title("Elliptical contours")
plt.show()
```

## Practice Questions

*✎ new question added for this site (worked solution below)*

- ✎ In the height/weight example, what is the expected weight of a person who is 160 cm tall?
- ✎ $(X,Y)$ is bivariate normal with $\rho=0$. Are $X$ and $Y$ independent? What if $X\sim N(0,1)$ and $Y=X^2$ (which is not bivariate normal with $X$)?
- ✎ What happens to the conditional variance when $|\rho|$ approaches 1?

## Solutions

*✎ solution written for this site*

- ✎ Q1: $70+0.6\cdot\frac{12}{10}(160-170)=70-7.2=62.8$ kg.
- ✎ Q2: For the bivariate normal, yes: $\rho=0$ implies independence. For $Y=X^2$ we get $Cov(X,Y)=E(X^3)=0$, so they are uncorrelated, but $Y$ is a function of $X$, hence clearly dependent.
- ✎ Q3: $\tau^2(1-\rho^2)\to0$: knowing $x$ almost determines $y$ (the points lie nearly on a line).
