import React, { useEffect, useRef, useState } from 'react';

function BullBearPower({ symbol = 'BTCUSDT', limit = 20 }) {
  const [bull, setBull] = useState(0);
  const [bear, setBear] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const bullHistory = useRef([]);
  const bearHistory = useRef([]);
  const HISTORY_LENGTH = 12; // 12 * 5 сек = 1 минута

  useEffect(() => {
    setLoading(true);
    setError(false);
    bullHistory.current = [];
    bearHistory.current = [];
    let intervalId;
    async function fetchOrderBook() {
      try {
        const res = await fetch(`https://api.binance.com/api/v3/depth?symbol=${symbol}&limit=${limit}`);
        const data = await res.json();
        const sumBids = data.bids.reduce((acc, [_, qty]) => acc + parseFloat(qty), 0);
        const sumAsks = data.asks.reduce((acc, [_, qty]) => acc + parseFloat(qty), 0);
        const total = sumBids + sumAsks;
        const bullVal = total > 0 ? (sumBids / total) * 100 : 50;
        const bearVal = total > 0 ? (sumAsks / total) * 100 : 50;
        bullHistory.current.push(bullVal);
        bearHistory.current.push(bearVal);
        if (bullHistory.current.length > HISTORY_LENGTH) bullHistory.current.shift();
        if (bearHistory.current.length > HISTORY_LENGTH) bearHistory.current.shift();
        const bullAvg = bullHistory.current.reduce((a, b) => a + b, 0) / bullHistory.current.length;
        const bearAvg = bearHistory.current.reduce((a, b) => a + b, 0) / bearHistory.current.length;
        setBull(bullAvg);
        setBear(bearAvg);
      } catch (err) {
        setError(true);
      } finally {
        setLoading(false);
      }
    }
    fetchOrderBook();
    intervalId = setInterval(fetchOrderBook, 5000); // 5 секунд
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