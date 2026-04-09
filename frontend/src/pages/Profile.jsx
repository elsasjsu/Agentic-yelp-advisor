import { useState, useEffect } from "react";
import { getMe, updateMe } from "../services/api";
import { useAuth } from "../context/AuthContext";
import { useNavigate, Link } from "react-router-dom";

const COUNTRIES = ["United States","Canada","United Kingdom","Australia","India","Germany","France","Japan","Brazil","Mexico","Singapore","South Korea","Other"];
const LANGUAGES = ["English","Spanish","French","German","Hindi","Japanese","Mandarin","Portuguese","Arabic","Korean","Italian","Other"];
const GENDERS = ["Prefer not to say","Male","Female","Non-binary","Other"];

export default function Profile() {
  const { user, updateUser, isLoggedIn } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: "", email: "", phone: "", about: "", city: "", country: "United States", state: "", gender: "Prefer not to say", languages: [] });
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!isLoggedIn) { navigate("/login"); return; }
    const load = async () => {
      try {
        const res = await getMe();
        const d = res.data;
        setForm({
          name: d.name || "",
          email: d.email || "",
          phone: d.phone || "",
          about: d.about || "",
          city: d.city || "",
          country: d.country || "United States",
          state: d.state || "",
          gender: d.gender || "Prefer not to say",
          languages:
            typeof d.languages === "string" && d.languages.trim()
              ? d.languages.split(",").map((x) => x.trim())
              : [],
        });
      } catch {
        if (user) setForm(f => ({ ...f, name: user.name || "", email: user.email || "" }));
      }
      setLoading(false);
    };
    load();
  }, [isLoggedIn]);

  const set = (k) => (e) => setForm(f => ({ ...f, [k]: e.target.value }));

  const toggleLang = (l) => setForm(f => ({
    ...f,
    languages: f.languages.includes(l) ? f.languages.filter(x => x !== l) : [...f.languages, l],
  }));

  const handleSave = async (e) => {
   e.preventDefault();
   setSaving(true);
   setError("");

  try {
    const payload = {
      name: form.name,
      phone: form.phone,
      about: form.about,
      city: form.city,
      country: form.country,
      languages: form.languages.join(", "),
      gender: form.gender,
    };

    await updateMe(payload);

    updateUser(form);
    setSaved(true);
    setEditing(false);
    setTimeout(() => setSaved(false), 3000);
  } catch (err) {
    console.error("Profile save error:", err.response?.data || err);
    setError("Failed to save. Please try again.");
  }
    setSaving(false);
  };

  if (loading) return <div style={s.loading}>Loading profile…</div>;

  const initials = form.name ? form.name.split(" ").map(w => w[0]).join("").toUpperCase().slice(0, 2) : "?";

  return (
    <div style={s.page}>
      <div style={s.container}>
        <div style={s.avatarSection}>
          <div style={s.avatar}>{initials}</div>
          <div>
            <h1 style={s.displayName}>{form.name || "Your Profile"}</h1>
            <p style={s.displayEmail}>{form.email}</p>
            {form.city && <p style={s.displayCity}>📍 {form.city}{form.state ? `, ${form.state}` : ""}</p>}
          </div>
          {!editing && (
            <button onClick={() => setEditing(true)} className="btn-outline" style={{ marginLeft: "auto" }}>Edit Profile</button>
          )}
        </div>

        {saved && <div style={s.successBox}>✓ Profile updated successfully!</div>}
        {error && <div style={s.errorBox}>{error}</div>}

        <div style={s.tabRow}>
          <Link to="/profile" style={s.tabActive}>Profile</Link>
          <Link to="/preferences" style={s.tab}>Preferences</Link>
          <Link to="/favorites" style={s.tab}>Favorites</Link>
          <Link to="/history" style={s.tab}>History</Link>
        </div>

        <form onSubmit={handleSave} style={s.form}>
          <div style={s.card}>
            <h2 style={s.section}>Personal Info</h2>
            <div style={s.grid2}>
              <Field label="Full Name"><input type="text" value={form.name} onChange={set("name")} style={s.input} disabled={!editing} /></Field>
              <Field label="Email"><input type="email" value={form.email} onChange={set("email")} style={s.input} disabled={!editing} /></Field>
              <Field label="Phone Number"><input type="tel" value={form.phone} onChange={set("phone")} placeholder="(555) 000-0000" style={s.input} disabled={!editing} /></Field>
              <Field label="Gender">
                <select value={form.gender} onChange={set("gender")} style={s.input} disabled={!editing}>
                  {GENDERS.map(g => <option key={g}>{g}</option>)}
                </select>
              </Field>
            </div>
            <Field label="About Me">
              <textarea value={form.about} onChange={set("about")} rows={3} placeholder="Tell others about yourself…" style={s.textarea} disabled={!editing} />
            </Field>
          </div>

          <div style={s.card}>
            <h2 style={s.section}>Location</h2>
            <div style={s.grid3}>
              <Field label="City"><input type="text" value={form.city} onChange={set("city")} style={s.input} disabled={!editing} /></Field>
              <Field label="State (abbr)"><input type="text" value={form.state} onChange={set("state")} maxLength={2} placeholder="CA" style={s.input} disabled={!editing} /></Field>
              <Field label="Country">
                <select value={form.country} onChange={set("country")} style={s.input} disabled={!editing}>
                  {COUNTRIES.map(c => <option key={c}>{c}</option>)}
                </select>
              </Field>
            </div>
          </div>

          <div style={s.card}>
            <h2 style={s.section}>Languages</h2>
            <div style={s.chipGrid}>
              {LANGUAGES.map(l => (
                <label key={l} style={{ ...s.chip, ...(form.languages.includes(l) ? s.chipActive : {}), cursor: editing ? "pointer" : "default", opacity: editing ? 1 : 0.8 }}>
                  <input type="checkbox" checked={form.languages.includes(l)} onChange={() => editing && toggleLang(l)} style={{ display: "none" }} />
                  {l}
                </label>
              ))}
            </div>
          </div>

          {editing && (
            <div style={s.actions}>
              <button type="button" onClick={() => setEditing(false)} style={s.cancelBtn}>Cancel</button>
              <button type="submit" className="btn-primary" style={{ padding: "12px 32px" }} disabled={saving}>
                {saving ? "Saving…" : "Save Changes"}
              </button>
            </div>
          )}
        </form>
      </div>
    </div>
  );
}

function Field({ label, children }) {
  return (
    <div style={{ marginBottom: 16 }}>
      <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "#374151", marginBottom: 6 }}>{label}</label>
      {children}
    </div>
  );
}

const s = {
  page: { background: "#f9f8f6", minHeight: "100vh", padding: "32px 24px 60px" },
  container: { maxWidth: 780, margin: "0 auto" },
  loading: { textAlign: "center", padding: 80, color: "#9ca3af" },
  avatarSection: { display: "flex", alignItems: "center", gap: 20, marginBottom: 28, flexWrap: "wrap" },
  avatar: { width: 80, height: 80, borderRadius: "50%", background: "linear-gradient(135deg,#d32323,#ff6b6b)", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 28, fontWeight: 700, flexShrink: 0 },
  displayName: { fontSize: 24, fontWeight: 700, marginBottom: 2 },
  displayEmail: { fontSize: 14, color: "#6b7280" },
  displayCity: { fontSize: 13, color: "#9ca3af", marginTop: 2 },
  successBox: { background: "#f0fdf4", border: "1px solid #86efac", color: "#166534", borderRadius: 8, padding: "10px 14px", fontSize: 14, marginBottom: 16 },
  errorBox: { background: "#fdf0f0", border: "1px solid #fca5a5", color: "#b91c1c", borderRadius: 8, padding: "10px 14px", fontSize: 14, marginBottom: 16 },
  tabRow: { display: "flex", gap: 0, marginBottom: 24, borderBottom: "2px solid #f0eeeb" },
  tab: { padding: "10px 20px", fontSize: 14, fontWeight: 500, color: "#6b7280", textDecoration: "none", borderBottom: "2px solid transparent", marginBottom: -2 },
  tabActive: { padding: "10px 20px", fontSize: 14, fontWeight: 700, color: "#d32323", textDecoration: "none", borderBottom: "2px solid #d32323", marginBottom: -2 },
  form: { display: "flex", flexDirection: "column", gap: 20 },
  card: { background: "#fff", border: "1px solid #f0eeeb", borderRadius: 14, padding: 24 },
  section: { fontSize: 16, fontWeight: 700, marginBottom: 18, paddingBottom: 10, borderBottom: "1px solid #f0eeeb" },
  input: { width: "100%", padding: "10px 13px", borderRadius: 8, border: "1.5px solid #e5e7eb", fontSize: 14, background: "#fff" },
  textarea: { width: "100%", padding: "10px 13px", borderRadius: 8, border: "1.5px solid #e5e7eb", fontSize: 14, resize: "vertical", lineHeight: 1.5 },
  grid2: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 },
  grid3: { display: "grid", gridTemplateColumns: "1fr 80px 1fr", gap: 16 },
  chipGrid: { display: "flex", flexWrap: "wrap", gap: 8 },
  chip: { padding: "6px 14px", borderRadius: 999, border: "1.5px solid #e5e7eb", fontSize: 13, userSelect: "none", color: "#374151" },
  chipActive: { background: "#fdf0f0", border: "1.5px solid #fca5a5", color: "#d32323", fontWeight: 600 },
  actions: { display: "flex", justifyContent: "flex-end", gap: 12 },
  cancelBtn: { background: "#fff", border: "1.5px solid #e5e7eb", borderRadius: 999, padding: "12px 24px", fontSize: 15, cursor: "pointer" },
};
