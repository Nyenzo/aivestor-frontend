import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import ErrorBoundary from './components/ErrorBoundary';
import Navigation from './components/Navigation';
import SessionMonitor from './components/SessionMonitor';
import { Toaster } from 'react-hot-toast';

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: "Aivestor - AI Investment Platform",
  description: "Modern AI-powered investment dashboard and portfolio manager.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="antialiased bg-gray-950 text-white min-h-screen">
        <ErrorBoundary>
          <SessionMonitor />
          <div className="flex min-h-screen">
            <Navigation />
            <main className="flex-1">
              {children}
            </main>
          </div>
          <Toaster
            position="top-right"
            toastOptions={{
              duration: 4000,
              style: {
                background: '#1f2937',
                color: '#fff',
                borderRadius: '8px',
                padding: '16px',
              },
              success: {
                iconTheme: {
                  primary: '#10b981',
                  secondary: '#fff',
                },
              },
              error: {
                iconTheme: {
                  primary: '#ef4444',
                  secondary: '#fff',
                },
              },
            }}
          />
        </ErrorBoundary>
      </body>
    </html>
  );
}
