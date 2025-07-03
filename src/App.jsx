import React from 'react';
import './App.css';
import Header from './components/Header';
import Market from './components/Market';
import Chart from './components/Chart';
import News from './components/News';

function App() {
  return (
    <div className="container">
      <Header />
      <Market />
      <Chart />
      <News />
    </div>
  );
}

export default App;
