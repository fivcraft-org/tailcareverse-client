import React, { createContext, useContext, useState, useEffect } from "react";
import axios from "../api/axios";

const SettingsContext = createContext();

export const useSettings = () => {
  const context = useContext(SettingsContext);
  if (!context) {
    throw new Error("useSettings must be used within a SettingsProvider");
  }
  return context;
};

export const SettingsProvider = ({ children }) => {
  const [settings, setSettings] = useState({
    general: {
      platformName: "TailCareVerse",
      supportEmail: "support@tailcareverse.pet",
      logoUrl: "",
    },
    verification: {
      requiredDocumentsVets: ["Medical License", "Clinic Registration"],
      enableAiProofChecklist: true,
    },
    marketplace: {
      manualApprovalForListings: false,
      listingExpirationDays: 30,
    },
    vetNetwork: {
      highlightEmergencyServices: true,
    },
    security: {
      adminSessionTimeoutMinutes: 60,
      enforceStrongPasswords: true,
      enableTwoFactorAuth: false,
    },
    notifications: {
      emailAlertsForNewReports: true,
      weeklyPlatformStatisticsReport: false,
    },
  });
  const [loading, setLoading] = useState(true);

  const fetchSettings = async () => {
    try {
      const res = await axios.get("/settings");
      if (res.data.success) {
        setSettings((prev) => ({
          ...prev,
          ...res.data.data,
          general: { ...prev.general, ...res.data.data.general },
          verification: { ...prev.verification, ...res.data.data.verification },
          marketplace: { ...prev.marketplace, ...res.data.data.marketplace },
          vetNetwork: { ...prev.vetNetwork, ...res.data.data.vetNetwork },
          security: { ...prev.security, ...res.data.data.security },
          notifications: { ...prev.notifications, ...res.data.data.notifications },
        }));
      }
    } catch (err) {
      console.error("Failed to fetch platform settings:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  const refreshSettings = () => fetchSettings();

  return (
    <SettingsContext.Provider value={{ settings, loading, refreshSettings }}>
      {children}
    </SettingsContext.Provider>
  );
};
