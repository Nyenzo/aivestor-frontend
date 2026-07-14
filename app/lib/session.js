

const TOKEN_KEY = "token";
const USER_KEY = "user";
const SESSION_CHECK_INTERVAL = 60000; // Check every minute

export function decodeToken(token) {
  if (typeof token !== 'string') return null;
  try {
    const parts = token.split(".");
    if (parts.length < 2) return null;

    let base64 = parts[1].replace(/-/g, '+').replace(/_/g, '/');
    while (base64.length % 4) {
      base64 += '=';
    }

    const decoded = JSON.parse(atob(base64));
    return decoded;
  } catch (error) {
    console.error("Failed to decode token:", error);
    return null;
  }
}

export function isTokenExpired(token) {
  if (!token) return true;

  const decoded = decodeToken(token);
  if (!decoded || !decoded.exp) return true;

  // Token expiration is in seconds, Date.now() is in milliseconds
  const expirationTime = decoded.exp * 1000;
  const currentTime = Date.now();

  return currentTime >= expirationTime;
}

export function getTimeUntilExpiry(token) {
  if (!token) return 0;

  const decoded = decodeToken(token);
  if (!decoded || !decoded.exp) return 0;

  const expirationTime = decoded.exp * 1000;
  const currentTime = Date.now();
  const timeRemaining = expirationTime - currentTime;

  return Math.max(0, timeRemaining);
}

export function clearAuthData() {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
}

export function startSessionMonitoring(onSessionExpired) {
  let intervalId = null;
  let warningTimeoutId = null;

  const checkSession = () => {
    const token = localStorage.getItem(TOKEN_KEY);

    if (isTokenExpired(token)) {
      // Token is expired, logout immediately
      clearAuthData();
      if (onSessionExpired) {
        onSessionExpired("expired");
      }
      return;
    }

    // Check if token will expire in the next 5 minutes
    const timeUntilExpiry = getTimeUntilExpiry(token);
    const fiveMinutes = 5 * 60 * 1000;

    if (timeUntilExpiry > 0 && timeUntilExpiry < fiveMinutes) {
      // Warn user about upcoming expiration
      if (onSessionExpired) {
        onSessionExpired("warning", Math.floor(timeUntilExpiry / 1000));
      }
    }
  };

  // Initial check
  checkSession();

  // Set up periodic checks
  intervalId = setInterval(checkSession, SESSION_CHECK_INTERVAL);

  // Cleanup function
  return () => {
    if (intervalId) clearInterval(intervalId);
    if (warningTimeoutId) clearTimeout(warningTimeoutId);
  };
}

export async function refreshToken(currentToken) {
  const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

  try {
    const response = await fetch(`${API_URL}/api/auth/refresh`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${currentToken}`,
      },
    });

    if (!response.ok) {
      throw new Error("Token refresh failed");
    }

    const data = await response.json();

    // Update stored token
    if (data.token) {
      localStorage.setItem("token", data.token);
    }

    return data.token;
  } catch (error) {
    console.error("Token refresh error:", error);
    throw error;
  }
}

export function shouldRedirectToLogin() {
  if (typeof window === "undefined") return false;

  const token = localStorage.getItem(TOKEN_KEY);
  return isTokenExpired(token);
}
