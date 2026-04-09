import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { getFavorites, removeFavorite } from "../services/api";
import { useAuth } from "../context/AuthContext";

const MOCK = [
  { id: 1, name: "Pasta Paradise", cuisine: "Italian", rating: 4.5, price: "$$", city: "San Jose, CA", image_url: "https://images.unsplash.com/photo-1555949258-eb67b1ef0ceb?w=400&q=80" },
  { id: 2, name: "Spice Garden", cuisine: "Indian", rating: 4.7, price: "$$", city: "San Jose, CA", image_url: "https://images.unsplash.com/photo-1565557623262-b51c2513a641?w=400&q=80" },
];

function Stars({ rating }) {
  return (
    <span>
      {[1, 2, 3, 4, 5].map((i) => (
        <span
          key={i}
          style={{ color: i <= rating ? "#f5a623" : "#d1d5db", fontSize: 13 }}
        >
          ★
        </span>
      ))}
    </span>
  );
}

export default function Favorites() {
  const { isLoggedIn } = useAuth();
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    try {
      const res = await getFavorites();
      console.log("GET /favorites response:", res.data);
      setFavorites(res.data || []);
    } catch (err) {
      console.error("Failed to load favorites:", err.response?.data || err.message);
      setFavorites(MOCK);
    }
    setLoading(false);
  };

  useEffect(() => {
    if (isLoggedIn) load();
    else setLoading(false);
  }, [isLoggedIn]);

  const handleRemove = async (restaurantId) => {
    try {
      await removeFavorite(restaurantId);
      setFavorites((prev) =>
        prev.filter((fav) => String(fav.restaurant_id || fav.id) !== String(restaurantId))
      );
    } catch (err) {
      console.error("Failed to remove favorite:", err.response?.data || err.message);
    }
  };

  if (!isLoggedIn) {
    return (
      <div style={s.page}>
        <div style={s.container}>
          <h1 style={s.title}>Favorites</h1>
          <div style={s.loginPrompt}>
            <Link to="/login" style={{ color: "#d32323", fontWeight: 700 }}>Log in</Link> to see your saved restaurants.
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={s.page}>
      <div style={s.container}>
        <div style={s.tabRow}>
          <Link to="/profile" style={s.tab}>Profile</Link>
          <Link to="/preferences" style={s.tab}>Preferences</Link>
          <Link to="/favorites" style={s.tabActive}>Favorites</Link>
          <Link to="/history" style={s.tab}>History</Link>
        </div>

        <div style={s.header}>
          <h1 style={s.title}>❤ Your Favorites</h1>
          <span style={s.count}>{favorites.length} saved</span>
        </div>

        {loading ? (
          <div style={s.loading}>Loading…</div>
        ) : favorites.length === 0 ? (
          <div style={s.empty}>
            <div style={s.emptyIcon}>🤍</div>
            <p style={s.emptyText}>No favorites yet.</p>
            <Link to="/explore" className="btn-primary" style={{ display: "inline-block", marginTop: 16 }}>
              Explore Restaurants
            </Link>
          </div>
        ) : (
          <div style={s.grid}>
            {favorites.map((fav) => {
              const r = fav.restaurant || fav;
              const restaurantId = fav.restaurant_id || r.id;
              return (
                <div key={fav.id || restaurantId} style={s.card}>
                  <Link to={`/restaurant/${restaurantId}`} style={{ textDecoration: "none", color: "inherit" }}>
                    <img
                      src={
                        r.image_url ||
                        r.image ||
                        r.photo_url ||
                        r.photo ||
                        "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=400"
                      }
                      alt={r.name || "Restaurant"}
                      style={s.img}
                    />
                  </Link>

                  <div style={s.body}>
                    <Link to={`/restaurant/${restaurantId}`} style={s.name}>
                      {r.name || "Unnamed Restaurant"}
                    </Link>

                    <div style={s.meta}>
                      <Stars rating={Math.floor(r.rating || r.average_rating || 0)} />
                      <span style={s.metaTxt}>{r.rating || r.average_rating || 0}</span>
                      <span style={s.dot}>·</span>
                      <span style={s.metaTxt}>{r.cuisine || r.cuisine_type || "N/A"}</span>
                      <span style={s.dot}>·</span>
                      <span style={s.metaTxt}>{r.price || r.price_range || "N/A"}</span>
                    </div>

                    <div style={s.city}>{r.city || r.location || "N/A"}</div>

                    <div style={s.actions}>
                      <Link to={`/restaurant/${restaurantId}`} style={s.viewBtn}>View</Link>
                      <button onClick={() => handleRemove(restaurantId)} style={s.removeBtn}>
                        Remove
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

const s = {
  page: { background: "#f9f8f6", minHeight: "100vh", padding: "32px 24px 60px" },
  container: { maxWidth: 900, margin: "0 auto" },
  tabRow: { display: "flex", gap: 0, marginBottom: 28, borderBottom: "2px solid #f0eeeb" },
  tab: { padding: "10px 20px", fontSize: 14, fontWeight: 500, color: "#6b7280", textDecoration: "none", borderBottom: "2px solid transparent", marginBottom: -2 },
  tabActive: { padding: "10px 20px", fontSize: 14, fontWeight: 700, color: "#d32323", textDecoration: "none", borderBottom: "2px solid #d32323", marginBottom: -2 },
  header: { display: "flex", alignItems: "center", gap: 14, marginBottom: 24 },
  title: { fontSize: 24, fontWeight: 700 },
  count: { fontSize: 14, color: "#9ca3af", background: "#f3f4f6", borderRadius: 999, padding: "3px 10px" },
  loading: { textAlign: "center", padding: 60, color: "#9ca3af" },
  loginPrompt: { background: "#fff", borderRadius: 12, padding: 24, fontSize: 15, color: "#6b7280" },
  empty: { textAlign: "center", padding: "60px 20px" },
  emptyIcon: { fontSize: 56, marginBottom: 16 },
  emptyText: { fontSize: 16, color: "#9ca3af" },
  grid: { display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(260px,1fr))", gap: 20 },
  card: { background: "#fff", border: "1px solid #f0eeeb", borderRadius: 14, overflow: "hidden" },
  img: { width: "100%", height: 160, objectFit: "cover" },
  body: { padding: 14 },
  name: { fontWeight: 700, fontSize: 15, color: "#1a1a1a", textDecoration: "none", display: "block", marginBottom: 6 },
  meta: { display: "flex", alignItems: "center", gap: 5, marginBottom: 4, flexWrap: "wrap" },
  metaTxt: { fontSize: 12, color: "#6b7280" },
  dot: { color: "#d1d5db" },
  city: { fontSize: 12, color: "#9ca3af", marginBottom: 12 },
  actions: { display: "flex", gap: 8 },
  viewBtn: { flex: 1, textAlign: "center", padding: "8px 0", borderRadius: 8, background: "#d32323", color: "#fff", textDecoration: "none", fontSize: 13, fontWeight: 600 },
  removeBtn: { padding: "8px 14px", borderRadius: 8, border: "1px solid #e5e7eb", background: "#fff", color: "#6b7280", fontSize: 13, cursor: "pointer" },
};