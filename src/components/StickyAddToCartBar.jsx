import React, { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import "./StickyAddToCartBar.css";
import { formatCurrency, getProductPricing } from "../utils/productPricing";

const API_BASE = process.env.REACT_APP_API_URL || "https://ekb-backend.onrender.com";

const resolveImg = (product) => {
  if (!product?.image_url) return "/images/redensyl-productimg.png";
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
  const navigate = useNavigate();
  const [toastMessage, setToastMessage] = useState("");

  const pricing = useMemo(() => getProductPricing(product), [product]);
  const unitPrice = pricing.offerPrice || 419;
  const totalPrice = unitPrice * quantity;
  const isAvailableSoon = Number(product?.quantity ?? 1) <= 0;

  if (!product || !visible) return null;

  const handleAddToCart = (e) => {
    e?.stopPropagation();
    if (isAvailableSoon) return;

    if (onAddToCart) {
      onAddToCart(product, quantity);
    } else {
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
    } else if (product?.id) {
      navigate(`/product/${product.id}`);
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
            onClick={onViewProduct ? () => onViewProduct(product) : () => navigate(`/product/${product.id}`)}
            role="button"
            tabIndex={0}
          >
            <div className="sticky-cart-thumb-wrap">
              <img
                src={resolveImg(product)}
                alt={product.name}
                className="sticky-cart-thumb"
                onError={(e) => {
                  e.currentTarget.onerror = null;
                  e.currentTarget.src = "/images/redensyl-productimg.png";
                }}
              />
            </div>
            <div className="sticky-cart-info">
              <h4 className="sticky-cart-name">{product.name}</h4>
            </div>
          </div>

          {/* Right action controls: 2 buttons Buy Now and Add to Cart */}
          <div className="sticky-cart-actions">
            <button
              type="button"
              className="sticky-cart-btn sticky-cart-btn--buy"
              onClick={handleBuyNow}
              disabled={isAvailableSoon}
            >
              Buy Now
            </button>

            <button
              type="button"
              className="sticky-cart-btn sticky-cart-btn--cyan"
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
