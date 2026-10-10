# Total Probability Rule and Bayes' Rule

> Course part: Stats 1

## Overview

Often we know how likely an observation is *under each possible cause*, but we want the opposite: given the observation, how likely is each cause? Two rules solve this. The **total probability rule** combines the scenarios into an overall probability; **Bayes' rule** then reverses the conditioning.

## Concept

Let $B_1,\dots,B_k$ be a **partition** of $\Omega$: the $B_j$ are pairwise disjoint and together cover $\Omega$ (exactly one of them happens), with $P(B_j)>0$.

### Law of total probability

$$P(A)=\sum_{j=1}^{k}P(A\mid B_j)\,P(B_j).$$

(See [law of total probability](https://en.wikipedia.org/wiki/Law_of_total_probability).) It is a weighted average of the conditional probabilities, weighted by how likely each scenario is.

### Bayes' rule

For an event $A$ with $P(A)>0$,
$$P(B_i\mid A)=\frac{P(A\mid B_i)\,P(B_i)}{\sum_{j=1}^{k}P(A\mid B_j)\,P(B_j)} .$$

This is [Bayes' theorem](https://en.wikipedia.org/wiki/Bayes'_theorem): the **posterior** $P(B_i\mid A)$ equals the **likelihood** $P(A\mid B_i)$ times the **prior** $P(B_i)$, divided by the total probability of the evidence $A$.

**Recipe:** draw a tree or a table: list the scenarios with their priors, multiply by the likelihoods to get the joint probabilities, add them to get $P(A)$, and divide each joint probability by that sum.

## Worked Example

**Which machine made the defective part?** Machines M1, M2, M3 produce 50%, 30% and 20% of all parts, with defect rates 1%, 2% and 5%.

| Machine | Prior $P(M_i)$ | $P(D\mid M_i)$ | Joint $P(D\cap M_i)$ | Posterior $P(M_i\mid D)$ |
|---|---|---|---|---|
| M1 | 0.5 | 0.01 | 0.005 | 0.238 |
| M2 | 0.3 | 0.02 | 0.006 | 0.286 |
| M3 | 0.2 | 0.05 | 0.010 | 0.476 |
| Total | 1 | | **0.021** | 1 |

So 2.1% of all parts are defective, and although M3 makes only 20% of the parts, it is responsible for 47.6% of defective ones.

**Diagnostic test.** A disease has prevalence 1%; the test has sensitivity 95% (positive if ill) and a false-positive rate of 10%. Then $P(+)=0.01\cdot0.95+0.99\cdot0.10=0.1085$ and $P(\text{ill}\mid+)=0.0095/0.1085\approx0.088$: fewer than 9% of positive results are true positives, because healthy people are so much more numerous. This is the [base rate fallacy](https://en.wikipedia.org/wiki/Base_rate_fallacy).

## Common Mistakes

- Treating $P(A\mid B)$ and $P(B\mid A)$ as equal.
- Ignoring the prior (base rate), which is exactly what causes the false-positive paradox.
- Using scenarios that are not a partition (overlapping or not exhaustive), so the denominator is wrong.

## When It's Used

Bayes' rule is behind diagnostic testing (probability of disease given a positive test), spam filters, fraud alerts and root-cause analysis in manufacturing (which machine produced this defective part?). The total probability rule gives the overall rate by averaging over the scenarios.

**Exam tip:** set up a tree or a table: prior $P(B_i)$, likelihood $P(A|B_i)$, then divide the relevant branch by the sum of all branches. Low base rates make even accurate tests produce many false positives.

## R Code

```r
# Three machines produce 50%, 30%, 20% of parts with defect rates 1%, 2%, 3%
prior <- c(M1 = 0.5, M2 = 0.3, M3 = 0.2)
defect_rate <- c(0.01, 0.02, 0.03)

p_defect <- sum(defect_rate * prior)        # total probability rule
p_defect
posterior <- defect_rate * prior / p_defect  # Bayes: P(machine | defective)
round(posterior, 3)

# Diagnostic test: prevalence 1%, sensitivity 95%, specificity 90%
prev <- 0.01; sens <- 0.95; spec <- 0.90
p_pos <- sens * prev + (1 - spec) * (1 - prev)
sens * prev / p_pos                          # P(disease | positive)
```

## Python Code

```python
import numpy as np

prior = np.array([0.5, 0.3, 0.2])
defect_rate = np.array([0.01, 0.02, 0.03])

p_defect = np.sum(defect_rate * prior)          # total probability
posterior = defect_rate * prior / p_defect      # Bayes' rule
print("P(defect) =", p_defect)
print("P(machine | defect) =", posterior.round(3))

prev, sens, spec = 0.01, 0.95, 0.90
p_pos = sens * prev + (1 - spec) * (1 - prev)
print("P(disease | positive) =", round(sens * prev / p_pos, 4))
```

## Practice Questions

*✎ new question added for this site (worked solution below)*

- ✎ In the diagnostic example above, suppose the false-positive rate is only 5% (all else unchanged). What is $P(\text{ill}\mid +)$?
- ✎ 40% of e-mails are spam. The word "free" appears in 50% of spam and in 5% of non-spam. What is the probability that an e-mail containing "free" is spam?

## Solutions

*✎ solution written for this site*

- ✎ Q1: $P(+)=0.01\cdot0.95+0.99\cdot0.05=0.0095+0.0495=0.059$, so $P(\text{ill}\mid+)=0.0095/0.059\approx0.161$.
- ✎ Q2: $P(\text{free})=0.4\cdot0.5+0.6\cdot0.05=0.20+0.03=0.23$. $P(\text{spam}\mid\text{free})=0.20/0.23\approx0.870$.
