# Types of Data and Measurement Scales

## Overview

Before analysing any data, ask what kind of information each column holds: a label, a ranking, a count or a measurement. The answer decides which averages, charts and tests are legitimate. This page gives a simple checklist for classifying variables.

## Concept

Every variable in a dataset has a **type** and a **[measurement scale](https://en.wikipedia.org/wiki/Level_of_measurement)**, and these decide which summaries, charts and tests are meaningful. Getting this wrong is the most common source of nonsense statistics — an "average zip code" or a "mean satisfaction of 3.7 on a 5-point scale" treated as if the steps were equal.

### Qualitative vs. quantitative

- **Qualitative (categorical)** variables place observations into groups: payment method, country, blood type, satisfaction level.
- **Quantitative (numerical)** variables are measured as numbers where arithmetic has meaning: price, weight, number of children, temperature.

Quantitative variables are further split into:

- **Discrete** — countable values, usually integers: number of defects, website visits, claims per policy.
- **Continuous** — any value in an interval (limited only by measurement precision): time, weight, income.

### The four scales (Stevens' hierarchy)

| Scale | What is meaningful | Examples | Typical location measure |
|---|---|---|---|
| Nominal | equality ($=$, $\ne$) | colour, brand, region | mode |
| Ordinal | + order ($<$, $>$) | rating, education level, ranking | median |
| Interval | + differences ($-$) | °C, calendar year, IQ | mean |
| Ratio | + ratios ($\div$), true zero | income, height, duration | mean, geometric mean |

Each scale inherits all the operations of the scales above it. The key questions are:

1. *Is there a natural order?* No → nominal.
2. *Are the distances between values equal and meaningful?* No → ordinal.
3. *Is there a true zero, meaning "none of the quantity"?* No → interval. Yes → ratio.

20 °C is not "twice as warm" as 10 °C because 0 °C is an arbitrary point (interval), but 20 kg is twice 10 kg (ratio). In [Kelvin](https://en.wikipedia.org/wiki/Kelvin), temperature becomes ratio-scaled.

### Other distinctions you will meet

- **Binary / dichotomous** variables have exactly two categories (churned yes/no); they are often coded 0/1, which makes their mean a proportion.
- **Identifiers** (customer ID, zip code) are nominal even though they look numeric.
- **Grouped data** (age bands 18–24, 25–34, …) turn a ratio variable into an ordinal one and lose information.
- **[Likert items](https://en.wikipedia.org/wiki/Likert_scale)** (strongly disagree … strongly agree) are ordinal; sums of many Likert items are often *treated* as interval, which is a modelling assumption, not a fact.

### Why it matters downstream

| Task | Nominal | Ordinal | Interval / Ratio |
|---|---|---|---|
| Chart | bar, pie | bar (kept in order) | histogram, box plot |
| Correlation | [Cramér's V](https://en.wikipedia.org/wiki/Cram%C3%A9r's_V) | Spearman, Kendall | Pearson |
| Two-group test | $\chi^2$ | [Mann-Whitney](https://en.wikipedia.org/wiki/Mann%E2%80%93Whitney_U_test) | t-test |
| Regression response | multinomial logit | ordinal logit | linear regression |

## Common Mistakes

- Treating numeric-looking codes (zip codes, customer IDs, 1 = red / 2 = blue) as numbers and averaging them.
- Computing ratios ("twice as warm") for interval variables such as °C or calendar years.
- Assuming that the steps of a rating scale are equal and then reporting a mean without saying so.

## When It's Used

Classifying variables is the first step of every analysis project: designing a survey questionnaire, cleaning a CRM export, setting up a data dictionary for a data warehouse, or choosing the right statistical test for a thesis. Data engineers encode the scale in the column types (categorical, ordered categorical, numeric) so that downstream tools cannot compute meaningless averages. Analysts use it to pick charts and tests; machine-learning engineers use it to choose encodings (one-hot for nominal, ordinal encoding for ordered categories, scaling for numeric features).

## R Code

```r
# A small customer dataset with every kind of variable
customers <- data.frame(
  id           = c("C001", "C002", "C003", "C004", "C005", "C006"),        # identifier (nominal)
  region       = factor(c("North", "South", "South", "East", "North", "West")),   # nominal
  plan         = factor(c("basic", "premium", "standard", "basic", "premium", "standard"),
                        levels = c("basic", "standard", "premium"), ordered = TRUE),  # ordinal
  satisfaction = factor(c(4, 5, 3, 2, 5, 4), levels = 1:5, ordered = TRUE),   # ordinal (Likert)
  signup_year  = c(2019L, 2021L, 2020L, 2022L, 2018L, 2021L),                 # interval
  monthly_fee  = c(9.99, 29.99, 19.99, 9.99, 29.99, 19.99),                  # ratio, continuous
  support_calls = c(0L, 3L, 1L, 5L, 0L, 2L),                                 # ratio, discrete
  churned      = c(FALSE, FALSE, TRUE, TRUE, FALSE, FALSE)                    # binary
)
str(customers)

# Pick summaries that respect the scale
scale_summary <- function(x) {
  if (is.ordered(x)) {
    c(type = "ordinal", median = as.character(levels(x)[median(as.integer(x))]))
  } else if (is.factor(x) || is.character(x) || is.logical(x)) {
    tab <- table(x)
    c(type = "nominal", mode = names(tab)[which.max(tab)])
  } else {
    c(type = "numeric", mean = format(round(mean(x), 2)), sd = format(round(sd(x), 2)))
  }
}
t(sapply(customers[-1], scale_summary))

# Ordinal: order comparisons work, arithmetic does not
customers$plan >= "standard"
max(customers$plan)

# Binary coded 0/1: the mean is a proportion
mean(customers$churned)

# Interval vs ratio
diff(range(customers$signup_year))                           # differences: fine
customers$monthly_fee[2] / customers$monthly_fee[1]          # ratios: fine for ratio scale only

# Binning a ratio variable produces an ordinal variable (information is lost)
cut(customers$monthly_fee, breaks = c(0, 10, 20, 30), labels = c("low", "mid", "high"),
    ordered_result = TRUE)
```

## Python Code

```python
import pandas as pd

customers = pd.DataFrame({
    "id": ["C001", "C002", "C003", "C004", "C005", "C006"],
    "region": pd.Categorical(["North", "South", "South", "East", "North", "West"]),
    "plan": pd.Categorical(["basic", "premium", "standard", "basic", "premium", "standard"],
                           categories=["basic", "standard", "premium"], ordered=True),
    "satisfaction": pd.Categorical([4, 5, 3, 2, 5, 4], categories=[1, 2, 3, 4, 5], ordered=True),
    "signup_year": [2019, 2021, 2020, 2022, 2018, 2021],
    "monthly_fee": [9.99, 29.99, 19.99, 9.99, 29.99, 19.99],
    "support_calls": [0, 3, 1, 5, 0, 2],
    "churned": [False, False, True, True, False, False],
})
print(customers.dtypes)


def scale_summary(s: pd.Series) -> dict:
    """Return a location summary that respects the measurement scale."""
    if isinstance(s.dtype, pd.CategoricalDtype) and s.cat.ordered:
        codes = s.cat.codes
        return {"type": "ordinal", "median": s.cat.categories[int(codes.median())]}
    if isinstance(s.dtype, pd.CategoricalDtype) or s.dtype in (object, bool):
        return {"type": "nominal", "mode": s.mode().iloc[0]}
    return {"type": "numeric", "mean": round(s.mean(), 2), "sd": round(s.std(), 2)}


print(pd.DataFrame({c: scale_summary(customers[c]) for c in customers.columns[1:]}).T)

# Ordinal comparisons
print(customers["plan"] >= "standard")
print(customers["plan"].max())

# Binary mean = proportion
print("churn rate:", customers["churned"].mean())

# Binning ratio -> ordinal
print(pd.cut(customers["monthly_fee"], bins=[0, 10, 20, 30], labels=["low", "mid", "high"]))

# Encodings for machine learning
print(pd.get_dummies(customers["region"], prefix="region"))          # nominal: one-hot
print(customers["plan"].cat.codes)                                   # ordinal: integer codes
```

## Software Shortcuts

- **Excel:** there is no column type for scales — keep a data dictionary sheet. Use `=COUNTIF(range, "North")` for nominal counts, `=MEDIAN()` on numeric codes for ordinal data, `=AVERAGE()` only for interval/ratio columns. Data → Data Validation → List enforces valid categories on entry.
- **SPSS:** Variable View → **Measure** column (Nominal / Ordinal / Scale) and **Values** column for value labels. SPSS uses the Measure setting to decide which charts and tests it offers.
- **Stata:** `describe`, `codebook varname`; store categories as labelled integers with `label define` / `label values`; `encode strvar, gen(numvar)` turns strings into labelled categories.
- **Google Sheets:** Data → Data validation → Dropdown for categorical columns; Format → Number for numeric ones.
- **Power BI / Tableau:** set the *data category* and *default summarization* (e.g. "Do not summarize" for IDs and years) so dashboards never sum a zip code.

## Industry Examples

**Retail banking — credit application data.** A bank's loan-application table mixes all scales: `employment_type` (nominal), `credit_grade` A–E (ordinal), `application_year` (interval) and `annual_income`, `loan_amount`, `months_employed` (ratio). The modelling team one-hot encodes employment type, maps credit grade to ordered integers 1–5, and log-transforms income. A past model that treated the numeric branch code as continuous produced a spurious "branch effect" gradient; recoding it as nominal removed the artefact and improved out-of-sample AUC.

**Healthcare — patient-reported outcomes.** A hospital collects pain scores (0–10 numeric rating scale), a 5-level mobility question and diagnosis codes (ICD-10, nominal). Clinical statisticians report *median* pain and use Wilcoxon tests because the rating steps are not guaranteed equal, while length of stay (ratio) is summarised with mean and a log-normal model. Diagnosis codes are grouped into chapters to keep the number of categories manageable.

**E-commerce — product analytics.** An online shop's event log has `device` (nominal), `star_rating` 1–5 (ordinal), `order_value` (ratio, continuous) and `items_in_cart` (ratio, discrete). Dashboards show the *distribution* of star ratings rather than only the average, because a mean of 3.0 can hide a polarised split of 1-star and 5-star reviews — the signal the product team actually needs.

## Practice Questions

*✎ new question added for this site (worked solution below)*

- ✎ Classify each variable by scale (nominal, ordinal, interval, ratio): (a) postal code, (b) body temperature in °C, (c) number of complaints per month, (d) highest degree (primary, secondary, tertiary).
- ✎ 200 customers rate two stores on a 5-point satisfaction scale. Which test would you use to compare the stores, and why is it questionable to use a t-test?

## Solutions

*✎ solution written for this site*

- ✎ Q1: (a) nominal (a label, even though it looks numeric); (b) interval (arbitrary zero); (c) ratio (a count with a true zero); (d) ordinal (ordered, but the steps are not equal).
- ✎ Q2: The ratings are ordinal, so the Mann-Whitney U test (rank based) is the natural choice. A t-test compares means and assumes that the distances between rating levels are equal and meaningful; this is a modelling assumption for Likert items, not a fact.
