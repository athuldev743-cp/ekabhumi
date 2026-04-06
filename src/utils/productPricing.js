const toNumber = (value) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
};

const firstPositive = (...values) => values.map(toNumber).find((n) => n > 0) || 0;

function buildResult(basePrice, offerPrice, discountOverride = 0) {
  const normalizedBasePrice = Math.max(0, toNumber(basePrice));
  const normalizedOfferPrice = Math.max(0, toNumber(offerPrice));
  const effectiveOfferPrice =
    normalizedBasePrice > 0 && (normalizedOfferPrice <= 0 || normalizedOfferPrice > normalizedBasePrice)
      ? normalizedBasePrice
      : normalizedOfferPrice;

  const savings = Math.max(0, normalizedBasePrice - effectiveOfferPrice);
  const hasDiscount = normalizedBasePrice > effectiveOfferPrice;
  const override = Math.round(toNumber(discountOverride));
  const computedDiscountPercent =
    hasDiscount && normalizedBasePrice > 0
      ? Math.round((savings / normalizedBasePrice) * 100)
      : 0;
  const discountPercent =
    hasDiscount
      ? (override > 0 ? override : computedDiscountPercent)
      : 0;

  return {
    basePrice: normalizedBasePrice,
    offerPrice: effectiveOfferPrice,
    savings,
    discountPercent,
    hasDiscount,
  };
}

export function getProductPricing(product) {
  const price = toNumber(product?.price);
  const originalPrice = firstPositive(product?.original_price, product?.mrp, product?.base_price);
  const offerPrice = firstPositive(
    product?.offer_price,
    product?.selling_price,
    product?.sale_price,
    product?.discounted_price
  );
  const discountPercent = firstPositive(
    product?.discount_percent,
    product?.discountPercentage,
    product?.discount
  );

  // Explicit MRP + explicit offer/selling price from backend.
  if (originalPrice > 0 && offerPrice > 0) {
    return buildResult(originalPrice, offerPrice, discountPercent);
  }

  // price (MRP) + explicit offer/selling price.
  if (price > 0 && offerPrice > 0) {
    return buildResult(price, offerPrice, discountPercent);
  }

  // original_price behaves as MRP while price behaves as selling price.
  if (originalPrice > 0 && price > 0) {
    return buildResult(originalPrice, price, discountPercent);
  }

  // Single backend price available, no fabricated discount.
  if (price > 0) {
    return buildResult(price, price, discountPercent);
  }

  if (originalPrice > 0) {
    return buildResult(originalPrice, originalPrice, discountPercent);
  }

  return buildResult(0, 0, 0);
}

export function formatCurrency(value) {
  return toNumber(value).toLocaleString("en-IN");
}
