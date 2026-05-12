import React, { useState, useEffect } from "react";
import ReactDOM from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle, XCircle, MessageSquare, AlertCircle } from "lucide-react";

 
const AdminActionModal = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  actionType = "approve",  
  placeholder = "Add some internal notes about this decision...",
  loading = false,
}) => {
  const [notes, setNotes] = useState("");

  useEffect(() => {
    if (isOpen) {
      setNotes("");
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "auto";
    }
    return () => {
      document.body.style.overflow = "auto";
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const isApprove = actionType === "approved" || actionType === "approve";
  const accentColor = isApprove ? "#10b981" : "#ef4444"; // Emerald or Red

  const handleSubmit = (e) => {
    e.preventDefault();
    onConfirm(notes);
  };

  return ReactDOM.createPortal(
    <AnimatePresence>
      <div
        className="fixed inset-0 z-[1000] flex items-center justify-center p-4 bg-black/40 backdrop-blur-md"
        onClick={onClose}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          transition={{ type: "spring", damping: 25, stiffness: 300 }}
          className="bg-white rounded-[2rem] w-full max-w-lg overflow-hidden shadow-[0_25px_50px_-12px_rgba(0,0,0,0.25)] border border-neutral-100"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header Accent Line */}
          <div
            className="h-2 w-full"
            style={{
              background: `linear-gradient(90deg, ${accentColor} 0%, ${accentColor}dd 100%)`,
            }}
          />

          <div className="p-8 md:p-10">
            {/* Icon & Title */}
            <div className="flex items-start gap-4 mb-8">
              <div
                className="p-4 rounded-2xl flex-shrink-0"
                style={{ background: `${accentColor}15`, color: accentColor }}
              >
                {isApprove ? <CheckCircle size={32} /> : <XCircle size={32} />}
              </div>
              <div>
                <h3 className="text-2xl font-black text-neutral-900 leading-tight">
                  {title}
                </h3>
                <p className="text-neutral-500 mt-1 font-medium">
                  Please provide a reason or additional context for this
                  decision.
                </p>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="relative group">
                <div className="absolute top-4 left-4 text-neutral-300 group-focus-within:text-emerald-500 transition-colors">
                  <MessageSquare size={18} />
                </div>
                <textarea
                  autoFocus
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder={placeholder}
                  className="w-full min-h-[140px] pl-12 pr-4 py-4 rounded-2xl bg-neutral-50 border border-neutral-100 outline-none focus:border-emerald-500/50 focus:ring-4 focus:ring-emerald-500/5 transition-all resize-none text-neutral-800 font-medium placeholder:text-neutral-400 placeholder:font-normal"
                />
              </div>

              <div className="flex items-center gap-3 bg-amber-50 p-4 rounded-2xl border border-amber-100/50">
                <AlertCircle
                  size={18}
                  className="text-amber-600 flex-shrink-0"
                />
                <p className="text-[13px] text-amber-800 leading-snug font-medium">
                  Note: This message may be visible to the user as feedback for
                  their request.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-3 pt-2">
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 order-1 sm:order-2 py-4 px-6 rounded-2xl font-bold text-white shadow-lg active:scale-[0.98] transition-all disabled:opacity-50"
                  style={{
                    background: accentColor,
                    boxShadow: `0 10px 20px -5px ${accentColor}40`,
                  }}
                >
                  {loading
                    ? "Processing..."
                    : isApprove
                      ? "Confirm Approval"
                      : "Confirm Rejection"}
                </button>
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 order-2 sm:order-1 py-4 px-6 rounded-2xl font-bold text-neutral-500 border border-neutral-200 hover:bg-neutral-50 active:scale-[0.98] transition-all"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>,
    document.getElementById("modal-root"),
  );
};

export default AdminActionModal;
