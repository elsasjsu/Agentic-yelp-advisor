import { Link } from "react-router-dom";

function Stars({ rating }) {
  return (
    <span style={{ display: "inline-flex", gap: 1 }}>
      {[1,2,3,4,5].map(i => (
        <span key={i} style={{ color: i <= rating ? "#f5a623" : "#d1d5db", fontSize: 13 }}>★</span>
      ))}
    </span>
  );
}

export default function RestaurantCard({ restaurant }) {
  const r = restaurant;
  return (
    <Link to={`/restaurant/${r.id}`} style={s.card}>
      <img
        src={r.image_url || r.image || "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=400"}
        alt={r.name}
        style={s.img}
      />
      <div style={s.body}>
        <div style={s.name}>{r.name}</div>
        <div style={s.meta}>
          <Stars rating={Math.floor(r.rating || 0)} />
          <span style={s.metaTxt}>{r.rating || "—"}</span>
          <span style={s.dot}>·</span>
          <span style={s.metaTxt}>{r.review_count || 0} reviews</span>
        </div>
        <div style={s.tags}>
          {r.cuisine && <span style={s.tag}>{r.cuisine}</span>}
          {r.price && <span style={s.tag}>{r.price}</span>}
        </div>
        <div style={s.city}>{r.city || r.location}</div>
        {r.description && (
          <p style={s.desc}>{r.description}</p>
        )}
      </div>
    </Link>
  );
}

const s = {
  card: { display: "block", background: "#fff", borderRadius: 12, border: "1px solid #f0eeeb", overflow: "hidden", textDecoration: "none", color: "inherit", transition: "box-shadow 0.15s, transform 0.12s" },
  img: { width: "100%", height: 160, objectFit: "cover" },
  body: { padding: 14 },
  name: { fontWeight: 700, fontSize: 16, color: "#1a1a1a", marginBottom: 6 },
  meta: { display: "flex", alignItems: "center", gap: 6, marginBottom: 8 },
  metaTxt: { fontSize: 13, color: "#6b7280" },
  dot: { color: "#d1d5db" },
  tags: { display: "flex", gap: 6, marginBottom: 6 },
  tag: { background: "#f3f4f6", color: "#374151", borderRadius: 999, padding: "2px 10px", fontSize: 12 },
  city: { fontSize: 12, color: "#9ca3af", marginBottom: 6 },
  desc: { fontSize: 13, color: "#6b7280", lineHeight: 1.5, overflow: "hidden", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical" },
};
