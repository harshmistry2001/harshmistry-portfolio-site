# Random Experiments, Sample Space, and Events

> Course part: Stats 1

## Overview

Every probability calculation starts by answering three questions: *what is the experiment?*, *what can happen?* and *which outcomes do I care about?* The answers are the random experiment, the sample space and the event. Getting them right is half of solving any probability problem.

## Concept

- A **random experiment** is a repeatable procedure whose outcome is uncertain (tossing a coin, inspecting a part, measuring a waiting time).
- The **[sample space](https://en.wikipedia.org/wiki/Sample_space)** $\Omega$ is the set of all possible outcomes $\omega$.
- An **[event](https://en.wikipedia.org/wiki/Event_%28probability_theory%29)** is a subset $A\subset\Omega$: "the result is a favourable one". The empty set $\emptyset$ is the *impossible event*; $\Omega$ itself is the *certain event*. We say $A$ "occurs" if the observed outcome lies in $A$.
- Not every subset has to be assigned a probability in complicated spaces. The collection $\mathcal{A}$ of events is a **[σ-algebra](https://en.wikipedia.org/wiki/Sigma-algebra)**: it contains $\Omega$, is closed under complements and under countable unions. For finite or countable $\Omega$ one can simply use *all* subsets.

Events combine through set operations: $A\cap B$ ("both occur"), $A\cup B$ ("at least one occurs"), $A^c$ ("$A$ does not occur").

## Worked Example

Toss a coin twice and record the sequence. $\Omega=\{HH,HT,TH,TT\}$. The event "at least one head" is $A=\{HH,HT,TH\}$ and its complement $A^c=\{TT\}$ is "no head".

**Distinguishable vs. indistinguishable.** For four coins the quantity "number of tails" has sample space $\{0,1,2,3,4\}$, but these outcomes are *not* equally likely. Counting the 16 equally likely sequences gives probabilities $1,4,6,4,1$ divided by 16, so "exactly two tails" has probability $6/16=0.375$.

## Common Mistakes

- Choosing a sample space whose outcomes are not equally likely and then counting as if they were.
- Mixing up an outcome (a single element $\omega$) with an event (a set of outcomes).
- Forgetting outcomes: for two dice $\Omega$ has 36 elements, not 21 (the pairs $(1,2)$ and $(2,1)$ are different outcomes).

## When It's Used

Writing down the sample space is the first step of every probability model: all possible outcomes of a quality inspection, of a coin/dice game, of a network failure scenario. Getting $\Omega$ right is what makes later probability calculations correct.

**Exam tip:** decide whether outcomes are distinguishable. For four indistinguishable coins $\Omega = \{0,1,2,3,4\}$ (number of tails), but these outcomes are *not* equally likely; enumerate the 16 distinguishable sequences to get probabilities.

## R Code

```r
# Four coins: distinguishable outcomes
coins <- expand.grid(c1 = c("H", "T"), c2 = c("H", "T"), c3 = c("H", "T"), c4 = c("H", "T"))
nrow(coins)                                            # |Omega| = 16

tails <- rowSums(coins == "T")
table(tails)                                           # outcomes of the "indistinguishable" space
mean(tails >= 3)                                       # P(at least three tails)

# n devices, working (1) or defective (0): event "first two defective, third working"
n <- 4
devices <- expand.grid(rep(list(0:1), n))
event <- devices[devices$Var1 == 0 & devices$Var2 == 0 & devices$Var3 == 1, ]
nrow(event)                                            # 2^(n-3) outcomes
```

## Python Code

```python
from itertools import product
from collections import Counter

coins = list(product("HT", repeat=4))
print(len(coins))                                      # |Omega| = 16

tails = [c.count("T") for c in coins]
print(sorted(Counter(tails).items()))
print("P(at least 3 tails) =", sum(t >= 3 for t in tails) / len(coins))

n = 4
devices = list(product([0, 1], repeat=n))              # 1 = working, 0 = defective
event = [d for d in devices if d[0] == 0 and d[1] == 0 and d[2] == 1]
print(len(event), event)
```

## Practice Questions

*✎ new question added for this site (worked solution below)*

- ✎ Two distinguishable dice are rolled. How many outcomes does $\Omega$ contain, and how many belong to the event "the sum is 7"?
- ✎ Three coins are tossed. List $\Omega$ and the event "exactly two heads".

## Solutions

*✎ solution written for this site*

- ✎ Q1: $|\Omega|=6\cdot6=36$. The sum 7 occurs for $(1,6),(2,5),(3,4),(4,3),(5,2),(6,1)$: 6 outcomes.
- ✎ Q2: $\Omega=\{HHH,HHT,HTH,THH,HTT,THT,TTH,TTT\}$ (8 outcomes). "Exactly two heads" $=\{HHT,HTH,THH\}$.
