"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import axios from "axios";
import io from "socket.io-client";
import {
  AlertTriangle,
  BarChart2,
  Briefcase,
  Eye,
  Menu,
  Newspaper,
  RefreshCw,
  SlidersHorizontal,
  TrendingDown,
  TrendingUp,
} from "lucide-react";
import { useRouter } from "next/navigation";

import MarketTicker from "../components/MarketTicker";
import PortfolioChart from "../components/PortfolioChart";
import StockItem from "../components/StockItem";
import { computeRisk as computeVolatilityRisk } from "../lib/risk";
import { subscribeToPortfolio, subscribeToTransactions } from '../lib/firestore.service';
import { DashboardSummarySkeleton, TableSkeleton } from '../components/Skeletons';

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

const DEMO_POSITIONS = [
  { stock_symbol: "NFLX", company_name: "Netflix, Inc.", quantity: 10, purchase_price: 500, current_price: 510, daily_change: 10, total_gain: 100 },
  { stock_symbol: "AAPL", company_name: "Apple Inc.", quantity: 20, purchase_price: 170, current_price: 172, daily_change: 2, total_gain: 40 },
  { stock_symbol: "INTC", company_name: "Intel", quantity: 30, purchase_price: 30, current_price: 29, daily_change: -1, total_gain: -30 },
];

const DEMO_MOVERS = {
  gainers: [
    { ticker: "NVDA", price: 892.11, change: 4.23 },
    { ticker: "AMD", price: 142.88, change: 3.91 },
    { ticker: "AAPL", price: 270.04, change: 0.85 },
  ],
  losers: [
    { ticker: "META", price: 475.23, change: -2.34 },
    { ticker: "GOOGL", price: 142.11, change: -1.87 },
    { ticker: "AMZN", price: 178.45, change: -1.23 },
  ],
};

const numberFormatter = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

function formatCurrency(value = 0) {
  return numberFormatter.format(Number(value) || 0);
}

function computeCompositeRisk(dailyPct = 0, positions = []) {
  const positionsCount = positions.length;
  // Component 1: Short-term move risk derived from today's percentage move
  const moveRisk = Math.min(Math.abs(dailyPct), 10) / 10; // normalize 0..1 (cap 10%)
  // Component 2: Diversification penalty (fewer positions increases risk)
  const diversificationPenalty = positionsCount === 0 ? 0.5 : positionsCount < 5 ? 0.3 : positionsCount < 12 ? 0.15 : 0;
  // Component 3: Volatility/asset-style risk from utility (0..100 -> 0..1)
  const volatilityRisk = computeVolatilityRisk(
    positions.map((p) => ({ symbol: p.stock_symbol || p.symbol, volatility: p.volatility }))
  ) / 100;
  // Weighted blend
  const blended = (moveRisk * 0.35) + (diversificationPenalty * 0.20) + (volatilityRisk * 0.45);
  const score = Math.round(Math.max(0, Math.min(1, blended)) * 100);
  let label = "Medium";
  let color = "amber";
  if (score < 40) { label = "Low"; color = "green"; }
  else if (score >= 70) { label = "High"; color = "red"; }
  return { score, label, color };
}

function buildMarketsFromMovers(movers) {
  const combined = [...(movers.gainers || []), ...(movers.losers || [])];
  return combined.slice(0, 12).map((item) => {
    const rawChange = Number(item.change ?? item.price_change_percent ?? 0);
    return {
      symbol: (item.ticker || item.symbol || "")?.toUpperCase(),
      price: Number(item.price ?? item.current_price ?? 0) || 0,
      change: Math.abs(rawChange),
      isPositive: rawChange >= 0,
    };
  });
}

export default function DashboardPage() {
  const router = useRouter();
  const [token, setToken] = useState("");
  const [user, setUser] = useState(null);
  const [positions, setPositions] = useState([]);
  const [summary, setSummary] = useState({ value: 0, dailyChange: 0, totalGain: 0 });
  const [movers, setMovers] = useState({ gainers: [], losers: [] });
  const [markets, setMarkets] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [showExtras, setShowExtras] = useState(true);
  const [liveNudges, setLiveNudges] = useState([]);
  const socketRef = useRef(null);

  // WebSocket connection for live price updates
  useEffect(() => {
    const socket = io(API_URL, { transports: ['websocket', 'polling'] });
    socketRef.current = socket;
    socket.on('price_update', (data) => {
      const nudge = {
        type: data.change >= 0 ? 'up' : 'down',
        msg: `${data.ticker} ${data.change >= 0 ? '+' : ''}${data.changePercent}% ($${data.price})`,
        timestamp: data.timestamp
      };
      setLiveNudges(prev => [nudge, ...prev].slice(0, 10));
    });
    return () => socket.disconnect();
  }, []);

  const authHeaders = useMemo(() => {
    if (!token) {
      return null;
    }
    return { headers: { Authorization: `Bearer ${token}` } };
  }, [token]);

  const handleAuthFailure = useCallback(() => {
    if (typeof window !== "undefined") {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
    }
    router.replace("/login");
  }, [router]);

  const applyDemoData = useCallback(() => {
    setPositions(DEMO_POSITIONS);
    const fallbackSummary = DEMO_POSITIONS.reduce(
      (acc, p) => {
        const qty = Number(p.quantity || 0);
        const price = Number(p.current_price ?? p.purchase_price ?? 0);
        acc.value += price * qty;
        acc.dailyChange += Number(p.daily_change || 0);
        acc.totalGain += Number(p.total_gain || 0);
        return acc;
      },
      { value: 0, dailyChange: 0, totalGain: 0 }
    );
    setSummary(fallbackSummary);
    setMovers(DEMO_MOVERS);
    setMarkets(buildMarketsFromMovers(DEMO_MOVERS));
  }, []);

  // Subscribe to Firestore portfolio updates
  useEffect(() => {
    if (!user?.id && !user?.uid) return;

    const userId = user.id || user.uid;
    const unsubscribePortfolio = subscribeToPortfolio(
      userId,
      (portfolioData) => {
        const portfolio = portfolioData?.positions || [];
        setPositions(portfolio);
        const aggregate = portfolio.reduce(
          (acc, p) => {
            const qty = Number(p.quantity || 0);
            const price = Number(p.currentPrice ?? p.current_price ?? p.averagePrice ?? p.purchase_price ?? 0);
            acc.value += price * qty;
            acc.dailyChange += Number(p.daily_change || 0);
            acc.totalGain += Number(p.total_gain || 0);
            return acc;
          },
          { value: 0, dailyChange: 0, totalGain: 0 }
        );
        setSummary(aggregate);
      },
      (error) => {
        console.error('Portfolio subscription error:', error);
        // Fall back to demo data on error
        applyDemoData();
      }
    );

    const unsubscribeTransactions = subscribeToTransactions(
      userId,
      (transactions) => {
        // Store transactions for recent activity display
        console.log('Received transactions:', transactions.length);
      },
      (error) => {
        console.error('Transactions subscription error:', error);
      }
    );

    return () => {
      unsubscribePortfolio();
      unsubscribeTransactions();
    };
  }, [user, applyDemoData]);

  const loadData = useCallback(
    async (userId, headers) => {
      try {
        setError("");
        // Only load market data from API, portfolio comes from Firestore
        const { data: topData } = await axios.get(`${API_URL}/api/market/top`, headers);

        const gainers = Array.isArray(topData?.gainers) ? topData.gainers : [];
        const losers = Array.isArray(topData?.losers) ? topData.losers : [];
        const nextMovers = { gainers, losers };
        setMovers(nextMovers);
        setMarkets(buildMarketsFromMovers(nextMovers));
        return true;
      } catch (err) {
        if (err?.response?.status === 401 || err?.response?.status === 403) {
          handleAuthFailure();
          return false;
        }
        console.error("Dashboard data load failed", err);
        setError("Unable to load live data. Showing demo data. Start backend (5000) and AI service (5001).");
        applyDemoData();
        return false;
      }
    },
    [applyDemoData, handleAuthFailure]
  );

  const bootstrap = useCallback(
    async (authToken) => {
      setLoading(true);
      try {
        const headers = { headers: { Authorization: `Bearer ${authToken}` } };
        const response = await axios.get(`${API_URL}/api/users/me`, headers);
        const fetchedUser = response.data?.user || response.data;
        if (!fetchedUser?.id) {
          throw new Error("User record missing id");
        }
        setUser(fetchedUser);
        localStorage.setItem("user", JSON.stringify(fetchedUser));

        if (!fetchedUser?.risk_level) {
          router.replace("/onboarding");
          setLoading(false);
          return;
        }
        const success = await loadData(fetchedUser.id, headers);
        if (!success) setError((prev) => prev || "Showing demo data until services are available.");
      } catch (err) {
        if (err?.response?.status === 401 || err?.response?.status === 403) {
          handleAuthFailure();
          return;
        }
        console.error("Dashboard bootstrap failed", err);
        setError("Unable to load your account. Showing demo data.");
        applyDemoData();
      } finally {
        setLoading(false);
      }
    },
    [applyDemoData, handleAuthFailure, loadData, router]
  );

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }
    const storedToken = localStorage.getItem("token");
    if (!storedToken) {
      handleAuthFailure();
      return;
    }
    setToken(storedToken);

    const cachedUser = localStorage.getItem("user");
    if (cachedUser) {
      try {
        const parsed = JSON.parse(cachedUser);
        setUser(parsed);
        if (!parsed?.risk_level) {
          router.replace("/onboarding");
        }
      } catch (err) {
        console.warn("Unable to parse cached user", err);
      }
    }

    bootstrap(storedToken);
  }, [bootstrap, handleAuthFailure, router]);

  const handleRefresh = useCallback(() => {
    if (!user?.id || !authHeaders) {
      return;
    }
    setLoading(true);
    loadData(user.id, authHeaders).finally(() => setLoading(false));
  }, [authHeaders, loadData, user]);

  const prevValue = Math.max(summary.value - summary.dailyChange, 1);
  const dailyPct = (summary.dailyChange / prevValue) * 100;
  const totalPct = ((summary.totalGain || 0) / Math.max(summary.value - summary.totalGain, 1)) * 100;
  const risk = computeCompositeRisk(dailyPct, positions);

  return (
    <div className="min-h-screen bg-gray-950 text-gray-200">
      <MarketTicker markets={markets} />

      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <header className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <div className="flex items-center gap-3">
            <Menu size={22} className="text-gray-400" />
            <div>
              <h1 className="text-2xl font-bold">Dashboard</h1>
              {user?.email && <p className="text-sm text-gray-500">Welcome back, {user.email}</p>}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowExtras((value) => !value)}
              className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-gray-800 hover:bg-gray-700 transition"
            >
              <SlidersHorizontal size={18} />
              <span>{showExtras ? "Hide Panels" : "Show Panels"}</span>
            </button>
            <button
              onClick={handleRefresh}
              className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-gray-800 hover:bg-gray-700 transition"
              disabled={loading}
            >
              <RefreshCw size={18} className={loading ? "animate-spin" : ""} />
              <span>Refresh</span>
            </button>
          </div>
        </header>

        {error && (
          <div className="mb-6 rounded border border-yellow-700/40 bg-yellow-900/20 p-3 text-yellow-200 text-sm">{error}</div>
        )}

        {loading ? (
          <>
            <DashboardSummarySkeleton />
            <div className="mt-8">
              <TableSkeleton rows={5} />
            </div>
          </>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
            <StatCard
              title="Portfolio Value"
              value={formatCurrency(summary.value)}
              icon={<Briefcase className="text-blue-400" size={18} />}
            />
            <StatCard
              title="Today's Change"
              value={formatCurrency(summary.dailyChange)}
              delta={`${dailyPct >= 0 ? "+" : ""}${dailyPct.toFixed(2)}%`}
              positive={summary.dailyChange >= 0}
              icon={<TrendingUp className="text-green-400" size={18} />}
            />
            <StatCard
              title="Total Gain"
              value={formatCurrency(summary.totalGain)}
              delta={`${totalPct >= 0 ? "+" : ""}${totalPct.toFixed(2)}%`}
              positive={summary.totalGain >= 0}
              icon={<BarChart2 className="text-purple-400" size={18} />}
            />
            <StatCard
              title="Positions"
              value={`${positions.length}`}
              icon={<Eye className="text-gray-400" size={18} />}
            />
            <RiskCard score={risk.score} label={risk.label} color={risk.color} />
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <section className="bg-gray-900/60 border border-gray-800 rounded-xl p-4">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold">Portfolio Performance</h2>
              </div>
              <PortfolioChart />
            </section>

            <section className="bg-gray-900/60 border border-gray-800 rounded-xl p-4">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold">Holdings</h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {positions.map((p, idx) => {
                  const price = Number(p.current_price ?? p.purchase_price ?? 0);
                  const change = Number(p.daily_change ?? 0);
                  const changePct = price ? (change / price) * 100 : 0;
                  return (
                    <StockItem
                      key={`${p.stock_symbol}-${idx}`}
                      symbol={p.stock_symbol}
                      name={p.company_name || p.stock_symbol}
                      price={price}
                      change={change}
                      changePercent={changePct}
                      shares={p.quantity}
                      totalValue={price * Number(p.quantity ?? 0)}
                      showValue
                    />
                  );
                })}
                {positions.length === 0 && (
                  <div className="text-center py-12 bg-gray-800/50 rounded-xl border border-gray-700/50 col-span-1 md:col-span-2">
                    <Briefcase size={36} className="mx-auto text-gray-600 mb-3" />
                    <div className="text-white font-medium mb-1">No holdings yet</div>
                    <div className="text-gray-400 text-sm">Add stocks to build your portfolio</div>
                  </div>
                )}
              </div>
            </section>
          </div>

          {showExtras && (
            <aside className="space-y-6">
              <MarketIndices markets={markets} />
              <TopMovers gainers={movers.gainers} losers={movers.losers} />
              <AlertsPanel positions={positions} dailyPct={dailyPct} liveNudges={liveNudges} />
              <NewsCarousel />
            </aside>
          )}
        </div>
      </div>
    </div>
  );
}

function StatCard({ title, value, delta, positive, icon }) {
  return (
    <div className="bg-gray-900/60 border border-gray-800 rounded-xl p-4">
      <div className="flex items-center justify-between mb-2">
        <div className="text-gray-400 text-xs font-medium">{title}</div>
        {icon}
      </div>
      <div className="text-white text-xl font-bold">{value}</div>
      {delta !== undefined && (
        <div className={`text-sm font-medium ${positive ? "text-green-400" : "text-red-400"}`}>{delta}</div>
      )}
    </div>
  );
}

function TopMovers({ gainers = [], losers = [] }) {
  return (
    <div className="space-y-6">
      <div className="bg-gray-900/60 border border-gray-800 rounded-xl p-4">
        <h3 className="text-white font-semibold mb-3 flex items-center gap-2">
          <TrendingUp size={18} className="text-green-400" /> Top Gainers
        </h3>
        <div className="space-y-2">
          {gainers.slice(0, 5).map((s, i) => (
            <MoverRow key={`g-${s.ticker || s.symbol}-${i}`} symbol={s.ticker || s.symbol} price={s.price} change={s.change} />
          ))}
          {gainers.length === 0 && <div className="text-gray-500 text-sm">No data</div>}
        </div>
      </div>

      <div className="bg-gray-900/60 border border-gray-800 rounded-xl p-4">
        <h3 className="text-white font-semibold mb-3 flex items-center gap-2">
          <TrendingDown size={18} className="text-red-400" /> Top Losers
        </h3>
        <div className="space-y-2">
          {losers.slice(0, 5).map((s, i) => (
            <MoverRow key={`l-${s.ticker || s.symbol}-${i}`} symbol={s.ticker || s.symbol} price={s.price} change={s.change} />
          ))}
          {losers.length === 0 && <div className="text-gray-500 text-sm">No data</div>}
        </div>
      </div>
    </div>
  );
}

function MoverRow({ symbol, price, change }) {
  const parsedChange = Number(change || 0);
  const parsedPrice = Number(price || 0);
  const isPositive = parsedChange >= 0;
  return (
    <div className="flex items-center justify-between p-2 rounded-lg bg-gray-800/40">
      <div>
        <div className="text-sm text-white font-semibold">{symbol}</div>
        <div className="text-xs text-gray-400">${parsedPrice.toFixed(2)}</div>
      </div>
      <div className={`text-sm font-semibold ${isPositive ? "text-green-400" : "text-red-400"}`}>
        {isPositive ? "+" : ""}{parsedChange.toFixed(2)}%
      </div>
    </div>
  );
}

function RiskCard({ score, label, color }) {
  const colorMap = {
    green: { ring: "border-green-700/40", bg: "bg-green-900/20", text: "text-green-400" },
    amber: { ring: "border-amber-700/40", bg: "bg-amber-900/20", text: "text-amber-400" },
    red: { ring: "border-red-700/40", bg: "bg-red-900/20", text: "text-red-400" },
  };
  const palette = colorMap[color] || colorMap.green;
  return (
    <div className={`rounded-xl p-4 border ${palette.ring} ${palette.bg}`}>
      <div className="flex items-center justify-between mb-2">
        <div className="text-gray-400 text-xs font-medium">Risk</div>
        <AlertTriangle size={18} className={palette.text} />
      </div>
      <div className="text-white text-xl font-bold">
        {score}
        <span className={`ml-2 text-xs px-2 py-0.5 rounded-full border ${palette.ring} ${palette.text}`}>{label}</span>
      </div>
      <div className="text-gray-500 text-xs">Based on daily move and diversification</div>
    </div>
  );
}

function MarketIndices({ markets = [] }) {
  // Try to pick known indices if present on ticker; else show demo
  const lookup = Object.fromEntries(markets.map((m) => [m.symbol?.toUpperCase(), m]));
  const items = [
    { symbol: "SPY", name: "S&P 500", price: lookup.SPY?.price ?? 503.21, change: lookup.SPY?.change ?? 0.42, isPositive: lookup.SPY?.isPositive ?? true },
    { symbol: "QQQ", name: "Nasdaq 100", price: lookup.QQQ?.price ?? 431.88, change: lookup.QQQ?.change ?? -0.36, isPositive: lookup.QQQ?.isPositive ?? false },
    { symbol: "DIA", name: "Dow Jones", price: lookup.DIA?.price ?? 394.12, change: lookup.DIA?.change ?? 0.15, isPositive: lookup.DIA?.isPositive ?? true },
  ];
  return (
    <div className="bg-gray-900/60 border border-gray-800 rounded-xl p-4">
      <h3 className="text-white font-semibold mb-3">Market Indices</h3>
      <div className="grid grid-cols-3 gap-3">
        {items.map((i) => (
          <div key={i.symbol} className="p-3 rounded-lg bg-gray-800/40">
            <div className="text-xs text-gray-400">{i.name}</div>
            <div className="text-white font-semibold">{i.symbol}</div>
            <div className="text-sm text-gray-300">${i.price.toFixed(2)}</div>
            <div className={`text-xs font-semibold ${i.isPositive ? "text-green-400" : "text-red-400"}`}>
              {i.isPositive ? "+" : ""}{i.change.toFixed(2)}%
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function AlertsPanel({ positions = [], dailyPct = 0, liveNudges = [] }) {
  const alerts = [];
  // Live WebSocket nudges first
  liveNudges.forEach(n => alerts.push(n));
  if (Math.abs(dailyPct) >= 1) {
    alerts.push({
      type: dailyPct >= 0 ? "up" : "down",
      msg: `Portfolio moved ${dailyPct >= 0 ? "+" : ""}${dailyPct.toFixed(2)}% today`,
    });
  }
  positions.forEach((p) => {
    const price = p.current_price ?? p.purchase_price ?? 0;
    const change = p.daily_change ?? 0;
    const pct = price ? (change / price) * 100 : 0;
    if (Math.abs(pct) >= 2) {
      alerts.push({ type: pct >= 0 ? "up" : "down", msg: `${p.stock_symbol} ${pct >= 0 ? "+" : ""}${pct.toFixed(2)}% today` });
    }
  });
  if (alerts.length === 0) {
    alerts.push({ type: "info", msg: "No significant alerts at the moment" });
  }
  return (
    <div className="bg-gray-900/60 border border-gray-800 rounded-xl p-4">
      <h3 className="text-white font-semibold mb-3 flex items-center gap-2"><AlertTriangle size={18} className="text-amber-400" /> Alerts & Nudges</h3>
      <div className="space-y-2">
        {alerts.slice(0, 8).map((a, i) => (
          <div key={i} className="flex items-center justify-between p-2 rounded-lg bg-gray-800/40">
            <div className="text-sm text-gray-200">{a.msg}</div>
            <div className={`text-xs px-2 py-0.5 rounded-full ${a.type === "info" ? "bg-gray-700 text-gray-300" : a.type === "up" ? "bg-green-900/30 text-green-300" : "bg-red-900/30 text-red-300"}`}>
              {a.type.toUpperCase()}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function NewsCarousel() {
  const items = [
    { title: "Tech stocks rally on AI optimism", source: "Reuters", href: "https://www.reuters.com/markets/" },
    { title: "Fed signals cautious path ahead", source: "WSJ", href: "https://www.wsj.com/" },
    { title: "Oil dips as supply concerns ease", source: "Bloomberg", href: "https://www.bloomberg.com/" },
  ];
  return (
    <div className="bg-gray-900/60 border border-gray-800 rounded-xl p-4">
      <h3 className="text-white font-semibold mb-3 flex items-center gap-2"><Newspaper size={18} className="text-blue-400" /> News</h3>
      <div className="space-y-2">
        {items.map((n, i) => (
          <a key={i} href={n.href} target="_blank" rel="noreferrer" className="block p-2 rounded-lg bg-gray-800/40 hover:bg-gray-800/60 transition">
            <div className="text-gray-200 text-sm">{n.title}</div>
            <div className="text-gray-500 text-xs">{n.source}</div>
          </a>
        ))}
      </div>
    </div>
  );
}
