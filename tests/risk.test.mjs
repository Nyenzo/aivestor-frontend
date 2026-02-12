import { computeRisk } from "../app/lib/risk.js";

function assert(name, condition) {
  if (!condition) {
    console.error("[FAIL]", name);
    process.exitCode = 1;
  } else {
    console.log("[PASS]", name);
  }
}

// Happy path average volatility > 0 and < 100
const scoreMid = computeRisk([
  { symbol: "AAPL", volatility: 0.3 },
  { symbol: "MSFT", volatility: 0.4 },
  { symbol: "TSLA", volatility: 0.6 }
]);
assert("average volatility mid range", scoreMid > 0 && scoreMid < 100);

// Empty positions
assert("empty positions returns 0", computeRisk([]) === 0);

// Malformed entries handled
assert("malformed entries handled", computeRisk([null, 42, { symbol: "AAPL" }]) >= 0);

// Upper bound capped at 100
assert("upper bound capped", computeRisk([{ symbol: "X", volatility: 5 }]) === 100);

// Crypto inferred high risk
const cryptoScore = computeRisk([{ symbol: "BTC-USD" }]);
assert("crypto inferred high", cryptoScore >= 70);
