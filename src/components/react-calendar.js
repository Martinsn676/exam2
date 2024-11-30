import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Calendar from "react-calendar"; // Calendar component
import "react-calendar/dist/Calendar.css"; // Calendar styles
import { lsList } from "../utils/lists";
const baseUrl = "https://v2.api.noroff.dev";

function AvailabilityCalendar({ takenDates, days, price, id, signedInUser }) {
  const [availableDates, setAvailableDates] = useState([]);
  const [dateConfirmationString, setDateConfirmationString] = useState(null); // Store the selected check-in date
  const [selectedDates, setSelectedDates] = useState(null); // Store the selected dates for confirmation
  const navigate = useNavigate();
  // Helper function to normalize dates to "YYYY-MM-DD"
  const normalizeDate = (date) => new Date(date).toISOString().split("T")[0];

  useEffect(() => {
    const generateDateRange = () => {
      const start = new Date(); // Today
      const end = new Date();
      end.setDate(start.getDate() + 90); // 90 days from today

      const dates = [];
      for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
        dates.push(normalizeDate(d)); // Normalize each date
      }
      return dates;
    };

    const calculateAvailableDates = () => {
      const allDates = generateDateRange();
      const takenDatesSet = new Set(takenDates.map(normalizeDate)); // Normalize taken dates

      // Find dates that can accommodate the stay
      return allDates.filter((startDate) => {
        for (let i = 0; i < days; i++) {
          const dateToCheck = new Date(startDate);
          dateToCheck.setDate(dateToCheck.getDate() + i);
          const formattedDate = normalizeDate(dateToCheck); // Normalize date
          if (takenDatesSet.has(formattedDate)) {
            return false; // Any part of the range is taken
          }
        }
        return true; // All dates in the range are available
      });
    };

    setAvailableDates(calculateAvailableDates());
  }, [takenDates, days]);

  const tileClassName = ({ date, view }) => {
    if (view === "month") {
      const formattedDate = normalizeDate(date); // Normalize the date
      if (availableDates.includes(formattedDate)) {
        return "available-date";
      }
      if (takenDates.includes(formattedDate)) {
        return "taken-date";
      }
    }
    return null;
  };

  const tileDisabled = ({ date, view }) => {
    if (view === "month") {
      const formattedDate = normalizeDate(date); // Normalize the date
      return !availableDates.includes(formattedDate); // Disable unavailable dates
    }
    return false;
  };

  const handleDateChange = (date) => {
    const selected = normalizeDate(date); // Format the selected date

    // Calculate the end date based on the number of nights
    const endDate = new Date(date);
    endDate.setDate(endDate.getDate() + days); // Add the number of days

    const formattedEndDate = normalizeDate(endDate); // Format the end date
    console.log(`Selected check-in date: ${selected}`);
    console.log(`Calculated check-out date: ${formattedEndDate}`);

    setSelectedDates({ start: selected, end: formattedEndDate });

    setDateConfirmationString(
      <div className="d-flex flex-column align-items-center p-3">
        <div className="mb-2">
          From <strong>{selected}</strong> to{" "}
          <strong>{formattedEndDate}</strong> ({days}{" "}
          {days > 1 ? "nights" : "night"})
        </div>
        <div className="fs-5">
          <strong>Total Price:</strong> {Number(price) * days}$
        </div>
      </div>
    );
  };

  const handleConfirmBooking = async () => {
    console.log("Booking Confirmed:", selectedDates);
    const userLoginData = await lsList.get("userLoginData");
    const body = {
      dateFrom: selectedDates.start, // Required - Instance of new Date()
      dateTo: selectedDates.end, // Required - Instance of new Date()
      guests: 1, // Required
      venueId: id, // Required - The id of the venue to book
    };
    console.log("body", body);
    try {
      const response = await fetch(`${baseUrl}/holidaze/bookings`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${userLoginData.accessToken}`, // Add token for authorization
          "X-Noroff-API-Key": "d6d527ca-f857-47b0-88e5-f8eb71230766",
        },
        body: JSON.stringify(body),
      });
      console.log("response", response);
      if (!response.ok) {
        const json = await response.json();
        console.log(json);
        throw new Error("Failed to create booking.");
      }
      navigate("/profile-page");
      const updatedData = await response.json();
      console.log("updatedData", updatedData);
    } catch (err) {
      console.error(err.message);
    }
  };

  return (
    <div>
      <Calendar
        onChange={handleDateChange} // Handle date selection
        tileClassName={tileClassName} // Apply classes to tiles
        tileDisabled={tileDisabled} // Disable unavailable dates
      />
      <style>{`
        .available-date {
          background-color: #d4edda;
          font-weight: bold;
       
        }
        .taken-date {
          background-color: #f8d7da;
         
        }
      `}</style>

      {/* Confirmation Text */}
      {dateConfirmationString && (
        <div className="mt-3 text-center">
          {dateConfirmationString}
          {signedInUser ? (
            <button
              className="btn btn-primary mt-3"
              onClick={handleConfirmBooking} // Handle booking confirmation
            >
              Confirm Booking
            </button>
          ) : (
            <div className="d-flex flex-column align-items-center">
              <span>Please sign in to place your booking</span>
              <button
                className="btn btn-primary mt-3"
                onClick={() => navigate("/login-page")} // Handle booking confirmation
              >
                Sign in
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default AvailabilityCalendar;
