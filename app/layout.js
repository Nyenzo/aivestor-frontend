import { Inter } from "next/font/google";
import "./globals.css";
import ErrorBoundary from './components/ErrorBoundary';
import SessionMonitor from './components/SessionMonitor';
import ToasterProvider from './components/ToasterProvider';

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  weight: ['300', '400', '500', '600', '700', '800', '900'],
});

export const metadata = {
  title: "Aivestor | Advanced AI Investment Terminal",
  description: "Aivestor is a next-generation AI-powered investment platform providing predictive analytics, portfolio optimization, and embedded finance solutions.",
  keywords: "AI investing, stock prediction, portfolio management, finance, algorithmic trading",
  openGraph: {
    title: "Aivestor | Advanced AI Investment Terminal",
    description: "Aivestor is a next-generation AI-powered investment platform providing predictive analytics and portfolio optimization.",
    type: "website",
    siteName: "Aivestor",
  }
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className="light">
      <head>
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&family=JetBrains+Mono:wght@400;500;700&display=swap" rel="stylesheet" />
        <link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap" rel="stylesheet" />
      </head>
      <body className={`${inter.variable} antialiased bg-background-light text-slate-900 min-h-screen font-display selection:bg-primary/20 selection:text-primary`}>
        <ErrorBoundary>
          <SessionMonitor />
          {children}
          <ToasterProvider />
        </ErrorBoundary>
      </body>
    </html>
  );
}
