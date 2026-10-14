import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import "./Navbar.css";

function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  const closeMenu = () => setMenuOpen(false);

  const handleLogout = () => {
    logout();
    closeMenu();
    navigate("/login");
  };

  return (
    <nav className="navbar">
      <Link to="/" className="navbar-logo" onClick={closeMenu}>E-Shop</Link>

      {/* Hamburger button, visible only on small screens */}
      <button
        className={`navbar-toggle ${menuOpen ? "open" : ""}`}
        aria-label="Toggle menu"
        aria-expanded={menuOpen}
        onClick={() => setMenuOpen(!menuOpen)}
      >
        <span />
        <span />
        <span />
      </button>

      <div className={`navbar-menu ${menuOpen ? "open" : ""}`}>
        <div className="navbar-links">
          {user?.role === "buyer" && (
            <>
              <Link to="/cart" onClick={closeMenu}>Cart</Link>
              <Link to="/my-orders" onClick={closeMenu}>My Orders</Link>
              <Link to="/become-seller" onClick={closeMenu}>Become a Seller</Link>
            </>
          )}
          {user?.role === "seller" && (
            <>
              <Link to="/seller" onClick={closeMenu}>Dashboard</Link>
              <Link to="/seller/products" onClick={closeMenu}>My Products</Link>
              <Link to="/seller/orders" onClick={closeMenu}>Orders</Link>
            </>
          )}
          {user?.role === "admin" && (
            <Link to="/admin" onClick={closeMenu}>Admin Panel</Link>
          )}
        </div>

        <div className="navbar-auth">
          {user ? (
            <>
              <span>{user.name} ({user.role})</span>
              <button onClick={handleLogout}>Logout</button>
            </>
          ) : (
            <>
              <Link to="/login" onClick={closeMenu}>Login</Link>
              <Link to="/register" onClick={closeMenu}>Register</Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}

export default Navbar;