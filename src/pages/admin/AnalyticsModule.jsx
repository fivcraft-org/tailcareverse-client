import React, { useState, useEffect } from "react";
import * as adminApi from "../../api/api-admin";
import { notifyError } from "../../utils/services/toast/toast-service";

/* ── Tiny SVG sparkline ─────────────────────────────────────────────────────── */
const Sparkline = ({ data, color }) => {
  if (!data || data.length < 2) return null;
  const vals = data.map((d) => d.count);
  const max = Math.max(...vals);
  const min = Math.min(...vals);
  const range = max - min || 1;
  const w = 200,
    h = 60,
    pad = 4;
  const pts = vals.map((v, i) => {
    const x = pad + (i / (vals.length - 1)) * (w - pad * 2);
    const y = h - pad - ((v - min) / range) * (h - pad * 2);
    return `${x},${y}`;
  });
  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="ad-sparkline">
      <polyline
        points={pts.join(" ")}
        fill="none"
        stroke={color}
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <polyline
        points={`${pts[0]} ${pts.join(" ")} ${pts[pts.length - 1].split(",")[0]},${h} ${pts[0].split(",")[0]},${h}`}
        fill={color + "22"}
        stroke="none"
      />
    </svg>
  );
};

/* ── Bar chart ──────────────────────────────────────────────────────────────── */
const BarChart = ({ data, color }) => {
  if (!data || data.length === 0) return null;
  const vals = data.map((d) => d.count);
  const labels = data.map((d) => {
    // Show only part of the date for readability
    return d.date.split("-").pop();
  });
  const max = Math.max(...vals) || 1;
  return (
    <div className="ad-bar-chart">
      {vals.map((v, i) => (
        <div key={i} className="ad-bar-col">
          <div className="ad-bar-wrap">
            <div
              className="ad-bar"
              style={{ height: `${(v / max) * 100}%`, background: color }}
            />
          </div>
          <span className="ad-bar-label">{labels[i]}</span>
        </div>
      ))}
    </div>
  );
};

/* ── Metric card ────────────────────────────────────────────────────────────── */
const MetricCard = ({ title, value, color, data, icon }) => (
  <div className="ad-metric-card">
    <div className="ad-metric-header">
      <div style={{ flex: 1 }}>
        <div className="ad-metric-title">
          {icon} {title}
        </div>
        <div className="ad-metric-value" style={{ color }}>
          {value}
        </div>
      </div>
    </div>
    <Sparkline data={data} color={color} />
  </div>
);

/* ── RANGES ─────────────────────────────────────────────────────────────────── */
const RANGE_MAP = {
  "7 Days": "7d",
  "30 Days": "30d",
  "90 Days": "90d",
  "1 Year": "1y",
};

export default function AnalyticsModule() {
  const [rangeLabel, setRangeLabel] = useState("30 Days");
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState(null);

  useEffect(() => {
    fetchAnalytics();
  }, [rangeLabel]);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      const res = await adminApi.getAnalytics({ range: RANGE_MAP[rangeLabel] });
      if (res.data.success) {
        setData(res.data.data);
      }
    } catch (error) {
      console.error("Analytics fetch error:", error);
      notifyError("Failed to load analytics data");
    } finally {
      setLoading(false);
    }
  };

  if (loading && !data) {
    return (
      <div className="ad-module loading">
        <div className="ad-loading-spinner-container">
          <div className="ad-loading-spinner"></div>
          <p>Fetching real-time data...</p>
        </div>
      </div>
    );
  }

  const metrics = [
    {
      title: "New Registrations",
      value: data.series.userGrowth.reduce((acc, curr) => acc + curr.count, 0).toLocaleString(),
      color: "#36b38f",
      data: data.series.userGrowth,
      icon: "👤",
    },
    {
      title: "Vet Registrations",
      value: data.series.vetGrowth.reduce((acc, curr) => acc + curr.count, 0).toLocaleString(),
      color: "#0d9488",
      data: data.series.vetGrowth,
      icon: "🩺",
    },
    {
      title: "Active Users",
      value: data.activeUsers.toLocaleString(),
      color: "#0ea5e9",
      data: data.series.userGrowth, // Trend from user growth
      icon: "🟢",
    },
    {
      title: "Inactive Users",
      value: data.inactiveUsers.toLocaleString(),
      color: "#f43f5e",
      data: data.series.userGrowth.map(d => ({ ...d, count: Math.floor(d.count * 0.1) })),
      icon: "🔴",
    },
  ];

  return (
    <div className="ad-module">
      <div className="ad-module-header">
        <div>
          <h2 className="ad-module-title">Analytics</h2>
          <p className="ad-module-sub">
            Real-time platform activity and growth metrics
          </p>
        </div>
        <div className="ad-range-tabs">
          {Object.keys(RANGE_MAP).map((r) => (
            <button
              key={r}
              className={`ad-range-btn ${rangeLabel === r ? "active" : ""}`}
              onClick={() => setRangeLabel(r)}
            >
              {r}
            </button>
          ))}
        </div>
      </div>

      {loading && <div className="ad-refreshing-indicator">Refreshing...</div>}

      {/* Metric Cards */}
      <div className="ad-metrics-grid">
        {metrics.map((m) => (
          <MetricCard key={m.title} {...m} />
        ))}
      </div>

      {/* Bar Charts */}
      <div className="ad-charts-row">
        <div className="ad-chart-card">
          <h3 className="ad-chart-title">👤 New Users (Daily)</h3>
          <BarChart
            data={data.series.userGrowth.slice(-14)}
            color="#36b38f"
          />
        </div>
        <div className="ad-chart-card">
          <h3 className="ad-chart-title">🩺 Vet Registrations</h3>
          <BarChart
            data={data.series.vetGrowth.slice(-14)}
            color="#0d9488"
          />
        </div>
      </div>
      <div className="ad-charts-row">
        <div className="ad-chart-card">
          <h3 className="ad-chart-title">🐾 Animal Registrations</h3>
          <BarChart
            data={data.series.animalGrowth.slice(-14)}
            color="#f59e0b"
          />
        </div>
        <div className="ad-chart-card">
          <h3 className="ad-chart-title">📈 User Summary</h3>
          <div className="ad-pie-placeholder">
             <div className="ad-stat-item">
                <span>Active:</span>
                <b style={{ color: "#0ea5e9" }}>{data.activeUsers}</b>
             </div>
             <div className="ad-stat-item">
                <span>Inactive:</span>
                <b style={{ color: "#f43f5e" }}>{data.inactiveUsers}</b>
             </div>
             <div className="ad-stat-item">
                <span>Total Vets:</span>
                <b style={{ color: "#0d9488" }}>{data.vetsCount}</b>
             </div>
             <div className="ad-stat-item">
                <span>Total Users:</span>
                <b>{data.totalUsers}</b>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
}
