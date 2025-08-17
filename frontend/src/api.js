const API_URL = "http://localhost:8000"; // backend base

// Generic POST helper
async function postData(endpoint, data) {
  const res = await fetch(`${API_URL}${endpoint}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });

  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.detail || "Request failed");
  }
  return res.json();
}

export async function register(user) {
  return postData("/auth/register", user);
}

export async function login(user) {
  return postData("/auth/login", user);
}
