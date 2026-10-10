# Association

> Course part: Stats 1

## Overview

Correlation needs numbers. For **categorical** variables (sex, product, region) we ask a different question: do certain categories occur together *more or less often than chance would suggest*? That is what association describes. It works from a contingency table.

## Concept

Take two categorical variables in an $r\times s$ contingency table with counts $n_{ij}$. Let $n_{i+}$ be the row totals, $n_{+j}$ the column totals and $n$ the grand total.

### No association

If the variables are unrelated, the relative frequency of a combination equals the product of the marginal relative frequencies:
$$\frac{n_{ij}}{n} = \frac{n_{i+}}{n}\cdot\frac{n_{+j}}{n}, \quad\text{equivalently the expected count is } \frac{n_{i+}\,n_{+j}}{n}.$$

### Positive and negative association

- **Positive association** of row $i$ and column $j$: the combination occurs *more* often than expected,
$$\frac{n_{ij}}{n_{i+}} > \frac{n_{+j}}{n} \iff \frac{n_{ij}}{n} > \frac{n_{i+}}{n}\cdot\frac{n_{+j}}{n}.$$
The left form says: within row $i$ the share of column $j$ is larger than in the whole sample.
- **Negative association**: the inequality is reversed.

A [mosaic plot](https://en.wikipedia.org/wiki/Mosaic_plot) visualises this: tile areas are proportional to the cell counts, and tiles that deviate from the pattern of independence show where the association lies. The $\chi^2$ test of independence (Stats 2) turns this descriptive idea into a formal test.

## Worked Example

300 people classified by smoking and disease:

| | Disease | No disease | Total |
|---|---|---|---|
| Smoker | 30 | 70 | 100 |
| Non-smoker | 20 | 180 | 200 |
| Total | 50 | 250 | 300 |

Overall disease share: $50/300 \approx 0.167$. Among smokers: $30/100 = 0.30$, which is larger, so smoking and disease are **positively associated**. Expected count for (smoker, disease) under no association: $100\cdot50/300 \approx 16.7 < 30$. For (non-smoker, disease): expected $200\cdot50/300 \approx 33.3 > 20$, so that combination is **negatively** associated.

## Common Mistakes

- Treating association as causation. The table does not say whether smoking causes disease.
- Comparing counts directly instead of counts relative to what the margins imply.
- Judging association from a single cell; the cells of a table are linked by the margins, so in a 2×2 table the pattern is mirrored in all four cells.

## When It's Used

Association analysis in contingency tables answers "do these categories go together?": product bought vs. customer segment, study major vs. skill level, vaccine status vs. infection. It is the descriptive precursor of the $\chi^2$ test of independence in Stats 2.

**Exam tip:** compare each observed cell with the expected count under no association $n_{i+}n_{+j}/n$ (or the conditional row share with the overall column share). Observed > expected means positive association.

## R Code

```r
tab <- matrix(c(30, 10, 15,
                10, 25, 10),
              nrow = 2, byrow = TRUE,
              dimnames = list(major = c("SocSci", "Econ"),
                              writing = c("basic", "intermediate", "advanced")))
n <- sum(tab)

expected <- outer(rowSums(tab), colSums(tab)) / n
round(expected, 1)

sign(tab - expected)                      # +1 positive, -1 negative association

# Conditional vs. marginal shares
round(prop.table(tab, 1), 2)              # n_ij / n_i+
round(colSums(tab) / n, 2)                # n_+j / n

mosaicplot(tab, main = "Mosaic plot", color = TRUE)
```

## Python Code

```python
import numpy as np
import pandas as pd
import matplotlib.pyplot as plt
from statsmodels.graphics.mosaicplot import mosaic

tab = pd.DataFrame([[30, 10, 15], [10, 25, 10]],
                   index=["SocSci", "Econ"], columns=["basic", "intermediate", "advanced"])
n = tab.values.sum()

expected = np.outer(tab.sum(axis=1), tab.sum(axis=0)) / n
print(pd.DataFrame(expected, index=tab.index, columns=tab.columns).round(1))
print(np.sign(tab - expected))            # +1 positive, -1 negative association

print(tab.div(tab.sum(axis=1), axis=0).round(2))   # conditional row shares
print((tab.sum(axis=0) / n).round(2))              # marginal column shares

mosaic(tab.stack().to_dict(), title="Mosaic plot")
plt.show()
```

## Practice Questions

*✎ new question added for this site (worked solution below)*

- ✎ In a survey of 100 shoppers, 40 bought a cheap product online, 20 an expensive one online, 10 a cheap one in a store and 30 an expensive one in a store. Is "online" positively or negatively associated with "cheap"?
- ✎ A 2×2 table has row totals 40 and 60 and column totals 30 and 70 ($n=100$). What count in the top-left cell corresponds to no association?

## Solutions

*✎ solution written for this site*

- ✎ Q1: Online total 60, cheap total 50. Expected count for (online, cheap) $= 60\cdot50/100 = 30$; observed 40 > 30. Equivalently the share of cheap among online buyers is $40/60 \approx 0.67 > 0.50$ overall. So the association is positive.
- ✎ Q2: Expected count $= 40\cdot30/100 = 12$.
