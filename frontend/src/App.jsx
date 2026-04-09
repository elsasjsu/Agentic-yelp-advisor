import { BrowserRouter, Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Explore from "./pages/Explore";
import RestaurantDetails from "./pages/RestaurantDetails";
import AddRestaurant from "./pages/AddRestaurant";
import Profile from "./pages/Profile";
import Preferences from "./pages/Preferences";
import Favorites from "./pages/Favorites";
import History from "./pages/History";
import ChatAssistant from "./pages/ChatAssistant";
import OwnerDashboard from "./pages/OwnerDashboard";

function App() {
  return (
    <BrowserRouter>
      <Navbar />
      <main style={{ minHeight: "60vh" }}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/explore" element={<Explore />} />
          <Route path="/restaurant/add" element={<AddRestaurant />} />
          <Route path="/restaurant/:id" element={<RestaurantDetails />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/preferences" element={<Preferences />} />
          <Route path="/favorites" element={<Favorites />} />
          <Route path="/history" element={<History />} />
          <Route path="/assistant" element={<ChatAssistant />} />
          <Route path="/owner-dashboard" element={<OwnerDashboard />} />
        </Routes>
      </main>
      <Footer />
    </BrowserRouter>
  );
}

export default App;
