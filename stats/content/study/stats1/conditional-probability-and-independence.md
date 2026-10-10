# Conditional Probability and Independence

> Course part: Stats 1

## Overview

Probabilities change when we learn something. The probability that a customer churns is different for customers who just complained. **Conditional probability** captures this updating; **independence** is the special case in which learning the other event changes nothing.

## Concept

### Conditional probability

For events $A,B$ with $P(B)>0$, the [conditional probability](https://en.wikipedia.org/wiki/Conditional_probability) of $A$ given $B$ is

$$P(A\mid B)=\frac{P(A\cap B)}{P(B)} .$$

Interpretation: restrict attention to the outcomes in $B$ and ask which fraction of them also lies in $A$. Rearranged, it gives the **multiplication rule** $P(A\cap B)=P(A\mid B)\,P(B)$.

### Independence

Events $A$ and $B$ are [independent](https://en.wikipedia.org/wiki/Independence_%28probability_theory%29) if
$$P(A\cap B)=P(A)\,P(B)\quad\Longleftrightarrow\quad P(A\mid B)=P(A)\ \ (\text{if } P(B)>0).$$

For **three events** $A,B,C$, independence requires all pairwise conditions *and* $P(A\cap B\cap C)=P(A)P(B)P(C)$. Pairwise independence alone is not enough.

Note: independent is not the same as disjoint. Disjoint events with positive probabilities are strongly *dependent* (if one occurs, the other cannot).

## Worked Example

Roll a fair die. $B$ = "even" $=\{2,4,6\}$ and $A$ = "at least 4" $=\{4,5,6\}$. Then $A\cap B=\{4,6\}$, so
$$P(A\mid B)=\frac{2/6}{3/6}=\frac23 \ne P(A)=\frac12 ,$$
so $A$ and $B$ are **not** independent.

Independent example: two dice; $A$ = "first die even", $B$ = "second die $\ge5$". $P(A\cap B)=\frac{3\cdot2}{36}=\frac16=\frac12\cdot\frac13=P(A)P(B)$ ✓.

**Pairwise but not jointly independent.** Toss two fair coins. $A$ = "first is heads", $B$ = "second is heads", $C$ = "both tosses are equal". Each has probability $\frac12$ and every pair has intersection probability $\frac14=\frac12\cdot\frac12$ (pairwise independent), but $P(A\cap B\cap C)=P(HH)=\frac14\ne\frac18$.

## Common Mistakes

- Confusing $P(A\mid B)$ with $P(B\mid A)$ (the "prosecutor's fallacy"). They are linked by Bayes' rule, not equal.
- Assuming independence because events "seem unrelated" without checking $P(A\cap B)=P(A)P(B)$.
- Treating disjoint events as independent.

## When It's Used

Conditional probability is how evidence changes risk: churn probability given a complaint, default probability given a missed payment, conversion rate given a visit from a campaign. Independence is the key simplifying assumption in reliability (components failing independently) and must be checked, not assumed.

**Exam tip:** to show independence verify $P(A \cap B) = P(A)P(B)$ (equivalently $P(A|B) = P(A)$). For three events, pairwise independence is **not** enough.

## R Code

```r
dice <- expand.grid(d1 = 1:6, d2 = 1:6)
A <- dice$d1 == 6                      # first die shows 6
B <- dice$d1 + dice$d2 == 7            # sum is 7
C <- dice$d1 + dice$d2 == 8            # sum is 8

P <- function(e) mean(e)
c(P_A_given_B = P(A & B) / P(B), P_A = P(A))          # equal -> independent
c(P_AB = P(A & B), P_A_P_B = P(A) * P(B))
c(P_AC = P(A & C), P_A_P_C = P(A) * P(C))             # not independent
```

## Python Code

```python
from itertools import product
from fractions import Fraction

dice = list(product(range(1, 7), repeat=2))
def P(event):
    return Fraction(sum(event(d) for d in dice), len(dice))

A = lambda d: d[0] == 6
B = lambda d: sum(d) == 7
C = lambda d: sum(d) == 8
AB = lambda d: A(d) and B(d)
AC = lambda d: A(d) and C(d)

print("P(A|B) =", P(AB) / P(B), " P(A) =", P(A))
print("P(A n B) =", P(AB), " P(A)P(B) =", P(A) * P(B))
print("P(A n C) =", P(AC), " P(A)P(C) =", P(A) * P(C))
```

## Practice Questions

*✎ new question added for this site (worked solution below)*

- ✎ Given $P(A)=0.5$, $P(B)=0.4$ and $P(A\cap B)=0.2$, compute $P(A\mid B)$ and decide whether $A$ and $B$ are independent.
- ✎ 30% of customers file a complaint, and 40% of those who complain cancel their contract. What share of all customers both complain and cancel?
- ✎ Two cards are drawn without replacement from a 52-card deck. What is the probability that both are aces?

## Solutions

*✎ solution written for this site*

- ✎ Q1: $P(A\mid B)=0.2/0.4=0.5=P(A)$, and $P(A)P(B)=0.5\cdot0.4=0.2=P(A\cap B)$: the events are independent.
- ✎ Q2: $P(\text{complain}\cap\text{cancel})=0.4\cdot0.3=0.12$, i.e. 12%.
- ✎ Q3: $P=\frac{4}{52}\cdot\frac{3}{51}=\frac{12}{2652}=\frac1{221}\approx0.0045$. (The second draw depends on the first, so the events are not independent.)
