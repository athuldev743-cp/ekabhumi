// src/api/adminAPI.js - UPDATED TO MATCH YOUR BACKEND
const API_URL = process.env.REACT_APP_API_URL || "https://ekb-backend.onrender.com";

export const adminLogin = async (email, password) => {
  const form = new FormData();
  form.append("email", email);
  form.append("password", password);

  const res = await fetch(`${API_URL}/admin/login`, {
    method: "POST",
    body: form,
    headers: {
      'Accept': 'application/json',
    },
  });
  
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({ detail: 'Login failed' }));
    throw errorData;
  }
  
  return await res.json();
};

// Note: Your backend's create_product is at POST /products (not /admin/products)
// But it requires admin authentication via admin_only dependency
export const createProduct = async (formData, token) => {
  const res = await fetch(`${API_URL}/products`, {
    method: "POST",
    headers: { 
      'Authorization': `Bearer ${token}`,
    },
    body: formData,
  });
  
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({ detail: 'Create product failed' }));
    throw errorData;
  }
  
  return await res.json();
};

// Note: Your backend's get_products is at GET /products (public)
// For admin dashboard, you might want to get all products including unpublished
export const getProducts = async (token) => {
  const res = await fetch(`${API_URL}/products`, {
    headers: { 
      'Authorization': `Bearer ${token}`, // Not needed for public endpoint
      'Accept': 'application/json'
    },
  });
  
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({ detail: 'Fetch products failed' }));
    throw errorData;
  }
  
  return await res.json();
};

// You need to add these endpoints to your backend
export const updateProduct = async (id, formData, token) => {
  const res = await fetch(`${API_URL}/products/${id}`, {
    method: "PUT",
    headers: { 
      'Authorization': `Bearer ${token}`,
    },
    body: formData,
  });
  
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({ detail: 'Update product failed' }));
    throw errorData;
  }
  
  return await res.json();
};

export const deleteProduct = async (id, token) => {
  const res = await fetch(`${API_URL}/products/${id}`, {
    method: "DELETE",
    headers: { 
      'Authorization': `Bearer ${token}`,
      'Accept': 'application/json'
    },
  });
  
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({ detail: 'Delete product failed' }));
    throw errorData;
  }
  
  return await res.json();
};

// Note: Your backend's get_all_orders is at GET /orders (with admin_only)
export const getOrders = async (token) => {
  const res = await fetch(`${API_URL}/orders`, {
    headers: { 
      'Authorization': `Bearer ${token}`,
      'Accept': 'application/json'
    },
  });
  
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({ detail: 'Fetch orders failed' }));
    throw errorData;
  }
  
  return await res.json();
};