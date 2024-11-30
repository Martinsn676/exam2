import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import useDocumentTitle from "../hooks/useDocumentTitle";
import placeHolders from "../asserts/placeHolders";
import "./venuesList.scss";
import wifiIcon from "../icons/Wi-Fi.png";
import petsIcon from "../icons/Pets.png";
import parkingIcon from "../icons/Parking.png";
import breakfastIcon from "../icons/Breakfast.png";

const baseUrl = "https://v2.api.noroff.dev/";
const venuesUrl = "holidaze/venues";

function VenuesList() {
  const [venues, setVenues] = useState([]); // Stores the list of venues
  const [loading, setLoading] = useState(true); // Tracks loading state
  const [error, setError] = useState(null); // Stores errors if any
  const [search, setSearch] = useState("");
  const [showAmount, setShowAmount] = useState(30); // Number of venues to display
  const location = useLocation();
  const navigate = useNavigate();

  useDocumentTitle("Home page - Holidaze");

  useEffect(() => {
    const fetchVenues = async () => {
      const endUrl =
        search && search.length > 0
          ? `/search?q=${search}&_bookings=true&owner=true`
          : "/?_bookings=true&owner=true";

      try {
        const response = await fetch(baseUrl + venuesUrl + endUrl);
        if (!response.ok) {
          throw new Error("Failed to fetch venues");
        }

        const json = await response.json();
        // Exclude venues with "test" in the name
        const filteredVenues = json.data.filter(
          (venue) => !venue.name.toLowerCase().includes("test")
        );
        setVenues(filteredVenues);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchVenues();
  }, [search]);

  const queryParams = new URLSearchParams(location.search);
  const searchTerm = queryParams.get("search")?.toLowerCase() || "";

  useEffect(() => {
    if (searchTerm.length > 0) {
      setSearch(searchTerm);
      document.title = `Search - Holidaze`;
    } else {
      document.title = `Home - Holidaze`;
      setSearch(false);
    }
  }, [searchTerm]);

  const shortInfoSettings = [
    {
      name: "wifi",
      pos: "Wi-Fi Included",
      neg: "No Wi-Fi",
      icon: wifiIcon,
      alt: "Wi-Fi icon",
    },
    {
      name: "parking",
      pos: "Parking Included",
      neg: "Parking not included",
      icon: parkingIcon,
      alt: "Parking icon",
    },
    {
      name: "pets",
      pos: "Pets Allowed",
      neg: "No pets",
      icon: petsIcon,
      alt: "Pets icon",
    },
    {
      name: "breakfast",
      pos: "Breakfast Included",
      neg: "No breakfast",
      icon: breakfastIcon,
      alt: "Breakfast icon",
    },
  ];

  // if (loading) return <p>Loading venues...</p>;
  if (loading) return <p></p>;
  if (error) return <p>Error: {error}</p>;

  return (
    <div className="container mt-4">
      <h1 className="mb-4">
        {searchTerm ? `Search Results for "${searchTerm}"` : "Available Venues"}
      </h1>

      {venues.length === 0 ? (
        <div className="text-center">
          <h2>No Results Found</h2>
          <p>We couldn't find any venues matching your search term.</p>
          <button
            className="btn btn-primary mt-3"
            onClick={() => navigate("/")}
          >
            Go Back to Home
          </button>
        </div>
      ) : (
        <div className="row">
          {venues.slice(0, showAmount).map((venueDetails) => {
            const shortInfoHtml = Object.entries(venueDetails.meta || {}).map(
              ([key, value]) => {
                const setting = shortInfoSettings.find(
                  (setting) => setting.name === key
                );
                if (setting && value) {
                  return (
                    <div className="p-1 short-description" key={key}>
                      <img src={setting.icon} alt={setting.alt} />
                    </div>
                  );
                }
                return null;
              }
            );

            return (
              <div
                className="col-md-4 mb-4 venue-listing"
                key={venueDetails.id}
                onClick={() => navigate(`/venue/${venueDetails.id}`)}
                style={{ cursor: "pointer" }}
              >
                <div className="card">
                  <div className="venue-image-container">
                    {venueDetails.media.length > 0 ? (
                      <img
                        src={venueDetails.media[0].url}
                        className="card-img-top venue-image"
                        alt={venueDetails.media[0].alt || venueDetails.name}
                      />
                    ) : (
                      <img
                        src="https://via.placeholder.com/300x200"
                        className="card-img-top venue-image"
                        alt="Placeholder"
                      />
                    )}
                  </div>
                  <div className="card-body rounded-20">
                    <h5 className="card-title">{venueDetails.name}</h5>
                    <div className="lemon-font card-address grey-text">
                      {venueDetails.location
                        ? `${
                            venueDetails.location.address ||
                            placeHolders.address
                          }, ${
                            venueDetails.location.city || placeHolders.city
                          }, ${
                            venueDetails.location.country ||
                            placeHolders.country
                          }`
                        : "Address information not available"}
                    </div>
                    <div className="d-flex flex-row">{shortInfoHtml}</div>
                    <ul className="list-unstyled lemon-font group-grey-offshift">
                      <li>Price</li>
                      <li className="grey-text">
                        {venueDetails.price}$ per night
                      </li>
                      <li>Max guests</li>
                      <li className="grey-text">{venueDetails.maxGuests}</li>
                    </ul>
                    <button className="cta-button card-cta">
                      Choose hotel
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
          {venues.length > showAmount && (
            <div className="mt-4 text-center">
              <button
                className="cta-button"
                onClick={() => setShowAmount(showAmount + 10)}
              >
                Show more
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default VenuesList;
