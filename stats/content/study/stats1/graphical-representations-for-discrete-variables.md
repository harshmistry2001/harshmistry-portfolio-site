# Graphical Representations for Discrete Variables

> Course part: Stats 1

## Overview

A picture of a frequency table lets readers see the pattern at a glance. For categorical and discrete variables there are three standard charts: the bar chart, the pie chart and the Pareto chart. Which one you choose should depend on the message and on the scale of the variable.

## Concept

- **[Bar chart](https://en.wikipedia.org/wiki/Bar_chart)**: one bar per category; the height (or length, if horizontal) is the absolute or relative frequency. Bars are drawn **with gaps** because the categories are separate values, not a continuum.
- **[Pie chart](https://en.wikipedia.org/wiki/Pie_chart)**: a circle divided into segments whose *areas* (angles) are proportional to the frequencies. Good for a handful of categories and "share of the whole" messages; hard to read when there are many similar slices.
- **[Pareto chart](https://en.wikipedia.org/wiki/Pareto_chart)**: a bar chart with the bars **sorted in descending order** of frequency, usually with a line showing the cumulative percentage. It is used for nominal variables, where the sorting does not destroy any natural order.

The angle of a pie slice for relative frequency $r_i$ is $360^\circ \cdot r_i$.

## Worked Example

A company classifies 100 customer complaints:

| Category | Count | Share | Cumulative share |
|---|---|---|---|
| Late delivery | 45 | 45% | 45% |
| Damaged item | 25 | 25% | 70% |
| Wrong item | 15 | 15% | 85% |
| Billing error | 10 | 10% | 95% |
| Other | 5 | 5% | 100% |

The Pareto chart shows that the first two categories cause 70% of all complaints. Fixing delivery and packaging gives the biggest improvement per effort; this is the idea behind the "80/20 rule". In a pie chart "late delivery" would be a slice of $360^\circ \cdot 0.45 = 162^\circ$.

## Common Mistakes

- Sorting the bars of an **ordinal** variable by height. A Pareto order destroys the natural order (e.g., ratings 1 to 5), so use it for nominal variables only.
- Using a pie chart with more than about five or six categories, or with 3D effects that distort areas.
- Truncating the vertical axis of a bar chart so that small differences look huge; bars should start at zero.

## When It's Used

Bar and pie charts are how categorical results reach management slides and reports. The Pareto chart (bars sorted by frequency) is the standard quality-management tool: it shows which few defect types or complaint categories cause most of the problems (the 80/20 rule).

**Exam tip:** bar charts have gaps between bars (discrete categories); a Pareto chart is only meaningful for nominal data, because sorting would destroy the natural order of ordinal data.

## R Code

```r
complaints <- c(delivery = 42, billing = 18, quality = 27, website = 9, other = 4)
op <- par(mfrow = c(1, 3))

barplot(prop.table(complaints), main = "Bar chart", ylab = "relative frequency")
pie(complaints, main = "Pie chart")

# Pareto chart: sorted descending + cumulative share
sorted <- sort(complaints, decreasing = TRUE)
bp <- barplot(sorted, main = "Pareto chart", ylim = c(0, sum(sorted)))
lines(bp, cumsum(sorted), type = "b", pch = 19)
par(op)

round(cumsum(sorted) / sum(sorted), 2)   # share explained by the top categories
```

## Python Code

```python
import matplotlib.pyplot as plt
import pandas as pd

complaints = pd.Series({"delivery": 42, "billing": 18, "quality": 27, "website": 9, "other": 4})
fig, ax = plt.subplots(1, 3, figsize=(13, 4))

(complaints / complaints.sum()).plot.bar(ax=ax[0], title="Bar chart", rot=0)
ax[1].pie(complaints, labels=complaints.index)
ax[1].set_title("Pie chart")

# Pareto chart: sorted descending + cumulative share on a second axis
s = complaints.sort_values(ascending=False)
ax[2].bar(s.index, s.values)
ax2 = ax[2].twinx()
ax2.plot(s.index, s.cumsum() / s.sum(), marker="o", color="black")
ax2.set_ylim(0, 1.05)
ax[2].set_title("Pareto chart")
plt.tight_layout()
plt.show()

print((s.cumsum() / s.sum()).round(2))
```

## Practice Questions

*✎ new question added for this site (worked solution below)*

- ✎ A factory records 100 defects: scratches 52, dents 21, misalignment 13, discolouration 9, other 5. Compute the cumulative percentages for a Pareto chart. How many defect types account for at least 70% of all defects?
- ✎ Which chart type would you use for (a) the market share of five smartphone brands, (b) the distribution of customer ratings from 1 to 5 stars, (c) finding the most important causes of machine downtime? Justify briefly.

## Solutions

*✎ solution written for this site*

- ✎ Q1: Cumulative percentages: 52%, 73%, 86%, 95%, 100%. Two defect types (scratches and dents) already account for 73%.
- ✎ Q2: (a) Pie chart (or bar chart): shares of a whole with few categories. (b) Bar chart in the natural order of the ratings; a Pareto chart would destroy the order. (c) Pareto chart: it ranks causes by frequency and highlights the "vital few".
