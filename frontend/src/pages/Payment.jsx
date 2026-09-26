import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { apiFetch, money } from "../api";
import { useAuth } from "../context/AuthContext";

const RAZORPAY_SCRIPT =
  "https://checkout.razorpay.com/v1/checkout.js";

export default function Payment() {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [scriptLoaded, setScriptLoaded] =
    useState(false);

  const [price, setPrice] = useState(99);
  const [days, setDays] = useState(30);

  const [loading, setLoading] =
    useState(false);

  const [message, setMessage] =
    useState("");

  const [error, setError] =
    useState("");

  useEffect(() => {
    if (
      document.querySelector(
        `script[src="${RAZORPAY_SCRIPT}"]`
      )
    ) {
      setScriptLoaded(true);
      return;
    }

    const script =
      document.createElement("script");

    script.src = RAZORPAY_SCRIPT;
    script.async = true;

    script.onload = () => {
      setScriptLoaded(true);
    };

    script.onerror = () => {
      setScriptLoaded(false);
      setError(
        "Unable to load Razorpay payment system."
      );
    };

    document.body.appendChild(script);

    return () => {
      // Keep Razorpay script available
    };
  }, []);

  const startPayment = async () => {
    setLoading(true);
    setError("");
    setMessage("");

    try {
      if (!scriptLoaded) {
        throw new Error(
          "Razorpay is still loading. Please try again."
        );
      }

      if (!window.Razorpay) {
        throw new Error(
          "Razorpay payment system is not available."
        );
      }

      /*
      Create payment order from backend.
      Backend gets the current subscription
      price from MongoDB.
      */
      const orderData = await apiFetch(
        "/payment/create-order",
        {
          method: "POST"
        }
      );

      if (!orderData.success) {
        throw new Error(
          orderData.message ||
            "Unable to create payment order."
        );
      }

      const order =
        orderData.order;

      const subscription =
        orderData.subscription;

      setPrice(
        Number(subscription?.price || 99)
      );

      setDays(
        Number(subscription?.days || 30)
      );

      const options = {
        key: orderData.razorpayKey,

        amount: order.amount,

        currency:
          order.currency || "INR",

        name: "Studio Billing",

        description:
          "Monthly Studio Billing Subscription",

        order_id: order.id,

        prefill: {
          name: user?.name || "",
          email: user?.email || "",
          contact: user?.phone || ""
        },

        notes: {
          purpose:
            "Studio Billing Monthly Subscription"
        },

        theme: {
          color: "#212529"
        },

        handler: async function (
          response
        ) {
          try {
            setLoading(true);
            setError("");
            setMessage(
              "Verifying your payment..."
            );

            /*
            Send Razorpay payment details
            to backend for secure verification.
            */
            const verifyData =
              await apiFetch(
                "/payment/verify",
                {
                  method: "POST",
                  body: JSON.stringify({
                    razorpay_order_id:
                      response.razorpay_order_id,

                    razorpay_payment_id:
                      response.razorpay_payment_id,

                    razorpay_signature:
                      response.razorpay_signature
                  })
                }
              );

            if (!verifyData.success) {
              throw new Error(
                verifyData.message ||
                  "Payment verification failed."
              );
            }

            /*
            Save updated user locally.
            AuthContext will read this after
            the dashboard reloads.
            */
            if (verifyData.user) {
              localStorage.setItem(
                "studioUser",
                JSON.stringify(
                  verifyData.user
                )
              );
            }

            setMessage(
              "Payment successful! Your subscription is now active."
            );

            /*
            Give the user a moment to see
            the success message, then go dashboard.
            */
            setTimeout(() => {
              window.location.href =
                "/dashboard";
            }, 1200);
          } catch (verifyError) {
            console.error(
              "Payment verification error:",
              verifyError
            );

            setError(
              verifyError.message ||
                "Payment verification failed."
            );

            setMessage("");
            setLoading(false);
          }
        },

        modal: {
          ondismiss: function () {
            setLoading(false);
            setMessage("");
          }
        }
      };

      const razorpay =
        new window.Razorpay(options);

      razorpay.on(
        "payment.failed",
        function (response) {
          console.error(
            "Razorpay payment failed:",
            response?.error
          );

          setError(
            response?.error?.description ||
              "Payment failed. Please try again."
          );

          setMessage("");
          setLoading(false);
        }
      );

      razorpay.open();
    } catch (paymentError) {
      console.error(
        "Payment start error:",
        paymentError
      );

      setError(
        paymentError.message ||
          "Unable to start payment."
      );

      setMessage("");
      setLoading(false);
    }
  };

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
        <div className="card-body p-4 p-md-5">
          <div className="text-center">
            <div
              className="d-flex align-items-center justify-content-center mx-auto mb-4"
              style={{
                width: "80px",
                height: "80px",
                borderRadius: "50%",
                background: "#e9f7ef",
                fontSize: "36px"
              }}
            >
              💳
            </div>

            <h2 className="fw-bold mb-2">
              Activate Subscription
            </h2>

            <p className="text-secondary mb-4">
              Continue using Studio Billing
              without interruption.
            </p>
          </div>

          <div
            className="border rounded-4 p-4 mb-4"
            style={{
              background: "#f8f9fa"
            }}
          >
            <div className="d-flex justify-content-between align-items-center mb-3">
              <span className="text-secondary">
                Monthly Subscription
              </span>

              <span className="badge text-bg-dark">
                {days} Days
              </span>
            </div>

            <div className="display-5 fw-bold">
              {money(price)}
            </div>

            <div className="text-secondary mt-2">
              Secure online payment
            </div>
          </div>

          {error && (
            <div
              className="alert alert-danger rounded-3"
              role="alert"
            >
              {error}
            </div>
          )}

          {message && (
            <div
              className="alert alert-success rounded-3"
              role="alert"
            >
              {message}
            </div>
          )}

          <button
            type="button"
            className="btn btn-dark btn-lg w-100 rounded-3"
            onClick={startPayment}
            disabled={
              loading || !scriptLoaded
            }
          >
            {loading ? (
              <>
                <span
                  className="spinner-border spinner-border-sm me-2"
                  role="status"
                  aria-hidden="true"
                ></span>

                Processing...
              </>
            ) : (
              <>
                <i className="bi bi-shield-check me-2"></i>
                Pay {money(price)}
              </>
            )}
          </button>

          <button
            type="button"
            className="btn btn-link text-secondary w-100 mt-3"
            onClick={() =>
              navigate("/subscription")
            }
            disabled={loading}
          >
            Back
          </button>

          <div className="text-center mt-3">
            <small className="text-secondary">
              Payments are processed securely
              through Razorpay.
            </small>
          </div>
        </div>
      </div>
    </div>
  );
}