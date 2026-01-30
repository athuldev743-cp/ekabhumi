import React, { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import "./Home.css";
import About from "./About";
import Blog from "./Blog";
import Testimonial from "./Testimonial";
import Footer from "./Footer";
import { fetchProducts } from "../api/publicAPI";
import { ADMIN_EMAILS } from "../config/auth";
import { convertGoogleToJWT } from "../api/adminAPI";
import { User } from "lucide-react";


const GOOGLE_CLIENT_ID = process.env.REACT_APP_GOOGLE_CLIENT_ID;

const Home = () => {
  const [scrolled, setScrolled] = useState(false);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [error, setError] = useState("");

  const trackRef = useRef(null);
  const containerRef = useRef(null);
  const navigate = useNavigate();

  // Check if user is already logged in
  useEffect(() => {
    const userData = localStorage.getItem("userData");
    if (userData) {
      try {
        const parsedUser = JSON.parse(userData);
        setUser(parsedUser);
      } catch (error) {
        console.error("Error parsing user data:", error);
        localStorage.removeItem("userToken");
        localStorage.removeItem("userData");
        localStorage.removeItem("adminToken");
      }
    }
  }, []);
const loadProducts = async () => {
  try {
    setLoading(true);
    const data = await fetchProducts();
    setProducts(Array.isArray(data) ? data : []);
    setError("");
  } catch (err) {
    console.error("Failed to load products", err);
    setError("Temporary issue loading products.");
    // ✅ DO NOT clear products here (keep last known UI)
    // setProducts([]);
  } finally {
    setLoading(false);
  }
};



  // Fetch products - CORRECTED VERSION
useEffect(() => {
  loadProducts();

  const syncProducts = (e) => {
    if (e.key === "productsUpdated") {
      loadProducts();
    }
  };



  window.addEventListener("storage", syncProducts);

  return () => {
    window.removeEventListener("storage", syncProducts);
  };
}, []);

useEffect(() => {
  const onFocus = () => loadProducts();

  window.addEventListener("focus", onFocus);

  return () => {
    window.removeEventListener("focus", onFocus);
  };
}, []);



  // Google OAuth
  useEffect(() => {
    const script = document.createElement("script");
    script.src = "https://accounts.google.com/gsi/client";
    script.async = true;
    script.defer = true;
    document.body.appendChild(script);
  }, []);

  const handleGoogleLogin = () => {
    if (!window.google) {
      alert("Google login loading... Please try again.");
      return;
    }

    window.google.accounts.id.initialize({
      client_id: GOOGLE_CLIENT_ID,
      callback: handleGoogleResponse,
    });
    window.google.accounts.id.prompt();
  };

  const handleGoogleResponse = async (response) => {
    try {
      // Decode Google token
      const payload = JSON.parse(atob(response.credential.split(".")[1]));
      const userEmail = payload.email;
      
      // Check if admin
      const isAdmin = ADMIN_EMAILS.includes(userEmail);
      const role = isAdmin ? "admin" : "user";

      const userData = {
        name: payload.name,
        email: userEmail,
        profile_pic: payload.picture,
        role: role,
        isAdmin: isAdmin
      };

      // Store user data
      localStorage.setItem("userToken", response.credential);
      localStorage.setItem("userData", JSON.stringify(userData));
      setUser(userData);

      // Try to convert Google token to JWT
      try {
        const jwtResponse = await convertGoogleToJWT(response.credential);
        if (jwtResponse.access_token) {
          localStorage.setItem('adminToken', jwtResponse.access_token);
        }
        
        if (isAdmin) {
          alert(`Welcome Admin ${userData.name}!`);
        } else {
          alert(`Welcome ${userData.name}!`);
        }
      } catch (jwtError) {
        console.error("JWT conversion failed:", jwtError);
        
        if (isAdmin) {
          alert(`Welcome Admin ${userData.name}! (Some admin features may be limited)`);
        } else {
          alert(`Welcome ${userData.name}!`);
        }
      }

    } catch (err) {
      console.error("Login failed:", err);
      alert("Login failed. Please try again.");
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("userToken");
    localStorage.removeItem("userData");
    localStorage.removeItem("adminToken");
    setUser(null);
    alert("Logged out successfully!");
  };

  const goToAdminDashboard = () => {
    const userData = JSON.parse(localStorage.getItem("userData") || "{}");
    if (userData && (userData.role === "admin" || userData.isAdmin === true)) {
      navigate("/admin/dashboard");
    } else {
      alert("Access denied. Admin privileges required.");
    }
  };

  // Carousel helpers
  const getVisibleCards = () => {
    if (window.innerWidth <= 480) return 1;
    if (window.innerWidth <= 768) return 2;
    if (window.innerWidth <= 1200) return 3;
    return 4;
  };

  const getTotalSlides = () => Math.max(0, Math.ceil(products.length / getVisibleCards()) - 1);
  const nextSlide = () => setCurrentSlide((p) => Math.min(p + 1, getTotalSlides()));
  const prevSlide = () => setCurrentSlide((p) => Math.max(p - 1, 0));

useEffect(() => {
  if (!trackRef.current || !containerRef.current) return;
  if (products.length === 0) return; // 🔴 IMPORTANT

  const visible = getVisibleCards();
  const containerWidth = containerRef.current.offsetWidth;
  const cardWidth = containerWidth / visible;
  const gap = 30;

  const translateX = -(currentSlide * (cardWidth + gap) * visible);
  trackRef.current.style.transform = `translateX(${translateX}px)`;
}, [currentSlide, products]);
useEffect(() => {
  setCurrentSlide(0);
}, [products.length]);


  // Scroll effect
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Image fallback
  const handleImageError = (e) => {
    e.target.onerror = null;
    e.target.src = 'https://placehold.co/400x300/EEE/31343C?text=Product+Image';
  };

  // Logo image fallback
  const handleLogoError = (e) => {
    e.target.onerror = null;
    e.target.src = "/images/logo-placeholder.png";
  };
  const goToPriorityOneProduct = () => {
  // If products not loaded yet, fallback scroll
  if (!products || products.length === 0) {
    document.getElementById("products")?.scrollIntoView({ behavior: "smooth" });
    return;
  }

  // Find priority = 1 product, else fallback to lowest priority product
  const priorityOne = products.find((p) => Number(p.priority) === 1);

  const top =
    priorityOne ||
    [...products].sort(
      (a, b) => Number(a.priority ?? 9999) - Number(b.priority ?? 9999)
    )[0];

  if (!top?.id) {
    document.getElementById("products")?.scrollIntoView({ behavior: "smooth" });
    return;
  }

  // If user not logged in, force login first
  if (!user) {
    handleGoogleLogin();
    return;
  }

  // ✅ Go to that product details page (where the order happens)
  navigate(`/products/${top.id}`);
};


  return (
    <>
      <nav className={`navbar ${scrolled ? "scrolled" : ""}`}>
        <div className="logo">
          {!scrolled ? (
            <img 
              src="/images/logo.png" 
              alt="Eka Bhumi" 
              className="logo-img" 
              onError={handleLogoError} 
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
        </div>

        
        
        <div className="auth-section">
  {user ? (
    <div className="user-nav">
      {/* Account Icon (replaces Login after auth) */}
      <button
  className="accountBtn"
  title="Account"
  type="button"
  onClick={() => navigate("/account")}
>
  {user.profile_pic ? (
    <img
      src={user.profile_pic}
      alt="Account"
      className="accountAvatar"
      referrerPolicy="no-referrer"
    />
  ) : (
    <User size={20} />
  )}
</button>


      {/* Optional greeting (can remove if you want cleaner UI) */}
      <span className="user-greeting">Hi, {user.name}</span>

      {user.isAdmin === true && (
        <button
          className="admin-dashboard-btn"
          onClick={goToAdminDashboard}
        >
          Admin Dashboard
        </button>
      )}

      <button
        className="logout-nav-btn"
        onClick={handleLogout}
      >
        Logout
      </button>
    </div>
  ) : (
    /* Login butto BEFORE auth */
    <button
      className="login-nav-btn"
      onClick={handleGoogleLogin}
    >
      Login
    </button>
  )}
</div>

      </nav>

      <section id="home" className="hero" style={{ backgroundImage: "url(/images/redensyl-hero.jpg)" }}>
        <div className="hero-content">
          <button className="primary-btn" onClick={goToPriorityOneProduct}>
  Shop Now
</button>

        </div>
      </section>

      <section id="products" className="product-preview">
        <h2>Our Products</h2>
        
        {error && (
          <div className="error-message" style={{ 
            backgroundColor: '#fff3cd', 
            border: '1px solid #ffeaa7',
            padding: '10px',
            borderRadius: '5px',
            margin: '20px 0',
            color: '#856404',
            textAlign: 'center'
          }}>
            ⚠️ {error}
          </div>
        )}
        
        {loading && <p className="loading-text">Loading products...</p>}
        
        {!loading && products.length === 0 && !error && (
          <p style={{ textAlign: 'center', color: '#666' }}>No products available</p>
        )}

        {!loading && products.length > 0 && (
          <div className="carousel-container" ref={containerRef}>
            <button className="carousel-arrow prev" onClick={prevSlide} disabled={currentSlide === 0}>
              &#10094;
            </button>
            <div className="carousel-track" ref={trackRef}>
              {products.map((p) => {
                // Debug: log each product's image URL
                console.log(`Product ${p.id}: ${p.name}, Image: ${p.image_url}`);
                return (
                  <div className="product-card" key={p.id}>
                    <img 
                      src={p.image_url} 
                      alt={p.name} 
                      className="product-image" 
                      onError={handleImageError}
                      loading="lazy"
                    />
                    <div className="product-info">
                      <span className="product-name">{p.name}</span>
                      <span className="product-price">₹{p.price}</span>
                      
                      {user ? (
                        <button 
                          className="view-details-btn"
                          onClick={() => {
                           setCurrentSlide(0);
                            navigate(`/products/${p.id}`);

                            }}

                        >
                          View Details
                        </button>
                      ) : (
                        <button 
                          className="login-to-view-btn"
                          onClick={handleGoogleLogin}
                          title="Login to view product details"
                        >
                           View Details
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
            <button className="carousel-arrow next" onClick={nextSlide} disabled={currentSlide >= getTotalSlides()}>
              &#10095;
            </button>
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