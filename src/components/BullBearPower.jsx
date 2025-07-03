import React, { useEffect, useState } from 'react';

function BullBearPower({ symbol = 'BTCUSDT', limit = 20 }) {
  const [bull, setBull] = useState(0);
  const [bear, setBear] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    setLoading(true);
    setError(false);
    let intervalId;
    async function fetchOrderBook() {
      try {
        const res = await fetch(`https://api.binance.com/api/v3/depth?symbol=${symbol}&limit=${limit}`);
        const data = await res.json();
        const sumBids = data.bids.reduce((acc, [_, qty]) => acc + parseFloat(qty), 0);
        const sumAsks = data.asks.reduce((acc, [_, qty]) => acc + parseFloat(qty), 0);
        const total = sumBids + sumAsks;
        setBull(total > 0 ? (sumBids / total) * 100 : 50);
        setBear(total > 0 ? (sumAsks / total) * 100 : 50);
      } catch (err) {
        setError(true);
      } finally {
        setLoading(false);
      }
    }
    fetchOrderBook();
    intervalId = setInterval(fetchOrderBook, 300000); // 5 минут
    return () => clearInterval(intervalId);
  }, [symbol, limit]);

  return (
    <section className="bull-bear-power" style={{ background: '#161b22', borderRadius: '1rem', padding: '1.5rem', marginBottom: '2rem', marginTop: '0.5rem' }}>
      <h2 style={{ color: '#58a6ff', marginBottom: '1rem' }}>Bull vs Bear Power</h2>
      {loading && <div>Loading...</div>}
      {error && <div style={{ color: '#e74c3c' }}>Error loading data</div>}
      {!loading && !error && (
        <div style={{ width: '100%', height: 36, background: '#222b3a', borderRadius: 8, display: 'flex', overflow: 'hidden', boxShadow: '0 0 6px #0004' }}>
          <div style={{ width: `${bull}%`, background: '#2ecc71', display: 'flex', alignItems: 'center', justifyContent: 'flex-end', color: '#fff', fontWeight: 600, fontSize: 18, paddingRight: 12 }}>
            {bull.toFixed(1)}% 🐂
          </div>
          <div style={{ width: `${bear}%`, background: '#e74c3c', display: 'flex', alignItems: 'center', justifyContent: 'flex-start', color: '#fff', fontWeight: 600, fontSize: 18, paddingLeft: 12 }}>
            🐻 {bear.toFixed(1)}%
          </div>
        </div>
      )}
    </section>
  );
}

export default BullBearPower; 