import React, { useEffect, useState } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { notifications } from "@mantine/notifications";
import {
  ArrowLeft,
  CheckCircle,
  X,
  User,
  ShieldCheck,
  Image as ImageIcon,
  ExternalLink,
  Calendar,
  AlertCircle,
  Clock,
  MapPin,
  Phone,
  RefreshCw,
  FileText,
} from "lucide-react";
import {
  getPendingVerifications,
  verifyServiceProvider,
} from "../../api/api-admin";

/* ── Shared Gallery Component ────────────────────────────────────────────────── */
function DocumentGallery({ details, userDoc, profileType }) {
  const images = [];

  // Determine if we have any specialized details
  const hasProfessionalDocs = !!(
    details?.clinicFrontPhoto?.url ||
    details?.licenseCertificate?.url ||
    details?.logo?.url ||
    details?.photos?.length
  );

  // 1. Base User Identity Proof
  const idProof = userDoc || details?.verificationDocument;
  if (idProof?.url) {
    images.push({ url: idProof.url, label: "Identity Proof" });
  }

  // 2. Professional Specific Photos
  if (details?.clinicFrontPhoto?.url)
    images.push({ url: details.clinicFrontPhoto.url, label: "Center Front" });
  if (details?.licenseCertificate?.url)
    images.push({
      url: details.licenseCertificate.url,
      label: "License Certificate",
    });
  if (Array.isArray(details?.certificates)) {
    details.certificates.forEach((c, idx) => {
      if (c.url)
        images.push({ url: c.url, label: c.name || `Certificate ${idx + 1}` });
    });
  }
  if (details?.logo?.url)
    images.push({ url: details.logo.url, label: "Logo / Brand" });
  if (Array.isArray(details?.photos)) {
    details.photos.forEach((p, idx) => {
      if (p.url) images.push({ url: p.url, label: `Photo ${idx + 1}` });
    });
  }
  if (Array.isArray(details?.certifications)) {
    details.certifications.forEach((c, idx) => {
      if (c.url)
        images.push({ url: c.url, label: c.name || `Cert ${idx + 1}` });
    });
  }

  // Fallback for Groomer front photo if nested differently or if it's the only doc
  if (
    profileType === "Groomer" &&
    details?.clinicFrontPhoto?.url &&
    !images.some((img) => img.label === "Center Front")
  ) {
    images.push({ url: details.clinicFrontPhoto.url, label: "Center Front" });
  }

  if (images.length === 0) {
    return (
      <div className="ad-no-docs">
        <AlertCircle size={24} />
        <p>No documents or images have been uploaded for this request yet.</p>
      </div>
    );
  }

  if (images.length === 0) {
    return (
      <div className="ad-doc-empty">
        <ImageIcon size={32} strokeWidth={1.5} />
        <p>No documents uploaded for this request.</p>
      </div>
    );
  }

  return (
    <div className="ad-gallery-grid">
      {images.map((img, i) => (
        <div
          key={i}
          className="ad-gallery-card"
          onClick={() => window.open(img.url, "_blank")}
        >
          <div className="ad-gallery-img-wrap">
            {img.url.toLowerCase().endsWith(".pdf") ? (
              <div className="ad-gallery-pdf-placeholder">
                <FileText size={48} strokeWidth={1.5} />
                <span>PDF Document</span>
              </div>
            ) : (
              <img src={img.url} alt={img.label} />
            )}
            <div className="ad-gallery-card-overlay">
              <ExternalLink size={24} />
              <span>
                {img.url.toLowerCase().endsWith(".pdf")
                  ? "Open PDF"
                  : "View Full Image"}
              </span>
            </div>
          </div>
          <div className="ad-gallery-card-label">{img.label}</div>
        </div>
      ))}
    </div>
  );
}

export default function VerificationDetail() {
  const { type, id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [item, setItem] = useState(location.state?.item || null);
  const [loading, setLoading] = useState(!item);
  const [actionLoading, setActionLoading] = useState(false);
  const [reason, setReason] = useState("");
  const [decisionType, setDecisionType] = useState(null); // 'rejected' or 'resubmit'

  useEffect(() => {
    if (!item) {
      setLoading(true);
      getPendingVerifications()
        .then((res) => {
          const list = res.data?.data ?? res.data ?? [];
          const found = list.find(
            (i) =>
              i._id === id &&
              i.profileType.toLowerCase() === type.toLowerCase(),
          );
          if (found) setItem(found);
          else navigate("/admin/verification");
        })
        .finally(() => setLoading(false));
    }
  }, [id, type, item, navigate]);

  const handleAction = async (status) => {
    // Decision phase for reason-required actions
    if (
      (status === "rejected" || status === "resubmit") &&
      decisionType !== status
    ) {
      setDecisionType(status);
      return;
    }

    setActionLoading(true);
    try {
      await verifyServiceProvider(item.profileType, item._id, {
        status,
        reviewNotes: reason,
      });

      notifications.show({
        title: "Success",
        message: `Application ${status === "verified" ? "approved" : status} successfully`,
        color: "green",
      });

      navigate("/admin/verification");
    } catch (e) {
      console.error(e);
      notifications.show({
        title: "Action Failed",
        message:
          e.response?.data?.message || e.message || "Failed to update status",
        color: "red",
      });
    } finally {
      setActionLoading(false);
    }
  };

  if (loading)
    return <div className="ad-loading-center">Loading request details...</div>;
  if (!item) return null;

  const details = item.details || {};

  return (
    <div className="ad-detail-page">
      <div className="ad-detail-header">
        <button
          className="ad-back-btn"
          onClick={() => navigate("/admin/verification")}
        >
          <ArrowLeft size={18} />
          Back to Queue
        </button>
        <div className="ad-detail-title-wrap">
          <div className="ad-id-badge">
            CASE #{item._id?.slice(-8).toUpperCase()}
          </div>
          <h1 className="ad-detail-title">Verification Review</h1>
        </div>
      </div>

      <div className="ad-detail-layout">
        <div className="ad-detail-main">
          {/* Basic Info */}
          <section className="ad-detail-section">
            <div className="ad-section-header">
              <User size={18} />
              <span>Applicant Information</span>
            </div>
            <div className="ad-detail-grid">
              <div className="ad-detail-item">
                <label>Full Name</label>
                <div className="ad-detail-val">{item.name || "N/A"}</div>
              </div>
              <div className="ad-detail-item">
                <label>Email Address</label>
                <div className="ad-detail-val">{item.email || "N/A"}</div>
              </div>
              <div className="ad-detail-item">
                <label>Submission Date</label>
                <div className="ad-detail-val">
                  {item.submittedAt
                    ? new Date(item.submittedAt).toLocaleDateString("en-GB", {
                        day: "2-digit",
                        month: "long",
                        year: "numeric",
                      })
                    : "Unknown"}
                </div>
              </div>
              <div className="ad-detail-item">
                <label>Verification Status</label>
                <div className="ad-detail-val">
                  {item.status ? (
                    <span className={`ad-badge ad-badge-${item.status}`}>
                      {item.status.charAt(0).toUpperCase() +
                        item.status.slice(1)}
                    </span>
                  ) : (
                    <span className="ad-badge ad-badge-pending">Pending</span>
                  )}
                </div>
              </div>
            </div>
          </section>

          {/* User Profile (Fallback/Basic) */}
          {(details.profile || details.role) && (
            <section className="ad-detail-section ad-detail-faded">
              <div className="ad-section-header">
                <AlertCircle size={18} />
                <span>Account Profile Details</span>
              </div>
              <div className="ad-detail-grid">
                <div className="ad-detail-item">
                  <label>Location</label>
                  <div className="ad-detail-val">
                    {details.profile?.location || "Not provided"}
                  </div>
                </div>
                <div className="ad-detail-item">
                  <label>Bio</label>
                  <div className="ad-detail-val">
                    {details.profile?.bio || "No bio available"}
                  </div>
                </div>
              </div>
            </section>
          )}

          {/* Professional Details */}
          <section className="ad-detail-section">
            <div className="ad-section-header">
              <ShieldCheck size={18} />
              <span>Professional Credentials</span>
            </div>
            <div className="ad-detail-grid">
              {item.profileType === "Vet" && (
                <>
                  <div className="ad-detail-item">
                    <label>Clinic Name</label>
                    <div className="ad-detail-val">{details.clinicName}</div>
                  </div>
                  <div className="ad-detail-item">
                    <label>Medical Licence</label>
                    <div className="ad-detail-val">{details.licenseNumber}</div>
                  </div>
                  <div className="ad-detail-item">
                    <label>Experience</label>
                    <div className="ad-detail-val">
                      {details.experience} Years
                    </div>
                  </div>
                  {details.clinicFrontPhoto?.url && (
                    <div className="ad-detail-item">
                      <label>Clinic Board Photo</label>
                      <div className="ad-detail-val">
                        <a
                          href={details.clinicFrontPhoto.url}
                          target="_blank"
                          rel="noreferrer"
                          className="ad-link-accent"
                        >
                          <ExternalLink size={14} /> View Photo
                        </a>
                      </div>
                    </div>
                  )}
                  {details.licenseCertificate?.url && (
                    <div className="ad-detail-item">
                      <label>License Certificate</label>
                      <div className="ad-detail-val">
                        <a
                          href={details.licenseCertificate.url}
                          target="_blank"
                          rel="noreferrer"
                          className="ad-link-accent"
                        >
                          <FileText size={14} /> View Certificate
                        </a>
                      </div>
                    </div>
                  )}
                </>
              )}
              {item.profileType === "Shop" && (
                <>
                  <div className="ad-detail-item">
                    <label>Business Name</label>
                    <div className="ad-detail-val">{details.shopName}</div>
                  </div>
                  <div className="ad-detail-item">
                    <label>Registration Number</label>
                    <div className="ad-detail-val">
                      {details.businessLicense}
                    </div>
                  </div>
                  {details.clinicFrontPhoto?.url && (
                    <div className="ad-detail-item">
                      <label>Shop Board Photo</label>
                      <div className="ad-detail-val">
                        <a
                          href={details.clinicFrontPhoto.url}
                          target="_blank"
                          rel="noreferrer"
                          className="ad-link-accent"
                        >
                          <ExternalLink size={14} /> View Photo
                        </a>
                      </div>
                    </div>
                  )}
                </>
              )}
              {(item.profileType === "Kennel" ||
                item.profileType === "Breeder") && (
                <>
                  <div className="ad-detail-item">
                    <label>{item.profileType} Name</label>
                    <div className="ad-detail-val">
                      {details.kennelName || details.breederName}
                    </div>
                  </div>
                  <div className="ad-detail-item">
                    <label>License Number</label>
                    <div className="ad-detail-val">{details.licenseNumber}</div>
                  </div>
                  {details.clinicFrontPhoto?.url && (
                    <div className="ad-detail-item">
                      <label>Board Photo</label>
                      <div className="ad-detail-val">
                        <a
                          href={details.clinicFrontPhoto.url}
                          target="_blank"
                          rel="noreferrer"
                          className="ad-link-accent"
                        >
                          <ExternalLink size={14} /> View Photo
                        </a>
                      </div>
                    </div>
                  )}
                </>
              )}
              {item.profileType === "Groomer" && (
                <>
                  <div className="ad-detail-item">
                    <label>Grooming Center</label>
                    <div className="ad-detail-val">{details.shopName}</div>
                  </div>
                  <div className="ad-detail-item">
                    <label>Address</label>
                    <div className="ad-detail-val">{details.clinicAddress}</div>
                  </div>
                  {details.clinicFrontPhoto?.url && (
                    <div className="ad-detail-item">
                      <label>Center Board Photo</label>
                      <div className="ad-detail-val">
                        <a
                          href={details.clinicFrontPhoto.url}
                          target="_blank"
                          rel="noreferrer"
                          className="ad-link-accent"
                        >
                          <ExternalLink size={14} /> View Photo
                        </a>
                      </div>
                    </div>
                  )}
                  <div className="ad-detail-item">
                    <label>Grooming Hours</label>
                    <div className="ad-detail-val">
                      <Clock size={14} style={{ marginRight: "4px" }} />
                      {details.timing}
                    </div>
                  </div>
                  <div className="ad-detail-item">
                    <label>Google Maps</label>
                    <div className="ad-detail-val">
                      {details.googleMapsLink ? (
                        <a
                          href={details.googleMapsLink}
                          target="_blank"
                          rel="noreferrer"
                          className="ad-link-accent"
                        >
                          <MapPin size={14} /> View Location
                        </a>
                      ) : (
                        "Not provided"
                      )}
                    </div>
                  </div>
                </>
              )}
              <div className="ad-detail-item">
                <label>Primary Phone</label>
                <div className="ad-detail-val">
                  {details.contactInfo?.phone || "N/A"}
                </div>
              </div>
            </div>
          </section>

          {/* Evidence */}
          <section className="ad-detail-section">
            <div className="ad-section-header">
              <ImageIcon size={18} />
              <span>Evidence & Attachments</span>
            </div>
            <DocumentGallery
              details={details}
              userDoc={item.userDoc}
              profileType={item.profileType}
            />
          </section>
        </div>

        <aside className="ad-detail-sidebar">
          <div className="ad-action-card">
            <h3>Decision Panel</h3>
            {item.status === "verified" || item.status === "rejected" ? (
              <div className="ad-decision-final">
                <div
                  className={`ad-final-badge ad-badge-${item.status === "verified" ? "success" : "danger"}`}
                >
                  {item.status === "verified" ? (
                    <CheckCircle size={16} />
                  ) : (
                    <X size={16} />
                  )}
                  <span>Application {item.status.toUpperCase()}</span>
                </div>
                {item.reviewNotes && (
                  <div className="ad-final-notes">
                    <label>Admin Feedback:</label>
                    <p>{item.reviewNotes}</p>
                  </div>
                )}
                <button
                  className="ad-btn-secondary full"
                  onClick={() => navigate("/admin/verification")}
                >
                  Return to Queue
                </button>
              </div>
            ) : (
              <>
                <p>
                  Review the credentials above before making a final decision.
                </p>

                {decisionType ? (
                  <div className="ad-rejection-area">
                    <label
                      className={
                        decisionType === "resubmit"
                          ? "ad-resubmit-label"
                          : "ad-reject-label"
                      }
                    >
                      {decisionType === "resubmit"
                        ? "Resubmission Requirements"
                        : "Specify Rejection Grounds"}
                    </label>
                    <textarea
                      placeholder={
                        decisionType === "resubmit"
                          ? "Explain what needs to be fixed or re-uploaded..."
                          : "Detail the reasons for rejection..."
                      }
                      value={reason}
                      onChange={(e) => setReason(e.target.value)}
                      autoFocus
                    />
                    <div className="ad-action-btns">
                      <button
                        className="ad-btn-secondary"
                        onClick={() => {
                          setDecisionType(null);
                          setReason("");
                        }}
                      >
                        Cancel
                      </button>
                      <button
                        className={
                          decisionType === "resubmit"
                            ? "ad-btn-resubmit-confirm"
                            : "ad-btn-danger"
                        }
                        disabled={!reason.trim() || actionLoading}
                        onClick={() => handleAction(decisionType)}
                      >
                        {actionLoading
                          ? "Processing..."
                          : `Confirm ${decisionType === "resubmit" ? "Request" : "Reject"}`}
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="ad-action-btns vertical">
                    <button
                      className="ad-btn-approve-big"
                      disabled={actionLoading}
                      onClick={() => handleAction("verified")}
                    >
                      <CheckCircle size={20} />
                      Approve Application
                    </button>

                    <button
                      className="ad-btn-resubmit-big"
                      disabled={actionLoading}
                      onClick={() => setDecisionType("resubmit")}
                    >
                      <RefreshCw size={20} />
                      Request Resubmission
                    </button>

                    <button
                      className="ad-btn-reject-big"
                      onClick={() => setDecisionType("rejected")}
                    >
                      <X size={20} />
                      Reject Application
                    </button>
                  </div>
                )}
              </>
            )}
          </div>

          <div className="ad-guidelines-card">
            <h4>
              <AlertCircle size={16} /> Guidelines
            </h4>
            <ul>
              <li>Check ID validity and expiry date.</li>
              <li>Verify license number against official databases.</li>
              <li>Ensure photos match the provided address.</li>
            </ul>
          </div>
        </aside>
      </div>
    </div>
  );
}
