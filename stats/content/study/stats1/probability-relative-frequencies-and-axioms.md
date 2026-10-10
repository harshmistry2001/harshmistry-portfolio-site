# Probability, Relative Frequencies, and Axioms

> Course part: Stats 1

## Overview

What does "the probability is 0.5" mean? One answer is practical: if you repeat the experiment many times, the **relative frequency** of the event settles near that number. Mathematics then turns this into a small set of rules (axioms) that every probability must obey, from which all other calculation rules follow.

## Concept

### Relative frequency

If an event $A$ occurs $n_A$ times in $n$ repetitions, its relative frequency is $r_A = n_A/n$. As $n$ grows, $r_A$ stabilises around a fixed number, which we call $P(A)$. This empirical regularity is made precise by the [law of large numbers](https://en.wikipedia.org/wiki/Law_of_large_numbers).

### Kolmogorov's axioms

A [probability measure](https://en.wikipedia.org/wiki/Probability_axioms) $P$ assigns a number to every event and satisfies:

1. **Non-negativity**: $P(A)\ge 0$ for every event $A$.
2. **Certainty**: $P(\Omega)=1$.
3. **Additivity**: for pairwise disjoint events $A_1, A_2,\dots$,
$$P(A_1\cup A_2\cup\cdots)=P(A_1)+P(A_2)+\cdots .$$

### Consequences

- **Complement rule**: $P(A^c)=1-P(A)$.
- **Addition rule** (inclusion–exclusion for two events): $P(A\cup B)=P(A)+P(B)-P(A\cap B)$. Subtracting the overlap avoids counting it twice.
- $P(\emptyset)=0$, $0\le P(A)\le1$, and $A\subset B\Rightarrow P(A)\le P(B)$.
- For disjoint events the addition rule reduces to $P(A\cup B)=P(A)+P(B)$.

## Worked Example

Roll a fair die. Let $A$ = "even" $=\{2,4,6\}$ and $B$ = "at least 5" $=\{5,6\}$. Then $P(A)=\frac12$, $P(B)=\frac13$ and $A\cap B=\{6\}$ with $P(A\cap B)=\frac16$.

$$P(A\cup B)=\frac12+\frac13-\frac16=\frac23 ,$$

which matches the direct count $A\cup B=\{2,4,5,6\}$, i.e. $4/6$. The complement "not even" has probability $1-\frac12=\frac12$.

## Common Mistakes

- Using $P(A\cup B)=P(A)+P(B)$ when the events overlap.
- Using probabilities that violate the axioms, such as values above 1 or a total above 1 for disjoint, exhaustive events.
- Confusing "relative frequency in a sample" (which varies) with the probability (which is fixed).

## When It's Used

The axioms are what keep probability models consistent: risk registers, insurance pricing and survey reports all rely on the addition rule and the complement rule. Inclusion-exclusion is also a practical data-quality check: overlapping counts that exceed the total reveal recording errors.

**Exam tip:** $P(A \cup B) = P(A) + P(B) - P(A \cap B)$; if $B \subset A$ then $P(A\cup B) = P(A)$; if disjoint, just add.

## R Code

```r
# Relative frequencies stabilise (law of large numbers)
set.seed(5)
rolls <- sample(1:6, 5000, replace = TRUE)
running <- cumsum(rolls == 6) / seq_along(rolls)
plot(running, type = "l", log = "x", ylab = "relative frequency of a six")
abline(h = 1/6, lty = 2)

# Bookstore survey: inclusion-exclusion for three sets
T_ <- 513; R <- 470; S <- 407; TR <- 377; TS <- 308; RS <- 294; TRS <- 241
T_ + R + S - TR - TS - RS + TRS        # > 600 respondents -> inconsistent data

# P(A u B) with P(A) = 0.45, P(B) = 0.3 under different conditions
pA <- 0.45; pB <- 0.3
c(a = pA + pB - 0.23,                 # P(A n B) = 0.23
  b = pA + pB - (pA - 0.15),          # P(A \ B) = 0.15 -> P(A n B) = 0.30
  c = pA,                             # B subset of A
  d = pA + pB)                        # disjoint
```

## Python Code

```python
import numpy as np
import matplotlib.pyplot as plt

rng = np.random.default_rng(5)
rolls = rng.integers(1, 7, 5000)
running = np.cumsum(rolls == 6) / np.arange(1, 5001)
plt.semilogx(running); plt.axhline(1 / 6, ls="--")
plt.ylabel("relative frequency of a six")
plt.show()

# Bookstore survey: inclusion-exclusion
total = 513 + 470 + 407 - 377 - 308 - 294 + 241
print("customers liking at least one genre:", total, "> 600 -> inconsistent")

pA, pB = 0.45, 0.3
print({"a": pA + pB - 0.23, "b": pA + pB - (pA - 0.15), "c": pA, "d": pA + pB})
```

## Practice Questions

*✎ new question added for this site (worked solution below)*

- ✎ Given $P(A)=0.6$, $P(B)=0.5$ and $P(A\cap B)=0.3$, find $P(A\cup B)$ and the probability that neither event occurs.
- ✎ Can two disjoint events have $P(A)=0.7$ and $P(B)=0.6$? Explain.
- ✎ 70% of customers own product A, 40% own product B and 20% own both. What share owns at least one, and what share owns neither?

## Solutions

*✎ solution written for this site*

- ✎ Q1: $P(A\cup B)=0.6+0.5-0.3=0.8$; neither: $1-0.8=0.2$.
- ✎ Q2: No. For disjoint events $P(A\cup B)=0.7+0.6=1.3>1$, which violates the axioms.
- ✎ Q3: At least one: $0.7+0.4-0.2=0.9$; neither: $1-0.9=0.1$.
