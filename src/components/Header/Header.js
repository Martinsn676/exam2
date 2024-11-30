import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./Header.scss";
import Logo from "../../images/logo.png";
import userIcon from "../../icons/User.png";

function Header() {
  const [searchTerm, setSearchTerm] = useState("");
  const navigate = useNavigate(); // For navigation

  const handleInputChange = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleSearch = () => {
    if (searchTerm.trim()) {
      navigate(`/?search=${encodeURIComponent(searchTerm)}`);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      handleSearch(); // Trigger search when Enter is pressed
    }
  };

  return (
    <header className="header">
      <div className="container d-flex justify-content-between align-items-center py-3">
        {/* Logo Section */}
        <div className="logo">
          <Link to="/" className="text-decoration-none">
            <img src={Logo} alt="Logo" className="logo-img" />
          </Link>
        </div>

        {/* Search Section */}
        <div className="search-container d-none d-md-flex">
          <div className="input-group">
            <input
              type="text"
              className="form-control"
              placeholder="Search..."
              value={searchTerm}
              onChange={handleInputChange}
              onKeyDown={handleKeyDown}
            />
            <button className="cta-button search-button" onClick={handleSearch}>
              Search
            </button>
          </div>
        </div>

        {/* Profile Section */}
        <div className="profile">
          <Link to="/profile-page" className="text-decoration-none">
            <img src={userIcon} alt="User icon" className="user-icon" />
          </Link>
        </div>
      </div>

      {/* Search Section for Mobile */}
      <div className="search-container d-md-none mt-3">
        <div className="input-group">
          <input
            type="text"
            className="form-control"
            placeholder="Search..."
            value={searchTerm}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
          />
          <button className="cta-button" onClick={handleSearch}>
            Search
          </button>
        </div>
      </div>
    </header>
  );
}

export default Header;
