# Set Theory

> Course part: Stats 1

## Overview

Probability is built on sets: an *event* such as "the die shows an even number" is simply a set of outcomes. Learning the few basic set operations gives you the vocabulary for everything in probability, and for much of everyday data work (filtering, joining, deduplicating).

## Concept

A **set** is a collection of distinct elements. All sets below are subsets of a fixed universe $\Omega$ (the "everything under consideration").

| Notation | Name | Meaning |
|---|---|---|
| $\emptyset$ | empty set | contains no elements |
| $A \subset B$ | subset | every element of $A$ is also in $B$ |
| $A \cap B = \{a \mid a\in A \text{ and } a\in B\}$ | intersection | elements in **both** |
| $A \cup B = \{a \mid a\in A \text{ or } a\in B\}$ | union | elements in **at least one** ("or" is inclusive) |
| $A \setminus B$ | difference | in $A$ but **not** in $B$ |
| $A^c = \Omega \setminus A$ | complement | everything in $\Omega$ not in $A$ |

Two sets are **disjoint** (mutually exclusive) if $A \cap B = \emptyset$.

### De Morgan's laws

[De Morgan's laws](https://en.wikipedia.org/wiki/De_Morgan's_laws) say how a complement distributes over union and intersection:

$$(A \cup B)^c = A^c \cap B^c, \qquad (A \cap B)^c = A^c \cup B^c .$$

In words: "not (A or B)" means "not A and not B"; "not (A and B)" means "not A or not B". A [Venn diagram](https://en.wikipedia.org/wiki/Venn_diagram) makes these identities easy to see.

## Worked Example

Let $\Omega = \{1,\dots,10\}$, $A = \{2,4,6,8,10\}$ (even numbers), $B = \{1,2,3,4,5\}$.

- $A\cap B = \{2,4\}$; $A\cup B = \{1,2,3,4,5,6,8,10\}$; $A\setminus B = \{6,8,10\}$.
- $A^c = \{1,3,5,7,9\}$ and $B^c = \{6,7,8,9,10\}$.
- De Morgan: $(A\cup B)^c = \{7,9\}$ and $A^c\cap B^c = \{7,9\}$ ✓. Also $(A\cap B)^c = \{1,3,5,6,7,8,9,10\} = A^c \cup B^c$ ✓.

## Common Mistakes

- Taking the complement without saying relative to which $\Omega$: it is always $\Omega \setminus A$.
- Reading "or" as exclusive. In mathematics $A\cup B$ includes the elements in both sets.
- Mixing up $\subset$ (a relation between sets) with $\in$ (membership of an element).

## When It's Used

Set operations are the language of probability and also of everyday data work: filtering customers who bought A *and* B (intersection), either (union), A but not B (difference). SQL joins and dataframe filters are set operations in disguise.

**Exam tip:** always write the complement relative to the given $\Omega$. De Morgan: $(A \cup B)^c = A^c \cap B^c$.

## R Code

```r
Omega <- -6:3
A <- c(-4, -2, 1, 3); B <- 0:3; C <- c(-6, -5, 0, 2)
comp <- function(S) setdiff(Omega, S)

union(union(A, B), C)                                   # A u B u C
intersect(intersect(comp(A), comp(B)), comp(C))         # A^c n B^c n C^c
union(intersect(comp(B), A), C)                         # (B^c n A) u C
union(setdiff(A, B), C)                                 # (A \ B) u C

# De Morgan check
setequal(comp(union(A, B)), intersect(comp(A), comp(B)))
setequal(comp(intersect(A, B)), union(comp(A), comp(B)))
```

## Python Code

```python
Omega = set(range(-6, 4))
A, B, C = {-4, -2, 1, 3}, {0, 1, 2, 3}, {-6, -5, 0, 2}
comp = lambda S: Omega - S

print(sorted(A | B | C))                        # A u B u C
print(sorted(comp(A) & comp(B) & comp(C)))      # A^c n B^c n C^c
print(sorted((comp(B) & A) | C))                # (B^c n A) u C
print(sorted((A - B) | C))                      # (A \ B) u C

# De Morgan check
print(comp(A | B) == comp(A) & comp(B), comp(A & B) == comp(A) | comp(B))
```

## Practice Questions

*✎ new question added for this site (worked solution below)*

- ✎ Let $\Omega=\{a,b,c,d,e,f\}$, $A=\{a,b,c\}$, $B=\{c,d\}$. Find $A\cup B$, $A\cap B$, $A\setminus B$ and $(A\cup B)^c$.
- ✎ Of 200 customers, 120 bought product A, 80 bought product B and 30 bought both. How many bought at least one of the two? How many bought neither?

## Solutions

*✎ solution written for this site*

- ✎ Q1: $A\cup B=\{a,b,c,d\}$; $A\cap B=\{c\}$; $A\setminus B=\{a,b\}$; $(A\cup B)^c=\{e,f\}$.
- ✎ Q2: Counting the 30 customers who bought both only once: $120 + 80 - 30 = 170$ bought at least one; $200 - 170 = 30$ bought neither.
