// src/components/ProtectedRoute.jsx
import { Navigate } from "react-router-dom";

const ProtectedRoute = ({ children, requireAdmin = false }) => {
  // Check for tokens
  const userToken = localStorage.getItem("userToken");
  const adminToken = localStorage.getItem("adminToken");
  const userData = localStorage.getItem("userData");
  
  // No tokens at all
  if (!userToken && !adminToken) {
    console.log("No tokens found, redirecting to home");
    return <Navigate to="/" replace />;
  }
  
  // Try to parse user data
  try {
    let user = null;
    if (userData) {
      user = JSON.parse(userData);
    }
    
    // If admin access required
    if (requireAdmin) {
      // Check if user has admin role or admin token exists
      const isAdmin = (user && (user.role === "admin" || user.isAdmin === true)) || adminToken;
      
      if (!isAdmin) {
        console.log("Admin access required but user is not admin");
        return <Navigate to="/" replace />;
      }
    }
    
    // All checks passed
    return children;
    
  } catch (error) {
    console.error("Error parsing user data:", error);
    // Clear invalid data
    localStorage.removeItem("userToken");
    localStorage.removeItem("userData");
    localStorage.removeItem("adminToken");
    return <Navigate to="/" replace />;
  }
};

export default ProtectedRoute;