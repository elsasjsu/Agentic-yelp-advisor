import { useState, useRef, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { chatWithAssistant } from "../services/api";
import { useAuth } from "../context/AuthContext";

const FEATURED = [
  { id: 1, name: "Pasta Paradise", cuisine: "Italian", rating: 4.5, price: "$$", img: "https://images.unsplash.com/photo-1555949258-eb67b1ef0ceb?w=400&q=80" },
  { id: 2, name: "Spice Garden", cuisine: "Indian", rating: 4.7, price: "$$", img: "https://images.unsplash.com/photo-1565557623262-b51c2513a641?w=400&q=80" },
  { id: 3, name: "Sushi Corner", cuisine: "Japanese", rating: 4.8, price: "$$$", img: "https://images.unsplash.com/photo-1553621042-f6e147245754?w=400&q=80" },
];

const QUICK_PROMPTS = ["Find dinner tonight", "Best rated near me", "Vegan options", "Something romantic"];

function Stars({ rating }) {
  return (
    <span>
      {[1,2,3,4,5].map(i => (
        <span key={i} style={{ color: i <= rating ? "#f5a623" : "#d1d5db", fontSize: 14 }}>★</span>
      ))}
    </span>
  );
}

export default function Home() {
  const { isLoggedIn } = useAuth();
  const navigate = useNavigate();
  const [messages, setMessages] = useState([
    { sender: "assistant", text: "Hi! I'm your restaurant assistant. Ask me anything like \"Find a cozy Italian place\" or \"Vegan options nearby\"." }
  ]);
  const [input, setInput] = useState("");
  const [aiLoading, setAiLoading] = useState(false);
  const chatRef = useRef(null);
  const [searchQ, setSearchQ] = useState("");

  useEffect(() => {
    if (chatRef.current) chatRef.current.scrollTop = chatRef.current.scrollHeight;
  }, [messages]);

  const sendMessage = async (text) => {
    const msg = text || input.trim();
    if (!msg) return;
    setInput("");
    const history = messages.map(m => m.text);
    setMessages(prev => [...prev, { sender: "user", text: msg }]);
    setAiLoading(true);
    try {
      const res = await chatWithAssistant(msg, history);
      const reply = res.data?.response || "Here are some recommendations based on your query!";
      setMessages(prev => [...prev, { sender: "assistant", text: reply }]);
    } catch (err) {
      console.error("AI chat failed:", err.response?.data || err);
      setMessages((prev) => [
      ...prev,
      {
        sender: "assistant",
        text: "I'm having trouble connecting right now. Try exploring restaurants directly!",
      },
    ]);
    } finally {
    setAiLoading(false);
    }
  };
  return (
    <div>
      {/* Hero */}
      <section style={s.hero}>
        <div style={s.heroContent}>
          <h1 style={s.heroTitle}>Discover great places to eat</h1>
          <p style={s.heroSub}>Search restaurants, browse local favorites, and find your next great meal.</p>
          <form onSubmit={e => { e.preventDefault(); if (searchQ.trim()) navigate(`/explore?q=${encodeURIComponent(searchQ)}`); }} style={s.heroSearch}>
            <input
              type="text"
              placeholder="Search restaurants, cuisine, or location…"
              value={searchQ}
              onChange={e => setSearchQ(e.target.value)}
              style={s.heroInput}
            />
            <button type="submit" className="btn-primary" style={{ borderRadius: "0 8px 8px 0", padding: "0 24px" }}>Search</button>
          </form>
        </div>
      </section>

      <div style={s.twoCol}>
        {/* Left: AI Chatbot */}
        <section style={s.chatSection}>
          <div style={s.chatHeader}>
            <span style={s.chatIcon}>🤖</span>
            <div>
              <h2 style={s.chatTitle}>AI Restaurant Assistant</h2>
              <p style={s.chatSub}>Ask anything — cuisine, mood, dietary needs</p>
            </div>
          </div>

          <div style={s.quickBtns}>
            {QUICK_PROMPTS.map(p => (
              <button key={p} onClick={() => sendMessage(p)} style={s.quickBtn}>{p}</button>
            ))}
          </div>

          <div ref={chatRef} style={s.chatBox}>
            {messages.map((m, i) => (
              <div key={i} style={{ display: "flex", justifyContent: m.sender === "user" ? "flex-end" : "flex-start", marginBottom: 10 }}>
                <div style={{ ...s.bubble, ...(m.sender === "user" ? s.bubbleUser : s.bubbleBot) }}>
                  {m.text}
                </div>
              </div>
            ))}
            {aiLoading && (
              <div style={{ display: "flex", justifyContent: "flex-start", marginBottom: 10 }}>
                <div style={{ ...s.bubble, ...s.bubbleBot, color: "#9ca3af" }}>Thinking…</div>
              </div>
            )}
          </div>

          <div style={s.inputRow}>
            <input
              type="text"
              placeholder="Ask for recommendations…"
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === "Enter" && sendMessage()}
              style={s.chatInput}
            />
            <button onClick={() => sendMessage()} className="btn-primary" style={{ borderRadius: "0 8px 8px 0", padding: "0 20px" }} disabled={aiLoading}>
              Send
            </button>
          </div>

          <button onClick={() => setMessages([{ sender: "assistant", text: "Chat cleared! How can I help you?" }])} style={s.clearBtn}>
            Clear chat
          </button>
        </section>

        {/* Right: Featured */}
        <aside style={s.aside}>
          <h2 style={s.sectionTitle}>🏆 Top Picks</h2>
          {FEATURED.map(r => (
            <Link to={`/restaurant/${r.id}`} key={r.id} style={s.featCard}>
              <img src={r.img} alt={r.name} style={s.featImg} />
              <div style={s.featInfo}>
                <div style={s.featName}>{r.name}</div>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 4 }}>
                  <Stars rating={Math.floor(r.rating)} />
                  <span style={s.featMeta}>{r.rating}</span>
                  <span style={s.featMeta}>· {r.cuisine}</span>
                  <span style={s.featMeta}>· {r.price}</span>
                </div>
              </div>
            </Link>
          ))}
          <Link to="/explore" className="btn-outline" style={{ display: "block", textAlign: "center", marginTop: 16 }}>
            Browse all restaurants →
          </Link>

          {!isLoggedIn && (
            <div style={s.joinBox}>
              <h3 style={s.joinTitle}>Join Yelp today</h3>
              <p style={s.joinText}>Write reviews, save favorites, and get personalized recommendations.</p>
              <Link to="/signup" className="btn-primary" style={{ display: "block", textAlign: "center", marginTop: 12 }}>Sign up free</Link>
            </div>
          )}
        </aside>
      </div>

      {/* Categories */}
      <section style={s.catSection}>
        <h2 style={s.sectionTitle}>Browse by Cuisine</h2>
        <div style={s.catGrid}>
          {[
            { label: "Italian", emoji: "🍝" }, { label: "Indian", emoji: "🍛" },
            { label: "Japanese", emoji: "🍱" }, { label: "Mexican", emoji: "🌮" },
            { label: "American", emoji: "🍔" }, { label: "Chinese", emoji: "🥡" },
            { label: "Thai", emoji: "🍜" }, { label: "Mediterranean", emoji: "🥗" },
          ].map(c => (
            <Link key={c.label} to={`/explore?cuisine=${c.label}`} style={s.catCard}>
              <span style={s.catEmoji}>{c.emoji}</span>
              <span style={s.catLabel}>{c.label}</span>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}

const s = {
  hero: { background: "linear-gradient(rgba(0,0,0,0.45),rgba(0,0,0,0.45)),url('https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=1600&q=80') center/cover", minHeight: 340, display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", textAlign: "center", padding: 20 },
  heroContent: { maxWidth: 760 },
  heroTitle: { fontSize: 46, fontWeight: 700, marginBottom: 12, lineHeight: 1.15 },
  heroSub: { fontSize: 18, marginBottom: 24, opacity: 0.9 },
  heroSearch: { display: "flex", maxWidth: 600, margin: "0 auto", borderRadius: 8, overflow: "hidden" },
  heroInput: { flex: 1, padding: "14px 18px", fontSize: 15, border: "none", outline: "none" },
  twoCol: { maxWidth: 1200, margin: "40px auto", padding: "0 24px", display: "grid", gridTemplateColumns: "1fr 380px", gap: 32, alignItems: "start" },
  chatSection: { background: "#fff", borderRadius: 16, padding: 24, boxShadow: "0 2px 16px rgba(0,0,0,0.07)", border: "1px solid #f0eeeb" },
  chatHeader: { display: "flex", alignItems: "flex-start", gap: 14, marginBottom: 18 },
  chatIcon: { fontSize: 36, lineHeight: 1 },
  chatTitle: { fontSize: 20, fontWeight: 700, marginBottom: 2 },
  chatSub: { fontSize: 13, color: "#6b7280" },
  quickBtns: { display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 16 },
  quickBtn: { background: "#fdf0f0", color: "#d32323", border: "1px solid #fca5a5", borderRadius: 999, padding: "6px 14px", fontSize: 13, cursor: "pointer", fontWeight: 500 },
  chatBox: { height: 320, overflowY: "auto", marginBottom: 14, display: "flex", flexDirection: "column" },
  bubble: { maxWidth: "78%", padding: "10px 14px", borderRadius: 12, fontSize: 14, lineHeight: 1.55 },
  bubbleUser: { background: "#d32323", color: "#fff", borderBottomRightRadius: 3 },
  bubbleBot: { background: "#f3f4f6", color: "#1a1a1a", borderBottomLeftRadius: 3 },
  inputRow: { display: "flex", borderRadius: 8, overflow: "hidden", border: "1.5px solid #e5e7eb" },
  chatInput: { flex: 1, padding: "12px 14px", border: "none", fontSize: 14, outline: "none" },
  clearBtn: { background: "none", border: "none", color: "#9ca3af", fontSize: 12, cursor: "pointer", marginTop: 8, padding: 0 },
  aside: { display: "flex", flexDirection: "column", gap: 0 },
  sectionTitle: { fontSize: 20, fontWeight: 700, marginBottom: 16 },
  featCard: { display: "flex", gap: 14, alignItems: "center", background: "#fff", border: "1px solid #f0eeeb", borderRadius: 12, padding: 12, marginBottom: 10, textDecoration: "none", color: "inherit", transition: "box-shadow 0.15s" },
  featImg: { width: 72, height: 72, borderRadius: 8, objectFit: "cover", flexShrink: 0 },
  featInfo: { flex: 1, minWidth: 0 },
  featName: { fontWeight: 600, fontSize: 15, color: "#1a1a1a" },
  featMeta: { fontSize: 13, color: "#6b7280" },
  joinBox: { background: "#fdf0f0", border: "1px solid #fca5a5", borderRadius: 12, padding: 20, marginTop: 16 },
  joinTitle: { fontSize: 16, fontWeight: 700, color: "#b91c1c", marginBottom: 6 },
  joinText: { fontSize: 13, color: "#6b7280", lineHeight: 1.5 },
  catSection: { maxWidth: 1200, margin: "0 auto 60px", padding: "0 24px" },
  catGrid: { display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(130px,1fr))", gap: 14 },
  catCard: { display: "flex", flexDirection: "column", alignItems: "center", gap: 8, background: "#fff", border: "1px solid #f0eeeb", borderRadius: 12, padding: "20px 12px", textDecoration: "none", color: "inherit", transition: "box-shadow 0.15s, transform 0.12s" },
  catEmoji: { fontSize: 32 },
  catLabel: { fontSize: 14, fontWeight: 600, color: "#374151" },
};
