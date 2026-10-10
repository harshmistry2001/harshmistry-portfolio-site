# Linear Regression and Least Squares

> Course part: Stats 1

## Overview

Correlation says *how strongly* two variables move together; regression says *how* $y$ changes with $x$ and lets you **predict**. Linear regression draws the straight line that best fits a scatter plot, where "best" means that the squared vertical distances to the points are as small as possible.

## Concept

### Model and terminology

We observe pairs $(x_j, y_j)$ and describe $y$ (the **response** or dependent variable) as a function of $x$ (the **regressor** or explanatory variable) by a line
$$y = a + b\,x .$$

### Method of least squares

The [least squares](https://en.wikipedia.org/wiki/Least_squares) line minimises the sum of squared deviations $\sum_j (y_j - a - b x_j)^2$. The solution is

$$b^* = \frac{s_{xy}}{s_x^2}, \qquad a^* = \overline{y}_n - b^*\,\overline{x}_n,$$

where $s_{xy} = \frac1{n-1}\sum_j (x_j-\overline{x}_n)(y_j-\overline{y}_n)$ is the sample covariance.

### Interpretation

- The **slope** $b^*$ is the change in the *predicted* $y$ when $x$ increases by one unit.
- The **intercept** $a^*$ is the predicted $y$ at $x=0$ (only meaningful if $x=0$ is a sensible value).
- The line always passes through the point of means $(\overline{x}_n, \overline{y}_n)$.
- The **residuals** $y_j - (a^* + b^* x_j)$ sum to zero.
- Predictions are only reliable inside the range of the observed $x$ values; outside, they are [extrapolation](https://en.wikipedia.org/wiki/Extrapolation).
- The slope has the same sign as the correlation, since $b^* = r_{xy}\,s_y/s_x$.

See also [linear regression](https://en.wikipedia.org/wiki/Linear_regression).

## Worked Example

Advertising budget $x$ (thousand EUR) and sales $y$ (hundreds of units): $x = 1,2,3,4,5$ and $y = 2,4,5,4,5$.

From the Pearson example: $\overline{x}=3$, $\overline{y}=4$, $s_{xy}=1.5$, $s_x^2=2.5$.

$$b^* = \frac{1.5}{2.5} = 0.6, \qquad a^* = 4 - 0.6\cdot3 = 2.2 .$$

The fitted line is $\hat y = 2.2 + 0.6\,x$: every additional thousand EUR of advertising is associated with 60 more units sold. Prediction for $x=6$: $\hat y = 2.2 + 3.6 = 5.8$. Fitted values 2.8, 3.4, 4.0, 4.6, 5.2 give residuals $-0.8, 0.6, 1.0, -0.6, -0.2$, which sum to 0.

## Common Mistakes

- Swapping $x$ and $y$: regression is **not symmetric** (the line of $y$ on $x$ differs from that of $x$ on $y$).
- Predicting far outside the data range.
- Interpreting the slope causally; it only describes an association unless the study design supports causality.

## When It's Used

Least squares turns a scatter plot into a prediction rule: expected sales for a given ad budget, energy use for a given outdoor temperature, price of a flat for a given size. The slope is the headline number: the change in $y$ per one-unit increase in $x$.

**Exam tip:** you only need five numbers: $\bar x, \bar y, s_x^2, s_{xy}$, then $b^* = s_{xy}/s_x^2$ and $a^* = \bar y - b^*\bar x$. The line always passes through $(\bar x, \bar y)$.

## R Code

```r
wind <- c(7.4, 8.0, 12.6, 11.5, 14.3, 14.9, 8.6, 13.8, 20.1, 8.6)
temp <- c(67, 72, 74, 62, 56, 66, 65, 59, 61, 69)

b <- cov(wind, temp) / var(wind)
a <- mean(temp) - b * mean(wind)
c(intercept = a, slope = b)

fit <- lm(temp ~ wind)          # same estimates
coef(fit)

predict(fit, newdata = data.frame(wind = 10))

plot(wind, temp, pch = 19)
abline(fit, lwd = 2)
points(mean(wind), mean(temp), pch = 4, cex = 2)   # (x-bar, y-bar) lies on the line
```

## Python Code

```python
import numpy as np
import matplotlib.pyplot as plt

wind = np.array([7.4, 8.0, 12.6, 11.5, 14.3, 14.9, 8.6, 13.8, 20.1, 8.6])
temp = np.array([67, 72, 74, 62, 56, 66, 65, 59, 61, 69])

b = np.cov(wind, temp)[0, 1] / wind.var(ddof=1)
a = temp.mean() - b * wind.mean()
print("intercept:", a, " slope:", b)

slope, intercept = np.polyfit(wind, temp, deg=1)    # same estimates
print(intercept, slope)
print("prediction at wind = 10:", a + b * 10)

xs = np.linspace(wind.min(), wind.max(), 50)
plt.scatter(wind, temp)
plt.plot(xs, a + b * xs)
plt.scatter([wind.mean()], [temp.mean()], marker="x", s=100)
plt.show()
```

## Practice Questions

*✎ new question added for this site (worked solution below)*

- ✎ A sample has $\overline{x}=10$, $\overline{y}=50$, $s_x^2=4$ and $s_{xy}=6$. Find the regression line and the prediction at $x=12$.
- ✎ Interpret the slope in the model "price in EUR $= 35 + 1.5\cdot$ size in m²".
- ✎ A line was fitted using flats of 40 to 120 m². Why is a prediction for a 400 m² villa unreliable?

## Solutions

*✎ solution written for this site*

- ✎ Q1: $b^* = 6/4 = 1.5$, $a^* = 50 - 1.5\cdot10 = 35$. So $\hat y = 35 + 1.5x$ and $\hat y(12) = 35 + 18 = 53$.
- ✎ Q2: Each additional square metre is associated with a price that is 1.5 EUR higher on average. (The intercept 35 EUR is the predicted price of a flat of size 0 and is not meaningful.)
- ✎ Q3: The villa lies far outside the observed range of sizes (extrapolation); the linear pattern may not continue and the model has no information there.
