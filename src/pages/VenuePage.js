import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom"; // To get the 'id' from the URL
import AvailabilityCalendar from "../components/react-calendar";
import wifiIcon from "../icons/Wi-Fi.png"; // Import the image
import petsIcon from "../icons/Pets.png"; // Import the image
import parkingIcon from "../icons/Parking.png"; // Import the image
import mapMarker from "../icons/MapIcon.png"; // Import the image
import breakfastIcon from "../icons/Breakfast.png"; // Import the image
const baseUrl = "https://v2.api.noroff.dev/";
const venuesUrl = "holidaze/venues";

function VenuePage() {
  const { id } = useParams(); // Get the venue id from the URL
  const [takenDates, setTakenDates] = useState([]); // State for taken dates
  const [venueDetails, setVenueDetails] = useState([]); // State for taken dates
  const [loading, setLoading] = useState(true); // State for loading status
  const [error, setError] = useState(null); // State for error handling

  useEffect(() => {
    const fetchVenue = async () => {
      try {
        const response = await fetch(
          `${baseUrl}${venuesUrl}/${id}?_bookings=true&_owner=true`
        ); // API call with id
        if (!response.ok) {
          throw new Error("Failed to fetch venue details");
        }
        const venue = await response.json();
        console.log("Fetched venue:", venue);

        // Extract bookings and convert them to taken dates
        const bookings = venue.data.bookings || [];
        const extractedDates = bookings.flatMap((booking) => {
          const startDate = new Date(booking.dateFrom);
          const endDate = new Date(booking.dateTo);
          const dates = [];

          for (
            let date = startDate;
            date <= endDate;
            date.setDate(date.getDate() + 1)
          ) {
            dates.push(new Date(date).toISOString().split("T")[0]); // Convert to 'YYYY-MM-DD' format
          }
          return dates;
        });
        console.log("extractedDates", extractedDates);
        setTakenDates(extractedDates);
        setVenueDetails(venue.data);
      } catch (err) {
        console.error(err.message);
        setError(err.message);
      } finally {
        setLoading(false); // Stop loading after the fetch is complete
      }
    };

    fetchVenue();
  }, [id]);

  if (loading) return <p>Loading venue details...</p>;
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
  const shortInfoHtml = Object.entries(venueDetails.meta || {}).map(
    ([key, value]) => {
      const setting = shortInfoSettings.find((setting) => setting.name === key);
      if (setting) {
        return (
          <div className="p-1 short-description" key={key}>
            <img
              src={setting.icon}
              alt={setting.alt}
              className={value ? "" : "opacity-25"}
            />
            <span className="ps-2">{value ? setting.pos : setting.neg}</span>
          </div>
        );
      }
      return null; // Return null for keys not in shortInfoSettings
    }
  );
  console.log("shortInfoHtml", shortInfoHtml);
  const addressString = (
    <div className="p-1 short-description" key="Location">
      <img src={mapMarker} alt="Map marker icon" />
      <span className="ps-2">
        {venueDetails.location
          ? `${venueDetails.location.address}, ${venueDetails.location.city}`
          : "Address information not available"}
      </span>
    </div>
  );
  const descriptionString = (
    <div className="">
      {venueDetails.description ? venueDetails.description : "No description"}
    </div>
  );
  return (
    <div className="p-5">
      <h1>{venueDetails.name}</h1>
      <div>
        {venueDetails.media && venueDetails.media[0] && (
          <img
            src={venueDetails.media[0].url}
            alt={venueDetails.name}
            style={{ width: "100%", height: "auto" }}
            className="rounded-4"
          />
        )}
      </div>
      {shortInfoHtml}
      {addressString}
      <div class="d-flex justify-content-center align-items-center p-5">
        <div class="flex-column text-center">
          <button class="cta-button">Book room</button>
        </div>
      </div>
      {descriptionString}
      {/* Pass fetched takenDates to the calendar */}
      <AvailabilityCalendar takenDates={takenDates} />
    </div>
  );
}

export default VenuePage;
