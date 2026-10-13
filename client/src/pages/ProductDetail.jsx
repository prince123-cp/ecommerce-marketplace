import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import api from "../services/api";
import { useAuth } from "../context/AuthContext";

function ProductDetail() {
  const { id } = useParams(); // the :id from the URL
  const { user } = useAuth();
  const navigate = useNavigate();

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [message, setMessage] = useState({ text: "", type: "" });

  useEffect(() => {
    api
      .get(`/products/${id}`)
      .then(({ data }) => setProduct(data))
      .catch(() => setProduct(null))
      .finally(() => setLoading(false));
  }, [id]);

  const handleAddToCart = async () => {
    // Guests must log in before adding to cart
    if (!user) {
      navigate("/login");
      return;
    }
    try {
      await api.post("/cart/add", { productId: product._id, quantity });
      setMessage({ text: "Added to cart", type: "success" });
    } catch (err) {
      // Show the backend message, e.g. "Only 3 items available in stock"
      setMessage({ text: err.response?.data?.message || "Could not add to cart", type: "error" });
    }
  };

  if (loading) return <p style={{ padding: 20 }}>Loading...</p>;
  if (!product) return <p style={{ padding: 20 }}>Product not found.</p>;

  const canBuy = !user || user.role === "buyer";

  return (
    <div style={{ padding: 20, maxWidth: 800, margin: "0 auto" }}>
      <Link to="/">← Back to products</Link>

      <div style={{ display: "flex", gap: 30, marginTop: 20, flexWrap: "wrap" }}>
        {product.images?.[0] ? (
          <img src={product.images[0]} alt={product.name} style={{ width: 320, height: 320, objectFit: "cover", borderRadius: 8 }} />
        ) : (
          <div style={{ width: 320, height: 320, background: "#eee", display: "flex", alignItems: "center", justifyContent: "center", color: "#888", borderRadius: 8 }}>
            No image
          </div>
        )}

        <div style={{ flex: 1, minWidth: 260 }}>
          <h2 style={{ marginTop: 0 }}>{product.name}</h2>
          <p style={{ fontSize: 24, fontWeight: "bold" }}>₹{product.price}</p>
          <p>{product.description}</p>
          <p>Category: {product.category}{product.brand && ` | Brand: ${product.brand}`}</p>
          <p>Sold by: {product.seller?.storeName}</p>
          <p>{product.stock > 0 ? `${product.stock} in stock` : "Out of stock"}</p>

          {canBuy && product.stock > 0 && (
            <div>
              <input
                type="number"
                min="1"
                max={product.stock}
                value={quantity}
                onChange={(e) => setQuantity(Math.max(1, Number(e.target.value)))}
                style={{ width: 60, marginRight: 10 }}
              />
              <button onClick={handleAddToCart}>Add to Cart</button>
            </div>
          )}

          {!canBuy && <p style={{ color: "#666" }}>Only buyer accounts can add items to the cart.</p>}

          {message.text && (
            <p style={{ color: message.type === "error" ? "red" : "green" }}>{message.text}</p>
          )}
        </div>
      </div>
    </div>
  );
}

export default ProductDetail;