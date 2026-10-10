# Causal Inference and Difference-in-Differences

## Overview

Correlation is not causation; causal inference is the toolkit for getting from one to the other. Randomised experiments are the gold standard. When they are impossible, designs such as difference-in-differences, instrumental variables or regression discontinuity use specific assumptions to recover causal effects from observational data. Each design stands or falls with its key assumption.

## Concept

Most business and policy questions are causal — *what happens to sales if we raise the price? does the training programme raise earnings?* — but observational data show correlations that mix causal effects with **confounding** and **selection**.

### Potential outcomes

Each unit has two [potential outcomes](https://en.wikipedia.org/wiki/Rubin_causal_model): $Y_i(1)$ if treated and $Y_i(0)$ if not. The individual effect $Y_i(1) - Y_i(0)$ is never observed (the fundamental problem of causal inference), so we estimate averages:

- **ATE** $= E[Y(1) - Y(0)]$ — average effect in the population.
- **ATT** $= E[Y(1) - Y(0) \mid D = 1]$ — average effect on those actually treated.

A naive comparison equals

$$E[Y \mid D=1] - E[Y \mid D=0] = \text{ATT} + \underbrace{E[Y(0)\mid D=1] - E[Y(0)\mid D=0]}_{\text{selection bias}}.$$

### Identification strategies

| Strategy | Key assumption | Example |
|---|---|---|
| **[Randomised experiment](https://en.wikipedia.org/wiki/Randomized_controlled_trial) (RCT, A/B test)** | random assignment → no selection bias | clinical trials, product experiments |
| **Regression / matching / [propensity scores](https://en.wikipedia.org/wiki/Propensity_score_matching)** | no unmeasured confounders (selection on observables) | observational health data |
| **[Difference-in-differences](https://en.wikipedia.org/wiki/Difference_in_differences) (DiD)** | parallel trends | policy changes in some regions |
| **[Instrumental variables](https://en.wikipedia.org/wiki/Instrumental_variables) (IV)** | instrument affects $Y$ only through $D$ | distance to college → education |
| **[Regression discontinuity](https://en.wikipedia.org/wiki/Regression_discontinuity_design) (RD)** | units just above/below a cutoff are comparable | scholarship at a test-score threshold |
| **[Synthetic control](https://en.wikipedia.org/wiki/Synthetic_control_method)** | weighted combination of controls reproduces the pre-trend | one treated region/country |

Causal diagrams (**DAGs**) help decide which variables to control for: adjust for **confounders** (common causes of $D$ and $Y$), but **not** for mediators (on the path $D \to M \to Y$) or colliders (common effects), which can introduce bias.

### Difference-in-differences

Compare the **change** in outcomes for a treated group with the change for a control group:

$$\hat\tau_{DiD} = (\bar Y_{T,\text{post}} - \bar Y_{T,\text{pre}}) - (\bar Y_{C,\text{post}} - \bar Y_{C,\text{pre}}).$$

The first difference removes time-constant differences between groups; the second removes common time shocks. In regression form (2×2 case):

$$Y_{it} = \beta_0 + \beta_1\,\text{Treat}_i + \beta_2\,\text{Post}_t + \tau\,(\text{Treat}_i \times \text{Post}_t) + \varepsilon_{it},$$

or, with panel data, **two-way fixed effects**: $Y_{it} = \alpha_i + \gamma_t + \tau D_{it} + \mathbf x_{it}^\top\boldsymbol\beta + \varepsilon_{it}$.

**Assumptions and checks**

- **Parallel trends:** without treatment, both groups would have followed the same trend. Check pre-treatment trends in a plot and with an **event-study** regression (leads should be ≈ 0).
- No anticipation, no spillovers to the control group, stable group composition.
- Use **cluster-robust standard errors** at the level of treatment assignment (state, store, school).
- With **staggered adoption** (units treated at different times) and heterogeneous effects, classic two-way fixed effects can be badly biased; use modern estimators (Callaway-Sant'Anna, Sun-Abraham, stacked DiD).

## Common Mistakes

- Controlling for mediators or colliders, which can introduce bias instead of removing it.
- Applying difference-in-differences without checking pre-treatment trends.
- Reporting a regression coefficient as a causal effect without arguing why no unmeasured confounder remains.

## When It's Used

Causal methods are used to evaluate public policies (minimum wages, tax changes, health reforms), measure the impact of business interventions that cannot be randomised (store remodels, regional price changes, new loyalty programmes), estimate marketing incrementality (geo experiments, lift studies), assess medical treatments from registry data, and in any analysis where the decision depends on *what would have happened otherwise*.

## R Code

```r
set.seed(50)
# 40 stores observed for 24 months; 20 stores get a remodel in month 13
stores <- 40; months <- 24
panel <- expand.grid(store = 1:stores, month = 1:months)
panel$treated <- as.integer(panel$store <= 20)
panel$post <- as.integer(panel$month >= 13)
store_effect <- rnorm(stores, 0, 15)                        # time-invariant differences
month_effect <- 2 * (1:months) + 8 * sin(2 * pi * (1:months) / 12)   # common trend + seasonality
tau <- 12                                                   # true effect of the remodel
panel$sales <- 200 + 25 * panel$treated + store_effect[panel$store] + month_effect[panel$month] +
  tau * panel$treated * panel$post + rnorm(nrow(panel), 0, 6)

# Naive comparisons are biased
with(panel, mean(sales[treated == 1 & post == 1]) - mean(sales[treated == 0 & post == 1]))  # cross-section
with(panel, mean(sales[treated == 1 & post == 1]) - mean(sales[treated == 1 & post == 0]))  # before/after

# 2x2 DiD by hand
m <- with(panel, tapply(sales, list(treated, post), mean))
(m["1", "1"] - m["1", "0"]) - (m["0", "1"] - m["0", "0"])

# Regression DiD with store and month fixed effects
fit <- lm(sales ~ factor(store) + factor(month) + I(treated * post), data = panel)
coef(fit)["I(treated * post)"]

# Cluster-robust SE by store (sandwich formula by hand)
X <- model.matrix(fit); e <- resid(fit); cl <- panel$store
bread <- solve(crossprod(X))
meat <- Reduce(`+`, lapply(split(seq_len(nrow(X)), cl), function(i) {
  s <- crossprod(X[i, , drop = FALSE], e[i]); s %*% t(s) }))
G <- length(unique(cl)); N <- nrow(X); K <- ncol(X)
V <- (G / (G - 1)) * ((N - 1) / (N - K)) * bread %*% meat %*% bread
j <- which(colnames(X) == "I(treated * post)")
c(estimate = unname(coef(fit)[j]), cluster_se = sqrt(V[j, j]))
# with packages: fixest::feols(sales ~ i(post, treated) | store + month, cluster = ~store)

# Event study: effects by month relative to treatment (reference month 12)
panel$rel <- ifelse(panel$treated == 1, panel$month - 13, NA)
for (k in setdiff(-12:11, -1)) panel[[paste0("rel_", k + 100)]] <- as.integer(!is.na(panel$rel) & panel$rel == k)
es_vars <- grep("^rel_", names(panel), value = TRUE)
es <- lm(reformulate(c("factor(store)", "factor(month)", es_vars), "sales"), data = panel)
est <- coef(es)[es_vars]
plot(as.integer(sub("rel_", "", es_vars)) - 100, est, pch = 19, xlab = "months relative to remodel",
     ylab = "effect", main = "Event study (pre-trends should be near 0)")
abline(h = 0, lty = 2); abline(v = -0.5, lty = 3)

# Parallel-trends plot
trend <- aggregate(sales ~ month + treated, data = panel, FUN = mean)
plot(sales ~ month, data = trend[trend$treated == 1, ], type = "l", ylim = range(trend$sales),
     main = "Average sales by group"); lines(sales ~ month, data = trend[trend$treated == 0, ], lty = 2)
abline(v = 12.5, lty = 3)
```

## Python Code

```python
import numpy as np
import pandas as pd
import matplotlib.pyplot as plt
import statsmodels.formula.api as smf

rng = np.random.default_rng(50)
stores, months = 40, 24
panel = pd.MultiIndex.from_product([range(1, stores + 1), range(1, months + 1)],
                                   names=["store", "month"]).to_frame(index=False)
panel["treated"] = (panel.store <= 20).astype(int)
panel["post"] = (panel.month >= 13).astype(int)
store_eff = rng.normal(0, 15, stores + 1)
m = np.arange(1, months + 1)
month_eff = dict(zip(m, 2 * m + 8 * np.sin(2 * np.pi * m / 12)))
tau = 12
panel["sales"] = (200 + 25 * panel.treated + store_eff[panel.store] + panel.month.map(month_eff)
                  + tau * panel.treated * panel.post + rng.normal(0, 6, len(panel)))

g = panel.groupby(["treated", "post"])["sales"].mean()
print("naive cross-section:", g[1, 1] - g[0, 1], " naive before/after:", g[1, 1] - g[1, 0])
print("2x2 DiD:", (g[1, 1] - g[1, 0]) - (g[0, 1] - g[0, 0]))

panel["did"] = panel.treated * panel.post
twfe = smf.ols("sales ~ did + C(store) + C(month)", data=panel).fit(
    cov_type="cluster", cov_kwds={"groups": panel.store})
print("TWFE estimate:", twfe.params["did"], " cluster SE:", twfe.bse["did"])

# Event study
panel["rel"] = np.where(panel.treated == 1, panel.month - 13, np.nan)
rel_cols = []
for k in range(-12, 12):
    if k == -1:
        continue
    col = f"rel_{k + 100}"
    panel[col] = (panel.rel == k).astype(int)
    rel_cols.append(col)
es = smf.ols("sales ~ " + " + ".join(rel_cols) + " + C(store) + C(month)", data=panel).fit(
    cov_type="cluster", cov_kwds={"groups": panel.store})
ks = [int(c[4:]) - 100 for c in rel_cols]
plt.errorbar(ks, es.params[rel_cols], yerr=1.96 * es.bse[rel_cols], fmt="o")
plt.axhline(0, ls="--"); plt.axvline(-0.5, ls=":")
plt.xlabel("months relative to remodel"); plt.title("Event study"); plt.show()

panel.groupby(["month", "treated"])["sales"].mean().unstack().plot()
plt.axvline(12.5, ls=":"); plt.title("Average sales by group"); plt.show()
```

## Software Shortcuts

- **Excel:** compute the four group means with a PivotTable (rows: treated, columns: post, values: average sales) and take the difference of differences; plot group averages over time with a line chart to eyeball parallel trends. Regression DiD: Data Analysis → Regression with columns treated, post and treated×post (no clustered SEs).
- **SPSS:** Analyze → General Linear Model → **Univariate** with treated, post and their interaction; Analyze → Mixed Models → **Linear** for panel data with store random effects; clustered SEs require syntax (GENLIN with repeated subjects) or extensions.
- **Stata:** `regress sales i.treated##i.post, vce(cluster store)`; `xtset store month` + `xtreg sales did i.month, fe vce(cluster store)`; `didregress (sales) (did), group(store) time(month)` (Stata 17+); `estat trendplots`, `estat ptrends`; `csdid` / `jwdid` (user-written) for staggered adoption.
- **Google Sheets:** pivot table of group means and a line chart, as in Excel.

## Industry Examples

**Labour economics — minimum wage.** A classic study compared fast-food employment in New Jersey (which raised its minimum wage in 1992) with neighbouring eastern Pennsylvania (which did not), before and after the increase. The DiD estimate found no employment loss, challenging the textbook prediction and launching decades of research that uses DiD, event studies and synthetic controls to evaluate minimum-wage changes across states and countries.

**Retail — store remodel evaluation.** A home-improvement chain remodels 60 of its 400 stores in spring. Because remodelled stores were chosen for being larger and growing, a before/after comparison would overstate the effect. Analysts match each remodelled store to control stores with similar size and pre-period sales trends, run a DiD with store and week fixed effects, and verify flat pre-trends in an event-study plot. The estimated uplift is +4.2% weekly sales (95% CI 2.1–6.3%, clustered by store), which feeds the business case for the next remodel wave.

**Marketing — geo-experiment for TV advertising.** A streaming service cannot randomise TV exposure per person, so it runs TV ads in 30 randomly selected regional markets and holds out 30 comparable markets. Sign-ups are analysed with a DiD over the 8 weeks before and 6 weeks during the campaign, with market and week fixed effects. The incremental cost per acquisition from this design is roughly double what last-click attribution reported, and the budget is reallocated accordingly.

## Practice Questions

*✎ new question added for this site (worked solution below)*

- ✎ Treated stores: average sales 50 before and 62 after a remodel. Control stores: 48 before and 54 after. Compute the difference-in-differences estimate.
- ✎ Which assumption must hold for the estimate to be causal, and how can you examine it?

## Solutions

*✎ solution written for this site*

- ✎ Q1: Treated change $62-50=12$; control change $54-48=6$. DiD $=12-6=6$ sales units.
- ✎ Q2: Parallel trends: without the remodel, treated and control stores would have developed in parallel. Check the pre-treatment trends in a plot and with an event-study regression (the lead coefficients should be close to zero).
