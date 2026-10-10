# Practice: Sample Spaces, Events, and Probability Rules

> Course part: Stats 1

## Overview

A problem set on the foundations of probability. You practise writing down sample spaces for described experiments, expressing events as sets, combining events with set operations, using inclusion–exclusion (and Venn diagrams) to check whether survey numbers are consistent, and applying the axioms of probability to compute $P(A\cup B)$ in different situations.

## Topics to Review

- [Set Theory](#/study/stats1/set-theory)
- [Random Experiments, Sample Space, and Events](#/study/stats1/random-experiments-sample-space-and-events)
- [Probability, Relative Frequencies, and Axioms](#/study/stats1/probability-relative-frequencies-and-axioms)

## How to Approach the Questions

- **Sample space first:** decide whether the outcomes you list are distinguishable and equally likely; describe the event as a subset of $\Omega$.
- **Set algebra:** write each set out explicitly, then apply the operations step by step. De Morgan's laws turn complements of unions into intersections of complements.
- **Inclusion–exclusion for three sets:** $|T\cup R\cup S|=|T|+|R|+|S|-|T\cap R|-|T\cap S|-|R\cap S|+|T\cap R\cap S|$. A result larger than the number of respondents is impossible.
- **Axioms:** $P(A\cup B)=P(A)+P(B)-P(A\cap B)$; $P(A\setminus B)=P(A)-P(A\cap B)$; if $B\subset A$ then $A\cap B=B$.

## When It's Used

This practice set covers modelling experiments with sample spaces, set algebra on events, the inclusion-exclusion consistency check and the axioms of probability. The code verifies the set operations, the bookstore contradiction and the four $P(A \cup B)$ cases.

**Exam tip:** in the bookstore question compute $|T \cup R \cup S|$ with inclusion-exclusion; any value above the number of respondents (600) proves a recording error.

## R Code

```r
# Q2: set operations on Omega = {-6, ..., 3}
Omega <- -6:3; A <- c(-4, -2, 1, 3); B <- 0:3; C <- c(-6, -5, 0, 2)
cmp <- function(S) setdiff(Omega, S)
list(i   = sort(union(union(A, B), C)),
     ii  = sort(Reduce(intersect, list(cmp(A), cmp(B), cmp(C)))),
     iii = sort(union(intersect(cmp(B), A), C)),
     iv  = sort(union(setdiff(A, B), C)))

# Q3: bookstore survey
513 + 470 + 407 - 377 - 308 - 294 + 241 > 600

# Q4: P(A u B) under the four conditions
pA <- 0.45; pB <- 0.3
c(a = pA + pB - 0.23, b = pA + pB - (pA - 0.15), c = pA, d = pA + pB)

# Q1(a): four coins, at least three tails
coins <- expand.grid(rep(list(c("H", "T")), 4))
mean(rowSums(coins == "T") >= 3)
```

## Python Code

```python
from itertools import product

Omega = set(range(-6, 4)); A = {-4, -2, 1, 3}; B = {0, 1, 2, 3}; C = {-6, -5, 0, 2}
cmp = lambda S: Omega - S
print({"i": sorted(A | B | C), "ii": sorted(cmp(A) & cmp(B) & cmp(C)),
       "iii": sorted((cmp(B) & A) | C), "iv": sorted((A - B) | C)})

print("bookstore inconsistent:", 513 + 470 + 407 - 377 - 308 - 294 + 241 > 600)

pA, pB = 0.45, 0.3
print({"a": pA + pB - 0.23, "b": pA + pB - (pA - 0.15), "c": pA, "d": pA + pB})

coins = list(product("HT", repeat=4))
print("P(>= 3 tails) =", sum(c.count("T") >= 3 for c in coins) / 16)
```

## Practice Questions

*◆ original question from the course material · ✎ new question added for this site (worked solution below)*

- ◆ [practice sheet] Specify the sample spaces for the random experiments below and give mathematical descriptions of the corresponding events.
  - (a) Experiment: Four indistinguishable coins are tossed at the same time. Event: At least three of the coins show 'tail'.
  - (b) Experiment: $n$ devices labelled with $1, \ldots, n$ are inspected. It is of interest which devices are working and which are not. Event: The first two devices are defective and the third one is working.
  - (c) Experiment: $n$ devices are inspected. Interest lies in the number of defective devices. Event: Exactly three devices are defective.
  - (d) Experiment: The temperature in a room is measured (°C). Event: The temperature in the room is above 19°C.
- ◆ [practice sheet] Consider the sample space $\Omega = \{-6, -5, \ldots, 2, 3\}$ and the events: $A = \{-4, -2, 1, 3\}$, $B = \{0, 1, 2, 3\}$, $C = \{-6, -5, 0, 2\}$. Determine the following events:
  - (i) $A \cup B \cup C$
  - (ii) $A^c \cap B^c \cap C^c$
  - (iii) $(B^c \cap A) \cup C$
  - (iv) $(A \setminus B) \cup C$
- ◆ [practice sheet] A bookstore surveys 600 customers. Of these, 513 say they like thriller books, 470 like romance books and 407 like sci-fi books. Of the respondents, 377 say they like thrillers and romance, 308 like thrillers and sci-fi, and 294 like romance and sci-fi. 241 of the respondents indicate that they like all three genres. Show that at least one of the numbers must be incorrectly recorded in this survey.
- ◆ [practice sheet] Let $\Omega$ be a sample space, and $P$ satisfying the axioms of probability. $A$ and $B$ are two events such that $P(A)=0.45$ and $P(B)=0.3$. Determine $P(A \cup B)$ every time, assuming the following conditions one at a time:
  - (a) $P(A \cap B) = 0.23$.
  - (b) $P(A \setminus B) = 0.15$.
  - (c) $B$ is a subset of $A$.
  - (d) $A$ and $B$ are disjoint.
- ◆ [practice sheet] We consider the closing prices of S&P 500 on Monday, Tuesday and Wednesday. Moreover, let $\Omega = \{\omega_1, \omega_2, \ldots, \omega_8\}$ be a sample space where the outcomes are defined (see source for full definitions). Define two events: A: the index rises on Monday and Wednesday. B: the index rises on Tuesday.
  - (a) Find the events $A \cup B$, $A \cap B$, $A^c$ and $B^c$.
  - (b) Show that $(A \cap B) \cup (A^c \cap B) = B$.
  - (c) Show that $A \cup (A^c \cap B) = A \cup B$.
- ✎ In a class of 30 students, 18 play football, 12 play basketball and 5 play both. How many play neither? If one student is picked at random, what is the probability that this student plays exactly one of the two sports?

## Solutions

*◆ original solution from the course material · ✎ solution written for this site*

- ◆ Q4: Handwritten annotation notes for (c): "B is the subset, A is the set".
- ✎ Q1: (a) With indistinguishable coins $\Omega=\{0,1,2,3,4\}$ (number of tails) and the event is $\{3,4\}$. These outcomes are not equally likely: with the 16 distinguishable sequences, 5 are favourable, so the probability is $5/16$. (b) $\Omega=\{0,1\}^n$ (1 = working); the event is $\{\omega:\omega_1=0,\omega_2=0,\omega_3=1\}$. (c) $\Omega=\{0,1,\dots,n\}$; the event is $\{3\}$. (d) $\Omega=\mathbb R$ (or $[-273.15,\infty)$ for the physical range); the event is $(19,\infty)$.
- ✎ Q2: $A\cup B\cup C=\{-6,-5,-4,-2,0,1,2,3\}$. (i) as stated. (ii) The complement of the union is $\{-3,-1\}$. (iii) $B^c\cap A=A\setminus B=\{-4,-2\}$, united with $C$: $\{-6,-5,-4,-2,0,2\}$. (iv) $(A\setminus B)\cup C=\{-6,-5,-4,-2,0,2\}$ — the same set as (iii), since $B^c\cap A=A\setminus B$.
- ✎ Q3: By inclusion–exclusion $|T\cup R\cup S|=513+470+407-377-308-294+241=652>600$. A union cannot contain more than the 600 respondents, so at least one number is wrong.
- ✎ Q4: (a) $0.45+0.30-0.23=0.52$. (b) $P(A\setminus B)=P(A)-P(A\cap B)$, so $P(A\cap B)=0.30=P(B)$, i.e. $B\subset A$, and $P(A\cup B)=0.45$. (c) $B\subset A$ gives $A\cup B=A$, so $0.45$. (d) Disjoint: $0.45+0.30=0.75$.
- ✎ Q5: (b) $(A\cap B)\cup(A^c\cap B)=B\cap(A\cup A^c)=B\cap\Omega=B$. (c) $A\cup(A^c\cap B)=(A\cup A^c)\cap(A\cup B)=\Omega\cap(A\cup B)=A\cup B$ (distributive law). Part (a) needs the outcome definitions given in the source.
- ✎ Q6 (new question): $|F\cup B|=18+12-5=25$, so $30-25=5$ play neither. Exactly one sport: $25-5=20$ students, probability $20/30=2/3$.
