# Simple Linear Regression

## Overview

Simple linear regression fits a straight line through a scatter plot to describe how the average outcome changes with one predictor. The slope is the headline number; the other outputs (R², standard errors, prediction intervals) say how well the line fits and how certain we are. A significant slope shows association, not necessarily cause and effect.

## Concept

Simple linear regression models how the mean of a response $y$ changes with one predictor $x$:

$$y_i = \beta_0 + \beta_1 x_i + \varepsilon_i, \qquad E(\varepsilon_i \mid x_i) = 0.$$

- $\beta_0$ — intercept: expected $y$ when $x = 0$ (often only a mathematical anchor).
- $\beta_1$ — slope: expected change in $y$ for a one-unit increase in $x$.
- $\varepsilon_i$ — everything else that affects $y$.

### Ordinary least squares (OLS)

[OLS](https://en.wikipedia.org/wiki/Ordinary_least_squares) chooses $\hat\beta_0, \hat\beta_1$ to minimise $\sum (y_i - \beta_0 - \beta_1x_i)^2$:

$$\hat\beta_1 = \frac{\sum (x_i-\bar x)(y_i-\bar y)}{\sum (x_i - \bar x)^2} = r\,\frac{s_y}{s_x}, \qquad \hat\beta_0 = \bar y - \hat\beta_1 \bar x.$$

Properties of every OLS fit: residuals $\hat e_i = y_i - \hat y_i$ sum to zero, are uncorrelated with $x$, and the line passes through $(\bar x, \bar y)$.

### Goodness of fit

$$SST = SSR_{\text{model}} + SSE, \qquad R^2 = 1 - \frac{\sum \hat e_i^2}{\sum (y_i - \bar y)^2}.$$

In simple regression $R^2 = r^2$. (Here $SSE$ denotes the *error* (residual) sum of squares $\sum\hat e_i^2$ and $SSR_{\text{model}}$ the regression (explained) sum of squares; some textbooks use the opposite abbreviations, so always check the definition.) The **residual standard error** $\hat\sigma = \sqrt{\frac{\sum \hat e_i^2}{n-2}}$ is the typical size of a prediction error in the units of $y$.

### Inference (classical assumptions)

**LINE**: **L**inearity, **I**ndependent errors, **N**ormal errors (for small-sample inference), **E**qual variance ([homoskedasticity](https://en.wikipedia.org/wiki/Homoscedasticity_and_heteroscedasticity)).

- $SE(\hat\beta_1) = \dfrac{\hat\sigma}{\sqrt{\sum (x_i-\bar x)^2}}$; test $H_0: \beta_1 = 0$ with $T = \hat\beta_1 / SE(\hat\beta_1) \sim t_{n-2}$.
- CI for the slope: $\hat\beta_1 \pm t_{n-2,1-\alpha/2}\,SE(\hat\beta_1)$.
- **Confidence interval for the mean response** at $x_0$ vs. **[prediction interval](https://en.wikipedia.org/wiki/Prediction_interval) for a new observation** — the prediction interval adds the error variance $\hat\sigma^2$ and is always wider.

### Interpretation with transformations

| Model | Interpretation of $\beta_1$ |
|---|---|
| $y = \beta_0 + \beta_1 x$ | +1 unit of $x$ → $+\beta_1$ units of $y$ |
| $\log y = \beta_0 + \beta_1 x$ | +1 unit of $x$ → $\approx 100\beta_1\%$ change in $y$ (exactly $100(e^{\beta_1}-1)\%$) |
| $y = \beta_0 + \beta_1 \log x$ | +1% in $x$ → $\approx \beta_1/100$ units of $y$ |
| $\log y = \beta_0 + \beta_1 \log x$ | +1% in $x$ → $\approx \beta_1\%$ change in $y$ (elasticity) |

### Cautions

- **[Extrapolation](https://en.wikipedia.org/wiki/Extrapolation)** beyond the observed $x$ range is unreliable.
- **[Regression to the mean](https://en.wikipedia.org/wiki/Regression_toward_the_mean)** — extreme first measurements tend to be followed by less extreme ones.
- A slope describes association; it is causal only if $x$ is as good as randomly assigned (no omitted confounders).
- Influential points (high leverage + large residual) can drive the whole fit — always plot the data.

## When It's Used

Simple regression quantifies a single driver: sales vs. advertising spend, energy use vs. outdoor temperature, house price vs. floor area, salary vs. years of experience, calibration of a measuring instrument against a reference standard, and trend estimation over time. It is also the building block for multiple regression and for understanding every regression output table.

## R Code

```r
set.seed(5)
# Monthly marketing spend (thousand EUR) and new customers
spend <- round(runif(36, 10, 80), 1)
customers <- round(120 + 4.2 * spend + rnorm(36, 0, 30))
d <- data.frame(spend, customers)

fit <- lm(customers ~ spend, data = d)
summary(fit)

# OLS by hand
b1 <- cov(spend, customers) / var(spend)
b0 <- mean(customers) - b1 * mean(spend)
c(b0 = b0, b1 = b1, r_squared = cor(spend, customers)^2)

# Inference on the slope
confint(fit)
sigma_hat <- sqrt(sum(resid(fit)^2) / (nrow(d) - 2))
se_b1 <- sigma_hat / sqrt(sum((spend - mean(spend))^2))
c(se_b1 = se_b1, t = b1 / se_b1)

# Mean response CI vs prediction interval at spend = 50
new <- data.frame(spend = 50)
predict(fit, new, interval = "confidence")
predict(fit, new, interval = "prediction")

# Plot with confidence and prediction bands
grid <- data.frame(spend = seq(10, 80, length.out = 100))
ci <- predict(fit, grid, interval = "confidence"); pi <- predict(fit, grid, interval = "prediction")
plot(customers ~ spend, data = d, pch = 19, main = "New customers vs spend")
lines(grid$spend, ci[, "fit"], lwd = 2)
matlines(grid$spend, ci[, 2:3], lty = 2, col = "black")
matlines(grid$spend, pi[, 2:3], lty = 3, col = "grey40")

# Log-log model: elasticity
price <- runif(60, 2, 10)
demand <- exp(6 - 1.3 * log(price) + rnorm(60, 0, 0.15))
coef(lm(log(demand) ~ log(price)))["log(price)"]   # +1% price -> about -1.3% demand

# Residual diagnostics
op <- par(mfrow = c(2, 2)); plot(fit); par(op)
```

## Python Code

```python
import numpy as np
import pandas as pd
import matplotlib.pyplot as plt
import statsmodels.formula.api as smf

rng = np.random.default_rng(5)
d = pd.DataFrame({"spend": np.round(rng.uniform(10, 80, 36), 1)})
d["customers"] = np.round(120 + 4.2 * d.spend + rng.normal(0, 30, 36))

fit = smf.ols("customers ~ spend", data=d).fit()
print(fit.summary())

b1 = np.cov(d.spend, d.customers)[0, 1] / d.spend.var()
b0 = d.customers.mean() - b1 * d.spend.mean()
print("by hand:", b0, b1, " R2:", d.spend.corr(d.customers) ** 2)
print(fit.conf_int())

pred = fit.get_prediction(pd.DataFrame({"spend": [50]})).summary_frame(alpha=0.05)
print(pred)   # mean_ci_* = confidence interval, obs_ci_* = prediction interval

grid = pd.DataFrame({"spend": np.linspace(10, 80, 100)})
bands = fit.get_prediction(grid).summary_frame()
plt.scatter(d.spend, d.customers)
plt.plot(grid.spend, bands["mean"], lw=2)
plt.fill_between(grid.spend, bands.mean_ci_lower, bands.mean_ci_upper, alpha=0.3)
plt.plot(grid.spend, bands.obs_ci_lower, ":", color="grey")
plt.plot(grid.spend, bands.obs_ci_upper, ":", color="grey")
plt.title("New customers vs spend"); plt.show()

# Elasticity from a log-log model
price = rng.uniform(2, 10, 60)
demand = np.exp(6 - 1.3 * np.log(price) + rng.normal(0, 0.15, 60))
ll = smf.ols("np.log(demand) ~ np.log(price)", data=pd.DataFrame({"price": price, "demand": demand})).fit()
print("elasticity:", ll.params["np.log(price)"])

# Residuals vs fitted
plt.scatter(fit.fittedvalues, fit.resid); plt.axhline(0, ls="--")
plt.xlabel("fitted"); plt.ylabel("residual"); plt.show()
```

## Software Shortcuts

- **Excel:** `=SLOPE(y, x)`, `=INTERCEPT(y, x)`, `=RSQ(y, x)`, `=STEYX(y, x)` (residual standard error), `=FORECAST.LINEAR(x0, y, x)`; `=LINEST(y, x, TRUE, TRUE)` returns coefficients, standard errors, $R^2$, F and df as an array. Data → Data Analysis → **Regression** gives a full table with residuals and plots. On a scatter chart: right-click the series → Add Trendline → *Display equation* and *R-squared*.
- **SPSS:** Analyze → Regression → **Linear** (Statistics → Confidence intervals; Save → Predicted values, prediction intervals, residuals; Plots → ZRESID vs ZPRED).
- **Stata:** `regress customers spend`, `predict yhat`, `predict se_f, stdf` (prediction SE), `twoway (scatter customers spend) (lfitci customers spend)`, `rvfplot`.
- **Google Sheets:** `=SLOPE()`, `=INTERCEPT()`, `=RSQ()`, `=LINEST()`; chart editor → Customize → Series → Trendline → Label: Use equation.

## Industry Examples

**Facilities management — energy baseline.** A property manager regresses a building's monthly heating energy (kWh) on heating degree days: slope 38 kWh per degree day, $R^2 = 0.93$. After a retrofit, actual consumption is compared with the regression's *predicted* consumption for the new months' weather; the gap (22% lower, outside the 95% prediction band) is the verified saving reported under the IPMVP measurement-and-verification protocol used in energy-performance contracts.

**Real estate — pricing a listing.** A regional agency regresses log sale price on log floor area for 1,400 recent flat sales in one district: elasticity 0.86, meaning a flat 10% larger sells for about 8.6% more. Agents use the prediction interval, not just the fitted value, to set a listing range, and a residual analysis flags recent sales more than 2 residual SDs below the line — candidates for below-market purchases by the agency's investor clients.

**Laboratory medicine — assay calibration.** A clinical lab calibrates a new glucose analyser against a reference method using 40 patient samples spanning 2–25 mmol/L. The regression slope is 0.97 (95% CI 0.95–0.99) and intercept 0.21 mmol/L, indicating a small proportional bias. The lab applies the calibration equation and checks that residuals show no fan shape; if they did, it would switch to weighted least squares or Deming regression, which accounts for error in both methods.

## Practice Questions

*✎ new question added for this site (worked solution below)*

- ✎ The correlation between $x$ and $y$ is 0.8, $s_x=4$, $s_y=10$, $\bar x=10$, $\bar y=40$. Find the regression line, the prediction at $x=12$ and $R^2$.
- ✎ In $\log(y)=\beta_0+0.05\,x$, interpret the slope. What is the exact percentage change per unit of $x$?

## Solutions

*✎ solution written for this site*

- ✎ Q1: $\hat\beta_1=r\,s_y/s_x=0.8\cdot10/4=2$; $\hat\beta_0=40-2\cdot10=20$. The prediction at $x=12$ is $20+24=44$; $R^2=r^2=0.64$.
- ✎ Q2: One more unit of $x$ is associated with about a 5% higher $y$; exactly $100(e^{0.05}-1)=5.13\%$.
