import React, {
  useEffect,
  useRef,
  useState
} from "react";

import {
  Link,
  useParams
} from "react-router-dom";

import html2canvas from "html2canvas";
import { jsPDF } from "jspdf";

import AppShell from "../components/AppShell";

import {
  Loading
} from "./Dashboard";

import {
  apiFetch,
  dateText,
  money
} from "../api";

import {
  useAuth
} from "../context/AuthContext";


export default function Receipt() {

  const { id } = useParams();

  const { user } = useAuth();

  const [c, setC] =
    useState(null);

  const [studio, setStudio] =
    useState({
      name: "Studio Billing",
      tagline:
        "Photography & Videography",
      phone: "",
      address: ""
    });

  const ref =
    useRef(null);


  // =====================================================
  // LOAD CUSTOMER
  // =====================================================

  useEffect(() => {

    apiFetch(`/customers/${id}`)
      .then((d) =>
        setC(d.customer)
      )
      .catch((error) => {

        console.error(
          "Receipt customer load error:",
          error
        );

      });

  }, [id]);


  // =====================================================
  // LOAD ACCOUNT-WISE STUDIO SETTINGS
  // =====================================================

  useEffect(() => {

    try {

      const accountKey =
        user?.id ||
        user?._id ||
        user?.email ||
        "default";

      const savedStudio =
        localStorage.getItem(
          `studioSettings_${accountKey}`
        );

      if (savedStudio) {

        setStudio(
          JSON.parse(
            savedStudio
          )
        );

      }

    } catch (error) {

      console.error(
        "Studio settings load error:",
        error
      );

    }

  }, [user]);


  // =====================================================
  // LOADING
  // =====================================================

  if (!c) {

    return (
      <AppShell>
        <Loading />
      </AppShell>
    );

  }


  // =====================================================
  // PAYMENT CALCULATION
  // =====================================================

  const paid =
    c.payments?.reduce(
      (s, p) =>
        s +
        Number(
          p.amount || 0
        ),
      0
    ) || 0;


  const balance =
    Math.max(
      Number(
        c.totalAmount
      ) - paid,
      0
    );


  // =====================================================
  // DOWNLOAD PDF
  // =====================================================

  async function pdf() {

    const canvas =
      await html2canvas(
        ref.current,
        {
          scale: 2,
          backgroundColor: "#fff"
        }
      );

    const img =
      canvas.toDataURL(
        "image/png"
      );

    const doc =
      new jsPDF(
        "p",
        "mm",
        "a4"
      );

    const w = 190;

    const h =
      (canvas.height * w) /
      canvas.width;

    doc.addImage(
      img,
      "PNG",
      10,
      10,
      w,
      h
    );

    doc.save(
      `receipt-${c.customerName.replace(
        /\s+/g,
        "-"
      )}.pdf`
    );

  }


  // =====================================================
  // RECEIPT UI
  // =====================================================

  return (

    <AppShell>

      {/* =================================================
          ACTION BUTTONS
      ================================================= */}

      <div className="d-flex justify-content-between align-items-center mb-3 no-print">

        <Link
          to={`/customers/${id}`}
          className="btn btn-outline-secondary"
        >
          ← Back
        </Link>


        <div className="d-flex gap-2">

          <button
            className="btn btn-outline-dark"
            onClick={() =>
              window.print()
            }
          >

            <i className="bi bi-printer me-2" />

            Print

          </button>


          <button
            className="btn btn-dark"
            onClick={pdf}
          >

            <i className="bi bi-filetype-pdf me-2" />

            Download PDF

          </button>

        </div>

      </div>


      {/* =================================================
          RECEIPT
      ================================================= */}

      <div
        ref={ref}
        className="receipt-paper"
      >

        <div className="receipt-top">

          <div className="brand-mark">

            <i className="bi bi-camera-fill" />

          </div>


          {/* =================================================
              STUDIO INFORMATION
          ================================================= */}

          <div>

            <h2 className="mb-1">

              {studio.name ||
                "Studio Billing"}

            </h2>


            <div className="text-secondary">

              {studio.tagline ||
                "Photography & Videography"}

            </div>


            {studio.phone && (

              <div className="small text-secondary mt-1">

                {studio.phone}

              </div>

            )}


            {studio.address && (

              <div className="small text-secondary">

                {studio.address}

              </div>

            )}

          </div>


          <div className="ms-auto text-end">

            <small>
              PAYMENT RECEIPT
            </small>

            <div>

              {dateText(
                new Date()
              )}

            </div>

          </div>

        </div>


        <hr />


        {/* =================================================
            CUSTOMER DETAILS
        ================================================= */}

        <div className="row g-3 mb-4">

          <div className="col-md-4">

            <small className="text-secondary">
              Customer
            </small>

            <div className="fw-bold">
              {c.customerName}
            </div>

          </div>


          <div className="col-md-4">

            <small className="text-secondary">
              Phone
            </small>

            <div className="fw-bold">
              {c.phone}
            </div>

          </div>


          <div className="col-md-4">

            <small className="text-secondary">
              Wedding Date
            </small>

            <div className="fw-bold">

              {dateText(
                c.weddingDate
              )}

            </div>

          </div>

        </div>


        {/* =================================================
            SERVICES
        ================================================= */}

        <h6>
          Services / Package
        </h6>


        <div className="service-list mb-4">

          {(c.services || [])
            .map((s) => (

              <span
                className="badge text-bg-light border p-2"
                key={s}
              >

                {s}

              </span>

            ))}

        </div>


        {/* =================================================
            PAYMENT HISTORY
        ================================================= */}

        <h6>
          Payment History
        </h6>


        <div className="table-responsive">

          <table className="table">

            <thead>

              <tr>

                <th>#</th>

                <th>Date</th>

                <th>Method</th>

                <th className="text-end">
                  Amount
                </th>

              </tr>

            </thead>


            <tbody>

              {(c.payments || [])
                .map((p, i) => (

                  <tr
                    key={
                      p._id || i
                    }
                  >

                    <td>
                      {i + 1}
                    </td>

                    <td>
                      {dateText(
                        p.date
                      )}
                    </td>

                    <td>
                      {p.method}
                    </td>

                    <td className="text-end">
                      {money(
                        p.amount
                      )}
                    </td>

                  </tr>

                ))}

            </tbody>

          </table>

        </div>


        {/* =================================================
            TOTAL
        ================================================= */}

        <div className="receipt-total">

          <div>

            Total Package

            <strong>
              {money(
                c.totalAmount
              )}
            </strong>

          </div>


          <div className="text-success">

            Total Paid

            <strong>
              {money(paid)}
            </strong>

          </div>


          <div className="balance-highlight">

            Current Balance

            <strong>
              {money(balance)}
            </strong>

          </div>

        </div>


        {/* =================================================
            FOOTER
        ================================================= */}

        <div className="text-center text-secondary small mt-5">

          Thank you for choosing{" "}

          {studio.name ||
            "Studio Billing"}.

        </div>

      </div>

    </AppShell>

  );
}