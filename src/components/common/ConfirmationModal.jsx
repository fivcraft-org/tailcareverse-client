import React, { useEffect } from "react";
import ReactDOM from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { AlertCircle, X, CheckCircle, Trash2, UserX, AlertTriangle } from "lucide-react";

 
const ConfirmationModal = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = "Confirm",
  cancelText = "Cancel",
  variant = "danger", 
  loading = false,
}) => {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "auto";
    }
    return () => {
      document.body.style.overflow = "auto";
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const getVariantStyles = () => {
    switch (variant) {
      case "danger":
        return {
          icon: <Trash2 size={28} />,
          color: "#ef4444",
          bg: "bg-red-50",
          text: "text-red-600",
        };
      case "warning":
        return {
          icon: <UserX size={28} />,
          color: "#f59e0b",
          bg: "bg-amber-50",
          text: "text-amber-600",
        };
      case "success":
        return {
          icon: <CheckCircle size={28} />,
          color: "#10b981",
          bg: "bg-emerald-50",
          text: "text-emerald-600",
        };
      case "info":
        return {
          icon: <AlertCircle size={28} />,
          color: "#3b82f6",
          bg: "bg-blue-50",
          text: "text-blue-600",
        };
      default:
        return {
          icon: <AlertTriangle size={28} />,
          color: "#6b7280",
          bg: "bg-gray-50",
          text: "text-gray-600",
        };
    }
  };

  const styles = getVariantStyles();

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
          className="bg-white rounded-[2.5rem] w-full max-w-md overflow-hidden shadow-[0_25px_50px_-12px_rgba(0,0,0,0.25)] border border-neutral-100"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Top accent line */}
          <div 
            className="h-1.5 w-full" 
            style={{ backgroundColor: styles.color }}
          />

          <div className="p-8">
            <div className="flex justify-between items-start mb-6">
              <div className={`p-4 rounded-2xl ${styles.bg} ${styles.text}`}>
                {styles.icon}
              </div>
              <button
                onClick={onClose}
                className="p-2 hover:bg-neutral-100 rounded-full transition-colors text-neutral-400"
              >
                <X size={24} />
              </button>
            </div>

            <h3 className="text-2xl font-black text-neutral-900 leading-tight mb-2">
              {title}
            </h3>
            <p className="text-neutral-500 font-medium leading-relaxed">
              {message}
            </p>

            <div className="flex flex-col sm:flex-row gap-3 mt-8">
              <button
                onClick={onClose}
                className="flex-1 py-4 px-6 border border-neutral-200 rounded-2xl font-bold text-neutral-500 hover:bg-neutral-50 active:scale-[0.98] transition-all"
              >
                {cancelText}
              </button>
              <button
                onClick={onConfirm}
                disabled={loading}
                className="flex-1 py-4 px-6 rounded-2xl font-bold text-white shadow-lg active:scale-[0.98] transition-all disabled:opacity-50 flex items-center justify-center"
                style={{
                  backgroundColor: styles.color,
                  boxShadow: `0 10px 20px -5px ${styles.color}40`,
                }}
              >
                {loading ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  confirmText
                )}
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>,
    document.getElementById("modal-root")
  );
};

export default ConfirmationModal;
