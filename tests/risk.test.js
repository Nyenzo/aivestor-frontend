import { computeRisk } from "../app/lib/risk.js";

function assert(name, condition) {
  if (!condition) {
    console.error("[FAIL]", name);
    process.exitCode = 1;
  } else {
    console.log("[PASS]", name);
  }
}

// Happy path average volatility
assert("average volatility mid", computeRisk([
  { symbol: "AAPL", volatility: 0.3 },
  { symbol: "MSFT", volatility: 0.4 },
  { symbol: "TSLA", volatility: 0.6 }
]) > 0);

// Empty positions
assert("empty positions", computeRisk([]) === 0);

// Graceful handling of malformed entries
assert("malformed entries ignored", computeRisk([null, 42, { symbol: "AAPL" }]) >= 0);

// Volatility upper bound capped at 1
assert("upper bound capped", computeRisk([
  { symbol: "X", volatility: 5 }
]) === 100);

// Crypto higher inferred volatility
const cryptoScore = computeRisk([{ symbol: "BTC-USD" }]);
assert("crypto inferred high", cryptoScore >= 70);
