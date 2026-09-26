import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { apiFetch, money } from "../api";

export default function Subscription() {
  const navigate = useNavigate();

  const {
    user,
    logout
  } = useAuth();

  const [price, setPrice] = useState(99);
  const [days, setDays] = useState(30);
  const [loading, setLoading] = useState(true);

  // =====================================================
  // LOAD SUBSCRIPTION SETTINGS
  // =====================================================

  useEffect(() => {
    const loadSubscriptionSettings =
      async () => {
        try {
          const data =
            await apiFetch(
              "/subscription/settings"
            );

          if (
            data?.success &&
            data?.settings
          ) {
            setPrice(
              Number(
                data.settings.monthlyPrice ||
                  99
              )
            );

            setDays(
              Number(
                data.settings.subscriptionDays ||
                  30
              )
            );
          }
        } catch (error) {
          console.error(
            "Subscription settings error:",
            error
          );
        } finally {
          setLoading(false);
        }
      };

    loadSubscriptionSettings();
  }, []);

  // =====================================================
  // LOGOUT
  // =====================================================

  function handleLogout() {
    // Clear login session
    logout();

    // Go directly to Login page
    navigate("/login", {
      replace: true
    });
  }

  // =====================================================
  // PAGE
  // =====================================================

  return (
    <div
      className="min-vh-100 d-flex align-items-center justify-content-center"
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
          maxWidth: "520px",
          borderRadius: "24px"
        }}
      >

        <div className="card-body text-center p-4 p-md-5">

          {/* =================================================
              LOCK ICON
          ================================================= */}

          <div
            className="d-flex align-items-center justify-content-center mx-auto mb-4"
            style={{
              width: "80px",
              height: "80px",
              borderRadius: "50%",
              background: "#fff3cd",
              fontSize: "36px"
            }}
          >
            🔒
          </div>


          {/* =================================================
              TITLE
          ================================================= */}

          <h2 className="fw-bold mb-3">
            Your Free Trial Has Expired
          </h2>


          <p className="text-secondary mb-4">
            Your free trial has ended.
            Subscribe to continue using
            Studio Billing.
          </p>


          {/* =================================================
              SUBSCRIPTION PRICE
          ================================================= */}

          <div
            className="border rounded-4 p-4 mb-4"
            style={{
              background: "#f8f9fa"
            }}
          >

            <div className="text-secondary mb-2">
              Monthly Subscription
            </div>


            {loading ? (

              <div className="py-2">

                <div
                  className="spinner-border"
                  role="status"
                >
                  <span className="visually-hidden">
                    Loading...
                  </span>
                </div>

              </div>

            ) : (

              <>

                <div className="display-5 fw-bold">
                  {money(price)}
                </div>

                <div className="text-secondary mt-2">
                  Valid for {days} days
                </div>

              </>

            )}

          </div>


          {/* =================================================
              SUBSCRIBE
          ================================================= */}

          <button
            type="button"
            className="btn btn-dark btn-lg w-100 rounded-3"
            onClick={() =>
              navigate("/payment")
            }
            disabled={loading}
          >

            <i className="bi bi-credit-card me-2"></i>

            Subscribe Now

          </button>


          {/* =================================================
              LOGOUT
          ================================================= */}

          <button
            type="button"
            className="btn btn-link text-secondary mt-3"
            onClick={handleLogout}
          >

            Logout

          </button>


          {/* =================================================
              USER EMAIL
          ================================================= */}

          {user?.email && (

            <div className="text-secondary small mt-2">

              {user.email}

            </div>

          )}

        </div>

      </div>

    </div>
  );
}