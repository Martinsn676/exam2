import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import HomePage from "./pages/HomePage";
import VenuePage from "./pages/VenuePage";
import ProfilePage from "./pages/ProfilePage";
import LoginPage from "./pages/LoginPage";
import VenueManagerPage from "./pages/VenueManagerPage";
import Header from "./components/Header/Header";
import Footer from "./components/Footer/Footer";
import ScrollToTop from "./components/scrollToTop";
import NotFoundPage from "./pages/NotFoundPage";
import "./styles/main.scss";

function App() {
  // Pass the search logic to the header
  const handleSearch = (term) => {
    console.log("Search term:", term);
    // Implement search logic for your application here
  };

  return (
    <Router>
      <ScrollToTop />
      <Header onSearch={handleSearch} />
      <main>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/venue/:id" element={<VenuePage />} />
          <Route path="/profile-page" element={<ProfilePage />} />
          <Route path="/login-page" element={<LoginPage />} />
          <Route path="/manage-venue/:id" element={<VenueManagerPage />} />
          <Route path="*" element={<NotFoundPage />} /> {/* Handle 404 */}
        </Routes>
      </main>
      <Footer />
    </Router>
  );
}

export default App;
