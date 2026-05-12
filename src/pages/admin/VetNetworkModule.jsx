import React, { useEffect, useState } from "react";
import {
  getPendingVerifications,
  verifyServiceProvider,
  getAllProfessionals,
} from "../../api/api-admin";
import AddVetModal from "../../components/admin/AddVetModal";
import UserProfileModal from "../../components/admin/UserProfileModal";
import { FiPlus, FiFilter, FiSearch, FiBriefcase, FiMapPin, FiActivity, FiShield } from "react-icons/fi";

const TABS = ["Clinics", "Doctors", "Emergency Services", "Verified Network"];



export default function VetNetworkModule() {
  const [vets, setVets] = useState([]);
  const [verifiedVets, setVerifiedVets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("Clinics");
  const [actionLoading, setActionLoading] = useState(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");

  const fetchData = async () => {
    setLoading(true);
    try {
      if (activeTab === "Verified Network") {
        const res = await getAllProfessionals("vet");
        setVerifiedVets(res.data?.profiles || res.data?.data?.profiles || []);
      } else {
        const res = await getPendingVerifications();
        const data = res.data?.data ?? res.data ?? [];
        setVets(data.filter((v) => v.profileType === "Vet"));
      }
    } catch (err) {
      console.error(err);
      if (activeTab === "Verified Network") setVerifiedVets([]);
      else setVets([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [activeTab]);

  const handleAction = async (id, action) => {
    setActionLoading(id + action);
    try {
      const statusMap = {
        approve: "verified",
        reject: "rejected",
        resubmit: "resubmit",
      };
      await verifyServiceProvider("Vet", id, { status: statusMap[action] });
      fetchData();
    } catch (e) {
      console.error(e);
    } finally {
      setActionLoading(null);
    }
  };

  const filteredPending = vets.filter((v) => {
    if (activeTab === "Clinics") return v.type === "clinic";
    if (activeTab === "Doctors") return v.type === "doctor";
    if (activeTab === "Emergency Services")
      return v.type === "emergency" || v.emergency;
    return true;
  });

  const filteredVerified = verifiedVets.filter(v => 
    v.clinicName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    v.user?.username?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="ad-module">
      <div className="ad-module-header">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center w-full gap-4">
          <div>
            <h2 className="ad-module-title">Vet Network Control</h2>
            <p className="ad-module-sub">
              Approve clinics, verify doctors, and manage emergency services
            </p>
          </div>
          <div className="flex items-center gap-3">
             <div className="ad-badge ad-badge-info">
               {vets.length} Pending
             </div>
             <button 
               className="ad-btn ad-btn-primary flex items-center gap-2"
               onClick={() => setIsAddModalOpen(true)}
             >
               <FiPlus /> Add New Vet
             </button>
          </div>
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
      ) : activeTab === "Verified Network" ? (
        <div className="ad-verified-container">
          <div className="ad-table-filters mb-6 flex flex-col md:flex-row gap-4">
            <div className="ad-search-box flex-1">
              <FiSearch className="ad-search-icon" />
              <input 
                type="text" 
                placeholder="Search veterinarians by name or username..." 
                className="ad-search-input"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
          
          {filteredVerified.length === 0 ? (
            <div className="ad-empty-state">
               <p>No verified veterinarians found.</p>
            </div>
          ) : (
            <div className="ad-table-wrap">
              <table className="ad-table">
                <thead>
                  <tr>
                    <th>Veterinarian</th>
                    <th>Clinic Details</th>
                    <th>Experience</th>
                    <th>Location</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredVerified.map((v) => (
                    <tr key={v._id}>
                      <td>
                        <div className="ad-user-cell">
                          <div className="w-10 h-10 rounded-full overflow-hidden bg-neutral-100 border border-neutral-200 shadow-sm">
                            <img 
                              src={v.user?.profile?.avatar?.url || `https://ui-avatars.com/api/?name=${v.user?.username}&background=random`} 
                              alt="Vet" 
                              className="w-full h-full object-cover" 
                            />
                          </div>
                          <div className="flex flex-col">
                            <span 
                              className="font-bold cursor-pointer hover:text-emerald-600 transition-colors"
                              onClick={() => setSelectedUser(v.user)}
                            >
                              @{v.user?.username || "deleted"}
                            </span>
                            <span className="text-xs text-neutral-500">{v.user?.email}</span>
                          </div>
                        </div>
                      </td>
                      <td>
                        <div className="flex flex-col">
                          <div className="flex items-center gap-2">
                             <span className="font-bold">{v.clinicName}</span>
                             {v.isEmergencyService && (
                               <span className="bg-red-50 text-red-500 text-[10px] px-1.5 py-0.5 rounded border border-red-100 font-bold uppercase tracking-tighter">Emergency</span>
                             )}
                          </div>
                          <span className="text-xs text-neutral-500">Lic: {v.licenseNumber}</span>
                        </div>
                      </td>
                      <td>
                        <span className="ad-badge ad-badge-info">
                          {v.experience} Years
                        </span>
                      </td>
                      <td>
                        <div className="flex items-center gap-1.5 text-xs font-medium text-neutral-600">
                          <FiMapPin className="text-emerald-500" />
                          <span className="line-clamp-1 max-w-[150px]">{v.clinicAddress}</span>
                        </div>
                      </td>
                      <td>
                        <div className="flex items-center gap-2">
                          <span className={`w-2 h-2 rounded-full ${v.user?.isActive ? "bg-green-500" : "bg-red-500"}`} />
                          <span className="text-xs font-black uppercase text-neutral-500">
                            {v.user?.isActive ? "Active" : "Banned"}
                          </span>
                        </div>
                      </td>
                      <td>
                        <div className="ad-action-group">
                          <button 
                            className="ad-btn ad-btn-neutral"
                            onClick={() => setSelectedUser(v.user)}
                          >
                            View
                          </button>
                          <button className="ad-btn ad-btn-neutral">Edit</button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      ) : (
        <div className="ad-vet-grid">
          {filteredPending.length === 0 ? (
            <div className="ad-empty-state">
              <span className="ad-empty-icon"></span>
              <p>No pending {activeTab.toLowerCase()} to review.</p>
            </div>
          ) : (
            filteredPending.map((v) => (
              <div key={v._id} className="ad-vet-card">
                <div className="ad-vet-card-top">
                  <div className="ad-vet-icon">
                     <FiBriefcase size={20} className="text-emerald-600" />
                  </div>
                  <div className="ad-vet-info">
                    <div className="ad-vet-name">{v.name || v.clinicName}</div>
                    <div className="ad-vet-meta">
                      {v.doctor || v.user?.profile?.firstName} · {v.city || v.clinicAddress?.split(',').pop()?.trim()}
                    </div>
                    <div className="ad-vet-license">License: {v.license || v.licenseNumber}</div>
                  </div>
                  {v.emergency && (
                    <span className="ad-badge ad-badge-danger">
                      Emergency
                    </span>
                  )}
                </div>
                <div className="ad-vet-actions">
                  <button
                    className="ad-btn ad-btn-success"
                    disabled={!!actionLoading}
                    onClick={() => handleAction(v._id, "approve")}
                  >
                    {actionLoading === v._id + "approve" ? "..." : "✓ Approve"}
                  </button>
                  <button
                    className="ad-btn ad-btn-danger"
                    disabled={!!actionLoading}
                    onClick={() => handleAction(v._id, "reject")}
                  >
                    ✗ Reject
                  </button>
                  <button
                    className="ad-btn ad-btn-neutral"
                    disabled={!!actionLoading}
                    onClick={() => handleAction(v._id, "resubmit")}
                  >
                    ↩ Resubmit
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {isAddModalOpen && (
        <AddVetModal 
          onClose={() => setIsAddModalOpen(false)}
          onSuccess={() => fetchData()}
        />
      )}

      {selectedUser && (
        <UserProfileModal 
          user={selectedUser}
          onClose={() => setSelectedUser(null)}
        />
      )}
    </div>
  );
}
