import React from "react";
import { FiX } from "react-icons/fi";

const PhotoUpdateModal = ({
  isOpen,
  onClose,
  onUpload,
  onRemove,
  title,
  loading,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-[#1e2124] w-full max-w-sm rounded-[24px] overflow-hidden shadow-2xl border border-gray-800 animate-in zoom-in-95 duration-200">
        <div className="py-5 px-6 border-b border-gray-800 text-center relative">
          <h3 className="text-white font-bold text-lg">{title}</h3>
          {!loading && (
            <button
              onClick={onClose}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
            >
              <FiX className="text-xl" />
            </button>
          )}
        </div>

        <div className="flex flex-col">
          <label
            className={`w-full py-4 text-[#4facfe] font-bold text-center transition-colors border-b border-gray-800 flex items-center justify-center gap-2 ${loading ? "opacity-50 cursor-not-allowed" : "hover:bg-white/5 cursor-pointer"}`}
          >
            {loading ? (
              <>
                <div className="w-5 h-5 border-2 border-[#4facfe]/30 border-t-[#4facfe] rounded-full animate-spin" />
                Uploading...
              </>
            ) : (
              "Upload Photo"
            )}
            {!loading && (
              <input
                type="file"
                className="hidden"
                accept="image/*"
                onChange={(e) => onUpload(e)}
              />
            )}
          </label>

          <button
            onClick={onRemove}
            disabled={loading}
            className={`w-full py-4 text-[#ff4b5c] font-bold text-center transition-colors border-b border-gray-800 ${loading ? "opacity-50 cursor-not-allowed" : "hover:bg-white/5"}`}
          >
            Remove Current Photo
          </button>

          <button
            onClick={onClose}
            disabled={loading}
            className={`w-full py-4 text-white font-medium text-center transition-colors ${loading ? "opacity-50 cursor-not-allowed" : "hover:bg-white/5"}`}
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

export default PhotoUpdateModal;
