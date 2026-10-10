# Causality and the Notion of Ceteris Paribus in Econometric Analysis

> Course part: Stats 3

## Overview

Most economic questions are *causal*: if we raised the minimum wage, what would happen to employment? If a person had one more year of schooling, how much more would they earn? To answer them we need the effect of changing **one** factor while everything else stays the same, the notion of *ceteris paribus* (Latin: "all other things being equal").

## Concept

### Ceteris paribus

A [ceteris paribus](https://en.wikipedia.org/wiki/Ceteris_paribus) effect is the change in an outcome $y$ caused by a change in one variable $x$, with all other relevant factors held fixed. It is the economic counterpart of the ideal experiment: take the same person, change only $x$, and observe $y$ in both situations.

### Why observational data make this hard

In real data, the variable of interest is usually correlated with other factors that also influence the outcome:

- People with more education also tend to have higher innate ability, so comparing wages across education levels mixes the effect of education with that of ability.
- Farmers who use more fertiliser may own better land.

Such factors are often **unobserved** and end up in the error term $u$. If $x$ is correlated with something in $u$, a simple comparison or regression does not isolate the causal effect. This problem is called [omitted-variable bias](https://en.wikipedia.org/wiki/Omitted-variable_bias).

### Ways to approach it

- **Random assignment** (experiment): makes $x$ independent of all other factors by design.
- **Controlling for confounders** in a multiple regression: include the other relevant factors as explanatory variables, so that the coefficient of $x$ is interpreted holding them fixed.
- Other designs for observational data (natural experiments, instrumental variables, panel methods) are covered in advanced courses.

## Worked Example

Fertiliser and crop yield. Plots with more fertiliser show higher yields. If farmers put more fertiliser on their *best* soil, part of the higher yield is soil quality, not fertiliser. In a field experiment where fertiliser amounts are assigned randomly to equal plots, soil quality is balanced across the amounts, so the yield difference is the causal effect of fertiliser. In the observational data the bias is **positive** (the effect is overstated) because soil quality is positively correlated both with fertiliser and with yield.

## Common Mistakes

- Reading a regression coefficient as a causal effect without arguing that other factors are controlled or unrelated.
- Controlling for factors that are themselves *results* of the treatment.
- Believing that adding more variables automatically solves the problem: unobserved factors remain.

## When It's Used

Causal questions — does fertiliser raise yield, does education raise wages, does police presence reduce crime — ask for a *ceteris paribus* effect: change one factor, hold everything else fixed. With observational data the factor of interest is usually correlated with other unobserved factors (land quality, ability), so a simple comparison or regression does not isolate the effect.

**Exam tip:** name a concrete omitted factor, argue how it correlates with $x$ and with $y$, and hence the direction of the bias.

## R Code

```r
set.seed(4)
n <- 1000
land_quality <- rnorm(n)
fertilizer <- 50 + 10 * land_quality + rnorm(n, 0, 8)      # better land gets more fertilizer
yield <- 100 + 0.5 * fertilizer + 15 * land_quality + rnorm(n, 0, 10)

coef(lm(yield ~ fertilizer))["fertilizer"]                   # confounded
coef(lm(yield ~ fertilizer + land_quality))["fertilizer"]    # ceteris paribus (true: 0.5)
```

## Python Code

```python
import numpy as np
import statsmodels.api as sm

rng = np.random.default_rng(4)
n = 1000
land = rng.normal(size=n)
fert = 50 + 10 * land + rng.normal(0, 8, n)
yld = 100 + 0.5 * fert + 15 * land + rng.normal(0, 10, n)

print("naive:     ", sm.OLS(yld, sm.add_constant(fert)).fit().params[1])
print("controlled:", sm.OLS(yld, sm.add_constant(np.column_stack([fert, land]))).fit().params[1],
      "(true 0.5)")
```

## Practice Questions

*✎ new question added for this site (worked solution below)*

- ✎ Cities with more police have more crime. Does this show that police cause crime? Name an omitted factor and the direction of the bias in a naive comparison.
- ✎ Students who use a tutoring service get higher grades. Give two reasons why the ceteris paribus effect of tutoring may be smaller than the raw difference.

## Solutions

*✎ solution written for this site*

- ✎ Q1: No. Cities with a high crime problem hire more police (reverse causality), and the underlying crime risk (an omitted factor) is positively correlated both with police numbers and with crime. A naive comparison therefore *overstates* (or even reverses the sign of) the effect of police.
- ✎ Q2: Students who choose tutoring may be more motivated or ambitious (selection), and they may also study more on their own. Both factors raise grades independently of tutoring and are positively correlated with tutoring use, so the raw difference overstates the effect.
