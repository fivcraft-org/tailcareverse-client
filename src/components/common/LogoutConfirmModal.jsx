import React, { useEffect } from "react";
import ReactDOM from "react-dom";
import { FiLogOut } from "react-icons/fi";

const LogoutConfirmModal = ({ isOpen, onClose, onConfirm }) => {
  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === "Escape") onClose();
    };

    if (isOpen) {
      window.addEventListener("keydown", handleEsc);
      document.body.style.overflow = "hidden";
    }

    return () => {
      window.removeEventListener("keydown", handleEsc);
      document.body.style.overflow = "auto";
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return ReactDOM.createPortal(
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center p-6 bg-black/50 backdrop-blur-md"
      onClick={onClose}
    >
      <div
        className="bg-[#0f172a]/90 rounded-[2.5rem] w-full max-w-md shadow-2xl border border-white/10"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-10">
          <div className="flex justify-center mb-8">
            <div className="p-5 rounded-[2rem] text-red-500 border border-red-500/20 bg-red-500/10">
              <FiLogOut size={28} />
            </div>
          </div>

          <h3 className="text-3xl font-black text-center text-white mb-4">
            Ready to <span className="text-red-500">Sign Out?</span>
          </h3>

          <p className="text-gray-400 text-center text-base max-w-[320px] mx-auto">
            You're about to leave your session. We'll be here when you return.
          </p>

          <div className="flex flex-col gap-4 mt-8">
            <button
              onClick={onConfirm}
              className="w-full p-4 bg-red-600 hover:bg-red-700 text-white rounded-2xl font-bold transition active:scale-[0.98]"
            >
              Confirm Logout
            </button>

            <button
              onClick={onClose}
              className="w-full p-4 bg-white/5 hover:bg-white/10 text-white rounded-2xl font-semibold border border-white/10"
            >
              Take me back
            </button>
          </div>
        </div>
      </div>
    </div>,
    document.getElementById("modal-root")
  );
};

export default LogoutConfirmModal;