import React, { useEffect, useState } from 'react';

function OrderBook({ symbol = 'BTCUSDT', limit = 20 }) {
  const [bids, setBids] = useState([]);
  const [asks, setAsks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    setBids([]);
    setAsks([]);
    setLoading(true);
    setError(false);
    let intervalId;
    async function fetchOrderBook() {
      try {
        const res = await fetch(`https://api.binance.com/api/v3/depth?symbol=${symbol}&limit=${limit}`);
        const data = await res.json();
        setBids(data.bids);
        setAsks(data.asks);
        setLoading(false);
      } catch (err) {
        setError(true);
        setLoading(false);
      }
    }
    fetchOrderBook();
    intervalId = setInterval(fetchOrderBook, 5000);
    return () => clearInterval(intervalId);
  }, [symbol, limit]);

  // Найти максимальный объём среди bids и asks для нормализации ширины баров
  const maxBidQty = Math.max(...bids.map(([_, qty]) => parseFloat(qty)), 1);
  const maxAskQty = Math.max(...asks.map(([_, qty]) => parseFloat(qty)), 1);

  return (
    <section className="orderbook">
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: 8 }}>
        <h2 style={{ margin: 0 }}>Order Book</h2>
        {/* Кнопки выбора монеты убраны, теперь управление только через проп symbol */}
      </div>
      {loading && <div>Loading...</div>}
      {error && <div style={{ color: '#e74c3c' }}>Error loading order book</div>}
      {!loading && !error && (
        <div className="orderbook-books">
          <div className="orderbook-bids" style={{ marginBottom: 0 }}>
            <h3 style={{ color: '#2ecc71', marginBottom: 4 }}>Bids</h3>
            <div style={{ fontSize: '0.95rem' }}>
              {bids.map(([price, qty], i) => {
                const width = (parseFloat(qty) / maxBidQty) * 100;
                return (
                  <div key={i} style={{ position: 'relative', display: 'flex', justifyContent: 'space-between', alignItems: 'center', height: 22, marginBottom: 2 }}>
                    <span style={{ zIndex: 1 }}>{parseFloat(price).toLocaleString()}</span>
                    <span style={{ zIndex: 1 }}>{parseFloat(qty).toLocaleString()}</span>
                    <div style={{ position: 'absolute', right: 0, top: 2, height: '70%', width: `${width}%`, background: 'rgba(46,204,113,0.25)', borderRadius: 3, zIndex: 0 }}></div>
                  </div>
                );
              })}
            </div>
          </div>
          <div className="orderbook-asks" style={{ marginTop: 0 }}>
            <h3 style={{ color: '#e74c3c', marginBottom: 4 }}>Asks</h3>
            <div style={{ fontSize: '0.95rem' }}>
              {asks.map(([price, qty], i) => {
                const width = (parseFloat(qty) / maxAskQty) * 100;
                return (
                  <div key={i} style={{ position: 'relative', display: 'flex', justifyContent: 'space-between', alignItems: 'center', height: 22, marginBottom: 2 }}>
                    <span style={{ zIndex: 1 }}>{parseFloat(price).toLocaleString()}</span>
                    <span style={{ zIndex: 1 }}>{parseFloat(qty).toLocaleString()}</span>
                    <div style={{ position: 'absolute', left: 0, top: 2, height: '70%', width: `${width}%`, background: 'rgba(231,76,60,0.25)', borderRadius: 3, zIndex: 0 }}></div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </section>
  );
}

export default OrderBook; 