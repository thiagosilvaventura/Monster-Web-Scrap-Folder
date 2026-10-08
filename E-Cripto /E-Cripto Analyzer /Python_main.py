import streamlit as st
import yfinance as yf
import pandas as pd
import numpy as np
import plotly.graph_objects as go
import time
from datetime import datetime

# --- CONFIGURATION ---
st.set_page_config(page_title="Crypto Trend Predictor", layout="wide", page_icon="📈")

TICKERS = {
    "Solana (USD)": "SOL-USD",
    "Solana (BRL)": "SOL-BRL",
    "Ethereum (USD)": "ETH-USD",
    "Ethereum (BRL)": "ETH-BRL",
    "Meli Dolar proxy (USD/BRL)": "BRL=X" 
}

# --- FUNCTIONS ---
@st.cache_data(ttl=3600)
def fetch_market_data(ticker_symbol):
    """Fetches the last 30 days of data with a 1-hour interval."""
    ticker = yf.Ticker(ticker_symbol)
    df = ticker.history(period="30d", interval="1h")
    return df

def apply_prediction_model(df):
    """Applies a Simple Moving Average (SMA) crossover strategy."""
    df['SMA_9'] = df['Close'].rolling(window=9).mean()
    df['SMA_21'] = df['Close'].rolling(window=21).mean()
    df.dropna(inplace=True)
    
    latest_fast = df['SMA_9'].iloc[-1]
    latest_slow = df['SMA_21'].iloc[-1]
    
    if latest_fast > latest_slow:
        prediction = "UPWARD 🟢"
        color = "green"
    else:
        prediction = "DOWNWARD 🔴"
        color = "red"
        
    return df, prediction, color

def generate_statistical_forecast(df, periods=24):
    """
    Predicts future prices using Linear Regression and Historical Volatility.
    Generates a 95% confidence interval for price fluctuations.
    """
    # Calculate hourly volatility (Standard Deviation of returns)
    returns = df['Close'].pct_change().dropna()
    volatility = returns.std()
    
    # Linear Regression to find the trend slope
    x = np.arange(len(df))
    y = df['Close'].values
    z = np.polyfit(x, y, 1) 
    p = np.poly1d(z)
    
    # Predict next N periods
    future_x = np.arange(len(df), len(df) + periods)
    trend_forecast = p(future_x)
    
    # Anchor the forecast to the last actual closing price
    last_price = df['Close'].iloc[-1]
    offset = last_price - trend_forecast[0]
    adjusted_forecast = trend_forecast + offset
    
    # Create time index for future predictions
    last_date = df.index[-1]
    freq = pd.Timedelta(hours=1)
    future_dates = [last_date + i * freq for i in range(1, periods + 1)]
    
    # Calculate Statistical Bounds (95% Confidence -> 1.96 * StdDev)
    upper_bound = [adjusted_forecast[i] * (1 + (volatility * np.sqrt(i+1) * 1.96)) for i in range(periods)]
    lower_bound = [adjusted_forecast[i] * (1 - (volatility * np.sqrt(i+1) * 1.96)) for i in range(periods)]
    
    forecast_df = pd.DataFrame({
        'Date': future_dates,
        'Expected_Price': adjusted_forecast,
        'Upper_Bound': upper_bound,
        'Lower_Bound': lower_bound
    }).set_index('Date')
    
    return forecast_df

def plot_interactive_chart(df, asset_name):
    """Generates the Historical Candlestick Chart."""
    fig = go.Figure()
    fig.add_trace(go.Candlestick(
        x=df.index, open=df['Open'], high=df['High'], low=df['Low'], close=df['Close'], name='Market Price'
    ))
    fig.add_trace(go.Scatter(x=df.index, y=df['SMA_9'], line=dict(color='blue', width=1.5), name='SMA 9 (Fast)'))
    fig.add_trace(go.Scatter(x=df.index, y=df['SMA_21'], line=dict(color='orange', width=1.5), name='SMA 21 (Slow)'))

    fig.update_layout(
        title=f"{asset_name} - Historical Price & Trend", yaxis_title="Price", xaxis_title="Time",
        template="plotly_dark", xaxis_rangeslider_visible=True, height=550
    )
    fig.update_xaxes(
        rangeselector=dict(buttons=list([
            dict(count=1, label="1D", step="day", stepmode="backward"),
            dict(count=7, label="7D", step="day", stepmode="backward"),
            dict(count=15, label="15D", step="day", stepmode="backward"),
            dict(step="all", label="All")
        ]))
    )
    return fig

def plot_forecast_chart(historical_df, forecast_df, asset_name):
    """Generates the Prediction View Chart with Confidence Intervals."""
    fig = go.Figure()

    # Plot recent history for context (last 3 days)
    hist_subset = historical_df.tail(72)
    fig.add_trace(go.Scatter(
        x=hist_subset.index, y=hist_subset['Close'], name='Recent History', line=dict(color='white', width=2)
    ))

    # Plot Forecast Line
    fig.add_trace(go.Scatter(
        x=forecast_df.index, y=forecast_df['Expected_Price'], name='Expected Price', 
        line=dict(color='yellow', dash='dash', width=2)
    ))

    # Plot Confidence Cone (Upper and Lower bounds)
    fig.add_trace(go.Scatter(
        x=forecast_df.index.tolist() + forecast_df.index[::-1].tolist(),
        y=forecast_df['Upper_Bound'].tolist() + forecast_df['Lower_Bound'][::-1].tolist(),
        fill='toself', fillcolor='rgba(255,255,0,0.15)', line=dict(color='rgba(255,255,255,0)'),
        name='95% Confidence Interval'
    ))

    fig.update_layout(
        title=f"{asset_name} - 24-Hour Statistical Forecast", yaxis_title="Price Prediction", xaxis_title="Time",
        template="plotly_dark", height=550
    )
    return fig

# --- APP LAYOUT --- 
st.title("🚀 Real-Time Crypto Analyzer & Trend Predictor")
st.markdown("Automatically fetches data every hour. Features Technical Analysis and Statistical Price Forecasting.")

st.sidebar.header("Settings")
selected_asset = st.sidebar.selectbox("Select Asset to Analyze", list(TICKERS.keys()))
ticker_sym = TICKERS[selected_asset]

# --- MAIN EXECUTION ---
try:
    with st.spinner(f"Fetching and analyzing data for {selected_asset}..."):
        data = fetch_market_data(ticker_sym)
        
    if data.empty:
        st.error("Failed to retrieve data. The Yahoo Finance API might be temporarily unavailable.")
    else:
        # Process History
        processed_data, trend_prediction, trend_color = apply_prediction_model(data)
        
        # Calculate Current Metrics
        current_price = processed_data['Close'].iloc[-1]
        previous_price = processed_data['Close'].iloc[-2]
        price_change = current_price - previous_price
        pct_change = (price_change / previous_price) * 100
        
        # Variables for display
        base_coin = "SOL" if "Solana" in selected_asset else "ETH" if "Ethereum" in selected_asset else "MELI" if "Meli Dolar" in selected_asset else "Asset"
        currency_sym = "R$" if "(BRL)" in selected_asset or "proxy" in selected_asset else "$"

        # UI: Layout with Tabs
        tab1, tab2 = st.tabs(["📈 Historical Analysis", "🔮 Prediction View"])

        # --- TAB 1: HISTORICAL DATA ---
        with tab1:
            col1, col2, col3 = st.columns(3)
            metric_title = f"Current Price (1 {base_coin})"
            
            col1.metric(metric_title, f"{currency_sym} {current_price:,.2f}", f"{currency_sym} {price_change:,.2f} ({pct_change:.2f}%)")
            col2.markdown(f"### Predicted Trend: <span style='color:{trend_color}'>{trend_prediction}</span>", unsafe_allow_html=True)
            col3.info(f"Last updated: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")

            chart = plot_interactive_chart(processed_data, selected_asset)
            st.plotly_chart(chart, use_container_width=True)

        # --- TAB 2: PREDICTIVE FORECAST ---
        with tab2:
            st.subheader("Statistical Price Fluctuation (Next 24 Hours)")
            
            # Generate predictions
            forecast_df = generate_statistical_forecast(processed_data, periods=24)
            
            target_price = forecast_df['Expected_Price'].iloc[-1]
            max_bound = forecast_df['Upper_Bound'].iloc[-1]
            min_bound = forecast_df['Lower_Bound'].iloc[-1]
            target_pct = ((target_price - current_price) / current_price) * 100

            col_a, col_b, col_c = st.columns(3)
            col_a.metric("Expected Price Target (24h)", f"{currency_sym} {target_price:,.2f}", f"{target_pct:,.2f}%")
            col_b.metric("Max Potential (Upper Limit)", f"{currency_sym} {max_bound:,.2f}", delta="Optimistic", delta_color="normal")
            col_c.metric("Min Potential (Lower Limit)", f"{currency_sym} {min_bound:,.2f}", delta="Pessimistic", delta_color="inverse")

            forecast_chart = plot_forecast_chart(processed_data, forecast_df, selected_asset)
            st.plotly_chart(forecast_chart, use_container_width=True)

except Exception as e:
    st.error(f"An error occurred: {e}")

# --- AUTOMATIC REFRESH LOOP ---
st.sidebar.markdown("---")
st.sidebar.caption("🔄 The dashboard will automatically refresh every 1 hour.")
time.sleep(3600)
st.rerun()
