# Laplace Experiment and Combinatorics

> Course part: Stats 1

## Overview

If all outcomes of an experiment are equally likely (a fair die, a well-shuffled deck, a lottery draw), probability reduces to **counting**: favourable outcomes divided by possible outcomes. The art is counting efficiently, which is the subject of combinatorics.

## Concept

### Laplace experiment

A Laplace experiment has a finite sample space $\Omega$ with $m$ elements, all equally likely (a discrete uniform distribution). For an event $A$,

$$P(A)=\frac{|A|}{m}=\frac{\text{number of favourable outcomes}}{\text{number of possible outcomes}} .$$

This is only valid if the outcomes in $\Omega$ really are equally likely.

### Counting rules

- **Product rule**: if a first step has $n_1$ possible results and a second step has $n_2$ (regardless of the first), there are $n_1 n_2$ combined results.
- **Permutations**: $n$ distinct objects can be ordered in $n!=n(n-1)\cdots1$ ways.
- **Ordered selection without replacement**: choosing $r$ of $n$ items in order gives $\dfrac{n!}{(n-r)!}$ possibilities.
- **Combinations** (unordered, without replacement): the [binomial coefficient](https://en.wikipedia.org/wiki/Binomial_coefficient)
$$\binom{n}{r}=\frac{n!}{r!\,(n-r)!}$$
counts the ways to choose $r$ items from $n$ when order does not matter.
- **With replacement**, ordered: $n^r$ possibilities.

Before counting, decide: does **order** matter, and is the selection **with or without replacement**?

## Worked Example

**Lottery "6 out of 49".** The number of possible draws is $\binom{49}{6}=13{,}983{,}816$, so the probability of the jackpot is $1/13{,}983{,}816\approx7\times10^{-8}$.

**Quality control.** A box has 20 parts, 3 of them defective. Four parts are drawn at random without replacement. The probability that none is defective is

$$\frac{\binom{17}{4}}{\binom{20}{4}}=\frac{2380}{4845}\approx0.491 .$$

**Product rule.** A 3-digit PIN has $10^3=1000$ possibilities.

## Common Mistakes

- Applying the Laplace formula when outcomes are not equally likely (for example counting "sum of two dice" values 2 to 12 as equally likely).
- Counting ordered selections when the question is unordered (or vice versa), which gives a factor $r!$ error.
- Forgetting that $0!=1$ and $\binom{n}{0}=\binom{n}{n}=1$.

## When It's Used

When all outcomes are equally likely, probability is counting: lottery odds, the chance a random sample contains no defective part, password strength, the number of possible test configurations. The binomial coefficient counts unordered selections without replacement.

**Exam tip:** decide *ordered or not* and *with or without replacement* before counting. $\binom{n}{r}$ is "unordered, without replacement".

## R Code

```r
# Lottery 6 out of 49
choose(49, 6)
1 / choose(49, 6)

# Exactly 3 correct numbers: choose 3 of the 6 winners and 3 of the 43 losers
choose(6, 3) * choose(43, 3) / choose(49, 6)

# Product rule: PIN with 4 digits
10^4

# Laplace probability with two dice: P(sum = 7) = |A| / |Omega|
dice <- expand.grid(d1 = 1:6, d2 = 1:6)
mean(dice$d1 + dice$d2 == 7)
```

## Python Code

```python
from math import comb, factorial
from itertools import product

print(comb(49, 6), 1 / comb(49, 6))
print(comb(6, 3) * comb(43, 3) / comb(49, 6))         # exactly 3 correct
print(10**4)                                           # product rule, 4-digit PIN
print(factorial(5) // (factorial(2) * factorial(3)))   # binomial coefficient by hand

dice = list(product(range(1, 7), repeat=2))
print(sum(a + b == 7 for a, b in dice) / len(dice))
```

## Practice Questions

*✎ new question added for this site (worked solution below)*

- ✎ Two fair dice are rolled. What is the probability that the sum is 8?
- ✎ In how many ways can a committee of 3 be chosen from 10 people?
- ✎ From 10 products, 2 are defective. If 2 products are drawn at random, what is the probability that neither is defective?

## Solutions

*✎ solution written for this site*

- ✎ Q1: 36 equally likely outcomes; the sum 8 occurs for $(2,6),(3,5),(4,4),(5,3),(6,2)$: $5/36\approx0.139$.
- ✎ Q2: $\binom{10}{3}=\frac{10\cdot9\cdot8}{3\cdot2\cdot1}=120$.
- ✎ Q3: $\binom{8}{2}/\binom{10}{2}=28/45\approx0.622$.
