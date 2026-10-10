# Regression Diagnostics

## Overview

A regression is only as good as its assumptions. Diagnostics look at the residuals to check linearity, constant variance, independence, normality and influential points, and they suggest remedies. The most serious problem, endogeneity, cannot be detected in residual plots and must be handled by the design of the study.

## Concept

A regression is only as trustworthy as its assumptions. Diagnostics check them using the **residuals** $\hat e_i = y_i - \hat y_i$ and related quantities, and point to remedies.

### What to check, how, and what to do

| Assumption | Symptom | Diagnostic | Remedy |
|---|---|---|---|
| Linearity | curved pattern in residuals vs. fitted | residual plot, component-plus-residual plots, RESET test | transform $x$ or $y$, add polynomial / spline terms |
| Homoskedasticity | funnel shape (spread grows with fitted values) | scale-location plot, [Breusch-Pagan](https://en.wikipedia.org/wiki/Breusch%E2%80%93Pagan_test) / White test | log-transform $y$, weighted least squares, **robust (HC) standard errors** |
| Independence | residuals correlated over time or within groups | residuals vs. time, ACF, [Durbin-Watson](https://en.wikipedia.org/wiki/Durbin%E2%80%93Watson_statistic) | time-series models, [Newey-West](https://en.wikipedia.org/wiki/Newey%E2%80%93West_estimator) or cluster-robust SEs |
| Normality of errors | skewed / heavy-tailed residuals | QQ plot, Shapiro-Wilk, Jarque-Bera | transform $y$; large $n$ makes it less important (CLT); bootstrap |
| No perfect / severe multicollinearity | huge SEs, unstable signs | VIF, correlation matrix, condition number | drop or combine predictors, ridge regression, collect more data |
| No influential outliers | a few points drive the fit | leverage $h_{ii}$, studentised residuals, [Cook's distance](https://en.wikipedia.org/wiki/Cook's_distance) | check data errors, report with and without, robust regression |

### Key quantities

- **[Leverage](https://en.wikipedia.org/wiki/Leverage_%28statistics%29)** $h_{ii}$ — diagonal of the hat matrix $\mathbf H = \mathbf X(\mathbf X^\top\mathbf X)^{-1}\mathbf X^\top$; measures how unusual $x_i$ is. Average leverage is $(k+1)/n$; values above $2(k+1)/n$ deserve a look.
- **Studentised residuals** — residuals divided by their estimated SD; $|r_i| > 3$ is unusual.
- **Cook's distance** $D_i$ — how much all fitted values change when observation $i$ is deleted; $D_i > 4/n$ (or $> 1$) flags influence.
- **Durbin-Watson** $DW = \frac{\sum (\hat e_t - \hat e_{t-1})^2}{\sum \hat e_t^2} \approx 2(1 - \hat\rho)$: near 2 means no first-order autocorrelation.

### Heteroskedasticity-robust inference

Under heteroskedasticity OLS coefficients remain unbiased, but the usual standard errors are wrong. **White / HC standard errors** (HC1, HC3) fix inference without changing the coefficients; they are the default in much of applied economics. With clustered data (students within schools, repeated customers) use **cluster-robust** SEs.

### Endogeneity

The most serious failure — $E(\varepsilon \mid \mathbf X) \ne 0$ from omitted variables, measurement error in $x$ or simultaneity — cannot be seen in residual plots (residuals are uncorrelated with $x$ by construction). It must be addressed through design: controls, panel fixed effects, [instrumental variables](https://en.wikipedia.org/wiki/Instrumental_variables), experiments.

### Workflow

1. Plot the raw data. 2. Fit the model. 3. Plot residuals vs. fitted and vs. each predictor. 4. QQ plot. 5. Check leverage and Cook's distance. 6. Test heteroskedasticity/autocorrelation if relevant. 7. Refit with remedies and compare conclusions. Report what you checked.

## Common Mistakes

- Checking only the overall $R^2$ and never plotting the residuals.
- Dropping influential points because they are inconvenient rather than after finding a substantive reason.
- Expecting residual plots to reveal omitted variables or endogeneity (residuals are uncorrelated with the regressors by construction).

## When It's Used

Diagnostics are part of every serious regression analysis: model validation in banks (regulators require documented assumption checks for credit and market-risk models), clinical and epidemiological studies, econometric policy evaluations, pricing and forecasting models in industry, and peer review. They are also a data-quality tool — high-leverage points are often entry errors.

## R Code

```r
library(lmtest)                     # ships with most R installations (bptest, dwtest, resettest)
set.seed(9)
n <- 200
income <- runif(n, 20, 150)                                       # thousand EUR
spending <- 5 + 0.35 * income + 0.002 * income^2 + rnorm(n, 0, 0.06 * income)   # curved + heteroskedastic
spending[c(17, 88)] <- spending[c(17, 88)] + c(45, -40)          # two outliers
d <- data.frame(income, spending)

fit <- lm(spending ~ income, data = d)
op <- par(mfrow = c(2, 2)); plot(fit); par(op)                    # the four standard plots

# Formal tests
resettest(fit, power = 2)             # functional form (linearity)
bptest(fit)                           # Breusch-Pagan heteroskedasticity
shapiro.test(resid(fit))              # normality of residuals

# Influence measures
h <- hatvalues(fit); cd <- cooks.distance(fit); rs <- rstudent(fit)
k <- length(coef(fit)) - 1
which(h > 2 * (k + 1) / n)
which(cd > 4 / n)
which(abs(rs) > 3)

# Remedies: quadratic term + robust (HC1) standard errors computed by hand
fit2 <- lm(spending ~ income + I(income^2), data = d)
X <- model.matrix(fit2); e <- resid(fit2)
bread <- solve(crossprod(X))
meat <- crossprod(X * e)                                         # sum of e_i^2 x_i x_i'
V_hc1 <- n / (n - ncol(X)) * bread %*% meat %*% bread
cbind(estimate = coef(fit2), se_classic = sqrt(diag(vcov(fit2))), se_HC1 = sqrt(diag(V_hc1)))
# with the 'sandwich' package: coeftest(fit2, vcov = sandwich::vcovHC(fit2, type = "HC1"))

# Weighted least squares when the error SD is proportional to income
fit_wls <- lm(spending ~ income + I(income^2), data = d, weights = 1 / income^2)
coef(summary(fit_wls))

# Autocorrelation check for time-ordered data
t <- 1:120
y <- 10 + 0.1 * t + as.numeric(arima.sim(list(ar = 0.7), 120))
dwtest(lm(y ~ t))
acf(resid(lm(y ~ t)), main = "ACF of residuals")
```

## Python Code

```python
import numpy as np
import pandas as pd
import matplotlib.pyplot as plt
import statsmodels.api as sm
import statsmodels.formula.api as smf
from statsmodels.stats.diagnostic import het_breuschpagan, linear_reset
from statsmodels.stats.stattools import durbin_watson
from scipy import stats

rng = np.random.default_rng(9)
n = 200
income = rng.uniform(20, 150, n)
spending = 5 + 0.35 * income + 0.002 * income**2 + rng.normal(0, 0.06 * income)
spending[[17, 88]] += [45, -40]
d = pd.DataFrame({"income": income, "spending": spending})

fit = smf.ols("spending ~ income", data=d).fit()

fig, ax = plt.subplots(1, 3, figsize=(14, 4))
ax[0].scatter(fit.fittedvalues, fit.resid, s=10); ax[0].axhline(0, ls="--"); ax[0].set_title("Residuals vs fitted")
sm.qqplot(fit.resid, line="s", ax=ax[1]); ax[1].set_title("Normal QQ")
infl = fit.get_influence()
ax[2].stem(infl.cooks_distance[0]); ax[2].set_title("Cook's distance")
plt.tight_layout(); plt.show()

print("RESET:", linear_reset(fit, power=2, use_f=True))
print("Breusch-Pagan p:", het_breuschpagan(fit.resid, fit.model.exog)[1])
print("Shapiro p:", stats.shapiro(fit.resid).pvalue)

h = infl.hat_matrix_diag; cd = infl.cooks_distance[0]; rs = infl.resid_studentized_external
k = fit.df_model
print("high leverage:", np.where(h > 2 * (k + 1) / n)[0])
print("Cook's D > 4/n:", np.where(cd > 4 / n)[0])
print("|studentised| > 3:", np.where(np.abs(rs) > 3)[0])

fit2 = smf.ols("spending ~ income + I(income**2)", data=d).fit()
robust = fit2.get_robustcov_results(cov_type="HC1")
print(pd.DataFrame({"coef": fit2.params, "se_classic": fit2.bse, "se_HC1": robust.bse}))

wls = smf.wls("spending ~ income + I(income**2)", data=d, weights=1 / d.income**2).fit()
print(wls.params)

t = np.arange(1, 121)
ar = np.zeros(120)
for i in range(1, 120):
    ar[i] = 0.7 * ar[i - 1] + rng.normal()
y = 10 + 0.1 * t + ar
print("Durbin-Watson:", durbin_watson(sm.OLS(y, sm.add_constant(t)).fit().resid))
```

## Software Shortcuts

- **Excel:** Data → Data Analysis → **Regression** → tick *Residuals*, *Standardized Residuals*, *Residual Plots* and *Normal Probability Plots*. Leverage, Cook's distance and robust SEs require manual matrix formulas (`=MMULT`, `=MINVERSE`) or an add-in.
- **SPSS:** Analyze → Regression → **Linear** → Plots (ZRESID vs ZPRED, histogram, normal P-P), Save (Cook's, leverage, studentised residuals, DfBeta), Statistics (*Durbin-Watson*, *Collinearity diagnostics*); robust SEs via Analyze → General Linear Model → Univariate → Options → *Parameter estimates with robust standard errors* (SPSS 25+).
- **Stata:** after `regress`: `rvfplot`, `lvr2plot`, `estat hettest`, `estat imtest, white`, `estat ovtest` (RESET), `estat vif`, `predict cd, cooksd`, `predict h, leverage`; `regress y x, vce(robust)` or `vce(cluster id)`; `estat dwatson` after `tsset`.
- **Google Sheets:** compute residuals from `=LINEST()` / `=TREND()` and chart them against fitted values.

## Industry Examples

**Banking — model validation.** A bank's model-risk team reviews a linear model predicting loss-given-default for commercial loans. Residual plots show a funnel shape and Breusch-Pagan rejects homoskedasticity (p < 0.001); Cook's distance flags three large restructured loans that alone move the collateral coefficient by 30%. The validation report requires HC3 standard errors, a sensitivity analysis excluding the influential loans, and a log transformation of exposure — findings documented for the supervisor under the bank's model-risk-management policy.

**Public health — air pollution study.** Researchers regress daily hospital admissions on PM2.5 over five years. The Durbin-Watson statistic of 0.9 and a clear residual ACF reveal strong autocorrelation that would have made the pollution coefficient look far more precise than it is. Switching to Newey-West standard errors and adding seasonal splines widens the 95% CI of the effect from ±0.4% to ±1.1% per 10 µg/m³ — still significant, but reported honestly.

**Retail — store sales model.** A chain's regression of store revenue on floor space, catchment population and competitor count has a studentised residual of 5.2 for one store. Investigation shows its floor space was entered in square feet instead of square metres. After the correction the floor-space coefficient falls by 18%, and the team adds automated leverage and Cook's-distance checks to the monthly refresh pipeline.

## Practice Questions

*✎ new question added for this site (worked solution below)*

- ✎ A residual-versus-fitted plot has a funnel shape. Which assumption is violated and what are two remedies?
- ✎ A model has $k=3$ predictors and $n=100$ observations. What leverage value deserves a closer look, and what Cook's distance cut-off is commonly used?

## Solutions

*✎ solution written for this site*

- ✎ Q1: Homoskedasticity (constant error variance). Remedies: heteroskedasticity-robust (HC) standard errors, a log transformation of $y$, or weighted least squares.
- ✎ Q2: Leverage above $2(k+1)/n=2\cdot4/100=0.08$; Cook's distance above $4/n=0.04$ (or above 1 as a stricter rule).
