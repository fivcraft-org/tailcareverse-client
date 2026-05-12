import React, { useEffect, useState } from "react";
import {
  getAllReports,
  reviewReport,
  deleteListing,
  getPendingListings,
  reviewListing,
} from "../../api/api-admin";
import { fetchMarketplaceItems } from "../../api/api-marketplace";

const TABS = ["All Listings", "Pending Approvals", "Reported Listings"];

export default function MarketplaceModule() {
  const [activeTab, setActiveTab] = useState("All Listings");
  const [listings, setListings] = useState([]);
  const [pendingListings, setPendingListings] = useState([]);
  const [reportedListings, setReportedListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [lRes, pRes, rRes] = await Promise.all([
          fetchMarketplaceItems({ limit: 100 }),
          getPendingListings({ limit: 100 }),
          getAllReports({ targetType: "listing", status: "pending" }),
        ]);
        setListings(lRes.data?.data?.listings || lRes.data?.listings || []);
        setPendingListings(
          pRes.data?.data?.listings || pRes.data?.listings || []
        );
        setReportedListings(
          rRes.data?.reports || rRes.data?.data?.reports || []
        );
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleApproval = async (listingId, action) => {
    setActionLoading(listingId + action);
    try {
      await reviewListing(listingId, { action });
      setPendingListings((prev) => prev.filter((l) => l._id !== listingId));
      if (action === "approve") {
        // Optimistically add to active listings
        const approved = pendingListings.find((l) => l._id === listingId);
        if (approved) {
          setListings((prev) => [{ ...approved, status: "active" }, ...prev]);
        }
      }
    } catch (e) {
      console.error(e);
    } finally {
      setActionLoading(null);
    }
  };

  const handleReportAction = async (reportId, action) => {
    setActionLoading(reportId + action);
    try {
      if (action === "remove") {
        const report = reportedListings.find((r) => r._id === reportId);
        if (report && report.targetId) {
          await deleteListing(report.targetId);
        }
        await reviewReport(reportId, {
          status: "resolved",
          reviewNotes: "Deleted by admin",
        });
        setReportedListings((prev) => prev.filter((r) => r._id !== reportId));
        setListings((prev) => prev.filter((l) => l._id !== report?.targetId));
      } else if (action === "dismiss") {
        await reviewReport(reportId, {
          status: "dismissed",
          reviewNotes: "Dismissed by admin",
        });
        setReportedListings((prev) => prev.filter((r) => r._id !== reportId));
      }
    } catch (e) {
      console.error(e);
    } finally {
      setActionLoading(null);
    }
  };

  const handleListingAction = async (listingId, action) => {
    setActionLoading(listingId + action);
    try {
      if (action === "remove") {
        await deleteListing(listingId);
        setListings((prev) => prev.filter((l) => l._id !== listingId));
      }
    } catch (e) {
      console.error(e);
    } finally {
      setActionLoading(null);
    }
  };

  return (
    <div className="ad-module">
      <div className="ad-module-header">
        <div>
          <h2 className="ad-module-title">Marketplace Control</h2>
          <p className="ad-module-sub">
            Manage listings, sellers, and marketplace reports
          </p>
        </div>
        <div className="ad-header-stats">
          {pendingListings.length > 0 && (
            <span className="ad-badge ad-badge-info">
              {pendingListings.length} Pending
            </span>
          )}
          <span className="ad-badge ad-badge-warn">
            {reportedListings.length} Reports
          </span>
          <span className="ad-badge ad-badge-success">
            {listings.length} Active Listings
          </span>
        </div>
      </div>

      <div className="ad-tabs">
        {TABS.map((t) => (
          <button
            key={t}
            className={`ad-tab ${activeTab === t ? "ad-tab-active" : ""}`}
            onClick={() => setActiveTab(t)}
          >
            {t}
            {t === "Pending Approvals" && pendingListings.length > 0 && (
              <span
                style={{
                  marginLeft: "6px",
                  background: "var(--color-warning, #f59e0b)",
                  color: "#fff",
                  borderRadius: "999px",
                  fontSize: "11px",
                  fontWeight: 700,
                  padding: "1px 7px",
                }}
              >
                {pendingListings.length}
              </span>
            )}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="ad-loading-list">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="ad-skeleton-row" />
          ))}
        </div>
      ) : (
        <div className="ad-card-list">
          {/* ── ALL LISTINGS TAB ── */}
          {activeTab === "All Listings" &&
            (listings.length === 0 ? (
              <div className="ad-empty-state">
                <p>No active listings found.</p>
              </div>
            ) : (
              listings.map((item) => (
                <div key={item._id} className="ad-report-card">
                  <div className="ad-report-left flex items-start gap-4">
                    {item.images && item.images.length > 0 ? (
                      <div className="w-16 h-16 shrink-0 rounded-2xl overflow-hidden bg-gray-100 border border-gray-100 shadow-sm relative">
                        <img
                          src={item.images[0].url}
                          alt="Listing content"
                          className="w-full h-full object-cover"
                        />
                      </div>
                    ) : (
                      <div className="w-16 h-16 shrink-0 rounded-2xl flex items-center justify-center font-bold text-lg text-emerald-600 bg-emerald-50 border border-emerald-100 shadow-sm">
                        MKT
                      </div>
                    )}

                    <div className="flex flex-col flex-1 h-full min-h-[4rem] justify-center">
                      <div className="ad-report-title text-base font-semibold leading-snug text-gray-900 line-clamp-1">
                        {item.title} - ${item.price}
                      </div>
                      <div className="ad-report-meta mt-2 flex items-center flex-wrap gap-2 text-sm">
                        <span className="font-medium text-gray-700">
                          Seller:{" "}
                          <span className="text-emerald-600">
                            @{item.seller?.username || "unknown"}
                          </span>
                        </span>
                        <span className="ad-dot-sep opacity-50">•</span>
                        <span className="text-gray-500 font-medium">
                          Category: {item.category}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="ad-action-group">
                    <button
                      className="ad-btn ad-btn-danger"
                      disabled={!!actionLoading}
                      onClick={() => handleListingAction(item._id, "remove")}
                    >
                      {actionLoading === item._id + "remove" ? "..." : "Remove"}
                    </button>
                  </div>
                </div>
              ))
            ))}

          {/* ── PENDING APPROVALS TAB ── */}
          {activeTab === "Pending Approvals" &&
            (pendingListings.length === 0 ? (
              <div className="ad-empty-state">
                <p>No listings awaiting approval.</p>
              </div>
            ) : (
              pendingListings.map((item) => (
                <div key={item._id} className="ad-report-card">
                  <div className="ad-report-left flex items-start gap-4">
                    {item.images && item.images.length > 0 ? (
                      <div className="w-16 h-16 shrink-0 rounded-2xl overflow-hidden bg-gray-100 border border-gray-100 shadow-sm relative">
                        <img
                          src={item.images[0].url}
                          alt="Listing content"
                          className="w-full h-full object-cover"
                        />
                      </div>
                    ) : (
                      <div className="w-16 h-16 shrink-0 rounded-2xl flex items-center justify-center font-bold text-lg text-amber-600 bg-amber-50 border border-amber-100 shadow-sm">
                        NEW
                      </div>
                    )}

                    <div className="flex flex-col flex-1 h-full min-h-[4rem] justify-center">
                      <div className="ad-report-title text-base font-semibold leading-snug text-gray-900 line-clamp-1">
                        {item.title} — ${item.price}
                      </div>
                      <div className="ad-report-meta mt-2 flex items-center flex-wrap gap-2 text-sm">
                        <span className="font-medium text-gray-700">
                          Seller:{" "}
                          <span className="text-emerald-600">
                            @{item.seller?.username || "unknown"}
                          </span>
                        </span>
                        <span className="ad-dot-sep opacity-50">•</span>
                        <span className="text-gray-500 font-medium">
                          Type: {item.type}
                        </span>
                        {item.category && (
                          <>
                            <span className="ad-dot-sep opacity-50">•</span>
                            <span className="text-gray-500 font-medium">
                              {item.category}
                            </span>
                          </>
                        )}
                        <span className="ad-dot-sep opacity-50">•</span>
                        <span
                          style={{
                            background: "#fef3c7",
                            color: "#92400e",
                            padding: "2px 8px",
                            borderRadius: "999px",
                            fontSize: "11px",
                            fontWeight: 700,
                          }}
                        >
                          PENDING REVIEW
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="ad-action-group">
                    <button
                      className="ad-btn ad-btn-success"
                      disabled={!!actionLoading}
                      onClick={() => handleApproval(item._id, "approve")}
                      style={{ background: "#10b981", color: "#fff" }}
                    >
                      {actionLoading === item._id + "approve"
                        ? "..."
                        : "Approve"}
                    </button>
                    <button
                      className="ad-btn ad-btn-danger"
                      disabled={!!actionLoading}
                      onClick={() => handleApproval(item._id, "reject")}
                    >
                      {actionLoading === item._id + "reject" ? "..." : "Reject"}
                    </button>
                  </div>
                </div>
              ))
            ))}

          {/* ── REPORTED LISTINGS TAB ── */}
          {activeTab === "Reported Listings" &&
            (reportedListings.length === 0 ? (
              <div className="ad-empty-state">
                <p>No pending marketplace reports.</p>
              </div>
            ) : (
              reportedListings.map((r) => {
                const item = r.targetData;
                return (
                  <div key={r._id} className="ad-report-card">
                    <div className="ad-report-left flex items-start gap-4">
                      {item?.images && item.images.length > 0 ? (
                        <div className="w-16 h-16 shrink-0 rounded-2xl overflow-hidden bg-gray-100 border border-gray-100 shadow-sm relative">
                          <img
                            src={item.images[0].url}
                            alt="Listing content"
                            className="w-full h-full object-cover"
                          />
                        </div>
                      ) : (
                        <div className="w-16 h-16 shrink-0 rounded-2xl flex items-center justify-center font-bold text-lg text-red-600 bg-red-50 border border-red-100 shadow-sm">
                          RPT
                        </div>
                      )}

                      <div className="flex flex-col flex-1 h-full min-h-[4rem] justify-center">
                        <div className="ad-report-title text-base font-semibold leading-snug text-gray-900 line-clamp-1">
                          {item?.title || "Unknown Listing"} — $
                          {item?.price || 0}
                        </div>
                        <div className="ad-report-meta mt-2 flex items-center flex-wrap gap-2 text-sm">
                          <span className="font-medium text-gray-700">
                            Seller:{" "}
                            <span className="text-emerald-600">
                              @{item?.seller?.username || "unknown"}
                            </span>
                          </span>
                          <span className="ad-dot-sep opacity-50">•</span>
                          <span className="bg-red-50 text-red-600 px-2.5 py-1 rounded-full text-xs font-bold tracking-wide">
                            {r.reason}
                          </span>
                          <span className="ad-dot-sep opacity-50">•</span>
                          <span className="text-gray-500 font-medium">
                            Reported by:{" "}
                            <span className="text-gray-700">
                              @{r.reporter?.username}
                            </span>
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="ad-action-group">
                      <button
                        className="ad-btn ad-btn-danger"
                        disabled={!!actionLoading}
                        onClick={() => handleReportAction(r._id, "remove")}
                      >
                        {actionLoading === r._id + "remove"
                          ? "..."
                          : "Remove Listing"}
                      </button>
                      <button
                        className="ad-btn ad-btn-neutral"
                        disabled={!!actionLoading}
                        onClick={() => handleReportAction(r._id, "dismiss")}
                      >
                        {actionLoading === r._id + "dismiss"
                          ? "..."
                          : "Dismiss"}
                      </button>
                    </div>
                  </div>
                );
              })
            ))}
        </div>
      )}
    </div>
  );
}
