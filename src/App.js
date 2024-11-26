import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import HomePage from "./pages/HomePage";
import VenuePage from "./pages/VenuePage";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/venue/:id" element={<VenuePage />} />
      </Routes>
    </Router>
  );
}

export default App;
