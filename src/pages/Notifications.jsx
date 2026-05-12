import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  FiBell,
  FiHeart,
  FiMessageCircle,
  FiUserPlus,
  FiTrash2,
  FiCheckCircle,
} from "react-icons/fi";
import { useTheme } from "../context/ThemeContext";
import { useSocket } from "../context/SocketContext";
import {
  getNotifications,
  markAsRead,
  markAllAsRead,
  deleteNotification,
} from "../api/api-notification";
import { formatDistanceToNow } from "../utils/time-utils";
import "../styles/notifications.css";

const Notifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const { theme: t, isDarkMode } = useTheme();
  const { socket } = useSocket();

  const fetchNotifications = async () => {
    try {
      const res = await getNotifications();
      setNotifications(res.notifications || []);
    } catch (err) {
      console.error("Error fetching notifications:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const loadData = async () => {
      await fetchNotifications();
      await handleMarkAllRead();
    };
    loadData();
  }, []);

  useEffect(() => {
    if (socket) {
      socket.on("notification received", (newNotification) => {
        setNotifications((prev) => [newNotification, ...prev]);
      });
    }
    return () => {
      if (socket) {
        socket.off("notification received");
      }
    };
  }, [socket]);

  const handleMarkAsRead = async (id) => {
    try {
      await markAsRead(id);
      setNotifications((prev) =>
        prev.map((n) => (n._id === id ? { ...n, isRead: true } : n)),
      );
    } catch (err) {
      console.error("Error marking as read:", err);
    }
  };

  const handleDelete = async (e, id) => {
    e.stopPropagation();
    try {
      await deleteNotification(id);
      setNotifications((prev) => prev.filter((n) => n._id !== id));
    } catch (err) {
      console.error("Error deleting notification:", err);
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await markAllAsRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    } catch (err) {
      console.error("Error marking all read:", err);
    }
  };

  const getIcon = (type) => {
    switch (type) {
      case "like":
        return <FiHeart className="text-red-500 fill-red-500" />;
      case "comment":
        return <FiMessageCircle className="text-blue-500" />;
      case "follow":
        return <FiUserPlus className="text-green-500" />;
      case "message":
        return <FiBell className="text-purple-500" />;
      default:
        return <FiBell />;
    }
  };

  const getNotificationText = (notification) => {
    const sender = notification.sender?.username || "Someone";
    switch (notification.type) {
      case "like":
        return (
          <span>
            <b>{sender}</b> liked your post
          </span>
        );
      case "comment":
        return (
          <span>
            <b>{sender}</b> commented: "{notification.content}"
          </span>
        );
      case "follow":
        return (
          <span>
            <b>{sender}</b> started following you
          </span>
        );
      case "message":
        return (
          <span>
            <b>{sender}</b> sent you a message: "{notification.content}"
          </span>
        );
      default:
        return (
          <span>
            New notification from <b>{sender}</b>
          </span>
        );
    }
  };

  return (
    <div className="notifications-page" style={{ color: t.text }}>
      <div className="notifications-header">
        <div className="header-title-container">
          <h2 className="header-title">Notifications</h2>
        </div>
        {notifications.length > 0 && (
          <button className="mark-all-btn" onClick={handleMarkAllRead}>
            <FiCheckCircle size={14} />
            <span>Mark all read</span>
          </button>
        )}
      </div>

      <div className="notifications-list">
        {loading ? (
          <div className="loading-state">
            <div className="spinner"></div>
            <span>Loading updates...</span>
          </div>
        ) : notifications.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">
              <FiBell size={48} opacity={0.3} />
            </div>
            <h3>No notifications yet</h3>
            <p>Any updates about your posts and activity will appear here.</p>
          </div>
        ) : (
          notifications.map((notification) => (
            <div
              key={notification._id}
              className={`notification-item ${!notification.isRead ? "unread" : ""}`}
              onClick={() => handleMarkAsRead(notification._id)}
              style={{
                backgroundColor: !notification.isRead
                  ? "rgba(128, 128, 128, 0.05)"
                  : "transparent",
              }}
            >
              <div className="notification-main">
                <Link
                  to={`/profile/${notification.sender?._id}`}
                  className="sender-avatar"
                  onClick={(e) => e.stopPropagation()}
                >
                  <img
                    src={
                      notification.sender?.profilePicture ||
                      "https://cdn-icons-png.flaticon.com/512/149/149071.png"
                    }
                    alt={notification.sender?.username}
                  />
                  <div className={`type-badge ${notification.type}`}>
                    {getIcon(notification.type)}
                  </div>
                </Link>

                <div className="notification-content">
                  <p className="notification-text">
                    {getNotificationText(notification)}
                  </p>
                  <span className="notification-time">
                    {formatDistanceToNow(new Date(notification.createdAt), {
                      addSuffix: true,
                    })}
                  </span>
                </div>
              </div>

              <div className="notification-actions">
                {notification.post && (
                  <Link
                    to={`/post/${notification.post?._id}`}
                    className="post-preview"
                    onClick={(e) => e.stopPropagation()}
                  >
                    {notification.post.media?.[0]?.url ? (
                      <img
                        src={notification.post.media[0].url}
                        alt="Post preview"
                      />
                    ) : (
                      <div className="post-placeholder">Post</div>
                    )}
                  </Link>
                )}
                <button
                  className="delete-btn"
                  onClick={(e) => handleDelete(e, notification._id)}
                  title="Delete"
                >
                  <FiTrash2 size={16} />
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default Notifications;
