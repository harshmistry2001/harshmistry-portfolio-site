# Pearson Correlation Coefficient

> Course part: Stats 1

## Overview

Do two variables move together? If tall people tend to be heavier, if higher temperatures go with higher energy demand, there is a **relationship**. The Pearson correlation coefficient condenses the strength and direction of a *linear* relationship into a single number between $-1$ and $+1$.

## Concept

### Covariance and correlation

The sample [covariance](https://en.wikipedia.org/wiki/Covariance) of paired observations $(x_j, y_j)$, $j=1,\dots,n$, is

$$s_{xy} = \frac{1}{n-1}\sum_{j=1}^{n}(x_j-\overline{x}_n)(y_j-\overline{y}_n).$$

It is positive if large $x$ tends to go with large $y$ and negative if large $x$ goes with small $y$, but its size depends on the units. Dividing by the two standard deviations removes the units and gives the [Pearson correlation coefficient](https://en.wikipedia.org/wiki/Pearson_correlation_coefficient):

$$r_{xy} = \frac{s_{xy}}{s_x\,s_y}, \qquad -1 \le r_{xy} \le 1 .$$

### Interpretation and properties

- $r\approx +1$: clear increasing linear trend; $r\approx -1$: clear decreasing linear trend; $r\approx 0$: no *linear* trend.
- **Symmetric**: $r_{xy} = r_{yx}$.
- **Invariant** under shifts and under multiplication by *positive* constants (changing units); multiplying one variable by a negative number flips the sign.
- $r = 0$ does **not** rule out a non-linear relationship (for example $y = x^2$ on a symmetric range).
- **Not robust**: one outlier can change $r$ drastically.
- A high correlation can be a [spurious relationship](https://en.wikipedia.org/wiki/Spurious_relationship) caused by a hidden third variable; correlation alone never proves causation.

## Worked Example

Advertising budget $x$ (in thousand EUR) and sales $y$ (in units of 100) over five months:

| $x$ | 1 | 2 | 3 | 4 | 5 |
|---|---|---|---|---|---|
| $y$ | 2 | 4 | 5 | 4 | 5 |

Means: $\overline{x}=3$, $\overline{y}=4$. Products of deviations: $(-2)(-2)=4,\ (-1)(0)=0,\ 0,\ (1)(0)=0,\ (2)(1)=2$, total 6, so $s_{xy}=6/4=1.5$. Variances: $s_x^2 = 10/4 = 2.5$, $s_y^2 = 6/4 = 1.5$. Then

$$r_{xy} = \frac{1.5}{\sqrt{2.5}\sqrt{1.5}} \approx 0.775,$$

a fairly strong positive linear relationship.

Non-linear counter-example: for $x=-2,-1,0,1,2$ and $y = x^2$ one gets $s_{xy}=0$, so $r=0$ although $y$ is completely determined by $x$.

## Common Mistakes

- Reading correlation as causation.
- Interpreting $r=0$ as "independent". It only means that there is no linear association.
- Computing $r$ from data containing an outlier or from two clusters without looking at the scatter plot first.
- Expecting the covariance to be unit-free; only $r$ is.

## When It's Used

Pearson's $r$ measures linear co-movement: portfolio diversification (correlation between asset returns), marketing mix (ad spend vs. sales), engineering (temperature vs. energy demand). It is the first check before fitting a regression.

**Exam tip:** $r$ is unchanged if you add constants or multiply by *positive* constants (wind 10% faster, temperature +1 degree); the covariance scales with the multipliers. $r = 0$ does not mean "no relationship", only "no linear relationship".

## R Code

```r
wind <- c(7.4, 8.0, 12.6, 11.5, 14.3, 14.9, 8.6, 13.8, 20.1, 8.6)   # mph
temp <- c(67, 72, 74, 62, 56, 66, 65, 59, 61, 69)                   # F

s_xy <- sum((wind - mean(wind)) * (temp - mean(temp))) / (length(wind) - 1)
c(manual = s_xy, cov = cov(wind, temp))
c(manual = s_xy / (sd(wind) * sd(temp)), cor = cor(wind, temp))

# Transformations: temp + 1 and wind * 1.1
c(cov = cov(wind * 1.1, temp + 1), cor = cor(wind * 1.1, temp + 1))

# r = 0 does not mean "no relationship"
x <- -5:5
cor(x, x^2)

plot(wind, temp, pch = 19, main = "Wind vs. temperature")
```

## Python Code

```python
import numpy as np
import matplotlib.pyplot as plt
from scipy import stats

wind = np.array([7.4, 8.0, 12.6, 11.5, 14.3, 14.9, 8.6, 13.8, 20.1, 8.6])
temp = np.array([67, 72, 74, 62, 56, 66, 65, 59, 61, 69])

s_xy = np.sum((wind - wind.mean()) * (temp - temp.mean())) / (len(wind) - 1)
print("cov:", s_xy, np.cov(wind, temp)[0, 1])
print("r:  ", s_xy / (wind.std(ddof=1) * temp.std(ddof=1)), stats.pearsonr(wind, temp)[0])

print("transformed cov:", np.cov(wind * 1.1, temp + 1)[0, 1],
      " r:", np.corrcoef(wind * 1.1, temp + 1)[0, 1])

x = np.arange(-5, 6)
print("r(x, x^2) =", np.corrcoef(x, x**2)[0, 1])

plt.scatter(wind, temp)
plt.xlabel("wind (mph)"); plt.ylabel("temperature (F)")
plt.show()
```

## Practice Questions

*✎ new question added for this site (worked solution below)*

- ✎ For a sample, $s_x = 2$, $s_y = 5$ and $s_{xy} = -8$. Compute $r_{xy}$ and describe the relationship.
- ✎ The correlation between height in cm ($x$) and weight in kg ($y$) is $r=0.6$. What is the correlation between height in metres and weight in pounds? And between height in cm and the *negative* weight $-y$?
- ✎ Compute $r$ for $x = -1, 0, 1$ and $y = 1, 0, 1$. What does the result say about the relationship?

## Solutions

*✎ solution written for this site*

- ✎ Q1: $r = -8/(2\cdot5) = -0.8$: a strong decreasing linear relationship.
- ✎ Q2: Changing units multiplies by positive constants, so $r$ stays $0.6$. Using $-y$ flips the sign: $r=-0.6$.
- ✎ Q3: $\overline{x}=0$, $\overline{y}=2/3$, $s_{xy}=\frac12\big((-1)(1/3)+0+(1)(1/3)\big)=0$, so $r=0$. Yet $y=x^2$ exactly: there is a perfect non-linear relationship that $r$ cannot see.
