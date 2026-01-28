import React, { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import "./Home.css";
import About from "./About";
import Blog from "./Blog";
import Testimonial from "./Testimonial";
import Footer from "./Footer";
import { fetchProducts } from "../api/publicAPI";
import { ADMIN_EMAILS } from "../config/auth";

const GOOGLE_CLIENT_ID = process.env.REACT_APP_GOOGLE_CLIENT_ID;

const Home = () => {
  const [scrolled, setScrolled] = useState(false);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);

  const trackRef = useRef(null);
  const containerRef = useRef(null);
  const navigate = useNavigate();

  // ---------- Check user session ----------
  useEffect(() => {
    const userData = localStorage.getItem("userData");
    if (userData) {
      try {
        const parsedUser = JSON.parse(userData);
        setUser(parsedUser);
        if (parsedUser.role === "admin") navigate("/admin/dashboard");
      } catch {
        localStorage.removeItem("userToken");
        localStorage.removeItem("userData");
      }
    }
  }, [navigate]);

  // ---------- Fetch products ----------
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

  // ---------- Google OAuth ----------
  useEffect(() => {
    const script = document.createElement("script");
    script.src = "https://accounts.google.com/gsi/client";
    script.async = true;
    script.defer = true;
    document.body.appendChild(script);
  }, []);

  const handleGoogleLogin = () => {
    if (!window.google) return alert("Google login loading");

    window.google.accounts.id.initialize({
      client_id: GOOGLE_CLIENT_ID,
      callback: handleGoogleResponse,
    });
    window.google.accounts.id.prompt();
  };

  const handleGoogleResponse = (response) => {
    try {
      const payload = JSON.parse(atob(response.credential.split(".")[1]));
      const role = ADMIN_EMAILS.includes(payload.email) ? "admin" : "user";

      const userData = {
        name: payload.name,
        email: payload.email,
        profile_pic: payload.picture,
        role,
      };

      localStorage.setItem("userToken", response.credential);
      localStorage.setItem("userData", JSON.stringify(userData));
      setUser(userData);

      if (role === "admin") navigate("/admin/dashboard");
      else alert(`Logged in as ${userData.name}!`);
    } catch (err) {
      console.error("Login failed", err);
      alert("Login failed");
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("userToken");
    localStorage.removeItem("userData");
    setUser(null);
    alert("Logged out successfully!");
  };

  // ---------- Carousel helpers ----------
  const getVisibleCards = () => {
    if (window.innerWidth <= 480) return 1;
    if (window.innerWidth <= 768) return 2;
    if (window.innerWidth <= 1200) return 3;
    return 4;
  };

  const getTotalSlides = () => Math.max(0, Math.ceil(products.length / getVisibleCards()) - 1);
  const nextSlide = () => setCurrentSlide((p) => Math.min(p + 1, getTotalSlides()));
  const prevSlide = () => setCurrentSlide((p) => Math.max(p - 1, 0));
  const goToSlide = (i) => { if (i >= 0 && i <= getTotalSlides()) setCurrentSlide(i); };

  useEffect(() => {
    if (!trackRef.current || !containerRef.current) return;
    const visible = getVisibleCards();
    const containerWidth = containerRef.current.offsetWidth;
    const cardWidth = containerWidth / visible;
    const gap = 30;
    const translateX = -(currentSlide * (cardWidth + gap) * visible);
    trackRef.current.style.transform = `translateX(${translateX}px)`;
  }, [currentSlide, products]);

  // ---------- Scroll effect ----------
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // ---------- Image fallback ----------
  const handleImageError = (e) => { e.target.src = "/images/product-placeholder.jpg"; };

  return (
    <>
      {/* NAVBAR */}
      <nav className={`navbar ${scrolled ? "scrolled" : ""}`}>
        <div className="logo">
          {!scrolled ? (
            <img src="/images/logo.png" alt="Eka Bhumi" className="logo-img" />
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
        </div>
         {/* LOGIN/LOGOUT IN NAVBAR ONLY */}
        <div className="auth-section">
          {user ? (
            <div className="user-nav">
              <span className="user-greeting">Hi, {user.name}</span>
              <button className="logout-nav-btn" onClick={handleLogout}>
                Logout
              </button>
            </div>
          ) : (
            <button className="login-nav-btn" onClick={handleGoogleLogin}>
              Login
            </button>
          )}
        </div>
      </nav>

      {/* HERO */}
      <section id="home" className="hero" style={{ backgroundImage: "url(/images/redensyl-hero.jpg)" }}>
        <div className="hero-content">
         
          <button className="primary-btn" onClick={() => document.getElementById("products").scrollIntoView({ behavior: "smooth" })}>
            Shop Now
          </button>
        </div>
      </section>

      {/* PRODUCTS */}
      <section id="products" className="product-preview">
        <h2>Our Products</h2>
        {loading && <p className="loading-text">Loading products...</p>}
        {!loading && products.length === 0 && <p>No products available</p>}

        <div className="carousel-container" ref={containerRef}>
          <button className="carousel-arrow prev" onClick={prevSlide}>&#10094;</button>
          <div className="carousel-track" ref={trackRef}>
            {products.map((p) => (
              <div className="product-card" key={p.id}>
                <img src={p.image_url || "/images/product-placeholder.jpg"} alt={p.name} className="product-image" onError={handleImageError} />
                <div className="product-info">
                  <span className="product-name">{p.name}</span>
                  <span className="product-price">₹{p.price}</span>
                  {user ? (
                    <button onClick={() => navigate(`/product/${p.id}`)}>View Details</button>
                  ) : (
                    <button onClick={handleGoogleLogin} title="Login to view details">Login to View</button>
                  )}
                </div>
              </div>
            ))}
          </div>
          <button className="carousel-arrow next" onClick={nextSlide}>&#10095;</button>
        </div>
      </section>

      {/* SECTIONS */}
      <section id="about"><About /></section>
      <Blog />
      <Testimonial />

      {/* LOGIN SECTION AFTER TESTIMONIALS */}
     

      <Footer />
    </>
  );
};

export default Home;
