import React, { useEffect } from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";

/**
 * @param {string} title - The main title of the modal.
 * @param {string} subtitle - Optional subtitle/info shown under the title.
 * @param {function} onClose - Function to call when closing the modal.
 * @param {React.ReactNode} children - The main content of the modal.
 * @param {React.ReactNode} footer - Optional footer content (usually buttons).
 * @param {string} maxWidth - Optional CSS max-width override (default: 850px).
 */
export default function AdminModal({
  title,
  subtitle,
  onClose,
  children,
  footer,
  maxWidth = "900px",
}) {
  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === "Escape") onClose();
    };

    window.addEventListener("keydown", handleEsc);

    document.body.style.overflow = "hidden";
    document.body.style.height = "100vh";

    return () => {
      window.removeEventListener("keydown", handleEsc);

      document.body.style.overflow = "";
      document.body.style.height = "";
    };
  }, [onClose]);

  return createPortal(
    <div className="ad-modal-overlay" onClick={onClose}>
      <div
        className="ad-modal"
        onClick={(e) => e.stopPropagation()}
        style={{ maxWidth }}
      >
        <div className="ad-modal-header">
          <div className="ad-modal-title-wrap">
            <h3 className="ad-modal-title">{title}</h3>
            {subtitle && <span className="ad-modal-subtitle">{subtitle}</span>}
          </div>
          <button
            className="ad-modal-close-btn"
            onClick={onClose}
            title="Close Modal"
          >
            <X size={20} />
          </button>
        </div>

        <div className="ad-modal-body">{children}</div>

        {footer && <div className="ad-modal-footer">{footer}</div>}
      </div>
    </div>,
    document.body,
  );
}
