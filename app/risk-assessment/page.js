'use client';

// Managing state and questionnaire logic for risk assessment
import { useState } from 'react';
import axios from 'axios';
import { useRouter } from 'next/navigation';

export default function RiskAssessment() {
  const [answers, setAnswers] = useState({});
  const [riskScore, setRiskScore] = useState(null);
  const token = localStorage.getItem('token');
  const router = useRouter();

  const questions = [
    { id: 'q1', text: 'How would you describe your investment experience?', options: ['None', 'Little', 'Moderate', 'Extensive'], weight: [0, 0.25, 0.5, 0.75] },
    { id: 'q2', text: 'What is your primary investment goal?', options: ['Safety', 'Income', 'Growth', 'Speculation'], weight: [0, 0.25, 0.5, 0.75] },
    { id: 'q3', text: 'How long do you plan to invest?', options: ['<1 year', '1-3 years', '3-5 years', '>5 years'], weight: [0.75, 0.5, 0.25, 0] },
  ];

  // Calculating risk score based on user answers
  const calculateRiskScore = () => {
    const total = Object.values(answers).reduce((sum, val) => sum + val, 0) / questions.length;
    setRiskScore(total.toFixed(2));
  };

  // Submitting risk score to backend and navigating to dashboard
  const handleSubmit = async () => {
    if (riskScore) {
      try {
        await axios.put('http://localhost:5000/api/users/1', { risk_tolerance: riskScore }, {
          headers: { Authorization: `Bearer ${token}` },
        });
        router.push('/dashboard');
      } catch (err) {
        console.error('Error updating risk tolerance:', err);
      }
    }
  };

  // Rendering the questionnaire and submission interface
  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center">
      <div className="bg-gray-800 p-8 rounded-lg shadow-lg w-full max-w-md">
        <h1 className="text-2xl font-bold mb-6 text-center text-white">Risk Assessment</h1>
        {questions.map((q) => (
          <div key={q.id} className="mb-6">
            <label className="block text-white mb-2">{q.text}</label>
            {q.options.map((option, index) => (
              <div key={option} className="flex items-center mb-2">
                <input
                  type="radio"
                  name={q.id}
                  value={q.weight[index]}
                  onChange={(e) => setAnswers({ ...answers, [q.id]: parseFloat(e.target.value) })}
                  className="mr-2"
                />
                <span className="text-gray-300">{option}</span>
              </div>
            ))}
          </div>
        ))}
        <button onClick={calculateRiskScore} className="w-full bg-blue-500 text-white p-2 rounded mb-4">
          Calculate Risk Score
        </button>
        {riskScore !== null && (
          <div className="text-center mb-4">
            <p className="text-white">Your Risk Tolerance: {riskScore}</p>
            <button onClick={handleSubmit} className="w-full bg-green-500 text-white p-2 rounded mt-2">
              Submit
            </button>
          </div>
        )}
      </div>
    </div>
  );
}