import { useEffect, useState, useCallback } from "react";
import {
  createProduct,
  getProducts,
  deleteProduct,
  getOrders
} from "../api/adminAPI";

function AdminDashboard() {
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const token = localStorage.getItem("adminToken");

  const fetchProducts = useCallback(async () => {
    const data = await getProducts(token);
    setProducts(data);
  }, [token]);

  const fetchOrders = useCallback(async () => {
    const data = await getOrders(token);
    setOrders(data);
  }, [token]);

  useEffect(() => {
    fetchProducts();
    fetchOrders();
  }, [fetchProducts, fetchOrders]);

  const handleDelete = async (id) => {
    if (window.confirm("Delete product?")) {
      await deleteProduct(id, token);
      fetchProducts();
    }
  };

  const logout = () => {
    localStorage.removeItem("adminToken");
    window.location.href = "/";
  };

  return (
    <div style={{ padding: 40 }}>
      <h1>Admin Dashboard</h1>
      <button onClick={logout}>Logout</button>

      <h2>Products</h2>
      <ul>
        {products.map(p => (
          <li key={p.id}>
            <b>{p.name}</b> - ₹{p.price}
            <button onClick={() => handleDelete(p.id)}>Delete</button>
          </li>
        ))}
      </ul>

      <h2>Orders</h2>
      <ul>
        {orders.map(o => (
          <li key={o.id}>
            {o.customer_email} | {o.status} | ₹{o.total}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default AdminDashboard;
