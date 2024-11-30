import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { lsList } from "../hooks/lists";
import "./ProfilePage.scss";
import editIcon from "../icons/Edit.png";
import placeHolders from "../components/placeHolders";
import normalizeDate from "../utils/dateUtils";

const baseUrl = "https://v2.api.noroff.dev";

const ProfilePage = () => {
  const navigate = useNavigate();
  const [userDetails, setUserDetails] = useState(null);
  const [avatarUrl, setAvatarUrl] = useState("");
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [error, setError] = useState(null);
  const [bookings, setBookings] = useState([]);
  const [venues, setVenues] = useState([]);

  // Fetch user details and check authentication
  useEffect(() => {
    const checkUserData = async () => {
      try {
        const userData = await lsList.get("userLoginData");
        if (!userData || !userData.accessToken) {
          navigate("/login-page");
          return null;
        }
        return userData;
      } catch {
        navigate("/login-page");
        return null;
      }
    };

    const fetchUserDetails = async (userData) => {
      try {
        const response = await fetch(
          `${baseUrl}/holidaze/profiles/${userData.name}?_bookings=true&_venues=true`,
          {
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${userData.accessToken}`,
              "X-Noroff-API-Key": process.env.REACT_APP_apiKey,
            },
          }
        );
        if (!response.ok) throw new Error("Failed to fetch user details");

        const jsonData = await response.json();
        lsList.save("userData", jsonData.data);
        setUserDetails(jsonData.data);
        setBookings(jsonData.data.bookings || []);
        setVenues(jsonData.data.venues || []);
        setAvatarUrl(jsonData.data.avatar?.url || "");
      } catch (err) {
        setError(err.message);
      }
    };

    const initialize = async () => {
      const userData = await checkUserData();
      if (userData) fetchUserDetails(userData);
    };

    initialize();
  }, [navigate]);

  // Update avatar URL
  const handleAvatarChange = async () => {
    if (!avatarUrl.trim()) {
      setError("Avatar URL cannot be empty.");
      return;
    }

    try {
      const response = await fetch(
        `${baseUrl}/holidaze/profiles/${userDetails.name}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${userDetails.accessToken}`,
            "X-Noroff-API-Key": process.env.REACT_APP_apiKey,
          },
          body: JSON.stringify({
            avatar: { url: avatarUrl, alt: `${userDetails.name}'s avatar` },
          }),
        }
      );
      if (!response.ok) throw new Error("Failed to update avatar");

      const updatedData = await response.json();
      setUserDetails((prev) => ({ ...prev, avatar: updatedData.data.avatar }));
      setIsPopupOpen(false);
      setError("");
    } catch (err) {
      setError(err.message);
    }
  };

  // Sign out the user
  const handleSignOut = () => {
    lsList.remove("userLoginData");
    navigate("/login-page");
  };

  // Navigate to add a new venue
  const addNewVenue = () => {
    navigate("/manage-venue/new");
  };
  console.log(bookings);
  // Render loading state or content
  // if (!userDetails) return <p>Loading...</p>;
  if (!userDetails) return <p></p>;
  console.log(venues);
  return (
    <div className="container mt-5 d-flex flex-column align-items-center profile-main-container">
      <div className="headline">
        <h1>Welcome, {userDetails.name}</h1>
        {userDetails.venueManager && (
          <span className="grey-text lemon-font manager-text">
            Manager View
          </span>
        )}
      </div>

      {/* Avatar Section */}
      {!userDetails.venueManager && (
        <div
          className="avatar-image-container"
          onClick={() => setIsPopupOpen(true)}
        >
          <img
            className="avatar-image"
            src={userDetails.avatar?.url || "https://via.placeholder.com/150"}
            alt="User avatar"
          />
          <img className="edit-icon" src={editIcon} alt="Edit icon" />
        </div>
      )}

      {/* Manager View */}
      {userDetails.venueManager ? (
        <div className="mt-5">
          <h3>Your Venues</h3>
          <button className="cta-button mt-3" onClick={addNewVenue}>
            Add Venue
          </button>
          {venues.length > 0 ? (
            <div className="venues-list mt-4">
              {venues.map((venue) => (
                <Link
                  to={`/manage-venue/${venue.id}`}
                  key={venue.id}
                  className="text-decoration-none text-black"
                >
                  <div className="venue-item d-flex align-items-center p-3 mb-3 border rounded">
                    <div className="venue-image me-3">
                      <img
                        src={
                          venue.media?.[0]?.url ||
                          "https://via.placeholder.com/150"
                        }
                        alt={venue.name}
                        className="img-fluid rounded"
                        style={{
                          width: "150px",
                          height: "100px",
                          objectFit: "cover",
                        }}
                      />
                    </div>
                    <div className="venue-details">
                      <h5>{venue.name}</h5>
                      <ul className="list-unstyled">
                        <li>
                          <strong>Price:</strong> ${venue.price} / night
                        </li>
                        <li>
                          <strong>Address:</strong>
                          {` ${
                            venue.location.address || placeHolders.address
                          }, ${venue.location.city || placeHolders.city}`}
                        </li>
                      </ul>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <p>No venues created yet</p>
          )}
        </div>
      ) : (
        /* Bookings View */
        <div>
          <h3>Bookings</h3>
          {bookings.length > 0 ? (
            <div className="bookings-list mt-4">
              {bookings.map((booking) => (
                <Link
                  to={`/venue/${booking.venue?.id}`}
                  key={booking.id}
                  className="text-decoration-none text-black"
                >
                  <div className="booking-item d-flex align-items-center p-3 mb-3 border rounded">
                    <div className="booking-image me-3">
                      <img
                        src={
                          booking.venue?.media?.[0]?.url ||
                          "https://via.placeholder.com/150"
                        }
                        alt={booking.venue?.name}
                        className="img-fluid rounded"
                        style={{
                          width: "150px",
                          height: "100px",
                          objectFit: "cover",
                        }}
                      />
                    </div>
                    <div className="booking-details">
                      <h5>{booking.venue?.name}</h5>
                      <ul className="list-unstyled">
                        <li>
                          <strong>From:</strong>{" "}
                          {normalizeDate(booking.dateFrom)}
                        </li>
                        <li>
                          <strong>To:</strong> {normalizeDate(booking.dateTo)}
                        </li>
                        <li>
                          <strong>Address:</strong>
                          {` ${
                            booking.venue.location.address ||
                            placeHolders.address
                          }, ${
                            booking.venue.location.city || placeHolders.city
                          }`}
                        </li>
                      </ul>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <p>No bookings yet</p>
          )}
        </div>
      )}

      {/* Sign-Out Button */}
      <button className="cta-danger cta-button mt-4" onClick={handleSignOut}>
        Sign Out
      </button>

      {/* Popup for Avatar Editing */}
      {isPopupOpen && (
        <div className="popup">
          <div className="popup-content">
            <h2>Edit Avatar</h2>
            <input
              type="text"
              className="form-control mb-3"
              value={avatarUrl}
              onChange={(e) => setAvatarUrl(e.target.value)}
              placeholder="Enter new avatar URL"
            />
            {error && <p className="text-danger">{error}</p>}
            <div className="popup-buttons">
              <button className="btn btn-primary" onClick={handleAvatarChange}>
                Save
              </button>
              <button
                className="btn btn-secondary"
                onClick={() => setIsPopupOpen(false)}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProfilePage;
