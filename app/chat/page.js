'use client';

import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import {
  Send,
  Trash2,
  Bot,
  User as UserIcon,
  Loader2,
  TrendingUp,
  AlertCircle
} from 'lucide-react';
import {
  getChatHistory,
  addChatMessage,
  subscribeToChatHistory,
  clearChatHistory
} from '../lib/firestore.service';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

function ChatMessage({ message, isUser }) {
  return (
    <div className={`flex gap-3 ${isUser ? 'flex-row-reverse' : ''} mb-4`}>
      <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${
        isUser ? 'bg-blue-600' : 'bg-green-600'
      }`}>
        {isUser ? <UserIcon className="w-5 h-5 text-white" /> : <Bot className="w-5 h-5 text-white" />}
      </div>
      
      <div className={`flex-1 max-w-[70%] ${isUser ? 'text-right' : ''}`}>
        <div className={`inline-block px-4 py-3 rounded-lg ${
          isUser 
            ? 'bg-blue-600 text-white rounded-tr-none' 
            : 'bg-gray-700 text-white rounded-tl-none'
        }`}>
          {typeof message === 'string' ? (
            <p className="whitespace-pre-wrap">{message}</p>
          ) : (
            <div>
              {message.text && <p className="whitespace-pre-wrap mb-2">{message.text}</p>}
              {message.stocks && message.stocks.length > 0 && (
                <div className="mt-3 space-y-2">
                  {message.stocks.map((stock, idx) => (
                    <div key={idx} className="bg-black/20 p-3 rounded-lg">
                      <div className="flex justify-between items-center">
                        <span className="font-bold">{stock.symbol}</span>
                        <span className="text-sm">{stock.price ? `$${stock.price}` : ''}</span>
                      </div>
                      {stock.recommendation && (
                        <p className="text-sm mt-1 opacity-90">{stock.recommendation}</p>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
        <div className="text-xs text-gray-500 mt-1 px-1">
          {message.timestamp?.toDate?.()?.toLocaleTimeString() || 'Just now'}
        </div>
      </div>
    </div>
  );
}

function SuggestedPrompt({ text, onClick }) {
  return (
    <button
      onClick={() => onClick(text)}
      className="bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded-lg text-sm transition"
    >
      {text}
    </button>
  );
}

export default function ChatbotPage() {
  const router = useRouter();
  const [token, setToken] = useState('');
  const [userId, setUserId] = useState('');
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState('');
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  const suggestedPrompts = [
    "What stocks should I invest in based on my risk profile?",
    "Analyze my current portfolio",
    "What are the market trends today?",
    "Should I buy or sell AAPL?",
    "Explain diversification strategy",
    "What are blue-chip stocks?"
  ];

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

  // Subscribe to chat history
  useEffect(() => {
    if (!userId) return;
    
    setLoading(true);
    
    const unsubscribe = subscribeToChatHistory(
      userId,
      (chatMessages) => {
        setMessages(chatMessages);
        setLoading(false);
      },
      (err) => {
        setError(err.message);
        setLoading(false);
      }
    );
    
    return () => unsubscribe();
  }, [userId]);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Focus input on mount
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const handleSendMessage = async (messageText = inputMessage) => {
    if (!messageText.trim() || sending) return;
    
    const userMessage = messageText.trim();
    setInputMessage('');
    setSending(true);
    setError('');
    
    try {
      // Save user message to Firestore
      await addChatMessage(userId, {
        message: userMessage,
        role: 'user'
      });
      
      // Send to AI backend
      const response = await axios.post(
        `${API_URL}/api/chat`,
        { message: userMessage },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      // Save AI response to Firestore
      const aiResponse = response.data.response || response.data.message || 'No response from AI';
      await addChatMessage(userId, {
        message: aiResponse,
        role: 'assistant',
        stocks: response.data.stocks || []
      });
      
    } catch (err) {
      console.error('Chat error:', err);
      setError(err.response?.data?.error || 'Failed to send message');
      
      // Add error message to chat
      await addChatMessage(userId, {
        message: `Sorry, I encountered an error: ${err.response?.data?.error || err.message}`,
        role: 'assistant',
        isError: true
      });
    } finally {
      setSending(false);
      inputRef.current?.focus();
    }
  };

  const handleClearHistory = async () => {
    if (!confirm('Are you sure you want to clear all chat history?')) return;
    
    try {
      await clearChatHistory(userId);
      setMessages([]);
    } catch (err) {
      console.error('Error clearing history:', err);
      setError('Failed to clear history');
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 flex items-center justify-center">
        <div className="text-white text-xl">Loading chat...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 flex flex-col">
      {/* Header */}
      <div className="bg-gray-800 border-b border-gray-700 p-4">
        <div className="max-w-4xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-green-600 rounded-full flex items-center justify-center">
              <Bot className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-white">AI Investment Advisor</h1>
              <p className="text-sm text-gray-400">
                {sending ? 'Typing...' : 'Online'}
              </p>
            </div>
          </div>
          
          <button
            onClick={handleClearHistory}
            className="flex items-center gap-2 text-red-400 hover:text-red-300 transition"
            disabled={messages.length === 0}
          >
            <Trash2 className="w-5 h-5" />
            Clear
          </button>
        </div>
      </div>

      {/* Messages Container */}
      <div className="flex-1 overflow-y-auto p-6">
        <div className="max-w-4xl mx-auto">
          {error && (
            <div className="bg-red-500/20 border border-red-500 text-red-200 p-4 rounded-lg mb-6 flex items-center gap-2">
              <AlertCircle className="w-5 h-5" />
              {error}
            </div>
          )}

          {messages.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-20 h-20 bg-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <Bot className="w-10 h-10 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-white mb-2">
                Welcome to AI Investment Advisor
              </h2>
              <p className="text-gray-400 mb-8">
                Ask me anything about investments, stocks, or your portfolio!
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-w-2xl mx-auto">
                {suggestedPrompts.map((prompt, idx) => (
                  <SuggestedPrompt
                    key={idx}
                    text={prompt}
                    onClick={handleSendMessage}
                  />
                ))}
              </div>
            </div>
          ) : (
            <>
              {messages.map((msg, idx) => (
                <ChatMessage
                  key={msg.id || idx}
                  message={msg.message || msg}
                  isUser={msg.role === 'user'}
                />
              ))}
              
              {sending && (
                <div className="flex gap-3 mb-4">
                  <div className="flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center bg-green-600">
                    <Bot className="w-5 h-5 text-white" />
                  </div>
                  <div className="flex-1">
                    <div className="inline-block px-4 py-3 rounded-lg bg-gray-700 text-white rounded-tl-none">
                      <Loader2 className="w-5 h-5 animate-spin" />
                    </div>
                  </div>
                </div>
              )}
              
              <div ref={messagesEndRef} />
            </>
          )}
        </div>
      </div>

      {/* Input Area */}
      <div className="bg-gray-800 border-t border-gray-700 p-4">
        <div className="max-w-4xl mx-auto">
          <div className="flex gap-3">
            <input
              ref={inputRef}
              type="text"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Ask me about investments..."
              disabled={sending}
              className="flex-1 bg-gray-700 text-white px-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
            />
            <button
              onClick={() => handleSendMessage()}
              disabled={!inputMessage.trim() || sending}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {sending ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <Send className="w-5 h-5" />
              )}
            </button>
          </div>
          
          <p className="text-xs text-gray-500 mt-2 text-center">
            AI can make mistakes. Always verify important information.
          </p>
        </div>
      </div>
    </div>
  );
}
