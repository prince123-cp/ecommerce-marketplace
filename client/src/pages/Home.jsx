import { useEffect, useState } from "react";
import api from "../services/api";
import ProductCard from "../components/ProductCard";

function Home() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [filters, setFilters] = useState({ search: "", category: "", minPrice: "", maxPrice: "" });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Load the category list once, from the unfiltered product list
  useEffect(() => {
    api
      .get("/products")
      .then(({ data }) => setCategories([...new Set(data.map((p) => p.category))]))
      .catch(() => {});
  }, []);

  // Reload products every time a filter changes
  useEffect(() => {
    // Send only the filters that have a value
    const params = {};
    Object.entries(filters).forEach(([key, value]) => {
      if (value) params[key] = value;
    });

    api
      .get("/products", { params })
      .then(({ data }) => {
        setProducts(data);
        setError("");
      })
      .catch(() => setError("Could not load products"))
      .finally(() => setLoading(false));
  }, [filters]);

  const handleChange = (e) => {
    setFilters({ ...filters, [e.target.name]: e.target.value });
  };

  return (
    <div style={{ padding: 20 }}>
      <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginBottom: 20 }}>
        <input name="search" placeholder="Search products..." value={filters.search} onChange={handleChange} />
        <select name="category" value={filters.category} onChange={handleChange}>
          <option value="">All categories</option>
          {categories.map((c) => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>
        <input name="minPrice" type="number" min="0" placeholder="Min price" value={filters.minPrice} onChange={handleChange} style={{ width: 100 }} />
        <input name="maxPrice" type="number" min="0" placeholder="Max price" value={filters.maxPrice} onChange={handleChange} style={{ width: 100 }} />
      </div>

      {loading && <p>Loading...</p>}
      {error && <p style={{ color: "red" }}>{error}</p>}
      {!loading && !error && products.length === 0 && <p>No products found.</p>}

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: 16 }}>
        {products.map((product) => (
          <ProductCard key={product._id} product={product} />
        ))}
      </div>
    </div>
  );
}

export default Home;