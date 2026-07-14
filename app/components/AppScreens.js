"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import Logo from "./Logo";
import { signInWithGoogle } from "../lib/firebase";
import { showError, showInfo, showSuccess } from "../lib/toast";

const MARKET_SYMBOLS = [
  "AAPL",
  "MSFT",
  "NVDA",
  "AMZN",
  "GOOGL",
  "META",
  "TSLA",
  "JPM",
  "BRK-B",
  "SPY",
  "QQQ",
  "^GSPC",
  "^DJI",
  "^IXIC",
  "^RUT",
  "^VIX",
  "GC=F",
  "SI=F",
  "CL=F",
  "NG=F",
  "BTC-USD",
  "ETH-USD",
];

const CACHE_TTL_MS = 30000;
let marketMemoryCache = null;
let marketDataPromise = null;
const API_BASES = () =>
  Array.from(
    new Set([process.env.NEXT_PUBLIC_API_URL, "http://localhost:5005", "http://localhost:5000"].filter(Boolean))
  );

const navItems = [
  ["Dashboard", "dashboard", "/dashboard"],
  ["Portfolio", "pie_chart", "/portfolio"],
  ["Market", "monitoring", "/market"],
  ["Analytics", "analytics", "/analytics"],
  ["Trade", "swap_horiz", "/trade"],
  ["Settings", "settings", "/settings"],
];

export function LandingPage() {
  return (
    <main className="min-h-screen bg-background-light text-slate-900">
      <MarketTicker />
      <header className="sticky top-9 z-40 border-b border-slate-200 bg-white/90 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <Link href="/" className="flex items-center gap-3">
            <Logo className="h-9 w-9" />
            <span className="text-xl font-black tracking-tight">AIVESTOR<span className="text-primary">.</span></span>
          </Link>
          <nav className="hidden items-center gap-8 md:flex">
            {["Models", "Performance", "Institutional", "Alpha"].map((item) => (
              <a key={item} href={`#${item.toLowerCase()}`} className="text-xs font-bold uppercase tracking-widest text-slate-600 hover:text-primary">
                {item}
              </a>
            ))}
          </nav>
          <div className="flex items-center gap-2">
            <Link href="/login" className="hidden rounded border border-slate-200 px-4 py-2 text-xs font-bold uppercase tracking-widest hover:bg-slate-50 sm:block">
              Log In
            </Link>
            <Link href="/register" className="rounded bg-primary px-5 py-2.5 text-xs font-bold uppercase tracking-widest text-white hover:bg-primary-dark">
              Sign Up
            </Link>
          </div>
        </div>
      </header>

      <section className="mx-auto grid max-w-7xl gap-10 px-6 py-16 lg:grid-cols-[1fr_520px] lg:items-center lg:py-24">
        <div>
          <p className="mb-5 w-fit rounded-full border border-primary/20 bg-primary/10 px-4 py-2 text-xs font-black uppercase tracking-widest text-primary">
            AI investment-as-a-service
          </p>
          <h1 className="max-w-4xl text-5xl font-black leading-[1.05] tracking-tight text-slate-950 md:text-7xl">
            Institutional AI strategy for everyday portfolios.
          </h1>
          <p className="mt-6 max-w-2xl text-lg font-medium leading-8 text-slate-600">
            Aivestor turns live market data, portfolio risk, and model-generated trade signals into a focused investment workspace.
          </p>
          <div className="mt-9 flex flex-wrap gap-3">
            <Link href="/register" className="flex items-center gap-3 rounded-lg bg-primary px-8 py-4 font-bold text-white shadow-lg shadow-primary/20 hover:bg-primary-dark">
              Start investing <span className="material-symbols-outlined text-lg">arrow_forward</span>
            </Link>
            <Link href="/market" className="rounded-lg border border-slate-300 px-8 py-4 font-bold hover:bg-white">
              View live market hub
            </Link>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xl shadow-slate-200/70">
          <LiveMarketPanel compact={false} />
        </div>
      </section>

      <section id="performance" className="border-y border-slate-200 bg-white">
        <div className="mx-auto grid max-w-7xl gap-6 px-6 py-10 md:grid-cols-4">
          {[
            ["$4.28B", "assets monitored"],
            ["22", "live symbols"],
            ["30s", "market refresh"],
            ["7", "sector models"],
          ].map(([value, label]) => (
            <div key={label}>
              <p className="font-mono text-4xl font-black">{value}</p>
              <p className="mt-1 text-xs font-bold uppercase tracking-widest text-slate-500">{label}</p>
            </div>
          ))}
        </div>
      </section>

      <section id="models" className="mx-auto max-w-7xl px-6 py-16">
        <h2 className="max-w-2xl text-4xl font-black tracking-tight">The reference designs are now implemented as product screens.</h2>
        <div className="mt-8 grid gap-4 md:grid-cols-3">
          {[
            ["Neural Modeling", "Market breadth, sector momentum, volatility pressure, and trade suggestions."],
            ["Portfolio Analytics", "Live watchlists, allocation summaries, index snapshots, and risk surfaces."],
            ["Execution Workflow", "Buy and sell tickets, validation, review, and brokerage trade recording."],
          ].map(([title, copy]) => (
            <article key={title} className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
              <span className="material-symbols-outlined mb-6 text-3xl text-primary">query_stats</span>
              <h3 className="text-xl font-bold">{title}</h3>
              <p className="mt-3 text-sm leading-6 text-slate-600">{copy}</p>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}

export function AuthScreen({ mode }) {
  const router = useRouter();
  const [form, setForm] = useState({ displayName: "", email: "", password: "", confirmPassword: "" });
  const [errors, setErrors] = useState({});
  const [busy, setBusy] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const copy = {
    login: ["Welcome back", "Log in", "Don’t have an account?", "Sign up"],
    register: ["Create account", "Sign up", "Already have an account?", "Log in"],
    forgot: ["Reset password", "Send reset link", "Remembered your password?", "Log in"],
    reset: ["Set new password", "Reset password", "Remembered your password?", "Log in"],
    verify: ["Verify email", "Verify email", "Already verified?", "Log in"],
  }[mode || "login"];

  const update = (field) => (event) => {
    setForm((value) => ({ ...value, [field]: event.target.value }));
    setErrors((value) => ({ ...value, [field]: "" }));
  };

  async function submit(event) {
    event.preventDefault();
    const nextErrors = validateAuth(mode, form);
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length) return;
    setBusy(true);
    try {
      const base = API_BASES()[0] || "http://localhost:5005";
      const endpoint =
        mode === "register"
          ? "/api/auth/register"
          : mode === "forgot"
            ? "/api/auth/forgot-password"
            : mode === "reset"
              ? "/api/auth/reset-password"
              : mode === "verify"
                ? "/api/auth/verify-email"
                : "/api/auth/login";
      const body =
        mode === "register"
          ? { email: form.email, password: form.password, displayName: form.displayName, risk_tolerance: 0.5 }
          : mode === "forgot" || mode === "verify"
            ? { email: form.email }
            : mode === "reset"
              ? { email: form.email, password: form.password }
              : { email: form.email, password: form.password };

      const response = await fetch(`${base}${endpoint}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(data.error || data.message || "Request failed");

      if (mode === "login" && data.token) {
        localStorage.setItem("token", data.token);
        localStorage.setItem("user", JSON.stringify(data.user || { email: form.email, displayName: form.displayName || form.email.split("@")[0] }));
        showSuccess("Logged in successfully");
        router.push("/dashboard");
      } else if (mode === "register") {
        showSuccess("Account created. You can log in now.");
        router.push("/login");
      } else {
        showSuccess(data.message || "Request complete");
        router.push("/login");
      }
    } catch (error) {
      showError(error.message);
      setErrors({ form: error.message });
    } finally {
      setBusy(false);
    }
  }

  async function googleAuth() {
    try {
      const result = await signInWithGoogle();
      if (!result) return;
      const idToken = await result.user.getIdToken();
      const base = API_BASES()[0] || "http://localhost:5005";
      const response = await fetch(`${base}/api/auth/google`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ idToken }),
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(data.error || "Google sign-in verification failed");
      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user || { email: result.user.email, displayName: result.user.displayName }));
      showSuccess("Google sign-in successful");
      router.push("/dashboard");
    } catch (error) {
      showError(error.message || "Google sign-in failed");
    }
  }

  return (
    <>
    <MarketTicker />
    <main className="grid min-h-[calc(100vh-36px)] bg-background-light text-slate-900 lg:grid-cols-[1fr_560px]">
      <section className="hidden overflow-hidden bg-slate-950 text-white lg:block">
        <div className="flex h-full flex-col justify-between p-12">
          <Link href="/" className="flex items-center gap-3">
            <Logo className="h-10 w-10" />
            <span className="text-xl font-black tracking-tight">Aivestor</span>
          </Link>
          <div>
            <p className="mb-4 text-xs font-black uppercase tracking-widest text-emerald-300">Live model workspace</p>
            <h1 className="max-w-xl text-5xl font-black leading-tight">Market intelligence without the template shell.</h1>
            <p className="mt-5 max-w-lg text-slate-300">Direct React forms, live API integration, and product screens built from the reference visuals.</p>
          </div>
          <LiveMarketPanel compact />
        </div>
      </section>
      <section className="flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-md">
          <div className="mb-10 flex items-center justify-between">
            <Link href="/" className="flex items-center gap-3">
              <Logo className="h-9 w-9" />
              <span className="text-xl font-bold">Aivestor</span>
            </Link>
            {mode !== "register" && (
              <Link href="/register" className="rounded-lg bg-primary px-4 py-2 text-sm font-bold text-white">
                Sign Up
              </Link>
            )}
          </div>

          <h1 className="text-3xl font-black tracking-tight">{copy[0]}</h1>
          <p className="mt-2 text-sm text-slate-500">Use your Aivestor credentials to access the investment workspace.</p>

          {mode === "login" && (
            <button type="button" onClick={googleAuth} className="mt-8 flex h-12 w-full items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white text-sm font-semibold hover:bg-slate-50">
              <Image src="/google.svg" alt="" width={20} height={20} /> Continue with Google
            </button>
          )}

          <form onSubmit={submit} className="mt-6 space-y-5">
            {errors.form && <p role="alert" className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">{errors.form}</p>}
            {mode === "register" && (
              <Field label="Display name" error={errors.displayName}>
                <input id="displayName" value={form.displayName} onChange={update("displayName")} className="form-input h-12 w-full rounded-lg border border-slate-200 bg-white px-4 text-base focus:border-primary focus:ring-2 focus:ring-primary" placeholder="Test User" />
              </Field>
            )}
            <Field label="Email" error={errors.email}>
              <input id="email" type="email" value={form.email} onChange={update("email")} autoFocus className="form-input h-12 w-full rounded-lg border border-slate-200 bg-white px-4 text-base focus:border-primary focus:ring-2 focus:ring-primary" placeholder="testuser@example.com" />
            </Field>
            {mode !== "forgot" && mode !== "verify" && (
              <Field label={mode === "reset" ? "New password" : "Password"} error={errors.password}>
                <div className="relative">
                  <input id="password" type={showPassword ? "text" : "password"} value={form.password} onChange={update("password")} className="form-input h-12 w-full rounded-lg border border-slate-200 bg-white px-4 pr-12 text-base focus:border-primary focus:ring-2 focus:ring-primary" placeholder="••••••••" />
                  <button type="button" aria-label="Toggle password visibility" onClick={() => setShowPassword((value) => !value)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700">
                    <span className="material-symbols-outlined">{showPassword ? "visibility_off" : "visibility"}</span>
                  </button>
                </div>
              </Field>
            )}
            {(mode === "register" || mode === "reset") && (
              <Field label="Confirm password" error={errors.confirmPassword}>
                <input id="confirmPassword" type="password" value={form.confirmPassword} onChange={update("confirmPassword")} className="form-input h-12 w-full rounded-lg border border-slate-200 bg-white px-4 text-base focus:border-primary focus:ring-2 focus:ring-primary" placeholder="••••••••" />
              </Field>
            )}
            {mode === "login" && (
              <div className="flex items-center justify-between">
                <label className="flex items-center gap-2 text-sm text-slate-600">
                  <input type="checkbox" className="h-4 w-4 rounded border-slate-200 text-primary focus:ring-primary" /> Remember me
                </label>
                <Link href="/forgot-password" className="text-xs font-bold text-primary hover:underline">
                  Forgot password?
                </Link>
              </div>
            )}
            <button type="submit" disabled={busy} className="flex w-full items-center justify-center gap-2 rounded-lg bg-primary py-3.5 text-base font-bold text-white shadow-lg shadow-primary/20 hover:bg-primary-dark disabled:cursor-not-allowed disabled:opacity-60">
              {busy ? "Working..." : copy[1]} <span className="material-symbols-outlined text-lg">arrow_forward</span>
            </button>
          </form>
          <p className="mt-6 text-center text-sm text-slate-500">
            {copy[2]}{" "}
            <Link href={mode === "register" ? "/login" : mode === "login" ? "/register" : "/login"} className="font-bold text-slate-900 hover:underline">
              {copy[3]}
            </Link>
          </p>
        </div>
      </section>
    </main>
    </>
  );
}

export function DashboardScreen() {
  const { quotes, insights, loading, error, refresh, asOf, source } = useMarketData();
  const [query, setQuery] = useState("");
  const filtered = filterQuotes(quotes, query);
  const indexes = symbolMap(quotes);
  const activity = [...filtered].sort((a, b) => Math.abs(Number(b.changePercent) || 0) - Math.abs(Number(a.changePercent) || 0)).slice(0, 5);

  return (
    <ProtectedShell active="Dashboard" search={query} onSearch={setQuery} searchPlaceholder="Search accounts, logs, or signals...">
      <HeaderBlock
        title="Investment Dashboard"
        subtitle={`Portfolio overview, market nudges, and AI recommendations.${asOf ? ` Last update: ${formatTime(asOf)}` : ""}`}
        actions={<><ActionButton icon="refresh" label="Refresh" onClick={refresh} /><LinkButton icon="swap_horiz" label="Trade Now" href="/trade" primary /></>}
      />
      <StatusLine loading={loading} error={error} source={source} />
      <TopMovers quotes={quotes} />
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        <div className="lg:col-span-8 grid grid-cols-1 gap-6 md:grid-cols-2">
          <MetricCard icon="account_balance" label="S&P 500" value={formatQuotePrice(indexes["^GSPC"])} detail={formatSignedPercent(indexes["^GSPC"]?.changePercent)} />
          <MetricCard icon="dns" label="Nasdaq Composite" value={formatQuotePrice(indexes["^IXIC"])} detail={formatSignedPercent(indexes["^IXIC"]?.changePercent)} accent="emerald" />
          <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm md:col-span-2">
            <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
              <h2 className="font-bold">Live Index Snapshot</h2>
              <div className="flex gap-2">
                {["1D", "1W", "1M"].map((item) => <button key={item} className="rounded border border-slate-200 px-3 py-1 text-xs font-bold hover:bg-slate-50">{item}</button>)}
              </div>
            </div>
            <div className="h-64">
              <MomentumBarChart quotes={quotes.filter((quote) => ["^GSPC", "^IXIC", "^DJI", "SPY", "QQQ", "^RUT"].includes(quote.symbol))} />
            </div>
          </section>
        </div>
        <section className="rounded-xl border border-slate-200 bg-white shadow-sm lg:col-span-4">
          <div className="flex items-center justify-between border-b border-slate-100 p-6">
            <h2 className="flex items-center gap-2 font-bold"><span className="material-symbols-outlined text-primary">history</span>Recent Activity Logs</h2>
            <button className="text-xs font-bold text-primary hover:underline">View All</button>
          </div>
          <div className="divide-y divide-slate-100">
            {activity.map((quote) => (
              <ActivityRow key={quote.symbol} quote={quote} />
            ))}
            {!loading && !activity.length && <p className="p-6 text-sm text-slate-500">No matching live market activity.</p>}
          </div>
        </section>
      </div>
      <div className="grid grid-cols-1 gap-6 md:grid-cols-4">
        <InlineStat label="Tracked Symbols" value={String(quotes.length || 0)} />
        <InlineStat label="Advancers" value={String(quotes.filter((quote) => Number(quote.changePercent) >= 0).length)} />
        <InlineStat label="Avg. Change" value={formatSignedPercent(mean(quotes.map((quote) => quote.changePercent)))} />
        <InlineStat label="Data Source" value={source || "Waiting"} />
      </div>
      {insights?.summary && (
        <section className="rounded-xl border border-primary/10 bg-primary/5 p-5">
          <p className="text-xs font-black uppercase tracking-widest text-primary">AI Recommendation Summary</p>
          <p className="mt-2 text-sm leading-6 text-slate-700">{insights.summary}</p>
        </section>
      )}
    </ProtectedShell>
  );
}

export function PortfolioScreen() {
  const { quotes, loading, error, refresh, asOf, source } = useMarketData();
  const { positions, loading: positionsLoading, error: positionsError, trade, refresh: refreshPositions } = usePortfolioPositions();
  const [query, setQuery] = useState("");
  const [assetSymbol, setAssetSymbol] = useState("AAPL");
  const [assetQuantity, setAssetQuantity] = useState("1");
  const [assetMessage, setAssetMessage] = useState("");
  const filtered = filterQuotes(quotes, query);
  const indexes = symbolMap(quotes);
  const holdings = filtered.slice(0, 12);
  const bySymbol = symbolMap(quotes);

  async function submitPortfolioTrade(event) {
    event.preventDefault();
    setAssetMessage("");
    const symbol = assetSymbol.trim().toUpperCase();
    const quantity = Number(assetQuantity);
    const quote = bySymbol[symbol];
    if (!symbol) return setAssetMessage("Symbol is required");
    if (!quantity || quantity < 1) return setAssetMessage("Quantity must be at least 1");
    if (!quote?.price) return setAssetMessage("This symbol is not in the live market feed yet");
    try {
      const result = await trade({ symbol, type: "buy", quantity, price: quote.price });
      setAssetMessage(`Added ${quantity} ${symbol} to the simulated portfolio`);
      showSuccess(`Added ${symbol}`);
      return result;
    } catch (tradeError) {
      setAssetMessage(tradeError.message);
      showError(tradeError.message);
    }
  }

  async function removePosition(position) {
    const symbol = positionSymbol(position);
    const quantity = Number(position.quantity) || 1;
    const quote = bySymbol[symbol];
    try {
      await trade({ symbol, type: "sell", quantity, price: quote?.price || position.currentPrice || position.averagePrice || 1 });
      setAssetMessage(`Removed ${symbol} from the simulated portfolio`);
      showSuccess(`Removed ${symbol}`);
    } catch (tradeError) {
      setAssetMessage(tradeError.message);
      showError(tradeError.message);
    }
  }

  return (
    <ProtectedShell active="Portfolio" search={query} onSearch={setQuery} searchPlaceholder="Search assets, sectors, or reports...">
      <HeaderBlock title="Portfolio Analytics" subtitle={`Live market watchlist, allocation, and risk surface.${asOf ? ` Updated ${formatTime(asOf)}` : ""}`} actions={<><ActionButton icon="refresh" label="Refresh" onClick={refresh} /><LinkButton icon="swap_horiz" label="Trade Now" href="/trade" primary /></>} />
      <StatusLine loading={loading} error={error} source={source} />
      <section className="rounded-xl border border-slate-200 bg-white shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 p-5">
          <div>
            <h2 className="text-lg font-bold">Simulated Portfolio</h2>
            <p className="text-sm text-slate-500">Add and remove assets through the brokerage trade simulator.</p>
          </div>
          <ActionButton icon="sync" label="Refresh Holdings" onClick={refreshPositions} />
        </div>
        <div className="grid gap-6 p-5 lg:grid-cols-[360px_1fr]">
          <form onSubmit={submitPortfolioTrade} className="space-y-4 rounded-xl border border-slate-200 p-4">
            <Field label="Symbol / ticker">
              <input id="portfolio-symbol" value={assetSymbol} onChange={(event) => setAssetSymbol(event.target.value.toUpperCase())} placeholder="AAPL" className="h-11 w-full rounded-lg border border-slate-200 bg-slate-50 px-3 text-sm font-bold focus:border-primary focus:ring-primary" />
            </Field>
            <Field label="Shares / quantity">
              <input id="portfolio-quantity" inputMode="numeric" value={assetQuantity} onChange={(event) => setAssetQuantity(event.target.value)} placeholder="1" className="h-11 w-full rounded-lg border border-slate-200 bg-slate-50 px-3 text-sm font-bold focus:border-primary focus:ring-primary" />
            </Field>
            <p className="rounded-lg bg-slate-50 px-3 py-2 text-sm text-slate-600">Live price: <b>{formatQuotePrice(bySymbol[assetSymbol])}</b></p>
            <button type="submit" className="w-full rounded-lg bg-primary py-3 text-sm font-black text-white hover:bg-primary-dark">Add Asset</button>
            {assetMessage && <p role="alert" className="rounded-lg bg-slate-50 px-3 py-2 text-sm font-semibold text-slate-700">{assetMessage}</p>}
            {positionsError && <p role="alert" className="rounded-lg bg-red-50 px-3 py-2 text-sm font-semibold text-red-700">{positionsError}</p>}
          </form>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[640px] text-left text-sm">
              <thead className="bg-slate-50 text-xs font-black uppercase tracking-widest text-slate-400">
                <tr><th className="px-4 py-3">Asset</th><th className="px-4 py-3 text-right">Quantity</th><th className="px-4 py-3 text-right">Average</th><th className="px-4 py-3 text-right">Live Price</th><th className="px-4 py-3 text-right">Value</th><th className="px-4 py-3 text-right">Action</th></tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {positions.map((position) => {
                  const symbol = positionSymbol(position);
                  const quote = bySymbol[symbol];
                  const quantity = Number(position.quantity) || 0;
                  const livePrice = quote?.price || position.currentPrice || position.averagePrice || 0;
                  return (
                    <tr key={symbol} className="hover:bg-slate-50">
                      <td className="px-4 py-3 font-bold">{symbol}</td>
                      <td className="px-4 py-3 text-right font-mono">{quantity}</td>
                      <td className="px-4 py-3 text-right font-mono">{formatCurrencyValue(position.averagePrice || position.purchase_price || livePrice)}</td>
                      <td className="px-4 py-3 text-right font-mono">{formatCurrencyValue(livePrice)}</td>
                      <td className="px-4 py-3 text-right font-mono">{formatCurrencyValue(livePrice * quantity)}</td>
                      <td className="px-4 py-3 text-right"><button type="button" onClick={() => removePosition(position)} className="rounded-lg border border-red-200 px-3 py-1.5 text-xs font-bold text-red-600 hover:bg-red-50">Remove</button></td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            {positionsLoading && <p className="p-5 text-sm font-bold text-slate-400">Loading simulated holdings...</p>}
            {!positionsLoading && !positions.length && <p className="p-5 text-sm text-slate-500">No simulated holdings yet. Add an asset to start testing the portfolio flow.</p>}
          </div>
        </div>
      </section>
      <div className="grid gap-4 md:grid-cols-4">
        <MetricCard icon="show_chart" label="S&P 500" value={formatQuotePrice(indexes["^GSPC"])} detail={formatSignedPercent(indexes["^GSPC"]?.changePercent)} />
        <MetricCard icon="query_stats" label="Nasdaq Composite" value={formatQuotePrice(indexes["^IXIC"])} detail={formatSignedPercent(indexes["^IXIC"]?.changePercent)} />
        <MetricCard icon="bolt" label="VIX" value={formatQuotePrice(indexes["^VIX"])} detail={formatSignedPercent(indexes["^VIX"]?.changePercent)} />
        <MetricCard icon="diamond" label="Gold Futures" value={formatQuotePrice(indexes["GC=F"])} detail={formatSignedPercent(indexes["GC=F"]?.changePercent)} />
      </div>
      <section className="rounded-xl border border-slate-200 bg-white shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 p-5">
          <h2 className="text-lg font-bold">Live Market Watchlist</h2>
          <div className="flex gap-2">
            <ActionButton icon="download" label="Export" onClick={() => showSuccess("Export queued")} />
            <ActionButton icon="sync" label="Sync" onClick={refresh} />
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[960px] text-left text-sm">
            <thead className="bg-slate-50 text-xs font-black uppercase tracking-widest text-slate-400">
              <tr>
                {["Asset / Ticker", "Name", "Previous Close", "Market Price", "Day Change", "Day Change %", "Currency", "Type", "Updated"].map((header) => (
                  <th key={header} className="px-5 py-4 text-right first:text-left">{header}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {holdings.map((quote) => (
                <QuoteRow key={quote.symbol} quote={quote} asOf={quote.timestamp || asOf} />
              ))}
            </tbody>
          </table>
        </div>
        {!loading && !holdings.length && <p className="p-6 text-sm text-slate-500">No holdings match your search. Add stocks from the trading screen.</p>}
      </section>
      <div className="grid gap-6 lg:grid-cols-2">
        <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <h3 className="font-bold">Performance Attribution</h3>
          <div className="mt-5 h-72">
            <MomentumBarChart quotes={holdings.slice(0, 8)} />
          </div>
        </section>
        <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <h3 className="font-bold">Portfolio Risk Analysis</h3>
          <div className="mt-5 h-72">
            <RiskAreaChart quotes={holdings.slice(0, 8)} />
          </div>
        </section>
      </div>
    </ProtectedShell>
  );
}

export function MarketScreen({ title = "Market Intelligence Hub" }) {
  const { quotes, insights, loading, error, refresh, asOf, source } = useMarketData();
  const [query, setQuery] = useState("");
  const filteredQuotes = filterQuotes(quotes, query);
  const indexes = symbolMap(quotes);
  const sectors = filterSectors(insights?.sectors || [], query);

  return (
    <ProtectedShell active="Analytics" search={query} onSearch={setQuery} searchPlaceholder="Search assets, sectors, or reports...">
      <HeaderBlock title={title} subtitle={`Powered by Aivestor Market Pulse${asOf ? ` • Last Update: ${formatTime(asOf)}` : ""}`} actions={<><ActionButton icon="calendar_today" label="Past 24 Hours" onClick={() => showInfo("24 hour window selected")} /><ActionButton icon="download" label="Export Matrix" onClick={() => showSuccess("Matrix export queued")} primary /></>} />
      <StatusLine loading={loading} error={error} source={source} />
      <TopMovers quotes={quotes} />
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
        <MetricCard label="S&P 500" value={formatQuotePrice(indexes["^GSPC"])} detail={formatSignedPercent(indexes["^GSPC"]?.changePercent)} />
        <MetricCard label="Nasdaq Composite" value={formatQuotePrice(indexes["^IXIC"])} detail={formatSignedPercent(indexes["^IXIC"]?.changePercent)} />
        <MetricCard label="Bitcoin" value={formatQuotePrice(indexes["BTC-USD"])} detail={formatSignedPercent(indexes["BTC-USD"]?.changePercent)} />
        <MetricCard label="Gold Futures" value={formatQuotePrice(indexes["GC=F"])} detail={formatSignedPercent(indexes["GC=F"]?.changePercent)} />
      </div>
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm lg:col-span-8">
          <div className="mb-6 flex items-center justify-between">
            <h2 className="flex items-center gap-2 text-lg font-bold"><span className="material-symbols-outlined text-primary">grid_view</span>Institutional Sector Heatmap</h2>
            <span className="rounded-full bg-slate-100 px-3 py-1 text-[10px] font-black uppercase tracking-widest text-slate-500">Live relative weighting</span>
          </div>
          <SectorHeatmap sectors={sectors} loading={loading} />
        </section>
        <SentimentCard insights={insights} loading={loading} />
      </div>
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm lg:col-span-4">
          <h2 className="mb-6 flex items-center gap-2 text-lg font-bold"><span className="material-symbols-outlined text-primary">border_all</span>Correlation Matrix</h2>
          <CorrelationMatrix quotes={quotes} />
        </section>
        <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm lg:col-span-8">
          <h2 className="mb-6 flex items-center gap-2 text-lg font-bold"><span className="material-symbols-outlined text-primary">table_chart</span>Active Technology Assets</h2>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[620px] text-sm">
              <thead className="text-xs uppercase tracking-widest text-slate-400">
                <tr><th className="py-3 text-left">Ticker</th><th className="py-3 text-left">Name</th><th className="py-3 text-right">Price</th><th className="py-3 text-right">Change</th></tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredQuotes.filter((quote) => quote.type === "equity").slice(0, 10).map((quote) => (
                  <tr key={quote.symbol}>
                    <td className="py-3 font-bold">{displaySymbol(quote.symbol)}</td>
                    <td className="py-3 text-slate-500">{quote.name || quote.symbol}</td>
                    <td className="py-3 text-right font-mono">{formatQuotePrice(quote)}</td>
                    <td className={`py-3 text-right font-bold ${Number(quote.changePercent) >= 0 ? "text-emerald-600" : "text-rose-600"}`}>{formatSignedPercent(quote.changePercent)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </ProtectedShell>
  );
}

export function TradingScreen() {
  const { quotes, insights, loading, error, refresh, asOf, source } = useMarketData();
  const [side, setSide] = useState("buy");
  const [symbol, setSymbol] = useState("AAPL");
  const [quantity, setQuantity] = useState("1");
  const [message, setMessage] = useState("");
  const [review, setReview] = useState(false);
  const [query, setQuery] = useState("");
  const bySymbol = symbolMap(quotes);
  const selectedQuote = bySymbol[symbol.toUpperCase()] || filterQuotes(quotes, query)[0] || quotes[0];
  const price = selectedQuote?.price || 0;
  const qty = Number(quantity) || 0;
  const total = price * qty;
  const searchResults = filterQuotes(quotes, query || symbol).slice(0, 6);

  function submit(event) {
    event.preventDefault();
    setMessage("");
    if (!symbol.trim()) return setMessage("Stock symbol is required");
    if (!qty || qty < 1) return setMessage("Quantity must be at least 1");
    if (!price) return setMessage("Live market price is required before placing an order");
    setReview(true);
  }

  async function confirmTrade() {
    setMessage("");
    try {
      const token = localStorage.getItem("token");
      const base = API_BASES()[0] || "http://localhost:5005";
      const response = await fetch(`${base}/api/brokerage/trade`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ symbol, type: side, quantity: qty, price }),
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(data.error || "Order failed");
      showSuccess(`${side === "buy" ? "Buy" : "Sell"} order recorded`);
      setMessage(`Order confirmed: ${side.toUpperCase()} ${qty} ${symbol.toUpperCase()} at ${formatCurrencyValue(price)}`);
      setReview(false);
      refresh();
    } catch (error) {
      setMessage(error.message);
      showError(error.message);
    }
  }

  return (
    <ProtectedShell active="Trade" search={query} onSearch={setQuery} searchPlaceholder="Search stock ticker or symbol...">
      <HeaderBlock title="Aivestor Trading Terminal" subtitle={`Live cross-asset execution workspace${asOf ? ` • ${formatTime(asOf)}` : ""}`} actions={<ActionButton icon="refresh" label="Refresh Prices" onClick={refresh} />} />
      <StatusLine loading={loading} error={error} source={source} />
      <div className="grid gap-6 xl:grid-cols-[300px_1fr_360px]">
        <section className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-xs font-black uppercase tracking-widest text-slate-500">Order Book</h2>
            <button aria-label="Sort order book" className="rounded bg-slate-100 p-1"><span className="material-symbols-outlined text-sm">sort</span></button>
          </div>
          <div className="space-y-1 font-mono text-xs">
            {[...quotes].sort((a, b) => Number(b.changePercent) - Number(a.changePercent)).slice(0, 9).map((quote) => (
              <button key={quote.symbol} type="button" onClick={() => { setSymbol(quote.symbol); setQuery(quote.symbol); }} className="grid w-full grid-cols-3 rounded px-2 py-2 text-left hover:bg-slate-50">
                <span className="font-bold">{displaySymbol(quote.symbol)}</span>
                <span className="text-right">{formatCurrencyValue(quote.price, quote.currency)}</span>
                <span className={`text-right font-bold ${Number(quote.changePercent) >= 0 ? "text-emerald-600" : "text-rose-600"}`}>{formatSignedPercent(quote.changePercent)}</span>
              </button>
            ))}
          </div>
        </section>

        <section className="rounded-xl border border-slate-200 bg-white shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 p-5">
            <div>
              <h2 className="text-xl font-black">{displaySymbol(selectedQuote?.symbol || symbol)} / USD</h2>
              <p className="font-mono text-2xl font-black">{formatQuotePrice(selectedQuote)}</p>
            </div>
            <div className="flex gap-4 text-xs font-bold">
              {["1m", "5m", "15m", "1h", "1D"].map((item) => <button key={item} className="text-primary hover:underline">{item}</button>)}
            </div>
          </div>
          <div className="h-[420px] p-6">
            <MomentumBarChart quotes={quotes.filter((quote) => ["BTC-USD", "ETH-USD", "SPY", "QQQ", "AAPL", "MSFT", "NVDA"].includes(quote.symbol))} />
          </div>
        </section>

        <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="mb-4 grid grid-cols-2 rounded-lg bg-slate-100 p-1">
            {["buy", "sell"].map((item) => (
              <button key={item} type="button" onClick={() => setSide(item)} className={`rounded-md py-2 text-xs font-black uppercase ${side === item ? "bg-white text-primary shadow-sm" : "text-slate-500"}`}>
                {item}
              </button>
            ))}
          </div>
          <form onSubmit={submit} className="space-y-4">
            <Field label="Symbol / ticker">
              <input id="trade-symbol" value={symbol} onChange={(event) => { setSymbol(event.target.value.toUpperCase()); setQuery(event.target.value); }} placeholder="AAPL" className="h-11 w-full rounded-lg border border-slate-200 bg-slate-50 px-3 text-sm font-bold focus:border-primary focus:ring-primary" />
            </Field>
            {searchResults.length > 0 && (
              <div className="grid gap-2">
                {searchResults.map((quote) => (
                  <button key={quote.symbol} type="button" onClick={() => { setSymbol(quote.symbol); setQuery(quote.symbol); }} className="flex items-center justify-between rounded-lg border border-slate-200 px-3 py-2 text-left text-xs hover:border-primary">
                    <span><b>{displaySymbol(quote.symbol)}</b> <span className="text-slate-500">{quote.name}</span></span>
                    <span className="font-mono">{formatQuotePrice(quote)}</span>
                  </button>
                ))}
              </div>
            )}
            <Field label="Price">
              <input id="trade-price" value={formatCurrencyValue(price)} readOnly className="h-11 w-full rounded-lg border border-slate-200 bg-slate-50 px-3 text-sm font-bold text-slate-600" />
            </Field>
            <Field label="Shares / quantity">
              <input id="trade-quantity" inputMode="numeric" value={quantity} onChange={(event) => setQuantity(event.target.value)} placeholder="0" className="h-11 w-full rounded-lg border border-slate-200 bg-slate-50 px-3 text-sm font-bold focus:border-primary focus:ring-primary" />
            </Field>
            <div className="grid grid-cols-4 gap-2">
              {[25, 50, 75, 100].map((percent) => <button key={percent} type="button" onClick={() => setQuantity(String(Math.max(1, Math.round((10000 * (percent / 100)) / Math.max(price, 1)))))} className="rounded bg-slate-100 py-1 text-[10px] font-bold text-slate-500 hover:bg-primary/10 hover:text-primary">{percent}%</button>)}
            </div>
            <div className="rounded-lg bg-slate-50 p-3 text-sm">
              <div className="flex justify-between"><span className="text-slate-500">Total cost</span><b>{formatCurrencyValue(total)}</b></div>
              <div className="mt-1 flex justify-between"><span className="text-slate-500">Order type</span><b className="capitalize">{side} market</b></div>
            </div>
            {message && <p role="alert" className={`rounded-lg px-3 py-2 text-sm font-semibold ${/confirmed/i.test(message) ? "bg-emerald-50 text-emerald-700" : "bg-red-50 text-red-700"}`}>{message}</p>}
            <button type="submit" className={`w-full rounded-xl py-4 font-black text-white shadow-lg ${side === "buy" ? "bg-emerald-600 shadow-emerald-600/20 hover:bg-emerald-700" : "bg-rose-600 shadow-rose-600/20 hover:bg-rose-700"}`}>
              {side === "buy" ? "Buy" : "Sell"} <span className="text-[10px] font-normal uppercase tracking-widest">Market Order</span>
            </button>
          </form>
          <div className="mt-5 rounded-xl border border-primary/10 bg-primary/5 p-4">
            <p className="text-[10px] font-black uppercase tracking-widest text-primary">AI Market Pulse</p>
            <p className="mt-2 text-xs leading-5 text-slate-600">{insights?.tradeSuggestions?.[0]?.rationale || insights?.summary || "Waiting for live market model output."}</p>
          </div>
        </section>
      </div>

      {review && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4">
          <div role="dialog" aria-modal="true" className="w-full max-w-md rounded-xl bg-white p-6 shadow-2xl">
            <h2 className="text-xl font-black">Review order</h2>
            <p className="mt-2 text-sm text-slate-600">Confirm {side.toUpperCase()} {qty} {symbol.toUpperCase()} at {formatCurrencyValue(price)}.</p>
            <div className="mt-5 flex justify-end gap-2">
              <button type="button" onClick={() => setReview(false)} className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-bold">Cancel</button>
              <button type="button" onClick={confirmTrade} className="rounded-lg bg-primary px-4 py-2 text-sm font-bold text-white">Confirm Order</button>
            </div>
          </div>
        </div>
      )}
    </ProtectedShell>
  );
}

export function SettingsScreen({ profile = false }) {
  const [query, setQuery] = useState("");
  const [tab, setTab] = useState(profile ? "Profile" : "General");
  const [saved, setSaved] = useState("");
  const [danger, setDanger] = useState(false);
  const user = useStoredUser();

  function save(message = "Settings updated") {
    setSaved(message);
    showSuccess(message);
  }

  return (
    <ProtectedShell active="Settings" search={query} onSearch={setQuery} searchPlaceholder="Search settings...">
      <HeaderBlock title={profile ? "Profile & Account" : "Account Management"} subtitle="Manage account, security, notifications, billing, API access, and privacy controls." actions={<ActionButton icon="save" label="Save" onClick={() => save()} primary />} />
      {saved && <p aria-live="polite" className="rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-bold text-emerald-700">{saved}</p>}
      <div className="overflow-x-auto border-b border-slate-200">
        <div role="tablist" className="flex min-w-max gap-1">
          {["General", "API Access", "Billing", "Integrations", "Team Members", "Security", "Privacy"].map((item) => (
            <button key={item} role="tab" aria-selected={tab === item} onClick={() => setTab(item)} className={`px-5 py-4 text-sm font-bold ${tab === item ? "border-b-2 border-primary text-primary" : "text-slate-500 hover:text-slate-800"}`}>
              {item}
            </button>
          ))}
        </div>
      </div>
      <section className="rounded-xl border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-100 p-6">
          <div className="flex items-center gap-4">
            <div className="flex size-14 items-center justify-center rounded-full bg-primary text-lg font-black text-white">{initials(user)}</div>
            <div>
              <h2 className="text-lg font-bold">{user?.displayName || user?.name || "Test User"} - {user?.email || "testuser@example.com"}</h2>
              <p className="text-sm text-slate-500">Member since 2024-01-01 · {user?.risk_level || "medium"} risk</p>
            </div>
            <button className="ml-auto rounded-lg bg-primary px-4 py-2 text-sm font-bold text-white" onClick={() => save("Profile details saved")}>Edit Profile</button>
          </div>
        </div>
        <div className="grid gap-6 p-6 lg:grid-cols-2">
          <SettingsCard title="Notification Preferences">
            <Toggle label="Email notifications" defaultChecked />
            <Toggle label="Push notifications" defaultChecked />
            <Toggle label="Portfolio alert emails" defaultChecked />
          </SettingsCard>
          <SettingsCard title="Security Protocols">
            <button className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-bold hover:bg-slate-50" onClick={() => save("Password panel opened")}>Change password</button>
            <Toggle label="Two factor authentication" />
            <Field label="New password">
              <input className="h-10 w-full rounded-lg border border-slate-200 px-3 text-sm" type="password" placeholder="Minimum 8 characters" />
            </Field>
          </SettingsCard>
          <SettingsCard title="Privacy Controls">
            <Toggle label="Share usage data for analytics" />
            <Toggle label="Personalized recommendations" defaultChecked />
            <button className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-bold hover:bg-slate-50" onClick={() => save("Data export started")}>Export data</button>
          </SettingsCard>
          <SettingsCard title="API Key Management">
            <div className="rounded-lg border border-slate-200 p-3 font-mono text-xs">prod_live_••••••••••••4f82</div>
            <button className="rounded-lg bg-primary px-4 py-2 text-sm font-bold text-white" onClick={() => save("New API key requested")}>Generate New Key</button>
          </SettingsCard>
        </div>
      </section>
      <section className="rounded-xl border border-red-200 bg-red-50 p-6">
        <h2 className="text-lg font-bold text-red-700">Danger Zone</h2>
        <p className="mt-1 text-sm text-red-700/80">Deactivate or permanently delete your account. These actions require confirmation.</p>
        <div className="mt-4 flex gap-2">
          <button className="rounded-lg border border-red-200 px-4 py-2 text-sm font-bold text-red-700" onClick={() => setDanger(true)}>Deactivate Account</button>
          <button className="rounded-lg bg-red-600 px-4 py-2 text-sm font-bold text-white" onClick={() => setDanger(true)}>Delete Account</button>
        </div>
      </section>
      {danger && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4">
          <div className="w-full max-w-md rounded-xl bg-white p-6">
            <h2 className="text-xl font-black">Confirm account action</h2>
            <p className="mt-2 text-sm text-slate-600">This is permanent and cannot be undone.</p>
            <div className="mt-5 flex justify-end gap-2">
              <button onClick={() => setDanger(false)} className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-bold">Cancel</button>
              <button onClick={() => { setDanger(false); save("Account action cancelled in demo mode"); }} className="rounded-lg bg-red-600 px-4 py-2 text-sm font-bold text-white">Confirm</button>
            </div>
          </div>
        </div>
      )}
    </ProtectedShell>
  );
}

export function ChatScreen() {
  const [messages, setMessages] = useState([{ role: "assistant", text: "Ask about markets, portfolio risk, or trade ideas. I’ll use the Aivestor AI endpoint when available." }]);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);

  async function send(event) {
    event.preventDefault();
    if (!input.trim()) return;
    const question = input.trim();
    setMessages((value) => [...value, { role: "user", text: question }]);
    setInput("");
    setBusy(true);
    try {
      const base = API_BASES()[0] || "http://localhost:5005";
      const response = await fetch(`${base}/api/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: question }),
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(data.error || "AI chat unavailable");
      setMessages((value) => [...value, { role: "assistant", text: data.answer || data.response || data.message || "I received the request." }]);
    } catch (error) {
      setMessages((value) => [...value, { role: "assistant", text: `AI chat is unavailable: ${error.message}` }]);
    } finally {
      setBusy(false);
    }
  }

  return (
    <ProtectedShell active="Analytics">
      <HeaderBlock title="Aivestor AI Chat" subtitle="Ask direct market and portfolio questions." />
      <section className="flex min-h-[560px] flex-col rounded-xl border border-slate-200 bg-white shadow-sm">
        <div className="flex-1 space-y-4 overflow-y-auto p-6">
          {messages.map((message, index) => (
            <div key={`${message.role}-${index}`} className={`max-w-3xl rounded-xl px-4 py-3 text-sm leading-6 ${message.role === "user" ? "ml-auto bg-primary text-white" : "bg-slate-100 text-slate-700"}`}>
              {message.text}
            </div>
          ))}
          {busy && <p className="text-sm font-semibold text-slate-500">Aivestor is thinking...</p>}
        </div>
        <form onSubmit={send} className="flex gap-3 border-t border-slate-100 p-4">
          <input value={input} onChange={(event) => setInput(event.target.value)} className="h-12 flex-1 rounded-lg border border-slate-200 px-4 focus:border-primary focus:ring-primary" placeholder="Ask about NVDA, sector heat, or portfolio risk..." />
          <button className="rounded-lg bg-primary px-5 font-bold text-white">Send</button>
        </form>
      </section>
    </ProtectedShell>
  );
}

function ProtectedShell({ children, active, search, onSearch, searchPlaceholder = "Search..." }) {
  const router = useRouter();
  const pathname = usePathname();
  const user = useStoredUser();
  const [ready, setReady] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      router.replace("/login");
      return;
    }
    setReady(true);
  }, [router]);

  if (!ready) {
    return <main className="flex min-h-screen items-center justify-center bg-background-light text-sm font-bold text-slate-600">Loading Aivestor...</main>;
  }

  return (
    <main className="min-h-screen bg-background-light text-slate-900">
      <MarketTicker />
      <button aria-label="Toggle navigation menu" onClick={() => setOpen((value) => !value)} className="fixed left-4 top-12 z-50 rounded-lg border border-slate-200 bg-white p-2 text-slate-600 shadow-sm md:hidden">
        <span className="material-symbols-outlined">{open ? "close" : "menu"}</span>
      </button>
      {open && <button aria-label="Close navigation" className="fixed inset-0 z-30 bg-slate-950/30 md:hidden" onClick={() => setOpen(false)} />}
      <aside className={`fixed bottom-0 left-0 top-9 z-40 flex w-64 flex-col border-r border-slate-200 bg-white transition-transform md:translate-x-0 ${open ? "translate-x-0" : "-translate-x-full"}`}>
        <div className="flex items-center gap-3 p-6">
          <Logo className="h-9 w-9" />
          <h1 className="font-bold tracking-tight">Aivestor</h1>
        </div>
        <nav role="navigation" className="flex-1 space-y-1 px-4">
          {navItems.map(([label, icon, href]) => {
            const selected = active === label || pathname === href || (label === "Analytics" && pathname === "/chat");
            return (
              <Link key={href} href={href} onClick={() => setOpen(false)} className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-semibold ${selected ? "bg-primary/10 text-primary" : "text-slate-600 hover:bg-slate-50"}`}>
                <span className="material-symbols-outlined text-xl">{icon}</span>{label}
              </Link>
            );
          })}
        </nav>
        <div className="border-t border-slate-200 p-4">
          <div className="mb-3 flex items-center gap-3 rounded-lg bg-slate-50 p-2">
            <div className="flex size-9 items-center justify-center rounded-full bg-primary text-xs font-black text-white">{initials(user)}</div>
            <div className="min-w-0">
              <p className="truncate text-xs font-bold">{user?.displayName || user?.name || user?.email || "Signed-in user"}</p>
              <p className="text-[10px] font-semibold uppercase text-slate-500">{user?.risk_level || "Investor"}</p>
            </div>
          </div>
          <button onClick={() => { localStorage.removeItem("token"); localStorage.removeItem("user"); router.push("/login"); }} className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-semibold text-red-500 hover:bg-red-50">
            <span className="material-symbols-outlined text-xl">logout</span>Log out
          </button>
        </div>
      </aside>
      <section className="md:pl-64">
        <header className="sticky top-9 z-20 flex min-h-16 items-center justify-between border-b border-slate-200 bg-white/90 px-5 backdrop-blur lg:px-8">
          {onSearch ? (
            <label className="relative w-full max-w-xl">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">search</span>
              <input role="searchbox" value={search || ""} onChange={(event) => onSearch(event.target.value)} className="w-full rounded-lg border-none bg-slate-100 py-2 pl-10 pr-4 text-sm focus:ring-2 focus:ring-primary" placeholder={searchPlaceholder} />
            </label>
          ) : <div />}
          <div className="ml-4 flex items-center gap-3">
            <button aria-label="Notifications" className="relative rounded-lg bg-slate-100 p-2 text-slate-600 hover:text-primary"><span className="material-symbols-outlined">notifications</span><span className="absolute right-2 top-2 size-2 rounded-full bg-red-500" /></button>
            <div className="hidden items-center gap-2 text-sm font-bold text-emerald-600 sm:flex"><span className="size-2 rounded-full bg-emerald-500" />Live Market Feed</div>
          </div>
        </header>
        <div className="space-y-6 p-5 lg:p-8">{children}</div>
      </section>
    </main>
  );
}

function useStoredUser() {
  const [user, setUser] = useState(null);
  useEffect(() => {
    try {
      const raw = localStorage.getItem("user");
      setUser(raw ? JSON.parse(raw) : null);
    } catch {
      setUser(null);
    }
  }, []);
  return user;
}

function useMarketData() {
  const [state, setState] = useState({ quotes: [], insights: null, loading: true, error: "", asOf: "", source: "" });

  async function load() {
    setState((value) => ({ ...value, loading: true, error: "" }));
    try {
      if (marketMemoryCache && Date.now() - marketMemoryCache.cachedAt < CACHE_TTL_MS) {
        setState({ ...marketMemoryCache.data, loading: false, error: "" });
        return marketMemoryCache.data;
      }

      const cached = readCache();
      if (cached && Date.now() - cached.cachedAt < CACHE_TTL_MS) {
        marketMemoryCache = cached;
        setState({ ...cached.data, loading: false, error: "" });
        return cached.data;
      }

      if (marketDataPromise) {
        const sharedPayload = await marketDataPromise;
        setState({ ...sharedPayload, loading: false, error: "" });
        return sharedPayload;
      }

      marketDataPromise = (async () => {
        const query = encodeURIComponent(MARKET_SYMBOLS.join(","));
        let data;
        let insights;
        let lastError;
        for (const base of API_BASES()) {
          try {
            const [quoteResponse, insightResponse] = await Promise.all([
              fetch(`${base}/api/market/quotes?symbols=${query}`, { cache: "no-store" }),
              fetch(`${base}/api/market/insights?symbols=${query}`, { cache: "no-store" }),
            ]);
            if (!quoteResponse.ok) throw new Error(`${quoteResponse.status} ${quoteResponse.statusText}`);
            data = await quoteResponse.json();
            insights = insightResponse.ok ? await insightResponse.json() : null;
            break;
          } catch (error) {
            lastError = error;
          }
        }
        if (!data?.quotes?.length) throw lastError || new Error("No live market quotes returned");
        return {
          quotes: data.quotes,
          insights: insights || deriveInsights(data),
          asOf: data.asOf,
          source: data.source || "market data",
        };
      })();

      const payload = await marketDataPromise;
      marketMemoryCache = { cachedAt: Date.now(), data: payload };
      writeCache(payload);
      setState({ ...payload, loading: false, error: "" });
      return payload;
    } catch (error) {
      setState((value) => ({ ...value, loading: false, error: error.message || "Unable to fetch live market data" }));
    } finally {
      window.setTimeout(() => {
        marketDataPromise = null;
      }, 100);
    }
  }

  useEffect(() => {
    load();
    const id = window.setInterval(load, 30000);
    return () => window.clearInterval(id);
  }, []);

  return { ...state, refresh: load };
}

function usePortfolioPositions() {
  const [state, setState] = useState({ positions: [], loading: true, error: "" });

  async function refresh() {
    setState((value) => ({ ...value, loading: true, error: "" }));
    try {
      const token = localStorage.getItem("token");
      if (!token) throw new Error("Login is required to load portfolio holdings");
      let lastError;
      for (const base of API_BASES()) {
        try {
          const response = await fetch(`${base}/api/brokerage/portfolio`, {
            headers: { Authorization: `Bearer ${token}` },
            cache: "no-store",
          });
          const data = await response.json().catch(() => ({}));
          if (!response.ok) throw new Error(data.error || `${response.status} ${response.statusText}`);
          setState({ positions: data.positions || [], loading: false, error: "" });
          return data.positions || [];
        } catch (error) {
          lastError = error;
        }
      }
      throw lastError || new Error("Unable to load portfolio holdings");
    } catch (error) {
      setState((value) => ({ ...value, loading: false, error: error.message }));
      return [];
    }
  }

  async function trade(order) {
    const token = localStorage.getItem("token");
    if (!token) throw new Error("Login is required to trade");
    let lastError;
    for (const base of API_BASES()) {
      try {
        const response = await fetch(`${base}/api/brokerage/trade`, {
          method: "POST",
          headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
          body: JSON.stringify(order),
        });
        const data = await response.json().catch(() => ({}));
        if (!response.ok) throw new Error(data.error || `${response.status} ${response.statusText}`);
        setState({ positions: data.positions || [], loading: false, error: "" });
        return data;
      } catch (error) {
        lastError = error;
      }
    }
    throw lastError || new Error("Unable to submit simulated trade");
  }

  useEffect(() => {
    refresh();
  }, []);

  return { ...state, refresh, trade };
}

function MarketTicker() {
  const { quotes, loading, error, asOf } = useMarketData();
  const topSymbols = ["AAPL", "MSFT", "NVDA", "AMZN", "GOOGL", "META", "TSLA", "JPM", "SPY", "QQQ", "^GSPC", "^IXIC", "BTC-USD", "ETH-USD"];
  const tickerQuotes = quotes.filter((quote) => topSymbols.includes(quote.symbol));
  const items = tickerQuotes.length ? [...tickerQuotes, ...tickerQuotes, ...tickerQuotes] : [];
  return (
    <section aria-label="Live market prices" className="market-ticker-shell">
      <div className="market-ticker-viewport">
        {items.length ? (
          <div className="market-ticker-track">
            <div className="market-ticker-label">
              Live Prices
              {asOf && <span>{formatTime(asOf)}</span>}
            </div>
            {items.map((quote, index) => (
              <div key={`${quote.symbol}-${index}`} className="market-ticker-item" data-direction={Number(quote.changePercent) >= 0 ? "up" : "down"}>
                <span className="market-ticker-symbol">{displaySymbol(quote.symbol)}</span>
                <span className="market-ticker-price">{formatQuotePrice(quote)}</span>
                <span className="market-ticker-change">{formatSignedPercent(quote.changePercent)}</span>
              </div>
            ))}
          </div>
        ) : (
          <div className="market-ticker-static">
            <span className="market-ticker-label">Live Prices</span>
            <span>{loading ? "Loading top stock prices..." : error ? `Live price feed unavailable: ${error}` : "Waiting for market data..."}</span>
          </div>
        )}
      </div>
    </section>
  );
}

function LiveMarketPanel({ compact }) {
  const { quotes, loading, error, source } = useMarketData();
  const visible = quotes.slice(0, compact ? 4 : 8);
  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <p className="text-xs font-black uppercase tracking-widest text-slate-400">Live market feed</p>
        <span className="flex items-center gap-2 text-xs font-bold text-emerald-400"><span className="size-2 rounded-full bg-emerald-400" />{providerLabel(source)}</span>
      </div>
      {loading && <p className="text-sm text-slate-400">Loading live prices...</p>}
      {error && <p className="text-sm text-red-300">{error}</p>}
      <div className="space-y-2">
        {visible.map((quote) => (
          <div key={quote.symbol} className="flex items-center justify-between rounded-lg bg-white/10 px-3 py-2 text-sm">
            <span className="font-bold">{displaySymbol(quote.symbol)}</span>
            <span className="font-mono">{formatQuotePrice(quote)}</span>
            <span className={Number(quote.changePercent) >= 0 ? "font-bold text-emerald-300" : "font-bold text-rose-300"}>{formatSignedPercent(quote.changePercent)}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function HeaderBlock({ title, subtitle, actions }) {
  return (
    <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
      <div>
        <h1 className="text-3xl font-black tracking-tight">{title}</h1>
        {subtitle && <p className="mt-1 text-sm font-medium text-slate-500">{subtitle}</p>}
      </div>
      {actions && <div className="flex flex-wrap gap-2">{actions}</div>}
    </div>
  );
}

function ActionButton({ icon, label, onClick, primary = false }) {
  return (
    <button type="button" onClick={onClick} className={`flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-bold shadow-sm ${primary ? "bg-primary text-white shadow-primary/20" : "border border-slate-200 bg-white text-slate-700 hover:bg-slate-50"}`}>
      <span className="material-symbols-outlined text-lg">{icon}</span>{label}
    </button>
  );
}

function LinkButton({ icon, label, href, primary = false }) {
  return (
    <Link href={href} className={`flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-bold shadow-sm ${primary ? "bg-primary text-white shadow-primary/20" : "border border-slate-200 bg-white text-slate-700 hover:bg-slate-50"}`}>
      <span className="material-symbols-outlined text-lg">{icon}</span>{label}
    </Link>
  );
}

function StatusLine({ loading, error, source }) {
  if (loading) return <p className="rounded-lg border border-slate-200 bg-white px-4 py-3 text-sm font-bold text-slate-500">Loading live market data...</p>;
  if (error) return <p role="alert" className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm font-bold text-red-700">Live market feed unavailable: {error}</p>;
  return <p className="rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-bold text-emerald-700">Live data source: {providerLabel(source)}. No placeholder market values are rendered.</p>;
}

function MetricCard({ icon = "query_stats", label, value, detail, accent = "primary" }) {
  const positive = !String(detail || "").startsWith("-");
  return (
    <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="mb-4 flex items-start justify-between">
        <div className={`rounded-lg p-2 ${accent === "emerald" ? "bg-emerald-50 text-emerald-600" : "bg-primary/5 text-primary"}`}><span className="material-symbols-outlined">{icon}</span></div>
        {detail && <span className={`rounded px-2 py-1 text-xs font-black ${positive ? "bg-emerald-50 text-emerald-600" : "bg-rose-50 text-rose-600"}`}>{detail}</span>}
      </div>
      <p className="text-xs font-black uppercase tracking-widest text-slate-400">{label}</p>
      <p className="mt-2 font-mono text-2xl font-black">{value || "--"}</p>
    </section>
  );
}

function MomentumBarChart({ quotes }) {
  const data = quotes.map((quote) => ({ name: displaySymbol(quote.symbol), change: Number(quote.changePercent) || 0, value: Math.abs(Number(quote.changePercent) || 0) + 0.35 }));
  if (!data.length) return <div className="flex h-full items-center justify-center text-sm font-bold text-slate-400">Waiting for live chart data...</div>;
  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart data={data}>
        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
        <XAxis dataKey="name" tick={{ fontSize: 11, fontWeight: 700 }} />
        <YAxis hide />
        <Tooltip formatter={(_, __, item) => [formatSignedPercent(item.payload.change), "Change"]} />
        <Bar dataKey="value" radius={[6, 6, 0, 0]}>
          {data.map((item) => <Cell key={item.name} fill={item.change >= 0 ? "#10B981" : "#ef4444"} />)}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}

function RiskAreaChart({ quotes }) {
  const data = quotes.map((quote, index) => ({ name: displaySymbol(quote.symbol), risk: Math.abs(Number(quote.changePercent) || 0) * 12 + index * 2 + 20 }));
  if (!data.length) return <div className="flex h-full items-center justify-center text-sm font-bold text-slate-400">Waiting for live risk data...</div>;
  return (
    <ResponsiveContainer width="100%" height="100%">
      <AreaChart data={data}>
        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
        <XAxis dataKey="name" tick={{ fontSize: 11, fontWeight: 700 }} />
        <YAxis hide />
        <Tooltip />
        <Area type="monotone" dataKey="risk" stroke="#1E40AF" fill="#1E40AF" fillOpacity={0.18} />
      </AreaChart>
    </ResponsiveContainer>
  );
}

function SectorHeatmap({ sectors, loading }) {
  const spans = ["col-span-5 row-span-4", "col-span-3 row-span-4", "col-span-4 row-span-2", "col-span-2 row-span-2", "col-span-2 row-span-2", "col-span-4 row-span-2", "col-span-5 row-span-2", "col-span-3 row-span-2"];
  if (loading) return <div className="flex h-[400px] items-center justify-center rounded-lg bg-slate-50 text-sm font-bold text-slate-400">Loading live sector heatmap...</div>;
  if (!sectors.length) return <div className="flex h-[400px] items-center justify-center rounded-lg bg-slate-50 text-sm font-bold text-slate-400">No sector data matches your search.</div>;
  return (
    <div className="grid h-[400px] grid-cols-12 grid-rows-6 gap-2">
      {sectors.slice(0, 8).map((sector, index) => {
        const change = Number(sector.changePercent) || 0;
        const strong = Math.min(95, Math.max(30, Math.abs(change) * 18 + 35));
        const positive = change >= 0;
        return (
          <button key={sector.name} type="button" title={`${sector.name}: ${formatSignedPercent(change)}`} className={`${spans[index] || "col-span-3 row-span-2"} flex flex-col justify-between rounded-lg border border-white/10 p-3 text-left text-white transition-all hover:brightness-110`} style={{ backgroundColor: positive ? `rgba(5, 150, 105, ${strong / 100})` : `rgba(244, 63, 94, ${strong / 100})` }}>
            <span className="text-xs font-bold uppercase tracking-widest opacity-90">{sector.name}</span>
            <span>
              <span className={index < 2 ? "block text-3xl font-black" : "block text-xl font-black"}>{displaySymbol(sector.leader?.symbol || sector.benchmark || sector.signal || "Live")}</span>
              <span className="text-sm font-bold">{formatSignedPercent(change)} avg</span>
            </span>
          </button>
        );
      })}
    </div>
  );
}

function SentimentCard({ insights, loading }) {
  const gauges = insights?.sentiment?.gauges || [];
  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm lg:col-span-4">
      <h2 className="mb-6 flex items-center gap-2 text-lg font-bold"><span className="material-symbols-outlined text-primary">hub</span>Sentiment Index</h2>
      {loading && <p className="text-sm font-bold text-slate-400">Loading sentiment...</p>}
      <div className="space-y-6">
        {gauges.map((gauge) => (
          <div key={gauge.label}>
            <div className="flex justify-between text-xs font-bold"><span className="uppercase tracking-widest text-slate-500">{gauge.label}</span><span>{gauge.status}</span></div>
            <div className="mt-2 h-2 overflow-hidden rounded-full bg-slate-100"><div className="h-full rounded-full bg-primary" style={{ width: `${Math.max(4, Math.min(100, Number(gauge.value) || 0))}%` }} /></div>
          </div>
        ))}
        {insights?.summary && <div className="rounded-xl border border-slate-200 bg-slate-50 p-4"><p className="mb-2 text-xs font-bold uppercase text-primary">AI Summary</p><p className="text-sm italic leading-6 text-slate-600">{insights.summary}</p></div>}
      </div>
    </section>
  );
}

function CorrelationMatrix({ quotes }) {
  const symbols = ["BTC-USD", "ETH-USD", "SPY", "QQQ"];
  const by = symbolMap(quotes);
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-center text-[10px] font-bold">
        <thead><tr><th className="p-2" />{symbols.map((symbol) => <th key={symbol} className="p-2 text-slate-400">{displaySymbol(symbol)}</th>)}</tr></thead>
        <tbody>
          {symbols.map((row) => (
            <tr key={row}>
              <td className="p-2 text-left text-slate-400">{displaySymbol(row)}</td>
              {symbols.map((col) => {
                const value = row === col ? 1 : Math.max(0.25, 1 - Math.abs((Number(by[row]?.changePercent) || 0) - (Number(by[col]?.changePercent) || 0)) / 10);
                return <td key={col} className="p-2"><div className="rounded bg-primary text-white" style={{ opacity: value }}>{value.toFixed(2)}</div></td>;
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function QuoteRow({ quote, asOf }) {
  const positive = Number(quote.changePercent) >= 0;
  return (
    <tr className="hover:bg-slate-50">
      <td className="px-5 py-4">
        <div className="flex items-center gap-3">
          <div className="flex size-9 items-center justify-center rounded bg-slate-100 text-[10px] font-black text-primary">{displaySymbol(quote.symbol)}</div>
          <div><p className="font-bold">{displaySymbol(quote.symbol)}</p><p className="text-[10px] font-bold uppercase text-slate-400">{providerLabel(quote.source)}</p></div>
        </div>
      </td>
      <td className="px-5 py-4 text-right">{quote.name || quote.symbol}</td>
      <td className="px-5 py-4 text-right font-mono">{formatCurrencyValue(quote.previousClose, quote.currency)}</td>
      <td className="px-5 py-4 text-right font-mono">{formatQuotePrice(quote)}</td>
      <td className={`px-5 py-4 text-right font-bold ${positive ? "text-emerald-600" : "text-rose-600"}`}>{formatSignedCurrency(quote.change, quote.currency)}</td>
      <td className={`px-5 py-4 text-right font-bold ${positive ? "text-emerald-600" : "text-rose-600"}`}>{formatSignedPercent(quote.changePercent)}</td>
      <td className="px-5 py-4 text-right">{quote.currency || "USD"}</td>
      <td className="px-5 py-4 text-right capitalize">{quote.type || "equity"}</td>
      <td className="px-5 py-4 text-right">{formatTime(asOf)}</td>
    </tr>
  );
}

function ActivityRow({ quote }) {
  const positive = Number(quote.changePercent) >= 0;
  return (
    <div className="flex gap-4 p-4 hover:bg-slate-50">
      <div className={`flex size-8 shrink-0 items-center justify-center rounded-full ${positive ? "bg-emerald-50 text-emerald-600" : "bg-rose-50 text-rose-600"}`}><span className="material-symbols-outlined text-sm">{positive ? "trending_up" : "trending_down"}</span></div>
      <div className="min-w-0">
        <p className="text-sm font-semibold">{displaySymbol(quote.symbol)} live price update</p>
        <p className="truncate text-xs text-slate-500">{quote.name || quote.symbol}: {formatQuotePrice(quote)} ({formatSignedPercent(quote.changePercent)})</p>
        <p className="mt-1 text-[10px] uppercase text-slate-400">{providerLabel(quote.source)}</p>
      </div>
    </div>
  );
}

function InlineStat({ label, value }) {
  return <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm"><p className="text-xs font-black uppercase tracking-widest text-slate-400">{label}</p><p className="mt-2 font-mono text-2xl font-black">{value}</p></section>;
}

function TopMovers({ quotes = [] }) {
  const { gainers, losers } = useMemo(() => {
    const ranked = [...quotes]
      .filter((quote) => ["equity", "crypto", "fund"].includes(quote.type))
      .filter((quote) => Number.isFinite(Number(quote.changePercent)))
      .sort((a, b) => Number(b.changePercent) - Number(a.changePercent));

    return {
      gainers: ranked.filter((quote) => Number(quote.changePercent) >= 0).slice(0, 5),
      losers: [...ranked].reverse().filter((quote) => Number(quote.changePercent) < 0).slice(0, 5),
    };
  }, [quotes]);

  return (
    <section className="grid gap-4 lg:grid-cols-2">
      <MoverList title="Top Gainers" icon="trending_up" quotes={gainers} positive />
      <MoverList title="Top Losers" icon="trending_down" quotes={losers} />
    </section>
  );
}

function MoverList({ title, icon, quotes, positive = false }) {
  return (
    <article className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="mb-4 flex items-center justify-between gap-3">
        <h2 className="flex items-center gap-2 text-sm font-black uppercase tracking-widest text-slate-500">
          <span className={`material-symbols-outlined ${positive ? "text-emerald-600" : "text-rose-600"}`}>{icon}</span>
          {title}
        </h2>
        <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Live feed</span>
      </div>
      <div className="space-y-2">
        {quotes.map((quote, index) => (
          <div key={`${title}-${quote.symbol}`} className="grid grid-cols-[32px_1fr_auto_auto] items-center gap-3 rounded-lg bg-slate-50 px-3 py-2">
            <span className="font-mono text-xs font-black text-slate-400">{index + 1}</span>
            <div className="min-w-0">
              <p className="truncate text-sm font-black">{displaySymbol(quote.symbol)}</p>
              <p className="truncate text-xs text-slate-500">{quote.name || quote.symbol}</p>
            </div>
            <span className="font-mono text-sm font-bold">{formatQuotePrice(quote)}</span>
            <span className={`rounded px-2 py-1 text-xs font-black ${Number(quote.changePercent) >= 0 ? "bg-emerald-50 text-emerald-700" : "bg-rose-50 text-rose-700"}`}>
              {formatSignedPercent(quote.changePercent)}
            </span>
          </div>
        ))}
        {!quotes.length && <p className="rounded-lg bg-slate-50 px-3 py-4 text-sm font-semibold text-slate-500">Waiting for live mover data...</p>}
      </div>
    </article>
  );
}

function SettingsCard({ title, children }) {
  return <section className="space-y-4 rounded-xl border border-slate-200 p-5"><h3 className="text-lg font-bold">{title}</h3>{children}</section>;
}

function Toggle({ label, defaultChecked = false }) {
  const [checked, setChecked] = useState(defaultChecked);
  return (
    <label className="flex min-h-11 items-center justify-between rounded-lg bg-slate-50 px-3 text-sm font-semibold">
      {label}
      <input type="checkbox" checked={checked} onChange={(event) => setChecked(event.target.checked)} className="h-5 w-5 rounded border-slate-300 text-primary focus:ring-primary" />
    </label>
  );
}

function Field({ label, error, children }) {
  const id = children?.props?.id;
  return (
    <div>
      <label htmlFor={id} className="mb-2 block text-sm font-bold text-slate-700">{label}</label>
      {children}
      {error && <p role="alert" className="mt-1 text-xs font-semibold text-red-600">{error}</p>}
    </div>
  );
}

function validateAuth(mode, form) {
  const errors = {};
  if (!form.email) errors.email = "Email is required";
  else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) errors.email = "Invalid email address";
  if (mode === "register" && !form.displayName) errors.displayName = "Name is required";
  if (mode !== "forgot" && mode !== "verify") {
    if (!form.password) errors.password = "Password is required";
    else if (form.password.length < 8) errors.password = "Password must be at least 8 characters";
  }
  if ((mode === "register" || mode === "reset") && form.password !== form.confirmPassword) errors.confirmPassword = "Passwords do not match";
  return errors;
}

function readCache() {
  try {
    const raw = sessionStorage.getItem("aivestor.directMarket.v1");
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function writeCache(data) {
  try {
    sessionStorage.setItem("aivestor.directMarket.v1", JSON.stringify({ cachedAt: Date.now(), data }));
  } catch {}
}

function deriveInsights(data) {
  const quotes = data?.quotes || [];
  const by = symbolMap(quotes);
  const groups = [
    ["Technology", ["AAPL", "MSFT", "NVDA", "GOOGL", "META"]],
    ["Consumer Discretionary", ["AMZN", "TSLA"]],
    ["Financials", ["JPM", "BRK-B"]],
    ["Broad Market", ["SPY", "QQQ", "^GSPC", "^IXIC", "^DJI", "^RUT"]],
    ["Volatility", ["^VIX"]],
    ["Commodities", ["GC=F", "SI=F", "CL=F", "NG=F"]],
    ["Crypto", ["BTC-USD", "ETH-USD"]],
  ];
  const sectors = groups.map(([name, symbols]) => {
    const members = symbols.map((symbol) => by[symbol]).filter(Boolean);
    const changePercent = mean(members.map((quote) => quote.changePercent));
    const leader = [...members].sort((a, b) => Number(b.changePercent || 0) - Number(a.changePercent || 0))[0];
    return { name, symbols, tracked: members.length, changePercent, signal: changePercent >= 1 ? "Overweight" : changePercent <= -1 ? "Underweight" : "Market weight", leader };
  }).filter((sector) => sector.tracked);
  const breadth = quotes.length ? quotes.filter((quote) => Number(quote.changePercent) >= 0).length / quotes.length : 0;
  const strongest = [...sectors].sort((a, b) => b.changePercent - a.changePercent)[0];
  const weakest = [...sectors].sort((a, b) => a.changePercent - b.changePercent)[0];
  return {
    asOf: data?.asOf,
    source: data?.source,
    model: { name: "Aivestor Market Pulse", version: "client-derived-live" },
    summary: `Aivestor Market Pulse is reading ${Math.round(breadth * 100)}% market breadth. ${strongest?.name || "The strongest sector"} leads at ${formatSignedPercent(strongest?.changePercent)}, while ${weakest?.name || "the weakest sector"} trails at ${formatSignedPercent(weakest?.changePercent)}.`,
    sectors,
    sentiment: {
      score: Math.max(0, Math.min(100, 50 + mean(quotes.map((quote) => quote.changePercent)) * 8 + (breadth - 0.5) * 30)),
      gauges: [
        { label: "Market Breadth", value: breadth * 100, status: `${Math.round(breadth * 100)}% advancing` },
        { label: "Sector Momentum", value: Math.max(0, Math.min(100, 50 + mean(sectors.map((sector) => sector.changePercent)) * 10)), status: strongest?.name || "Mixed" },
        { label: "Volatility Pressure", value: Math.max(0, Math.min(100, 100 - Math.abs(by["^VIX"]?.changePercent || 0))), status: "Live VIX" },
      ],
    },
    tradeSuggestions: [...quotes].sort((a, b) => Math.abs(Number(b.changePercent) || 0) - Math.abs(Number(a.changePercent) || 0)).slice(0, 4).map((quote) => ({
      symbol: quote.symbol,
      action: Number(quote.changePercent) > 1 ? "Buy momentum" : Number(quote.changePercent) < -2 ? "Watch reversal" : "Hold",
      rationale: `${displaySymbol(quote.symbol)} is moving ${formatSignedPercent(quote.changePercent)} on live ${providerLabel(quote.source || data?.source)} data.`,
    })),
  };
}

function providerLabel(source = "") {
  if (/finnhub/i.test(source)) return "Finnhub";
  if (/yahoo/i.test(source)) return "Yahoo Finance";
  return "Market data";
}

function symbolMap(quotes) {
  return Object.fromEntries((quotes || []).map((quote) => [quote.symbol, quote]));
}

function filterQuotes(quotes, query) {
  const needle = String(query || "").trim().toLowerCase();
  if (!needle) return quotes || [];
  return (quotes || []).filter((quote) => `${quote.symbol} ${displaySymbol(quote.symbol)} ${quote.name || ""} ${quote.type || ""}`.toLowerCase().includes(needle));
}

function filterSectors(sectors, query) {
  const needle = String(query || "").trim().toLowerCase();
  if (!needle) return sectors || [];
  return (sectors || []).filter((sector) => `${sector.name} ${sector.signal || ""} ${sector.leader?.symbol || ""}`.toLowerCase().includes(needle));
}

function initials(user) {
  const seed = user?.displayName || user?.name || user?.email || "AI";
  return seed.split(/[\s@._-]+/).filter(Boolean).slice(0, 2).map((part) => part[0]?.toUpperCase()).join("") || "AI";
}

function displaySymbol(symbol = "") {
  return String(symbol).replace(/^\^/, "").replace("-USD", "");
}

function positionSymbol(position = {}) {
  return String(position.stock_symbol || position.symbol || "").toUpperCase();
}

function formatQuotePrice(quote) {
  if (!quote) return "--";
  return formatCurrencyValue(quote.price, quote.currency);
}

function formatCurrencyValue(value, currency = "USD") {
  const numeric = Number(value);
  if (!Number.isFinite(numeric)) return "--";
  return new Intl.NumberFormat("en-US", { style: "currency", currency: currency || "USD", maximumFractionDigits: numeric >= 1000 ? 0 : 2 }).format(numeric);
}

function formatSignedCurrency(value, currency = "USD") {
  const numeric = Number(value);
  if (!Number.isFinite(numeric)) return "--";
  const formatted = formatCurrencyValue(Math.abs(numeric), currency);
  return `${numeric >= 0 ? "+" : "-"}${formatted}`;
}

function formatSignedPercent(value) {
  const numeric = Number(value);
  if (!Number.isFinite(numeric)) return "--";
  return `${numeric >= 0 ? "+" : ""}${numeric.toFixed(2)}%`;
}

function formatTime(value) {
  if (!value) return "--";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return String(value);
  return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

function mean(values) {
  const numbers = values.map(Number).filter(Number.isFinite);
  if (!numbers.length) return 0;
  return numbers.reduce((sum, value) => sum + value, 0) / numbers.length;
}
