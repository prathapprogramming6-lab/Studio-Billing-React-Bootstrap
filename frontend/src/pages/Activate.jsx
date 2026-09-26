import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Activate() {
  const navigate = useNavigate();
  const location = useLocation();

  const { user, activate, loading } = useAuth();

  const [email, setEmail] = useState(
    location.state?.email ||
      user?.email ||
      ""
  );

  const [activationKey, setActivationKey] =
    useState("");

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [showKey, setShowKey] =
    useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();

    setError("");
    setSuccess("");

    if (!email.trim()) {
      setError("Please enter your email address.");
      return;
    }

    if (!activationKey.trim()) {
      setError("Please enter the activation key.");
      return;
    }

    const result = await activate(
      email.trim(),
      activationKey.trim()
    );

    if (!result.success) {
      setError(
        result.message ||
          "Activation failed. Please check your activation key."
      );
      return;
    }

    setSuccess(
      result.message ||
        "Software activated successfully."
    );

    setTimeout(() => {
      navigate("/dashboard", {
        replace: true
      });
    }, 1000);
  };

  return (
    <div
      className="container-fluid min-vh-100 d-flex align-items-center justify-content-center"
      style={{
        background:
          "linear-gradient(135deg, #f5f7fa 0%, #e9eef5 100%)",
        padding: "20px"
      }}
    >
      <div
        className="card border-0 shadow-lg"
        style={{
          width: "100%",
          maxWidth: "450px",
          borderRadius: "20px",
          overflow: "hidden"
        }}
      >
        <div
          className="text-center text-white p-4"
          style={{
            background:
              "linear-gradient(135deg, #101828 0%, #18263b 100%)"
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
              fontSize: "28px"
            }}
          >
            <i className="bi bi-shield-lock-fill"></i>
          </div>

          <h3 className="fw-bold mb-1">
            Activate Software
          </h3>

          <p className="mb-0 text-white-50">
            Studio Billing Software
          </p>
        </div>

        <div className="card-body p-4 p-md-5">
          <div className="text-center mb-4">
            <h4 className="fw-bold mb-2">
              Activation Required
            </h4>

            <p className="text-muted mb-0">
              Enter the activation key provided
              by the software administrator.
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
            <div className="mb-3">
              <label
                htmlFor="activationEmail"
                className="form-label fw-semibold"
              >
                Email Address
              </label>

              <div className="input-group">
                <span className="input-group-text">
                  <i className="bi bi-envelope"></i>
                </span>

                <input
                  id="activationEmail"
                  type="email"
                  className="form-control"
                  placeholder="Enter your registered email"
                  value={email}
                  onChange={(e) =>
                    setEmail(e.target.value)
                  }
                  autoComplete="email"
                  disabled={loading}
                />
              </div>
            </div>

            <div className="mb-4">
              <label
                htmlFor="activationKey"
                className="form-label fw-semibold"
              >
                Activation Key
              </label>

              <div className="input-group">
                <span className="input-group-text">
                  <i className="bi bi-key-fill"></i>
                </span>

                <input
                  id="activationKey"
                  type={
                    showKey
                      ? "text"
                      : "password"
                  }
                  className="form-control"
                  placeholder="Enter activation key"
                  value={activationKey}
                  onChange={(e) =>
                    setActivationKey(
                      e.target.value
                    )
                  }
                  autoComplete="off"
                  disabled={loading}
                />

                <button
                  type="button"
                  className="btn btn-outline-secondary"
                  onClick={() =>
                    setShowKey(
                      (current) => !current
                    )
                  }
                  disabled={loading}
                  aria-label={
                    showKey
                      ? "Hide activation key"
                      : "Show activation key"
                  }
                >
                  <i
                    className={
                      showKey
                        ? "bi bi-eye-slash"
                        : "bi bi-eye"
                    }
                  ></i>
                </button>
              </div>
            </div>

            <button
              type="submit"
              className="btn w-100 py-2 fw-bold"
              style={{
                background: "#f5c400",
                color: "#172033",
                borderRadius: "10px"
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
                  Activating...
                </>
              ) : (
                <>
                  <i className="bi bi-unlock-fill me-2"></i>
                  Activate Software
                </>
              )}
            </button>
          </form>

          <div className="text-center mt-4">
            <button
              type="button"
              className="btn btn-link text-decoration-none"
              onClick={() =>
                navigate("/login")
              }
              disabled={loading}
            >
              <i className="bi bi-arrow-left me-1"></i>
              Back to Login
            </button>
          </div>

          <div className="text-center mt-2">
            <small className="text-muted">
              Activation is required before
              using the billing software.
            </small>
          </div>
        </div>
      </div>
    </div>
  );
}