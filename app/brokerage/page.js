"use client";

import { useCallback, useEffect, useState } from "react";
import axios from "axios";
import {
    Link2,
    Link2Off,
    RefreshCw,
    ArrowUpDown,
    TrendingUp,
    TrendingDown,
    Briefcase,
    CheckCircle2,
    XCircle,
} from "lucide-react";
import { useRouter } from "next/navigation";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

const BROKERS = [
    { name: "Alpaca", description: "Commission-free stock and crypto trading API" },
    { name: "TD Ameritrade", description: "Full-featured brokerage with extensive market data" },
    { name: "Interactive Brokers", description: "Professional-grade trading platform" },
    { name: "Robinhood", description: "Simple, mobile-first investing" },
];

function formatCurrency(value = 0) {
    return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(Number(value) || 0);
}

export default function BrokeragePage() {
    const router = useRouter();
    const [token, setToken] = useState("");
    const [connections, setConnections] = useState([]);
    const [positions, setPositions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [syncing, setSyncing] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const [tradeForm, setTradeForm] = useState({ symbol: "", type: "buy", quantity: "", price: "" });
    const [tradeLoading, setTradeLoading] = useState(false);

    const authHeaders = useCallback(
        (t) => ({ headers: { Authorization: `Bearer ${t || token}` } }),
        [token]
    );

    useEffect(() => {
        if (typeof window === "undefined") return;
        const storedToken = localStorage.getItem("token");
        if (!storedToken) { router.replace("/login"); return; }
        setToken(storedToken);
        fetchStatus(storedToken);
    }, [router]);

    const fetchStatus = async (t) => {
        try {
            setLoading(true);
            const { data } = await axios.get(`${API_URL}/api/brokerage/status`, { headers: { Authorization: `Bearer ${t}` } });
            setConnections(data);
        } catch (err) {
            if (err?.response?.status === 401) { router.replace("/login"); return; }
            setError("Failed to load brokerage status");
        } finally {
            setLoading(false);
        }
    };

    const handleConnect = async (brokerName) => {
        try {
            setError(""); setSuccess("");
            const { data } = await axios.post(`${API_URL}/api/brokerage/connect`, { brokerName }, authHeaders());
            setSuccess(`${data.message} to ${brokerName}`);
            fetchStatus(token);
        } catch (err) {
            setError(err?.response?.data?.error || "Connection failed");
        }
    };

    const handleDisconnect = async (brokerName) => {
        try {
            setError(""); setSuccess("");
            await axios.delete(`${API_URL}/api/brokerage/disconnect`, { ...authHeaders(), data: { brokerName } });
            setSuccess(`Disconnected from ${brokerName}`);
            fetchStatus(token);
        } catch (err) {
            setError(err?.response?.data?.error || "Disconnect failed");
        }
    };

    const handleSync = async () => {
        try {
            setError(""); setSuccess(""); setSyncing(true);
            const { data } = await axios.post(`${API_URL}/api/brokerage/sync`, {}, authHeaders());
            setPositions(data.positions || []);
            setSuccess(data.message);
        } catch (err) {
            setError(err?.response?.data?.error || "Sync failed");
        } finally {
            setSyncing(false);
        }
    };

    const handleTrade = async (e) => {
        e.preventDefault();
        if (!tradeForm.symbol || !tradeForm.quantity || !tradeForm.price) {
            setError("All trade fields are required");
            return;
        }
        try {
            setError(""); setSuccess(""); setTradeLoading(true);
            const { data } = await axios.post(`${API_URL}/api/brokerage/trade`, tradeForm, authHeaders());
            setPositions(data.positions || []);
            setSuccess(`${tradeForm.type.toUpperCase()} ${tradeForm.quantity} shares of ${tradeForm.symbol.toUpperCase()} at ${formatCurrency(tradeForm.price)}`);
            setTradeForm({ symbol: "", type: "buy", quantity: "", price: "" });
        } catch (err) {
            setError(err?.response?.data?.error || "Trade failed");
        } finally {
            setTradeLoading(false);
        }
    };

    const connectedBrokers = connections.filter(c => c.status === "connected").map(c => c.brokerName);

    return (
        <div className="min-h-screen bg-gray-950 text-gray-200">
            <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <header className="mb-8">
                    <h1 className="text-2xl font-bold flex items-center gap-3">
                        <Briefcase className="text-blue-400" size={28} /> Brokerage
                    </h1>
                    <p className="text-gray-400 mt-1">Connect your brokerage accounts and manage trades</p>
                </header>

                {error && (
                    <div className="mb-4 rounded-lg border border-red-700/40 bg-red-900/20 p-3 text-red-200 text-sm flex items-center gap-2">
                        <XCircle size={16} /> {error}
                    </div>
                )}
                {success && (
                    <div className="mb-4 rounded-lg border border-green-700/40 bg-green-900/20 p-3 text-green-200 text-sm flex items-center gap-2">
                        <CheckCircle2 size={16} /> {success}
                    </div>
                )}

                {/* Brokerage connections */}
                <section className="mb-8">
                    <h2 className="text-lg font-semibold mb-4">Available Brokerages</h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                        {BROKERS.map((broker) => {
                            const isConnected = connectedBrokers.includes(broker.name);
                            return (
                                <div key={broker.name} className={`rounded-xl border p-4 transition ${isConnected ? "border-green-700/60 bg-green-900/10" : "border-gray-800 bg-gray-900/60 hover:border-gray-600"}`}>
                                    <div className="mb-3">
                                        <div className="text-white font-semibold">{broker.name}</div>
                                        <div className="text-gray-400 text-xs mt-1">{broker.description}</div>
                                    </div>
                                    {isConnected ? (
                                        <div className="space-y-2">
                                            <div className="flex items-center gap-1 text-green-400 text-xs">
                                                <CheckCircle2 size={14} /> Connected
                                            </div>
                                            <button
                                                onClick={() => handleDisconnect(broker.name)}
                                                className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg bg-red-900/30 hover:bg-red-900/50 text-red-300 text-sm transition"
                                            >
                                                <Link2Off size={14} /> Disconnect
                                            </button>
                                        </div>
                                    ) : (
                                        <button
                                            onClick={() => handleConnect(broker.name)}
                                            className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-sm transition"
                                        >
                                            <Link2 size={14} /> Connect
                                        </button>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </section>

                {/* Sync & Trade */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Portfolio sync */}
                    <section className="bg-gray-900/60 border border-gray-800 rounded-xl p-5">
                        <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                            <RefreshCw size={18} className="text-blue-400" /> Portfolio Sync
                        </h2>
                        <p className="text-gray-400 text-sm mb-4">
                            Import your holdings from your connected brokerage account.
                        </p>
                        <button
                            onClick={handleSync}
                            disabled={syncing || connectedBrokers.length === 0}
                            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white transition disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            <RefreshCw size={16} className={syncing ? "animate-spin" : ""} />
                            {syncing ? "Syncing..." : "Sync Portfolio"}
                        </button>

                        {positions.length > 0 && (
                            <div className="mt-4 space-y-2">
                                <div className="text-sm text-gray-400 font-medium">Synced Positions</div>
                                {positions.map((p, i) => (
                                    <div key={i} className="flex items-center justify-between p-2 rounded-lg bg-gray-800/40">
                                        <div>
                                            <div className="text-white font-semibold text-sm">{p.stock_symbol}</div>
                                            <div className="text-gray-400 text-xs">{p.quantity} shares @ {formatCurrency(p.averagePrice)}</div>
                                        </div>
                                        <div className="text-right">
                                            <div className="text-white text-sm">{formatCurrency(p.currentPrice)}</div>
                                            <div className={`text-xs ${p.currentPrice >= p.averagePrice ? "text-green-400" : "text-red-400"}`}>
                                                {p.currentPrice >= p.averagePrice ? "+" : ""}{((p.currentPrice - p.averagePrice) / p.averagePrice * 100).toFixed(2)}%
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </section>

                    {/* Trade simulation */}
                    <section className="bg-gray-900/60 border border-gray-800 rounded-xl p-5">
                        <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                            <ArrowUpDown size={18} className="text-purple-400" /> Trade Simulation
                        </h2>
                        <form onSubmit={handleTrade} className="space-y-3">
                            <div>
                                <label className="text-xs text-gray-400 block mb-1">Symbol</label>
                                <input
                                    type="text"
                                    value={tradeForm.symbol}
                                    onChange={(e) => setTradeForm({ ...tradeForm, symbol: e.target.value.toUpperCase() })}
                                    placeholder="AAPL"
                                    className="w-full px-3 py-2 rounded-lg bg-gray-800 border border-gray-700 focus:border-blue-500 focus:outline-none text-white text-sm"
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="text-xs text-gray-400 block mb-1">Type</label>
                                    <select
                                        value={tradeForm.type}
                                        onChange={(e) => setTradeForm({ ...tradeForm, type: e.target.value })}
                                        className="w-full px-3 py-2 rounded-lg bg-gray-800 border border-gray-700 focus:border-blue-500 focus:outline-none text-white text-sm"
                                    >
                                        <option value="buy">Buy</option>
                                        <option value="sell">Sell</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="text-xs text-gray-400 block mb-1">Quantity</label>
                                    <input
                                        type="number"
                                        min="1"
                                        value={tradeForm.quantity}
                                        onChange={(e) => setTradeForm({ ...tradeForm, quantity: e.target.value })}
                                        placeholder="10"
                                        className="w-full px-3 py-2 rounded-lg bg-gray-800 border border-gray-700 focus:border-blue-500 focus:outline-none text-white text-sm"
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="text-xs text-gray-400 block mb-1">Price ($)</label>
                                <input
                                    type="number"
                                    step="0.01"
                                    value={tradeForm.price}
                                    onChange={(e) => setTradeForm({ ...tradeForm, price: e.target.value })}
                                    placeholder="185.50"
                                    className="w-full px-3 py-2 rounded-lg bg-gray-800 border border-gray-700 focus:border-blue-500 focus:outline-none text-white text-sm"
                                />
                            </div>
                            <button
                                type="submit"
                                disabled={tradeLoading || connectedBrokers.length === 0}
                                className={`w-full flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-white text-sm transition disabled:opacity-50 disabled:cursor-not-allowed ${tradeForm.type === "buy" ? "bg-green-600 hover:bg-green-700" : "bg-red-600 hover:bg-red-700"
                                    }`}
                            >
                                {tradeForm.type === "buy" ? <TrendingUp size={16} /> : <TrendingDown size={16} />}
                                {tradeLoading ? "Processing..." : `${tradeForm.type === "buy" ? "Buy" : "Sell"} Shares`}
                            </button>
                        </form>
                    </section>
                </div>
            </div>
        </div>
    );
}
