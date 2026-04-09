import { useState, useEffect } from "react";
import { getPreferences, savePreferences } from "../services/api";
import { useAuth } from "../context/AuthContext";
import { useNavigate, Link } from "react-router-dom";

const CUISINES = ["Italian","Indian","Japanese","Mexican","American","Chinese","Thai","Mediterranean","Vegan","French","Greek","Korean","Middle Eastern"];
const DIETARY = ["None","Vegetarian","Vegan","Halal","Kosher","Gluten-Free","Dairy-Free","Nut-Free"];
const AMBIANCE = ["Casual","Fine Dining","Family-Friendly","Romantic","Business","Outdoor","Trendy","Quiet","Lively"];
const PRICES = ["$","$$","$$$","$$$$"];
const SORTS = ["Rating","Distance","Popularity","Price"];
const RADII = ["1 mile","5 miles","10 miles","25 miles","50 miles"];

export default function Preferences() {
  const { isLoggedIn } = useAuth();
  const navigate = useNavigate();

  const [prefs, setPrefs] = useState({
    cuisines: [],
    price: "$$",
    dietary: [],
    ambiance: [],
    radius: "10 miles",
    sort: "Rating",
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!isLoggedIn) {
      navigate("/login");
      return;
    }

    const load = async () => {
      try {
        const res = await getPreferences();
        const d = res.data || {};

        setPrefs({
          cuisines:
            typeof d.cuisines === "string" && d.cuisines.trim()
              ? d.cuisines.split(",").map((x) => x.trim())
              : [],
          price: d.price_range || "$$",
          dietary:
            typeof d.dietary === "string" && d.dietary.trim()
              ? d.dietary.split(",").map((x) => x.trim())
              : [],
          ambiance:
            typeof d.ambiance === "string" && d.ambiance.trim()
              ? d.ambiance.split(",").map((x) => x.trim())
              : [],
          radius: d.location_radius || "10 miles",
          sort: d.sort_preference || "Rating",
        });
      } catch (err) {
        console.error("Preferences load error:", err.response?.data || err);
      }
      setLoading(false);
    };

    load();
  }, [isLoggedIn, navigate]);

  const toggle = (key, val) =>
    setPrefs((p) => ({
      ...p,
      [key]: p[key].includes(val)
        ? p[key].filter((x) => x !== val)
        : [...p[key], val],
    }));

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError("");

    try {
      const payload = {
        cuisines: prefs.cuisines.join(", "),
        price_range: prefs.price,
        location_radius: prefs.radius,
        dietary: prefs.dietary.join(", "),
        ambiance: prefs.ambiance.join(", "),
        sort_preference: prefs.sort,
      };

      await savePreferences(payload);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err) {
      console.error("Preferences save error:", err.response?.data || err);
      setError("Failed to save preferences. Please try again.");
    }

    setSaving(false);
  };

  if (loading) return <div style={s.loading}>Loading…</div>;

  return (
    <div style={s.page}>
      <div style={s.container}>
        <div style={s.tabRow}>
          <Link to="/profile" style={s.tab}>Profile</Link>
          <Link to="/preferences" style={s.tabActive}>Preferences</Link>
          <Link to="/favorites" style={s.tab}>Favorites</Link>
          <Link to="/history" style={s.tab}>History</Link>
        </div>

        <h1 style={s.title}>Your Preferences</h1>
        <p style={s.sub}>These preferences power your AI restaurant assistant recommendations.</p>

        {saved && <div style={s.successBox}>✓ Preferences saved!</div>}
        {error && <div style={s.errorBox}>{error}</div>}

        <form onSubmit={handleSave} style={s.form}>
          <div style={s.card}>
            <h2 style={s.section}>Favourite Cuisines</h2>
            <p style={s.hint}>Select all that you enjoy</p>
            <div style={s.chipGrid}>
              {CUISINES.map((c) => (
                <Chip
                  key={c}
                  label={c}
                  active={prefs.cuisines.includes(c)}
                  onToggle={() => toggle("cuisines", c)}
                />
              ))}
            </div>
          </div>

          <div style={s.card}>
            <h2 style={s.section}>Price Range Preference</h2>
            <div style={{ display: "flex", gap: 12 }}>
              {PRICES.map((p) => (
                <button
                  key={p}
                  type="button"
                  onClick={() => setPrefs((pr) => ({ ...pr, price: p }))}
                  style={{ ...s.priceBtn, ...(prefs.price === p ? s.priceActive : {}) }}
                >
                  {p}
                </button>
              ))}
            </div>
          </div>

          <div style={s.card}>
            <h2 style={s.section}>Dietary Needs</h2>
            <div style={s.chipGrid}>
              {DIETARY.map((d) => (
                <Chip
                  key={d}
                  label={d}
                  active={prefs.dietary.includes(d)}
                  onToggle={() => toggle("dietary", d)}
                />
              ))}
            </div>
          </div>

          <div style={s.card}>
            <h2 style={s.section}>Ambiance Preferences</h2>
            <div style={s.chipGrid}>
              {AMBIANCE.map((a) => (
                <Chip
                  key={a}
                  label={a}
                  active={prefs.ambiance.includes(a)}
                  onToggle={() => toggle("ambiance", a)}
                />
              ))}
            </div>
          </div>

          <div style={s.card}>
            <h2 style={s.section}>Search Preferences</h2>
            <div>
              <label style={s.fieldLabel}>Search Radius</label>
              <select
                value={prefs.radius}
                onChange={(e) => setPrefs((p) => ({ ...p, radius: e.target.value }))}
                style={s.input}
              >
                {RADII.map((r) => (
                  <option key={r}>{r}</option>
                ))}
              </select>
            </div>

            <div style={{ marginTop: 16 }}>
              <label style={s.fieldLabel}>Default Sort</label>
              <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginTop: 6 }}>
                {SORTS.map((o) => (
                  <button
                    key={o}
                    type="button"
                    onClick={() => setPrefs((p) => ({ ...p, sort: o }))}
                    style={{ ...s.sortBtn, ...(prefs.sort === o ? s.sortActive : {}) }}
                  >
                    {o}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div style={s.actions}>
            <button
              type="submit"
              className="btn-primary"
              style={{ padding: "12px 40px", fontSize: 15 }}
              disabled={saving}
            >
              {saving ? "Saving…" : "Save Preferences"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function Chip({ label, active, onToggle }) {
  return (
    <button
      type="button"
      onClick={onToggle}
      style={{
        padding: "7px 14px",
        borderRadius: 999,
        border: `1.5px solid ${active ? "#fca5a5" : "#e5e7eb"}`,
        fontSize: 13,
        cursor: "pointer",
        background: active ? "#fdf0f0" : "#fff",
        color: active ? "#d32323" : "#374151",
        fontWeight: active ? 600 : 400,
      }}
    >
      {label}
    </button>
  );
}

const s = {
  page: { background: "#f9f8f6", minHeight: "100vh", padding: "32px 24px 60px" },
  container: { maxWidth: 780, margin: "0 auto" },
  loading: { textAlign: "center", padding: 80, color: "#9ca3af" },
  tabRow: { display: "flex", gap: 0, marginBottom: 28, borderBottom: "2px solid #f0eeeb" },
  tab: { padding: "10px 20px", fontSize: 14, fontWeight: 500, color: "#6b7280", textDecoration: "none", borderBottom: "2px solid transparent", marginBottom: -2 },
  tabActive: { padding: "10px 20px", fontSize: 14, fontWeight: 700, color: "#d32323", textDecoration: "none", borderBottom: "2px solid #d32323", marginBottom: -2 },
  title: { fontSize: 26, fontWeight: 700, marginBottom: 6 },
  sub: { fontSize: 14, color: "#6b7280", marginBottom: 24 },
  successBox: { background: "#f0fdf4", border: "1px solid #86efac", color: "#166534", borderRadius: 8, padding: "10px 14px", fontSize: 14, marginBottom: 16 },
  errorBox: { background: "#fdf0f0", border: "1px solid #fca5a5", color: "#b91c1c", borderRadius: 8, padding: "10px 14px", fontSize: 14, marginBottom: 16 },
  form: { display: "flex", flexDirection: "column", gap: 20 },
  card: { background: "#fff", border: "1px solid #f0eeeb", borderRadius: 14, padding: 24 },
  section: { fontSize: 16, fontWeight: 700, marginBottom: 8 },
  hint: { fontSize: 13, color: "#9ca3af", marginBottom: 14 },
  chipGrid: { display: "flex", flexWrap: "wrap", gap: 8 },
  priceBtn: { width: 56, height: 42, borderRadius: 8, border: "1.5px solid #e5e7eb", background: "#fff", fontSize: 14, cursor: "pointer", fontWeight: 600, color: "#374151" },
  priceActive: { background: "#fdf0f0", border: "1.5px solid #fca5a5", color: "#d32323" },
  fieldLabel: { display: "block", fontSize: 13, fontWeight: 600, color: "#374151", marginBottom: 6 },
  input: { width: "100%", padding: "10px 13px", borderRadius: 8, border: "1.5px solid #e5e7eb", fontSize: 14, background: "#fff" },
  sortBtn: { padding: "8px 18px", borderRadius: 999, border: "1.5px solid #e5e7eb", background: "#fff", fontSize: 13, cursor: "pointer", color: "#374151" },
  sortActive: { background: "#fdf0f0", border: "1.5px solid #fca5a5", color: "#d32323", fontWeight: 600 },
  actions: { display: "flex", justifyContent: "flex-end" },
};