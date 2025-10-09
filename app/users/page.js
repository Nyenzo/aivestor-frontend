'use client';

// Managing user data and portfolio visualization
import { useState, useEffect } from 'react';
import Head from 'next/head';
import { motion } from 'framer-motion';
import { Chart } from 'react-chartjs-2';
import { Chart as ChartJS, LineElement, PointElement, LinearScale, CategoryScale, Tooltip, Legend } from 'chart.js';
import axios from 'axios';

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

const MiniChart = ({ data, color }) => (
  <Chart
    type="line"
    data={data}
    options={{
      responsive: true,
      plugins: { legend: { display: false }, tooltip: { enabled: true } },
      scales: { x: { display: false }, y: { display: false } },
    }}
    width={80}
    height={40}
  />
);

export default function Users() {
  const [portfolio, setPortfolio] = useState([]);
  const [topGainers, setTopGainers] = useState([]);
  const [topLosers, setTopLosers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : '';

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
        setPortfolio(portfolioRes.data);
        setTopGainers(marketRes.data.gainers);
        setTopLosers(marketRes.data.losers);
        setError('');
      } catch (err) {
        setError('Error fetching data');
      }
      setLoading(false);
    };
    fetchData();
  }, [token]);

  return (
    <div className="flex min-h-screen bg-gray-950">
      <Sidebar />
      <main className="flex-1 p-8 overflow-y-auto">
        <header className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-white">Portfolio Overview</h1>
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
            <section className="mb-8">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {portfolio.length === 0 ? (
                  <div className="col-span-full text-gray-400">No portfolio entries found.</div>
                ) : (
                  portfolio.map((stock) => {
                    const miniData = {
                      labels: ['Prev', 'Current'],
                      datasets: [
                        {
                          data: [stock.purchase_price, stock.purchase_price + (stock.daily_change || 0) / (stock.quantity || 1)],
                          borderColor: stock.daily_change >= 0 ? 'green' : 'red',
                          fill: false,
                        },
                      ],
                    };
                    return (
                      <motion.div
                        key={stock.id}
                        className="bg-gray-900 p-6 rounded-lg shadow-lg flex flex-col gap-2"
                        whileHover={{ scale: 1.03 }}
                        transition={{ type: 'spring', stiffness: 300 }}
                      >
                        <div className="flex justify-between items-center mb-2">
                          <span className="font-bold text-lg">{stock.stock_symbol}</span>
                          <span className={stock.daily_change >= 0 ? 'text-green-400' : 'text-red-400'}>
                            {stock.daily_change >= 0 ? '+' : ''}{stock.daily_change?.toFixed(2)} Today
                          </span>
                        </div>
                        <div className="flex items-center gap-4">
                          <div>
                            <div className="text-gray-400 text-xs">Quantity</div>
                            <div className="font-mono">{stock.quantity}</div>
                          </div>
                          <div>
                            <div className="text-gray-400 text-xs">Purchase Price</div>
                            <div className="font-mono">£{stock.purchase_price.toFixed(2)}</div>
                          </div>
                          <div>
                            <div className="text-gray-400 text-xs">Total Gain</div>
                            <div className={stock.total_gain >= 0 ? 'text-green-400' : 'text-red-400'}>
                              {stock.total_gain >= 0 ? '+' : ''}{stock.total_gain?.toFixed(2)}
                            </div>
                          </div>
                        </div>
                        <div className="mt-2">
                          <MiniChart data={miniData} color={stock.daily_change >= 0 ? 'green' : 'red'} />
                        </div>
                      </motion.div>
                    );
                  })
                )}
              </div>
            </section>
            <section className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              <div className="bg-gray-900 p-6 rounded-lg shadow-lg">
                <h2 className="text-lg font-semibold text-green-400 mb-4">Top Gainers</h2>
                <ul>
                  {topGainers.map((stock) => (
                    <li key={stock.ticker} className="flex justify-between items-center mb-2">
                      <span className="font-semibold">{stock.ticker}</span>
                      <span className="text-green-400 font-mono">+{stock.change_percent.toFixed(2)}%</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="bg-gray-900 p-6 rounded-lg shadow-lg">
                <h2 className="text-lg font-semibold text-red-400 mb-4">Top Losers</h2>
                <ul>
                  {topLosers.map((stock) => (
                    <li key={stock.ticker} className="flex justify-between items-center mb-2">
                      <span className="font-semibold">{stock.ticker}</span>
                      <span className="text-red-400 font-mono">{stock.change_percent.toFixed(2)}%</span>
                    </li>
                  ))}
                </ul>
              </div>
            </section>
          </>
        )}
      </main>
    </div>
  );
}