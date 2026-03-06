import { decodeToken, isTokenExpired, getTimeUntilExpiry } from '../../app/lib/session.js';

describe('Session Utilities', () => {
    it('decodeToken handles valid token', () => {
        const payload = Buffer.from(JSON.stringify({ exp: Math.floor(Date.now() / 1000) + 3600 })).toString('base64');
        const token = `header.${payload}.signature`;
        const decoded = decodeToken(token);
        expect(decoded).not.toBeNull();
        expect(decoded.exp).toBeTruthy();
    });

    it('decodeToken returns null for invalid token', () => {
        expect(decodeToken('invalid-token')).toBeNull();
    });

    it('decodeToken handles null input', () => {
        expect(decodeToken(null)).toBeNull();
    });

    it('isTokenExpired detects expired token', () => {
        const payload = Buffer.from(JSON.stringify({ exp: Math.floor(Date.now() / 1000) - 3600 })).toString('base64');
        expect(isTokenExpired(`header.${payload}.signature`)).toBe(true);
    });

    it('isTokenExpired detects valid token', () => {
        const payload = Buffer.from(JSON.stringify({ exp: Math.floor(Date.now() / 1000) + 3600 })).toString('base64');
        expect(isTokenExpired(`header.${payload}.signature`)).toBe(false);
    });

    it('isTokenExpired handles null token', () => {
        expect(isTokenExpired(null)).toBe(true);
    });

    it('getTimeUntilExpiry returns positive time', () => {
        const payload = Buffer.from(JSON.stringify({ exp: Math.floor(Date.now() / 1000) + 3600 })).toString('base64');
        expect(getTimeUntilExpiry(`header.${payload}.signature`)).toBeGreaterThan(0);
    });

    it('getTimeUntilExpiry returns 0 for expired token', () => {
        const payload = Buffer.from(JSON.stringify({ exp: Math.floor(Date.now() / 1000) - 3600 })).toString('base64');
        expect(getTimeUntilExpiry(`header.${payload}.signature`)).toBe(0);
    });

    it('getTimeUntilExpiry handles null token', () => {
        expect(getTimeUntilExpiry(null)).toBe(0);
    });
});
