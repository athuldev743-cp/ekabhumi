const API_URL = process.env.REACT_APP_API_URL || "https://ekb-backend.onrender.com";

// Function to get the correct token
const getAuthToken = () => {
  // Try to get Google token from userToken
  const userToken = localStorage.getItem('userToken');
  if (userToken) return userToken;
  
  // Fallback to adminToken if exists
  const adminToken = localStorage.getItem('adminToken');
  return adminToken;
};

// Function to get user data and check if admin
const getUserData = () => {
  const userData = localStorage.getItem('userData');
  if (!userData) return null;
  
  try {
    return JSON.parse(userData);
  } catch {
    return null;
  }
};

export const adminLogin = async (email, password) => {
  const form = new FormData();
  form.append("email", email);
  form.append("password", password);

  const res = await fetch(`${API_URL}/admin/login`, {
    method: "POST",
    body: form,
    headers: { Accept: "application/json" },
  });

  if (!res.ok) throw await res.json().catch(() => ({ detail: "Login failed" }));
  return res.json();
};

export const getProducts = async () => {
  const token = getAuthToken();
  if (!token) throw new Error("No authentication token found");
  
  // Check if user is admin before making request
  const userData = getUserData();
  if (!userData || userData.role !== "admin") {
    throw new Error("Admin access required");
  }

  const res = await fetch(`${API_URL}/admin/products`, {
    headers: { 
      Authorization: `Bearer ${token}`, 
      Accept: "application/json" 
    },
  });
  
  if (!res.ok) {
    const error = await res.json().catch(() => ({ detail: "Fetch products failed" }));
    throw error;
  }
  return res.json();
};

export const createProduct = async (formData) => {
  const token = getAuthToken();
  if (!token) throw new Error("No authentication token found");
  
  const userData = getUserData();
  if (!userData || userData.role !== "admin") {
    throw new Error("Admin access required");
  }

  const res = await fetch(`${API_URL}/admin/products`, {
    method: "POST",
    headers: { 
      Authorization: `Bearer ${token}`,
      // Don't set Content-Type for FormData - browser sets automatically
    },
    body: formData,
  });
  
  if (!res.ok) {
    // Get detailed error message
    const errorText = await res.text();
    console.error("Backend error response:", errorText);
    
    let errorDetail;
    try {
      errorDetail = JSON.parse(errorText);
    } catch {
      errorDetail = { detail: errorText || "Create product failed" };
    }
    
    throw errorDetail;
  }
  return res.json();
};

export const updateProduct = async (id, formData) => {
  const token = getAuthToken();
  if (!token) throw new Error("No authentication token found");
  
  const userData = getUserData();
  if (!userData || userData.role !== "admin") {
    throw new Error("Admin access required");
  }

  const res = await fetch(`${API_URL}/admin/products/${id}`, {
    method: "PUT",
    headers: { 
      Authorization: `Bearer ${token}` 
    },
    body: formData,
  });
  
  if (!res.ok) {
    const error = await res.json().catch(() => ({ detail: "Update failed" }));
    throw error;
  }
  return res.json();
};

export const deleteProduct = async (id) => {
  const token = getAuthToken();
  if (!token) throw new Error("No authentication token found");
  
  const userData = getUserData();
  if (!userData || userData.role !== "admin") {
    throw new Error("Admin access required");
  }

  const res = await fetch(`${API_URL}/admin/products/${id}`, {
    method: "DELETE",
    headers: { 
      Authorization: `Bearer ${token}`, 
      Accept: "application/json" 
    },
  });
  
  if (!res.ok) {
    const error = await res.json().catch(() => ({ detail: "Delete failed" }));
    throw error;
  }
  return res.json();
};

export const getOrders = async () => {
  const token = getAuthToken();
  if (!token) throw new Error("No authentication token found");
  
  const userData = getUserData();
  if (!userData || userData.role !== "admin") {
    throw new Error("Admin access required");
  }

  const res = await fetch(`${API_URL}/admin/orders`, {
    headers: { 
      Authorization: `Bearer ${token}`, 
      Accept: "application/json" 
    },
  });
  
  if (!res.ok) {
    const error = await res.json().catch(() => ({ detail: "Fetch orders failed" }));
    throw error;
  }
  return res.json();
};

// NEW: Function to convert Google token to JWT via your auth endpoint
export const convertGoogleToJWT = async (googleToken) => {
  try {
    const res = await fetch(`${API_URL}/auth/google`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({ token: googleToken }),
    });
    
    if (!res.ok) {
      throw new Error("Failed to convert Google token");
    }
    
    const data = await res.json();
    
    // Store the JWT token
    if (data.access_token) {
      localStorage.setItem('adminToken', data.access_token);
    }
    
    return data;
  } catch (error) {
    console.error("Google token conversion failed:", error);
    throw error;
  }
};