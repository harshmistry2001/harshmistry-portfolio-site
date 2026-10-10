# Probability Basics

## Overview

Probability is the language of uncertainty. Starting from a handful of rules (probabilities lie between 0 and 1, they add up for exclusive events), one can derive how to combine events, how to update beliefs with evidence (Bayes' theorem) and how to count outcomes. Most mistakes in practice come from misusing conditional probabilities.

## Concept

Probability quantifies uncertainty on a scale from 0 (impossible) to 1 (certain). It is the language in which every statistical method states its assumptions and results.

### Building blocks

- **Random experiment** — a process with an uncertain outcome (a customer visit, a coin toss, a component's lifetime).
- **Sample space** $\Omega$ — the set of all possible outcomes.
- **Event** $A \subseteq \Omega$ — a set of outcomes ("the customer buys", "the sum of two dice is 7").
- **Set operations** — union $A \cup B$ (A or B), intersection $A \cap B$ (A and B), complement $A^c$ (not A).

### Interpretations

- **Classical (Laplace):** equally likely outcomes, $P(A) = \frac{|A|}{|\Omega|}$.
- **[Frequentist](https://en.wikipedia.org/wiki/Frequentist_probability):** the long-run relative frequency of $A$ in repeated trials.
- **Subjective / [Bayesian](https://en.wikipedia.org/wiki/Bayesian_probability):** a degree of belief that is updated with evidence.

### Kolmogorov's axioms and the rules that follow

1. $P(A) \ge 0$; 2. $P(\Omega) = 1$; 3. for disjoint events $P(A \cup B) = P(A) + P(B)$.

From these:

- **Complement rule:** $P(A^c) = 1 - P(A)$ — "at least one" problems are easiest via the complement.
- **Addition rule:** $P(A \cup B) = P(A) + P(B) - P(A \cap B)$.
- **Conditional probability:** $P(A \mid B) = \frac{P(A \cap B)}{P(B)}$, the probability of $A$ once we know $B$ happened.
- **Multiplication rule:** $P(A \cap B) = P(A \mid B)\,P(B)$.
- **Independence:** $A$ and $B$ are independent if $P(A \cap B) = P(A)P(B)$, equivalently $P(A \mid B) = P(A)$. Independence is *not* the same as disjointness — disjoint events with positive probability are strongly dependent.
- **[Law of total probability](https://en.wikipedia.org/wiki/Law_of_total_probability):** if $B_1, \dots, B_k$ partition $\Omega$, $P(A) = \sum_j P(A \mid B_j)P(B_j)$.
- **[Bayes' theorem](https://en.wikipedia.org/wiki/Bayes'_theorem):** $P(B_i \mid A) = \frac{P(A \mid B_i)P(B_i)}{\sum_j P(A \mid B_j)P(B_j)}$ — turns $P(\text{evidence} \mid \text{cause})$ into $P(\text{cause} \mid \text{evidence})$.

### Counting (for equally likely outcomes)

| Selection of $k$ from $n$ | Ordered | Unordered |
|---|---|---|
| with replacement | $n^k$ | $\binom{n+k-1}{k}$ |
| without replacement | $\frac{n!}{(n-k)!}$ | $\binom{n}{k} = \frac{n!}{k!(n-k)!}$ |

### Common pitfalls

- **[Base-rate neglect](https://en.wikipedia.org/wiki/Base_rate_fallacy):** a 99%-accurate test for a disease with 0.1% prevalence still produces mostly false positives.
- **Confusing $P(A \mid B)$ with $P(B \mid A)$** (the prosecutor's fallacy).
- **[Gambler's fallacy](https://en.wikipedia.org/wiki/Gambler's_fallacy):** independent trials have no memory; five reds in a row do not make black "due".
- **Assuming independence** where outcomes share a common cause (defaults in a recession, failures from the same batch).

## When It's Used

Probability rules underpin risk assessment and decision-making everywhere: insurers price policies from claim probabilities, banks estimate default probabilities, medical diagnostics interpret test results with Bayes' theorem, spam filters and fraud systems update probabilities as evidence arrives, reliability engineers combine component failure probabilities into system availability, and A/B-testing platforms rely on probability models to decide whether an effect is real.

## R Code

```r
set.seed(7)

# 1. Relative frequency converges to probability (two dice, P(sum = 7) = 1/6)
rolls <- replicate(20000, sum(sample(1:6, 2, replace = TRUE)))
c(simulated = mean(rolls == 7), exact = 1 / 6)

# 2. Complement rule: P(at least one six in 4 rolls)
1 - (5 / 6)^4

# 3. Birthday problem: P(at least two of n people share a birthday)
p_shared <- function(n) 1 - prod((365 - 0:(n - 1)) / 365)
sapply(c(10, 23, 50), p_shared)

# 4. Conditional probability and independence from a contingency table
visits <- matrix(c(120, 380,     # mobile:  bought, not bought
                    90, 210),    # desktop: bought, not bought
                 nrow = 2, byrow = TRUE,
                 dimnames = list(device = c("mobile", "desktop"), outcome = c("buy", "no_buy")))
P <- visits / sum(visits)
p_buy <- sum(P[, "buy"])
p_buy_given_mobile <- P["mobile", "buy"] / sum(P["mobile", ])
c(P_buy = p_buy, P_buy_given_mobile = p_buy_given_mobile)       # unequal -> dependent

# 5. Bayes' theorem: diagnostic test
bayes_positive <- function(prevalence, sensitivity, specificity) {
  p_pos <- sensitivity * prevalence + (1 - specificity) * (1 - prevalence)
  sensitivity * prevalence / p_pos
}
sapply(c(0.001, 0.01, 0.1), bayes_positive, sensitivity = 0.99, specificity = 0.99)

# 6. Reliability: series vs. parallel system of three independent components (p = 0.95 each)
p <- 0.95
c(series = p^3, parallel = 1 - (1 - p)^3)

# 7. Counting
c(ordered_no_repl = factorial(10) / factorial(7), combinations = choose(10, 3), with_repl = 10^3)
```

## Python Code

```python
import numpy as np
from math import comb, perm, prod

rng = np.random.default_rng(7)

# 1. Relative frequency vs probability
rolls = rng.integers(1, 7, size=(20_000, 2)).sum(axis=1)
print("P(sum=7):", (rolls == 7).mean(), "exact:", 1 / 6)

# 2. Complement rule
print("P(>= one six in 4 rolls):", 1 - (5 / 6) ** 4)

# 3. Birthday problem
p_shared = lambda n: 1 - prod((365 - k) / 365 for k in range(n))
print({n: round(p_shared(n), 4) for n in (10, 23, 50)})

# 4. Conditional probability from a contingency table
visits = np.array([[120, 380],     # mobile:  buy, no buy
                   [90, 210]])     # desktop: buy, no buy
P = visits / visits.sum()
p_buy = P[:, 0].sum()
p_buy_given_mobile = P[0, 0] / P[0].sum()
print(f"P(buy)={p_buy:.3f}  P(buy|mobile)={p_buy_given_mobile:.3f}")


# 5. Bayes' theorem for a diagnostic test
def bayes_positive(prevalence, sensitivity=0.99, specificity=0.99):
    p_pos = sensitivity * prevalence + (1 - specificity) * (1 - prevalence)
    return sensitivity * prevalence / p_pos


print({prev: round(bayes_positive(prev), 4) for prev in (0.001, 0.01, 0.1)})

# 6. Reliability of series vs parallel systems
p = 0.95
print("series:", p**3, " parallel:", 1 - (1 - p) ** 3)

# 7. Counting
print(perm(10, 3), comb(10, 3), 10**3)
```

## Software Shortcuts

- **Excel:** `=COMBIN(n, k)`, `=PERMUT(n, k)`, `=FACT(n)`, `=COMBINA(n, k)` (with repetition). Simulate with `=RANDBETWEEN(1, 6)` or `=RAND()` and count with `=COUNTIF()`; Data → What-If Analysis → Data Table repeats a simulation many times. Build a 2×2 table with a PivotTable and use *Show Values As → % of Row Total* for conditional probabilities.
- **SPSS:** Analyze → Descriptive Statistics → **Crosstabs** → Cells → *Row/Column percentages* gives conditional relative frequencies; Transform → Compute Variable with `RV.BERNOULLI(p)` or `RV.UNIFORM(a,b)` for simulation.
- **Stata:** `tabulate device outcome, row col`; `display comb(10,3)`; `set seed 7` then `generate x = runiform()` for simulation.
- **Google Sheets:** `=COMBIN()`, `=PERMUT()`, `=RANDBETWEEN()`; pivot tables with "Show as % of row".

## Industry Examples

**Healthcare — screening programmes.** A national mammography programme reports sensitivity ≈ 87% and specificity ≈ 93%. With a prevalence of about 0.5% in the screened age group, Bayes' theorem gives a positive predictive value of only around 6%: most recalls are false alarms. Programme designers use this calculation to set recall protocols (second imaging before biopsy) and to write patient information that explains why a positive screen is usually not cancer.

**Insurance — pricing a travel policy.** An insurer estimates $P(\text{trip cancellation}) = 0.03$, $P(\text{medical claim}) = 0.02$ and, from past data, $P(\text{both}) = 0.004$. The addition rule gives $P(\text{any claim}) = 0.046$, and the conditional probability $P(\text{medical} \mid \text{cancellation}) = 0.133$ is far above 0.02 — the events are dependent because illness causes both. Pricing assuming independence would under-reserve for combined claims.

**Cloud infrastructure — availability design.** A SaaS company runs each service on three independent availability zones, each available 99.5% of the time. A series design (all three needed) would give $0.995^3 \approx 98.5\%$ availability, while a parallel design (any one suffices) gives $1 - 0.005^3 \approx 99.99999\%$. The SRE team uses exactly these probability rules — plus a correction for correlated failures such as a shared network provider — to justify the multi-zone architecture in its SLA.

## Practice Questions

*✎ new question added for this site (worked solution below)*

- ✎ A disease has prevalence 0.5%. A test detects it in 98% of sick people but also gives a positive result for 3% of healthy people. What is the probability of disease given a positive test?
- ✎ A fair die is rolled 4 times. What is the probability of at least one six?

## Solutions

*✎ solution written for this site*

- ✎ Q1: $P(+)=0.005\cdot0.98+0.995\cdot0.03=0.03475$; $P(\text{disease}\mid+)=\frac{0.0049}{0.03475}\approx0.141$. Only about 14% of positive tests are true positives because the disease is rare.
- ✎ Q2: Use the complement: $1-(5/6)^4=0.518$.
