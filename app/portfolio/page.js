'use client';

import { useCallback, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import {
  TrendingUp,
  TrendingDown,
  PlusCircle,
  MinusCircle,
  Activity,
  DollarSign,
  Percent,
  History,
  RefreshCw,
  Search,
  Filter
} from 'lucide-react';
import {
  getUserPortfolio,
  subscribeToPortfolio,
  subscribeToTransactions,
  addTransaction,
  updatePosition,
  removePosition
} from '../lib/firestore.service';
import { DashboardSummarySkeleton, TableSkeleton } from '../components/Skeletons';
import { showSuccess, showError } from '../lib/toast';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

function formatCurrency(value = 0) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(Number(value) || 0);
}

function formatPercent(value = 0) {
  return `${(Number(value) || 0).toFixed(2)}%`;
}

export default function PortfolioPage() {
  const router = useRouter();
  const [token, setToken] = useState('');
  const [userId, setUserId] = useState('');
  const [portfolio, setPortfolio] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Modal states
  const [showTradeModal, setShowTradeModal] = useState(false);
  const [tradeType, setTradeType] = useState('buy'); // 'buy' or 'sell'
  const [selectedStock, setSelectedStock] = useState(null);
  const [tradeQuantity, setTradeQuantity] = useState('');
  const [tradePrice, setTradePrice] = useState('');
  const [searchTicker, setSearchTicker] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  
  // Filter states
  const [filterType, setFilterType] = useState('all'); // 'all', 'buy', 'sell'
  const [sortBy, setSortBy] = useState('date'); // 'date', 'symbol', 'value'

  // Initialize and authenticate
  useEffect(() => {
    const storedToken = localStorage.getItem('token');
    const storedUser = localStorage.getItem('user');
    
    if (!storedToken) {
      router.push('/login');
      return;
    }
    
    setToken(storedToken);
    
    if (storedUser) {
      try {
        const user = JSON.parse(storedUser);
        setUserId(user.id || user.uid);
      } catch (e) {
        console.error('Error parsing user:', e);
      }
    }
  }, [router]);

  // Subscribe to portfolio changes
  useEffect(() => {
    if (!userId) return;
    
    setLoading(true);
    
    const unsubscribe = subscribeToPortfolio(
      userId,
      (portfolioData) => {
        setPortfolio(portfolioData);
        setLoading(false);
      },
      (err) => {
        setError(err.message);
        setLoading(false);
      }
    );
    
    return () => unsubscribe();
  }, [userId]);

  // Subscribe to transactions
  useEffect(() => {
    if (!userId) return;
    
    const unsubscribe = subscribeToTransactions(
      userId,
      (transactionData) => {
        setTransactions(transactionData);
      },
      (err) => {
        console.error('Transaction subscription error:', err);
      }
    );
    
    return () => unsubscribe();
  }, [userId]);

  // Search for stocks
  const handleSearchStock = useCallback(async () => {
    if (!searchTicker.trim()) return;
    
    try {
      const response = await axios.get(
        `${API_URL}/api/search?query=${searchTicker}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setSearchResults(response.data.results || []);
    } catch (err) {
      console.error('Search error:', err);
    }
  }, [searchTicker, token]);

  // Handle buy/sell
  const handleTrade = useCallback(async () => {
    if (!selectedStock || !tradeQuantity || !tradePrice) {
      alert('Please fill in all fields');
      return;
    }
    
    const quantity = parseFloat(tradeQuantity);
    const price = parseFloat(tradePrice);
    
    if (isNaN(quantity) || isNaN(price) || quantity <= 0 || price <= 0) {
      alert('Please enter valid numbers');
      return;
    }
    
    setSubmitting(true);
    
    try {
      // Add transaction to Firestore
      await addTransaction(userId, {
        symbol: selectedStock.symbol || selectedStock.stock_symbol,
        type: tradeType,
        quantity,
        price,
        total: quantity * price,
        companyName: selectedStock.company_name || selectedStock.name
      });
      
      // Update position in portfolio
      const existingPosition = portfolio?.positions?.find(
        p => p.stock_symbol === (selectedStock.symbol || selectedStock.stock_symbol)
      );
      
      if (tradeType === 'buy') {
        const newQuantity = (existingPosition?.quantity || 0) + quantity;
        const newAvgPrice = existingPosition
          ? ((existingPosition.purchase_price * existingPosition.quantity) + (price * quantity)) / newQuantity
          : price;
        
        await updatePosition(userId, selectedStock.symbol || selectedStock.stock_symbol, {
          stock_symbol: selectedStock.symbol || selectedStock.stock_symbol,
          company_name: selectedStock.company_name || selectedStock.name,
          quantity: newQuantity,
          purchase_price: newAvgPrice,
          current_price: price
        });
      } else {
        // Sell
        if (!existingPosition || existingPosition.quantity < quantity) {
          alert('Insufficient shares to sell');
          setSubmitting(false);
          return;
        }
        
        const newQuantity = existingPosition.quantity - quantity;
        
        if (newQuantity === 0) {
          await removePosition(userId, selectedStock.symbol || selectedStock.stock_symbol);
        } else {
          await updatePosition(userId, selectedStock.symbol || selectedStock.stock_symbol, {
            quantity: newQuantity
          });
        }
      }
      
      // Close modal and reset
      setShowTradeModal(false);
      setSelectedStock(null);
      setTradeQuantity('');
      setTradePrice('');
      setSearchTicker('');
      setSearchResults([]);
    } catch (err) {
      console.error('Trade error:', err);
      alert('Failed to execute trade: ' + err.message);
    } finally {
      setSubmitting(false);
    }
  }, [selectedStock, tradeQuantity, tradePrice, tradeType, userId, portfolio]);

  // Calculate portfolio summary
  const summary = {
    totalValue: 0,
    totalCost: 0,
    totalGain: 0,
    totalGainPercent: 0,
    dayChange: 0,
    dayChangePercent: 0
  };

  if (portfolio?.positions) {
    portfolio.positions.forEach(pos => {
      const value = pos.quantity * pos.current_price;
      const cost = pos.quantity * pos.purchase_price;
      summary.totalValue += value;
      summary.totalCost += cost;
      summary.totalGain += (value - cost);
      summary.dayChange += pos.daily_change || 0;
    });
    
    if (summary.totalCost > 0) {
      summary.totalGainPercent = (summary.totalGain / summary.totalCost) * 100;
    }
    if (summary.totalValue > 0) {
      summary.dayChangePercent = (summary.dayChange / summary.totalValue) * 100;
    }
  }

  // Filter and sort transactions
  const filteredTransactions = transactions
    .filter(t => filterType === 'all' || t.type === filterType)
    .sort((a, b) => {
      if (sortBy === 'date') {
        return b.timestamp?.seconds - a.timestamp?.seconds;
      } else if (sortBy === 'symbol') {
        return (a.symbol || '').localeCompare(b.symbol || '');
      } else if (sortBy === 'value') {
        return (b.total || 0) - (a.total || 0);
      }
      return 0;
    });

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-white mb-2">Portfolio</h1>
          </div>
          <DashboardSummarySkeleton />
          <div className="mt-8 bg-gray-800 rounded-lg p-6">
            <TableSkeleton rows={6} columns={7} />
          </div>
          <div className="mt-8 bg-gray-800 rounded-lg p-6">
            <TableSkeleton rows={5} columns={5} />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-4xl font-bold text-white">Portfolio</h1>
          <div className="flex gap-4">
            <button
              onClick={() => { setTradeType('buy'); setShowTradeModal(true); }}
              className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg font-semibold transition"
            >
              <PlusCircle className="w-5 h-5" />
              Buy
            </button>
            <button
              onClick={() => { setTradeType('sell'); setShowTradeModal(true); }}
              className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-lg font-semibold transition"
            >
              <MinusCircle className="w-5 h-5" />
              Sell
            </button>
          </div>
        </div>

        {error && (
          <div className="bg-red-500/20 border border-red-500 text-red-200 p-4 rounded-lg mb-6">
            {error}
          </div>
        )}

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-gray-800 p-6 rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <span className="text-gray-400">Total Value</span>
              <DollarSign className="w-5 h-5 text-blue-400" />
            </div>
            <div className="text-3xl font-bold text-white">{formatCurrency(summary.totalValue)}</div>
          </div>
          
          <div className="bg-gray-800 p-6 rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <span className="text-gray-400">Total Gain/Loss</span>
              {summary.totalGain >= 0 ? (
                <TrendingUp className="w-5 h-5 text-green-400" />
              ) : (
                <TrendingDown className="w-5 h-5 text-red-400" />
              )}
            </div>
            <div className={`text-3xl font-bold ${summary.totalGain >= 0 ? 'text-green-400' : 'text-red-400'}`}>
              {formatCurrency(summary.totalGain)}
            </div>
            <div className="text-sm text-gray-400">{formatPercent(summary.totalGainPercent)}</div>
          </div>
          
          <div className="bg-gray-800 p-6 rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <span className="text-gray-400">Day Change</span>
              <Activity className="w-5 h-5 text-blue-400" />
            </div>
            <div className={`text-3xl font-bold ${summary.dayChange >= 0 ? 'text-green-400' : 'text-red-400'}`}>
              {formatCurrency(summary.dayChange)}
            </div>
            <div className="text-sm text-gray-400">{formatPercent(summary.dayChangePercent)}</div>
          </div>
          
          <div className="bg-gray-800 p-6 rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <span className="text-gray-400">Holdings</span>
              <Percent className="w-5 h-5 text-blue-400" />
            </div>
            <div className="text-3xl font-bold text-white">{portfolio?.positions?.length || 0}</div>
          </div>
        </div>

        {/* Holdings Table */}
        <div className="bg-gray-800 rounded-lg p-6 mb-8">
          <h2 className="text-2xl font-bold text-white mb-4">Holdings</h2>
          {portfolio?.positions && portfolio.positions.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-700">
                    <th className="text-left text-gray-400 pb-3">Symbol</th>
                    <th className="text-left text-gray-400 pb-3">Company</th>
                    <th className="text-right text-gray-400 pb-3">Shares</th>
                    <th className="text-right text-gray-400 pb-3">Avg Cost</th>
                    <th className="text-right text-gray-400 pb-3">Current Price</th>
                    <th className="text-right text-gray-400 pb-3">Value</th>
                    <th className="text-right text-gray-400 pb-3">Gain/Loss</th>
                  </tr>
                </thead>
                <tbody>
                  {portfolio.positions.map((position, idx) => {
                    const value = position.quantity * position.current_price;
                    const cost = position.quantity * position.purchase_price;
                    const gain = value - cost;
                    const gainPercent = (gain / cost) * 100;
                    
                    return (
                      <tr key={idx} className="border-b border-gray-700">
                        <td className="py-4 text-white font-semibold">{position.stock_symbol}</td>
                        <td className="py-4 text-gray-300">{position.company_name}</td>
                        <td className="py-4 text-right text-white">{position.quantity}</td>
                        <td className="py-4 text-right text-gray-300">{formatCurrency(position.purchase_price)}</td>
                        <td className="py-4 text-right text-white">{formatCurrency(position.current_price)}</td>
                        <td className="py-4 text-right text-white font-semibold">{formatCurrency(value)}</td>
                        <td className={`py-4 text-right font-semibold ${gain >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                          {formatCurrency(gain)}
                          <div className="text-sm">{formatPercent(gainPercent)}</div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center text-gray-400 py-8">
              No holdings yet. Click Buy to add your first position.
            </div>
          )}
        </div>

        {/* Transaction History */}
        <div className="bg-gray-800 rounded-lg p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold text-white flex items-center gap-2">
              <History className="w-6 h-6" />
              Transaction History
            </h2>
            <div className="flex gap-4">
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="bg-gray-700 text-white px-4 py-2 rounded-lg"
              >
                <option value="all">All</option>
                <option value="buy">Buy</option>
                <option value="sell">Sell</option>
              </select>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="bg-gray-700 text-white px-4 py-2 rounded-lg"
              >
                <option value="date">Date</option>
                <option value="symbol">Symbol</option>
                <option value="value">Value</option>
              </select>
            </div>
          </div>
          
          {filteredTransactions.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-700">
                    <th className="text-left text-gray-400 pb-3">Date</th>
                    <th className="text-left text-gray-400 pb-3">Type</th>
                    <th className="text-left text-gray-400 pb-3">Symbol</th>
                    <th className="text-right text-gray-400 pb-3">Quantity</th>
                    <th className="text-right text-gray-400 pb-3">Price</th>
                    <th className="text-right text-gray-400 pb-3">Total</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredTransactions.map((transaction) => (
                    <tr key={transaction.id} className="border-b border-gray-700">
                      <td className="py-4 text-gray-300">
                        {transaction.timestamp?.toDate?.()?.toLocaleDateString() || 'N/A'}
                      </td>
                      <td className="py-4">
                        <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
                          transaction.type === 'buy' 
                            ? 'bg-green-500/20 text-green-400' 
                            : 'bg-red-500/20 text-red-400'
                        }`}>
                          {transaction.type?.toUpperCase()}
                        </span>
                      </td>
                      <td className="py-4 text-white font-semibold">{transaction.symbol}</td>
                      <td className="py-4 text-right text-white">{transaction.quantity}</td>
                      <td className="py-4 text-right text-gray-300">{formatCurrency(transaction.price)}</td>
                      <td className="py-4 text-right text-white font-semibold">{formatCurrency(transaction.total)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center text-gray-400 py-8">
              No transactions found.
            </div>
          )}
        </div>

        {/* Trade Modal */}
        {showTradeModal && (
          <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
            <div className="bg-gray-800 rounded-lg p-8 max-w-md w-full">
              <h2 className="text-2xl font-bold text-white mb-6">
                {tradeType === 'buy' ? 'Buy' : 'Sell'} Stock
              </h2>
              
              {!selectedStock && (
                <div className="mb-6">
                  <label className="block text-gray-400 mb-2">Search Stock</label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={searchTicker}
                      onChange={(e) => setSearchTicker(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && handleSearchStock()}
                      placeholder="Enter ticker symbol"
                      className="flex-1 bg-gray-700 text-white px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <button
                      onClick={handleSearchStock}
                      className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg"
                    >
                      <Search className="w-5 h-5" />
                    </button>
                  </div>
                  
                  {searchResults.length > 0 && (
                    <div className="mt-4 bg-gray-700 rounded-lg max-h-60 overflow-y-auto">
                      {searchResults.map((stock, idx) => (
                        <button
                          key={idx}
                          onClick={() => {
                            setSelectedStock(stock);
                            setTradePrice(stock.price || '');
                          }}
                          className="w-full text-left px-4 py-3 hover:bg-gray-600 border-b border-gray-600 last:border-b-0"
                        >
                          <div className="font-semibold text-white">{stock.symbol}</div>
                          <div className="text-sm text-gray-400">{stock.name}</div>
                        </button>
                      ))}
                    </div>
                  )}
                  
                  {tradeType === 'sell' && portfolio?.positions && (
                    <div className="mt-4">
                      <p className="text-gray-400 mb-2">Or select from holdings:</p>
                      <div className="bg-gray-700 rounded-lg max-h-60 overflow-y-auto">
                        {portfolio.positions.map((pos, idx) => (
                          <button
                            key={idx}
                            onClick={() => {
                              setSelectedStock(pos);
                              setTradePrice(pos.current_price?.toString() || '');
                            }}
                            className="w-full text-left px-4 py-3 hover:bg-gray-600 border-b border-gray-600 last:border-b-0"
                          >
                            <div className="font-semibold text-white">{pos.stock_symbol}</div>
                            <div className="text-sm text-gray-400">
                              {pos.company_name} • {pos.quantity} shares
                            </div>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
              
              {selectedStock && (
                <>
                  <div className="bg-gray-700 p-4 rounded-lg mb-6">
                    <div className="font-semibold text-white text-lg">
                      {selectedStock.symbol || selectedStock.stock_symbol}
                    </div>
                    <div className="text-sm text-gray-400">
                      {selectedStock.name || selectedStock.company_name}
                    </div>
                  </div>
                  
                  <div className="mb-4">
                    <label className="block text-gray-400 mb-2">Quantity</label>
                    <input
                      type="number"
                      value={tradeQuantity}
                      onChange={(e) => setTradeQuantity(e.target.value)}
                      min="1"
                      step="1"
                      className="w-full bg-gray-700 text-white px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  
                  <div className="mb-6">
                    <label className="block text-gray-400 mb-2">Price per Share</label>
                    <input
                      type="number"
                      value={tradePrice}
                      onChange={(e) => setTradePrice(e.target.value)}
                      min="0.01"
                      step="0.01"
                      className="w-full bg-gray-700 text-white px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  
                  {tradeQuantity && tradePrice && (
                    <div className="bg-gray-700 p-4 rounded-lg mb-6">
                      <div className="flex justify-between text-white">
                        <span>Total:</span>
                        <span className="font-bold">{formatCurrency(parseFloat(tradeQuantity) * parseFloat(tradePrice))}</span>
                      </div>
                    </div>
                  )}
                </>
              )}
              
              <div className="flex gap-4">
                <button
                  onClick={() => {
                    setShowTradeModal(false);
                    setSelectedStock(null);
                    setTradeQuantity('');
                    setTradePrice('');
                    setSearchTicker('');
                    setSearchResults([]);
                  }}
                  className="flex-1 bg-gray-700 hover:bg-gray-600 text-white px-6 py-3 rounded-lg font-semibold transition"
                  disabled={submitting}
                >
                  Cancel
                </button>
                <button
                  onClick={handleTrade}
                  disabled={!selectedStock || !tradeQuantity || !tradePrice || submitting}
                  className={`flex-1 ${
                    tradeType === 'buy' 
                      ? 'bg-green-600 hover:bg-green-700' 
                      : 'bg-red-600 hover:bg-red-700'
                  } text-white px-6 py-3 rounded-lg font-semibold transition disabled:opacity-50 disabled:cursor-not-allowed`}
                >
                  {submitting ? 'Processing...' : `Confirm ${tradeType === 'buy' ? 'Buy' : 'Sell'}`}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
