// routes/AdminRoute.jsx
import { Navigate } from "react-router-dom";

const AdminRoute = ({ children }) => {
  // Check if user is logged in via Google
  const userData = localStorage.getItem("userData");
  
  if (!userData) {
    // User not logged in, redirect to home
    alert("Please login first");
    return <Navigate to="/" replace />;
  }
  
  try {
    const user = JSON.parse(userData);
    
    // Check if user is admin
    const isAdmin = user.role === "admin" || user.isAdmin === true;
    
    if (!isAdmin) {
      alert("Access denied. Admin privileges required.");
      return <Navigate to="/" replace />;
    }
    
    // User is admin, allow access
    return children;
  } catch (error) {
    console.error("Error checking admin access:", error);
    localStorage.removeItem("userData");
    localStorage.removeItem("userToken");
    return <Navigate to="/" replace />;
  }
};

export default AdminRoute;