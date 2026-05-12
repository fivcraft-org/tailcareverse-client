import React from "react";
import { FiAlertTriangle, FiX } from "react-icons/fi";

const DeleteConfirmationModal = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  loading,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="bg-white dark:bg-gray-800 rounded-[2.5rem] w-full max-w-md shadow-2xl border border-white/20 overflow-hidden animate-in zoom-in-95 duration-300">
        <div className="p-8">
          <div className="flex justify-between items-start mb-6">
            <div className="p-3 bg-red-50 dark:bg-red-900/20 rounded-2xl text-red-600 dark:text-red-400">
              <FiAlertTriangle size={24} />
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors text-gray-400"
            >
              <FiX size={24} />
            </button>
          </div>

          <h3 className="text-2xl font-black text-gray-800 dark:text-white tracking-tight mb-2">
            {title || "Confirm Deletion"}
          </h3>
          <p className="text-gray-500 dark:text-gray-400 font-medium leading-relaxed">
            {message ||
              "Are you sure you want to delete this? This action cannot be reversed."}
          </p>

          <div className="flex gap-3 mt-8">
            <button
              onClick={onClose}
              className="flex-1 py-4 px-6 border border-gray-200 dark:border-gray-700 rounded-2xl text-sm font-bold text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-all"
            >
              Cancel
            </button>
            <button
              onClick={onConfirm}
              disabled={loading}
              className="flex-1 py-4 px-6 bg-red-600 text-white rounded-2xl text-sm font-bold shadow-lg shadow-red-200 dark:shadow-none hover:bg-red-700 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                "Delete"
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DeleteConfirmationModal;
