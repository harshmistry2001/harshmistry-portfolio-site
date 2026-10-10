# Chi-Square Tests

## Overview

Chi-square tests compare observed counts with the counts expected under a hypothesis. The three versions (goodness of fit, independence, homogeneity) share the same formula but answer different questions depending on how the data were collected. After a significant result, look at the cells and at an effect size such as Cramér's V.

## Concept

[Chi-square](https://en.wikipedia.org/wiki/Chi-squared_test) ($\chi^2$) tests compare **observed counts** with the counts **expected** under a null hypothesis. They are the standard tests for categorical data.

$$X^2 = \sum_{\text{cells}} \frac{(O - E)^2}{E} \;\approx\; \chi^2_{df} \text{ under } H_0.$$

Large $X^2$ means the observed counts are far from the expected ones.

### 1. Goodness-of-fit test

Does one categorical variable follow a specified distribution $(q_1, \dots, q_s)$?

- $E_j = n\,q_j$; $df = s - 1 - m$, where $m$ is the number of parameters estimated from the data (e.g. $m = 1$ when fitting a Poisson with estimated $\lambda$).
- Uses: fairness of a die, [Benford's law](https://en.wikipedia.org/wiki/Benford's_law) in accounting data, whether arrivals are Poisson, whether a customer mix matches the population.

### 2. Test of independence

Are two categorical variables, measured on the **same random sample**, independent?

- Contingency table with $r$ rows and $c$ columns; $E_{ij} = \frac{n_{i+}\,n_{+j}}{n}$; $df = (r-1)(c-1)$.

### 3. Test of homogeneity

Do **several separately sampled groups** share the same distribution over categories? Same arithmetic as the independence test; only the design and the wording of $H_0$ differ.

### Conditions and alternatives

- Observations independent; each unit counted once.
- Expected counts large enough: all $E \ge 1$ and at least 80% of $E \ge 5$ (Cochran's rule). Otherwise merge categories or use **[Fisher's exact test](https://en.wikipedia.org/wiki/Fisher's_exact_test)** (2×2 or small tables) or a Monte-Carlo p-value.
- 2×2 tables: Yates' continuity correction is conservative; many analysts prefer no correction or Fisher's test.
- **Paired** binary data (before/after on the same people) need **[McNemar's test](https://en.wikipedia.org/wiki/McNemar's_test)**, not the ordinary $\chi^2$.
- Ordered categories: a trend test (Cochran-Armitage) is more powerful than the general $\chi^2$ test.

### After the test: which cells and how strong?

- **Standardised (adjusted) residuals** $\frac{O - E}{\sqrt{E(1 - p_{i+})(1 - p_{+j})}}$ — values beyond ±2 show which cells drive the result.
- **Effect size — [Cramér's V](https://en.wikipedia.org/wiki/Cram%C3%A9r's_V)** $= \sqrt{\frac{X^2}{n(\min(r,c)-1)}}$ (0 to 1); for 2×2 tables the **phi coefficient**, and the **[odds ratio](https://en.wikipedia.org/wiki/Odds_ratio)** with its CI.
- With large $n$, trivial associations become significant — always report the effect size.

## Common Mistakes

- Applying the test with many small expected counts instead of merging categories or using Fisher's exact test.
- Using the ordinary test for paired binary data (use McNemar's test).
- Treating a significant result as a strong association: with large $n$, trivial associations are significant, so report Cramér's V.

## When It's Used

Chi-square tests are used in survey analysis (satisfaction by region, vote intention by age group), marketing (conversion by channel, A/B tests with a binary outcome), medicine (infection vs. vaccination status), quality control (defect type by production line), fraud detection (Benford's law on first digits of invoice amounts), genetics (Hardy-Weinberg equilibrium, Mendelian ratios) and fairness audits (outcomes by demographic group).

## R Code

```r
# 1. Goodness of fit: are support tickets evenly spread across weekdays?
tickets <- c(Mon = 142, Tue = 118, Wed = 109, Thu = 121, Fri = 160)
chisq.test(tickets)                                   # H0: uniform

# Benford's law on first digits of invoice amounts
set.seed(6)
amounts <- round(rlnorm(2000, meanlog = 6, sdlog = 1.8), 2)
first_digit <- as.integer(substr(formatC(amounts, format = "e"), 1, 1))
obs <- table(factor(first_digit, levels = 1:9))
benford <- log10(1 + 1 / (1:9))
chisq.test(obs, p = benford)

# Goodness of fit with an estimated parameter (Poisson): df = s - 1 - 1
calls <- rpois(300, 2.4)
lambda <- mean(calls)
o <- table(factor(pmin(calls, 5), levels = 0:5))
p <- c(dpois(0:4, lambda), ppois(4, lambda, lower.tail = FALSE))
X2 <- sum((o - 300 * p)^2 / (300 * p)); df <- length(o) - 1 - 1
c(X2 = X2, df = df, p_value = pchisq(X2, df, lower.tail = FALSE))

# 2. Independence: payment method vs. age group
tab <- matrix(c(85, 60, 25,
                70, 80, 45,
                30, 55, 90),
              nrow = 3, byrow = TRUE,
              dimnames = list(age = c("18-34", "35-54", "55+"), payment = c("wallet", "card", "invoice")))
test <- chisq.test(tab, correct = FALSE)
test
round(test$expected, 1)
round(test$stdres, 2)                                  # adjusted residuals: which cells?
cramers_v <- sqrt(test$statistic / (sum(tab) * (min(dim(tab)) - 1)))
unname(cramers_v)

# 3. Small counts: Fisher's exact test and odds ratio (2x2)
adverse <- matrix(c(3, 47, 11, 39), 2, byrow = TRUE,
                  dimnames = list(group = c("treatment", "placebo"), event = c("yes", "no")))
fisher.test(adverse)

# 4. Paired binary data: McNemar (same customers before/after a campaign)
paired <- matrix(c(210, 45, 18, 227), 2, byrow = TRUE,
                 dimnames = list(before = c("aware", "not"), after = c("aware", "not")))
mcnemar.test(paired)

# Mosaic plot of the association
mosaicplot(tab, shade = TRUE, main = "Payment method by age group")
```

## Python Code

```python
import numpy as np
import pandas as pd
from scipy import stats
from statsmodels.stats.contingency_tables import mcnemar, Table
import matplotlib.pyplot as plt
from statsmodels.graphics.mosaicplot import mosaic

# 1. Goodness of fit
tickets = np.array([142, 118, 109, 121, 160])
print(stats.chisquare(tickets))

rng = np.random.default_rng(6)
amounts = np.round(rng.lognormal(6, 1.8, 2000), 2)
first_digit = np.array([int(f"{a:e}"[0]) for a in amounts])
obs = np.bincount(first_digit, minlength=10)[1:]
benford = np.log10(1 + 1 / np.arange(1, 10))
print("Benford:", stats.chisquare(obs, obs.sum() * benford))

calls = rng.poisson(2.4, 300)
lam = calls.mean()
o = np.bincount(np.minimum(calls, 5), minlength=6)
p = np.r_[stats.poisson(lam).pmf(np.arange(5)), stats.poisson(lam).sf(4)]
print("Poisson GOF:", stats.chisquare(o, 300 * p, ddof=1))     # ddof=1: one estimated parameter

# 2. Independence
tab = pd.DataFrame([[85, 60, 25], [70, 80, 45], [30, 55, 90]],
                   index=["18-34", "35-54", "55+"], columns=["wallet", "card", "invoice"])
res = stats.chi2_contingency(tab, correction=False)
print(f"X2={res.statistic:.2f} df={res.dof} p={res.pvalue:.3g}")
print(pd.DataFrame(res.expected_freq, index=tab.index, columns=tab.columns).round(1))
print(Table(tab.values).standardized_resids.round(2))           # adjusted residuals
print("Cramér's V:", stats.contingency.association(tab.values, method="cramer"))

# 3. Fisher's exact test
adverse = np.array([[3, 47], [11, 39]])
print(stats.fisher_exact(adverse))

# 4. McNemar
print(mcnemar(np.array([[210, 45], [18, 227]]), exact=False, correction=True))

mosaic(tab.stack().to_dict(), title="Payment method by age group")
plt.show()
```

## Software Shortcuts

- **Excel:** `=CHISQ.TEST(observed_range, expected_range)` returns the p-value (you must build the expected table with `=row_total*col_total/grand_total`); `=CHISQ.DIST.RT(x2, df)` and `=CHISQ.INV.RT(alpha, df)`. PivotTables quickly build the observed contingency table.
- **SPSS:** Analyze → Descriptive Statistics → **Crosstabs** → Statistics → *Chi-square*, *Phi and Cramér's V*, *McNemar*, *Risk* (odds ratio); Cells → *Expected*, *Adjusted standardized residuals*. Goodness of fit: Analyze → Nonparametric Tests → Legacy Dialogs → **Chi-square**. Fisher's exact test appears automatically for 2×2 tables (or via Exact…).
- **Stata:** `tabulate age payment, chi2 expected cramersv exact`, `tabi 3 47 \ 11 39, exact`, `mcc` / `mcci` for McNemar, `csgof` (user-written) for goodness of fit.
- **Google Sheets:** `=CHISQ.TEST()`, `=CHISQ.DIST.RT()`.

## Industry Examples

**Audit and forensic accounting — Benford's law.** An internal-audit team tests the first digits of 48,000 expense-claim amounts against Benford's distribution. Overall $X^2$ is modest, but one cost centre shows a large excess of claims starting with 4 — adjusted residual +6.8 — just below a 500 EUR approval threshold. Follow-up review finds split invoices designed to avoid manager sign-off. The $\chi^2$ test is used as a screening tool, not as proof.

**Healthcare — vaccine effectiveness surveillance.** A public-health agency cross-tabulates laboratory-confirmed influenza (yes/no) against vaccination status for 3,100 patients with respiratory symptoms (test-negative design). The $\chi^2$ test of independence rejects $H_0$ (p < 0.001), and the odds ratio of 0.52 (95% CI 0.43–0.63) translates into an estimated vaccine effectiveness of 48% — the figure published in the seasonal effectiveness report.

**Telecommunications — churn by contract type.** A mobile operator analyses 40,000 customers: churn (yes/no) by contract (monthly, 1-year, 2-year). $X^2$ = 3,180 with df = 2, Cramér's V = 0.28. Adjusted residuals show monthly-contract churners are over-represented by a wide margin, while 2-year contracts are strongly under-represented. The retention team targets month-to-month customers with loyalty offers and tracks the effect in a follow-up A/B test with a 2×2 $\chi^2$ analysis.

## Practice Questions

*✎ new question added for this site (worked solution below)*

- ✎ A die is rolled 60 times with counts 6, 8, 12, 14, 9, 11 for faces 1 to 6. Test fairness at 5% ($\chi^2_{5,0.95}=11.07$).
- ✎ A $2\times2$ table has counts $20,30,30,20$. Test independence at 5% and compute Cramér's V.

## Solutions

*✎ solution written for this site*

- ✎ Q1: Expected 10 per face; $X^2=\frac{16+4+4+16+1+1}{10}=4.2<11.07$: fairness is not rejected.
- ✎ Q2: $n=100$, all expected counts 25: $X^2=4\cdot\frac{25}{25}=4.0>3.84$ ($df=1$, $p\approx0.046$): reject independence. Cramér's V $=\sqrt{4/100}=0.20$, a weak association.
