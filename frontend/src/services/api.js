import axios from "axios";

const API = axios.create({
  baseURL: "http://127.0.0.1:8000",
});

API.interceptors.request.use((req) => {
  const token = localStorage.getItem("access_token");
  if (token) {
    req.headers.Authorization = `Bearer ${token}`;
  }
  return req;
});

API.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem("access_token");
      localStorage.removeItem("user");
      window.location.href = "/login";
    }
    return Promise.reject(err);
  }
);

export const login = (email, password) =>
  API.post("/auth/user/login", {
    email,
    password,
  });

export const ownerLogin = (email, password) =>
  API.post("/auth/owner/login", {
    email,
    password,
  });

export const register = (data) => API.post("/auth/user/signup", data);
export const ownerRegister = (data) => API.post("/auth/owner/signup", data);

export const getMe = () => API.get("/users/me");
export const updateMe = (data) => API.put("/users/me", data);

export const uploadAvatar = (file) => {
  const fd = new FormData();
  fd.append("file", file);
  return API.post("/users/me/avatar", fd);
};

export const getPreferences = () => API.get("/users/me/preferences");
export const savePreferences = (data) => API.put("/users/me/preferences", data);

export const getRestaurants = (params) => API.get("/restaurants", { params });
export const getRestaurant = (id) => API.get(`/restaurants/${id}`);
export const createRestaurant = (data) => API.post("/restaurants", data);
export const updateRestaurant = (id, data) => API.put(`/restaurants/${id}`, data);
export const createOwnerRestaurant = (data) =>API.post("/owners/restaurants", data);

export const getReviews = (restaurantId) =>
  API.get(`/restaurants/${restaurantId}/reviews`);

export const createReview = (restaurantId, data) =>
  API.post(`/restaurants/${restaurantId}/reviews`, data);

export const updateReview = (reviewId, data) =>
  API.put(`/reviews/${reviewId}`, data);

export const deleteReview = (reviewId) =>
  API.delete(`/reviews/${reviewId}`);

export const getFavorites = () => API.get("/favorites");
export const addFavorite = (restaurantId) => API.post(`/favorites/${restaurantId}`);
export const removeFavorite = (restaurantId) => API.delete(`/favorites/${restaurantId}`);

export const getHistory = () => API.get("/users/history");

export const chatWithAssistant = (message, history) =>
  API.post("/ai-assistant/chat", {
    message,
    conversation_history: history,
  });

export const getOwnerDashboard = () => API.get("/owners/dashboard");
export const claimRestaurant = (restaurantId) =>
  API.post(`/owners/restaurants/${restaurantId}/claim`);
export const manageRestaurant = (restaurantId, data) =>
  API.put(`/owners/restaurants/${restaurantId}/manage`, data);
export const getOwnerAnalytics = (restaurantId) =>
  API.get(`/owners/restaurants/${restaurantId}/analytics`);

export default API;