'use client';

// Managing dashboard data and real-time updates
import { useState, useEffect } from 'react';
import Head from 'next/head';
import { motion } from 'framer-motion';
import { Chart } from 'react-chartjs-2';
import { Chart as ChartJS, LineElement, PointElement, LinearScale, CategoryScale, Tooltip, Legend } from 'chart.js';
import axios from 'axios';
import { io } from 'socket.io-client';

ChartJS.register(LineElement, PointElement, LinearScale, CategoryScale, Tooltip, Legend);

export default function Dashboard() {
  const [portfolio, setPortfolio] = useState({ value: 0, dailyChange: 0, totalGain: 0 });
  const [stocks, setStocks] = useState([]);
  const [nudges, setNudges] = useState([]);
  const token = localStorage.getItem('token');

  // Fetching initial data and setting up WebSocket for real-time updates
  useEffect(() => {
    const socket = io('http://localhost:5000');
    socket.on('nudge', (nudge) => setNudges((prev) => [...prev, nudge]));

    const fetchData = async () => {
      try {
        const portfolioRes = await axios.get('http://localhost:5000/api/portfolios/user/1', {
          headers: { Authorization: `Bearer ${token}` },
        });
        const value = portfolioRes.data.reduce((sum, p) => sum + p.quantity * p.purchase_price, 0);
        setPortfolio({ value, dailyChange: 0, totalGain: 0 });

        const stocksRes = await axios.get('http://localhost:5000/api/predict/AAPL', {
          headers: { Authorization: `Bearer ${token}` },
        });
        setStocks([stocksRes.data]);
      } catch (err) {
        console.error('Error fetching data:', err);
      }
    };
    fetchData();

    return () => socket.disconnect();
  }, [token]);

  // Configuring chart data for portfolio visualization
  const portfolioData = {
    labels: ['10 am', '7 pm', '9 pm'],
    datasets: [
      {
        label: 'Portfolio Value (£)',
        data: [portfolio.value - 100, portfolio.value - 50, portfolio.value],
        borderColor: 'rgba(0, 255, 0, 0.7)',
        backgroundColor: 'rgba(0, 255, 0, 0.2)',
        fill: true,
      },
    ],
  };

  const options = {
    responsive: true,
    plugins: { legend: { display: false }, tooltip: { enabled: true } },
    scales: { x: { display: false }, y: { display: false } },
  };

  // Rendering the dashboard UI with portfolio and nudge sections
  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <Head>
        <title>Aivestor Dashboard</title>
      </Head>
      <header className="p-4 bg-gray-800 flex justify-between items-center">
        <h1 className="text-2xl font-bold">Aivestor</h1>
        <div>
          <button className="mr-4 text-blue-400">Home</button>
          <button className="text-blue-400">News</button>
        </div>
      </header>
      <div className="overflow-x-auto whitespace-nowrap p-4 bg-gray-800">
        {stocks.map((stock) => (
          <motion.div
            key={stock.ticker}
            className="inline-block mx-2 p-2 bg-gray-700 rounded-lg"
            initial={{ x: 100 }}
            animate={{ x: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="text-sm">{stock.ticker}</div>
            <div className="text-lg font-bold">£{stock.short_term_probabilities.Buy.toFixed(2)}</div>
            <div className={stock.change >= 0 ? 'text-green-400' : 'text-red-400'}>+{stock.change}%</div>
            <Chart type="line" data={portfolioData} options={options} width={100} height={50} />
          </motion.div>
        ))}
      </div>
      <div className="p-4">
        <h2 className="text-xl font-semibold">Portfolio Performance</h2>
        <div className="bg-gray-800 p-4 rounded-lg mt-2">
          <div className="text-2xl font-bold">£{portfolio.value.toFixed(2)}</div>
          <div className={portfolio.dailyChange >= 0 ? 'text-green-400' : 'text-red-400'}>
            {portfolio.dailyChange >= 0 ? '+' : ''}{portfolio.dailyChange.toFixed(2)} ({((portfolio.dailyChange / portfolio.value) * 100).toFixed(2)}%) Today
          </div>
          <div className="text-green-400">+£{portfolio.totalGain.toFixed(2)} Total Gain</div>
          <Chart type="line" data={portfolioData} options={options} />
        </div>
        <h2 className="text-xl font-semibold mt-6">Nudges</h2>
        <div className="bg-gray-800 p-4 rounded-lg mt-2">
          {nudges.map((nudge, index) => (
            <p key={index} className="text-gray-300">{nudge.message}</p>
          ))}
        </div>
      </div>
    </div>
  );
}