import React, { useState, useMemo } from "react";
import "./StickyAddToCartBar.css";
import { formatCurrency, getProductPricing } from "../utils/productPricing";

const API_BASE = process.env.REACT_APP_API_URL || "https://ekb-backend.onrender.com";

const resolveImg = (product) => {
  if (!product?.image_url) return "https://placehold.co/100x100/EDF5EF/1B4332?text=Product";
  return product.image_url.startsWith("http") ? product.image_url : `${API_BASE}${product.image_url}`;
};

const StickyAddToCartBar = ({
  product,
  quantity = 1,
  onDecQty,
  onIncQty,
  onAddToCart,
  onBuyNow,
  onViewProduct,
  visible = true,
}) => {
  const [toastMessage, setToastMessage] = useState("");

  const pricing = useMemo(() => getProductPricing(product), [product]);
  const unitPrice = pricing.offerPrice || 0;
  const totalPrice = unitPrice * quantity;
  const isAvailableSoon = Number(product?.quantity ?? 0) <= 0;

  if (!product || !visible) return null;

  const handleAddToCart = (e) => {
    e?.stopPropagation();
    if (isAvailableSoon) return;

    if (onAddToCart) {
      onAddToCart(product, quantity);
    } else {
      // Default fallback cart implementation
      try {
        const cart = JSON.parse(localStorage.getItem("cart") || "[]");
        const existingIndex = cart.findIndex((x) => String(x.id) === String(product.id));
        if (existingIndex >= 0) {
          cart[existingIndex].qty = Number(cart[existingIndex].qty || 1) + quantity;
        } else {
          cart.push({
            id: product.id,
            name: product.name,
            price: unitPrice,
            original_price: pricing.basePrice,
            image_url: product.image_url,
            qty: quantity,
          });
        }
        localStorage.setItem("cart", JSON.stringify(cart));
        window.dispatchEvent(new Event("cart:updated"));
      } catch (err) {
        console.error("Failed updating cart", err);
      }
    }

    setToastMessage("Added to cart!");
    setTimeout(() => {
      setToastMessage("");
    }, 2400);
  };

  const handleBuyNow = (e) => {
    e?.stopPropagation();
    if (isAvailableSoon) return;
    if (onBuyNow) {
      onBuyNow(product, quantity);
    }
  };

  return (
    <>
      {toastMessage && (
        <div className="sticky-cart-toast">
          <span className="sticky-cart-toast-icon">✓</span>
          <span>{toastMessage}</span>
        </div>
      )}

      <div className={`sticky-cart-bar ${visible ? "is-visible" : ""}`}>
        <div className="sticky-cart-container">
          {/* Left product details */}
          <div
            className="sticky-cart-product"
            onClick={onViewProduct ? () => onViewProduct(product) : undefined}
            role={onViewProduct ? "button" : undefined}
            tabIndex={onViewProduct ? 0 : undefined}
          >
            <div className="sticky-cart-thumb-wrap">
              <img
                src={resolveImg(product)}
                alt={product.name}
                className="sticky-cart-thumb"
                onError={(e) => {
                  e.currentTarget.onerror = null;
                  e.currentTarget.src = "https://placehold.co/100x100/EDF5EF/1B4332?text=Product";
                }}
              />
            </div>
            <div className="sticky-cart-info">
              <h4 className="sticky-cart-name">{product.name}</h4>
              <div className="sticky-cart-meta">
                {pricing.hasDiscount && (
                  <span className="sticky-cart-save-tag">
                    {pricing.discountPercent}% OFF
                  </span>
                )}
                <span className="sticky-cart-price-single">
                  ₹{formatCurrency(unitPrice)}
                </span>
              </div>
            </div>
          </div>

          {/* Right action controls */}
          <div className="sticky-cart-actions">
            {/* Optional quantity stepper if handlers provided */}
            {onDecQty && onIncQty && (
              <div className="sticky-cart-qty">
                <button
                  type="button"
                  className="sticky-qty-btn"
                  onClick={onDecQty}
                  disabled={quantity <= 1}
                  aria-label="Decrease quantity"
                >
                  −
                </button>
                <span className="sticky-qty-val">{quantity}</span>
                <button
                  type="button"
                  className="sticky-qty-btn"
                  onClick={onIncQty}
                  aria-label="Increase quantity"
                >
                  +
                </button>
              </div>
            )}

            {onBuyNow && !isAvailableSoon && (
              <button
                type="button"
                className="sticky-cart-btn sticky-cart-btn--buy"
                onClick={handleBuyNow}
              >
                Buy Now
              </button>
            )}

            <button
              type="button"
              className="sticky-cart-btn sticky-cart-btn--add"
              onClick={handleAddToCart}
              disabled={isAvailableSoon}
            >
              {isAvailableSoon
                ? "Coming Soon"
                : `Add to cart - ₹${formatCurrency(totalPrice)}`}
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default StickyAddToCartBar;
