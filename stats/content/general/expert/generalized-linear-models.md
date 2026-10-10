# Generalized Linear Models (Poisson and Beyond)

## Overview

Generalized linear models extend regression to outcomes that are counts, proportions or positive skewed amounts. Each model combines a distribution for the outcome, a linear predictor and a link function that keeps predictions in the right range. Poisson regression for counts, with its checks for over-dispersion, is the best-known example.

## Concept

[Generalized linear models](https://en.wikipedia.org/wiki/Generalized_linear_model) (GLMs) extend linear regression to responses that are counts, binary, proportions or positive skewed amounts. A GLM has three parts:

1. **Random component** — the response follows an exponential-family distribution (normal, binomial, [Poisson](https://en.wikipedia.org/wiki/Poisson_regression), gamma, inverse Gaussian, negative binomial).
2. **Linear predictor** — $\eta_i = \beta_0 + \beta_1x_{i1} + \dots + \beta_kx_{ik}$.
3. **Link function** $g$ — connects the mean to the linear predictor: $g(\mu_i) = \eta_i$.

| Response | Distribution | Canonical / usual link | Interpretation of $e^{\beta}$ |
|---|---|---|---|
| Continuous, constant variance | Normal | identity | — (additive effect) |
| Binary / proportion | Binomial | logit | odds ratio |
| Counts | Poisson | log | rate ratio |
| Over-dispersed counts | [Negative binomial](https://en.wikipedia.org/wiki/Negative_binomial_distribution) | log | rate ratio |
| Positive, skewed (costs, durations) | Gamma | log | multiplicative effect on the mean |

GLMs are fitted by **maximum likelihood** (iteratively reweighted least squares); inference uses Wald tests, likelihood-ratio tests and **[deviance](https://en.wikipedia.org/wiki/Deviance_%28statistics%29)** $D = 2(\ell_{saturated} - \ell_{model})$.

### Poisson regression

$$y_i \sim \text{Poisson}(\mu_i), \qquad \log\mu_i = \beta_0 + \beta_1x_{i1} + \dots$$

- $e^{\beta_j}$ is the **incidence rate ratio (IRR)**: the multiplicative change in the expected count per unit of $x_j$.
- **Exposure / offset:** when units are observed for different lengths of time or sizes (policy-years, population, km driven), model rates with $\log\mu_i = \log(t_i) + \mathbf x_i^\top\boldsymbol\beta$ — the offset $\log t_i$ has a fixed coefficient of 1.
- Poisson assumes $Var(y) = E(y)$. Real count data are usually **over-dispersed** ($Var > E$), which makes Poisson standard errors too small.

### Handling over-dispersion and zeros

- Check the dispersion statistic $\phi = \frac{\text{Pearson } \chi^2}{n - k - 1}$; values well above 1 indicate over-dispersion.
- **Quasi-Poisson** — same coefficients, SEs scaled by $\sqrt\phi$.
- **Negative binomial** — $Var = \mu + \mu^2/\theta$; a proper likelihood, allows AIC comparison.
- **[Zero-inflated](https://en.wikipedia.org/wiki/Zero-inflated_model) / hurdle models** — when there are more zeros than the count distribution allows (many customers never claim at all).

### Gamma regression for costs

Positive, right-skewed outcomes (claim amounts, hospital costs, repair times) with variance growing with the mean fit a Gamma GLM with log link: coefficients are multiplicative effects on the *mean* cost, avoiding the retransformation problem of regressing $\log y$.

### Model checking

Deviance and Pearson residuals, residuals vs. fitted plots, comparing observed and predicted count frequencies, and AIC/BIC across candidate distributions.

## Common Mistakes

- Using Poisson standard errors when the data are over-dispersed; they are too small and p-values too optimistic.
- Forgetting the exposure offset when units are observed for different lengths of time or sizes.
- Interpreting $e^{\beta}$ of a Poisson model as an additive change in the count; it is a multiplicative rate ratio.

## When It's Used

GLMs are the core of **insurance pricing** (Poisson/negative-binomial claim frequency × gamma severity), epidemiology (disease incidence rates per population, with offsets), traffic safety (accidents per road segment), web analytics (page views, purchases per session), manufacturing (defects per unit), ecology (species counts) and operations (calls, arrivals and failures per period).

## R Code

```r
library(MASS)                                     # glm.nb, ships with R
set.seed(20)
n <- 2000
policies <- data.frame(
  exposure   = round(runif(n, 0.2, 1), 2),       # policy-years
  driver_age = round(runif(n, 18, 80)),
  car_power  = factor(sample(c("low", "mid", "high"), n, TRUE, prob = c(.4, .4, .2)),
                      levels = c("low", "mid", "high")),
  urban      = rbinom(n, 1, 0.55)
)
log_rate <- with(policies, -2.1 + 0.9 * (driver_age < 25) - 0.004 * driver_age +
                   0.25 * (car_power == "mid") + 0.55 * (car_power == "high") + 0.35 * urban)
mu <- policies$exposure * exp(log_rate)
policies$claims <- rnbinom(n, size = 2, mu = mu)          # over-dispersed counts
policies$young <- as.integer(policies$driver_age < 25)

# Poisson frequency model with exposure offset
pois <- glm(claims ~ young + driver_age + car_power + urban + offset(log(exposure)),
            family = poisson, data = policies)
summary(pois)
round(exp(cbind(IRR = coef(pois), confint.default(pois))), 3)

# Over-dispersion check
phi <- sum(residuals(pois, type = "pearson")^2) / pois$df.residual
phi

# Remedies: quasi-Poisson SEs and a negative binomial model
qp <- glm(claims ~ young + driver_age + car_power + urban + offset(log(exposure)),
          family = quasipoisson, data = policies)
nb <- glm.nb(claims ~ young + driver_age + car_power + urban + offset(log(exposure)), data = policies)
cbind(se_poisson = coef(summary(pois))[, 2], se_quasi = coef(summary(qp))[, 2],
      se_negbin = coef(summary(nb))[, 2])
c(AIC_poisson = AIC(pois), AIC_negbin = AIC(nb), theta = nb$theta)

# Observed vs predicted frequency of 0, 1, 2, 3+ claims
mu_nb <- fitted(nb)
pred_freq <- sapply(0:2, function(k) sum(dnbinom(k, size = nb$theta, mu = mu_nb)))
rbind(observed = c(table(factor(pmin(policies$claims, 3), levels = 0:3))),
      negbin = c(pred_freq, n - sum(pred_freq)))

# Severity model: Gamma GLM with log link for claim amounts
claims_amt <- data.frame(car_power = sample(c("low", "mid", "high"), 800, TRUE),
                         urban = rbinom(800, 1, 0.5))
m_sev <- with(claims_amt, exp(7.6 + 0.2 * (car_power == "mid") + 0.45 * (car_power == "high") + 0.1 * urban))
claims_amt$amount <- rgamma(800, shape = 1.8, rate = 1.8 / m_sev)
sev <- glm(amount ~ car_power + urban, family = Gamma(link = "log"), data = claims_amt)
exp(coef(sev))

# Pure premium for a profile = expected frequency x expected severity
profile <- data.frame(young = 1, driver_age = 22, car_power = "high", urban = 1, exposure = 1)
freq <- predict(nb, profile, type = "response")
cost <- predict(sev, data.frame(car_power = "high", urban = 1), type = "response")
c(frequency = unname(freq), severity = unname(cost), pure_premium = unname(freq * cost))
```

## Python Code

```python
import numpy as np
import pandas as pd
import statsmodels.api as sm
import statsmodels.formula.api as smf
from scipy import stats

rng = np.random.default_rng(20)
n = 2000
pol = pd.DataFrame({
    "exposure": np.round(rng.uniform(0.2, 1, n), 2),
    "driver_age": np.round(rng.uniform(18, 80, n)),
    "car_power": rng.choice(["low", "mid", "high"], n, p=[.4, .4, .2]),
    "urban": rng.binomial(1, 0.55, n),
})
pol["young"] = (pol.driver_age < 25).astype(int)
log_rate = (-2.1 + 0.9 * pol.young - 0.004 * pol.driver_age + 0.25 * (pol.car_power == "mid")
            + 0.55 * (pol.car_power == "high") + 0.35 * pol.urban)
mu = pol.exposure * np.exp(log_rate)
size = 2
pol["claims"] = rng.negative_binomial(size, size / (size + mu))

formula = "claims ~ young + driver_age + C(car_power, Treatment('low')) + urban"
pois = smf.glm(formula, data=pol, family=sm.families.Poisson(), offset=np.log(pol.exposure)).fit()
print(pois.summary())
print(np.exp(pd.concat([pois.params, pois.conf_int()], axis=1)).round(3))

phi = pois.pearson_chi2 / pois.df_resid
print("dispersion:", phi)

nb = smf.negativebinomial(formula, data=pol, offset=np.log(pol.exposure)).fit(disp=0)
print(nb.summary())
print("AIC poisson:", pois.aic, " AIC negbin:", nb.aic, " alpha (1/theta):", nb.params["alpha"])

# Gamma severity model
sev = pd.DataFrame({"car_power": rng.choice(["low", "mid", "high"], 800), "urban": rng.binomial(1, 0.5, 800)})
m_sev = np.exp(7.6 + 0.2 * (sev.car_power == "mid") + 0.45 * (sev.car_power == "high") + 0.1 * sev.urban)
sev["amount"] = rng.gamma(1.8, m_sev / 1.8)
gam = smf.glm("amount ~ C(car_power, Treatment('low')) + urban", data=sev,
              family=sm.families.Gamma(link=sm.families.links.Log())).fit()
print(np.exp(gam.params).round(3))

profile = pd.DataFrame({"young": [1], "driver_age": [22], "car_power": ["high"], "urban": [1]})
freq = nb.predict(profile, offset=np.log([1.0]))
cost = gam.predict(profile)
print("pure premium:", float(freq.iloc[0] * cost.iloc[0]))
```

## Software Shortcuts

- **Excel:** no GLM tool; a Poisson model can be fitted by maximising the log-likelihood `=y*LN(mu)-mu-GAMMALN(y+1)` with `mu = EXP(b0+b1*x...)*exposure` using **Solver**. `=POISSON.DIST()` for fitted frequencies.
- **SPSS:** Analyze → **Generalized Linear Models** → Generalized Linear Models → Type of Model (*Poisson loglinear*, *Negative binomial with log link*, *Gamma with log link*, custom); Predictors tab for factors/covariates; *Offset* variable on the Predictors tab (log exposure); Statistics → include exponentiated parameter estimates.
- **Stata:** `poisson claims i.young driver_age i.car_power urban, exposure(exposure) irr`, `estat gof`, `nbreg ... , exposure(exposure) irr`, `glm amount i.car_power urban, family(gamma) link(log) eform`, `zinb` / `zip` for zero inflation.
- **Google Sheets:** Solver add-on approach as in Excel.

## Industry Examples

**Motor insurance — tariff construction.** A European motor insurer prices policies with a frequency–severity GLM: a Poisson (quasi-Poisson) model with log(exposure) offset for claim counts and a Gamma model with log link for claim sizes, using driver age bands, vehicle power, region, bonus-malus class and annual mileage. The multiplicative IRRs become rating factors (e.g. drivers under 25: ×2.4 frequency). The pricing actuaries check that predicted and observed claim counts agree within each factor level before the tariff is filed.

**Public health — disease incidence by district.** An epidemiology team models weekly Lyme-disease cases in 400 districts with a negative-binomial GLM, offset log(population), and covariates for forest cover, altitude and a seasonal term. Over-dispersion is strong ($\phi \approx 4$), so a Poisson model would have declared many spurious risk factors significant. The fitted IRR of 1.32 per 10% forest cover guides where tick-awareness campaigns run.

**Transport safety — crash prediction.** A road authority fits a negative-binomial "safety performance function" to five years of crash counts on 3,000 road segments, with log(traffic volume) and log(segment length) as exposure terms and lane width, curvature and speed limit as predictors. Segments whose observed crashes greatly exceed the model's expectation (empirical Bayes adjusted) are prioritised for engineering reviews, so money goes to genuinely dangerous roads rather than just busy ones.

## Practice Questions

*✎ new question added for this site (worked solution below)*

- ✎ A Poisson regression has $\log\mu=0.5+0.2x$. Find the expected count at $x=2$ and the rate ratio per unit of $x$.
- ✎ Policies are observed for different durations. How do you model the claim count and why?

## Solutions

*✎ solution written for this site*

- ✎ Q1: $\mu(2)=e^{0.5+0.4}=e^{0.9}=2.46$. The rate ratio is $e^{0.2}=1.22$: each unit of $x$ multiplies the expected count by 1.22 (a 22% increase).
- ✎ Q2: Include an offset $\log(t_i)$ with coefficient fixed at 1, so the model describes the claim *rate* per unit of exposure: $\log\mu_i=\log t_i+\mathbf x_i^\top\boldsymbol\beta$.
