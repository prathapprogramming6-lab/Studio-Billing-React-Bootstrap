const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ||
  "http://localhost:5000/api";


// =====================================================
// GET CURRENT TOKEN
// =====================================================

export function getToken() {
  return localStorage.getItem("studioToken") || "";
}


// =====================================================
// GET CURRENT USER
// =====================================================

export function getStoredUser() {
  try {
    return JSON.parse(
      localStorage.getItem("studioUser") || "null"
    );
  } catch {
    return null;
  }
}


// =====================================================
// CLEAR SESSION
// =====================================================

export function clearSession() {
  [
    "studioToken",
    "studioUser",

    // Remove old session keys also
    "authToken",
    "loggedInUser",
    "loggedInUserId",
    "studioLoggedIn"
  ].forEach((key) => {
    localStorage.removeItem(key);
  });
}


// =====================================================
// API FETCH
// =====================================================

export async function apiFetch(
  path,
  options = {}
) {
  const token = getToken();

  const headers = {
    ...(options.body !== undefined
      ? {
          "Content-Type":
            "application/json"
        }
      : {}),

    ...(options.headers || {})
  };


  if (token) {
    headers.Authorization =
      `Bearer ${token}`;
  }


  const response = await fetch(
    `${API_BASE_URL}${path}`,
    {
      ...options,
      headers
    }
  );


  let data = null;

  try {
    data = await response.json();
  } catch {
    data = {};
  }


  // ===================================================
  // UNAUTHORIZED
  // ===================================================

  if (response.status === 401) {

    clearSession();

    window.location.href =
      "/login";

    throw new Error(
      data.message ||
        "Session expired"
    );
  }


  // ===================================================
  // SOFTWARE NOT ACTIVATED
  // ===================================================

  if (
    response.status === 403 &&
    data.code ===
      "SOFTWARE_NOT_ACTIVATED"
  ) {

    window.location.href =
      "/activate";

    throw new Error(
      data.message ||
        "Software activation required"
    );
  }


  // ===================================================
  // SUBSCRIPTION EXPIRED
  // ===================================================

  if (
    response.status === 403 &&
    data.code ===
      "SUBSCRIPTION_EXPIRED"
  ) {

    throw new Error(
      data.message ||
        "Your free trial or subscription has expired."
    );
  }


  // ===================================================
  // OTHER ERRORS
  // ===================================================

  if (!response.ok) {

    throw new Error(
      data.message ||
        "Request failed"
    );
  }


  return data;
}


// =====================================================
// MONEY FORMAT
// =====================================================

export const money = (value) =>
  `₹${Number(value || 0).toLocaleString(
    "en-IN"
  )}`;


// =====================================================
// DATE FORMAT
// =====================================================

export const dateText = (value) => {

  if (!value) return "-";

  const d = new Date(value);

  if (Number.isNaN(d.getTime())) {
    return value;
  }

  return d.toLocaleDateString(
    "en-IN",
    {
      day: "2-digit",
      month: "short",
      year: "numeric"
    }
  );
};