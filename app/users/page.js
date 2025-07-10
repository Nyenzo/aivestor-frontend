'use client';

// Managing user data and portfolio visualization
import { useState, useEffect } from 'react';
import Head from 'next/head';
import { motion } from 'framer-motion';
import { Chart } from 'react-chartjs-2';
import { Chart as ChartJS, LineElement, PointElement, LinearScale, CategoryScale, Tooltip, Legend } from 'chart.js';
import axios from 'axios';

ChartJS.register(LineElement, PointElement, LinearScale, CategoryScale, Tooltip, Legend);

// Reusable price graph component
const PriceGraph = ({ data, options }) => {
  // Rendering the price graph with provided data and options
  return <Chart type="line" data={data} options={options} width={150} height={75} />;
};

export default function Users() {
  const [portfolio, setPortfolio] = useState({ value: 0, dailyChange: 0, totalGain: 0 });
  const [topGainers, setTopGainers] = useState([]);
  const [topLosers, setTopLosers] = useState([]);
  const token = localStorage.getItem('token');

  // Fetching user portfolio and market data
  useEffect(() => {
    const fetchData = async () => {
      try {
        const portfolioRes = await axios.get('http://localhost:5000/api/portfolios/user/1', {
          headers: { Authorization: `Bearer ${token}` },
        });
        const value = portfolioRes.data.reduce((sum, p) => sum + p.quantity * p.purchase_price, 0);
        const dailyChange = portfolioRes.data.reduce((sum, p) => sum + p.daily_change, 0);
        const totalGain = portfolioRes.data.reduce((sum, p) => sum + p.total_gain, 0);
        setPortfolio({ value, dailyChange, totalGain });

        const marketRes = await axios.get('http://localhost:5000/api/market/top', {
          headers: { Authorization: `Bearer ${token}` },
        });
        setTopGainers(marketRes.data.gainers.slice(0, 3));
        setTopLosers(marketRes.data.losers.slice(0, 3));
      } catch (err) {
        console.error('Error fetching data:', err);
      }
    };
    fetchData();
  }, [token]);

  // Configuring chart data for portfolio and stock prices
  const portfolioData = {
    labels: ['Yesterday', 'Today'],
    datasets: [
      {
        label: 'Portfolio Value (£)',
        data: [portfolio.value - portfolio.dailyChange, portfolio.value],
        borderColor: 'rgba(0, 255, 0, 0.7)',
        backgroundColor: 'rgba(0, 255, 0, 0.2)',
        fill: true,
      },
    ],
  };

  const graphOptions = {
    responsive: true,
    plugins: { legend: { display: false }, tooltip: { enabled: true } },
    scales: { x: { display: false }, y: { display: false } },
  };

  // Rendering the users page with portfolio and market data
  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <Head>
        <title>Aivestor Users</title>
      </Head>
      <header className="p-4 bg-gray-800 flex flex-col items-center">
        <h1 className="text-2xl font-bold mb-4">Aivestor Users</h1>
        <div className="w-full overflow-x-auto whitespace-nowrap">
          <div className="inline-block mr-4">
            <h2 className="text-lg font-semibold text-green-400">Top Gainers</h2>
            {topGainers.map((stock) => (
              <div key={stock.ticker} className="flex items-center mb-2">
                <span className="mr-2">{stock.ticker}</span>
                <span className="text-green-400">£{stock.price.toFixed(2)} (+{stock.change}%)</span>
                <PriceGraph
                  data={{
                    labels: ['Prev', 'Current'],
                    datasets: [{ data: [stock.price - (stock.change / 100) * stock.price, stock.price], borderColor: 'green', fill: false }],
                  }}
                  options={graphOptions}
                />
              </div>
            ))}
          </div>
          <div className="inline-block">
            <h2 className="text-lg font-semibold text-red-400">Top Losers</h2>
            {topLosers.map((stock) => (
              <div key={stock.ticker} className="flex items-center mb-2">
                <span className="mr-2">{stock.ticker}</span>
                <span className="text-red-400">£{stock.price.toFixed(2)} ({stock.change}%)</span>
                <PriceGraph
                  data={{
                    labels: ['Prev', 'Current'],
                    datasets: [{ data: [stock.price - (stock.change / 100) * stock.price, stock.price], borderColor: 'red', fill: false }],
                  }}
                  options={graphOptions}
                />
              </div>
            ))}
          </div>
        </div>
      </header>
      <div className="p-4">
        <h2 className="text-xl font-semibold">Portfolio Overview</h2>
        <div className="bg-gray-800 p-4 rounded-lg mt-2">
          <div className="text-2xl font-bold">£{portfolio.value.toFixed(2)}</div>
          <div className={portfolio.dailyChange >= 0 ? 'text-green-400' : 'text-red-400'}>
            {portfolio.dailyChange >= 0 ? '+' : ''}{portfolio.dailyChange.toFixed(2)} ({((portfolio.dailyChange / portfolio.value) * 100).toFixed(2)}%) Today
          </div>
          <div className={portfolio.totalGain >= 0 ? 'text-green-400' : 'text-red-400'}>
            {portfolio.totalGain >= 0 ? '+' : ''}{portfolio.totalGain.toFixed(2)} Total Gain
          </div>
          <PriceGraph data={portfolioData} options={graphOptions} />
        </div>
      </div>
    </div>
  );
}