import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import HomePage from "./pages/HomePage";
import VenuePage from "./pages/VenuePage";
import VenuesList from "./components/VenuesList";

function App() {
  return (
    <div>
      <VenuesList />
    </div>
  );
}

export default App;
