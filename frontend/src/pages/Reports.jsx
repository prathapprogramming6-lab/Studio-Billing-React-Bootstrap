import React, { useEffect, useMemo, useState } from "react";
import AppShell from "../components/AppShell";
import { PageHeader, Loading, Empty } from "./Dashboard";
import { apiFetch, dateText, money } from "../api";

export default function Reports() {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState("");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");

  useEffect(() => {
    apiFetch("/customers")
      .then((data) => {
        setCustomers(data.customers || []);
      })
      .catch((error) => {
        console.error("Reports loading error:", error);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  const rows = useMemo(() => {
    return customers.map((customer) => {
      const paymentTotal =
        customer.payments?.reduce(
          (sum, payment) =>
            sum + Number(payment.amount || 0),
          0
        ) || 0;

      const advance = Number(
        customer.advanceAmount || 0
      );

      const paid =
        paymentTotal > 0
          ? paymentTotal
          : advance;

      const totalAmount = Number(
        customer.totalAmount || 0
      );

      const balance = Math.max(
        totalAmount - paid,
        0
      );

      return {
        ...customer,
        paid,
        balance,
        totalAmount
      };
    });
  }, [customers]);

  const filteredRows = useMemo(() => {
    return rows.filter((customer) => {
      const searchText = search
        .trim()
        .toLowerCase();

      const matchesSearch =
        !searchText ||
        customer.customerName
          ?.toLowerCase()
          .includes(searchText) ||
        customer.phone
          ?.toLowerCase()
          .includes(searchText);

      let matchesDate = true;

      if (fromDate || toDate) {
        const customerDate =
          customer.weddingDate || "";

        if (!customerDate) {
          matchesDate = false;
        } else {
          if (
            fromDate &&
            customerDate < fromDate
          ) {
            matchesDate = false;
          }

          if (
            toDate &&
            customerDate > toDate
          ) {
            matchesDate = false;
          }
        }
      }

      return (
        matchesSearch &&
        matchesDate
      );
    });
  }, [
    rows,
    search,
    fromDate,
    toDate
  ]);

  const stats = useMemo(() => {
    return {
      customers: filteredRows.length,

      packageValue: filteredRows.reduce(
        (sum, customer) =>
          sum +
          Number(
            customer.totalAmount || 0
          ),
        0
      ),

      collected: filteredRows.reduce(
        (sum, customer) =>
          sum + Number(customer.paid || 0),
        0
      ),

      outstanding: filteredRows.reduce(
        (sum, customer) =>
          sum +
          Number(
            customer.balance || 0
          ),
        0
      )
    };
  }, [filteredRows]);

  const methods = useMemo(() => {
    const result = {};

    filteredRows.forEach((customer) => {
      (customer.payments || []).forEach(
        (payment) => {
          const method =
            payment.method || "Cash";

          result[method] =
            (result[method] || 0) +
            Number(payment.amount || 0);
        }
      );
    });

    return result;
  }, [filteredRows]);

  const printReport = () => {
    window.print();
  };

  const downloadPDF = async () => {
    try {
      const html2canvas =
        (await import("html2canvas")).default;

      const jsPDFModule =
        await import("jspdf");

      const jsPDF =
        jsPDFModule.jsPDF;

      const reportElement =
        document.getElementById(
          "reports-print-area"
        );

      if (!reportElement) {
        return;
      }

      const canvas =
        await html2canvas(
          reportElement,
          {
            scale: 2,
            useCORS: true
          }
        );

      const imageData =
        canvas.toDataURL("image/png");

      const pdf =
        new jsPDF(
          "p",
          "mm",
          "a4"
        );

      const pageWidth =
        pdf.internal.pageSize.getWidth();

      const pageHeight =
        pdf.internal.pageSize.getHeight();

      const imageWidth =
        pageWidth - 20;

      const imageHeight =
        (canvas.height *
          imageWidth) /
        canvas.width;

      let heightLeft =
        imageHeight;

      let position = 10;

      pdf.addImage(
        imageData,
        "PNG",
        10,
        position,
        imageWidth,
        imageHeight
      );

      heightLeft -=
        pageHeight - 20;

      while (heightLeft > 0) {
        position =
          heightLeft -
          imageHeight +
          10;

        pdf.addPage();

        pdf.addImage(
          imageData,
          "PNG",
          10,
          position,
          imageWidth,
          imageHeight
        );

        heightLeft -=
          pageHeight - 20;
      }

      pdf.save(
        "studio-billing-report.pdf"
      );
    } catch (error) {
      console.error(
        "PDF download error:",
        error
      );

      alert(
        "PDF download failed. Please try again."
      );
    }
  };

  const clearFilters = () => {
    setSearch("");
    setFromDate("");
    setToDate("");
  };

  return (
    <AppShell>
      <div id="reports-print-area">

        <PageHeader
          title="Reports"
          subtitle="Business totals and payment insights."
        />

        {/* FILTERS */}
        <section className="panel-card mb-4 report-filters">
          <div className="d-flex justify-content-between align-items-center flex-wrap gap-2 mb-3">
            <h5 className="mb-0">
              Report Filters
            </h5>

            <button
              type="button"
              className="btn btn-outline-secondary btn-sm"
              onClick={clearFilters}
            >
              Clear Filters
            </button>
          </div>

          <div className="row g-3">

            <div className="col-md-4">
              <label className="form-label">
                Search Customer
              </label>

              <input
                type="text"
                className="form-control"
                placeholder="Name or phone number"
                value={search}
                onChange={(event) =>
                  setSearch(
                    event.target.value
                  )
                }
              />
            </div>

            <div className="col-md-4">
              <label className="form-label">
                From Wedding Date
              </label>

              <input
                type="date"
                className="form-control"
                value={fromDate}
                onChange={(event) =>
                  setFromDate(
                    event.target.value
                  )
                }
              />
            </div>

            <div className="col-md-4">
              <label className="form-label">
                To Wedding Date
              </label>

              <input
                type="date"
                className="form-control"
                value={toDate}
                onChange={(event) =>
                  setToDate(
                    event.target.value
                  )
                }
              />
            </div>

          </div>
        </section>

        {/* ACTION BUTTONS */}
        <div className="d-flex justify-content-end gap-2 flex-wrap mb-4 no-print">

          <button
            type="button"
            className="btn btn-outline-dark"
            onClick={printReport}
          >
            <i className="bi bi-printer me-2"></i>
            Print Report
          </button>

          <button
            type="button"
            className="btn btn-primary"
            onClick={downloadPDF}
          >
            <i className="bi bi-file-earmark-pdf me-2"></i>
            Download PDF
          </button>

        </div>

        {/* SUMMARY */}
        <div className="row g-3 mb-4">

          <div className="col-md-6 col-xl-3">
            <div className="stat-card">
              <div>
                <small>
                  Customers
                </small>

                <div className="stat-value">
                  {stats.customers}
                </div>
              </div>
            </div>
          </div>

          <div className="col-md-6 col-xl-3">
            <div className="stat-card">
              <div>
                <small>
                  Package Value
                </small>

                <div className="stat-value">
                  {money(
                    stats.packageValue
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="col-md-6 col-xl-3">
            <div className="stat-card">
              <div>
                <small>
                  Collected
                </small>

                <div className="stat-value text-success">
                  {money(
                    stats.collected
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="col-md-6 col-xl-3">
            <div className="stat-card">
              <div>
                <small>
                  Outstanding
                </small>

                <div className="stat-value text-danger">
                  {money(
                    stats.outstanding
                  )}
                </div>
              </div>
            </div>
          </div>

        </div>

        <div className="row g-4">

          {/* PAYMENT METHODS */}
          <div className="col-lg-5">

            <section className="panel-card h-100">

              <h5 className="mb-3">
                Payment Methods
              </h5>

              {Object.keys(methods).length ? (
                Object.entries(
                  methods
                ).map(([method, amount]) => (
                  <div
                    className="report-line"
                    key={method}
                  >
                    <span>
                      {method}
                    </span>

                    <strong>
                      {money(amount)}
                    </strong>
                  </div>
                ))
              ) : (
                <Empty text="No payments yet." />
              )}

            </section>

          </div>

          {/* BALANCE REPORT */}
          <div className="col-lg-7">

            <section className="panel-card">

              <div className="d-flex justify-content-between align-items-center flex-wrap gap-2 mb-3">

                <h5 className="mb-0">
                  Customer Balance Report
                </h5>

                <span className="badge text-bg-light">
                  {filteredRows.length} Customers
                </span>

              </div>

              {loading ? (
                <Loading />
              ) : filteredRows.length ? (

                <div className="table-responsive">

                  <table className="table align-middle">

                    <thead>
                      <tr>
                        <th>
                          Customer
                        </th>

                        <th>
                          Phone
                        </th>

                        <th>
                          Wedding
                        </th>

                        <th>
                          Total
                        </th>

                        <th>
                          Paid
                        </th>

                        <th className="text-end">
                          Balance
                        </th>
                      </tr>
                    </thead>

                    <tbody>

                      {filteredRows.map(
                        (customer) => (
                          <tr
                            key={
                              customer._id
                            }
                          >

                            <td>
                              <div className="fw-semibold">
                                {
                                  customer.customerName
                                }
                              </div>
                            </td>

                            <td>
                              {customer.phone ||
                                "-"}
                            </td>

                            <td>
                              {dateText(
                                customer.weddingDate
                              )}
                            </td>

                            <td>
                              {money(
                                customer.totalAmount
                              )}
                            </td>

                            <td className="text-success">
                              {money(
                                customer.paid
                              )}
                            </td>

                            <td className="text-end text-danger fw-semibold">
                              {money(
                                customer.balance
                              )}
                            </td>

                          </tr>
                        )
                      )}

                    </tbody>

                  </table>

                </div>

              ) : (

                <Empty text="No customers found for the selected filters." />

              )}

            </section>

          </div>

        </div>

      </div>

      {/* PRINT CSS */}
      <style>{`
        @media print {

          body {
            background: white !important;
          }

          .no-print,
          .app-sidebar,
          .sidebar,
          nav,
          header {
            display: none !important;
          }

          .panel-card,
          .stat-card {
            box-shadow: none !important;
            border: 1px solid #ddd !important;
          }

          #reports-print-area {
            width: 100%;
          }

          table {
            font-size: 12px;
          }

          .report-filters {
            display: none !important;
          }

          @page {
            size: A4;
            margin: 12mm;
          }
        }
      `}</style>

    </AppShell>
  );
}