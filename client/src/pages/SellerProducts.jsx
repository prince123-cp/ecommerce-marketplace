import { useEffect, useState } from "react";
import api from "../services/api";

const emptyForm = { name: "", description: "", price: "", category: "", brand: "", stock: "", image: "" };

function SellerProducts() {
  const [products, setProducts] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null); // null means "add" mode
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const loadProducts = async () => {
    const { data } = await api.get("/seller/products");
    setProducts(data);
  };

  useEffect(() => {
    api
      .get("/seller/products")
      .then(({ data }) => setProducts(data))
      .catch(() => setError("Could not load products"));
  }, []);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setMessage("");

    // Convert form strings into the types the backend expects
    const payload = {
      name: form.name,
      description: form.description,
      price: Number(form.price),
      category: form.category,
      brand: form.brand,
      stock: Number(form.stock),
      images: form.image ? [form.image] : [],
    };

    try {
      if (editingId) {
        await api.put(`/seller/products/${editingId}`, payload);
        setMessage("Product updated");
      } else {
        await api.post("/seller/products", payload);
        setMessage("Product added");
      }
      setForm(emptyForm);
      setEditingId(null);
      await loadProducts();
    } catch (err) {
      // Includes "Your seller account is not approved yet"
      setError(err.response?.data?.message || "Something went wrong");
    }
  };

  const startEdit = (product) => {
    setEditingId(product._id);
    setForm({
      name: product.name,
      description: product.description,
      price: product.price,
      category: product.category,
      brand: product.brand || "",
      stock: product.stock,
      image: product.images?.[0] || "",
    });
    window.scrollTo(0, 0);
  };

  const cancelEdit = () => {
    setEditingId(null);
    setForm(emptyForm);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this product?")) return;
    try {
      await api.delete(`/seller/products/${id}`);
      if (editingId === id) cancelEdit();
      await loadProducts();
    } catch (err) {
      setError(err.response?.data?.message || "Could not delete product");
    }
  };

  const inputStyle = { display: "block", width: "100%", marginBottom: 10, boxSizing: "border-box" };

  return (
    <div style={{ padding: 20, maxWidth: 800, margin: "0 auto" }}>
      <h2>{editingId ? "Edit product" : "Add a new product"}</h2>
      {error && <p style={{ color: "red" }}>{error}</p>}
      {message && <p style={{ color: "green" }}>{message}</p>}

      <form onSubmit={handleSubmit} style={{ maxWidth: 420 }}>
        <input name="name" placeholder="Product name" value={form.name} onChange={handleChange} required style={inputStyle} />
        <textarea name="description" placeholder="Description" value={form.description} onChange={handleChange} required style={inputStyle} />
        <input name="price" type="number" min="0" placeholder="Price (₹)" value={form.price} onChange={handleChange} required style={inputStyle} />
        <input name="category" placeholder="Category (e.g. Electronics)" value={form.category} onChange={handleChange} required style={inputStyle} />
        <input name="brand" placeholder="Brand (optional)" value={form.brand} onChange={handleChange} style={inputStyle} />
        <input name="stock" type="number" min="0" placeholder="Stock" value={form.stock} onChange={handleChange} required style={inputStyle} />
        <input name="image" placeholder="Image URL (optional)" value={form.image} onChange={handleChange} style={inputStyle} />
        <button type="submit">{editingId ? "Save changes" : "Add product"}</button>
        {editingId && <button type="button" onClick={cancelEdit} style={{ marginLeft: 10 }}>Cancel</button>}
      </form>

      <h2 style={{ marginTop: 40 }}>My products ({products.length})</h2>
      {products.length === 0 && <p>You have not added any products yet.</p>}
      {products.map((p) => (
        <div key={p._id} style={{ display: "flex", alignItems: "center", gap: 16, borderBottom: "1px solid #ddd", padding: "10px 0" }}>
          <div style={{ flex: 1 }}>
            <strong>{p.name}</strong>
            <p style={{ margin: "4px 0", color: "#666" }}>{p.category}</p>
          </div>
          <span>₹{p.price}</span>
          <span>Stock: {p.stock}</span>
          <button onClick={() => startEdit(p)}>Edit</button>
          <button onClick={() => handleDelete(p._id)}>Delete</button>
        </div>
      ))}
    </div>
  );
}

export default SellerProducts;