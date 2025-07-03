import React, { useEffect, useState } from 'react';

function SignalBot({ symbol = 'BTCUSDT', limit = 20 }) {
  const [signal, setSignal] = useState('Wait');
  const [reason, setReason] = useState('');

  useEffect(() => {
    async function fetchOrderBook() {
      try {
        const res = await fetch(`https://api.binance.com/api/v3/depth?symbol=${symbol}&limit=${limit}`);
        const data = await res.json();
        const sumBids = data.bids.reduce((acc, [_, qty]) => acc + parseFloat(qty), 0);
        const sumAsks = data.asks.reduce((acc, [_, qty]) => acc + parseFloat(qty), 0);
        const total = sumBids + sumAsks;
        const bull = total > 0 ? (sumBids / total) * 100 : 50;
        const bear = total > 0 ? (sumAsks / total) * 100 : 50;
        if (bull > 60) {
          setSignal('Buy');
          setReason('Bull Power > 60%');
        } else if (bear > 60) {
          setSignal('Sell');
          setReason('Bear Power > 60%');
        } else {
          setSignal('Wait');
          setReason('No strong signal');
        }
      } catch {
        setSignal('Wait');
        setReason('Error loading data');
      }
    }
    fetchOrderBook();
    const interval = setInterval(fetchOrderBook, 300000); // 5 минут
    return () => clearInterval(interval);
  }, [symbol, limit]);

  return (
    <section style={{ background: '#161b22', borderRadius: '1rem', padding: '1.5rem', marginBottom: '2rem' }}>
      <h2 style={{ color: '#58a6ff', marginBottom: '1rem' }}>Trading Signal</h2>
      <div style={{
        fontSize: 28,
        fontWeight: 700,
        color: signal === 'Buy' ? '#2ecc71' : signal === 'Sell' ? '#e74c3c' : '#fff'
      }}>
        {signal}
      </div>
      <div style={{ color: '#adbac7', marginTop: 8 }}>{reason}</div>
    </section>
  );
}

export default SignalBot; 