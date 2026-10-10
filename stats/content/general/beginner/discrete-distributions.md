# Discrete Distributions

## Overview

Discrete distributions describe counts: how many defects, clicks, claims or successes. Each has a story (a fixed number of trials, rare events in a window, waiting for the first success), and choosing the right one is mostly a matter of matching the story.

## Concept

A **discrete random variable** $X$ takes countably many values (0, 1, 2, …). Its distribution is described by the **probability mass function** (PMF) $p(k) = P(X = k)$ with $\sum_k p(k) = 1$, and by the **cumulative distribution function** $F(k) = P(X \le k)$.

### Expectation and variance

$$E(X) = \sum_k k\,p(k), \qquad Var(X) = E(X^2) - (E X)^2$$

Linear rules: $E(aX + b) = aE(X) + b$ and $Var(aX + b) = a^2 Var(X)$. For independent $X, Y$: $Var(X + Y) = Var(X) + Var(Y)$.

### The distributions you need

| Distribution | Models | PMF | Mean | Variance |
|---|---|---|---|---|
| [Bernoulli](https://en.wikipedia.org/wiki/Bernoulli_distribution)$(p)$ | one yes/no trial | $p^k(1-p)^{1-k}$, $k \in \{0,1\}$ | $p$ | $p(1-p)$ |
| [Binomial](https://en.wikipedia.org/wiki/Binomial_distribution)$(n, p)$ | successes in $n$ independent trials | $\binom{n}{k}p^k(1-p)^{n-k}$ | $np$ | $np(1-p)$ |
| [Poisson](https://en.wikipedia.org/wiki/Poisson_distribution)$(\lambda)$ | counts of rare events in a fixed window | $\frac{e^{-\lambda}\lambda^k}{k!}$ | $\lambda$ | $\lambda$ |
| Geometric$(p)$ | failures before the first success | $(1-p)^k p$ | $\frac{1-p}{p}$ | $\frac{1-p}{p^2}$ |
| [Negative binomial](https://en.wikipedia.org/wiki/Negative_binomial_distribution)$(r, p)$ | failures before the $r$-th success; over-dispersed counts | $\binom{k+r-1}{k}p^r(1-p)^k$ | $\frac{r(1-p)}{p}$ | $\frac{r(1-p)}{p^2}$ |
| [Hypergeometric](https://en.wikipedia.org/wiki/Hypergeometric_distribution)$(N, K, n)$ | successes in $n$ draws *without* replacement from $N$ items with $K$ successes | $\frac{\binom{K}{k}\binom{N-K}{n-k}}{\binom{N}{n}}$ | $n\frac{K}{N}$ | $n\frac{K}{N}\frac{N-K}{N}\frac{N-n}{N-1}$ |
| Discrete uniform$\{1..s\}$ | equally likely outcomes | $\frac1s$ | $\frac{s+1}{2}$ | $\frac{s^2-1}{12}$ |

### How to pick the right one

1. **Fixed number of independent trials, same success probability?** → Binomial.
2. **Sampling without replacement from a small population?** → Hypergeometric (binomial is fine if $n \le 5\%$ of $N$).
3. **Counting events in time/space with no upper limit, events independent, constant rate?** → Poisson. The Poisson also approximates Binomial$(n, p)$ with $\lambda = np$ when $n$ is large and $p$ small.
4. **Waiting for the first success?** → Geometric. Its memorylessness means past failures do not change future odds.
5. **Counts with variance clearly larger than the mean?** → Negative binomial ([over-dispersion](https://en.wikipedia.org/wiki/Overdispersion) is the rule in real count data: claims, visits, defects).

### Watch the parameterisation

Software differs: R's `dgeom` and SciPy's `nbinom` count *failures*, but SciPy's `geom` counts *trials* (starts at 1). R's `dhyper(x, m, n, k)` uses (successes, failures, draws); SciPy's `hypergeom(M, n, N)` uses (population, successes, draws). Always check with a quick mean calculation.

## Common Mistakes

- Using the binomial for draws without replacement from a small population (use the hypergeometric).
- Using the Poisson when the variance is clearly larger than the mean; use the negative binomial.
- Mixing up whether a geometric distribution counts failures or trials in the software you use.

## When It's Used

Discrete distributions model counts: call-centre arrivals per minute (staffing), insurance claims per policy (premium setting), defective items in a sample (acceptance sampling), conversions out of visitors (A/B testing), goals in a football match (sports betting), and website errors per hour (alert thresholds). They are also the basis of the binomial test, Poisson regression and many quality-control charts.

## R Code

```r
# Binomial: 500 visitors, conversion rate 4%
n <- 500; p <- 0.04
dbinom(20, n, p)                                   # P(X = 20)
pbinom(14, n, p)                                   # P(X <= 14) - a suspiciously low day
qbinom(c(0.025, 0.975), n, p)                      # central 95% range of daily conversions

# Poisson: 3.2 support tickets per hour
lambda <- 3.2
ppois(6, lambda, lower.tail = FALSE)               # P(more than 6 tickets)
qpois(0.99, lambda)                                # staffing level covering 99% of hours

# Poisson approximation to the binomial (rare events)
k <- 0:6
round(rbind(binomial = dbinom(k, 1000, 0.003), poisson = dpois(k, 3)), 4)

# Hypergeometric: lot of 200 parts with 6 defectives, inspect 20, accept if 0 defective
dhyper(0, m = 6, n = 194, k = 20)                  # probability of accepting a bad lot

# Geometric: calls until the first sale with p = 0.15 (failures before success)
pgeom(9, 0.15)                                     # P(sale within the first 10 calls)

# Negative binomial for over-dispersed counts (mean 2, size 1.5)
set.seed(3)
claims <- rnbinom(5000, size = 1.5, mu = 2)
c(mean = mean(claims), var = var(claims))          # variance >> mean

# Checking a Poisson assumption: compare observed and expected frequencies
tickets <- rpois(300, lambda)
obs <- table(factor(pmin(tickets, 8), levels = 0:8))
expd <- 300 * c(dpois(0:7, mean(tickets)), ppois(7, mean(tickets), lower.tail = FALSE))
round(rbind(observed = obs, expected = expd), 1)

barplot(dbinom(0:40, n, p), names.arg = 0:40, main = "Binomial(500, 0.04)", xlab = "conversions")
```

## Python Code

```python
import numpy as np
from scipy import stats
import matplotlib.pyplot as plt

# Binomial
n, p = 500, 0.04
B = stats.binom(n, p)
print("P(X=20):", B.pmf(20), " P(X<=14):", B.cdf(14), " 95% range:", B.ppf([0.025, 0.975]))

# Poisson
P = stats.poisson(3.2)
print("P(X>6):", P.sf(6), " 99% quantile:", P.ppf(0.99))

k = np.arange(7)
print(np.round(np.vstack([stats.binom(1000, 0.003).pmf(k), stats.poisson(3).pmf(k)]), 4))

# Hypergeometric: SciPy order is (population M, successes n, draws N)
print("P(accept bad lot):", stats.hypergeom(M=200, n=6, N=20).pmf(0))

# Geometric counting failures -> shift SciPy's trial-based geom by loc=-1
print("P(sale within 10 calls):", stats.geom(0.15, loc=-1).cdf(9))

# Negative binomial with mean mu and size r: p = r / (r + mu)
r, mu = 1.5, 2
rng = np.random.default_rng(3)
claims = stats.nbinom(r, r / (r + mu)).rvs(5000, random_state=rng)
print("mean:", claims.mean(), " var:", claims.var(ddof=1))

# Observed vs expected Poisson frequencies
tickets = rng.poisson(3.2, 300)
lam = tickets.mean()
obs = np.bincount(np.minimum(tickets, 8), minlength=9)
expd = 300 * np.r_[stats.poisson(lam).pmf(np.arange(8)), stats.poisson(lam).sf(7)]
print(np.vstack([obs, expd.round(1)]))

kk = np.arange(41)
plt.bar(kk, B.pmf(kk)); plt.title("Binomial(500, 0.04)"); plt.xlabel("conversions")
plt.show()
```

## Software Shortcuts

- **Excel:** `=BINOM.DIST(k, n, p, FALSE)` (PMF) / `TRUE` (CDF), `=BINOM.INV(n, p, alpha)` (quantile), `=BINOM.DIST.RANGE(n, p, k1, k2)`, `=POISSON.DIST(k, lambda, cumulative)`, `=HYPGEOM.DIST(k, n_draws, K, N, cumulative)`, `=NEGBINOM.DIST(failures, successes, p, cumulative)`.
- **SPSS:** Transform → Compute Variable → Function group *PDF & Noncentral PDF* (`PDF.BINOM`, `PDF.POISSON`, `PDF.HYPER`), *CDF & Noncentral CDF* (`CDF.BINOM`, …), *Inverse DF*; random draws with `RV.BINOM`, `RV.POISSON`.
- **Stata:** `display binomialp(500, 20, 0.04)`, `binomial(n, k, p)` (CDF), `poissonp(3.2, 6)`, `poisson(3.2, 6)` (CDF), `hypergeometricp(200, 6, 20, 0)`.
- **Google Sheets:** `=BINOM.DIST()`, `=POISSON.DIST()`, `=HYPGEOM.DIST()`, `=NEGBINOM.DIST()` — same arguments as Excel.

## Industry Examples

**Call centres — staffing with the Poisson.** A telecom call centre receives on average 180 calls per hour in the evening peak, i.e. 3 per minute. Modelling arrivals per minute as Poisson(3), the 99th percentile is 8 calls; combined with a 4-minute average handle time (Erlang-C model built on the same Poisson assumption) the workforce team schedules 16 agents to answer 80% of calls within 20 seconds. When they compared observed minute-counts with the Poisson PMF, the fit broke down on Monday mornings (over-dispersion), which led to a separate negative-binomial forecast for that shift.

**Manufacturing — acceptance sampling.** A medical-device maker receives lots of 2,000 plastic housings. Its sampling plan inspects 80 units and accepts the lot if at most 1 is defective. Using the binomial (sample is 4% of the lot), the operating-characteristic curve shows a lot with 1% defectives is accepted 81% of the time, while a lot with 5% defectives is accepted only 9% of the time — numbers the quality team documents for the supplier agreement and for ISO 2859 compliance.

**Digital marketing — daily conversion alerts.** An online retailer expects 4% of 500 daily visitors from a paid campaign to convert. Rather than a fixed "fewer than 15 conversions" rule, the analytics team alerts when the day's count falls below the 1% binomial quantile (11 conversions). The alert fired twice in a quarter — both times a broken tracking pixel after a site release — while an ad-hoc threshold had previously created weekly false alarms.

## Practice Questions

*✎ new question added for this site (worked solution below)*

- ✎ A machine produces defective items with probability 0.2 independently. In a sample of 10 items, what is the probability of exactly 2 defects, and of at least 1 defect?
- ✎ The number of customers arriving per minute has sample mean 4 and sample variance 9. Is a Poisson model appropriate? What would you use instead?

## Solutions

*✎ solution written for this site*

- ✎ Q1: $X\sim Bin(10,0.2)$: $P(X=2)=\binom{10}{2}0.2^2\,0.8^8=0.302$; $P(X\ge1)=1-0.8^{10}=0.893$.
- ✎ Q2: A Poisson distribution has variance equal to the mean (4); a variance of 9 indicates over-dispersion (customers arrive in clusters). A negative binomial model is more appropriate.
