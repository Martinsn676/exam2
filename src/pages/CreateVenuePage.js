import React, { useState, useEffect } from "react";
import "./CreateVenuePage.scss"; // Assuming you have styles for this page
import editIcon from "../icons/Edit.png"; // Replace with your edit icon path

function CreateVenuePage() {
  const [isPopupOpen, setIsPopupOpen] = useState(false); // Popup visibility state
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
  useEffect(() => {
    const checkData = () => {
      if (
        imageUrl.trim() !== "" &&
        name.trim() !== "" &&
        description.trim() !== "" &&
        maxGuests.trim() !== "" &&
        Number(maxGuests) &&
        price.trim() !== "" &&
        Number(maxGuests) &&
        address.trim() !== "" &&
        city.trim() !== "" &&
        country.trim() !== ""
      ) {
        setAllDataOk(true);
      } else {
        setAllDataOk(false);
      }
      console.log("checkData", allDataOk);
    };
    checkData(); // Run the function whenever dependencies change
  }, [imageUrl, name, description, maxGuests, price, address, city, country]); // Watch these variables for changes

  const handleImageSave = () => {
    if (!imageUrl.trim()) {
      setError("Image URL cannot be empty.");
      return;
    }
    setCurrentImage(imageUrl); // Update the current image
    setIsPopupOpen(false); // Close the popup
    setError(""); // Clear any errors
  };
  const handleCreateVenue = () => {
    const venue = {
      name: name, // Required
      description: description, // Required
      media: [
        {
          url: currentImage,
          alt: "Venue Image",
        },
      ], // Optional
      price: price, // Required
      maxGuests: maxGuests, // Required

      meta: {
        wifi: wifi, // Optional (default: false)
        parking: parking, // Optional (default: false)
        breakfast: breakfast, // Optional (default: false)
        pets: pets, // Optional (default: false)
      },
      location: {
        address: address, // Optional (default: null)
        city: city, // Optional (default: null)

        country: country, // Optional (default: null)
      },
    };
    console.log("venue", venue);
  };

  return (
    <div className="container mt-5">
      <h1 className="text-center">Create a New Venue</h1>

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
        <div className="d-flex flex-row justify-content-between">
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
          Price per night
        </label>
        <input
          type="number"
          id="price"
          className="form-control"
          value={price}
          onChange={(e) => setPrice(e.target.value)}
          placeholder="Enter the price per night"
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
            Area Code
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
          Create venue
        </button>
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
    </div>
  );
}

export default CreateVenuePage;
