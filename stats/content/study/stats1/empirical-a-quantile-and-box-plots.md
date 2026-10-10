# Empirical a-Quantile and Box Plots

> Course part: Stats 1

## Overview

Quantiles generalise the median: instead of splitting the data into two halves they split it at any proportion you like (the lowest 10%, the lowest 25%, …). The **box plot** draws the three most important quantiles, the quartiles, together with a rule for flagging outliers, and is the best compact picture for comparing groups.

## Concept

### The empirical $\alpha$-quantile

For $0<\alpha<1$ the empirical [$\alpha$-quantile](https://en.wikipedia.org/wiki/Quantile) $x_\alpha$ is a value such that at least $\alpha\cdot100\%$ of the data are smaller or equal and at least $(1-\alpha)\cdot100\%$ are greater or equal. With the ordered sample $x_{(1)}\le\dots\le x_{(n)}$:

$$x_\alpha = \begin{cases} x_{(\lfloor n\alpha\rfloor + 1)} & \text{if } n\alpha \text{ is not an integer},\\[4pt] \tfrac12\big(x_{(n\alpha)} + x_{(n\alpha+1)}\big) & \text{if } n\alpha \text{ is an integer.}\end{cases}$$

Important special cases are the **lower quartile** $x_{1/4}$, the **median** $x_{1/2}$ and the **upper quartile** $x_{3/4}$. Their difference $IQR = x_{3/4} - x_{1/4}$ is the [interquartile range](https://en.wikipedia.org/wiki/Interquartile_range).

### Box plot

A [box plot](https://en.wikipedia.org/wiki/Box_plot) shows:

- a **box** from the lower to the upper quartile with a line at the median (it contains the middle 50% of the data),
- **whiskers** extending to the smallest and largest "normal" observations, that is the most extreme observations still within the fences
$$x_{1/4} - 1.5\cdot IQR \qquad\text{and}\qquad x_{3/4} + 1.5\cdot IQR ,$$
- observations beyond the fences drawn individually as points, the potential [outliers](https://en.wikipedia.org/wiki/Outlier).

## Worked Example

Squaretown storefront widths (m), sorted ($n=9$): 4.1, 5.4, 5.4, 6.3, 6.5, 6.7, 7.3, 7.5, 13.2.

- $\alpha = 1/4$: $n\alpha = 2.25$ is not an integer, so $x_{1/4} = x_{(3)} = 5.4$.
- $\alpha = 1/2$: $n\alpha = 4.5$, so $x_{1/2} = x_{(5)} = 6.5$.
- $\alpha = 3/4$: $n\alpha = 6.75$, so $x_{3/4} = x_{(7)} = 7.3$.
- $IQR = 7.3 - 5.4 = 1.9$. Fences: $5.4 - 2.85 = 2.55$ and $7.3 + 2.85 = 10.15$.
- The value 13.2 lies above 10.15, so it is drawn as an outlier; the upper whisker ends at the largest normal observation, 7.5. The lower whisker ends at 4.1.

## Common Mistakes

- Using a different quantile definition than the course. Software offers many (R has nine types); this course uses the one above, equal to R's `quantile(type = 2)`, so hand results can differ from default software output.
- Computing quartiles from the unsorted data.
- Calling every point beyond the whiskers an error: it is only a *potential* outlier that deserves a look.

## When It's Used

Quantiles describe the whole spread of a distribution: service-level targets ("95% of tickets answered within 4 hours"), growth charts for children, Value-at-Risk in finance. The box plot condenses median, quartiles and outliers into one picture and is ideal for comparing groups side by side.

**Exam tip:** the course definition of the quantile equals R's `quantile(type = 2)` and NumPy's `method="averaged_inverted_cdf"`. The defaults (`type = 7`, `"linear"`) give slightly different numbers, so set the type explicitly when you check hand calculations.

## R Code

```r
x <- c(-2, 8, 11, 21, 22, 24, 24, 25, 25, 26, 28, 29, 30, 32, 39, 42)   # n = 16

# Course definition (= type 2)
course_quantile <- function(x, a) {
  x <- sort(x); n <- length(x); na <- n * a
  if (abs(na - round(na)) < 1e-9) (x[na] + x[na + 1]) / 2 else x[floor(na) + 1]
}
sapply(c(0.25, 0.5, 0.75), course_quantile, x = x)
quantile(x, c(0.25, 0.5, 0.75), type = 2)

# Box plot fences: 1.5 * IQR beyond the quartiles
q <- quantile(x, c(0.25, 0.75), type = 2)
iqr <- unname(diff(q))
fences <- c(lower = unname(q[1]) - 1.5 * iqr, upper = unname(q[2]) + 1.5 * iqr)
fences
x[x < fences["lower"] | x > fences["upper"]]      # outliers

boxplot(x, horizontal = TRUE, main = "Box plot")
```

## Python Code

```python
import numpy as np
import matplotlib.pyplot as plt

x = np.array([-2, 8, 11, 21, 22, 24, 24, 25, 25, 26, 28, 29, 30, 32, 39, 42])

def course_quantile(x, a):
    x = np.sort(x); n = len(x); na = n * a
    if np.isclose(na, round(na)):
        k = int(round(na))
        return (x[k - 1] + x[k]) / 2
    return x[int(np.floor(na))]            # x_([n*a + 1]) with 0-based indexing

print([course_quantile(x, a) for a in (0.25, 0.5, 0.75)])
print(np.quantile(x, [0.25, 0.5, 0.75], method="averaged_inverted_cdf"))

q1, q3 = np.quantile(x, [0.25, 0.75], method="averaged_inverted_cdf")
iqr = q3 - q1
lower, upper = q1 - 1.5 * iqr, q3 + 1.5 * iqr
print("fences:", lower, upper, " outliers:", x[(x < lower) | (x > upper)])

plt.boxplot(x, vert=False)
plt.title("Box plot")
plt.show()
```

## Practice Questions

*✎ new question added for this site (worked solution below)*

- ✎ For the ordered sample 2, 4, 5, 7, 8, 10, 11, 15 find the three quartiles and the IQR, and decide whether there are outliers by the 1.5·IQR rule.
- ✎ For $n = 20$, which order statistics are used to compute $x_{0.9}$?

## Solutions

*✎ solution written for this site*

- ✎ Q1: $n=8$. $n\cdot\frac14 = 2$ is an integer, so $x_{1/4} = (x_{(2)}+x_{(3)})/2 = (4+5)/2 = 4.5$. $n\cdot\frac12 = 4$, so $x_{1/2} = (7+8)/2 = 7.5$. $n\cdot\frac34 = 6$, so $x_{3/4} = (10+11)/2 = 10.5$. $IQR = 6$. Fences: $4.5-9 = -4.5$ and $10.5+9 = 19.5$. All data lie between them, so there are no outliers.
- ✎ Q2: $n\alpha = 20\cdot0.9 = 18$ is an integer, so $x_{0.9} = \tfrac12(x_{(18)} + x_{(19)})$.
