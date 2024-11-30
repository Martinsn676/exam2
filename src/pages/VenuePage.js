import React, { useState, useEffect, useRef } from "react";
import { useParams } from "react-router-dom";
import AvailabilityCalendar from "../components/react-calendar";
import wifiIcon from "../icons/Wi-Fi.png";
import petsIcon from "../icons/Pets.png";
import parkingIcon from "../icons/Parking.png";
import mapMarker from "../icons/MapIcon.png";
import breakfastIcon from "../icons/Breakfast.png";
import placeHolders from "../components/placeHolders";
import { lsList } from "../hooks/lists";

const baseUrl = "https://v2.api.noroff.dev/";
const venuesUrl = "holidaze/venues";

function VenuePage() {
  const { id } = useParams(); // Retrieve the venue ID from the URL
  const [takenDates, setTakenDates] = useState([]); // Dates already booked for this venue
  const [venueDetails, setVenueDetails] = useState([]); // Venue details
  const [loading, setLoading] = useState(true); // Loading state for data fetch
  const [error, setError] = useState(null); // Error state for data fetch
  const [signedInUser, setSignedInUser] = useState(false); // Signed-in user status
  const bookingSectionRef = useRef(null); // Reference for the booking section
  const [selectedDays, setSelectedDays] = useState(1); // Number of days selected for booking

  // Determine whether to show PC or mobile version based on screen width
  function usePcVersion() {
    const [pcVersion, setPcVersion] = useState(window.innerWidth > 768);

    useEffect(() => {
      const handleResize = () => {
        setPcVersion(window.innerWidth > 768);
      };
      window.addEventListener("resize", handleResize);
      return () => window.removeEventListener("resize", handleResize);
    }, []);

    return pcVersion;
  }

  const pcVersion = usePcVersion();

  // Scroll to the booking section with an offset
  const scrollToBooking = () => {
    const offset = 100; // Adjust the offset value
    const elementPosition =
      bookingSectionRef.current.getBoundingClientRect().top;
    const offsetPosition = elementPosition - offset;

    window.scrollTo({
      top: offsetPosition,
      behavior: "smooth",
    });
  };

  // Fetch venue details and bookings
  useEffect(() => {
    const fetchVenue = async () => {
      try {
        const response = await fetch(
          `${baseUrl}${venuesUrl}/${id}?_bookings=true`
        );
        if (!response.ok) {
          throw new Error("Failed to fetch venue details");
        }
        const venue = await response.json();

        // Extract booked dates from API response
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
            dates.push(new Date(date).toISOString().split("T")[0]);
          }
          return dates;
        });

        setTakenDates(extractedDates);
        setVenueDetails(venue.data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false); // Stop loading spinner
      }
    };

    fetchVenue();
  }, [id]);

  // Set document title dynamically based on venue name
  useEffect(() => {
    if (venueDetails.name) {
      document.title = `${venueDetails.name} - Holidaze`;
    }
  }, [venueDetails.name]);

  // Check for signed-in user
  useEffect(() => {
    const initialize = async () => {
      const userData = await lsList.get("userData");
      if (userData && !userData.venueManager) {
        setSignedInUser(true);
      }
    };
    initialize();
  }, []);

  // Handle dropdown change for selecting booking duration
  const handleDaysChange = (e) => {
    const value = parseInt(e.target.value, 10);
    setSelectedDays(value);
  };
  // I disabled loading due to it not being nescesary
  // if (loading) return <p>Loading venue details...</p>;
  if (loading) return <p></p>;
  if (error) return <p>Error: {error}</p>;

  const shortInfoSettings = [
    { name: "wifi", pos: "Wi-Fi Included", neg: "No Wi-Fi", icon: wifiIcon },
    {
      name: "parking",
      pos: "Parking Included",
      neg: "No Parking",
      icon: parkingIcon,
    },
    { name: "pets", pos: "Pets Allowed", neg: "No Pets", icon: petsIcon },
    {
      name: "breakfast",
      pos: "Breakfast Included",
      neg: "No Breakfast",
      icon: breakfastIcon,
    },
  ];

  const shortInfoHtml = Object.entries(venueDetails.meta || {}).map(
    ([key, value]) => {
      const setting = shortInfoSettings.find((s) => s.name === key);
      if (setting) {
        return (
          <div className="p-1 short-description" key={key}>
            <img
              src={setting.icon}
              alt={setting.name}
              className={value ? "" : "opacity-25"}
            />
            <span className="ps-2">{value ? setting.pos : setting.neg}</span>
          </div>
        );
      }
      return null;
    }
  );

  const addressString = (
    <div className="p-1 short-description" key="Location">
      <img src={mapMarker} alt="Map marker icon" />
      <span className="ps-2">
        {venueDetails.location
          ? `${venueDetails.location.address || placeHolders.address}, ${
              venueDetails.location.city || placeHolders.city
            }, ${venueDetails.location.country || placeHolders.country}`
          : "Address information not available"}
      </span>
    </div>
  );

  const descriptionString = (
    <p>
      {venueDetails.description &&
      venueDetails.description.length > 100 &&
      !venueDetails.description.toLowerCase().startsWith("lorem")
        ? venueDetails.description
        : placeHolders.description}
    </p>
  );

  return pcVersion ? (
    <div className="d-flex">
      {/* Left Column */}
      <div className="col-4 p-4">
        <div className="my-4">
          {venueDetails.media?.[0] ? (
            <img
              src={venueDetails.media[0].url}
              alt={venueDetails.name}
              className="rounded-4 shadow"
              style={{ maxWidth: "100%", maxHeight: "400px" }}
            />
          ) : (
            <div className="text-center p-4 border rounded">
              <p>No image available</p>
            </div>
          )}
        </div>
        <div className="my-3">
          <select className="form-select" onChange={handleDaysChange}>
            {[...Array(7)].map((_, i) => (
              <option key={i + 1} value={i + 1}>
                {i + 1} {i + 1 === 1 ? "night" : "nights"}
              </option>
            ))}
          </select>
        </div>
        <div ref={bookingSectionRef} className="my-4">
          <h3 className="text-center">Check Availability</h3>
          <AvailabilityCalendar
            takenDates={takenDates}
            days={selectedDays}
            price={venueDetails.price}
            id={venueDetails.id}
            signedInUser={signedInUser}
          />
        </div>
      </div>
      {/* Right Column */}
      <div className="col-8 p-4">
        <h1>{venueDetails.name}</h1>
        <div className="d-flex flex-column my-3">
          {shortInfoHtml}
          {addressString}
        </div>
        {descriptionString}
      </div>
    </div>
  ) : (
    <div className="p-5">
      <div className="w-100 text-break ">
        <h1 className="card-title">{venueDetails.name}</h1>
      </div>
      <div className="my-4">
        {venueDetails.media?.[0] ? (
          <img
            src={venueDetails.media[0].url}
            alt={venueDetails.name}
            style={{ width: "100%" }}
            className="rounded-4 shadow"
          />
        ) : (
          <div className="text-center p-4 border rounded">
            <p>No image available</p>
          </div>
        )}
      </div>
      <div>
        {shortInfoHtml}
        {addressString}
      </div>
      <div className="m-4 text-center">
        <button className="cta-button " onClick={() => scrollToBooking()}>
          Start booking
        </button>
      </div>
      {descriptionString}{" "}
      <div ref={bookingSectionRef}>
        <div className="my-3">
          <select className="form-select" onChange={handleDaysChange}>
            {[...Array(7)].map((_, i) => (
              <option key={i + 1} value={i + 1}>
                {i + 1} {i + 1 === 1 ? "night" : "nights"}
              </option>
            ))}
          </select>
        </div>

        <h3 className="text-center">Check Availability</h3>
        <AvailabilityCalendar
          takenDates={takenDates}
          days={selectedDays}
          price={venueDetails.price}
          id={venueDetails.id}
          signedInUser={signedInUser}
        />
      </div>
    </div>
  );
}

export default VenuePage;
