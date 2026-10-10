# Empirical Distribution Function (EDF)

> Course part: Stats 1

## Overview

The **empirical distribution function** answers a very natural question: "what fraction of my observations is at most $t$?" Plotted against $t$, it gives a staircase that rises from 0 to 1 and describes the entire sample without any binning.

## Concept

### Definition

For a sample $x_1,\dots,x_n$ the [empirical distribution function](https://en.wikipedia.org/wiki/Empirical_distribution_function) is

$$F_n(t) = \frac{\#\{j : x_j \le t\}}{n}.$$

Properties:

- It is a **step function**, constant between observed values.
- At every observed value it **jumps** upward; the jump height equals the relative frequency of that value (so a value observed $m$ times causes a jump of $m/n$).
- It is non-decreasing, equals 0 left of the smallest observation and 1 from the largest observation onwards.
- Differences give proportions: $F_n(b) - F_n(a)$ is the share of observations in $(a, b]$.

## Worked Example

Sample: 1, 2, 2, 3, 5 ($n = 5$).

| $t$ | $<1$ | $[1,2)$ | $[2,3)$ | $[3,5)$ | $\ge 5$ |
|---|---|---|---|---|---|
| $F_5(t)$ | 0 | 0.2 | 0.6 | 0.8 | 1 |

The jump at $t = 2$ is $0.6 - 0.2 = 0.4 = 2/5$, because the value 2 occurs twice. The share of observations in $(1, 3]$ is $F_5(3) - F_5(1) = 0.8 - 0.2 = 0.6$.

## Common Mistakes

- Writing $<$ instead of $\le$ in the definition: at an observed value the EDF has *already* jumped.
- Reading the step *height* as the total share rather than the *increase* in share.
- Assuming the EDF is smooth; for a finite sample it is always a staircase.

## When It's Used

The EDF answers "what share of observations is at most $t$?" directly: the share of customers who waited at most 5 minutes, the share of loans below a given amount. It is also the basis of the Kolmogorov-Smirnov goodness-of-fit test in Stats 2 and of comparing two distributions without binning.

**Exam tip:** the jump height at a value equals its relative frequency, so from an EDF plot you can read off how many observations equal a given value: jump $\times\, n$.

## R Code

```r
prices <- c(55.9, 57.1, 48.9, 45.5, 56.1, 31.8, 56.3, 47.2, 47.2, 40.8)

F_n <- ecdf(prices)
F_n(c(30, 47.2, 56, 58))          # share of observations <= t

# Jump at 47.2 = relative frequency of that value (two observations -> 0.2)
F_n(47.2) - F_n(47.2 - 1e-9)

plot(F_n, main = "Empirical distribution function", xlab = "price", ylab = "F_n(t)")
```

## Python Code

```python
import numpy as np
import matplotlib.pyplot as plt

prices = np.array([55.9, 57.1, 48.9, 45.5, 56.1, 31.8, 56.3, 47.2, 47.2, 40.8])

def edf(data, t):
    data = np.sort(data)
    return np.searchsorted(data, t, side="right") / len(data)

print(edf(prices, [30, 47.2, 56, 58]))

# Jump at 47.2 = relative frequency of that value
print(edf(prices, 47.2) - edf(prices, 47.2 - 1e-9))

x = np.sort(prices)
plt.step(x, np.arange(1, len(x) + 1) / len(x), where="post")
plt.xlabel("price"); plt.ylabel("F_n(t)"); plt.title("Empirical distribution function")
plt.show()
```

## Practice Questions

*✎ new question added for this site (worked solution below)*

- ✎ For the sample 2, 4, 4, 4, 7, 9 compute $F_6(4)$, $F_6(6)$, $F_6(10)$ and the jump height of the EDF at $t = 4$.
- ✎ An EDF based on $n = 40$ observations jumps by 0.15 at $t = 3$. How many observations equal 3?

## Solutions

*✎ solution written for this site*

- ✎ Q1: $F_6(4) = 4/6 \approx 0.667$ (the values 2, 4, 4, 4); $F_6(6) = 4/6 \approx 0.667$; $F_6(10) = 1$. The jump at $t = 4$ is $3/6 = 0.5$.
- ✎ Q2: Jump $\times\, n = 0.15 \cdot 40 = 6$ observations.
