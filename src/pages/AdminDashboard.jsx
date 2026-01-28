import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  getProducts,
  deleteProduct,
  getOrders,
  createProduct
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
    email: "",
    image: null
  });
  const token = localStorage.getItem("adminToken");
  const navigate = useNavigate();

  const fetchProducts = useCallback(async () => {
    try {
      const data = await getProducts(token);
      setProducts(data);
    } catch (err) {
      setError("Failed to fetch products: " + (err.detail || err.message));
    }
  }, [token]);

  const fetchOrders = useCallback(async () => {
    try {
      const data = await getOrders(token);
      setOrders(data);
    } catch (err) {
      setError("Failed to fetch orders: " + (err.detail || err.message));
    }
  }, [token]);

  useEffect(() => {
    if (!token) {
      navigate("/admin/login");
      return;
    }

    const fetchData = async () => {
      setLoading(true);
      setError("");
      try {
        await Promise.all([fetchProducts(), fetchOrders()]);
      } catch (err) {
        setError("Failed to load dashboard data");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [fetchProducts, fetchOrders, token, navigate]);

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this product?")) {
      try {
        await deleteProduct(id, token);
        fetchProducts();
      } catch (err) {
        setError("Failed to delete product");
      }
    }
  };

  const handleAddProduct = async (e) => {
    e.preventDefault();
    try {
      const formData = new FormData();
      Object.keys(newProduct).forEach(key => {
        if (newProduct[key]) formData.append(key, newProduct[key]);
      });
      
      await createProduct(formData, token);
      setShowAddForm(false);
      setNewProduct({
        name: "",
        price: "",
        description: "",
        priority: "1",
        email: "",
        image: null
      });
      fetchProducts();
    } catch (err) {
      setError("Failed to add product: " + (err.detail || err.message));
    }
  };

  const handleFileChange = (e) => {
    setNewProduct({...newProduct, image: e.target.files[0]});
  };

  const handleInputChange = (e) => {
    setNewProduct({...newProduct, [e.target.name]: e.target.value});
  };

  const logout = () => {
    localStorage.removeItem("adminToken");
    navigate("/admin/login");
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
        {/* Products Section */}
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
                    {p.email && <small>Contact: {p.email}</small>}
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

        {/* Orders Section */}
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
                  <div style={{marginTop: '10px'}}>
                    <button style={{background: '#4299e1', color: 'white', padding: '5px 15px', border: 'none', borderRadius: '5px', marginRight: '10px', cursor: 'pointer'}}>
                      View Details
                    </button>
                    {o.status === 'pending' && (
                      <button style={{background: '#48bb78', color: 'white', padding: '5px 15px', border: 'none', borderRadius: '5px', cursor: 'pointer'}}>
                        Mark Complete
                      </button>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      {/* Stats Footer */}
      <div className={styles.card}>
        <div style={{display: 'flex', justifyContent: 'space-around', textAlign: 'center'}}>
          <div>
            <h3 style={{color: '#667eea', fontSize: '24px', margin: '0'}}>{products.length}</h3>
            <p style={{color: '#718096', margin: '5px 0 0 0'}}>Total Products</p>
          </div>
          <div>
            <h3 style={{color: '#48bb78', fontSize: '24px', margin: '0'}}>{orders.length}</h3>
            <p style={{color: '#718096', margin: '5px 0 0 0'}}>Total Orders</p>
          </div>
          <div>
            <h3 style={{color: '#ed8936', fontSize: '24px', margin: '0'}}>
              {orders.filter(o => o.status === 'pending').length}
            </h3>
            <p style={{color: '#718096', margin: '5px 0 0 0'}}>Pending Orders</p>
          </div>
          <div>
            <h3 style={{color: '#f56565', fontSize: '24px', margin: '0'}}>
              ₹{orders.reduce((sum, o) => sum + (o.total || 0), 0)}
            </h3>
            <p style={{color: '#718096', margin: '5px 0 0 0'}}>Total Revenue</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AdminDashboard;