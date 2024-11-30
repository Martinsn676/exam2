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

export default normalizeDate;
