# Practice: Discrete and Continuous Distributions

> Course part: Stats 1

## Overview

A set of word problems that ask you to recognise *which* named distribution describes a situation and then compute probabilities or quantiles. It covers the hypergeometric, continuous uniform, exponential and normal distributions. The skill being trained is translating a story into parameters.

## Topics to Review

- [Hypergeometric Distribution](#/study/stats1/hypergeometric-distribution)
- [Continuous Uniform Distribution](#/study/stats1/continuous-uniform-distribution)
- [Exponential Distribution](#/study/stats1/exponential-distribution)
- [Normal and Standard Normal Distributions](#/study/stats1/normal-and-standard-normal-distributions)

## How to Approach the Questions

| Story | Distribution |
|---|---|
| draws **without replacement** from a finite population | hypergeometric |
| value equally likely anywhere in an interval | continuous uniform |
| time until a random event, constant rate | exponential ($\lambda=1/\text{mean}$) |
| measurement around a mean with symmetric scatter | normal |

- For the normal distribution, standardise with $z=(x-\mu)/\sigma$. The notation $N(3,4)$ means variance 4, so $\sigma=2$.
- For continuous variables, $P(X=x)=0$ and $\le$ vs $<$ does not matter.

## When It's Used

This practice set applies the named distributions to word problems: hypergeometric (cookies), continuous uniform (gas station), exponential (insurance risk groups) and normal with table look-ups. The code computes every numerical answer so you can check your table work.

**Exam tip:** identify the distribution first from the story — *without replacement* → hypergeometric, *equally likely in an interval* → uniform, *waiting time* → exponential, *measurement around a mean* → normal.

## R Code

```r
# Q1 cookies: 12 cookies, 3 salty, take 4 without replacement, P(X <= 1)
phyper(1, m = 3, n = 9, k = 4)

# Q2 gas station: X ~ U[12000, theta], E(X) = 14000
theta <- 2 * 14000 - 12000
c(theta = theta,
  b = punif(14200, 12000, theta) - punif(12200, 12000, theta),
  c = punif(15000, 12000, theta, lower.tail = FALSE),
  d = 0)

# Q3 insurance: X_i ~ Exp(1 / (5 i^2))
lam <- function(i) 1 / (5 * i^2)
c(a = 1 - pexp(6, lam(1)), b = pexp(24, lam(2)) - pexp(12, lam(2)), c = pexp(10, lam(3)))

# Q4 X ~ N(3, 4) -> sd = 2
c(a = 1 - pnorm(2.5, 3, 2), b = pnorm(3.3, 3, 2) - pnorm(1.2, 3, 2), c = 2 * qnorm(0.975))
```

## Python Code

```python
from scipy import stats

print("Q1:", stats.hypergeom(M=12, n=3, N=4).cdf(1))

theta = 2 * 14000 - 12000
U = stats.uniform(12000, theta - 12000)
print("Q2:", theta, U.cdf(14200) - U.cdf(12200), U.sf(15000), 0)

E = lambda i: stats.expon(scale=5 * i**2)          # scale = 1 / lambda = 5 i^2
print("Q3:", E(1).sf(6), E(2).cdf(24) - E(2).cdf(12), E(3).cdf(10))

X = stats.norm(3, 2)
print("Q4:", X.sf(2.5), X.cdf(3.3) - X.cdf(1.2), 2 * stats.norm.ppf(0.975))
```

## Practice Questions

*◆ original question from the course material · ✎ new question added for this site (worked solution below)*

- ◆ [practice sheet] In a package with twelve cookies there are three cookies which are accidentally salty. If a person randomly takes four cookies without replacement, what will be the probability that at most one of the cookies will be salty?
- ◆ [practice sheet] The daily sales volume of gasoline (in liters) of a gas station near Magdeburg can be modeled by a continuously uniformly distributed random variable $X$ on the interval $[12000, \theta]$. The operator of the gas station knows from experience that the expected sales volume per day is 14000 liters.
  - (a) Determine $\theta$.
  - (b) Calculate the probability that the quantity of sold gasoline in a day is between 12200 and 14200 liters.
  - (c) What is the probability that the gas station will sell at least 15000 liters of gasoline in one day?
  - (d) What is the probability that exactly 14500 liters will be sold?
- ◆ [practice sheet] An insurance company that specializes in private liability divides its customers into three different risk groups. Group 1 is high risk, Group 2 is medium risk, Group 3 is low risk. How long it takes for an accident to occur is modeled using an exponential distribution. Let $X_i$ describe the time (in months) between the start of a contract and an accident for risk group $i$. Assume $X_i \sim Exp(\lambda_i)$ with $\lambda_i = \frac{1}{5i^2}$.
  - (a) Calculate the probability that a customer from group 1 does not have any accident during the first 6 months after the start of the contract.
  - (b) What is the probability that a customer from group 2 has an accident during the second year of contract?
  - (c) What is the probability that a low-risk customer has an accident strictly before the 10th month of contract?
- ◆ [practice sheet] Let $X \sim N(3, 4)$. Using the standard normal distribution table, find:
  - (a) $P(X \ge 2.5)$.
  - (b) $P(1.2 \le X \le 3.3)$.
  - (c) Find the constant $c \in \mathbb{R}$ such that $P(|X - 3| < c) = 0.95$.
- ✎ Waiting times at a counter are exponential with mean 8 minutes. Find the probability that a customer waits more than 10 minutes, and the median waiting time.

## Solutions

*✎ solution written for this site*

- ✎ Q1: Hypergeometric with $r=3$ salty, $b=9$ normal, $n=4$: $P(X\le1)=\dfrac{\binom30\binom94+\binom31\binom93}{\binom{12}4}=\dfrac{126+252}{495}=\dfrac{378}{495}\approx0.764$.
- ✎ Q2: (a) $E(X)=\frac{12000+\theta}{2}=14000$ gives $\theta=16000$. (b) $P(12200\le X\le14200)=\frac{14200-12200}{4000}=0.5$. (c) $P(X\ge15000)=\frac{16000-15000}{4000}=0.25$. (d) $P(X=14500)=0$ (continuous).
- ✎ Q3: $E(X_i)=1/\lambda_i=5i^2$ months. (a) Group 1 (mean 5): $P(X_1>6)=e^{-6/5}\approx0.301$. (b) Group 2 (mean 20): the second year is months 12 to 24: $P(12<X_2\le24)=e^{-12/20}-e^{-24/20}=e^{-0.6}-e^{-1.2}\approx0.549-0.301=0.248$. (c) Group 3 (mean 45): $P(X_3<10)=1-e^{-10/45}\approx0.199$.
- ✎ Q4: $X\sim N(3,\sigma^2=4)$, so $\sigma=2$. (a) $P(X\ge2.5)=1-\Phi(-0.25)=\Phi(0.25)\approx0.599$. (b) $P(1.2\le X\le3.3)=\Phi(0.15)-\Phi(-0.9)\approx0.5596-0.1841=0.376$. (c) $P(|X-3|<c)=0.95$ means $c/\sigma=z_{0.975}=1.96$, so $c=2\cdot1.96=3.92$.
- ✎ Q5 (new question): Mean 8 gives $\lambda=0.125$. $P(X>10)=e^{-1.25}\approx0.287$. Median $=\ln2/0.125\approx5.55$ minutes.
