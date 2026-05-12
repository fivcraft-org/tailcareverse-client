import React, { useState, useEffect } from "react";
import { Eye, EyeOff } from "lucide-react";
import { FiUser, FiMail, FiLock, FiShield, FiPlus } from "react-icons/fi";
import {
  getAllAdmins,
  createAdmin,
  toggleAdminStatus,
  deleteUser,
} from "../../api/api-admin";
import { USER_ROLES, ROLE_LABELS, ADMIN_ROLES } from "../../utils/roles";
import AdminModal from "../../components/admin/AdminModal";
import ConfirmationModal from "../../components/common/ConfirmationModal";
import UserProfileModal from "../../components/admin/UserProfileModal";

export default function AdminManagementModule() {
  const [admins, setAdmins] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [activeTab, setActiveTab] = useState("Employees");
  const [newAdmin, setNewAdmin] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    role: USER_ROLES.VERIFICATION_ADMIN,
  });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
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

  const fetchAdmins = async () => {
    try {
      const res = await getAllAdmins();
      setAdmins(res.data?.data?.users || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdmins();
  }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    setError("");
    try {
      await createAdmin(newAdmin);
      setShowModal(false);
      setNewAdmin({
        firstName: "",
        lastName: "",
        email: "",
        password: "",
        role: USER_ROLES.VERIFICATION_ADMIN,
      });
      fetchAdmins();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to create employee");
    }
  };

  const handleToggleStatus = (id, currentStatus) => {
    setConfirmModal({
      isOpen: true,
      title: currentStatus ? "Disable Account" : "Enable Account",
      message: `Are you sure you want to ${currentStatus ? "disable" : "enable"} this employee account?`,
      confirmText: currentStatus ? "Disable" : "Enable",
      variant: currentStatus ? "warning" : "success",
      onConfirm: async () => {
        setConfirmModal(prev => ({ ...prev, actionLoading: true }));
        try {
          await toggleAdminStatus(id, !currentStatus);
          fetchAdmins();
          setConfirmModal(prev => ({ ...prev, isOpen: false, actionLoading: false }));
        } catch (err) {
          console.error(err);
          setConfirmModal(prev => ({ ...prev, actionLoading: false }));
        }
      },
      actionLoading: false,
    });
  };

  const handleDelete = (id, name) => {
    setConfirmModal({
      isOpen: true,
      title: "Delete Employee",
      message: `PERMANENT ACTION: Are you sure you want to delete ${name}? This cannot be undone and all administrative access will be revoked.`,
      confirmText: "Delete Employee",
      variant: "danger",
      onConfirm: async () => {
        setConfirmModal(prev => ({ ...prev, actionLoading: true }));
        try {
          await deleteUser(id);
          fetchAdmins();
          setConfirmModal(prev => ({ ...prev, isOpen: false, actionLoading: false }));
        } catch (err) {
          console.error(err);
          setConfirmModal(prev => ({ ...prev, actionLoading: false }));
        }
      },
      actionLoading: false,
    });
  };

  const filteredAdmins = admins.filter((adm) => {
    if (activeTab === "Super Admins")
      return adm.role === USER_ROLES.SUPER_ADMIN;
    return adm.role !== USER_ROLES.SUPER_ADMIN;
  });

  return (
    <div className="ad-module">
      <div className="ad-module-header">
        <div>
          <h2 className="ad-module-title">Employee Management</h2>
          <p className="ad-module-sub">
            Manage platform staff, moderators, and system administrators
          </p>
        </div>
        <button
          className="ad-btn ad-btn-success"
          onClick={() => setShowModal(true)}
        >
          + Add New Employee
        </button>
      </div>

      <div className="ad-tabs" style={{ marginBottom: "20px" }}>
        {["Employees", "Super Admins"].map((tab) => (
          <button
            key={tab}
            className={`ad-tab ${activeTab === tab ? "ad-tab-active" : ""}`}
            onClick={() => setActiveTab(tab)}
          >
            {tab}
          </button>
        ))}
      </div>

      <div className="ad-table-wrap">
        <table className="ad-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Role</th>
              <th>Joined</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              [...Array(3)].map((_, i) => (
                <tr key={i}>
                  <td colSpan="6">
                    <div
                      className="ad-skeleton-row"
                      style={{ height: "40px" }}
                    />
                  </td>
                </tr>
              ))
            ) : filteredAdmins.length === 0 ? (
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
              filteredAdmins.map((adm) => (
                <tr key={adm._id}>
                  <td>
                    <div className="ad-user-cell">
                       <div className="w-8 h-8 rounded-full overflow-hidden bg-emerald-100 flex-shrink-0 flex items-center justify-center font-bold text-emerald-700 text-xs border border-emerald-200/50">
                         <img 
                           src={adm.profile?.avatar?.url || `https://ui-avatars.com/api/?name=${adm.username}&background=random`} 
                           alt="Avatar" 
                           className="w-full h-full object-cover" 
                           onError={(e) => {
                             e.target.onerror = null;
                             e.target.src = `https://ui-avatars.com/api/?name=${adm.username}&background=random`;
                           }}
                         />
                      </div>
                      <span 
                        className="ad-cell-name cursor-pointer hover:text-emerald-600 transition-colors"
                        onClick={() => setSelectedUser(adm)}
                      >
                        {adm.profile?.firstName} {adm.profile?.lastName}
                      </span>
                    </div>
                  </td>
                  <td className="ad-cell-email">{adm.email}</td>
                  <td>
                    <span className="ad-badge ad-badge-info">
                      {ROLE_LABELS[adm.role]}
                    </span>
                  </td>
                  <td className="ad-cell-date">
                    {new Date(adm.createdAt).toLocaleDateString()}
                  </td>
                  <td>
                    <span
                      className={`ad-badge ${adm.isActive ? "ad-badge-success" : "ad-badge-danger"}`}
                    >
                      {adm.isActive ? "Active" : "Disabled"}
                    </span>
                  </td>
                  <td>
                    <div className="ad-action-group">
                      {adm.role !== USER_ROLES.SUPER_ADMIN && (
                        <>
                          <button
                            className="ad-btn ad-btn-neutral"
                            onClick={() =>
                              handleToggleStatus(adm._id, adm.isActive)
                            }
                          >
                            {adm.isActive ? "Disable" : "Enable"}
                          </button>
                          <button
                            className="ad-btn ad-btn-danger"
                            onClick={() =>
                              handleDelete(
                                adm._id,
                                `${adm.profile?.firstName} ${adm.profile?.lastName}`,
                              )
                            }
                          >
                            Delete
                          </button>
                        </>
                      )}
                      <button 
                        className="ad-btn ad-btn-neutral"
                        onClick={() => setSelectedUser(adm)}
                      >
                        View
                      </button>
                      <button className="ad-btn ad-btn-neutral">Edit</button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* ── Add Employee Modal ── */}
      {showModal && (
        <AdminModal
          title={
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 flex items-center justify-center text-emerald-500">
                <FiPlus size={20} />
              </div>
              <span>Provision New Employee</span>
            </div>
          }
          subtitle="Grant system access to a new team member"
          onClose={() => setShowModal(false)}
        >
          <form onSubmit={handleCreate} className="ad-admin-form premium-form">
            {error && <div className="ad-error-msg animate-pulse">{error}</div>}
            
            <div className="ad-form-section">
              <label className="ad-form-label">PERSONAL DETAILS</label>
              <div className="ad-form-row">
                <div className="ad-input-group">
                  <span className="ad-input-icon"><FiUser size={16} /></span>
                  <input
                    type="text"
                    placeholder="First Name"
                    required
                    value={newAdmin.firstName}
                    onChange={(e) =>
                      setNewAdmin({ ...newAdmin, firstName: e.target.value })
                    }
                  />
                </div>
                <div className="ad-input-group">
                  <span className="ad-input-icon"><FiUser size={16} /></span>
                  <input
                    type="text"
                    placeholder="Last Name"
                    required
                    value={newAdmin.lastName}
                    onChange={(e) =>
                      setNewAdmin({ ...newAdmin, lastName: e.target.value })
                    }
                  />
                </div>
              </div>
            </div>

            <div className="ad-form-section">
              <label className="ad-form-label">ACCESS CREDENTIALS</label>
              <div className="ad-input-group">
                <span className="ad-input-icon"><FiMail size={16} /></span>
                <input
                  type="email"
                  placeholder="Work Email"
                  required
                  value={newAdmin.email}
                  onChange={(e) =>
                    setNewAdmin({ ...newAdmin, email: e.target.value })
                  }
                />
              </div>

              <div className="ad-input-group" style={{ marginTop: "12px" }}>
                <span className="ad-input-icon"><FiLock size={16} /></span>
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="Temporary Password"
                  required
                  value={newAdmin.password}
                  onChange={(e) =>
                    setNewAdmin({ ...newAdmin, password: e.target.value })
                  }
                  style={{ width: "100%", paddingRight: "45px" }}
                />
                <button
                  type="button"
                  className="ad-password-toggle"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{
                    position: "absolute",
                    right: "12px",
                    top: "50%",
                    transform: "translateY(-50%)",
                    background: "none",
                    border: "none",
                    color: "#94a3b8",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    padding: "4px",
                  }}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <div className="ad-form-section">
              <label className="ad-form-label">SYSTEM ROLE</label>
              <div className="ad-input-group">
                <span className="ad-input-icon"><FiShield size={16} /></span>
                <select
                  value={newAdmin.role}
                  onChange={(e) =>
                    setNewAdmin({ ...newAdmin, role: e.target.value })
                  }
                >
                  {ADMIN_ROLES.map((role) => (
                    <option key={role} value={role}>
                      {ROLE_LABELS[role]}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <button
              type="submit"
              className="ad-premium-btn ad-btn-approve"
              style={{
                marginTop: "30px",
                width: "100%",
                justifyContent: "center",
                height: "50px",
                fontSize: "1rem"
              }}
            >
              Confirm Provisioning
            </button>
          </form>
        </AdminModal>
      )}
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
