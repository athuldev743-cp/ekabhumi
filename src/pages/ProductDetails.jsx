// src/pages/ProductDetails.jsx - UPDATED
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
  const [showOrderForm, setShowOrderForm] = useState(false);
  const [user, setUser] = useState(null);
  
  // Order form state
  const [orderForm, setOrderForm] = useState({
    fullName: "",
    phoneNumber: "",
    email: "",
    address: "",
    city: "",
    state: "",
    pincode: "",
    notes: ""
  });

  // Check if user is logged in
  useEffect(() => {
    const userData = localStorage.getItem("userData");
    if (userData) {
      try {
        const parsedUser = JSON.parse(userData);
        setUser(parsedUser);
        // Pre-fill user data
        setOrderForm(prev => ({
          ...prev,
          fullName: parsedUser.name || "",
          email: parsedUser.email || ""
        }));
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

  const handleOrderClick = () => {
    if (!user) {
      alert("Please login to place an order!");
      navigate("/");
      return;
    }
    setShowOrderForm(true);
  };

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setOrderForm(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const validateForm = () => {
    const { fullName, phoneNumber, email, address, city, state, pincode } = orderForm;
    
    if (!fullName.trim()) {
      alert("Please enter your full name");
      return false;
    }
    
    if (!phoneNumber.trim() || !/^\d{10}$/.test(phoneNumber)) {
      alert("Please enter a valid 10-digit phone number");
      return false;
    }
    
    if (!email.trim() || !/\S+@\S+\.\S+/.test(email)) {
      alert("Please enter a valid email address");
      return false;
    }
    
    if (!address.trim()) {
      alert("Please enter your delivery address");
      return false;
    }
    
    if (!city.trim()) {
      alert("Please enter your city");
      return false;
    }
    
    if (!state.trim()) {
      alert("Please enter your state");
      return false;
    }
    
    if (!pincode.trim() || !/^\d{6}$/.test(pincode)) {
      alert("Please enter a valid 6-digit pincode");
      return false;
    }
    
    return true;
  };

  const handleOrderSubmit = async () => {
    if (!validateForm()) return;
    
    if (!product) return;

    setOrderLoading(true);
    try {
      const orderData = {
        product_id: product.id,
        product_name: product.name,
        quantity,
        unit_price: product.price,
        total_amount: product.price * quantity,
        customer_name: orderForm.fullName,
        customer_email: orderForm.email,
        customer_phone: orderForm.phoneNumber,
        shipping_address: `${orderForm.address}, ${orderForm.city}, ${orderForm.state} - ${orderForm.pincode}`,
        notes: orderForm.notes,
        status: "pending",
        payment_status: "pending",
      };

      console.log("Submitting order:", orderData);
      const result = await createOrder(orderData);
      console.log("Order created:", result);
      
      // Show success message
      alert("✅ Order placed! You will receive an email once the admin confirms your order.");
      
      // Reset and navigate
      setShowOrderForm(false);
      setTimeout(() => {
        navigate("/");
      }, 2000);
      
    } catch (err) {
      console.error("Failed to create order:", err);

      const msg =
        typeof err?.message === "string" && err.message.trim()
          ? err.message
          : "Failed to place order. Please try again.";

      alert(msg);
    } finally {
      setOrderLoading(false);
    }
  };

  const handleImageError = (e) => {
    e.target.onerror = null;
    e.target.src = "https://placehold.co/600x400/EEE/31343C?text=Product+Image";
  };

  const totalPrice = product ? product.price * quantity : 0;

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

      {/* Order Form Modal */}
      {showOrderForm && (
        <div className="order-modal-overlay">
          <div className="order-modal">
            <div className="modal-header">
              <h2>Complete Your Order</h2>
              <button 
                className="modal-close"
                onClick={() => setShowOrderForm(false)}
                disabled={orderLoading}
              >
                ×
              </button>
            </div>
            
            <div className="modal-content">
              {/* Order Summary */}
              <div className="modal-order-summary">
                <h3>Order Summary</h3>
                <div className="summary-item">
                  <span>Product:</span>
                  <span>{product.name}</span>
                </div>
                <div className="summary-item">
                  <span>Price:</span>
                  <span>₹{product.price} × {quantity}</span>
                </div>
                <div className="summary-item total">
                  <span>Total:</span>
                  <span>₹{totalPrice.toFixed(2)}</span>
                </div>
              </div>

              {/* Shipping Details Form */}
              <div className="shipping-form">
                <h3>Shipping Details</h3>
                
                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="fullName">Full Name *</label>
                    <input
                      type="text"
                      id="fullName"
                      name="fullName"
                      value={orderForm.fullName}
                      onChange={handleFormChange}
                      placeholder="Enter your full name"
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="phoneNumber">Phone Number *</label>
                    <input
                      type="tel"
                      id="phoneNumber"
                      name="phoneNumber"
                      value={orderForm.phoneNumber}
                      onChange={handleFormChange}
                      placeholder="10-digit mobile number"
                      maxLength={10}
                      pattern="[0-9]{10}"
                      required
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label htmlFor="email">Email Address *</label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={orderForm.email}
                    onChange={handleFormChange}
                    placeholder="Enter your email"
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="address">Delivery Address *</label>
                  <textarea
                    id="address"
                    name="address"
                    value={orderForm.address}
                    onChange={handleFormChange}
                    placeholder="Full address with landmark"
                    rows={3}
                    required
                  />
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="city">City *</label>
                    <input
                      type="text"
                      id="city"
                      name="city"
                      value={orderForm.city}
                      onChange={handleFormChange}
                      placeholder="City"
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="state">State *</label>
                    <input
                      type="text"
                      id="state"
                      name="state"
                      value={orderForm.state}
                      onChange={handleFormChange}
                      placeholder="State"
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="pincode">Pincode *</label>
                    <input
                      type="text"
                      id="pincode"
                      name="pincode"
                      value={orderForm.pincode}
                      onChange={handleFormChange}
                      placeholder="6-digit pincode"
                      maxLength={6}
                      pattern="[0-9]{6}"
                      required
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label htmlFor="notes">Order Notes (Optional)</label>
                  <textarea
                    id="notes"
                    name="notes"
                    value={orderForm.notes}
                    onChange={handleFormChange}
                    placeholder="Any special instructions or notes"
                    rows={2}
                  />
                </div>
              </div>
            </div>

            <div className="modal-actions">
              <button 
                className="cancel-btn"
                onClick={() => setShowOrderForm(false)}
                disabled={orderLoading}
              >
                Cancel
              </button>
              <button 
                className="confirm-order-btn"
                onClick={handleOrderSubmit}
                disabled={orderLoading}
              >
                {orderLoading ? (
                  <>
                    <span className="spinner"></span>
                    Processing...
                  </>
                ) : (
                  "✅ Confirm Order"
                )}
              </button>
            </div>
          </div>
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
                onClick={handleOrderClick}
              >
                🛒 Place Order
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
              * After placing order, you'll receive confirmation email. Our team will contact you for delivery details.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetails;