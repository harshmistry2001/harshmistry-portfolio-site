# t-Tests

## Overview

The t-test compares means when the population standard deviation is unknown: one sample against a target, two paired measurements, or two independent groups. The statistic measures the difference in standard errors. Welch's version, which does not assume equal variances, is the safe default for independent groups.

## Concept

t-tests compare means when the population standard deviation is unknown and estimated from the data. The statistic has the form

$$T = \frac{\text{estimate} - \text{hypothesised value}}{\text{estimated standard error}},$$

which follows [Student's](https://en.wikipedia.org/wiki/Student's_t-test) $t$ distribution under $H_0$ when the data are normal (and approximately so for large samples, thanks to the CLT). The $t$ distribution has heavier tails than the normal; with more degrees of freedom it approaches $N(0,1)$.

### One-sample t-test

$H_0: \mu = \mu_0$. $\;T = \dfrac{\bar x - \mu_0}{s/\sqrt n}$, $df = n - 1$.

### Paired t-test

For two measurements on the same unit (before/after, left/right, two raters), compute differences $d_i = y_i - x_i$ and run a one-sample t-test on them: $T = \dfrac{\bar d}{s_d/\sqrt n}$, $df = n-1$. Pairing removes between-subject variability and is usually far more powerful than treating the samples as independent.

### Two independent samples

- **Pooled (Student) t-test** — assumes equal variances:
  $$s_p^2 = \frac{(n_1-1)s_1^2 + (n_2-1)s_2^2}{n_1+n_2-2}, \qquad T = \frac{\bar x_1 - \bar x_2}{s_p\sqrt{\frac1{n_1} + \frac1{n_2}}}, \quad df = n_1 + n_2 - 2.$$
- **[Welch t-test](https://en.wikipedia.org/wiki/Welch's_t-test)** — does not assume equal variances:
  $$T = \frac{\bar x_1 - \bar x_2}{\sqrt{\frac{s_1^2}{n_1} + \frac{s_2^2}{n_2}}}, \qquad df \approx \frac{\left(\frac{s_1^2}{n_1}+\frac{s_2^2}{n_2}\right)^2}{\frac{(s_1^2/n_1)^2}{n_1-1} + \frac{(s_2^2/n_2)^2}{n_2-1}}.$$
  Welch is the safer default: it loses almost nothing when variances are equal and protects the error rate when they are not, especially with unequal group sizes. R's `t.test` uses Welch by default.

### Assumptions and checks

1. **Independence** of observations (within and between groups, except the pairing) — the most important and least checkable assumption; it comes from the design.
2. **Normality** of the data (or of the differences for paired tests) — check with histograms/QQ plots; t-tests are robust for moderate $n$ unless there are strong skew or outliers.
3. **Equal variances** — only for the pooled test.

If normality is doubtful in small samples, use **[Mann-Whitney U](https://en.wikipedia.org/wiki/Mann%E2%80%93Whitney_U_test)** (independent) or **[Wilcoxon signed-rank](https://en.wikipedia.org/wiki/Wilcoxon_signed-rank_test)** (paired), or a bootstrap/[permutation test](https://en.wikipedia.org/wiki/Permutation_test).

### Effect size and CI

Report the difference in means with its CI and a standardised effect size, **Cohen's $d$** $= (\bar x_1 - \bar x_2)/s_p$ (0.2 small, 0.5 medium, 0.8 large, as rough guides). For paired data, $d_z = \bar d/s_d$.

## Common Mistakes

- Using the independent-samples test on paired data (it discards the pairing and loses power).
- Choosing pooled versus Welch by a preliminary variance test; use Welch by default.
- Concluding that two means are equal because the test is not significant.

## When It's Used

t-tests are the workhorse for comparing two conditions: A/B tests on continuous metrics (revenue per user, session length), before/after evaluations of training programmes, comparing two machines or suppliers, checking a process mean against a target, and clinical comparisons of a treatment with a control. They also appear inside regression output, where each coefficient's t-statistic tests $\beta_j = 0$.

## R Code

```r
set.seed(11)
# 1. One-sample: is the mean call duration different from the 6-minute target?
calls <- rlnorm(40, log(6.3), 0.3)
t.test(calls, mu = 6)

# 2. Paired: sales per rep before and after a training programme
before <- round(rnorm(18, 42, 8))
after  <- before + round(rnorm(18, 3, 4))
t.test(after, before, paired = TRUE)
d <- after - before
c(mean_diff = mean(d), d_z = mean(d) / sd(d))
t.test(after, before)$p.value                  # ignoring pairing: much less powerful

# 3. Two independent groups: revenue per user in control vs variant
control <- rgamma(120, shape = 2, rate = 2 / 25)
variant <- rgamma(100, shape = 2, rate = 2 / 29)
t.test(variant, control)                        # Welch (default)
t.test(variant, control, var.equal = TRUE)      # pooled

# Pooled t by hand
n1 <- length(variant); n2 <- length(control)
sp <- sqrt(((n1 - 1) * var(variant) + (n2 - 1) * var(control)) / (n1 + n2 - 2))
T_pooled <- (mean(variant) - mean(control)) / (sp * sqrt(1 / n1 + 1 / n2))
c(T = T_pooled, df = n1 + n2 - 2, cohens_d = (mean(variant) - mean(control)) / sp)

# 4. Assumption checks and non-parametric alternatives
shapiro.test(d)                                 # normality of paired differences
var.test(variant, control)                      # F-test for equal variances
wilcox.test(variant, control)                   # Mann-Whitney U
wilcox.test(after, before, paired = TRUE, exact = FALSE)   # signed-rank

# 5. Sample size for a two-sample test: detect +3 EUR with sd 18, 80% power
power.t.test(delta = 3, sd = 18, sig.level = 0.05, power = 0.8)$n

boxplot(list(control = control, variant = variant), ylab = "revenue per user")
```

## Python Code

```python
import numpy as np
from scipy import stats
from statsmodels.stats.power import TTestIndPower

rng = np.random.default_rng(11)

# 1. One-sample
calls = rng.lognormal(np.log(6.3), 0.3, 40)
print(stats.ttest_1samp(calls, 6))

# 2. Paired
before = np.round(rng.normal(42, 8, 18))
after = before + np.round(rng.normal(3, 4, 18))
print(stats.ttest_rel(after, before))
d = after - before
print("mean diff:", d.mean(), " d_z:", d.mean() / d.std(ddof=1))
print("ignoring pairing p:", stats.ttest_ind(after, before, equal_var=False).pvalue)

# 3. Independent groups
control = rng.gamma(2, 25 / 2, 120)
variant = rng.gamma(2, 29 / 2, 100)
res = stats.ttest_ind(variant, control, equal_var=False)       # Welch
print(res, res.confidence_interval())
print(stats.ttest_ind(variant, control, equal_var=True))       # pooled

n1, n2 = len(variant), len(control)
sp = np.sqrt(((n1 - 1) * variant.var(ddof=1) + (n2 - 1) * control.var(ddof=1)) / (n1 + n2 - 2))
print("Cohen's d:", (variant.mean() - control.mean()) / sp)

# 4. Checks and non-parametric alternatives
print(stats.shapiro(d))
print(stats.levene(variant, control))                           # robust equal-variance test
print(stats.mannwhitneyu(variant, control))
print(stats.wilcoxon(after, before))

# 5. Sample size per group
print("n per group:", TTestIndPower().solve_power(effect_size=3 / 18, alpha=0.05, power=0.8))
```

## Software Shortcuts

- **Excel:** Data → Data Analysis → **t-Test: Paired Two Sample for Means**, **t-Test: Two-Sample Assuming Equal Variances**, **t-Test: Two-Sample Assuming Unequal Variances** (Welch). Quick p-value: `=T.TEST(range1, range2, 2, 3)` (two-tailed, Welch); `type` 1 = paired, 2 = pooled. Cohen's d needs a manual formula.
- **SPSS:** Analyze → Compare Means → **One-Sample T Test**, **Independent-Samples T Test** (output shows Levene's test and both equal/unequal-variance rows; recent versions also report Cohen's d), **Paired-Samples T Test**.
- **Stata:** `ttest calls == 6`, `ttest after == before` (paired), `ttest revenue, by(group) unequal` (Welch), `esize twosample revenue, by(group)` for Cohen's d, `power twomeans 25 28, sd(18)`.
- **Google Sheets:** `=T.TEST(range1, range2, tails, type)` with the same codes as Excel.

## Industry Examples

**SaaS — pricing-page experiment.** A B2B software company tests a redesigned pricing page. Revenue per visitor is heavily skewed (most visitors pay nothing), so the analysts run Welch's t-test on 48,000 visitors per arm — the CLT makes the mean's sampling distribution close to normal at this size — and confirm with a Mann-Whitney test and a bootstrap CI. The variant raises revenue per visitor by 0.41 USD (95% CI 0.08 to 0.74), and the decision is based on the CI's lower bound exceeding the cost of the change.

**Corporate learning — training evaluation.** A retail chain measures weekly sales per associate for 6 weeks before and after a consultative-selling course for 64 associates. A paired t-test on the differences shows +7.2% (95% CI +3.1% to +11.3%). The analysts also compare with 64 matched associates who did not attend (a two-sample t-test on the *changes*), which cuts the estimate to +4.0% — seasonality had inflated the naive before/after comparison.

**Agriculture — variety trials.** A seed company compares two maize hybrids planted side by side in 24 fields. Because soil quality varies strongly across fields, yields are analysed with a paired t-test on the within-field differences; the standard deviation of differences (0.4 t/ha) is much smaller than the between-field SD (1.6 t/ha), so a 0.3 t/ha advantage is detected with p = 0.002 that an unpaired test would have missed.

## Practice Questions

*✎ new question added for this site (worked solution below)*

- ✎ Five employees' scores before and after training differ by $+2, +3, +1, +4, +5$. Test at the 5% level whether the training changed the mean score.
- ✎ When should you prefer Welch's t-test over the pooled t-test?

## Solutions

*✎ solution written for this site*

- ✎ Q1: Differences: mean $\bar d=3$, sd $s_d=1.58$; $t=\frac{3}{1.58/\sqrt5}=4.24$ with $df=4$; two-sided $p\approx0.013<0.05$, so the change is significant.
- ✎ Q2: Whenever the variances or group sizes may differ. Welch loses almost nothing when variances are equal and protects the type I error rate when they are not.
