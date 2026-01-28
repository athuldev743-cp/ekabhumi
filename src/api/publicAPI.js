const API_BASE =
  process.env.REACT_APP_API_URL || "http://localhost:5000/api";

/**
 * Get all products (Home page)
 */
export async function fetchProducts() {
  const res = await fetch(`${API_BASE}/products`);
  if (!res.ok) throw new Error("Failed to fetch products");
  return res.json();
}

/**
 * Get single product by ID (Product details)
 */
export async function fetchProductById(id) {
  const res = await fetch(`${API_BASE}/products/${id}`);
  if (!res.ok) throw new Error("Failed to fetch product");
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
    },
    body: JSON.stringify(orderData),
  });

  if (!res.ok) throw new Error("Failed to create order");
  return res.json();
}
