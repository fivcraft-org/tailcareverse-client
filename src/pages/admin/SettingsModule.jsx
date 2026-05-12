import React, { useState, useEffect } from "react";
import {
  createMoment,
  fetchAnnouncements,
  deleteMoment,
} from "../../api/api-moments";
import {
  getPlatformSettings,
  updatePlatformSettings,
  uploadPlatformLogo,
} from "../../api/api-admin";
import { FiTrash2, FiSave, FiUpload } from "react-icons/fi";
import { useSettings } from "../../context/SettingsContext";
import { notifications } from "@mantine/notifications";

const SETTINGS_TABS = [
  { id: "general", label: "General", icon: "" },
  { id: "verification", label: "Verification", icon: "" },
  { id: "marketplace", label: "Marketplace", icon: "" },
  { id: "vet-network", label: "Vet Network", icon: "" },
  { id: "security", label: "Security", icon: "" },
  { id: "notifications", label: "Notifications", icon: "" },
  { id: "announcements", label: "Announcements", icon: "" },
];

export default function SettingsModule() {
  const { settings: globalSettings, refreshSettings } = useSettings();
  const [activeTab, setActiveTab] = useState("general");
  const [announcementFile, setAnnouncementFile] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [announcements, setAnnouncements] = useState([]);
  const [isLoadingAnnouncements, setIsLoadingAnnouncements] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [logoFile, setLogoFile] = useState(null);

  // Local state for all settings categories
  const [localSettings, setLocalSettings] = useState(null);

  useEffect(() => {
    if (globalSettings) {
      setLocalSettings(JSON.parse(JSON.stringify(globalSettings)));
    }
  }, [globalSettings]);

  useEffect(() => {
    if (activeTab === "announcements") {
      loadAnnouncements();
    }
  }, [activeTab]);

  const loadAnnouncements = async () => {
    try {
      setIsLoadingAnnouncements(true);
      const res = await fetchAnnouncements();
      setAnnouncements(res.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoadingAnnouncements(false);
    }
  };

  const handleSave = async () => {
    try {
      setIsSaving(true);
      
      let payload = { ...localSettings };
      
      if (logoFile) {
        const formData = new FormData();
        formData.append("file", logoFile);
        const uploadRes = await uploadPlatformLogo(formData);
        if (uploadRes.data.success) {
          payload.general.logoUrl = uploadRes.data.data;
        }
      }

      const res = await updatePlatformSettings(payload);
      if (res.data.success) {
        notifications.show({
          title: "Success",
          message: "Settings updated successfully",
          color: "green",
        });
        refreshSettings();
      }
    } catch (err) {
      notifications.show({
        title: "Error",
        message: err.response?.data?.message || "Failed to update settings",
        color: "red",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const updateNestedSetting = (category, field, value) => {
    setLocalSettings((prev) => ({
      ...prev,
      [category]: {
        ...(prev[category] || {}),
        [field]: value,
      },
    }));
  };

  const handleDeleteAnnouncement = async (id) => {
    if (!window.confirm("Are you sure you want to delete this announcement?"))
      return;
    try {
      await deleteMoment(id);
      setAnnouncements((prev) => prev.filter((a) => a._id !== id));
      notifications.show({
        message: "Announcement deleted successfully",
        color: "green",
      });
    } catch (err) {
      notifications.show({
        message: "Failed to delete announcement",
        color: "red",
      });
    }
  };

  if (!localSettings) return <div className="p-8 text-center">Loading settings...</div>;

  const renderContent = () => {
    switch (activeTab) {
      case "general":
        return (
          <div className="ad-settings-pane">
            <h4 className="ad-settings-title">General Settings</h4>
            <div className="ad-form-group">
              <label>Platform Name</label>
              <input
                type="text"
                value={localSettings.general?.platformName ?? ""}
                onChange={(e) => updateNestedSetting("general", "platformName", e.target.value)}
                className="ad-input"
              />
            </div>
            <div className="ad-form-group">
              <label>Support Email</label>
              <input
                type="email"
                value={localSettings.general?.supportEmail ?? ""}
                onChange={(e) => updateNestedSetting("general", "supportEmail", e.target.value)}
                className="ad-input"
              />
            </div>
            <div className="ad-form-group">
              <label>Logo (Image or URL)</label>
              {(logoFile || localSettings.general.logoUrl) && (
                <div className="mb-3 p-3 bg-white/5 rounded-lg inline-block">
                  <img
                    src={logoFile ? URL.createObjectURL(logoFile) : localSettings.general.logoUrl}
                    alt="Logo Preview"
                    className="h-16 object-contain"
                  />
                </div>
              )}
              <div className="flex gap-4 items-center">
                <input
                  type="text"
                  placeholder="https://..."
                  value={logoFile ? "File selected for upload..." : (localSettings.general?.logoUrl ?? "")}
                  disabled={!!logoFile}
                  onChange={(e) => updateNestedSetting("general", "logoUrl", e.target.value)}
                  className="ad-input flex-1"
                />
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    if (e.target.files && e.target.files[0]) {
                      setLogoFile(e.target.files[0]);
                      updateNestedSetting("general", "logoUrl", "");
                    }
                  }}
                  className="hidden"
                  id="logo-upload"
                />
                <label
                  htmlFor="logo-upload"
                  className="ad-btn py-2 px-4 whitespace-nowrap cursor-pointer flex items-center"
                  style={{ background: "transparent", border: "1px solid var(--border)", color: "var(--text)" }}
                >
                  <FiUpload className="mr-2 inline" /> Upload
                </label>
                {logoFile && (
                  <button 
                    onClick={() => {
                      setLogoFile(null);
                      updateNestedSetting("general", "logoUrl", "");
                    }} 
                    className="ad-btn py-2 px-4 whitespace-nowrap cursor-pointer flex items-center"
                    style={{ background: "#ef444410", color: "#ef4444", border: "1px solid #ef444430" }}
                  >
                    Clear
                  </button>
                )}
              </div>
              <p className="text-[10px] text-gray-400 mt-2">Provide a direct link or upload an image file for the platform logo.</p>
            </div>
          </div>
        );
      case "verification":
        return (
          <div className="ad-settings-pane">
            <h4 className="ad-settings-title">Verification Settings</h4>
            <div className="ad-form-group">
              <label>Required Documents (Vets)</label>
              <div className="ad-tag-list">
                {(localSettings.verification?.requiredDocumentsVets || []).map((doc, idx) => (
                  <span key={idx} className="ad-tag">
                    {doc}{" "}
                    <span 
                      className="cursor-pointer ml-1" 
                      onClick={() => {
                        const newDocs = (localSettings.verification?.requiredDocumentsVets || []).filter((_, i) => i !== idx);
                        updateNestedSetting("verification", "requiredDocumentsVets", newDocs);
                      }}
                    >✕</span>
                  </span>
                ))}
                <button 
                  className="ad-tag-add"
                  onClick={() => {
                    const doc = prompt("Enter document name:");
                    if (doc) {
                      updateNestedSetting("verification", "requiredDocumentsVets", [
                        ...(localSettings.verification?.requiredDocumentsVets || []),
                        doc
                      ]);
                    }
                  }}
                >+ Add</button>
              </div>
            </div>
            <div className="ad-toggle-group">
              <span>Enable AI Proof Checklist</span>
              <label className="ad-switch">
                <input 
                  type="checkbox" 
                  checked={localSettings.verification?.enableAiProofChecklist ?? true}
                  onChange={(e) => updateNestedSetting("verification", "enableAiProofChecklist", e.target.checked)}
                />
                <span className="ad-slider" />
              </label>
            </div>
          </div>
        );
      case "marketplace":
        return (
          <div className="ad-settings-pane">
            <h4 className="ad-settings-title">Marketplace Settings</h4>
            <div className="ad-toggle-group">
              <span>Manual Approval for Listings</span>
              <label className="ad-switch">
                <input 
                  type="checkbox" 
                  checked={localSettings.marketplace?.manualApprovalForListings ?? false}
                  onChange={(e) => updateNestedSetting("marketplace", "manualApprovalForListings", e.target.checked)}
                />
                <span className="ad-slider" />
              </label>
            </div>
            <div className="ad-form-group">
              <label>Listing Expiration (Days)</label>
              <input 
                type="number" 
                value={localSettings.marketplace?.listingExpirationDays ?? 30}
                onChange={(e) => updateNestedSetting("marketplace", "listingExpirationDays", parseInt(e.target.value))}
                className="ad-input" 
              />
            </div>
          </div>
        );
      case "vet-network":
        return (
          <div className="ad-settings-pane">
            <h4 className="ad-settings-title">Vet Network Settings</h4>
            <div className="ad-toggle-group">
              <span>Highlight Emergency Services</span>
              <label className="ad-switch">
                <input 
                  type="checkbox" 
                  checked={localSettings.vetNetwork?.highlightEmergencyServices ?? true}
                  onChange={(e) => updateNestedSetting("vetNetwork", "highlightEmergencyServices", e.target.checked)}
                />
                <span className="ad-slider" />
              </label>
            </div>
          </div>
        );
      case "security":
        return (
          <div className="ad-settings-pane">
            <h4 className="ad-settings-title">Security & Auth</h4>
            <div className="ad-form-group">
              <label>Admin Session Timeout (Minutes)</label>
              <input 
                type="number" 
                value={localSettings.security?.adminSessionTimeoutMinutes ?? 60}
                onChange={(e) => updateNestedSetting("security", "adminSessionTimeoutMinutes", parseInt(e.target.value))}
                className="ad-input" 
              />
            </div>
            <div className="ad-toggle-group">
              <span>Enforce Strong Passwords</span>
              <label className="ad-switch">
                <input 
                  type="checkbox" 
                  checked={localSettings.security?.enforceStrongPasswords ?? true}
                  onChange={(e) => updateNestedSetting("security", "enforceStrongPasswords", e.target.checked)}
                />
                <span className="ad-slider" />
              </label>
            </div>
            <div className="ad-toggle-group">
              <span>Enable Two-Factor Authentication (2FA)</span>
              <label className="ad-switch">
                <input 
                  type="checkbox" 
                  checked={localSettings.security?.enableTwoFactorAuth ?? false}
                  onChange={(e) => updateNestedSetting("security", "enableTwoFactorAuth", e.target.checked)}
                />
                <span className="ad-slider" />
              </label>
            </div>
          </div>
        );
      case "notifications":
        return (
          <div className="ad-settings-pane">
            <h4 className="ad-settings-title">Global Notifications</h4>
            <div className="ad-toggle-group">
              <span>Email Alerts for New Reports</span>
              <label className="ad-switch">
                <input 
                  type="checkbox" 
                  checked={localSettings.notifications?.emailAlertsForNewReports ?? true}
                  onChange={(e) => updateNestedSetting("notifications", "emailAlertsForNewReports", e.target.checked)}
                />
                <span className="ad-slider" />
              </label>
            </div>
            <div className="ad-toggle-group">
              <span>Weekly Platform Statistics Report</span>
              <label className="ad-switch">
                <input 
                   type="checkbox" 
                   checked={localSettings.notifications?.weeklyPlatformStatisticsReport ?? false}
                   onChange={(e) => updateNestedSetting("notifications", "weeklyPlatformStatisticsReport", e.target.checked)}
                />
                <span className="ad-slider" />
              </label>
            </div>
          </div>
        );
      case "announcements":
        return (
          <div className="ad-settings-pane">
            <h4 className="ad-settings-title">Push System Announcements</h4>
            <p className="ad-settings-desc">
              Upload moments that will be visible to all users at the top of
              their feed.
            </p>

            <div className="ad-story-upload-card">
              <div className="ad-upload-preview">
                <div className="ad-story-placeholder">
                  <span className="ad-icon-lg">📲</span>
                  <span>Select Image/Video for Moment announcement</span>
                </div>
              </div>

              <div className="ad-form-group mt-4">
                <label>Moment File</label>
                <input
                  type="file"
                  className="ad-input"
                  accept="image/*,video/*"
                  onChange={(e) => {
                    const file = e.target.files[0];
                    if (file) {
                      setAnnouncementFile(file);
                    }
                  }}
                />
              </div>

              {announcementFile && (
                <div className="flex items-center justify-between bg-emerald-50/50 p-2 rounded-lg mt-2 border border-emerald-100">
                  <p className="text-xs text-emerald-600 font-bold truncate pr-4">
                    Ready: {announcementFile.name}
                  </p>
                  <button 
                    onClick={() => setAnnouncementFile(null)}
                    className="text-[10px] text-red-500 font-bold hover:underline"
                  >
                    Clear
                  </button>
                </div>
              )}

              <button
                className="ad-btn ad-btn-primary w-full mt-4"
                disabled={!announcementFile || isUploading}
                onClick={async () => {
                  try {
                    setIsUploading(true);
                    const formData = new FormData();
                    formData.append("file", announcementFile);
                    formData.append("isAnnouncement", "true");
                    formData.append(
                      "type",
                      announcementFile.type.startsWith("video")
                        ? "video"
                        : "image",
                    );

                    const data = await createMoment(formData);
                    if (data.data.success) {
                      notifications.show({
                        message: "Announcement moment posted successfully! 🚀",
                        color: "green",
                      });
                      setAnnouncementFile(null);
                      loadAnnouncements();
                    } else {
                      notifications.show({
                        message: data.message || "Failed to post announcement",
                        color: "red",
                      });
                    }
                  } catch (err) {
                    console.error(err);
                    notifications.show({
                      message: err.response?.data?.message || "Error uploading moment",
                      color: "red",
                    });
                  } finally {
                    setIsUploading(false);
                  }
                }}
              >
                {isUploading ? "Sharing..." : "Share Announcement 🚀"}
              </button>
            </div>

            <div className="ad-settings-section mt-8">
              <h5 className="ad-settings-subtitle">Active Announcements</h5>
              {isLoadingAnnouncements ? (
                <div className="p-4 text-center opacity-50 text-sm">
                  Loading active updates...
                </div>
              ) : announcements.length === 0 ? (
                <div className="p-8 border-2 border-dashed border-gray-100 rounded-xl text-center opacity-40 text-sm">
                  No active system announcements
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                  {announcements.map((ann) => (
                    <div
                      key={ann._id}
                      className="ad-announcement-item p-3 rounded-xl flex items-center justify-between border border-white/10 group bg-black/5"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-black/10 rounded-lg overflow-hidden flex-shrink-0">
                          {ann.media.type === "video" ? (
                            <div className="w-full h-full flex items-center justify-center bg-gray-800 text-[10px] text-white font-bold">
                              VIDEO
                            </div>
                          ) : (
                            <img
                              src={ann.media.url}
                              className="w-full h-full object-cover"
                              alt=""
                            />
                          )}
                        </div>
                        <div>
                          <p className="text-xs font-bold">
                            System Moment
                          </p>
                          <p className="text-[10px] opacity-60">
                            {new Date(ann.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <button
                        onClick={() => handleDeleteAnnouncement(ann._id)}
                        className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                        title="Delete Announcement"
                      >
                        <FiTrash2 size={16} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="ad-module">
      <div className="ad-module-header">
        <div>
          <h2 className="ad-module-title">System Settings</h2>
          <p className="ad-module-sub">
            Configure platform-wide rules and behaviors
          </p>
        </div>
        {activeTab !== "announcements" && (
          <button 
            className="ad-btn ad-btn-success flex items-center gap-2"
            onClick={handleSave}
            disabled={isSaving}
          >
            {isSaving ? "Saving..." : <><FiSave /> Save Changes</>}
          </button>
        )}
      </div>

      <div className="ad-settings-layout">
        <div className="ad-settings-sidebar">
          {SETTINGS_TABS.map((t) => (
            <button
              key={t.id}
              className={`ad-settings-tab ${activeTab === t.id ? "active" : ""}`}
              onClick={() => setActiveTab(t.id)}
            >
              <span className="ad-settings-icon">{t.icon}</span>
              {t.label}
            </button>
          ))}
        </div>
        <div className="ad-settings-content">{renderContent()}</div>
      </div>
    </div>
  );
}
