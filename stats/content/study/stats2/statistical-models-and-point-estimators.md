# Statistical Models and Point Estimators

> Course part: Stats 2

## Overview

To learn from data we first state *what mechanism might have produced them*: a **statistical model**. It names a family of distributions and leaves one or more parameters unknown. A **point estimator** is a rule that turns the sample into a single best guess for such a parameter. This page explains how to set up models and how to judge whether an estimator is any good.

## Concept

### Statistical model

A [statistical model](https://en.wikipedia.org/wiki/Statistical_model) consists of random variables $X_1,\dots,X_n$ with a distribution assumption that depends on an unknown parameter $\vartheta$ lying in a parameter space $\Theta$. Examples: counts per minute $X_i\sim Poi(\lambda)$ with $\Theta=(0,\infty)$; test scores $X_i\sim N(\mu,\sigma^2)$ with $\Theta=\mathbb R\times(0,\infty)$; a yes/no outcome $X_i\sim Bernoulli(p)$ with $\Theta=(0,1)$.

### Estimators

A point [estimator](https://en.wikipedia.org/wiki/Estimator) $T=T(X_1,\dots,X_n)$ maps the sample to $\Theta$. Because it depends on random data, **the estimator itself is a random variable** with its own distribution; an *estimate* is its value for the observed data. Classical examples:
$$\overline{X}_n=\frac1n\sum X_i,\qquad S_n^2=\frac1{n-1}\sum(X_i-\overline{X}_n)^2,$$
with $E(\overline{X}_n)=\mu$ and $Var(\overline{X}_n)=\sigma^2/n$. The median is a robust alternative to the mean.

### Quality criteria

- **Bias**: $bias_\vartheta(T)=E_\vartheta(T)-\vartheta$. $T$ is [unbiased](https://en.wikipedia.org/wiki/Bias_of_an_estimator) if the bias is 0 for all $\vartheta$; asymptotically unbiased if it vanishes as $n\to\infty$.
- **Consistency**: $T\to\vartheta$ in probability as $n\to\infty$.
- **Standard error**: the standard deviation of the estimator, e.g. $\sigma/\sqrt n$ for $\overline X_n$.
- **Mean squared error** (MSE): $MSE_\vartheta(T)=E_\vartheta(T-\vartheta)^2=Var_\vartheta(T)+bias_\vartheta(T)^2$. This bias–variance decomposition shows that a small bias can be worth accepting if it buys a much smaller variance.

## Worked Example

Let $X_1,\dots,X_n$ be i.i.d. with mean $\mu$ and variance $\sigma^2$. Why divide by $n-1$ in $S_n^2$? Because
$$E(S_n^2)=\sigma^2\quad(\text{unbiased}),\qquad E\Big(\tfrac1n\sum(X_i-\overline{X}_n)^2\Big)=\tfrac{n-1}{n}\sigma^2\quad(\text{biased, bias}=-\sigma^2/n).$$
The biased version has the *smaller* variance, and for the normal distribution it even has the smaller MSE, but the bias vanishes as $n$ grows, so both are consistent.

## Common Mistakes

- Treating an estimate (a number) and an estimator (a random variable) as the same thing.
- Believing that "unbiased" means "accurate" for a single sample: an unbiased estimator can still have a huge variance.
- Comparing estimators by bias alone instead of by MSE.

## When It's Used

A statistical model states which family of distributions generated the data and which parameter is unknown; an estimator is a rule that turns the sample into a guess. Choosing between estimators by bias, variance and MSE is exactly what quality engineers, pollsters and ML practitioners do when they pick a robust mean, a shrinkage estimate or a regularised model.

**Exam tip:** $MSE = Var + bias^2$. An unbiased estimator is not automatically better — compare MSEs. Remember $E(\bar X) = \mu$, $Var(\bar X) = \sigma^2/n$.

## R Code

```r
# Practice Sheet 03, Problem 4: f(x) = 5 theta^5 / x^6 on [theta, inf)
# E(X) = 5 theta / 4, Var(X) = 5 theta^2 / 48
theta <- 2; n <- 10; B <- 20000
set.seed(2)
rX <- function(k) theta * runif(k)^(-1 / 5)            # inverse-transform sampling

est <- replicate(B, {
  x <- rX(n)
  c(T1 = -11/5 * x[1] + 3 * x[2], T2 = mean(x) / 3)
})
bias <- rowMeans(est) - theta
mse  <- rowMeans((est - theta)^2)
rbind(bias, variance = apply(est, 1, var), mse)

# Theory
v <- 5 * theta^2 / 48
c(MSE_T1 = ((11/5)^2 + 9) * v, MSE_T2 = v / (9 * n) + (5 * theta / 12 - theta)^2)

# Practice Sheet 02, Problem 3: smallest sigma with P(4.5 <= X <= 5.5) <= 0.97, mu = 5
0.5 / qnorm(0.985)
```

## Python Code

```python
import numpy as np
from scipy import stats

theta, n, B = 2, 10, 20_000
rng = np.random.default_rng(2)
x = theta * rng.uniform(size=(B, n)) ** (-1 / 5)       # samples from 5 theta^5 / x^6

T1 = -11 / 5 * x[:, 0] + 3 * x[:, 1]
T2 = x.mean(axis=1) / 3
for name, T in [("T1", T1), ("T2", T2)]:
    print(name, "bias:", round(T.mean() - theta, 4), " var:", round(T.var(), 4),
          " MSE:", round(np.mean((T - theta) ** 2), 4))

v = 5 * theta**2 / 48
print("theory MSE:", ((11 / 5) ** 2 + 9) * v, v / (9 * n) + (5 * theta / 12 - theta) ** 2)
print("smallest sigma:", 0.5 / stats.norm.ppf(0.985))
```

## Practice Questions

*◆ original question from the course material*

- ◆ Practice Sheet 02, Problem 3: In a factory, oil is stored in bottles of normal weight 5 liters. The actual weight X (in liters) can be modelled as a $N(\mu,\sigma^{2})$ -distributed random variable. What is the smallest value of the standard deviation $\sigma$, assuming $\mu=5$ liters, to guarantee that $P(4.5\le X\le5.5)\le0.97?$
- ◆ Practice Sheet 02, Problem 4: For i.i.d. $X_{1},...,X_{n}$ with $E(X_{i})=\mu$, $Var(X_{i})=\sigma^{2}$ and $E((X_{i}-\mu)^{4})=k$, $1\le i\le n$, $n\ge2$ consider the random variables $\overline{X}_{n}=\frac{1}{n}\sum_{i=1}^{n}X_{i}$ and $S_{\mu}^{2}=\frac{1}{n}\sum_{i=1}^{n}(X_{i}-\mu)^{2}.$ Determine the expectation and variance of $\overline{X}_{n}$ and $S_{\mu}^{2}$.
- ◆ Practice Sheet 03, Problem 1: Describe the following experiments using appropriate statistical models. For each experiment, specify the observed random variable with a suitable distribution assumption and the corresponding parameter space.
  - (a) You hold a Geiger-Müller counter to a radioactive sample of unknown composition and count the number of times the counter registers a hit in each minute over the course of one hour.
  - (b) A group of psychologists is studying the concentration abilities of eighth-grade students, measured in the form of a test score. 24 students are tested. The test score is assumed to follow a normal distribution.
  - (c) To determine the proportion of diseased trees in his area, a forester randomly selects trees in his area and checks whether they are diseased or not. He counts the number of healthy trees until he finds a diseased tree, then starts counting again.
- ◆ Practice Sheet 03, Problem 2: Let $X_{1},...,X_{n}$ be i.i.d. with $X_{i}\sim N(\mu,\sigma^{2})$. An estimator is given by $T=\frac{1}{n}\sum_{i=1}^{n}X_{i}^{2}$.
  - (a) Calculate the expectation of T. Hint: You do not need to calculate any integrals to do this.
  - (b) Based on your previous result, what quantity would you suggest to estimate with this estimator?
- ◆ Practice Sheet 03, Problem 3: The following values (in 3 samples of size 11 each) can be modelled as realisations of independent and identically $N(5,81)$ -distributed random variables.
  - (a) Using the sample mean/variance one obtains estimates for the expectation and variance of the first and second sample... Complete the table with an estimate for expectation and variance of the third sample.
  - (b) For $X_{1},...,X_{n}$ independent and identically $N(\mu,\sigma^{2})$ -distributed random variables the mean $\overline{X}_{r}$ is again normally distributed. Determine the value of the corresponding parameters.
  - (c) For which sample does $\overline{X}_{n}$ deviate most from the true expected value and by how far? Denote this deviation (in absolute value) by d, compute the probability for this (or an even larger) deviation from the expectation, i.e., $(\vert{}\overline{X}_{n}-5\vert{}\ge d)$.
- ◆ Practice Sheet 03, Problem 4: Let the random variables $X_{1},...,X_{n}$ be i.i.d. with possible values in $[\vartheta,\infty)$ and probability density function $f(x)=5\vartheta^{5}/x^{6}$, $x\in[\vartheta,\infty)$, where the parameter $\vartheta>0$ is unknown. Consider the following estimators of $\vartheta$: $T_{1}=-\frac{11}{5}X_{1}+3X_{2}$ and $T_{2}=\frac{1}{3}\overline{X}_{n}$.
  - (a) Which of these estimators are unbiased?
  - (b) Determine the mean squared error (MSE) of $T_{1}$ and $T_{2}$ and compare them. Hint: $Var_{\vartheta}(X_{1})=\frac{5\vartheta^{2}}{48}$.

## Solutions

*✎ solution written for this site*

*Problem 3 of Sheet 03 depends on a data table that is not reproduced here; its parts (b) and (c) are answered by method.*

- ✎ Sheet 02, Problem 3: $P(4.5\le X\le5.5)=2\Phi(0.5/\sigma)-1\le0.97\iff\Phi(0.5/\sigma)\le0.985\iff 0.5/\sigma\le z_{0.985}\approx2.170$. Hence $\sigma\ge0.5/2.170\approx0.230$ liters.
- ✎ Sheet 02, Problem 4: $E(\overline X_n)=\mu$, $Var(\overline X_n)=\sigma^2/n$. For $S_\mu^2=\frac1n\sum(X_i-\mu)^2$: each term has $E(X_i-\mu)^2=\sigma^2$ and $Var\big((X_i-\mu)^2\big)=E(X_i-\mu)^4-\sigma^4=k-\sigma^4$. Hence $E(S_\mu^2)=\sigma^2$ and $Var(S_\mu^2)=\frac{k-\sigma^4}{n}$.
- ✎ Sheet 03, Problem 1: (a) $X_1,\dots,X_{60}$ independent, $X_i\sim Poi(\lambda)$, $\Theta=(0,\infty)$. (b) $X_1,\dots,X_{24}$ i.i.d. $N(\mu,\sigma^2)$, $\Theta=\mathbb R\times(0,\infty)$. (c) The number of healthy trees before the first diseased one is geometric: $X_j\sim geo(p)$ i.i.d. (one variable per restart), where $p$ is the proportion of diseased trees, $\Theta=(0,1)$.
- ✎ Sheet 03, Problem 2: (a) $E(T)=E(X_1^2)=Var(X_1)+E(X_1)^2=\sigma^2+\mu^2$. (b) $T$ is an unbiased estimator of the second moment $\sigma^2+\mu^2$. If $\mu=0$ is known, it estimates $\sigma^2$.
- ✎ Sheet 03, Problem 3: (b) $\overline X_{11}\sim N\big(5,\ 81/11\big)$, i.e. expectation 5 and variance $\approx7.36$ (standard error $\approx2.71$). (c) Take the largest $|\overline x-5|=d$ among the three samples; then $P(|\overline X-5|\ge d)=2\big(1-\Phi(d/\sqrt{81/11})\big)$.
- ✎ Sheet 03, Problem 4: First $E(X_1)=\int_\vartheta^\infty x\frac{5\vartheta^5}{x^6}dx=\frac54\vartheta$. (a) $E(T_1)=-\frac{11}5\cdot\frac54\vartheta+3\cdot\frac54\vartheta=\vartheta$: **unbiased**. $E(T_2)=\frac13\cdot\frac54\vartheta=\frac5{12}\vartheta$: **biased** (bias $-\frac7{12}\vartheta$). (b) $MSE(T_1)=Var(T_1)=\big(\frac{121}{25}+9\big)\frac{5\vartheta^2}{48}=\frac{173}{120}\vartheta^2\approx1.44\,\vartheta^2$. $MSE(T_2)=\frac19\cdot\frac{5\vartheta^2}{48n}+\big(\frac7{12}\vartheta\big)^2=\frac{5\vartheta^2}{432n}+\frac{49}{144}\vartheta^2\le0.352\,\vartheta^2$. So $T_2$ has the smaller MSE for every $n\ge1$ even though it is biased: its variance is much smaller.
