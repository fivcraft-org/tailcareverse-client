import React, { useState } from "react";
import { FiX, FiFlag, FiTrash2, FiSlash, FiUserCheck } from "react-icons/fi";
import { deleteChat } from "../../api/api-chat";
import { blockUser, unblockUser } from "../../api/api-user";
import { createReport } from "../../api/api-report";
import {
  notifySuccess,
  notifyError,
} from "../../utils/services/toast/toast-service";

const ChatInfoModal = ({
  chat,
  isOpen,
  onClose,
  isBlocked,
  onBlockUpdate,
  onDeleteChat,
}) => {
  const [loading, setLoading] = useState(false);
  const [showConfirm, setShowConfirm] = useState(null); // 'delete' or 'block' or 'report'

  if (!isOpen) return null;

  const handleDeleteChat = async () => {
    setLoading(true);
    try {
      await deleteChat(chat.id);
      notifySuccess("Chat history deleted");
      onDeleteChat();
      onClose();
    } catch (err) {
      notifyError("Failed to delete chat");
    } finally {
      setLoading(false);
    }
  };

  const handleBlockToggle = async () => {
    setLoading(true);
    try {
      if (isBlocked) {
        await unblockUser(chat.id);
        notifySuccess("User unblocked");
        onBlockUpdate(false);
      } else {
        await blockUser(chat.id);
        notifySuccess("User blocked");
        onBlockUpdate(true);
      }
      onClose();
    } catch (err) {
      notifyError("Operation failed");
    } finally {
      setLoading(false);
    }
  };

  const handleReportUser = async (reason) => {
    setLoading(true);
    try {
      await createReport({
        targetType: "user",
        targetId: chat.id,
        reason: reason,
      });
      notifySuccess("Report submitted");
      onClose();
    } catch (err) {
      notifyError("Failed to submit report");
    } finally {
      setLoading(false);
    }
  };

  const ActionButton = ({
    onClick,
    icon: Icon,
    label,
    color = "inherit",
    flex = false,
  }) => (
    <button
      className={`info-modal-btn ${flex ? "flex-col" : ""}`}
      onClick={onClick}
      style={{ color }}
      disabled={loading}
    >
      <Icon size={18} />
      <span>{label}</span>
    </button>
  );

  return (
    <div className="info-modal-overlay" onClick={onClose}>
      <div className="info-modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="info-modal-header">
          <h3>Details</h3>
          <button onClick={onClose} className="close-btn">
            <FiX size={20} />
          </button>
        </div>

        <div className="info-modal-body">
          <div className="info-modal-user">
            <img
              src={
                chat.avatar ||
                "https://cdn-icons-png.flaticon.com/512/149/149071.png"
              }
              alt={chat.name}
            />
            <h4>{chat.name}</h4>
            <span>
              @{chat.username || chat.name.toLowerCase().replace(/\s/g, "")}
            </span>
          </div>

          <div className="info-modal-actions">
            {!showConfirm && (
              <>
                <ActionButton
                  icon={FiFlag}
                  label="Report User"
                  color="#fa5252"
                  onClick={() => setShowConfirm("report")}
                />
                <ActionButton
                  icon={isBlocked ? FiUserCheck : FiSlash}
                  label={isBlocked ? "Unblock User" : "Block User"}
                  color={isBlocked ? "#22c55e" : "#fa5252"}
                  onClick={() => setShowConfirm("block")}
                />
                <ActionButton
                  icon={FiTrash2}
                  label="Delete Chat"
                  color="#fa5252"
                  onClick={() => setShowConfirm("delete")}
                />
              </>
            )}

            {showConfirm === "delete" && (
              <div className="confirm-view">
                <p>Delete chat with {chat.name}?</p>
                <div className="confirm-actions">
                  <button
                    className="confirm-btn delete"
                    onClick={handleDeleteChat}
                  >
                    Delete
                  </button>
                  <button
                    className="confirm-btn cancel"
                    onClick={() => setShowConfirm(null)}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}

            {showConfirm === "block" && (
              <div className="confirm-view">
                <p>
                  {isBlocked ? "Unblock" : "Block"} {chat.name}?
                </p>
                <div className="confirm-actions">
                  <button
                    className={`confirm-btn ${isBlocked ? "unblock" : "block"}`}
                    onClick={handleBlockToggle}
                  >
                    {isBlocked ? "Unblock" : "Block"}
                  </button>
                  <button
                    className="confirm-btn cancel"
                    onClick={() => setShowConfirm(null)}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}

            {showConfirm === "report" && (
              <div className="report-reasons">
                <p>Reason for reporting</p>
                {["Spam", "Inappropriate content", "Harassment", "Other"].map(
                  (reason) => (
                    <button
                      key={reason}
                      onClick={() => handleReportUser(reason)}
                    >
                      {reason}
                    </button>
                  ),
                )}
                <button
                  className="confirm-btn cancel"
                  style={{ marginTop: "10px" }}
                  onClick={() => setShowConfirm(null)}
                >
                  Cancel
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      <style jsx>{`
        .info-modal-overlay {
          position: fixed;
          inset: 0;
          background: rgba(0, 0, 0, 0.5);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 2000;
          backdrop-filter: blur(2px);
          animation: fadeIn 0.2s ease;
        }
        .info-modal-content {
          background: var(--bg-primary, #fff);
          width: 90%;
          max-width: 320px;
          border-radius: 20px;
          overflow: hidden;
          box-shadow: 0 10px 40px rgba(0, 0, 0, 0.2);
          animation: slideUp 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
        }
        [data-theme="dark"] .info-modal-content {
          background: #1e1e1e;
        }
        .info-modal-header {
          padding: 15px 20px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          border-bottom: 1px solid rgba(0, 0, 0, 0.05);
        }
        [data-theme="dark"] .info-modal-header {
          border-color: rgba(255, 255, 255, 0.05);
        }
        .info-modal-header h3 {
          font-size: 16px;
          font-weight: 700;
          margin: 0;
        }
        .close-btn {
          background: transparent;
          border: none;
          color: inherit;
          cursor: pointer;
          opacity: 0.6;
        }
        .info-modal-body {
          padding-bottom: 20px;
        }
        .info-modal-user {
          display: flex;
          flex-direction: column;
          align-items: center;
          padding: 24px 20px;
        }
        .info-modal-user img {
          width: 72px;
          height: 72px;
          border-radius: 50%;
          object-fit: cover;
          margin-bottom: 12px;
          border: 2px solid var(--primary-color, #22c55e);
        }
        .info-modal-user h4 {
          margin: 0;
          font-size: 18px;
          font-weight: 700;
        }
        .info-modal-user span {
          font-size: 13px;
          opacity: 0.5;
        }
        .info-modal-actions {
          display: flex;
          flex-direction: column;
          padding: 0 10px;
        }
        .info-modal-btn {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 14px 16px;
          background: transparent;
          border: none;
          border-radius: 12px;
          cursor: pointer;
          font-weight: 600;
          font-size: 15px;
          transition: all 0.2s;
          text-align: left;
        }
        .info-modal-btn:hover {
          background: rgba(0, 0, 0, 0.04);
        }
        [data-theme="dark"] .info-modal-btn:hover {
          background: rgba(255, 255, 255, 0.04);
        }
        .confirm-view {
          padding: 10px 10px;
          text-align: center;
        }
        .confirm-view p {
          margin-bottom: 15px;
          font-weight: 600;
        }
        .confirm-actions {
          display: flex;
          gap: 10px;
        }
        .confirm-btn {
          flex: 1;
          padding: 10px;
          border-radius: 10px;
          border: none;
          font-weight: 700;
          cursor: pointer;
        }
        .confirm-btn.delete,
        .confirm-btn.block {
          background: #fa5252;
          color: white;
        }
        .confirm-btn.unblock {
          background: #22c55e;
          color: white;
        }
        .confirm-btn.cancel {
          background: rgba(0, 0, 0, 0.05);
        }
        [data-theme="dark"] .confirm-btn.cancel {
          background: rgba(255, 255, 255, 0.1);
          color: white;
        }
        .report-reasons {
          display: flex;
          flex-direction: column;
          gap: 1px;
        }
        .report-reasons p {
          padding: 0 10px 10px;
          font-weight: 700;
          font-size: 14px;
        }
        .report-reasons button {
          padding: 12px 16px;
          background: transparent;
          border: none;
          text-align: left;
          font-weight: 500;
          cursor: pointer;
          border-radius: 5px;
        }
        .report-reasons button:hover {
          background: rgba(0, 0, 0, 0.04);
        }
        [data-theme="dark"] .report-reasons button:hover {
          background: rgba(255, 255, 255, 0.04);
          color: white;
        }

        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }
        @keyframes slideUp {
          from {
            transform: translateY(20px) scale(0.95);
            opacity: 0;
          }
          to {
            transform: translateY(0) scale(1);
            opacity: 1;
          }
        }
      `}</style>
    </div>
  );
};

export default ChatInfoModal;
