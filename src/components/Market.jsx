import React, { useEffect, useState } from 'react';

function Market() {
  const [btc, setBtc] = useState({ price: '--', change: '--' });
  const [eth, setEth] = useState({ price: '--', change: '--' });

  async function fetchAndShowPrices() {
    try {
      // BTC
      const btcResp = await fetch('https://api.binance.com/api/v3/ticker/24hr?symbol=BTCUSDT');
      const btcData = await btcResp.json();
      setBtc({
        price: '$' + parseFloat(btcData.lastPrice).toLocaleString(),
        change: parseFloat(btcData.priceChangePercent).toFixed(2) + '%',
        changeColor: parseFloat(btcData.priceChangePercent) >= 0 ? '#2ecc71' : '#e74c3c',
      });
      // ETH
      const ethResp = await fetch('https://api.binance.com/api/v3/ticker/24hr?symbol=ETHUSDT');
      const ethData = await ethResp.json();
      setEth({
        price: '$' + parseFloat(ethData.lastPrice).toLocaleString(),
        change: parseFloat(ethData.priceChangePercent).toFixed(2) + '%',
        changeColor: parseFloat(ethData.priceChangePercent) >= 0 ? '#2ecc71' : '#e74c3c',
      });
    } catch (err) {
      setBtc({ price: 'Error', change: '--' });
      setEth({ price: 'Error', change: '--' });
    }
  }

  useEffect(() => {
    fetchAndShowPrices();
    const interval = setInterval(fetchAndShowPrices, 60000);
    return () => clearInterval(interval);
  }, []);

  return (
    <section className="market">
      <div className="coin">
        <img src="https://assets.coingecko.com/coins/images/1/small/bitcoin.png" alt="BTC" />
        <div className="info">
          <h2>BTC</h2>
          <p id="btc-price">{btc.price}</p>
          <span id="btc-change" style={{ color: btc.changeColor }}>{btc.change}</span>
        </div>
      </div>
      <div className="coin">
        <img src="https://assets.coingecko.com/coins/images/279/small/ethereum.png" alt="ETH" />
        <div className="info">
          <h2>ETH</h2>
          <p id="eth-price">{eth.price}</p>
          <span id="eth-change" style={{ color: eth.changeColor }}>{eth.change}</span>
        </div>
      </div>
    </section>
  );
}

export default Market; 