# Pooled Mean

> Course part: Stats 1

## Overview

Sometimes you only know the **means and sizes** of several groups and need the overall mean. The pooled mean combines them correctly by weighting each group by its size. It is the reason that "the average of the averages" is usually the wrong answer.

## Concept

For two samples, $x$ with $n_x$ observations and mean $\overline{x}_{n_x}$, and $y$ with $n_y$ observations and mean $\overline{y}_{n_y}$, the pooled mean of the combined sample is

$$\overline{x}_{pooled} = \frac{n_x\,\overline{x}_{n_x} + n_y\,\overline{y}_{n_y}}{n_x + n_y}.$$

This is a [weighted arithmetic mean](https://en.wikipedia.org/wiki/Weighted_arithmetic_mean) with weights $n_x/(n_x+n_y)$ and $n_y/(n_x+n_y)$: the larger group has more influence. The formula extends to any number of groups: $\overline{x} = \sum_g n_g \overline{x}_g \big/ \sum_g n_g$.

## Worked Example

Team A has 10 employees with a mean salary of 50 (thousand EUR); team B has 30 employees with a mean of 60.

$$\overline{x}_{pooled} = \frac{10\cdot50 + 30\cdot60}{40} = \frac{2300}{40} = 57.5 .$$

The simple average of the two means, $(50+60)/2 = 55$, ignores that team B is three times larger.

**The "Mary problem" (Will Rogers phenomenon).** Suppose Mary earns 55 in team A (mean 62) and moves to team B (mean 50). Her salary is below A's mean, so A's mean rises when she leaves; her salary is above B's mean, so B's mean rises when she joins. Both team means increase, yet nobody's salary changed. The pooled mean of the two teams is unchanged by the move, which is a good check on the calculation. See [Will Rogers phenomenon](https://en.wikipedia.org/wiki/Will_Rogers_phenomenon).

## Common Mistakes

- Averaging group means without weights.
- Weighting by the wrong quantity (for instance by the group mean instead of the group size).
- Forgetting that the pooled mean needs the *sizes* of the groups, not only their means.

## When It's Used

Pooling combines group averages without the raw data: overall average salary from department averages, the national average from regional averages, or combining two survey waves. It is a size-weighted average, so a large group dominates.

**Exam tip (Mary problem):** moving one person between teams can lower *both* team means (Will Rogers phenomenon) if her salary is below the old team mean but above the new team mean. Check with the pooled-mean formula.

## R Code

```r
pooled_mean <- function(n_x, mean_x, n_y, mean_y) (n_x * mean_x + n_y * mean_y) / (n_x + n_y)

pooled_mean(40, 52.1, 60, 48.3)

# Mary: old team of 4 with mean 4500, new team of 3 with mean 5500
old_team <- c(mary = 5000, 4400, 4300, 4300)     # mean 4500
new_team <- c(6000, 5500, 5000)                  # mean 5500
c(mean(old_team), mean(new_team))

# After the promotion
c(old_after = mean(old_team[-1]), new_after = mean(c(new_team, old_team["mary"])))
# Both means drop because 4500 < Mary's salary < 5500
```

## Python Code

```python
import numpy as np

def pooled_mean(n_x, mean_x, n_y, mean_y):
    return (n_x * mean_x + n_y * mean_y) / (n_x + n_y)

print(pooled_mean(40, 52.1, 60, 48.3))

# Mary: old team of 4 with mean 4500, new team of 3 with mean 5500
mary = 5000
old_team = np.array([mary, 4400, 4300, 4300])
new_team = np.array([6000, 5500, 5000])
print("before:", old_team.mean(), new_team.mean())
print("after: ", old_team[1:].mean(), np.append(new_team, mary).mean())
# Both means drop because 4500 < Mary's salary < 5500
```

## Practice Questions

*✎ new question added for this site (worked solution below)*

- ✎ Group 1 has 20 members with mean 5; group 2 has 30 members with mean 10. Find the pooled mean.
- ✎ Two classes of 25 and 75 students have a combined mean grade of 77.5. The first class has mean 70. Find the mean of the second class.

## Solutions

*✎ solution written for this site*

- ✎ Q1: $(20\cdot5 + 30\cdot10)/50 = 400/50 = 8$.
- ✎ Q2: $25\cdot70 + 75\cdot m = 100\cdot77.5$, so $1750 + 75m = 7750$ and $m = 80$.
