import React from "react";
import {
  BrowserRouter,
  Navigate,
  Route,
  Routes
} from "react-router-dom";

import { AuthProvider } from "./context/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";

import Login from "./pages/Login";
import Register from "./pages/Register";
import Activate from "./pages/Activate";
import Subscription from "./pages/Subscription";
import Payment from "./pages/payment";

import Dashboard from "./pages/Dashboard";
import Customers from "./pages/Customers";
import CustomerDetails from "./pages/CustomerDetails";
import Reports from "./pages/Reports";
import Settings from "./pages/Settings";
import Receipt from "./pages/Receipt";

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Default */}
          <Route
            path="/"
            element={
              <Navigate
                to="/dashboard"
                replace
              />
            }
          />

          {/* Authentication */}
          <Route
            path="/login"
            element={<Login />}
          />

          <Route
            path="/register"
            element={<Register />}
          />

          <Route
            path="/activate"
            element={<Activate />}
          />

          {/* Subscription */}
          <Route
            path="/subscription"
            element={<Subscription />}
          />

          {/* Payment */}
          <Route
            path="/payment"
            element={<Payment />}
          />

          {/* Protected Application */}
          <Route element={<ProtectedRoute />}>
            <Route
              path="/dashboard"
              element={<Dashboard />}
            />

            <Route
              path="/customers"
              element={<Customers />}
            />

            <Route
              path="/customers/:id"
              element={<CustomerDetails />}
            />

            <Route
              path="/receipt/:id"
              element={<Receipt />}
            />

            <Route
              path="/reports"
              element={<Reports />}
            />

            <Route
              path="/settings"
              element={<Settings />}
            />
          </Route>

          {/* Unknown route */}
          <Route
            path="*"
            element={
              <Navigate
                to="/"
                replace
              />
            }
          />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}