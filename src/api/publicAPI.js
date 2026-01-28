// src/api/publicAPI.js - UPDATED VERSION
const API_BASE = process.env.REACT_APP_API_URL || "https://ekb-backend.onrender.com";

/**
 * Get all products (Home page)
 */
export async function fetchProducts() {
  const res = await fetch(`${API_BASE}/products`, {
    headers: {
      'Accept': 'application/json',
      'Cache-Control': 'no-cache' // Optional: for fresh data
    }
  });
  
  if (!res.ok) {
    const error = await res.json().catch(() => ({ detail: 'Failed to fetch products' }));
    throw new Error(error.detail || 'Failed to fetch products');
  }
  
  return res.json();
}

/**
 * Get single product by ID (Product details)
 */
export async function fetchProductById(id) {
  const res = await fetch(`${API_BASE}/products/${id}`, {
    headers: {
      'Accept': 'application/json'
    }
  });
  
  if (!res.ok) {
    if (res.status === 404) {
      throw new Error('Product not found');
    }
    const error = await res.json().catch(() => ({ detail: 'Failed to fetch product' }));
    throw new Error(error.detail || 'Failed to fetch product');
  }
  
  return res.json();
}

/**
 * Create order (Checkout page)
 */
export async function createOrder(orderData) {
  const res = await fetch(`${API_BASE}/orders`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Accept": "application/json"
    },
    body: JSON.stringify(orderData),
  });

  if (!res.ok) {
    const error = await res.json().catch(() => ({ detail: 'Failed to create order' }));
    throw new Error(error.detail || 'Failed to create order');
  }
  
  return res.json();
}

/**
 * Get order by ID (Order confirmation page)
 */
export async function fetchOrderById(id) {
  const res = await fetch(`${API_BASE}/orders/${id}`, {
    headers: {
      'Accept': 'application/json'
    }
  });
  
  if (!res.ok) {
    if (res.status === 404) {
      throw new Error('Order not found');
    }
    const error = await res.json().catch(() => ({ detail: 'Failed to fetch order' }));
    throw new Error(error.detail || 'Failed to fetch order');
  }
  
  return res.json();
}

/**
 * Get products by category (optional - if you have categories)
 */
export async function fetchProductsByCategory(category) {
  const res = await fetch(`${API_BASE}/products?category=${encodeURIComponent(category)}`, {
    headers: {
      'Accept': 'application/json'
    }
  });
  
  if (!res.ok) {
    const error = await res.json().catch(() => ({ detail: 'Failed to fetch products by category' }));
    throw new Error(error.detail || 'Failed to fetch products by category');
  }
  
  return res.json();
}

/**
 * Search products (optional - if you have search functionality)
 */
export async function searchProducts(query) {
  const res = await fetch(`${API_BASE}/products/search?q=${encodeURIComponent(query)}`, {
    headers: {
      'Accept': 'application/json'
    }
  });
  
  if (!res.ok) {
    const error = await res.json().catch(() => ({ detail: 'Failed to search products' }));
    throw new Error(error.detail || 'Failed to search products');
  }
  
  return res.json();
}

/**
 * Contact form submission (optional)
 */
export async function submitContactForm(contactData) {
  const res = await fetch(`${API_BASE}/contact`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Accept": "application/json"
    },
    body: JSON.stringify(contactData),
  });

  if (!res.ok) {
    const error = await res.json().catch(() => ({ detail: 'Failed to submit contact form' }));
    throw new Error(error.detail || 'Failed to submit contact form');
  }
  
  return res.json();
}