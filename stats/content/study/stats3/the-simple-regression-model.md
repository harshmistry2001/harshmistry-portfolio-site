# The Simple Regression Model

> Course part: Stats 3

## Overview

This is the first exercise set on the simple regression model. It practises the full workflow: say what is hidden in the error term, judge whether a ceteris paribus effect can be identified, predict from an estimated equation, and interpret level–level, log–level and log–log models (fertility and education, birth weight and smoking, CEO salary and tenure, wages and IQ).

## Topics to Review

- [Definition of the Simple Regression Model](#/study/stats3/definition-of-the-simple-regression-model)
- [Deriving the Ordinary Least Squares Estimates](#/study/stats3/deriving-the-ordinary-least-squares-estimates)
- [Units of Measurement and Functional Form](#/study/stats3/units-of-measurement-and-functional-form)

## How to Approach the Questions

- **Error term questions:** list the factors that are *not* in the model but affect $y$ (the content of $u$), and for each ask whether it is related to $x$. If so, $E(u\mid x)\ne0$ and the simple regression does not give a ceteris paribus effect.
- **Prediction:** plug the value of $x$ into the estimated equation.
- **Log models:** log–level: $100\hat\beta_1$ = % change in $y$ per unit of $x$; level–level: $\hat\beta_1$ = unit change in $y$.
- **Intercept shift:** if $E(u)=\alpha_0\neq0$ define $\tilde u=u-\alpha_0$ and $\tilde\beta_0=\beta_0+\alpha_0$.

## When It's Used

These exercises practise the simple regression workflow end to end: what is in the error term, whether the ceteris paribus effect is identified, predicting from an estimated equation and interpreting level-level vs. log-level models (fertility and education, birth weight and smoking, CEO salary and tenure, wages and IQ).

**Exam tip (P 2.3):** $\widehat{bwght} = 119.77 - 0.514\,cigs$: at $cigs = 0$ predict 119.77 oz, at $cigs = 20$ predict $119.77 - 0.514 \cdot 20 = 109.49$ oz. In a log-level model, $100\hat\beta_1$ is the % change per unit of $x$.

## R Code

```r
# P 2.3: predictions from the estimated equation
b0 <- 119.77; b1 <- -0.514
b0 + b1 * c(cigs0 = 0, cigs20 = 20)

# C 2.2 / C 2.3 with simulated data (course: data("ceosal2"), data("wage2") from wooldridge)
set.seed(28)
ceoten <- rpois(177, 8)
salary <- round(exp(6.5 + 0.01 * ceoten + rnorm(177, 0, 0.7)))
c(mean_salary = mean(salary), mean_tenure = mean(ceoten),
  first_year = sum(ceoten == 0), longest = max(ceoten))
m <- lm(log(salary) ~ ceoten)
100 * coef(m)["ceoten"]                     # predicted % increase per extra year as CEO

IQ <- round(rnorm(935, 101, 15))
wage <- exp(5.9 + 0.0088 * IQ + rnorm(935, 0, 0.39))
coef(lm(wage ~ IQ))["IQ"] * 15              # level-level: $ change for +15 IQ points
100 * coef(lm(log(wage) ~ IQ))["IQ"]        # log-level: % change per IQ point
```

## Python Code

```python
import numpy as np
import statsmodels.api as sm

b0, b1 = 119.77, -0.514
print("predicted bwght:", b0 + b1 * np.array([0, 20]))

rng = np.random.default_rng(28)
ceoten = rng.poisson(8, 177)
salary = np.round(np.exp(6.5 + 0.01 * ceoten + rng.normal(0, 0.7, 177)))
print(salary.mean(), ceoten.mean(), (ceoten == 0).sum(), ceoten.max())
m = sm.OLS(np.log(salary), sm.add_constant(ceoten)).fit()
print("% per year:", 100 * m.params[1])

IQ = np.round(rng.normal(101, 15, 935))
wage = np.exp(5.9 + 0.0088 * IQ + rng.normal(0, 0.39, 935))
print("level: +15 IQ ->", sm.OLS(wage, sm.add_constant(IQ)).fit().params[1] * 15, "$")
print("log: % per point ->", 100 * sm.OLS(np.log(wage), sm.add_constant(IQ)).fit().params[1])
```

## Practice Questions

*◆ original question from the course material*

- ◆ P 2.1 (practice sheet): Let kids denote the number of children ever born to a woman, and let educ denote years of education for the woman. A simple model relating fertility to years of education is $kids = \beta_0 + \beta_1 educ + u$.
  - (i) What kinds of factors are contained in u? Are these likely to be correlated with level of education?
  - (ii) Will a simple regression analysis uncover the ceteris paribus effect of education on fertility? Explain.
- ◆ P 2.2 (practice sheet): In the simple linear regression model $y=\beta_{0}+\beta_{1}x+u$ suppose that $E(u)\ne0$. Letting $\alpha_{0}=E(u)$, show that the model can always be rewritten with the same slope, but a new intercept and error, where the new error has a zero expected value.
- ◆ P 2.3 (practice sheet): The data set BWGHT.DTA contains data on births to women in the United States... The following simple regression was estimated: $\hat{bwght}=119.77-0.514~cigs$.
  - (i) What is the predicted birth weight when $cigs=0$? What about when $cigs=20$?
- ◆ C 2.2 (practice sheet): The data set in CEOSAL2.DTA contains information on chief executive officers...
  - (i) Find the average salary and the average tenure in the sample.
  - (ii) How many CEOs are in their first year as CEO? What is the longest tenure?
  - (iii) Estimate the simple regression model $\log(salary)=\beta_{0}+\beta_{1}ceoten+u$, and report your results. What is the predicted percentage increase in salary given one more year as a CEO?
- ◆ C 2.3 (practice sheet): Use the data in WAGE2.DTA to estimate a simple regression explaining monthly salary (wage) in terms of IQ score (IQ).
  - (i) Find the average salary and average IQ.
  - (ii) Estimate a simple regression model where a one-point increase in IQ changes wage by a constant dollar amount.
  - (iii) Now estimate a model where each one-point increase in IQ has the same percentage effect on wage.

## Solutions

*✎ solution written for this site*

*The computer exercises (C 2.2, C 2.3) use data sets (CEOSAL2, WAGE2) that are not part of this site; the quoted numbers are the approximate textbook results for these data, which the code on this page reproduces with simulated data of the same structure.*

- ✎ P 2.1: (i) $u$ contains income, religion, age at marriage, family background, access to birth control, urban/rural residence, and so on. Many of these are likely correlated with education (higher income and later marriage go with more schooling). (ii) No. Because $u$ is correlated with $educ$, the zero conditional mean assumption fails and the simple regression slope mixes the effect of education with the effects of these other factors; it does not uncover the ceteris paribus effect of education on fertility.
- ✎ P 2.2: Put $\alpha_0=E(u)$ and $\tilde u=u-\alpha_0$. Then $E(\tilde u)=0$ and $y=\beta_0+\beta_1x+u=(\beta_0+\alpha_0)+\beta_1x+\tilde u$: the slope $\beta_1$ is unchanged, the intercept becomes $\tilde\beta_0=\beta_0+\alpha_0$.
- ✎ P 2.3: (i) $cigs=0$: $119.77$ ounces. $cigs=20$: $119.77-0.514\cdot20=109.49$ ounces, about 10.3 ounces (8.6%) lower. Since the simple regression does not control for other factors (income, nutrition, health care), this difference should not be read as a pure causal effect of smoking.
- ✎ C 2.2: (i) In the CEOSAL2 data the average salary is about 865.9 (thousand dollars) and the average tenure about 7.95 years. (ii) Five CEOs are in their first year (ceoten = 0); the longest tenure is 37 years. (iii) The estimated equation $\widehat{\log(salary)}\approx6.51+0.0097\,ceoten$ means that one more year as CEO is associated with a predicted salary increase of about $0.97\%$.
- ✎ C 2.3: (i) In WAGE2 the average monthly wage is about 957.9 dollars and the average IQ about 101.3. (ii) Level–level: $\widehat{wage}\approx116.99+8.30\,IQ$: one more IQ point is associated with about 8.30 dollars more per month (15 points: about 124.5 dollars). (iii) Log–level: $\widehat{\log(wage)}\approx5.887+0.0088\,IQ$: each IQ point is associated with about 0.88% higher wage (15 points: about 13%).
