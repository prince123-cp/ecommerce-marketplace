import { useEffect, useState } from "react";
import api from "../services/api";

const statusColors = {
  placed: "#555",
  packed: "#b8860b",
  shipped: "#1e6fd9",
  delivered: "green",
  cancelled: "red",
};

function MyOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    api
      .get("/orders/my-orders")
      .then(({ data }) => setOrders(data))
      .catch(() => setError("Could not load orders"))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <p style={{ padding: 20 }}>Loading...</p>;

  return (
    <div style={{ padding: 20, maxWidth: 800, margin: "0 auto" }}>
      <h2>My Orders</h2>
      {error && <p style={{ color: "red" }}>{error}</p>}
      {!error && orders.length === 0 && <p>You have not placed any orders yet.</p>}

      {orders.map((order) => (
        <div key={order._id} style={{ border: "1px solid #ddd", borderRadius: 8, padding: 14, marginBottom: 16 }}>
          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <strong>Order #{order._id.slice(-6)}</strong>
            <span>{new Date(order.createdAt).toLocaleDateString()}</span>
          </div>
          <p>
            Deliver to: {order.shippingAddress.fullName}, {order.shippingAddress.city} - {order.shippingAddress.pincode}
          </p>

          {/* Each seller's part of the order is a separate shipment with its own status */}
          {order.sellerOrders.map((so) => (
            <div key={so._id} style={{ background: "#f7f7f7", padding: 10, margin: "8px 0", borderRadius: 6 }}>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span>Sold by {so.seller?.storeName || "Seller"}</span>
                <strong style={{ color: statusColors[so.status] }}>{so.status.toUpperCase()}</strong>
              </div>
              {so.items.map((item) => (
                <p key={item.product} style={{ margin: "4px 0" }}>
                  {item.name} × {item.quantity} — ₹{item.price * item.quantity}
                </p>
              ))}
            </div>
          ))}

          <strong>Total: ₹{order.totalAmount} (Cash on Delivery)</strong>
        </div>
      ))}
    </div>
  );
}

export default MyOrders;