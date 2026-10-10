# Two-way ANOVA

> Course part: Stats 2

## Overview

One-way ANOVA studies one grouping factor. Often two factors act together: drug type *and* age group, fertiliser *and* soil type, price level *and* advertising channel. **Two-way ANOVA** estimates the effect of each factor and, crucially, whether the factors **interact**: does the effect of one factor depend on the level of the other?

## Concept

### Model

Factor 1 has $I$ levels, factor 2 has $J$ levels, and each combination $(i,j)$ is observed $r$ times:
$$X_{ijl}\sim N\big(a_i+b_j+c_{ij},\ \sigma^2\big),\qquad l=1,\dots,r,$$
independent, with the same variance in all cells.

- $a_i$ = main effect of level $i$ of factor 1,
- $b_j$ = main effect of level $j$ of factor 2,
- $c_{ij}$ = **interaction effect** of the combination $(i,j)$.

With no interaction ($c_{ij}=0$) the factors act additively: the effect of factor 1 is the same at every level of factor 2.

### Tests

Three F-tests are carried out (see [two-way ANOVA](https://en.wikipedia.org/wiki/Two-way_analysis_of_variance)): for the main effect of factor 1, for the main effect of factor 2, and for the interaction. For a balanced design the degrees of freedom are

| Source | df |
|---|---|
| Factor 1 | $I-1$ |
| Factor 2 | $J-1$ |
| Interaction | $(I-1)(J-1)$ |
| Error | $IJ(r-1)$ |
| Total | $IJr-1$ |

### Interaction plot

Plot the cell means with the levels of factor 1 on the x-axis and one line per level of factor 2. **Parallel lines** mean no interaction; lines that cross or diverge indicate interaction.

## Worked Example

Mean recovery time (days) for two drugs and two age groups:

| | Young | Old |
|---|---|---|
| Drug A | 10 | 14 |
| Drug B | 12 | 12 |

Row means: A 12, B 12 (no overall drug effect); column means: young 11, old 13. But age matters for drug A (+4 days) and not for drug B (0 days): the effect of age depends on the drug, i.e. there is an **interaction**. Reporting only "no drug effect" would be misleading: the drugs differ for each age group (A better for the young, B better for the old).

## Common Mistakes

- Interpreting main effects when the interaction is significant.
- Using unbalanced cell counts without noticing that the sums of squares then depend on the order of the factors.
- Forgetting that the error df uses the number of *replicates* per cell: without replication the interaction cannot be tested.

## When It's Used

Two-way ANOVA separates the effects of two factors and their interaction: drug type × age group, fertiliser × soil, price level × ad channel. The interaction term answers the practically important question "does the effect of factor 1 depend on the level of factor 2?".

**Exam tip:** interpret the interaction first — if it is significant, main effects cannot be read in isolation. An interaction plot with non-parallel lines signals interaction.

## R Code

```r
set.seed(9)
d <- expand.grid(drug = c("A", "B"), age = c("young", "old"), rep = 1:6)
effect <- with(d, 10 + 3 * (drug == "B") + 2 * (age == "old") + 4 * (drug == "B" & age == "old"))
d$y <- effect + rnorm(nrow(d), 0, 2)

fit <- aov(y ~ drug * age, data = d)          # main effects + interaction
summary(fit)

with(d, interaction.plot(age, drug, y, ylab = "mean response"))
```

## Python Code

```python
import numpy as np
import pandas as pd
import matplotlib.pyplot as plt
import statsmodels.api as sm
from statsmodels.formula.api import ols

rng = np.random.default_rng(9)
d = pd.DataFrame([(dr, ag) for dr in "AB" for ag in ["young", "old"] for _ in range(6)],
                 columns=["drug", "age"])
d["y"] = (10 + 3 * (d.drug == "B") + 2 * (d.age == "old")
          + 4 * ((d.drug == "B") & (d.age == "old")) + rng.normal(0, 2, len(d)))

fit = ols("y ~ C(drug) * C(age)", data=d).fit()
print(sm.stats.anova_lm(fit, typ=2))

d.groupby(["age", "drug"])["y"].mean().unstack().plot(marker="o")
plt.ylabel("mean response")
plt.show()
```

## Practice Questions

*✎ new question added for this site (worked solution below)*

- ✎ A balanced experiment has factor 1 with 3 levels, factor 2 with 4 levels and 5 replicates per cell. Give the degrees of freedom of all sources of variation.
- ✎ Cell means: fertiliser X on sandy soil 20, X on clay 30, fertiliser Y on sandy 25, Y on clay 35. Is there an interaction?

## Solutions

*✎ solution written for this site*

- ✎ Q1: Factor 1: 2; factor 2: 3; interaction: $2\cdot3=6$; error: $12\cdot4=48$; total: $60-1=59$ (check: $2+3+6+48=59$).
- ✎ Q2: Going from sandy to clay raises the mean by 10 for both fertilisers (20→30 and 25→35), and Y is 5 higher than X on both soils. The lines are parallel, so there is no interaction: the effects are purely additive.
