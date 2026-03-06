import { computeRisk } from '../../app/lib/risk.js';

describe('Risk Calculation', () => {
    it('calculates average volatility mid range', () => {
        const scoreMid = computeRisk([
            { symbol: "AAPL", volatility: 0.3 },
            { symbol: "MSFT", volatility: 0.4 },
            { symbol: "TSLA", volatility: 0.6 }
        ]);
        expect(scoreMid).toBeGreaterThan(0);
        expect(scoreMid).toBeLessThan(100);
    });

    it('returns 0 for empty positions', () => {
        expect(computeRisk([])).toBe(0);
    });

    it('handles malformed entries', () => {
        expect(computeRisk([null, 42, { symbol: "AAPL" }])).toBeGreaterThanOrEqual(0);
    });

    it('caps upper bound at 100', () => {
        expect(computeRisk([{ symbol: "X", volatility: 5 }])).toBe(100);
    });

    it('infers high risk for crypto', () => {
        expect(computeRisk([{ symbol: "BTC-USD" }])).toBeGreaterThanOrEqual(70);
    });
});
