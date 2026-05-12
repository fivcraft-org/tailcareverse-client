import React, { useState, useEffect } from "react";
import { FiX, FiCheck, FiInfo, FiShield, FiActivity } from "react-icons/fi";
import CustomSelect from "./CustomSelect";

const PetEditModal = ({ isOpen, onClose, pet, onSave, loading }) => {
  const [formData, setFormData] = useState({
    breed: "",
    gender: "unknown",
    age: "",
    vaccinationStatus: "Unknown",
    healthStatus: "Unknown",
  });

  useEffect(() => {
    if (pet) {
      setFormData({
        breed: pet.breed || "",
        gender: pet.gender || "unknown",
        age: pet.age || "",
        vaccinationStatus: pet.vaccinationStatus || "Unknown",
        healthStatus: pet.healthStatus || "Unknown",
      });
    }
  }, [pet]);

  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="bg-white dark:bg-gray-800 rounded-[2.5rem] w-full max-w-lg shadow-2xl border border-white/20 overflow-hidden animate-in zoom-in-95 duration-300">
        <div className="px-8 pt-8 pb-4 flex justify-between items-center border-b border-gray-100 dark:border-gray-700/50">
          <h2 className="text-2xl font-black text-gray-800 dark:text-white tracking-tight">
            Edit Pet Information
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors text-gray-400"
          >
            <FiX size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-6">
          <div className="space-y-4">
            <div>
              <label className="block text-[10px] font-bold text-gray-400 tracking-widest mb-2 ml-1">
                Breed
              </label>
              <input
                type="text"
                name="breed"
                value={formData.breed}
                onChange={handleChange}
                placeholder="e.g. Golden Retriever"
                className="w-full px-5 py-4 bg-gray-50/50 dark:bg-gray-900/50 border border-gray-100 dark:border-gray-700/50 rounded-2xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all dark:text-white font-medium"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <CustomSelect
                label="Gender"
                icon={FiInfo}
                name="gender"
                value={formData.gender}
                onChange={handleChange}
                options={[
                  { id: "male", label: "Male" },
                  { id: "female", label: "Female" },
                  { id: "unknown", label: "Unknown" },
                ]}
              />
              <div>
                <label className="block text-[10px] font-bold text-gray-400 tracking-widest mb-2 ml-1">
                  Age (Years)
                </label>
                <input
                  type="number"
                  name="age"
                  value={formData.age}
                  onChange={handleChange}
                  placeholder="e.g. 2"
                  className="w-full px-5 py-4 bg-gray-50/50 dark:bg-gray-900/50 border border-gray-100 dark:border-gray-700/50 rounded-2xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all dark:text-white font-medium"
                />
              </div>
            </div>

            <CustomSelect
              label="Vaccination"
              icon={FiShield}
              name="vaccinationStatus"
              value={formData.vaccinationStatus}
              onChange={handleChange}
              options={[
                { id: "Up to date", label: "Up to date" },
                { id: "Due soon", label: "Due soon" },
                { id: "Overdue", label: "Overdue" },
                { id: "Unknown", label: "Unknown" },
              ]}
            />
            <CustomSelect
              label="Health Status"
              icon={FiActivity}
              name="healthStatus"
              value={formData.healthStatus}
              onChange={handleChange}
              options={[
                { id: "Excellent", label: "Excellent" },
                { id: "Good", label: "Good" },
                { id: "Fair", label: "Fair" },
                { id: "Critical", label: "Critical" },
                { id: "Unknown", label: "Unknown" },
              ]}
            />
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-4 px-6 border border-gray-200 dark:border-gray-700 rounded-2xl text-sm font-bold text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-all"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 py-4 px-6 bg-emerald-600 text-white rounded-2xl text-sm font-bold shadow-lg shadow-emerald-200 dark:shadow-none hover:bg-emerald-700 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <FiCheck size={18} />
                  Save Changes
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PetEditModal;
