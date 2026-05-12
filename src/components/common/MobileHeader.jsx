import { FiBell, FiMessageCircle, FiCpu } from "react-icons/fi";
import { Link } from "react-router-dom";
import { useTheme } from "../../context/ThemeContext";
import { useSettings } from "../../context/SettingsContext";

export default function MobileHeader({
  unreadNotifications = 0,
  unreadMessages = 0,
}) {
  const { theme: t } = useTheme();
  const { settings } = useSettings();

  // Split platform name for styling
  const platformName = settings.general.platformName || "TailCareVerse";

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

  return (
    <div
      className="md:hidden fixed top-0 left-0 right-0 z-[60] flex justify-between items-center px-5 py-2"
      style={{
        background:
          t.background === "#0d1117"
            ? "rgba(22, 27, 34, 0.95)"
            : "rgba(255, 255, 255, 0.95)",
        backdropFilter: "blur(12px)",
        WebkitBackdropFilter: "blur(12px)",
        borderBottom: `1px solid ${t.border}`,
        boxShadow: "0 2px 10px rgba(0,0,0,0.05)",
      }}
    >
      <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          {settings.general.logoUrl && (
            <img
              src={settings.general.logoUrl}
              alt="Logo"
              className="h-5 w-auto object-contain"
            />
          )}
          <h1
            style={{
              fontSize: "1.3rem",
              fontWeight: 900,
              letterSpacing: "-0.02em",
              fontFamily: "'Outfit', sans-serif",
              color: t.background === "#0d1117" ? "#ffffff" : "#000000",
              margin: 0,
              lineHeight: 1,
              textTransform: "uppercase",
            }}
          >
            {getStyledName()}
          </h1>
        </div>
        <div
          style={{
            width: "40px",
            height: "2px",
            background: t.background === "#0d1117" ? "#ffffff" : "#000000",
            borderRadius: "4px",
            marginTop: "4px",
          }}
        />
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
        {[
          {
            icon: <FiBell size={22} />,
            badge: unreadNotifications > 0,
            to: "/notifications",
          },
          {
            icon: <FiMessageCircle size={22} />,
            badge: unreadMessages > 0,
            to: "/messages",
          },
          {
            icon: <FiCpu size={22} />,
            to: "/ai-assistant",
          },
        ].map((item, i) => {
          const content = (
            <button
              style={{
                position: "relative",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: t.text,
                background: "none",
                border: "none",
                cursor: "pointer",
                padding: "8px",
                borderRadius: "50%",
                transition: "all 0.2s",
              }}
              className="hover:bg-gray-100 dark:hover:bg-gray-800"
            >
              {item.icon}
              {item.badge && (
                <span
                  style={{
                    position: "absolute",
                    top: "8px",
                    right: "8px",
                    width: "10px",
                    height: "10px",
                    borderRadius: "50%",
                    background: "#ef4444",
                    border: `2px solid ${t.background}`,
                  }}
                />
              )}
            </button>
          );

          if (item.to) {
            return (
              <Link key={i} to={item.to} style={{ textDecoration: "none" }}>
                {content}
              </Link>
            );
          }

          return <div key={i}>{content}</div>;
        })}
      </div>
    </div>
  );
}
