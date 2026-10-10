# Types of Variables and Scales

> Course part: Stats 1

## Overview

Before you can summarise or test anything, you have to know what kind of thing each variable is. A **variable** is a characteristic recorded for every unit in your data (a person, a product, a day). The *type* of the variable decides which calculations are meaningful: you can average heights, but averaging "favourite colour" makes no sense. This page is the vocabulary that every later topic builds on.

## Concept

### Scales of measurement

The classic classification, due to S. S. Stevens, is the [level of measurement](https://en.wikipedia.org/wiki/Level_of_measurement). Each level adds one capability to the previous one:

| Scale | What you can do | Example | Meaningful operations |
|---|---|---|---|
| **Nominal** | Tell categories apart | colour, religion, city | $=,\ \neq$ |
| **Ordinal** | Also put them in order | school grades, rankings, "satisfied / neutral / unhappy" | adds $<,\ >$ |
| **Interval** | Also measure *distances* | temperature in °C, calendar year | adds $+,\ -$ |
| **Ratio** | Also form *ratios* (there is a natural zero) | net rent, loan amount, weight, time | adds $\times,\ \div$ |

- **Nominal** values are only names. They have no order, so only counting and the mode make sense.
- **Ordinal** values can be ranked, but the gaps between ranks are not defined: the difference between grade 1 and 2 need not equal the difference between grade 4 and 5.
- **Interval** variables have equal, interpretable gaps but no true zero: 0 °C does not mean "no temperature", so 40 °C is *not* "twice as hot" as 20 °C.
- **Ratio** variables have a meaningful zero ("none of it"), so "twice as much" is a valid statement.

The first two scales together are called **categorical** (qualitative); interval and ratio are **metric** (quantitative).

### Discrete versus continuous

A second, independent classification looks at the set of possible values:

- **Discrete** variables take isolated values that can be counted (number of children, number of defects).
- **Continuous** variables can take any value in an interval (weight, height, waiting time), limited in practice only by how precisely we measure. See [continuous vs discrete variables](https://en.wikipedia.org/wiki/Continuous_or_discrete_variable).

The two classifications combine: "number of children" is discrete *and* ratio-scaled; "temperature in °C" is continuous *and* interval-scaled.

### A quick decision rule

Ask two questions, in this order:

1. *Is there an order?* If not, the variable is nominal.
2. *Is there a natural zero, so that ratios make sense?* If not, it is ordinal (when only the order matters) or interval (when distances matter); if yes, it is ratio.

## Worked Example

A shop records five facts about each customer visit:

| Variable | Example value | Scale | Discrete/continuous |
|---|---|---|---|
| City of residence | "Vienna" | nominal | discrete |
| Satisfaction (1 = very bad … 5 = very good) | 4 | ordinal | discrete |
| Shop temperature (°C) | 21.5 | interval | continuous |
| Amount spent (EUR) | 37.80 | ratio | continuous (in practice discrete to the cent) |
| Number of items bought | 3 | ratio | discrete |

A mean amount spent is meaningful (ratio). A mean *satisfaction* is commonly reported but is strictly justified only if you accept that the steps between ratings are equal; the median is the safer summary for an ordinal variable.

## Common Mistakes

- **Treating codes as numbers.** A variable coded 1 = "red", 2 = "green", 3 = "blue" is nominal; its mean is meaningless.
- **Saying "40 °C is twice as hot as 20 °C".** Ratios need a natural zero; Celsius and Fahrenheit have arbitrary zeros. Kelvin has a true zero and is ratio-scaled.
- **Confusing discrete with ordinal.** "Number of children" is discrete and ratio; "grade" is discrete *and* ordinal. Discreteness says nothing about the scale.

## When It's Used

Every analysis starts by fixing the scale of each variable, because the scale decides which summaries and tests are allowed: a mean needs at least interval data, a ratio ("twice as much") needs a natural zero. In practice this is the first step of cleaning a survey or a database export: customer satisfaction ratings are ordinal, temperatures are interval, revenue and waiting times are ratio-scaled.

**Exam tip:** you will be asked to classify variables and to say which operations ($=, <, +, -, \times, \div$) make sense. Ask two questions: *is there an order?* and *is there a natural zero?*

## R Code

```r
survey <- data.frame(
  flavour  = factor(c("vanilla", "chocolate", "mint", "vanilla")),            # nominal
  rating   = factor(c("good", "bad", "excellent", "fairly good"),
                    levels = c("bad", "fairly bad", "fairly good", "good", "excellent"),
                    ordered = TRUE),                                            # ordinal
  temp_c   = c(18.5, 21.0, 19.2, 23.4),                                         # interval
  rent_eur = c(650, 820, 710, 900),                                             # ratio
  children = c(0L, 2L, 1L, 3L)                                                  # discrete ratio
)
str(survey)

# Ordinal: order comparisons are meaningful, arithmetic is not
survey$rating >= "good"
max(survey$rating)

# Interval: differences are meaningful (20 C is not "twice as warm" as 10 C)
diff(survey$temp_c)

# Ratio: quotients are meaningful because 0 EUR means "no rent"
survey$rent_eur[4] / survey$rent_eur[1]
```

## Python Code

```python
import pandas as pd

levels = ["bad", "fairly bad", "fairly good", "good", "excellent"]
survey = pd.DataFrame({
    "flavour": pd.Categorical(["vanilla", "chocolate", "mint", "vanilla"]),       # nominal
    "rating": pd.Categorical(["good", "bad", "excellent", "fairly good"],
                             categories=levels, ordered=True),                    # ordinal
    "temp_c": [18.5, 21.0, 19.2, 23.4],                                           # interval
    "rent_eur": [650, 820, 710, 900],                                             # ratio
    "children": [0, 2, 1, 3],                                                     # discrete ratio
})
print(survey.dtypes)

# Ordinal: comparisons work on an ordered categorical
print(survey["rating"] >= "good")
print(survey["rating"].max())

# Interval: differences only
print(survey["temp_c"].diff())

# Ratio: quotients are meaningful
print(survey["rent_eur"].iloc[3] / survey["rent_eur"].iloc[0])
```

## Practice Questions

*✎ new question added for this site (worked solution below)*

- ✎ Classify each variable by scale (nominal, ordinal, interval, ratio) and as discrete or continuous: (a) blood type, (b) height in cm, (c) finishing position in a race, (d) temperature in Kelvin, (e) number of e-mails received per day, (f) year of birth.
- ✎ A news article says "yesterday's 30 °C was twice as warm as the 15 °C last week". Is this statement meaningful? Explain.
- ✎ For which of the variables in the first question is the arithmetic mean a meaningful summary?

## Solutions

*✎ solution written for this site*

- ✎ Q1: (a) nominal, discrete; (b) ratio, continuous; (c) ordinal, discrete (we know who was faster, not by how much); (d) ratio, continuous (Kelvin has an absolute zero); (e) ratio, discrete; (f) interval, discrete (differences between years are meaningful, but year 0 is not "no time", and 2000 is not "twice" 1000).
- ✎ Q2: No. Celsius is an interval scale, so only differences are meaningful. In Kelvin the temperatures are 303.15 K and 288.15 K, a ratio of only about 1.05.
- ✎ Q3: The mean is meaningful for (b), (d), (e) (ratio) and, with care, for (f) (interval). It is not meaningful for (a) (nominal) or (c) (ordinal).
