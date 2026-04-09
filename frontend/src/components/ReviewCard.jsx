import { useState } from "react";
import { updateReview, deleteReview } from "../services/api";

function Stars({ rating }) {
  return (
    <span className="stars">
      {[1, 2, 3, 4, 5].map((i) => (
        <span key={i} style={{ color: i <= rating ? "#f5a623" : "#d1d5db" }}>
          ★
        </span>
      ))}
    </span>
  );
}

function ReviewCard({ review, currentUserId, onUpdated, onDeleted }) {
  const [editing, setEditing] = useState(false);
  const [rating, setRating] = useState(review.rating);
  const [comment, setComment] = useState(review.comment);
  const [loading, setLoading] = useState(false);

  const isOwner = String(review.user_id) === String(currentUserId);
  console.log("currentUserId:", currentUserId, "review.user_id:", review.user_id);

  const handleSave = async () => {
    setLoading(true);
    try {
      await updateReview(review.id, { rating, comment });
      setEditing(false);
      onUpdated && onUpdated();
    } catch (err) {
      console.error("Update failed:", err.response?.data || err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm("Delete this review?")) return;
    try {
      await deleteReview(review.id);
      onDeleted && onDeleted();
    } catch (err) {
      console.error("Delete failed:", err.response?.data || err);
    }
  };

  return (
    <div style={s.card}>
      <div style={s.header}>
        <div style={s.avatar}>
          {(review.user_name || review.user || "U")[0].toUpperCase()}
        </div>
        <div>
          <div style={s.name}>{review.user_name || review.user || "User"}</div>
          <Stars rating={review.rating} />
        </div>
        <div style={s.date}>{review.date || review.created_at?.split("T")[0]}</div>
      </div>

      {editing ? (
        <div style={s.editArea}>
          <div style={s.starRow}>
            {[1, 2, 3, 4, 5].map((i) => (
              <span
                key={i}
                onClick={() => setRating(i)}
                style={{
                  fontSize: 26,
                  cursor: "pointer",
                  color: i <= rating ? "#f5a623" : "#d1d5db",
                }}
              >
                ★
              </span>
            ))}
          </div>
          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            style={s.textarea}
            rows={3}
          />
          <div style={s.editBtns}>
            <button
              className="btn-primary"
              onClick={handleSave}
              disabled={loading}
              style={{ padding: "8px 18px", fontSize: 13 }}
            >
              {loading ? "Saving..." : "Save"}
            </button>
            <button onClick={() => setEditing(false)} style={s.cancelBtn}>
              Cancel
            </button>
          </div>
        </div>
      ) : (
        <p style={s.comment}>{review.comment}</p>
      )}

      {isOwner && !editing && (
        <div style={s.actions}>
          <button onClick={() => setEditing(true)} style={s.editBtn}>
            Edit
          </button>
          <button onClick={handleDelete} style={s.deleteBtn}>
            Delete
          </button>
        </div>
      )}
    </div>
  );
}

const s = {
  card: {
    background: "#fff",
    border: "1px solid #f0eeeb",
    borderRadius: 12,
    padding: 18,
    marginBottom: 14,
  },
  header: { display: "flex", alignItems: "center", gap: 12, marginBottom: 12 },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: "50%",
    background: "linear-gradient(135deg,#d32323,#ff6b6b)",
    color: "#fff",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontWeight: 700,
    fontSize: 16,
    flexShrink: 0,
  },
  name: { fontWeight: 600, fontSize: 15, marginBottom: 2 },
  date: { marginLeft: "auto", fontSize: 12, color: "#9ca3af" },
  comment: { color: "#374151", fontSize: 15, lineHeight: 1.6 },
  editArea: { display: "flex", flexDirection: "column", gap: 10 },
  starRow: { display: "flex", gap: 4 },
  textarea: {
    width: "100%",
    padding: 10,
    borderRadius: 8,
    border: "1px solid #e5e7eb",
    fontSize: 14,
    resize: "vertical",
  },
  editBtns: { display: "flex", gap: 8 },
  cancelBtn: {
    padding: "8px 18px",
    borderRadius: 999,
    border: "1px solid #e5e7eb",
    background: "#f9f8f6",
    fontSize: 13,
    cursor: "pointer",
  },
  actions: { display: "flex", gap: 8, marginTop: 10 },
  editBtn: {
    fontSize: 12,
    padding: "5px 12px",
    borderRadius: 999,
    border: "1px solid #d32323",
    color: "#d32323",
    background: "transparent",
    cursor: "pointer",
  },
  deleteBtn: {
    fontSize: 12,
    padding: "5px 12px",
    borderRadius: 999,
    border: "1px solid #e5e7eb",
    color: "#9ca3af",
    background: "transparent",
    cursor: "pointer",
  },
};

export default ReviewCard;