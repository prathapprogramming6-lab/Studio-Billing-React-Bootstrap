import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AuthLayout } from "./Login";
import { useAuth } from "../context/AuthContext";

export default function Register() {
  const navigate = useNavigate();
  const { register, loading } = useAuth();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] =
    useState("");

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [showPassword, setShowPassword] =
    useState(false);

  const [showConfirmPassword, setShowConfirmPassword] =
    useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();

    setError("");
    setSuccess("");

    if (
      !name.trim() ||
      !email.trim() ||
      !phone.trim() ||
      !password ||
      !confirmPassword
    ) {
      setError("Please fill in all fields.");
      return;
    }

    if (password.length < 6) {
      setError(
        "Password must be at least 6 characters."
      );
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    const result = await register(
      name.trim(),
      email.trim(),
      phone.trim(),
      password
    );

    if (!result.success) {
      setError(
        result.message ||
          "Registration failed."
      );
      return;
    }

    setSuccess(
      "Account created successfully. Please login."
    );

    setTimeout(() => {
      navigate("/login", {
        replace: true,
        state: {
          registeredEmail: email.trim()
        }
      });
    }, 1000);
  };

  return (
    <AuthLayout>
      <div
        className="card border-0 shadow-lg"
        style={{
          width: "100%",
          maxWidth: "470px",
          borderRadius: "20px",
          overflow: "hidden",
        }}
      >
        {/* Header */}
        <div
          className="text-center text-white p-4"
          style={{
            background:
              "linear-gradient(135deg, #101828 0%, #18263b 100%)",
          }}
        >
          <div
            className="d-inline-flex align-items-center justify-content-center mb-3"
            style={{
              width: "64px",
              height: "64px",
              borderRadius: "16px",
              background: "#f5c400",
              color: "#172033",
              fontSize: "28px",
            }}
          >
            <i className="bi bi-camera-fill"></i>
          </div>

          <h3 className="fw-bold mb-1">
            Studio Billing
          </h3>

          <p className="mb-0 text-white-50">
            Photography & Videography
          </p>
        </div>

        {/* Form */}
        <div className="card-body p-4 p-md-5">
          <div className="text-center mb-4">
            <h4 className="fw-bold mb-1">
              Create Account
            </h4>

            <p className="text-muted mb-0">
              Create your Studio Billing account
            </p>
          </div>

          {error && (
            <div
              className="alert alert-danger"
              role="alert"
            >
              <i className="bi bi-exclamation-circle me-2"></i>
              {error}
            </div>
          )}

          {success && (
            <div
              className="alert alert-success"
              role="alert"
            >
              <i className="bi bi-check-circle me-2"></i>
              {success}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            {/* Full Name */}
            <div className="mb-3">
              <label
                htmlFor="registerName"
                className="form-label fw-semibold"
              >
                Full Name
              </label>

              <div className="input-group">
                <span className="input-group-text">
                  <i className="bi bi-person"></i>
                </span>

                <input
                  id="registerName"
                  type="text"
                  className="form-control"
                  placeholder="Enter your full name"
                  value={name}
                  onChange={(e) =>
                    setName(e.target.value)
                  }
                  autoComplete="name"
                  disabled={loading}
                />
              </div>
            </div>

            {/* Email */}
            <div className="mb-3">
              <label
                htmlFor="registerEmail"
                className="form-label fw-semibold"
              >
                Email Address
              </label>

              <div className="input-group">
                <span className="input-group-text">
                  <i className="bi bi-envelope"></i>
                </span>

                <input
                  id="registerEmail"
                  type="email"
                  className="form-control"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) =>
                    setEmail(e.target.value)
                  }
                  autoComplete="email"
                  disabled={loading}
                />
              </div>
            </div>

            {/* Phone */}
            <div className="mb-3">
              <label
                htmlFor="registerPhone"
                className="form-label fw-semibold"
              >
                Phone Number
              </label>

              <div className="input-group">
                <span className="input-group-text">
                  <i className="bi bi-telephone"></i>
                </span>

                <input
                  id="registerPhone"
                  type="tel"
                  className="form-control"
                  placeholder="Enter your phone number"
                  value={phone}
                  onChange={(e) =>
                    setPhone(e.target.value)
                  }
                  autoComplete="tel"
                  disabled={loading}
                />
              </div>
            </div>

            {/* Password */}
            <div className="mb-3">
              <label
                htmlFor="registerPassword"
                className="form-label fw-semibold"
              >
                Password
              </label>

              <div className="input-group">
                <span className="input-group-text">
                  <i className="bi bi-lock"></i>
                </span>

                <input
                  id="registerPassword"
                  type={
                    showPassword
                      ? "text"
                      : "password"
                  }
                  className="form-control"
                  placeholder="Create a password"
                  value={password}
                  onChange={(e) =>
                    setPassword(e.target.value)
                  }
                  autoComplete="new-password"
                  disabled={loading}
                />

                <button
                  type="button"
                  className="btn btn-outline-secondary"
                  onClick={() =>
                    setShowPassword(
                      (current) => !current
                    )
                  }
                  disabled={loading}
                >
                  <i
                    className={
                      showPassword
                        ? "bi bi-eye-slash"
                        : "bi bi-eye"
                    }
                  ></i>
                </button>
              </div>
            </div>

            {/* Confirm Password */}
            <div className="mb-4">
              <label
                htmlFor="registerConfirmPassword"
                className="form-label fw-semibold"
              >
                Confirm Password
              </label>

              <div className="input-group">
                <span className="input-group-text">
                  <i className="bi bi-lock-fill"></i>
                </span>

                <input
                  id="registerConfirmPassword"
                  type={
                    showConfirmPassword
                      ? "text"
                      : "password"
                  }
                  className="form-control"
                  placeholder="Confirm your password"
                  value={confirmPassword}
                  onChange={(e) =>
                    setConfirmPassword(
                      e.target.value
                    )
                  }
                  autoComplete="new-password"
                  disabled={loading}
                />

                <button
                  type="button"
                  className="btn btn-outline-secondary"
                  onClick={() =>
                    setShowConfirmPassword(
                      (current) => !current
                    )
                  }
                  disabled={loading}
                >
                  <i
                    className={
                      showConfirmPassword
                        ? "bi bi-eye-slash"
                        : "bi bi-eye"
                    }
                  ></i>
                </button>
              </div>
            </div>

            {/* Create Account */}
            <button
              type="submit"
              className="btn w-100 py-2 fw-bold"
              style={{
                background: "#f5c400",
                color: "#172033",
                borderRadius: "10px",
              }}
              disabled={loading}
            >
              {loading ? (
                <>
                  <span
                    className="spinner-border spinner-border-sm me-2"
                    role="status"
                    aria-hidden="true"
                  ></span>

                  Creating Account...
                </>
              ) : (
                <>
                  <i className="bi bi-person-plus-fill me-2"></i>
                  Create Account
                </>
              )}
            </button>
          </form>

          {/* Login Link */}
          <div className="text-center mt-4">
            <span className="text-muted">
              Already have an account?{" "}
            </span>

            <Link
              to="/login"
              className="fw-bold text-decoration-none"
              style={{
                color: "#b08c00",
              }}
            >
              Sign In
            </Link>
          </div>
        </div>
      </div>
    </AuthLayout>
  );
}