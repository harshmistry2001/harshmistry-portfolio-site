# Linear Regression

> Course part: Stats 2

## Overview

In Stats 1, regression was a way to draw a line through a scatter plot. In Stats 2 it becomes a **statistical model**: the response is the line plus random noise. This lets us quantify uncertainty: standard errors, confidence intervals and tests for the slope.

## Concept

### The model

For fixed values $x_1,\dots,x_n$ the responses are modelled as
$$Y_i=a+b\,x_i+e_i,\qquad e_i\ \text{i.i.d.}\ N(0,\sigma^2),\quad i=1,\dots,n .$$
The slope $b$ is the change in the *expected* value of $Y$ for a one-unit increase of $x$.

### Least squares estimators

Minimising $\sum(Y_i-a-bx_i)^2$ gives (see [linear regression](https://en.wikipedia.org/wiki/Linear_regression))
$$\hat b_n=\frac{\sum(x_i-\overline x_n)(Y_i-\overline Y_n)}{\sum(x_i-\overline x_n)^2},\qquad \hat a_n=\overline Y_n-\hat b_n\overline x_n .$$
Least squares is strongly influenced by outliers.

### Error variance

The residuals are $\hat e_i=Y_i-\hat a_n-\hat b_nx_i$. The unbiased estimator of $\sigma^2$ is
$$\hat\sigma^2=\frac1{n-2}\sum_{i=1}^n\hat e_i^{\,2}=\frac{SSR}{n-2}.$$
It divides by $n-2$ because two parameters ($a$ and $b$) were estimated.

### Inference on the slope

The standard error of the slope is $s_{\hat b}=\hat\sigma/\sqrt{\sum(x_i-\overline x)^2}$ and
$$T=\frac{\hat b-b_0}{s_{\hat b}}\sim t_{n-2}\quad\text{under } b=b_0 .$$
- **Test** $H_0:b=0$ (no linear relationship): reject at level $\alpha$ if $|T|>t_{n-2,1-\alpha/2}$.
- **Confidence interval**: $\hat b\pm t_{n-2,1-\alpha/2}\,s_{\hat b}$. It excludes 0 exactly when the two-sided test rejects at the same level $\alpha$.
- The intercept is treated analogously with $s_{\hat a}=\hat\sigma\sqrt{\frac1n+\frac{\overline x^2}{\sum(x_i-\overline x)^2}}$.

## Worked Example

Data: $x=1,2,3,4,5$; $y=2,4,5,4,5$. Then $\overline x=3$, $\overline y=4$, $\sum(x-\overline x)^2=10$, $\sum(x-\overline x)(y-\overline y)=6$.

- $\hat b=0.6$ and $\hat a=4-0.6\cdot3=2.2$.
- Residuals: $-0.8,\,0.6,\,1.0,\,-0.6,\,-0.2$ with $SSR=2.4$, so $\hat\sigma^2=2.4/3=0.8$.
- $s_{\hat b}=\sqrt{0.8/10}\approx0.283$ and $T=0.6/0.283\approx2.12$. With $df=3$, $t_{3,0.975}=3.18$: not significant at 5% (two-sided $p\approx0.124$). The 95% CI for $b$ is $0.6\pm3.18\cdot0.283=[-0.30,\,1.50]$, which contains 0, consistent with the test.

## Common Mistakes

- Dividing the residual sum of squares by $n$ or $n-1$ instead of $n-2$.
- Using the normal quantile instead of $t_{n-2}$ for small samples.
- Interpreting a significant slope as a causal effect.
- Using the fitted line far outside the range of the $x_i$.

## When It's Used

In Stats 2 regression becomes a *model* $Y_i = a + bx_i + e_i$ with normal errors, so you can attach standard errors, confidence intervals and tests to the slope. That is what turns "sales rise with ad spend" into "each extra 1,000 EUR raises expected sales by 3.2 units, 95% CI [2.1, 4.3]" — the form in which calibration studies, pricing analyses and A/B test regressions are reported.

**Exam tip:** $\hat\sigma^2 = SSR/(n-2)$; test $H_0: b = 0$ with $T = \hat b / s_{\hat b} \sim t_{n-2}$. The CI for $b$ excludes 0 exactly when the two-sided test rejects at the same level.

## R Code

```r
# Practice Sheet 08, Problem 4 from the given estimates (n = 30)
n <- 30; b_hat <- -1.3771; a_hat <- 90.9189; s_b <- 0.3747; alpha <- 0.03
T_stat <- b_hat / s_b
crit <- qt(1 - alpha / 2, df = n - 2)
c(T = T_stat, critical = crit, reject = abs(T_stat) > crit)
2 * pt(-abs(T_stat), df = n - 2)                               # p-value
b_hat + c(-1, 1) * crit * s_b                                   # 97% CI for the slope

# Full workflow on data
set.seed(4)
x <- runif(30, 2, 20)
y <- 90 - 1.4 * x + rnorm(30, 0, 7)
fit <- lm(y ~ x)
summary(fit)$coefficients
sum(resid(fit)^2) / (length(x) - 2)                             # sigma^2 hat
confint(fit, level = 0.90)
```

## Python Code

```python
import numpy as np
from scipy import stats
import statsmodels.api as sm

n, b_hat, s_b, alpha = 30, -1.3771, 0.3747, 0.03
T = b_hat / s_b
crit = stats.t.ppf(1 - alpha / 2, n - 2)
print("T =", T, " crit =", crit, " reject:", abs(T) > crit)
print("p-value:", 2 * stats.t.sf(abs(T), n - 2))
print("97% CI:", b_hat - crit * s_b, b_hat + crit * s_b)

rng = np.random.default_rng(4)
x = rng.uniform(2, 20, 30)
y = 90 - 1.4 * x + rng.normal(0, 7, 30)
fit = sm.OLS(y, sm.add_constant(x)).fit()
print(fit.summary().tables[1])
print("sigma^2 hat:", fit.ssr / (len(x) - 2))
print(fit.conf_int(alpha=0.10))
```

## Practice Questions

*◆ original question from the course material · ✎ new question added for this site (worked solution below)*

- ◆ Practice Sheet 05, Problem 1: A health organisation is interested in the accuracy of a cheaper monitor to measure the glucose in human blood. The data below shows the actual concentration (x) and the measured concentration (y)... We can assume that the measured values increase linearly with increasing actual values and have an individual (normally distributed) fluctuation, i.e., measured values can be modelled as realisations of independent random variables $Y_{i}=a+bx_{i}+e_{i}$, $i=1,...,10$ where $e_{i}\sim N(0,\sigma^{2})$.
  - (a) Estimate the parameters of the regression line $y(x)=a+bx$ for the value of the measured values depending on the actual values using the least squares method.
  - (b) Interpret, if feasible, the estimated values.
  - (c) Estimate the value of the unknown variance $\sigma^{2}$.
- ◆ Practice Sheet 06, Problem 4: Daily temperature $y_{i}$ and wind $x_{i}$ recorded in September 1973... We assume the linear model $Y_{i}=a+bx_{i}+e_{i}$ where $e_{i}\sim N(0,\sigma^{2})$.
  - (a) Estimate the parameters of the regression line.
  - (b) Determine for the slope and intercept a confidence interval at level 90%. To estimate the variance of the error term you may use the value: $\sum_{i=1}^{30}(y_{i}-\hat{a}_{30}-\hat{b}_{30}x_{i})^{2}=1365.7896.$
- ◆ Practice Sheet 08, Problem 4: Consider problem 4 on Exercise Sheet 06... The following estimates were already computed: $\hat{b}=-1.3771$, $\hat{a}=90.9189$, $\hat{\sigma}^{2}=48.7782$, $s_{\hat{b}}=0.3747.$
  - (a) Test at level $\alpha=0.03$, if there is significant evidence for a linear correlation between the daily temperature and wind speed.
  - (b) Compute the p-value of the test.
  - (c) The $(1-\alpha)$ confidence interval for the slope... What is the connection between the 97% confidence interval for the slope and the test in (b)?
- ✎ For the five points of the worked example, test $H_0:b=0$ at level 5% and decide.

## Solutions

*✎ solution written for this site*

*Sheet 05 Problem 1 uses a data table that is not reproduced here, so it is answered by method only. Sheet 06 Problem 4 and Sheet 08 Problem 4 are solved from the summary values given in the questions ($n=30$).*

- ✎ Sheet 05, Problem 1: (a) Compute $\hat b=\frac{\sum(x_i-\overline x)(y_i-\overline y)}{\sum(x_i-\overline x)^2}$ and $\hat a=\overline y-\hat b\overline x$. (b) The slope tells how much the *measured* concentration rises per unit of actual concentration; $\hat b\approx1$ and $\hat a\approx0$ would indicate an accurate monitor. The intercept is the measured value at actual concentration 0 and is only meaningful if 0 is within the data range. (c) $\hat\sigma^2=\frac1{10-2}\sum\hat e_i^2$.
- ✎ Sheet 06, Problem 4: (a) Use the least squares formulas; the results are stated in Sheet 08: $\hat b=-1.3771$, $\hat a=90.9189$. (b) $\hat\sigma^2=1365.7896/(30-2)=48.7782$. The 90% CI for the slope is $\hat b\pm t_{28,0.95}\,s_{\hat b}$ with $s_{\hat b}=0.3747$ and $t_{28,0.95}=1.701$: $-1.3771\pm0.6374=[-2.015,\,-0.740]$. For the intercept use $\hat a\pm t_{28,0.95}\,s_{\hat a}$ with $s_{\hat a}=\hat\sigma\sqrt{\frac1n+\frac{\overline x^2}{\sum(x_i-\overline x)^2}}$ (needs $\overline x$ from the data).
- ✎ Sheet 08, Problem 4: (a) $T=\hat b/s_{\hat b}=-1.3771/0.3747\approx-3.675$ with $28$ degrees of freedom. The critical value is $t_{28,0.985}\approx2.286$; since $|T|>2.286$, reject $H_0:b=0$: there is significant evidence of a linear relationship (higher wind goes with lower temperature). (b) $p=2\,P(t_{28}>3.675)\approx0.001$. (c) The 97% CI $\hat b\pm2.286\cdot0.3747=[-2.23,\,-0.52]$ does not contain 0 — exactly the same conclusion as the test at $\alpha=0.03$; the CI at level $1-\alpha$ contains exactly those values $b_0$ that the two-sided level-$\alpha$ test does not reject.
- ✎ Q4 (new question): $T=0.6/0.283\approx2.12$ with 3 degrees of freedom; $|T|<t_{3,0.975}=3.18$, so $H_0$ is not rejected at 5% (p ≈ 0.124): with only five points the evidence for a linear relationship is not significant.
