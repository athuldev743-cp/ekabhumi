import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import styles from "./Dashboard.module.css";

import AddProduct from "./AddProduct";
import Orders from "./Orders";

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

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
    image: null,
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
      console.error("Error parsing user data:", e);
      return false;
    }
  };

  const ensureJWTToken = async () => {
    const userToken = localStorage.getItem("userToken");
    const adminToken = localStorage.getItem("adminToken");

    if (adminToken) return adminToken;

    if (userToken) {
      // TODO: convert Google token to JWT later
      return "test-token";
    }

    return "test-token";
  };

  const fetchProducts = useCallback(async () => {
    try {
      const token = await ensureJWTToken();
      const API_BASE =
        process.env.REACT_APP_API_URL || "https://ekb-backend.onrender.com";

      const response = await fetch(`${API_BASE}/admin/admin-products`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      setProducts(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Failed to fetch products:", err);
      setError(
        "Temporary issue loading products: " +
          (err.detail || err.message || "Network error")
      );
    }
  }, []);

  const fetchOrders = useCallback(async () => {
    try {
      const token = await ensureJWTToken();
      const API_BASE =
        process.env.REACT_APP_API_URL || "https://ekb-backend.onrender.com";

      const response = await fetch(`${API_BASE}/admin/orders`, {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
          "Cache-Control": "no-cache",
        },
      });

      if (!response.ok) {
        const text = await response.text().catch(() => "");
        throw new Error(`HTTP error ${response.status}: ${text}`);
      }

      const data = await response.json();
      setOrders(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Failed to fetch orders:", err);
      setError("Temporary issue loading orders: " + (err?.message || "Network error"));
      // don't wipe existing orders
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
      } catch (e) {
        await sleep(800); // cold start retry
        try {
          await Promise.all([fetchProducts(), fetchOrders()]);
        } catch (err2) {
          console.error("Failed after retry:", err2);
          setError(err2?.message || "Failed to load dashboard data.");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [fetchProducts, fetchOrders, navigate]);

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this product?")) return;

    try {
      const token = await ensureJWTToken();
      const API_BASE =
        process.env.REACT_APP_API_URL || "https://ekb-backend.onrender.com";

      const response = await fetch(`${API_BASE}/admin/delete-product/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

      await fetchProducts();
      localStorage.setItem("productsUpdated", Date.now().toString());
      alert("Product deleted successfully!");
    } catch (err) {
      console.error("Delete error:", err);
      setError("Failed to delete product: " + (err.detail || err.message));
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
      const API_BASE =
        process.env.REACT_APP_API_URL || "https://ekb-backend.onrender.com";

      const formData = new FormData();
      formData.append("name", newProduct.name);
      formData.append("price", newProduct.price.toString());
      formData.append("description", newProduct.description);
      formData.append("priority", newProduct.priority || "1");
      formData.append("image", newProduct.image);

      const response = await fetch(`${API_BASE}/admin/create-product`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.detail || `HTTP error! status: ${response.status}`);
      }

      await response.json();

      setShowAddForm(false);
      setNewProduct({
        name: "",
        price: "",
        description: "",
        priority: "1",
        image: null,
      });

      await fetchProducts();

      localStorage.setItem("productsUpdated", Date.now().toString());
      setError("");
      alert("Product added successfully!");
    } catch (err) {
      console.error("Add product error:", err);
      setError("Failed to add product: " + (err.message || "Unknown error"));
    }
  };

  const logout = () => {
    localStorage.clear();
    navigate("/");
  };

  const handleImageError = (e) => {
    const imgElement = e.currentTarget;
    if (imgElement) {
      imgElement.onerror = null;
      imgElement.src = "https://placehold.co/200x150/EEE/31343C?text=No+Image";
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
          <button onClick={() => setError("")} className={styles.dismissBtn}>
            ×
          </button>
        </div>
      )}

      <div className={styles.mainContent}>
        {/* Products + Add Product */}
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

          <AddProduct
            showAddForm={showAddForm}
            setShowAddForm={setShowAddForm}
            newProduct={newProduct}
            setNewProduct={setNewProduct}
            handleAddProduct={handleAddProduct}
            setError={setError}
          />

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
                        src={
                          p.image_url.startsWith("http")
                            ? p.image_url
                            : `${
                                process.env.REACT_APP_API_URL ||
                                "https://ekb-backend.onrender.com"
                              }${p.image_url}`
                        }
                        alt={p.name}
                        onError={handleImageError}
                        style={{ width: "100%", height: "200px", objectFit: "cover" }}
                      />
                    ) : (
                      <div className={styles.noImage}>
                        <div style={{ fontSize: "48px" }}>📷</div>
                        <div>No Image</div>
                      </div>
                    )}
                  </div>

                  <div className={styles.productContent}>
                    <h3>{p.name}</h3>
                    <p className={styles.productPrice}>
                      ₹{parseFloat(p.price).toFixed(2)}
                    </p>
                    <p className={styles.productDescription}>{p.description}</p>
                    <div className={styles.productMeta}>
                      <span className={styles.priority}>Priority: {p.priority}</span>
                      <span className={styles.id}>ID: {p.id}</span>
                    </div>
                    <button className={styles.deleteBtn} onClick={() => handleDelete(p.id)}>
                      🗑️ Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Orders */}
        <Orders
  ensureJWTToken={ensureJWTToken}
  setError={setError}
/>
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
            {orders.filter((o) => o.status === "pending").length}
          </div>
          <div className={styles.statLabel}>Pending Orders</div>
        </div>

        <div className={styles.statItem}>
          <div className={styles.statValue}>
            ₹
            {orders
              .reduce((sum, o) => sum + (parseFloat(o.total_amount) || 0), 0)
              .toFixed(2)}
          </div>
          <div className={styles.statLabel}>Total Revenue</div>
        </div>
      </div>
    </div>
  );
}

export default AdminDashboard;
