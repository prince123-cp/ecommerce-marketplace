import { useEffect, useState } from "react";
import api from "../services/api";

const statusColors = {
  placed: "#555",
  packed: "#b8860b",
  shipped: "#1e6fd9",
  delivered: "green",
  cancelled: "red",
};

function AdminPanel() {
  const [tab, setTab] = useState("sellers");
  const [sellers, setSellers] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    // Load sellers and orders in parallel
    Promise.all([api.get("/admin/sellers"), api.get("/admin/orders")])
      .then(([s, o]) => {
        setSellers(s.data);
        setOrders(o.data);
      })
      .catch(() => setError("Could not load admin data"))
      .finally(() => setLoading(false));
  }, []);

  const approveSeller = async (id) => {
    setError("");
    try {
      const { data } = await api.put(`/admin/seller/${id}/approve`);
      // Update only isApproved, so the populated owner details stay in place
      setSellers(sellers.map((s) => (s._id === id ? { ...s, isApproved: data.seller.isApproved } : s)));
    } catch (err) {
      setError(err.response?.data?.message || "Could not approve seller");
    }
  };

  if (loading) return <p style={{ padding: 20 }}>Loading...</p>;

  // Pending sellers first, so the admin sees them at the top
  const sortedSellers = [...sellers].sort((a, b) => Number(a.isApproved) - Number(b.isApproved));
  const pendingCount = sellers.filter((s) => !s.isApproved).length;

  // Sales total ignores cancelled seller orders
  const totalSales = orders.reduce(
    (sum, o) =>
      sum +
      o.sellerOrders.filter((so) => so.status !== "cancelled").reduce((s, so) => s + so.subtotal, 0),
    0
  );

  const cards = [
    { label: "Sellers", value: sellers.length },
    { label: "Pending approvals", value: pendingCount },
    { label: "Orders", value: orders.length },
    { label: "Sales (excl. cancelled)", value: `₹${totalSales}` },
  ];

  const tabStyle = (name) => ({
    padding: "8px 16px",
    border: "none",
    borderBottom: tab === name ? "3px solid #222" : "3px solid transparent",
    background: "none",
    fontWeight: tab === name ? "bold" : "normal",
    cursor: "pointer",
  });

  return (
    <div style={{ padding: 20, maxWidth: 900, margin: "0 auto" }}>
      <h2>Admin Panel</h2>
      {error && <p style={{ color: "red" }}>{error}</p>}

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: 12, margin: "20px 0" }}>
        {cards.map((c) => (
          <div key={c.label} style={{ border: "1px solid #ddd", borderRadius: 8, padding: 14 }}>
            <p style={{ margin: 0, color: "#666" }}>{c.label}</p>
            <h3 style={{ margin: "6px 0 0" }}>{c.value}</h3>
          </div>
        ))}
      </div>

      <div style={{ borderBottom: "1px solid #ddd", marginBottom: 16 }}>
        <button style={tabStyle("sellers")} onClick={() => setTab("sellers")}>Sellers</button>
        <button style={tabStyle("orders")} onClick={() => setTab("orders")}>All Orders</button>
      </div>

      {tab === "sellers" && (
        <>
          {sellers.length === 0 && <p>No sellers have applied yet.</p>}
          {sortedSellers.map((s) => (
            <div key={s._id} style={{ border: "1px solid #ddd", borderRadius: 8, padding: 14, marginBottom: 12 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <strong>{s.storeName}</strong>
                <span style={{ color: s.isApproved ? "green" : "#b8860b", fontWeight: "bold" }}>
                  {s.isApproved ? "APPROVED" : "PENDING"}
                </span>
              </div>
              <p style={{ margin: "6px 0" }}>Owner: {s.user?.name} ({s.user?.email})</p>
              <p style={{ margin: "6px 0" }}>GST: {s.gstNumber || "Not provided"}</p>
              {s.storeDescription && <p style={{ margin: "6px 0", color: "#666" }}>{s.storeDescription}</p>}
              <small style={{ color: "#888" }}>Applied on {new Date(s.createdAt).toLocaleDateString()}</small>
              {!s.isApproved && (
                <div style={{ marginTop: 10 }}>
                  <button onClick={() => approveSeller(s._id)}>Approve seller</button>
                </div>
              )}
            </div>
          ))}
        </>
      )}

      {tab === "orders" && (
        <>
          {orders.length === 0 && <p>No orders yet.</p>}
          {orders.map((order) => (
            <div key={order._id} style={{ border: "1px solid #ddd", borderRadius: 8, padding: 14, marginBottom: 12 }}>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <strong>Order #{order._id.slice(-6)}</strong>
                <span>{new Date(order.createdAt).toLocaleDateString()}</span>
              </div>
              <p style={{ margin: "6px 0" }}>
                Buyer: {order.user?.name} ({order.user?.email}) | Total: ₹{order.totalAmount}
              </p>
              {order.sellerOrders.map((so) => (
                <div key={so._id} style={{ display: "flex", justifyContent: "space-between", background: "#f7f7f7", padding: "6px 10px", borderRadius: 6, marginTop: 6 }}>
                  <span>{so.seller?.storeName || "Seller"}: ₹{so.subtotal}</span>
                  <strong style={{ color: statusColors[so.status] }}>{so.status.toUpperCase()}</strong>
                </div>
              ))}
            </div>
          ))}
        </>
      )}
    </div>
  );
}

export default AdminPanel;