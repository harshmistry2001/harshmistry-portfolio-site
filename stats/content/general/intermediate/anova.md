# Analysis of Variance (ANOVA)

## Overview

ANOVA tests whether three or more group means are equal by asking whether the differences between group averages are large compared with the scatter inside the groups. It answers "is there any difference?"; post-hoc tests then say which groups differ. Two-way ANOVA adds a second factor and checks for interaction.

## Concept

[ANOVA](https://en.wikipedia.org/wiki/Analysis_of_variance) tests whether the means of three or more groups are equal by comparing variation **between** groups with variation **within** groups. Running many pairwise t-tests instead would inflate the type I error.

### One-way ANOVA

Model: $y_{ij} = \mu + \alpha_i + \varepsilon_{ij}$, group $i = 1..k$, observation $j = 1..n_i$, $\varepsilon_{ij} \sim N(0, \sigma^2)$.

$H_0: \mu_1 = \mu_2 = \dots = \mu_k$ vs. $H_1$: at least two means differ.

$$SST = \underbrace{\sum_i n_i(\bar y_i - \bar y)^2}_{SSB \text{ (between)}} + \underbrace{\sum_i\sum_j (y_{ij} - \bar y_i)^2}_{SSW \text{ (within)}}$$

| Source | SS | df | MS | F |
|---|---|---|---|---|
| Between groups | $SSB$ | $k-1$ | $MSB = SSB/(k-1)$ | $F = MSB/MSW$ |
| Within groups | $SSW$ | $N-k$ | $MSW = SSW/(N-k)$ | |
| Total | $SST$ | $N-1$ | | |

Reject $H_0$ if $F > F_{k-1,\,N-k,\,1-\alpha}$. **Effect size:** $\eta^2 = SSB/SST$ (share of variance explained by group membership); $\omega^2$ is a less biased alternative.

### Assumptions

1. Independent observations; 2. normal residuals within groups (robust with moderate, balanced $n$); 3. **equal variances** (check with [Levene's test](https://en.wikipedia.org/wiki/Levene's_test); if violated use **Welch's ANOVA**). If normality fails badly with small samples, use **[Kruskal-Wallis](https://en.wikipedia.org/wiki/Kruskal%E2%80%93Wallis_test)**.

### Post-hoc comparisons

A significant F-test says "some means differ", not which. Follow up with:

- **[Tukey HSD](https://en.wikipedia.org/wiki/Tukey's_range_test)** — all pairwise comparisons, controls the family-wise error rate; Tukey-Kramer for unequal $n$.
- **[Dunnett](https://en.wikipedia.org/wiki/Dunnett's_test)** — each treatment vs. one control.
- **Bonferroni / Holm** — any planned set of comparisons.
- **Games-Howell** — pairwise comparisons with unequal variances.

### Two-way ANOVA

Two factors $A$ and $B$ with interaction:

$$y_{ijk} = \mu + \alpha_i + \beta_j + (\alpha\beta)_{ij} + \varepsilon_{ijk}.$$

It tests main effects of $A$ and $B$ and their **interaction** (does the effect of $A$ depend on the level of $B$?). Interpret a significant interaction first — with non-parallel lines in an interaction plot, main effects alone are misleading. With unbalanced designs, type II or type III sums of squares give different results; state which you use.

### Related designs

- **Repeated-measures ANOVA** — the same subjects under several conditions (accounts for within-subject correlation; check sphericity), or better, a mixed-effects model.
- **[ANCOVA](https://en.wikipedia.org/wiki/Analysis_of_covariance)** — ANOVA plus a continuous covariate (e.g. baseline score) to reduce noise.
- ANOVA is a special case of linear regression with dummy variables: the overall F-test of the regression equals the ANOVA F-test.

## Common Mistakes

- Running all pairwise t-tests instead of ANOVA plus a post-hoc procedure (inflated false-positive rate).
- Interpreting main effects in two-way ANOVA while a significant interaction is present.
- Reporting only the p-value; add an effect size such as $\eta^2$ and a plot of the group means.

## When It's Used

ANOVA compares multiple variants at once: several website layouts or price points, fertilisers or crop varieties, teaching methods, production lines or suppliers, drug doses in a dose-finding trial. Two-way ANOVA and factorial designs are the backbone of **[design of experiments](https://en.wikipedia.org/wiki/Design_of_experiments) (DoE)** in manufacturing and R&D, where engineers study several process settings and their interactions with few runs.

## R Code

```r
set.seed(4)
# Checkout conversion value (EUR per visitor) for four page layouts
layout <- factor(rep(c("A", "B", "C", "D"), each = 30))
value <- c(rnorm(30, 5.0, 1.5), rnorm(30, 5.3, 1.5), rnorm(30, 6.1, 1.5), rnorm(30, 5.1, 1.5))
d <- data.frame(layout, value)

fit <- aov(value ~ layout, data = d)
summary(fit)

# ANOVA table by hand
grand <- mean(d$value); means <- tapply(d$value, d$layout, mean); n_i <- table(d$layout)
SSB <- sum(n_i * (means - grand)^2); SSW <- sum((d$value - means[d$layout])^2)
k <- nlevels(d$layout); N <- nrow(d)
F_stat <- (SSB / (k - 1)) / (SSW / (N - k))
c(SSB = SSB, SSW = SSW, F = F_stat, p = pf(F_stat, k - 1, N - k, lower.tail = FALSE),
  eta_sq = SSB / (SSB + SSW))

# Assumption checks and robust alternatives
bartlett.test(value ~ layout, data = d)          # equal variances (normal data)
oneway.test(value ~ layout, data = d)            # Welch ANOVA (unequal variances)
kruskal.test(value ~ layout, data = d)           # rank-based alternative
shapiro.test(resid(fit))

# Post-hoc
TukeyHSD(fit)
pairwise.t.test(d$value, d$layout, p.adjust.method = "holm")

# Two-way ANOVA: machine x material with interaction (factorial DoE)
exp_design <- expand.grid(machine = c("M1", "M2", "M3"), material = c("steel", "alloy"), rep = 1:5)
eff <- with(exp_design, 50 + 3 * (machine == "M2") + 5 * (material == "alloy") +
              6 * (machine == "M3" & material == "alloy"))
exp_design$strength <- eff + rnorm(nrow(exp_design), 0, 2)
fit2 <- aov(strength ~ machine * material, data = exp_design)
summary(fit2)
with(exp_design, interaction.plot(machine, material, strength, ylab = "mean strength"))

# Same one-way model as a regression: identical F statistic
summary(lm(value ~ layout, data = d))$fstatistic
```

## Python Code

```python
import numpy as np
import pandas as pd
import matplotlib.pyplot as plt
from scipy import stats
import statsmodels.api as sm
from statsmodels.formula.api import ols
from statsmodels.stats.multicomp import pairwise_tukeyhsd

rng = np.random.default_rng(4)
d = pd.DataFrame({"layout": np.repeat(list("ABCD"), 30),
                  "value": np.r_[rng.normal(5.0, 1.5, 30), rng.normal(5.3, 1.5, 30),
                                 rng.normal(6.1, 1.5, 30), rng.normal(5.1, 1.5, 30)]})

fit = ols("value ~ C(layout)", data=d).fit()
table = sm.stats.anova_lm(fit, typ=2)
table["eta_sq"] = table["sum_sq"] / table["sum_sq"].sum()
print(table)

groups = [g.values for _, g in d.groupby("layout")["value"]]
print(stats.f_oneway(*groups))
print("Levene:", stats.levene(*groups))
print("Kruskal:", stats.kruskal(*groups))
print("Alexander-Govern (heteroskedasticity-robust):", stats.alexandergovern(*groups))

print(pairwise_tukeyhsd(d["value"], d["layout"], alpha=0.05))

# Two-way ANOVA with interaction
design = pd.DataFrame([(m, mat) for m in ["M1", "M2", "M3"] for mat in ["steel", "alloy"] for _ in range(5)],
                      columns=["machine", "material"])
design["strength"] = (50 + 3 * (design.machine == "M2") + 5 * (design.material == "alloy")
                      + 6 * ((design.machine == "M3") & (design.material == "alloy"))
                      + rng.normal(0, 2, len(design)))
fit2 = ols("strength ~ C(machine) * C(material)", data=design).fit()
print(sm.stats.anova_lm(fit2, typ=2))

design.groupby(["machine", "material"])["strength"].mean().unstack().plot(marker="o")
plt.ylabel("mean strength"); plt.show()
```

## Software Shortcuts

- **Excel:** Data → Data Analysis → **Anova: Single Factor** (groups in adjacent columns), **Anova: Two-Factor With Replication** (factorial with repeats) and **Without Replication**. `=F.DIST.RT(F, df1, df2)` for p-values, `=F.INV.RT(alpha, df1, df2)` for critical values. No built-in post-hoc tests.
- **SPSS:** Analyze → Compare Means → **One-Way ANOVA** (Post Hoc → Tukey, Games-Howell, Dunnett; Options → Homogeneity of variance test, Welch); Analyze → General Linear Model → **Univariate** for two-way/factorial ANOVA and ANCOVA (Plots → profile plots; EM Means for adjusted means); **Repeated Measures** for within-subject designs.
- **Stata:** `oneway value layout, tabulate bonferroni`, `anova strength machine##material`, `pwcompare layout, mcompare(tukey) effects`, `margins machine#material` + `marginsplot`, `robvar value, by(layout)` (Levene).
- **Google Sheets:** no ANOVA tool built in; compute SSB/SSW with `=SUMPRODUCT()` or use the XLMiner Analysis ToolPak add-on.

## Industry Examples

**E-commerce — multi-variant test.** A marketplace tests four checkout layouts with 60,000 visitors each. The one-way ANOVA on revenue per visitor gives F(3, 239996) = 14.2, p < 0.001, but $\eta^2$ is only 0.0002 — a small effect in variance terms that is still worth 1.1 million EUR a year. Tukey HSD shows layout C beats all others while A, B and D are indistinguishable, so C is shipped. Because revenue is skewed, the team verifies the ranking with a bootstrap of the group means.

**Automotive manufacturing — design of experiments.** A supplier runs a 3 × 2 factorial experiment (three welding machines × two steel grades, five coupons per cell) to understand weld tensile strength. Two-way ANOVA shows a significant machine × grade interaction: machine M3 excels only with the high-alloy grade. The process engineers therefore assign high-alloy jobs to M3 rather than declaring M3 "the best machine" — a conclusion the main effect alone would have suggested.

**Agronomy — fertiliser trial.** An agricultural cooperative compares five nitrogen application rates on wheat in a randomised block design (blocks = fields). ANOVA with block as a factor removes field-to-field variation; the rate effect is significant and Dunnett's test against the farmers' current rate shows that only the two highest rates increase yield. Combined with fertiliser prices, the cooperative recommends the lower of the two, which maximises margin rather than raw yield.

## Practice Questions

*✎ new question added for this site (worked solution below)*

- ✎ In a one-way ANOVA with $k=3$ groups and $N=33$ observations, $SSB=60$ and $SSW=120$. Compute $F$ and test at 5% ($F_{2,30,0.95}=3.32$). Compute $\eta^2$.
- ✎ Why are three pairwise t-tests at $\alpha=0.05$ not equivalent to one ANOVA at $\alpha=0.05$?

## Solutions

*✎ solution written for this site*

- ✎ Q1: $MSB=60/2=30$, $MSW=120/30=4$, $F=7.5>3.32$: reject $H_0$. $\eta^2=60/180=0.33$ (a third of the variance is explained by group membership).
- ✎ Q2: Each test has a 5% false-positive risk, so the probability of at least one false positive among three (independent) tests is about $1-0.95^3=14\%$. ANOVA keeps the overall error rate at 5%.
