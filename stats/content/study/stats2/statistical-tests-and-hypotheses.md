# Statistical Tests and Hypotheses

> Course part: Stats 2

## Overview

A **hypothesis test** answers a yes/no question about a parameter using data: "Is the new version better?", "Does the batch meet the specification?" The idea is to ask how surprising the data would be *if nothing special were going on* (the null hypothesis), and to reject that assumption only when the data are very surprising.

## Concept

### Hypotheses and errors

- The **null hypothesis** $H_0$ is the default claim (no effect, specification met). The **alternative** $H_1$ is what we want evidence for. Put the claim you want to *prove* into $H_1$.
- A [test](https://en.wikipedia.org/wiki/Statistical_hypothesis_test) $\varphi$ outputs 1 (reject $H_0$) or 0 (do not reject).
- **Type I error** (false positive): rejecting a true $H_0$. Its probability is bounded by the **significance level** $\alpha$. A test is *level $\alpha$* if $P_{H_0}(\varphi=1)\le\alpha$ for all parameter values in $H_0$.
- **Type II error** (false negative): not rejecting $H_0$ when $H_1$ is true, probability $\beta$. The **power** is $1-\beta$.
- Rejecting is a strong statement; **not rejecting is not a proof of $H_0$** (absence of evidence).

### Decision rules

1. **Rejection region:** reject if the test statistic falls into a region with probability $\alpha$ under $H_0$.
2. **[p-value](https://en.wikipedia.org/wiki/P-value):** the probability, assuming $H_0$, of a test statistic at least as extreme as the observed one. Reject if $p<\alpha$.
3. **Confidence interval:** for a two-sided test of $H_0:\vartheta=\vartheta_0$, reject at level $\alpha$ iff $\vartheta_0$ lies outside the $(1-\alpha)$ confidence interval.

One-sided tests (e.g. $H_0:\mu\le\mu_0$ vs $H_1:\mu>\mu_0$) need only be checked at the boundary $\mu=\mu_0$, because the rejection probability is largest there.

### Tests covered

| Situation | Statistic | Distribution under $H_0$ |
|---|---|---|
| mean, $\sigma$ known (Gauß test) | $\sqrt n\,\frac{\overline X-\mu_0}{\sigma}$ | $N(0,1)$ |
| mean, $\sigma$ unknown (one-sample t-test) | $T=\sqrt n\,\frac{\overline X_n-\mu_0}{S_n}$ | $t_{n-1}$ |
| proportion, exact binomial test | $N_+\sim Bin(n,p_0)$ | binomial |
| proportion, approximate binomial test | $T=\frac{N_+-np_0}{\sqrt{np_0(1-p_0)}}$ | $\approx N(0,1)$ |
| median, sign test | number of observations above $m_0$ | $Bin(n,\tfrac12)$ |
| regression slope | $T_n=\frac{\hat b_n-b_0}{s_{\hat b_n}}$ | $t_{n-2}$ |

The sign test needs no normality assumption. Exact tests are preferable for small $n$.

## Worked Example

A milk producer claims a mean fat content of at most 2%. A sample of $n=18$ bottles has $\overline x=2.2156$ and $s^2=0.1375$. Test $H_0:\mu\le2$ vs $H_1:\mu>2$ at $\alpha=0.05$.

$T=\sqrt{18}\cdot\frac{2.2156-2}{\sqrt{0.1375}}\approx2.467$. The critical value is $t_{17,0.95}=1.740$; since $2.467>1.740$, reject $H_0$. The p-value $P(t_{17}>2.467)\approx0.012<0.05$ gives the same decision: significant evidence that the mean fat content exceeds 2%.

## Common Mistakes

- Putting the claim to be proved into $H_0$.
- Reading $p$ as the probability that $H_0$ is true; it is a probability of the data under $H_0$.
- Concluding "$H_0$ is true" from a non-significant result.
- Choosing the hypotheses *after* looking at the data (see Multiple Testing).

## When It's Used

Hypothesis tests are the decision rule behind product launches (is the new version better?), quality audits (does the batch meet the spec?) and regulatory approval. The null hypothesis is what you want to *disprove*; controlling the type-I error means limiting how often you claim an effect that is not there.

**Exam tip:** put the claim you want evidence for into $H_1$. Reject if $p < \alpha$ or if the statistic lies in the rejection region. Exact binomial test for small $n$, approximate (normal) test for large $n$; sign test when normality is doubtful.

## R Code

```r
# Practice Sheet 08, Problem 1: milk fat, H0: mu <= 2 vs H1: mu > 2
n <- 18; m <- 2.2156; s2 <- 0.1375
T_stat <- sqrt(n) * (m - 2) / sqrt(s2)
c(T = T_stat, critical = qt(0.95, n - 1), p_value = pt(T_stat, n - 1, lower.tail = FALSE))

# Practice Sheet 08, Problem 2: 9 of 12 prefer the new recipe, H1: p > 0.5
binom.test(9, 12, p = 0.5, alternative = "greater")$p.value          # exact
T_bin <- (9 - 12 * 0.5) / sqrt(12 * 0.5 * 0.5)                        # approximate
c(T = T_bin, p_value = pnorm(T_bin, lower.tail = FALSE))

# Practice Sheet 08, Problem 3(b): air pressure, two-sided t-test vs 1003.5
T_air <- sqrt(16) * (991.81 - 1003.5) / sqrt(690.63)
2 * pt(-abs(T_air), 15)

# Practice Sheet 07, Problem 3: type-I error of the rice rule (sd of mean = 10 / 5)
pnorm(496.5, 500, 2) + pnorm(503.5, 500, 2, lower.tail = FALSE)

# Practice Sheet 09, Problem 3: p-values
pbinom(3, 5, 0.5, lower.tail = FALSE)                                 # (a) >= 4 heads of 5
pt(sqrt(30) * (9.75 - 10) / sqrt(1.6), 29)                             # (b) H1: mu < 10
2 * pt(-abs(sqrt(8) * (1.9703 - 2) / 0.1107), 7)                       # (c) two-sided
```

## Python Code

```python
import numpy as np
from scipy import stats

n, m, s2 = 18, 2.2156, 0.1375
T = np.sqrt(n) * (m - 2) / np.sqrt(s2)
print("milk fat: T =", T, " crit =", stats.t.ppf(0.95, n - 1), " p =", stats.t.sf(T, n - 1))

print("exact binomial p:", stats.binomtest(9, 12, 0.5, alternative="greater").pvalue)
Tb = (9 - 6) / np.sqrt(12 * 0.25)
print("approx binomial: T =", Tb, " p =", stats.norm.sf(Tb))

Ta = 4 * (991.81 - 1003.5) / np.sqrt(690.63)
print("air pressure p:", 2 * stats.t.sf(abs(Ta), 15))

print("rice type-I error:", stats.norm.cdf(496.5, 500, 2) + stats.norm.sf(503.5, 500, 2))

print("9.3(a):", stats.binom(5, 0.5).sf(3))
print("9.3(b):", stats.t.cdf(np.sqrt(30) * (9.75 - 10) / np.sqrt(1.6), 29))
print("9.3(c):", 2 * stats.t.sf(abs(np.sqrt(8) * (1.9703 - 2) / 0.1107), 7))
```

## Practice Questions

*◆ original question from the course material*

- ◆ Practice Sheet 07, Problem 1: A technique to determine the actual amount of calcium... gives a standard deviation of 10. Measurements of 20 different samples... yield a sample mean of $\overline{x}_{20}=349.98$.
  - (a) determine a confidence interval for the expected value at level 0.95.
  - (b) test at the 5% level of significance whether the soy milk contains the required amount of calcium.
  - (c) Can the test performed in (b) be used to find significant evidence that the desired calcium levels in the soy milk are satisfied?
- ◆ Practice Sheet 07, Problem 2: There are two one-tailed statistical tests at a significance level of $\alpha_{1}=0.05$ and $\alpha_{2}=0.1$ for an unknown parameter $\vartheta$. The test $\varphi_{1}$ checks $H_0: \vartheta\le5$ and $\varphi_2$ checks $H_0: \vartheta\ge5$.
  - (a) How can one construct a two-tailed test from $\varphi_{1}$ and $\varphi_{2}$ that tests the null hypothesis $\vartheta=5?$
  - (b) What is the significance level of the constructed test?
- ◆ Practice Sheet 07, Problem 3: The average weight of a package of rice... is 500 grams. The weights $X_{1},...,X_{25}$ are assumed $N(\mu,10^2)$. Test: $H_{0}:\mu=500$ vs. $H_{1}:\mu\ne500$. Rejection region: $\varphi=1$ if $\overline{X}_{25}<496.5$ or $\overline{X}_{25}>503.5$.
  - (a) Determine the probability of the type-I-error. Is it an a-level test for $\alpha=0.05?$ Or for $\alpha=0.1?$
  - (b) Sketch the probability density function... and highlight the area of rejection and type-I-error probability.
  - (c) What is the decision of the test if $\overline{x}_{25}=504?$
- ◆ Practice Sheet 07, Problem 4: The average per capita consumption in Brazil was 17.6... A sample of 50 households... model: $X_{1},...,X_{50}$ i.i.d. $N(\mu,0.25)$; test: $H_{0}:\mu\le17.6$ vs. $H_{1}:\mu>17.6$. We propose two tests...
  - (a) Compute for both tests the probability $P_{\mu=17.6}(\varphi_{i}(X_{1},...,X_{50})=1)$.
  - (b) Show that only $\varphi_{2}$ is a test at level $\alpha=0.05$.
  - (c) Why is it sufficient to check only for $\mu=17.6$ instead of $\mu\le17.6$?
- ◆ Practice Sheet 08, Problem 1: A food inspector examines the production of a brand of milk. They suspect that, with more than 2% milk fat, it no longer meets the requirements. 18 bottles... $\overline{x}_{18}=2.2156$, $s_{18}^{2}=0.1375$.
  - (a) Which test problem results?
  - (b) Perform the test at level $\alpha=0.05$.
  - (c) Compute the p-value and conduct the test again by using the p-value.
- ◆ Practice Sheet 08, Problem 2: Sales numbers... taste test with 12 participants. 9 preferred the new chocolate bar. Test at level $\alpha=0.05$, if significantly more than half prefer the new recipe.
  - (a) Use an exact binomial test and compute the p-value.
  - (b) Use an approximate binomial test.
  - (c) Compare and evaluate the two test decisions.
- ◆ Practice Sheet 08, Problem 3: Air pressure... 16 days... $\overline{x}_{16}=991.81$, $s_{16}^{2}=690.63$.
  - (a) Test (without Gaussianity) at level $\alpha=0.1$, if the median differs significantly from 1003.5 mbars.
  - (b) Test (assuming Gaussianity) for the same data at level 0.1, if the expected value differs significantly from 1003.5 mbars. Use the p-value.
- ◆ Practice Sheet 09, Problem 1: Average number of pages per hour... $\overline{x}_{15}=3.0867$ and $s_{15}^{2}=1.5084$. Limited number of books... number of pages cannot be more than 3.7.
  - (a) At a level of 10%, is there significant evidence that the publishing house would not need to outsource?
  - (b) Calculate the p-value and conduct the test again.
  - (c) Illustrate the p-value and critical value in the graphic.
- ◆ Practice Sheet 09, Problem 2: Roll a die 25 times... denote the 3 most frequently rolled numbers as $x_1, x_2, x_3$.
  - (a) Perform a test to see if the probability of rolling a number from $\{x_{1},x_{2},x_{3}\}$ is at a level of $\alpha=15\%$ significantly greater than 0.5.
  - (b) Compare your result... and discuss why the statistical procedure in (a) is unacceptable.
- ◆ Practice Sheet 09, Problem 3: Calculate the p-value given the following situations:
  - (a) Coin tossed five times, four heads... tested if probability is significantly greater than 0.5.
  - (b) 30 batteries, mean 9.75 hours, variance 1.6... tested if mean is less than 10.
  - (c) 8 measurements of wire length yield average 1.9703, standard deviation 0.1107... tested if length is significantly different from 2 m.

## Solutions

*✎ solution written for this site*

*Solutions are given where the question contains all numbers needed. For Sheet 07 Problem 4 (the two tests are not reproduced), Sheet 08 Problem 3(a) (the sign counts are missing) and Sheet 09 Problem 2 (data-dependent), the method is described.*

- ✎ Sheet 07, Problem 1 (assuming the required level is 350): (a) $349.98\pm1.96\cdot\frac{10}{\sqrt{20}}=[345.6,\,354.4]$. (b) $H_0:\mu=350$ vs $H_1:\mu\ne350$: $z=\frac{349.98-350}{10/\sqrt{20}}=-0.009$, far inside $\pm1.96$, so $H_0$ is not rejected (equivalently 350 lies in the CI). (c) No. Not rejecting $H_0$ does not prove it; the interval from (a) shows that values several mg away from 350 are still plausible. To demonstrate that the level is satisfied one must put "satisfied" into $H_1$.
- ✎ Sheet 07, Problem 2: (a) Reject $\vartheta=5$ if at least one of the two one-sided tests rejects: $\varphi=\max(\varphi_1,\varphi_2)$. (b) At $\vartheta=5$ the two rejection events cannot happen simultaneously (one needs large, the other small values), so the type I error probability is $\alpha_1+\alpha_2=0.05+0.10=0.15$: the constructed test has level $0.15$.
- ✎ Sheet 07, Problem 3: (a) $\overline X_{25}\sim N(500,10^2/25)=N(500,2^2)$ under $H_0$. $P(\overline X<496.5)+P(\overline X>503.5)=2\Phi(-1.75)=2\cdot0.0401\approx0.080$. This is a level-$0.1$ test but **not** a level-$0.05$ test (0.080 > 0.05). (b) Sketch the $N(500,2^2)$ density, shade both tails beyond 496.5 and 503.5 (each of area 0.040). (c) $504>503.5$, so reject $H_0$: the data indicate that the mean weight differs from 500 g.
- ✎ Sheet 07, Problem 4: (a) and (b): compute $P_{\mu=17.6}(\varphi_i=1)$ by standardising with $\sigma/\sqrt{50}=0.5/\sqrt{50}\approx0.0707$; a test is a level-0.05 test only if this probability is at most 0.05. (c) The rejection probability of such a one-sided test increases with $\mu$, so it is largest at the boundary $\mu=17.6$; if it is $\le\alpha$ there, it is $\le\alpha$ for all $\mu\le17.6$.
- ✎ Sheet 08, Problem 1: (a) $H_0:\mu\le2$ vs $H_1:\mu>2$ (the inspector wants evidence for "more than 2%"). (b) $T=2.467>t_{17,0.95}=1.740$, reject $H_0$. (c) $p=P(t_{17}>2.467)\approx0.0123<0.05$, reject again.
- ✎ Sheet 08, Problem 2: $H_0:p\le0.5$ vs $H_1:p>0.5$, $n=12$, 9 successes. (a) Exact: $p=P(X\ge9)=\frac{220+66+12+1}{4096}=\frac{299}{4096}\approx0.073>0.05$: **not** significant. (b) Approximate: $T=\frac{9-6}{\sqrt{12\cdot0.25}}=1.732$, $p=1-\Phi(1.732)\approx0.042<0.05$: significant. (c) The decisions differ. With $n=12$ the normal approximation is poor ($np_0(1-p_0)=3$ is far below the usual threshold of about 9), so the exact test should be trusted. A continuity correction ($\frac{8.5-6}{1.732}=1.44$, $p\approx0.074$) agrees with the exact result.
- ✎ Sheet 08, Problem 3: (a) Sign test: count the days with pressure above 1003.5 and compare with $Bin(16,\frac12)$ (two-sided, $\alpha=0.1$). (b) $T=\sqrt{16}\,\frac{991.81-1003.5}{\sqrt{690.63}}=-1.779$, $df=15$, two-sided $p\approx0.095<0.1$: the mean differs significantly from 1003.5 mbar.
- ✎ Sheet 09, Problem 1: (a) $H_0:\mu\ge3.7$ vs $H_1:\mu<3.7$ (evidence that no outsourcing is needed). $T=\sqrt{15}\,\frac{3.0867-3.7}{\sqrt{1.5084}}=-1.934$; critical value $t_{14,0.10}=-1.345$; since $-1.934<-1.345$, reject $H_0$. (b) $p=P(t_{14}<-1.934)\approx0.037<0.10$, same decision. (c) Plot the $t_{14}$ density; the critical value $-1.345$ cuts off an area of 0.10 in the left tail, the observed $-1.934$ cuts off 0.037.
- ✎ Sheet 09, Problem 2: (a) If the three most frequent numbers are picked *after* seeing the data, the observed relative frequency of this set is large by construction. (b) This is unacceptable because the hypothesis is formed from the same data used to test it: even with a fair die, the three most frequent faces among 25 rolls will on average cover more than half of the rolls, so the test would reject far more often than $\alpha$. Hypotheses must be fixed before the data are seen.
- ✎ Sheet 09, Problem 3: (a) $p=P(X\ge4)$ for $X\sim Bin(5,0.5)$ $=\frac{5+1}{32}=0.1875$. (b) $T=\sqrt{30}\,\frac{9.75-10}{\sqrt{1.6}}=-1.083$, $p=P(t_{29}<-1.083)\approx0.144$. (c) $T=\sqrt8\,\frac{1.9703-2}{0.1107}=-0.759$, two-sided $p=2P(t_7>0.759)\approx0.473$.
