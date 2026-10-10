# Practice: Measures of Location, Dispersion, and Boxplots

> Course part: Stats 1

## Overview

A mixed problem set on summarising a data set with numbers: measures of location (mean, median, mode, geometric and pooled means), measures of dispersion (variance, standard deviation, range, IQR), quantiles, box plots, and what happens to all of them under linear transformations or when an outlier is removed. Several questions have no data in the text; the code reproduces those with the course values.

## Topics to Review

- [Mode](#/study/stats1/mode), [Median](#/study/stats1/median), [Arithmetic Mean](#/study/stats1/arithmetic-mean), [Geometric Mean](#/study/stats1/geometric-mean), [Pooled Mean](#/study/stats1/pooled-mean)
- [Measures of Dispersion](#/study/stats1/measures-of-dispersion), [Coefficient of Variation](#/study/stats1/coefficient-of-variation)
- [Empirical a-Quantile and Box Plots](#/study/stats1/empirical-a-quantile-and-box-plots)
- [Empirical Distribution Function (EDF)](#/study/stats1/empirical-distribution-function-edf)

## How to Approach the Questions

- **Choose the measure by scale:** the mean needs metric data, the median needs at least ordinal data, the mode works for everything.
- **Transformations:** for $y=a+bx$: mean, median and quantiles transform as $a+b\cdot(\cdot)$; standard deviation, range and IQR are multiplied by $|b|$; the variance by $b^2$.
- **Quantiles:** use the course definition. If $n\alpha$ is an integer, average $x_{(n\alpha)}$ and $x_{(n\alpha+1)}$; otherwise take $x_{(\lfloor n\alpha\rfloor+1)}$.
- **Mary problem:** write the equations for the two team means before and after the move and look for a salary that lies between the two team means.

## When It's Used

This practice set drills every location and dispersion measure plus box plots and the effect of transformations. The code checks the computational parts: quartiles and box plot of the $n=16$ data, Squaretown widths and areas, the costs-to-revenue transformation and the S&P 500 prices (variance, range, IQR, EDF, quantiles, outlier removal).

**Exam tip:** under $r = 5c + 1500$: mean and median become $5\cdot + 1500$, standard deviation and range are only multiplied by 5.

## R Code

```r
q2 <- function(x, p) quantile(x, p, type = 2, names = FALSE)   # course quantile definition

# Q3: quartiles and box plot (n = 16)
x <- c(-2, 8, 11, 21, 22, 24, 24, 25, 25, 26, 28, 29, 30, 32, 39, 42)
q2(x, c(0.25, 0.5, 0.75))
boxplot(x, horizontal = TRUE)

# Q4: Squaretown storefront widths and base areas (depth = 2.5 * width)
w <- c(5.4, 6.5, 13.2, 4.1, 7.5, 5.4, 6.3, 6.7, 7.3)
c(median = median(w), mean = mean(w))
area <- w * 2.5 * w
c(median = median(area), mean = mean(area))

# Q6: costs -> revenue r = 5c + 1500
c(mean = 5 * 3400 + 1500, median = 5 * 3600 + 1500, sd = 5 * 6500, range = 5 * 8400)

# Q8: S&P 500 closing prices (scaled)
p <- c(55.9, 57.1, 48.9, 45.5, 56.1, 31.8, 56.3, 47.2, 47.2, 40.8)
c(var = var(p), range = diff(range(p)), IQR = diff(q2(p, c(0.25, 0.75))))
ecdf(p)(c(30, 47.2, 56, 58))
q2(p, c(0.30, 0.87))
p_clean <- p[p != min(p)]                     # remove the outlier 31.8
c(var = var(p_clean), range = diff(range(p_clean)), IQR = diff(q2(p_clean, c(0.25, 0.75))))
```

## Python Code

```python
import numpy as np

def q2(x, p):
    return np.quantile(x, p, method="averaged_inverted_cdf")   # course definition

# Q3: quartiles (n = 16)
x = np.array([-2, 8, 11, 21, 22, 24, 24, 25, 25, 26, 28, 29, 30, 32, 39, 42])
print("quartiles:", q2(x, [0.25, 0.5, 0.75]))

# Q4: Squaretown
w = np.array([5.4, 6.5, 13.2, 4.1, 7.5, 5.4, 6.3, 6.7, 7.3])
area = w * 2.5 * w
print("width  median/mean:", np.median(w), round(w.mean(), 3))
print("area   median/mean:", np.median(area), round(area.mean(), 3))

# Q6: costs -> revenue r = 5c + 1500
print(dict(mean=5 * 3400 + 1500, median=5 * 3600 + 1500, sd=5 * 6500, range=5 * 8400))

# Q8: S&P 500 closing prices (scaled)
p = np.array([55.9, 57.1, 48.9, 45.5, 56.1, 31.8, 56.3, 47.2, 47.2, 40.8])
print("var, range, IQR:", p.var(ddof=1), np.ptp(p), np.subtract(*q2(p, [0.75, 0.25])))
print("EDF:", [np.mean(p <= t) for t in (30, 47.2, 56, 58)])
print("30% and 87% quantiles:", q2(p, [0.30, 0.87]))
pc = p[p != p.min()]
print("without outlier:", pc.var(ddof=1), np.ptp(pc), np.subtract(*q2(pc, [0.75, 0.25])))
```

## Practice Questions

*◆ original question from the course material · ✎ new question added for this site (worked solution below)*

- ◆ [practice sheet] Consider again Problem 4 from Exercise Sheet 1 (Histogram of temperatures).
  - (a) Look at the histogram with bin length 4 and starting at 2. Find the mode of the bins and describe the skewness of the distribution. Based on the histogram, do you expect the mean or the median to be larger or are they approximately the same?
  - (b) Derive both mean and median from the data set in Problem 4.
- ◆ [practice sheet] 30 people answered a questionnaire about their experience shopping online: 7 not satisfied, 6 fairly dissatisfied, 6 neutral, 4 fairly satisfied, 7 satisfied.
  - (a) Classify the type of data.
  - (b) Based on the outcome of (a), which measures of location are suitable for this kind of data: arithmetic mean, geometric mean, median or mode?
  - (c) Derive the values of the measures of location that you identified in (b) for the observations at hand. Which one is most meaningful in this particular example?
- ◆ [practice sheet] Determine the empirical median and upper and lower quartiles for the following data points and build the corresponding boxplot: -2, 8, 11, 21, 22, 24, 24, 25, 25, 26, 28, 29, 30, 32, 39, 42 ($n=16$).
- ◆ [practice sheet] In the small city of Squaretown the shopping street has nine shops with the following widths of their storefronts in meters: 5.4, 6.5, 13.2, 4.1, 7.5, 5.4, 6.3, 6.7, 7.3.
  - (a) Find both median and mean of the storefront widths.
  - (b) All shops in Squaretown have a rectangle base area, with a depth 2.5 times larger than its width. Find both the median and mean of the base area of the nine shops in $m^2$.
- ◆ [practice sheet] The lifetimes (in minutes) of a random sample of 12 laptop batteries are given.
  - (a) Calculate the sample mean, the median, the quartiles, the variance and standard deviation of the data.
  - (b) Replacing the battery will double the laptop lifetime. Determine the sample mean and variance of the laptops lifetimes with the new batteries.
- ◆ [practice sheet] Let $\{c_1, c_2, \ldots, c_{24}\}$ be the production costs of a company in a year. The sample mean was 3400, the sample median was 3600, the sample standard deviation was 6500 and the range was 8400. The relationship between cost and revenue is given by $r_i = 5c_i + 1500$. Find the sample mean, median, standard deviation and the range of the revenues.
- ◆ [practice sheet] Mary works in a team of four employees, where the mean salary of all four team members is 4500 Euros per month. Now, Mary gets promoted and will soon work in a new team but her salary stays the same. Before Mary joined her new team, it consisted of three members and their average salary was 5500 Euros per month. Give possible values for the salaries of Mary and the six co-workers in her old and new team, such that after the promotion of Mary both teams have a lower mean salary than before Mary's promotion.
- ◆ [practice sheet] The closing stock prices (USD/stock), scaled by 100, of S&P 500 over some days in February 2024 are reported: 55.9, 57.1, 48.9, 45.5, 56.1, 31.8, 56.3, 47.2, 47.2, 40.8.
  - (a) Compute the sample variance, range and interquartile range.
  - (b) Evaluate the empirical distribution function $F_{20}(x)$ for $x = 30, 47.2, 56, 58$.
  - (c) Compute the 30%-quantile and the 87%-quantile of the data.
  - (d) Remove an outlier from the data and recalculate the location and dispersion measures from part (a). What would be the point of removing the outlier?
- ✎ The delivery times (minutes) of seven orders are 12, 15, 15, 18, 20, 22, 60. Compute mean, median and mode and say which is the best summary of a typical delivery.

## Solutions

*✎ solution written for this site*

*Solutions to the original questions below were written for this site (the course supplied none). Questions that depend on data tables missing from the text (1(b), 5, and the histogram in 1) are answered by method only.*

- ✎ Q1: (a) The mode of the bins is the tallest bar; if the histogram has a longer right tail it is right-skewed and the mean is larger than the median (the reverse for a longer left tail). (b) Sort the temperatures; the median is the middle value (or the mean of the two middle values) and the mean is the sum divided by $n$.
- ✎ Q2: (a) The ratings are ordinal. (b) Median and mode are suitable; the arithmetic and geometric mean need metric data. (c) The 30 answers in order are: 7 "not satisfied", 6 "fairly dissatisfied", 6 "neutral", 4 "fairly satisfied", 7 "satisfied". The median is the average of the 15th and 16th values. Cumulatively 7, 13, 19, so both are "neutral", and the median is **neutral**. The mode is not unique: "not satisfied" and "satisfied" both occur 7 times (bimodal). The median is the more meaningful summary here, because the bimodal mode does not describe a typical customer.
- ✎ Q3: $n=16$. $n\cdot\frac14=4$, so $x_{1/4}=\frac12(x_{(4)}+x_{(5)})=\frac{21+22}{2}=21.5$. $n\cdot\frac12=8$: $x_{1/2}=\frac{25+25}{2}=25$. $n\cdot\frac34=12$: $x_{3/4}=\frac{29+30}{2}=29.5$. $IQR=8$, fences $21.5-12=9.5$ and $29.5+12=41.5$. The values $-2$ and $8$ (below 9.5) and $42$ (above 41.5) are plotted as outliers; the whiskers end at 11 and 39.
- ✎ Q4: (a) Sorted widths: 4.1, 5.4, 5.4, 6.3, 6.5, 6.7, 7.3, 7.5, 13.2. Median $=6.5$ m, mean $=62.4/9\approx6.93$ m. (b) The area is $2.5\,w^2$. Median area $=2.5\cdot6.5^2\approx105.6\ m^2$ (monotone transformation). Mean area $=\frac{2.5}{9}\sum w_i^2\approx134.9\ m^2$, which is *not* $2.5\cdot6.93^2\approx120.2$.
- ✎ Q5: (a) Order the 12 lifetimes; the median is the mean of the 6th and 7th value, and the quartiles use $n\alpha=3$ and $9$ (both integers), i.e. $x_{1/4}=\frac12(x_{(3)}+x_{(4)})$ and $x_{3/4}=\frac12(x_{(9)}+x_{(10)})$. (b) Doubling every lifetime ($y=2x$) doubles the mean and multiplies the variance by 4.
- ✎ Q6: Mean $=5\cdot3400+1500=18500$; median $=5\cdot3600+1500=19500$; standard deviation $=5\cdot6500=32500$; range $=5\cdot8400=42000$.
- ✎ Q7: Mary earns $m$, her old team (4 people, mean 4500, total 18000) and her new team (3 people, mean 5500, total 16500). After the move the old team has mean $\frac{18000-m}{3}$, which is below 4500 iff $m>4500$; the new team has mean $\frac{16500+m}{4}$, which is below 5500 iff $m<5500$. So any $4500<m<5500$ works. Example: Mary earns 5000; her old colleagues earn 4000, 4500, 4500 (new mean $13000/3\approx4333$); her new colleagues earn 5000, 5500, 6000 (new mean $21500/4=5375$). Both team means fall though no salary changed.
- ✎ Q8: Sorted prices: 31.8, 40.8, 45.5, 47.2, 47.2, 48.9, 55.9, 56.1, 56.3, 57.1 ($n=10$). (a) $s^2\approx66.41$, range $=25.3$, quartiles $45.5$ and $56.1$ so $IQR=10.6$. (b) The sample has $n=10$ observations, so the EDF is $F_{10}$: $F(30)=0$, $F(47.2)=0.5$, $F(56)=0.7$, $F(58)=1$. (c) $n\cdot0.3=3$ is an integer: $x_{0.3}=\frac{45.5+47.2}{2}=46.35$; $n\cdot0.87=8.7$ is not: $x_{0.87}=x_{(9)}=56.3$. (d) The smallest value 31.8 is far from the rest. Without it ($n=9$): mean rises from 48.68 to 50.56, median from 48.05 to 48.9, $s^2$ falls from 66.4 to 35.1, range from 25.3 to 16.3 and $IQR$ from 10.6 to 8.9. The point of removing an outlier is to see how much the summary depends on one atypical value; it must only be removed if there is a substantive reason (such as a recording error), not merely to improve the numbers.
- ✎ Q9 (new question): Mean $=\frac{162}{7}\approx23.1$, median $=18$, mode $=15$. The 60-minute order inflates the mean; the median (18 min) is the best summary of a typical delivery.
