# Crypto Analyzer & Trend Predictor

![Python](https://img.shields.io/badge/Python-3.8%2B-blue?style=for-the-badge&logo=python)
![Streamlit](https://img.shields.io/badge/Streamlit-1.20%2B-FF4B4B?style=for-the-badge&logo=streamlit)
![Plotly](https://img.shields.io/badge/Plotly-Interactive-3f4f75?style=for-the-badge&logo=plotly)

A cryptocurrency analytics dashboard built with Python and Streamlit. It provides market analysis, short-term statistical forecasting, and an automated email alert system using local files instead of a database.

<img width="1536" height="859" alt="image" src="https://github.com/user-attachments/assets/928ed724-444f-4816-ada0-5c6ed8398e39" />

<img width="302" height="314" alt="image" src="https://github.com/user-attachments/assets/df2b8f45-902d-4ab5-a3e7-cddd5db729f1" />



## Purpose
This tool is designed to monitor asset fluctuations. It uses Technical Analysis and Statistical Modeling to provide market data and notify users of price changes based on custom thresholds.

## Features
*   **Real-Time Tracking**: Fetches data every hour using the Yahoo Finance API.
*   **Interactive Charts**: Candlestick charts with dynamic range sliders using Plotly.
*   **Trend Detection**: Uses Simple Moving Average crossovers to identify market direction.
*   **24-Hour Forecast**: Projects future price boundaries based on historical volatility and linear trajectory.
*   **Email Alerts**: Allows users to set percentage thresholds for automated email notifications.


<img width="1069" height="625" alt="image" src="https://github.com/user-attachments/assets/8a7f7b29-065d-4882-a5d8-f8fa4017c802" />
https://www.mercadopago.com.br/ajuda/33405

## Methods

| Technique | Implementation Details | Purpose |
| :--- | :--- | :--- |
| **Simple Moving Average (SMA)** | `SMA_9` (Fast) and `SMA_21` (Slow) applied to hourly closing prices. | Determines current market trend (Upward/Downward). |
| **Linear Regression** | Evaluates historical prices using `numpy.polyfit` (1st degree). | Establishes the expected price path for the next 24 hours. |
| **Historical Volatility** | Calculates the standard deviation of percentage returns. | Measures price fluctuation. |
| **95% Confidence Interval** | `Expected Price * (1 ± Volatility * √t * 1.96)`. | Generates Upper and Lower limit bounds. |

## Code Structure

### How the Prediction Works (Forecasting)

To predict future prices, the code uses a math library called `numpy`. Instead of making random guesses, it calculates the future in two simple steps:

1. **Finding the Path (Linear Regression):** The `numpy` library (`np.polyfit`) analyzes the recent zig-zag of prices and draws a straight line through them. This line shows the general direction the asset is moving.
2. **Creating the "Safety Tunnel" (Confidence Interval):** The code calculates how aggressively the coin's price usually jumps up and down (its volatility). Based on that, it draws a shaded tunnel around the straight line. The **Upper Bound** and **Lower Bound** represent the maximum and minimum prices we can expect for the next 24 hours, with 95% mathematical certainty.

```python
def generate_statistical_forecast(df, periods=24):
    # Measures how much the price usually jumps around
    returns = df['Close'].pct_change().dropna()
    volatility = returns.std()
    
    # numpy draws a straight trend line based on past data
    x = np.arange(len(df))
    y = df['Close'].values
    z = np.polyfit(x, y, 1) 
    
    # Calculates the top and bottom of the "tunnel" (95% confidence)
    upper_bound = [adjusted_forecast[i] * (1 + (volatility * np.sqrt(i+1) * 1.96)) for i in range(periods)]
    lower_bound = [adjusted_forecast[i] * (1 - (volatility * np.sqrt(i+1) * 1.96)) for i in range(periods)]
    
    return forecast_df
