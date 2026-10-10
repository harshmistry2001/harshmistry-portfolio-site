# Grouping and Histograms

> Course part: Stats 1

## Overview

For a continuous measurement almost every value is different, so a frequency table of individual values is useless. The solution is to **group** the data into intervals (bins) and count how many observations fall into each. Drawing these counts as adjacent rectangles gives the [histogram](https://en.wikipedia.org/wiki/Histogram), the standard first picture of a continuous variable.

## Concept

### Grouping

Choose boundaries $t_1 < t_2 < \dots < t_{k+1}$ and define the $j$-th bin as $[t_j, t_{j+1})$. Let $r_j$ be the relative frequency of the observations in bin $j$.

### The histogram

Rectangles are drawn over the bins **without gaps** (the variable is continuous). The key rule is that the **area** of each rectangle equals the relative frequency of its bin, so the height is a *density*:

$$d_j = \frac{r_j}{t_{j+1} - t_j}.$$

With this convention the total area is 1, and histograms with unequal bin widths remain honest: a wide bin does not look more important just because it contains more observations.

### Choosing the number of bins

The choice of bins strongly changes the picture. Too few bins hide structure (such as two peaks); too many show only noise. A common rule of thumb for the number of bins is
$$k \approx \sqrt{n}.$$
Other rules exist (Sturges, Freedman–Diaconis), but $\sqrt n$ is a good first guess; always try a few values.

## Worked Example

Delivery times (in minutes) of $n = 50$ orders are grouped as follows:

| Bin | Count | $r_j$ | Width | Height $d_j$ |
|---|---|---|---|---|
| [0, 10) | 10 | 0.20 | 10 | 0.020 |
| [10, 20) | 20 | 0.40 | 10 | 0.040 |
| [20, 40) | 15 | 0.30 | 20 | 0.015 |
| [40, 80) | 5 | 0.10 | 40 | 0.0025 |

Check: the area of the last bar is $0.0025 \cdot 40 = 0.10 = r_4$. The histogram shows a right-skewed distribution: most orders arrive within 20 minutes, but a long tail reaches 80 minutes.

## Common Mistakes

- Drawing bar **heights** equal to relative frequencies when bin widths differ; this exaggerates wide bins. Use densities.
- Leaving gaps between the rectangles, which makes a histogram look like a bar chart.
- Drawing conclusions from a single bin choice. Re-draw with different bin widths before trusting a feature of the picture.

## When It's Used

Histograms are the default first look at any continuous measurement: delivery times, sensor readings, exam scores, transaction amounts. They reveal skewness, multiple peaks and outliers before any model is fitted. Bin choice matters: too few bins hide structure, too many show noise.

**Exam tip:** the *area* (not the height) of each bar equals the relative frequency, so with unequal bin widths the height is $d_j = r_j / (t_{j+1} - t_j)$. Use $k \approx \sqrt{n}$ bins as a first guess.

## R Code

```r
set.seed(1)
temps <- round(rnorm(30, mean = 14, sd = 5), 1)   # e.g. April temperatures in C

k <- round(sqrt(length(temps)))                   # rule of thumb for number of bins
k

# Bins of width 4 on the grid ..., -2, 2, 6, 10, ... (practice sheet: width 4, starting at 2)
breaks <- seq(floor((min(temps) - 2) / 4) * 4 + 2, max(temps) + 4, by = 4)
h <- hist(temps, breaks = breaks, freq = FALSE,
          main = "Histogram (density scale)", xlab = "temperature")

# Heights d_j = r_j / bin width; area of each bar = relative frequency
r_j <- h$counts / sum(h$counts)
d_j <- r_j / diff(h$breaks)
all.equal(d_j, h$density)
sum(d_j * diff(h$breaks))                          # total area = 1
```

## Python Code

```python
import numpy as np
import matplotlib.pyplot as plt

rng = np.random.default_rng(1)
temps = np.round(rng.normal(14, 5, size=30), 1)   # e.g. April temperatures in C

k = round(np.sqrt(len(temps)))                    # rule of thumb for number of bins
print("k =", k)

edges = np.arange(np.floor(temps.min() / 4) * 4 - 2, temps.max() + 4, 4)
counts, edges = np.histogram(temps, bins=edges)
r_j = counts / counts.sum()
d_j = r_j / np.diff(edges)                        # heights so that area = r_j
print("total area:", np.sum(d_j * np.diff(edges)))

plt.hist(temps, bins=edges, density=True, edgecolor="black")
plt.xlabel("temperature")
plt.title("Histogram (density scale)")
plt.show()
```

## Practice Questions

*✎ new question added for this site (worked solution below)*

- ✎ A sample has $n = 100$ observations. How many bins does the rule of thumb suggest?
- ✎ Forty exam scores are grouped: [0, 5): 6, [5, 10): 14, [10, 20): 20. Compute the relative frequencies and the histogram heights, and state the proportion of scores in [5, 20).

## Solutions

*✎ solution written for this site*

- ✎ Q1: $k \approx \sqrt{100} = 10$ bins.
- ✎ Q2: Relative frequencies: $6/40 = 0.15$, $14/40 = 0.35$, $20/40 = 0.50$. Widths 5, 5, 10 give heights $0.15/5 = 0.03$, $0.35/5 = 0.07$, $0.50/10 = 0.05$. The proportion in [5, 20) is $0.35 + 0.50 = 0.85$.
