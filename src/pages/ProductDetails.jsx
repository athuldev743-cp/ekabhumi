import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { fetchProductById, createOrder } from "../api/publicAPI";
import "./ProductDetails.css";

function ProductDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [user, setUser] = useState(null);
  const [ordering, setOrdering] = useState(false);

  // Helper function to format price safely
  const formatPrice = (price) => {
    if (typeof price !== 'number' || isNaN(price)) {
      return "0.00";
    }
    return price.toFixed(2);
  };

  // Check if user is logged in
  useEffect(() => {
    const userData = localStorage.getItem("userData");
    if (userData) {
      try {
        setUser(JSON.parse(userData));
      } catch (err) {
        console.error("Error parsing user data:", err);
      }
    }
  }, []);

  // Fetch product
  useEffect(() => {
    async function loadProduct() {
      try {
        setLoading(true);
        const data = await fetchProductById(id);
        // Ensure price is a number
        if (data.price) {
          data.price = Number(data.price);
        }
        if (data.original_price) {
          data.original_price = Number(data.original_price);
        }
        setProduct(data);
      } catch (err) {
        console.error(err);
        setError(err.message || "Failed to load product. Try again later.");
      } finally {
        setLoading(false);
      }
    }

    loadProduct();
  }, [id]);

  // Handle image error
  const handleImageError = (e) => {
    const target = e.target;
    if (target && target.tagName === 'IMG') {
      target.src = "/images/product-placeholder.jpg";
      target.onerror = null;
    }
  };

  const handleLogin = () => {
    // Mock login - replace with actual Google OAuth
    const mockUser = {
      id: 1,
      name: "Demo User",
      email: "user@example.com",
      role: "user",
      profile_pic: "/images/user-avatar.png"
    };
    
    localStorage.setItem("userToken", "mock-jwt-token");
    localStorage.setItem("userData", JSON.stringify(mockUser));
    setUser(mockUser);
    alert("Logged in as demo user! You can now place orders.");
  };

  const handleOrder = async () => {
    if (!user) {
      alert("Please login to place an order");
      return;
    }

    if (!window.confirm(`Place order for ${quantity} × ${product.name}?`)) {
      return;
    }

    setOrdering(true);
    try {
      const productPrice = product.price || 0;
      const orderData = {
        user_email: user.email,
        product_name: product.name,
        quantity: quantity,
        total_price: productPrice * quantity
      };

      const order = await createOrder(orderData);
      
      const successMessage = `
✅ Order placed successfully!

Order ID: ${order.id}
Product: ${order.product_name}
Quantity: ${order.quantity}
Total: ₹${order.total_price}
Status: ${order.status}
Date: ${new Date(order.created_at || new Date()).toLocaleDateString()}

Thank you for your purchase!
      `;
      
      alert(successMessage);
      navigate("/");
    } catch (err) {
      console.error("Order error:", err);
      alert(`Failed to place order: ${err.message}`);
    } finally {
      setOrdering(false);
    }
  };

  const handleAdminLogin = () => {
    navigate("/admin/login");
  };

  // Loading state
  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Loading product details...</p>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="error-container">
        <h2>Error</h2>
        <p>{error}</p>
        <div className="error-actions">
          <button onClick={() => navigate("/")} className="back-btn">
            Back to Home
          </button>
          <button onClick={() => window.location.reload()} className="retry-btn">
            Retry
          </button>
        </div>
      </div>
    );
  }

  // Product not found
  if (!product) {
    return (
      <div className="not-found">
        <h2>Product not found</h2>
        <p>The product you're looking for doesn't exist or has been removed.</p>
        <button onClick={() => navigate("/")} className="back-btn">
          Back to Home
        </button>
      </div>
    );
  }

  // Safely get product values
  const productPrice = product.price || 0;
  const originalPrice = product.original_price || 0;
  const hasDiscount = originalPrice > productPrice;

  return (
    <div className="product-details-container">
      {/* Navigation */}
      <nav className="product-nav">
        <button onClick={() => navigate("/")} className="nav-back-btn">
          &larr; Back to Products
        </button>
        <div className="nav-actions">
          {user?.role === "admin" ? (
            <button onClick={() => navigate("/admin/dashboard")} className="admin-btn">
              Admin Dashboard
            </button>
          ) : (
            <button onClick={handleAdminLogin} className="admin-login-btn">
              Admin Login
            </button>
          )}
        </div>
      </nav>

      {/* Product Content */}
      <main className="product-main">
        {/* Left: Product Image */}
        <section className="product-image-section">
          <div className="image-wrapper">
            <img
              src={product.image_url || "/images/product-placeholder.jpg"}
              alt={product.name}
              className="product-image"
              onError={handleImageError}
            />
          </div>
          
          {/* Image Badges */}
          <div className="image-badges">
            {product.priority < 50 && (
              <span className="badge featured">Featured</span>
            )}
            {product.created_at && (
              <span className="badge new">New Arrival</span>
            )}
          </div>
        </section>

        {/* Right: Product Info */}
        <section className="product-info-section">
          {/* Product Header */}
          <header className="product-header">
            <h1 className="product-title">{product.name}</h1>
            <div className="product-meta">
              {product.category && (
                <span className="category">{product.category}</span>
              )}
              {product.brand && (
                <span className="brand">by {product.brand}</span>
              )}
            </div>
          </header>

          {/* Price Section */}
          <div className="price-section">
            <div className="current-price">
              <span className="price-label">Price:</span>
              <span className="price">₹{formatPrice(productPrice)}</span>
            </div>
            {hasDiscount && (
              <div className="original-price">
                <span className="strikethrough">₹{formatPrice(originalPrice)}</span>
                <span className="discount">
                  {Math.round((1 - productPrice / originalPrice) * 100)}% OFF
                </span>
              </div>
            )}
          </div>

          {/* Description */}
          <div className="description-section">
            <h3>Description</h3>
            <p>{product.description || "No description available."}</p>
          </div>

          {/* Specifications */}
          <div className="specifications">
            <h3>Product Details</h3>
            <div className="specs-grid">
              <div className="spec-item">
                <span className="spec-label">Product ID:</span>
                <span className="spec-value">#{product.id}</span>
              </div>
              {product.category && (
                <div className="spec-item">
                  <span className="spec-label">Category:</span>
                  <span className="spec-value">{product.category}</span>
                </div>
              )}
              {product.brand && (
                <div className="spec-item">
                  <span className="spec-label">Brand:</span>
                  <span className="spec-value">{product.brand}</span>
                </div>
              )}
              <div className="spec-item">
                <span className="spec-label">Availability:</span>
                <span className="spec-value available">In Stock</span>
              </div>
              {product.created_at && (
                <div className="spec-item">
                  <span className="spec-label">Added:</span>
                  <span className="spec-value">
                    {new Date(product.created_at).toLocaleDateString()}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Order Section */}
          <div className="order-section">
            {/* Quantity Selector */}
            <div className="quantity-selector">
              <label htmlFor="quantity">Quantity:</label>
              <div className="quantity-controls">
                <button 
                  onClick={() => setQuantity(q => Math.max(1, q - 1))}
                  disabled={quantity <= 1}
                  className="qty-btn minus"
                >
                  −
                </button>
                <input
                  type="number"
                  id="quantity"
                  value={quantity}
                  min="1"
                  onChange={(e) => {
                    const value = parseInt(e.target.value) || 1;
                    setQuantity(Math.max(1, value));
                  }}
                  className="qty-input"
                />
                <button 
                  onClick={() => setQuantity(q => q + 1)}
                  className="qty-btn plus"
                >
                  +
                </button>
              </div>
            </div>

            {/* Total Price */}
            <div className="total-price">
              <span>Total Amount:</span>
              <span className="total">₹{formatPrice(productPrice * quantity)}</span>
            </div>

            {/* Order Button */}
            {user ? (
              <button 
                className={`order-btn ${ordering ? 'ordering' : ''}`}
                onClick={handleOrder}
                disabled={ordering}
              >
                {ordering ? (
                  <>
                    <span className="spinner"></span>
                    Processing Order...
                  </>
                ) : (
                  `🛒 Place Order - ₹${formatPrice(productPrice * quantity)}`
                )}
              </button>
            ) : (
              <div className="login-prompt">
                <p className="login-message">
                  🔐 Please login to place an order
                </p>
                <button className="login-btn" onClick={handleLogin}>
                  Login Now
                </button>
                <p className="login-note">
                  Or <button className="admin-link-btn" onClick={handleAdminLogin}>
                    login as admin
                  </button> to manage products
                </p>
              </div>
            )}

            {/* Additional Info */}
            <div className="additional-info">
              <div className="info-item">
                <span className="info-icon">🚚</span>
                <span>Free shipping on orders above ₹500</span>
              </div>
              <div className="info-item">
                <span className="info-icon">↩️</span>
                <span>Easy 7-day returns</span>
              </div>
              <div className="info-item">
                <span className="info-icon">📞</span>
                <span>Need help? Call: <strong>+91 98765 43210</strong></span>
              </div>
            </div>
          </div>

          {/* Admin Actions (only for admins) */}
          {user?.role === "admin" && (
            <div className="admin-actions">
              <h4>Admin Actions</h4>
              <div className="admin-buttons">
                <button 
                  className="edit-btn"
                  onClick={() => navigate(`/admin/dashboard?edit=${product.id}`)}
                >
                  ✏️ Edit Product
                </button>
                <button 
                  className="delete-btn"
                  onClick={() => {
                    if (window.confirm(`Delete "${product.name}"?`)) {
                      alert("Delete functionality to be implemented");
                    }
                  }}
                >
                  🗑️ Delete Product
                </button>
              </div>
            </div>
          )}
        </section>
      </main>
    </div>
  );
}

export default ProductDetails;