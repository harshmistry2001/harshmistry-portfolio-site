# Continuous Distributions

## Overview

Continuous distributions model measurements such as time, weight or money. They are described by a density curve, and probabilities are areas under the curve. The normal distribution is the most important; the exponential, log-normal, Weibull and Pareto distributions cover waiting times, lifetimes, skewed amounts and heavy tails.

## Concept

A **continuous random variable** can take any value in an interval. Its distribution is described by a **[probability density function](https://en.wikipedia.org/wiki/Probability_density_function)** (PDF) $f(x) \ge 0$ with $\int_{-\infty}^{\infty} f(x)\,dx = 1$. Probabilities are *areas*:

$$P(a < X \le b) = \int_a^b f(x)\,dx = F(b) - F(a),$$

where $F(x) = P(X \le x)$ is the cumulative distribution function (CDF). A single value has probability zero, so $P(X \le b) = P(X < b)$. The **quantile function** $F^{-1}(p)$ returns the value below which a share $p$ of the distribution lies.

Expectation and variance: $E(X) = \int x f(x)\,dx$, $Var(X) = E(X^2) - (EX)^2$.

### The key distributions

| Distribution | Support | Typical use | Mean | Variance |
|---|---|---|---|---|
| Uniform$(a, b)$ | $[a, b]$ | no information beyond a range; simulation | $\frac{a+b}{2}$ | $\frac{(b-a)^2}{12}$ |
| Normal$(\mu, \sigma^2)$ | $\mathbb R$ | measurement error, averages, heights | $\mu$ | $\sigma^2$ |
| Exponential$(\lambda)$ | $[0, \infty)$ | waiting times between random events | $\frac1\lambda$ | $\frac1{\lambda^2}$ |
| Gamma$(k, \theta)$ | $[0, \infty)$ | sums of waiting times, claim sizes | $k\theta$ | $k\theta^2$ |
| [Log-normal](https://en.wikipedia.org/wiki/Log-normal_distribution)$(\mu, \sigma^2)$ | $(0, \infty)$ | prices, incomes, file sizes | $e^{\mu + \sigma^2/2}$ | $(e^{\sigma^2}-1)e^{2\mu+\sigma^2}$ |
| [Weibull](https://en.wikipedia.org/wiki/Weibull_distribution)$(k, \lambda)$ | $[0, \infty)$ | lifetimes with increasing/decreasing failure rate | $\lambda\Gamma(1 + 1/k)$ | — |
| [Pareto](https://en.wikipedia.org/wiki/Pareto_distribution)$(x_m, \alpha)$ | $[x_m, \infty)$ | heavy tails: wealth, city sizes, large losses | $\frac{\alpha x_m}{\alpha-1}$ ($\alpha > 1$) | — |
| Beta$(a, b)$ | $[0, 1]$ | proportions and probabilities | $\frac{a}{a+b}$ | — |

Sampling distributions used in inference — Student's $t$, $\chi^2$ and $F$ — are also continuous; they appear in confidence intervals and tests.

### The normal distribution

$$f(x) = \frac{1}{\sigma\sqrt{2\pi}}\exp\!\left(-\frac{(x-\mu)^2}{2\sigma^2}\right)$$

- Symmetric and bell-shaped; mean = median = mode.
- **Standardisation:** $Z = \frac{X - \mu}{\sigma} \sim N(0, 1)$, so $P(X \le x) = \Phi\!\left(\frac{x-\mu}{\sigma}\right)$.
- **Empirical rule:** about 68% / 95% / 99.7% of values lie within 1 / 2 / 3 standard deviations of the mean.
- Key quantiles: $z_{0.95} = 1.645$, $z_{0.975} = 1.960$, $z_{0.995} = 2.576$.
- Sums of independent normals are normal; the [Central Limit Theorem](https://en.wikipedia.org/wiki/Central_limit_theorem) makes averages of *any* distribution approximately normal.

### The exponential distribution and memorylessness

$f(x) = \lambda e^{-\lambda x}$, $P(X > t) = e^{-\lambda t}$. It is the only continuous [memoryless](https://en.wikipedia.org/wiki/Memorylessness) distribution: $P(X > s + t \mid X > s) = P(X > t)$. If events occur as a Poisson process with rate $\lambda$, the gaps between them are Exponential($\lambda$). Real equipment that wears out is better modelled by a Weibull with shape $k > 1$.

### Parameterisation traps

R's `dnorm(x, mean, sd)` and SciPy's `norm(loc, scale)` use the **standard deviation**, not the variance. R's `dexp(x, rate)` uses $\lambda$; SciPy's `expon(scale=1/λ)` uses the mean. SciPy's `lognorm(s=σ, scale=exp(μ))`.

## Common Mistakes

- Reading the density value $f(x)$ as a probability (it can exceed 1).
- Passing the variance instead of the standard deviation to software that expects the standard deviation.
- Modelling heavy-tailed amounts (insurance losses, wealth) with a normal distribution, which makes extreme events look impossible.

## When It's Used

Continuous distributions are the modelling toolkit for measurements: tolerance analysis and process capability in manufacturing (normal), reliability and warranty planning (exponential, Weibull), queue and service-time modelling (exponential, gamma), financial returns and risk (normal, Student-t, log-normal), insurance severity models (gamma, log-normal, Pareto) and Monte Carlo simulation of business plans (uniform, triangular, normal inputs).

## R Code

```r
# Normal: bottle filling, mean 500 ml, sd 4 ml, spec limits 490-510 ml
mu <- 500; sigma <- 4
pnorm(510, mu, sigma) - pnorm(490, mu, sigma)          # share within spec
pnorm(490, mu, sigma) + pnorm(510, mu, sigma, lower.tail = FALSE)   # share out of spec
qnorm(0.99, mu, sigma)                                   # fill level exceeded by only 1%

# Empirical rule
sapply(1:3, function(k) pnorm(k) - pnorm(-k))

# Exponential: time between server failures, mean 400 hours
rate <- 1 / 400
pexp(100, rate)                                          # failure within 100 hours
pexp(150, rate, lower.tail = FALSE) / pexp(50, rate, lower.tail = FALSE)   # memoryless
exp(-rate * 100)                                         # same as P(X > 100)

# Weibull lifetime with wear-out (shape 2.5, scale 1000 hours): warranty covering 5% failures
qweibull(0.05, shape = 2.5, scale = 1000)

# Log-normal incomes: median 45,000, sigma 0.6
meanlog <- log(45000); sdlog <- 0.6
c(median = qlnorm(0.5, meanlog, sdlog), mean = exp(meanlog + sdlog^2 / 2))
plnorm(100000, meanlog, sdlog, lower.tail = FALSE)       # share above 100k

# Uniform: arrival in a 2-hour delivery window (minutes)
punif(30, 0, 120)

# Compare shapes
curve(dnorm(x, 5, 2), 0, 15, ylim = c(0, 0.25), ylab = "density", main = "Densities with mean 5")
curve(dexp(x, 1 / 5), add = TRUE, lty = 2)
curve(dgamma(x, shape = 5, scale = 1), add = TRUE, lty = 3)
curve(dlnorm(x, log(5) - 0.5^2 / 2, 0.5), add = TRUE, lty = 4)
legend("topright", c("normal", "exponential", "gamma", "log-normal"), lty = 1:4, bty = "n")

# Fit a distribution by maximum likelihood (MASS ships with R)
library(MASS)
set.seed(2)
lifetimes <- rweibull(200, shape = 2.5, scale = 1000)
fitdistr(lifetimes, "weibull")
```

## Python Code

```python
import numpy as np
from scipy import stats
import matplotlib.pyplot as plt

# Normal: bottle filling
fill = stats.norm(loc=500, scale=4)                  # scale = standard deviation
print("within spec:", fill.cdf(510) - fill.cdf(490))
print("out of spec:", fill.cdf(490) + fill.sf(510))
print("99% quantile:", fill.ppf(0.99))
print("empirical rule:", [round(stats.norm.cdf(k) - stats.norm.cdf(-k), 4) for k in (1, 2, 3)])

# Exponential: SciPy uses scale = mean = 1 / rate
fail = stats.expon(scale=400)
print("P(fail < 100h):", fail.cdf(100), " memoryless:", fail.sf(150) / fail.sf(50), fail.sf(100))

# Weibull warranty period
print("5% failure time:", stats.weibull_min(c=2.5, scale=1000).ppf(0.05))

# Log-normal incomes
inc = stats.lognorm(s=0.6, scale=45000)              # scale = exp(meanlog)
print("median:", inc.median(), " mean:", inc.mean(), " P(>100k):", inc.sf(100_000))

print("P(arrive in first 30 min):", stats.uniform(0, 120).cdf(30))

x = np.linspace(0.01, 15, 400)
for dist, label in [(stats.norm(5, 2), "normal"), (stats.expon(scale=5), "exponential"),
                    (stats.gamma(a=5, scale=1), "gamma"),
                    (stats.lognorm(s=0.5, scale=np.exp(np.log(5) - 0.125)), "log-normal")]:
    plt.plot(x, dist.pdf(x), label=label)
plt.legend(); plt.title("Densities with mean 5"); plt.ylabel("density")
plt.show()

# Maximum-likelihood fit
rng = np.random.default_rng(2)
lifetimes = stats.weibull_min(c=2.5, scale=1000).rvs(200, random_state=rng)
shape, loc, scale = stats.weibull_min.fit(lifetimes, floc=0)
print(f"fitted shape={shape:.3f}, scale={scale:.1f}")
```

## Software Shortcuts

- **Excel:** `=NORM.DIST(x, mean, sd, TRUE)`, `=NORM.INV(p, mean, sd)`, `=NORM.S.DIST(z, TRUE)`, `=NORM.S.INV(p)`, `=STANDARDIZE(x, mean, sd)`, `=EXPON.DIST(x, lambda, TRUE)`, `=GAMMA.DIST()`, `=LOGNORM.DIST()`, `=WEIBULL.DIST()`, `=BETA.DIST()`. Simulate with `=NORM.INV(RAND(), mean, sd)`.
- **SPSS:** Transform → Compute Variable → `CDF.NORMAL(x, mean, sd)`, `IDF.NORMAL(p, mean, sd)`, `CDF.EXP`, `CDF.LNORMAL`, `CDF.WEIBULL`, `RV.NORMAL` for simulation. Analyze → Descriptive Statistics → **P-P Plots** / **Q-Q Plots** let you test fits against many distributions.
- **Stata:** `display normal(z)`, `invnormal(p)`, `display 1 - exponential(1/400, 100)` (Stata's exponential takes the mean-scale form, check `help exponential()`), `weibull(k, λ, x)`, `lnormal()`; `rnormal(m, s)` for simulation.
- **Google Sheets:** `=NORM.DIST()`, `=NORM.INV()`, `=EXPON.DIST()`, `=LOGNORM.DIST()`, `=WEIBULL.DIST()`.

## Industry Examples

**Food & beverage — filling control.** A brewery fills 500 ml bottles; legal metrology rules allow few underfilled units. With a filling SD of 4 ml, centring the machine at 500 ml would put 0.6% of bottles below 490 ml. Using the normal quantile, engineers raise the target to 503 ml, cutting underfills to about 0.06% at a beer "give-away" cost they can quantify per million bottles — a direct trade-off computed from $\Phi$.

**Consumer electronics — warranty planning.** A laptop maker fits a Weibull distribution (shape ≈ 1.8, scale ≈ 6.5 years) to field-failure data of battery packs. The CDF at 2 years predicts ≈ 11% failures within warranty, which sets the warranty reserve per unit sold. When a new cell supplier's accelerated-life tests show a shape parameter near 1 (constant hazard, exponential-like), the team investigates random early failures rather than wear-out.

**Insurance — severity modelling.** A property insurer models individual claim amounts with a log-normal for attritional losses and a Pareto tail above 1 million EUR for large fires. Using the fitted Pareto ($\alpha \approx 1.6$), the probability that a claim exceeds 10 million given it exceeds 1 million is $10^{-1.6} \approx 2.5\%$ — the figure the reinsurance team uses to price an excess-of-loss layer. A normal model would have made such losses practically impossible.

## Practice Questions

*✎ new question added for this site (worked solution below)*

- ✎ IQ scores are $N(100,15^2)$. Find the probability that a score lies between 85 and 115, and the 95th percentile.
- ✎ A device fails at rate $\lambda=0.2$ per hour (exponential). Find $P(X>5)$ and $P(X>8\mid X>3)$.

## Solutions

*✎ solution written for this site*

- ✎ Q1: $85$ and $115$ are $\mp1$ standard deviation from the mean: $P=\Phi(1)-\Phi(-1)=0.683$. The 95th percentile is $100+1.645\cdot15=124.7$.
- ✎ Q2: $P(X>5)=e^{-0.2\cdot5}=e^{-1}=0.368$. By memorylessness $P(X>8\mid X>3)=P(X>5)=0.368$.
