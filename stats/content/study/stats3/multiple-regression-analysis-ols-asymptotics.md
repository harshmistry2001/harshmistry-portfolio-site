# Multiple Regression Analysis: OLS Asymptotics

> Course part: Stats 3

## Overview

These exercises practise reasoning about **inconsistency**: what OLS converges to when a relevant variable is left out. This is the large-sample version of omitted variable bias, and the key message is that more data cannot fix it. The computer exercise re-estimates a model on a subsample to see how estimates behave.

## Topics to Review

- [Consistency](#/study/stats3/consistency)
- [Asymptotic Normality and Large Sample Inference](#/study/stats3/asymptotic-normality-and-large-sample-inference)
- [The Expected Value of the OLS Estimators](#/study/stats3/the-expected-value-of-the-ols-estimators)

## How to Approach the Questions

- Write the **probability limit** of the simple-regression slope: $\text{plim}\,\tilde\beta_1=\beta_1+\beta_2\delta_1$, where $\delta_1$ is the (population) slope from regressing the omitted variable on the included one.
- Determine the signs of $\beta_2$ (effect of the omitted variable on $y$) and $\delta_1$ (its correlation with $x_1$). Same signs: positive inconsistency; opposite signs: negative.

## When It's Used

These exercises practise reasoning about inconsistency from omitted variables — the large-sample version of omitted variable bias — and re-estimating models on subsamples to see how estimates change with sample size.

**Exam tip (P 5.1):** omitting $risktol$ with $\beta_2 > 0$ and $\delta_1 > 0$ gives $\text{plim}\,\tilde\beta_1 = \beta_1 + \beta_2\delta_1 > \beta_1$: the simple regression overstates the effect of $funds$, and more data will not remove this.

## R Code

```r
set.seed(31)
simulate <- function(n) {
  risktol <- rnorm(n)
  funds <- 3 + 0.8 * risktol + rnorm(n)                     # positively correlated
  pctstck <- 40 + 2 * funds + 10 * risktol + rnorm(n, 0, 8) # beta_2 > 0
  c(short = unname(coef(lm(pctstck ~ funds))[2]),
    long  = unname(coef(lm(pctstck ~ funds + risktol))[2]))
}
sapply(c(100, 1000, 100000), simulate)          # short regression converges to about 2 + 10 * delta_1

delta1 <- 0.8 / (0.8^2 + 1)                     # Cov(funds, risktol) / Var(funds)
2 + 10 * delta1
```

## Python Code

```python
import numpy as np
import statsmodels.api as sm

rng = np.random.default_rng(31)
def simulate(n):
    risktol = rng.normal(size=n)
    funds = 3 + 0.8 * risktol + rng.normal(size=n)
    pctstck = 40 + 2 * funds + 10 * risktol + rng.normal(0, 8, n)
    short = sm.OLS(pctstck, sm.add_constant(funds)).fit().params[1]
    long = sm.OLS(pctstck, sm.add_constant(np.column_stack([funds, risktol]))).fit().params[1]
    return round(short, 3), round(long, 3)

for n in (100, 1000, 100_000):
    print(n, simulate(n))
print("plim of short regression:", 2 + 10 * 0.8 / (0.8**2 + 1))
```

## Practice Questions

*◆ original question from the course material · ✎ new question added for this site (worked solution below)*

- ◆ P 5.1 (practice sheet): Suppose that the model $pctstck=\beta_{0}+\beta_{1}funds+\beta_{2}risktol+u$ satisfies the first four Gauss-Markov assumptions... If funds and risktol are positively correlated, what is the inconsistency in $\tilde{\beta}_{1}$, the slope coefficient in the simple regression of pctstck on funds?
- ◆ C 5.1 (practice sheet): Regress colgpa on hsperc and sat if $n<=2070$.
- ✎ In a model of test scores on class size, the omitted variable "family income" has $\beta_2>0$ and is negatively correlated with class size ($\delta_1<0$). What is the sign of the inconsistency of the simple regression slope of scores on class size?

## Solutions

*◆ original solution from the course material · ✎ solution written for this site*

- ◆ P 5.1: A higher tolerance of risk means more willingness to invest in the stock market, so $\beta_{2}>0$. By assumption, funds and risktol are positively correlated ($\delta_{1}>0$). Now we use the equation: $plim \tilde{\beta}_{1}=\beta_{1}+\beta_{2}\delta_{1}$. Since $\beta_2 > 0$ and $\delta_1 > 0$, the inconsistency is positive.
- ◆ C 5.1: (From Stata output snippet) reg colgpa hsperc sat if n<=2070. Coefficient on hsperc is -0.0127494, p-value 0.000. $R^2 = 0.2820$.
- ✎ C 5.1: Estimating on the first 2070 observations gives a coefficient on $hsperc$ of about $-0.0127$ (highly significant) and $R^2=0.282$. Comparing with the full-sample estimate ($-0.0135$ in the previous exercise), the estimate is similar: with several thousand observations, the sampling variation of the estimates is small.
- ✎ Q3 (new question): $\beta_2>0$ and $\delta_1<0$ give $\beta_2\delta_1<0$: the inconsistency is **negative**. The simple regression slope converges to a value below $\beta_1$, so the class-size coefficient looks too negative and the benefit of smaller classes is overstated.
