import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { register, ownerRegister, login as apiLogin, ownerLogin } from "../services/api";

const COUNTRIES = ["United States","Canada","United Kingdom","Australia","India","Germany","France","Japan","Brazil","Mexico","Other"];

export default function Signup() {
  const [form, setForm] = useState({ name: "", email: "", password: "", role: "user", restaurant_location: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { loginCtx } = useAuth();
  const navigate = useNavigate();

  const set = (k) => (e) => setForm(f => ({ ...f, [k]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (form.password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }

    setLoading(true);

    try {
      const payload =
        form.role === "owner"
          ? {
              name: form.name,
              email: form.email,
              password: form.password,
              location: form.restaurant_location,
            }
          : {
              name: form.name,
              email: form.email,
              password: form.password,
            };

      if (form.role === "owner") {
        await ownerRegister(payload);
        const res = await ownerLogin(form.email, form.password);
        const token = res.data.access_token;
        const userData = res.data.user || {
          email: form.email,
          name: form.name,
          role: "owner",
        };

        await loginCtx(token, userData);
        localStorage.setItem("role", "owner");
        navigate("/owner-dashboard");
      } else {
        await register(payload);
        const res = await apiLogin(form.email, form.password);
        const token = res.data.access_token;
        const userData = res.data.user || {
          email: form.email,
          name: form.name,
          role: "user",
        };

        await loginCtx(token, userData);
        localStorage.setItem("role", "user");
        navigate("/");
      }
    } catch (err) {
      console.error("Signup error:", err);
      setError(err.response?.data?.detail || "Registration failed. Try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={s.page}>
      <div style={s.overlay}>
        <div style={s.modal}>
          <Link to="/" style={s.closeBtn}>×</Link>
          <div style={s.avatar}>👤</div>
          <h1 style={s.title}>Sign up for Yelp</h1>
          <p style={s.subtitle}>Discover and share local favorites</p>

          {error && <div style={s.errorBox}>{error}</div>}

          <form onSubmit={handleSubmit} style={s.form}>
            <div style={s.field}>
              <label style={s.label}>Full Name</label>
              <input type="text" value={form.name} onChange={set("name")} style={s.input} required />
            </div>
            <div style={s.field}>
              <label style={s.label}>Email</label>
              <input type="email" value={form.email} onChange={set("email")} style={s.input} required />
            </div>
            <div style={s.field}>
              <label style={s.label}>Password</label>
              <input type="password" value={form.password} onChange={set("password")} style={s.input} required minLength={6} />
            </div>
            <div style={s.field}>
              <label style={s.label}>I am a…</label>
              <select value={form.role} onChange={set("role")} style={s.input}>
                <option value="user">User (Reviewer)</option>
                <option value="owner">Restaurant Owner</option>
              </select>
            </div>
            {form.role === "owner" && (
              <div style={s.field}>
                <label style={s.label}>Restaurant Location</label>
                <input type="text" value={form.restaurant_location} onChange={set("restaurant_location")} placeholder="City, State" style={s.input} required />
              </div>
            )}
            <button type="submit" className="btn-primary" style={s.submitBtn} disabled={loading}>
              {loading ? "Creating account…" : "Sign up"}
            </button>
          </form>

          <p style={s.switchText}>
            Already on Yelp?{" "}
            <Link to="/login" style={s.switchLink}>Log in</Link>
          </p>
        </div>
      </div>
    </div>
  );
}

const s = {
  page: { minHeight: "100vh", backgroundImage: "url('https://images.unsplash.com/photo-1414235077428-338989a2e8c0?auto=format&fit=crop&w=1600&q=80')", backgroundSize: "cover", backgroundPosition: "center" },
  overlay: { minHeight: "100vh", background: "rgba(0,0,0,0.55)", display: "flex", justifyContent: "center", alignItems: "center", padding: 20 },
  modal: { width: "100%", maxWidth: 480, background: "#fff", borderRadius: 16, padding: "36px 36px 28px", position: "relative", boxShadow: "0 20px 60px rgba(0,0,0,0.3)", textAlign: "center" },
  closeBtn: { position: "absolute", top: 16, right: 18, width: 36, height: 36, borderRadius: "50%", background: "#f2f2f2", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 24, color: "#444", textDecoration: "none" },
  avatar: { width: 60, height: 60, borderRadius: "50%", background: "#ede9e4", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 28, margin: "0 auto 16px" },
  title: { fontSize: 26, fontWeight: 700, color: "#1a1a1a", marginBottom: 6 },
  subtitle: { fontSize: 15, color: "#6b7280", marginBottom: 20 },
  errorBox: { background: "#fdf0f0", border: "1px solid #fca5a5", color: "#b91c1c", borderRadius: 8, padding: "10px 14px", fontSize: 14, marginBottom: 16 },
  form: { display: "flex", flexDirection: "column", gap: 14, textAlign: "left" },
  field: { display: "flex", flexDirection: "column", gap: 6 },
  label: { fontSize: 13, fontWeight: 600, color: "#374151" },
  input: { padding: "12px 14px", borderRadius: 8, border: "1.5px solid #e5e7eb", fontSize: 15, width: "100%", background: "#fff" },
  submitBtn: { width: "100%", marginTop: 4, padding: "13px", fontSize: 15 },
  switchText: { marginTop: 24, fontSize: 14, color: "#6b7280" },
  switchLink: { color: "#d32323", fontWeight: 700 },
};
