import streamlit as st
import yfinance as yf
import pandas as pd
import plotly.graph_objects as go
import time
from datetime import datetime

# --- CONFIGURATION ---
st.set_page_config(page_title="Crypto Trend Predictor", layout="wide", page_icon="📈")

# Meli Dolar is pegged to USD, so we use USD/BRL as its real-time proxy for the BRL value.
TICKERS = {
    "Solana (USD)": "SOL-USD",
    "Solana (BRL)": "SOL-BRL",
    "Ethereum (USD)": "ETH-USD",
    "Ethereum (BRL)": "ETH-BRL",
    "Meli Dolar proxy (USD/BRL)": "BRL=X" 
}

# --- FUNCTIONS ---
@st.cache_data(ttl=3600) # Caches data for 1 hour to prevent API bans, though auto-refresh handles the loop
def fetch_market_data(ticker_symbol):
    """Fetches the last 30 days of data with a 1-hour interval."""
    ticker = yf.Ticker(ticker_symbol)
    df = ticker.history(period="30d", interval="1h")
    return df

def apply_prediction_model(df):
    """
    Applies a Simple Moving Average (SMA) crossover strategy to predict trends.
    SMA 9 (Fast) and SMA 21 (Slow). 
    If Fast > Slow -> Upward Trend expected.
    If Fast < Slow -> Downward Trend expected.
    """
    df['SMA_9'] = df['Close'].rolling(window=9).mean()
    df['SMA_21'] = df['Close'].rolling(window=21).mean()
    
    # Drop NaNs to clean up the chart
    df.dropna(inplace=True)
    
    # Determine the current trend prediction based on the latest data points
    latest_fast = df['SMA_9'].iloc[-1]
    latest_slow = df['SMA_21'].iloc[-1]
    
    if latest_fast > latest_slow:
        prediction = "UPWARD 🟢"
        color = "green"
    else:
        prediction = "DOWNWARD 🔴"
        color = "red"
        
    return df, prediction, color

def plot_interactive_chart(df, asset_name):
    """Generates a robust candlestick chart using Plotly."""
    fig = go.Figure()

    # Candlestick chart
    fig.add_trace(go.Candlestick(
        x=df.index,
        open=df['Open'],
        high=df['High'],
        low=df['Low'],
        close=df['Close'],
        name='Market Price'
    ))

    # Add Moving Averages
    fig.add_trace(go.Scatter(x=df.index, y=df['SMA_9'], line=dict(color='blue', width=1.5), name='SMA 9 (Fast)'))
    fig.add_trace(go.Scatter(x=df.index, y=df['SMA_21'], line=dict(color='orange', width=1.5), name='SMA 21 (Slow)'))

    fig.update_layout(
        title=f"{asset_name} - Price History & Trend Analysis",
        yaxis_title="Price",
        xaxis_title="Time",
        template="plotly_dark",
        xaxis_rangeslider_visible=True, 
        height=600
    )
    
    # Add shortcut buttons for quick zoom at the top of the chart
    fig.update_xaxes(
        rangeselector=dict(
            buttons=list([
                dict(count=1, label="1D", step="day", stepmode="backward"),
                dict(count=7, label="7D", step="day", stepmode="backward"),
                dict(count=15, label="15D", step="day", stepmode="backward"),
                dict(step="all", label="All")
            ])
        )
    )
    
    return fig

# --- APP LAYOUT --- 
st.title("🚀 Real-Time Crypto Analyzer & Trend Predictor")
st.markdown("Automatically fetches data every hour. Predicts short-term movements using Moving Average Crossovers.")

st.sidebar.header("Settings")
selected_asset = st.sidebar.selectbox("Select Asset to Analyze", list(TICKERS.keys()))
ticker_sym = TICKERS[selected_asset]

# --- MAIN EXECUTION ---
try:
    with st.spinner(f"Fetching real-time data for {selected_asset}..."):
        data = fetch_market_data(ticker_sym)
        
    if data.empty:
        st.error("Failed to retrieve data. The Yahoo Finance API might be temporarily unavailable.")
    else:
        # Process Data and Predict
        processed_data, trend_prediction, trend_color = apply_prediction_model(data)
        
        # --- Display Metrics ---
        current_price = processed_data['Close'].iloc[-1]
        previous_price = processed_data['Close'].iloc[-2]
        price_change = current_price - previous_price
        pct_change = (price_change / previous_price) * 100
        
        # Determine base coin symbol for the 1-to-1 comparison
        if "Solana" in selected_asset:
            base_coin = "SOL"
        elif "Ethereum" in selected_asset:
            base_coin = "ETH"
        elif "Meli Dolar" in selected_asset:
            base_coin = "MELI"
        else:
            base_coin = "Asset"

        # Determine currency symbol 
        if "(BRL)" in selected_asset or "proxy" in selected_asset:
            currency_sym = "R$"
        else:
            currency_sym = "$"

        col1, col2, col3 = st.columns(3)
        
        # Format values with 2 decimal places and currency symbol
        metric_title = f"Current Price (1 {base_coin})"
        price_formatted = f"{currency_sym} {current_price:,.2f}"
        change_formatted = f"{currency_sym} {price_change:,.2f} ({pct_change:.2f}%)"

        col1.metric(metric_title, price_formatted, change_formatted)
        col2.markdown(f"### Predicted Trend: <span style='color:{trend_color}'>{trend_prediction}</span>", unsafe_allow_html=True)
        col3.info(f"Last updated: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")

        # Display Chart
        chart = plot_interactive_chart(processed_data, selected_asset)
        st.plotly_chart(chart, use_container_width=True)

except Exception as e:
    st.error(f"An error occurred: {e}")

# --- AUTOMATIC REFRESH LOOP (1 HOUR) ---
st.sidebar.markdown("---")
st.sidebar.caption("🔄 The dashboard will automatically refresh every 1 hour.")

time.sleep(3600)
st.rerun()
