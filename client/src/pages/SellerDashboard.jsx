import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../services/api";

function SellerDashboard() {
  const [data, setData] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    // Load profile, products and orders in parallel
    Promise.all([
      api.get("/seller/profile"),
      api.get("/seller/products"),
      api.get("/seller/orders"),
    ])
      .then(([profile, products, orders]) =>
        setData({ seller: profile.data, products: products.data, orders: orders.data })
      )
      .catch(() => setError("Could not load dashboard"));
  }, []);

  if (error) return <p style={{ padding: 20, color: "red" }}>{error}</p>;
  if (!data) return <p style={{ padding: 20 }}>Loading...</p>;

  const { seller, products, orders } = data;
  const newOrders = orders.filter((o) => o.sellerOrder.status === "placed").length;
  // Revenue counts only delivered orders
  const revenue = orders
    .filter((o) => o.sellerOrder.status === "delivered")
    .reduce((sum, o) => sum + o.sellerOrder.subtotal, 0);

  const cards = [
    { label: "Products", value: products.length },
    { label: "Total orders", value: orders.length },
    { label: "New orders", value: newOrders },
    { label: "Revenue (delivered)", value: `₹${revenue}` },
  ];

  return (
    <div style={{ padding: 20, maxWidth: 800, margin: "0 auto" }}>
      <h2>{seller.storeName}</h2>

      {!seller.isApproved && (
        <p style={{ background: "#fff3cd", padding: 10, borderRadius: 6 }}>
          Your seller account is waiting for admin approval. You cannot add products until it is approved.
        </p>
      )}

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: 12, margin: "20px 0" }}>
        {cards.map((c) => (
          <div key={c.label} style={{ border: "1px solid #ddd", borderRadius: 8, padding: 14 }}>
            <p style={{ margin: 0, color: "#666" }}>{c.label}</p>
            <h3 style={{ margin: "6px 0 0" }}>{c.value}</h3>
          </div>
        ))}
      </div>

      <Link to="/seller/products">Manage products</Link> | <Link to="/seller/orders">Manage orders</Link>
    </div>
  );
}

export default SellerDashboard;