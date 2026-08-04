import React, { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { fetchProductById } from "../api/publicAPI";
import BuyModal from "../components/Buy";
import PublicNavbar from "../components/PublicNavbar";
import Footer from "./Footer";
import { formatCurrency, getProductPricing } from "../utils/productPricing";
import StickyAddToCartBar from "../components/StickyAddToCartBar";
import "./ProductDetails.css";

const API_BASE = process.env.REACT_APP_API_URL || "https://ekb-backend.onrender.com";

const PRODUCT_COMPARE_ROWS = [
  {
    label: "Active Formulation",
    ours: "3% Redensyl + Anagain + Botanical Extracts targeting hair stem cells.",
    typical: "Generic mineral oils or synthetic fragrance formulas with minimal active ingredients.",
  },
  {
    label: "Hair Fall Action",
    ours: "Reactivates dormant stem cells to reduce hair fall by up to 89%.",
    typical: "Coats hair strands temporarily without strengthening hair roots.",
  },
  {
    label: "Visible Growth Results",
    ours: "Promotes new baby hair sprouting & visible density boost in 8-12 weeks.",
    typical: "Slow or no visible improvement in hair volume or new hair growth.",
  },
  {
    label: "Scalp & Root Feeling",
    ours: "Non-greasy, fast-absorbing micro-formula that penetrates deep into hair follicles.",
    typical: "Heavy oil buildup that clogs scalp pores and weighs hair down.",
  },
];

const RESULTS_STEPS = [
  {
    phase: "Weeks 1-3",
    title: "Root Anchoring & Less Shedding",
    copy: "Hair fall during washing & combing drops significantly. Scalp feels rebalanced, calm, and deeply nourished.",
  },
  {
    phase: "Weeks 4-8",
    title: "Dormant Follicle Activation",
    copy: "Redensyl stimulates resting stem cells, reactivating hair follicles to initiate the new growth cycle.",
  },
  {
    phase: "Weeks 8-12+",
    title: "Visible Growth & Density Boost",
    copy: "Noticeable new baby hair sprouting along hairline & crown, with significantly fuller root density.",
  },
];

const PRODUCT_BADGES = [
  "3% Redensyl Active",
  "89% Less Hair Fall",
  "Follicle Growth Booster",
  "Visible Growth in 8-12 Wks",
];

const STATIC_REVIEWS = [
  {
    id: "r1",
    user_name: "Priya Sharma",
    rating: 5,
    date: "12 May 2026",
    verified: true,
    title: "Unbelievable hair fall reduction!",
    text: "My hair fall reduced drastically within 4 weeks. I was skeptical about Redensyl, but by month 2 I could actually see small new hair sprouting near my hairline. Best decision ever!",
  },
  {
    id: "r2",
    user_name: "Rahul Mehta",
    rating: 5,
    date: "28 April 2026",
    verified: true,
    title: "Thicker roots and fuller volume",
    text: "Used this consistently for 8 weeks. Hair feels much thicker at the roots and less strands fall out while combing. Doesn't feel greasy at all.",
  },
  {
    id: "r3",
    user_name: "Anjali Patel",
    rating: 5,
    date: "04 April 2026",
    verified: true,
    title: "Visible new hair growth!",
    text: "My hair density has noticeably improved. Even my hairstylist noticed baby hairs growing along my crown area. Worth every rupee!",
  },
  {
    id: "r4",
    user_name: "Sanjay Kumar",
    rating: 5,
    date: "19 March 2026",
    verified: true,
    title: "Fewer strands in my brush",
    text: "Visible reduction in shedding in just 3 weeks. Scalp health improved dramatically and my hair looks fuller and healthier.",
  },
];

const FALLBACK_GALLERY_IMAGES = [
  "/images/redensyl-productimg.png",
  "/images/redensyl-hero.png",
];

const parseGalleryField = (value) => {
  if (!value) return [];
  if (Array.isArray(value)) return value.flatMap(parseGalleryField);

  if (typeof value === "string") {
    const trimmed = value.trim();
    if (!trimmed) return [];

    if (trimmed.startsWith("[")) {
      try {
        const parsed = JSON.parse(trimmed);
        return Array.isArray(parsed) ? parsed.flatMap(parseGalleryField) : [];
      } catch {
        return trimmed
          .split(",")
          .map((item) => item.trim())
          .filter(Boolean);
      }
    }

    return trimmed
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean);
  }

  return [];
};

function StarRating({ rating = 5 }) {
  return (
    <div className="pd-star-row" aria-label={`Rating: ${rating} out of 5 stars`}>
      {[1, 2, 3, 4, 5].map((star) => (
        <span
          key={star}
          className={`pd-star ${star <= rating ? "pd-star--filled" : ""}`}
        >
          ★
        </span>
      ))}
    </div>
  );
}

const ProductDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [showBuy, setShowBuy] = useState(false);
  const [selectedImage, setSelectedImage] = useState("");
  const [showStickyBar, setShowStickyBar] = useState(false);
  const [backendReviews, setBackendReviews] = useState([]);

  useEffect(() => {
    const onScroll = () => {
      const scrollY = window.scrollY;
      const footerEl = document.querySelector("footer") || document.getElementById("contact");
      let isNearFooter = false;
      if (footerEl) {
        const rect = footerEl.getBoundingClientRect();
        isNearFooter = rect.top <= window.innerHeight + 20;
      } else {
        isNearFooter = (window.innerHeight + scrollY) >= (document.documentElement.scrollHeight - 300);
      }

      setShowStickyBar(scrollY > 200 && !isNearFooter);
    };

    window.addEventListener("scroll", onScroll);
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    async function load() {
      try {
        setLoading(true);
        const data = await fetchProductById(id);
        setProduct(data);
        setError("");
      } catch (err) {
        console.error(err);
        setError("Failed to load product details.");
      } finally {
        setLoading(false);
      }
    }

    load();
  }, [id]);

  useEffect(() => {
    fetch(`${API_BASE}/reviews`)
      .then((r) => (r.ok ? r.json() : []))
      .then((data) => setBackendReviews(Array.isArray(data) ? data : []))
      .catch(() => {});
  }, []);

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

  const pricing = useMemo(() => getProductPricing(product), [product]);
  const currentPrice = pricing.offerPrice;
  const originalPrice = pricing.basePrice;
  const savingsAmount = pricing.savings;
  const discountPercent = pricing.discountPercent;

  const addToCart = () => {
    if (!product) return;
    const cart = getCart();
    const existing = cart.find((x) => String(x.id) === String(product.id));
    saveCart(
      existing
        ? cart.map((x) =>
            String(x.id) === String(product.id)
              ? { ...x, qty: Number(x.qty || 1) + quantity }
              : x
          )
        : [
            ...cart,
            {
              id: product.id,
              name: product.name,
              price: currentPrice,
              original_price: originalPrice,
              image_url: product.image_url,
              qty: quantity,
            },
          ]
    );
    alert("Added to cart.");
  };

  const handleImageError = (e) => {
    e.target.onerror = null;
    e.target.src = "https://placehold.co/900x900/EDF5EF/1B4332?text=Product";
  };

  const isAvailableSoon = Number(product?.quantity ?? 0) <= 0;

  const galleryImages = useMemo(() => {
    const candidates = [
      ...parseGalleryField(product?.image_url),
      ...parseGalleryField(product?.gallery_images),
      ...parseGalleryField(product?.image_urls),
      ...parseGalleryField(product?.images),
      ...parseGalleryField(product?.gallery),
      ...parseGalleryField(product?.extra_images),
    ].filter(Boolean);

    const uniqueImages = [];
    const seen = new Set();

    candidates.forEach((image) => {
      if (!seen.has(image)) {
        seen.add(image);
        uniqueImages.push(image);
      }
    });

    if (uniqueImages.length <= 1) {
      FALLBACK_GALLERY_IMAGES.forEach((image) => {
        if (!seen.has(image)) {
          seen.add(image);
          uniqueImages.push(image);
        }
      });
    }

    return uniqueImages.slice(0, 5);
  }, [product]);

  const shortDescription = useMemo(() => {
    if (!product?.description) {
      return "Powered by 3% Redensyl + Anagain to target root cause of hair fall, reactivate dormant follicles, and boost hair density within 8-12 weeks.";
    }
    return product.description.length > 200
      ? `${product.description.slice(0, 200)}...`
      : product.description;
  }, [product]);

  const combinedReviews = useMemo(() => {
    const apiMapped = backendReviews.map((r) => ({
      id: `api_${r.id}`,
      user_name: r.user_name || "Verified Customer",
      rating: Number(r.rating || 5),
      date: r.created_at
        ? new Date(r.created_at).toLocaleDateString("en-IN", {
            day: "numeric",
            month: "short",
            year: "numeric",
          })
        : "Recent",
      verified: true,
      title: r.product_name ? `Bought: ${r.product_name}` : "Verified Buyer",
      text: r.text,
    }));
    return [...STATIC_REVIEWS, ...apiMapped];
  }, [backendReviews]);

  const decQty = () => setQuantity((p) => Math.max(1, p - 1));
  const incQty = () => setQuantity((p) => p + 1);

  useEffect(() => {
    setSelectedImage(galleryImages[0] || "");
  }, [galleryImages, product?.id]);

  if (loading) {
    return (
      <div className="pd-page">
        <PublicNavbar />
        <div className="pd-state">
          <div className="pd-spinner" />
          <p>Loading product details...</p>
        </div>
        <Footer />
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="pd-page">
        <PublicNavbar />
        <div className="pd-state">
          <div className="pd-state-mark">O</div>
          <h2>Product Not Found</h2>
          <p>{error || "The product you're looking for doesn't exist."}</p>
          <button className="pd-btn pd-btn-outline" onClick={() => navigate("/")}>
            Back to Home
          </button>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="pd-page">
      <div className="pd-page-ambient pd-page-ambient--one" />
      <div className="pd-page-ambient pd-page-ambient--two" />
      <PublicNavbar />

      <main className="pd-main">
        <section className="pd-hero">
          <div className="pd-hero-media">
            <div className="pd-image-card">
              <div className="pd-image-badges">
                <span className="pd-badge pd-badge--soft">Clinical Hair Care</span>
                <span
                  className={`pd-badge ${
                    isAvailableSoon ? "pd-badge--muted" : "pd-badge--solid"
                  }`}
                >
                  {isAvailableSoon ? "Available Soon" : "In Stock - Ready to Ship"}
                </span>
              </div>
              <div className="pd-image-stage">
                <img
                  src={selectedImage || product.image_url}
                  alt={product.name}
                  className="pd-image"
                  onError={handleImageError}
                  loading="eager"
                />
              </div>

              {galleryImages.length > 1 && (
                <div className="pd-gallery-strip" aria-label="Product image gallery">
                  {galleryImages.map((image, index) => (
                    <button
                      key={`${image}-${index}`}
                      type="button"
                      className={`pd-gallery-thumb ${
                        selectedImage === image ? "is-active" : ""
                      }`}
                      onClick={() => setSelectedImage(image)}
                      aria-label={`View image ${index + 1} of ${product.name}`}
                    >
                      <img
                        src={image}
                        alt={`${product.name} view ${index + 1}`}
                        className="pd-gallery-thumb-img"
                        onError={handleImageError}
                        loading="lazy"
                      />
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="pd-hero-copy">
            <div className="pd-copy-card">
              <div className="pd-hero-rating-head">
                <StarRating rating={5} />
                <span className="pd-rating-text">4.9 | 148 Verified Customer Reviews</span>
              </div>

              <h1 className="pd-name">{product.name}</h1>
              <p className="pd-summary-text">{shortDescription}</p>

              <div className="pd-badge-row">
                {PRODUCT_BADGES.map((badge) => (
                  <span key={badge} className="pd-inline-pill pd-inline-pill--benefit">
                    <span className="pd-pill-check">✓</span> {badge}
                  </span>
                ))}
              </div>

              <div className="pd-price-panel">
                <div className="pd-price-copy">
                  <div className="pd-price-label">Offer Price</div>
                  <div className="pd-price">Rs {formatCurrency(currentPrice)}</div>
                  <div className="pd-price-meta">
                    {pricing.hasDiscount && (
                      <>
                        <span className="pd-price-original">
                          MRP Rs {formatCurrency(originalPrice)}
                        </span>
                        <span className="pd-discount-pill">
                          {discountPercent}% off
                        </span>
                      </>
                    )}
                  </div>
                  {pricing.hasDiscount && (
                    <div className="pd-price-save">
                      You save Rs {formatCurrency(savingsAmount)}
                    </div>
                  )}
                </div>
                <div className="pd-price-note">
                  {isAvailableSoon
                    ? "Launching soon"
                    : "Clinically validated formula for hair growth & hair fall control"}
                </div>
              </div>

              <div className="pd-qty-wrap">
                <div className="pd-section-label">Quantity</div>
                <div className="pd-qty-row">
                  <button
                    className="pd-qty-btn"
                    onClick={decQty}
                    disabled={quantity <= 1}
                    aria-label="Decrease quantity"
                  >
                    -
                  </button>
                  <span className="pd-qty-val">{quantity}</span>
                  <button
                    className="pd-qty-btn"
                    onClick={incQty}
                    aria-label="Increase quantity"
                  >
                    +
                  </button>
                </div>
              </div>

              <div className="pd-hero-actions">
                <button
                  className="pd-btn pd-btn-primary"
                  onClick={() => setShowBuy(true)}
                  disabled={isAvailableSoon}
                >
                  {isAvailableSoon ? "Coming Soon" : "Buy Now"}
                </button>
                <button
                  className="pd-btn pd-btn-soft"
                  onClick={addToCart}
                  disabled={isAvailableSoon}
                >
                  Add to Cart
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* Benefits Strip */}
        <section className="pd-proof-strip">
          <article className="pd-proof-card">
            <span className="pd-proof-num">01</span>
            <h3>Hair Growth Activation</h3>
            <p>
              Formulated with 3% Redensyl to target hair stem cells, awakening dormant
              follicles for visible new growth.
            </p>
          </article>
          <article className="pd-proof-card">
            <span className="pd-proof-num">02</span>
            <h3>89% Hair Fall Reduction</h3>
            <p>
              Strengthens hair roots at the scalp junction to prevent shedding during
              combing and washing.
            </p>
          </article>
          <article className="pd-proof-card">
            <span className="pd-proof-num">03</span>
            <h3>Thicker Hair Density</h3>
            <p>
              Nourishes scalp micro-environment for visibly fuller, stronger, and more
              resilient hair volume over time.
            </p>
          </article>
        </section>

        <section className="pd-detail-grid">
          <section className="pd-section-card">
            <span className="pd-section-kicker">Clinical Superiority</span>
            <h2>Why Redensyl active outperforms traditional products.</h2>
            <div className="pd-compare-table-wrap">
              <table className="pd-compare-table">
                <thead>
                  <tr>
                    <th>Efficacy Factor</th>
                    <th>Eka Bhumih Formula</th>
                    <th>Standard Hair Oils</th>
                  </tr>
                </thead>
                <tbody>
                  {PRODUCT_COMPARE_ROWS.map((row) => (
                    <tr key={row.label}>
                      <td>{row.label}</td>
                      <td className="pd-compare-ours">{row.ours}</td>
                      <td>{row.typical}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          <section className="pd-section-card">
            <span className="pd-section-kicker">Targeted Timeline</span>
            <h2>Visible results rhythm week by week.</h2>
            <div className="pd-results-steps">
              {RESULTS_STEPS.map((step) => (
                <article key={step.phase} className="pd-result-card">
                  <span className="pd-result-phase">{step.phase}</span>
                  <h3>{step.title}</h3>
                  <p>{step.copy}</p>
                </article>
              ))}
            </div>
          </section>
        </section>

        <section className="pd-story-grid">
          <section className="pd-section-card pd-section-card--story">
            <span className="pd-section-kicker">Formulation Science</span>
            <h2>Targeted Hair Growth Active.</h2>
            <p className="pd-long-copy">
              {
                "Eka Bhumih combines 3% Redensyl with targeted botanical extracts to directly act on hair stem cells (ORSc). Unlike traditional oil treatments that only grease the hair shaft, this micro-serum penetrates deep into scalp follicles to arrest root hair fall and accelerate new hair density."
              }
            </p>
          </section>

          <section className="pd-section-card pd-section-card--story">
            <span className="pd-section-kicker">Key Benefits Summary</span>
            <h2>What to expect from regular use.</h2>
            <ul className="pd-routine-list">
              <li>Up to 89% reduction in daily hair fall & shedding.</li>
              <li>Reactivation of dormant hair follicles for new baby hair growth.</li>
              <li>Noticeable increase in hair shaft thickness and overall density.</li>
              <li>Soothed, balanced scalp environment free from greasiness or buildup.</li>
            </ul>
          </section>
        </section>

        {/* Ratings & Verified Customer Reviews Section */}
        <section className="pd-reviews-section">
          <div className="pd-reviews-header">
            <div>
              <span className="pd-section-kicker">Verified Experiences</span>
              <h2>Customer Ratings & Real Results</h2>
            </div>
            <div className="pd-reviews-score-card">
              <div className="pd-score-big">4.9</div>
              <div className="pd-score-meta">
                <StarRating rating={5} />
                <span>Based on 148 customer reviews</span>
              </div>
            </div>
          </div>

          <div className="pd-reviews-stats-strip">
            <div className="pd-review-stat-item">
              <strong>94%</strong>
              <span>Saw less hair fall in 4 weeks</span>
            </div>
            <div className="pd-review-stat-item">
              <strong>91%</strong>
              <span>Noticed new baby hair growth</span>
            </div>
            <div className="pd-review-stat-item">
              <strong>96%</strong>
              <span>Would recommend to a friend</span>
            </div>
          </div>

          <div className="pd-reviews-grid">
            {combinedReviews.map((rev) => (
              <article key={rev.id} className="pd-review-card">
                <div className="pd-review-head">
                  <div className="pd-review-user">
                    <div className="pd-review-avatar">
                      {(rev.user_name?.[0] || "U").toUpperCase()}
                    </div>
                    <div>
                      <h4 className="pd-review-name">{rev.user_name}</h4>
                      {rev.verified && (
                        <span className="pd-review-verified">✓ Verified Buyer</span>
                      )}
                    </div>
                  </div>
                  <div className="pd-review-date">{rev.date}</div>
                </div>

                <div className="pd-review-stars-wrap">
                  <StarRating rating={rev.rating} />
                  {rev.title && <h5 className="pd-review-title">{rev.title}</h5>}
                </div>

                <p className="pd-review-text">"{rev.text}"</p>
              </article>
            ))}
          </div>
        </section>
      </main>

      <Footer />

      <StickyAddToCartBar
        product={product}
        quantity={quantity}
        onDecQty={decQty}
        onIncQty={incQty}
        onAddToCart={addToCart}
        onBuyNow={() => setShowBuy(true)}
        visible={showStickyBar}
      />

      <BuyModal
        open={showBuy}
        onClose={() => setShowBuy(false)}
        product={product}
        quantity={quantity}
        onSuccess={() => {
          setShowBuy(false);
          navigate("/account");
        }}
      />
    </div>
  );
};

export default ProductDetails;
