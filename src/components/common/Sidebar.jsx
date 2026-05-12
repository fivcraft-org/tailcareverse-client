import {
  FiHome,
  FiSearch,
  FiUser,
  FiSettings,
  FiMessageCircle,
  FiBell,
  FiCpu,
} from "react-icons/fi";
import { MdPets } from "react-icons/md";
import { NavLink } from "react-router-dom";
import { useTheme } from "../../context/ThemeContext";
import { useState, useEffect } from "react";
import CreateChoiceModal from "./CreateChoiceModal";
import { useSocket } from "../../context/SocketContext";
import { getNotifications } from "../../api/api-notification";

import { useSettings } from "../../context/SettingsContext";

export default function Sidebar({
  unreadNotifications = 0,
  unreadMessages = 0,
}) {
  const { theme: t, themeConfig: config } = useTheme();
  const { settings } = useSettings();
  const [showCreateModal, setShowCreateModal] = useState(false);

  // Split platform name for styling
  const platformName = settings.general.platformName || "TailCareVerse";
  const midPoint = Math.ceil(platformName.length / 2);
  const part1 = platformName.substring(0, 8); // For TailCareVerse specifically or generic split
  const part2 = platformName.substring(8);

  const getStyledName = () => {
    if (platformName.toLowerCase() === "tailcareverse") {
      return (
        <>
          {platformName.slice(0, 8)}
          <span style={{ color: t.background === "#0d1117" ? "rgba(255,255,255,0.4)" : "#71767b" }}>
            {platformName.slice(8)}
          </span>
        </>
      );
    }
    // For other names, split approximately in half
    const mid = Math.ceil(platformName.length / 2);
    return (
      <>
        {platformName.slice(0, mid)}
        <span style={{ color: t.background === "#0d1117" ? "rgba(255,255,255,0.4)" : "#71767b" }}>
          {platformName.slice(mid)}
        </span>
      </>
    );
  };

  const menu = [
    { to: "/home", icon: <FiHome />, label: "Home" },
    { to: "/explore", icon: <FiSearch />, label: "Explore" },
    { to: "/marketplace", icon: <MdPets />, label: "Market" },
    { to: "/messages", icon: <FiMessageCircle />, label: "Messages" },
    { to: "/notifications", icon: <FiBell />, label: "Notifications" },
    { to: "/profile", icon: <FiUser />, label: "Profile" },
    { to: "/ai-assistant", icon: <FiCpu />, label: "AI Tips" },
  ];

  return (
    <aside
      className="hidden md:flex flex-col w-64 p-6 fixed left-0 top-0 h-screen"
      style={{
        background: t.sidebar,
        borderRight: `1px solid ${t.border}`,
        boxShadow: "4px 0 30px rgba(0,0,0,0.5)",
        zIndex: 40,
      }}
    >
      {/* Logo */}
      <div className="mb-10 group">
        <div className="flex items-center gap-2 mb-2">
          {settings.general.logoUrl && (
            <img
              src={settings.general.logoUrl}
              alt="Logo"
              className="h-6 w-auto object-contain"
            />
          )}
          <h1
            style={{
              fontSize: "1.4rem",
              fontWeight: 900,
              letterSpacing: "-0.02em",
              fontFamily: "'Outfit', sans-serif",
              color: t.background === "#0d1117" ? "#ffffff" : "#000000",
              lineHeight: 1,
              textTransform: "uppercase",
              display: "flex",
              alignItems: "baseline",
            }}
          >
            {getStyledName()}
          </h1>
        </div>
        <div
          style={{
            width: "50px",
            height: "2px",
            background: t.background === "#0d1117" ? "#ffffff" : "#000000",
            borderRadius: "4px",
          }}
        />
      </div>

      {/* Navigation */}
      <nav className="flex flex-col gap-2">
        {menu.map((item, i) => (
          <NavLink
            key={i}
            to={item.to}
            end={item.to === "/home" || item.to === "/profile"}
            className="no-underline"
            style={({ isActive }) => ({
              display: "flex",
              alignItems: "center",
              gap: "14px",
              padding: "12px 16px",
              borderRadius: "12px",
              transition: config.transitions.default,
              background: isActive
                ? "rgba(255, 255, 255, 0.05)"
                : "transparent",
              border: isActive
                ? `1px solid ${t.border}`
                : "1px solid transparent",
              color: isActive ? t.activeLink : t.textDimmed,
              fontWeight: isActive ? 700 : 500,
              fontSize: "0.9rem",
              letterSpacing: "0.02em",
            })}
          >
            <div
              style={{
                fontSize: "1.2rem",
                display: "flex",
                alignItems: "center",
                opacity: 0.9,
                position: "relative",
              }}
            >
              {item.icon}
              {item.label === "Notifications" && unreadNotifications > 0 && (
                <div
                  style={{
                    position: "absolute",
                    top: "-6px",
                    right: "-8px",
                    background: "#ef4444",
                    color: "#fff",
                    fontSize: "9px",
                    fontWeight: 900,
                    minWidth: "16px",
                    height: "16px",
                    borderRadius: "10px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    padding: "0 4px",
                    border: `2px solid ${t.sidebar}`,
                    zIndex: 10,
                  }}
                >
                  {unreadNotifications > 9 ? "9+" : unreadNotifications}
                </div>
              )}
              {item.label === "Messages" && unreadMessages > 0 && (
                <div
                  style={{
                    position: "absolute",
                    top: "-6px",
                    right: "-8px",
                    background: "#ef4444",
                    color: "#fff",
                    fontSize: "9px",
                    fontWeight: 900,
                    minWidth: "16px",
                    height: "16px",
                    borderRadius: "10px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    padding: "0 4px",
                    border: `2px solid ${t.sidebar}`,
                    zIndex: 10,
                  }}
                >
                  {unreadMessages > 9 ? "9+" : unreadMessages}
                </div>
              )}
            </div>
            <span>{item.label}</span>
          </NavLink>
        ))}
      </nav>

      {/* Create Post Button */}
      <button
        onClick={() => setShowCreateModal(true)}
        style={{
          marginTop: "32px",
          display: "block",
          textAlign: "center",
          padding: "14px",
          borderRadius: "12px",
          fontWeight: 800,
          fontSize: "0.85rem",
          letterSpacing: "0.1em",
          textTransform: "uppercase",
          color: t.buttonText,
          background: t.buttonBg,
          boxShadow: config.shadows.md,
          transition: config.transitions.default,
          border: "none",
          cursor: "pointer",
          width: "100%",
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = "scale(1.02)";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = "scale(1)";
        }}
      >
        Create Post
      </button>

      {/* Bottom Settings */}
      <div className="mt-auto">
        <NavLink
          to="/settings"
          className="no-underline"
          style={({ isActive }) => ({
            display: "flex",
            alignItems: "center",
            gap: "14px",
            padding: "12px 16px",
            borderRadius: "12px",
            transition: config.transitions.default,
            color: isActive ? t.activeLink : t.textDimmed,
            background: isActive ? "rgba(255,255,255,0.05)" : "transparent",
            fontSize: "0.9rem",
            fontWeight: isActive ? 700 : 500,
          })}
        >
          <FiSettings style={{ fontSize: "1.2rem" }} />
          <span>Settings</span>
        </NavLink>
      </div>
      <CreateChoiceModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
      />
    </aside>
  );
}
