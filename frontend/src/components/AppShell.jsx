import React, { useState } from "react";
import { NavLink } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function AppShell({ children }) {
  const { user, logout } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);

  const closeMenu = () => {
    setMenuOpen(false);
  };

  const handleLogout = () => {
    closeMenu();
    logout();
  };

  const menuItems = [
    {
      path: "/dashboard",
      label: "Dashboard",
      icon: "bi-house-door-fill",
    },
    {
      path: "/customers",
      label: "Customers",
      icon: "bi-people-fill",
    },
    {
      path: "/reports",
      label: "Reports",
      icon: "bi-bar-chart-fill",
    },
    {
      path: "/settings",
      label: "Settings",
      icon: "bi-gear-fill",
    },
  ];

  return (
    <div className="studio-app-shell">

      {/* =========================================
          MOBILE TOP HEADER
      ========================================= */}
      <header className="studio-mobile-header">

        <button
          type="button"
          className="studio-mobile-menu-btn"
          onClick={() => setMenuOpen(true)}
          aria-label="Open menu"
        >
          <i className="bi bi-list"></i>
        </button>

        <div className="studio-mobile-brand">

          <div className="studio-mobile-logo">
            <i className="bi bi-camera-fill"></i>
          </div>

          <div>
            <div className="studio-mobile-title">
              Studio Billing
            </div>

            <div className="studio-mobile-subtitle">
              Photography & Videography
            </div>
          </div>

        </div>

      </header>


      {/* =========================================
          MOBILE OVERLAY
      ========================================= */}
      {menuOpen && (
        <div
          className="studio-mobile-overlay"
          onClick={closeMenu}
        ></div>
      )}


      {/* =========================================
          SIDEBAR
      ========================================= */}
      <aside
        className={`studio-sidebar ${
          menuOpen
            ? "studio-sidebar-open"
            : ""
        }`}
      >

        {/* MOBILE CLOSE */}
        <button
          type="button"
          className="studio-mobile-close"
          onClick={closeMenu}
          aria-label="Close menu"
        >
          <i className="bi bi-x-lg"></i>
        </button>


        {/* =====================================
            BRAND
        ===================================== */}
        <div className="studio-brand">

          <div className="studio-brand-logo">
            <i className="bi bi-camera-fill"></i>
          </div>

          <div className="studio-brand-text">

            <div className="studio-brand-title">
              Studio Billing
            </div>

            <div className="studio-brand-subtitle">
              Photography & Videography
            </div>

          </div>

        </div>


        {/* =====================================
            NAVIGATION
        ===================================== */}
        <nav className="studio-navigation">

          {menuItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              onClick={closeMenu}
              className={({ isActive }) =>
                `studio-nav-link ${
                  isActive
                    ? "studio-nav-active"
                    : ""
                }`
              }
            >
              <i
                className={`bi ${item.icon}`}
              ></i>

              <span>
                {item.label}
              </span>
            </NavLink>
          ))}

        </nav>


        {/* =====================================
            USER SECTION
        ===================================== */}
        <div className="studio-sidebar-bottom">

          <div className="studio-user">

            <div className="studio-user-avatar">
              {(user?.name || "U")
                .charAt(0)
                .toUpperCase()}
            </div>

            <div className="studio-user-details">

              <div className="studio-user-name">
                {user?.name || "User"}
              </div>

              <div className="studio-user-email">
                {user?.email || ""}
              </div>

            </div>

          </div>


          <button
            type="button"
            className="studio-logout-btn"
            onClick={handleLogout}
          >
            <i className="bi bi-box-arrow-right"></i>

            <span>
              Logout
            </span>
          </button>

        </div>

      </aside>


      {/* =========================================
          MAIN AREA
      ========================================= */}
      <main className="studio-main-content">

        {children}

      </main>


      {/* =========================================
          RESPONSIVE CSS
      ========================================= */}
      <style>{`

        /* =======================================
           MAIN LAYOUT
        ======================================= */

        .studio-app-shell {
          min-height: 100vh;
          width: 100%;
        }


        /* =======================================
           SIDEBAR
        ======================================= */

        .studio-sidebar {
          position: fixed;
          left: 0;
          top: 0;
          bottom: 0;

          width: 260px;

          background:
            linear-gradient(
              180deg,
              #101828 0%,
              #18263b 100%
            );

          color: #ffffff;

          padding: 28px 18px 20px;

          display: flex;
          flex-direction: column;

          z-index: 1100;

          overflow-y: auto;

          box-sizing: border-box;
        }


        /* =======================================
           BRAND
        ======================================= */

        .studio-brand {
          display: flex;
          align-items: center;
          gap: 12px;

          padding: 4px 6px 22px;
        }

        .studio-brand-logo {
          width: 48px;
          height: 48px;

          border-radius: 12px;

          background: #f5c400;

          color: #172033;

          display: flex;
          align-items: center;
          justify-content: center;

          font-size: 24px;

          flex-shrink: 0;
        }

        .studio-brand-text {
          min-width: 0;
        }

        .studio-brand-title {
          font-size: 19px;
          font-weight: 800;
          line-height: 1.2;
          white-space: nowrap;
        }

        .studio-brand-subtitle {
          font-size: 11px;
          color: #c8d0dc;
          margin-top: 4px;
          white-space: nowrap;
        }


        /* =======================================
           NAVIGATION
        ======================================= */

        .studio-navigation {
          display: flex;
          flex-direction: column;
          gap: 8px;

          margin-top: 10px;
        }

        .studio-nav-link {
          min-height: 48px;

          padding: 0 15px;

          border-radius: 12px;

          color: #d9e0ea;

          text-decoration: none;

          display: flex;
          align-items: center;

          gap: 13px;

          font-size: 15px;
          font-weight: 600;

          transition:
            background 0.2s ease,
            color 0.2s ease,
            transform 0.2s ease;
        }

        .studio-nav-link i {
          width: 22px;
          font-size: 17px;
          text-align: center;
        }

        .studio-nav-link:hover {
          background: rgba(
            255,
            255,
            255,
            0.08
          );

          color: #ffffff;

          transform: translateX(2px);
        }

        .studio-nav-link.studio-nav-active {
          background: #f5c400;
          color: #172033;
        }


        /* =======================================
           USER
        ======================================= */

        .studio-sidebar-bottom {
          margin-top: auto;
          padding-top: 25px;
        }

        .studio-user {
          display: flex;
          align-items: center;
          gap: 10px;

          padding: 10px;

          border-radius: 12px;

          background: rgba(
            255,
            255,
            255,
            0.06
          );
        }

        .studio-user-avatar {
          width: 38px;
          height: 38px;

          border-radius: 50%;

          background: #f5c400;
          color: #172033;

          display: flex;
          align-items: center;
          justify-content: center;

          font-weight: 800;

          flex-shrink: 0;
        }

        .studio-user-details {
          min-width: 0;
        }

        .studio-user-name {
          color: #ffffff;
          font-size: 14px;
          font-weight: 700;

          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }

        .studio-user-email {
          color: #aeb8c7;
          font-size: 10px;

          margin-top: 2px;

          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }


        /* =======================================
           LOGOUT
        ======================================= */

        .studio-logout-btn {
          width: 100%;

          margin-top: 12px;

          min-height: 43px;

          border: 1px solid
            rgba(
              255,
              255,
              255,
              0.15
            );

          border-radius: 10px;

          background: transparent;

          color: #ffffff;

          display: flex;
          align-items: center;
          justify-content: center;

          gap: 9px;

          font-size: 14px;
          font-weight: 600;

          cursor: pointer;

          transition:
            background 0.2s ease,
            border 0.2s ease;
        }

        .studio-logout-btn:hover {
          background: rgba(
            255,
            255,
            255,
            0.08
          );

          border-color: rgba(
            255,
            255,
            255,
            0.25
          );
        }


        /* =======================================
           MAIN CONTENT
        ======================================= */

        .studio-main-content {
          margin-left: 260px;

          min-height: 100vh;

          width: calc(
            100% - 260px
          );

          box-sizing: border-box;
        }


        /* =======================================
           MOBILE HEADER
        ======================================= */

        .studio-mobile-header {
          display: none;
        }


        /* =======================================
           MOBILE CLOSE
        ======================================= */

        .studio-mobile-close {
          display: none;
        }


        /* =======================================
           MOBILE OVERLAY
        ======================================= */

        .studio-mobile-overlay {
          display: none;
        }


        /* =======================================
           TABLET / MOBILE
        ======================================= */

        @media (max-width: 900px) {

          .studio-mobile-header {
            display: flex;

            position: sticky;

            top: 0;

            height: 64px;

            padding: 0 14px;

            background: #101828;

            color: #ffffff;

            align-items: center;

            gap: 11px;

            z-index: 1000;

            box-shadow:
              0 2px 10px
              rgba(0, 0, 0, 0.12);
          }


          .studio-mobile-menu-btn {
            width: 42px;
            height: 42px;

            border: 1px solid
              rgba(
                255,
                255,
                255,
                0.16
              );

            border-radius: 10px;

            background: #1d2939;

            color: #ffffff;

            display: flex;
            align-items: center;
            justify-content: center;

            font-size: 23px;

            cursor: pointer;

            flex-shrink: 0;
          }


          .studio-mobile-brand {
            display: flex;
            align-items: center;

            gap: 9px;

            min-width: 0;

            flex: 1;
          }


          .studio-mobile-logo {
            width: 38px;
            height: 38px;

            border-radius: 10px;

            background: #f5c400;

            color: #172033;

            display: flex;
            align-items: center;
            justify-content: center;

            font-size: 18px;

            flex-shrink: 0;
          }


          .studio-mobile-title {
            font-size: 15px;
            font-weight: 800;

            color: #ffffff;

            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
          }


          .studio-mobile-subtitle {
            font-size: 10px;

            color: #aeb8c7;

            margin-top: 1px;
          }


          /* SIDEBAR */

          .studio-sidebar {
            width: 275px;
            max-width: 86vw;

            transform:
              translateX(-105%);

            transition:
              transform 0.25s ease;

            box-shadow:
              10px 0 35px
              rgba(
                0,
                0,
                0,
                0.22
              );
          }


          .studio-sidebar.studio-sidebar-open {
            transform:
              translateX(0);
          }


          /* CLOSE */

          .studio-mobile-close {
            display: flex;

            position: absolute;

            top: 14px;
            right: 14px;

            width: 36px;
            height: 36px;

            border: 0;

            border-radius: 9px;

            background: rgba(
              255,
              255,
              255,
              0.10
            );

            color: #ffffff;

            align-items: center;
            justify-content: center;

            cursor: pointer;

            font-size: 15px;
          }


          /* OVERLAY */

          .studio-mobile-overlay {
            display: block;

            position: fixed;

            inset: 0;

            background:
              rgba(
                0,
                0,
                0,
                0.45
              );

            z-index: 1050;
          }


          /* MAIN */

          .studio-main-content {
            margin-left: 0;

            width: 100%;

            min-height:
              calc(
                100vh - 64px
              );
          }

        }


        /* =======================================
           SMALL MOBILE
        ======================================= */

        @media (max-width: 575px) {

          .studio-mobile-header {
            height: 60px;
            padding: 0 10px;
          }

          .studio-mobile-menu-btn {
            width: 40px;
            height: 40px;
          }

          .studio-mobile-logo {
            width: 36px;
            height: 36px;
          }

          .studio-mobile-title {
            font-size: 14px;
          }

          .studio-mobile-subtitle {
            font-size: 9px;
          }

          .studio-sidebar {
            width: 265px;
          }

        }

      `}</style>
    </div>
  );
}