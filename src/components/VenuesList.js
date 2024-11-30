import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import useDocumentTitle from "../hooks/useDocumentTitle";
import placeHolders from "../asserts/placeHolders";
import "./venuesList.scss";
import wifiIcon from "../icons/Wi-Fi.png"; // Import the image
import petsIcon from "../icons/Pets.png"; // Import the image
import parkingIcon from "../icons/Parking.png"; // Import the image

import breakfastIcon from "../icons/Breakfast.png"; // Import the image
const baseUrl = "https://v2.api.noroff.dev/";
const venuesUrl = "holidaze/venues";

function VenuesList() {
  const [venues, setVenues] = useState([]); // State to store venues
  const [loading, setLoading] = useState(true); // State for loading status
  const [error, setError] = useState(null); // State for error handling
  const [search, setSearch] = useState("");
  const location = useLocation(); // To access query parameters
  const navigate = useNavigate();

  useDocumentTitle("Home page - Holidaze");

  useEffect(() => {
    const fetchVenues = async () => {
      console.log("search", search);
      const endUrl =
        search && search.length > 0
          ? `/search?q=${search}&_bookings=true&owner=true`
          : "/?_bookings=true&owner=true";
      try {
        console.log(baseUrl + venuesUrl + endUrl);
        const response = await fetch(baseUrl + venuesUrl + endUrl);
        if (!response.ok) {
          throw new Error("Failed to fetch venues");
        }
        const json = await response.json();
        setVenues(json.data); // Update state with the fetched data
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false); // Set loading to false when the fetch is complete
      }
    };

    fetchVenues();
  }, [search]);

  // Get the search term from the query parameter
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
  // Filter venues based on the search term

  if (loading) return <p>Loading venues...</p>;
  if (error) return <p>Error: {error}</p>;
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

  return (
    <div className="container mt-4">
      <h1 className="mb-4">
        {searchTerm ? `Search Results for "${searchTerm}"` : "Available Venues"}
      </h1>

      {venues.length === 0 ? (
        // Display a "No Results" message
        <div className="text-center">
          <h2>No Results Found</h2>
          <p>We couldn't find any venues matching your search term.</p>
          <button
            className="btn btn-primary mt-3"
            onClick={() => navigate("/")} // Reset to the home page
          >
            Go Back to Home
          </button>
        </div>
      ) : (
        <div className="row">
          {venues.map((venueDetails) => {
            // Generate short info for each venue
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
                return null; // Return null for keys not in shortInfoSettings
              }
            );

            return (
              <div
                className="col-md-4 mb-4"
                key={venueDetails.id}
                onClick={() => navigate(`/venue/${venueDetails.id}`)}
                style={{ cursor: "pointer" }}
              >
                <div className="card">
                  {venueDetails.media.length > 0 ? (
                    <img
                      src={venueDetails.media[0].url}
                      className="card-img-top"
                      alt={venueDetails.media[0].alt || venueDetails.name}
                    />
                  ) : (
                    <img
                      src="https://via.placeholder.com/300x200"
                      className="card-img-top"
                      alt="Placeholder"
                    />
                  )}
                  <div className="card-body rounded-20">
                    <h5 className="card-title">{venueDetails.name}</h5>
                    <div className="lemon-font card-address grey-text">
                      {venueDetails.location
                        ? `${
                            venueDetails.location.address
                              ? venueDetails.location.address
                              : placeHolders.address
                          }, ${
                            venueDetails.location.city
                              ? venueDetails.location.city
                              : placeHolders.city
                          }, ${
                            venueDetails.location.country
                              ? venueDetails.location.country
                              : placeHolders.country
                          }`
                        : "Address information not available"}
                    </div>{" "}
                    <div className="d-flex flex-row">{shortInfoHtml}</div>
                    <ul className="list-unstyled lemon-font group-grey-offshift">
                      <li className="">Price</li>
                      <li className="grey-text">
                        {venueDetails.price}$ per night
                      </li>
                      <li className="lemon-font">Max guests</li>
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
        </div>
      )}
    </div>
  );
}

export default VenuesList;
