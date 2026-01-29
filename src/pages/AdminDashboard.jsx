import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import styles from "./Dashboard.module.css";

function AdminDashboard() {
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showAddForm, setShowAddForm] = useState(false);
  const [newOrdersCount, setNewOrdersCount] = useState(0);
  const [lastOrderCount, setLastOrderCount] = useState(0);
  
  const navigate = useNavigate();

  // Check if user is admin
  const isUserAdmin = () => {
    const userData = localStorage.getItem("userData");
    if (!userData) return false;
    
    try {
      const parsedUser = JSON.parse(userData);
      return parsedUser.role === "admin" || parsedUser.isAdmin === true;
    } catch (e) {
      return false;
    }
  };

  const ensureJWTToken = async () => {
    const adminToken = localStorage.getItem("adminToken");
    const userToken = localStorage.getItem("userToken");
    
    if (adminToken) return adminToken;
    if (userToken) return "test-token"; // For development
    return "test-token";
  };

  const fetchProducts = useCallback(async () => {
    try {
      const token = await ensureJWTToken();
      const API_BASE = process.env.REACT_APP_API_URL || 'https://ekb-backend.onrender.com';
      const response = await fetch(`${API_BASE}/admin/admin-products`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (response.ok) {
        const data = await response.json();
        setProducts(data || []);
      }
    } catch (err) {
      console.error("Failed to fetch products:", err);
      setProducts([]);
    }
  }, []);

  const fetchOrders = useCallback(async () => {
    try {
      const token = await ensureJWTToken();
      const API_BASE = process.env.REACT_APP_API_URL || 'https://ekb-backend.onrender.com';
      const response = await fetch(`${API_BASE}/orders`, { // Changed from /admin/orders
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (response.ok) {
        const data = await response.json();
        
        // Check for new orders
        if (data.length > lastOrderCount && lastOrderCount > 0) {
          const newCount = data.length - lastOrderCount;
          setNewOrdersCount(newCount);
          
          // Show notification
          if (newCount > 0) {
            const audio = new Audio('/notification.mp3');
            audio.play().catch(console.error);
            
            // Show browser notification (if permission granted)
            if ("Notification" in window && Notification.permission === "granted") {
              new Notification(`New Order Received!`, {
                body: `${newCount} new order(s) pending`,
                icon: '/logo.png'
              });
            }
          }
        }
        
        setLastOrderCount(data.length);
        setOrders(data || []);
      }
    } catch (err) {
      console.error("Failed to fetch orders:", err);
    }
  }, [lastOrderCount]);

  // Request notification permission
  useEffect(() => {
    if ("Notification" in window && Notification.permission === "default") {
      Notification.requestPermission();
    }
  }, []);

  // Poll for new orders
  useEffect(() => {
    if (!isUserAdmin()) return;
    
    const interval = setInterval(() => {
      fetchOrders();
    }, 30000); // Check every 30 seconds
    
    return () => clearInterval(interval);
  }, [fetchOrders]);

  // Initial data load
  useEffect(() => {
    if (!isUserAdmin()) {
      alert("Access denied. Admin privileges required.");
      navigate("/");
      return;
    }

    const loadData = async () => {
      setLoading(true);
      try {
        await Promise.all([fetchProducts(), fetchOrders()]);
      } catch (err) {
        console.error("Failed to load dashboard:", err);
        setError("Failed to load dashboard data.");
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [fetchProducts, fetchOrders, navigate]);

  // Clear new orders notification
  const clearNewOrders = () => {
    setNewOrdersCount(0);
  };

  // Rest of your functions remain the same...
  const handleDelete = async (id) => {
    // ... existing code
  };

  const handleAddProduct = async (e) => {
    // ... existing code
  };

  const logout = () => {
    localStorage.clear();
    navigate("/");
  };

  if (loading) {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.loadingSpinner}></div>
        <p>Loading dashboard...</p>
      </div>
    );
  }

  return (
    <div className={styles.dashboardContainer}>
      <div className={styles.header}>
        <h1>📊 Admin Dashboard</h1>
        <div className={styles.headerActions}>
          {newOrdersCount > 0 && (
            <button 
              className={styles.newOrdersBadge}
              onClick={clearNewOrders}
              title={`${newOrdersCount} new order(s)`}
            >
              🔔 {newOrdersCount} New Order{newOrdersCount > 1 ? 's' : ''}
            </button>
          )}
          <button className={styles.logoutBtn} onClick={logout}>
            🚪 Logout
          </button>
        </div>
      </div>

      {/* ... rest of your JSX ... */}
      
      <div className={styles.card}>
        <div className={styles.cardHeader}>
          <h2>📋 Orders</h2>
          <div className={styles.orderHeaderBadges}>
            <div className={`${styles.badge} ${styles.totalOrders}`}>
              {orders.length} orders
            </div>
            <div className={`${styles.badge} ${styles.pendingOrders}`}>
              {orders.filter(o => o.status === 'pending').length} pending
            </div>
          </div>
        </div>

        {orders.length === 0 ? (
          <div className={styles.emptyState}>
            <div className={styles.emptyStateIcon}>📝</div>
            <h3>No Orders Yet</h3>
            <p>Orders will appear here when customers place orders.</p>
          </div>
        ) : (
          <div className={styles.ordersList}>
            {orders.map((order) => (
              <div key={order.id} className={styles.orderCard}>
                <div className={styles.orderHeader}>
                  <h3>
                    Order #{order.id} 
                    {newOrdersCount > 0 && order.id > orders[0]?.id - newOrdersCount && (
                      <span className={styles.newOrderTag}>NEW</span>
                    )}
                  </h3>
                  <span className={`${styles.statusBadge} ${
                    order.status === 'delivered' ? styles.statusDelivered :
                    order.status === 'shipped' ? styles.statusShipped :
                    order.status === 'confirmed' ? styles.statusConfirmed :
                    styles.statusPending
                  }`}>
                    {order.status}
                  </span>
                </div>
                
                <div className={styles.orderDetails}>
                  <p><strong>Product:</strong> {order.product_name}</p>
                  <p><strong>Customer:</strong> {order.customer_name}</p>
                  <p><strong>Email:</strong> {order.customer_email}</p>
                  <p><strong>Phone:</strong> {order.customer_phone}</p>
                  <p><strong>Qty:</strong> {order.quantity} × ₹{order.unit_price}</p>
                  <p><strong>Total:</strong> ₹{order.total_amount}</p>
                  <p><strong>Date:</strong> {new Date(order.order_date).toLocaleString()}</p>
                  <p><strong>Address:</strong> {order.shipping_address}</p>
                  {order.notes && <p><strong>Notes:</strong> {order.notes}</p>}
                </div>
                
                <div className={styles.orderActions}>
                  <button className={styles.viewBtn}>View Details</button>
                  {order.status === 'pending' && (
                    <button className={styles.confirmBtn}>Confirm Order</button>
                  )}
                  {order.status === 'confirmed' && (
                    <button className={styles.shipBtn}>Mark as Shipped</button>
                  )}
                  {order.status === 'shipped' && (
                    <button className={styles.deliverBtn}>Mark as Delivered</button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default AdminDashboard;