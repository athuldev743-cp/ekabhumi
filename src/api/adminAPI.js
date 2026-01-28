// src/api/adminAPI.js
const API_URL = "https://ekb-backend.onrender.com";

export const adminLogin = async (email, password) => {
  const form = new FormData();
  form.append("email", email);
  form.append("password", password);

  const res = await fetch(`${API_URL}/login`, {
    method: "POST",
    body: form
  });

  if (!res.ok) throw await res.json();
  return res.json();
};

export const createProduct = async (productData, token) => {
  const form = new FormData();
  Object.keys(productData).forEach((key) => form.append(key, productData[key]));

  const res = await fetch(`${API_URL}/products`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
    body: form
  });

  if (!res.ok) throw await res.json();
  return res.json();
};

export const getProducts = async (token) => {
  const res = await fetch(`${API_URL}/products`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  if (!res.ok) throw await res.json();
  return res.json();
};

export const updateProduct = async (id, data, token) => {
  const form = new FormData();
  Object.keys(data).forEach((key) => form.append(key, data[key]));

  const res = await fetch(`${API_URL}/products/${id}`, {
    method: "PUT",
    headers: { Authorization: `Bearer ${token}` },
    body: form
  });

  if (!res.ok) throw await res.json();
  return res.json();
};

export const deleteProduct = async (id, token) => {
  const res = await fetch(`${API_URL}/products/${id}`, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${token}` }
  });
  if (!res.ok) throw await res.json();
  return res.json();
};

export const getOrders = async (token) => {
  const res = await fetch(`${API_URL}/orders`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  if (!res.ok) throw await res.json();
  return res.json();
};