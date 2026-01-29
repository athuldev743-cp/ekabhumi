// src/api/publicAPI.js
const API_BASE =
  process.env.REACT_APP_API_URL || "https://ekb-backend.onrender.com";

const getUrl = (endpoint) => API_BASE + endpoint;

export async function fetchProducts() {
  const res = await fetch(getUrl("/products"), {
    headers: {
      Accept: "application/json",
      "Cache-Control": "no-cache",
    },
    mode: "cors",
    credentials: "omit",
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`fetchProducts failed: ${res.status} ${text}`);
  }

  const data = await res.json();

  return (Array.isArray(data) ? data : []).map((p) => {
    let imageUrl = p.image_url;
    if (!imageUrl) return p;

    imageUrl = imageUrl.replace(/\\/g, "/");
    if (imageUrl.startsWith("http")) return { ...p, image_url: imageUrl };

    if (!imageUrl.startsWith("/")) imageUrl = "/" + imageUrl;
    if (imageUrl.includes("res.cloudinary.com"))
      return { ...p, image_url: `https:${imageUrl}` };

    return { ...p, image_url: `${API_BASE}${imageUrl}` };
  });
}

export async function fetchProductById(id) {
  const url = getUrl(`/products/${id}`);

  const res = await fetch(url, {
    headers: { Accept: "application/json" },
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`Failed to fetch product: ${res.status} ${text}`);
  }

  return await res.json();
}


export async function createOrder(orderData) {
  const url = getUrl("/orders");

  const res = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify(orderData),
  });

  if (!res.ok) {
    const errorText = await res.text().catch(() => "");
    throw new Error(errorText || `Failed to create order (${res.status})`);
  }

  return await res.json();
}

