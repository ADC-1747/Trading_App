// const API_URL = "http://localhost:8000"; // backend base

export const API_URL = "https://localhost:8000"; // backend base


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

async function postForm(endpoint, data) {
  const token = localStorage.getItem("token"); // get token

  const res = await fetch(`${API_URL}${endpoint}`, {
    method: "POST",
    headers: { 
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token}`, // attach token
    },
    body: JSON.stringify(data),
  });

   if (res.status === 401) {
    localStorage.removeItem("token"); // clear invalid/expired token
    window.location.href = "/login"; // redirect to login page
    return;
  }

  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.detail || "Request failed");
  }

  return res.json();
}


async function getRequest(endpoint){
  const token = localStorage.getItem("token");
  const res = await fetch(`${API_URL}${endpoint}`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  });

  if (res.status === 401) {
    localStorage.removeItem("token"); // clear invalid/expired token
    window.location.href = "/login"; // redirect to login page
    return;
  }

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.detail || "Request failed");
  }

  return res.json();

}


async function deleteRequest(endpoint){
  const token = localStorage.getItem("token");
  const res = await fetch(`${API_URL}${endpoint}`, {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  });

  if (res.status === 401) {
    localStorage.removeItem("token"); // clear invalid/expired token
    window.location.href = "/login"; // redirect to login page
    return;
  }

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
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

export async function getMarket() {
  return getRequest("/symbols");
}

export async function getUserPage() {
  return getRequest("/auth/me")
}
export async function getUserOrders() {
  return getRequest("/orders/me")
}
export async function getUserTrades() {
  return getRequest("/trades/me")
}
export async function cancelActiveOrder(id) {
  return deleteRequest(`/orders/cancel/${id}`)
}

export async function getTicker(id) {
  return getRequest(`/orders/symbol/${id}`)
  
}



export async function postNewOrder(form) {
  return postForm("/orders/new",form)
}
