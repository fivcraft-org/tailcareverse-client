import React, { useEffect, useState } from "react";
import {
  getAllReports,
  reviewReport,
  deletePost,
  getAllUsers,
  updateUserStatus,
} from "../../api/api-admin";
import PostDetailModal from "../../components/common/PostDetailModal";
import UserProfileModal from "../../components/admin/UserProfileModal";


const TABS = [
  "Reported Posts",
  "Fake Accounts",
  "Abuse Content",
  "Banned Users",
];

export default function ContentModule() {
  const [activeTab, setActiveTab] = useState("Reported Posts");
  const [reports, setReports] = useState([]);
  const [userReports, setUserReports] = useState([]);
  const [bannedUsers, setBannedUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(null);
  
  // Post Modal states
  const [selectedPost, setSelectedPost] = useState(null);
    const [isPostModalOpen, setIsPostModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);


  const fetchReports = async () => {
    setLoading(true);
    try {
      const [pRes, uRes, bRes] = await Promise.all([
        getAllReports({ targetType: "post", status: "pending" }),
        getAllReports({ targetType: "user", status: "pending" }),
        getAllUsers({ isActive: false }),
      ]);
      setReports(pRes.data?.reports || pRes.data?.data?.reports || []);
      setUserReports(uRes.data?.reports || uRes.data?.data?.reports || []);
      setBannedUsers(bRes.data?.users || bRes.data?.data?.users || []);
    } catch (err) {
      console.error("Failed to fetch reports:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, []);

  const handlePostAction = async (reportId, action) => {
    setActionLoading(reportId + action);
    try {
      if (action === "delete") {
        const report = reports.find((r) => r._id === reportId);
        if (report && report.targetId) {
          await deletePost(report.targetId);
        }
        await reviewReport(reportId, {
          status: "resolved",
          reviewNotes: "Deleted by admin via moderation",
        });
      } else if (action === "dismiss") {
        await reviewReport(reportId, {
          status: "dismissed",
          reviewNotes: "Dismissed by admin",
        });
      } else if (action === "warn") {
        // Implement warn logic if available, for now just dismiss
        await reviewReport(reportId, {
          status: "resolved",
          reviewNotes: "User warned",
        });
      }
      setReports((prev) => prev.filter((r) => r._id !== reportId));
    } catch (e) {
      console.error(e);
    } finally {
      setActionLoading(null);
    }
  };

  const handleUserAction = async (reportId, action) => {
    setActionLoading(reportId + action);
    try {
      const report = userReports.find((r) => r._id === reportId);
      if (report && report.targetId) {
        if (action === "ban") {
          await updateUserStatus(report.targetId, { isActive: false });
          await reviewReport(reportId, {
            status: "resolved",
            reviewNotes: "User banned",
          });
          // Refresh banned users
          const bRes = await getAllUsers({ isActive: false });
          setBannedUsers(bRes.data?.users || bRes.data?.data?.users || []);
        } else if (action === "dismiss") {
          await reviewReport(reportId, {
            status: "dismissed",
            reviewNotes: "Dismissed by admin",
          });
        }
      }
      setUserReports((prev) => prev.filter((r) => r._id !== reportId));
    } catch (e) {
      console.error(e);
    } finally {
      setActionLoading(null);
    }
  };

  const handleUnban = async (userId) => {
    setActionLoading(userId + "unban");
    try {
      await updateUserStatus(userId, { isActive: true });
      setBannedUsers((prev) => prev.filter((u) => u._id !== userId));
    } catch (e) {
      console.error(e);
    } finally {
      setActionLoading(null);
    }
  };

  return (
    <div className="ad-module">
      <div className="ad-module-header">
        <div>
          <h2 className="ad-module-title">Content Moderation</h2>
          <p className="ad-module-sub">
            Monitor and moderate user-generated content
          </p>
        </div>
        <div className="ad-header-stats">
          <span className="ad-badge ad-badge-danger">
            {reports.length} Reports
          </span>
          <span className="ad-badge ad-badge-warn">
            {userReports.length} Flagged Accounts
          </span>
        </div>
      </div>

      <div className="ad-tabs">
        {TABS.map((t) => (
          <button
            key={t}
            className={`ad-tab ${activeTab === t ? "ad-tab-active" : ""}`}
            onClick={() => setActiveTab(t)}
          >
            {t}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="ad-loading-list">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="ad-skeleton-row" />
          ))}
        </div>
      ) : (
        <>
          {/* Reported Posts */}
          {activeTab === "Reported Posts" && (
            <div className="ad-card-list">
              {reports.length === 0 ? (
                <div className="ad-empty-state">
                  <p>No pending post reports.</p>
                </div>
              ) : (
                reports.map((r) => (
                  <div key={r._id} className="ad-report-card">
                    <div className="ad-report-left flex items-start gap-4">
                      {r.targetData?.media && r.targetData.media.length > 0 ? (
                        r.targetData.media[0].type === "video" || r.targetData.media[0].url.match(/\.(mp4|mov|avi|wmv)$/) ? (
                          <div 
                            className="w-16 h-16 shrink-0 rounded-2xl overflow-hidden bg-black flex-shrink-0 border border-gray-100 shadow-sm relative group cursor-pointer"
                            onClick={() => { setSelectedPost(r.targetData); setIsPostModalOpen(true); }}
                          >
                            <video
                                src={r.targetData.media[0].url}
                                className="w-full h-full object-cover transition-transform group-hover:scale-110"
                                muted
                            />
                            <div className="absolute inset-0 bg-black/20 flex items-center justify-center">
                              <span className="text-white text-xs font-bold bg-black/50 px-2 py-1 rounded-md">Video</span>
                            </div>
                          </div>
                        ) : (
                          <div 
                            className="w-16 h-16 shrink-0 rounded-2xl overflow-hidden bg-gray-100 flex-shrink-0 border border-gray-100 shadow-sm group cursor-pointer relative"
                            onClick={() => { setSelectedPost(r.targetData); setIsPostModalOpen(true); }}
                          >
                             <img
                               src={r.targetData.media[0].url}
                               alt="Post content"
                               className="w-full h-full object-cover transition-transform group-hover:scale-110"
                             />
                          </div>
                        )
                      ) : (
                        <div 
                          className="w-16 h-16 shrink-0 rounded-2xl flex items-center justify-center font-bold text-lg text-emerald-600 bg-emerald-50 border border-emerald-100 shadow-sm cursor-pointer hover:bg-emerald-100 transition-colors"
                          onClick={() => { setSelectedPost(r.targetData); setIsPostModalOpen(true); }}
                        >
                          {r.targetData?.content?.[0]?.toUpperCase() || "TXT"}
                        </div>
                      )}
                      
                      <div className="flex flex-col flex-1 h-full min-h-[4rem] justify-center">
                        <div className="ad-report-title text-base font-semibold leading-snug line-clamp-2">
                          "{r.targetData?.content || "No text content"}"
                        </div>
                        <div className="ad-report-meta mt-2 flex items-center flex-wrap gap-2 text-sm">
                          <span className="font-medium">By: <span className="text-emerald-600">@{r.targetData?.author?.username || "unknown"}</span></span>
                          <span className="ad-dot-sep opacity-50">•</span>
                          <span className="bg-red-50 text-red-600 px-2.5 py-1 rounded-full text-xs font-bold tracking-wide">
                            {r.reason}
                          </span>
                          <span className="ad-dot-sep opacity-50">•</span>
                          <span className="font-medium opacity-70">
                            Reported by: <span>@{r.reporter?.username}</span>
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="ad-action-group">
                      <button
                        className="ad-btn ad-btn-danger"
                        disabled={!!actionLoading}
                        onClick={() => handlePostAction(r._id, "delete")}
                      >
                        Delete Post
                      </button>
                      <button
                        className="ad-btn ad-btn-warn"
                        disabled={!!actionLoading}
                        onClick={() => handlePostAction(r._id, "warn")}
                      >
                        Warn User
                      </button>
                      <button
                        className="ad-btn ad-btn-neutral"
                        disabled={!!actionLoading}
                        onClick={() => handlePostAction(r._id, "dismiss")}
                      >
                        Dismiss
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {/* Fake Accounts / Abuse Content */}
          {(activeTab === "Fake Accounts" || activeTab === "Abuse Content") && (
            <div className="ad-card-list">
              {userReports.length === 0 ? (
                <div className="ad-empty-state">
                  <p>No pending account reports.</p>
                </div>
              ) : (
                userReports.map((r) => (
                  <div key={r._id} className="ad-report-card">
                    <div className="ad-report-left">
                      <div className="ad-avatar-sm">
                        {r.targetData?.username?.[0]?.toUpperCase() || "?"}
                      </div>
                      <div>
                        <div className="ad-report-title">@{r.targetData?.username || "unknown"}</div>
                        <div className="ad-report-meta">
                          <span>{r.targetData?.email}</span>
                          <span className="ad-dot-sep">·</span>
                          <span className="ad-badge ad-badge-danger">
                            Reason: {r.reason}
                          </span>
                          <span className="ad-dot-sep">·</span>
                          <span className="ad-text-muted">
                            Reported by: @{r.reporter?.username}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="ad-action-group">
                      <button
                        className="ad-btn ad-btn-danger"
                        disabled={!!actionLoading}
                        onClick={() => handleUserAction(r._id, "ban")}
                      >
                        Ban User
                      </button>
                      <button
                        className="ad-btn ad-btn-neutral"
                        disabled={!!actionLoading}
                        onClick={() => handleUserAction(r._id, "dismiss")}
                      >
                        Dismiss
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {/* Banned Users */}
          {activeTab === "Banned Users" && (
            <div className="ad-card-list">
              {bannedUsers.length === 0 ? (
                <div className="ad-empty-state">
                  <p>No banned users yet. Banned accounts will appear here.</p>
                </div>
              ) : (
                bannedUsers.map((u) => (
                  <div key={u._id} className="ad-report-card">
                    <div className="ad-report-left">
                      <div className="ad-avatar-sm">
                        {u.username?.[0]?.toUpperCase() || "?"}
                      </div>
                      <div>
                        <div className="ad-report-title">@{u.username}</div>
                        <div className="ad-report-meta">
                          <span>{u.email}</span>
                        </div>
                      </div>
                    </div>
                    <div className="ad-action-group">
                      <button
                        className="ad-btn ad-btn-neutral"
                        disabled={!!actionLoading}
                        onClick={() => handleUnban(u._id)}
                      >
                        Unban User
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </>
      )}
      
      {/* Post Detail Modal */}
      {selectedPost && isPostModalOpen && (
        <PostDetailModal
          post={selectedPost}
          isOpen={isPostModalOpen}
          onClose={() => {
            setIsPostModalOpen(false);
            setSelectedPost(null);
          }}
          onUpdate={(updatedPost) => {
            setReports((prevReports) =>
              prevReports.map((report) => 
                report.targetType === 'post' && report.targetId === updatedPost._id 
                  ? { ...report, targetData: updatedPost } 
                  : report
              )
            );
          }}
          onDeleted={() => {
            setReports((prevReports) =>
              prevReports.filter((report) => 
                !(report.targetType === 'post' && report.targetId === selectedPost._id)
              )
            );
            setIsPostModalOpen(false);
            setSelectedPost(null);
          }}
        />
      )}
    </div>
  );
}
