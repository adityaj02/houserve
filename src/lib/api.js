/**
 * Central API client for communicating with the Express/MongoDB backend.
 * Replaces all Supabase .from() data calls.
 */

export const getApiBase = () => {
  const url = import.meta.env.VITE_API_URL;
  if (url && url.trim() !== "") {
    return url.replace(/\/+$/, "");
  }
  // Local development fallback
  return "http://localhost:5000";
};

const API_BASE = getApiBase();

function getToken() {
  return localStorage.getItem("auth_token") || "";
}

function authHeaders() {
  const token = getToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
}

async function request(path, options = {}) {
  const base = getApiBase();
  const url = `${base}${path}`;
  let res;

  try {
    res = await fetch(url, {
      headers: {
        "Content-Type": "application/json",
        ...authHeaders(),
        ...options.headers,
      },
      ...options,
    });
  } catch (netErr) {
    throw new Error(`Unable to connect to backend server (${base}). Please verify backend status.`);
  }

  const contentType = res.headers.get("content-type") || "";
  let data;

  if (contentType.includes("application/json")) {
    try {
      data = await res.json();
    } catch (parseErr) {
      throw new Error(
        `Received non-JSON response from backend (${res.status}). Please verify backend server on port 5000 is active.`
      );
    }
  } else {
    if (!res.ok) {
      throw new Error(
        `Backend API returned status ${res.status}. If deployed on Vercel, please set VITE_API_URL to your Render backend URL.`
      );
    }
    const text = await res.text();
    data = { message: text };
  }

  if (!res.ok) {
    throw new Error(data?.error || data?.message || `Request failed: ${res.status}`);
  }

  return data;
}

// ---------- Auth ----------

export async function googleLogin(credential) {
  return request("/api/auth/google", {
    method: "POST",
    body: JSON.stringify({ credential }),
  });
}

// ---------- User Profile ----------

export async function getProfile() {
  return request("/api/users/me");
}

export async function updateProfile({ name, phone, location }) {
  return request("/api/users/me", {
    method: "PUT",
    body: JSON.stringify({ name, phone, location }),
  });
}

// ---------- Services ----------

export async function fetchServices() {
  return request("/api/services");
}

export async function fetchServiceById(id) {
  return request(`/api/services/${id}`);
}

// ---------- Blogs ----------

export async function fetchBlogs() {
  return request("/api/blogs");
}

export async function fetchBlogBySlug(slug) {
  return request(`/api/blogs/${slug}`);
}

// ---------- Orders ----------

export async function fetchOrders(phone) {
  const query = phone ? `?phone=${encodeURIComponent(phone)}` : "";
  return request(`/api/orders${query}`);
}

export async function getOrderCount() {
  return request("/api/orders/count");
}

export async function createOrders(rows) {
  return request("/api/orders", {
    method: "POST",
    body: JSON.stringify(rows),
  });
}

export async function cancelOrder(orderId) {
  return request(`/api/orders/${orderId}/cancel`, {
    method: "PATCH",
  });
}

// ---------- Properties ----------

export async function fetchProperties(filters = {}) {
  const params = new URLSearchParams();
  Object.entries(filters).forEach(([key, val]) => {
    if (val !== undefined && val !== null && val !== "") {
      params.set(key, val);
    }
  });
  const query = params.toString() ? `?${params}` : "";
  return request(`/api/properties${query}`);
}

export async function fetchPropertyBySlug(slug) {
  return request(`/api/properties/${slug}`);
}

export async function createProperty(data) {
  return request("/api/properties", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function updateProperty(slug, data) {
  return request(`/api/properties/${slug}`, {
    method: "PUT",
    body: JSON.stringify(data),
  });
}

export async function deleteProperty(slug) {
  return request(`/api/properties/${slug}`, {
    method: "DELETE",
  });
}
