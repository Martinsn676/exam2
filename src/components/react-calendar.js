import React, { useState, useEffect } from "react";
import Calendar from "react-calendar"; // Calendar component
import "react-calendar/dist/Calendar.css"; // Calendar styles

function AvailabilityCalendar({ takenDates }) {
  const [dateRange, setDateRange] = useState([]); // Range of all dates
  const [availableDates, setAvailableDates] = useState([]); // Available dates

  useEffect(() => {
    // Generate a range of dates (e.g., the next 90 days)
    const generateDateRange = () => {
      const start = new Date(); // Today
      const end = new Date();
      end.setDate(start.getDate() + 90); // 90 days from today

      const dates = [];
      for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
        dates.push(new Date(d));
      }
      return dates;
    };

    // Calculate available dates by excluding takenDates
    const calculateAvailableDates = () => {
      const allDates = generateDateRange();
      const takenDatesSet = new Set(
        takenDates.map((date) => new Date(date).toDateString())
      );

      return allDates.filter((date) => !takenDatesSet.has(date.toDateString()));
    };

    setDateRange(generateDateRange());
    setAvailableDates(calculateAvailableDates());
  }, [takenDates]);

  // Highlight available dates
  const tileClassName = ({ date, view }) => {
    if (view === "month") {
      if (
        availableDates.find((d) => d.toDateString() === date.toDateString())
      ) {
        return "available-date";
      }
      if (
        takenDates.find(
          (d) => new Date(d).toDateString() === date.toDateString()
        )
      ) {
        return "taken-date";
      }
    }
    return null;
  };

  return (
    <div>
      <h2>Availability Calendar</h2>
      <Calendar
        tileClassName={tileClassName} // Apply classes to tiles
      />
      <style>{`
        .available-date {
          background-color: #d4edda;
          border-radius: 50%;
        }
        .taken-date {
          background-color: #f8d7da;
          border-radius: 50%;
        }
      `}</style>
    </div>
  );
}

export default AvailabilityCalendar;
