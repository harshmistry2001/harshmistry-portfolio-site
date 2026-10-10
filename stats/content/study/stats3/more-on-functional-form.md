# More on Functional Form

> Course part: Stats 3

## Overview

Real relationships are rarely straight lines: returns to experience flatten out, an extra bedroom is worth more in a big house than in a small one, and price effects work in percentages. Because the model only needs to be *linear in the parameters*, we can build all of this into OLS by transforming variables with logarithms, squares and products.

## Concept

### Logarithms

- Logs give percentage interpretations (elasticities and semi-elasticities, see the earlier topic), tend to reduce the influence of outliers and often reduce heteroskedasticity.
- They cannot be used for zero or negative values (sometimes $\ln(1+y)$ is used).
- The approximation $\%\Delta y\approx100\,\Delta\ln y$ is good for small changes only. The **exact** percentage change in a log–level model is
$$\%\Delta\hat y=100\big[\exp(\hat\beta_j\Delta x_j)-1\big].$$

### Quadratics

$y=\beta_0+\beta_1x+\beta_2x^2+u$ lets the marginal effect change with $x$: $\Delta y/\Delta x\approx\beta_1+2\beta_2x$. If $\beta_1>0>\beta_2$ there are diminishing returns and a maximum at the **turning point**
$$x^*=\Big|\frac{\beta_1}{2\beta_2}\Big| .$$
Check whether the turning point lies inside the range of the data.

### Interaction terms

$y=\beta_0+\beta_1x_1+\beta_2x_2+\beta_3x_1x_2+u$ allows the effect of one variable to depend on the level of the other:
$$\frac{\Delta y}{\Delta x_2}=\beta_2+\beta_3x_1 .$$
$\beta_2$ alone is then the effect of $x_2$ only at $x_1=0$, which may be meaningless. It is better to report the effect at interesting values (such as the sample mean of $x_1$) or to centre the variable: use $(x_1-\bar x_1)x_2$, so that the coefficient on $x_2$ is directly the effect at the mean of $x_1$ and comes with its own standard error.

## Worked Example

- **Exact percentage:** in $\ln(wage)$ a change of $0.8$ log points is not 80%: $100(e^{0.8}-1)=122.5\%$. For the education coefficient 0.092 and 4 more years: $100(e^{0.368}-1)=44.5\%$ versus the approximation $36.8\%$.
- **Quadratic:** $\widehat{wage}=3.7+0.30\,exper-0.006\,exper^2$: turning point $0.30/(2\cdot0.006)=25$ years.
- **Interaction:** $\widehat{price}=\dots-10\,bdrms+0.02\,sqrft\cdot bdrms$ (thousand dollars, with a main effect for $sqrft$ and a constant): an extra bedroom changes the price by $-10+0.02\cdot sqrft$. For a 2,000 square-foot house: $-10+40=+30$ thousand dollars; in a 400-square-foot flat it would be $-10+8=-2$: the "negative" main effect is just the effect at $sqrft=0$.

## Common Mistakes

- Applying the small-change approximation to large changes.
- Interpreting $\beta_1$ in a quadratic or interaction model as "the" effect.
- Using a quadratic beyond the data range (the turning point may not be meaningful).
- Taking logs of variables that can be zero or negative.

## When It's Used

Real relationships are rarely straight lines: returns to experience decline, the effect of house size depends on the neighbourhood, price effects are proportional. Logs, quadratics and interaction terms capture this and are standard in wage equations, hedonic house-price models and demand estimation.

**Exam tip:** turning point of $\beta_1x + \beta_2x^2$ is $x^* = |\beta_1/(2\beta_2)|$. Exact % change for a log-level coefficient: $100[\exp(\hat\beta\Delta x) - 1]$. With an interaction $x_1x_2$, the effect of $x_1$ is $\beta_1 + \beta_3x_2$ — evaluate it at meaningful values such as the mean.

## R Code

```r
set.seed(24)
n <- 526
exper <- runif(n, 0, 45); educ <- sample(8:18, n, TRUE); female <- rbinom(n, 1, 0.5)
lwage <- 0.2 + 0.085 * educ + 0.04 * exper - 0.0008 * exper^2 - 0.3 * female +
  0.01 * female * educ + rnorm(n, 0, 0.4)

fit <- lm(lwage ~ educ + exper + I(exper^2) + female + female:educ)
b <- coef(fit)

abs(b["exper"] / (2 * b["I(exper^2)"]))                        # turning point in years
100 * (exp(b["female"]) - 1)                                    # exact % effect (at educ = 0)
b["educ"] + b["female:educ"] * c(male = 0, female = 1)          # return to educ by group

# Centering makes the main effect readable at the mean of educ
educ_c <- educ - mean(educ)
coef(lm(lwage ~ educ_c + exper + I(exper^2) + female + female:educ_c))["female"]
```

## Python Code

```python
import numpy as np
import pandas as pd
from statsmodels.formula.api import ols

rng = np.random.default_rng(24)
n = 526
df = pd.DataFrame({"exper": rng.uniform(0, 45, n), "educ": rng.integers(8, 19, n),
                   "female": rng.binomial(1, 0.5, n)})
df["lwage"] = (0.2 + 0.085 * df.educ + 0.04 * df.exper - 0.0008 * df.exper**2 - 0.3 * df.female
               + 0.01 * df.female * df.educ + rng.normal(0, 0.4, n))

b = ols("lwage ~ educ + exper + I(exper**2) + female + female:educ", df).fit().params
print("turning point:", abs(b["exper"] / (2 * b["I(exper ** 2)"])))
print("exact % female:", 100 * (np.exp(b["female"]) - 1))
print("return to educ (m, f):", b["educ"], b["educ"] + b["female:educ"])

df["educ_c"] = df.educ - df.educ.mean()
print(ols("lwage ~ educ_c + exper + I(exper**2) + female + female:educ_c", df).fit().params["female"])
```

## Practice Questions

*✎ new question added for this site (worked solution below)*

- ✎ For $\widehat{y}=5+2x-0.25x^2$ find the turning point and the maximal value of $\hat y$.
- ✎ A log–level coefficient is $0.25$. What is the exact percentage change in $y$ for a one-unit increase in $x$, and how far is it from the approximation?
- ✎ In $\widehat{wage}=\dots+0.5\,educ+0.1\,exper+0.02\,educ\cdot exper$ find the effect of one more year of education for a person with 10 years of experience.

## Solutions

*✎ solution written for this site*

- ✎ Q1: $x^*=2/(2\cdot0.25)=4$; $\hat y(4)=5+8-4=9$.
- ✎ Q2: Exact: $100(e^{0.25}-1)=28.4\%$; approximation: $25\%$ (an error of 3.4 percentage points).
- ✎ Q3: $0.5+0.02\cdot10=0.7$.
