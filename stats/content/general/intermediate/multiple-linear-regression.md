# Multiple Linear Regression

## Overview

Multiple regression estimates the effect of each predictor while holding the others fixed, which is the main way to control for confounders with observational data. The price is that the coefficients are only meaningful if the model is reasonably specified: leaving out an important related variable biases the results, and strongly correlated predictors make estimates unstable.

## Concept

Multiple regression explains a response with several predictors at once:

$$y_i = \beta_0 + \beta_1 x_{i1} + \beta_2 x_{i2} + \dots + \beta_k x_{ik} + \varepsilon_i, \qquad \text{in matrix form } \mathbf y = \mathbf X\boldsymbol\beta + \boldsymbol\varepsilon.$$

The OLS estimator is $\hat{\boldsymbol\beta} = (\mathbf X^\top\mathbf X)^{-1}\mathbf X^\top\mathbf y$.

### Interpreting coefficients

$\beta_j$ is the expected change in $y$ for a one-unit increase in $x_j$ **holding all other predictors constant** (*ceteris paribus*). This is the main reason to use multiple regression with observational data: it separates the effect of $x_j$ from the other *measured* factors. By the [Frisch-Waugh-Lovell theorem](https://en.wikipedia.org/wiki/Frisch%E2%80%93Waugh%E2%80%93Lovell_theorem), $\hat\beta_j$ equals the slope from regressing $y$ on the part of $x_j$ not explained by the other predictors.

### Omitted variable bias

If a relevant variable $z$ is left out and it is correlated with an included $x$, the coefficient on $x$ absorbs part of $z$'s effect:

$$E(\tilde\beta_x) = \beta_x + \beta_z\,\delta, \qquad \delta = \text{slope of } z \text{ on } x.$$

The bias is positive when $\beta_z$ and $Corr(x, z)$ have the same sign. Including irrelevant variables does not bias the estimates but inflates their variance.

### Categorical predictors and flexible shapes

- **Dummy variables:** a factor with $m$ levels enters as $m-1$ indicators; each coefficient is the difference from the reference level. Including all $m$ plus an intercept is the *[dummy-variable trap](https://en.wikipedia.org/wiki/Dummy_variable_%28statistics%29)* (perfect collinearity).
- **Interactions** $x_1 \times x_2$: the effect of $x_1$ depends on $x_2$ — $\partial E(y)/\partial x_1 = \beta_1 + \beta_3 x_2$.
- **Polynomials** $x, x^2$: diminishing or increasing returns; turning point at $-\beta_1/(2\beta_2)$.
- **Logs:** percentage and elasticity interpretations (see simple regression).

### Inference and model comparison

- **t-test** per coefficient: $T = \hat\beta_j / SE(\hat\beta_j) \sim t_{n-k-1}$.
- **F-test** for a group of $q$ restrictions (e.g. several coefficients jointly zero):
  $$F = \frac{(SSR_r - SSR_{ur})/q}{SSR_{ur}/(n-k-1)} \sim F_{q,\,n-k-1}.$$
  The overall F-test tests all slopes $= 0$.
- **Adjusted $R^2$** $\bar R^2 = 1 - \frac{SSR/(n-k-1)}{SST/(n-1)}$ penalises extra predictors; **AIC/BIC** balance fit and complexity; **[cross-validation](https://en.wikipedia.org/wiki/Cross-validation_%28statistics%29)** measures out-of-sample prediction error.

### Assumptions (Gauss-Markov + normality)

1. Linear in parameters; 2. random sample; 3. no perfect collinearity; 4. zero conditional mean $E(\varepsilon \mid \mathbf X) = 0$ (no omitted confounders); 5. homoskedasticity; 6. normal errors (small samples).

Under 1–4 OLS is unbiased; under 1–5 it is the [Best Linear Unbiased Estimator](https://en.wikipedia.org/wiki/Gauss%E2%80%93Markov_theorem) (BLUE). Violations and their fixes are covered in *Regression Diagnostics*.

### Multicollinearity

Highly correlated predictors make individual coefficients imprecise (large SEs, unstable signs) even though the model as a whole may predict well. The **[variance inflation factor](https://en.wikipedia.org/wiki/Variance_inflation_factor)** $VIF_j = 1/(1 - R_j^2)$ above about 5–10 is a warning sign.

### Explanation vs. prediction

For **explanation**, choose predictors from subject knowledge to control confounders and interpret coefficients carefully. For **prediction**, choose variables and transformations by cross-validated error; coefficients need not be causal. Regularised regressions (ridge, [lasso](https://en.wikipedia.org/wiki/Lasso_%28statistics%29)) help when there are many correlated predictors.

## Common Mistakes

- Reading a coefficient as the effect of $x_j$ "in general" instead of holding the other included variables fixed.
- Adding every available variable: controls that are themselves consequences of the variable of interest can create bias.
- Dropping a relevant variable to cure multicollinearity, which trades a variance problem for a bias problem.

## When It's Used

Multiple regression is the standard tool for pricing (hedonic models of house or car prices), salary benchmarking and pay-equity audits (controlling for role, tenure, performance), marketing-mix modelling (sales on several media channels, price and seasonality), demand forecasting, risk scoring, and academic research in economics, health and social science wherever confounders must be adjusted for.

## R Code

```r
set.seed(12)
n <- 400
homes <- data.frame(
  area      = round(runif(n, 50, 200)),                     # m^2
  age       = round(runif(n, 0, 80)),                       # years
  rooms     = NA,
  district  = factor(sample(c("centre", "suburb", "outskirts"), n, TRUE, prob = c(.3, .45, .25)),
                     levels = c("outskirts", "suburb", "centre")),
  garden    = rbinom(n, 1, 0.4)
)
homes$rooms <- pmax(1, round(homes$area / 30 + rnorm(n, 0, 0.7)))
dist_effect <- c(outskirts = 0, suburb = 0.18, centre = 0.45)[as.character(homes$district)]
homes$log_price <- 10.8 + 0.0065 * homes$area - 0.004 * homes$age + 0.02 * homes$rooms +
  dist_effect + 0.07 * homes$garden + 0.0015 * homes$area * (homes$district == "centre") +
  rnorm(n, 0, 0.15)

fit <- lm(log_price ~ area + age + rooms + district + garden, data = homes)
summary(fit)

# Percentage interpretation of a dummy in a log model
100 * (exp(coef(fit)["districtcentre"]) - 1)      # centre vs outskirts, other things equal

# Interaction: does the value of extra area depend on the district?
fit_int <- lm(log_price ~ area * district + age + rooms + garden, data = homes)
anova(fit, fit_int)                               # F-test for the interaction terms

# Joint F-test by hand for dropping 'rooms' and 'garden'
restricted <- lm(log_price ~ area + age + district, data = homes)
q <- 2; SSR_r <- sum(resid(restricted)^2); SSR_u <- sum(resid(fit)^2)
F_stat <- ((SSR_r - SSR_u) / q) / (SSR_u / fit$df.residual)
c(F = F_stat, p = pf(F_stat, q, fit$df.residual, lower.tail = FALSE))

# Omitted variable bias: leave out area, which is correlated with rooms
coef(lm(log_price ~ rooms + age + district + garden, data = homes))["rooms"]
coef(fit)["rooms"]

# Variance inflation factors by hand
X <- model.matrix(fit)[, -1]
vif <- sapply(colnames(X), function(v) 1 / (1 - summary(lm(X[, v] ~ X[, colnames(X) != v]))$r.squared))
round(vif, 2)

# Model comparison
c(adjR2_main = summary(fit)$adj.r.squared, adjR2_int = summary(fit_int)$adj.r.squared,
  AIC_main = AIC(fit), AIC_int = AIC(fit_int))

# Prediction for a new home with a 95% prediction interval, back on the price scale
new <- data.frame(area = 120, age = 15, rooms = 4, district = "suburb", garden = 1)
exp(predict(fit, new, interval = "prediction"))

# 5-fold cross-validated RMSE (log scale)
folds <- sample(rep(1:5, length.out = n))
cv_rmse <- sapply(1:5, function(k) {
  m <- lm(log_price ~ area + age + rooms + district + garden, data = homes[folds != k, ])
  sqrt(mean((homes$log_price[folds == k] - predict(m, homes[folds == k, ]))^2))
})
mean(cv_rmse)
```

## Python Code

```python
import numpy as np
import pandas as pd
import statsmodels.formula.api as smf
import statsmodels.api as sm
from statsmodels.stats.outliers_influence import variance_inflation_factor
from sklearn.model_selection import KFold

rng = np.random.default_rng(12)
n = 400
homes = pd.DataFrame({
    "area": np.round(rng.uniform(50, 200, n)),
    "age": np.round(rng.uniform(0, 80, n)),
    "district": rng.choice(["centre", "suburb", "outskirts"], n, p=[.3, .45, .25]),
    "garden": rng.binomial(1, 0.4, n),
})
homes["rooms"] = np.maximum(1, np.round(homes.area / 30 + rng.normal(0, 0.7, n)))
eff = homes.district.map({"outskirts": 0, "suburb": 0.18, "centre": 0.45})
homes["log_price"] = (10.8 + 0.0065 * homes.area - 0.004 * homes.age + 0.02 * homes.rooms + eff
                      + 0.07 * homes.garden + 0.0015 * homes.area * (homes.district == "centre")
                      + rng.normal(0, 0.15, n))

formula = "log_price ~ area + age + rooms + C(district, Treatment('outskirts')) + garden"
fit = smf.ols(formula, data=homes).fit()
print(fit.summary())

centre = [c for c in fit.params.index if "centre" in c][0]
print("centre premium %:", 100 * (np.exp(fit.params[centre]) - 1))

fit_int = smf.ols("log_price ~ area * C(district, Treatment('outskirts')) + age + rooms + garden",
                  data=homes).fit()
print(sm.stats.anova_lm(fit, fit_int))

print(fit.f_test("rooms = 0, garden = 0"))

short = smf.ols("log_price ~ rooms + age + C(district) + garden", data=homes).fit()
print("rooms coef without area:", short.params["rooms"], " with area:", fit.params["rooms"])

X = fit.model.exog
print({name: round(variance_inflation_factor(X, i), 2)
       for i, name in enumerate(fit.model.exog_names) if name != "Intercept"})

print("adjR2:", fit.rsquared_adj, fit_int.rsquared_adj, " AIC:", fit.aic, fit_int.aic)

new = pd.DataFrame({"area": [120], "age": [15], "rooms": [4], "district": ["suburb"], "garden": [1]})
p = fit.get_prediction(new).summary_frame(alpha=0.05)
print(np.exp(p[["mean", "obs_ci_lower", "obs_ci_upper"]]))

rmse = []
for train, test in KFold(5, shuffle=True, random_state=1).split(homes):
    m = smf.ols(formula, data=homes.iloc[train]).fit()
    rmse.append(np.sqrt(np.mean((homes.log_price.iloc[test] - m.predict(homes.iloc[test])) ** 2)))
print("CV RMSE:", np.mean(rmse))
```

## Software Shortcuts

- **Excel:** Data → Data Analysis → **Regression** with several adjacent X columns (dummies must be created manually with `=IF(district="centre",1,0)`); `=LINEST(y, X_range, TRUE, TRUE)` returns coefficients in *reverse* column order with SEs, $R^2$, F and df; `=TREND()` for predictions.
- **SPSS:** Analyze → Regression → **Linear** (Method: Enter, Stepwise; Statistics → *Collinearity diagnostics* for VIF, *R squared change* for nested F-tests via Blocks); Analyze → General Linear Model → **Univariate** handles factors and interactions without manual dummies.
- **Stata:** `regress log_price area age rooms i.district garden`, `test rooms garden` (joint F), `regress ... c.area##i.district` (interaction), `estat vif`, `margins district`, `predict yhat`.
- **Google Sheets:** `=LINEST(y, X, TRUE, TRUE)`, `=TREND()`.

## Industry Examples

**Real estate — hedonic pricing.** A property portal estimates log price on floor area, age, energy class, floor level, balcony, district dummies and an area × district interaction using 85,000 listings. The model's cross-validated median error of 7% powers its "estimated value" feature. The district coefficients also feed a municipal study: after controlling for size and age, flats within 500 m of a new tram line sold 4.1% higher (95% CI 2.8–5.4%) than comparable flats further away.

**Human resources — pay-equity audit.** A company with 12,000 employees regresses log salary on job family, grade, tenure, performance rating, location and gender. The raw gender gap is 14%, but the *adjusted* coefficient on gender is −2.3% (95% CI −3.1% to −1.5%), which is the figure the company must explain under the EU Pay Transparency Directive. The analysts also check whether grade itself is affected by gender (a "bad control"), since controlling for it could hide discrimination in promotions.

**Consumer goods — marketing-mix modelling.** A beverage brand regresses weekly sales volume on TV, online video, search and in-store promotion spend (transformed with adstock and diminishing-returns curves), price, temperature and holiday dummies over three years. The coefficients yield return-on-investment per channel; search shows the highest marginal ROI while TV has high VIF with online video because campaigns always ran together — so the team runs a geo-split experiment to separate the two before reallocating budget.

## Practice Questions

*✎ new question added for this site (worked solution below)*

- ✎ The true effect of education on log wages is $\beta_1=0.5$ (in suitable units), ability has $\beta_2=0.4$ and its slope on education is $\delta=0.25$. What does the regression omitting ability estimate on average?
- ✎ A categorical variable has 4 levels. How many dummy variables enter a model with an intercept, and what goes wrong if all 4 are included?

## Solutions

*✎ solution written for this site*

- ✎ Q1: $E(\tilde\beta_1)=0.5+0.4\cdot0.25=0.6$: the effect is overstated by 0.1 (positive bias, since both signs are positive).
- ✎ Q2: Three dummies; each coefficient is the difference from the reference level. Including all four plus the intercept creates perfect collinearity (the dummy-variable trap) and OLS cannot be computed.
