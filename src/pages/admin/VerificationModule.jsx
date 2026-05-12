import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Eye, Calendar, Image as ImageIcon, ShieldCheck } from "lucide-react";
import { getPendingVerifications } from "../../api/api-admin";

const TABS = ["All", "Vet", "Breeder", "Shop", "Kennel", "Groomer"];
const STATUS_TABS = [
  { id: "pending", label: "Requests" },
  { id: "verified", label: "Approved" },
  { id: "resubmit", label: "Resubmit" },
  { id: "rejected", label: "Rejected" },
];

const statusBadge = (status) => {
  const map = {
    pending: { label: "Admin Not Verified", cls: "ad-badge-warn" },
    verified: { label: "Approved", cls: "ad-badge-success" },
    rejected: { label: "Rejected", cls: "ad-badge-danger" },
    resubmit: { label: "Needs Resubmission", cls: "ad-badge-warn" },
  };
  const s = map[status] ?? { label: status, cls: "ad-badge-neutral" };
  return <span className={`ad-badge ${s.cls}`}>{s.label}</span>;
};

/* ── Verification Module ────────────────────────────────────────────────────── */
export default function VerificationModule() {
  const navigate = useNavigate();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("All");
  const [activeStatus, setActiveStatus] = useState("pending");

  const fetchData = (status) => {
    setLoading(true);
    getPendingVerifications({ status })
      .then((res) => setItems(res.data?.data ?? res.data ?? []))
      .catch(() => setItems([]))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchData(activeStatus);
  }, [activeStatus]);

  const handleReview = (item) => {
    // Navigate to the detail page
    navigate(
      `/admin/verification/${item.profileType.toLowerCase()}/${item._id}`,
      { state: { item } },
    );
  };

  const displayItems =
    activeTab === "All"
      ? items
      : items.filter((i) => i.profileType === activeTab);

  return (
    <div className="ad-module">
      <div className="ad-module-header">
        <div>
          <h2 className="ad-module-title">Verification Queue</h2>
          <p className="ad-module-sub">
            Meticulously review and authorize service provider credentials
          </p>
        </div>
        <div className="ad-badge ad-badge-warn">
          {displayItems.length} Pending Actions
        </div>
      </div>

      <div className="ad-tabs-container">
        <div className="ad-tabs">
          {TABS.map((t) => (
            <button
              key={t}
              className={`ad-tab ${activeTab === t ? "ad-tab-active" : ""}`}
              onClick={() => setActiveTab(t)}
            >
              {t}
            </button>
          ))}
        </div>

        <div className="ad-sub-tabs">
          {STATUS_TABS.map((s) => (
            <button
              key={s.id}
              className={`ad-sub-tab ${activeStatus === s.id ? "ad-sub-tab-active" : ""}`}
              onClick={() => setActiveStatus(s.id)}
            >
              {s.label}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="ad-loading-list">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="ad-skeleton-row" />
          ))}
        </div>
      ) : (
        <div className="ad-table-wrap">
          <table className="ad-table">
            <thead>
              <tr>
                <th>Applicant</th>
                <th>Provider Type</th>
                <th>Request Data</th>
                <th>Registration</th>
                <th>Admin Status</th>
                <th style={{ textAlign: "right" }}>Review</th>
              </tr>
            </thead>
            <tbody>
              {displayItems.map((item) => (
                <tr key={item._id}>
                  <td>
                    <div className="ad-user-cell">
                      <div className="ad-avatar-sm">
                        {item.name?.[0] ?? "?"}
                      </div>
                      <div>
                        <div className="ad-cell-name">{item.name}</div>
                        <div className="ad-cell-email">{item.email}</div>
                      </div>
                    </div>
                  </td>
                  <td>
                    <span className="ad-badge ad-badge-info">
                      {item.profileType}
                    </span>
                  </td>
                  <td className="ad-cell-doc">
                    <span
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "6px",
                      }}
                    >
                      <ImageIcon size={14} /> DOCS_VERIF_
                      {item._id?.slice(-4).toUpperCase()}
                    </span>
                  </td>
                  <td className="ad-cell-date">
                    <span
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "6px",
                      }}
                    >
                      <Calendar size={14} /> {item.submittedAt?.slice(0, 10)}
                    </span>
                  </td>
                  <td>{statusBadge(item.status)}</td>
                  <td>
                    <div
                      className="ad-action-group"
                      style={{ justifyContent: "flex-end" }}
                    >
                      <button
                        className="ad-premium-icon-btn"
                        title="Open Verification Panel"
                        onClick={() => handleReview(item)}
                      >
                        <Eye size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {displayItems.length === 0 && (
                <tr>
                  <td
                    colSpan="6"
                    style={{
                      textAlign: "center",
                      padding: "60px",
                      color: "var(--ad-text-faint)",
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        gap: "12px",
                      }}
                    >
                      <ShieldCheck size={40} strokeWidth={1} />
                      <p>
                        {activeStatus === "pending"
                          ? "Crystal clear! No pending verification requests."
                          : `No ${activeStatus} records found.`}
                      </p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
