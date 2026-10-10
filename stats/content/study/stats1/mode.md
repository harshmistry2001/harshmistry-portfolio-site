# Mode

> Course part: Stats 1

## Overview

The **mode** is the simplest answer to "what is a typical value?": it is the value that occurs most often. It is the only measure of location that works for every scale, including purely nominal data such as colours or payment methods, where a mean or median cannot be computed.

## Concept

### Definition

The [mode](https://en.wikipedia.org/wiki/Mode_%28statistics%29) of a sample is the value with the largest absolute (equivalently, relative) frequency. In a bar chart it is the **longest bar**; in a Pareto chart it is the **first bar**.

- A sample can have **more than one mode** (bimodal or multimodal) if several values share the largest frequency.
- For continuous data, individual values rarely repeat, so one reports the **modal bin** of a histogram, the bin with the highest density. The result then depends on the chosen bin boundaries.
- The mode ignores everything except the counts, so it is insensitive to extreme values, but it can also be a poor description when the distribution is flat.

## Worked Example

A shoe shop records the sizes sold in one day: 38, 39, 40, 40, 41, 40, 42, 39, 40, 41.

| Size | 38 | 39 | 40 | 41 | 42 |
|---|---|---|---|---|---|
| Frequency | 1 | 2 | 4 | 2 | 1 |

The mode is **size 40** (sold 4 times). A mean size of 40.0 would be an unrealistic summary for ordering stock in a shop that sells whole sizes; the mode tells the buyer which size to stock most.

## Common Mistakes

- Reporting the highest *frequency* (4) instead of the *value* that has it (size 40).
- Assuming there is exactly one mode. Samples such as 2, 3, 3, 5, 5, 7 have two (3 and 5).
- Computing a "mean category" for nominal data. Only the mode is meaningful there.

## When It's Used

The mode is the only location measure for nominal data: the most popular product, the most common payment method, the most frequent error code. Retail and inventory planning use it constantly ("which shoe size do we stock most?").

**Exam tip:** a distribution can have several modes; for grouped data (histograms) report the *modal bin*.

## R Code

```r
payment <- c("card", "cash", "card", "paypal", "card", "cash", "invoice", "card")

freq <- table(payment)
names(freq)[freq == max(freq)]            # handles ties (several modes)

# Modal bin of a histogram
set.seed(3)
x <- rnorm(200, 50, 10)
h <- hist(x, breaks = seq(10, 90, by = 10), plot = FALSE)
paste0("[", h$breaks[which.max(h$counts)], ", ", h$breaks[which.max(h$counts) + 1], ")")
```

## Python Code

```python
import numpy as np
import pandas as pd
from statistics import multimode

payment = ["card", "cash", "card", "paypal", "card", "cash", "invoice", "card"]
print(pd.Series(payment).mode().tolist())   # all modes, ties included
print(multimode(payment))

# Modal bin of a histogram
rng = np.random.default_rng(3)
x = rng.normal(50, 10, 200)
counts, edges = np.histogram(x, bins=np.arange(10, 100, 10))
i = counts.argmax()
print(f"modal bin: [{edges[i]:.0f}, {edges[i + 1]:.0f})")
```

## Practice Questions

*✎ new question added for this site (worked solution below)*

- ✎ Payment methods of 100 customers: card 46, cash 30, bank transfer 24. State the mode. Can you compute a mean or median payment method?
- ✎ Find the mode(s) of the sample 2, 3, 3, 5, 5, 7.

## Solutions

*✎ solution written for this site*

- ✎ Q1: The mode is "card". A mean or median needs numbers or at least an ordering, so neither exists for a nominal variable.
- ✎ Q2: The values 3 and 5 each occur twice, more than any other value, so the sample is bimodal with modes 3 and 5.
