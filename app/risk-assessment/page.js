'use client';

// Managing state and questionnaire logic for risk assessment
import { useState } from 'react';
import axios from 'axios';
import { useRouter } from 'next/navigation';

const questions = [
  { id: 'q1', text: 'How would you describe your investment experience?', options: ['None', 'Little', 'Moderate', 'Extensive'], weight: [0, 0.25, 0.5, 0.75] },
  { id: 'q2', text: 'What is your primary investment goal?', options: ['Safety', 'Income', 'Growth', 'Speculation'], weight: [0, 0.25, 0.5, 0.75] },
  { id: 'q3', text: 'How long do you plan to invest?', options: ['<1 year', '1-3 years', '3-5 years', '>5 years'], weight: [0.75, 0.5, 0.25, 0] },
];

export default function RiskAssessment() {
  const [answers, setAnswers] = useState({});
  const [step, setStep] = useState(0);
  const [riskScore, setRiskScore] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : '';

  const handleOption = (qid, value) => {
    setAnswers({ ...answers, [qid]: value });
    setTimeout(() => setStep((s) => Math.min(s + 1, questions.length)), 300);
  };

  const calculateRiskScore = () => {
    const total = Object.values(answers).reduce((sum, val) => sum + val, 0) / questions.length;
    setRiskScore(total.toFixed(2));
  };

  const handleSubmit = async () => {
    setLoading(true);
    setError('');
    try {
      await axios.put('http://localhost:5000/api/users/1', { risk_tolerance: riskScore }, {
        headers: { Authorization: `Bearer ${token}` },
      });
      router.push('/dashboard');
    } catch (err) {
      setError('Error updating risk tolerance');
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 flex items-center justify-center">
      <div className="bg-gray-900 p-8 rounded-xl shadow-2xl w-full max-w-lg flex flex-col items-center">
        <h1 className="text-3xl font-bold mb-6 text-center text-white">Risk Assessment</h1>
        <div className="w-full mb-6">
          <div className="flex items-center mb-2">
            <div className="flex-1 h-2 bg-gray-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-blue-500 transition-all duration-300"
                style={{ width: `${(step / questions.length) * 100}%` }}
              />
            </div>
            <span className="ml-4 text-gray-400 text-xs">{step}/{questions.length}</span>
          </div>
        </div>
        {step < questions.length ? (
          <div className="w-full">
            <div className="mb-6">
              <label className="block text-white mb-4 text-lg font-semibold">{questions[step].text}</label>
              <div className="grid grid-cols-1 gap-3">
                {questions[step].options.map((option, idx) => (
                  <button
                    key={option}
                    className="w-full bg-gray-800 text-white p-3 rounded hover:bg-blue-600 transition text-left"
                    onClick={() => handleOption(questions[step].id, questions[step].weight[idx])}
                  >
                    {option}
                  </button>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <div className="w-full flex flex-col items-center">
            <button
              onClick={calculateRiskScore}
              className="w-full bg-blue-600 text-white p-3 rounded mb-4 hover:bg-blue-700 transition font-semibold"
            >
              Calculate Risk Score
            </button>
            {riskScore !== null && (
              <div className="text-center mb-4">
                <p className="text-white text-lg">Your Risk Tolerance: <span className="font-bold text-blue-400">{riskScore}</span></p>
                <button
                  onClick={handleSubmit}
                  className="w-full bg-green-500 text-white p-3 rounded mt-2 hover:bg-green-600 transition font-semibold"
                  disabled={loading}
                >
                  {loading ? 'Submitting...' : 'Submit'}
                </button>
              </div>
            )}
            {error && <div className="text-red-400 mt-2">{error}</div>}
          </div>
        )}
      </div>
    </div>
  );
}