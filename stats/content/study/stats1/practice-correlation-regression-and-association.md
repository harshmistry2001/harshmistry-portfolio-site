# Practice: Correlation, Regression, and Association

> Course part: Stats 1

## Overview

This problem set covers how to measure the relationship between two variables: Pearson's correlation and covariance (linear relationship between metric variables), Spearman's rank correlation (monotone relationships and ordinal data), and association in contingency tables (categorical variables). The recurring theme is *what happens to each measure when the data are transformed*.

## Topics to Review

- [Pearson Correlation Coefficient](#/study/stats1/pearson-correlation-coefficient)
- [Spearman Rank Correlation Coefficient](#/study/stats1/spearman-rank-correlation-coefficient)
- [Linear Regression and Least Squares](#/study/stats1/linear-regression-and-least-squares)
- [Association](#/study/stats1/association)

## How to Approach the Questions

- **Contingency table with missing cells:** use the row and column totals; each missing entry follows from the totals.
- **Pearson:** compute $s_{xy}$, $s_x$, $s_y$, then $r=s_{xy}/(s_xs_y)$. Adding a constant changes nothing; multiplying $x$ by $c>0$ multiplies the covariance by $c$ but leaves $r$ unchanged.
- **Spearman:** rank both variables (average ranks for ties), then correlate the ranks. Any strictly increasing transformation leaves the ranks, and hence $r_S$, unchanged.
- **Association:** compare the observed cell with the expected cell $n_{i+}n_{+j}/n$.

## When It's Used

This practice set tests covariance, Pearson and Spearman correlation, association in contingency tables and — most importantly — how these measures react to transformations. The code demonstrates the transformation rules on example data.

**Exam tip:** Pearson is invariant under positive *linear* maps ($+3\text{ m}^2$, doubling inhabitants) but changes under non-linear ones (squaring). Spearman is invariant under *any* strictly increasing map, so squaring non-negative counts leaves it unchanged.

## R Code

```r
set.seed(11)
size <- round(runif(15, 40, 160))                        # house size in m^2
people <- pmax(1, round(size / 40 + rnorm(15, 0, 1)))   # inhabitants

base <- c(pearson = cor(size, people), spearman = cor(size, people, method = "spearman"))

# (i) +3 m^2 and doubled households: linear, positive
t1 <- c(cor(size + 3, 2 * people), cor(size + 3, 2 * people, method = "spearman"))
# (ii) inhabitants squared: non-linear but strictly increasing (people > 0)
t2 <- c(cor(size, people^2), cor(size, people^2, method = "spearman"))

rbind(base, t1, t2)

# Covariance does change under rescaling
c(cov(size, people), cov(size + 3, 2 * people))
```

## Python Code

```python
import numpy as np
from scipy import stats

rng = np.random.default_rng(11)
size = np.round(rng.uniform(40, 160, 15))
people = np.maximum(1, np.round(size / 40 + rng.normal(0, 1, 15)))

def both(x, y):
    return round(stats.pearsonr(x, y)[0], 4), round(stats.spearmanr(x, y).statistic, 4)

print("original:        ", both(size, people))
print("(i) +3, doubled: ", both(size + 3, 2 * people))
print("(ii) squared:    ", both(size, people**2))
print("covariance:", np.cov(size, people)[0, 1], np.cov(size + 3, 2 * people)[0, 1])
```

## Practice Questions

*◆ original question from the course material · ✎ new question added for this site (worked solution below)*

- ◆ [practice sheet] Complete the following contingency table for students in a university. (Table provided in source).
- ◆ [practice sheet] The wind (mph) and temperature (Fahrenheit degree) in New York were recorded.
  - (a) Calculate the sample covariance and (Pearson's) correlation coefficient $r_{xy}$ between wind and temperature. Based on the value of the correlation coefficient, what type of relationship do you expect between the two variables?
  - (b) Draw a scatterplot. Does this confirm your expectations?
  - (c) How would the sample covariance and correlation change, if (i) the temperature was one Fahrenheit degree more? (ii) the wind was 10% faster?
- ◆ [practice sheet] The reaction time (seconds) of 12 computer gamers and their age (years) are recorded.
  - (a) Determine the ranks $r_{x,i}$ and $r_{y,i}$ (Remember that in the case of ties, we take the average value of the possible ranks for each observation in the tie.)
  - (b) Calculate Spearman's rank correlation coefficient between reaction time and age. How do you interpret the value?
- ◆ [practice sheet] Consider the contingency table from Problem Session 3, Exercise 3.
  - (a) Which values are positive associated?
  - (b) How are the Social Science major and intermediate level of technical writing associated?
- ◆ [practice sheet] We are interested in detecting a correlation between the size of a house and the corresponding number of inhabitants. A sample of 15 houses ($x_i$ in $m^2$) and the corresponding number of people living in the house ($y_i$) is considered. (Summary statistics provided in source).
  - (a) What is the Pearson correlation coefficient between the size of the house and the number of inhabitants?
    - (i) If each house in the sample is enlarged with 3 $m^2$ and each household doubles the number of people living in, how is the Pearson correlation coefficient changing?
    - (ii) How is the Pearson correlation coefficient changing if the number of inhabitants squared?
  - (b) Assume that the Spearman's rank correlation coefficient between the samples is $r_{S,xy} = 0.3096$. How is the Spearman's rank correlation coefficient changing if we consider the transformations in i) and ii)?
- ✎ For the data $x=1,2,3,4$ and $y=2,4,5,9$ compute the covariance, Pearson's $r$ and Spearman's $r_S$. Why is $r_S$ larger than $r$?

## Solutions

*✎ solution written for this site*

*The solutions below were written for this site (the course supplied none). Questions whose data tables are not reproduced in the text (1, 3, 4) are answered by method.*

- ✎ Q2 (c): (i) Adding one degree to every temperature shifts $y$ only: the covariance and the correlation are **unchanged**. (ii) A 10% faster wind multiplies $x$ by 1.1: the covariance is multiplied by 1.1, the correlation is **unchanged** (positive scaling).
- ✎ Q5: (a)(i) Adding 3 to each house size is a shift and doubling the inhabitants is a positive scaling, so the Pearson correlation is **unchanged**. (a)(ii) Squaring the number of inhabitants is non-linear, so the Pearson correlation **changes** (the direction depends on the data; squaring typically emphasises large households). (b) Both transformations are strictly increasing on the data (sizes and counts are positive), so the ranks do not change and Spearman's coefficient stays **0.3096** in both cases.
- ✎ Q6 (new question): $\overline x=2.5$, $\overline y=5$; deviation products: $(-1.5)(-3)=4.5$, $(-0.5)(-1)=0.5$, $(0.5)(0)=0$, $(1.5)(4)=6$, total 11, so $s_{xy}=11/3\approx3.67$. $s_x^2=5/3$, $s_y^2=26/3$ (deviations $-3,-1,0,4$ squared sum to 26), so $r=\frac{11/3}{\sqrt{(5/3)(26/3)}}=\frac{11}{\sqrt{130}}\approx0.965$. The ranks of $x$ and $y$ coincide, so $r_S=1$. Spearman is larger because the relationship is perfectly monotone but not perfectly linear (the last step of $y$ is steeper).
