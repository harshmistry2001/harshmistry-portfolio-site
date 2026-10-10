# Non-Parametric Tests

## Overview

Non-parametric tests replace the raw values by their ranks or signs, so they need no normality assumption and are robust to outliers. They are the standard choice for ordinal data (ratings) and for small, clearly non-normal samples. They still require independent observations, and their hypotheses are about distributions rather than means.

## Concept

Non-parametric (distribution-free) tests make weak assumptions about the population distribution. Most replace the raw values by their **ranks** or **signs**, which makes them robust to outliers and valid for ordinal data. The price is somewhat lower power when parametric assumptions *do* hold (for normal data the Wilcoxon tests are still about 95% as efficient as t-tests), and hypotheses about *distributions or medians* rather than means.

### The main tests and their parametric counterparts

| Situation | Non-parametric test | Parametric counterpart |
|---|---|---|
| One sample / paired differences, median = $m_0$ | **[Sign test](https://en.wikipedia.org/wiki/Sign_test)** (only signs), **[Wilcoxon signed-rank](https://en.wikipedia.org/wiki/Wilcoxon_signed-rank_test)** (signs + ranks of $|d_i|$; assumes symmetry) | one-sample / paired t |
| Two independent samples | **[Mann-Whitney U](https://en.wikipedia.org/wiki/Mann%E2%80%93Whitney_U_test) / Wilcoxon rank-sum** | two-sample t |
| $k \ge 3$ independent samples | **[Kruskal-Wallis H](https://en.wikipedia.org/wiki/Kruskal%E2%80%93Wallis_test)** | one-way ANOVA |
| $k \ge 3$ related samples (repeated measures, blocks) | **[Friedman test](https://en.wikipedia.org/wiki/Friedman_test)** | repeated-measures ANOVA |
| Association of two variables | **Spearman's $\rho$**, **Kendall's $\tau$** | Pearson correlation |
| Distribution equality / fit | **Kolmogorov-Smirnov**, **Anderson-Darling** | — |
| Any statistic | **[Permutation test](https://en.wikipedia.org/wiki/Permutation_test)**, **bootstrap** | — |

### How the rank tests work

- **Mann-Whitney U:** pool both samples and rank them. $W$ = rank sum of sample 1; $U = W - n_1(n_1+1)/2$ counts how often an observation from sample 1 exceeds one from sample 2. Under $H_0$ (same distribution), $E(U) = n_1n_2/2$. $U/(n_1n_2)$ estimates $P(X > Y)$ — the "probability of superiority", a useful effect size.
- **Wilcoxon signed-rank:** rank $|d_i|$, sum the ranks of positive differences; compare with its null distribution.
- **Kruskal-Wallis:** $H = \frac{12}{N(N+1)}\sum_i \frac{R_i^2}{n_i} - 3(N+1) \approx \chi^2_{k-1}$, where $R_i$ is the rank sum of group $i$. Follow up with **Dunn's test** (with Holm/Bonferroni correction).
- **Friedman:** rank within each block (subject), then compare rank sums across treatments.
- **Ties** receive average ranks; software applies tie corrections.

### Permutation tests

Under $H_0$ the group labels are exchangeable. Shuffle the labels many times, recompute the statistic (e.g. difference in means or medians), and the p-value is the share of shuffled statistics at least as extreme as the observed one. Exact in principle, works for almost any statistic, and needs no distributional assumption beyond exchangeability.

### What they do *not* fix

Non-parametric tests still assume **independent observations** (or correct pairing). Mann-Whitney is not a pure test of medians unless the two distributions have the same shape; with different spreads it tests stochastic dominance.

## When It's Used

Use non-parametric methods for small samples with unknown or clearly non-normal distributions, for ordinal outcomes (Likert ratings, pain scores, satisfaction levels, rankings), for heavy-tailed business metrics (revenue per user, response times) and when outliers cannot be removed. They are standard in clinical trials with ordinal endpoints, in UX research, sensory testing in food science, and in performance engineering (latency comparisons).

## R Code

```r
set.seed(15)
# 1. Two independent groups with skewed data: page-load times (ms), old vs new CDN
old <- rlnorm(25, log(820), 0.45)
new <- rlnorm(25, log(690), 0.45)
wilcox.test(new, old)                               # Mann-Whitney U
U <- wilcox.test(new, old)$statistic
c(U = unname(U), prob_superiority = unname(U) / (25 * 25))   # P(new > old)
t.test(new, old)$p.value                            # compare with Welch t

# 2. Paired ordinal data: pain score (0-10) before and after treatment
before <- c(7, 6, 8, 5, 7, 9, 6, 7, 8, 6, 7, 5)
after  <- c(5, 6, 6, 4, 5, 7, 6, 4, 7, 5, 5, 4)
wilcox.test(after, before, paired = TRUE, exact = FALSE)     # signed-rank
d <- after - before; d <- d[d != 0]
binom.test(sum(d < 0), length(d), 0.5)                       # sign test

# 3. Kruskal-Wallis with Dunn-type pairwise comparisons (Holm-adjusted rank-sum tests)
ratings <- data.frame(
  store = factor(rep(c("north", "centre", "south"), each = 15)),
  score = c(sample(1:5, 15, TRUE, prob = c(.1, .2, .3, .25, .15)),
            sample(1:5, 15, TRUE, prob = c(.05, .1, .2, .35, .3)),
            sample(1:5, 15, TRUE, prob = c(.2, .3, .25, .15, .1)))
)
kruskal.test(score ~ store, data = ratings)
pairwise.wilcox.test(ratings$score, ratings$store, p.adjust.method = "holm", exact = FALSE)

# 4. Friedman: 8 tasters rank 4 recipes (blocks = tasters)
scores <- matrix(c(7, 5, 8, 6,  6, 5, 7, 5,  8, 6, 9, 7,  5, 4, 7, 6,
                   7, 6, 8, 5,  6, 4, 8, 6,  7, 5, 7, 6,  8, 6, 9, 7),
                 nrow = 8, byrow = TRUE, dimnames = list(NULL, paste0("recipe", 1:4)))
friedman.test(scores)

# 5. Permutation test for a difference in medians
perm_test <- function(x, y, B = 10000) {
  obs <- median(x) - median(y); pooled <- c(x, y); n <- length(x)
  perm <- replicate(B, { s <- sample(pooled); median(s[1:n]) - median(s[-(1:n)]) })
  c(observed = obs, p_value = mean(abs(perm) >= abs(obs)))
}
perm_test(new, old)

# 6. Two-sample Kolmogorov-Smirnov: do the whole distributions differ?
ks.test(new, old)
```

## Python Code

```python
import numpy as np
from scipy import stats

rng = np.random.default_rng(15)

# 1. Mann-Whitney U
old = rng.lognormal(np.log(820), 0.45, 25)
new = rng.lognormal(np.log(690), 0.45, 25)
mw = stats.mannwhitneyu(new, old, alternative="two-sided")
print(mw, " P(new > old):", mw.statistic / (25 * 25))
print("Welch t p:", stats.ttest_ind(new, old, equal_var=False).pvalue)

# 2. Paired: signed-rank and sign test
before = np.array([7, 6, 8, 5, 7, 9, 6, 7, 8, 6, 7, 5])
after = np.array([5, 6, 6, 4, 5, 7, 6, 4, 7, 5, 5, 4])
print(stats.wilcoxon(after, before))                   # zeros dropped by default
d = (after - before)[after != before]
print("sign test:", stats.binomtest((d < 0).sum(), len(d), 0.5))

# 3. Kruskal-Wallis + Holm-adjusted pairwise Mann-Whitney
north = rng.choice(np.arange(1, 6), 15, p=[.1, .2, .3, .25, .15])
centre = rng.choice(np.arange(1, 6), 15, p=[.05, .1, .2, .35, .3])
south = rng.choice(np.arange(1, 6), 15, p=[.2, .3, .25, .15, .1])
print(stats.kruskal(north, centre, south))
from statsmodels.stats.multitest import multipletests
pairs = {"north-centre": (north, centre), "north-south": (north, south), "centre-south": (centre, south)}
p = [stats.mannwhitneyu(a, b).pvalue for a, b in pairs.values()]
print(dict(zip(pairs, multipletests(p, method="holm")[1].round(4))))

# 4. Friedman (columns = recipes, rows = tasters)
scores = np.array([[7, 5, 8, 6], [6, 5, 7, 5], [8, 6, 9, 7], [5, 4, 7, 6],
                   [7, 6, 8, 5], [6, 4, 8, 6], [7, 5, 7, 6], [8, 6, 9, 7]])
print(stats.friedmanchisquare(*scores.T))

# 5. Permutation test for a difference in medians
res = stats.permutation_test((new, old), lambda x, y: np.median(x) - np.median(y),
                             n_resamples=10_000, random_state=rng)
print("median diff:", res.statistic, " p:", res.pvalue)

# 6. Two-sample KS
print(stats.ks_2samp(new, old))
```

## Software Shortcuts

- **Excel:** no built-in rank tests. Use `=RANK.AVG(x, pooled_range, 1)` to rank, sum ranks per group with `=SUMIF()`, and compute $U$ and the normal approximation manually; sign test via `=BINOM.DIST()`. Add-ins (Real Statistics, XLSTAT) provide the full set.
- **SPSS:** Analyze → **Nonparametric Tests** → *Independent Samples* (Mann-Whitney, Kruskal-Wallis with pairwise comparisons), *Related Samples* (Wilcoxon, sign, Friedman), *One Sample* (Wilcoxon, KS); Legacy Dialogs offers the classic individual dialogs.
- **Stata:** `ranksum loadtime, by(cdn)`, `signrank after = before`, `signtest after = before`, `kwallis score, by(store)`, `dunntest` (user-written), `friedman` (user-written) or `npshift`, `ksmirnov loadtime, by(cdn)`, `permute`.
- **Google Sheets:** `=RANK.AVG()` plus manual formulas, as in Excel.

## Industry Examples

**Web performance engineering — CDN migration.** Page-load times are heavy-tailed: most loads take 600–900 ms but a few take 10 s or more. An engineering team compares 5,000 sampled loads from the old and new CDN with a Mann-Whitney test and reports the probability of superiority: a random load on the new CDN is faster than one on the old CDN 61% of the time. They also compare the 95th percentiles with a bootstrap CI, because the tail is what users complain about — something a t-test on means would have blurred.

**Clinical research — ordinal outcome.** A stroke trial measures disability at 90 days on the modified Rankin Scale (0–6), an ordinal score. The statistical analysis plan specifies a Mann-Whitney test (with an ordinal regression as sensitivity analysis) instead of comparing mean scores, because the distance between "slight" and "moderate" disability is not the same as between "severe" and "death". The treatment shifts the distribution toward better outcomes with p = 0.004.

**Food science — sensory panels.** A chocolate maker asks 24 trained tasters to score four recipe variants for bitterness on a 9-point scale. Because each taster uses the scale differently, the design is blocked by taster and analysed with a Friedman test (p = 0.001), followed by pairwise Wilcoxon signed-rank tests with Holm correction. Recipe 3 is significantly less bitter than the current product and moves to a consumer test.

## Practice Questions

*✎ new question added for this site (worked solution below)*

- ✎ Name a suitable non-parametric test for (a) two independent skewed samples, (b) three independent groups with ordinal ratings, (c) before/after ordinal ratings of the same people.
- ✎ In a Mann-Whitney test with $n_1=n_2=10$ the statistic is $U=70$. What is $E(U)$ under $H_0$, and what does $U/(n_1n_2)$ estimate?

## Solutions

*✎ solution written for this site*

- ✎ Q1: (a) Mann-Whitney U (Wilcoxon rank-sum); (b) Kruskal-Wallis; (c) Wilcoxon signed-rank test on the paired differences.
- ✎ Q2: $E(U)=n_1n_2/2=50$. $U/(n_1n_2)=0.70$ estimates $P(X>Y)$: a randomly chosen observation from sample 1 exceeds one from sample 2 with probability about 70% (probability of superiority).
