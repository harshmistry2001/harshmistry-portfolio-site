# Multiple Regression Analysis: Inference

> Course part: Stats 3

## Overview

These exercises practise the language of statistical inference in regression: stating hypotheses in terms of model parameters, carrying out one-sided t-tests, and reading joint F tests from software output (for example whether income and poverty jointly affect house values).

## Topics to Review

- [Hypothesis Testing: The t Test](#/study/stats3/hypothesis-testing-the-t-test)
- [Confidence Intervals](#/study/stats3/confidence-intervals)
- [Testing Multiple Linear Restrictions: The F Test](#/study/stats3/testing-multiple-linear-restrictions-the-f-test)

## How to Approach the Questions

1. **Translate the words into parameters.** "$x$ has no effect after controlling for the other variables" is $H_0:\beta_x=0$. "Better performance *increases* salary" is a one-sided alternative $H_1:\beta_x>0$.
2. **Choose the test:** one coefficient means a t test; a group of coefficients means an F test.
3. **Read the output:** the F statistic and its p-value ("Prob > F") are printed directly. Compare $p$ with the significance level.

## When It's Used

These exercises practise stating hypotheses in terms of parameters, carrying out one-sided t-tests, and reading joint F-tests from software output (e.g. whether income and poverty jointly affect house values).

**Exam tip (P 4.1):** "$ros$ has no effect" is $H_0: \beta_3 = 0$; "better stock performance increases salary" is $H_1: \beta_3 > 0$. For C 4.1: $F(2, 396) = 3.52$ gives $p \approx 0.030$ (Stata prints 0.0304 from the unrounded F), so the two variables are jointly significant at 5% but not at 1%.

## R Code

```r
# C 4.1: p-value of the reported F statistic
pf(3.52, df1 = 2, df2 = 396, lower.tail = FALSE)
qf(c(0.95, 0.99), 2, 396)                      # critical values at 5% and 1%

# P 4.1 with simulated data (course: data("ceosal1", package = "wooldridge"))
set.seed(30)
n <- 209
sales <- rlnorm(n, 8, 1); roe <- runif(n, 0, 50); ros <- rnorm(n, 60, 100)
lsalary <- 4.3 + 0.28 * log(sales) + 0.017 * roe + 0.0002 * ros + rnorm(n, 0, 0.5)
fit <- lm(lsalary ~ log(sales) + roe + ros)
t_ros <- coef(summary(fit))["ros", "t value"]
c(t = t_ros, crit_10pct = qt(0.90, fit$df.residual), p_one_sided = pt(t_ros, fit$df.residual, lower.tail = FALSE))
```

## Python Code

```python
import numpy as np
from scipy import stats
import statsmodels.api as sm

print("p-value F(2,396)=3.52:", stats.f.sf(3.52, 2, 396))
print("critical values 5%, 1%:", stats.f.ppf([0.95, 0.99], 2, 396))

rng = np.random.default_rng(30)
n = 209
sales, roe, ros = rng.lognormal(8, 1, n), rng.uniform(0, 50, n), rng.normal(60, 100, n)
lsalary = 4.3 + 0.28 * np.log(sales) + 0.017 * roe + 0.0002 * ros + rng.normal(0, 0.5, n)
fit = sm.OLS(lsalary, sm.add_constant(np.column_stack([np.log(sales), roe, ros]))).fit()
t = fit.tvalues[3]
print("t(ros) =", t, " crit 10% =", stats.t.ppf(0.90, fit.df_resid), " p =", stats.t.sf(t, fit.df_resid))
```

## Practice Questions

*◆ original question from the course material · ✎ new question added for this site (worked solution below)*

- ◆ P 4.1 (practice sheet): Consider an equation to explain salaries of CEOs in terms of annual firm sales, return on equity (roe), and return on the firm's stock (ros): $\log(salary)=\beta_{0}+\beta_{1}\log(sales)+\beta_{2}roe+\beta_{3}ros+u$.
  - (i) In terms of the model parameters, state the null hypothesis that, after controlling for sales and roe, ros has no effect on CEO salary. State the alternative that better stock market performance increases a CEO's salary.
- ◆ C 4.1 (practice sheet) [Implicit in output]: Test the joint significance of lincome and prppov on lhseval.
- ✎ In the CEO equation of P 4.1 an estimation with $n=209$ gives $\hat\beta_3=0.00024$ with standard error $0.00054$. Test $H_0:\beta_3=0$ against $H_1:\beta_3>0$ at the 5% level ($t_{205,0.95}=1.65$).

## Solutions

*◆ original solution from the course material · ✎ solution written for this site*

- ◆ P 4.1 (i): $H_{0}:\beta_{3}=0$. $H_{1}:\beta_{3}>0$.
- ◆ C 4.1: (From Stata output snippet) test lincome prppov. F(2, 396) = 3.52. Prob > F = 0.0304.
- ✎ C 4.1 interpretation: $F(2,396)=3.52$ with $p=0.0304$. The critical values for $F_{2,396}$ are $3.02$ (5%) and $4.66$ (1%). Since $3.02<3.52<4.66$, we reject at 5% but not at 1%: income and poverty rate are jointly significant for house values at the 5% level.
- ✎ Q3 (new question): $t=0.00024/0.00054=0.44<1.65$ ($p\approx0.33$): do not reject $H_0$. After controlling for sales and roe there is no statistical evidence that stock market performance affects CEO salary.
