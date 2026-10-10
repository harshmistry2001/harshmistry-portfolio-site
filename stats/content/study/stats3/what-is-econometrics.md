# What is Econometrics?

> Course part: Stats 3

## Overview

[Econometrics](https://en.wikipedia.org/wiki/Econometrics) applies statistical methods to economic data in order to give empirical content to economic relationships. It answers questions such as: *How much does an additional year of education raise wages? Did a job-training program increase earnings? How strongly does demand react to a price change?* What makes it a field of its own is the kind of data it must work with: mostly **observational** data in which people have chosen their own circumstances.

## Concept

### What econometrics is used for

- **Estimating** economic relationships (the size of an effect, an elasticity).
- **Testing** economic theories (does the data support the prediction of a theory?).
- **Evaluating and implementing** government and business policy (does a subsidy, a tax or a marketing campaign work?).

### Experimental versus observational data

- **Experimental data** come from a designed experiment in which the researcher randomly assigns the "treatment" (for example a field experiment in which some villages receive a program and others do not). Random assignment makes the groups comparable, so experiments have high **internal validity** (the estimated effect is credible for the studied group). Drawbacks: experiments can be expensive, ethically problematic or impossible, and the results may not carry over to other settings (limited **external validity**).
- **Observational (non-experimental) data** are collected without intervention: surveys, administrative records, company databases. They are cheap and abundant, but because people *select* their own treatment (those who attend training may be more motivated), a naive comparison of averages mixes the true causal effect with selection. Dealing with this problem is the central task of econometrics.

## Worked Example

*Does a job-training program raise earnings?*

- **Naive comparison:** trainees earn on average 40% more than non-trainees in a survey. But people who choose training may be more ambitious, so part of the 40% reflects ambition, not the program.
- **Experiment:** from 1,000 eligible workers, 500 are selected by lottery for the program. Since the lottery is independent of ambition, the difference in average earnings estimates the program's effect. Limits: running such an experiment costs money, and the result for volunteers in one city may not hold nationwide.

## Common Mistakes

- Treating a correlation in observational data as a causal effect.
- Believing that a large sample removes selection problems; it only reduces random error.
- Assuming that an experimental result automatically generalises to other populations.

## When It's Used

Econometrics estimates economic relationships from mostly *observational* data: the return to education, the effect of a job-training program on earnings, the price elasticity of demand, the impact of a policy. The core difficulty — and the reason for the whole course — is that people self-select into treatments, so a naive comparison of averages mixes the causal effect with selection.

**Exam tip:** explain why an experiment (random assignment) has high internal validity and what its drawbacks are (cost, ethics, external validity).

## R Code

```r
set.seed(1)
n <- 2000
motivation <- rnorm(n)                                 # unobserved by the analyst

# Experiment: training assigned at random
train_exp <- rbinom(n, 1, 0.5)
earn_exp <- 20 + 2 * train_exp + 3 * motivation + rnorm(n, 0, 4)

# Observational data: motivated people choose training more often
train_obs <- rbinom(n, 1, plogis(1.5 * motivation))
earn_obs <- 20 + 2 * train_obs + 3 * motivation + rnorm(n, 0, 4)

c(true_effect = 2,
  experiment = mean(earn_exp[train_exp == 1]) - mean(earn_exp[train_exp == 0]),
  observational = mean(earn_obs[train_obs == 1]) - mean(earn_obs[train_obs == 0]))
```

## Python Code

```python
import numpy as np

rng = np.random.default_rng(1)
n = 2000
motivation = rng.normal(size=n)

train_exp = rng.binomial(1, 0.5, n)
earn_exp = 20 + 2 * train_exp + 3 * motivation + rng.normal(0, 4, n)

train_obs = rng.binomial(1, 1 / (1 + np.exp(-1.5 * motivation)))
earn_obs = 20 + 2 * train_obs + 3 * motivation + rng.normal(0, 4, n)

diff = lambda y, d: y[d == 1].mean() - y[d == 0].mean()
print("true effect: 2")
print("experiment:   ", round(diff(earn_exp, train_exp), 3))
print("observational:", round(diff(earn_obs, train_obs), 3), "(biased by self-selection)")
```

## Practice Questions

*✎ new question added for this site (worked solution below)*

- ✎ Give one reason why a randomized experiment on the effect of education on wages (randomly assigning years of schooling) is not feasible.
- ✎ A bank compares the repayment rates of customers who received financial counselling with those who did not and finds that counselled customers repay more often. Why is this not necessarily the effect of counselling?

## Solutions

*✎ solution written for this site*

- ✎ Q1: It would be unethical (and legally impossible) to force people to leave school early or stay in school against their will; such an experiment would also take decades to produce results.
- ✎ Q2: Customers choose (or are chosen) for counselling. Those who seek counselling may already be more careful with money, so selection, not counselling, may explain the difference. Only random assignment of counselling, or controlling for the relevant characteristics, can isolate its effect.
