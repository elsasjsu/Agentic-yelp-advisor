import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { getHistory } from "../services/api";
import { useAuth } from "../context/AuthContext";

const MOCK = [
  { id: 1, restaurant_id: 1, restaurant_name: "Spice Garden", action: "Reviewed", rating: 5, comment: "Amazing biryani!", date: "2026-03-15", image_url: "https://images.unsplash.com/photo-1565557623262-b51c2513a641?w=300&q=80" },
  { id: 2, restaurant_id: 2, restaurant_name: "Burger Hub", action: "Added", date: "2026-03-14", image_url: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=300&q=80" },
  { id: 3, restaurant_id: 3, restaurant_name: "Sushi Corner", action: "Favorited", date: "2026-03-12", image_url: "https://images.unsplash.com/photo-1553621042-f6e147245754?w=300&q=80" },
];

function Stars({ rating }) {
  return <span>{[1,2,3,4,5].map(i => <span key={i} style={{ color: i <= rating ? "#f5a623" : "#d1d5db", fontSize: 13 }}>★</span>)}</span>;
}

const ACTION_COLORS = {
  Reviewed: { bg: "#fdf0f0", color: "#d32323" },
  Added: { bg: "#f0fdf4", color: "#166534" },
  Favorited: { bg: "#fef9ed", color: "#92650a" },
  Visited: { bg: "#eff6ff", color: "#1d4ed8" },
};

export default function History() {
  const { isLoggedIn } = useAuth();
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isLoggedIn) { setLoading(false); return; }
    getHistory()
      .then(res => setHistory(res.data || []))
      .catch(() => setHistory(MOCK))
      .finally(() => setLoading(false));
  }, [isLoggedIn]);

  return (
    <div style={s.page}>
      <div style={s.container}>
        <div style={s.tabRow}>
          <Link to="/profile" style={s.tab}>Profile</Link>
          <Link to="/preferences" style={s.tab}>Preferences</Link>
          <Link to="/favorites" style={s.tab}>Favorites</Link>
          <Link to="/history" style={s.tabActive}>History</Link>
        </div>

        <h1 style={s.title}>📋 Activity History</h1>
        <p style={s.sub}>Your reviews, additions, and interactions</p>

        {!isLoggedIn ? (
          <div style={s.loginPrompt}><Link to="/login" style={{ color: "#d32323", fontWeight: 700 }}>Log in</Link> to see your history.</div>
        ) : loading ? (
          <div style={s.loading}>Loading…</div>
        ) : history.length === 0 ? (
          <div style={s.empty}>
            <div style={{ fontSize: 48, marginBottom: 16 }}>📋</div>
            <p style={{ color: "#9ca3af" }}>No activity yet. Start exploring!</p>
            <Link to="/explore" className="btn-primary" style={{ display: "inline-block", marginTop: 16 }}>Explore Restaurants</Link>
          </div>
        ) : (
          <div style={s.list}>
            {history.map((item, i) => {
              const badge = ACTION_COLORS[item.action] || ACTION_COLORS.Visited;
              return (
                <div key={item.id || i} style={s.item}>
                  {item.image_url && (
                    <img src={item.image_url} alt={item.restaurant_name} style={s.thumb} />
                  )}
                  <div style={s.content}>
                    <div style={s.itemHeader}>
                      <Link to={`/restaurant/${item.restaurant_id}`} style={s.rName}>
                        {item.restaurant_name || item.name}
                      </Link>
                      <span style={{ ...s.badge, background: badge.bg, color: badge.color }}>{item.action}</span>
                    </div>
                    {item.rating && (
                      <div style={{ marginBottom: 4 }}><Stars rating={item.rating} /></div>
                    )}
                    {item.comment && <p style={s.comment}>"{item.comment}"</p>}
                    <span style={s.date}>{item.date || item.created_at?.split("T")[0]}</span>
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
  container: { maxWidth: 780, margin: "0 auto" },
  tabRow: { display: "flex", gap: 0, marginBottom: 28, borderBottom: "2px solid #f0eeeb" },
  tab: { padding: "10px 20px", fontSize: 14, fontWeight: 500, color: "#6b7280", textDecoration: "none", borderBottom: "2px solid transparent", marginBottom: -2 },
  tabActive: { padding: "10px 20px", fontSize: 14, fontWeight: 700, color: "#d32323", textDecoration: "none", borderBottom: "2px solid #d32323", marginBottom: -2 },
  title: { fontSize: 24, fontWeight: 700, marginBottom: 4 },
  sub: { fontSize: 14, color: "#9ca3af", marginBottom: 24 },
  loading: { textAlign: "center", padding: 60, color: "#9ca3af" },
  loginPrompt: { background: "#fff", borderRadius: 12, padding: 24, fontSize: 15, color: "#6b7280" },
  empty: { textAlign: "center", padding: "60px 20px" },
  list: { display: "flex", flexDirection: "column", gap: 12 },
  item: { background: "#fff", border: "1px solid #f0eeeb", borderRadius: 12, padding: 16, display: "flex", gap: 14, alignItems: "flex-start" },
  thumb: { width: 64, height: 64, borderRadius: 8, objectFit: "cover", flexShrink: 0 },
  content: { flex: 1 },
  itemHeader: { display: "flex", alignItems: "center", gap: 10, marginBottom: 6, flexWrap: "wrap" },
  rName: { fontWeight: 700, fontSize: 15, color: "#1a1a1a", textDecoration: "none" },
  badge: { padding: "2px 10px", borderRadius: 999, fontSize: 12, fontWeight: 600 },
  comment: { fontSize: 13, color: "#6b7280", fontStyle: "italic", margin: "4px 0 6px" },
  date: { fontSize: 12, color: "#9ca3af" },
};
