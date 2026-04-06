import { useEffect, useMemo, useState } from "react";
import styles from "./Dashboard.module.css";
import { formatCurrency } from "../utils/productPricing";

export default function UpdateProduct({
  product,
  onCancel,
  onSubmit,
  setError,
}) {
  const initial = useMemo(
    () => ({
      id: product?.id,
      name: product?.name || "",
      price: product?.price ?? "",
      original_price: product?.original_price ?? "",
      description: product?.description || "",
      priority: product?.priority ?? 2,
      quantity: product?.quantity ?? 0,
      image_url: product?.image_url || "",
    }),
    [product]
  );

  const [form, setForm] = useState(initial);
  const [imageFile, setImageFile] = useState(null);
  const [preview, setPreview] = useState(product?.image_url || "");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setForm(initial);
    setImageFile(null);
    setPreview(product?.image_url || "");
  }, [initial, product]);

  const onChange = (key) => (e) => {
    const val = e.target.value;
    if (["price", "original_price", "quantity"].includes(key)) {
      setForm((p) => ({
        ...p,
        [key]: val === "" ? "" : Number(val),
      }));
    } else {
      setForm((p) => ({ ...p, [key]: val }));
    }
  };

  const onPickImage = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImageFile(file);
    setPreview(URL.createObjectURL(file));
  };

  const isFeatured = form.priority === 1;

  const toggleFeatured = () =>
    setForm((p) => ({
      ...p,
      priority: isFeatured ? 2 : 1,
    }));

  const validate = () => {
    if (!form.name.trim()) return "Name is required";
    if (!form.price || form.price <= 0) return "Valid selling price is required";
    if (form.original_price && form.original_price < form.price)
      return "MRP must be greater than selling price";
    if (form.quantity < 0) return "Quantity cannot be negative";
    if (!form.description.trim()) return "Description required";
    return "";
  };

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    const msg = validate();
    if (msg) return setError(msg);
    setSaving(true);
    try {
      // ✅ Ensure original_price is sent as a string for the backend to parse correctly
      await onSubmit({
        ...form,
        name: form.name.trim(),
        original_price: form.original_price === "" ? "" : String(form.original_price),
        imageFile: imageFile || null,
      });
    } catch (err) {
      setError(err.message || "Failed to update product");
    } finally {
      setSaving(false);
    }
  };

  // FIX: use strict null/empty check so discount only shows when both values are valid
  const hasDiscount =
    form.original_price !== "" &&
    form.original_price !== null &&
    form.original_price !== undefined &&
    Number(form.original_price) > 0 &&
    Number(form.original_price) > Number(form.price);

  const discount = hasDiscount
    ? Math.round(
        ((Number(form.original_price) - Number(form.price)) /
          Number(form.original_price)) *
          100
      )
    : 0;

  return (
    <div className={styles.updateWrap}>
      <div className={styles.updateGrid}>
        {/* Preview */}
        <div className={styles.updatePreviewCard}>
          <div className={styles.updatePreviewTitle}>Preview</div>

          <div className={styles.updatePreviewImage}>
            {preview ? (
              <img src={preview} alt="Preview" />
            ) : (
              <div className={styles.noImage}>No Image</div>
            )}
          </div>

          <label className={styles.fileBtn}>
            Change Image
            <input type="file" accept="image/*" onChange={onPickImage} />
          </label>

          <div className={styles.previewMeta}>
            <div className={styles.previewName}>{form.name || "Product name"}</div>

            <div className={styles.previewSub}>Qty: {form.quantity}</div>

            {/* FIX: use formatCurrency for Indian locale formatting, consistent ₹ symbol */}
            <div>
              ₹{formatCurrency(form.price || 0)}
              {hasDiscount && (
                <span style={{ textDecoration: "line-through", marginLeft: 6 }}>
                  ₹{formatCurrency(form.original_price)}
                </span>
              )}
            </div>

            {discount > 0 && (
              <div style={{ color: "green", fontWeight: 600 }}>{discount}% OFF</div>
            )}
          </div>
        </div>

        {/* Form */}
        <form className={styles.updateFormCard} onSubmit={submit}>
          <div className={styles.formTitle}>Update Product</div>

          <div className={styles.field}>
            <label>Name</label>
            <input value={form.name} onChange={onChange("name")} />
          </div>

          {/* Price Row */}
          <div className={styles.formRow}>
            <div className={styles.field}>
              <label>Selling Price (₹)</label>
              <input type="number" value={form.price} onChange={onChange("price")} />
            </div>

            <div className={styles.field}>
              <label>MRP (₹)</label>
              <input
                type="number"
                value={form.original_price}
                onChange={onChange("original_price")}
              />
            </div>
          </div>

          <div className={styles.formRow}>
            <div className={styles.field}>
              <label>Quantity</label>
              <input
                type="number"
                value={form.quantity}
                onChange={onChange("quantity")}
              />
            </div>

            <div className={styles.field}>
              <label>Featured</label>
              <div onClick={toggleFeatured} style={{ cursor: "pointer", marginTop: 6 }}>
                {isFeatured ? "Yes" : "No"}
              </div>
            </div>
          </div>

          <div className={styles.field}>
            <label>Description</label>
            <textarea
              value={form.description}
              onChange={onChange("description")}
              rows={5}
            />
          </div>

          <div className={styles.formActions}>
            <button type="button" onClick={onCancel} disabled={saving}>
              Cancel
            </button>
            <button type="submit" disabled={saving}>
              {saving ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
