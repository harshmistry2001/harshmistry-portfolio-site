# Units of Measurement and Functional Form

> Course part: Stats 3

## Overview

Two practical questions come up in every regression: *In which units are the variables measured?* and *Should the variables enter as levels or as logarithms?* The units change the numbers (not the substance), while the choice of logs changes the **interpretation** of the coefficient from "units" to "percent".

## Concept

### Changing units

Rescaling variables changes the OLS estimates in a completely predictable way and **never changes $R^2$** or the significance of the results:

- If $y$ is multiplied by $c$ ($y^*=cy$), both $\hat\beta_0$ and $\hat\beta_1$ are multiplied by $c$.
- If $x$ is multiplied by $c$ ($x^*=cx$), the slope is divided by $c$: $\hat\beta_1^*=\hat\beta_1/c$ (the intercept is unchanged).

Example: measuring salary in thousands instead of dollars divides both coefficients by 1000.

### Nonlinear relationships through logarithms

The model must be linear in the *parameters*, not in the variables. Redefining variables with the natural logarithm gives useful nonlinear relationships:

| Model | Equation | Interpretation of $\beta_1$ |
|---|---|---|
| level–level | $y=\beta_0+\beta_1x+u$ | $\Delta y=\beta_1\Delta x$ |
| log–level | $\ln y=\beta_0+\beta_1x+u$ | $\%\Delta y\approx100\,\beta_1\Delta x$ (**semi-elasticity**) |
| log–log | $\ln y=\beta_0+\beta_1\ln x+u$ | $\%\Delta y\approx\beta_1\%\Delta x$ (**elasticity**) |
| level–log | $y=\beta_0+\beta_1\ln x+u$ | $\Delta y\approx(\beta_1/100)\%\Delta x$ |

The percentage interpretations are approximations that are good for small changes. The log–log model has a *constant elasticity*. Logs are used for variables that are positive and right-skewed (wages, prices, sales).

## Worked Example

- **Log–level:** $\widehat{\ln(wage)}=0.584+0.083\,educ$. One more year of education is associated with about $100\cdot0.083=8.3\%$ higher wages (exactly: $100(e^{0.083}-1)=8.65\%$).
- **Log–log:** $\widehat{\ln(salary)}=4.82+0.257\ln(sales)$. A 1% increase in firm sales is associated with a 0.257% increase in CEO salary: salary is *inelastic* with respect to sales.
- **Units:** if the same salary regression is run with salary in thousands of dollars in the *level* form $\widehat{salary}=963+18.5\,roe$, using dollars instead gives $963{,}000+18{,}500\,roe$; $R^2$ is identical.

## Common Mistakes

- Interpreting a log–level slope as a change in *units* of $y$.
- Reading $100\beta_1$ as percentage points when it is a percent change in $y$.
- Comparing $R^2$ across models with $y$ and $\ln y$ as dependent variable: they explain different quantities.

## When It's Used

Choosing units and logs is about interpretation: wages in dollars vs. thousands, salary in logs so that effects are *percentages*. Log-level models give semi-elasticities (return to one more year of education in %), log-log models give elasticities (CEO salary response to a 1% increase in firm sales) — the form in which economists and pricing analysts report results.

**Exam tip:** level-level: $\Delta y = \beta_1\Delta x$; log-level: $\%\Delta y \approx 100\beta_1\Delta x$; log-log: $\%\Delta y \approx \beta_1\%\Delta x$; level-log: $\Delta y \approx (\beta_1/100)\%\Delta x$. Rescaling never changes $R^2$.

## R Code

```r
set.seed(8)
n <- 300
sales  <- rlnorm(n, log(4000), 1)                 # firm sales, million $
salary <- exp(4.8 + 0.25 * log(sales) + rnorm(n, 0, 0.5))   # CEO salary, thousand $

m_level  <- lm(salary ~ sales)
m_level2 <- lm(I(salary * 1000) ~ sales)          # salary in dollars
rbind(thousands = coef(m_level), dollars = coef(m_level2))
c(summary(m_level)$r.squared, summary(m_level2)$r.squared)   # identical R^2

m_loglog <- lm(log(salary) ~ log(sales))
coef(m_loglog)["log(sales)"]                      # elasticity: +1% sales -> +0.25% salary

educ <- sample(8:20, n, TRUE)
wage <- exp(0.6 + 0.08 * educ + rnorm(n, 0, 0.4))
100 * coef(lm(log(wage) ~ educ))["educ"]          # approx % increase per year of education
```

## Python Code

```python
import numpy as np
import statsmodels.api as sm

rng = np.random.default_rng(8)
n = 300
sales = rng.lognormal(np.log(4000), 1, n)
salary = np.exp(4.8 + 0.25 * np.log(sales) + rng.normal(0, 0.5, n))

X = sm.add_constant(sales)
m1, m2 = sm.OLS(salary, X).fit(), sm.OLS(salary * 1000, X).fit()
print(m1.params, m2.params, m1.rsquared, m2.rsquared)

loglog = sm.OLS(np.log(salary), sm.add_constant(np.log(sales))).fit()
print("elasticity:", loglog.params[1])

educ = rng.integers(8, 21, n)
wage = np.exp(0.6 + 0.08 * educ + rng.normal(0, 0.4, n))
print("% per year of educ:", 100 * sm.OLS(np.log(wage), sm.add_constant(educ)).fit().params[1])
```

## Practice Questions

*✎ new question added for this site (worked solution below)*

- ✎ In the model $\widehat{\ln(price)}=2.1+0.04\,rooms$, interpret the slope.
- ✎ In $\widehat{\ln(quantity)}=8-1.2\ln(price)$, interpret the slope. What kind of demand is this?
- ✎ A regression of wage (in dollars) on experience (in years) gives $\hat\beta_1=0.30$. What is the slope if experience is measured in months and wage in cents?

## Solutions

*✎ solution written for this site*

- ✎ Q1: One more room is associated with about $100\cdot0.04=4\%$ higher price.
- ✎ Q2: A 1% increase in the price is associated with a 1.2% decrease in the quantity demanded: the price elasticity of demand is $-1.2$ (elastic demand).
- ✎ Q3: Wage in cents multiplies the slope by 100; experience in months ($x^*=12x$) divides it by 12: $0.30\cdot100/12=2.5$ cents per month of experience.
