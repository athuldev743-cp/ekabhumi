import styles from "./Dashboard.module.css";

function AddProduct({
  showAddForm,
  setShowAddForm,
  newProduct,
  setNewProduct,
  handleAddProduct,
  setError,
}) {
  if (!showAddForm) return null;

  return (
    <div className={styles.addFormContainer}>
      <h3>Add New Product</h3>

      <form onSubmit={handleAddProduct}>
        <div className={styles.formGroup}>
          <label>Product Name *</label>
          <input
            type="text"
            name="name"
            placeholder="Enter product name"
            value={newProduct.name}
            onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })}
            required
          />
        </div>

        <div className={styles.formGroup}>
          <label>Price (₹) *</label>
          <input
            type="number"
            name="price"
            placeholder="Enter price"
            value={newProduct.price}
            onChange={(e) => setNewProduct({ ...newProduct, price: e.target.value })}
            required
            min="1"
            step="0.01"
          />
        </div>

        <div className={styles.formGroup}>
          <label>Description *</label>
          <textarea
            name="description"
            placeholder="Enter product description"
            value={newProduct.description}
            onChange={(e) =>
              setNewProduct({ ...newProduct, description: e.target.value })
            }
            required
            rows={3}
          />
        </div>

        <div className={styles.formGroup}>
          <label>Priority (1 = highest) *</label>
          <input
            type="number"
            name="priority"
            placeholder="Enter priority"
            value={newProduct.priority}
            onChange={(e) =>
              setNewProduct({ ...newProduct, priority: e.target.value })
            }
            required
            min="1"
          />
        </div>

        <div className={styles.formGroup}>
          <label>Product Image *</label>
          <input
            type="file"
            accept="image/*"
            onChange={(e) => {
              if (e.target.files && e.target.files[0]) {
                setNewProduct({ ...newProduct, image: e.target.files[0] });
              }
            }}
            required
          />
          <small>Select a product image (JPEG, PNG, etc.)</small>

          {newProduct.image && (
            <div className={styles.filePreview}>Selected: {newProduct.image.name}</div>
          )}
        </div>

        <div className={styles.formButtons}>
          <button type="submit" className={styles.submitBtn}>
            Add Product
          </button>

          <button
            type="button"
            className={styles.cancelBtn}
            onClick={() => {
              setShowAddForm(false);
              setError("");
            }}
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}

export default AddProduct;
