# PCA and Multivariate Analysis

## Overview

When there are many correlated variables, multivariate methods find a few new variables that capture most of the information. Principal component analysis (PCA) builds uncorrelated combinations ranked by variance; clustering groups similar observations; factor analysis looks for hidden factors behind questionnaire items. Always standardise variables measured in different units first.

## Concept

Multivariate methods analyse many variables **jointly**, exploiting their correlations to reduce dimension, discover structure or group observations.

### Multivariate basics

- A vector of $p$ variables has a **mean vector** $\boldsymbol\mu$ and a $p \times p$ **covariance matrix** $\boldsymbol\Sigma$ (variances on the diagonal, covariances off it); the **correlation matrix** is its standardised version.
- The **multivariate normal** distribution is the reference model; its density contours are ellipses.
- **[Mahalanobis distance](https://en.wikipedia.org/wiki/Mahalanobis_distance)** $d^2 = (\mathbf x - \boldsymbol\mu)^\top\boldsymbol\Sigma^{-1}(\mathbf x - \boldsymbol\mu)$ measures how unusual a point is given the correlations — the basis of multivariate outlier detection.

### Principal component analysis (PCA)

[PCA](https://en.wikipedia.org/wiki/Principal_component_analysis) finds new, uncorrelated variables — **principal components** — that are linear combinations of the originals, ordered by the variance they explain.

- The components are the **[eigenvectors](https://en.wikipedia.org/wiki/Eigenvalues_and_eigenvectors)** of the covariance (or correlation) matrix; the eigenvalues $\lambda_1 \ge \lambda_2 \ge \dots$ are their variances. Equivalently, PCA is the [singular value decomposition](https://en.wikipedia.org/wiki/Singular_value_decomposition) of the centred data matrix.
- **Loadings** — the weights of each original variable in a component; they show what a component "means".
- **Scores** — the observations' coordinates on the components.
- **Proportion of variance explained** by component $j$: $\lambda_j / \sum_i \lambda_i$.
- **Standardise** variables (use the correlation matrix) when they are on different scales — otherwise the variable with the largest variance dominates.
- How many components? Scree plot elbow, cumulative variance (e.g. 80–90%), Kaiser's rule (eigenvalue > 1 on standardised data), or cross-validation.
- PCA is unsupervised: the components with most variance are not necessarily the most predictive of an outcome.

### Related methods

| Method | Purpose |
|---|---|
| **[Factor analysis](https://en.wikipedia.org/wiki/Factor_analysis)** | model observed variables as driven by a few latent factors plus unique error (questionnaires, psychometrics); rotations (varimax) aid interpretation |
| **Cluster analysis** — [k-means](https://en.wikipedia.org/wiki/K-means_clustering), hierarchical, Gaussian mixtures | group similar observations (customer segments); k-means needs standardised data and a chosen $k$ (elbow, silhouette) |
| **Discriminant analysis (LDA)** | classify observations into known groups using linear combinations that best separate them |
| **[MANOVA](https://en.wikipedia.org/wiki/Multivariate_analysis_of_variance)** | test group differences on several outcomes at once (Hotelling's $T^2$ for two groups) |
| **Canonical correlation** | relationships between two sets of variables |
| **Multidimensional scaling, t-SNE, UMAP** | low-dimensional maps for visualisation |

### Practical workflow for segmentation

1. Select meaningful variables; handle skew (logs) and outliers. 2. Standardise. 3. Optionally reduce with PCA to remove redundancy. 4. Cluster (try several $k$). 5. **Profile** clusters on the original variables and on outcomes not used for clustering. 6. Check stability (re-run on subsamples).

## Common Mistakes

- Running PCA on variables with very different units without standardising: the variable with the largest variance dominates.
- Assuming that the components with the most variance are the most useful for predicting an outcome.
- Interpreting clusters as real groups without checking their stability and profiling them on other variables.

## When It's Used

PCA and multivariate methods are used for customer segmentation, building composite indices (socio-economic status, well-being, ESG scores), questionnaire and scale development (factor analysis), yield-curve modelling in finance (level, slope, curvature factors), image and signal compression, quality control of multi-sensor processes, genomics (population structure), and as a pre-processing step to decorrelate predictors before regression or machine learning.

## R Code

```r
set.seed(40)
n <- 600
# Customer behaviour: three latent segments
segment <- sample(1:3, n, TRUE, prob = c(.5, .3, .2))
centres <- rbind(c(4, 2, 30, 1, 0.10),       # occasional shoppers
                 c(12, 6, 55, 3, 0.35),      # loyal families
                 c(6, 1, 140, 2, 0.05))      # premium, low frequency
colnames(centres) <- c("visits", "categories", "basket", "returns", "promo_share")
X <- centres[segment, ] + cbind(rnorm(n, 0, 2), rnorm(n, 0, 1.2), rnorm(n, 0, 12),
                                rnorm(n, 0, 0.8), rnorm(n, 0, 0.05))
X <- as.data.frame(pmax(X, 0))
round(cor(X), 2)

# PCA on standardised variables
pca <- prcomp(X, scale. = TRUE)
summary(pca)                                     # variance explained
round(pca$rotation[, 1:3], 3)                    # loadings
screeplot(pca, type = "lines", main = "Scree plot")
biplot(pca, cex = 0.5, xlabs = rep(".", n))

# Eigen-decomposition of the correlation matrix gives the same components
e <- eigen(cor(X))
round(e$values, 3); round(pca$sdev^2, 3)

# k-means on standardised data: choose k by total within-cluster SS (elbow)
Z <- scale(X)
wss <- sapply(1:8, function(k) kmeans(Z, centers = k, nstart = 25)$tot.withinss)
plot(1:8, wss, type = "b", xlab = "k", ylab = "within-cluster SS", main = "Elbow")
km <- kmeans(Z, centers = 3, nstart = 25)

# Profile the clusters on the original scale
aggregate(X, by = list(cluster = km$cluster), FUN = function(v) round(mean(v), 2))
table(true = segment, cluster = km$cluster)      # agreement with the simulated truth

plot(pca$x[, 1:2], col = km$cluster, pch = 19, cex = 0.6, main = "Clusters on the first two PCs")

# Mahalanobis distance for multivariate outliers
d2 <- mahalanobis(X, colMeans(X), cov(X))
which(d2 > qchisq(0.999, df = ncol(X)))

# Hierarchical clustering (Ward) on a subsample
hc <- hclust(dist(Z[1:80, ]), method = "ward.D2")
plot(hc, labels = FALSE, main = "Ward dendrogram")
```

## Python Code

```python
import numpy as np
import pandas as pd
import matplotlib.pyplot as plt
from scipy import stats
from scipy.cluster.hierarchy import linkage, dendrogram
from sklearn.preprocessing import StandardScaler
from sklearn.decomposition import PCA
from sklearn.cluster import KMeans
from sklearn.metrics import silhouette_score

rng = np.random.default_rng(40)
n = 600
segment = rng.choice([0, 1, 2], n, p=[.5, .3, .2])
centres = np.array([[4, 2, 30, 1, 0.10], [12, 6, 55, 3, 0.35], [6, 1, 140, 2, 0.05]])
X = centres[segment] + rng.normal(0, [2, 1.2, 12, 0.8, 0.05], size=(n, 5))
X = pd.DataFrame(np.maximum(X, 0), columns=["visits", "categories", "basket", "returns", "promo_share"])
print(X.corr().round(2))

Z = StandardScaler().fit_transform(X)
pca = PCA().fit(Z)
print("explained variance ratio:", pca.explained_variance_ratio_.round(3))
loadings = pd.DataFrame(pca.components_.T[:, :3], index=X.columns, columns=["PC1", "PC2", "PC3"])
print(loadings.round(3))
scores = pca.transform(Z)

plt.plot(range(1, 6), pca.explained_variance_, "o-"); plt.title("Scree plot"); plt.show()

inertia = [KMeans(k, n_init=25, random_state=0).fit(Z).inertia_ for k in range(1, 9)]
sil = {k: silhouette_score(Z, KMeans(k, n_init=25, random_state=0).fit_predict(Z)) for k in range(2, 7)}
print("silhouette:", {k: round(v, 3) for k, v in sil.items()})

km = KMeans(3, n_init=25, random_state=0).fit(Z)
X["cluster"] = km.labels_
print(X.groupby("cluster").mean().round(2))
print(pd.crosstab(segment, km.labels_, rownames=["true"], colnames=["cluster"]))

plt.scatter(scores[:, 0], scores[:, 1], c=km.labels_, s=8); plt.title("Clusters on PC1/PC2"); plt.show()

Xv = X.drop(columns="cluster").values
diff = Xv - Xv.mean(axis=0)
d2 = np.einsum("ij,jk,ik->i", diff, np.linalg.inv(np.cov(Xv, rowvar=False)), diff)
print("multivariate outliers:", np.where(d2 > stats.chi2.ppf(0.999, 5))[0])

dendrogram(linkage(Z[:80], method="ward"), no_labels=True); plt.title("Ward dendrogram"); plt.show()
```

## Software Shortcuts

- **Excel:** no PCA tool; compute the correlation matrix with Data → Data Analysis → **Correlation**, then eigenvectors require an add-in (XLSTAT, Real Statistics) or iterative matrix formulas. k-means can be built with Solver but is impractical beyond small examples.
- **SPSS:** Analyze → Dimension Reduction → **Factor** (Extraction → *Principal components*, Scree plot; Rotation → Varimax; Scores → Save as variables); Analyze → Classify → **K-Means Cluster**, **Hierarchical Cluster**, **TwoStep Cluster**; Analyze → Classify → **Discriminant**; Analyze → General Linear Model → **Multivariate** for MANOVA.
- **Stata:** `pca visits categories basket returns promo_share`, `screeplot`, `loadingplot`, `predict pc1 pc2, score`; `factor ..., pcf` + `rotate, varimax`; `cluster kmeans ..., k(3)`, `cluster wardslinkage`, `cluster dendrogram`; `manova`, `discrim lda`.
- **Google Sheets:** correlation matrix with `=CORREL()`; clustering and PCA need add-ons or export to R/Python.

## Industry Examples

**Retail — customer segmentation.** A department-store chain clusters 1.2 million loyalty-card holders on 14 behavioural variables (visit frequency, basket size, category breadth, promotion share, online share, returns). After log-transforming and standardising, PCA reduces the variables to 5 components (82% of variance) and k-means yields six segments. Profiling on variables *not* used for clustering — margin and churn — shows the "promotion-driven" segment has the lowest margin, so marketing shifts it from blanket discounts to personalised offers.

**Fixed income — yield-curve factors.** A bank's treasury runs PCA on daily changes of government bond yields at 10 maturities. Three components explain about 98% of the variance and are interpreted as **level** (all yields move together), **slope** (short vs. long) and **curvature**. Interest-rate risk limits and hedges are then set against these three factors instead of ten correlated rates — a standard practice in rates desks and asset-liability management.

**Development economics — wealth index.** Household surveys in low-income countries rarely measure income reliably, so analysts build an asset-based wealth index: the first principal component of indicators such as electricity, water source, floor material, and ownership of a radio, phone, bicycle or refrigerator. Households are ranked into wealth quintiles by their PC1 score — the approach behind wealth quintiles in large international household surveys — and used to study inequality in health and education outcomes.

## Practice Questions

*✎ new question added for this site (worked solution below)*

- ✎ PCA on four standardised variables gives eigenvalues $2.2,\,1.2,\,0.4,\,0.2$. Compute the proportion of variance of each component and the cumulative proportion of the first two. How many components does Kaiser's rule keep?
- ✎ Why should income (in dollars) and age (in years) be standardised before PCA?

## Solutions

*✎ solution written for this site*

- ✎ Q1: The eigenvalues sum to 4, so the proportions are $55\%,\,30\%,\,10\%,\,5\%$; the first two components explain $85\%$. Kaiser's rule keeps the components with eigenvalue above 1: two components.
- ✎ Q2: Income has a numerically far larger variance than age, so unstandardised PCA would give a first component that is simply income. Standardising puts all variables on a common scale (equivalently, PCA is done on the correlation matrix).
