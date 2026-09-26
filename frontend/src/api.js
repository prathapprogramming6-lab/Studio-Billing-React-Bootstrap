const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ||
  "https://studio-billing-react-bootstrap.onrender.com/api";

export function getToken() {
  return localStorage.getItem("studioToken") || "";
}

export function getStoredUser() {
  try {
    return JSON.parse(
      localStorage.getItem("studioUser") || "null"
    );
  } catch {
    return null;
  }
}

export function clearSession() {
  [
    "studioToken",
    "studioUser",
    "authToken",
    "loggedInUser",
    "loggedInUserId",
    "studioLoggedIn"
  ].forEach((key) => {
    localStorage.removeItem(key);
  });
}

export async function apiFetch(path, options = {}) {
  const token = getToken();

  const headers = {
    ...(options.body !== undefined
      ? { "Content-Type": "application/json" }
      : {}),
    ...(options.headers || {})
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
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

  if (response.status === 401) {
    clearSession();
    window.location.href = "/login";

    throw new Error(
      data.message || "Session expired"
    );
  }

  if (
    response.status === 403 &&
    data.code === "SOFTWARE_NOT_ACTIVATED"
  ) {
    window.location.href = "/activate";

    throw new Error(
      data.message ||
        "Software activation required"
    );
  }

  if (
    response.status === 403 &&
    data.code === "SUBSCRIPTION_EXPIRED"
  ) {
    throw new Error(
      data.message ||
        "Your free trial or subscription has expired."
    );
  }

  if (!response.ok) {
    throw new Error(
      data.message || "Request failed"
    );
  }

  return data;
}

export const money = (value) =>
  `₹${Number(value || 0).toLocaleString("en-IN")}`;

export const dateText = (value) => {
  if (!value) return "-";

  const d = new Date(value);

  if (Number.isNaN(d.getTime())) {
    return value;
  }

  return d.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric"
  });
};