import React, { useState } from "react";
import AdminModal from "./AdminModal";
import { createProfessional } from "../../api/api-admin";

export default function AddVetModal({ onClose, onSuccess }) {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "Password123", 
    clinicName: "",
    licenseNumber: "",
    experience: "",
    clinicAddress: "",
    contactInfo: { phone: "" },
    specialization: "",
    isEmergencyService: false,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === "phone") {
        setFormData(prev => ({
            ...prev,
            contactInfo: { ...prev.contactInfo, phone: value }
        }));
    } else if (e.target.type === "checkbox") {
        setFormData(prev => ({ ...prev, [name]: e.target.checked }));
    } else {
        setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      // Split specializations if provided
      const finalData = {
        ...formData,
        specialization: formData.specialization.split(",").map(s => s.trim()).filter(s => s),
        experience: Number(formData.experience)
      };

      await createProfessional("vet", finalData);
      onSuccess();
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to create veterinarian");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AdminModal
      title="Add New Veterinarian"
      subtitle="Directly register a new verified veterinarian profile"
      onClose={onClose}
      maxWidth="700px"
      footer={
        <div className="flex justify-end gap-3 w-full">
          <button className="ad-btn ad-btn-neutral" onClick={onClose} disabled={loading}>
            Cancel
          </button>
          <button className="ad-btn ad-btn-primary" onClick={handleSubmit} disabled={loading}>
            {loading ? "Creating..." : "Create Veterinarian"}
          </button>
        </div>
      }
    >
      <form className="ad-form grid grid-cols-2 gap-4" onSubmit={handleSubmit}>
        {error && <div className="col-span-2 p-3 bg-red-50 text-red-600 rounded-lg text-sm font-bold">{error}</div>}
        
        <div className="ad-form-group">
          <label className="ad-label">First Name</label>
          <input
            type="text"
            name="firstName"
            className="ad-input"
            placeholder="e.g. John"
            required
            value={formData.firstName}
            onChange={handleChange}
          />
        </div>
        <div className="ad-form-group">
          <label className="ad-label">Last Name</label>
          <input
            type="text"
            name="lastName"
            className="ad-input"
            placeholder="e.g. Doe"
            required
            value={formData.lastName}
            onChange={handleChange}
          />
        </div>
        <div className="ad-form-group col-span-2">
          <label className="ad-label">Email Address</label>
          <input
            type="email"
            name="email"
            className="ad-input"
            placeholder="vet@example.com"
            required
            value={formData.email}
            onChange={handleChange}
          />
        </div>
        
        <div className="ad-form-group">
          <label className="ad-label">Clinic Name</label>
          <input
            type="text"
            name="clinicName"
            className="ad-input"
            placeholder="Happy Paws Clinic"
            required
            value={formData.clinicName}
            onChange={handleChange}
          />
        </div>
        <div className="ad-form-group">
          <label className="ad-label">License Number</label>
          <input
            type="text"
            name="licenseNumber"
            className="ad-input"
            placeholder="VET-12345"
            required
            value={formData.licenseNumber}
            onChange={handleChange}
          />
        </div>

        <div className="ad-form-group">
          <label className="ad-label">Experience (Years)</label>
          <input
            type="number"
            name="experience"
            className="ad-input"
            placeholder="5"
            required
            value={formData.experience}
            onChange={handleChange}
          />
        </div>
        <div className="ad-form-group">
          <label className="ad-label">Contact Phone</label>
          <input
            type="text"
            name="phone"
            className="ad-input"
            placeholder="+1 234 567 890"
            required
            value={formData.contactInfo.phone}
            onChange={handleChange}
          />
        </div>

        <div className="ad-form-group col-span-2">
          <label className="ad-label">Clinic Address</label>
          <textarea
            name="clinicAddress"
            className="ad-input min-h-[80px]"
            placeholder="123 Vet Street, City, Country"
            required
            value={formData.clinicAddress}
            onChange={handleChange}
          />
        </div>

        <div className="ad-form-group col-span-2">
          <label className="ad-label">Specializations (comma separated)</label>
          <input
            type="text"
            name="specialization"
            className="ad-input"
            placeholder="Surgery, Vaccinations, Dental"
            value={formData.specialization}
            onChange={handleChange}
          />
        </div>

        <div className="ad-form-group col-span-2 flex items-center gap-2">
          <input
            type="checkbox"
            name="isEmergencyService"
            id="isEmergencyService"
            className="w-4 h-4 text-emerald-600 rounded"
            checked={formData.isEmergencyService}
            onChange={handleChange}
          />
          <label htmlFor="isEmergencyService" className="ad-label !mb-0 cursor-pointer">
            Provides Emergency 24/7 Services
          </label>
        </div>
      </form>
    </AdminModal>
  );
}
