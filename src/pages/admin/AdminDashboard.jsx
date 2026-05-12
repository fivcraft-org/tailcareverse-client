import { Suspense, lazy } from "react";
import React, { useState, useEffect, useRef } from "react";
import { getDashboardStats } from "../../api/api-admin";
import {
  Navigate,
  Routes,
  Route,
  useNavigate,
  useLocation,
} from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import { useSettings } from "../../context/SettingsContext";
import { useTheme } from "../../context/ThemeContext";
import "../../styles/admin-dark.css";
import {
  isAdminRole,
  canAccess,
  ROLE_LABELS,
  USER_ROLES,
} from "../../utils/roles";
import {
  FiLogOut,
  FiExternalLink,
  FiChevronDown,
  FiSun,
  FiMoon
} from "react-icons/fi";

const OverviewModule = lazy(() => import("./OverviewModule"));
const VerificationModule = lazy(() => import("./VerificationModule"));
const VerificationDetail = lazy(() => import("./VerificationDetail"));
const MarketplaceModule = lazy(() => import("./MarketplaceModule"));
const ContentModule = lazy(() => import("./ContentModule"));
const VetNetworkModule = lazy(() => import("./VetNetworkModule"));
const AnalyticsModule = lazy(() => import("./AnalyticsModule"));
const AdminManagementModule = lazy(() => import("./AdminManagementModule"));
const UsersModule = lazy(() => import("./UsersModule"));
const ProfileEditRequestsModule = lazy(() => import("./ProfileEditRequestsModule"));
const SettingsModule = lazy(() => import("./SettingsModule"));

import LogoutConfirmModal from "../../components/common/LogoutConfirmModal";
/* ── Nav items config ───────────────────────────────────────────────────────── */
const NAV_ITEMS = [
  {
    id: "overview",
    label: "Overview",
    icon: "",
    module: OverviewModule,
    path: "",
  },
  {
    id: "verification",
    label: "Verifications",
    icon: "",
    module: VerificationModule,
    path: "verification",
  },
  {
    id: "edit-requests",
    label: "Edit Requests",
    icon: "",
    module: ProfileEditRequestsModule,
    path: "edit-requests",
  },
  {
    id: "marketplace",
    label: "Marketplace",
    icon: "",
    module: MarketplaceModule,
    path: "marketplace",
  },
  {
    id: "content",
    label: "Content",
    icon: "",
    module: ContentModule,
    path: "content",
  },
  {
    id: "vet-network",
    label: "Vet Network",
    icon: "",
    module: VetNetworkModule,
    path: "vet-network",
  },
  {
    id: "analytics",
    label: "Analytics",
    icon: "",
    module: AnalyticsModule,
    path: "analytics",
  },
  {
    id: "admin-management",
    label: "Admin Mgmt",
    icon: "",
    module: AdminManagementModule,
    path: "admin-management",
  },
  {
    id: "users",
    label: "Users",
    icon: "",
    module: UsersModule,
    path: "users",
  },
  {
    id: "settings",
    label: "Settings",
    icon: "",
    module: SettingsModule,
    path: "settings",
  },
];

/* ── Role badge colours ─────────────────────────────────────────────────────── */
const ROLE_COLORS = {
  [USER_ROLES.SUPER_ADMIN]: "#36b38f",
  [USER_ROLES.VERIFICATION_ADMIN]: "#0d9488",
  [USER_ROLES.CONTENT_MODERATOR]: "#ea580c",
  [USER_ROLES.MARKETPLACE_ADMIN]: "#0891b2",
  [USER_ROLES.VET_NETWORK_ADMIN]: "#059669",
  [USER_ROLES.ANALYTICS]: "#4f46e5",
};

export default function AdminDashboard() {
  const { user, logout } = useAuth();
  const { settings } = useSettings();
  const { isDarkMode, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [counts, setCounts] = useState({ pendingEditRequests: 0 });
  const dropdownRef = useRef(null);

  useEffect(() => {
    let mounted = true;

    const fetchCounts = async () => {
      try {
        const res = await getDashboardStats();
        if (mounted && res?.data) {
          setCounts({
            pendingEditRequests: res.data.pendingEditRequests || 0,
          });
        }
      } catch (err) {
        console.error("Dashboard count fetch error:", err);
      }
    };

    fetchCounts();

    // Click outside handler for dropdown
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      mounted = false;
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  if (!user || !isAdminRole(user.role)) {
    return <Navigate to="/" replace />;
  }

  const role = user.role;
  const roleColor = ROLE_COLORS[role] ?? "#36b38f";
  const visibleNav = NAV_ITEMS.filter((n) => canAccess(role, n.id));

  // Determine active ID from path
  const currentPath = location.pathname.split("/admin/")[1] || "";
  const activeNav =
    visibleNav.find((n) => n.path === currentPath) || visibleNav[0];
  const activeId = activeNav?.id;

  const initials =
    [user?.profile?.firstName?.[0], user?.profile?.lastName?.[0]]
      .filter(Boolean)
      .join("")
      .toUpperCase() || "SA";

  return (
    <div className="ad-shell">
      {sidebarOpen && (
        <div className="ad-overlay" onClick={() => setSidebarOpen(false)} />
      )}

      <aside className={`ad-sidebar ${sidebarOpen ? "ad-sidebar-open" : ""}`}>
        <div className="ad-sidebar-logo">
          {settings.general.logoUrl ? (
            <img
              src={settings.general.logoUrl}
              alt="Logo"
              className="w-8 h-8 object-contain"
            />
          ) : (
            <span className="ad-logo-icon">🐾</span>
          )}
          <span className="ad-logo-text">{settings.general.platformName || "TailCareVerse"}</span>
        </div>


        <nav className="ad-nav">
          <div className="ad-nav-label">MODULES</div>
          {visibleNav.map((item) => (
            <button
              key={item.id}
              className={`ad-nav-item ${activeId === item.id ? "ad-nav-active" : ""}`}
              style={activeId === item.id ? { "--nav-color": roleColor } : {}}
              onClick={() => {
                navigate(`/admin/${item.path}`);
                setSidebarOpen(false);
              }}
            >
              <span className="ad-nav-icon">{item.icon}</span>
              <span className="ad-nav-label-text">{item.label}</span>
              {item.id === "edit-requests" &&
                counts.pendingEditRequests > 0 && (
                  <span className="ml-auto bg-amber-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full min-w-[20px] text-center">
                    {counts.pendingEditRequests}
                  </span>
                )}
              {activeId === item.id && (
                <span
                  className="ad-nav-pip"
                  style={{ background: roleColor }}
                />
              )}
            </button>
          ))}
        </nav>

        <div className="ad-sidebar-footer">
          <a href="/" className="ad-footer-btn">
            <FiExternalLink />
            <span>Back to App</span>
          </a>
        </div>
      </aside>

      <div className="ad-main">
        <header className="ad-topbar">
          <button
            className="ad-hamburger"
            onClick={() => setSidebarOpen(!sidebarOpen)}
          >
            ☰
          </button>
          <div className="ad-topbar-title">{activeNav?.label}</div>
          <div className="ad-topbar-right">
            <button
              onClick={toggleTheme}
              className="p-2 rounded-full opacity-60 hover:opacity-100 hover:bg-gray-100 dark:hover:bg-white/5 transition-all"
              title="Toggle Theme"
            >
              {isDarkMode ? <FiSun size={20} /> : <FiMoon size={20} />}
            </button>
            <div
              className="ad-topbar-role"
              style={{ background: roleColor + "22", color: roleColor }}
            >
              {user?.profile?.firstName} {user?.profile?.lastName}
            </div>

            <div className="ad-profile-dropdown-container" ref={dropdownRef}>
              <button
                className="ad-topbar-profile-trigger"
                onClick={() => setDropdownOpen(!dropdownOpen)}
              >
                <div className="ad-topbar-avatar" style={{ background: roleColor }}>
                  {initials}
                </div>
                <FiChevronDown className={`ad-trigger-chevron ${dropdownOpen ? 'open' : ''}`} />
              </button>

              {dropdownOpen && (
                <div className="ad-profile-dropdown">
                  <div className="ad-dropdown-header">
                    <div className="ad-dropdown-name">
                      {user?.profile?.firstName} {user?.profile?.lastName}
                    </div>
                    <div className="ad-dropdown-email">{user?.email}</div>
                  </div>
                  <div className="ad-dropdown-divider" />
                  <button
                    className="ad-dropdown-item logout"
                    onClick={() => {
                      setDropdownOpen(false);
                      setShowLogoutModal(true);
                    }}
                  >
                    <FiLogOut />
                    <span>Logout</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

        <div className="ad-content">
          <Suspense fallback={<div className="ad-loading">Loading module...</div>}>
            <Routes>
              <Route index element={<OverviewModule />} />
              <Route path="verification" element={<VerificationModule />} />
              <Route
                path="verification/:type/:id"
                element={<VerificationDetail />}
              />
              <Route path="marketplace" element={<MarketplaceModule />} />
              <Route path="content" element={<ContentModule />} />
              <Route path="vet-network" element={<VetNetworkModule />} />
              <Route path="analytics" element={<AnalyticsModule />} />
              <Route
                path="admin-management"
                element={<AdminManagementModule />}
              />
              <Route path="users" element={<UsersModule />} />
              <Route
                path="edit-requests"
                element={<ProfileEditRequestsModule />}
              />
              <Route path="settings" element={<SettingsModule />} />
            </Routes>
          </Suspense>
        </div>
      </div>

      <LogoutConfirmModal
        isOpen={showLogoutModal}
        onClose={() => setShowLogoutModal(false)}
        onConfirm={logout}
      />
    </div>
  );
}
