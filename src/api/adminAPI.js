// src/api/adminAPI.js - UPDATED FOR VERCEL DEPLOYMENT
const API_URL = process.env.REACT_APP_API_URL || "https://ekb-backend.onrender.com";

// Function to get the correct token
const getAuthToken = () => {
  // Try adminToken first (JWT from backend)
  const adminToken = localStorage.getItem('adminToken');
  if (adminToken) return adminToken;
  
  // Fallback to userToken (Google token)
  const userToken = localStorage.getItem('userToken');
  return userToken || 'test-token'; // Add fallback for development
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

// Helper function to handle API responses
const handleResponse = async (response) => {
  if (!response.ok) {
    let errorDetail;
    try {
      const errorData = await response.json();
      errorDetail = errorData.detail || errorData.message || `HTTP error! status: ${response.status}`;
    } catch {
      errorDetail = `HTTP error! status: ${response.status}`;
    }
    throw new Error(errorDetail);
  }
  return response.json();
};

export const getProducts = async () => {
  const token = getAuthToken();
  
  // For development, allow without admin check
  // In production, you should enforce this
  if (process.env.NODE_ENV === 'production') {
    const userData = getUserData();
    if (!userData || userData.role !== "admin") {
      throw new Error("Admin access required");
    }
  }

  const response = await fetch(`${API_URL}/admin/admin-products`, {
    headers: { 
      Authorization: `Bearer ${token}`,
    },
  });
  
  return handleResponse(response);
};

export const createProduct = async (formData) => {
  const token = getAuthToken();
  
  // IMPORTANT: Your backend no longer requires email field
  // Remove this line if your backend doesn't need email
  // formData.append('email', 'admin@ekabhumi.com');
  
  const response = await fetch(`${API_URL}/admin/create-product`, {
    method: "POST",
    headers: { 
      Authorization: `Bearer ${token}`,
      // Don't set Content-Type for FormData, browser will set it with boundary
    },
    body: formData,
  });
  
  return handleResponse(response);
};

export const deleteProduct = async (id) => {
  const token = getAuthToken();
  
  const response = await fetch(`${API_URL}/admin/delete-product/${id}`, {
    method: "DELETE",
    headers: { 
      Authorization: `Bearer ${token}`,
    },
  });
  
  return handleResponse(response);
};

export const getOrders = async () => {
  const token = getAuthToken();
  
  const response = await fetch(`${API_URL}/admin/orders`, {
    headers: { 
      Authorization: `Bearer ${token}`,
    },
  });
  
  return handleResponse(response);
};

// Function to convert Google token to JWT
export const convertGoogleToJWT = async (googleToken) => {
  const response = await fetch(`${API_URL}/auth/google`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ token: googleToken }),
  });

  const data = await handleResponse(response);

  if (data.access_token) {
    localStorage.setItem("adminToken", data.access_token);
  }

  return data;
};


// Add this helper function for your AdminDashboard
export const ensureAdminToken = async () => {
  const adminToken = localStorage.getItem("adminToken");
  if (adminToken) return adminToken;

  const userToken = localStorage.getItem("userToken");
  if (userToken) {
    const result = await convertGoogleToJWT(userToken);
    return result.access_token;
  }

  if (process.env.NODE_ENV !== "production") return "test-token";
  throw new Error("No valid token. Please login again.");
};

export const approveOrder = async (orderId) => {
  const token = getAuthToken();
  const response = await fetch(`${API_URL}/admin/orders/${orderId}/approve`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
  });
  return handleResponse(response);
};
