import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { lsList } from "../utils/lists";
const baseUrl = "https://v2.api.noroff.dev";

function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [repeatPassword, setRepeatPassword] = useState("");
  const [name, setName] = useState("");
  const [role, setRole] = useState("guest");
  const [isLogin, setIsLogin] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  // Validation function
  const validateInputs = () => {
    if (!email.trim()) {
      return "Email is required.";
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return "Please enter a valid email address.";
    }
    if (!password.trim()) {
      return "Password is required.";
    }
    if (!isLogin) {
      if (!name.trim()) {
        return "Name is required.";
      }
      if (password.length < 8) {
        return "Password must be at least 8 characters long.";
      }
      if (password !== repeatPassword) {
        return "Passwords do not match.";
      }
    }
    return null;
  };

  const handleLoginSubmit = async () => {
    const validationError = validateInputs();
    if (validationError) {
      setError(validationError);
      return;
    }

    try {
      const response = await fetch(baseUrl + `/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        if (response.status === 401) {
          setError(
            "Incorrect email or password. Try again or register a new account."
          );
        } else {
          throw new Error("Unexpected error occurred.");
        }
      } else {
        const json = await response.json();
        setError("");
        await lsList.save("userLoginData", {
          accessToken: json.data.accessToken,
          name: json.data.name,
        });
        navigate("/profile-page");
      }
    } catch (err) {
      console.error(err.message);
      setError("Something went wrong. Please try again.");
    }
  };

  const handleRegisterSubmit = async () => {
    const validationError = validateInputs();
    if (validationError) {
      setError(validationError);
      return;
    }

    try {
      const response = await fetch(baseUrl + `/auth/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          password,
          name,
          venueManager: role === "venueManager" ? true : false,
        }),
      });

      if (!response.ok) {
        const json = await response.json();
        if (json.errors[0] && json.errors[0].message) {
          throw new Error(json.errors[0].message);
        } else {
          throw new Error("Failed to register. Please try again.");
        }
      }

      setError("");
      setIsLogin(true); // Switch to login view after successful registration
    } catch (err) {
      console.error(err.message);
      setError(err.message);
    }
  };

  return (
    <div className="container mt-5 login-main-container">
      <h1 className="text-center">{isLogin ? "Login" : "Create Account"}</h1>
      <div className="mt-4">
        <div className="mb-3">
          <label htmlFor="email" className="form-label">
            Email:
          </label>
          <input
            type="email"
            id="email"
            className="form-control"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Enter your email"
          />
        </div>
        {!isLogin && (
          <>
            <div className="mb-3">
              <label htmlFor="name" className="form-label">
                Name:
              </label>
              <input
                type="text"
                id="name"
                className="form-control"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter your name"
              />
            </div>
            <div className="mb-3">
              <label htmlFor="role" className="form-label">
                Register as:
              </label>
              <select
                id="role"
                className="form-select"
                value={role}
                onChange={(e) => setRole(e.target.value)}
              >
                <option value="venueManager">Venue Manager</option>
                <option value="guest">Guest</option>
              </select>
            </div>
          </>
        )}
        <div className="mb-3">
          <label htmlFor="password" className="form-label">
            Password:
          </label>
          <input
            type="password"
            id="password"
            className="form-control"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Enter your password"
          />
        </div>
        {!isLogin && (
          <div className="mb-3">
            <label htmlFor="repeatPassword" className="form-label">
              Repeat Password:
            </label>
            <input
              type="password"
              id="repeatPassword"
              className="form-control"
              value={repeatPassword}
              onChange={(e) => setRepeatPassword(e.target.value)}
              placeholder="Repeat your password"
            />
          </div>
        )}
        <div className="text-center">
          <button
            className="btn btn-primary"
            onClick={isLogin ? handleLoginSubmit : handleRegisterSubmit}
          >
            {isLogin ? "Login" : "Create Account"}
          </button>
        </div>
        {error && <p className="text-danger text-center mt-3">{error}</p>}
        <div className="text-center mt-3">
          <p>
            {isLogin ? "Don't have an account?" : "Already have an account?"}{" "}
            <button
              className="btn btn-link p-0"
              onClick={() => {
                setIsLogin(!isLogin);
                setError(null); // Clear errors on toggle
              }}
            >
              {isLogin ? "Create Account" : "Login"}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}

export default LoginPage;
