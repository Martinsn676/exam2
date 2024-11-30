import React, { useState, useEffect } from "react";
import "./VenueManagerPage.scss"; // Assuming you have styles for this page
import editIcon from "../icons/Edit.png"; // Replace with your edit icon path
import { lsList } from "../utils/lists";
import { useParams, useNavigate } from "react-router-dom"; // To get the 'id' from the URL

function CreateVenuePage() {
  const { id } = useParams(); // Get the venue id from the URL
  const navigate = useNavigate();
  const [isPopupOpen, setIsPopupOpen] = useState(false); // Popup visibility state
  const [isDeletePopupOpen, setIsDeletePopupOpen] = useState(false); // Popup for delete confirmation

  const [imageUrl, setImageUrl] = useState(""); // State for the venue image URL
  const [currentImage, setCurrentImage] = useState(
    "https://via.placeholder.com/300x200" // Placeholder image
  );
  const [error, setError] = useState(""); // Error state for validation
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [maxGuests, setMaxGuests] = useState("");
  const [price, setPrice] = useState("");
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("");
  const [country, setCountry] = useState("");
  const [wifi, setWifi] = useState("true");
  const [breakfast, setBreakfast] = useState("true");
  const [parking, setParking] = useState("true");
  const [pets, setPets] = useState("true");
  const [allDataOk, setAllDataOk] = useState(null);
  const [showAllBookings, setShowAllBookings] = useState(false);
  const [venueDetails, setVenueDetails] = useState([]); // State for taken dates
  const [editMode, setEditMode] = useState(false);
  const [saved, setSaved] = useState(true);
  const [finishedLoading, setFinishedLoading] = useState(false);
  const baseUrl = "https://v2.api.noroff.dev";
  const venuesUrl = "/holidaze/venues";
  const initialBookingsShow = 2;
  useEffect(() => {
    const fetchVenue = async () => {
      if (id !== "new") {
        try {
          const response = await fetch(
            `${baseUrl}${venuesUrl}/${id}?_bookings=true&_owner=true`,
            {}
          ); // API call with id
          if (!response.ok) {
            throw new Error("Failed to fetch venue details");
          }
          const venue = await response.json();

          setVenueDetails(venue.data);

          setName(venue.data.name);
          setDescription(venue.data.description);
          setMaxGuests(venue.data.maxGuests);
          setPrice(venue.data.price);
          setAddress(venue.data.location.address);
          setCity(venue.data.location.city);
          setCountry(venue.data.location.country);
          setWifi(venue.data.meta.wifi);
          setBreakfast(venue.data.meta.breakfast);
          setParking(venue.data.meta.parking);
          setPets(venue.data.meta.pets);
          setImageUrl(venue.data.media[0].url);
          setCurrentImage(venue.data.media[0].url);
          setEditMode(true);
        } catch (err) {
          console.error(err.message);
          setError(err.message);
        } finally {
          setSaved(true);

          // setLoading(false); // Stop loading after the fetch is complete
        }
      }
      setFinishedLoading(true);
    };
    fetchVenue();
  }, [id]);
  useEffect(() => {
    const checkData = () => {
      setSaved(false);
      if (
        imageUrl.trim() !== "" &&
        name.trim() !== "" &&
        description.trim() !== "" &&
        maxGuests !== "" &&
        Number(maxGuests) &&
        maxGuests > 0 &&
        price !== "" &&
        price > 0 &&
        Number(maxGuests) &&
        address.trim() !== "" &&
        city.trim() !== "" &&
        country.trim() !== ""
      ) {
        setAllDataOk(true);
      } else {
        setAllDataOk(false);
      }
    };
    checkData(); // Run the function whenever dependencies change
  }, [
    pets,
    wifi,
    parking,
    breakfast,
    imageUrl,
    name,
    description,
    maxGuests,
    price,
    address,
    city,
    country,
  ]); // Watch these variables for changes

  const handleImageSave = () => {
    if (!imageUrl.trim()) {
      setError("Image URL cannot be empty.");
      return;
    }
    setCurrentImage(imageUrl); // Update the current image
    setIsPopupOpen(false); // Close the popup
    setError(""); // Clear any errors
  };
  const handleDeleteVenue = async () => {
    try {
      const userLoginDetails = await lsList.get("userLoginData");
      const response = await fetch(`${baseUrl}/holidaze/venues/${id}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${userLoginDetails.accessToken}`,
          "X-Noroff-API-Key": "d6d527ca-f857-47b0-88e5-f8eb71230766",
        },
      });
      if (!response.ok) {
        throw new Error("Failed to delete venue.");
      }
      navigate("/profile-page");
    } catch (err) {
      console.warn(err.message);
    } finally {
      setIsDeletePopupOpen(false); // Close the delete confirmation popup
    }
  };
  const handleCreateVenue = async () => {
    if (allDataOk) {
      const venue = {
        name: name, // Required
        description: description, // Required
        media: [
          {
            url: currentImage,
            alt: "Venue Image",
          },
        ], // Optional
        price: Number(price), // Required
        maxGuests: Number(maxGuests), // Required

        meta: {
          wifi: JSON.parse(wifi), // Optional (default: false)
          parking: JSON.parse(parking), // Optional (default: false)
          breakfast: JSON.parse(breakfast), // Optional (default: false)
          pets: JSON.parse(pets), // Optional (default: false)
        },
        location: {
          address: address, // Optional (default: null)
          city: city, // Optional (default: null)

          country: country, // Optional (default: null)
        },
      };

      try {
        let endUrl = editMode ? `/holidaze/venues/${id}` : "/holidaze/venues";

        const userLoginDetails = await lsList.get("userLoginData");

        const response = await fetch(`${baseUrl + endUrl}`, {
          method: editMode ? "PUT" : "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${userLoginDetails.accessToken}`, // Add token for authorization
            "X-Noroff-API-Key": "d6d527ca-f857-47b0-88e5-f8eb71230766",
          },
          body: JSON.stringify(venue),
        });

        if (!response.ok) {
          throw new Error(
            "Failed to update avatar. Ensure the URL is publicly accessible."
          );
        }
        const json = await response.json();

        if (!editMode) {
          navigate(`/manage-venue/${json.data.id}`);
        }
        setSaved(true);
      } catch (err) {
        console.warn(err);
      }
    }
  };
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

  console.log("venueDetails.bookings", venueDetails.bookings);

  return !finishedLoading ? (
    ""
  ) : (
    <div className="container mt-5">
      <h1 className="text-center">
        {editMode ? `Viewing ${name || "Venue"}` : "Create a New Venue"}
      </h1>
      <div className="d-flex main-content">
        <div className="left-side">
          {editMode && (
            <div className="mt-4 text-center">
              <button
                className="cta-button"
                onClick={() => navigate(`/venue/${id}`)} // Open delete confirmation popup
              >
                View Venue Listing
              </button>
            </div>
          )}
          {editMode && (
            <div>
              <h3 className="mt-5">Bookings</h3>
              {venueDetails.bookings && venueDetails.bookings.length > 0 ? (
                <div
                  className={
                    showAllBookings ? "bookings-list show-all" : "bookings-list"
                  }
                >
                  {venueDetails.bookings.map((booking, index) => (
                    <div
                      key={index}
                      className={
                        !showAllBookings && index > initialBookingsShow - 1
                          ? "hidden-booking"
                          : ""
                      }
                    >
                      <div className="booking-item d-flex align-items-center p-3 mb-3 border rounded">
                        {/* Booking Details */}
                        <div className="booking-details">
                          <p className="mb-1">
                            <strong>Customer:</strong> {booking.customer.name}
                          </p>
                          <p className="mb-1">
                            <strong>Email:</strong> {booking.customer.email}
                          </p>
                          <p className="mb-1">
                            <strong>From:</strong>{" "}
                            {normalizeDate(booking.dateFrom)}
                          </p>
                          <p className="mb-1">
                            <strong>To:</strong> {normalizeDate(booking.dateTo)}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p>No bookings yet</p>
              )}
              {!showAllBookings &&
                venueDetails.bookings.length > initialBookingsShow - 1 && (
                  <div className="mt-4 text-center">
                    <button
                      className="cta-button"
                      onClick={() => setShowAllBookings(true)} // Open delete confirmation popup
                    >
                      {`Show all bookings (${venueDetails.bookings.length})`}
                    </button>
                  </div>
                )}
            </div>
          )}
        </div>
        <div className="right-side">
          {editMode && <h3 className="mt-5">Edit venue</h3>}
          {/* Image Section */}
          <div
            className="image-container"
            onClick={() => setIsPopupOpen(true)}
            style={{ cursor: "pointer" }}
          >
            <img
              className="venue-image"
              src={currentImage}
              alt="Venue"
              style={{
                width: "300px",
                height: "200px",
                objectFit: "cover",
                borderRadius: "8px",
              }}
            />
            <img
              className="edit-icon"
              src={editIcon}
              alt="Edit icon"
              style={{
                position: "absolute",
                top: "10px",
                right: "10px",
                width: "30px",
                height: "30px",
              }}
            />
          </div>
          <div className="mb-3">
            <label htmlFor="name" className="form-label">
              Name
            </label>
            <input
              type="text"
              id="name"
              className="form-control"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter a name for your venue"
            />
          </div>
          <div>
            <div className="d-flex flex-row justify-content-between text-center">
              <div className="w-50 align-items-center d-flex flex-column p-3">
                Wifi included?
                <button
                  onClick={() => setWifi(wifi ? false : true)}
                  className={wifi ? "left-selected" : "right-selected"}
                >
                  <strong className="left-alt alt">Yes</strong>
                  <strong className="right-alt alt">No</strong>
                </button>
              </div>
              <div className="w-50 align-items-center d-flex flex-column p-3">
                Breakfast included?
                <button
                  onClick={() => setBreakfast(breakfast ? false : true)}
                  className={breakfast ? "left-selected" : "right-selected"}
                >
                  <strong className="left-alt alt">Yes</strong>
                  <strong className="right-alt alt">No</strong>
                </button>
              </div>
            </div>
            <div className="d-flex flex-row justify-content-between">
              <div className="w-50 align-items-center d-flex flex-column p-3">
                Parking included?
                <button
                  onClick={() => setParking(parking ? false : true)}
                  className={parking ? "left-selected" : "right-selected"}
                >
                  <strong className="left-alt alt">Yes</strong>
                  <strong className="right-alt alt">No</strong>
                </button>
              </div>
              <div className="w-50 align-items-center d-flex flex-column p-3">
                Pets allowed?
                <button
                  onClick={() => setPets(pets ? false : true)}
                  className={pets ? "left-selected" : "right-selected"}
                >
                  <strong className="left-alt alt">Yes</strong>
                  <strong className="right-alt alt">No</strong>
                </button>
              </div>
            </div>
          </div>
          <div className="mb-3 w-50">
            <label htmlFor="price" className="form-label">
              Price per night in $
            </label>
            <input
              type="number"
              id="price"
              className="form-control"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              placeholder=""
            />
          </div>
          <div className="mb-3 w-50">
            <label htmlFor="maxGuests" className="form-label">
              Maximum number of guests
            </label>
            <input
              type="number"
              id="maxGuests"
              className="form-control"
              value={maxGuests}
              onChange={(e) => setMaxGuests(e.target.value)}
              placeholder=""
            />
          </div>
          <div className="mb-3">
            <label htmlFor="description" className="form-label">
              Description
            </label>
            <textarea
              type="text"
              id="description"
              className="form-control"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe your venue"
            />
          </div>
          <h2>Address details</h2>
          <div>
            <div className="mb-3">
              <label htmlFor="address" className="form-label">
                Address
              </label>
              <input
                type="text"
                id="address"
                className="form-control"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder=""
              />
            </div>
            <div className="mb-3">
              <label htmlFor="city" className="form-label">
                City
              </label>
              <input
                type="text"
                id="city"
                className="form-control"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                placeholder=""
              />
            </div>
            <div className="mb-3">
              <label htmlFor="country" className="form-label">
                Country
              </label>
              <input
                type="text"
                id="country"
                className="form-control"
                value={country}
                onChange={(e) => setCountry(e.target.value)}
                placeholder=""
              />
            </div>
          </div>

          <div className="mt-4 text-center">
            <button
              className={allDataOk ? "cta-button" : "cta-button disabled"}
              onClick={handleCreateVenue} // Handle sign out
            >
              {editMode
                ? saved
                  ? `Updated`
                  : `Update venue`
                : saved
                ? "No changes"
                : "Create venue"}
            </button>
          </div>
          {/* Delete Venue Button */}
          {editMode && (
            <div className="mt-4 text-center">
              <button
                className="cta-button cta-danger"
                onClick={() => setIsDeletePopupOpen(true)} // Open delete confirmation popup
              >
                Delete Venue
              </button>
            </div>
          )}
        </div>
      </div>
      {/* Popup for Adding Image URL */}
      {isPopupOpen && (
        <div className="popup">
          <div className="popup-content">
            <h2>Add Image URL</h2>
            <input
              type="text"
              className="form-control"
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
              placeholder="Enter image URL"
            />
            {error && <p className="text-danger">{error}</p>}
            <div className="popup-buttons mt-3">
              <button
                className="btn btn-primary"
                onClick={handleImageSave} // Save the image URL
              >
                Save
              </button>
              <button
                className="btn btn-secondary"
                onClick={() => setIsPopupOpen(false)} // Close the popup
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
      {/* Delete Confirmation Popup */}
      {isDeletePopupOpen && (
        <div className="popup">
          <div className="popup-content">
            <h2>Are you sure you want to delete this venue?</h2>
            <div className="popup-buttons mt-3">
              <button
                className="btn btn-danger me-3"
                onClick={handleDeleteVenue} // Confirm deletion
              >
                Yes, Delete
              </button>
              <button
                className="btn btn-secondary"
                onClick={() => setIsDeletePopupOpen(false)} // Cancel deletion
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default CreateVenuePage;
