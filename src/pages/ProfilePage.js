import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { lsList } from "../utils/lists";
import "./ProfilePage.scss";
import editIcon from "../icons/Edit.png";
import placeHolders from "../asserts/placeHolders";

const baseUrl = "https://v2.api.noroff.dev";

const ProfilePage = () => {
  const navigate = useNavigate();
  const [userDetails, setUserDetails] = useState(null);
  const [avatarUrl, setAvatarUrl] = useState(""); // For avatar URL input
  const [isPopupOpen, setIsPopupOpen] = useState(false); // For popup visibility
  const [error, setError] = useState(null);
  const [bookings, setBookings] = useState(null);
  const [venues, setVenues] = useState(null);
  useEffect(() => {
    const checkUserData = async () => {
      try {
        const userData = await lsList.get("userLoginData");
        console.log("userData", userData);
        if (!userData || !userData.accessToken) {
          navigate("/login-page");
          return null; // Exit early if user data is invalid
        }

        return userData; // Return valid user data
      } catch (err) {
        console.error("Error fetching user data:", err);
        navigate("/login-page");
        return null; // Exit early on error
      }
    };

    const fetchUserDetails = async (userData) => {
      try {
        const response = await fetch(
          `${baseUrl}/holidaze/profiles/${userData.name}?_bookings=true&_venues=true`,
          {
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${userData.accessToken}`, // Add token for authorization
              "X-Noroff-API-Key": "d6d527ca-f857-47b0-88e5-f8eb71230766",
            },
          }
        );

        if (!response.ok) {
          const jsonData = await response.json();
          console.log("jsonData", jsonData);
          throw new Error("Network response was not ok");
        }

        const jsonData = await response.json();
        console.log("jsonData", jsonData);
        lsList.save("userData", jsonData.data);
        // Update state with the fetched data
        setUserDetails(jsonData.data);
        setBookings(jsonData.data.bookings); // Assuming bookings is part of the response
        setVenues(jsonData.data.venues);
        setAvatarUrl(jsonData.data.avatar.url || ""); // Set initial avatar URL
      } catch (err) {
        console.error("Error fetching user details:", err);
        setError(err.message); // Handle errors
      }
    };

    // Run the user check and then fetch additional details
    const initialize = async () => {
      const userData = await checkUserData();
      if (userData) {
        fetchUserDetails(userData);
      }
    };

    initialize(); // Run the initialization process
  }, [navigate]); // Dependencies

  const handleAvatarChange = async () => {
    console.log("handleAvatarChange");
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
            Authorization: `Bearer ${userDetails.accessToken}`, // Add token for authorization
            "X-Noroff-API-Key": "d6d527ca-f857-47b0-88e5-f8eb71230766",
          },
          body: JSON.stringify({
            avatar: {
              url: avatarUrl,
              alt: `${userDetails.name}'s avatar`, // Optional alt text
            },
          }),
        }
      );
      console.log("response", response);
      if (!response.ok) {
        const json = await response.json();
        console.log(json);
        throw new Error(
          "Failed to update avatar. Ensure the URL is publicly accessible."
        );
      }

      const updatedData = await response.json();
      console.log("updatedData", updatedData);
      const newUserDetails = userDetails;
      newUserDetails.avatar.url = avatarUrl;

      setUserDetails(newUserDetails);
      setError("");
      setIsPopupOpen(false); // Close the popup after successful update
    } catch (err) {
      console.error(err.message);
      setError("Something went wrong. Please try again.");
    }
  };
  const handleSignOut = () => {
    lsList.remove("userData"); // Remove user data from storage
    navigate("/login-page"); // Redirect to login page
  };
  const addNewVenue = () => {
    navigate("/create-venue"); // Redirect to login page
  };
  const normalizeDate = (date) => {
    // Split the input date into date and time parts
    const [datePart] = date.split("T");

    // Split the date part into year, month, and day
    const [year, month, day] = datePart.split("-");

    // Ensure the year has a valid prefix, assuming the year is two digits (e.g., "24" for 2024)
    const fullYear = year.length === 2 ? `20${year}` : year;

    // Return the correctly formatted ISO string
    return `${day}.${month}.${fullYear}`;
  };

  if (!userDetails) {
    return <p>Loading...</p>;
  }
  console.log("userDetails", userDetails);
  return (
    <div className="container mt-5 d-flex flex-column align-items-center">
      <div className="headline">
        <h1>Welcome, {userDetails.name}</h1>
        <span className="grey-text lemon-font manager-text">Manager View</span>
      </div>

      {/* Avatar Section */}
      <div
        className="avatar-image-container"
        onClick={() => setIsPopupOpen(true)}
      >
        <img
          className="avatar-image"
          src={userDetails.avatar.url}
          alt="User avatar"
        />
        <img className="edit-icon" src={editIcon} alt="Edit icon" />
      </div>

      {/* Conditional Rendering for Venues or Bookings */}
      <div className="mt-4">
        {userDetails.venueManager ? (
          <div>
            <h3>Your Venues</h3>
            <div className="mt-4 text-center">
              <button
                className="cta-button"
                onClick={addNewVenue} // Handle sign out
              >
                Add venue
              </button>
            </div>
            {venues && venues.length > 0 ? (
              <div className="venues-list">
                {venues.map((venue, index) => (
                  <Link
                    to={`/venue/${venue.id}`}
                    key={index}
                    className="text-decoration-none text-black"
                  >
                    <div className="venue-item d-flex align-items-center p-3 mb-3 border rounded">
                      {/* Image Section */}
                      <div className="venue-image me-3">
                        <img
                          src={
                            venue.media[0]?.url ||
                            "https://via.placeholder.com/150"
                          }
                          alt={venue.name || "Venue"}
                          className="img-fluid rounded"
                          style={{
                            width: "150px",
                            height: "100px",
                            objectFit: "cover",
                          }}
                        />
                      </div>

                      {/* Details Section */}
                      <div className="venue-details">
                        <h5 className="mb-2">{venue.name || "Venue Name"}</h5>
                        <p className="mb-1">
                          <strong>Location:</strong> {venue.location || "N/A"}
                        </p>
                        <p className="mb-0">
                          <strong>Price:</strong> ${venue.price || "N/A"} /
                          night
                        </p>
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
          <div>
            <h3>Bookings</h3>
            {bookings && bookings.length > 0 ? (
              <div className="bookings-list">
                {bookings.map((booking, index) => (
                  <Link
                    to={`/venue/${booking.venue?.id || ""}`}
                    key={index}
                    className="text-decoration-none text-black"
                  >
                    <div className="booking-item d-flex align-items-center p-3 mb-3 border rounded">
                      {/* Image Section */}
                      <div className="booking-image me-3">
                        <img
                          src={
                            booking.venue?.media[0]?.url ||
                            "https://via.placeholder.com/150"
                          }
                          alt={booking.venue?.name || "Venue"}
                          className="img-fluid rounded"
                          style={{
                            width: "150px",
                            height: "100px",
                            objectFit: "cover",
                          }}
                        />
                      </div>

                      {/* Details Section */}
                      <div className="booking-details">
                        <h5 className="mb-2">
                          {booking.venue?.name || "Venue Name"}
                        </h5>
                        <p className="mb-1">
                          <strong>From:</strong>{" "}
                          {normalizeDate(booking.dateFrom)}
                        </p>
                        <p className="mb-1">
                          <strong>To:</strong> {normalizeDate(booking.dateTo)}
                        </p>
                        <p className="mb-0">
                          <strong>Address:</strong>{" "}
                          {booking.venue?.address || placeHolders.address}
                        </p>
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
      </div>

      {/* Sign-Out Button */}
      <div className="mt-4 text-center">
        <button
          className="cta-danger cta-button"
          onClick={handleSignOut} // Handle sign out
        >
          Sign Out
        </button>
      </div>

      {/* Popup for Avatar Editing */}
      {isPopupOpen && (
        <div className="popup">
          <div className="popup-content">
            <h2>Edit Avatar</h2>
            <input
              type="text"
              className="form-control"
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
