import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { fetchProductById, createOrder } from "../api/publicAPI";

function Order() {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [form, setForm] = useState({
    name: "",
    phone: "",
    address: "",
  });

  useEffect(() => {
    fetchProductById(id).then(setProduct);
  }, [id]);

  const submitOrder = async (e) => {
    e.preventDefault();
    await createOrder({
      product_id: id,
      ...form,
    });
    alert("Order placed successfully!");
  };

  if (!product) return <p>Loading...</p>;

  return (
    <div style={{ padding: 40 }}>
      <h2>Confirm Order</h2>
      <p><b>{product.name}</b> – ₹{product.price}</p>

      <form onSubmit={submitOrder}>
        <input
          placeholder="Full Name"
          required
          onChange={(e) => setForm({ ...form, name: e.target.value })}
        />
        <input
          placeholder="Phone Number"
          required
          onChange={(e) => setForm({ ...form, phone: e.target.value })}
        />
        <textarea
          placeholder="Delivery Address"
          required
          onChange={(e) => setForm({ ...form, address: e.target.value })}
        />
        <button type="submit">Place Order</button>
      </form>

      <p>💳 Payments will be added later</p>
    </div>
  );
}

export default Order;
