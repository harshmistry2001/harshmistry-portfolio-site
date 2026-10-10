# Bootstrap and Resampling Methods

## Overview

The bootstrap replaces a hard formula with computing power: resample the data with replacement many times, recompute the statistic each time, and use the spread of the results as the uncertainty of the estimate. It is ideal for medians, ratios and other statistics without a simple standard error formula, but it cannot repair biased data or very small samples.

## Concept

Resampling methods replace difficult mathematical derivations with computation: they approximate the sampling distribution of a statistic by **reusing the observed data** many times.

### The nonparametric bootstrap

Treat the sample as a stand-in for the population. Repeat $B$ times (typically 2,000–10,000):

1. Draw $n$ observations **with replacement** from the data (a [bootstrap](https://en.wikipedia.org/wiki/Bootstrapping_%28statistics%29) sample).
2. Compute the statistic $\hat\theta^{*b}$ (mean, median, correlation, regression coefficient, ratio, AUC, …).

The spread of $\hat\theta^{*1}, \dots, \hat\theta^{*B}$ approximates the sampling distribution of $\hat\theta$:

- **Bootstrap standard error:** $SE^* = \text{sd}(\hat\theta^{*b})$.
- **Bias estimate:** $\overline{\hat\theta^*} - \hat\theta$.

### Bootstrap confidence intervals

| Method | Interval | Notes |
|---|---|---|
| Normal | $\hat\theta \pm 1.96\,SE^*$ | needs an approximately normal sampling distribution |
| **Percentile** | $[\hat\theta^*_{(0.025)}, \hat\theta^*_{(0.975)}]$ | simple, transformation-respecting |
| Basic | $[2\hat\theta - \hat\theta^*_{(0.975)}, 2\hat\theta - \hat\theta^*_{(0.025)}]$ | corrects some bias |
| **BCa** (bias-corrected and accelerated) | adjusted percentiles | best general-purpose accuracy; the default in many libraries |

### When it works — and when it doesn't

- Works well for smooth statistics (means, regression coefficients, correlations, ratios) with moderate $n$.
- Resample the **right units**: whole clusters for clustered data (customers, schools), **blocks** for time series (block bootstrap), pairs $(x_i, y_i)$ or residuals for regression.
- Unreliable for extremes (max, min, extreme quantiles), very small samples, and heavy-tailed data with infinite variance.
- The bootstrap cannot fix a biased or unrepresentative sample.

### Other resampling methods

- **[Permutation tests](https://en.wikipedia.org/wiki/Permutation_test)** — shuffle group labels under $H_0$ to get an exact reference distribution for hypothesis tests (see Non-Parametric Tests).
- **[Jackknife](https://en.wikipedia.org/wiki/Jackknife_resampling)** — leave-one-out recomputation; used for bias/SE estimation and in BCa's acceleration constant.
- **[Cross-validation](https://en.wikipedia.org/wiki/Cross-validation_%28statistics%29)** — split data into $K$ folds, fit on $K-1$, evaluate on the held-out fold; estimates out-of-sample prediction error for model selection (use time-ordered splits for time series).
- **Parametric bootstrap** — simulate new data from a fitted model; useful for complex models and goodness-of-fit.
- **[Monte Carlo simulation](https://en.wikipedia.org/wiki/Monte_Carlo_method)** — more generally, simulate from assumed distributions to study a procedure (power, coverage) or a business outcome (risk).

## Common Mistakes

- Resampling individual rows when the data are clustered or form a time series; resample clusters or blocks instead.
- Using the bootstrap for extreme statistics (minimum, maximum, extreme quantiles) or tiny samples.
- Expecting the bootstrap to correct a non-representative sample.

## When It's Used

The bootstrap is used whenever a standard error or CI is hard to derive: medians and percentiles of latency or delivery times, ratios such as revenue per user or cost-effectiveness ratios in health economics, differences in AUC between models, Gini coefficients and inequality indices, metrics in A/B tests with skewed data, and model stability analysis. Cross-validation is the default method to tune and compare predictive models in machine learning.

## R Code

```r
set.seed(60)
# Skewed metric: revenue per user in an A/B test
control <- c(rep(0, 850), rlnorm(150, log(40), 1.1))
variant <- c(rep(0, 830), rlnorm(170, log(42), 1.1))

# 1. Bootstrap the difference in means (resample within each group)
B <- 5000
boot_diff <- replicate(B, mean(sample(variant, replace = TRUE)) - mean(sample(control, replace = TRUE)))
obs <- mean(variant) - mean(control)
c(estimate = obs, boot_se = sd(boot_diff), bias = mean(boot_diff) - obs)
quantile(boot_diff, c(0.025, 0.975))                          # percentile CI
2 * obs - quantile(boot_diff, c(0.975, 0.025))                # basic CI

# 2. BCa interval for the median of paying users' revenue (by hand)
paying <- variant[variant > 0]
theta_hat <- median(paying)
boot_med <- replicate(B, median(sample(paying, replace = TRUE)))
z0 <- qnorm(mean(boot_med < theta_hat))                       # bias correction
jack <- sapply(seq_along(paying), function(i) median(paying[-i]))
a <- sum((mean(jack) - jack)^3) / (6 * sum((mean(jack) - jack)^2)^1.5)   # acceleration
alphas <- pnorm(z0 + (z0 + qnorm(c(0.025, 0.975))) / (1 - a * (z0 + qnorm(c(0.025, 0.975)))))
c(estimate = theta_hat, quantile(boot_med, alphas))
# with the 'boot' package: boot.ci(boot(paying, function(x, i) median(x[i]), 5000), type = "bca")

# 3. Pairs bootstrap for a regression slope (robust to heteroskedasticity)
x <- runif(80, 0, 10); y <- 3 + 1.2 * x + rnorm(80, 0, 0.4 * x)
boot_slope <- replicate(B, { i <- sample(80, replace = TRUE); coef(lm(y[i] ~ x[i]))[2] })
c(ols_se = coef(summary(lm(y ~ x)))[2, 2], bootstrap_se = sd(boot_slope))

# 4. Permutation test for the difference in means
pooled <- c(control, variant); n1 <- length(variant)
perm <- replicate(B, { s <- sample(pooled); mean(s[1:n1]) - mean(s[-(1:n1)]) })
mean(abs(perm) >= abs(obs))

# 5. 10-fold cross-validation to choose polynomial degree
d <- data.frame(x = runif(200, -3, 3)); d$y <- sin(d$x) + rnorm(200, 0, 0.3)
folds <- sample(rep(1:10, length.out = 200))
cv_err <- sapply(1:6, function(deg) mean(sapply(1:10, function(k) {
  fit <- lm(y ~ poly(x, deg), data = d[folds != k, ])
  mean((d$y[folds == k] - predict(fit, d[folds == k, ]))^2)
})))
round(cv_err, 4); which.min(cv_err)

hist(boot_diff, breaks = 60, main = "Bootstrap distribution of the difference", xlab = "EUR per user")
abline(v = quantile(boot_diff, c(0.025, 0.975)), lty = 2)
```

## Python Code

```python
import numpy as np
import matplotlib.pyplot as plt
from scipy import stats
from sklearn.model_selection import KFold, cross_val_score
from sklearn.pipeline import make_pipeline
from sklearn.preprocessing import PolynomialFeatures
from sklearn.linear_model import LinearRegression

rng = np.random.default_rng(60)
control = np.r_[np.zeros(850), rng.lognormal(np.log(40), 1.1, 150)]
variant = np.r_[np.zeros(830), rng.lognormal(np.log(42), 1.1, 170)]
B = 5000

# 1. Bootstrap difference in means
bd = np.array([rng.choice(variant, variant.size).mean() - rng.choice(control, control.size).mean()
               for _ in range(B)])
obs = variant.mean() - control.mean()
print("estimate:", obs, " SE:", bd.std(ddof=1), " percentile CI:", np.percentile(bd, [2.5, 97.5]))

# scipy's bootstrap handles two samples and BCa directly
res = stats.bootstrap((variant, control), lambda a, b: np.mean(a) - np.mean(b),
                      n_resamples=B, method="BCa", random_state=rng)
print("BCa CI (difference):", res.confidence_interval)

# 2. BCa CI for the median of paying users
paying = variant[variant > 0]
print("median:", np.median(paying),
      stats.bootstrap((paying,), np.median, n_resamples=B, method="BCa", random_state=rng).confidence_interval)

# 3. Pairs bootstrap for a regression slope
x = rng.uniform(0, 10, 80); y = 3 + 1.2 * x + rng.normal(0, 0.4 * x)
slopes = []
for _ in range(B):
    i = rng.integers(0, 80, 80)
    slopes.append(np.polyfit(x[i], y[i], 1)[0])
print("bootstrap SE of slope:", np.std(slopes, ddof=1),
      " OLS SE:", stats.linregress(x, y).stderr)

# 4. Permutation test
perm = stats.permutation_test((variant, control), lambda a, b: np.mean(a) - np.mean(b),
                              n_resamples=B, random_state=rng)
print("permutation p:", perm.pvalue)

# 5. Cross-validation for polynomial degree
X = rng.uniform(-3, 3, (200, 1)); yy = np.sin(X[:, 0]) + rng.normal(0, 0.3, 200)
cv = KFold(10, shuffle=True, random_state=0)
for deg in range(1, 7):
    model = make_pipeline(PolynomialFeatures(deg), LinearRegression())
    mse = -cross_val_score(model, X, yy, cv=cv, scoring="neg_mean_squared_error").mean()
    print(deg, round(mse, 4))

plt.hist(bd, bins=60); plt.axvline(np.percentile(bd, 2.5), ls="--"); plt.axvline(np.percentile(bd, 97.5), ls="--")
plt.title("Bootstrap distribution of the difference"); plt.show()
```

## Software Shortcuts

- **Excel:** a bootstrap sample of a column in A2:A101: `=INDEX($A$2:$A$101, RANDBETWEEN(1, 100))` filled down 100 rows; compute the statistic, then Data → What-If Analysis → **Data Table** (one-variable, empty input cell) to repeat it thousands of times, and take `=PERCENTILE.INC()` of the results. Excel 365: `=INDEX(A2:A101, RANDARRAY(100, 1, 1, 100, TRUE))`.
- **SPSS:** most procedures (Descriptives, Explore, T Tests, Correlations, Regression, GLM) have a **Bootstrap…** button: tick *Perform bootstrapping*, set samples, choose Percentile or BCa, optionally stratify. Requires the Bootstrapping module.
- **Stata:** `bootstrap r(p50), reps(5000) seed(60): summarize revenue, detail` then `estat bootstrap, all` (percentile, BC, BCa); `bootstrap _b, reps(2000) cluster(customer): regress y x`; `permute group diff=r(mu_2)-r(mu_1), reps(5000): ttest revenue, by(group)`; `crossfold` (user-written) for k-fold CV.
- **Google Sheets:** `=INDEX(range, RANDBETWEEN(1, n))` with recalculation, or Apps Script for many replications.

## Industry Examples

**Online experimentation — revenue metrics.** A marketplace's A/B tests use revenue per visitor, which is zero for 90% of visitors and extremely skewed for the rest. The experimentation platform reports bootstrap BCa intervals for the relative difference in means (resampling *users*, not page views, because a user's sessions are correlated) and a bootstrap interval for the 90th percentile of order value. Simulation studies on historical A/A tests confirmed the bootstrap intervals achieve their nominal 95% coverage, while naive t-intervals under-covered for small segments.

**Health economics — cost-effectiveness.** A trial compares a new rehabilitation programme with usual care. The key output is the incremental cost-effectiveness ratio (extra cost per quality-adjusted life year), a ratio of two correlated means with no simple standard error. Health economists bootstrap patients (jointly resampling each patient's cost and QALYs) 10,000 times, plot the cost-effectiveness plane and derive the probability that the programme is cost-effective at a willingness-to-pay threshold — the standard presentation in health technology assessment submissions.

**Credit risk — model comparison.** A lender compares a new gradient-boosting default model with its logistic scorecard on a holdout of 50,000 loans: AUC 0.812 vs. 0.794. A paired bootstrap (resampling loans and recomputing both AUCs on each replicate) gives a 95% CI for the AUC difference of [0.009, 0.027], and 10-fold cross-validation on the development sample shows the gain is stable across folds. Only with this evidence does the model-risk committee approve a challenger trial.

## Practice Questions

*✎ new question added for this site (worked solution below)*

- ✎ You draw $B=5000$ bootstrap samples and compute the median of each. How do you obtain the bootstrap standard error and the 95% percentile interval?
- ✎ Why must bootstrap samples be drawn with replacement and have the same size $n$ as the original sample?

## Solutions

*✎ solution written for this site*

- ✎ Q1: The standard error is the standard deviation of the 5000 bootstrap medians. The percentile interval is formed by their 2.5th and 97.5th percentiles (roughly the 125th and 4875th smallest values).
- ✎ Q2: Resampling with replacement mimics drawing a new random sample from the population (the empirical distribution stands in for it), and keeping the size $n$ reproduces the sampling variability of a sample of that size. Without replacement and with size $n$ you would just reproduce the original sample.
