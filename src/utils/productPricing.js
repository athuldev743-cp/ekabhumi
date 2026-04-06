const DEFAULT_DISCOUNT_RATE = 0.16;

// Demo prices shown when backend provides no price data
const DEMO_BASE_PRICE = 699;
const DEMO_OFFER_PRICE = 499;

const toNumber = (value) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
};

const roundToNearestTen = (value) => Math.max(0, Math.round(value / 10) * 10);

function buildResult(basePrice, offerPrice) {
  const savings = Math.max(0, basePrice - offerPrice);
  const discountPercent =
    basePrice > offerPrice && basePrice > 0
      ? Math.round((savings / basePrice) * 100)
      : 0;
  return { basePrice, offerPrice, savings, discountPercent, hasDiscount: discountPercent > 0 };
}

export function getProductPricing(product) {
  const price = toNumber(product?.price);
  const sellingPrice = toNumber(product?.selling_price);

  // Both price (MRP) and selling_price available from backend → use directly
  if (price > 0 && sellingPrice > 0) {
    const offerPrice = sellingPrice < price ? sellingPrice : price;
    return buildResult(price, offerPrice);
  }

  // Only price available → derive offer via default discount
  if (price > 0) {
    const derived = roundToNearestTen(price * (1 - DEFAULT_DISCOUNT_RATE));
    const offerPrice = derived > 0 && derived < price ? derived : price;
    return buildResult(price, offerPrice);
  }

  // No backend price → demo prices
  return buildResult(DEMO_BASE_PRICE, DEMO_OFFER_PRICE);
}

export function formatCurrency(value) {
  return toNumber(value).toLocaleString("en-IN");
}
