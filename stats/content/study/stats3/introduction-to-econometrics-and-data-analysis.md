# Introduction to Econometrics and Data Analysis

> Course part: Stats 3

## Overview

The first computer exercise is about **getting to know a dataset**: computing averages, minima, maxima, comparing groups and converting money amounts from different years into comparable units. This is the step every applied project starts with, before any model is estimated.

## Concept

### Descriptive exploration

For each variable look at its mean, minimum, maximum and standard deviation. Check for implausible values (a negative wage, 40 years of schooling) and whether the magnitudes make sense (is an hourly wage of 5.90 dollars plausible for 1976?).

### Comparing groups

To judge the effect of a program (for example job training), compare group averages: the mean outcome of the treated versus the untreated. For binary (0/1) variables the average equals the **fraction** of ones, e.g. the share of unemployed men. Remember that in non-experimental data such differences do not prove a causal effect.

### Percentage differences

$$\text{percentage difference}=\frac{\text{New}-\text{Old}}{\text{Old}}\times100 .$$

### Nominal and real values

Money amounts from different years cannot be compared directly because prices change. The [consumer price index](https://en.wikipedia.org/wiki/Consumer_price_index) (CPI) converts amounts to the prices of a common year:
$$\text{real value}=\text{nominal value}\times\frac{CPI_{\text{target year}}}{CPI_{\text{base year}}}.$$
The course uses the CPI (1982–84 = 100) with value 56.9 for 1976 and 184.0 for 2003.

## Worked Example

The average hourly wage in the WAGE1 data (reported in 1976 dollars) is about 5.90 dollars. In 2003 prices:
$$5.90\times\frac{184.0}{56.9}=5.90\times3.234\approx19.08\ \text{dollars}.$$
Prices rose by $\frac{184.0-56.9}{56.9}\times100\approx223\%$ between 1976 and 2003. This is why a wage of 5.90 dollars looks low to a reader used to current prices, even though it was an ordinary wage in 1976.

## Common Mistakes

- Comparing nominal amounts from different years.
- Mixing up the direction of the CPI ratio: multiply by *target-year CPI divided by base-year CPI*.
- Computing a percentage change relative to the wrong base (always divide by the *old* value).
- Taking a difference of 40% in earnings between trainees and non-trainees as the effect of the program.

## When It's Used

The first computer exercise is basic data exploration — the step every applied project starts with: averages, minima and maxima, group comparisons, and converting nominal dollars into real dollars with a price index so that wages from different years are comparable.

**Exam tip:** real value $= \text{nominal} \times \frac{CPI_{\text{target year}}}{CPI_{\text{base year}}}$. The CPI values (1982-84 = 100) used below are 56.9 for 1976 and 184.0 for 2003.

## R Code

```r
# Course data: data("wage1", package = "wooldridge"); data("jtrain2", package = "wooldridge")
set.seed(27)
wage1 <- data.frame(educ = pmin(18, pmax(0, round(rnorm(526, 12.6, 2.8)))))
wage1$wage <- round(exp(0.6 + 0.08 * wage1$educ + rnorm(526, 0, 0.45)), 2)

c(mean_educ = mean(wage1$educ), min = min(wage1$educ), max = max(wage1$educ))
mean(wage1$wage)                                    # 1976 dollars

cpi_1976 <- 56.9; cpi_2003 <- 184.0
mean(wage1$wage) * cpi_2003 / cpi_1976              # in 2003 dollars

# Job training: share unemployed by group (C 1.3)
jtrain <- data.frame(train = rbinom(445, 1, 0.42))
jtrain$unem78 <- rbinom(445, 1, ifelse(jtrain$train == 1, 0.24, 0.35))
tapply(jtrain$unem78, jtrain$train, mean)
```

## Python Code

```python
# Course data: import wooldridge; wage1 = wooldridge.data("wage1")
import numpy as np
import pandas as pd

rng = np.random.default_rng(27)
wage1 = pd.DataFrame({"educ": np.clip(np.round(rng.normal(12.6, 2.8, 526)), 0, 18)})
wage1["wage"] = np.exp(0.6 + 0.08 * wage1.educ + rng.normal(0, 0.45, 526)).round(2)

print(wage1.educ.agg(["mean", "min", "max"]))
cpi_1976, cpi_2003 = 56.9, 184.0
print("mean wage 1976 $:", wage1.wage.mean(), " in 2003 $:", wage1.wage.mean() * cpi_2003 / cpi_1976)

jtrain = pd.DataFrame({"train": rng.binomial(1, 0.42, 445)})
jtrain["unem78"] = rng.binomial(1, np.where(jtrain.train == 1, 0.24, 0.35))
print(jtrain.groupby("train")["unem78"].mean())
```

## Practice Questions

*◆ original question from the course material · ✎ new question added for this site (worked solution below)*

- ◆ C 1.1 (practice sheet): Use the data in WAGE1.DTA for this exercise.
  - (i) Find the average education level in the sample. What are the lowest and highest years of education?
  - (ii) Find the hourly wage in the sample. Does it seem high or low?
  - (iii) The wage data are reported in 1976 dollars. Using the Economic Report of the President, obtain and report the CPI for the years 1976 and 2003.
- ◆ C 1.3 (practice sheet):
  - (iii) The variable unem78 is an indicator of whether a man is unemployed or not in 1978. What fraction of the men who received job training are unemployed? What fraction of the men who did not receive job training are unemployed? Comment on the difference.
- ✎ A worker earned 12 dollars per hour in 1976. Express this in 2003 dollars (CPI 56.9 in 1976, 184.0 in 2003).
- ✎ In a sample 24.3% of trained men and 35.4% of untrained men are unemployed. Compute the difference in percentage points and the relative difference in percent.

## Solutions

*◆ original solution from the course material · ✎ solution written for this site*

- ◆ C 1.1 (i): The average of educ is about 12.6 years. The lowest value is zero years of education and the highest is 18 years of education.
- ◆ C 1.1 (ii): The average of wage is about \$5.90, which seems low.
- ◆ C 1.3 (iii): About 24.3% of the men who received training were unemployed in 1978; the figure is 35.4% for men not receiving training. This is a big difference. (Also noting from an earlier part: On average, men receiving the job training had earnings about 40% higher than those not receiving training).
- ✎ C 1.1 (iii): CPI (1982–84 = 100): 56.9 in 1976 and 184.0 in 2003, so prices in 2003 were about $184.0/56.9\approx3.23$ times as high as in 1976.
- ✎ Q3: $12\times\frac{184.0}{56.9}\approx38.80$ dollars in 2003 prices.
- ✎ Q4: The difference is $24.3-35.4=-11.1$ percentage points. Relative to the untrained group: $\frac{24.3-35.4}{35.4}\times100\approx-31.4\%$, so trained men are about 31% less likely to be unemployed. This is an association; without random assignment it does not prove that training caused the difference.
