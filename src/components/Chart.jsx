import React, { useEffect, useRef, useState } from 'react';
import { createChart, CrosshairMode } from 'lightweight-charts';

const TIMEFRAMES = [
  { label: '5m', value: '5m' },
  { label: '10m', value: '10m' },
  { label: '15m', value: '15m' },
  { label: '30m', value: '30m' },
  { label: '1h', value: '1h' },
  { label: '2h', value: '2h' },
  { label: '4h', value: '4h' },
  { label: '1d', value: '1d' },
  { label: '1w', value: '1w' },
];

function binanceIntervalToLimit(interval) {
  switch (interval) {
    case '1w': return 104;
    case '1d': return 365;
    case '4h': return 504;
    case '2h': return 504;
    case '1h': return 720;
    case '30m': return 720;
    case '15m': return 480;
    case '10m': return 432;
    case '5m': return 288;
    default: return 288;
  }
}

const COINS = [
  { label: 'BTC', value: 'BTCUSDT' },
  { label: 'ETH', value: 'ETHUSDT' },
];

const TYPES = [
  { label: 'Линия', value: 'line' },
  { label: 'Свечи', value: 'candles' },
  { label: 'Бары', value: 'bars' },
];

function Chart() {
  const chartContainerRef = useRef();
  const chartRef = useRef();
  const seriesRef = useRef();
  const [mainCoin, setMainCoin] = useState(() => localStorage.getItem('mainCoin') || 'BTCUSDT');
  const [mainChartType, setMainChartType] = useState(() => localStorage.getItem('mainChartType') || 'line');
  const [mainTimeframe, setMainTimeframe] = useState(() => localStorage.getItem('mainTimeframe') || '5m');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);
  const [cache, setCache] = useState({});

  // Save state to localStorage
  useEffect(() => {
    localStorage.setItem('mainCoin', mainCoin);
    localStorage.setItem('mainChartType', mainChartType);
    localStorage.setItem('mainTimeframe', mainTimeframe);
  }, [mainCoin, mainChartType, mainTimeframe]);

  // Create chart
  useEffect(() => {
    if (!chartContainerRef.current) return;
    if (chartRef.current) {
      chartRef.current.remove();
      chartRef.current = null;
      seriesRef.current = null;
    }
    chartRef.current = createChart(chartContainerRef.current, {
      width: chartContainerRef.current.offsetWidth,
      height: 400,
      layout: {
        background: { color: '#161b22' },
        textColor: '#c9d1d9',
      },
      grid: {
        vertLines: { color: '#30363d' },
        horzLines: { color: '#30363d' },
      },
      crosshair: {
        mode: CrosshairMode.Normal,
      },
      rightPriceScale: {
        borderColor: '#30363d',
      },
      timeScale: {
        borderColor: '#30363d',
        timeVisible: true,
        secondsVisible: false,
      },
    });
    if (mainChartType === 'candles') {
      seriesRef.current = chartRef.current.addCandlestickSeries({
        upColor: '#2ecc71',
        downColor: '#e74c3c',
        borderVisible: false,
        wickUpColor: '#2ecc71',
        wickDownColor: '#e74c3c',
      });
    } else if (mainChartType === 'bars') {
      seriesRef.current = chartRef.current.addBarSeries({
        upColor: '#2ecc71',
        downColor: '#e74c3c',
        thinBars: false,
      });
    } else {
      seriesRef.current = chartRef.current.addLineSeries({
        color: mainCoin === 'BTCUSDT' ? '#f7931a' : '#627eea',
        lineWidth: 2,
      });
    }
    return () => {
      if (chartRef.current) {
        chartRef.current.remove();
        chartRef.current = null;
        seriesRef.current = null;
      }
    };
    // eslint-disable-next-line
  }, [mainChartType, mainCoin]);

  // Fetch chart data
  useEffect(() => {
    let ignore = false;
    async function fetchMainChartData() {
      setLoading(true);
      setError(false);
      const cacheKey = mainCoin + '_' + mainChartType + '_' + mainTimeframe;
      if (cache[cacheKey]) {
        if (seriesRef.current) seriesRef.current.setData(cache[cacheKey]);
        setLoading(false);
        return;
      }
      try {
        const url = `https://api.binance.com/api/v3/klines?symbol=${mainCoin}&interval=${mainTimeframe}&limit=${binanceIntervalToLimit(mainTimeframe)}`;
        const response = await fetch(url);
        if (!response.ok) throw new Error('Ошибка загрузки данных с Binance');
        const klines = await response.json();
        let chartData;
        if (mainChartType === 'candles' || mainChartType === 'bars') {
          chartData = klines.map(k => ({
            time: Math.floor(k[0] / 1000),
            open: parseFloat(k[1]),
            high: parseFloat(k[2]),
            low: parseFloat(k[3]),
            close: parseFloat(k[4])
          }));
        } else {
          chartData = klines.map(k => ({
            time: Math.floor(k[0] / 1000),
            value: parseFloat(k[4])
          }));
        }
        if (!ignore) {
          if (seriesRef.current) seriesRef.current.setData(chartData);
          setCache(prev => ({ ...prev, [cacheKey]: chartData }));
        }
      } catch (err) {
        setError(true);
      } finally {
        setLoading(false);
      }
    }
    fetchMainChartData();
    return () => { ignore = true; };
    // eslint-disable-next-line
  }, [mainCoin, mainChartType, mainTimeframe]);

  return (
    <section className="chart">
      <div className="tabs">
        <div className="type-switch">
          {COINS.map(coin => (
            <button
              key={coin.value}
              className={mainCoin === coin.value ? 'active' : ''}
              onClick={() => setMainCoin(coin.value)}
            >
              {coin.label}
            </button>
          ))}
        </div>
        <div className="type-switch">
          {TYPES.map(type => (
            <button
              key={type.value}
              className={mainChartType === type.value ? 'active' : ''}
              onClick={() => setMainChartType(type.value)}
            >
              {type.label}
            </button>
          ))}
        </div>
      </div>
      <div className="type-switch">
        {TIMEFRAMES.map(tf => (
          <button
            key={tf.value}
            className={mainTimeframe === tf.value ? 'active' : ''}
            onClick={() => setMainTimeframe(tf.value)}
          >
            {tf.label}
          </button>
        ))}
      </div>
      <div
        className="lightchart-container"
        ref={chartContainerRef}
        style={{ width: 900, height: 400 }}
      >
        {loading && (
          <div style={{color:'#58a6ff',textAlign:'center',paddingTop:150,fontSize:'1.2rem',position:'absolute',width:'100%'}}>Загрузка...</div>
        )}
        {error && (
          <div style={{color:'#e74c3c',textAlign:'center',paddingTop:150,fontSize:'1.2rem',position:'absolute',width:'100%'}}>Ошибка загрузки данных с Binance</div>
        )}
      </div>
    </section>
  );
}

export default Chart; 