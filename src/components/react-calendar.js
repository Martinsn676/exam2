import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import { lsList } from "../hooks/lists";

const baseUrl = "https://v2.api.noroff.dev";

function AvailabilityCalendar({ takenDates, days, price, id, signedInUser }) {
  const [errorMessage, setErrorMessage] = useState(null); // Error message for booking issues
  const [availableDates, setAvailableDates] = useState([]); // List of available dates
  const [dateConfirmationString, setDateConfirmationString] = useState(null); // Selected date confirmation string
  const [selectedDates, setSelectedDates] = useState(null); // Selected booking dates
  const navigate = useNavigate();

  // Helper function to format dates to "YYYY-MM-DD"
  const normalizeDate = (date) => new Date(date).toISOString().split("T")[0];

  useEffect(() => {
    const generateDateRange = () => {
      const start = new Date(); // Today's date
      const end = new Date();
      end.setDate(start.getDate() + 90); // 90 days from today

      const dates = [];
      for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
        dates.push(normalizeDate(d));
      }
      return dates;
    };

    const calculateAvailableDates = () => {
      const allDates = generateDateRange();
      const takenDatesSet = new Set(takenDates.map(normalizeDate)); // Normalize taken dates

      // Filter out unavailable dates based on the length of stay
      return allDates.filter((startDate) => {
        for (let i = 0; i < days; i++) {
          const dateToCheck = new Date(startDate);
          dateToCheck.setDate(dateToCheck.getDate() + i);
          if (takenDatesSet.has(normalizeDate(dateToCheck))) {
            return false; // Unavailable if any date in range is taken
          }
        }
        return true; // All dates in range are available
      });
    };

    setAvailableDates(calculateAvailableDates());
  }, [takenDates, days]);

  const tileClassName = ({ date, view }) => {
    if (view === "month") {
      const formattedDate = normalizeDate(date);
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
      const formattedDate = normalizeDate(date);
      return !availableDates.includes(formattedDate); // Disable unavailable dates
    }
    return false;
  };

  const handleDateChange = (date) => {
    const selected = normalizeDate(date); // Check-in date
    const endDate = new Date(date);
    endDate.setDate(endDate.getDate() + days); // Check-out date

    const formattedEndDate = normalizeDate(endDate);

    setSelectedDates({ start: selected, end: formattedEndDate });

    // Display booking confirmation details
    setDateConfirmationString(
      <div className="d-flex flex-column align-items-center p-3">
        <div className="">
          From <strong>{selected}</strong> to{" "}
          <strong>{formattedEndDate}</strong>
        </div>
        <div>
          ({days} {days > 1 ? "nights" : "night"})
        </div>
        <div className="fs-5">
          Total Price:<strong> {Number(price) * days}$</strong>
        </div>
      </div>
    );
  };

  const handleConfirmBooking = async () => {
    if (!selectedDates) return;
    const userLoginData = await lsList.get("userLoginData");

    const body = {
      dateFrom: selectedDates.start,
      dateTo: selectedDates.end,
      guests: 1,
      venueId: id,
    };

    try {
      const response = await fetch(`${baseUrl}/holidaze/bookings`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${userLoginData.accessToken}`,
          "X-Noroff-API-Key": process.env.REACT_APP_apiKey,
        },
        body: JSON.stringify(body),
      });

      if (!response.ok) {
        throw new Error("Failed to create booking.");
      }

      navigate("/profile-page");
    } catch (err) {
      setErrorMessage(err.message);
    }
  };

  return (
    <div>
      <Calendar
        onChange={handleDateChange} // Triggered when a date is selected
        tileClassName={tileClassName} // Highlight available/taken dates
        tileDisabled={tileDisabled} // Disable unavailable dates
      />
      <style>{`
        .react-calendar {
          border: 3px solid #a0a096;
          margin: 0 auto;
        }
        .available-date {
          background-color: #d4edda;
          font-weight: bold;
        }
        .taken-date {
          background-color: #f8d7da;
        }
      `}</style>

      {dateConfirmationString && (
        <div className="mt-3 text-center">
          {dateConfirmationString}
          {signedInUser ? (
            <button
              className="btn btn-primary mt-3"
              onClick={handleConfirmBooking}
            >
              Confirm Booking
            </button>
          ) : (
            <div className="d-flex flex-column align-items-center">
              <span>Please sign in to place your booking</span>
              <button
                className="btn btn-primary mt-3"
                onClick={() => navigate("/login-page")}
              >
                Sign in
              </button>
            </div>
          )}
          {errorMessage && <p className="text-danger">{errorMessage}</p>}
        </div>
      )}
    </div>
  );
}

export default AvailabilityCalendar;
