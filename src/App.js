import React, { useState } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import HomePage from "./pages/HomePage";
import VenuePage from "./pages/VenuePage";
import Header from "./components/header";
import "./styles/main.scss";
import ProfilePage from "./pages/ProfilePage";
import LoginPage from "./pages/LoginPage";
import VenueManagerPage from "./pages/VenueManagerPage";

function App() {
  const [searchResults, setSearchResults] = useState([]);

  // Pass the search logic to the header
  const handleSearch = (term) => {
    console.log("Search term:", term);
    // Implement search logic for your application here
  };

  return (
    <Router>
      {/* Header is now inside Router */}
      <Header onSearch={handleSearch} />
      <main>
        <Routes>
          <Route
            path="/"
            element={<HomePage searchResults={searchResults} />}
          />
          <Route path="/venue/:id" element={<VenuePage />} />
          <Route path="/profile-page" element={<ProfilePage />} />
          <Route path="/login-page" element={<LoginPage />} />
          <Route path="/manage-venue/:id" element={<VenueManagerPage />} />
        </Routes>
      </main>
    </Router>
  );
}

export default App;
