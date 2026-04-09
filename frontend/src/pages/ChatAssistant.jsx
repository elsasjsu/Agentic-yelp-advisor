import { useState, useRef, useEffect } from "react";
import { Link } from "react-router-dom";
import { chatWithAssistant } from "../services/api";
import { useAuth } from "../context/AuthContext";

const QUICK = ["Find dinner tonight", "Best rated near me", "Vegan options", "Something romantic for anniversary", "Family-friendly restaurant", "Cheap and cheerful"];

export default function ChatAssistant() {
  const { isLoggedIn } = useAuth();
  const [messages, setMessages] = useState([
    { sender: "assistant", text: "Hi! I'm your AI restaurant assistant. I can help you find the perfect place based on your mood, cuisine preference, dietary needs, or occasion. What are you looking for today?" }
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const chatRef = useRef(null);

  useEffect(() => {
    if (chatRef.current) chatRef.current.scrollTop = chatRef.current.scrollHeight;
  }, [messages]);

  const sendMessage = async (text) => {
    const msg = text || input.trim();
    if (!msg || loading) return;
    setInput("");
    const history = messages.map(m => m.text );
    setMessages(prev => [...prev, { sender: "user", text: msg }]);
    setLoading(true);
    try {
      const res = await chatWithAssistant(msg, history);
      const reply = res.data?.response || res.data?.message || "I found some great options! Let me know if you'd like to refine the search.";
      const recs = res.data?.recommendations || [];
      setMessages(prev => [...prev, { sender: "assistant", text: reply, recommendations: recs }]);
    } catch {
      setMessages(prev => [...prev, { sender: "assistant", text: "I'm having trouble connecting to the AI service right now. Please try again in a moment, or browse restaurants directly!" }]);
    }
    setLoading(false);
  };

  const clearChat = () => {
    setMessages([{ sender: "assistant", text: "Chat cleared! How can I help you find a great restaurant?" }]);
  };

  return (
    <div style={s.page}>
      <div style={s.container}>
        <div style={s.header}>
          <div style={s.headerLeft}>
            <span style={s.icon}>🤖</span>
            <div>
              <h1 style={s.title}>AI Restaurant Assistant</h1>
              <p style={s.sub}>Powered by AI · Personalized to your preferences</p>
            </div>
          </div>
          <div style={s.headerActions}>
            {!isLoggedIn && <Link to="/login" style={s.loginHint}>Log in for personalized results</Link>}
            <button onClick={clearChat} style={s.clearBtn}>Clear chat</button>
          </div>
        </div>

        {/* Quick prompts */}
        <div style={s.quickRow}>
          {QUICK.map(q => (
            <button key={q} onClick={() => sendMessage(q)} style={s.quickBtn} disabled={loading}>{q}</button>
          ))}
        </div>

        {/* Chat window */}
        <div ref={chatRef} style={s.chatWindow}>
          {messages.map((m, i) => (
            <div key={i} style={{ marginBottom: 16 }}>
              {m.sender === "assistant" && (
                <div style={s.botLabel}>🤖 Assistant</div>
              )}
              <div style={{ display: "flex", justifyContent: m.sender === "user" ? "flex-end" : "flex-start" }}>
                <div style={{ ...s.bubble, ...(m.sender === "user" ? s.bubbleUser : s.bubbleBot) }}>
                  {m.text}
                </div>
              </div>

              {/* Restaurant recommendations */}
              {m.recommendations && m.recommendations.length > 0 && (
                <div style={s.recGrid}>
                  {m.recommendations.map((r, ri) => (
                    <Link key={ri} to={`/restaurant/${r.id}`} style={s.recCard}>
                      {r.image_url && <img src={r.image_url} alt={r.name} style={s.recImg} />}
                      <div style={s.recInfo}>
                        <div style={s.recName}>{r.name}</div>
                        <div style={s.recMeta}>{r.rating ? `★ ${r.rating}` : ""}{r.price ? ` · ${r.price}` : ""}{r.cuisine ? ` · ${r.cuisine}` : ""}</div>
                        {r.reason && <div style={s.recReason}>{r.reason}</div>}
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          ))}

          {loading && (
            <div style={{ marginBottom: 16 }}>
              <div style={s.botLabel}>🤖 Assistant</div>
              <div style={{ display: "flex" }}>
                <div style={{ ...s.bubble, ...s.bubbleBot }}>
                  <span style={s.typing}>
                    <span style={s.dot1}>●</span><span style={s.dot2}>●</span><span style={s.dot3}>●</span>
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Input */}
        <div style={s.inputArea}>
          <input
            type="text"
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === "Enter" && !e.shiftKey && sendMessage()}
            placeholder="Ask for restaurant recommendations…"
            style={s.input}
            disabled={loading}
          />
          <button onClick={() => sendMessage()} className="btn-primary" style={{ borderRadius: "0 10px 10px 0", padding: "0 24px", fontSize: 15 }} disabled={loading || !input.trim()}>
            Send
          </button>
        </div>
      </div>
    </div>
  );
}

const s = {
  page: { background: "#f9f8f6", minHeight: "100vh", padding: "32px 24px 60px" },
  container: { maxWidth: 860, margin: "0 auto" },
  header: { display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 20, flexWrap: "wrap", gap: 12 },
  headerLeft: { display: "flex", alignItems: "center", gap: 16 },
  icon: { fontSize: 42 },
  title: { fontSize: 24, fontWeight: 700, marginBottom: 2 },
  sub: { fontSize: 13, color: "#9ca3af" },
  headerActions: { display: "flex", alignItems: "center", gap: 12 },
  loginHint: { fontSize: 13, color: "#d32323", textDecoration: "none", fontWeight: 600 },
  clearBtn: { background: "#fff", border: "1px solid #e5e7eb", borderRadius: 8, padding: "7px 14px", fontSize: 13, cursor: "pointer", color: "#6b7280" },
  quickRow: { display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 20 },
  quickBtn: { background: "#fff", border: "1.5px solid #e5e7eb", borderRadius: 999, padding: "7px 16px", fontSize: 13, cursor: "pointer", color: "#374151", fontWeight: 500 },
  chatWindow: { background: "#fff", border: "1px solid #f0eeeb", borderRadius: 16, padding: 24, minHeight: 400, maxHeight: 560, overflowY: "auto", marginBottom: 16 },
  botLabel: { fontSize: 11, color: "#9ca3af", fontWeight: 600, marginBottom: 6, letterSpacing: 0.3 },
  bubble: { maxWidth: "75%", padding: "12px 16px", borderRadius: 14, fontSize: 14, lineHeight: 1.6 },
  bubbleUser: { background: "#d32323", color: "#fff", borderBottomRightRadius: 3 },
  bubbleBot: { background: "#f3f4f6", color: "#1a1a1a", borderBottomLeftRadius: 3 },
  typing: { display: "flex", gap: 3, alignItems: "center", height: 20 },
  dot1: { fontSize: 8, color: "#9ca3af", animation: "none" },
  dot2: { fontSize: 8, color: "#9ca3af" },
  dot3: { fontSize: 8, color: "#9ca3af" },
  recGrid: { display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(220px,1fr))", gap: 12, marginTop: 12 },
  recCard: { background: "#fff", border: "1px solid #f0eeeb", borderRadius: 10, overflow: "hidden", textDecoration: "none", color: "inherit", display: "flex", flexDirection: "column" },
  recImg: { width: "100%", height: 100, objectFit: "cover" },
  recInfo: { padding: 10 },
  recName: { fontWeight: 700, fontSize: 13, marginBottom: 3 },
  recMeta: { fontSize: 12, color: "#f5a623", marginBottom: 4 },
  recReason: { fontSize: 12, color: "#6b7280", fontStyle: "italic" },
  inputArea: { display: "flex", border: "1.5px solid #e5e7eb", borderRadius: 10, overflow: "hidden", background: "#fff" },
  input: { flex: 1, padding: "14px 16px", border: "none", fontSize: 15, outline: "none" },
};
