import React from "react";
import AdminModal from "./AdminModal";
import { 
  FiMail, FiCalendar, FiShield, FiUser, 
  FiMapPin, FiBriefcase, FiPhone, FiStar,
  FiActivity, FiShoppingBag, FiHome
} from "react-icons/fi";
import { MdVerified } from "react-icons/md";

const DetailItem = ({ icon: Icon, label, value }) => (
  <div className="ad-detail-item" style={{
    display: "flex",
    alignItems: "flex-start",
    gap: "12px",
    padding: "16px",
    background: "var(--ad-surface2)",
    borderRadius: "16px",
    border: "1px solid var(--ad-border)",
    transition: "0.25s ease"
  }}>
    <div className="ad-detail-item-icon" style={{
      padding: "8px",
      background: "var(--ad-surface3)",
      borderRadius: "8px",
      color: "var(--ad-green)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      flexShrink: 0
    }}>
      <Icon size={18} />
    </div>
    <div>
      <p className="ad-detail-item-label" style={{
        fontSize: "10px",
        fontWeight: 800,
        letterSpacing: "0.1em",
        textTransform: "uppercase",
        color: "var(--ad-text-faint)",
        marginBottom: "2px"
      }}>
        {label}
      </p>
      <p className="ad-detail-item-value" style={{
        fontSize: "0.875rem",
        fontWeight: 700,
        color: "var(--ad-text)",
        lineHeight: 1.3
      }}>
        {value || "Not specified"}
      </p>
    </div>
  </div>
);

export default function UserProfileModal({ user, onClose }) {
  if (!user) return null;

  const roleProfile = user.roleProfile || {};
  const profile = user.profile || {};

  return (
    <AdminModal
      title="User Profile Details"
      subtitle={`Detailed information for @${user.username}`}
      onClose={onClose}
      maxWidth="800px"
    >
      <div className="ad-user-detail-view" style={{ paddingBottom: "24px" }}>
        {/* Header Section */}
        <div style={{
          display: "flex",
          flexWrap: "wrap",
          gap: "24px",
          marginBottom: "32px",
          alignItems: "flex-start"
        }}>
          <div className="ad-user-avatar-wrap" style={{
            width: "96px",
            height: "96px",
            borderRadius: "24px",
            overflow: "hidden",
            background: "var(--ad-surface2)",
            border: "3px solid var(--ad-border)",
            flexShrink: 0
          }}>
            <img
              src={profile.avatar?.url || `https://ui-avatars.com/api/?name=${user.username}&background=random&size=200`}
              alt="Avatar"
              style={{ width: "100%", height: "100%", objectFit: "cover" }}
            />
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap", marginBottom: "6px" }}>
              <h3 className="ad-user-name-primary" style={{
                fontSize: "1.6rem",
                fontWeight: 900,
                color: "var(--ad-text)",
                letterSpacing: "-0.03em"
              }}>
                {user.username}
              </h3>
              {user.isAdminVerified && (
                <MdVerified style={{ color: "#3b82f6" }} size={22} />
              )}
              <span className={`ad-badge ${user.isActive ? "ad-badge-success" : "ad-badge-danger"}`}>
                {user.isActive ? "Active" : "Banned"}
              </span>
            </div>
            <p style={{ fontSize: "1rem", fontWeight: 700, color: "var(--ad-green)", marginBottom: "8px" }}>
              {profile.firstName} {profile.lastName}
            </p>
            <p className="ad-user-bio" style={{ color: "var(--ad-text-muted)", fontWeight: 500, maxWidth: "480px" }}>
              {profile.bio || "This user hasn't added a bio yet."}
            </p>
          </div>
        </div>

        {/* Core Info Grid */}
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))",
          gap: "12px",
          marginBottom: "24px"
        }}>
          <DetailItem icon={FiMail} label="Email Address" value={user.email} />
          <DetailItem icon={FiShield} label="Account Role" value={user.role || "User"} />
          <DetailItem icon={FiCalendar} label="Member Since" value={new Date(user.createdAt).toLocaleDateString(undefined, { dateStyle: 'long' })} />
        </div>

        {/* Role Specific Details */}
        {user.role !== "user" && (
          <div style={{ marginTop: "8px" }}>
            <h4 className="ad-prof-section-title" style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              fontSize: "1rem",
              fontWeight: 800,
              color: "var(--ad-text)",
              marginBottom: "16px"
            }}>
               <FiBriefcase style={{ color: "var(--ad-green)" }} />
               Professional Information
               {roleProfile.rating > 0 && (
                 <span style={{
                   marginLeft: "auto",
                   display: "flex",
                   alignItems: "center",
                   gap: "4px",
                   background: "rgba(245,158,11,0.12)",
                   color: "#d97706",
                   padding: "4px 12px",
                   borderRadius: "100px",
                   fontSize: "0.75rem",
                   border: "1px solid rgba(245,158,11,0.2)",
                   fontWeight: 800
                 }}>
                   <FiStar style={{ fill: "#fbbf24", color: "#fbbf24" }} size={12} />
                   {roleProfile.rating?.toFixed(1)}
                 </span>
               )}
            </h4>
            
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: "12px" }}>
              {user.role === "vet" && (
                <>
                  <DetailItem icon={FiHome} label="Clinic Name" value={roleProfile.clinicName} />
                  <DetailItem icon={FiActivity} label="Experience" value={`${roleProfile.experience} Years`} />
                  <DetailItem icon={FiMapPin} label="Address" value={roleProfile.clinicAddress} />
                  <DetailItem icon={FiPhone} label="Emergency Contact" value={roleProfile.contactInfo?.phone} />
                </>
              )}
              {user.role === "groomer" && (
                <>
                  <DetailItem icon={FiShoppingBag} label="Shop Name" value={roleProfile.shopName} />
                  <DetailItem icon={FiActivity} label="Specialization" value={roleProfile.specialization} />
                  <DetailItem icon={FiMapPin} label="Location" value={roleProfile.clinicAddress} />
                  <DetailItem icon={FiPhone} label="Contact" value={roleProfile.contactInfo?.phone} />
                </>
              )}
              {user.role === "shop" && (
                <>
                  <DetailItem icon={FiShoppingBag} label="Business Name" value={roleProfile.shopName} />
                  <DetailItem icon={FiMapPin} label="Location" value={roleProfile.clinicAddress} />
                  <DetailItem icon={FiPhone} label="Support" value={roleProfile.contactInfo?.phone} />
                </>
              )}
              {!["vet", "groomer", "shop"].includes(user.role) && (
                <div className="ad-user-fallback-box" style={{
                  gridColumn: "1 / -1",
                  padding: "24px",
                  background: "var(--ad-surface2)",
                  borderRadius: "16px",
                  border: "1px dashed var(--ad-border)",
                  textAlign: "center",
                  color: "var(--ad-text-muted)",
                  fontWeight: 500
                }}>
                  Additional role details are being updated.
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </AdminModal>
  );
}
