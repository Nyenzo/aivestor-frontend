// Pure utility to compute a simple risk score for a portfolio
// Contract:
// - Input: positions: Array<{ symbol: string, quantity: number, avg_price?: number, volatility?: number }>
// - Output: 0..100 number (higher is riskier)
// - Behavior: empty/invalid inputs return 0

export function computeRisk(positions) {
  try {
    if (!Array.isArray(positions) || positions.length === 0) return 0;
    // Heuristic: base on volatility if provided, else infer from symbol beta proxies
    let total = 0;
    let count = 0;
    for (const p of positions) {
      if (!p || typeof p !== 'object') continue;
      const vol = typeof p.volatility === 'number' ? p.volatility : inferVolatilityFromSymbol(p.symbol);
      if (Number.isFinite(vol)) {
        total += Math.max(0, Math.min(vol, 1));
        count += 1;
      }
    }
    if (count === 0) return 0;
    // Map avg volatility [0..1] to [0..100]
    return Math.round((total / count) * 100);
  } catch (_) {
    return 0;
  }
}

function inferVolatilityFromSymbol(symbol) {
  if (!symbol || typeof symbol !== 'string') return 0.2;
  const s = symbol.toUpperCase();
  // Rough buckets: mega-cap tech considered mid; small-caps and crypto tickers higher
  if (/(AAPL|MSFT|GOOGL|AMZN|META|NVDA)/.test(s)) return 0.35;
  if (/(TSLA|SNOW|COIN|PLTR)/.test(s)) return 0.6;
  if (/\-USD$/.test(s) || /BTC|ETH/.test(s)) return 0.8;
  return 0.3;
}

export default computeRisk;
