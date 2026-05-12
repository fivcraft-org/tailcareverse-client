import React, { useEffect, useState } from "react";
import { Check, X, MessageSquare, Clock, User } from "lucide-react";
import {
  getAllEditRequests,
  updateEditRequestStatus,
} from "../../api/api-admin";
import {
  notifySuccess,
  notifyError,
} from "../../utils/services/toast/toast-service";
import AdminActionModal from "../../components/common/AdminActionModal";

export default function ProfileEditRequestsModule() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState("pending");

  // Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [activeRequest, setActiveRequest] = useState(null);
  const [processing, setProcessing] = useState(false);

  const fetchData = () => {
    setLoading(true);
    getAllEditRequests()
      .then((res) => {
        console.log("Edit Requests API Response:", res.data);
        setRequests(res.data.data || []);
      })
      .catch((err) => {
        console.error("Failed to fetch edit requests:", err);
        notifyError("Failed to fetch requests");
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleAction = (id, status) => {
    setActiveRequest({ id, status });
    setModalOpen(true);
  };

  const confirmAction = async (adminNotes) => {
    if (!activeRequest) return;
    setProcessing(true);
    try {
      await updateEditRequestStatus(activeRequest.id, {
        status: activeRequest.status,
        adminNotes,
      });
      notifySuccess(`Request ${activeRequest.status} successfully`);
      setModalOpen(false);
      fetchData();
    } catch (err) {
      notifyError("Failed to update request");
    } finally {
      setProcessing(false);
    }
  };

  const filteredRequests = requests.filter((r) => r.status === filterStatus);

  return (
    <div className="ad-module">
      <div className="ad-module-header">
        <div>
          <h2 className="ad-module-title">Profile Edit Requests</h2>
          <p className="ad-module-sub">
            Review and approve requests from verified users to edit their
            profile details
          </p>
        </div>
        <button
          onClick={fetchData}
          className="ad-premium-btn ad-btn-neutral flex items-center gap-2"
          disabled={loading}
        >
          <Clock size={16} className={loading ? "animate-spin" : ""} />
          {loading ? "Refreshing..." : "Refresh"}
        </button>
      </div>

      <div className="ad-tabs-container">
        <div className="ad-sub-tabs">
          {["pending", "approved", "rejected", "used"].map((status) => (
            <button
              key={status}
              className={`ad-sub-tab ${filterStatus === status ? "ad-sub-tab-active" : ""}`}
              onClick={() => setFilterStatus(status)}
            >
              {status.charAt(0).toUpperCase() + status.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="ad-loading-list">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="ad-skeleton-row" />
          ))}
        </div>
      ) : (
        <div className="ad-table-wrap">
          <table className="ad-table">
            <thead>
              <tr>
                <th>User</th>
                <th>Current Role</th>
                <th>Request Message</th>
                <th>Submitted</th>
                <th style={{ textAlign: "right" }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredRequests.map((req) => (
                <tr key={req._id}>
                  <td>
                    <div className="ad-user-cell">
                      <div className="ad-avatar-sm">
                        {req.user?.username?.[0] || "?"}
                      </div>
                      <div>
                        <div className="ad-cell-name">{req.user?.username}</div>
                        <div className="ad-cell-email">{req.user?.email}</div>
                      </div>
                    </div>
                  </td>
                  <td>
                    <span className="ad-badge ad-badge-neutral">
                      {req.user?.role}
                    </span>
                  </td>
                  <td style={{ maxWidth: "300px" }}>
                    <div className="ad-cell-msg">
                      <span className="ad-truncate-2" title={req.message}>
                        {req.message}
                      </span>
                    </div>
                  </td>
                  <td>
                    <div className="ad-cell-date text-xs">
                      {new Date(req.createdAt).toLocaleDateString()}
                    </div>
                  </td>
                  <td>
                    {req.status === "pending" && (
                      <div
                        className="ad-action-group"
                        style={{ justifyContent: "flex-end" }}
                      >
                        <button
                          className="ad-premium-icon-btn ad-btn-success"
                          onClick={() => handleAction(req._id, "approved")}
                          title="Approve"
                        >
                          <Check size={18} />
                        </button>
                        <button
                          className="ad-premium-icon-btn ad-btn-danger"
                          onClick={() => handleAction(req._id, "rejected")}
                          title="Reject"
                        >
                          <X size={18} />
                        </button>
                      </div>
                    )}
                    {req.status !== "pending" && (
                      <div
                        style={{
                          textAlign: "right",
                          fontSize: "12px",
                          fontWeight: "800",
                          letterSpacing: "0.5px",
                          textTransform: "uppercase",
                          color:
                            req.status === "approved" || req.status === "used"
                              ? "#10b981"
                              : "#ef4444",
                        }}
                      >
                        {req.status === "rejected" ? "REJECTED" : "APPROVED"}
                      </div>
                    )}
                  </td>
                </tr>
              ))}
              {filteredRequests.length === 0 && (
                <tr>
                  <td
                    colSpan="5"
                    style={{
                      textAlign: "center",
                      padding: "60px",
                      color: "var(--ad-text-faint)",
                    }}
                  >
                    No {filterStatus} edit requests found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Admin Action Modal */}
      <AdminActionModal
        isOpen={modalOpen}
        onClose={() => !processing && setModalOpen(false)}
        onConfirm={confirmAction}
        loading={processing}
        actionType={activeRequest?.status}
        title={
          activeRequest?.status === "approved"
            ? "Approve Edit Request"
            : "Reject Edit Request"
        }
        placeholder={
          activeRequest?.status === "approved"
            ? "Explain why this request is being approved..."
            : "Please provide a reason for rejecting this request..."
        }
      />
    </div>
  );
}
