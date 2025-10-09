'use client';

import { useState, useEffect } from 'react';
import { io } from 'socket.io-client';
import axios from 'axios';
import { Chart } from 'react-chartjs-2';
import { Chart as ChartJS, LineElement, PointElement, LinearScale, CategoryScale, Tooltip, Legend } from 'chart.js';
import { motion, AnimatePresence } from 'framer-motion';

ChartJS.register(LineElement, PointElement, LinearScale, CategoryScale, Tooltip, Legend);

const Sidebar = () => (
  <aside className="bg-gray-900 text-white w-64 min-h-screen flex flex-col p-6 border-r border-gray-800">
    <h2 className="text-2xl font-bold mb-8">Aivestor</h2>
    <nav className="flex flex-col gap-4">
      <a href="/dashboard" className="hover:text-blue-400 transition">Dashboard</a>
      <a href="/users" className="hover:text-blue-400 transition">Portfolio</a>
      <a href="/risk-assessment" className="hover:text-blue-400 transition">Risk Assessment</a>
      <a href="/login" className="hover:text-blue-400 transition">Logout</a>
    </nav>
    <div className="mt-auto text-xs text-gray-500">&copy; 2024 Aivestor</div>
  </aside>
);

export default function Dashboard() {
  const [portfolio, setPortfolio] = useState(null);
  const [market, setMarket] = useState(null);
  const [nudges, setNudges] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : '';

  useEffect(() => {
    const socket = io('http://localhost:5000');
    socket.on('nudge', (nudge) => setNudges((prev) => [...prev, nudge]));
    socket.on('price_update', (update) => {
      setMarket((prev) => prev ? { ...prev, ...update } : prev);
    });
    return () => socket.disconnect();
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [portfolioRes, marketRes] = await Promise.all([
          axios.get('http://localhost:5000/api/portfolios/user/1', {
            headers: { Authorization: `Bearer ${token}` },
          }),
          axios.get('http://localhost:5000/api/market/top', {
            headers: { Authorization: `Bearer ${token}` },
          }),
        ]);
        const value = portfolioRes.data.reduce((sum, p) => sum + p.quantity * p.purchase_price, 0);
        const dailyChange = portfolioRes.data.reduce((sum, p) => sum + (p.daily_change || 0), 0);
        const totalGain = portfolioRes.data.reduce((sum, p) => sum + (p.total_gain || 0), 0);
        setPortfolio({ value, dailyChange, totalGain });
        setMarket(marketRes.data);
        setError('');
      } catch (err) {
        setError('Error fetching data');
      }
      setLoading(false);
    };
    fetchData();
  }, [token]);

  const portfolioData = {
    labels: ['Yesterday', 'Today'],
    datasets: [
      {
        label: 'Portfolio Value',
        data: [portfolio?.value - (portfolio?.dailyChange || 0), portfolio?.value],
        borderColor: 'rgba(59,130,246,0.7)',
        backgroundColor: 'rgba(59,130,246,0.2)',
        fill: true,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    plugins: { legend: { display: false }, tooltip: { enabled: true } },
    scales: { x: { display: false }, y: { display: false } },
  };

  return (
    <div className="flex min-h-screen bg-gray-950">
      <Sidebar />
      <main className="flex-1 p-8 overflow-y-auto">
        <header className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-white">Dashboard</h1>
          <button className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition">Refresh</button>
        </header>
        {loading ? (
          <div className="animate-pulse space-y-6">
            <div className="h-32 bg-gray-800 rounded-lg" />
            <div className="h-16 bg-gray-800 rounded-lg" />
            <div className="h-16 bg-gray-800 rounded-lg" />
          </div>
        ) : error ? (
          <div className="text-red-400">{error}</div>
        ) : (
          <>
            <section className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <motion.div layout className="bg-gray-900 p-6 rounded-lg shadow-lg flex flex-col items-center">
                <div className="text-gray-400 mb-2">Portfolio Value</div>
                <div className="text-3xl font-bold text-blue-400">£{portfolio.value.toFixed(2)}</div>
                <div className={portfolio.dailyChange >= 0 ? 'text-green-400' : 'text-red-400'}>
                  {portfolio.dailyChange >= 0 ? '+' : ''}{portfolio.dailyChange.toFixed(2)} ({((portfolio.dailyChange / portfolio.value) * 100).toFixed(2)}%) Today
                </div>
                <div className={portfolio.totalGain >= 0 ? 'text-green-400' : 'text-red-400'}>
                  {portfolio.totalGain >= 0 ? '+' : ''}{portfolio.totalGain.toFixed(2)} Total Gain
                </div>
                <div className="w-full mt-4">
                  <Chart type="line" data={portfolioData} options={chartOptions} height={60} />
                </div>
              </motion.div>
              <motion.div layout className="bg-gray-900 p-6 rounded-lg shadow-lg">
                <div className="text-gray-400 mb-2">Top Gainers</div>
                <ul>
                  {market?.gainers?.map((stock) => (
                    <li key={stock.ticker} className="flex justify-between items-center mb-2">
                      <span className="font-semibold">{stock.ticker}</span>
                      <span className="text-green-400 font-mono">+{stock.change_percent.toFixed(2)}%</span>
                    </li>
                  ))}
                </ul>
              </motion.div>
              <motion.div layout className="bg-gray-900 p-6 rounded-lg shadow-lg">
                <div className="text-gray-400 mb-2">Top Losers</div>
                <ul>
                  {market?.losers?.map((stock) => (
                    <li key={stock.ticker} className="flex justify-between items-center mb-2">
                      <span className="font-semibold">{stock.ticker}</span>
                      <span className="text-red-400 font-mono">{stock.change_percent.toFixed(2)}%</span>
                    </li>
                  ))}
                </ul>
              </motion.div>
            </section>
            <section className="bg-gray-900 p-6 rounded-lg shadow-lg mb-8">
              <h2 className="text-xl font-semibold mb-4 text-white">Nudges & Notifications</h2>
              <AnimatePresence>
                {nudges.length === 0 ? (
                  <div className="text-gray-400">No nudges yet.</div>
                ) : (
                  nudges.map((nudge, idx) => (
                    <motion.div
                      key={idx}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="bg-gray-800 p-4 rounded mb-2 text-gray-200"
                    >
                      {nudge.message}
                    </motion.div>
                  ))
                )}
              </AnimatePresence>
            </section>
          </>
        )}
      </main>
    </div>
  );
}