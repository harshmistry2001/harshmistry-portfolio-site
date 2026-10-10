# Multiple Regression Analysis: Estimation

> Course part: Stats 3

## Overview

These exercises practise **reading and using an estimated multiple regression**: interpret each coefficient as a partial effect, check that its sign makes sense given how the variable is defined, and predict the outcome for given values of the regressors. The examples are college GPA from high-school class rank and SAT score, and log wages from education and IQ.

## Topics to Review

- [Motivation for Multiple Regression](#/study/stats3/motivation-for-multiple-regression)
- [Mechanics and Interpretation of OLS (Multiple Regression)](#/study/stats3/mechanics-and-interpretation-of-ols-multiple-regression)
- [The Expected Value of the OLS Estimators](#/study/stats3/the-expected-value-of-the-ols-estimators)

## How to Approach the Questions

- **Signs:** check how a variable is *defined*. A high-school percentile near 1 means a *poor* rank, so a negative coefficient on it is expected.
- **Prediction:** substitute the given values into $\hat y=\hat\beta_0+\hat\beta_1x_1+\hat\beta_2x_2$.
- **Interpretation:** $\hat\beta_j$ is the change in $\hat y$ for one more unit of $x_j$, with the other regressors held fixed. In a log–level model multiply by 100 to get a percentage.

## When It's Used

These exercises practise interpreting and predicting with estimated multiple regressions: college GPA from high-school percentile and SAT score, and log wages from education and IQ. The key skill is reading each coefficient as a partial effect with the others held fixed, and checking that its sign makes sense given how the variable is defined.

**Exam tip (P 3.1):** $\widehat{colgpa} = 1.392 - 0.0135\,hsperc + 0.00148\,sat$; for $hsperc = 20$, $sat = 1050$: $1.392 - 0.27 + 1.554 = 2.676$. $hsperc$ is negative because a *higher* percentile means a *worse* class rank.

## R Code

```r
b <- c(const = 1.392, hsperc = -0.0135, sat = 0.00148)
sum(b * c(1, 20, 1050))                                   # predicted college GPA

# Effect of a 140-point SAT difference, other things equal
b["sat"] * 140

# C 3.3 with simulated data (course: data("wage2", package = "wooldridge"))
set.seed(29)
n <- 935
IQ <- rnorm(n, 101, 15)
educ <- round(pmin(18, pmax(9, 6 + 0.07 * IQ + rnorm(n, 0, 1.8))))
lwage <- 5.6 + 0.039 * educ + 0.0059 * IQ + rnorm(n, 0, 0.39)
coef(lm(lwage ~ educ + IQ))
```

## Python Code

```python
import numpy as np
import statsmodels.api as sm

b = np.array([1.392, -0.0135, 0.00148])
print("predicted colGPA:", b @ np.array([1, 20, 1050]))
print("effect of +140 SAT:", b[2] * 140)

rng = np.random.default_rng(29)
n = 935
IQ = rng.normal(101, 15, n)
educ = np.round(np.clip(6 + 0.07 * IQ + rng.normal(0, 1.8, n), 9, 18))
lwage = 5.6 + 0.039 * educ + 0.0059 * IQ + rng.normal(0, 0.39, n)
print(sm.OLS(lwage, sm.add_constant(np.column_stack([educ, IQ]))).fit().params)
```

## Practice Questions

*◆ original question from the course material · ✎ new question added for this site (worked solution below)*

- ◆ P 3.1 (practice sheet): Using the data in GPA2.DTA on 4,137 college students, the following equation was estimated by OLS: $\hat{colgpa}=1.392-0.0135~hsperc+0.00148~sat$ ($n=4,137$, $R^{2}=0.273$).
  - (i) Why does it make sense for the coefficient on hsperc to be negative?
  - (ii) What is the predicted college GPA when hsperc = 20 and sat = 1,050?
- ◆ C 3.3 (practice sheet):
  - (iii) Run the multiple regression of $\log(wage)$ on educ and IQ, and obtain the slope coefficients, $\hat{\beta}_{1}$ and $\hat{\beta}_{2}$, respectively.
- ✎ Using the GPA equation, predict the college GPA for $hsperc=50$ and $sat=1200$, and interpret the effect of 100 more SAT points.

## Solutions

*◆ original solution from the course material · ✎ solution written for this site*

- ◆ P 3.1 (i): hsperc is defined so that the larger it is, the worse the student's standing in high school. Everything else equal, the worse the student's standing in high school, the lower is his/her expected college GPA.
- ◆ C 3.3 (iii): The slope coefficient from $\log(wage)$ on educ and IQ are $\hat{\beta}_{1}=0.03912$ and $\hat{\beta}_{2}=0.00586$, respectively. (Output shows: $R^2 = 0.1297$, Root MSE = .39332).
- ✎ P 3.1 (ii): $\widehat{colgpa}=1.392-0.0135\cdot20+0.00148\cdot1050=1.392-0.27+1.554=2.676$. The $R^2=0.273$ means that high-school rank and SAT score explain about 27% of the variation in college GPA; much of the variation is due to other factors in $u$.
- ✎ C 3.3 (iii) interpretation: $\hat\beta_1=0.03912$ means that, holding IQ fixed, one more year of education is associated with about $3.9\%$ higher wages; $\hat\beta_2=0.00586$ means that, holding education fixed, one more IQ point is associated with about $0.59\%$ higher wages (15 IQ points: about $8.8\%$).
- ✎ Q3 (new question): $1.392-0.0135\cdot50+0.00148\cdot1200=1.392-0.675+1.776=2.493$. Holding $hsperc$ fixed, 100 more SAT points raise the predicted GPA by $100\cdot0.00148=0.148$.
