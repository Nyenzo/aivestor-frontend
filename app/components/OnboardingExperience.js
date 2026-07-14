"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";

const riskProfiles = [
  {
    id: "low",
    label: "Low / Conservative",
    copy: "Capital preservation, broad diversification, and lower volatility.",
  },
  {
    id: "medium",
    label: "Medium / Moderate",
    copy: "Balanced growth with guardrails and diversified sector exposure.",
  },
  {
    id: "high",
    label: "High / Aggressive",
    copy: "Higher growth targets with larger swings and tactical opportunities.",
  },
];

const goals = ["Retirement", "Wealth Building", "Dividend Income", "Emergency Savings"];
const popularStocks = ["AAPL Apple Inc.", "MSFT Microsoft", "NVDA NVIDIA", "SPY S&P 500 ETF"];

export default function OnboardingExperience() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [risk, setRisk] = useState("");
  const [selectedGoals, setSelectedGoals] = useState(["Wealth Building"]);
  const [query, setQuery] = useState("");

  const stocks = useMemo(() => {
    if (!query.trim()) return popularStocks;
    return popularStocks.filter((stock) => stock.toLowerCase().includes(query.toLowerCase()));
  }, [query]);

  function finish() {
    const current = readUser();
    const token = localStorage.getItem("token");
    if (!token || !current.email) {
      router.push("/login");
      return;
    }
    localStorage.setItem("user", JSON.stringify({
      ...current,
      risk_level: risk,
      investment_goals: selectedGoals,
    }));
    router.push("/dashboard");
  }

  function goToStep(nextStep) {
    setStep(nextStep);
    window.history.replaceState({}, "", `/onboarding?step=${nextStep}`);
  }

  return (
    <main className="min-h-screen bg-background-light text-slate-900 font-display">
      <div className="flex min-h-screen">
        <aside className="hidden md:flex w-64 border-r border-slate-200 bg-white flex-col sticky top-0 h-screen">
          <div className="p-6 flex items-center gap-3">
            <div className="size-8 bg-primary rounded-lg flex items-center justify-center text-white">
              <span className="material-symbols-outlined">payments</span>
            </div>
            <h1 className="text-xl font-bold tracking-tight">Aivestor</h1>
          </div>
          <nav className="flex-1 px-4 space-y-1" role="navigation">
            <a className="flex items-center gap-3 px-3 py-2 text-slate-600 rounded-lg" href="/dashboard">
              <span className="material-symbols-outlined text-[20px]">dashboard</span>
              <span className="text-sm font-medium">Dashboard</span>
            </a>
            <a className="flex items-center gap-3 px-3 py-2 text-slate-600 rounded-lg" href="/portfolio">
              <span className="material-symbols-outlined text-[20px]">account_balance_wallet</span>
              <span className="text-sm font-medium">Portfolio</span>
            </a>
            <a className="flex items-center gap-3 px-3 py-2 bg-primary/10 text-primary rounded-lg" href="/onboarding">
              <span className="material-symbols-outlined text-[20px]">shield</span>
            <span className="text-sm font-medium">Assessment</span>
            </a>
          </nav>
        </aside>

        <section className="flex-1">
          <header className="h-16 border-b border-slate-200 bg-white px-6 md:px-8 flex items-center justify-between sticky top-0 z-10">
            <h2 className="text-lg font-bold">Setup</h2>
            <div className="w-48 h-2 rounded-full bg-slate-100 overflow-hidden" role="progressbar" aria-valuenow={step} aria-valuemin="1" aria-valuemax="3">
              <div className="h-full bg-primary transition-all" style={{ width: `${(step / 3) * 100}%` }} />
            </div>
          </header>

          <div className="p-6 md:p-8 max-w-5xl mx-auto space-y-8">
            <div>
              <p className="text-xs font-bold uppercase tracking-widest text-primary mb-3">Step {step} of 3</p>
              <h1 className="text-3xl font-black tracking-tight">Investor Calibration</h1>
              <p className="text-slate-500 text-sm mt-2">Get Started</p>
              <p className="text-slate-500 mt-2">Calibrate your portfolio recommendations before entering the dashboard.</p>
            </div>

            {step === 1 && (
              <section className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="p-6 border-b border-slate-100">
                  <h3 className="text-lg font-bold">Choose Tolerance</h3>
                  <p className="text-sm text-slate-500">Select the profile that best matches your current investing comfort.</p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-6">
                  {riskProfiles.map((profile) => (
                    <button
                      key={profile.id}
                      type="button"
                      aria-pressed={risk === profile.id}
                      data-selected={risk === profile.id}
                      className={`text-left rounded-xl border p-5 transition-colors ${risk === profile.id ? "selected border-primary bg-primary/10 text-primary" : "border-slate-200 hover:border-primary"}`}
                      onClick={() => setRisk(profile.id)}
                    >
                      <span className="font-bold">{profile.label}</span>
                      <span className="block mt-2 text-sm text-slate-500">{profile.copy}</span>
                    </button>
                  ))}
                </div>
              </section>
            )}

            {step === 2 && (
              <section className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="p-6 border-b border-slate-100">
                  <h3 className="text-lg font-bold">Investment Goals</h3>
                  <p className="text-sm text-slate-500">Select all goals that should influence recommendations.</p>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-6">
                  {goals.map((goal) => {
                    const selected = selectedGoals.includes(goal);
                    return (
                      <button
                        key={goal}
                        type="button"
                        aria-pressed={selected}
                        className={`rounded-lg border px-5 py-4 text-left font-semibold ${selected ? "border-primary bg-primary/10 text-primary" : "border-slate-200"}`}
                        onClick={() => setSelectedGoals((current) => selected ? current.filter((item) => item !== goal) : [...current, goal])}
                      >
                        {goal}
                      </button>
                    );
                  })}
                </div>
              </section>
            )}

            {step === 3 && (
              <section className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="p-6 border-b border-slate-100">
                  <h3 className="text-lg font-bold">Recommended Stock Selection</h3>
                  <p className="text-sm text-slate-500">Popular stocks suggested for your selected profile.</p>
                </div>
                <div className="p-6 space-y-4">
                  <input
                    aria-label="Search stock ticker"
                    className="w-full rounded-lg border border-slate-200 bg-slate-50 h-12 px-4 focus:ring-2 focus:ring-primary"
                    placeholder="Search stock or ticker"
                    value={query}
                    onChange={(event) => setQuery(event.target.value)}
                  />
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {stocks.map((stock) => (
                      <button key={stock} type="button" className="rounded-lg border border-slate-200 px-4 py-3 text-left font-semibold hover:border-primary">
                        {stock}
                      </button>
                    ))}
                  </div>
                </div>
              </section>
            )}

            <div className="flex items-center justify-between border-t border-slate-200 pt-6">
              <button type="button" className="px-4 py-2 border border-slate-200 rounded-lg font-bold disabled:opacity-50" disabled={step === 1} onClick={() => goToStep(step - 1)}>
                Back
              </button>
              <button type="button" disabled={step === 1 && !risk} className="px-5 py-2.5 bg-primary text-white rounded-lg font-bold shadow-lg shadow-primary/20 disabled:opacity-50" onClick={() => step === 3 ? finish() : goToStep(step + 1)}>
                {step === 3 ? "Complete" : "Continue"}
              </button>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}

function readUser() {
  try {
    return JSON.parse(localStorage.getItem("user") || "{}");
  } catch {
    return {};
  }
}
