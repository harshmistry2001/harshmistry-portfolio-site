# Measures of Dispersion

> Course part: Stats 1

## Overview

A measure of location tells you where the data are centred; a measure of **dispersion** tells you how much they scatter around that centre. Two suppliers can have the same average delivery time, yet one is predictable and the other is not. Dispersion is the statistical word for risk, variability and uncertainty.

## Concept

All the measures below are **shift invariant**: adding a constant to every observation does not change them.

| Measure | Formula | Remarks |
|---|---|---|
| [Sample variance](https://en.wikipedia.org/wiki/Variance) | $s_x^2 = \dfrac{1}{n-1}\sum_{j=1}^n (x_j - \overline{x}_n)^2$ | average squared deviation; divides by $n-1$ |
| [Standard deviation](https://en.wikipedia.org/wiki/Standard_deviation) | $s_x = \sqrt{s_x^2}$ | same unit as the data |
| [Interquartile range](https://en.wikipedia.org/wiki/Interquartile_range) | $IQR = x_{3/4} - x_{1/4}$ | spread of the middle 50%; robust |
| [Range](https://en.wikipedia.org/wiki/Range_%28statistics%29) | $x_{(n)} - x_{(1)}$ | very sensitive to outliers |
| Mean absolute deviation | $\frac1n\sum_j \lvert x_j - \overline{x}_n\rvert$ (or around the median $x_{med}$) | average distance from the centre |

**Why $n-1$?** The deviations from the sample mean always sum to zero, so only $n-1$ of them are free to vary. Dividing by $n-1$ instead of $n$ makes $s_x^2$ an unbiased estimator of the population variance (see Stats 2).

**Linear transformations.** If $y_i = a + b\,x_i$ then
$$s_y^2 = b^2 s_x^2,\qquad s_y = |b|\,s_x,\qquad IQR_y = |b|\,IQR_x .$$
The shift $a$ has no effect; the scale factor $b$ multiplies the standard deviation.

## Worked Example

Data: 4, 8, 6, 10, 12 (mean 8).

- Squared deviations: $16, 0, 4, 4, 16$, total 40, so $s^2 = 40/4 = 10$ and $s = \sqrt{10} \approx 3.16$.
- Range: $12 - 4 = 8$.
- Sorted: 4, 6, 8, 10, 12; $x_{1/4} = x_{(2)} = 6$, $x_{3/4} = x_{(4)} = 10$, so $IQR = 4$.
- Mean absolute deviation: $(4+0+2+2+4)/5 = 2.4$.
- Transformation $y = 2x + 3$: $s_y^2 = 4\cdot10 = 40$ and $s_y = 2\cdot3.16 \approx 6.32$.

## Common Mistakes

- Dividing by $n$ instead of $n-1$ for the sample variance (they coincide only for large $n$).
- Quoting the variance in squared units as if it were comparable to the data; use the standard deviation.
- Using the range for data with outliers, or forgetting that the IQR ignores the tails completely.
- Believing that shifting data changes the standard deviation. It does not.

## When It's Used

Dispersion is risk: the standard deviation of returns measures volatility, the spread of fill weights measures process quality, the IQR of delivery times measures reliability. Two suppliers with the same average delivery time can differ completely in how predictable they are.

**Exam tip:** $s^2$ divides by $n-1$. Under $y = a + bx$: $s_y^2 = b^2 s_x^2$ and $s_y = |b|\, s_x$; shifts ($a$) do not change dispersion. The IQR is robust, the range is not.

## R Code

```r
prices <- c(55.9, 57.1, 48.9, 45.5, 56.1, 31.8, 56.3, 47.2, 47.2, 40.8)

c(variance = var(prices),                                   # divides by n - 1
  sd       = sd(prices),
  range    = diff(range(prices)),
  IQR      = IQR(prices, type = 2),                         # course quantile definition
  MAD_mean = mean(abs(prices - mean(prices))),
  MAD_med  = mean(abs(prices - median(prices))))

# Remove the outlier 31.8 and compare
p2 <- prices[prices != 31.8]
c(variance = var(p2), range = diff(range(p2)), IQR = IQR(p2, type = 2))

# Linear transformation: revenue = 5 * cost + 1500 -> sd multiplies by 5
set.seed(2)
cost <- rnorm(24, 3400, 650)
c(sd(5 * cost + 1500), 5 * sd(cost))
```

## Python Code

```python
import numpy as np

prices = np.array([55.9, 57.1, 48.9, 45.5, 56.1, 31.8, 56.3, 47.2, 47.2, 40.8])

def iqr(x):
    q1, q3 = np.quantile(x, [0.25, 0.75], method="averaged_inverted_cdf")
    return q3 - q1

print({
    "variance": prices.var(ddof=1),                  # ddof=1 -> divide by n - 1
    "sd": prices.std(ddof=1),
    "range": np.ptp(prices),
    "IQR": iqr(prices),
    "MAD_mean": np.mean(np.abs(prices - prices.mean())),
    "MAD_med": np.mean(np.abs(prices - np.median(prices))),
})

p2 = prices[prices != 31.8]                           # remove the outlier
print("without outlier:", p2.var(ddof=1), np.ptp(p2), iqr(p2))

rng = np.random.default_rng(2)
cost = rng.normal(3400, 650, 24)
print((5 * cost + 1500).std(ddof=1), 5 * cost.std(ddof=1))
```

## Practice Questions

*✎ new question added for this site (worked solution below)*

- ✎ Compute the mean, variance and standard deviation of 2, 4, 4, 4, 5, 5, 7, 9, and also the range.
- ✎ Daily temperatures in °C have standard deviation 4. What are the standard deviation and the variance in °F, using $F = 32 + 1.8\,C$?

## Solutions

*✎ solution written for this site*

- ✎ Q1: Mean $= 40/8 = 5$. Squared deviations: $9,1,1,1,0,0,4,16$, total 32. $s^2 = 32/7 \approx 4.571$, $s \approx 2.138$. Range $= 9 - 2 = 7$.
- ✎ Q2: Only the scale factor matters: $s_F = 1.8 \cdot 4 = 7.2$ and the variance is $7.2^2 = 51.84$ (the shift of 32 has no effect).
