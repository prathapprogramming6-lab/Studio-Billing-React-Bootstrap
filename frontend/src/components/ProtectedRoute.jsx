import React from "react";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function ProtectedRoute() {
  const {
    user,
    isAuthenticated,
    isActivated
  } = useAuth();

  const location = useLocation();

  // Not logged in
  if (!isAuthenticated || !user) {
    return (
      <Navigate
        to="/login"
        replace
        state={{ from: location }}
      />
    );
  }

  // Software activation required
  if (!isActivated) {
    return (
      <Navigate
        to="/activate"
        replace
        state={{ email: user.email || "" }}
      />
    );
  }

  /*
  ====================================================
  ADMIN BYPASS
  ====================================================

  Admin email is configured in backend
  using ADMIN_EMAIL.

  Admin should NOT be forced to pay
  subscription amount.

  Backend sends isAdmin: true for admin.
  */
  if (user.isAdmin === true) {
    return <Outlet />;
  }

  /*
  ====================================================
  NORMAL USER SUBSCRIPTION CHECK
  ====================================================
  */

  const subscriptionStatus =
    user?.subscriptionStatus;

  if (
    subscriptionStatus === "expired" ||
    subscriptionStatus === "inactive"
  ) {
    return (
      <Navigate
        to="/subscription"
        replace
      />
    );
  }

  return <Outlet />;
}