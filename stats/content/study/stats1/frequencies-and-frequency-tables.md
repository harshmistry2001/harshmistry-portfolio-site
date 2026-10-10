# Frequencies and Frequency Tables

> Course part: Stats 1

## Overview

The simplest way to summarise a categorical or discrete variable is to **count** how often each value occurs. The result is a frequency table. Everything else in descriptive statistics for such variables (bar charts, the mode, the empirical distribution) starts from these counts.

## Concept

### Absolute and relative frequencies

Suppose a sample of size $n$ contains $k$ distinct values $a_1,\dots,a_k$.

- The **absolute frequency** $n_i$ is the number of observations equal to $a_i$.
- The **relative frequency** $r_i = \dfrac{n_i}{n}$ is the proportion (multiply by 100 for a percentage). See [frequency distribution](https://en.wikipedia.org/wiki/Frequency_%28statistics%29).

Because every observation falls into exactly one category,
$$\sum_{i=1}^{k} n_i = n \qquad\text{and}\qquad \sum_{i=1}^{k} r_i = 1 .$$

Relative frequencies allow comparing samples of different sizes. To get the share of observations *between* two values, add the relative frequencies of all values in that range.

### Contingency tables

For two categorical variables with $r$ and $s$ categories, a [contingency table](https://en.wikipedia.org/wiki/Contingency_table) ($r \times s$) shows how many units fall into each *combination*. Row and column totals (the **marginal frequencies**) give the frequency table of each variable alone. Contingency tables are the starting point for measures of association and for the $\chi^2$ tests of Stats 2.

## Worked Example

Ten hotel guests report how many nights they stayed: 2, 3, 3, 1, 2, 3, 4, 2, 3, 5.

| Nights $a_i$ | 1 | 2 | 3 | 4 | 5 | Total |
|---|---|---|---|---|---|---|
| Absolute $n_i$ | 1 | 3 | 4 | 1 | 1 | 10 |
| Relative $r_i$ | 0.1 | 0.3 | 0.4 | 0.1 | 0.1 | 1.0 |

The share of guests staying *at least 3 nights* is $r_3 + r_4 + r_5 = 0.4 + 0.1 + 0.1 = 0.6$.

A contingency table for the same 10 guests by booking channel and reason:

| | Business | Leisure | Total |
|---|---|---|---|
| Online | 2 | 4 | 6 |
| Phone | 3 | 1 | 4 |
| Total | 5 | 5 | 10 |

The marginal totals show that 6 of 10 bookings were online and that business and leisure guests are equally frequent.

## Common Mistakes

- Using absolute frequencies to compare groups of different sizes; use relative frequencies.
- Forgetting that relative frequencies must add up to exactly 1 (rounding aside), which is a handy check on your table.
- Reading "between 3 and 6" as exclusive of the end points when the question includes them.

## When It's Used

Frequency tables are the first summary of any categorical or discrete variable: how many customers chose each plan, how many nights guests stayed, how many defects per batch. Contingency tables do the same for two variables at once and are the input to association measures and later to the $\chi^2$ tests of Stats 2.

**Exam tip:** relative frequencies must sum to 1; "relative frequency between 3 and 6" means adding $r_3 + \dots + r_6$.

## R Code

```r
# Hotel length-of-stay data (frequencies from the practice sheet)
stay <- rep(1:10, times = c(5, 4, 4, 6, 8, 2, 7, 6, 5, 3))

abs_freq <- table(stay)                 # n_i
rel_freq <- prop.table(abs_freq)        # r_i = n_i / n
cbind(n_i = abs_freq, r_i = round(rel_freq, 2), cum = cumsum(rel_freq))
sum(rel_freq)                           # always 1

# Relative frequency of stays between 3 and 6 days
mean(stay >= 3 & stay <= 6)

# Contingency table (r x s) for two categorical variables
major <- c("Econ", "Econ", "SocSci", "Math", "SocSci", "Econ", "Math", "SocSci")
level <- c("basic", "advanced", "basic", "advanced", "intermediate", "basic", "basic", "intermediate")
addmargins(table(major, level))
```

## Python Code

```python
import pandas as pd
import numpy as np

# Hotel length-of-stay data (frequencies from the practice sheet)
stay = pd.Series(np.repeat(np.arange(1, 11), [5, 4, 4, 6, 8, 2, 7, 6, 5, 3]))

tab = pd.DataFrame({
    "n_i": stay.value_counts().sort_index(),
    "r_i": stay.value_counts(normalize=True).sort_index(),
})
tab["cum"] = tab["r_i"].cumsum()
print(tab.round(2))
print("sum r_i =", tab["r_i"].sum())

# Relative frequency of stays between 3 and 6 days
print(stay.between(3, 6).mean())

# Contingency table with margins
major = ["Econ", "Econ", "SocSci", "Math", "SocSci", "Econ", "Math", "SocSci"]
level = ["basic", "advanced", "basic", "advanced", "intermediate", "basic", "basic", "intermediate"]
print(pd.crosstab(pd.Series(major, name="major"), pd.Series(level, name="level"), margins=True))
```

## Practice Questions

*✎ new question added for this site (worked solution below)*

- ✎ Twelve households report the number of cars they own: 0, 1, 1, 2, 0, 1, 3, 1, 2, 0, 1, 2. Build the table of absolute and relative frequencies and find the share of households with at least 2 cars.
- ✎ In a frequency table with four categories the absolute frequencies of three categories are 9, 12 and 15, and the fourth category has relative frequency 0.1. Find the sample size $n$ and the missing absolute frequency.

## Solutions

*✎ solution written for this site*

- ✎ Q1: Counts: 0 cars: 3, 1 car: 5, 2 cars: 3, 3 cars: 1 (total 12). Relative frequencies: 0.25, 0.417, 0.25, 0.083. At least 2 cars: $(3+1)/12 = 1/3 \approx 0.333$.
- ✎ Q2: The three known categories make up $1 - 0.1 = 0.9$ of the sample and total $9+12+15 = 36$ observations, so $n = 36/0.9 = 40$. The missing absolute frequency is $0.1 \cdot 40 = 4$.
