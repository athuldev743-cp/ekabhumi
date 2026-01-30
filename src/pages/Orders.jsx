import { useEffect, useCallback, useState } from "react";
import styles from "./Dashboard.module.css";

function Orders({ ensureJWTToken, setError }) {
  const [orders, setOrders] = useState([]);
  const [loadingOrders, setLoadingOrders] = useState(false);

  const fetchOrders = useCallback(async () => {
    try {
      setLoadingOrders(true);

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
      const msg = "Temporary issue loading orders: " + (err?.message || "Network error");
      setError?.(msg);
    } finally {
      setLoadingOrders(false);
    }
  }, [ensureJWTToken, setError]);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  const approveOrder = async (orderId) => {
    try {
      const token = await ensureJWTToken();
      const API_BASE =
        process.env.REACT_APP_API_URL || "https://ekb-backend.onrender.com";

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
      setError?.(msg);
      alert(msg);
    }
  };

  return (
    <div className={styles.card}>
      <div className={styles.cardHeader}>
        <h2>📋 Orders</h2>
        <div className={styles.badge}>{orders.length} orders</div>
      </div>

      {loadingOrders ? (
        <div className={styles.emptyState}>
          <div className={styles.emptyStateIcon}>⏳</div>
          <h3>Loading Orders...</h3>
          <p>Please wait</p>
        </div>
      ) : orders.length === 0 ? (
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
                <span
                  className={`${styles.statusBadge} ${
                    o.status === "confirmed"
                      ? styles.statusCompleted
                      : styles.statusPending
                  }`}
                >
                  {o.status}
                </span>
              </div>

              <div className={styles.orderDetails}>
                {o.customer_email && (
                  <p>
                    <strong>Customer:</strong> {o.customer_email}
                  </p>
                )}

                <p>
                  <strong>Total:</strong> ₹{parseFloat(o.total_amount || 0).toFixed(2)}
                </p>

                {o.order_date && (
                  <p>
                    <strong>Date:</strong>{" "}
                    {new Date(o.order_date).toLocaleDateString()}
                  </p>
                )}
              </div>

              <div className={styles.orderActions}>
                <button className={styles.viewBtn}>View Details</button>

                {o.status === "pending" && (
                  <button
                    className={styles.completeBtn}
                    onClick={() => approveOrder(o.id)}
                  >
                    Approve & Send Email
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default Orders;
