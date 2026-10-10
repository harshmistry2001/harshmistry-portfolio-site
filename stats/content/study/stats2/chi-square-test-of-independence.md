# $\chi^2$ test of independence

> Course part: Stats 2

## Overview

Are two categorical characteristics of the same people related? Is interest in cycling linked to age group? Does churn depend on contract type? The **$\chi^2$ test of independence** answers this using a single random sample in which each unit is classified twice (once per variable).

## Concept

### Setting

Draw one random sample $(X_1,Y_1),\dots,(X_n,Y_n)$ and classify each unit by two categorical variables, $X$ with $k$ categories and $Y$ with $m$ categories. The counts $n_{il}$ form a $k\times m$ contingency table.

$$H_0:\ P(X=i,\,Y=l)=P(X=i)\,P(Y=l)\ \text{ for all } i,l\quad(\text{$X$ and $Y$ are independent}).$$

### Statistic

The test statistic and the decision rule are exactly the same as for the homogeneity test:
$$X^2=\sum_{i=1}^k\sum_{l=1}^m\frac{\big(n_{il}-\frac{n_{i+}n_{+l}}{n}\big)^2}{\frac{n_{i+}n_{+l}}{n}}\approx\chi^2_{(k-1)(m-1)},$$
with the expected counts $\frac{n_{i+}n_{+l}}{n}$ (what independence would give, as in the descriptive notion of association). Reject $H_0$ if $X^2>\chi^2_{(k-1)(m-1),1-\alpha}$. All expected counts should be at least about 5.

**Difference from homogeneity:** the group sizes are *random* (only the total $n$ is fixed), and the hypothesis is about independence of two variables rather than equality of distributions across fixed groups. The arithmetic is identical.

**Caution:** a significant dependence does not imply causation; a hidden third variable may drive both characteristics.

## Worked Example

300 people classified by smoking and a disease:

| | Disease | No disease | Total |
|---|---|---|---|
| Smoker | 30 | 70 | 100 |
| Non-smoker | 20 | 180 | 200 |
| Total | 50 | 250 | 300 |

Expected counts: smoker/disease $\frac{100\cdot50}{300}=16.67$, smoker/no disease $83.33$, non-smoker/disease $33.33$, non-smoker/no disease $166.67$. Each deviation equals $\pm13.33$, so
$$X^2=177.8\Big(\tfrac1{16.67}+\tfrac1{83.33}+\tfrac1{33.33}+\tfrac1{166.67}\Big)=19.2 .$$
For a $2\times2$ table $df=1$ and $\chi^2_{1,0.95}=3.84$: reject $H_0$ ($p<0.001$). Smoking and the disease are dependent in this sample.

## Common Mistakes

- Concluding that one variable causes the other.
- Computing the test on percentages instead of counts.
- Ignoring small expected counts (use Fisher's exact test for small $2\times2$ tables).
- Stating the hypothesis as "the distributions are equal" when the design is a single random sample.

## When It's Used

The independence test checks whether two categorical variables measured on the *same* random sample are related: interest in cycling vs. age group, churn vs. contract type, smoking vs. disease. A significant result shows dependence, not causation — a hidden third variable may drive both.

**Exam tip:** same statistic and df as the homogeneity test; only the sampling design and the wording of $H_0$ differ ("$X$ and $Y$ are independent").

## R Code

```r
# Interest in cycling vs. age group for one random sample of 395 people
obs <- matrix(c(40, 55, 30,
                45, 50, 45,
                20, 40, 70),
              nrow = 3, byrow = TRUE,
              dimnames = list(interest = c("high", "medium", "low"),
                              age = c("<30", "30-50", ">50")))
sum(obs)

test <- chisq.test(obs, correct = FALSE)
test
round(test$expected, 1)
round(test$residuals, 2)          # Pearson residuals: which cells drive the result
```

## Python Code

```python
import numpy as np
import pandas as pd
from scipy import stats

obs = pd.DataFrame([[40, 55, 30], [45, 50, 45], [20, 40, 70]],
                   index=["high", "medium", "low"], columns=["<30", "30-50", ">50"])
print(obs.values.sum())
res = stats.chi2_contingency(obs, correction=False)
print(f"X2={res.statistic:.3f} df={res.dof} p={res.pvalue:.4g}")
print(pd.DataFrame(res.expected_freq, index=obs.index, columns=obs.columns).round(1))
print(((obs - res.expected_freq) / np.sqrt(res.expected_freq)).round(2))
```

## Practice Questions

*✎ new question added for this site (worked solution below)*

- ✎ In a random sample of 200 customers, 80 are under 40 years old; 50 of these under-40s and 40 of the 120 older customers use the mobile app. Test at $\alpha=0.05$ whether app use and age group are independent.
- ✎ Why do we not conclude from a significant result that age *causes* app use?

## Solutions

*✎ solution written for this site*

- ✎ Q1: Table: under 40: app 50, no app 30; 40 and over: app 40, no app 80. Totals: app 90, no app 110, $n=200$. Expected under independence: under 40/app $80\cdot\frac{90}{200}=36$, under 40/no app 44; 40+/app $54$, 40+/no app $66$. $X^2=\frac{14^2}{36}+\frac{14^2}{44}+\frac{14^2}{54}+\frac{14^2}{66}=5.44+4.45+3.63+2.97=16.5$. $df=1$, critical value $3.84$: reject $H_0$ ($p<0.001$): app use depends on age group.
- ✎ Q2: The test only detects association. Other variables (for example job type or income) could influence both age group membership patterns and app use, or the relationship could run the other way; the observational design cannot separate these explanations.
