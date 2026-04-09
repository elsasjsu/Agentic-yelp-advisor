import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { getRestaurant, getReviews, createReview, addFavorite, removeFavorite, getFavorites } from "../services/api";
import ReviewCard from "../components/ReviewCard";
import { useAuth } from "../context/AuthContext";

const MOCK_R = { id: 1, name: "Spice Garden", cuisine: "Indian", rating: 4.5, review_count: 120, price: "$$", city: "San Jose, CA", address: "123 Main St, San Jose, CA 95101", phone: "(408) 555-1234", description: "Spice Garden offers delicious Indian food with a cozy atmosphere, perfect for family dinners.", hours: "Mon–Sun: 11am–10pm", image_url: "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800&q=80" };
const MOCK_REV = [
  { id: 1, user_name: "Aarav M.", user_id: 99, rating: 5, comment: "Amazing food and great service. Loved the biryani!", created_at: "2026-03-10" },
  { id: 2, user_name: "Sophia L.", user_id: 98, rating: 4, comment: "Nice ambiance and good vegetarian options.", created_at: "2026-03-12" },
];

function Stars({ rating, interactive, onRate }) {
  const [hover, setHover] = useState(0);
  return (
    <span style={{ display: "inline-flex", gap: 2 }}>
      {[1,2,3,4,5].map(i => (
        <span key={i}
          onClick={() => interactive && onRate(i)}
          onMouseEnter={() => interactive && setHover(i)}
          onMouseLeave={() => interactive && setHover(0)}
          style={{ fontSize: interactive ? 28 : 15, cursor: interactive ? "pointer" : "default", color: i <= (hover || rating) ? "#f5a623" : "#d1d5db" }}>
          ★
        </span>
      ))}
    </span>
  );
}

export default function RestaurantDetails() {
  const { id } = useParams();
  const { user, isLoggedIn } = useAuth();
  console.log("Auth user:", user);
  console.log("Auth user id:", user?.id);
  const [restaurant, setRestaurant] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isFav, setIsFav] = useState(false);
  const [favLoading, setFavLoading] = useState(false);
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [reviewError, setReviewError] = useState("");

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const [rRes, revRes] = await Promise.all([getRestaurant(id), getReviews(id)]);
        setRestaurant(rRes.data);
        setReviews(revRes.data || []);
      } catch {
        setRestaurant(MOCK_R);
        setReviews(MOCK_REV);
      }
      if (isLoggedIn) {
        try {
          const favRes = await getFavorites();
          console.log("GET /favorites response:", favRes.data);

          const favorites = favRes.data || [];
          setIsFav(
            favorites.some(
              (f) =>
                String(f.id) === String(id) ||
                String(f.restaurant_id) === String(id) ||
                String(f.restaurant?.id) === String(id)
            )
          );
        } catch (err) {
          console.error("Failed to load favorites");
          console.error("Status:", err.response?.status);
          console.error("Data:", err.response?.data);
          console.error("Full error:", err);
        }
      }
      setLoading(false);
    };
    load();
  }, [id, isLoggedIn]);

  const toggleFav = async () => {
    if (!isLoggedIn) {
      console.log("Not logged in");
      return;
    }

  setFavLoading(true);
  try {
    console.log("Restaurant id:", id);
    console.log("Current isFav:", isFav);
    console.log("Token:", localStorage.getItem("access_token"));

    if (isFav) {
      const res = await removeFavorite(id);
      console.log("Removed favorite:", res.data);
      setIsFav(false);
    } else {
      const res = await addFavorite(id);
      console.log("Added favorite:", res.data);
      setIsFav(true);
    }

    const favRes = await getFavorites();
    console.log("Favorites after toggle:", favRes.data);
  } catch (err) {
    console.error("Favorite toggle failed");
    console.error("Status:", err.response?.status);
    console.error("Data:", err.response?.data);
    console.error("Full error:", err);
  } finally {
    setFavLoading(false);
  }
};

  const submitReview = async (e) => {
    e.preventDefault();

    console.log("submitReview called");
    console.log("restaurant id:", id);
    console.log("rating:", rating);
    console.log("comment:", comment);
    console.log("isLoggedIn:", isLoggedIn);
    console.log("token:", localStorage.getItem("access_token"));

    if (rating === 0) {
      setReviewError("Please select a rating.");
      console.log("Blocked: no rating selected");
      return;
    }

    if (!comment.trim()) {
      setReviewError("Please write a comment.");
      console.log("Blocked: no comment entered");
      return;
    }

    setReviewError("");
    setSubmitting(true);

    try {
      console.log("Sending POST request...");
      const response = await createReview(id, {
        rating,
        comment,
      });

      console.log("Review created successfully:", response.data);

      const reviewsResponse = await getReviews(id);
      console.log("Updated reviews:", reviewsResponse.data);

      setReviews(reviewsResponse.data || []);
      setRating(0);
      setComment("");
    } catch (err) {
      console.error("Review submission failed");
      console.error("Full error:", err);
      console.error("Error response:", err.response);
      console.error("Error response data:", err.response?.data);
      console.error("Error status:", err.response?.status);

      setReviewError("Failed to submit review. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };
  if (loading) return <div style={s.loading}>Loading…</div>;
  const r = restaurant;
  const avg = reviews.length ? (reviews.reduce((a, b) => a + b.rating, 0) / reviews.length).toFixed(1) : r?.rating;

  return (
    <div style={s.page}>
      <img
        src={
          r.image_url ||
          r.image ||
          r.photo_url ||
          r.photo ||
          "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800&q=80"
        }
        alt={r.name}
        style={s.heroImg}
        onError={(e) => {
          e.currentTarget.src =
            "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800&q=80";
        }}
/>

      <div style={s.twoCol}>
        <main>
          <div style={s.header}>
            <div>
              <h1 style={s.name}>{r.name}</h1>
              <div style={s.meta}>
                <Stars rating={Math.round(avg)} />
                <span style={s.metaVal}>{avg}</span>
                <span style={s.metaDot}>·</span>
                <span style={s.metaVal}>{reviews.length || r.review_count || 0} reviews</span>
                <span style={s.metaDot}>·</span>
                <span style={s.tag}>{r.cuisine}</span>
                <span style={s.tag}>{r.price}</span>
              </div>
            </div>
            <button onClick={toggleFav} disabled={!isLoggedIn || favLoading} style={{ ...s.favBtn, ...(isFav ? s.favActive : {}) }}>
              {isFav ? "❤ Saved" : "🤍 Save"}
            </button>
          </div>

          <p style={s.desc}>{r.description}</p>

          {/* Review form */}
          {isLoggedIn ? (
            <div style={s.reviewFormBox}>
              <h3 style={s.sectionTitle}>Write a Review</h3>
              {reviewError && <div style={s.errorBox}>{reviewError}</div>}
              <form onSubmit={submitReview} style={s.form}>
                <div>
                  <div style={s.fieldLabel}>Your Rating</div>
                  <Stars rating={rating} interactive onRate={setRating} />
                </div>
                <div>
                  <div style={s.fieldLabel}>Your Review</div>
                  <textarea
                    value={comment}
                    onChange={e => setComment(e.target.value)}
                    rows={4}
                    placeholder="Share your experience…"
                    style={s.textarea}
                  />
                </div>
                <button type="submit" className="btn-primary" style={{ padding: "11px 28px" }} disabled={submitting}>
                  {submitting ? "Submitting…" : "Submit Review"}
                </button>
              </form>
            </div>
          ) : (
            <div style={s.loginPrompt}>
              <Link to="/login" style={s.loginLink}>Log in</Link> to write a review.
            </div>
          )}

          {/* Reviews list */}
          <h3 style={s.sectionTitle}>Customer Reviews ({reviews.length})</h3>
          {reviews.length === 0 ? (
            <p style={s.noReviews}>No reviews yet. Be the first!</p>
          ) : (
            reviews.map(rev => (
              <ReviewCard
                key={rev.id}
                review={rev}
                currentUserId={user?.id || JSON.parse(localStorage.getItem("user") || "{}")?.id}
                onUpdated={() => getReviews(id).then(res => setReviews(res.data || []))}
                onDeleted={() => getReviews(id).then(res => setReviews(res.data || []))}
              />
            ))
          )}
        </main>

        {/* Info sidebar */}
        <aside style={s.sidebar}>
          <div style={s.infoCard}>
            <h3 style={s.infoTitle}>Restaurant Info</h3>
            {r.address && <div style={s.infoRow}><span style={s.infoIcon}>📍</span><span>{r.address}</span></div>}
            {r.city && !r.address && <div style={s.infoRow}><span style={s.infoIcon}>📍</span><span>{r.city}</span></div>}
            {r.phone && <div style={s.infoRow}><span style={s.infoIcon}>📞</span><span>{r.phone}</span></div>}
            {r.hours && <div style={s.infoRow}><span style={s.infoIcon}>🕐</span><span>{r.hours}</span></div>}
            {r.website && <div style={s.infoRow}><span style={s.infoIcon}>🌐</span><a href={r.website} target="_blank" rel="noreferrer" style={{ color: "#d32323" }}>{r.website}</a></div>}
          </div>

          <div style={{ ...s.infoCard, marginTop: 16 }}>
            <h3 style={s.infoTitle}>Rating Breakdown</h3>
            {[5,4,3,2,1].map(star => {
              const count = reviews.filter(r => r.rating === star).length;
              const pct = reviews.length ? (count / reviews.length * 100) : 0;
              return (
                <div key={star} style={s.barRow}>
                  <span style={s.barLabel}>{star}★</span>
                  <div style={s.barTrack}><div style={{ ...s.barFill, width: pct + "%" }} /></div>
                  <span style={s.barCount}>{count}</span>
                </div>
              );
            })}
          </div>

          {isLoggedIn && (
            <Link to="/restaurant/add" style={s.addBtn}>+ Add a Restaurant</Link>
          )}
        </aside>
      </div>
    </div>
  );
}

const s = {
  page: { maxWidth: 1100, margin: "0 auto", padding: "0 24px 60px" },
  loading: { textAlign: "center", padding: 80, color: "#9ca3af", fontSize: 16 },
  heroImg: { width: "100%", height: 340, objectFit: "cover", borderRadius: "0 0 16px 16px", marginBottom: 24 },
  twoCol: { display: "grid", gridTemplateColumns: "1fr 300px", gap: 32, alignItems: "start" },
  header: { display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 16, gap: 16, flexWrap: "wrap" },
  name: { fontSize: 30, fontWeight: 700, marginBottom: 10 },
  meta: { display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" },
  metaVal: { fontSize: 14, color: "#6b7280" },
  metaDot: { color: "#d1d5db" },
  tag: { background: "#f3f4f6", color: "#374151", borderRadius: 999, padding: "2px 10px", fontSize: 13 },
  favBtn: { background: "#fff", border: "1.5px solid #e5e7eb", borderRadius: 999, padding: "9px 20px", fontSize: 14, cursor: "pointer", fontWeight: 600, whiteSpace: "nowrap" },
  favActive: { background: "#fdf0f0", border: "1.5px solid #fca5a5", color: "#d32323" },
  desc: { fontSize: 15, color: "#374151", lineHeight: 1.7, marginBottom: 28 },
  reviewFormBox: { background: "#fff", border: "1px solid #f0eeeb", borderRadius: 12, padding: 20, marginBottom: 28 },
  sectionTitle: { fontSize: 18, fontWeight: 700, marginBottom: 16 },
  errorBox: { background: "#fdf0f0", border: "1px solid #fca5a5", color: "#b91c1c", borderRadius: 8, padding: "8px 12px", fontSize: 13, marginBottom: 12 },
  form: { display: "flex", flexDirection: "column", gap: 16 },
  fieldLabel: { fontSize: 13, fontWeight: 600, color: "#374151", marginBottom: 6 },
  textarea: { width: "100%", padding: "12px 14px", borderRadius: 8, border: "1.5px solid #e5e7eb", fontSize: 14, resize: "vertical", lineHeight: 1.5 },
  loginPrompt: { background: "#fdf0f0", borderRadius: 10, padding: "14px 18px", fontSize: 14, color: "#6b7280", marginBottom: 24 },
  loginLink: { color: "#d32323", fontWeight: 700 },
  noReviews: { color: "#9ca3af", fontSize: 14, padding: "20px 0" },
  sidebar: {},
  infoCard: { background: "#fff", border: "1px solid #f0eeeb", borderRadius: 12, padding: 18 },
  infoTitle: { fontSize: 15, fontWeight: 700, marginBottom: 14 },
  infoRow: { display: "flex", gap: 10, alignItems: "flex-start", marginBottom: 10, fontSize: 14, color: "#374151" },
  infoIcon: { fontSize: 16, flexShrink: 0 },
  barRow: { display: "flex", alignItems: "center", gap: 8, marginBottom: 6 },
  barLabel: { fontSize: 12, color: "#6b7280", width: 22, flexShrink: 0 },
  barTrack: { flex: 1, height: 6, background: "#f3f4f6", borderRadius: 3, overflow: "hidden" },
  barFill: { height: "100%", background: "#f5a623", borderRadius: 3 },
  barCount: { fontSize: 12, color: "#9ca3af", width: 20, textAlign: "right" },
  addBtn: { display: "block", textAlign: "center", marginTop: 16, background: "#fff", border: "1.5px dashed #e5e7eb", borderRadius: 10, padding: 14, fontSize: 14, color: "#6b7280", textDecoration: "none" },
};
