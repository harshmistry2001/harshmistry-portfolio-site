# Statistical Modelling and Difference in Difference

> Course part: Stats 2

## Overview

How do we judge whether an intervention (a new teaching method, a store redesign) really worked? Comparing "after" with "before" is not enough, because things change for other reasons. The **difference-in-differences** approach compares the *change* in a treated group with the change in a control group. This page also covers how to plan a study: how many participants are needed to detect an effect.

## Concept

### Empirical quantities versus model parameters

A sample mean or variance is a **descriptive** number; a **statistical model** says which theoretical parameter that number is supposed to estimate and what its uncertainty is. All the tests in Stats 2 are statements about such parameters.

### Difference in differences

1. Measure each unit before ($x$) and after ($y$) the intervention; compute the gain $D=y-x$ per unit.
2. Do this for a treated group (gains $D_i$) and a control group (gains $C_j$).
3. Estimate the intervention effect by $\overline D-\overline C$ and test it with a two-sample test on the gains.

This removes differences in the starting level between the groups. It is still vulnerable to **confounding** that changes the groups differently over time (for example more motivated people in the treated group); random assignment and controlling for confounders mitigate this.

### Why pairing helps

For a paired measurement, $Var(Y-X)=Var(Y)+Var(X)-2\rho_{X,Y}\sqrt{Var(X)Var(Y)}$. The larger the correlation $\rho$ between before and after, the smaller the variance of the gain and the more precise the comparison.

### Power and sample size

The type-II error is $\beta$ and the power is $1-\beta$. For a one-sided two-sample test with known standard deviation $\sigma$ and group sizes $n,m$, $H_0$ is rejected when
$$\overline D-\overline C>z_{1-\alpha}\,\sigma\sqrt{\tfrac1n+\tfrac1m}.$$
To detect a true difference $\delta$ with power $1-\beta$ and equal group sizes $n=m$:
$$n\ \ge\ \frac{2\sigma^2\,(z_{1-\alpha}+z_{1-\beta})^2}{\delta^2}.$$
Smaller effects, larger variability and higher required power all demand larger samples. See [statistical power](https://en.wikipedia.org/wiki/Power_%28statistics%29).

## Worked Example

A new teaching method: treated students improve from a mean of 60 to 72 (gain 12), control students from 58 to 63 (gain 5). The difference-in-differences estimate is $12-5=7$ points; the pre-existing 2-point gap between the groups has no effect on it.

Sample size: to detect a difference $\delta=5$ with $\sigma=10$, $\alpha=0.05$ (one-sided) and 80% power,
$$n\ge\frac{2\cdot100\cdot(1.645+0.842)^2}{25}=\frac{200\cdot6.18}{25}\approx49.5\ \Rightarrow\ 50\text{ per group}.$$

## Common Mistakes

- Comparing only post-intervention means when the groups started at different levels.
- Interpreting the estimate causally without random assignment or a plausible "parallel trends" argument.
- Planning a study without a power calculation and then being unable to detect a realistic effect.

## When It's Used

Difference-in-differences evaluates an intervention by comparing the *change* in a treated group with the change in a control group, removing baseline differences: a new teaching method, a regional minimum wage, a store redesign. Power and sample-size planning decide how many participants are needed before the study starts.

**Exam tip:** compute gains $D = \text{post} - \text{pre}$ per unit, then run a two-sample test on the gains of treated vs. control. The variance of a difference of correlated measurements is $Var(Y) + Var(X) - 2\rho\sigma_X\sigma_Y$ — positive correlation makes paired designs more precise.

## R Code

```r
set.seed(16)
n <- 25
pre_t  <- rnorm(n, 60, 10); post_t <- pre_t + rnorm(n, 8, 5)   # treated: +8 points
pre_c  <- rnorm(n, 55, 10); post_c <- pre_c + rnorm(n, 3, 5)   # control: +3 points

gain_t <- post_t - pre_t; gain_c <- post_c - pre_c
mean(gain_t) - mean(gain_c)                                    # DiD estimate
t.test(gain_t, gain_c, var.equal = TRUE, alternative = "greater")

# Same estimate as the interaction in a regression
d <- data.frame(score = c(pre_t, post_t, pre_c, post_c),
                treated = rep(c(1, 0), each = 2 * n),
                post = rep(rep(c(0, 1), each = n), 2))
coef(lm(score ~ treated * post, data = d))["treated:post"]

# Sample size: detect a 5-point difference in gains, sd 7, alpha 5% one-sided, power 80%
power.t.test(delta = 5, sd = 7, sig.level = 0.05, power = 0.8, alternative = "one.sided")$n
```

## Python Code

```python
import numpy as np
import pandas as pd
from scipy import stats
from statsmodels.formula.api import ols
from statsmodels.stats.power import TTestIndPower

rng = np.random.default_rng(16)
n = 25
pre_t = rng.normal(60, 10, n); post_t = pre_t + rng.normal(8, 5, n)
pre_c = rng.normal(55, 10, n); post_c = pre_c + rng.normal(3, 5, n)
gain_t, gain_c = post_t - pre_t, post_c - pre_c
print("DiD:", gain_t.mean() - gain_c.mean())
print(stats.ttest_ind(gain_t, gain_c, alternative="greater"))

d = pd.DataFrame({"score": np.r_[pre_t, post_t, pre_c, post_c],
                  "treated": np.repeat([1, 0], 2 * n),
                  "post": np.tile(np.repeat([0, 1], n), 2)})
print(ols("score ~ treated * post", data=d).fit().params["treated:post"])

print("n per group:", TTestIndPower().solve_power(effect_size=5 / 7, alpha=0.05, power=0.8,
                                                   alternative="larger"))
```

## Practice Questions

*✎ new question added for this site (worked solution below)*

- ✎ Control group: pre 40, post 44. Treated group: pre 41, post 50. Compute the difference-in-differences estimate.
- ✎ Before and after measurements both have standard deviation 5 and correlation 0.6. What is the variance of the gain $Y-X$, and how does it compare with the value for uncorrelated measurements?
- ✎ How large must each group be to detect a difference of 4 with $\sigma=8$, one-sided $\alpha=0.05$ and power 90%? ($z_{0.95}=1.645$, $z_{0.90}=1.282$)

## Solutions

*✎ solution written for this site*

- ✎ Q1: Gains: treated $9$, control $4$; difference-in-differences $=9-4=5$.
- ✎ Q2: $Var(Y-X)=25+25-2\cdot0.6\cdot25=20$, versus $50$ for uncorrelated measurements: the positive correlation reduces the variance of the gain by 60%.
- ✎ Q3: $n\ge\frac{2\cdot64\cdot(1.645+1.282)^2}{16}=8\cdot8.57\approx68.5$, so 69 per group.
