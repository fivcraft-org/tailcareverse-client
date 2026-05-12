import Sidebar from "../common/Sidebar";
import MobileHeader from "../common/MobileHeader";
import RightSidebar from "../common/RightSidebar";
import { Outlet, NavLink, useLocation } from "react-router-dom";
import { FiHome, FiSearch, FiPlusSquare, FiUser, FiBell } from "react-icons/fi";
import { MdPets } from "react-icons/md";
import { useTheme } from "../../context/ThemeContext";
import { useState, useEffect } from "react";
import CreateChoiceModal from "../common/CreateChoiceModal";
import { useSocket } from "../../context/SocketContext";
import { getNotifications } from "../../api/api-notification";
import { getUnreadMessageCount } from "../../api/api-chat";

export default function AppLayout() {
  const { theme: t, themeConfig: config } = useTheme();
  const location = useLocation();
  const isMessagesPage = location.pathname === "/messages";
  const isProfilePage = location.pathname.startsWith("/profile");
  const isMarketplacePage = location.pathname.startsWith("/marketplace");
  const isDetailPage = location.pathname.includes("/marketplace/item/");
  const isAIAssistantPage = location.pathname === "/ai-assistant";
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [unreadMessages, setUnreadMessages] = useState(0);
  const { socket } = useSocket();

  useEffect(() => {
    const fetchCounts = async () => {
      try {
        const [notiRes, msgRes] = await Promise.all([
          getNotifications(),
          getUnreadMessageCount(),
        ]);
        const unreadNotis = notiRes.notifications.filter(
          (n) => !n.isRead && n.type !== "message",
        ).length;
        setUnreadCount(unreadNotis);
        setUnreadMessages(msgRes.data.count);
      } catch (err) {
        console.error("Error fetching counts:", err);
      }
    };

    fetchCounts();
  }, [location.pathname, location.search]);

  useEffect(() => {
    if (socket) {
      socket.on("notification received", (noti) => {
        if (noti.type !== "message") {
          setUnreadCount((prev) => prev + 1);
        }
      });
      socket.on("message received", () => {
        setUnreadMessages((prev) => prev + 1);
      });
    }
    return () => {
      if (socket) {
        socket.off("notification received");
        socket.off("message received");
      }
    };
  }, [socket]);

  return (
    <div
      className="flex min-h-screen transition-colors duration-500 overflow-x-hidden"
      style={{
        background: t.background,
        color: t.text,
        fontFamily: "'DM Sans', 'Segoe UI', sans-serif",
      }}
    >
      {/* Subtle Grayscale Glow */}
      <div
        aria-hidden="true"
        style={{
          position: "fixed",
          top: "-10%",
          left: "10%",
          width: "600px",
          height: "600px",
          background:
            "radial-gradient(circle, rgba(255,255,255,0.03) 0%, transparent 70%)",
          pointerEvents: "none",
          zIndex: 0,
        }}
      />

      {/* Desktop Sidebar */}
      <Sidebar
        unreadNotifications={unreadCount}
        unreadMessages={unreadMessages}
      />

      {/* Center Content */}
      <main
        className={`flex-1 md:ml-64 relative z-10 flex justify-center ${
          isMessagesPage || isAIAssistantPage
            ? "h-screen overflow-hidden"
            : "min-w-0 overflow-x-hidden"
        }`}
      >
        <div
          className={`w-full flex flex-col ${
            isMessagesPage || isAIAssistantPage
              ? "max-w-none"
              : isMarketplacePage
                ? "max-w-full md:max-w-4xl lg:max-w-5xl md:mx-auto"
                : isProfilePage
                  ? "max-w-full"
                  : "max-w-2xl"
          }`}
        >
          {!isMessagesPage && !isAIAssistantPage && (
            <MobileHeader
              unreadNotifications={unreadCount}
              unreadMessages={unreadMessages}
            />
          )}

          <div
            className={`${
              isMessagesPage || isAIAssistantPage
                ? "h-full"
                : isMarketplacePage
                  ? `pt-16 md:pt-0 pb-44`
                  : isProfilePage
                    ? "pt-[72px] md:pt-6 pb-28 px-0 md:px-10"
                    : "pt-[72px] md:pt-0 pb-28 px-4"
            }`}
          >
            <Outlet />
          </div>
        </div>
      </main>

      {/* Right Panel */}
      {!isMessagesPage && !isAIAssistantPage && (
        <div
          className="hidden lg:block w-80 p-6 relative z-10"
          style={{ flexShrink: 0 }}
        >
          <div
            style={{
              position: "sticky",
              top: "24px",
            }}
          >
            <RightSidebar />
          </div>
        </div>
      )}

      {/* Mobile Bottom Navigation - B&W Style */}
      {true && (
        <div
          className="fixed bottom-0 w-full md:hidden flex justify-around items-center py-3"
          style={{
            background: "rgba(13,17,23,0.95)",
            backdropFilter: "blur(20px)",
            borderTop: `1px solid ${t.border}`,
            zIndex: 1000,
          }}
        >
          {[
            { to: "/home", icon: <FiHome size={22} />, end: true },
            { to: "/explore", icon: <FiSearch size={22} /> },
            { to: "/create-post", icon: <FiPlusSquare size={24} />, fab: true },
            { to: "/marketplace", icon: <MdPets size={22} /> },
            { to: "/profile", icon: <FiUser size={22} />, end: true },
          ].map((item) =>
            item.fab ? (
              <button
                key={item.to}
                onClick={() => setShowCreateModal(true)}
                className="flex items-center justify-center -mt-6 transition-transform duration-200 active:scale-95 hover:scale-105 shadow-2xl"
                style={{
                  width: "56px",
                  height: "56px",
                  borderRadius: "18px",
                  background: "#fff",
                  color: "#000",
                  boxShadow: "0 10px 30px rgba(0,0,0,0.5)",
                  border: "none",
                  cursor: "pointer",
                }}
              >
                {item.icon}
              </button>
            ) : (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                style={({ isActive }) => ({
                  color: isActive ? "#fff" : "rgba(255,255,255,0.4)",
                  transform: isActive ? "scale(1.1)" : "scale(1)",
                  transition: "all 0.2s",
                  position: "relative",
                })}
              >
                {item.icon}
                {item.to === "/notifications" && unreadCount > 0 && (
                  <div
                    style={{
                      position: "absolute",
                      top: "-4px",
                      right: "-6px",
                      background: "#ef4444",
                      color: "#fff",
                      fontSize: "10px",
                      fontWeight: 800,
                      minWidth: "16px",
                      height: "16px",
                      borderRadius: "10px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      padding: "0 4px",
                      border: "2px solid rgba(13,17,23,0.95)",
                    }}
                  >
                    {unreadCount > 9 ? "9+" : unreadCount}
                  </div>
                )}
                {item.to === "/messages" && unreadMessages > 0 && (
                  <div
                    style={{
                      position: "absolute",
                      top: "-4px",
                      right: "-6px",
                      background: "#ef4444",
                      color: "#fff",
                      fontSize: "10px",
                      fontWeight: 800,
                      minWidth: "16px",
                      height: "16px",
                      borderRadius: "10px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      padding: "0 4px",
                      border: "2px solid rgba(13,17,23,0.95)",
                    }}
                  >
                    {unreadMessages > 9 ? "9+" : unreadMessages}
                  </div>
                )}
              </NavLink>
            ),
          )}
        </div>
      )}

      <CreateChoiceModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
      />
    </div>
  );
}
