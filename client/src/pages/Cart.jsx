import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../services/api";

function Cart() {
  const navigate = useNavigate();
  const [cart, setCart] = useState({ items: [], totalAmount: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Initial load of the cart
  useEffect(() => {
    api
      .get("/cart")
      .then(({ data }) => setCart(data))
      .catch(() => setError("Could not load cart"))
      .finally(() => setLoading(false));
  }, []);

  // Reload the cart after a change, so the totals stay correct
  const refreshCart = async () => {
    const { data } = await api.get("/cart");
    setCart(data);
  };

  const updateQuantity = async (productId, quantity) => {
    try {
      await api.put("/cart/update", { productId, quantity });
      await refreshCart();
      setError("");
    } catch (err) {
      setError(err.response?.data?.message || "Could not update cart");
    }
  };

  const removeItem = async (productId) => {
    try {
      await api.delete(`/cart/remove/${productId}`);
      await refreshCart();
    } catch {
      setError("Could not remove item");
    }
  };

  if (loading) return <p style={{ padding: 20 }}>Loading...</p>;

  return (
    <div style={{ padding: 20, maxWidth: 800, margin: "0 auto" }}>
      <h2>Your Cart</h2>
      {error && <p style={{ color: "red" }}>{error}</p>}

      {cart.items.length === 0 ? (
        <p>Your cart is empty. <Link to="/">Browse products</Link></p>
      ) : (
        <>
          {cart.items.map(({ product, quantity }) => (
            <div
              key={product._id}
              style={{ display: "flex", alignItems: "center", gap: 16, borderBottom: "1px solid #ddd", padding: "12px 0" }}
            >
              <div style={{ flex: 1 }}>
                <Link to={`/product/${product._id}`}>{product.name}</Link>
                <p style={{ margin: "4px 0" }}>₹{product.price}</p>
              </div>
              <div>
                <button onClick={() => updateQuantity(product._id, quantity - 1)} disabled={quantity <= 1}>-</button>
                <span style={{ margin: "0 10px" }}>{quantity}</span>
                <button onClick={() => updateQuantity(product._id, quantity + 1)} disabled={quantity >= product.stock}>+</button>
              </div>
              <p style={{ width: 90, textAlign: "right" }}>₹{product.price * quantity}</p>
              <button onClick={() => removeItem(product._id)}>Remove</button>
            </div>
          ))}

          <h3 style={{ textAlign: "right" }}>Total: ₹{cart.totalAmount}</h3>
          <div style={{ textAlign: "right" }}>
            <button onClick={() => navigate("/checkout")}>Proceed to Checkout</button>
          </div>
        </>
      )}
    </div>
  );
}

export default Cart;