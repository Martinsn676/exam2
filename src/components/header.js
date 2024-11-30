import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./header.scss";
import Logo from "../images/logo.png";
import userIcon from "../icons/User.png";

function Header() {
  const [searchTerm, setSearchTerm] = useState("");
  const navigate = useNavigate(); // For navigation

  const handleInputChange = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleSearch = () => {
    if (searchTerm.trim()) {
      // Navigate to HomePage with search term in query
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
          <Link to="/" className="text-white text-decoration-none">
            <img src={Logo} alt="Logo" />
          </Link>
        </div>

        {/* Navigation Section */}
        <nav className="nav">
          <ul className="d-flex list-unstyled m-0">
            <li className="mx-2">
              <Link
                to="/profile-page"
                className="text-white text-decoration-none"
              >
                <img src={userIcon} alt="User icon" />
              </Link>
            </li>
          </ul>
        </nav>
      </div>

      {/* Search Input Section */}
      <div className="search-container mt-3">
        <div className="input-group">
          <input
            type="text"
            className="form-control"
            placeholder="Search..."
            value={searchTerm}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown} // Add handler for Enter key
          />
          <button className="btn btn-primary" onClick={handleSearch}>
            Search
          </button>
        </div>
      </div>
    </header>
  );
}

export default Header;
