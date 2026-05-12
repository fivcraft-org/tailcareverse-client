import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FiX, FiSend, FiChevronLeft } from "react-icons/fi";

export default function MomentPreviewModal({ file, isOpen, onClose, onShare }) {
  const [previewUrl, setPreviewUrl] = useState(null);
  const [fileType, setFileType] = useState(null);

  useEffect(() => {
    if (file) {
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
      setFileType(file.type.startsWith("video") ? "video" : "image");
      return () => URL.revokeObjectURL(url);
    }
    setPreviewUrl(null);
  }, [file]);

  if (!isOpen || !file) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[110] bg-black flex flex-col items-center justify-center"
      >
        {/* Header */}
        <div className="absolute top-0 left-0 right-0 p-4 flex justify-between items-center z-10 bg-gradient-to-b from-black/50 to-transparent">
          <button
            onClick={onClose}
            className="p-2 text-white hover:bg-white/10 rounded-full transition-colors"
          >
            <FiChevronLeft size={28} />
          </button>
          <h2 className="text-white font-bold">New Moment</h2>
          <button
            onClick={onClose}
            className="p-2 text-white hover:bg-white/10 rounded-full transition-colors"
          >
            <FiX size={28} />
          </button>
        </div>

        {/* Preview Content */}
        <div className="w-full h-full max-w-lg relative bg-[#121212] flex items-center justify-center overflow-hidden md:rounded-3xl shadow-2xl">
          {fileType === "video" ? (
            <video
              src={previewUrl}
              className="w-full h-full object-contain"
              autoPlay
              loop
              muted
            />
          ) : (
            <img
              src={previewUrl}
              className="w-full h-full object-contain"
              alt="Preview"
            />
          )}

          {/* Bottom Actions */}
          <div className="absolute bottom-10 left-0 right-0 px-6 flex justify-end items-center">
            <button
              onClick={() => onShare(file)}
              className="bg-white text-black font-black px-6 py-3 rounded-full flex items-center gap-2 hover:scale-105 active:scale-95 transition-all shadow-xl"
            >
              <span>Share as Moment</span>
              <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center text-white">
                <FiSend size={14} className="ml-0.5" />
              </div>
            </button>
          </div>
        </div>

        {/* Background Blur */}
        <div
          className="absolute inset-0 -z-10 opacity-30 blur-[100px] pointer-events-none"
          style={{
            background: `radial-gradient(circle, #2fbf9f, #6C5CE7)`,
          }}
        />
      </motion.div>
    </AnimatePresence>
  );
}
