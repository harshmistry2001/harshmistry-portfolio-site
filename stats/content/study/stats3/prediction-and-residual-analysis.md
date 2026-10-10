# Prediction and Residual Analysis

> Course part: Stats 3

## Overview

A fitted regression can be used in two ways. **Prediction** estimates the outcome for new values of the regressors. **Residual analysis** studies the observations the model gets "wrong": individuals who are above or below what their characteristics predict. The residual is often exactly the quantity of interest.

## Concept

### Residuals

$\hat u_i=y_i-\hat y_i$. A positive residual means that the actual value is above the prediction; a negative residual means that it is below. The residuals are used to:

- spot **outliers** and data errors (large residuals, look at the histogram of residuals),
- identify **over- and under-performers**: a house that sold for less than its characteristics suggest is a candidate "bargain"; a baseball player paid far above the predicted salary is "overpaid"; a law school ranked above its predicted position adds "value".

### Prediction and its uncertainty

For given regressor values $x_0$ the prediction is $\hat y_0=\hat\beta_0+\hat\beta_1x_{01}+\dots+\hat\beta_kx_{0k}$. Two different intervals exist:

- **Confidence interval for the mean response** $E(y\mid x_0)$: $\hat y_0\pm t\cdot se(\hat y_0)$.
- **Prediction interval for an individual outcome** $y_0$: $\hat y_0\pm t\cdot se(\hat e_0)$ with $se(\hat e_0)=\sqrt{se(\hat y_0)^2+\hat\sigma^2}$. It is always wider, because an individual outcome also contains its own unpredictable error $u_0$. See [prediction interval](https://en.wikipedia.org/wiki/Prediction_interval).

### Predicting $y$ from a model for $\ln y$

Using $\exp(\widehat{\ln y})$ underestimates the expected value of $y$. With normal errors a better prediction is $\hat y=\exp(\hat\sigma^2/2)\exp(\widehat{\ln y})$.

## Worked Example

A house-price regression predicts $\hat y_0=250$ (thousand dollars) for a given house; its actual price was 230, so $\hat u=230-250=-20$: it sold 20 thousand below the model value (possible bargain, or unobserved defects).

For a new house with $\hat y_0=100$, $se(\hat y_0)=3$ and $\hat\sigma=10$ (with $t\approx2$): the confidence interval for the *average* price of such houses is $100\pm6=[94,106]$; for one *particular* house, $se(\hat e_0)=\sqrt{9+100}=10.4$ and the prediction interval is $100\pm2\cdot10.4=[79,121]$, much wider.

## Common Mistakes

- Using the confidence interval for the mean response as if it described an individual outcome.
- Concluding that a large residual is an error: it may reflect an unobserved quality.
- Predicting far outside the range of the data.
- Back-transforming predictions from a log model without the correction factor.

## When It's Used

Residuals are actionable: a negative residual for a house price means it sells below what its characteristics predict (a bargain), a large positive residual for a player's salary means overpayment, and residuals of law schools' rankings reveal "value added". Prediction intervals quantify how far an individual outcome can be from the fitted value.

**Exam tip:** $\hat u_i = y_i - \hat y_i$. The prediction interval for an individual outcome is wider than the confidence interval for the mean response because it adds the error variance.

## R Code

```r
set.seed(26)
n <- 88
sqrft <- runif(n, 1200, 3500); bdrms <- sample(2:5, n, TRUE)
price <- 20 + 0.12 * sqrft + 12 * bdrms + rnorm(n, 0, 60)     # thousand $
fit <- lm(price ~ sqrft + bdrms)

# Most under-priced houses relative to their characteristics
res <- resid(fit)
head(data.frame(sqrft, bdrms, price, residual = round(res, 1))[order(res), ], 3)

new <- data.frame(sqrft = 2000, bdrms = 4)
predict(fit, new, interval = "confidence")      # mean price of such houses
predict(fit, new, interval = "prediction")      # price of one such house

hist(res, breaks = 20, main = "Residuals")
```

## Python Code

```python
import numpy as np
import pandas as pd
import matplotlib.pyplot as plt
from statsmodels.formula.api import ols

rng = np.random.default_rng(26)
n = 88
df = pd.DataFrame({"sqrft": rng.uniform(1200, 3500, n), "bdrms": rng.integers(2, 6, n)})
df["price"] = 20 + 0.12 * df.sqrft + 12 * df.bdrms + rng.normal(0, 60, n)
fit = ols("price ~ sqrft + bdrms", df).fit()

df["residual"] = fit.resid
print(df.nsmallest(3, "residual").round(1))

pred = fit.get_prediction(pd.DataFrame({"sqrft": [2000], "bdrms": [4]})).summary_frame(alpha=0.05)
print(pred[["mean", "mean_ci_lower", "mean_ci_upper", "obs_ci_lower", "obs_ci_upper"]])

plt.hist(fit.resid, bins=20); plt.title("Residuals")
plt.show()
```

## Practice Questions

*✎ new question added for this site (worked solution below)*

- ✎ A wage regression predicts 18 dollars/hour for a worker who actually earns 22. Compute and interpret the residual.
- ✎ With $\hat y_0=50$, $se(\hat y_0)=2$, $\hat\sigma=6$ and $t=2$, compute the confidence interval for the mean response and the prediction interval.

## Solutions

*✎ solution written for this site*

- ✎ Q1: $\hat u=22-18=4$: the worker earns 4 dollars more than predicted from the characteristics in the model (positive residual = under-prediction).
- ✎ Q2: Mean response: $50\pm2\cdot2=[46,54]$. Prediction: $se(\hat e_0)=\sqrt{4+36}=6.32$, so $50\pm12.6=[37.4,\ 62.6]$.
