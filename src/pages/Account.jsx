import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { fetchOrdersByEmail } from "../api/publicAPI";
import "./Account.css";

function money(n) {
  return Number(n || 0).toFixed(2);
}

function calcGST(subtotal, gstPercent) {
  return (Number(subtotal || 0) * Number(gstPercent || 0)) / 100;
}

export default function Account() {
  const navigate = useNavigate();

  const [tab, setTab] = useState("orders"); // "orders" | "cart"
  const [user, setUser] = useState(null);

  // Orders
  const [orders, setOrders] = useState([]);
  const [ordersLoading, setOrdersLoading] = useState(true);
  const [ordersError, setOrdersError] = useState("");
  const [selectedOrder, setSelectedOrder] = useState(null);

  // Cart (simple localStorage cart)
  const [cart, setCart] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("cart") || "[]");
    } catch {
      return [];
    }
  });

  const GST_PERCENT = 18;
  const SHIPPING_FEE = 0;

  // Load user
  useEffect(() => {
    const raw = localStorage.getItem("userData");
    if (!raw) {
      navigate("/");
      return;
    }
    try {
      setUser(JSON.parse(raw));
    } catch {
      navigate("/");
    }
  }, [navigate]);

  // Load orders
  useEffect(() => {
    if (!user?.email) return;

    (async () => {
      try {
        setOrdersLoading(true);
        setOrdersError("");

        const data = await fetchOrdersByEmail(user.email);

        const list = Array.isArray(data) ? data : [];
        setOrders(list);
        setSelectedOrder(list[0] || null);
      } catch (e) {
        setOrdersError(e?.message || "Failed to load orders");
      } finally {
        setOrdersLoading(false);
      }
    })();
  }, [user?.email]);

  // Cart helpers
  function saveCart(next) {
    setCart(next);
    localStorage.setItem("cart", JSON.stringify(next));
  }

  function updateQty(id, qty) {
    const q = Math.max(1, Number(qty || 1));
    saveCart(cart.map((x) => (x.id === id ? { ...x, qty: q } : x)));
  }

  function removeItem(id) {
    saveCart(cart.filter((x) => x.id !== id));
  }

  // Cart totals
  const cartSubtotal = useMemo(
    () => cart.reduce((sum, it) => sum + Number(it.price || 0) * Number(it.qty || 1), 0),
    [cart]
  );
  const cartGst = useMemo(() => calcGST(cartSubtotal, GST_PERCENT), [cartSubtotal]);
  const cartTotal = useMemo(() => cartSubtotal + cartGst + SHIPPING_FEE, [cartSubtotal, cartGst]);

  // Selected order totals
  const orderSubtotal = useMemo(() => {
    if (!selectedOrder) return 0;
    // In your DB you already have total_amount.
    // Decide policy:
    // - If total_amount is pre-tax subtotal: use it directly.
    // - If total_amount is final: then GST should be "included" not added.
    // I’ll treat total_amount as subtotal for clean billing.
    return Number(selectedOrder.total_amount || 0);
  }, [selectedOrder]);

  const orderGst = useMemo(() => calcGST(orderSubtotal, GST_PERCENT), [orderSubtotal]);
  const orderTotal = useMemo(() => orderSubtotal + orderGst + SHIPPING_FEE, [orderSubtotal, orderGst]);

  if (!user) return null;

  return (
    <div className="account-wrap">
      <div className="account-header">
        <div>
          <h2>My Account</h2>
          <div className="muted">{user.name} • {user.email}</div>
        </div>

        <div className="tabs">
          <button className={tab === "orders" ? "active" : ""} onClick={() => setTab("orders")}>
            Orders
          </button>
          <button className={tab === "cart" ? "active" : ""} onClick={() => setTab("cart")}>
            Cart
          </button>
        </div>
      </div>

      {tab === "orders" && (
        <div className="orders-grid">
          <div className="panel">
            <h3>My Orders</h3>

            {ordersLoading ? (
              <div className="muted">Loading orders…</div>
            ) : ordersError ? (
              <div className="error">{ordersError}</div>
            ) : orders.length === 0 ? (
              <div className="muted">No orders yet.</div>
            ) : (
              <div className="order-list">
                {orders.map((o) => (
                  <button
                    key={o.id}
                    className={`order-card ${selectedOrder?.id === o.id ? "selected" : ""}`}
                    onClick={() => setSelectedOrder(o)}
                  >
                    <div className="row">
                      <b>Order #{o.id}</b>
                      <span className="badge">{o.status}</span>
                    </div>
                    <div className="muted">{o.product_name}</div>
                    <div className="row muted">
                      <span>{o.order_date ? new Date(o.order_date).toLocaleString() : ""}</span>
                      <span>₹{money(o.total_amount)}</span>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="panel">
            <h3>Order Details</h3>

            {!selectedOrder ? (
              <div className="muted">Select an order to view details.</div>
            ) : (
              <>
                <div className="details-grid">
                  <div>
                    <div className="muted">Order ID</div>
                    <div><b>#{selectedOrder.id}</b></div>
                  </div>
                  <div>
                    <div className="muted">Status</div>
                    <div><b>{selectedOrder.status}</b></div>
                  </div>
                  <div>
                    <div className="muted">Payment</div>
                    <div><b>{selectedOrder.payment_status}</b></div>
                  </div>
                  <div>
                    <div className="muted">Ordered At</div>
                    <div><b>{selectedOrder.order_date ? new Date(selectedOrder.order_date).toLocaleString() : "-"}</b></div>
                  </div>
                </div>

                <hr />

                <h4>Item</h4>
                <div className="row">
                  <span>{selectedOrder.product_name}</span>
                  <span>
                    ₹{money(selectedOrder.unit_price)} × {selectedOrder.quantity}
                  </span>
                </div>

                <hr />

                <h4>Billing</h4>
                <div className="bill">
                  <div className="row"><span>Subtotal</span><span>₹{money(orderSubtotal)}</span></div>
                  <div className="row"><span>GST ({GST_PERCENT}%)</span><span>₹{money(orderGst)}</span></div>
                  <div className="row"><span>Shipping</span><span>₹{money(SHIPPING_FEE)}</span></div>
                  <hr />
                  <div className="row total"><span>Total</span><span>₹{money(orderTotal)}</span></div>
                </div>

                <div className="addr">
                  <div><b>Delivery Address:</b> {selectedOrder.shipping_address}</div>
                  <div><b>Phone:</b> {selectedOrder.customer_phone}</div>
                  <div><b>Email:</b> {selectedOrder.customer_email}</div>
                  {selectedOrder.notes ? <div><b>Notes:</b> {selectedOrder.notes}</div> : null}
                </div>

                <div className="muted" style={{ marginTop: 10 }}>
                  Delivery status updates can be added later (ETA/arrived) by adding fields in the Order table.
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {tab === "cart" && (
        <div className="panel">
          <h3>Cart</h3>

          {cart.length === 0 ? (
            <div className="muted">Your cart is empty.</div>
          ) : (
            <>
              <div className="cart-list">
                {cart.map((it) => (
                  <div key={it.id} className="cart-item">
                    <div className="cart-left">
                      <div><b>{it.name}</b></div>
                      <div className="muted">₹{money(it.price)}</div>
                    </div>

                    <div className="cart-right">
                      <input
                        type="number"
                        min={1}
                        value={it.qty || 1}
                        onChange={(e) => updateQty(it.id, e.target.value)}
                      />
                      <div className="muted">₹{money(Number(it.price || 0) * Number(it.qty || 1))}</div>
                      <button onClick={() => removeItem(it.id)}>Remove</button>
                    </div>
                  </div>
                ))}
              </div>

              <div className="bill" style={{ maxWidth: 420, marginTop: 12 }}>
                <div className="row"><span>Subtotal</span><span>₹{money(cartSubtotal)}</span></div>
                <div className="row"><span>GST ({GST_PERCENT}%)</span><span>₹{money(cartGst)}</span></div>
                <div className="row"><span>Shipping</span><span>₹{money(SHIPPING_FEE)}</span></div>
                <hr />
                <div className="row total"><span>Total</span><span>₹{money(cartTotal)}</span></div>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}
