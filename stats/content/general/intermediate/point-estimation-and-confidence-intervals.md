# Point Estimation and Confidence Intervals

## Overview

A point estimate is your single best guess for an unknown quantity; a confidence interval says how far off that guess could plausibly be. This page covers how to judge estimators (bias, variance, MSE), how the main estimation methods work, and how to build and interpret confidence intervals.

## Concept

**Estimation** uses a sample to learn the value of an unknown population parameter $\theta$ (a mean, proportion, variance, regression slope). A **point estimate** $\hat\theta$ is a single best guess; a **confidence interval** (CI) is a range that reflects the uncertainty of that guess.

### Properties of estimators

An estimator $\hat\theta$ is a random variable — it changes from sample to sample. We judge it by:

- **[Bias](https://en.wikipedia.org/wiki/Bias_of_an_estimator)** $= E(\hat\theta) - \theta$. Unbiased if the bias is zero. $\bar X$ is unbiased for $\mu$; $s^2$ with divisor $n-1$ is unbiased for $\sigma^2$.
- **Variance / standard error** — how much $\hat\theta$ fluctuates. $SE(\bar X) = \sigma/\sqrt n$.
- **[Mean squared error](https://en.wikipedia.org/wiki/Mean_squared_error)** $MSE = Var(\hat\theta) + \text{bias}^2$ — the overall accuracy; a slightly biased estimator with much smaller variance can be better (shrinkage, regularisation).
- **[Consistency](https://en.wikipedia.org/wiki/Consistent_estimator)** — $\hat\theta \to \theta$ as $n \to \infty$.
- **Efficiency** — the smallest variance among unbiased estimators.

### Methods of estimation

- **[Method of moments](https://en.wikipedia.org/wiki/Method_of_moments_%28statistics%29)** — equate sample moments with theoretical moments and solve.
- **[Maximum likelihood](https://en.wikipedia.org/wiki/Maximum_likelihood_estimation) (MLE)** — choose $\theta$ that makes the observed data most probable: maximise $\ell(\theta) = \sum \log f(x_i; \theta)$. MLEs are consistent, asymptotically normal and efficient under regularity conditions, and are how most models (logistic regression, GLMs, survival models) are fitted.
- **Least squares** — minimise squared deviations; equals the MLE for normal errors.

### Confidence intervals

A $(1-\alpha)$ CI is a random interval that contains the true $\theta$ in $(1-\alpha)\cdot 100\%$ of repeated samples. The general form is

$$\hat\theta \pm (\text{critical value}) \times SE(\hat\theta).$$

| Parameter | Interval | Conditions |
|---|---|---|
| Mean, $\sigma$ known | $\bar x \pm z_{1-\alpha/2}\,\sigma/\sqrt n$ | normal data or large $n$ |
| Mean, $\sigma$ unknown | $\bar x \pm t_{n-1,1-\alpha/2}\,s/\sqrt n$ | normal data or large $n$ |
| Proportion (Wald) | $\hat p \pm z_{1-\alpha/2}\sqrt{\hat p(1-\hat p)/n}$ | $n\hat p$, $n(1-\hat p) \ge 10$ |
| Proportion (Wilson / Clopper-Pearson) | — | better for small $n$ or $p$ near 0/1 |
| Variance | $\left[\frac{(n-1)s^2}{\chi^2_{n-1,1-\alpha/2}}, \frac{(n-1)s^2}{\chi^2_{n-1,\alpha/2}}\right]$ | requires normal data |
| Difference of means | $(\bar x_1 - \bar x_2) \pm t \cdot SE$ | see t-tests |
| Any statistic | bootstrap percentile interval | resampling, few assumptions |

### Interpretation and planning

- **Correct:** "The procedure captures the true mean in 95% of samples; this interval is [4.1, 5.3]."
- **Incorrect:** "There is a 95% probability that $\mu$ lies in [4.1, 5.3]" — in the frequentist view $\mu$ is fixed. (A [Bayesian](https://en.wikipedia.org/wiki/Bayesian_inference) *credible* interval does have that interpretation.)
- The width depends on the confidence level (higher → wider), the variability $\sigma$ (higher → wider) and the sample size (width $\propto 1/\sqrt n$).
- **Sample size for a margin of error $E$:** mean $n = (z\sigma/E)^2$; proportion $n = z^2 p(1-p)/E^2$ (use $p = 0.5$ if unknown).

## Common Mistakes

- Saying "there is a 95% probability that the true mean lies in this interval".
- Using the Wald interval for proportions with very small samples or proportions near 0 or 1.
- Forgetting that the interval is only as reliable as its assumptions (random sample, no bias).

## When It's Used

Every reported estimate should carry an interval: poll results with a margin of error, the average treatment effect of a drug, the conversion uplift of an A/B test, the average fill weight of a production line, a forecast range for next quarter's demand. Sample-size calculations based on CI width decide survey budgets and experiment durations before data are collected.

## R Code

```r
set.seed(21)
# Average handling time (minutes) of 40 support tickets
aht <- rgamma(40, shape = 4, rate = 0.5)
n <- length(aht); xbar <- mean(aht); s <- sd(aht)

# t interval for the mean
se <- s / sqrt(n)
xbar + c(-1, 1) * qt(0.975, n - 1) * se
t.test(aht, conf.level = 0.95)$conf.int                     # same

# Interval for the variance (assumes normality)
(n - 1) * s^2 / qchisq(c(0.975, 0.025), df = n - 1)

# Proportion: 58 of 400 customers churned
x <- 58; m <- 400; p_hat <- x / m
wald <- p_hat + c(-1, 1) * qnorm(0.975) * sqrt(p_hat * (1 - p_hat) / m)
wilson <- prop.test(x, m, correct = FALSE)$conf.int          # Wilson score interval
exact <- binom.test(x, m)$conf.int                           # Clopper-Pearson
rbind(wald = wald, wilson = as.numeric(wilson), exact = as.numeric(exact))

# Maximum likelihood by numerical optimisation: gamma shape and rate
negll <- function(par) -sum(dgamma(aht, shape = exp(par[1]), rate = exp(par[2]), log = TRUE))
fit <- optim(c(0, 0), negll, hessian = TRUE)
mle <- exp(fit$par); names(mle) <- c("shape", "rate"); mle
library(MASS); fitdistr(aht, "gamma")                        # same, with standard errors

# Bootstrap percentile CI for the median
boot_med <- replicate(5000, median(sample(aht, replace = TRUE)))
quantile(boot_med, c(0.025, 0.975))

# Coverage simulation: 95% t intervals from a skewed population
covered <- replicate(5000, {
  y <- rgamma(40, shape = 4, rate = 0.5)
  ci <- mean(y) + c(-1, 1) * qt(0.975, 39) * sd(y) / sqrt(40)
  ci[1] <= 8 && 8 <= ci[2]                                   # true mean = 4 / 0.5 = 8
})
mean(covered)

# Sample size for a margin of error of 0.5 minutes
ceiling((qnorm(0.975) * s / 0.5)^2)
```

## Python Code

```python
import numpy as np
from scipy import stats, optimize
from statsmodels.stats.proportion import proportion_confint

rng = np.random.default_rng(21)
aht = rng.gamma(shape=4, scale=2, size=40)          # scale = 1 / rate
n, xbar, s = len(aht), aht.mean(), aht.std(ddof=1)

se = s / np.sqrt(n)
print("t CI:", stats.t.interval(0.95, df=n - 1, loc=xbar, scale=se))
print("variance CI:", (n - 1) * s**2 / stats.chi2.ppf([0.975, 0.025], n - 1))

x, m = 58, 400
for method in ("normal", "wilson", "beta"):          # beta = Clopper-Pearson
    print(method, proportion_confint(x, m, alpha=0.05, method=method))

# MLE for the gamma distribution
negll = lambda par: -stats.gamma(a=np.exp(par[0]), scale=1 / np.exp(par[1])).logpdf(aht).sum()
res = optimize.minimize(negll, x0=[0.0, 0.0], method="Nelder-Mead")
print("MLE shape, rate:", np.exp(res.x))
a, loc, scale = stats.gamma.fit(aht, floc=0)
print("scipy fit shape, rate:", a, 1 / scale)

# Bootstrap CI for the median
print(stats.bootstrap((aht,), np.median, n_resamples=5000, method="percentile",
                      random_state=rng).confidence_interval)

# Coverage simulation
Y = rng.gamma(4, 2, size=(5000, 40))
half = stats.t.ppf(0.975, 39) * Y.std(axis=1, ddof=1) / np.sqrt(40)
print("coverage:", np.mean(np.abs(Y.mean(axis=1) - 8) <= half))

print("n for ±0.5 min:", int(np.ceil((stats.norm.ppf(0.975) * s / 0.5) ** 2)))
```

## Software Shortcuts

- **Excel:** `=CONFIDENCE.T(alpha, sd, n)` and `=CONFIDENCE.NORM(alpha, sd, n)` return the half-width; build the interval as `=AVERAGE(r) ± CONFIDENCE.T(0.05, STDEV.S(r), COUNT(r))`. Data → Data Analysis → Descriptive Statistics → tick *Confidence Level for Mean*. `=T.INV.2T(0.05, df)` and `=CHISQ.INV.RT(p, df)` give critical values.
- **SPSS:** Analyze → Descriptive Statistics → **Explore** → Statistics → *Descriptives* (95% CI for mean); Analyze → Compare Means → **One-Sample T Test** (CI for the mean difference); bootstrap CIs via the **Bootstrap** button available in most dialogs.
- **Stata:** `ci means aht`, `ci proportions churn, wilson` (or `exact`), `ci variances aht`; `bootstrap r(p50), reps(5000): summarize aht, detail`; `power onemean` for sample size.
- **Google Sheets:** `=CONFIDENCE.T()`, `=CONFIDENCE.NORM()`, `=T.INV.2T()`.

## Industry Examples

**Customer service — SLA reporting.** A software company reports that mean first-response time last month was 3.8 hours. The operations lead adds the 95% t interval [3.4, 4.2] computed from 612 tickets and, because response times are right-skewed, a bootstrap interval for the median [2.1, 2.6]. When the median CI for one region lay entirely above the 4-hour SLA, the company added staff there instead of across all regions.

**Polling and media — margin of error.** A newspaper poll of 1,000 adults finds 46% support for a policy. The Wald 95% interval is 46% ± 3.1 points; the paper reports "±3 points". For a subgroup of 180 young voters with 62% support, the interval widens to ±7.1 points, and the editor removes a headline claiming "a majority of young voters" is "overwhelming" — the interval spans 55%–69%.

**Pharmaceutical manufacturing — potency assurance.** A QC lab measures tablet potency in 30 tablets from a batch: mean 99.2% of label claim, SD 1.4%. The 95% CI for the mean [98.7, 99.7] and the 95% CI for the SD [1.1, 1.9] (chi-square interval) both feed the batch release decision; regulators also expect tolerance intervals covering 99% of individual tablets, which require the variance estimate and are wider than the CI for the mean.

## Practice Questions

*✎ new question added for this site (worked solution below)*

- ✎ A sample of $n=64$ has mean 50 and standard deviation 8. Give a 95% confidence interval for the mean ($t_{63,0.975}=2.00$).
- ✎ How large a sample is needed to estimate a proportion within ±2 percentage points with 95% confidence (worst case)?

## Solutions

*✎ solution written for this site*

- ✎ Q1: $SE=8/\sqrt{64}=1$, so $50\pm2.00\cdot1=[48.0,\,52.0]$.
- ✎ Q2: $n=\frac{1.96^2\cdot0.25}{0.02^2}=2401$.
