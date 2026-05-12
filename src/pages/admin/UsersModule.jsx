import React, { useState, useEffect } from "react";
import { getAllUsers, updateUserStatus, deleteUser } from "../../api/api-admin";
import { USER_ROLES, ROLE_LABELS } from "../../utils/roles";
import ConfirmationModal from "../../components/common/ConfirmationModal";
import UserProfileModal from "../../components/admin/UserProfileModal";
import { FiSearch } from "react-icons/fi";

export default function UsersModule() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("All Users");
  const [searchQuery, setSearchQuery] = useState("");
  const [confirmModal, setConfirmModal] = useState({
    isOpen: false,
    title: "",
    message: "",
    confirmText: "",
    variant: "danger",
    onConfirm: () => {},
    actionLoading: false,
  });
  const [selectedUser, setSelectedUser] = useState(null);

  const fetchUsers = async (query = "") => {
    try {
      setLoading(true);
      const res = await getAllUsers({ search: query });
      setUsers(res.data?.data?.users || res.data?.users || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchUsers(searchQuery);
    }, 500);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const handleToggleStatus = (id, currentStatus) => {
    setConfirmModal({
      isOpen: true,
      title: currentStatus ? "Ban User" : "Activate User",
      message: `Are you sure you want to ${currentStatus ? "deactivate" : "activate"} this user account?`,
      confirmText: currentStatus ? "Ban User" : "Activate",
      variant: currentStatus ? "warning" : "success",
      onConfirm: async () => {
        setConfirmModal(prev => ({ ...prev, actionLoading: true }));
        try {
          await updateUserStatus(id, { isActive: !currentStatus });
          fetchUsers();
          setConfirmModal(prev => ({ ...prev, isOpen: false, actionLoading: false }));
        } catch (err) {
          console.error(err);
          setConfirmModal(prev => ({ ...prev, actionLoading: false }));
        }
      },
      actionLoading: false,
    });
  };

  const handleDelete = (id, username) => {
    setConfirmModal({
      isOpen: true,
      title: "Delete User",
      message: `PERMANENT ACTION: Are you sure you want to delete @${username}? This cannot be undone and all user data will be lost.`,
      confirmText: "Delete User",
      variant: "danger",
      onConfirm: async () => {
        setConfirmModal(prev => ({ ...prev, actionLoading: true }));
        try {
          await deleteUser(id);
          fetchUsers();
          setConfirmModal(prev => ({ ...prev, isOpen: false, actionLoading: false }));
        } catch (err) {
          console.error(err);
          setConfirmModal(prev => ({ ...prev, actionLoading: false }));
        }
      },
      actionLoading: false,
    });
  };

  const filteredUsers = users.filter((u) => {
    if (activeTab === "Active") return u.isActive;
    if (activeTab === "Banned") return !u.isActive;
    return true;
  });

  return (
    <div className="ad-module">
      <div className="ad-module-header">
        <div>
          <h2 className="ad-module-title">Platform Users</h2>
          <p className="ad-module-sub">
            Manage all registered platform users, businesses, and professionals
          </p>
        </div>
        <div className="ad-header-stats">
          <span className="ad-badge ad-badge-success">{users.filter(u => u.isActive).length} Active</span>
          <span className="ad-badge ad-badge-danger">{users.filter(u => !u.isActive).length} Banned</span>
        </div>
      </div>

      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
        <div className="ad-tabs !mb-0">
          {["All Users", "Active", "Banned"].map((tab) => (
            <button
              key={tab}
              className={`ad-tab ${activeTab === tab ? "ad-tab-active" : ""}`}
              onClick={() => setActiveTab(tab)}
            >
              {tab}
            </button>
          ))}
        </div>
        
        <div className="ad-search-bar">
          <FiSearch className="ad-search-icon" />
          <input 
            type="text" 
            placeholder="Search by name, email or username..." 
            className="ad-search-input"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      <div className="ad-table-wrap">
        <table className="ad-table">
          <thead>
            <tr>
              <th>User</th>
              <th>Email</th>
              <th>Role</th>
              <th>Joined</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              [...Array(5)].map((_, i) => (
                <tr key={i}>
                  <td colSpan="6">
                    <div
                      className="ad-skeleton-row"
                      style={{ height: "40px" }}
                    />
                  </td>
                </tr>
              ))
            ) : filteredUsers.length === 0 ? (
              <tr>
                <td
                  colSpan="6"
                  className="ad-cell-muted"
                  style={{ textAlign: "center", padding: "40px" }}
                >
                  No {activeTab.toLowerCase()} found
                </td>
              </tr>
            ) : (
              filteredUsers.map((u) => (
                <tr key={u._id}>
                  <td>
                    <div className="ad-user-cell">
                       <div className="ad-avatar-cell">
                         <img 
                           src={u.profile?.avatar?.url || `https://ui-avatars.com/api/?name=${u.username}&background=random`} 
                           alt="Avatar" 
                           style={{ width: "100%", height: "100%", objectFit: "cover" }}
                           onError={(e) => {
                             e.target.onerror = null;
                             e.target.src = `https://ui-avatars.com/api/?name=${u.username}&background=random`;
                           }}
                         />
                      </div>
                      <span 
                        className="ad-cell-name font-medium cursor-pointer hover:text-emerald-500 transition-colors"
                        onClick={() => setSelectedUser(u)}
                      >
                        @{u.username}
                      </span>
                    </div>
                  </td>
                  <td className="ad-cell-email">{u.email}</td>
                  <td>
                    <span className={`ad-badge ${u.role === 'user' ? 'ad-badge-info' : 'ad-badge-warn'}`}>
                      {ROLE_LABELS[u.role] || u.role}
                    </span>
                  </td>
                  <td className="ad-cell-date">
                    {new Date(u.createdAt).toLocaleDateString()}
                  </td>
                  <td>
                    <span
                      className={`ad-badge ${u.isActive ? "ad-badge-success" : "ad-badge-danger"}`}
                    >
                      {u.isActive ? "Active" : "Banned"}
                    </span>
                  </td>
                  <td>
                    <div className="ad-action-group">
                      <button
                        className="ad-btn ad-btn-neutral"
                        onClick={() => setSelectedUser(u)}
                      >
                        View
                      </button>
                      <button
                        className="ad-btn ad-btn-neutral"
                        onClick={() =>
                          handleToggleStatus(u._id, u.isActive)
                        }
                      >
                        {u.isActive ? "Ban User" : "Unban"}
                      </button>
                      <button
                        className="ad-btn ad-btn-danger"
                        onClick={() =>
                          handleDelete(
                            u._id,
                            u.username,
                          )
                        }
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <ConfirmationModal
        isOpen={confirmModal.isOpen}
        onClose={() => setConfirmModal(prev => ({ ...prev, isOpen: false }))}
        onConfirm={confirmModal.onConfirm}
        title={confirmModal.title}
        message={confirmModal.message}
        confirmText={confirmModal.confirmText}
        variant={confirmModal.variant}
        loading={confirmModal.actionLoading}
      />

      {selectedUser && (
        <UserProfileModal
          user={selectedUser}
          onClose={() => setSelectedUser(null)}
        />
      )}
    </div>
  );
}
