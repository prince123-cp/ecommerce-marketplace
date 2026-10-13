import { useEffect, useState } from "react";
import api from "../services/api";

const flow = ["placed", "packed", "shipped", "delivered"];

const statusColors = {
  placed: "#555",
  packed: "#b8860b",
  shipped: "#1e6fd9",
  delivered: "green",
  cancelled: "red",
};

function SellerOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    api
      .get("/seller/orders")
      .then(({ data }) => setOrders(data))
      .catch(() => setError("Could not load orders"))
      .finally(() => setLoading(false));
  }, []);

  const changeStatus = async (orderId, status) => {
    setError("");
    try {
      // The backend returns the updated seller sub-order
      const { data } = await api.put(`/seller/orders/${orderId}/status`, { status });
      setOrders(orders.map((o) => (o._id === orderId ? { ...o, sellerOrder: data } : o)));
    } catch (err) {
      setError(err.response?.data?.message || "Could not update status");
    }
  };

  const handleCancel = (orderId) => {
    if (window.confirm("Cancel this order? The stock will be added back.")) {
      changeStatus(orderId, "cancelled");
    }
  };

  if (loading) return <p style={{ padding: 20 }}>Loading...</p>;

  return (
    <div style={{ padding: 20, maxWidth: 800, margin: "0 auto" }}>
      <h2>Orders</h2>
      {error && <p style={{ color: "red" }}>{error}</p>}
      {orders.length === 0 && <p>No orders yet.</p>}

      {orders.map((order) => {
        const { sellerOrder: so, shippingAddress: addr } = order;
        const nextStatus = flow[flow.indexOf(so.status) + 1]; // undefined once delivered
        const isOpen = !["delivered", "cancelled"].includes(so.status);

        return (
          <div key={order._id} style={{ border: "1px solid #ddd", borderRadius: 8, padding: 14, marginBottom: 16 }}>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <strong>Order #{order._id.slice(-6)}</strong>
              <strong style={{ color: statusColors[so.status] }}>{so.status.toUpperCase()}</strong>
            </div>
            <p style={{ margin: "6px 0", color: "#666" }}>
              {new Date(order.createdAt).toLocaleDateString()} | Buyer: {order.buyer?.name}
            </p>
            <p style={{ margin: "6px 0" }}>
              Ship to: {addr.fullName}, {addr.phone}, {addr.street}, {addr.city}, {addr.state} - {addr.pincode}
            </p>

            {so.items.map((item) => (
              <p key={item.product} style={{ margin: "4px 0" }}>
                {item.name} × {item.quantity} — ₹{item.price * item.quantity}
              </p>
            ))}
            <strong>Your subtotal: ₹{so.subtotal}</strong>

            {isOpen && (
              <div style={{ marginTop: 10 }}>
                <button onClick={() => changeStatus(order._id, nextStatus)}>Mark as {nextStatus}</button>
                {["placed", "packed"].includes(so.status) && (
                  <button onClick={() => handleCancel(order._id)} style={{ marginLeft: 10 }}>Cancel order</button>
                )}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

export default SellerOrders;