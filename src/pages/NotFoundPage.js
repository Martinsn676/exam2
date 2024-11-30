import React from "react";
import { Link } from "react-router-dom";

function NotFoundPage() {
  return (
    <div className="container text-center mt-5">
      <h1>404</h1>
      <p>Oops! The page you're looking for doesn't exist.</p>
      <Link to="/" className="cta-button">
        Go Back to Home
      </Link>
    </div>
  );
}

export default NotFoundPage;
