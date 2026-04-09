import { useState, useEffect } from "react";
import { Link, useSearchParams, useNavigate } from "react-router-dom";
import { getRestaurants, claimRestaurant } from "../services/api";
import { useAuth } from "../context/AuthContext";

const CUISINES = ["All","Italian","Indian","Japanese","Mexican","American","Chinese","Thai","Mediterranean","Vegan","Fast Food"];
const PRICES = ["All","$","$$","$$$","$$$$"];
const SORTS = [
  { label: "Rating", value: "rating" },
  { label: "Most Reviewed", value: "reviews" },
  { label: "Price (Low)", value: "price_asc" },
];

const MOCK = [
  { id: 1, name: "Pasta Paradise", cuisine: "Italian", rating: 4.5, review_count: 210, price: "$$", city: "San Jose, CA", description: "Authentic Italian pasta, cozy atmosphere.", image_url: "https://images.unsplash.com/photo-1555949258-eb67b1ef0ceb?w=400&q=80" },
  { id: 2, name: "Spice Garden", cuisine: "Indian", rating: 4.7, review_count: 340, price: "$$", city: "San Jose, CA", description: "Rich flavors, generous portions.", image_url: "https://images.unsplash.com/photo-1565557623262-b51c2513a641?w=400&q=80" },
  { id: 3, name: "Sushi Corner", cuisine: "Japanese", rating: 4.8, review_count: 180, price: "$$$", city: "Santa Clara, CA", description: "Fresh sushi crafted daily.", image_url: "https://images.unsplash.com/photo-1553621042-f6e147245754?w=400&q=80" },
  { id: 4, name: "Taco Fiesta", cuisine: "Mexican", rating: 4.2, review_count: 120, price: "$", city: "Sunnyvale, CA", description: "Street-style tacos and burritos.", image_url: "https://images.unsplash.com/photo-1565299585323-38d6b0865b47?w=400&q=80" },
  { id: 5, name: "Green Leaf Café", cuisine: "Vegan", rating: 4.4, review_count: 95, price: "$", city: "Palo Alto, CA", description: "100% plant-based menu.", image_url: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=400&q=80" },
  { id: 6, name: "Burger Hub", cuisine: "American", rating: 4.1, review_count: 280, price: "$", city: "San Jose, CA", description: "Juicy burgers, crispy fries.", image_url: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=400&q=80" },
];

function Stars({ rating }) {
  return (
    <span style={{ display: "inline-flex", gap: 1 }}>
      {[1, 2, 3, 4, 5].map((i) => (
        <span
          key={i}
          style={{ color: i <= rating ? "#f5a623" : "#d1d5db", fontSize: 14 }}
        >
          ★
        </span>
      ))}
    </span>
  );
}

export default function Explore() {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const { isLoggedIn } = useAuth();
  const role = localStorage.getItem("role");

  const [restaurants, setRestaurants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [usedMock, setUsedMock] = useState(false);

  const [query, setQuery] = useState(searchParams.get("q") || "");
  const [cuisine, setCuisine] = useState(searchParams.get("cuisine") || "All");
  const [price, setPrice] = useState("All");
  const [sort, setSort] = useState("rating");
  const [location, setLocation] = useState(searchParams.get("city") || "");

  const fetchRestaurants = async (
    currentQuery = query,
    currentCuisine = cuisine,
    currentPrice = price,
    currentSort = sort,
    currentLocation = location
  ) => {
    setLoading(true);
    setUsedMock(false);

    try {
      const params = {};

      if (currentQuery) params.keyword = currentQuery;
      if (currentCuisine && currentCuisine !== "All") params.cuisine = currentCuisine;
      if (currentLocation) params.city = currentLocation;

      const res = await getRestaurants(params);
      console.log("GET /restaurants response:", res.data);
      let data = res.data || [];

      if (currentPrice && currentPrice !== "All") {
        data = data.filter(
          (r) => (r.price || r.pricing_tier || "") === currentPrice
        );
      }

      if (currentSort === "rating") {
        data = [...data].sort((a, b) => (b.rating || 0) - (a.rating || 0));
      } else if (currentSort === "reviews") {
        data = [...data].sort(
          (a, b) => (b.review_count || 0) - (a.review_count || 0)
        );
      } else if (currentSort === "price_asc") {
        const order = { "$": 1, "$$": 2, "$$$": 3, "$$$$": 4 };
        data = [...data].sort(
          (a, b) =>
            (order[a.price || a.pricing_tier || ""] || 99) -
            (order[b.price || b.pricing_tier || ""] || 99)
        );
      }

      setRestaurants(data);
    } catch (err) {
      console.error("Restaurant fetch error:", err.response?.data || err);
      setRestaurants(MOCK);
      setUsedMock(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const q = searchParams.get("q") || "";
    const c = searchParams.get("cuisine") || "All";
    const city = searchParams.get("city") || "";

    setQuery(q);
    setCuisine(c);
    setLocation(city);
  }, [searchParams]);

  useEffect(() => {
    fetchRestaurants(query, cuisine, price, sort, location);
  }, [query, location, cuisine, price, sort]);

  const handleSearch = (e) => {
    e.preventDefault();

    const next = {};
    if (query) next.q = query;
    if (cuisine && cuisine !== "All") next.cuisine = cuisine;
    if (location) next.city = location;

    setSearchParams(next);
  };

  const handleReset = () => {
    setQuery("");
    setLocation("");
    setCuisine("All");
    setPrice("All");
    setSort("rating");
    setSearchParams({});
  };

  const handleClaim = async (restaurantId, e) => {
    e.preventDefault();
    e.stopPropagation();

    try {
      const res = await claimRestaurant(restaurantId);
      console.log("Claim success:", res.data);
      alert("Restaurant claimed successfully");
      navigate("/owner-dashboard");
    } catch (err) {
      console.error("Claim failed:", err.response?.data || err);
      alert(err.response?.data?.detail || "Failed to claim restaurant");
    }
  }; 

  const displayed = restaurants;

  return (
    <div style={s.page}>
      <div style={s.searchBar}>
        <form onSubmit={handleSearch} style={s.searchForm}>
          <input
            type="text"
            placeholder="Restaurant name or keyword…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            style={s.input}
          />
          <input
            type="text"
            placeholder="City or zip…"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            style={{ ...s.input, maxWidth: 200 }}
          />
          <button
            type="submit"
            className="btn-primary"
            style={{ padding: "11px 24px" }}
          >
            Search
          </button>
          <button
            type="button"
            onClick={handleReset}
            style={s.resetBtn}
          >
            Reset
          </button>
        </form>
      </div>

      <div style={s.layout}>
        <aside style={s.sidebar}>
          <div style={s.filterGroup}>
            <div style={s.filterTitle}>Cuisine</div>
            {CUISINES.map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => setCuisine(c)}
                style={{ ...s.filterBtn, ...(cuisine === c ? s.filterActive : {}) }}
              >
                {c}
              </button>
            ))}
          </div>

          <div style={s.filterGroup}>
            <div style={s.filterTitle}>Price</div>
            {PRICES.map((p) => (
              <button
                key={p}
                type="button"
                onClick={() => setPrice(p)}
                style={{ ...s.filterBtn, ...(price === p ? s.filterActive : {}) }}
              >
                {p}
              </button>
            ))}
          </div>

          <div style={s.filterGroup}>
            <div style={s.filterTitle}>Sort by</div>
            {SORTS.map((o) => (
              <button
                key={o.value}
                type="button"
                onClick={() => setSort(o.value)}
                style={{ ...s.filterBtn, ...(sort === o.value ? s.filterActive : {}) }}
              >
                {o.label}
              </button>
            ))}
          </div>
        </aside>

        <main style={s.results}>
          <div style={s.resultsHeader}>
            <span style={s.resultsCount}>{displayed.length} restaurants found</span>

            {cuisine !== "All" && (
              <span style={s.chip}>
                Cuisine: {cuisine}
                <button type="button" onClick={() => setCuisine("All")} style={s.chipX}>
                  ×
                </button>
              </span>
            )}

            {price !== "All" && (
              <span style={s.chip}>
                Price: {price}
                <button type="button" onClick={() => setPrice("All")} style={s.chipX}>
                  ×
                </button>
              </span>
            )}

            {location && (
              <span style={s.chip}>
                City: {location}
                <button type="button" onClick={() => setLocation("")} style={s.chipX}>
                  ×
                </button>
              </span>
            )}
          </div>

          {usedMock && (
            <div style={s.mockNotice}>
              Showing fallback sample restaurants because the API could not be reached.
            </div>
          )}

          {loading ? (
            <div style={s.loading}>Loading restaurants…</div>
          ) : displayed.length === 0 ? (
            <div style={s.noResults}>No restaurants found for your search.</div>
          ) : (
            <div style={s.grid}>
              {displayed.map((r) => (
                <Link key={r.id} to={`/restaurant/${r.id}`} style={s.card}>
                  <img
                    src={
                      r.image_url ||
                      r.image ||
                      r.photos ||
                      "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=400"
                    }
                    alt={r.name}
                    style={s.cardImg}
                    onError={(e) => {
                      e.currentTarget.src =
                        "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=400";
                    }}
                  />
                  <div style={s.cardBody}>
                    <div style={s.cardName}>{r.name}</div>
                    <div style={s.cardMeta}>
                      <Stars rating={Math.floor(r.rating || 0)} />
                      <span style={s.metaText}>{r.rating || "—"}</span>
                      <span style={s.metaDot}>·</span>
                      <span style={s.metaText}>{r.review_count || 0} reviews</span>
                    </div>
                    <div style={s.cardTags}>
                      <span style={s.tag}>{r.cuisine || r.cuisine_type || "—"}</span>
                      <span style={s.tag}>{r.price || r.pricing_tier || "—"}</span>
                    </div>
                    <div style={s.cardCity}>{r.city || r.location || "—"}</div>
                    <p style={s.cardDesc}>{r.description}</p>
                    {isLoggedIn && role === "owner" && (
                      <button
                        type="button"
                        onClick={(e) => handleClaim(r.id, e)}
                        style={s.claimBtn}
                      >
                        Claim Restaurant
                      </button>
                    )}
                  </div>
                </Link>
              ))}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

const s = {
  page: { maxWidth: 1200, margin: "0 auto", padding: "24px 24px 60px" },
  searchBar: {
    background: "#fff",
    border: "1px solid #f0eeeb",
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
    boxShadow: "0 1px 4px rgba(0,0,0,0.05)",
  },
  searchForm: { display: "flex", gap: 10, flexWrap: "wrap" },
  input: {
    flex: 1,
    minWidth: 180,
    padding: "11px 14px",
    borderRadius: 8,
    border: "1.5px solid #e5e7eb",
    fontSize: 15,
  },
  resetBtn: {
    padding: "11px 20px",
    borderRadius: 8,
    border: "1px solid #e5e7eb",
    background: "#fff",
    cursor: "pointer",
    fontSize: 14,
  },
  layout: {
    display: "grid",
    gridTemplateColumns: "220px 1fr",
    gap: 24,
    alignItems: "start",
  },
  sidebar: {
    background: "#fff",
    border: "1px solid #f0eeeb",
    borderRadius: 12,
    padding: 16,
  },
  filterGroup: { marginBottom: 20 },
  filterTitle: {
    fontWeight: 700,
    fontSize: 13,
    color: "#374151",
    marginBottom: 8,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  filterBtn: {
    display: "block",
    width: "100%",
    textAlign: "left",
    padding: "7px 12px",
    borderRadius: 8,
    border: "none",
    background: "transparent",
    cursor: "pointer",
    fontSize: 14,
    color: "#374151",
    marginBottom: 2,
  },
  filterActive: { background: "#fdf0f0", color: "#d32323", fontWeight: 600 },
  results: {},
  resultsHeader: {
    display: "flex",
    alignItems: "center",
    gap: 10,
    marginBottom: 16,
    flexWrap: "wrap",
  },
  resultsCount: { fontSize: 14, color: "#6b7280" },
  chip: {
    background: "#fdf0f0",
    color: "#d32323",
    border: "1px solid #fca5a5",
    borderRadius: 999,
    padding: "3px 10px",
    fontSize: 12,
    display: "flex",
    alignItems: "center",
    gap: 4,
  },
  chipX: {
    background: "none",
    border: "none",
    cursor: "pointer",
    color: "#d32323",
    fontSize: 14,
    padding: 0,
    lineHeight: 1,
  },
  mockNotice: {
    background: "#fff7ed",
    border: "1px solid #fdba74",
    color: "#9a3412",
    borderRadius: 8,
    padding: "10px 14px",
    fontSize: 14,
    marginBottom: 16,
  },
  loading: { textAlign: "center", padding: 60, color: "#9ca3af", fontSize: 16 },
  noResults: {
    textAlign: "center",
    padding: "60px 20px",
    color: "#6b7280",
    fontSize: 16,
    background: "#fff",
    border: "1px solid #f0eeeb",
    borderRadius: 12,
  },
  grid: { display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(280px,1fr))", gap: 20 },
  card: {
    display: "block",
    background: "#fff",
    borderRadius: 12,
    border: "1px solid #f0eeeb",
    overflow: "hidden",
    textDecoration: "none",
    color: "inherit",
    transition: "box-shadow 0.15s, transform 0.12s",
  },
  cardImg: { width: "100%", height: 160, objectFit: "cover" },
  cardBody: { padding: 14 },
  cardName: { fontWeight: 700, fontSize: 16, color: "#1a1a1a", marginBottom: 6 },
  cardMeta: { display: "flex", alignItems: "center", gap: 6, marginBottom: 8 },
  metaText: { fontSize: 13, color: "#6b7280" },
  metaDot: { color: "#d1d5db" },
  cardTags: { display: "flex", gap: 6, marginBottom: 6 },
  tag: {
    background: "#f3f4f6",
    color: "#374151",
    borderRadius: 999,
    padding: "2px 10px",
    fontSize: 12,
  },
  cardCity: { fontSize: 12, color: "#9ca3af", marginBottom: 6 },
  cardDesc: {
    fontSize: 13,
    color: "#6b7280",
    lineHeight: 1.5,
    overflow: "hidden",
    display: "-webkit-box",
    WebkitLineClamp: 2,
    WebkitBoxOrient: "vertical",
  },
  claimBtn: {
    marginTop: 10,
    padding: "8px 14px",
    borderRadius: 8,
    border: "1px solid #d32323",
    background: "#fff",
    color: "#d32323",
    fontWeight: 600,
    cursor: "pointer",
  },
};