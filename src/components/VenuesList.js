import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom"; // Import useNavigate for routing
const baseUrl = "https://v2.api.noroff.dev/";
const venuesUrl = "holidaze/venues";
function VenuesList() {
  const [venues, setVenues] = useState([]); // State to store venues
  const [loading, setLoading] = useState(true); // State for loading status
  const [error, setError] = useState(null); // State for error handling

  useEffect(() => {
    // Fetch venues from the API
    const fetchVenues = async () => {
      try {
        const response = await fetch(
          baseUrl + venuesUrl + "/?_bookings=true&owner=true"
        ); // Replace with the correct URL
        console.log("response", response);
        if (!response.ok) {
          throw new Error("Failed to fetch venues");
        }
        const json = await response.json();
        console.log("json.data", json.data.length);
        setVenues(json.data); // Update state with the fetched data
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false); // Set loading to false when the fetch is complete
      }
    };

    fetchVenues();
  }, []);

  const navigate = useNavigate(); // Hook must be called unconditionally

  if (loading) return <p>Loading venues...</p>; // Moved conditional return here
  if (error) return <p>Error: {error}</p>;

  return (
    <div className="container mt-4">
      <h1 className="mb-4">Available Venues</h1>
      <div className="row">
        {venues.map((venue) => (
          <div
            className="col-md-4 mb-4"
            key={venue.id}
            onClick={() => navigate(`/venue/${venue.id}`)} // Navigate on card click
            style={{ cursor: "pointer" }} // Add pointer cursor for better UX
          >
            <div className="card">
              {/* Display venue media (image) */}
              {venue.media.length > 0 ? (
                <img
                  src={venue.media[0].url}
                  className="card-img-top"
                  alt={venue.media[0].alt || venue.name}
                />
              ) : (
                <img
                  src="https://via.placeholder.com/300x200"
                  className="card-img-top"
                  alt="Placeholder"
                />
              )}
              <div className="card-body">
                {/* Venue name */}
                <h5 className="card-title">{venue.name}</h5>
                {/* Venue description (truncated for preview) */}
                <p className="card-text">
                  {venue.description.length > 100
                    ? `${venue.description.substring(0, 100)}...`
                    : venue.description}
                </p>
                {/* Venue details (location, price, guests) */}
                <ul className="list-unstyled">
                  <li>
                    <strong>Location:</strong> {venue.location.city},{" "}
                    {venue.location.country}
                  </li>
                  <li>
                    <strong>Max Guests:</strong> {venue.maxGuests}
                  </li>
                  <li>
                    <strong>Price:</strong> ${venue.price} / night
                  </li>
                </ul>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default VenuesList;
