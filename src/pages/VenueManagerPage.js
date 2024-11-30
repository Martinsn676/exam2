import React, { useState, useEffect } from "react";
import "./VenueManagerPage.scss"; // Assuming you have styles for this page
import editIcon from "../icons/Edit.png"; // Replace with your edit icon path
import { lsList } from "../hooks/lists";
import { useParams, useNavigate } from "react-router-dom"; // To get the 'id' from the URL
import normalizeDate from "../utils/dateUtils";
function CreateVenuePage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [error, setError] = useState("");
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [isDeletePopupOpen, setIsDeletePopupOpen] = useState(false);
  const [venueDetails, setVenueDetails] = useState([]);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    maxGuests: "",
    price: "",
    address: "",
    city: "",
    country: "",
    wifi: true,
    breakfast: true,
    parking: true,
    pets: true,
  });
  const [imageUrl, setImageUrl] = useState("");
  const [currentImage, setCurrentImage] = useState(
    "https://via.placeholder.com/300x200"
  );
  const [editMode, setEditMode] = useState(false);
  const [allDataOk, setAllDataOk] = useState(false);
  const [saved, setSaved] = useState(true);
  const [finishedLoading, setFinishedLoading] = useState(false);
  const [showAllBookings, setShowAllBookings] = useState(false);

  const BASE_URL = "https://v2.api.noroff.dev";
  const VENUES_ENDPOINT = "/holidaze/venues";
  const initialBookingsShow = 2;

  // Fetch venue details for editing
  useEffect(() => {
    if (id === "new") {
      setFinishedLoading(true);
      return;
    }

    const fetchVenue = async () => {
      try {
        const response = await fetch(
          `${BASE_URL}${VENUES_ENDPOINT}/${id}?_bookings=true&_owner=true`
        );
        if (!response.ok) throw new Error("Failed to fetch venue details");

        const venue = await response.json();
        const { data } = venue;

        setVenueDetails(data);
        setFormData({
          name: data.name || "",
          description: data.description || "",
          maxGuests: data.maxGuests || "",
          price: data.price || "",
          address: data.location?.address || "",
          city: data.location?.city || "",
          country: data.location?.country || "",
          wifi: data.meta?.wifi || false,
          breakfast: data.meta?.breakfast || false,
          parking: data.meta?.parking || false,
          pets: data.meta?.pets || false,
        });
        setImageUrl(data.media?.[0]?.url || "");
        setCurrentImage(data.media?.[0]?.url || "");
        setEditMode(true);
      } catch (err) {
        console.error(err.message);
        setError(err);
      } finally {
        setSaved(true);
        setFinishedLoading(true);
      }
    };

    fetchVenue();
  }, [id]);

  // Form validation
  useEffect(() => {
    setSaved(false);
    const isFormValid = () => {
      if (
        formData.name.trim() &&
        formData.description.trim() &&
        formData.price > 0 &&
        formData.maxGuests > 0 &&
        formData.address.trim() &&
        formData.city.trim() &&
        formData.country.trim()
      ) {
        return true;
      }
    };

    setAllDataOk(isFormValid());
  }, [formData, imageUrl]);

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleImageSave = () => {
    if (!imageUrl.trim()) {
      alert("Image URL cannot be empty.");
      return;
    }
    setCurrentImage(imageUrl);
    setIsPopupOpen(false);
  };

  const handleCreateVenue = async () => {
    if (!allDataOk) return;

    const venueData = {
      media: [{ url: currentImage, alt: "Venue Image" }],
      price: Number(formData.price),
      maxGuests: Number(formData.maxGuests),
      name: formData.name,
      description: formData.description,
      meta: {
        wifi: formData.wifi,
        breakfast: formData.wifi,
        pets: formData.pets,
        parking: formData.parking,
      },
      location: {
        address: formData.address,
        city: formData.city,
        country: formData.country,
      },
    };
    console.log("venueData", venueData);

    try {
      const userLoginDetails = await lsList.get("userLoginData");
      const method = editMode ? "PUT" : "POST";
      const endpoint = editMode ? `${VENUES_ENDPOINT}/${id}` : VENUES_ENDPOINT;

      const response = await fetch(`${BASE_URL}${endpoint}`, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${userLoginDetails.accessToken}`,
          "X-Noroff-API-Key": process.env.REACT_APP_apiKey,
        },
        body: JSON.stringify(venueData),
      });

      if (!response.ok) {
        const json = await response.json();
        console.log(json);
        throw new Error("Failed to save venue");
      }

      const json = await response.json();
      if (!editMode) navigate(`/manage-venue/${json.data.id}`);
      setSaved(true);
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteVenue = async () => {
    try {
      const userLoginDetails = await lsList.get("userLoginData");
      const response = await fetch(`${BASE_URL}/holidaze/venues/${id}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${userLoginDetails.accessToken}`,
          "X-Noroff-API-Key": process.env.REACT_APP_apiKey,
        },
      });
      if (!response.ok) throw new Error("Failed to delete venue");

      navigate("/profile-page");
    } catch (err) {
      console.warn(err.message);
    } finally {
      setIsDeletePopupOpen(false);
    }
  };
  if (!finishedLoading) {
    return ``;
  }
  return (
    <div className="container mt-5">
      <h1 className="text-center">
        {editMode
          ? `Viewing ${formData.name || "Venue"}`
          : "Create a New Venue"}
      </h1>{" "}
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
      <div
        className="d-flex main-content"
        data-mode={editMode ? "edit" : "create"}
      >
        <div className="left-side">
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
                            <strong>From:</strong>
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
              value={formData.name}
              onChange={(e) => handleInputChange("name", e.target.value)}
              placeholder="Enter a name for your venue"
            />
          </div>

          <div>
            <div className="d-flex flex-row justify-content-between text-center">
              {[
                { label: "Wi-Fi included?", field: "wifi" },
                { label: "Breakfast included?", field: "breakfast" },
              ].map((item) => (
                <div
                  key={item.field}
                  className="w-50 align-items-center d-flex flex-column p-3"
                >
                  {item.label}
                  <button
                    onClick={() =>
                      handleInputChange(item.field, !formData[item.field])
                    }
                    className={
                      formData[item.field] ? "left-selected" : "right-selected"
                    }
                  >
                    <strong className="left-alt alt">Yes</strong>
                    <strong className="right-alt alt">No</strong>
                  </button>
                </div>
              ))}
            </div>

            <div className="d-flex flex-row justify-content-between">
              {[
                { label: "Parking included?", field: "parking" },
                { label: "Pets allowed?", field: "pets" },
              ].map((item) => (
                <div
                  key={item.field}
                  className="w-50 align-items-center d-flex flex-column p-3"
                >
                  {item.label}
                  <button
                    onClick={() =>
                      handleInputChange(item.field, !formData[item.field])
                    }
                    className={
                      formData[item.field] ? "left-selected" : "right-selected"
                    }
                  >
                    <strong className="left-alt alt">Yes</strong>
                    <strong className="right-alt alt">No</strong>
                  </button>
                </div>
              ))}
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
              value={formData.price}
              onChange={(e) => handleInputChange("price", e.target.value)}
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
              value={formData.maxGuests}
              onChange={(e) => handleInputChange("maxGuests", e.target.value)}
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
              value={formData.description}
              onChange={(e) => handleInputChange("description", e.target.value)}
              placeholder="Describe your venue"
            />
          </div>

          <h2>Address Details</h2>
          {[
            { label: "Address", field: "address", placeholder: "" },
            { label: "City", field: "city", placeholder: "" },
            { label: "Country", field: "country", placeholder: "" },
          ].map((item) => (
            <div key={item.field} className="mb-3">
              <label htmlFor={item.field} className="form-label">
                {item.label}
              </label>
              <input
                type="text"
                id={item.field}
                className="form-control"
                value={formData[item.field]}
                onChange={(e) => handleInputChange(item.field, e.target.value)}
                placeholder={item.placeholder}
              />
            </div>
          ))}

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
