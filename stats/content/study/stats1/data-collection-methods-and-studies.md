# Data Collection Methods and Studies

> Course part: Stats 1

## Overview

Statistics can only be as good as the data it is applied to. *How* data were obtained determines what you may conclude from them: whether you can claim that one thing **causes** another, or only that two things **go together**. This page explains the main ways of collecting data and the typical traps of each.

## Concept

### Primary and secondary data

- **Primary data** are collected specifically for the question at hand (you run the survey or experiment yourself).
- **Secondary data** already exist (official statistics, company databases, published studies). They are cheap but may not measure exactly what you need.

### Controlled studies (experiments)

In a [controlled study](https://en.wikipedia.org/wiki/Scientific_control) the researcher *intervenes*: one group (the **study** or treatment group) receives the treatment, another (the **control group**) does not, and outcomes are compared.

- **Randomized**: units are assigned to groups by chance. This balances all other influences, known and unknown, across the groups on average, so a difference in outcome can be attributed to the treatment. See [randomized controlled trial](https://en.wikipedia.org/wiki/Randomized_controlled_trial).
- **Blind**: the participants do not know which group they are in; **double-blind**: neither participants nor the staff who measure the outcome know. This prevents expectations (the placebo effect, observer bias) from influencing results.
- **Prospective**: groups are formed first and followed into the future. **Retrospective**: one looks back at past records.

### Observational studies

In an [observational study](https://en.wikipedia.org/wiki/Observational_study) nobody intervenes: units are classified by attributes they already have (smokers vs. non-smokers). The main problem is **confounding**: an unobserved factor may influence both the attribute and the outcome, so an association found does not prove causation.

### Surveys and polls

A survey asks a sample of people. Typical sources of error:

- **Selection bias** (distortion): the sample is not representative, for example a poll answered only by readers of one website.
- **Non-response bias**: people who do not answer differ systematically from those who do.
- Question wording and interviewer effects.

## Worked Example

*Does a new training programme raise productivity?*

- **Observational version:** compare employees who chose to attend with those who did not. Attendees may be more motivated to begin with, so a higher productivity cannot be credited to the programme alone.
- **Experimental version:** from 100 volunteers, randomly assign 50 to the programme and 50 to a waiting list; measure productivity of both groups afterwards. Randomization makes motivation equally likely in both groups, so the difference estimates the effect of the programme.

## Common Mistakes

- Concluding causation from an observational association ("coffee drinkers live longer, so coffee prolongs life").
- Believing a large sample repairs a biased sample. Ten thousand self-selected respondents are still self-selected.
- Mixing up *blind* (participants do not know) and *double-blind* (participants and evaluators do not know).

## When It's Used

How data were collected decides what you are allowed to conclude. A randomized controlled study (A/B test, clinical trial) supports causal claims; an observational study (sales records, registry data) only shows association because of unobserved confounders. Surveys are cheap but suffer from selection distortion and non-response bias.

**Exam tip:** be ready to name the study type (prospective/retrospective, randomized, blind, double-blind) and to explain *why* an observational result could be misleading.

## R Code

```r
set.seed(42)
participants <- data.frame(id = 1:20, age = sample(20:65, 20, replace = TRUE))

# Randomized controlled study: random assignment to treatment / control
participants$group <- sample(rep(c("treatment", "control"), each = 10))
table(participants$group)

# Simple random sample of 5 people for a survey
participants[sample(nrow(participants), 5), ]

# Stratified sample: 2 people from each age band (reduces selection distortion)
participants$band <- cut(participants$age, breaks = c(19, 35, 50, 65))
do.call(rbind, lapply(split(participants, participants$band),
                      function(d) d[sample(nrow(d), min(2, nrow(d))), ]))
```

## Python Code

```python
import numpy as np
import pandas as pd

rng = np.random.default_rng(42)
participants = pd.DataFrame({"id": range(1, 21), "age": rng.integers(20, 66, size=20)})

# Randomized controlled study: random assignment to treatment / control
participants["group"] = rng.permutation(["treatment"] * 10 + ["control"] * 10)
print(participants["group"].value_counts())

# Simple random sample of 5 people
print(participants.sample(n=5, random_state=1))

# Stratified sample: 2 per age band
participants["band"] = pd.cut(participants["age"], bins=[19, 35, 50, 65])
strat = (participants.groupby("band", observed=True, group_keys=False)
         .apply(lambda d: d.sample(n=min(2, len(d)), random_state=1)))
print(strat)
```

## Practice Questions

*✎ new question added for this site (worked solution below)*

- ✎ A hospital randomly assigns 200 patients to either a new drug or an identical-looking placebo. Neither the patients nor the doctors assessing recovery know who received which. Name the type of study.
- ✎ A website asks its readers "Do you support the new tax?" and 3,000 people respond, 70% of them with "yes". Give two reasons why 70% should not be reported as the opinion of the country.
- ✎ A study finds that people who own a dishwasher have fewer dental cavities. Is it sensible to conclude that dishwashers prevent cavities? Name a possible confounder.

## Solutions

*✎ solution written for this site*

- ✎ Q1: A prospective, randomized, controlled, double-blind study.
- ✎ Q2: Selection bias (only readers of that website, who chose to respond, are included; they differ from the population) and non-response bias (the vast majority of readers did not answer). Biased question wording may add to this.
- ✎ Q3: No. This is an observational association. Income or general health awareness is a plausible confounder: wealthier households are more likely to own a dishwasher and also to afford dental care.
