# Logistic Regression

## Overview

Logistic regression models the probability of a yes/no outcome. It works on the log-odds scale, so coefficients are read as odds ratios and the predicted probability always stays between 0 and 1. It is the standard tool for risk scores and classification, evaluated with ROC/AUC and calibration rather than accuracy alone.

## Concept

Logistic regression models a **binary outcome** $y \in \{0, 1\}$ (default / no default, churn / stay, disease / healthy) as a function of predictors. Linear regression is unsuitable because predicted probabilities could fall outside $[0, 1]$ and the error variance depends on the mean.

### The model

$$P(y = 1 \mid \mathbf x) = p(\mathbf x) = \frac{1}{1 + e^{-(\beta_0 + \beta_1x_1 + \dots + \beta_kx_k)}}$$

Equivalently, the **[log-odds (logit)](https://en.wikipedia.org/wiki/Logit)** is linear:

$$\log\frac{p}{1-p} = \beta_0 + \beta_1x_1 + \dots + \beta_kx_k.$$

### Interpreting coefficients

- $\beta_j$ = change in the **log-odds** for a one-unit increase in $x_j$, holding others fixed.
- $e^{\beta_j}$ = **[odds ratio](https://en.wikipedia.org/wiki/Odds_ratio) (OR)**: the multiplicative change in the odds. $OR = 1.25$ means 25% higher odds; $OR = 0.8$ means 20% lower odds.
- Odds ratios are *not* risk ratios; for rare outcomes they are similar, for common outcomes the OR exaggerates.
- The effect on the **probability** depends on where you are on the curve: $\partial p/\partial x_j = \beta_j\,p(1-p)$. Report **average marginal effects** or predicted probabilities for typical profiles to communicate results.

### Estimation and inference

- Fitted by **[maximum likelihood](https://en.wikipedia.org/wiki/Maximum_likelihood_estimation)**: maximise $\ell(\boldsymbol\beta) = \sum_i \left[y_i\log p_i + (1-y_i)\log(1-p_i)\right]$ (iteratively reweighted least squares).
- **[Wald test](https://en.wikipedia.org/wiki/Wald_test)** $z = \hat\beta_j/SE(\hat\beta_j)$; **[likelihood-ratio test](https://en.wikipedia.org/wiki/Likelihood-ratio_test)** $LR = 2(\ell_{full} - \ell_{reduced}) \sim \chi^2_q$ for nested models (preferred for groups of variables and small samples).
- CI for the OR: $\exp(\hat\beta_j \pm 1.96\,SE)$.
- **Deviance** $= -2\ell$; **AIC** for model comparison; McFadden's pseudo-$R^2 = 1 - \ell_{full}/\ell_{null}$.

### Evaluating a classifier

- **Confusion matrix** at a threshold (0.5 is not special — choose it from costs): accuracy, sensitivity (recall), specificity, precision.
- **[ROC curve](https://en.wikipedia.org/wiki/Receiver_operating_characteristic) and AUC** — threshold-free ranking quality; AUC = probability a random positive gets a higher score than a random negative.
- **Calibration** — do predicted probabilities match observed rates? (calibration plot, [Brier score](https://en.wikipedia.org/wiki/Brier_score), Hosmer-Lemeshow).
- With rare events, look at precision-recall curves; accuracy is misleading when 98% of cases are negative.

### Pitfalls

- **Complete separation** — a predictor perfectly separates the classes; estimates diverge (use penalised / Firth regression).
- Rule of thumb: at least about 10–20 events per estimated parameter.
- Assumes linearity in the logit — use splines or categories for non-linear effects.
- Multicollinearity and omitted-variable issues are the same as in linear regression.

### Extensions

Multinomial logit (unordered categories), ordinal logit (ordered categories), regularised logistic regression (lasso/ridge for many predictors), mixed-effects logistic regression (clustered data).

## When It's Used

Logistic regression is the standard model for binary decisions and risk scores: credit scoring and probability of default in banking, churn prediction in telecom and subscription businesses, conversion and click-through prediction in marketing, disease-risk models in medicine (e.g. cardiovascular risk scores), fraud flags, and propensity scores in causal inference. Its interpretability (odds ratios, scorecards) is why regulated industries still favour it over black-box models.

## R Code

```r
set.seed(10)
n <- 3000
bank <- data.frame(
  income     = round(rlnorm(n, log(45), 0.5), 1),          # thousand EUR
  debt_ratio = round(runif(n, 0, 0.8), 3),
  late_pays  = rpois(n, 0.6),
  tenure     = round(runif(n, 0, 20), 1),
  segment    = factor(sample(c("retail", "self_employed", "student"), n, TRUE, prob = c(.7, .2, .1)))
)
eta <- with(bank, -3.2 - 0.015 * income + 3.5 * debt_ratio + 0.55 * late_pays - 0.04 * tenure +
              0.6 * (segment == "self_employed") + 0.3 * (segment == "student"))
bank$default <- rbinom(n, 1, plogis(eta))
mean(bank$default)

# Train / test split
idx <- sample(n, 0.7 * n)
train <- bank[idx, ]; test <- bank[-idx, ]

fit <- glm(default ~ income + debt_ratio + late_pays + tenure + segment,
           data = train, family = binomial)
summary(fit)

# Odds ratios with Wald 95% CIs
round(exp(cbind(OR = coef(fit), confint.default(fit))), 3)

# Likelihood-ratio test for the segment variable
reduced <- update(fit, . ~ . - segment)
anova(reduced, fit, test = "LRT")

# Predicted probabilities for two customer profiles
profiles <- data.frame(income = c(30, 80), debt_ratio = c(0.6, 0.2), late_pays = c(2, 0),
                       tenure = c(1, 10), segment = c("self_employed", "retail"))
predict(fit, profiles, type = "response")

# Average marginal effect of debt_ratio: mean of beta * p * (1 - p)
p_hat <- fitted(fit)
mean(coef(fit)["debt_ratio"] * p_hat * (1 - p_hat))

# Evaluation on the test set
p_test <- predict(fit, test, type = "response")
threshold <- 0.2
pred <- as.integer(p_test >= threshold)
table(actual = test$default, predicted = pred)
c(sensitivity = mean(pred[test$default == 1] == 1), specificity = mean(pred[test$default == 0] == 0))

# AUC via the rank (Mann-Whitney) formula
auc <- function(y, p) {
  r <- rank(p); n1 <- sum(y == 1); n0 <- sum(y == 0)
  (sum(r[y == 1]) - n1 * (n1 + 1) / 2) / (n1 * n0)
}
auc(test$default, p_test)

# ROC curve
ths <- seq(0, 1, by = 0.01)
roc <- t(sapply(ths, function(t) c(fpr = mean(p_test[test$default == 0] >= t),
                                   tpr = mean(p_test[test$default == 1] >= t))))
plot(roc[, "fpr"], roc[, "tpr"], type = "l", xlab = "false positive rate", ylab = "true positive rate",
     main = "ROC curve"); abline(0, 1, lty = 2)

# Calibration by decile
dec <- cut(p_test, quantile(p_test, 0:10 / 10), include.lowest = TRUE)
round(cbind(predicted = tapply(p_test, dec, mean), observed = tapply(test$default, dec, mean)), 3)
```

## Python Code

```python
import numpy as np
import pandas as pd
import matplotlib.pyplot as plt
import statsmodels.formula.api as smf
from scipy import stats
from sklearn.metrics import roc_auc_score, roc_curve, confusion_matrix, brier_score_loss
from sklearn.model_selection import train_test_split

rng = np.random.default_rng(10)
n = 3000
bank = pd.DataFrame({
    "income": np.round(rng.lognormal(np.log(45), 0.5, n), 1),
    "debt_ratio": np.round(rng.uniform(0, 0.8, n), 3),
    "late_pays": rng.poisson(0.6, n),
    "tenure": np.round(rng.uniform(0, 20, n), 1),
    "segment": rng.choice(["retail", "self_employed", "student"], n, p=[.7, .2, .1]),
})
eta = (-3.2 - 0.015 * bank.income + 3.5 * bank.debt_ratio + 0.55 * bank.late_pays - 0.04 * bank.tenure
       + 0.6 * (bank.segment == "self_employed") + 0.3 * (bank.segment == "student"))
bank["default"] = rng.binomial(1, 1 / (1 + np.exp(-eta)))
train, test = train_test_split(bank, test_size=0.3, random_state=1)

formula = "default ~ income + debt_ratio + late_pays + tenure + C(segment)"
fit = smf.logit(formula, data=train).fit(disp=0)
print(fit.summary())

ors = pd.DataFrame({"OR": np.exp(fit.params), "low": np.exp(fit.conf_int()[0]), "high": np.exp(fit.conf_int()[1])})
print(ors.round(3))

reduced = smf.logit("default ~ income + debt_ratio + late_pays + tenure", data=train).fit(disp=0)
LR = 2 * (fit.llf - reduced.llf)
print("LR test:", LR, " p =", stats.chi2.sf(LR, 2))

print(fit.get_margeff(at="overall").summary())          # average marginal effects

p_test = fit.predict(test)
pred = (p_test >= 0.2).astype(int)
print(confusion_matrix(test["default"], pred))
print("AUC:", roc_auc_score(test["default"], p_test), " Brier:", brier_score_loss(test["default"], p_test))

fpr, tpr, _ = roc_curve(test["default"], p_test)
plt.plot(fpr, tpr); plt.plot([0, 1], [0, 1], "--")
plt.xlabel("false positive rate"); plt.ylabel("true positive rate"); plt.title("ROC curve"); plt.show()

calib = pd.DataFrame({"p": p_test, "y": test["default"]})
calib["decile"] = pd.qcut(calib.p, 10, labels=False)
print(calib.groupby("decile").agg(predicted=("p", "mean"), observed=("y", "mean")).round(3))
```

## Software Shortcuts

- **Excel:** no built-in logistic regression. Set up the log-likelihood `=y*LN(p)+(1-y)*LN(1-p)` per row with `p = 1/(1+EXP(-(b0+b1*x...)))`, sum it, and maximise with Data → **Solver** (GRG Nonlinear) over the coefficient cells. Odds ratios via `=EXP(b)`.
- **SPSS:** Analyze → Regression → **Binary Logistic** (Categorical… for factors; Save → Predicted probabilities; Options → Hosmer-Lemeshow, CI for exp(B), classification cutoff); ROC: Analyze → Classify → **ROC Curve** (older versions: Analyze → ROC Curve); multinomial/ordinal via Analyze → Regression → Multinomial Logistic / Ordinal.
- **Stata:** `logit default income debt_ratio late_pays tenure i.segment` (coefficients) or `logistic ...` (odds ratios), `margins, dydx(*)`, `lroc`, `estat classification, cutoff(0.2)`, `estat gof, group(10)`, `lrtest`.
- **Google Sheets:** as Excel with the Solver add-on.

## Industry Examples

**Retail banking — application scorecard.** A consumer lender builds a probability-of-default model on 250,000 past loans with logistic regression on binned predictors (weight-of-evidence encoding). Coefficients are converted into a points-based scorecard (e.g. +20 points per halving of odds) that loan officers and regulators can audit. The model reaches an AUC of 0.78 on a holdout sample, is recalibrated annually, and the chosen cut-off balances expected credit losses against lost interest income from rejected good customers.

**Telecommunications — churn prevention.** A mobile operator predicts 60-day churn from contract type, tenure, recent complaints, data-usage trend and price-plan changes. Complaints have an odds ratio of 1.9 per complaint in the last quarter. Customers in the top decile of predicted risk (observed churn 31% vs. 4% overall) receive retention offers; a randomised holdout within that decile shows the offers cut churn by a third, so the campaign is extended — the model finds *who* to target, the experiment proves the offer works.

**Cardiology — clinical risk scores.** Widely used cardiovascular risk calculators are built from logistic or survival regression on cohort data with age, sex, blood pressure, cholesterol, smoking and diabetes. A hospital validating such a score locally finds good discrimination (AUC 0.76) but over-prediction of risk by 30% in its population (poor calibration) and recalibrates the intercept before using it to decide who is offered statins — calibration, not just AUC, drives clinical decisions.

## Practice Questions

*✎ new question added for this site (worked solution below)*

- ✎ A fitted model has log-odds $-2+0.5x$. Find the predicted probability at $x=3$ and the odds ratio per unit of $x$.
- ✎ Find the approximate change in probability for one more unit of $x$ at the point $x=3$ of the previous question.

## Solutions

*✎ solution written for this site*

- ✎ Q1: Log-odds at $x=3$: $-0.5$, so $p=1/(1+e^{0.5})=0.378$. The odds ratio is $e^{0.5}=1.65$: each unit of $x$ raises the odds by about 65%.
- ✎ Q2: $\partial p/\partial x=\beta\,p(1-p)=0.5\cdot0.378\cdot0.622=0.118$: about 12 percentage points per unit of $x$ at this point (the effect on the probability depends on where you are on the curve).
