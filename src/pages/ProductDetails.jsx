// src/pages/ProductDetails.jsx
import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { fetchProductById } from "../api/publicAPI";
import BuyModal from "../components/Buy"; // <-- new component
import "./ProductDetails.css";

const ProductDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [quantity, setQuantity] = useState(1);

  const [user, setUser] = useState(null);
  const [showBuy, setShowBuy] = useState(false);

  // Check if user is logged in
  useEffect(() => {
    const userData = localStorage.getItem("userData");
    if (userData) {
      try {
        setUser(JSON.parse(userData));
      } catch (e) {
        console.error("Error parsing user data:", e);
      }
    }
  }, []);

  useEffect(() => {
    async function loadProduct() {
      try {
        setLoading(true);
        const data = await fetchProductById(id);
        setProduct(data);
      } catch (err) {
        console.error("Failed to load product:", err);
        setError("Failed to load product details. Please try again.");
      } finally {
        setLoading(false);
      }
    }
    loadProduct();
  }, [id]);

  const handleBuyNow = () => {
    if (!user) {
      alert("Please login to place an order!");
      navigate("/");
      return;
    }
    setShowBuy(true);
  };

  // --- Cart helpers (localStorage) ---
  const getCart = () => {
    try {
      return JSON.parse(localStorage.getItem("cart") || "[]");
    } catch {
      return [];
    }
  };

  const saveCart = (next) => {
    localStorage.setItem("cart", JSON.stringify(next));
    window.dispatchEvent(new Event("cart:updated"));
  };

  const addToCart = () => {
    if (!product) return;

    const cart = getCart();
    const existing = cart.find((x) => String(x.id) === String(product.id));
    let next;

    if (existing) {
      next = cart.map((x) =>
        String(x.id) === String(product.id)
          ? { ...x, qty: Number(x.qty || 1) + Number(quantity || 1) }
          : x
      );
    } else {
      next = [
        ...cart,
        {
          id: product.id,
          name: product.name,
          price: product.price,
          qty: Number(quantity || 1),
        },
      ];
    }

    saveCart(next);
    alert("✅ Added to cart!");
  };

  const handleImageError = (e) => {
    e.target.onerror = null;
    e.target.src = "https://placehold.co/900x700/EEE/31343C?text=Product+Image";
  };

  const totalPrice = product ? product.price * quantity : 0;

  if (loading) {
    return (
      <div className="pd-page">
        <div className="pd-state">
          <div className="pd-spinner" />
          <p>Loading product details...</p>
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="pd-page">
        <div className="pd-state">
          <h2>⚠️ Product Not Found</h2>
          <p>{error || "The product you're looking for doesn't exist."}</p>
          <button className="pd-btn pd-btn-outline" onClick={() => navigate("/")}>
            ← Back to Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="pd-page">
      {/* Header */}
      <div className="pd-header">
        <button className="pd-btn pd-btn-outline" onClick={() => navigate("/")}>
          ← Back to Products
        </button>
        <h1 className="pd-title">Product Details</h1>
      </div>

      {/* Premium Card */}
      <div className="pd-card">
        <div className="pd-grid">
          {/* Image */}
          {/* Image */}
<div className="pd-imageWrap">
  <img
    src={product.image_url}
    alt={product.name}
    className="pd-image"
    onError={handleImageError}
    loading="lazy"
  />

  {/* 🔥 Primary CTA under image */}
  <button
    className="pd-btn pd-btn-primary pd-buy-under-image"
    onClick={handleBuyNow}
    disabled={!user}
  >
    Buy Now
  </button>

  {!user && (
    <div className="pd-image-loginHint">
      Login required to purchase
    </div>
  )}
</div>


          {/* Content */}
          <div className="pd-content">
            <div className="pd-top">
              <div>
                <h2 className="pd-name">{product.name}</h2>
                <p className="pd-sub">Premium quality • Authentic feel • Fast delivery</p>
              </div>
              <div className="pd-price">₹{product.price}</div>
            </div>

            {/* Description */}
            <div className="pd-section">
              <h3 className="pd-h3">Description</h3>
              <p className="pd-desc">{product.description || "No description available."}</p>
            </div>

            {/* Quantity */}
            <div className="pd-section">
              <h3 className="pd-h3">Quantity</h3>
              <div className="pd-qtyRow">
                <button
                  className="pd-qtyBtn"
                  onClick={() => setQuantity((prev) => Math.max(1, prev - 1))}
                  disabled={quantity <= 1}
                  aria-label="Decrease quantity"
                >
                  −
                </button>
                <span className="pd-qty">{quantity}</span>
                <button
                  className="pd-qtyBtn"
                  onClick={() => setQuantity((prev) => prev + 1)}
                  aria-label="Increase quantity"
                >
                  +
                </button>
              </div>
              <p className="pd-note">Choose how many units you want.</p>
            </div>

            {/* Summary */}
            <div className="pd-summary">
              <div className="pd-srow">
                <span>Price (each)</span>
                <span>₹{product.price}</span>
              </div>
              <div className="pd-srow">
                <span>Quantity</span>
                <span>{quantity}</span>
              </div>
              <div className="pd-srow pd-total">
                <span>Total</span>
                <span>₹{totalPrice.toFixed(2)}</span>
              </div>
            </div>

            {/* Actions */}
            <div className="pd-actions">
              <button className="pd-btn pd-btn-soft" onClick={addToCart}>
                Add to Cart
              </button>

              

              {!user ? (
                <div className="pd-loginHint">
                  Please login to continue checkout.
                  <button className="pd-linkBtn" onClick={() => navigate("/")}>
                    Login
                  </button>
                </div>
              ) : (
                <button className="pd-btn pd-btn-outline" onClick={() => navigate("/account")}>
                  View Cart
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Buy Modal (separate component + separate CSS) */}
      <BuyModal
        open={showBuy}
        onClose={() => setShowBuy(false)}
        product={product}
        quantity={quantity}
        user={user}
        onSuccess={() => {
          setShowBuy(false);
          // You can redirect after success:
          navigate("/");
        }}
      />
    </div>
  );
};

export default ProductDetails;
