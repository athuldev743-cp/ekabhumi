import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import styles from "./Dashboard.module.css";

function AdminDashboard() {
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showAddForm, setShowAddForm] = useState(false);
  const [newProduct, setNewProduct] = useState({
    name: "",
    price: "",
    description: "",
    priority: "1",
    image: null
  });
  
  const navigate = useNavigate();

  // Check if user is admin
  const isUserAdmin = () => {
    const userData = localStorage.getItem("userData");
    if (!userData) {
      return false;
    }
    
    try {
      const parsedUser = JSON.parse(userData);
      const isAdmin = parsedUser.role === "admin" || parsedUser.isAdmin === true;
      return isAdmin;
    } catch (e) {
      console.error("Error parsing user data:", e);
      return false;
    }
  };

const ensureJWTToken = async () => {
  const userToken = localStorage.getItem("userToken");
  const adminToken = localStorage.getItem("adminToken");
  
  if (adminToken) {
    return adminToken;
  }
  
  // If we have a userToken, we could convert it, but for now return test-token
  if (userToken) {
    // In the future, you might want to convert the Google token to JWT here
    // For now, just return test-token
    return "test-token";
  }
  
  // No tokens found, return test-token for development
  return "test-token";
};

  const fetchProducts = useCallback(async () => {
    try {
      const token = await ensureJWTToken();
      const API_BASE = process.env.REACT_APP_API_URL|| 'https://ekb-backend.onrender.com';
      const response = await fetch(`${API_BASE}/admin/admin-products`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      setProducts(data || []);
    } catch (err) {
      console.error("Failed to fetch products:", err);
      setError("Failed to fetch products: " + (err.detail || err.message || "Network error"));
      setProducts([]);
    }
  }, []);

  const fetchOrders = useCallback(async () => {
    try {
      const token = await ensureJWTToken();
      const API_BASE = process.env.REACT_APP_API_URL || 'https://ekb-backend.onrender.com';
      const response = await fetch(`${API_BASE}/admin/orders`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      setOrders(data || []);
    } catch (err) {
      console.error("Failed to fetch orders:", err);
      setOrders([]);
    }
  }, []);

  useEffect(() => {
    if (!isUserAdmin()) {
      alert("Access denied. Admin privileges required.");
      navigate("/");
      return;
    }

    const fetchData = async () => {
      setLoading(true);
      setError("");
      try {
        await Promise.all([fetchProducts(), fetchOrders()]);
      } catch (err) {
        console.error("Failed to load dashboard data:", err);
        setError("Failed to load dashboard data. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [fetchProducts, fetchOrders, navigate]);

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this product?")) {
      try {
        const token = await ensureJWTToken();
        const API_BASE = process.env.REACT_APP_API_URL || 'https://ekb-backend.onrender.com';
        const response = await fetch(`${API_BASE}/admin/delete-product/${id}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        await fetchProducts();
        alert("Product deleted successfully!");
      } catch (err) {
        console.error("Delete error:", err);
        setError("Failed to delete product: " + (err.detail || err.message));
      }
    }
  };

  const handleAddProduct = async (e) => {
    e.preventDefault();
    
    if (!newProduct.image) {
      setError("Please select an image file");
      return;
    }
    
    if (!newProduct.name || !newProduct.price || !newProduct.description) {
      setError("Please fill all required fields");
      return;
    }
    
    try {
      const token = await ensureJWTToken();
      const API_BASE = process.env.REACT_APP_API_URL || 'https://ekb-backend.onrender.com';
      const formData = new FormData();
      formData.append("name", newProduct.name);
      formData.append("price", newProduct.price.toString());
      formData.append("description", newProduct.description);
      formData.append("priority", newProduct.priority || "1");
      formData.append("image", newProduct.image);
      
      const response = await fetch(`${API_BASE}/admin/create-product`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || `HTTP error! status: ${response.status}`);
      }
      
      await response.json();
      
      setShowAddForm(false);
      setNewProduct({
        name: "",
        price: "",
        description: "",
        priority: "1",
        image: null
      });
      
      await fetchProducts();
      setError("");
      alert("Product added successfully!");
      
    } catch (err) {
      console.error("Add product error:", err);
      setError("Failed to add product: " + (err.message || "Unknown error"));
    }
  };

  // REMOVED: const handleFileChange = (e) => { ... }
  // REMOVED: const handleInputChange = (e) => { ... }

  const logout = () => {
    localStorage.clear();
    navigate("/");
  };

  // Safe image error handler
  const handleImageError = (e) => {
    const imgElement = e.currentTarget;
    if (imgElement) {
      imgElement.onerror = null;
      imgElement.src = 'https://placehold.co/200x150/EEE/31343C?text=No+Image';
    }
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
        <button className={styles.logoutBtn} onClick={logout}>
          <span>🚪</span> Logout
        </button>
      </div>

      {error && (
        <div className={styles.errorAlert}>
          ⚠️ {error}
          <button onClick={() => setError("")} className={styles.dismissBtn}>×</button>
        </div>
      )}

      <div className={styles.mainContent}>
        <div className={styles.card}>
          <div className={styles.cardHeader}>
            <h2>🛍️ Products</h2>
            <div className={styles.badge}>{products.length} items</div>
          </div>
          
          <button 
            className={styles.addProductBtn}
            onClick={() => setShowAddForm(!showAddForm)}
          >
            <span>➕</span> Add New Product
          </button>

          {showAddForm && (
            <div className={styles.addFormContainer}>
              <h3>Add New Product</h3>
              <form onSubmit={handleAddProduct}>
                <div className={styles.formGroup}>
                  <label>Product Name *</label>
                  <input
                    type="text"
                    name="name"
                    placeholder="Enter product name"
                    value={newProduct.name}
                    onChange={(e) => setNewProduct({...newProduct, name: e.target.value})}
                    required
                  />
                </div>
                
                <div className={styles.formGroup}>
                  <label>Price (₹) *</label>
                  <input
                    type="number"
                    name="price"
                    placeholder="Enter price"
                    value={newProduct.price}
                    onChange={(e) => setNewProduct({...newProduct, price: e.target.value})}
                    required
                    min="1"
                    step="0.01"
                  />
                </div>
                
                <div className={styles.formGroup}>
                  <label>Description *</label>
                  <textarea
                    name="description"
                    placeholder="Enter product description"
                    value={newProduct.description}
                    onChange={(e) => setNewProduct({...newProduct, description: e.target.value})}
                    required
                    rows={3}
                  />
                </div>
                
                <div className={styles.formGroup}>
                  <label>Priority (1 = highest) *</label>
                  <input
                    type="number"
                    name="priority"
                    placeholder="Enter priority"
                    value={newProduct.priority}
                    onChange={(e) => setNewProduct({...newProduct, priority: e.target.value})}
                    required
                    min="1"
                  />
                </div>
                
                <div className={styles.formGroup}>
                  <label>Product Image *</label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      if (e.target.files && e.target.files[0]) {
                        setNewProduct({...newProduct, image: e.target.files[0]});
                      }
                    }}
                    required
                  />
                  <small>Select a product image (JPEG, PNG, etc.)</small>
                  {newProduct.image && (
                    <div className={styles.filePreview}>
                      Selected: {newProduct.image.name}
                    </div>
                  )}
                </div>
                
                <div className={styles.formButtons}>
                  <button type="submit" className={styles.submitBtn}>
                    Add Product
                  </button>
                  <button 
                    type="button" 
                    className={styles.cancelBtn}
                    onClick={() => {
                      setShowAddForm(false);
                      setError("");
                    }}
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          )}

          {products.length === 0 ? (
            <div className={styles.emptyState}>
              <div className={styles.emptyStateIcon}>📦</div>
              <h3>No Products Found</h3>
              <p>Add your first product using the "Add New Product" button above.</p>
            </div>
          ) : (
            <div className={styles.productsGrid}>
              {products.map((p) => (
                <div key={p.id} className={styles.productCard}>
                  <div className={styles.productImage}>
                    {p.image_url ? (
                      <img 
                        src={p.image_url.startsWith('http') ? p.image_url : `${process.env.REACT_APP_API_URL || 'https://ekb-backend.onrender.com'}${p.image_url}`} 
                        alt={p.name} 
                        onError={handleImageError}
                        style={{ width: '100%', height: '200px', objectFit: 'cover' }}
                      />
                    ) : (
                      <div className={styles.noImage}>
                        <div style={{ fontSize: '48px' }}>📷</div>
                        <div>No Image</div>
                      </div>
                    )}
                  </div>
                  <div className={styles.productContent}>
                    <h3>{p.name}</h3>
                    <p className={styles.productPrice}>₹{parseFloat(p.price).toFixed(2)}</p>
                    <p className={styles.productDescription}>{p.description}</p>
                    <div className={styles.productMeta}>
                      <span className={styles.priority}>Priority: {p.priority}</span>
                      <span className={styles.id}>ID: {p.id}</span>
                    </div>
                    <button 
                      className={styles.deleteBtn}
                      onClick={() => handleDelete(p.id)}
                    >
                      🗑️ Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className={styles.card}>
          <div className={styles.cardHeader}>
            <h2>📋 Orders</h2>
            <div className={styles.badge}>{orders.length} orders</div>
          </div>

          {orders.length === 0 ? (
            <div className={styles.emptyState}>
              <div className={styles.emptyStateIcon}>📝</div>
              <h3>No Orders Yet</h3>
              <p>Orders will appear here when customers place orders.</p>
            </div>
          ) : (
            <div className={styles.ordersList}>
              {orders.map((o) => (
                <div key={o.id} className={styles.orderCard}>
                  <div className={styles.orderHeader}>
                    <h3>Order #{o.id}</h3>
                    <span className={`${styles.statusBadge} ${o.status === 'completed' ? styles.statusCompleted : styles.statusPending}`}>
                      {o.status}
                    </span>
                  </div>
                  <div className={styles.orderDetails}>
                    {o.user_email && <p><strong>Customer:</strong> {o.user_email}</p>}
                    <p><strong>Total:</strong> ₹{parseFloat(o.total_amount || 0).toFixed(2)}</p>
                    {o.created_at && (
                      <p><strong>Date:</strong> {new Date(o.created_at).toLocaleDateString()}</p>
                    )}
                  </div>
                  <div className={styles.orderActions}>
                    <button className={styles.viewBtn}>View Details</button>
                    {o.status === 'pending' && (
                      <button className={styles.completeBtn}>Mark Complete</button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className={styles.statsFooter}>
        <div className={styles.statItem}>
          <div className={styles.statValue}>{products.length}</div>
          <div className={styles.statLabel}>Total Products</div>
        </div>
        <div className={styles.statItem}>
          <div className={styles.statValue}>{orders.length}</div>
          <div className={styles.statLabel}>Total Orders</div>
        </div>
        <div className={styles.statItem}>
          <div className={styles.statValue}>
            {orders.filter(o => o.status === 'pending').length}
          </div>
          <div className={styles.statLabel}>Pending Orders</div>
        </div>
        <div className={styles.statItem}>
          <div className={styles.statValue}>
            ₹{orders.reduce((sum, o) => sum + (parseFloat(o.total_amount) || 0), 0).toFixed(2)}
          </div>
          <div className={styles.statLabel}>Total Revenue</div>
        </div>
      </div>
    </div>
  );
}

export default AdminDashboard;