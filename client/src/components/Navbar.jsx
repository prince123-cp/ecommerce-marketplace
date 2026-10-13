import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <nav style={{ display: "flex", gap: 16, padding: "12px 20px", background: "#222", color: "white", alignItems: "center" }}>
      <Link to="/" style={{ color: "white", fontWeight: "bold" }}>E-Shop</Link>

      {user?.role === "buyer" && (
        <>
          <Link to="/cart" style={{ color: "white" }}>Cart</Link>
          <Link to="/my-orders" style={{ color: "white" }}>My Orders</Link>
          <Link to="/become-seller" style={{ color: "white" }}>Become a Seller</Link>
        </>
      )}
      {user?.role === "seller" && (
        <>
            <Link to="/seller" style={{ color: "white" }}>Dashboard</Link>
            <Link to="/seller/products" style={{ color: "white" }}>My Products</Link>
            <Link to="/seller/orders" style={{ color: "white" }}>Orders</Link>
        </>
      )}
      {user?.role === "admin" && <Link to="/admin" style={{ color: "white" }}>Admin Panel</Link>}

      <span style={{ marginLeft: "auto" }}>
        {user ? (
          <>
            {user.name} ({user.role}){" "}
            <button onClick={handleLogout}>Logout</button>
          </>
        ) : (
          <>
            <Link to="/login" style={{ color: "white" }}>Login</Link>{" "}
            <Link to="/register" style={{ color: "white" }}>Register</Link>
          </>
        )}
      </span>
    </nav>
  );
}

export default Navbar;