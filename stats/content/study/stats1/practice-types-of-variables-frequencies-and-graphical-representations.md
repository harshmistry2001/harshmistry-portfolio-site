# Practice: Types of Variables, Frequencies, and Graphical Representations

> Course part: Stats 1

## Overview

This is a first-week problem set. It checks that you can (1) classify data by measurement scale, (2) turn raw data into a frequency table, (3) pick and read a suitable chart, and (4) read an empirical distribution function. Work through the questions on paper first, then compare with the solutions and the code.

## Topics to Review

- [Types of Variables and Scales](#/study/stats1/types-of-variables-and-scales)
- [Frequencies and Frequency Tables](#/study/stats1/frequencies-and-frequency-tables)
- [Graphical Representations for Discrete Variables](#/study/stats1/graphical-representations-for-discrete-variables)
- [Grouping and Histograms](#/study/stats1/grouping-and-histograms)
- [Empirical Distribution Function (EDF)](#/study/stats1/empirical-distribution-function-edf)

## How to Approach the Questions

- **Classification:** ask *is there an order?* and *is there a natural zero?* (see the scale table in the topic page). Counts are ratio-scaled; ratings such as "bad … excellent" are ordinal; clock times are interval (the zero is arbitrary).
- **Operations table:** each scale permits exactly the operations of the scale below it plus one more: nominal $=$; ordinal adds $<,>$; interval adds $+,-$; ratio adds $\times,\div$.
- **Frequency table:** count each value, divide by $n$, and check that the relative frequencies sum to 1.
- **EDF:** the number of observations equal to $x$ is the jump of $F_n$ at $x$ times $n$.

## When It's Used

This practice set combines the first week's skills: classifying scales, building a frequency table, drawing a bar chart / histogram and reading an EDF. The code below reproduces the computational parts (hotel stays, EDF counts) so you can check your hand calculations.

**Exam tip:** for the EDF question, the number of observations equal to $x$ is $n \cdot (F_n(x) - F_n(x^-))$, i.e. jump height times sample size.

## R Code

```r
# Q3: hotel stays of 50 visitors (frequencies from the solution)
stay <- rep(1:10, times = c(5, 4, 4, 6, 8, 2, 7, 6, 5, 3))
tab <- table(stay)
rbind(absolute = tab, relative = round(prop.table(tab), 2))
barplot(prop.table(tab), xlab = "nights", ylab = "relative frequency")

# (d) relative frequency of stays between 3 and 6 days
sum(prop.table(tab)[as.character(3:6)])

# Q5: EDF with n = 20: F(1) = 0.2 and F(2) = 0.3
n <- 20
c(obs_at_most_1 = 0.2 * n, obs_equal_2 = (0.3 - 0.2) * n)
```

## Python Code

```python
import numpy as np
import pandas as pd
import matplotlib.pyplot as plt

# Q3: hotel stays of 50 visitors (frequencies from the solution)
stay = pd.Series(np.repeat(np.arange(1, 11), [5, 4, 4, 6, 8, 2, 7, 6, 5, 3]))
tab = pd.DataFrame({"absolute": stay.value_counts().sort_index(),
                    "relative": stay.value_counts(normalize=True).sort_index().round(2)})
print(tab.T)
tab["relative"].plot.bar(rot=0, xlabel="nights", ylabel="relative frequency")
plt.show()

# (d) relative frequency of stays between 3 and 6 days
print(stay.between(3, 6).mean())

# Q5: EDF with n = 20: F(1) = 0.2 and F(2) = 0.3
n = 20
print("obs <= 1:", 0.2 * n, " obs == 2:", round((0.3 - 0.2) * n))
```

## Practice Questions

*◆ original question from the course material · ✎ new question added for this site (worked solution below)*

- ◆ [practice sheet] Classify the following data as nominal, ordinal, interval or ratio.
  - (a) The ice cream flavour preferred by each of 35 randomly selected customers.
  - (b) The number of students out of 40 registered that are actually attending the lecture.
  - (c) The rating of a streaming service provided by 50 users. The possible ratings are: bad, fairly bad, fairly good, good, excellent.
  - (d) The departure times of the $16^{00}{:}16^{45}$ flights from Frankfurt airport on 10 working days.
  - (e) A sample of 100 people holding a public library card has been classified according to the numbers of books borrowed in a month: [0, 5], [6, 15], [15, 34], [35, 50].
- ◆ [practice sheet] Complete the following table with yes or no. Interpretation: for two outcomes a and b of nominal / ordinal / interval scaled / ratio scaled data, does it make sense to create statements a=b, a<b, a≤b, a>b, a≥b or to look at a+b, a−b, a×b, a÷b?
- ◆ [practice sheet] The length of stay in a hotel for 50 visitors during the summer was registered. (Data provided in source).
  - (a) Is this data nominal, ordinal, interval or ratio?
  - (b) Display the data in a frequency table.
  - (c) Present the data in an appropriate bar chart.
  - (d) What is the relative frequency of entries between 3 and 6 days of stay in the hotel?
- ◆ [practice sheet] The temperatures in degree Celsius registered for month April in a city are given. Create a histogram from the data.
- ◆ [practice sheet] Which of the three plots could show empirical distribution functions? Assume that the data sets corresponding to the empirical distribution function have a sample size of $n=20$. How many observations are there with $x_i=1$? How many are there with $x_i=2$?
- ✎ A survey records for each respondent (a) the postal code, (b) the monthly net income in EUR, (c) the highest school degree (none, secondary, high school, university), (d) the number of cars in the household. Classify each variable by scale.

## Solutions

*◆ original solution from the course material · ✎ solution written for this site*

- ◆ Q1: (a) Nominal (b) Ratio (c) Ordinal (d) Interval (e) Ordinal.
- ◆ Q2: Nominal: = (yes), others (no). Ordinal: =, <, > (yes), +, -, x, / (no). Interval: =, <, >, +, - (yes), x, / (no). Ratio: All operations allowed (yes).
- ◆ Q3: (a) Ratio. (b) Absolute frequencies: 1:5, 2:4, 3:4, 4:6, 5:8, 6:2, 7:7, 8:6, 9:5, 10:3. Relative frequencies: 0.1, 0.08, 0.08, 0.12, 0.16, 0.04, 0.14, 0.12, 0.1, 0.06.
- ◆ Q5: Plot 2 represents a valid EDF. $F_{20}(1) = \frac{\text{no. of obs} \le 1}{20} = \frac{4}{20} = 0.2$ (4 observations). $F_{20}(2) = \frac{6}{20} = 0.3$ (6 observations).
- ✎ Q3 (c), (d): A bar chart of the relative frequencies of the ten possible stay lengths (bars separated, since the variable is discrete). The relative frequency of stays between 3 and 6 days is $0.08+0.12+0.16+0.04=0.40$ (that is $20$ of the 50 guests).
- ✎ Q4: Choose bins of equal width (for example 4 degrees, as in the next problem set), count the temperatures per bin, divide by $n$ and by the bin width to get the heights, and draw the bars without gaps.
- ✎ Q6 (new question): (a) postal code: nominal (it is a label, even though it looks numeric); (b) net income: ratio; (c) degree: ordinal; (d) number of cars: ratio (discrete).
