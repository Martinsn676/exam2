import React from "react";
import "./Footer.scss";

function Footer() {
  return (
    <footer className="footer">
      <div className="footer-content">
        {/* Footer Navigation */}
        <div className="footer-section">
          <h4>Quick Links</h4>
          <ul>
            <li>
              <a href="/">About Us</a>
            </li>
            <li>
              <a href="/">Contact</a>
            </li>
            <li>
              <a href="/">Terms & Conditions</a>
            </li>
            <li>
              <a href="/">Privacy Policy</a>
            </li>
          </ul>
        </div>

        {/* Contact Information */}
        <div className="footer-section">
          <h4>Contact</h4>
          <p>Email: info@holidaze.com</p>
          <p>Phone: +1 (555) 123-4567</p>
          <p>Address: 123 Hotel Street, Cityville, USA</p>
        </div>

        {/* Social Media */}
        <div className="footer-section">
          <h4>Follow Us</h4>
          <ul className="social-media">
            <li>
              <a href="/">Facebook</a>
            </li>
            <li>
              <a href="/">Twitter</a>
            </li>
            <li>
              <a href="/">Instagram</a>
            </li>
          </ul>
        </div>
      </div>
      <div className="footer-bottom">
        <p>&copy; 2024 Holidaze. All rights reserved.</p>
      </div>
    </footer>
  );
}

export default Footer;
