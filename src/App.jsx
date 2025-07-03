import React, { useState } from 'react';
import './App.css';
import Header from './components/Header';
import Market from './components/Market';
import Chart from './components/Chart';
import News from './components/News';
import OrderBook from './components/OrderBook';
import BullBearPower from './components/BullBearPower';

function App() {
  const [mainCoin, setMainCoin] = useState(() => localStorage.getItem('mainCoin') || 'BTCUSDT');

  // Сохранять выбор монеты в localStorage для совместимости с Chart
  const handleCoinChange = (coin) => {
    setMainCoin(coin);
    localStorage.setItem('mainCoin', coin);
  };

  return (
    <div className="container">
      <Header />
      <Market />
      <div className="main-content">
        <div className="main-left">
          <Chart mainCoin={mainCoin} onCoinChange={handleCoinChange} />
          <News />
          <BullBearPower symbol={mainCoin} limit={20} />
        </div>
        <div className="orderbook-sidebar">
          <OrderBook symbol={mainCoin} limit={20} />
        </div>
      </div>
    </div>
  );
}

export default App;
