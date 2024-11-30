import React, { useState, useEffect, useRef } from "react";
import { useParams } from "react-router-dom"; // To get the 'id' from the URL
import AvailabilityCalendar from "../components/react-calendar";
import wifiIcon from "../icons/Wi-Fi.png"; // Import the image
import petsIcon from "../icons/Pets.png"; // Import the image
import parkingIcon from "../icons/Parking.png"; // Import the image
import mapMarker from "../icons/MapIcon.png"; // Import the image
import breakfastIcon from "../icons/Breakfast.png"; // Import the image
import useDocumentTitle from "../hooks/useDocumentTitle";
import placeHolders from "../asserts/placeHolders";
// import ReservationCalendar from "../components/reservationCalendar";
const baseUrl = "https://v2.api.noroff.dev/";
const venuesUrl = "holidaze/venues";

function VenuePage() {
  const { id } = useParams(); // Get the venue id from the URL
  const [takenDates, setTakenDates] = useState([]); // State for taken dates
  const [venueDetails, setVenueDetails] = useState([]); // State for taken dates
  const [loading, setLoading] = useState(true); // State for loading status
  const [error, setError] = useState(null); // State for error handling
  const bookingSectionRef = useRef(null);

  const scrollToBooking = () => {
    bookingSectionRef.current.scrollIntoView({ behavior: "smooth" });
  };
  const [selectedDays, setSelectedDays] = useState(1); // Default value for days

  const handleDaysChange = (e) => {
    const value = parseInt(e.target.value, 10); // Convert the selected value to a number
    setSelectedDays(value); // Update the state
    console.log("Selected Duration:", value);
  };

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
  useEffect(() => {
    if (venueDetails.name) {
      document.title = `${venueDetails.name} - Holidaze`;
    }
  }, [venueDetails.name]);
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
  console.log("venueDetails.location", venueDetails.location);
  const addressString = (
    <div className="p-1 short-description" key="Location">
      <img src={mapMarker} alt="Map marker icon" />
      <span className="ps-2">
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
      </span>
    </div>
  );
  const descriptionString = (
    <div className="">
      {venueDetails.description && venueDetails.description.length > 40
        ? venueDetails.description
        : placeHolders.description}
    </div>
  );
  console.log("takenDates", takenDates);

  return (
    <div className="p-5">
      {/* Venue Name */}
      <h1 className="text-center">{venueDetails.name}</h1>

      {/* Venue Media */}
      <div className="my-4">
        {venueDetails.media && venueDetails.media[0] ? (
          <img
            src={venueDetails.media[0].url}
            alt={venueDetails.name}
            style={{ width: "100%", height: "auto" }}
            className="rounded-4 shadow"
          />
        ) : (
          <div className="text-center p-4 border rounded">
            <p>No image available</p>
          </div>
        )}
      </div>

      {/* Short Info */}
      <div className="d-flex flex-column justify-content-start my-3">
        {shortInfoHtml}
        <div>{addressString}</div>
      </div>

      {/* Address */}

      {/* Description */}
      <div className="my-4">
        {/* <h5>Description</h5> */}
        <p>{descriptionString}</p>
      </div>

      {/* Book Room Button */}
      <div className="d-flex justify-content-center align-items-center my-5">
        <div className="flex-column text-center">
          <button
            className="btn btn-primary cta-button"
            onClick={scrollToBooking}
          >
            Book Room
          </button>
        </div>
      </div>

      {/* Duration Selector */}
      <div className="my-3">
        <select
          className="form-select"
          onChange={handleDaysChange} // Update selectedDays on change
        >
          <option value="1">1 night</option>
          <option value="2">2 nights</option>
          <option value="3">3 nights</option>
          <option value="4">4 nights</option>
          <option value="5">5 nights</option>
        </select>
      </div>

      {/* Booking Section with Calendar */}
      <div ref={bookingSectionRef} className="my-4">
        <h3 className="text-center">Check Availability</h3>
        <AvailabilityCalendar
          takenDates={takenDates}
          days={selectedDays}
          price={venueDetails.price}
          id={venueDetails.id}
        />
      </div>
    </div>
  );
}

export default VenuePage;
