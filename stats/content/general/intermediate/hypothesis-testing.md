# Hypothesis Testing

## Overview

A hypothesis test decides whether the data are surprising enough under a default assumption (the null hypothesis) to reject it. The key ideas are the p-value, the two types of error and statistical power. The most common misuses are reading p-values as probabilities of hypotheses, ignoring effect sizes and testing many hypotheses without correction.

## Concept

A hypothesis test is a decision rule for judging whether data provide enough evidence against a default claim.

### The framework

1. **Null hypothesis $H_0$** — the default / "no effect" claim: $\mu = 100$, $p_A = p_B$, $\beta = 0$.
2. **Alternative $H_1$** — what you want evidence for: two-sided ($\ne$) or one-sided ($<$ or $>$). Choose it *before* seeing the data.
3. **Test statistic** — measures how far the data are from $H_0$ in standard-error units, e.g. $T = \frac{\bar x - \mu_0}{s/\sqrt n}$.
4. **Null distribution** — the distribution of the statistic if $H_0$ is true ($t$, $z$, $\chi^2$, $F$, or a permutation distribution).
5. **Decision** — reject $H_0$ if the statistic falls in the rejection region, equivalently if the **[p-value](https://en.wikipedia.org/wiki/P-value)** is below the significance level $\alpha$.

### p-values

The p-value is the probability, *assuming $H_0$ is true*, of observing a test statistic at least as extreme as the one obtained. It is **not** the probability that $H_0$ is true, and a large p-value is **not** evidence that $H_0$ is true — only a lack of evidence against it.

### Errors and power

| | $H_0$ true | $H_0$ false |
|---|---|---|
| Reject $H_0$ | [Type I error](https://en.wikipedia.org/wiki/Type_I_and_type_II_errors) (false positive), probability $\alpha$ | Correct — **power** $1-\beta$ |
| Do not reject | Correct | Type II error (false negative), probability $\beta$ |

Power increases with the true [effect size](https://en.wikipedia.org/wiki/Effect_size), the sample size and $\alpha$, and decreases with noise $\sigma$. A study with low power will usually miss real effects and, when it does find one, will tend to exaggerate it. **Power analysis** before data collection fixes $n$ for a target power (typically 80%) to detect the smallest effect worth knowing.

### Tests and confidence intervals

A two-sided test at level $\alpha$ rejects $H_0: \theta = \theta_0$ exactly when $\theta_0$ lies outside the $(1-\alpha)$ confidence interval. Reporting the CI shows both significance and the plausible size of the effect.

### Statistical vs. practical significance

With a large $n$, trivially small effects become "significant". Always report an **effect size** (difference in means, Cohen's $d = \frac{\bar x_1 - \bar x_2}{s_p}$, odds ratio, $R^2$) and judge whether it matters in practice.

### Multiple testing

Testing many hypotheses inflates false positives: with 20 independent tests at $\alpha = 0.05$, $P(\text{at least one false positive}) = 1 - 0.95^{20} \approx 64\%$. Corrections: **[Bonferroni](https://en.wikipedia.org/wiki/Bonferroni_correction)** ($\alpha/m$, controls the family-wise error rate), **Holm** (uniformly better than Bonferroni), **[Benjamini-Hochberg](https://en.wikipedia.org/wiki/False_discovery_rate)** (controls the false discovery rate). Related abuses — [p-hacking](https://en.wikipedia.org/wiki/Data_dredging), optional stopping, testing hypotheses suggested by the same data — invalidate the stated error rates.

### Which test?

| Question | Parametric | Non-parametric |
|---|---|---|
| One mean vs. a value | one-sample t | sign / Wilcoxon signed-rank |
| Two independent groups | two-sample t / Welch | Mann-Whitney U |
| Paired measurements | paired t | Wilcoxon signed-rank |
| 3+ groups | one-way ANOVA | Kruskal-Wallis |
| Proportions | z-test / binomial test | Fisher exact |
| Categorical association | $\chi^2$ test | Fisher exact |
| Correlation | Pearson t-test | Spearman |

## Common Mistakes

- Treating "not significant" as "no effect"; with low power real effects are often missed.
- Reporting p-values without effect sizes and confidence intervals.
- Choosing the hypothesis, one-sided or two-sided test, or the stopping time after looking at the data.

## When It's Used

Hypothesis tests drive go/no-go decisions: approving a drug (does it beat placebo?), shipping a website change (does conversion improve?), releasing a production batch (does it meet the specification?), accepting a supplier's claim, or validating that a model coefficient is different from zero. Regulators, journals and experimentation platforms codify the choice of $\alpha$, power and correction for multiple comparisons.

## R Code

```r
set.seed(3)
# A supplier claims mean tensile strength of 500 MPa; we test whether it is lower
strength <- rnorm(25, mean = 492, sd = 15)
t.test(strength, mu = 500, alternative = "less")

# Same test by hand
T_stat <- (mean(strength) - 500) / (sd(strength) / sqrt(25))
c(T = T_stat, critical = qt(0.05, 24), p_value = pt(T_stat, 24))

# Exact binomial test: 14 of 20 users prefer design B (H1: p > 0.5)
binom.test(14, 20, p = 0.5, alternative = "greater")

# Two-proportion z-test: A/B test conversion 480/10000 vs 540/10000
prop.test(c(540, 480), c(10000, 10000), alternative = "greater", correct = FALSE)

# Simulate the type I error rate and power of the one-sample t-test
reject_rate <- function(true_mu, n = 25, reps = 5000) {
  mean(replicate(reps, t.test(rnorm(n, true_mu, 15), mu = 500, alternative = "less")$p.value < 0.05))
}
c(type_I_error = reject_rate(500), power_at_490 = reject_rate(490), power_at_485 = reject_rate(485))

# Power analysis: n needed to detect a 10 MPa drop with 80% power
power.t.test(delta = 10, sd = 15, sig.level = 0.05, power = 0.80,
             type = "one.sample", alternative = "one.sided")

# Multiple testing: 20 metrics compared, only 2 real effects
p <- c(runif(18), 0.0008, 0.012)
data.frame(raw = sum(p < 0.05), bonferroni = sum(p.adjust(p, "bonferroni") < 0.05),
           holm = sum(p.adjust(p, "holm") < 0.05), BH = sum(p.adjust(p, "BH") < 0.05))

# Effect size: Cohen's d for the one-sample case
(mean(strength) - 500) / sd(strength)
```

## Python Code

```python
import numpy as np
from scipy import stats
from statsmodels.stats.proportion import proportions_ztest
from statsmodels.stats.power import TTestPower
from statsmodels.stats.multitest import multipletests

rng = np.random.default_rng(3)
strength = rng.normal(492, 15, 25)
print(stats.ttest_1samp(strength, 500, alternative="less"))
T = (strength.mean() - 500) / (strength.std(ddof=1) / 5)
print("T =", T, " crit =", stats.t.ppf(0.05, 24), " p =", stats.t.cdf(T, 24))

print(stats.binomtest(14, 20, 0.5, alternative="greater"))
print(proportions_ztest([540, 480], [10_000, 10_000], alternative="larger"))


def reject_rate(true_mu, n=25, reps=5000):
    x = rng.normal(true_mu, 15, size=(reps, n))
    return np.mean(stats.ttest_1samp(x, 500, axis=1, alternative="less").pvalue < 0.05)


print("type I:", reject_rate(500), " power@490:", reject_rate(490), " power@485:", reject_rate(485))

print("n for 80% power:", TTestPower().solve_power(effect_size=10 / 15, alpha=0.05,
                                                     power=0.8, alternative="larger"))

p = np.r_[rng.uniform(size=18), 0.0008, 0.012]
for method in ("bonferroni", "holm", "fdr_bh"):
    print(method, multipletests(p, 0.05, method=method)[0].sum(), "rejections (raw:", (p < 0.05).sum(), ")")

print("Cohen's d:", (strength.mean() - 500) / strength.std(ddof=1))
```

## Software Shortcuts

- **Excel:** `=T.TEST(range1, range2, tails, type)` returns a p-value (type 1 paired, 2 equal variance, 3 Welch); one-sample test: compute `=(AVERAGE(r)-mu0)/(STDEV.S(r)/SQRT(COUNT(r)))` then `=T.DIST(t, df, TRUE)` or `=T.DIST.RT()` / `=T.DIST.2T()`. `=Z.TEST(range, mu0, sigma)` gives a one-sided z p-value. `=BINOM.DIST(k, n, p, TRUE)` for exact binomial p-values.
- **SPSS:** Analyze → Compare Means → **One-Sample T Test**; Analyze → Nonparametric Tests → Legacy Dialogs → **Binomial**; Analyze → **Power Analysis** (SPSS 27+) → Means / Proportions for sample-size planning.
- **Stata:** `ttest strength == 500`, `bitest prefer == 0.5`, `prtest conv, by(group)`, `power onemean 500 490, sd(15) power(0.8)`; adjusted p-values via `qqvalue` (user-written) or `mtest(bonferroni)` options.
- **Google Sheets:** `=T.TEST()`, `=Z.TEST()`, `=T.DIST.RT()`.

## Industry Examples

**E-commerce — A/B testing platform.** An online travel agency runs hundreds of experiments per quarter. Its platform pre-registers one primary metric per test, runs a power analysis to fix the duration (e.g. 1.2 million sessions to detect a 1.5% relative uplift in bookings with 80% power), uses two-sided tests at $\alpha = 0.05$, and applies Benjamini-Hochberg to the dozens of secondary metrics. Before these rules, "peeking" daily and stopping at the first significant result had produced winners whose effects vanished after launch.

**Pharmaceuticals — confirmatory trial.** A phase III trial tests $H_0$: no difference in 12-week HbA1c reduction between a new diabetes drug and the standard of care. The protocol fixes a two-sided $\alpha = 0.05$, 90% power to detect 0.3 percentage points (SD 1.1), giving about 285 patients per arm. Two secondary endpoints are tested hierarchically so the family-wise error stays at 5% — a design regulators require to accept the result.

**Food manufacturing — net content compliance.** A snack producer tests each shift whether the mean pack weight is at least the declared 150 g ($H_0: \mu \ge 150$ vs. $H_1: \mu < 150$) using a one-sample t-test on 30 packs. Choosing $H_1$ as "underfilled" makes the costly error — shipping underweight product — the controlled type I error. When a test rejected at p = 0.003, the line was stopped and a worn dosing auger was found.

## Practice Questions

*✎ new question added for this site (worked solution below)*

- ✎ A team tests 20 independent hypotheses at $\alpha=0.05$ when none is true. What is the probability of at least one false positive, and what is the Bonferroni threshold?
- ✎ A trial fails to find a significant effect of a drug that really works. Which kind of error is this?

## Solutions

*✎ solution written for this site*

- ✎ Q1: $1-0.95^{20}=0.64$. Bonferroni threshold: $0.05/20=0.0025$.
- ✎ Q2: A Type II error (false negative); its probability is $\beta$, and the power is $1-\beta$.
