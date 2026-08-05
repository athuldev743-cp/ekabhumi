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

const ACCORDION_DATA = [
  {
    id: "desc",
    title: "Product description",
    content:
      "Eka Bhumih 3% Redensyl Hair Growth Serum is a clinically validated micro-formula designed to halt hair fall and stimulate dormant follicle stem cells (ORSc). Unlike traditional hair oils that merely grease the hair shaft, this lightweight water-based serum penetrates deep into scalp micro-layers to reactivate dormant hair stem cells and accelerate new baby hair growth.",
  },
  {
    id: "ingredients",
    title: "Key Active Ingredients",
    content:
      "3% Redensyl (DHQG + EGCG2 active polyphenols), Anagain (Organic Pea Sprout Extract), Saw Palmetto Extract, Biotin, Niacinamide (Vitamin B3), Plant Keratin, and Pure Rosemary Leaf Extract.",
  },
  {
    id: "howtouse",
    title: "How to use",
    content:
      "Apply 1 to 2 ml (one full dropper) directly onto clean, dry scalp areas experiencing thinning or hair fall. Gently massage into hair roots with fingertips for 2-3 minutes. Leave on overnight or for at least 4 hours before washing. Use daily for consistent results.",
  },
  {
    id: "suitable",
    title: "Suitable for",
    active: true,
    content:
      "Suitable for all hair types (straight, wavy, curly, coily) and all scalp types. Highly recommended for men and women suffering from hair fall, thinning hairline, crown volume loss, or stress-induced shedding.",
  },
  {
    id: "full_list",
    title: "Full Ingredients List",
    content:
      "Aqua, Redensyl (Glycerin, Sodium Metabisulfite, Larix Europaea Wood Extract, Glycine, Zinc Chloride, Camellia Sinensis Leaf Extract), Pisum Sativum (Pea) Sprout Extract, Serenoa Serrulata (Saw Palmetto) Fruit Extract, Biotin, Niacinamide, Hydrolyzed Wheat Protein, Rosmarinus Officinalis (Rosemary) Leaf Extract, Phenoxyethanol, Ethylhexylglycerin.",
  },
  {
    id: "faq",
    title: "FAQ",
    isFaq: true,
    faqs: [
      {
        q: "How quickly does 3% Redensyl show visible hair fall control?",
        a: "Most users notice a dramatic reduction in hair shedding during washing and combing within 3-4 weeks. Visible baby hair growth and increased density appear around 8-12 weeks of daily use.",
      },
      {
        q: "Is Redensyl safe for daily application on sensitive scalp?",
        a: "Yes! Redensyl is a plant-derived, non-hormonal active ingredient clinically proven to be non-irritating and free of side effects.",
      },
      {
        q: "Does Eka Bhumih Redensyl Serum feel sticky or greasy?",
        a: "No, it features a fast-absorbing, non-greasy micro-serum texture that leaves no heavy residue, making it ideal for overnight or daytime application.",
      },
    ],
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
    user_name: "Dhiraj Kumar",
    rating: 5,
    date: "06/28/2026",
    verified: true,
    title: "Best product...",
    text: "Best product for hair fall control and root activation. High quality and visible results within a month.",
  },
];

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

  // Accordions State
  const [openAccordions, setOpenAccordions] = useState({
    desc: true,
    suitable: true,
    faq: true,
  });

  const toggleAccordion = (accId) => {
    setOpenAccordions((prev) => ({
      ...prev,
      [accId]: !prev[accId],
    }));
  };

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
  const currentPrice = pricing.offerPrice || 419;
  const originalPrice = pricing.basePrice || 599;
  const discountPercent = pricing.discountPercent || 30;

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
    e.target.src = "/images/redensyl-productimg.png";
  };

  const isAvailableSoon = Number(product?.quantity ?? 1) <= 0;

  const galleryImages = useMemo(() => {
    return [
      product?.image_url || "/images/redensyl-productimg.png",
      "/images/redensyl-hero.png",
      "/images/redensyl-productimg.png",
    ].filter(Boolean).slice(0, 4);
  }, [product]);

  const shortDescription = useMemo(() => {
    return "Powered by 3% Redensyl + Anagain to target root cause of hair fall, reactivate dormant stem cells, and boost hair density within 8-12 weeks.";
  }, []);

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
    setSelectedImage(galleryImages[0] || "/images/redensyl-productimg.png");
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
      <PublicNavbar />

      <main className="pd-main">
        {/* Breadcrumb Navigation matching Image 3 */}
        <nav className="pd-breadcrumb" aria-label="Breadcrumb">
          <a href="/" onClick={(e) => { e.preventDefault(); navigate("/"); }}>Home</a>
          <span className="pd-breadcrumb-sep">&gt;</span>
          <a href="/#products" onClick={(e) => { e.preventDefault(); navigate("/#products"); }}>All products</a>
          <span className="pd-breadcrumb-sep">&gt;</span>
          <span className="pd-breadcrumb-current">{product.name}</span>
        </nav>

        {/* Hero Product Detail Section */}
        <section className="pd-hero">
          <div className="pd-hero-media">
            <div className="pd-image-card">
              <span className="pd-badge-bestseller">Best Seller</span>
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
                <div className="pd-gallery-strip">
                  {galleryImages.map((image, index) => (
                    <button
                      key={`${image}-${index}`}
                      type="button"
                      className={`pd-gallery-thumb ${
                        selectedImage === image ? "is-active" : ""
                      }`}
                      onClick={() => setSelectedImage(image)}
                    >
                      <img
                        src={image}
                        alt={`${product.name} view ${index + 1}`}
                        className="pd-gallery-thumb-img"
                        onError={handleImageError}
                      />
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="pd-hero-copy">
            <div className="pd-copy-card">
              {/* Product Title */}
              <h1 className="pd-name">{product.name}</h1>

              {/* Rating Row with Blue Reviews Link */}
              <div className="pd-hero-rating-head">
                <StarRating rating={5} />
                <span className="pd-rating-num">5.0</span>
                <span className="pd-rating-divider">|</span>
                <a href="#reviews-section" className="pd-rating-link">148 Reviews</a>
              </div>

              {/* Green Benefit Pills */}
              <div className="pd-badge-row">
                {PRODUCT_BADGES.map((badge) => (
                  <span key={badge} className="pd-inline-pill pd-inline-pill--green">
                    <span className="pd-pill-check">✓</span> {badge}
                  </span>
                ))}
              </div>

              <div className="pd-net-content">
                Net content: <strong>50g (USP: ₹8.38/g)</strong>
              </div>

              {/* Price Display Matching Image 3 */}
              <div className="pd-price-display">
                <span className="pd-price-currency">₹</span>
                <span className="pd-price-val">{formatCurrency(currentPrice)}</span>
                <span className="pd-price-mrp">M.R.P. ₹{formatCurrency(originalPrice)}</span>
                <span className="pd-price-discount">{discountPercent}% off</span>
                <span className="pd-price-tax">Incl. of all taxes</span>
              </div>

              <p className="pd-summary-text">{shortDescription}</p>

              <div className="pd-qty-wrap">
                <div className="pd-section-label">Select Quantity</div>
                <div className="pd-qty-row">
                  <button className="pd-qty-btn" onClick={decQty} disabled={quantity <= 1}>-</button>
                  <span className="pd-qty-val">{quantity}</span>
                  <button className="pd-qty-btn" onClick={incQty}>+</button>
                </div>
              </div>

              <div className="pd-hero-actions">
                <button
                  className="pd-btn pd-btn-primary"
                  onClick={() => setShowBuy(true)}
                  disabled={isAvailableSoon}
                >
                  Buy Now
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

        {/* Results of 3% Redensyl Active Treatment Section (Matching Image 2 Layout) */}
        <section className="pd-results-section">
          <h2 className="pd-section-title-center">
            Results of Eka Bhumih 3% Redensyl Active Treatment
          </h2>

          <div className="pd-results-grid-cards">
            <div className="pd-result-green-card">
              <div className="pd-result-card-imgwrap">
                <img src="/images/redensyl-hero.png" alt="Reactivates Hair Stem Cells" onError={handleImageError} />
              </div>
              <h3 className="pd-result-green-title">Reactivates Hair Stem Cells</h3>
              <p className="pd-result-green-desc">
                3% Redensyl directly targets outer root sheath stem cells (ORSc), reviving dormant follicles to initiate the hair growth phase.
              </p>
            </div>

            <div className="pd-result-green-card">
              <div className="pd-result-card-imgwrap">
                <img src="/images/redensyl-productimg.png" alt="Anchors Roots & Stops Shedding" onError={handleImageError} />
              </div>
              <h3 className="pd-result-green-title">Anchors Roots & Stops Shedding</h3>
              <p className="pd-result-green-desc">
                Strengthens follicle dermal papilla cells to reduce hair fall during combing and washing by up to 89% in 4 weeks.
              </p>
            </div>

            <div className="pd-result-green-card">
              <div className="pd-result-card-imgwrap">
                <img src="/images/redensyl-hero.png" alt="Visible Hair Density & Volume" onError={handleImageError} />
              </div>
              <h3 className="pd-result-green-title">Visible Hair Density & Volume</h3>
              <p className="pd-result-green-desc">
                Nourishes scalp micro-environment for visible new baby hair sprouting along hairline & crown in 8-12 weeks.
              </p>
            </div>
          </div>

          {/* 3 Text Columns Under Results (Matching Image 1 Layout) */}
          <div className="pd-results-3col-text">
            <div className="pd-3col-item">
              3% Redensyl Active, in combination with Anagain, reduces hair fall, reactivates dormant stem cells, and makes hair healthy from root to tip.
            </div>
            <div className="pd-3col-item">
              Full of nature's clinical goodness, a blend of nourishing botanical extracts makes hair roots strong from inside & shinier on the outside.
            </div>
            <div className="pd-3col-item">
              Saw Palmetto & Biotin nourish the scalp micro-environment. Rich in essential nutrition, they keep hair healthier and stronger over time.
            </div>
          </div>
        </section>

        {/* Expandable Accordion List Section (Matching Image 1 & 4 Layout) */}
        <section className="pd-accordions-section">
          {ACCORDION_DATA.map((acc) => {
            const isOpen = !!openAccordions[acc.id];
            return (
              <div key={acc.id} className="pd-accordion-item">
                <button
                  type="button"
                  className={`pd-accordion-header ${acc.active ? "pd-accordion-header--active" : ""}`}
                  onClick={() => toggleAccordion(acc.id)}
                  aria-expanded={isOpen}
                >
                  <span className="pd-accordion-title">{acc.title}</span>
                  <span className="pd-accordion-icon">{isOpen ? "▲" : "▼"}</span>
                </button>

                {isOpen && (
                  <div className="pd-accordion-body">
                    {acc.isFaq ? (
                      <div className="pd-faq-list">
                        {acc.faqs.map((faq, fIdx) => (
                          <div key={fIdx} className="pd-faq-item">
                            <h4 className="pd-faq-q">{faq.q}</h4>
                            <p className="pd-faq-a">{faq.a}</p>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="pd-accordion-text">{acc.content}</p>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </section>

        {/* Customer Reviews & Rating Breakdown Section (Matching Image 4 Layout) */}
        <section id="reviews-section" className="pd-reviews-section">
          <h2 className="pd-section-title-center">Customer Reviews</h2>

          <div className="pd-reviews-breakdown-card">
            {/* Left Score Column */}
            <div className="pd-breakdown-left">
              <div className="pd-score-stars"><StarRating rating={5} /></div>
              <div className="pd-score-num-text"><strong>4.95</strong> out of 5</div>
              <div className="pd-score-based">Based on 148 reviews</div>
            </div>

            {/* Middle Progress Bars Column */}
            <div className="pd-breakdown-bars">
              {[
                { stars: "★★★★★", count: 144, pct: 97 },
                { stars: "★★★★☆", count: 3, pct: 2 },
                { stars: "★★★☆☆", count: 0, pct: 0 },
                { stars: "★★☆☆☆", count: 0, pct: 0 },
                { stars: "★☆☆☆☆", count: 1, pct: 1 },
              ].map((b, idx) => (
                <div key={idx} className="pd-bar-row">
                  <span className="pd-bar-stars">{b.stars}</span>
                  <div className="pd-bar-track">
                    <div className="pd-bar-fill" style={{ width: `${b.pct}%` }} />
                  </div>
                  <span className="pd-bar-count">{b.count}</span>
                </div>
              ))}
            </div>

            {/* Right Write Review Column */}
            <div className="pd-breakdown-right">
              <button
                type="button"
                className="pd-write-review-btn"
                onClick={() => alert("Review submission form opened")}
              >
                Write a review
              </button>
            </div>
          </div>

          <div className="pd-reviews-filter-bar">
            <span className="pd-filter-dropdown">Most Recent ∨</span>
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

