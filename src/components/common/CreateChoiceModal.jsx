import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FiX, FiCamera, FiShoppingBag } from "react-icons/fi";
import { useNavigate } from "react-router-dom";
import { useTheme } from "../../context/ThemeContext";

export default function CreateChoiceModal({ isOpen, onClose }) {
  const { theme: t } = useTheme();
  const navigate = useNavigate();

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          />

          {/* Modal Container */}
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            className="relative w-full max-w-sm rounded-[32px] overflow-hidden shadow-2xl"
            style={{ background: t.surface, border: `1px solid ${t.border}` }}
          >
            <div className="p-8">
              <div className="flex justify-between items-center mb-8">
                <h2
                  className="text-2xl font-black tracking-tight"
                  style={{ color: t.text }}
                >
                  Create
                </h2>
                <button
                  onClick={onClose}
                  className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                  style={{ color: t.textDimmed }}
                >
                  <FiX size={24} />
                </button>
              </div>

              <div className="grid gap-4">
                {/* Post / Reels */}
                <button
                  onClick={() => {
                    navigate("/create-post");
                    onClose();
                  }}
                  className="flex items-center gap-5 p-5 rounded-2xl w-full text-left transition-all hover:scale-[1.02] active:scale-[0.98]"
                  style={{
                    background: t.background,
                    border: `1px solid ${t.border}`,
                  }}
                >
                  <div className="w-12 h-12 rounded-xl bg-purple-500/10 flex items-center justify-center text-purple-500">
                    <FiCamera size={24} />
                  </div>
                  <div>
                    <div
                      className="font-bold text-lg"
                      style={{ color: t.text }}
                    >
                      Post / Reels
                    </div>
                    <div
                      className="text-sm opacity-50"
                      style={{ color: t.textDimmed }}
                    >
                      Share your moments
                    </div>
                  </div>
                </button>

                {/* Sales / Purchase */}
                <button
                  onClick={() => {
                    navigate("/marketplace/create");
                    onClose();
                  }}
                  className="flex items-center gap-5 p-5 rounded-2xl w-full text-left transition-all hover:scale-[1.02] active:scale-[0.98]"
                  style={{
                    background: t.background,
                    border: `1px solid ${t.border}`,
                  }}
                >
                  <div className="w-12 h-12 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-500">
                    <FiShoppingBag size={24} />
                  </div>
                  <div>
                    <div
                      className="font-bold text-lg"
                      style={{ color: t.text }}
                    >
                      Sales / Purchase
                    </div>
                    <div
                      className="text-sm opacity-50"
                      style={{ color: t.textDimmed }}
                    >
                      List items or pets
                    </div>
                  </div>
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
