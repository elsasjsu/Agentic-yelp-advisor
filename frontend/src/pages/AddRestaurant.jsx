import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { createRestaurant, createOwnerRestaurant } from "../services/api";
import { useAuth } from "../context/AuthContext";

const CUISINES = ["Italian","Indian","Japanese","Mexican","American","Chinese","Thai","Mediterranean","Vegan","Fast Food","French","Greek","Korean","Middle Eastern","Other"];
const PRICES = ["$","$$","$$$","$$$$"];
const AMENITIES = ["WiFi","Outdoor Seating","Parking","Family-Friendly","Wheelchair Accessible","Live Music","Takeout","Delivery","Reservation Required","Pet-Friendly"];
const HOURS_TEMPLATE = "Mon–Fri: 11am–10pm, Sat–Sun: 10am–11pm";

export default function AddRestaurant() {
  const { isLoggedIn } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: "", cuisine: "Italian", description: "", address: "", city: "",
    state: "", zip: "", phone: "", website: "", hours: "", price: "$$",
    amenities: [],
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  if (!isLoggedIn) {
    return (
      <div style={s.page}>
        <div style={s.loginBox}>
          <h2>Please log in to add a restaurant</h2>
          <button className="btn-primary" onClick={() => navigate("/login")} style={{ marginTop: 16 }}>Go to Login</button>
        </div>
      </div>
    );
  }

  const set = (k) => (e) => setForm(f => ({ ...f, [k]: e.target.value }));

  const toggleAmenity = (a) => {
    setForm(f => ({
      ...f,
      amenities: f.amenities.includes(a) ? f.amenities.filter(x => x !== a) : [...f.amenities, a],
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!form.name.trim()) {
      setError("Restaurant name is required.");
      return;
    }

    if (!form.city.trim()) {
      setError("City is required.");
      return;
    }

    setLoading(true);

    try {
      const payload = {
        name: form.name,
        cuisine_type: form.cuisine,
        description: form.description,
        address: form.address,
        city: form.city,
        zip: form.zip,
        contact_info: form.phone || form.website || null,
        hours: form.hours,
        pricing_tier: form.price,
        amenities: form.amenities.join(", "),
        photos: null,
      };

        const role = localStorage.getItem("role");

        console.log("role:", role);
        console.log(role === "owner" ? "Calling owner create route" : "Calling user create route");
        console.log("payload:", payload);

        const res =
          role === "owner"
            ? await createOwnerRestaurant(payload)
            : await createRestaurant(payload);

        navigate(`/restaurant/${res.data.id}`);
      } catch (err) {
        console.error("Create restaurant error:", err.response?.data || err);
        setError(err.response?.data?.detail || "Failed to create restaurant. Please try again.");
      } finally {
        setLoading(false);
      }
    };

  return (
    <div style={s.page}>
      <div style={s.container}>
        <h1 style={s.title}>Add a Restaurant</h1>
        <p style={s.sub}>Help others discover great places to eat.</p>

        {error && <div style={s.errorBox}>{error}</div>}

        <form onSubmit={handleSubmit} style={s.form}>
          {/* Basic info */}
          <div style={s.card}>
            <h2 style={s.section}>Basic Information</h2>
            <div style={s.grid2}>
              <Field label="Restaurant Name *" required>
                <input type="text" value={form.name} onChange={set("name")} style={s.input} required />
              </Field>
              <Field label="Cuisine Type *">
                <select value={form.cuisine} onChange={set("cuisine")} style={s.input}>
                  {CUISINES.map(c => <option key={c}>{c}</option>)}
                </select>
              </Field>
            </div>
            <Field label="Description">
              <textarea value={form.description} onChange={set("description")} rows={4} placeholder="Describe the restaurant, ambiance, specialties…" style={s.textarea} />
            </Field>
            <div style={s.grid2}>
              <Field label="Price Range">
                <select value={form.price} onChange={set("price")} style={s.input}>
                  {PRICES.map(p => <option key={p}>{p}</option>)}
                </select>
              </Field>
              <Field label="Hours of Operation">
                <input type="text" value={form.hours} onChange={set("hours")} placeholder={HOURS_TEMPLATE} style={s.input} />
              </Field>
            </div>
          </div>

          {/* Location */}
          <div style={s.card}>
            <h2 style={s.section}>Location</h2>
            <Field label="Street Address">
              <input type="text" value={form.address} onChange={set("address")} placeholder="123 Main St" style={s.input} />
            </Field>
            <div style={s.grid3}>
              <Field label="City *">
                <input type="text" value={form.city} onChange={set("city")} style={s.input} required />
              </Field>
              <Field label="State (abbreviated)">
                <input type="text" value={form.state} onChange={set("state")} placeholder="CA" maxLength={2} style={s.input} />
              </Field>
              <Field label="ZIP Code">
                <input type="text" value={form.zip} onChange={set("zip")} placeholder="95101" style={s.input} />
              </Field>
            </div>
          </div>

          {/* Contact */}
          <div style={s.card}>
            <h2 style={s.section}>Contact Information</h2>
            <div style={s.grid2}>
              <Field label="Phone Number">
                <input type="tel" value={form.phone} onChange={set("phone")} placeholder="(408) 555-0000" style={s.input} />
              </Field>
              <Field label="Website">
                <input type="url" value={form.website} onChange={set("website")} placeholder="https://" style={s.input} />
              </Field>
            </div>
          </div>

          {/* Amenities */}
          <div style={s.card}>
            <h2 style={s.section}>Amenities</h2>
            <div style={s.amenityGrid}>
              {AMENITIES.map(a => (
                <label key={a} style={{ ...s.amenityLabel, ...(form.amenities.includes(a) ? s.amenityActive : {}) }}>
                  <input type="checkbox" checked={form.amenities.includes(a)} onChange={() => toggleAmenity(a)} style={{ display: "none" }} />
                  {a}
                </label>
              ))}
            </div>
          </div>

          <div style={s.actions}>
            <button type="button" onClick={() => navigate(-1)} style={s.cancelBtn}>Cancel</button>
            <button type="submit" className="btn-primary" style={{ padding: "12px 36px", fontSize: 15 }} disabled={loading}>
              {loading ? "Creating…" : "Add Restaurant"}
            </button>
          </div>
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
  loginBox: { maxWidth: 400, margin: "80px auto", background: "#fff", borderRadius: 16, padding: 40, textAlign: "center", boxShadow: "0 2px 16px rgba(0,0,0,0.07)" },
  title: { fontSize: 28, fontWeight: 700, marginBottom: 6 },
  sub: { fontSize: 15, color: "#6b7280", marginBottom: 28 },
  errorBox: { background: "#fdf0f0", border: "1px solid #fca5a5", color: "#b91c1c", borderRadius: 8, padding: "10px 14px", fontSize: 14, marginBottom: 20 },
  form: { display: "flex", flexDirection: "column", gap: 20 },
  card: { background: "#fff", border: "1px solid #f0eeeb", borderRadius: 14, padding: 24 },
  section: { fontSize: 17, fontWeight: 700, marginBottom: 18, paddingBottom: 10, borderBottom: "1px solid #f0eeeb" },
  input: { width: "100%", padding: "11px 14px", borderRadius: 8, border: "1.5px solid #e5e7eb", fontSize: 14, background: "#fff" },
  textarea: { width: "100%", padding: "11px 14px", borderRadius: 8, border: "1.5px solid #e5e7eb", fontSize: 14, resize: "vertical", lineHeight: 1.5 },
  grid2: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 },
  grid3: { display: "grid", gridTemplateColumns: "1fr 80px 100px", gap: 16 },
  amenityGrid: { display: "flex", flexWrap: "wrap", gap: 8 },
  amenityLabel: { padding: "7px 14px", borderRadius: 999, border: "1.5px solid #e5e7eb", fontSize: 13, cursor: "pointer", userSelect: "none", color: "#374151" },
  amenityActive: { background: "#fdf0f0", border: "1.5px solid #fca5a5", color: "#d32323", fontWeight: 600 },
  actions: { display: "flex", justifyContent: "flex-end", gap: 12, paddingTop: 8 },
  cancelBtn: { background: "#fff", border: "1.5px solid #e5e7eb", borderRadius: 999, padding: "12px 24px", fontSize: 15, cursor: "pointer", color: "#374151" },
};
