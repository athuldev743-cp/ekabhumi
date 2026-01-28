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

  const trackRef = useRef(null);
  const containerRef = useRef(null);
  const navigate = useNavigate();

  // ---------------- FETCH PRODUCTS ----------------
  useEffect(() => {
    (async () => {
      try {
        const data = await fetchProducts();
        setProducts(data || []);
      } catch (err) {
        console.error("Failed to fetch products", err);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  // ---------------- CAROUSEL HELPERS ----------------
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

  const nextSlide = () =>
    setCurrentSlide((p) => Math.min(p + 1, getTotalSlides()));

  const prevSlide = () =>
    setCurrentSlide((p) => Math.max(p - 1, 0));

  const goToSlide = (i) => {
    if (i >= 0 && i <= getTotalSlides()) setCurrentSlide(i);
  };

  // ---------------- APPLY TRANSFORM ----------------
  useEffect(() => {
    if (!trackRef.current || !containerRef.current) return;

    const visible = getVisibleCards();
    const width = containerRef.current.offsetWidth / visible;
    const gap = 30;

    trackRef.current.style.transform = `translateX(-${
      currentSlide * (width + gap) * visible
    }px)`;
  }, [currentSlide, products]);

  // ---------------- SCROLL EFFECT ----------------
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
          <img src="/images/logo.png" alt="Eka Bhumi" className="logo-img" />
          <span className="text-logo">EKA BHUMI</span>
        </div>
        <div className="nav-links">
          <a href="#home">Home</a>
          <a href="#products">Products</a>
          <a href="#about">About</a>
          <a href="#blog">Blog</a>
          <a href="#testimonials">Testimonials</a>
        </div>
      </nav>

      {/* HERO */}
      <section
        id="home"
        className="hero"
        style={{ backgroundImage: "url(/images/redensyl-hero.jpg)" }}
      >
        <div className="hero-content">
          <button
  className="primary-btn"
  onClick={() => {
    if (products.length > 0) {
      navigate(`/product/${products[0].id}`);
    }
  }}
>
  Shop Now
</button>
        </div>
      </section>

      {/* PRODUCTS */}
      <section id="products" className="product-preview">
        <h2>Our Products</h2>

        {loading && <p>Loading products...</p>}
        {!loading && products.length === 0 && <p>No products available</p>}

        <div className="carousel-container" ref={containerRef}>
          <button className="carousel-arrow prev" onClick={prevSlide}>
            &#10094;
          </button>

          <div className="carousel-track" ref={trackRef}>
            {products.map((p) => (
              <div className="product-card" key={p.id}>
                <img src={p.image_url} alt={p.name} className="product-image" />
                <div className="product-info">
                  <span className="product-name">{p.name}</span>
                  <span className="product-price">₹{p.price}</span>
                  <button
                    className="product-btn"
                    onClick={() => navigate(`/product/${p.id}`)}
                  >
                    View Details
                  </button>
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
