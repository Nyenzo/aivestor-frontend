"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import { AlertTriangle, CheckCircle, Loader2 } from "lucide-react";
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { onboardingSchema } from '../lib/validation';
import { showSuccess, showError } from '../lib/toast';

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

// Simple questionnaire (can be extended later)
const QUESTIONS = [
  {
    id: "drawdown",
    text: "If your portfolio dropped 15% in a month, what would you do?",
    choices: [
      { value: "sell_all", label: "Sell everything to stop losses" },
      { value: "sell_some", label: "Sell some positions to reduce risk" },
      { value: "hold", label: "Hold and wait for recovery" },
      { value: "buy_more", label: "Buy more while prices are lower" },
    ],
  },
  {
    id: "time_horizon",
    text: "How long until you plan to withdraw a significant portion of this portfolio?",
    choices: [
      { value: "lt2", label: "< 2 years" },
      { value: "2to5", label: "2 – 5 years" },
      { value: "5to10", label: "5 – 10 years" },
      { value: "gt10", label: "> 10 years" },
    ],
  },
  {
    id: "volatility_comfort",
    text: "How do you feel about day-to-day price volatility?",
    choices: [
      { value: "very_uncomfortable", label: "Very uncomfortable" },
      { value: "somewhat_uncomfortable", label: "Somewhat uncomfortable" },
      { value: "neutral", label: "Neutral" },
      { value: "comfortable", label: "Comfortable" },
      { value: "excited", label: "Excited by swings" },
    ],
  },
];

const RISK_LEVELS = [
  { id: "low", label: "Conservative" },
  { id: "medium", label: "Balanced" },
  { id: "high", label: "Aggressive" },
];

export default function OnboardingPage() {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const [recommendation, setRecommendation] = useState(null);
  const [completed, setCompleted] = useState(false);
  
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors }
  } = useForm({
    resolver: zodResolver(onboardingSchema),
    defaultValues: {
      risk_level: '',
      drawdown: '',
      time_horizon: '',
      volatility_comfort: ''
    }
  });
  
  const riskLevel = watch('risk_level');
  const answers = {
    drawdown: watch('drawdown'),
    time_horizon: watch('time_horizon'),
    volatility_comfort: watch('volatility_comfort')
  };

  // Redirect if already onboarded
  useEffect(() => {
    if (typeof window === "undefined") return;
    const token = localStorage.getItem("token");
    const userJson = localStorage.getItem("user");
    if (!token || !userJson) {
      router.replace("/login");
      return;
    }
    try {
      const user = JSON.parse(userJson);
      if (user?.risk_level) {
        router.replace("/dashboard");
      }
    } catch {}
  }, [router]);

  const allAnswered = QUESTIONS.every((q) => answers[q.id]);

  const onSubmit = async (data) => {
    setSubmitting(true);
    try {
      const token = localStorage.getItem("token");
      if (!token) throw new Error("Missing auth token");
      const headers = { headers: { Authorization: `Bearer ${token}` } };
      const orderedAnswers = QUESTIONS.map((q) => ({ id: q.id, answer: data[q.id] }));
      const res = await axios.post(
        `${API_URL}/api/onboarding`,
        { riskLevel: data.risk_level, answers: orderedAnswers },
        headers
      );
      if (res.data?.user) {
        localStorage.setItem("user", JSON.stringify(res.data.user));
      }
      setRecommendation(res.data?.recommendation || null);
      setCompleted(true);
      showSuccess('Risk profile saved successfully!');
    } catch (err) {
      console.error("Onboarding submit error", err);
      showError(err?.response?.data?.error || err.message || "Submission failed");
    } finally {
      setSubmitting(false);
    }
  };

  const handleContinue = () => {
    router.push("/dashboard");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-gray-800 text-gray-200 flex items-start justify-center py-10 px-4">
      <div className="w-full max-w-3xl">
        <h1 className="text-3xl font-bold mb-2">Welcome to Aivestor</h1>
  <p className="text-gray-400 mb-8">Let&#39;s tailor your experience. Provide a few details so we can calibrate recommendations to your risk comfort.</p>

        {error && (
          <div className="mb-6 rounded-lg border border-red-700/40 bg-red-900/20 p-3 text-red-300 text-sm flex items-center gap-2">
            <AlertTriangle size={16} /> {error}
          </div>
        )}

        {!completed && (
          <div className="space-y-10">
            <section>
              <h2 className="text-xl font-semibold mb-4">Choose your risk level</h2>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {RISK_LEVELS.map((r) => {
                  const active = riskLevel === r.id;
                  return (
                    <label
                      key={r.id}
                      className={`p-4 rounded-xl border transition text-left flex flex-col gap-2 cursor-pointer ${
                        active
                          ? "border-blue-500 bg-blue-900/30 shadow-lg shadow-blue-900/30"
                          : "border-gray-700 bg-gray-800 hover:bg-gray-700"
                      }`}
                    >
                      <input
                        type="radio"
                        value={r.id}
                        {...register('risk_level')}
                        className="sr-only"
                      />
                      <span className="text-lg font-semibold capitalize">{r.label}</span>
                      <span className="text-xs text-gray-400">{r.id === "low" && "Capital preservation focus"}{r.id === "medium" && "Balanced growth & stability"}{r.id === "high" && "Higher growth potential & swings"}</span>
                    </label>
                  );
                })}
              </div>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-4">A few quick questions</h2>
              <div className="space-y-6">
                {QUESTIONS.map((q) => (
                  <div key={q.id} className="p-4 rounded-xl border border-gray-800 bg-gray-850/50 bg-gray-800">
                    <div className="font-medium mb-3 text-gray-100">{q.text}</div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {q.choices.map((c) => {
                        const selected = answers[q.id] === c.value;
                        return (
                          <label
                            key={c.value}
                            className={`text-sm text-left rounded-lg px-3 py-3 border transition flex items-start gap-2 cursor-pointer ${
                              selected
                                ? "border-blue-500 bg-blue-900/40 text-blue-200"
                                : "border-gray-700 bg-gray-800 hover:bg-gray-700"
                            }`}
                          >
                            <input
                              type="radio"
                              value={c.value}
                              {...register(q.id)}
                              className="sr-only"
                            />
                            <span className="mt-0.5">{c.label}</span>
                          </label>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </section>

            <div className="flex items-center justify-between mt-4">
              <div className="text-xs text-gray-500">All answers help personalize allocation suggestions.</div>
              <button
                onClick={handleSubmit(onSubmit)}
                disabled={submitting}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-blue-600 hover:bg-blue-500 disabled:opacity-50 font-semibold text-sm"
              >
                {submitting ? <Loader2 size={16} className="animate-spin" /> : null}
                Generate Recommendation
              </button>
            </div>
            {errors.risk_level && (
              <p className="text-red-400 text-sm mt-2">{errors.risk_level.message}</p>
            )}
            {(errors.drawdown || errors.time_horizon || errors.volatility_comfort) && (
              <p className="text-red-400 text-sm mt-2">Please answer all questions</p>
            )}
          </div>
        )}

        {completed && (
          <div className="mt-8 p-6 rounded-xl border border-green-700/40 bg-green-900/20">
            <div className="flex items-center gap-2 mb-4 text-green-300">
              <CheckCircle size={20} /> <span className="font-semibold">Profile saved</span>
            </div>
            <h2 className="text-xl font-semibold mb-2">Suggested Starter Allocation</h2>
            {recommendation ? (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-left text-gray-400">
                      <th className="py-2 pr-4">Ticker</th>
                      <th className="py-2 pr-4">Weight</th>
                      <th className="py-2 pr-4">Price</th>
                    </tr>
                  </thead>
                  <tbody>
                    {Array.isArray(recommendation?.allocation) && recommendation.allocation.map((row, idx) => (
                      <tr key={`${row.ticker}-${idx}`} className="border-t border-gray-800">
                        <td className="py-2 pr-4 font-medium text-gray-200">{row.ticker}</td>
                        <td className="py-2 pr-4 text-gray-300">{(row.weight * 100).toFixed(2)}%</td>
                        <td className="py-2 pr-4 text-gray-300">${Number(row.price || 0).toFixed(2)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                <div className="text-xs text-gray-500 mt-3">Weights are illustrative based on risk level; confirm before investing.</div>
              </div>
            ) : (
              <p className="text-sm text-gray-400">Recommendation service unavailable. You can still proceed.</p>
            )}
            <div className="mt-6 flex items-center justify-end">
              <button
                onClick={handleContinue}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-blue-600 hover:bg-blue-500 font-semibold text-sm"
              >
                Continue to Dashboard
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
