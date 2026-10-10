# Multiple Regression Analysis: Further Issues

> Course part: Stats 3

## Overview

These exercises practise two skills from the "further issues" topic: how rescaling variables changes the coefficients of a **quadratic** model (R&D intensity and sales, in dollars versus billions of dollars), and how to find the **optimal level** (turning point) of a quadratic relationship (the high-school class size that maximises SAT scores).

## Topics to Review

- [Effects of Data Scaling on OLS Statistics](#/study/stats3/effects-of-data-scaling-on-ols-statistics)
- [More on Functional Form](#/study/stats3/more-on-functional-form)

## How to Approach the Questions

- **Rescaling inside a quadratic:** if $salesbil=sales/1000$ then $sales=1000\,salesbil$ and $sales^2=10^6\,salesbil^2$. Hence the coefficient on $salesbil$ is $1000\hat\beta_1$ and on $salesbil^2$ is $10^6\hat\beta_2$. The intercept, $R^2$ and t statistics do not change; standard errors scale with their coefficients.
- **Turning point:** for $y=\beta_0+\beta_1x+\beta_2x^2$ with $\beta_1>0>\beta_2$ the maximum is at $x^*=\beta_1/(2|\beta_2|)$. Check the units of $x$!

## When It's Used

These exercises practise rescaling variables inside a quadratic model and finding the optimum of a quadratic relationship — e.g. the sales level at which R&D intensity peaks or the high-school size that maximises SAT scores.

**Exam tip (P 6.1):** with $salesbil = sales/1000$, the coefficient on $salesbil$ is $1000 \times 0.00030 = 0.30$ and on $salesbil^2$ is $10^6 \times (-0.0000000070) = -0.0070$; intercept, $R^2$ and t-statistics are unchanged. (C 6.2) turning point $= 0.0196 / (2 \cdot 0.00209) \approx 4.69$ hundred students.

## R Code

```r
# P 6.1: rescaling sales (million $) to salesbil (billion $)
b <- c(const = 2.613, sales = 0.00030, sales2 = -0.0000000070)
c(const = b[["const"]], salesbil = b[["sales"]] * 1000, salesbil2 = b[["sales2"]] * 1000^2)

# Turning point of the quadratic (in sales, then in billions)
tp <- b[["sales"]] / (2 * abs(b[["sales2"]]))
c(sales = tp, salesbil = tp / 1000)

# C 6.2(iv): optimal high-school size from log(sat) = 6.896 + 0.0196 hsize - 0.00209 hsize^2
0.0196 / (2 * 0.00209)                              # in hundreds of students

# Verify the rescaling rule on simulated data
set.seed(32)
sales <- runif(32, 50, 40000)
rdintens <- 2.6 + 0.0003 * sales - 7e-9 * sales^2 + rnorm(32, 0, 1.5)
salesbil <- sales / 1000
rbind(coef(lm(rdintens ~ sales + I(sales^2))) * c(1, 1000, 1e6),
      coef(lm(rdintens ~ salesbil + I(salesbil^2))))
```

## Python Code

```python
import numpy as np
import statsmodels.api as sm

b_const, b_sales, b_sales2 = 2.613, 0.00030, -0.0000000070
print("rescaled:", b_const, b_sales * 1000, b_sales2 * 1000**2)
tp = b_sales / (2 * abs(b_sales2))
print("turning point: sales =", tp, " salesbil =", tp / 1000)
print("optimal hsize (hundreds):", 0.0196 / (2 * 0.00209))

rng = np.random.default_rng(32)
sales = rng.uniform(50, 40000, 32)
rd = 2.6 + 0.0003 * sales - 7e-9 * sales**2 + rng.normal(0, 1.5, 32)
m1 = sm.OLS(rd, sm.add_constant(np.column_stack([sales, sales**2]))).fit()
sb = sales / 1000
m2 = sm.OLS(rd, sm.add_constant(np.column_stack([sb, sb**2]))).fit()
print(m1.params * np.array([1, 1000, 1e6]), m2.params)
print("R2 equal:", np.isclose(m1.rsquared, m2.rsquared))
```

## Practice Questions

*◆ original question from the course material · ✎ new question added for this site (worked solution below)*

- ◆ P 6.1 (practice sheet): Using the data in RDCHEM.DTA, the following equation was obtained by OLS: $rdintens = 2.613 + 0.00030~sales - 0.0000000070~sales^2$.
  - (i) Define salesbil as sales measured in billions of dollars: salesbil = sales/1,000. Rewrite the estimated equation with salesbil and salesbil² as the independent variables. Be sure to report standard errors and the R-squared.
- ◆ C 6.2 (practice sheet):
  - (iv) Find the estimated optimal high school class size, using $\log(sat)$ as the dependent variable. Is it much different from what you obtained in part (ii)?
- ✎ For $\widehat{y}=10+3x-0.15x^2$ with $x$ in tens of units, find the value of $x$ that maximises $\hat y$ and express it in units.

## Solutions

*◆ original solution from the course material · ✎ solution written for this site*

- ◆ C 6.2 (iv): With $\log(sat)$ as the dependent variable, we get: $\log(sat)=6.896+0.0196~hsize-0.00209~hsize^{2}$ ($n=4,137$, $R^{2}=0.0078$). The optimal class size is now estimated as about 469 ($0.0196/(2\cdot0.00209)\approx4.69$ [measured in hundreds]), which is very close to what we obtained with the level-level model.
- ✎ P 6.1 (i): $\widehat{rdintens}=2.613+0.30\,salesbil-0.0070\,salesbil^2$. The intercept and $R^2$ are unchanged. The standard errors of the two slopes are rescaled in the same way as the coefficients (multiplied by $1000$ and $10^6$ respectively), so the t statistics are unchanged. The turning point of the quadratic is now at $salesbil^*=0.30/(2\cdot0.0070)\approx21.4$ billion dollars, the same sales level as in the original units ($21{,}400$ million).
- ✎ C 6.2 (iv) comment: the log-level model's optimum, 469 students, is similar to the level–level one, so the conclusion is not sensitive to the functional form. (Note the very low $R^2=0.0078$: class size explains little of the variation in SAT scores; the turning point should be treated with caution.)
- ✎ Q3 (new question): $x^*=3/(2\cdot0.15)=10$ tens $=100$ units. The maximal value is $\hat y(10)=10+30-15=25$.
