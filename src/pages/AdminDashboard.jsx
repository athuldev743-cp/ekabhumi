import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  getProducts,
  deleteProduct,
  getOrders,
  createProduct,
  convertGoogleToJWT
} from "../api/adminAPI";
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
    if (!userData) return false;
    
    try {
      const parsedUser = JSON.parse(userData);
      return parsedUser.role === "admin" || parsedUser.isAdmin === true;
    } catch (e) {
      return false;
    }
  };

  const ensureJWTToken = async () => {
    const userToken = localStorage.getItem("userToken");
    const adminToken = localStorage.getItem("adminToken");
    
    if (adminToken) return adminToken;
    
    if (userToken) {
      try {
        const result = await convertGoogleToJWT(userToken);
        if (result.access_token) {
          localStorage.setItem('adminToken', result.access_token);
          return result.access_token;
        }
      } catch (error) {
        console.error("Failed to convert Google token:", error);
      }
    }
    
    return null;
  };

  const fetchProducts = useCallback(async () => {
    try {
      const data = await getProducts();
      setProducts(data);
    } catch (err) {
      setError("Failed to fetch products: " + (err.detail || err.message || err.toString()));
    }
  }, []);

  const fetchOrders = useCallback(async () => {
    try {
      const data = await getOrders();
      setOrders(data);
    } catch (err) {
      setError("Failed to fetch orders: " + (err.detail || err.message || err.toString()));
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
        await ensureJWTToken();
        await Promise.all([fetchProducts(), fetchOrders()]);
      } catch (err) {
        setError("Failed to load dashboard data: " + (err.message || err.toString()));
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [fetchProducts, fetchOrders, navigate]);

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this product?")) {
      try {
        await deleteProduct(id);
        fetchProducts();
      } catch (err) {
        setError("Failed to delete product: " + (err.detail || err.message || err.toString()));
      }
    }
  };

  const handleAddProduct = async (e) => {
    e.preventDefault();
    
    try {
      const formData = new FormData();
      formData.append("name", newProduct.name || "");
      formData.append("price", newProduct.price.toString());
      formData.append("description", newProduct.description || "");
      formData.append("priority", newProduct.priority || "1");
      // Email is added automatically in adminAPI.js
      
      if (newProduct.image) {
        formData.append("image", newProduct.image);
      } else {
        setError("Please select an image file");
        return;
      }
      
      await createProduct(formData);
      
      setShowAddForm(false);
      setNewProduct({
        name: "",
        price: "",
        description: "",
        priority: "1",
        image: null
      });
      fetchProducts();
    } catch (err) {
      console.error("Add product error:", err);
      setError("Failed to add product: " + (err.detail || err.message || "Unknown error"));
    }
  };

  const handleFileChange = (e) => {
    setNewProduct({...newProduct, image: e.target.files[0]});
  };

  const handleInputChange = (e) => {
    setNewProduct({...newProduct, [e.target.name]: e.target.value});
  };

  const logout = () => {
    localStorage.clear();
    navigate("/");
  };

  if (loading) {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.loadingSpinner}></div>
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
            <form onSubmit={handleAddProduct} style={{marginTop: '20px', padding: '20px', background: '#f7fafc', borderRadius: '10px'}}>
              <input
                type="text"
                name="name"
                placeholder="Product Name"
                value={newProduct.name}
                onChange={handleInputChange}
                required
                style={{width: '100%', padding: '10px', marginBottom: '10px', borderRadius: '5px', border: '1px solid #ccc'}}
              />
              <input
                type="number"
                name="price"
                placeholder="Price"
                value={newProduct.price}
                onChange={handleInputChange}
                required
                style={{width: '100%', padding: '10px', marginBottom: '10px', borderRadius: '5px', border: '1px solid #ccc'}}
              />
              <textarea
                name="description"
                placeholder="Description"
                value={newProduct.description}
                onChange={handleInputChange}
                required
                style={{width: '100%', padding: '10px', marginBottom: '10px', borderRadius: '5px', border: '1px solid #ccc', minHeight: '80px'}}
              />
              <input
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                required
                style={{width: '100%', padding: '10px', marginBottom: '10px'}}
              />
              <button type="submit" style={{background: '#48bb78', color: 'white', padding: '10px 20px', border: 'none', borderRadius: '5px', cursor: 'pointer'}}>
                Add Product
              </button>
            </form>
          )}

          {products.length === 0 ? (
            <div className={styles.emptyState}>
              <div className={styles.emptyStateIcon}>📦</div>
              <p>No products found. Add your first product!</p>
            </div>
          ) : (
            <ul className={styles.productsList}>
              {products.map((p) => (
                <li key={p.id} className={styles.productItem}>
                  <div className={styles.productInfo}>
                    <h3>{p.name}</h3>
                    <p className={styles.productPrice}>₹{p.price}</p>
                    <p>{p.description}</p>
                  </div>
                  <button 
                    className={styles.deleteBtn}
                    onClick={() => handleDelete(p.id)}
                  >
                    🗑️ Delete
                  </button>
                </li>
              ))}
            </ul>
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
              <p>No orders yet. Orders will appear here.</p>
            </div>
          ) : (
            <ul className={styles.ordersList}>
              {orders.map((o) => (
                <li key={o.id} className={styles.orderItem}>
                  <div className={styles.orderHeader}>
                    <p className={styles.orderEmail}>📧 {o.customer_email}</p>
                    <span className={`${styles.statusBadge} ${o.status === 'completed' ? styles.statusCompleted : styles.statusPending}`}>
                      {o.status}
                    </span>
                  </div>
                  <p className={styles.orderTotal}>₹{o.total}</p>
                  {o.created_at && (
                    <p className={styles.orderDate}>
                      📅 {new Date(o.created_at).toLocaleDateString()}
                    </p>
                  )}
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}

export default AdminDashboard;