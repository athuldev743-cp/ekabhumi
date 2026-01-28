import React, { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import "./Home.css";
import About from "./About";
import Blog from "./Blog";
import Testimonial from "./Testimonial";
import Footer from "./Footer";
import { fetchProducts } from "../api/publicAPI";

const Home = () => {
  const [scrolled, setScrolled] = useState(false);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);

  const trackRef = useRef(null);
  const containerRef = useRef(null);
  const navigate = useNavigate();

  // Check if user is logged in
  useEffect(() => {
    const userData = localStorage.getItem("userData");
    if (userData) {
      try {
        const parsedUser = JSON.parse(userData);
        setUser(parsedUser);
        
        // If admin, redirect to admin dashboard
        if (parsedUser.role === "admin") {
          navigate("/admin/dashboard");
        }
      } catch (error) {
        console.error("Error parsing user data:", error);
        localStorage.removeItem("userToken");
        localStorage.removeItem("userData");
      }
    }
  }, [navigate]);

  // ---------- FETCH PRODUCTS ----------
  useEffect(() => {
    async function loadProducts() {
      try {
        const data = await fetchProducts();
        setProducts(data);
      } catch (err) {
        console.error("Failed to load products", err);
      } finally {
        setLoading(false);
      }
    }
    loadProducts();
  }, []);

  // ---------- IMAGE ERROR HANDLER ----------
  const handleImageError = (e) => {
    e.target.src = "/images/product-placeholder.jpg";
  };

  // ---------- GOOGLE LOGIN HANDLER ----------
  const handleGoogleLogin = () => {
    // Mock login - replace with actual Google OAuth
    const mockUser = {
      id: 1,
      name: "Demo User",
      email: "user@example.com",
      role: "user", // Change to "admin" for admin access
      profile_pic: "/images/user-avatar.png"
    };
    
    localStorage.setItem("userToken", "mock-jwt-token");
    localStorage.setItem("userData", JSON.stringify(mockUser));
    setUser(mockUser);
    
    // If admin, redirect to dashboard
    if (mockUser.role === "admin") {
      navigate("/admin/dashboard");
    } else {
      alert(`Logged in as ${mockUser.name}! You can now place orders.`);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("userToken");
    localStorage.removeItem("userData");
    setUser(null);
    alert("Logged out successfully!");
  };

  // ---------- CAROUSEL HELPERS ----------
  const getVisibleCards = () => {
    if (window.innerWidth <= 480) return 1;
    if (window.innerWidth <= 768) return 2;
    if (window.innerWidth <= 1200) return 3;
    return 4;
  };

  const getTotalSlides = () => {
    const visible = getVisibleCards();
    return Math.max(0, Math.ceil(products.length / visible) - 1);
  };

  const nextSlide = () => setCurrentSlide((p) => Math.min(p + 1, getTotalSlides()));
  const prevSlide = () => setCurrentSlide((p) => Math.max(p - 1, 0));
  const goToSlide = (i) => { if (i >= 0 && i <= getTotalSlides()) setCurrentSlide(i); };

  // ---------- APPLY TRANSFORM ----------
  useEffect(() => {
    if (!trackRef.current || !containerRef.current) return;

    const visible = getVisibleCards();
    const containerWidth = containerRef.current.offsetWidth;
    const cardWidth = containerWidth / visible;
    const gap = 30;
    const translateX = -(currentSlide * (cardWidth + gap) * visible);

    trackRef.current.style.transform = `translateX(${translateX}px)`;
  }, [currentSlide, products]);

  // ---------- SCROLL EFFECT ----------
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <>
      {/* NAVBAR */}
      <nav className={`navbar ${scrolled ? "scrolled" : ""}`}>
        <div className="logo">
          {!scrolled ? (
            <img
              src="/images/logo.png"
              alt="Eka Bhumih Logo"
              className="logo-img"
            />
          ) : (
            <span className="text-logo">EKABHUMI</span>
          )}
        </div>

        <div className="nav-links">
          <a href="#home">Home</a>
          <a href="#products">Products</a>
          <a href="#about">About</a>
          <a href="#blog">Blog</a>
          <a href="#testimonials">Testimonials</a>
          
          {/* LOGIN/LOGOUT BUTTON */}
          {user ? (
            <div className="user-nav">
              <span className="user-greeting">Hi, {user.name}</span>
              <button className="logout-nav-btn" onClick={handleLogout}>
                Logout
              </button>
              {user.role === "admin" && (
                <button 
                  className="admin-nav-btn"
                  onClick={() => navigate("/admin/dashboard")}
                >
                  Admin
                </button>
              )}
            </div>
          ) : (
            <button className="login-nav-btn" onClick={handleGoogleLogin}>
              Login
            </button>
          )}
        </div>
      </nav>

      {/* HERO */}
      <section
        id="home"
        className="hero"
        style={{ backgroundImage: `url(/images/redensyl-hero.jpg)` }}
      >
        <div className="hero-content">
          <h1>Welcome to Eka Bhumi</h1>
          <p>Premium hair care products for healthy, beautiful hair</p>
          
          <div className="hero-buttons">
            <button
              className="primary-btn"
              onClick={() => navigate("/products")}
            >
              Shop Now
            </button>
            
            {!user && (
              <button className="secondary-btn" onClick={handleGoogleLogin}>
                Login to Order
              </button>
            )}
          </div>
        </div>
      </section>

      {/* PRODUCTS */}
      <section id="products" className="product-preview">
        <h2>Our Products</h2>
        
        {!user && (
          <div className="login-prompt">
            <p>Please login to view product details and place orders</p>
            <button className="login-prompt-btn" onClick={handleGoogleLogin}>
              Login Now
            </button>
          </div>
        )}

        {loading && <p className="loading-text">Loading products...</p>}
        {!loading && products.length === 0 && <p className="no-products">No products available</p>}

        <div className="carousel-container" ref={containerRef}>
          <button className="carousel-arrow prev" onClick={prevSlide}>
            &#10094;
          </button>

          <div className="carousel-track" ref={trackRef}>
            {products.map((p) => (
              <div className="product-card" key={p.id}>
                <img 
                  src={p.image_url || "/images/product-placeholder.jpg"} 
                  alt={p.name} 
                  className="product-image"
                  onError={handleImageError}
                />
                <div className="product-info">
                  <span className="product-name">{p.name}</span>
                  <span className="product-price">₹{p.price}</span>
                  
                  {user ? (
                    <button
                      className="product-btn"
                      onClick={() => navigate(`/product/${p.id}`)}
                    >
                      View Details
                    </button>
                  ) : (
                    <button
                      className="product-btn disabled"
                      onClick={handleGoogleLogin}
                      title="Login to view details"
                    >
                      Login to View
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>

          <button className="carousel-arrow next" onClick={nextSlide}>
            &#10095;
          </button>
        </div>

        {getTotalSlides() > 0 && (
          <div className="carousel-indicators">
            {Array.from({ length: getTotalSlides() + 1 }).map((_, i) => (
              <button
                key={i}
                className={`indicator ${i === currentSlide ? "active" : ""}`}
                onClick={() => goToSlide(i)}
              />
            ))}
          </div>
        )}
      </section>

      <section id="about"><About /></section>
      <Blog />
      <Testimonial />
      <Footer />
    </>
  );
};

export default Home;