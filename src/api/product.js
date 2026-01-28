// src/api/product.js - REMOVE or UPDATE to match adminAPI.js
// This file seems redundant since adminAPI.js already has createProduct
// Either remove it or update it to use the same API_URL

const API_URL = process.env.REACT_APP_API_URL || "https://ekb-backend.onrender.com";

export async function createProduct(productData, token) {
  const formData = new FormData();
  Object.keys(productData).forEach(key => {
    formData.append(key, productData[key]);
  });

  const response = await fetch(`${API_URL}/admin/products`, {
    method: "POST",
    headers: {
      'Authorization': `Bearer ${token}`,
    },
    body: formData
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ detail: 'Server error' }));
    throw new Error(error.detail || `Server error: ${response.status}`);
  }

  return await response.json();
}

// If you need public product functions
export async function getPublicProducts() {
  const response = await fetch(`${API_URL}/products`);
  
  if (!response.ok) {
    throw new Error(`Server error: ${response.status}`);
  }
  
  return await response.json();
}