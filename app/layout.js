import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

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
        <div className="flex flex-col min-h-screen">
          <header className="md:hidden flex items-center justify-between bg-gray-900 px-4 py-3 shadow-lg sticky top-0 z-50">
            <a href="/dashboard" className="text-xl font-bold text-blue-400">Aivestor</a>
            <nav className="flex gap-4">
              <a href="/dashboard" className="hover:text-blue-400 transition">Dashboard</a>
              <a href="/users" className="hover:text-blue-400 transition">Portfolio</a>
              <a href="/risk-assessment" className="hover:text-blue-400 transition">Risk</a>
              <a href="/login" className="hover:text-blue-400 transition">Logout</a>
            </nav>
          </header>
          <main className="flex-1 flex flex-col md:flex-row">
            {children}
          </main>
        </div>
      </body>
    </html>
  );
}
