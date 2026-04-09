function Footer() {
  return (
    <footer style={s.footer}>
      <div style={s.inner}>
        <div style={s.brand}>
          <span style={s.logo}>yelp★</span>
          <p style={s.tagline}>Connecting people with great local businesses.</p>
        </div>
        <div style={s.links}>
          <div style={s.col}>
            <div style={s.colTitle}>Discover</div>
            <a style={s.link} href="/explore">Restaurants</a>
            <a style={s.link} href="/explore?cuisine=Cafés">Cafés</a>
            <a style={s.link} href="/explore?cuisine=Nightlife">Nightlife</a>
          </div>
          <div style={s.col}>
            <div style={s.colTitle}>Account</div>
            <a style={s.link} href="/login">Log In</a>
            <a style={s.link} href="/signup">Sign Up</a>
            <a style={s.link} href="/profile">Profile</a>
          </div>
        </div>
      </div>
      <div style={s.bottom}>© 2026 YelpApp Prototype · Built for DS Lab 1</div>
    </footer>
  );
}

const s = {
  footer: { background: "#1a1a1a", color: "#9ca3af", padding: "48px 24px 24px", marginTop: 80 },
  inner: { maxWidth: 1200, margin: "0 auto", display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: 32, marginBottom: 40 },
  brand: { maxWidth: 260 },
  logo: { fontFamily: "'Sora',sans-serif", fontSize: 26, fontWeight: 900, color: "#fff", letterSpacing: -0.5 },
  tagline: { marginTop: 10, fontSize: 14, lineHeight: 1.6 },
  links: { display: "flex", gap: 48, flexWrap: "wrap" },
  col: { display: "flex", flexDirection: "column", gap: 10 },
  colTitle: { color: "#fff", fontWeight: 600, fontSize: 14, marginBottom: 4 },
  link: { fontSize: 14, color: "#9ca3af", transition: "color 0.15s" },
  bottom: { maxWidth: 1200, margin: "0 auto", borderTop: "1px solid #2d2d2d", paddingTop: 20, fontSize: 13, textAlign: "center" },
};

export default Footer;
