# Correlation

## Overview

Correlation condenses the strength and direction of an association between two variables into one number between −1 and +1. Pearson's coefficient captures linear association, rank correlations capture monotone association. A correlation never proves causation, and a single number can hide outliers or curvature, so always look at the scatter plot.

## Concept

Correlation measures the **strength and direction of association** between two variables with a single number between −1 and +1.

### Covariance

$$s_{xy} = \frac{1}{n-1}\sum_{i=1}^n (x_i - \bar x)(y_i - \bar y)$$

Positive when large $x$ go with large $y$, negative when large $x$ go with small $y$. Its size depends on the units, so it is hard to interpret on its own.

### Pearson correlation

$$r = \frac{s_{xy}}{s_x s_y} \in [-1, 1]$$

- Measures **linear** association only. $r = 0$ does not rule out a strong non-linear relationship (e.g. $y = x^2$ on a symmetric range).
- Unit-free and unchanged by positive linear transformations of either variable.
- Sensitive to outliers: a single extreme point can create or destroy a correlation.
- $r^2$ is the share of variance of $y$ explained by a linear regression on $x$.

### Rank correlations

- **[Spearman's](https://en.wikipedia.org/wiki/Spearman's_rank_correlation_coefficient) $\rho_S$** — Pearson correlation of the ranks; measures **monotonic** association and is robust to outliers. Without ties, $\rho_S = 1 - \frac{6\sum d_i^2}{n(n^2-1)}$.
- **[Kendall's](https://en.wikipedia.org/wiki/Kendall_rank_correlation_coefficient) $\tau$** — based on concordant vs. discordant pairs; smaller in magnitude than Spearman but with better statistical properties for small samples and many ties.

Use rank correlations for ordinal data, skewed data or suspected outliers.

### Inference

- Test of $H_0: \rho = 0$ (bivariate normal data): $T = r\sqrt{\frac{n-2}{1-r^2}} \sim t_{n-2}$.
- Confidence interval via **[Fisher's z](https://en.wikipedia.org/wiki/Fisher_transformation)**: $z = \operatorname{artanh}(r)$, $SE = 1/\sqrt{n-3}$; back-transform the limits with $\tanh$.
- With big data, tiny correlations become "significant" — look at the size and the CI.

### Rough guide to magnitude

| $|r|$ | Description |
|---|---|
| < 0.1 | negligible |
| 0.1 – 0.3 | weak |
| 0.3 – 0.5 | moderate |
| > 0.5 | strong |

Context matters: in physics 0.9 may be poor; in social science 0.3 can be important.

### Correlation is not causation

A correlation can arise from a **[confounder](https://en.wikipedia.org/wiki/Confounding)** (ice-cream sales and drownings both follow temperature), **reverse causation**, **selection** (only admitted students are observed), **aggregation** ([ecological fallacy](https://en.wikipedia.org/wiki/Ecological_fallacy), [Simpson's paradox](https://en.wikipedia.org/wiki/Simpson's_paradox)) or **chance** in large searches (spurious correlations). Causal claims need experimental design or careful causal modelling.

### Partial correlation and correlation matrices

- **Partial correlation** $r_{xy \cdot z}$ — the correlation of $x$ and $y$ after removing the linear effect of $z$ from both.
- **Correlation matrices / heatmaps** summarise many variables and reveal multicollinearity before regression.

## When It's Used

Correlation is used for feature screening before modelling, portfolio construction (diversification depends on asset correlations), survey analysis (item-total correlations, test-retest reliability), marketing mix analysis (spend vs. sales), sensor validation (two instruments measuring the same thing) and quick exploratory analysis of any pair of metrics.

## R Code

```r
set.seed(8)
n <- 150
temperature <- runif(n, 5, 35)
ice_cream <- 200 + 12 * temperature + rnorm(n, 0, 60)
swim_accidents <- rpois(n, lambda = exp(-1 + 0.08 * temperature))
ad_spend <- rlnorm(n, 3, 0.8)
sales <- 50 + 30 * log(ad_spend) + rnorm(n, 0, 15)

# Pearson, Spearman, Kendall
c(pearson = cor(ad_spend, sales),
  spearman = cor(ad_spend, sales, method = "spearman"),
  kendall = cor(ad_spend, sales, method = "kendall"))

# Test and Fisher-z confidence interval
cor.test(temperature, ice_cream)
r <- cor(temperature, ice_cream)
tanh(atanh(r) + c(-1, 1) * qnorm(0.975) / sqrt(n - 3))

# Spurious association through a confounder, and the partial correlation
cor(ice_cream, swim_accidents)
res_ic <- resid(lm(ice_cream ~ temperature))
res_sw <- resid(lm(swim_accidents ~ temperature))
cor(res_ic, res_sw)                                   # partial correlation given temperature

# r = 0 despite a perfect relationship
x <- seq(-3, 3, length.out = 61)
cor(x, x^2)

# Outlier sensitivity
x2 <- c(rnorm(30), 8); y2 <- c(rnorm(30), 8)
c(pearson = cor(x2, y2), spearman = cor(x2, y2, method = "spearman"))

# Correlation matrix and heatmap
M <- cor(data.frame(temperature, ice_cream, swim_accidents, ad_spend, sales))
round(M, 2)
heatmap(M, symm = TRUE, Rowv = NA, Colv = NA, scale = "none", margins = c(9, 9))
```

## Python Code

```python
import numpy as np
import pandas as pd
import matplotlib.pyplot as plt
from scipy import stats

rng = np.random.default_rng(8)
n = 150
df = pd.DataFrame({"temperature": rng.uniform(5, 35, n), "ad_spend": rng.lognormal(3, 0.8, n)})
df["ice_cream"] = 200 + 12 * df.temperature + rng.normal(0, 60, n)
df["swim_accidents"] = rng.poisson(np.exp(-1 + 0.08 * df.temperature))
df["sales"] = 50 + 30 * np.log(df.ad_spend) + rng.normal(0, 15, n)

for method in ("pearson", "spearman", "kendall"):
    print(method, round(df.ad_spend.corr(df.sales, method=method), 3))

res = stats.pearsonr(df.temperature, df.ice_cream)
print(res, res.confidence_interval(0.95))          # Fisher-z interval

# Partial correlation given temperature via residuals
def resid(y, x):
    b = np.polyfit(x, y, 1)
    return y - np.polyval(b, x)

print("raw:", df.ice_cream.corr(df.swim_accidents),
      " partial:", np.corrcoef(resid(df.ice_cream, df.temperature),
                               resid(df.swim_accidents, df.temperature))[0, 1])

x = np.linspace(-3, 3, 61)
print("cor(x, x^2):", np.corrcoef(x, x**2)[0, 1])

x2 = np.r_[rng.normal(size=30), 8]; y2 = np.r_[rng.normal(size=30), 8]
print("outlier -> pearson:", stats.pearsonr(x2, y2)[0], " spearman:", stats.spearmanr(x2, y2)[0])

M = df.corr()
print(M.round(2))
plt.imshow(M, cmap="RdBu_r", vmin=-1, vmax=1)
plt.xticks(range(len(M)), M.columns, rotation=45, ha="right"); plt.yticks(range(len(M)), M.columns)
plt.colorbar(); plt.tight_layout(); plt.show()
```

## Software Shortcuts

- **Excel:** `=CORREL(x, y)` or `=PEARSON(x, y)`; `=RSQ(x, y)` for $r^2$; `=COVARIANCE.S(x, y)`. Spearman: rank both columns with `=RANK.AVG(x, range, 1)` and apply `=CORREL()` to the ranks. Data → Data Analysis → **Correlation** builds a full matrix. Fisher z: `=FISHER(r)` and `=FISHERINV(z)`.
- **SPSS:** Analyze → Correlate → **Bivariate** (tick Pearson, Kendall's tau-b, Spearman; significance flags); Analyze → Correlate → **Partial** for partial correlations.
- **Stata:** `correlate x y z`, `pwcorr x y z, sig obs`, `spearman x y`, `ktau x y`, `pcorr y x z`.
- **Google Sheets:** `=CORREL()`, `=PEARSON()`, `=RSQ()`, `=RANK.AVG()`.

## Industry Examples

**Asset management — diversification.** A multi-asset fund estimates a 36-month correlation matrix of equity, bond, commodity and real-estate returns. The equity–government-bond correlation of −0.3 historically justified a 60/40 portfolio, but a rolling 12-month correlation turned positive (+0.5) during an inflation shock, sharply reducing diversification. The risk team now stress-tests portfolios with correlation matrices from high-inflation regimes rather than a single long-run estimate.

**Psychometrics — questionnaire validation.** An HR firm develops a 10-item engagement survey. It computes item-total Spearman correlations (Likert items are ordinal) on 2,300 responses and drops two items with $\rho_S < 0.2$. Test-retest reliability over two weeks is $r = 0.81$ (95% CI 0.76–0.85 via Fisher z) on a subsample of 150 employees — the figure reported to clients as evidence that the score is stable.

**Retail analytics — the confounder trap.** A grocery chain finds a correlation of 0.62 between umbrella sales and hot-soup sales across stores and days. Before anyone plans a cross-promotion, an analyst computes the partial correlation controlling for daily rainfall and temperature: it drops to 0.04. Both products respond to weather; the chain instead feeds the weather forecast into its demand-planning model for both categories.

## Practice Questions

*✎ new question added for this site (worked solution below)*

- ✎ Two judges rank 10 contestants; the squared rank differences sum to 10. Compute Spearman's coefficient.
- ✎ From $n=27$ pairs of normal data you obtain $r=0.5$. Test $H_0:\rho=0$ at the 5% level.

## Solutions

*✎ solution written for this site*

- ✎ Q1: $\rho_S=1-\frac{6\cdot10}{10\cdot(100-1)}=0.939$: the rankings agree strongly.
- ✎ Q2: $T=0.5\sqrt{\frac{25}{1-0.25}}=2.89$ with 25 df; $t_{25,0.975}=2.06$, so reject $H_0$ ($p\approx0.008$).
