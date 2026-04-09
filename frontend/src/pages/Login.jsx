import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { login, ownerLogin } from "../services/api";
import { useAuth } from "../context/AuthContext";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("user");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const { loginCtx } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res =
        role === "owner"
          ? await ownerLogin(email.trim().toLowerCase(), password)
          : await login(email.trim().toLowerCase(), password);

      const token = res.data.access_token;
      const userData = res.data.user || {
        email: email.trim().toLowerCase(),
        name: email.split("@")[0],
        role,
      };

      await loginCtx(token, userData);
      localStorage.setItem("role", role);

      if (role === "owner") {
        navigate("/owner-dashboard");
      } else {
        navigate("/");
      }
    } catch (err) {
      console.error("Login error:", err);
      setError(err.response?.data?.detail || "Invalid email or password.");
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
          <h1 style={s.title}>Sign in to Yelp</h1>
          <p style={s.subtitle}>Connect with great local businesses</p>

          {error && <div style={s.errorBox}>{error}</div>}

          <form onSubmit={handleSubmit} style={s.form}>
            <div style={s.field}>
              <label style={s.label}>Login as</label>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value)}
                style={s.input}
              >
                <option value="user">User</option>
                <option value="owner">Owner</option>
              </select>
            </div>

            <div style={s.field}>
              <label style={s.label}>Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                style={s.input}
                required
                autoFocus
              />
            </div>

            <div style={s.field}>
              <label style={s.label}>Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                style={s.input}
                required
              />
            </div>

            <button
              type="submit"
              className="btn-primary"
              style={s.submitBtn}
              disabled={loading}
            >
              {loading ? "Signing in..." : "Log in"}
            </button>
          </form>

          <p style={s.switchText}>
            New to Yelp?{" "}
            <Link to="/signup" style={s.switchLink}>Sign up</Link>
          </p>
        </div>
      </div>
    </div>
  );
}

const s = {
  page: {
    minHeight: "100vh",
    backgroundImage:
      "url('https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=1600&q=80')",
    backgroundSize: "cover",
    backgroundPosition: "center",
  },
  overlay: {
    minHeight: "100vh",
    background: "rgba(0,0,0,0.55)",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  modal: {
    width: "100%",
    maxWidth: 460,
    background: "#fff",
    borderRadius: 16,
    padding: "36px 36px 28px",
    position: "relative",
    boxShadow: "0 20px 60px rgba(0,0,0,0.3)",
    textAlign: "center",
  },
  closeBtn: {
    position: "absolute",
    top: 16,
    right: 18,
    width: 36,
    height: 36,
    borderRadius: "50%",
    background: "#f2f2f2",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: 24,
    color: "#444",
    lineHeight: 1,
    textDecoration: "none",
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: "50%",
    background: "#ede9e4",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: 28,
    margin: "0 auto 16px",
  },
  title: {
    fontSize: 26,
    fontWeight: 700,
    color: "#1a1a1a",
    marginBottom: 6,
  },
  subtitle: {
    fontSize: 15,
    color: "#6b7280",
    marginBottom: 20,
  },
  errorBox: {
    background: "#fdf0f0",
    border: "1px solid #fca5a5",
    color: "#b91c1c",
    borderRadius: 8,
    padding: "10px 14px",
    fontSize: 14,
    marginBottom: 16,
  },
  form: {
    display: "flex",
    flexDirection: "column",
    gap: 14,
    textAlign: "left",
  },
  field: {
    display: "flex",
    flexDirection: "column",
    gap: 6,
  },
  label: {
    fontSize: 13,
    fontWeight: 600,
    color: "#374151",
  },
  input: {
    padding: "12px 14px",
    borderRadius: 8,
    border: "1.5px solid #e5e7eb",
    fontSize: 15,
    width: "100%",
    transition: "border-color 0.15s",
  },
  submitBtn: {
    width: "100%",
    marginTop: 4,
    padding: "13px",
    fontSize: 15,
  },
  switchText: {
    marginTop: 24,
    fontSize: 14,
    color: "#6b7280",
  },
  switchLink: {
    color: "#d32323",
    fontWeight: 700,
  },
};