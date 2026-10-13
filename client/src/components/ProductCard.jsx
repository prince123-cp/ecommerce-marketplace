import { Link } from "react-router-dom";

function ProductCard({ product }) {
  // Show the first image if the seller added one
  const image = product.images?.[0];

  return (
    <Link to={`/product/${product._id}`} style={{ textDecoration: "none", color: "inherit" }}>
      <div style={{ border: "1px solid #ddd", borderRadius: 8, padding: 12, height: "100%" }}>
        {image ? (
          <img src={image} alt={product.name} style={{ width: "100%", height: 160, objectFit: "cover", borderRadius: 4 }} />
        ) : (
          <div style={{ height: 160, background: "#eee", display: "flex", alignItems: "center", justifyContent: "center", color: "#888", borderRadius: 4 }}>
            No image
          </div>
        )}
        <h3 style={{ margin: "10px 0 4px" }}>{product.name}</h3>
        <p style={{ margin: "4px 0", fontWeight: "bold" }}>₹{product.price}</p>
        <small style={{ color: "#666" }}>Sold by {product.seller?.storeName}</small>
        {product.stock === 0 && <p style={{ color: "red", margin: "6px 0 0" }}>Out of stock</p>}
      </div>
    </Link>
  );
}

export default ProductCard;