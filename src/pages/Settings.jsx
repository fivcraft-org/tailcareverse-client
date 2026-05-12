import React, { useContext } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";
import {
  FiChevronLeft,
  FiLogOut,
  FiUser,
  FiLock,
  FiBell,
  FiShield,
  FiHelpCircle,
  FiChevronRight,
  FiMoon,
  FiSun,
} from "react-icons/fi";
import LogoutConfirmModal from "../components/common/LogoutConfirmModal";
import { useSettings } from "../context/SettingsContext";

export default function Settings() {
  const { logout, user } = useContext(AuthContext);
  const { isDarkMode, toggleTheme, theme: t } = useTheme();
  const { settings } = useSettings();
  const navigate = useNavigate();
  const [showLogoutModal, setShowLogoutModal] = React.useState(false);

  const handleLogoutClick = () => {
    setShowLogoutModal(true);
  };

  const handleConfirmLogout = () => {
    logout();
    navigate("/login");
  };

  const SettingItem = ({
    icon: Icon,
    title,
    subtitle,
    onClick,
    variant = "default",
    rightElement,
  }) => (
    <button
      onClick={onClick}
      className="w-full flex items-center justify-between p-4 transition-all active:scale-[0.98]"
      style={{
        background: t.surface,
        borderBottom: `1px solid ${t.border}`,
      }}
    >
      <div className="flex items-center gap-4">
        <div
          className="w-10 h-10 md:w-12 md:h-12 rounded-2xl flex items-center justify-center"
          style={{
            background:
              variant === "danger"
                ? "rgba(239, 68, 68, 0.1)"
                : "rgba(255, 255, 255, 0.05)",
            color: variant === "danger" ? "#ef4444" : t.text,
            border: `1px solid ${t.border}`,
          }}
        >
          <Icon size={20} />
        </div>
        <div className="text-left">
          <h3
            className="font-bold text-sm md:text-base"
            style={{ color: variant === "danger" ? "#ef4444" : t.text }}
          >
            {title}
          </h3>
          {subtitle && (
            <p className="text-xs font-medium" style={{ color: t.textDimmed }}>
              {subtitle}
            </p>
          )}
        </div>
      </div>
      {rightElement ? (
        rightElement
      ) : (
        <FiChevronRight size={20} style={{ color: t.textDimmed }} />
      )}
    </button>
  );

  return (
    <div
      className="min-h-screen pb-24 transition-colors duration-500"
      style={{ background: t.background }}
    >
      {/* Header */}
      <div
        className="sticky top-0 z-30 backdrop-blur-md border-b"
        style={{ background: `${t.background}CC`, borderColor: t.border }}
      >
        <div className="max-w-2xl mx-auto px-4 py-4 flex items-center gap-4">
          <button
            onClick={() => navigate(-1)}
            className="p-2 rounded-xl transition-colors"
            style={{ color: t.text }}
          >
            <FiChevronLeft size={24} />
          </button>
          <h1
            className="font-bold text-xl tracking-tight"
            style={{ color: t.text }}
          >
            Settings
          </h1>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 mt-8 space-y-6">
        {/* Profile Card */}
        <div
          className="rounded-[2rem] p-6 shadow-sm border flex items-center gap-4"
          style={{ background: t.surface, border: `1px solid ${t.border}` }}
        >
          <div
            className="w-14 h-14 md:w-16 md:h-16 rounded-full overflow-hidden border-2 p-1"
            style={{ borderColor: t.accent }}
          >
            <img
              src={
                user?.profile?.avatar?.url || "https://via.placeholder.com/150"
              }
              alt="avatar"
              className="w-full h-full object-cover rounded-full"
            />
          </div>
          <div>
            <h2 className="font-bold text-lg" style={{ color: t.text }}>
              {user?.profile?.firstName || "User"}{" "}
              {user?.profile?.lastName || ""}
            </h2>
            <p className="text-sm" style={{ color: t.textDimmed }}>
              @{user?.username || "username"}
            </p>
          </div>
          <button
            onClick={() => navigate("/edit-profile")}
            className="ml-auto px-5 py-2 rounded-xl font-bold text-xs md:text-sm transition-all hover:scale-105"
            style={{ background: t.accent, color: "#fff" }}
          >
            Edit
          </button>
        </div>


        <div className="space-y-3">
          <h2
            className="font-bold text-[10px] tracking-[0.2em] ml-4"
            style={{ color: t.textDimmed }}
          >
            Appearance
          </h2>
          <div
            className="rounded-[2rem] overflow-hidden shadow-sm border"
            style={{ background: t.surface, border: `1px solid ${t.border}` }}
          >
            <SettingItem
              icon={isDarkMode ? FiMoon : FiSun}
              title="Switch appearance"
              onClick={toggleTheme}
              rightElement={
                <div
                  className="w-12 h-6 rounded-full relative transition-all duration-300 pointer-events-none"
                  style={{ background: isDarkMode ? t.accent : "#d1d5db" }}
                >
                  <div
                    className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all duration-300 ${isDarkMode ? "left-7" : "left-1"}`}
                  />
                </div>
              }
            />
          </div>
        </div>

        {/* Account Section */}
        <div className="space-y-3">
          <h2
            className="font-bold text-[10px] tracking-[0.2em] ml-4"
            style={{ color: t.textDimmed }}
          >
            Account
          </h2>
          <div
            className="rounded-[2rem] overflow-hidden shadow-sm border divide-y"
            style={{
              background: t.surface,
              border: `1px solid ${t.border}`,
              borderColor: t.border,
            }}
          >
            <SettingItem
              icon={FiUser}
              title="Personal Information"
              subtitle="Update your name, bio, and location"
              onClick={() => navigate("/edit-profile")}
            />
            <SettingItem
              icon={FiLock}
              title="Password & Security"
              subtitle="Change password and secure your account"
              onClick={() => { }}
            />
            <SettingItem
              icon={FiBell}
              title="Notifications"
              subtitle="Manage your alerts and preferences"
              onClick={() => { }}
            />
          </div>
        </div>

        {/* Support Section */}
        <div className="space-y-3">
          <h2
            className="font-bold text-[10px] tracking-[0.2em] ml-4"
            style={{ color: t.textDimmed }}
          >
            Support & Info
          </h2>
          <div
            className="rounded-[2rem] overflow-hidden shadow-sm border divide-y"
            style={{
              background: t.surface,
              border: `1px solid ${t.border}`,
              borderColor: t.border,
            }}
          >
            <SettingItem
              icon={FiShield}
              title="Privacy Policy"
              onClick={() => { }}
            />
            <SettingItem
              icon={FiHelpCircle}
              title="Help Center"
              onClick={() => { }}
            />
          </div>
        </div>

        {/* Logout Section */}
        <div className="pt-4">
          <div
            className="rounded-[2rem] overflow-hidden shadow-sm border"
            style={{ background: t.surface, border: `1px solid ${t.border}` }}
          >
            <SettingItem
              icon={FiLogOut}
              title="Logout"
              subtitle="Sign out of your account"
              variant="danger"
              onClick={handleLogoutClick}
            />
          </div>
          <p
            className="text-center text-[10px] font-bold tracking-widest mt-8"
            style={{ color: t.textDimmed }}
          >
            {settings.general.platformName || "TailCareVerse"} v1.0.0
          </p>
        </div>
      </div>

      <LogoutConfirmModal
        isOpen={showLogoutModal}
        onClose={() => setShowLogoutModal(false)}
        onConfirm={handleConfirmLogout}
      />
    </div>
  );
}
