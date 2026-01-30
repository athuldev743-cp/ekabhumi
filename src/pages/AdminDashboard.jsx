// AdminDashboard.jsx
import { useEffect, useState, useCallback, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import styles from "./Dashboard.module.css";

import AddProduct from "./AddProduct";
import Orders from "./Orders";

function AdminDashboard() {
  const [activeTab, setActiveTab] = useState("orders"); // default Orders
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);

  const [loading, setLoading] = useState(true);
  const [loadingProducts, setLoadingProducts] = useState(false);
  const [loadingOrders, setLoadingOrders] = useState(true);

  const [selectedOrder, setSelectedOrder] = useState(null);

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

  const API_BASE = useMemo(
    () => process.env.REACT_APP_API_URL || "https://ekb-backend.onrender.com",
    []
  );

  const isUserAdmin = () => {
    const userData = localStorage.getItem("userData");
    if (!userData) return false;
    try {
      const parsed = JSON.parse(userData);
      return parsed.role === "admin" || parsed.isAdmin === true;
    } catch {
      return false;
    }
  };

  // ✅ returns token or null (no throw)
  const ensureJWTToken = useCallback(async () => {
    const t = localStorage.getItem("adminToken");
    return t || null;
  }, []);

  const fetchOrders = useCallback(async () => {
    try {
      setLoadingOrders(true);

      const token = await ensureJWTToken();
      if (!token) throw new Error("Admin token missing. Please login again as admin.");

      const res = await fetch(`${API_BASE}/admin/orders`, {
        headers: { Authorization: `Bearer ${token}`, Accept: "application/json" },
      });

      if (!res.ok) {
        const text = await res.text().catch(() => "");
        throw new Error(`Orders failed: ${res.status} ${text}`);
      }

      const data = await res.json().catch(() => []);
      setOrders(Array.isArray(data) ? data : []);
    } catch (e) {
      setError(e?.message || "Failed to load orders");
    } finally {
      setLoadingOrders(false);
    }
  }, [API_BASE, ensureJWTToken]);

  const fetchProducts = useCallback(async () => {
    setLoadingProducts(true);
    try {
      const token = await ensureJWTToken();
      if (!token) throw new Error("Admin token missing. Please login again as admin.");

      const res = await fetch(`${API_BASE}/admin/admin-products`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) {
        const text = await res.text().catch(() => "");
        throw new Error(`Products failed: ${res.status} ${text}`);
      }

      const data = await res.json().catch(() => []);
      setProducts(Array.isArray(data) ? data : []);
    } catch (e) {
      setError(e?.message || "Failed to load products");
    } finally {
      setLoadingProducts(false);
    }
  }, [API_BASE, ensureJWTToken]);

  // ✅ Boot: only fetch orders (fast)
  useEffect(() => {
    if (!isUserAdmin()) {
      alert("Access denied. Admin privileges required.");
      navigate("/");
      return;
    }

    const token = localStorage.getItem("adminToken");
    if (!token) {
      setLoading(false);
      setError("Admin token missing. Please login again as admin.");
      navigate("/");
      return;
    }

    const boot = async () => {
      setLoading(true);
      setError("");
      await fetchOrders();
      setLoading(false);
    };

    boot();
  }, [fetchOrders, navigate]);

  // ✅ Fetch products only when Products tab opened (on-demand)
  useEffect(() => {
    if (activeTab === "products" && products.length === 0 && !loadingProducts) {
      fetchProducts();
    }
  }, [activeTab, fetchProducts, products.length, loadingProducts]);

  const logout = () => {
    localStorage.clear();
    navigate("/");
  };

  const handleImageError = (e) => {
    const img = e.currentTarget;
    img.onerror = null;
    img.src = "https://placehold.co/200x150/EEE/31343C?text=No+Image";
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this product?")) return;

    try {
      const token = await ensureJWTToken();
      if (!token) throw new Error("Admin token missing. Please login again as admin.");

      const res = await fetch(`${API_BASE}/admin/delete-product/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) {
        const text = await res.text().catch(() => "");
        throw new Error(`Delete failed: ${res.status} ${text}`);
      }

      await fetchProducts();
      localStorage.setItem("productsUpdated", Date.now().toString());
      alert("Product deleted successfully!");
    } catch (e) {
      setError(e?.message || "Failed to delete product");
    }
  };

  const handleAddProduct = async (e) => {
    e.preventDefault();

    if (!newProduct.image) return setError("Please select an image file");
    if (!newProduct.name || !newProduct.price || !newProduct.description) {
      return setError("Please fill all required fields");
    }

    try {
      const token = await ensureJWTToken();
      if (!token) throw new Error("Admin token missing. Please login again as admin.");

      const formData = new FormData();
      formData.append("name", newProduct.name);
      formData.append("price", newProduct.price.toString());
      formData.append("description", newProduct.description);
      formData.append("priority", newProduct.priority || "1");
      formData.append("image", newProduct.image);

      const res = await fetch(`${API_BASE}/admin/create-product`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });

      if (!res.ok) {
        const text = await res.text().catch(() => "");
        throw new Error(`Create failed: ${res.status} ${text}`);
      }

      setShowAddForm(false);
      setNewProduct({ name: "", price: "", description: "", priority: "1", image: null });

      await fetchProducts();
      localStorage.setItem("productsUpdated", Date.now().toString());
      alert("Product added successfully!");
      setError("");
    } catch (e) {
      setError(e?.message || "Failed to add product");
    }
  };

  const approveOrder = useCallback(
    async (orderId) => {
      try {
        const token = await ensureJWTToken();
        if (!token) throw new Error("Admin token missing. Please login again as admin.");

        const res = await fetch(`${API_BASE}/admin/orders/${orderId}/approve`, {
          method: "POST",
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!res.ok) {
          const text = await res.text().catch(() => "");
          throw new Error(`Approve failed: ${res.status} ${text}`);
        }

        await fetchOrders();
        alert("✅ Order approved and email sent!");
      } catch (e) {
        const msg = e?.message || "Failed to approve order";
        setError(msg);
        alert(msg);
      }
    },
    [API_BASE, ensureJWTToken, fetchOrders]
  );

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
        <h1>🛠️ Admin Dashboard</h1>

        <div className={styles.headerActions}>
          <div className={styles.tabs}>
            <button
              type="button"
              className={`${styles.tabBtn} ${activeTab === "orders" ? styles.tabActive : ""}`}
              onClick={() => setActiveTab("orders")}
            >
              Orders
            </button>
            <button
              type="button"
              className={`${styles.tabBtn} ${activeTab === "products" ? styles.tabActive : ""}`}
              onClick={() => setActiveTab("products")}
            >
              Products
            </button>
          </div>

          <button className={styles.logoutBtn} onClick={logout} type="button">
            <span>🚪</span> Logout
          </button>
        </div>
      </div>

      {error && (
        <div className={styles.errorAlert}>
          ⚠️ {error}
          <button onClick={() => setError("")} className={styles.dismissBtn} type="button">
            ×
          </button>
        </div>
      )}

      {/* ORDERS TAB */}
      {activeTab === "orders" && (
        <div className={styles.twoCol}>
          <div className={styles.card}>
            <div className={styles.cardHeader}>
              <h2>📋 Orders</h2>
              <div className={styles.badge}>{orders.length}</div>
            </div>

            {loadingOrders ? (
              <div className={styles.emptyState}>
                <div className={styles.emptyStateIcon}>⏳</div>
                <h3>Loading Orders...</h3>
                <p>Please wait</p>
              </div>
            ) : (
              <Orders
                orders={orders}
                onViewDetails={(o) => setSelectedOrder(o)}
                onApprove={(id) => approveOrder(id)}
              />
            )}
          </div>

          {/* Details panel */}
          <div className={styles.card}>
            <div className={styles.cardHeader}>
              <h2>📌 Order Details</h2>
              <div className={styles.badge}>{selectedOrder ? `#${selectedOrder.id}` : "-"}</div>
            </div>

            {!selectedOrder ? (
              <div className={styles.emptyState}>
                <div className={styles.emptyStateIcon}>👈</div>
                <h3>Select an order</h3>
                <p>Click “View Details” to see address and info.</p>
              </div>
            ) : (
              <div className={styles.detailsBox}>
                <p><strong>Name:</strong> {selectedOrder.customer_name || "-"}</p>
                <p><strong>Email:</strong> {selectedOrder.customer_email || "-"}</p>
                <p><strong>Phone:</strong> {selectedOrder.customer_phone || "-"}</p>

                <p><strong>Product:</strong> {selectedOrder.product_name || "-"}</p>
                <p><strong>Qty:</strong> {selectedOrder.quantity ?? "-"}</p>
                <p><strong>Unit Price:</strong> ₹{Number(selectedOrder.unit_price || 0).toFixed(2)}</p>
                <p><strong>Total:</strong> ₹{Number(selectedOrder.total_amount || 0).toFixed(2)}</p>

                <div className={styles.detailsSection}>
                  <h3 className={styles.detailsTitle}>Shipping Address</h3>
                  <p className={styles.mono}>
                    {selectedOrder.shipping_address || "❌ Shipping address missing from order"}
                  </p>
                </div>

                {selectedOrder.notes && (
                  <p><strong>Notes:</strong> {selectedOrder.notes}</p>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* PRODUCTS TAB */}
      {activeTab === "products" && (
        <div className={styles.card}>
          <div className={styles.cardHeader}>
            <h2>🛍️ Products</h2>
            <div className={styles.badge}>{products.length}</div>
          </div>

          <button
            className={styles.addProductBtn}
            onClick={() => setShowAddForm((s) => !s)}
            type="button"
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

          {loadingProducts ? (
            <div className={styles.emptyState}>
              <div className={styles.emptyStateIcon}>⏳</div>
              <h3>Loading Products...</h3>
              <p>Please wait</p>
            </div>
          ) : products.length === 0 ? (
            <div className={styles.emptyState}>
              <div className={styles.emptyStateIcon}>📦</div>
              <h3>No Products Found</h3>
              <p>Add your first product using the “Add New Product” button.</p>
            </div>
          ) : (
            <div className={styles.productsGrid}>
              {products.map((p) => (
                <div key={p.id} className={styles.productCard}>
                  <div className={styles.productImage}>
                    {p.image_url ? (
                      <img
                        src={p.image_url.startsWith("http") ? p.image_url : `${API_BASE}${p.image_url}`}
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
                    <p className={styles.productPrice}>₹{parseFloat(p.price).toFixed(2)}</p>
                    <p className={styles.productDescription}>{p.description}</p>

                    <div className={styles.productMeta}>
                      <span className={styles.priority}>Priority: {p.priority}</span>
                      <span className={styles.id}>ID: {p.id}</span>
                    </div>

                    <button
                      className={styles.deleteBtn}
                      onClick={() => handleDelete(p.id)}
                      type="button"
                    >
                      🗑️ Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default AdminDashboard;
