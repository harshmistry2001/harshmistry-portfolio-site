# Sampling and the Central Limit Theorem

## Overview

We study a small sample to learn about a large population. Two things decide how far we can trust the result: whether the sample was drawn fairly (design) and how much a statistic like the mean would vary from sample to sample (the sampling distribution). The central limit theorem says this variation is approximately normal for large samples, which makes confidence intervals and tests possible.

## Concept

We almost never observe a whole **population**; we observe a **sample** and use sample statistics to learn about population parameters. Two questions matter: *is the sample representative?* (design) and *how much would the statistic vary from sample to sample?* ([sampling distribution](https://en.wikipedia.org/wiki/Sampling_distribution)).

### Sampling designs

- **Simple random sampling (SRS)** — every subset of size $n$ is equally likely; the basis of most formulas.
- **[Stratified sampling](https://en.wikipedia.org/wiki/Stratified_sampling)** — split the population into strata (regions, age groups) and sample within each; improves precision and guarantees coverage of small groups.
- **[Cluster sampling](https://en.wikipedia.org/wiki/Cluster_sampling)** — sample whole groups (schools, stores) and measure everyone in them; cheaper but less precise.
- **Systematic sampling** — every $k$-th unit from a list; simple, but dangerous if the list has a period.
- **Convenience / voluntary samples** — online polls, "whoever answered"; usually biased and not a basis for inference.

### Sources of error

- **Sampling error** — random variation because we observed only part of the population; shrinks as $n$ grows.
- **Non-sampling errors** — do *not* shrink with $n$: selection bias (frame excludes people), non-response bias, measurement error, [survivorship bias](https://en.wikipedia.org/wiki/Survivorship_bias). A huge biased sample is still biased.

### Sampling distribution of the mean

If $X_1, \dots, X_n$ are i.i.d. with mean $\mu$ and variance $\sigma^2$:

$$E(\bar X) = \mu, \qquad Var(\bar X) = \frac{\sigma^2}{n}, \qquad SE(\bar X) = \frac{\sigma}{\sqrt n}.$$

The **[standard error](https://en.wikipedia.org/wiki/Standard_error)** falls with $\sqrt n$: to halve it you need four times as many observations. For sampling without replacement from a finite population of size $N$, multiply the variance by the finite-population correction $\frac{N-n}{N-1}$.

For a proportion $\hat p$: $E(\hat p) = p$ and $SE(\hat p) = \sqrt{p(1-p)/n}$.

### Law of Large Numbers (LLN)

As $n \to \infty$, $\bar X_n \to \mu$. Averages of many observations are stable even when individual outcomes are wildly random — the principle that lets insurers and casinos operate.

### Central Limit Theorem (CLT)

For i.i.d. observations with finite variance, the standardised mean is approximately standard normal for large $n$:

$$\frac{\bar X_n - \mu}{\sigma/\sqrt n} \;\xrightarrow{d}\; N(0, 1), \qquad \text{equivalently } \sum_{i=1}^n X_i \approx N(n\mu,\, n\sigma^2).$$

- It holds **whatever the shape** of the population distribution (skewed, discrete, bimodal), provided the variance is finite.
- "Large $n$" depends on the shape: $n \approx 30$ is often enough for moderately skewed data; strongly skewed or heavy-tailed data (incomes, claim sizes) need much more. For proportions, $np$ and $n(1-p)$ should both be at least about 10.
- It fails for distributions without a finite variance (e.g. [Cauchy](https://en.wikipedia.org/wiki/Cauchy_distribution), Pareto with $\alpha \le 2$).
- The CLT is why normal-based confidence intervals and t-tests work for means of non-normal data.

## Common Mistakes

- Believing that a very large sample cures bias from a non-representative sampling frame.
- Applying the CLT to tiny samples of extremely skewed or heavy-tailed data.
- Confusing the standard deviation of the data with the standard error of the mean.

## When It's Used

Sampling theory decides how many customers to survey for a ±3-point margin of error, how many units to inspect per production lot, and how long an A/B test must run. The CLT justifies the normal approximations used in polling, quality-control charts ($\bar X$ charts), portfolio aggregation, risk pooling in insurance, and virtually all large-sample inference in analytics and econometrics.

## R Code

```r
set.seed(10)
# A strongly skewed "population": order values of 100,000 customers
population <- rlnorm(1e5, meanlog = 3.5, sdlog = 0.9)
mu <- mean(population); sigma <- sd(population)
c(mu = mu, sigma = sigma, skewness = mean((population - mu)^3) / sigma^3)

# Sampling distribution of the mean for different n
sim_means <- function(n, reps = 5000) replicate(reps, mean(sample(population, n)))
op <- par(mfrow = c(1, 3))
for (n in c(2, 10, 50)) {
  m <- sim_means(n)
  hist(m, breaks = 50, freq = FALSE, main = paste("n =", n), xlab = "sample mean")
  curve(dnorm(x, mu, sigma / sqrt(n)), add = TRUE, lwd = 2)     # CLT approximation
}
par(op)

# Standard error shrinks like 1 / sqrt(n)
ns <- c(25, 100, 400, 1600)
data.frame(n = ns, simulated_SE = sapply(ns, function(n) sd(sim_means(n, 2000))),
           theory_SE = sigma / sqrt(ns))

# Law of large numbers: running mean of one long sample
x <- sample(population, 5000)
plot(cumsum(x) / seq_along(x), type = "l", log = "x", ylab = "running mean", xlab = "n")
abline(h = mu, lty = 2)

# Stratified vs simple random sampling (population with two very different segments)
seg <- rep(c("consumer", "business"), times = c(90000, 10000))
spend <- ifelse(seg == "consumer", rnorm(1e5, 50, 15), rnorm(1e5, 400, 80))
srs <- replicate(3000, mean(sample(spend, 200)))
strat <- replicate(3000, {
  0.9 * mean(sample(spend[seg == "consumer"], 180)) + 0.1 * mean(sample(spend[seg == "business"], 20))
})
c(SE_srs = sd(srs), SE_stratified = sd(strat))

# Sample size for a proportion with margin of error 3 points at 95%
ceiling(qnorm(0.975)^2 * 0.5 * 0.5 / 0.03^2)
```

## Python Code

```python
import numpy as np
import matplotlib.pyplot as plt
from scipy import stats

rng = np.random.default_rng(10)
population = rng.lognormal(3.5, 0.9, 100_000)
mu, sigma = population.mean(), population.std()
print(f"mu={mu:.2f} sigma={sigma:.2f} skew={stats.skew(population):.2f}")


def sim_means(n, reps=5000):
    idx = rng.integers(0, population.size, size=(reps, n))   # i.i.d. draws
    return population[idx].mean(axis=1)


fig, ax = plt.subplots(1, 3, figsize=(13, 4))
for a, n in zip(ax, (2, 10, 50)):
    m = sim_means(n)
    a.hist(m, bins=50, density=True, color="0.8")
    g = np.linspace(m.min(), m.max(), 200)
    a.plot(g, stats.norm.pdf(g, mu, sigma / np.sqrt(n)), lw=2)
    a.set_title(f"n = {n}")
plt.tight_layout(); plt.show()

for n in (25, 100, 400, 1600):
    print(n, round(sim_means(n, 2000).std(), 3), round(sigma / np.sqrt(n), 3))

# Law of large numbers
x = rng.choice(population, 5000)
plt.semilogx(np.cumsum(x) / np.arange(1, 5001)); plt.axhline(mu, ls="--")
plt.ylabel("running mean"); plt.show()

# Stratified vs simple random sampling
consumer = rng.normal(50, 15, 90_000); business = rng.normal(400, 80, 10_000)
spend = np.r_[consumer, business]
srs = [rng.choice(spend, 200, replace=False).mean() for _ in range(3000)]
strat = [0.9 * rng.choice(consumer, 180, replace=False).mean()
         + 0.1 * rng.choice(business, 20, replace=False).mean() for _ in range(3000)]
print("SE srs:", np.std(srs), " SE stratified:", np.std(strat))

print("n for ±3 points:", int(np.ceil(stats.norm.ppf(0.975) ** 2 * 0.25 / 0.03**2)))
```

## Software Shortcuts

- **Excel:** Data → Data Analysis → **Sampling** (random or periodic sample from a range); `=RAND()` in a helper column + sort for an SRS; `=RANDARRAY()` (Excel 365); standard error `=STDEV.S(range)/SQRT(COUNT(range))`; margin of error `=CONFIDENCE.NORM(alpha, sd, n)`.
- **SPSS:** Data → **Select Cases** → *Random sample of cases*; Analyze → Complex Samples → **Prepare for Analysis** / **Select a Sample** for stratified and cluster designs; the Descriptives dialog can report *S.E. mean*.
- **Stata:** `sample 10` (keep 10%), `sample 200, count`; `svyset psu [pweight=w], strata(region)` then `svy: mean spend` for survey designs; `simulate` + `program` for CLT demonstrations.
- **Google Sheets:** `=RAND()` helper column, `=SORTN()`; standard error via `=STDEV()/SQRT(COUNT())`.

## Industry Examples

**Market research — national opinion poll.** A polling firm needs a ±3-point margin of error at 95% confidence for a yes/no question: $n = 1.96^2 \cdot 0.25 / 0.03^2 \approx 1{,}068$ respondents. It stratifies by region and age so that small groups are represented, then weights responses to census totals. When an online panel over-represented graduates, weighting corrected the estimate, but the firm reports a *design effect* of 1.6, inflating the effective margin to about ±3.8 points — sampling theory applied honestly.

**Insurance — risk pooling.** An individual home-contents policy has expected annual claims of 180 EUR but an SD of 1,500 EUR. For a portfolio of 50,000 independent policies, the CLT gives total claims ≈ Normal with mean 9.0 M EUR and SD $1{,}500\sqrt{50{,}000} \approx 335{,}000$ EUR, so a reserve of mean + 2.33 SD covers the year with 99% probability. The actuaries then add a catastrophe load, because storm claims are *not* independent — exactly where the i.i.d. assumption behind the CLT breaks.

**Semiconductor manufacturing — $\bar X$ control charts.** A fab measures the thickness of an oxide layer on 5 wafers per lot. Individual measurements are slightly skewed, but lot means are close to normal (CLT), so the process-control team draws an $\bar X$ chart with limits $\mu \pm 3\sigma/\sqrt 5$. The chart flags a lot whose mean is 3.4 standard errors high, traced to a furnace temperature drift before any out-of-spec wafers ship.

## Practice Questions

*✎ new question added for this site (worked solution below)*

- ✎ Individual values have standard deviation 20. What is the standard error of the mean for $n=100$ and for $n=400$?
- ✎ How many people must be surveyed so that the 95% margin of error for a proportion is at most ±3 percentage points (worst case $p=0.5$)?

## Solutions

*✎ solution written for this site*

- ✎ Q1: $SE=20/\sqrt{100}=2$ and $20/\sqrt{400}=1$: four times the sample size halves the standard error.
- ✎ Q2: $n=\frac{1.96^2\cdot0.25}{0.03^2}=1067.1$, so at least 1068 respondents.
