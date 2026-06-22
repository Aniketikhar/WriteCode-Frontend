/**
 * Centralized API client with automatic token refresh.
 *
 * - Access token is stored in a module-level variable (NOT localStorage).
 * - Refresh token is in an HTTP-only cookie (browser sends it automatically).
 * - On 401, the client attempts a silent refresh and retries the request once.
 * - If refresh fails, the user is redirected to /login.
 */

const API_BASE = import.meta.env.VITE_API_BASE_URL;

// ── In-memory access token ───────────────────────────────────────────────────

let accessToken = null;

export const setAccessToken = (token) => {
  accessToken = token;
};

export const getAccessToken = () => accessToken;

export const clearAuth = () => {
  accessToken = null;
  localStorage.removeItem("isLoggedIn");
};

// ── Refresh logic ────────────────────────────────────────────────────────────

let refreshPromise = null; // Prevents multiple simultaneous refresh calls

const refreshAccessToken = async () => {
  // If a refresh is already in-flight, wait for it
  if (refreshPromise) return refreshPromise;

  refreshPromise = (async () => {
    try {
      const res = await fetch(`${API_BASE}/api/auth/refresh`, {
        method: "POST",
        credentials: "include", // Send cookies
      });

      if (!res.ok) {
        throw new Error("Refresh failed");
      }

      const data = await res.json();
      if (data.success && data.accessToken) {
        accessToken = data.accessToken;
        return true;
      }
      throw new Error("No access token in response");
    } catch {
      clearAuth();
      return false;
    } finally {
      refreshPromise = null;
    }
  })();

  return refreshPromise;
};

// ── Core fetch wrapper ───────────────────────────────────────────────────────

const apiFetch = async (endpoint, options = {}, _isRetry = false) => {
  const url = `${API_BASE}${endpoint}`;

  const headers = {
    "Content-Type": "application/json",
    ...options.headers,
  };

  if (accessToken) {
    headers["Authorization"] = `Bearer ${accessToken}`;
  }

  const res = await fetch(url, {
    ...options,
    headers,
    credentials: "include", // Always send cookies (for refresh token)
  });

  // If 401 and not already a retry → try refreshing
  if (res.status === 401 && !_isRetry) {
    const refreshed = await refreshAccessToken();
    if (refreshed) {
      return apiFetch(endpoint, options, true); // Retry with new token
    }
    // Refresh failed → redirect to login
    window.location.href = "/login";
    throw new Error("Session expired. Please log in again.");
  }

  return res;
};

// ── Convenience methods ──────────────────────────────────────────────────────

const api = {
  get: (endpoint, options = {}) =>
    apiFetch(endpoint, { ...options, method: "GET" }),

  post: (endpoint, body = {}, options = {}) =>
    apiFetch(endpoint, {
      ...options,
      method: "POST",
      body: JSON.stringify(body),
    }),

  put: (endpoint, body = {}, options = {}) =>
    apiFetch(endpoint, {
      ...options,
      method: "PUT",
      body: JSON.stringify(body),
    }),

  delete: (endpoint, body = {}, options = {}) =>
    apiFetch(endpoint, {
      ...options,
      method: "DELETE",
      body: JSON.stringify(body),
    }),
};

export default api;
