import React, { useEffect, useState } from "react";
import {
  Users,
  Dog,
  ShoppingBag,
  Flag,
  ShieldAlert,
  UserPlus,
  Edit3,
} from "lucide-react";
import { getDashboardStats } from "../../api/api-admin";
import { useAuth } from "../../hooks/useAuth";
import { ROLE_LABELS } from "../../utils/roles";
import { useSettings } from "../../context/SettingsContext";

const StatCard = ({ icon, label, value, color, trend }) => (
  <div className="ad-stat-card" style={{ "--accent": color }}>
    <div className="ad-stat-icon" style={{ background: color + "22", color }}>
      {icon}
    </div>
    <div className="ad-stat-body">
      <span className="ad-stat-label">{label}</span>
      <span className="ad-stat-value">{value ?? "—"}</span>
      {trend && <span className="ad-stat-trend">{trend}</span>}
    </div>
  </div>
);

const ActivityRow = ({ type, message, time }) => (
  <div className="ad-activity-row">
    <div className={`ad-activity-dot ad-dot-${type}`} />
    <div className="ad-activity-text">
      <span>{message}</span>
      <span className="ad-activity-time">{time}</span>
    </div>
  </div>
);

export default function OverviewModule() {
  const { user } = useAuth();
  const { settings } = useSettings();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getDashboardStats()
      .then((res) => setStats(res.data?.data ?? res.data))
      .catch(() => setStats(null))
      .finally(() => setLoading(false));
  }, []);

  const cards = [
    {
      icon: <Users size={20} />,
      label: "Total Users",
      value: stats?.totalUsers?.toLocaleString() ?? "—",
      color: "#36b38f", // Emerald
      trend: "+12% this month",
    },
    {
      icon: <Dog size={20} />,
      label: "Total Animals",
      value: stats?.totalAnimals?.toLocaleString() ?? "—",
      color: "#0d9488", // Teal
      trend: "+8% this month",
    },
    {
      icon: <ShoppingBag size={20} />,
      label: "Active Listings",
      value: stats?.activeListings?.toLocaleString() ?? "—",
      color: "#059669", // Dark Emerald
      trend: "+5% this week",
    },
    {
      icon: <Flag size={20} />,
      label: "Open Reports",
      value: stats?.openReports?.toLocaleString() ?? "—",
      color: "#ea580c", // Orange-Red (urgent)
      trend: "Needs attention",
    },
    {
      icon: <ShieldAlert size={20} />,
      label: "Verifications",
      value: stats?.pendingVerifications?.toLocaleString() ?? "—",
      color: "#0ea5e9", // Sky Blue
      trend: "In queue",
    },
    {
      icon: <Edit3 size={20} />,
      label: "Edit Requests",
      value: stats?.pendingEditRequests?.toLocaleString() ?? "—",
      color: "#8b5cf6", // Purple
      trend: "Profile Updates",
    },
    {
      icon: <UserPlus size={20} />,
      label: "Today's Signups",
      value: stats?.todaySignups?.toLocaleString() ?? "—",
      color: "#0891b2", // Cyan
      trend: "Last 24h",
    },
  ];

  return (
    <div className="ad-module">
      {/* Welcome Banner */}
      <div className="ad-welcome-banner">
        <div>
          <h2 className="ad-welcome-title">
            Welcome back, {user?.profile?.firstName || "Admin"}
          </h2>
          <p className="ad-welcome-sub">
            {ROLE_LABELS[user?.role]} · Here's what's happening on {settings.general.platformName || "TailCareVerse"}
            today
          </p>
        </div>
        <div className="ad-welcome-badge">
          {new Date().toLocaleDateString("en-IN", {
            weekday: "long",
            day: "numeric",
            month: "long",
          })}
        </div>
      </div>

      {/* Stats Grid */}
      {loading ? (
        <div className="ad-loading-grid">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="ad-skeleton-card" />
          ))}
        </div>
      ) : (
        <div className="ad-stats-grid">
          {cards.map((c) => (
            <StatCard key={c.label} {...c} />
          ))}
        </div>
      )}

      {/* Recent Activity */}
      <div className="ad-section-card">
        <h3 className="ad-section-title">⚡ Recent Activity</h3>
        <div className="ad-activity-list">
          <ActivityRow
            type="report"
            message="New abuse report on post #4821"
            time="2 min ago"
          />
          <ActivityRow
            type="verify"
            message="Vet Dr. Priya Sharma submitted license"
            time="15 min ago"
          />
          <ActivityRow
            type="user"
            message="New user registered: @petlover_raj"
            time="32 min ago"
          />
          <ActivityRow
            type="listing"
            message="Listing #1092 flagged as potential scam"
            time="1h ago"
          />
          <ActivityRow
            type="verify"
            message="Breeder KennelKing approved"
            time="2h ago"
          />
          <ActivityRow
            type="report"
            message="Comment reported for harassment"
            time="3h ago"
          />
        </div>
      </div>
    </div>
  );
}
