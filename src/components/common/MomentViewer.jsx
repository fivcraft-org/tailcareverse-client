import React, { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  FiX,
  FiChevronLeft,
  FiChevronRight,
  FiTrash2,
  FiAlertTriangle,
} from "react-icons/fi";
import { deleteMoment } from "../../api/api-moments";
import {
  notifySuccess,
  notifyError,
} from "../../utils/services/toast/toast-service";

const DEFAULT_MOMENT_DURATION = 20000;

export default function MomentViewer({
  moments,
  initialUserIndex,
  isOpen,
  onClose,
  currentUser: loggedInUser,
  onMomentDeleted,
}) {
  const [currentUserIndex, setCurrentUserIndex] = useState(null);
  const [currentItemIndex, setCurrentItemIndex] = useState(0);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(DEFAULT_MOMENT_DURATION);
  const [isPaused, setIsPaused] = useState(false);
  const [isHoldPaused, setIsHoldPaused] = useState(false);
  const [isMediaReady, setIsMediaReady] = useState(false);
  const timerRef = useRef(null);
  const videoRef = useRef(null);
  const touchStartTime = useRef(0);
  const wasPausedBeforeHold = useRef(false);
  const preloadRef = useRef(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setCurrentUserIndex(initialUserIndex !== null ? initialUserIndex : 0);
      setCurrentItemIndex(0);
      setProgress(0);
      setIsPaused(false);
    } else {
      setCurrentUserIndex(null);
    }
  }, [isOpen, initialUserIndex]);

  const handleNext = useCallback(() => {
    setIsMediaReady(false);
    setProgress(0);
    const currentUser = moments[currentUserIndex];
    if (currentItemIndex < currentUser.items.length - 1) {
      setCurrentItemIndex((prev) => prev + 1);
    } else if (currentUserIndex < moments.length - 1) {
      setCurrentUserIndex((prev) => prev + 1);
      setCurrentItemIndex(0);
    } else {
      onClose();
    }
  }, [moments, currentUserIndex, currentItemIndex, onClose]);

  const handlePrev = useCallback(() => {
    setIsMediaReady(false);
    setProgress(0);
    if (currentItemIndex > 0) {
      setCurrentItemIndex((prev) => prev - 1);
    } else if (currentUserIndex > 0) {
      setCurrentUserIndex((prev) => prev - 1);
      const prevUser = moments[currentUserIndex - 1];
      setCurrentItemIndex(prevUser.items.length - 1);
    } else {
      setIsMediaReady(true);
    }
  }, [moments, currentUserIndex, currentItemIndex]);

  const handleDelete = async () => {
    if (!loggedInUser || !currentItem) return;

    // Check if it's the user's own moment or they are an admin
    const isAdmin = ["super_admin", "content_moderator"].includes(
      loggedInUser.role,
    );
    const isOwner = currentUser.userId === loggedInUser._id;

    if (!isOwner && !isAdmin) return;

    setIsPaused(true);
    setShowDeleteConfirm(true);
  };

  const confirmDelete = async () => {
    try {
      setIsDeleting(true);
      await deleteMoment(currentItem.id);
      notifySuccess("Moment deleted permanently");

      // Notify parent to refresh list
      if (onMomentDeleted) {
        onMomentDeleted(currentItem.id);
      }

      // Logic to move to next item OR close viewer if no more items
      if (currentUser.items.length > 1) {
        handleNext();
      } else {
        onClose();
      }
    } catch (err) {
      console.error(err);
      notifyError("Failed to delete moment. Please try again.");
      setIsPaused(false);
    } finally {
      setIsDeleting(false);
      setShowDeleteConfirm(false);
    }
  };

  // Safety timeout for media loading
  useEffect(() => {
    if (!isOpen || isMediaReady) return;
    const timeout = setTimeout(() => {
      setIsMediaReady(true);
    }, 3000); // 3 seconds max wait
    return () => clearTimeout(timeout);
  }, [isOpen, isMediaReady, currentItemIndex, currentUserIndex]);

  // Preloading Logic
  useEffect(() => {
    if (!isOpen) return;

    // Determine next item
    let nextItem = null;
    const currentUser = moments[currentUserIndex];
    if (currentItemIndex < currentUser?.items.length - 1) {
      nextItem = currentUser.items[currentItemIndex + 1];
    } else if (currentUserIndex < moments.length - 1) {
      nextItem = moments[currentUserIndex + 1].items[0];
    }

    if (nextItem) {
      if (nextItem.type === "image") {
        const img = new Image();
        img.src = nextItem.url;
      } else {
        const vid = document.createElement("video");
        vid.src = nextItem.url;
        vid.preload = "auto";
      }
    }
  }, [currentUserIndex, currentItemIndex, moments, isOpen]);

  useEffect(() => {
    const activePause = isPaused || isHoldPaused || !isMediaReady;
    if (!isOpen || activePause) {
      if (videoRef.current && isMediaReady) videoRef.current.pause();
      return;
    }

    if (videoRef.current) {
      videoRef.current.play().catch((e) => console.log("Play blocked", e));
    }

    const interval = 50; // Update every 50ms for smooth progress
    const increment = (interval / duration) * 100;

    timerRef.current = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) return 100;
        return prev + increment;
      });
    }, interval);

    return () => clearInterval(timerRef.current);
  }, [isOpen, isPaused, isHoldPaused, isMediaReady, duration]);

  // Handle automatic transition when progress hits 100
  useEffect(() => {
    if (progress >= 100) {
      handleNext();
    }
  }, [progress, handleNext]);

  // Reset duration when item changes
  useEffect(() => {
    setDuration(DEFAULT_MOMENT_DURATION);
  }, [currentUserIndex, currentItemIndex]);

  if (!isOpen || currentUserIndex === null || !moments[currentUserIndex])
    return null;

  const currentUser = moments[currentUserIndex];
  const currentItem = currentUser?.items?.[currentItemIndex];

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        className="fixed inset-0 z-[100] bg-black flex items-center justify-center overflow-hidden"
      >
        {/* Background Blur */}
        <div
          className="absolute inset-0 opacity-40 blur-3xl pointer-events-none"
          style={{
            background: `radial-gradient(circle at center, ${currentUser.color || "#6C5CE7"}, transparent)`,
          }}
        />

        <div className="relative w-full max-w-lg h-full md:h-[90vh] md:rounded-3xl overflow-hidden bg-[#121212] shadow-2xl flex flex-col">
          {/* Progress Bars */}
          <div className="absolute top-0 left-0 right-0 z-50 p-4 flex gap-1 bg-gradient-to-b from-black/60 to-transparent">
            {currentUser.items.map((_, idx) => (
              <div
                key={idx}
                className="h-1 flex-1 bg-white/30 rounded-full overflow-hidden"
              >
                <motion.div
                  className="h-full bg-white"
                  initial={{ width: 0 }}
                  animate={{
                    width:
                      idx < currentItemIndex
                        ? "100%"
                        : idx === currentItemIndex
                          ? `${progress}%`
                          : "0%",
                  }}
                  transition={{ ease: "linear", duration: 0.05 }}
                />
              </div>
            ))}
          </div>

          {/* Header */}
          <div className="absolute top-8 left-0 right-0 z-50 px-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full border-2 border-white/50 overflow-hidden bg-gray-300">
                {currentUser.avatar ? (
                  <img
                    src={currentUser.avatar}
                    className="w-full h-full object-cover"
                    alt=""
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center font-bold text-xs text-gray-500 bg-white">
                    {currentUser.name?.[0]?.toUpperCase()}
                  </div>
                )}
              </div>
              <span className="text-white font-bold text-sm drop-shadow-md">
                {currentUser.name}
              </span>
            </div>
            <div className="flex items-center gap-2">
              {loggedInUser &&
                (currentUser.userId === loggedInUser._id ||
                  ["super_admin", "content_moderator"].includes(
                    loggedInUser.role,
                  )) && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDelete();
                    }}
                    className="p-2 text-white/60 hover:text-red-500 transition-colors"
                    title="Delete moment"
                  >
                    <FiTrash2 size={20} />
                  </button>
                )}
              <button
                onClick={onClose}
                className="p-2 text-white/80 hover:text-white transition-colors"
              >
                <FiX size={24} />
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 relative flex items-center justify-center bg-black">
            <AnimatePresence>
              {currentItem && (
                <motion.div
                  key={`${currentUser.userId || currentUser.id}-${currentItem.id}`}
                  initial={{ opacity: 0, scale: 1.1 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ duration: 0.4 }}
                  className="w-full h-full"
                >
                  {currentItem.type === "video" ? (
                    <video
                      ref={videoRef}
                      src={currentItem.url}
                      className="w-full h-full object-contain"
                      autoPlay
                      playsInline
                      onLoadedMetadata={(e) => {
                        const vidDuration = e.target.duration * 1000;
                        setDuration(
                          Math.min(vidDuration, DEFAULT_MOMENT_DURATION),
                        );
                      }}
                      onLoadedData={() => setIsMediaReady(true)}
                      onEnded={handleNext}
                    />
                  ) : (
                    <img
                      src={currentItem.url}
                      className="w-full h-full object-contain"
                      alt=""
                      onLoad={(e) => {
                        if (e.target.complete) setIsMediaReady(true);
                      }}
                    />
                  )}
                </motion.div>
              )}
            </AnimatePresence>

            {/* Tap Overlays */}
            <div className="absolute inset-0 flex select-none">
              {/* Left Side: Prev */}
              <div
                className="w-1/4 h-full cursor-pointer z-10"
                onClick={(e) => {
                  e.stopPropagation();
                  handlePrev();
                }}
              />

              {/* Middle: Pause/Resume Toggle & Hold to Pause */}
              <div
                className="flex-1 h-full cursor-pointer z-10"
                onPointerDown={(e) => {
                  touchStartTime.current = Date.now();
                  wasPausedBeforeHold.current = isPaused;
                  setIsHoldPaused(true);
                }}
                onPointerUp={(e) => {
                  const duration = Date.now() - touchStartTime.current;
                  setIsHoldPaused(false);

                  // If it was a quick tap (short duration), toggle the permanent pause
                  if (duration < 200) {
                    setIsPaused(!wasPausedBeforeHold.current);
                  }
                }}
                onPointerLeave={() => {
                  setIsHoldPaused(false);
                }}
              />

              {/* Right Side: Next */}
              <div
                className="w-1/4 h-full cursor-pointer z-10"
                onClick={(e) => {
                  e.stopPropagation();
                  handleNext();
                }}
              />
            </div>
          </div>

          {/* Desktop Navigation Arrows */}
          <div className="hidden md:flex absolute inset-y-0 -left-16 items-center">
            <button
              onClick={handlePrev}
              disabled={currentUserIndex === 0 && currentItemIndex === 0}
              className="p-3 bg-white/10 hover:bg-white/20 rounded-full text-white backdrop-blur-md disabled:opacity-30 transition-all"
            >
              <FiChevronLeft size={32} />
            </button>
          </div>
          <div className="hidden md:flex absolute inset-y-0 -right-16 items-center">
            <button
              onClick={handleNext}
              className="p-3 bg-white/10 hover:bg-white/20 rounded-full text-white backdrop-blur-md transition-all"
            >
              <FiChevronRight size={32} />
            </button>
          </div>
        </div>

        {/* Custom Delete Confirmation Modal */}
        <AnimatePresence>
          {showDeleteConfirm && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 z-[110] flex items-center justify-center p-6"
            >
              {/* Overlay Backdrop */}
              <div
                className="absolute inset-0 bg-black/80 backdrop-blur-sm"
                onClick={() => {
                  setShowDeleteConfirm(false);
                  setIsPaused(false);
                }}
              />

              <motion.div
                initial={{ scale: 0.9, opacity: 0, y: 20 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ scale: 0.9, opacity: 0, y: 20 }}
                className="relative bg-[#1a1a1a] rounded-3xl overflow-hidden w-full max-w-[320px] shadow-2xl border border-white/10"
              >
                <div className="p-8 text-center">
                  <div className="w-16 h-16 bg-red-500/10 text-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
                    <FiAlertTriangle size={26} />
                  </div>
                  <h3 className="text-white font-bold text-lg mb-2">
                    Delete Moment?
                  </h3>
                  <p className="text-gray-400 text-sm leading-relaxed">
                    This will permanently remove the moment and its media from
                    storage. This action{" "}
                    <span className="font-bold text-red-500">
                      cannot be undone
                    </span>
                    .
                  </p>
                </div>

                <div className="flex flex-col border-t border-white/5">
                  <button
                    onClick={confirmDelete}
                    disabled={isDeleting}
                    className="w-full py-4 text-red-500 font-bold hover:bg-white/5 transition-colors border-b border-white/5 flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    {isDeleting ? (
                      <>
                        <span className="w-4 h-4 border-2 border-red-400/30 border-t-red-500 rounded-full animate-spin" />
                        Deleting...
                      </>
                    ) : (
                      <>
                        <FiTrash2 size={15} />
                        Delete Forever
                      </>
                    )}
                  </button>
                  <button
                    onClick={() => {
                      setShowDeleteConfirm(false);
                      setIsPaused(false);
                    }}
                    disabled={isDeleting}
                    className="w-full py-4 text-white hover:bg-white/5 transition-colors disabled:opacity-50"
                  >
                    Keep Moment
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </AnimatePresence>
  );
}
