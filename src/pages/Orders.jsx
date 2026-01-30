import "./Orders.css";

function Orders({ orders = [], onViewDetails, onApprove }) {
  if (!orders.length) {
    return (
      <div className="ordersEmptyState">
        <div className="ordersEmptyIcon">📝</div>
        <h3>No Orders Yet</h3>
        <p>Orders will appear here when customers place orders.</p>
      </div>
    );
  }

  return (
    <div className="ordersList">
      {orders.map((o) => (
        <div key={o.id} className="orderCard">
          <div className="orderHeader">
            <h3>Order #{o.id}</h3>
            <span
              className={`statusBadge ${
                o.status === "confirmed" ? "statusCompleted" : "statusPending"
              }`}
            >
              {o.status}
            </span>
          </div>

          <div className="orderDetails">
            {o.customer_email && (
              <p>
                <strong>Customer:</strong> {o.customer_email}
              </p>
            )}

            <p>
              <strong>Total:</strong> ₹{parseFloat(o.total_amount || 0).toFixed(2)}
            </p>

            {o.order_date && (
              <p>
                <strong>Date:</strong> {new Date(o.order_date).toLocaleDateString()}
              </p>
            )}
          </div>

          <div className="orderActions">
            <button
              className="viewBtn"
              type="button"
              onClick={() => onViewDetails?.(o)}
            >
              View Details
            </button>

            {o.status === "pending" && (
              <button
                className="completeBtn"
                type="button"
                onClick={() => onApprove?.(o.id)}
              >
                Approve & Send Email
              </button>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}

export default Orders;
