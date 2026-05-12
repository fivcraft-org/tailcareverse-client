import { useState, useEffect } from "react";
import { FiUsers } from "react-icons/fi";
import { getSuggestions, followUser } from "../../api/api-follow";
import {
  notifySuccess,
  notifyError,
} from "../../utils/services/toast/toast-service";
import { useNavigate } from "react-router-dom";

const cardStyle = {
  background:
    "linear-gradient(135deg, rgba(255,255,255,0.04) 0%, rgba(255,255,255,0.02) 100%)",
  border: "1px solid rgba(255,255,255,0.07)",
  borderRadius: "18px",
  padding: "18px 20px",
  backdropFilter: "blur(12px)",
  boxShadow: "0 4px 24px rgba(0,0,0,0.3)",
};

const labelStyle = {
  fontSize: "0.75rem",
  fontWeight: 700,
  letterSpacing: "0.12em",
  textTransform: "",
  color: "rgba(34,197,120,0.7)",
  marginBottom: "12px",
  display: "flex",
  alignItems: "center",
  gap: "8px",
};

const itemStyle = {
  display: "flex",
  alignItems: "center",
  gap: "12px",
  padding: "10px 12px",
  borderRadius: "12px",
  background: "rgba(255,255,255,0.03)",
  border: "1px solid rgba(255,255,255,0.05)",
  marginBottom: "8px",
  cursor: "pointer",
  transition: "all 0.2s ease",
};

const dotStyle = {
  width: "8px",
  height: "8px",
  borderRadius: "50%",
  background: "#22c578",
  flexShrink: 0,
  boxShadow: "0 0 8px rgba(34,197,120,0.6)",
};

export default function RightSidebar() {
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [followingIds, setFollowingIds] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    fetchSuggestions();
  }, []);

  const fetchSuggestions = async () => {
    try {
      const response = await getSuggestions();
      if (response.data.success) {
        setSuggestions(response.data.data);
      }
    } catch (error) {
      console.error("Error fetching suggestions:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleFollow = async (e, userId) => {
    e.stopPropagation();
    if (followingIds.includes(userId)) return;

    try {
      setFollowingIds((prev) => [...prev, userId]);
      const response = await followUser(userId);
      if (response.data.success) {
        notifySuccess("Followed successfully");
        // Optionally remove from list after following
        setTimeout(() => {
          setSuggestions((prev) => prev.filter((u) => u._id !== userId));
          setFollowingIds((prev) => prev.filter((id) => id !== userId));
        }, 1000);
      }
    } catch (err) {
      console.error("Follow failed", err);
      // Rollback status if fail
      setFollowingIds((prev) => prev.filter((id) => id !== userId));

      const errorMessage = err.response?.data?.message || "";
      if (errorMessage.toLowerCase().includes("already following")) {
        // If already following, just remove them from suggestions
        setSuggestions((prev) => prev.filter((u) => u._id !== userId));
      } else {
        notifyError(errorMessage || "Follow failed");
      }
    }
  };

  const handleUserClick = (username) => {
    navigate(`/profile/${username}`);
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>

      {/* Suggested */}
      <div style={cardStyle}>
        <div style={labelStyle}>
          <FiUsers size={11} />
          Suggested for you
        </div>
        {loading ? (
          <div
            style={{
              color: "rgba(107,114,128,0.7)",
              fontSize: "0.8rem",
              textAlign: "center",
              padding: "10px",
            }}
          >
            Finding friends...
          </div>
        ) : suggestions.length > 0 ? (
          suggestions.map((user) => (
            <div
              key={user._id}
              style={{ ...itemStyle, marginBottom: "8px" }}
              onClick={() => handleUserClick(user.username)}
            >
              <img
                src={
                  user.profile?.avatar?.url ||
                  user.pets?.[0]?.photos?.[0]?.url ||
                  `https://ui-avatars.com/api/?name=${user.username}&background=random`
                }
                alt={user.username}
                style={{
                  width: "36px",
                  height: "36px",
                  borderRadius: "10px",
                  objectFit: "cover",
                  border: "1px solid rgba(34,197,120,0.2)",
                  flexShrink: 0,
                }}
              />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div
                  style={{
                    color: "rgba(229,231,235,0.9)",
                    fontSize: "0.83rem",
                    fontWeight: 600,
                    whiteSpace: "nowrap",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                  }}
                >
                  {user.profile?.firstName} {user.profile?.lastName}
                </div>
                <div
                  style={{
                    color: "rgba(107,114,128,0.7)",
                    fontSize: "0.72rem",
                  }}
                >
                  @{user.username}
                </div>
              </div>
              <button
                onClick={(e) => handleFollow(e, user._id)}
                disabled={followingIds.includes(user._id)}
                style={{
                  padding: "5px 12px",
                  borderRadius: "8px",
                  fontSize: "0.72rem",
                  fontWeight: 700,
                  letterSpacing: "0.04em",
                  color: followingIds.includes(user._id)
                    ? "rgba(107,114,128,0.7)"
                    : "#22c578",
                  background: followingIds.includes(user._id)
                    ? "rgba(255,255,255,0.05)"
                    : "rgba(34,197,120,0.1)",
                  border: `1px solid ${followingIds.includes(user._id) ? "rgba(255,255,255,0.1)" : "rgba(34,197,120,0.25)"}`,
                  cursor: followingIds.includes(user._id)
                    ? "default"
                    : "pointer",
                  whiteSpace: "nowrap",
                  transition: "all 0.2s",
                }}
              >
                {followingIds.includes(user._id) ? "Following" : "Follow"}
              </button>
            </div>
          ))
        ) : (
          <div
            style={{
              color: "rgba(107,114,128,0.7)",
              fontSize: "0.8rem",
              textAlign: "center",
              padding: "10px",
            }}
          >
            No suggestions right now
          </div>
        )}
      </div>
    </div>
  );
}
