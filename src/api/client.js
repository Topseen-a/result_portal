const BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:8000/api";

const ACCESS_KEY = "rp_access_token";
const REFRESH_KEY = "rp_refresh_token";
const USER_KEY = "rp_user";

export function getAccessToken() {
  return localStorage.getItem(ACCESS_KEY);
}

export function getRefreshToken() {
  return localStorage.getItem(REFRESH_KEY);
}

export function getStoredUser() {
  const raw = localStorage.getItem(USER_KEY);
  return raw ? JSON.parse(raw) : null;
}

export function storeSession({ access, refresh, ...user }) {
  localStorage.setItem(ACCESS_KEY, access);
  localStorage.setItem(REFRESH_KEY, refresh);
  localStorage.setItem(USER_KEY, JSON.stringify(user));
}

export function clearSession() {
  localStorage.removeItem(ACCESS_KEY);
  localStorage.removeItem(REFRESH_KEY);
  localStorage.removeItem(USER_KEY);
}

class ApiError extends Error {
  constructor(message, status, data) {
    super(message);
    this.status = status;
    this.data = data;
  }
}

// Tries to refresh the access token using the stored refresh token.
// Returns the new access token, or null if refresh failed.
async function tryRefreshToken() {
  const refresh = getRefreshToken();
  if (!refresh) return null;

  try {
    const res = await fetch(`${BASE_URL}/auth/token/refresh/`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refresh }),
    });
    if (!res.ok) return null;
    const data = await res.json();
    localStorage.setItem(ACCESS_KEY, data.access);
    return data.access;
  } catch {
    return null;
  }
}

// Core request helper. Attaches the access token, retries once on 401
// after attempting a token refresh, and throws ApiError with parsed
// response data so callers can show useful messages.
export async function apiRequest(path, { method = "GET", body, auth = true, retry = true } = {}) {
  const headers = { "Content-Type": "application/json" };
  if (auth) {
    const token = getAccessToken();
    if (token) headers.Authorization = `Bearer ${token}`;
  }

  const res = await fetch(`${BASE_URL}${path}`, {
    method,
    headers,
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });

  if (res.status === 401 && auth && retry) {
    const newToken = await tryRefreshToken();
    if (newToken) {
      return apiRequest(path, { method, body, auth, retry: false });
    }
    clearSession();
    window.location.href = "/login";
    throw new ApiError("Session expired", 401, null);
  }

  let data = null;
  const text = await res.text();
  if (text) {
    try {
      data = JSON.parse(text);
    } catch {
      data = text;
    }
  }

  if (!res.ok) {
    throw new ApiError(extractErrorMessage(data), res.status, data);
  }

  return data;
}

// Backend errors show up in a few shapes: DRF's { detail: "..." }, our own
// { error / message: "..." }, per-field validation errors like
// { email: ["already exists"] }, or (for endpoints that deliberately don't
// reveal specifics, like login) no body at all. Flatten all of that into one
// readable sentence instead of ever showing raw JSON or a bare status code.
function extractErrorMessage(data) {
  if (!data) return "Something went wrong. Please try again.";
  if (typeof data === "string") return data;
  if (data.detail) return data.detail;
  if (data.error) return data.error;
  if (data.message) return data.message;

  const flattened = flattenFieldErrors(data.errors || data);
  return flattened || "Something went wrong. Please try again.";
}

function flattenFieldErrors(value) {
  if (Array.isArray(value)) return value.filter(Boolean).join(" ");
  if (value && typeof value === "object") {
    return Object.entries(value)
      .map(([field, msg]) => {
        const text = flattenFieldErrors(msg);
        if (!text) return null;
        return field === "non_field_errors" ? text : `${humanizeField(field)}: ${text}`;
      })
      .filter(Boolean)
      .join(" ");
  }
  return typeof value === "string" ? value : "";
}

function humanizeField(field) {
  return field
    .replace(/_/g, " ")
    .replace(/^./, (c) => c.toUpperCase());
}

export { ApiError, BASE_URL };

// DRF's PageNumberPagination wraps every list response in
// { count, next, previous, results: [...] } - unwrap it so callers can
// keep treating list endpoints as plain arrays.
export function unwrapResults(data) {
  if (Array.isArray(data)) return data;
  if (data && Array.isArray(data.results)) return data.results;
  return data;
}
