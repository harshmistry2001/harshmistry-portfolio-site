# Descriptive Statistics and Probability Theory

> Course part: Stats 2

## Overview

Stats 2 changes the viewpoint. In Stats 1 we *described* the data we had; now we treat the data as the outcome of a random mechanism and ask what they tell us about unknown quantities (*inferential statistics*). This page is the bridge: it recalls the descriptive tools, shows their theoretical counterparts, and introduces the two limit theorems that make inference possible.

## Concept

### Empirical versus theoretical

| Empirical (from the sample) | Theoretical (of the model) |
|---|---|
| relative frequencies, histogram | probability function, density |
| sample mean $\overline{x}=\frac1n\sum x_i$ | expected value $E(X)$ |
| sample variance $s_x^2=\frac1{n-1}\sum(x_i-\overline{x})^2$ | variance $Var(X)$ |
| empirical quantile, EDF | theoretical quantile, distribution function |

Inferential statistics models observations $x_1,\dots,x_n$ as realisations of random variables $X_1,\dots,X_n$ and uses the empirical quantities to learn about the theoretical ones.

### Rules for expectation and variance

For constants $a,b$:

$$E(aX+bY)=aE(X)+bE(Y),\qquad Var(aX+b)=a^2Var(X).$$
For **independent** (or merely uncorrelated) $X,Y$: $Var(aX+bY)=a^2Var(X)+b^2Var(Y)$. In general $Var(X+Y)=Var(X)+Var(Y)+2\,Cov(X,Y)$.

### Covariance and correlation

$Cov(X,Y)=E(XY)-E(X)E(Y)$ and the [correlation](https://en.wikipedia.org/wiki/Correlation) $\rho(X,Y)=\dfrac{Cov(X,Y)}{\sqrt{Var(X)Var(Y)}}\in[-1,1]$. Independent variables are uncorrelated; **uncorrelated variables need not be independent** (exception: jointly normal variables).

### Law of large numbers and central limit theorem

For i.i.d. $X_1,\dots,X_n$ with mean $\mu$ and variance $\sigma^2$:

- The [law of large numbers](https://en.wikipedia.org/wiki/Law_of_large_numbers): $\overline{X}_n\to\mu$ as $n\to\infty$. Sample averages converge to the expected value; this justifies estimating $\mu$ by $\overline{X}_n$.
- The [central limit theorem](https://en.wikipedia.org/wiki/Central_limit_theorem) (CLT):
$$\frac{\sqrt n\,(\overline{X}_n-\mu)}{\sigma}\ \approx\ N(0,1)\quad\text{for large } n,$$
and equivalently for sums $S_n=\sum X_i$: $P(a\le S_n\le b)\approx\Phi\!\Big(\frac{b-n\mu}{\sqrt{n\sigma^2}}\Big)-\Phi\!\Big(\frac{a-n\mu}{\sqrt{n\sigma^2}}\Big)$.

The CLT holds whatever the shape of the original distribution, provided the variance is finite.

## Worked Example

A bank expects 400 independent withdrawals per day; each is 100 EUR on average with a standard deviation of 80 EUR. The daily total $S$ has $E(S)=400\cdot100=40{,}000$ and $Var(S)=400\cdot80^2$, so $\sigma_S=20\cdot80=1600$. By the CLT, $S\approx N(40000,1600^2)$ and, for example, $P(S>43000)\approx1-\Phi\big(\frac{3000}{1600}\big)=1-\Phi(1.875)\approx0.030$.

## Common Mistakes

- Using $Var(X+Y)=Var(X)+Var(Y)$ without independence (or at least zero covariance).
- Using $\sqrt{n}\,\sigma$ for the standard deviation of the *mean* (it is $\sigma/\sqrt n$; the sum has $\sqrt n\,\sigma$).
- Applying the CLT to tiny samples of strongly skewed data.

## When It's Used

Stats 2 starts by switching from *describing data* to *modelling data as random variables*. The Law of Large Numbers justifies using sample averages as estimates; the Central Limit Theorem justifies normal-based intervals and tests for averages and sums — the reason a bank can approximate total daily withdrawals, or a pollster the share of "yes" voters, with a normal distribution.

**Exam tip:** for a sum of $n$ i.i.d. variables use $E = n\mu$, $Var = n\sigma^2$ and then $\Phi$. Uncorrelated does **not** imply independent (except for the bivariate normal).

## R Code

```r
# Practice Sheet 02, Problem 1: unfair coin, P(H) = 0.6, 100 flips
n <- 100; p <- 0.6
c(E = n * p, SD = sqrt(n * p * (1 - p)))

# |S_H - S_T| < 10  <=>  |2 S_H - 100| < 10  <=>  45 < S_H < 55
mu <- n * p; s <- sqrt(n * p * (1 - p))
pnorm((55 - mu) / s) - pnorm((45 - mu) / s)          # CLT approximation
sum(dbinom(46:54, n, p))                             # exact value for comparison

# Practice Sheet 01, Problem 3: density (a+1) x^a on [0, 1], here a = 2
a <- 2; f <- function(x) (a + 1) * x^a
EX  <- integrate(function(x) x * f(x), 0, 1)$value
EX2 <- integrate(function(x) x^2 * f(x), 0, 1)$value
c(E = EX, formula = (a + 1) / (a + 2), Var = EX2 - EX^2)

# CLT in action: means of skewed (exponential) data look normal
set.seed(1)
means <- replicate(5000, mean(rexp(30, rate = 1)))
hist(means, breaks = 50, freq = FALSE, main = "Sample means, n = 30")
curve(dnorm(x, 1, 1 / sqrt(30)), add = TRUE, lwd = 2)
```

## Python Code

```python
import numpy as np
from scipy import stats
from scipy.integrate import quad
import matplotlib.pyplot as plt

n, p = 100, 0.6
mu, s = n * p, np.sqrt(n * p * (1 - p))
print("E =", mu, " SD =", s)
print("CLT:  ", stats.norm.cdf((55 - mu) / s) - stats.norm.cdf((45 - mu) / s))
print("exact:", stats.binom(n, p).pmf(np.arange(46, 55)).sum())

a = 2
f = lambda x: (a + 1) * x**a
EX = quad(lambda x: x * f(x), 0, 1)[0]
EX2 = quad(lambda x: x**2 * f(x), 0, 1)[0]
print("E =", EX, (a + 1) / (a + 2), " Var =", EX2 - EX**2)

rng = np.random.default_rng(1)
means = rng.exponential(1, size=(5000, 30)).mean(axis=1)
plt.hist(means, bins=50, density=True)
xs = np.linspace(means.min(), means.max(), 200)
plt.plot(xs, stats.norm.pdf(xs, 1, 1 / np.sqrt(30)))
plt.title("Sample means, n = 30")
plt.show()
```

## Practice Questions

*◆ original question from the course material · ✎ new question added for this site (worked solution below)*

- ◆ Practice Sheet 01, Problem 1: Let X and Y be random variables with expected values $E(X)$ and $E(Y)$ and variances $Var(X)$ and Var (Y). Moreover, let a, $b\in\mathbb{R}$ be constants.
  - (a) Complete the following equations for the expectation: $E(X+a)=$, $E(aX+bY)=$, $E(aX)=$, $E(a)=$.
  - (b) Suppose that, in addition, X and Y are independent. Complete the following equations for the variance: $Var(X+a)=$, $Var(aX+bY)=$, $Var(aX)=$, $Var(a)=$.
- ◆ Practice Sheet 01, Problem 2: Let A and B be two events with $P(B)>0$ and $P(A\vert{}B)=P(A)$. Show that A and B are independent.
- ◆ Practice Sheet 01, Problem 3: Let $a>0$. The random variable X has the density $f(x) = (a+1)x^a$ for $x\in[0,1]$, $0$ otherwise. Calculate the expectation and variance.
- ◆ Practice Sheet 01, Problem 4: Let $z>1$. The random variable X has the probability function $p(x) = \frac{1}{2}$ for $x\in\{1\}$, $\frac{z-1}{2z}$ for $x\in\{0,2\}$, and $0$ otherwise. Calculate the expectation and variance.
- ◆ Practice Sheet 02, Problem 1: An unfair coin with probability of heads $P(H)=0.6$ is flipped 100 times. Let $S_{H}$ be the number of heads observed.
  - (a) Calculate the expected value and standard deviation of $S_{H}$.
  - (b) Use the Central Limit Theorem to determine the probability that the number of heads $S_{H}$ and the number of tails $S_{T}=100-S_{H}$ differ by less than 10.
- ◆ Practice Sheet 02, Problem 2: Consider the random variables $X:\Omega\rightarrow\{1,2\}$ and $Y:\Omega\rightarrow\{2,4\}$. Complete the distribution table under the condition, that X and Y are independent. Calculate the expectation and variance of X, Y, $X+Y$.
- ✎ A fair die is rolled 100 times. Use the CLT to approximate the probability that the sum of the results exceeds 370.

## Solutions

*✎ solution written for this site*

*Problem 2 is solved in general; for Problem 2 of Sheet 02 the distribution table from the source is needed.*

- ✎ Sheet 01, Problem 1: (a) $E(X+a)=E(X)+a$; $E(aX+bY)=aE(X)+bE(Y)$; $E(aX)=aE(X)$; $E(a)=a$. (b) $Var(X+a)=Var(X)$; $Var(aX+bY)=a^2Var(X)+b^2Var(Y)$; $Var(aX)=a^2Var(X)$; $Var(a)=0$.
- ✎ Sheet 01, Problem 2: By the definition of conditional probability $P(A\mid B)=\frac{P(A\cap B)}{P(B)}$. The assumption $P(A\mid B)=P(A)$ gives $P(A\cap B)=P(A)P(B)$, which is exactly the definition of independence.
- ✎ Sheet 01, Problem 3: $E(X)=\int_0^1x(a+1)x^a\,dx=\frac{a+1}{a+2}$. $E(X^2)=\int_0^1(a+1)x^{a+2}dx=\frac{a+1}{a+3}$. So $Var(X)=\frac{a+1}{a+3}-\frac{(a+1)^2}{(a+2)^2}=\frac{a+1}{(a+3)(a+2)^2}$.
- ✎ Sheet 01, Problem 4: As printed, the probabilities add up to 1 only for $z=2$; the intended probability function is most likely $p(1)=\frac1z$, $p(0)=p(2)=\frac{z-1}{2z}$. With this reading: $E(X)=\frac1z+2\cdot\frac{z-1}{2z}=1$, $E(X^2)=\frac1z+4\cdot\frac{z-1}{2z}=\frac{2z-1}{z}$ and $Var(X)=\frac{2z-1}{z}-1=\frac{z-1}{z}$. (For $z=2$ both readings agree: $E=1$, $Var=\frac12$.)
- ✎ Sheet 02, Problem 1: (a) $S_H\sim Bin(100,0.6)$: $E=60$, $\sigma=\sqrt{100\cdot0.6\cdot0.4}=\sqrt{24}\approx4.90$. (b) $|S_H-S_T|<10\iff|2S_H-100|<10\iff45<S_H<55$. CLT: $\Phi\big(\frac{55-60}{4.90}\big)-\Phi\big(\frac{45-60}{4.90}\big)=\Phi(-1.02)-\Phi(-3.06)\approx0.153$ (with a continuity correction, counting $46\le S_H\le54$, one gets $\approx0.129$).
- ✎ Sheet 02, Problem 2: With independence, each table entry is the product of the marginal probabilities; $E(X+Y)=E(X)+E(Y)$ and $Var(X+Y)=Var(X)+Var(Y)$.
- ✎ Q7 (new question): One roll has $\mu=3.5$, $\sigma^2=35/12$, so the sum has mean $350$ and variance $100\cdot35/12\approx291.7$ ($\sigma\approx17.1$). $P(S>370)\approx1-\Phi\big(\frac{370-350}{17.08}\big)=1-\Phi(1.17)\approx0.121$.
