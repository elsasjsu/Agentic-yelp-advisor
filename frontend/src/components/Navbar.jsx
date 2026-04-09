import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useState } from "react";

export default function Navbar() {
  const { isLoggedIn, user, logout } = useAuth();
  const navigate = useNavigate();
  const [query, setQuery] = useState("");
  const role = localStorage.getItem("role");

  const handleSearch = (e) => {
    e.preventDefault();
    if (query.trim()) navigate(`/explore?q=${encodeURIComponent(query.trim())}`);
  };

  const handleLogout = () => {
    logout();
    localStorage.removeItem("role");
    navigate("/");
  };

  return (
    <header style={s.header}>
      <div style={s.topBar}>
        <div style={s.leftLinks}>
          <span style={s.small}>Yelp for Business</span>
        </div>
        <div style={s.rightLinks}>
          {isLoggedIn ? (
            <>
              {role === "owner" ? (
                <>
                  <Link to="/owner-dashboard" style={s.small}>📊 Owner Dashboard</Link>
                  <Link to="/restaurant/add" style={s.small}>Add Restaurant</Link>
                </>
              ) : (
                <>
                  <Link to="/restaurant/add" style={s.small}>Add Restaurant</Link>
                  <Link to="/profile" style={s.small}>👤 {user?.name || "Profile"}</Link>
                </>
              )}
              <button onClick={handleLogout} style={s.logoutBtn}>Log Out</button>
            </>
          ) : (
            <>
              <Link to="/restaurant/1" style={s.small}>Write a Review</Link>
              <Link to="/login" style={s.small}>Log In</Link>
              <Link to="/signup" style={s.signupBtn}>Sign Up</Link>
            </>
          )}
        </div>
      </div>

      <div style={s.mainNav}>
        <Link to="/" style={s.logo}>yelp<span style={s.star}>★</span></Link>
        <form onSubmit={handleSearch} style={s.searchArea}>
          <input
            type="text"
            placeholder="Search restaurants, cuisines, or places…"
            value={query}
            onChange={e => setQuery(e.target.value)}
            style={s.searchInput}
          />
          <button type="submit" style={s.searchBtn}>🔍</button>
        </form>
      </div>

      <nav style={s.catNav}>
        {["Restaurants","Cafés","Nightlife","Fast Food","Fine Dining","Vegan","More"].map(cat => (
          <Link key={cat} to={`/explore?cuisine=${encodeURIComponent(cat)}`} style={s.catLink}>{cat}</Link>
        ))}

        {isLoggedIn && role !== "owner" && (
          <>
            <Link to="/favorites" style={s.catLink}>❤ Favorites</Link>
            <Link to="/history" style={s.catLink}>📋 History</Link>
            <Link to="/assistant" style={s.catLink}>🤖 AI Assistant</Link>
          </>
        )}

        {isLoggedIn && role === "owner" && (
          <>
            <Link to="/owner-dashboard" style={s.catLink}>📊 Dashboard</Link>
          </>
        )}
      </nav>
    </header>
  );
}

const s = {
  header: { background: "linear-gradient(180deg,#c41200 0%,#d32323 100%)", color: "#fff", padding: "10px 20px 16px" },
  topBar: { maxWidth: 1200, margin: "0 auto 12px", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 10 },
  leftLinks: { display: "flex", gap: 14 },
  rightLinks: { display: "flex", gap: 14, alignItems: "center", flexWrap: "wrap" },
  small: { color: "#fff", textDecoration: "none", fontSize: 13, fontWeight: 500 },
  logoutBtn: { background: "rgba(255,255,255,0.15)", color: "#fff", border: "1px solid rgba(255,255,255,0.35)", borderRadius: 6, padding: "5px 12px", fontSize: 13, cursor: "pointer" },
  signupBtn: { color: "#d32323", background: "#fff", textDecoration: "none", fontSize: 13, fontWeight: 700, padding: "6px 14px", borderRadius: 6 },
  mainNav: { maxWidth: 1200, margin: "0 auto 14px", display: "flex", justifyContent: "space-between", alignItems: "center", gap: 20, flexWrap: "wrap" },
  logo: { color: "#fff", textDecoration: "none", fontSize: 34, fontWeight: 900, fontFamily: "'Sora',sans-serif", letterSpacing: -1 },
  star: { color: "#fff", fontSize: 24 },
  searchArea: { display: "flex", flex: 1, maxWidth: 640, background: "#fff", borderRadius: 8, overflow: "hidden" },
  searchInput: { flex: 1, border: "none", padding: "13px 16px", fontSize: 15, outline: "none" },
  searchBtn: { background: "#b01c1c", color: "#fff", border: "none", padding: "0 20px", cursor: "pointer", fontSize: 16 },
  catNav: { maxWidth: 1200, margin: "0 auto", display: "flex", gap: 16, flexWrap: "wrap" },
  catLink: { color: "rgba(255,255,255,0.9)", textDecoration: "none", fontSize: 14, fontWeight: 500 },
};