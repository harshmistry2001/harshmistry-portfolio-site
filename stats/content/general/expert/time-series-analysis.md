# Time Series Analysis

## Overview

Time series observations depend on their past, so independent-data methods fail. Analysis separates trend and seasonality, makes the series stationary (usually by differencing), studies its autocorrelation and then fits models such as exponential smoothing or ARIMA. Forecasts must be judged on a hold-out period at the end, never on randomly split data.

## Concept

A time series is a sequence of observations ordered in time: daily sales, monthly unemployment, hourly electricity load, stock prices. Unlike cross-sectional data, observations are **dependent** — today's value carries information about tomorrow's — so standard i.i.d. methods do not apply.

### Components

$$y_t = T_t + S_t + R_t \quad \text{(additive)} \qquad\text{or}\qquad y_t = T_t \times S_t \times R_t \quad \text{(multiplicative)}$$

- **Trend** $T_t$ — long-run movement; **seasonality** $S_t$ — fixed-period patterns (weekly, yearly); **cycles** — irregular longer swings (business cycle); **remainder** $R_t$ — noise.
- Use a multiplicative model (or log-transform) when seasonal swings grow with the level.
- **Decomposition** (classical moving averages or STL) separates these components.

### Stationarity

A series is (weakly) **[stationary](https://en.wikipedia.org/wiki/Stationary_process)** if its mean, variance and autocovariances do not change over time. Most models require it.

- Trends and random walks are non-stationary. Remedy: **differencing** $\Delta y_t = y_t - y_{t-1}$ (and seasonal differencing $y_t - y_{t-s}$), or detrending.
- Tests: **[Augmented Dickey-Fuller](https://en.wikipedia.org/wiki/Augmented_Dickey%E2%80%93Fuller_test)** ($H_0$: unit root / non-stationary) and **[KPSS](https://en.wikipedia.org/wiki/KPSS_test)** ($H_0$: stationary) — use both.
- Log-transform first if the variance grows with the level.

### Autocorrelation

- **ACF** $\rho_k = Corr(y_t, y_{t-k})$; **PACF** — correlation at lag $k$ after removing shorter lags.
- Patterns identify models: AR($p$) → PACF cuts off after $p$; MA($q$) → ACF cuts off after $q$.
- **[Ljung-Box test](https://en.wikipedia.org/wiki/Ljung%E2%80%93Box_test)** checks whether residual autocorrelations are jointly zero (white noise).

### Model families

| Model | Idea | Typical use |
|---|---|---|
| Naive / seasonal naive | $\hat y_{t+1} = y_t$ or $y_{t+1-s}$ | benchmark every forecast must beat |
| Moving average / exponential smoothing (SES, Holt, **Holt-Winters / ETS**) | weighted averages with decaying weights; level, trend and seasonal states | operational demand forecasting |
| **[ARIMA](https://en.wikipedia.org/wiki/Autoregressive_integrated_moving_average)($p,d,q$)** | $\phi(B)(1-B)^d y_t = \theta(B)\varepsilon_t$ — autoregression on past values, moving average of past shocks, $d$ differences | macro/finance series, short-term forecasting |
| **SARIMA($p,d,q$)($P,D,Q$)$_s$** | ARIMA with seasonal terms | monthly/weekly seasonal data |
| Regression with ARIMA errors / ARIMAX | external drivers (price, temperature, holidays) + autocorrelated errors | demand with promotions, energy load |
| [GARCH](https://en.wikipedia.org/wiki/Autoregressive_conditional_heteroskedasticity) | time-varying volatility | financial risk |
| VAR | several series influencing each other | macroeconomics |

AR(1): $y_t = c + \phi y_{t-1} + \varepsilon_t$ is stationary if $|\phi| < 1$; $\phi = 1$ is a random walk.

### Forecast evaluation

- Always evaluate on a **hold-out period at the end** (never random splits) or with **rolling-origin (time-series) cross-validation**.
- Metrics: MAE, RMSE, MAPE (undefined near zero), **MASE** (scaled by the naive forecast; < 1 beats naive).
- Report **prediction intervals**; they widen with the horizon.
- Check residuals: no autocorrelation (Ljung-Box), constant variance, roughly normal.

### Pitfalls

Spurious regression between two trending series (high $R^2$, no relationship — difference them or test for [cointegration](https://en.wikipedia.org/wiki/Cointegration)), look-ahead bias in features, structural breaks (COVID, policy changes), and over-fitting complex models to short series.

## When It's Used

Time series methods drive demand and inventory planning in retail and supply chains, electricity-load and renewable-generation forecasting, call-centre staffing, macroeconomic forecasting at central banks, financial risk and volatility models, capacity planning for web services, anomaly detection in monitoring systems, and sales budgeting.

## R Code

```r
set.seed(30)
# Monthly sales for 8 years: trend + yearly seasonality (growing with level) + AR(1) noise
n <- 96
t <- 1:n
season <- rep(c(0.85, 0.82, 0.95, 1.00, 1.05, 1.08, 1.02, 1.00, 1.03, 1.06, 1.18, 1.35), 8)
noise <- as.numeric(arima.sim(list(ar = 0.5), n, sd = 0.03))
sales <- ts(round((200 + 2.5 * t) * season * exp(noise)), start = c(2016, 1), frequency = 12)

plot(sales, main = "Monthly sales", ylab = "units")
plot(stl(log(sales), s.window = "periodic"))                  # STL decomposition on the log scale

# Stationarity: ACF of the level vs. of seasonally and regularly differenced logs
op <- par(mfrow = c(1, 2))
acf(log(sales), main = "log(sales)")
acf(diff(diff(log(sales), lag = 12)), main = "differenced")
par(op)

# Train / test split: last 12 months held out
train <- window(sales, end = c(2022, 12)); test <- window(sales, start = c(2023, 1))

# 1. Seasonal naive benchmark
snaive <- tail(train, 12)
# 2. Holt-Winters (multiplicative seasonality)
hw <- HoltWinters(train, seasonal = "multiplicative")
hw_fc <- predict(hw, n.ahead = 12, prediction.interval = TRUE)
# 3. SARIMA on the log scale: (1,1,1)(0,1,1)[12] ("airline"-type model)
sarima <- arima(log(train), order = c(1, 1, 1), seasonal = list(order = c(0, 1, 1), period = 12))
sarima                        # a seasonal MA close to -1 signals deterministic seasonality
sar_fc <- predict(sarima, n.ahead = 12)
sar_mean <- exp(sar_fc$pred)

# Residual check: Ljung-Box
Box.test(residuals(sarima), lag = 24, type = "Ljung-Box", fitdf = 3)

# Accuracy on the hold-out year
mae <- function(f) mean(abs(test - f))
mase_scale <- mean(abs(diff(train, lag = 12)))
c(MAE_snaive = mae(snaive), MAE_holtwinters = mae(hw_fc[, "fit"]), MAE_sarima = mae(sar_mean),
  MASE_sarima = mae(sar_mean) / mase_scale)

# Forecast plot with an approximate 95% interval from the SARIMA model
ts.plot(train, test, ts(sar_mean, start = c(2023, 1), frequency = 12),
        ts(exp(sar_fc$pred + 1.96 * sar_fc$se), start = c(2023, 1), frequency = 12),
        ts(exp(sar_fc$pred - 1.96 * sar_fc$se), start = c(2023, 1), frequency = 12),
        lty = c(1, 1, 2, 3, 3), col = c("black", "grey50", "black", "grey40", "grey40"),
        main = "SARIMA forecast vs actual")
```

## Python Code

```python
import numpy as np
import pandas as pd
import matplotlib.pyplot as plt
from statsmodels.tsa.seasonal import STL
from statsmodels.tsa.stattools import adfuller, kpss
from statsmodels.tsa.holtwinters import ExponentialSmoothing
from statsmodels.tsa.statespace.sarimax import SARIMAX
from statsmodels.stats.diagnostic import acorr_ljungbox
from statsmodels.graphics.tsaplots import plot_acf

rng = np.random.default_rng(30)
n = 96
t = np.arange(1, n + 1)
season = np.tile([0.85, 0.82, 0.95, 1.00, 1.05, 1.08, 1.02, 1.00, 1.03, 1.06, 1.18, 1.35], 8)
noise = np.zeros(n)
for i in range(1, n):
    noise[i] = 0.5 * noise[i - 1] + rng.normal(0, 0.03)
idx = pd.date_range("2016-01-01", periods=n, freq="MS")
sales = pd.Series(np.round((200 + 2.5 * t) * season * np.exp(noise)), index=idx)

STL(np.log(sales), period=12).fit().plot(); plt.show()

print("ADF p (log level):", adfuller(np.log(sales))[1])
d = np.log(sales).diff(12).diff().dropna()
print("ADF p (differenced):", adfuller(d)[1], " KPSS p:", kpss(d, nlags="auto")[1])
plot_acf(d, lags=24); plt.show()

train, test = sales[:-12], sales[-12:]

snaive = train[-12:].values
hw = ExponentialSmoothing(train, trend="add", seasonal="mul", seasonal_periods=12).fit()
hw_fc = hw.forecast(12)

sar = SARIMAX(np.log(train), order=(1, 1, 1), seasonal_order=(0, 1, 1, 12)).fit(disp=False)
print(sar.summary().tables[1])   # a seasonal MA close to -1 signals deterministic seasonality (seasonal dummies would also work)
fc = sar.get_forecast(12)
sar_mean = np.exp(fc.predicted_mean)
ci = np.exp(fc.conf_int(alpha=0.05))

print(acorr_ljungbox(sar.resid[13:], lags=[24], model_df=3))

mae = lambda f: np.mean(np.abs(test.values - np.asarray(f)))
scale = np.mean(np.abs(train.values[12:] - train.values[:-12]))   # seasonal-naive in-sample MAE (lag-12 differences)
print({"MAE snaive": mae(snaive), "MAE HW": mae(hw_fc), "MAE SARIMA": mae(sar_mean),
       "MASE SARIMA": mae(sar_mean) / scale})

ax = train.plot(label="train"); test.plot(ax=ax, label="actual")
sar_mean.plot(ax=ax, style="--", label="SARIMA")
ax.fill_between(ci.index, ci.iloc[:, 0], ci.iloc[:, 1], alpha=0.2)
ax.legend(); plt.show()
```

## Software Shortcuts

- **Excel:** Data → **Forecast Sheet** (Excel 2016+) builds an ETS (AAA exponential smoothing) forecast with confidence bounds and detected seasonality; `=FORECAST.ETS(target_date, values, timeline, seasonality)`, `=FORECAST.ETS.CONFINT()`, `=FORECAST.ETS.SEASONALITY()`. Data → Data Analysis → **Moving Average** and **Exponential Smoothing**. Trendline options on a line chart include moving averages.
- **SPSS:** Analyze → **Forecasting** → *Create Traditional Models* (Expert Modeler chooses ETS or ARIMA automatically, or specify ARIMA orders), *Seasonal Decomposition*, *Autocorrelations* (ACF/PACF plots), *Sequence Charts*.
- **Stata:** `tsset month`, `tsline sales`, `ac` / `pac`, `dfuller`, `arima lnsales, arima(1,1,1) sarima(0,1,1,12)`, `predict f, y dynamic(tm(2023m1))`, `tssmooth hwinters`, `wntestq resid` (Ljung-Box).
- **Google Sheets:** `=FORECAST()` / `=FORECAST.LINEAR()` for linear trends; `=TREND()`; add-ons for exponential smoothing.

## Industry Examples

**Grocery retail — store-item demand.** A supermarket chain forecasts daily demand for 40,000 store–item combinations to drive automatic replenishment. Fast movers use regression with ARIMA errors including price, promotion flags, holidays and weather; slow movers use Croston-type intermittent-demand methods. Every model is benchmarked against a seasonal-naive forecast using rolling-origin evaluation and MASE; switching fresh-produce forecasts to the new models reduced waste by around 10% while keeping availability targets.

**Energy — day-ahead load forecasting.** A transmission system operator forecasts hourly load 24–48 hours ahead with a regression-plus-SARIMA-errors model: temperature (with heating and cooling splines), hour-of-day × weekday effects, holidays and daylight. Forecast errors of 1–2% MAPE feed day-ahead market bids and reserve procurement; the prediction intervals set how much balancing reserve is held, because under-forecasting a winter peak by 3% is far costlier than over-forecasting.

**Central banking — inflation nowcasting.** A central bank's forecasting unit uses seasonal adjustment (X-13ARIMA-SEATS) on monthly price indices, ARIMA benchmarks, and VAR models linking inflation, wages and energy prices. ADF/KPSS tests guide whether series enter in levels or differences. When energy prices broke historical patterns, the team documented a structural break and reweighted recent data — a reminder that time series models extrapolate the past and must be monitored.

## Practice Questions

*✎ new question added for this site (worked solution below)*

- ✎ Difference the series 10, 12, 15, 19, 24. What does the first difference show, and what does a second difference show?
- ✎ Why is a random 80/20 split of the observations a poor way to evaluate a forecasting model?

## Solutions

*✎ solution written for this site*

- ✎ Q1: First differences: $2,3,4,5$ — the series has a growing (trending) increment. Second differences: $1,1,1$ — constant, so two differences remove the (quadratic) trend and the series is stationary.
- ✎ Q2: A random split lets the model train on future observations and test on past ones (look-ahead bias) and ignores the dependence between neighbouring points. Evaluate on a hold-out period at the end or with rolling-origin cross-validation.
