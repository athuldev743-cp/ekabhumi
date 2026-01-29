// src/pages/ProductDetails.jsx
import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { fetchProductById, createOrder } from "../api/publicAPI";
import "./ProductDetails.css";

const ProductDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [orderLoading, setOrderLoading] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState(false);
  const [user, setUser] = useState(null);

  // Check if user is logged in
  useEffect(() => {
    const userData = localStorage.getItem("userData");
    if (userData) {
      try {
        setUser(JSON.parse(userData));
      } catch (error) {
        console.error("Error parsing user data:", error);
      }
    }
  }, []);

  useEffect(() => {
    async function loadProduct() {
      try {
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

  const handleOrder = async () => {
    if (!user) {
      alert("Please login to place an order!");
      navigate("/");
      return;
    }

    if (!product) return;

    setOrderLoading(true);
    try {
      const orderData = {
        product_id: product.id,
        product_name: product.name,
        quantity: quantity,
        total_amount: product.price * quantity,
        customer_name: user.name,
        customer_email: user.email,
        shipping_address: "To be provided", // In real app, get from form
        status: "pending"
      };

      const result = await createOrder(orderData);
      console.log("Order created:", result);
      
      setOrderSuccess(true);
      setTimeout(() => {
        navigate("/");
      }, 3000);
      
    } catch (err) {
      console.error("Failed to create order:", err);
      setError("Failed to place order. Please try again.");
    } finally {
      setOrderLoading(false);
    }
  };

  const handleImageError = (e) => {
    e.target.onerror = null;
    e.target.src = "https://placehold.co/600x400/EEE/31343C?text=Product+Image";
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Loading product details...</p>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="error-container">
        <h2>⚠️ Product Not Found</h2>
        <p>{error || "The product you're looking for doesn't exist."}</p>
        <button 
          className="back-btn"
          onClick={() => navigate("/")}
        >
          ← Back to Home
        </button>
      </div>
    );
  }

  const totalPrice = product.price * quantity;

  return (
    <div className="product-details-container">
      {/* Header */}
      <div className="details-header">
        <button 
          className="back-btn"
          onClick={() => navigate("/")}
        >
          ← Back to Products
        </button>
        <h1>Product Details</h1>
      </div>

      {/* Success Message */}
      {orderSuccess && (
        <div className="success-message">
          <h3>🎉 Order Placed Successfully!</h3>
          <p>Thank you for your order. You will receive a confirmation email shortly.</p>
          <p>Redirecting to homepage...</p>
        </div>
      )}

      {/* Main Content */}
      <div className="product-details-content">
        {/* Left: Product Image */}
        <div className="product-image-section">
          <img 
            src={product.image_url} 
            alt={product.name}
            className="product-detail-image"
            onError={handleImageError}
          />
        </div>

        {/* Right: Product Info */}
        <div className="product-info-section">
          <div className="product-header">
            <h2 className="product-name">{product.name}</h2>
            <div className="product-price-large">₹{product.price}</div>
          </div>

          {/* Product ID */}
          <div className="product-meta">
            <span className="product-id">Product ID: #{product.id}</span>
            {product.priority && (
              <span className="product-priority">Priority: {product.priority}</span>
            )}
          </div>

          {/* Description */}
          <div className="description-section">
            <h3>Description</h3>
            <p className="product-description">
              {product.description || "No description available."}
            </p>
          </div>

          {/* Quantity Selector */}
          <div className="quantity-section">
            <h3>Quantity</h3>
            <div className="quantity-controls">
              <button 
                className="quantity-btn"
                onClick={() => setQuantity(prev => Math.max(1, prev - 1))}
                disabled={quantity <= 1}
              >
                −
              </button>
              <span className="quantity-display">{quantity}</span>
              <button 
                className="quantity-btn"
                onClick={() => setQuantity(prev => prev + 1)}
              >
                +
              </button>
            </div>
            <p className="quantity-note">Select the quantity you want to order</p>
          </div>

          {/* Order Summary */}
          <div className="order-summary">
            <h3>Order Summary</h3>
            <div className="summary-row">
              <span>Price (each):</span>
              <span>₹{product.price}</span>
            </div>
            <div className="summary-row">
              <span>Quantity:</span>
              <span>{quantity}</span>
            </div>
            <div className="summary-row total">
              <span>Total Amount:</span>
              <span className="total-amount">₹{totalPrice.toFixed(2)}</span>
            </div>
          </div>

          {/* Order Button */}
          <div className="order-action-section">
            {user ? (
              <button 
                className="order-btn"
                onClick={handleOrder}
                disabled={orderLoading}
              >
                {orderLoading ? (
                  <>
                    <span className="spinner"></span>
                    Processing...
                  </>
                ) : (
                  "🛒 Place Order"
                )}
              </button>
            ) : (
              <div className="login-required">
                <p>Please login to place an order</p>
                <button 
                  className="login-btn"
                  onClick={() => navigate("/")}
                >
                  Login Now
                </button>
              </div>
            )}
            
            <p className="order-note">
              * Order will be confirmed via email. Our team will contact you for delivery details.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetails;