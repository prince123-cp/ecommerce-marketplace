import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";

const fields = [
  { name: "fullName", label: "Full name" },
  { name: "phone", label: "Phone" },
  { name: "street", label: "Street address" },
  { name: "city", label: "City" },
  { name: "state", label: "State" },
  { name: "pincode", label: "Pincode" },
];

function Checkout() {
  const navigate = useNavigate();
  const [cart, setCart] = useState({ items: [], totalAmount: 0 });
  const [loading, setLoading] = useState(true);
  const [placing, setPlacing] = useState(false);
  const [error, setError] = useState("");
  const [address, setAddress] = useState({
    fullName: "", phone: "", street: "", city: "", state: "", pincode: "",
  });

  useEffect(() => {
    api
      .get("/cart")
      .then(({ data }) => setCart(data))
      .catch(() => setError("Could not load cart"))
      .finally(() => setLoading(false));
  }, []);

  const handleChange = (e) => {
    setAddress({ ...address, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setPlacing(true);
    try {
      await api.post("/orders", { shippingAddress: address });
      navigate("/my-orders");
    } catch (err) {
      // Backend errors such as "only 2 in stock" are shown as they are
      setError(err.response?.data?.message || "Could not place order");
    } finally {
      setPlacing(false);
    }
  };

  if (loading) return <p style={{ padding: 20 }}>Loading...</p>;

  if (cart.items.length === 0) {
    return <p style={{ padding: 20 }}>Your cart is empty, so there is nothing to check out.</p>;
  }

  return (
    <div style={{ padding: 20, maxWidth: 500, margin: "0 auto" }}>
      <h2>Checkout</h2>

      <h3>Order summary</h3>
      {cart.items.map(({ product, quantity }) => (
        <p key={product._id} style={{ margin: "4px 0" }}>
          {product.name} × {quantity} — ₹{product.price * quantity}
        </p>
      ))}
      <h3>Total: ₹{cart.totalAmount}</h3>

      <h3>Shipping address</h3>
      {error && <p style={{ color: "red" }}>{error}</p>}
      <form onSubmit={handleSubmit}>
        {fields.map((f) => (
          <input
            key={f.name}
            name={f.name}
            placeholder={f.label}
            value={address[f.name]}
            onChange={handleChange}
            required
            style={{ display: "block", width: "100%", marginBottom: 10 }}
          />
        ))}
        <p>Payment method: Cash on Delivery (COD)</p>
        <button type="submit" disabled={placing}>
          {placing ? "Placing order..." : "Place Order"}
        </button>
      </form>
    </div>
  );
}

export default Checkout;