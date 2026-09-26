import React, { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export function AuthLayout({ children }) {
  return (
    <div
      className="container-fluid min-vh-100 d-flex align-items-center justify-content-center"
      style={{
        background:
          "linear-gradient(135deg, #f5f7fa 0%, #e9eef5 100%)",
        padding: "20px",
      }}
    >
      {children}
    </div>
  );
}

export default function Login() {
  const navigate = useNavigate();
  const location = useLocation();

  const { login, loading } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();

    setError("");

    if (!email.trim() || !password) {
      setError("Please enter email and password.");
      return;
    }

    const result = await login(
      email.trim(),
      password
    );

    if (!result.success) {
      setError(result.message || "Login failed.");
      return;
    }

    if (result.requiresActivation) {
      navigate("/activate", {
        replace: true,
        state: {
          email: email.trim(),
        },
      });

      return;
    }

    const destination =
      location.state?.from?.pathname ||
      "/dashboard";

    navigate(destination, {
      replace: true,
    });
  };

  return (
    <AuthLayout>
      <div
        className="card border-0 shadow-lg"
        style={{
          width: "100%",
          maxWidth: "430px",
          borderRadius: "20px",
          overflow: "hidden",
        }}
      >
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

        <div className="card-body p-4 p-md-5">
          <div className="text-center mb-4">
            <h4 className="fw-bold mb-1">
              Welcome Back
            </h4>

            <p className="text-muted mb-0">
              Login to continue
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

          <form onSubmit={handleSubmit}>
            <div className="mb-3">
              <label
                htmlFor="loginEmail"
                className="form-label fw-semibold"
              >
                Email Address
              </label>

              <div className="input-group">
                <span className="input-group-text">
                  <i className="bi bi-envelope"></i>
                </span>

                <input
                  id="loginEmail"
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

            <div className="mb-4">
              <label
                htmlFor="loginPassword"
                className="form-label fw-semibold"
              >
                Password
              </label>

              <div className="input-group">
                <span className="input-group-text">
                  <i className="bi bi-lock"></i>
                </span>

                <input
                  id="loginPassword"
                  type={
                    showPassword
                      ? "text"
                      : "password"
                  }
                  className="form-control"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) =>
                    setPassword(e.target.value)
                  }
                  autoComplete="current-password"
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
                  Logging in...
                </>
              ) : (
                <>
                  <i className="bi bi-box-arrow-in-right me-2"></i>
                  Login
                </>
              )}
            </button>
          </form>

          <div className="text-center mt-4">
            <span className="text-muted">
              Don't have an account?{" "}
            </span>

            <Link
              to="/register"
              className="fw-bold text-decoration-none"
              style={{ color: "#b08c00" }}
            >
              Create Account
            </Link>
          </div>
        </div>
      </div>
    </AuthLayout>
  );
}