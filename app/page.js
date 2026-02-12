'use client';

/**
 * Landing Page
 * 
 * Welcome page for new visitors with call-to-action buttons.
 * Features overview and modern UI design.
 */

import { TrendingUp, Briefcase, MessageSquare, Shield, BarChart3, Zap } from 'lucide-react';
import Image from 'next/image';

const features = [
  {
    icon: Briefcase,
    title: 'Portfolio Management',
    description: 'Track your investments in real-time with comprehensive analytics and insights.'
  },
  {
    icon: MessageSquare,
    title: 'AI-Powered Chat',
    description: 'Get instant investment advice and market insights from our AI assistant.'
  },
  {
    icon: BarChart3,
    title: 'Advanced Analytics',
    description: 'Deep dive into market trends with powerful charting and analysis tools.'
  },
  {
    icon: Shield,
    title: 'Secure & Private',
    description: 'Bank-level security with Firebase authentication and encryption.'
  },
  {
    icon: Zap,
    title: 'Real-Time Updates',
    description: 'Live market data and instant portfolio updates as they happen.'
  },
  {
    icon: TrendingUp,
    title: 'Smart Recommendations',
    description: 'AI-driven stock recommendations tailored to your risk profile.'
  }
];

export default function Page() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
      {/* Hero Section */}
      <div className="container mx-auto px-6 py-20">
        <div className="text-center">
          <div className="flex justify-center mb-8">
            <Image 
              src="/favicon.ico" 
              alt="Aivestor Logo" 
              width={80} 
              height={80} 
              className="w-20 h-20" 
              priority 
            />
          </div>
          
          <h1 className="text-6xl font-bold mb-6 bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
            Welcome to Aivestor
          </h1>
          
          <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
            Your AI-powered investment companion. Make smarter investment decisions with 
            real-time analytics, portfolio management, and intelligent insights.
          </p>
          
          <div className="flex gap-4 justify-center">
            <a
              href="/register"
              className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-8 py-3 rounded-lg transition transform hover:scale-105"
            >
              Get Started
            </a>
            <a
              href="/login"
              className="bg-gray-700 hover:bg-gray-600 text-white font-semibold px-8 py-3 rounded-lg transition transform hover:scale-105"
            >
              Sign In
            </a>
          </div>
        </div>
        
        {/* Features Grid */}
        <div className="mt-24 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <div
                key={index}
                className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-xl p-6 hover:border-blue-500 transition transform hover:scale-105"
              >
                <div className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center mb-4">
                  <Icon size={24} />
                </div>
                <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                <p className="text-gray-400">{feature.description}</p>
              </div>
            );
          })}
        </div>
        
        {/* CTA Section */}
        <div className="mt-24 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-12 text-center">
          <h2 className="text-4xl font-bold mb-4">Ready to Transform Your Investing?</h2>
          <p className="text-xl mb-8 text-gray-100">
            Join thousands of investors using AI to make better financial decisions.
          </p>
          <a
            href="/register"
            className="inline-block bg-white text-blue-600 font-semibold px-8 py-3 rounded-lg hover:bg-gray-100 transition transform hover:scale-105"
          >
            Create Free Account
          </a>
        </div>
        
        {/* Footer */}
        <div className="mt-16 text-center text-gray-400 text-sm">
          <p>&copy; 2024 Aivestor. All rights reserved.</p>
        </div>
      </div>
    </div>
  );
}