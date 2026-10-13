import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import api from "../services/api";
import { useAuth } from "../context/AuthContext";

function BecomeSeller() {
  // Fields that must always be stored in capital letters
  const uppercaseFields = ["ifsc", "gstNumber"];
  const { user, updateUser } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    storeName: "", storeDescription: "", gstNumber: "", accountNo: "", ifsc: "",
  });
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (e) => {
  const { name, value } = e.target;
  // Convert to capital letters while the seller is typing
  setForm({ ...form, [name]: uppercaseFields.includes(name) ? value.toUpperCase() : value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      await api.post("/seller/register", {
        storeName: form.storeName,
        storeDescription: form.storeDescription,
        gstNumber: form.gstNumber,
        bankDetails: { accountNo: form.accountNo, ifsc: form.ifsc },
      });
      // The backend already changed the role in the database, so update the saved user too
      updateUser({ role: "seller" });
      navigate("/seller");
    } catch (err) {
      setError(err.response?.data?.message || "Something went wrong");
    } finally {
      setSubmitting(false);
    }
  };

  // Only buyers can apply; sellers and admins see a short message instead
  if (user.role !== "buyer") {
    return (
      <p style={{ padding: 20 }}>
        Your account is already a {user.role} account. <Link to="/">Go home</Link>
      </p>
    );
  }

  const inputStyle = { display: "block", width: "100%", marginBottom: 10, boxSizing: "border-box" };

  return (
    <div style={{ maxWidth: 420, margin: "40px auto", padding: 20 }}>
      <h2>Become a Seller</h2>
      <p style={{ color: "#666" }}>
        After you apply, an admin will review your store. You can add products once you are approved.
      </p>
      {error && <p style={{ color: "red" }}>{error}</p>}
      <form onSubmit={handleSubmit}>
        <input name="storeName" placeholder="Store name" value={form.storeName} onChange={handleChange} required style={inputStyle} />
        <textarea name="storeDescription" placeholder="Store description" value={form.storeDescription} onChange={handleChange} style={inputStyle} />
        <input name="gstNumber" placeholder="GST number" value={form.gstNumber} onChange={handleChange} style={inputStyle} />
        <input name="accountNo" placeholder="Bank account number" value={form.accountNo} onChange={handleChange} style={inputStyle} />
        <input name="ifsc" placeholder="IFSC code (e.g. SBIN0001234)" value={form.ifsc} onChange={handleChange} maxLength={11} pattern="[A-Z]{4}0[A-Z0-9]{6}"  title="IFSC must be 11 characters: 4 letters, then 0, then 6 letters or digits" style={inputStyle} />
        <button type="submit" disabled={submitting}>
          {submitting ? "Submitting..." : "Apply as seller"}
        </button>
      </form>
    </div>
  );
}

export default BecomeSeller;