import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { getOwnerDashboard } from "../services/api";
import { useAuth } from "../context/AuthContext";

export default function OwnerDashboard() {
  const { isLoggedIn } = useAuth();
  const navigate = useNavigate();

  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!isLoggedIn) {
      navigate("/login");
      return;
    }

    getOwnerDashboard()
      .then((res) => setDashboard(res.data))
      .catch((err) => {
        console.error("Owner dashboard error:", err);
        setError(err.response?.data?.detail || "Failed to load dashboard");
      })
      .finally(() => setLoading(false));
  }, [isLoggedIn, navigate]);

  if (loading) {
    return (
      <div style={s.page}>
        <div style={s.container}>
          <p style={s.loading}>Loading owner dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={s.page}>
        <div style={s.container}>
          <h2 style={s.title}>Owner Dashboard</h2>
          <p style={{ color: "red" }}>{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div style={s.page}>
      <div style={s.container}>
        <div style={s.pageHeader}>
          <div>
            <h1 style={s.title}>Owner Dashboard</h1>
            <p style={s.sub}>Manage your restaurants and view performance</p>
          </div>
          <Link
            to="/restaurant/add"
            style={{
              padding: "11px 24px",
              textDecoration: "none",
              background: "#d32323",
              color: "#fff",
              borderRadius: "8px",
              fontWeight: 600,
            }}
          >
            + Add Restaurant
          </Link>
        </div>

        <div style={s.statsGrid}>
          <div style={s.statCard}>
            <div style={s.statValue}>{dashboard?.total_restaurants ?? 0}</div>
            <div style={s.statLabel}>Restaurants</div>
          </div>
          <div style={s.statCard}>
            <div style={s.statValue}>{dashboard?.total_reviews ?? 0}</div>
            <div style={s.statLabel}>Total Reviews</div>
          </div>
          <div style={s.statCard}>
            <div style={s.statValue}>{dashboard?.recent_reviews_count ?? 0}</div>
            <div style={s.statLabel}>Recent Reviews</div>
          </div>
        </div>

        <div style={s.claimBox}>
          <div>
            <div style={s.claimTitle}>Claim an existing restaurant</div>
            <div style={s.claimSub}>
              Already listed? Take ownership and manage your profile.
            </div>
          </div>
          <Link to="/explore" style={s.claimBtn}>
            Browse & Claim →
          </Link>
        </div>
      </div>
    </div>
  );
}

const s = {
  page: { background: "#f9f8f6", minHeight: "100vh", padding: "32px 24px 60px" },
  container: { maxWidth: 1000, margin: "0 auto" },
  pageHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 28,
    flexWrap: "wrap",
    gap: 16,
  },
  title: { fontSize: 26, fontWeight: 700, marginBottom: 4 },
  sub: { fontSize: 14, color: "#9ca3af" },
  statsGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill,minmax(180px,1fr))",
    gap: 16,
    marginBottom: 32,
  },
  statCard: {
    background: "#fff",
    border: "1px solid #f0eeeb",
    borderRadius: 12,
    padding: "20px 24px",
    textAlign: "center",
  },
  statValue: { fontSize: 32, fontWeight: 800, color: "#d32323", marginBottom: 4 },
  statLabel: { fontSize: 13, color: "#9ca3af" },
  loading: { textAlign: "center", padding: 60, color: "#9ca3af" },
  claimBox: {
    background: "#fff",
    border: "1px dashed #e5e7eb",
    borderRadius: 12,
    padding: "20px 24px",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    flexWrap: "wrap",
    gap: 16,
  },
  claimTitle: { fontWeight: 700, fontSize: 15, marginBottom: 4 },
  claimSub: { fontSize: 13, color: "#9ca3af" },
  claimBtn: { color: "#d32323", textDecoration: "none", fontWeight: 700, fontSize: 14 },
};