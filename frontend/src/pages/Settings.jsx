import React, { useEffect, useState } from "react";
import AppShell from "../components/AppShell";
import { PageHeader } from "./Dashboard";
import { useAuth } from "../context/AuthContext";

const API_URL = "http://localhost:5000/api";

export default function Settings() {
  const { user, token, isAdmin } = useAuth();

  // =====================================================
  // ACCOUNT-WISE STUDIO SETTINGS
  // =====================================================

  const getAccountKey = () => {
    return (
      user?.id ||
      user?._id ||
      user?.email ||
      "default"
    );
  };

  const getDefaultStudio = () => ({
    name: "Studio Billing",
    tagline: "Photography & Videography",
    phone: "",
    address: ""
  });

  const [studio, setStudio] = useState(
    getDefaultStudio()
  );

  const [saved, setSaved] = useState(false);

  // =====================================================
  // LOAD ACCOUNT-WISE STUDIO SETTINGS
  // =====================================================

  useEffect(() => {
    try {
      const accountKey = getAccountKey();

      const savedStudio =
        localStorage.getItem(
          `studioSettings_${accountKey}`
        );

      if (savedStudio) {
        setStudio(
          JSON.parse(savedStudio)
        );
      } else {
        setStudio(getDefaultStudio());
      }
    } catch (error) {
      console.error(
        "Studio settings load error:",
        error
      );

      setStudio(getDefaultStudio());
    }
  }, [user]);

  // =====================================================
  // SUBSCRIPTION STATE
  // =====================================================

  const [subscription, setSubscription] =
    useState({
      monthlyPrice: 99,
      trialHours: 24,
      subscriptionDays: 30
    });

  const [subscriptionLoading, setSubscriptionLoading] =
    useState(true);

  const [subscriptionSaving, setSubscriptionSaving] =
    useState(false);

  const [subscriptionMessage, setSubscriptionMessage] =
    useState("");

  const [subscriptionError, setSubscriptionError] =
    useState("");

  // =====================================================
  // LOAD SUBSCRIPTION SETTINGS
  // ADMIN ONLY
  // =====================================================

  useEffect(() => {
    if (isAdmin) {
      loadSubscriptionSettings();
    } else {
      setSubscriptionLoading(false);
    }
  }, [isAdmin]);

  async function loadSubscriptionSettings() {
    try {
      setSubscriptionLoading(true);
      setSubscriptionError("");

      const response = await fetch(
        `${API_URL}/subscription/settings`
      );

      const data =
        await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ||
            "Unable to load subscription settings"
        );
      }

      if (
        data.success &&
        data.settings
      ) {
        setSubscription({
          monthlyPrice:
            data.settings.monthlyPrice,

          trialHours:
            data.settings.trialHours,

          subscriptionDays:
            data.settings.subscriptionDays
        });
      }
    } catch (error) {
      console.error(
        "Subscription settings error:",
        error
      );

      setSubscriptionError(
        "Unable to load subscription settings."
      );
    } finally {
      setSubscriptionLoading(false);
    }
  }

  // =====================================================
  // SAVE ACCOUNT-WISE STUDIO SETTINGS
  // =====================================================

  function save(e) {
    e.preventDefault();

    try {
      const accountKey =
        getAccountKey();

      localStorage.setItem(
        `studioSettings_${accountKey}`,
        JSON.stringify(studio)
      );

      setSaved(true);

      setTimeout(() => {
        setSaved(false);
      }, 1800);
    } catch (error) {
      console.error(
        "Studio settings save error:",
        error
      );
    }
  }

  // =====================================================
  // SAVE SUBSCRIPTION SETTINGS
  // ADMIN ONLY
  // =====================================================

  async function saveSubscription(e) {
    e.preventDefault();

    setSubscriptionMessage("");
    setSubscriptionError("");

    const monthlyPrice =
      Number(
        subscription.monthlyPrice
      );

    const trialHours =
      Number(
        subscription.trialHours
      );

    const subscriptionDays =
      Number(
        subscription.subscriptionDays
      );

    if (
      !Number.isFinite(monthlyPrice) ||
      !Number.isFinite(trialHours) ||
      !Number.isFinite(subscriptionDays)
    ) {
      setSubscriptionError(
        "Please enter valid numbers."
      );

      return;
    }

    if (
      monthlyPrice < 0 ||
      trialHours < 0 ||
      subscriptionDays <= 0
    ) {
      setSubscriptionError(
        "Please enter valid subscription values."
      );

      return;
    }

    if (!token) {
      setSubscriptionError(
        "Login is required to update subscription settings."
      );

      return;
    }

    try {
      setSubscriptionSaving(true);

      const response = await fetch(
        `${API_URL}/subscription/settings`,
        {
          method: "PUT",

          headers: {
            "Content-Type":
              "application/json",

            Authorization:
              `Bearer ${token}`
          },

          body: JSON.stringify({
            monthlyPrice,
            trialHours,
            subscriptionDays
          })
        }
      );

      const data =
        await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ||
            "Unable to update subscription settings"
        );
      }

      if (data.success) {
        setSubscription({
          monthlyPrice:
            data.settings.monthlyPrice,

          trialHours:
            data.settings.trialHours,

          subscriptionDays:
            data.settings.subscriptionDays
        });

        setSubscriptionMessage(
          "Subscription settings updated successfully."
        );
      }
    } catch (error) {
      console.error(
        "Update subscription settings error:",
        error
      );

      setSubscriptionError(
        error.message ||
          "Unable to update subscription settings."
      );
    } finally {
      setSubscriptionSaving(false);
    }
  }

  return (
    <AppShell>

      <PageHeader
        title="Settings"
        subtitle="Personalize your studio profile and account."
      />

      <div className="row g-4">

        {/* =================================================
            STUDIO PROFILE
        ================================================= */}

        <div className="col-lg-7">

          <section className="panel-card">

            <h5 className="mb-4">
              Studio Profile
            </h5>

            {saved && (
              <div className="alert alert-success">
                Settings saved successfully.
              </div>
            )}

            <form onSubmit={save}>

              <Field
                label="Studio name"
                value={studio.name}
                onChange={(value) =>
                  setStudio({
                    ...studio,
                    name: value
                  })
                }
              />

              <Field
                label="Tagline"
                value={studio.tagline}
                onChange={(value) =>
                  setStudio({
                    ...studio,
                    tagline: value
                  })
                }
              />

              <Field
                label="Phone"
                value={studio.phone}
                onChange={(value) =>
                  setStudio({
                    ...studio,
                    phone: value
                  })
                }
              />

              <div className="mb-3">

                <label className="form-label fw-semibold">
                  Address
                </label>

                <textarea
                  className="form-control"
                  rows="3"
                  value={studio.address}
                  onChange={(e) =>
                    setStudio({
                      ...studio,
                      address:
                        e.target.value
                    })
                  }
                />

              </div>

              <button className="btn btn-dark">
                Save Settings
              </button>

            </form>

          </section>

        </div>

        {/* =================================================
            ACCOUNT
        ================================================= */}

        <div className="col-lg-5">

          <section className="panel-card">

            <h5>
              Account
            </h5>

            <div className="account-preview">

              <div className="avatar xl">

                {user?.name
                  ?.slice(0, 1)
                  .toUpperCase()}

              </div>

              <h5>
                {user?.name}
              </h5>

              <div className="text-secondary">
                {user?.email}
              </div>

              {isAdmin ? (
                <div className="badge text-bg-primary mt-2">
                  Admin
                </div>
              ) : (
                <div className="badge text-bg-success mt-2">
                  User
                </div>
              )}

            </div>

          </section>

        </div>

        {/* =================================================
            SUBSCRIPTION SETTINGS
            ADMIN ONLY
        ================================================= */}

        {isAdmin && (

          <div className="col-12">

            <section className="panel-card">

              <div className="d-flex justify-content-between align-items-center mb-3">

                <div>

                  <h5 className="mb-1">
                    Subscription Settings
                  </h5>

                  <p className="text-secondary mb-0">
                    Manage the software trial and monthly subscription.
                  </p>

                </div>

                <span className="badge text-bg-primary">
                  Admin Only
                </span>

              </div>

              {subscriptionMessage && (
                <div className="alert alert-success">
                  {subscriptionMessage}
                </div>
              )}

              {subscriptionError && (
                <div className="alert alert-danger">
                  {subscriptionError}
                </div>
              )}

              {subscriptionLoading ? (

                <div className="text-secondary">
                  Loading subscription settings...
                </div>

              ) : (

                <form onSubmit={saveSubscription}>

                  <div className="row g-3">

                    <div className="col-md-4">

                      <label className="form-label fw-semibold">
                        Monthly Price (₹)
                      </label>

                      <input
                        type="number"
                        min="0"
                        className="form-control form-control-lg"
                        value={
                          subscription.monthlyPrice
                        }
                        onChange={(e) =>
                          setSubscription({
                            ...subscription,
                            monthlyPrice:
                              e.target.value
                          })
                        }
                      />

                    </div>

                    <div className="col-md-4">

                      <label className="form-label fw-semibold">
                        Free Trial (Hours)
                      </label>

                      <input
                        type="number"
                        min="0"
                        className="form-control form-control-lg"
                        value={
                          subscription.trialHours
                        }
                        onChange={(e) =>
                          setSubscription({
                            ...subscription,
                            trialHours:
                              e.target.value
                          })
                        }
                      />

                    </div>

                    <div className="col-md-4">

                      <label className="form-label fw-semibold">
                        Subscription (Days)
                      </label>

                      <input
                        type="number"
                        min="1"
                        className="form-control form-control-lg"
                        value={
                          subscription.subscriptionDays
                        }
                        onChange={(e) =>
                          setSubscription({
                            ...subscription,
                            subscriptionDays:
                              e.target.value
                          })
                        }
                      />

                    </div>

                  </div>

                  <button
                    type="submit"
                    className="btn btn-dark mt-4"
                    disabled={
                      subscriptionSaving
                    }
                  >
                    {subscriptionSaving
                      ? "Saving..."
                      : "Save Subscription Settings"}
                  </button>

                </form>

              )}

            </section>

          </div>

        )}

      </div>

    </AppShell>
  );
}


// =====================================================
// FIELD COMPONENT
// =====================================================

function Field({
  label,
  value,
  onChange
}) {
  return (
    <div className="mb-3">

      <label className="form-label fw-semibold">
        {label}
      </label>

      <input
        className="form-control form-control-lg"
        value={value}
        onChange={(e) =>
          onChange(e.target.value)
        }
      />

    </div>
  );
}