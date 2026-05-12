import React, { useState, useEffect, useRef, useContext } from "react";
import { createPortal } from "react-dom";
import {
  FiX,
  FiHeart,
  FiMessageCircle,
  FiRepeat,
  FiBookmark,
  FiSend,
  FiMoreHorizontal,
  FiTrash2,
  FiAlertTriangle,
} from "react-icons/fi";
import { Link } from "react-router-dom";
import { MdVerified } from "react-icons/md";
import { motion, AnimatePresence } from "framer-motion";
import { useTheme } from "../../context/ThemeContext";
import { AuthContext } from "../../context/AuthContext";
import { useSettings } from "../../context/SettingsContext";
import {
  likePost,
  addComment,
  getPostComments,
  deletePost,
} from "../../api/api-post";
import {
  notifySuccess,
  notifyError,
} from "../../utils/services/toast/toast-service";
import { createReport } from "../../api/api-report";

export default function PostDetailModal({
  post,
  isOpen,
  onClose,
  onUpdate,
  onDeleted,
}) {
  const { theme: t } = useTheme();
  const { user: currentUser } = useContext(AuthContext);
  const { settings } = useSettings();
  const [comments, setComments] = useState([]);
  const [commentText, setCommentText] = useState("");
  const [loading, setLoading] = useState(false);
  const [likesCount, setLikesCount] = useState(post?.likesCount || 0);

  // Menu & delete confirm state
  const [menuOpen, setMenuOpen] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showReportOptions, setShowReportOptions] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isReporting, setIsReporting] = useState(false);
  const [hasReported, setHasReported] = useState(false);
  const [selectedReportReason, setSelectedReportReason] = useState("");
  const [reportSuccess, setReportSuccess] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    if (isOpen && post?._id) {
      fetchComments();
      setLikesCount(post.likesCount || 0);
      setMenuOpen(false);
      setShowDeleteConfirm(false);
      setShowReportOptions(false);
      setHasReported(post.hasReported || false);
      setSelectedReportReason("");
      setReportSuccess(false);
    }
  }, [isOpen, post]);

  // Close menu on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setMenuOpen(false);
      }
    };
    if (menuOpen) document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [menuOpen]);

  const fetchComments = async () => {
    try {
      const res = await getPostComments(post._id);
      setComments(res.data?.comments || []);
    } catch (err) {
      console.error("Error fetching comments:", err);
    }
  };

  const handleLike = async () => {
    try {
      await likePost(post._id);
      setLikesCount((prev) => prev + 1);
      if (onUpdate) onUpdate(post._id, { likesCount: likesCount + 1 });
    } catch (err) {
      console.error("Like failed", err);
    }
  };

  const handleSubmitComment = async (e) => {
    e.preventDefault();
    if (!commentText.trim() || loading) return;

    try {
      setLoading(true);
      const res = await addComment(post._id, commentText);
      const newComment = res.data?.comment || {
        _id: Date.now().toString(),
        content: commentText,
        author: currentUser,
        createdAt: new Date().toISOString(),
      };
      setComments((prev) => [newComment, ...prev]);
      setCommentText("");
      if (onUpdate)
        onUpdate(post._id, { commentsCount: (post.commentsCount || 0) + 1 });
    } catch (err) {
      console.error("Comment failed", err);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteConfirmed = async () => {
    try {
      setIsDeleting(true);
      await deletePost(post._id);
      notifySuccess("Post deleted permanently 🗑️");
      setShowDeleteConfirm(false);
      onClose();
      if (onDeleted) onDeleted(post._id);
    } catch (err) {
      console.error("Delete failed", err);
      const errorMessage =
        err.response?.data?.message ||
        "Failed to delete post. Please try again.";
      notifyError(errorMessage);
    } finally {
      setIsDeleting(false);
    }
  };

  const submitReport = async () => {
    if (!selectedReportReason) return;
    try {
      setIsReporting(true);
      await createReport({
        targetType: "post",
        targetId: post._id,
        reason: selectedReportReason,
        description: `User reported as ${selectedReportReason}`,
      });
      setHasReported(true);
      setReportSuccess(true);
      notifySuccess("Post reported. Our moderators will review it shortly. 🛡️");
    } catch (err) {
      console.error("Report failed", err);
      const msg = err.response?.data?.message || "Failed to submit report.";
      if (msg.includes("already reported")) {
        setHasReported(true);
        setShowReportOptions(false);
        setMenuOpen(false);
        notifyError("You have already reported this post");
      } else {
        notifyError(msg);
      }
    } finally {
      setIsReporting(false);
    }
  };

  if (!isOpen || !post) return null;

  const isOwner = currentUser?._id === post.author?._id;
  const isAdmin = ["super_admin", "content_moderator"].includes(
    currentUser?.role,
  );
  const canDelete = isOwner || isAdmin;

  const isVideo =
    post.media?.[0]?.type === "video" ||
    post.media?.[0]?.url?.match(/\.(mp4|mov|avi|wmv)$/);

  return createPortal(
    <div className="fixed inset-0 z-[3000] flex items-center justify-center p-4 md:p-10">
      {/* Overlay */}
      <div
        className="absolute inset-0 bg-black/90 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Close Button Mobile */}
      <button
        onClick={onClose}
        className="absolute top-4 right-4 z-50 text-white md:hidden"
      >
        <FiX size={24} />
      </button>

      {/* Main Content */}
      <div
        className="relative z-10 w-full max-w-6xl h-full max-h-[90vh] bg-white dark:bg-[#0d1117] rounded-xl md:rounded-3xl overflow-hidden flex flex-col md:flex-row shadow-2xl border border-gray-100 dark:border-white/5"
        onClick={(e) => e.stopPropagation()}
        style={{ color: t.text }}
      >
        {/* Left: Media Area */}
        <div className="w-full md:w-[60%] h-[40vh] md:h-full bg-black flex items-center justify-center">
          {isVideo ? (
            <video
              src={post.media[0].url}
              className="w-full h-full object-contain"
              controls
              autoPlay
              loop
            />
          ) : (
            <img
              src={post.media?.[0]?.url || post.url}
              className="w-full h-full object-contain"
              alt="post"
            />
          )}
        </div>

        {/* Right: Info & Comments */}
        <div className="w-full md:w-[40%] flex flex-col h-full bg-white dark:bg-[#0d1117] border-l border-gray-100 dark:border-white/5">
          {/* Header */}
          <div className="p-4 border-b border-gray-100 dark:border-white/5 flex items-center justify-between">
            <Link
              to={`/profile/${post.author?._id}`}
              className="flex items-center gap-3 hover:opacity-80 transition-opacity"
            >
              <div className="w-9 h-9 rounded-full overflow-hidden bg-emerald-500/10 border border-emerald-500/20">
                {post.author?.profile?.avatar?.url ? (
                  <img
                    src={post.author.profile.avatar.url}
                    className="w-full h-full object-cover"
                    alt=""
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center font-bold text-emerald-600 text-sm">
                    {(post.author?.username || "P")[0].toUpperCase()}
                  </div>
                )}
              </div>
              <div>
                <h4 className="font-bold text-sm text-gray-900 dark:text-white flex items-center gap-1">
                  {post.author?.username}
                  {post.author?.isAdminVerified && (
                    <MdVerified className="text-blue-500" size={14} />
                  )}
                </h4>
                {post.location && (
                  <p className="text-[10px] text-emerald-500 font-bold uppercase">
                    {post.location}
                  </p>
                )}
              </div>
            </Link>

            {/* Three-dot menu */}
            <div className="relative" ref={menuRef}>
              <button
                onClick={() => setMenuOpen((prev) => !prev)}
                className="p-2 rounded-full opacity-40 hover:opacity-100 hover:bg-gray-100 dark:hover:bg-white/5 transition-all"
              >
                <FiMoreHorizontal size={20} />
              </button>

              <AnimatePresence>
                {menuOpen && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9, y: -8 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.9, y: -8 }}
                    transition={{ duration: 0.15 }}
                    className="absolute right-0 top-full mt-1 w-44 rounded-2xl shadow-xl border border-gray-100 dark:border-white/10 overflow-hidden z-50"
                    style={{ background: t.surface }}
                  >
                    {canDelete ? (
                      <button
                        onClick={() => {
                          setMenuOpen(false);
                          setShowDeleteConfirm(true);
                        }}
                        className="w-full flex items-center gap-3 px-4 py-3 text-sm text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors font-semibold"
                      >
                        <FiTrash2 size={16} />
                        Delete Post
                      </button>
                    ) : (
                      !hasReported && (
                        <button
                          onClick={() => {
                            setMenuOpen(false);
                            setShowReportOptions(true);
                          }}
                          className="w-full flex items-center gap-3 px-4 py-3 text-sm text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors font-semibold"
                        >
                          <FiAlertTriangle size={16} />
                          Report Post
                        </button>
                      )
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* Comments Area */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 no-scrollbar">
            {/* Post Content/Caption */}
            <div className="flex gap-3 mb-6">
              <Link
                to={`/profile/${post.author?._id}`}
                className="w-8 h-8 rounded-full overflow-hidden flex-shrink-0 bg-emerald-500/10 hover:opacity-80 transition-opacity"
              >
                <img
                  src={
                    post.author?.profile?.avatar?.url ||
                    `https://ui-avatars.com/api/?name=${post.author?.username}&background=random`
                  }
                  className="w-full h-full object-cover"
                  alt=""
                />
              </Link>
              <div className="text-sm">
                <Link
                  to={`/profile/${post.author?._id}`}
                  className="font-bold mr-2 text-gray-900 dark:text-white flex items-center gap-1 inline-flex hover:underline"
                >
                  {post.author?.username}
                  {post.author?.isAdminVerified && (
                    <MdVerified className="text-blue-500" size={12} />
                  )}
                </Link>
                <span className="text-gray-700 dark:text-gray-300">
                  {post.content}
                </span>
                <div className="mt-2 flex flex-wrap gap-2">
                  {post.tags?.map((tag) => (
                    <Link
                      key={tag._id || tag}
                      to={`/profile/${typeof tag === "object" ? tag._id : tag}`}
                      className="text-emerald-500 font-bold hover:underline"
                    >
                      @{typeof tag === "object" ? tag.username : "user"}
                    </Link>
                  ))}
                </div>
                <p className="text-[10px] opacity-30 mt-2 font-bold uppercase tracking-widest">
                  {new Date(post.createdAt).toLocaleDateString()}
                </p>
              </div>
            </div>

            {/* List of comments */}
            {comments.map((comment, idx) => (
              <div
                key={comment._id || idx}
                className="flex gap-3 animate-fadeIn"
              >
                <Link
                  to={`/profile/${comment.author?._id}`}
                  className="w-8 h-8 rounded-full overflow-hidden flex-shrink-0 bg-gray-200 hover:opacity-80 transition-opacity"
                >
                  {comment.author?.profile?.avatar?.url ? (
                    <img
                      src={comment.author.profile.avatar.url}
                      className="w-full h-full object-cover"
                      alt=""
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center font-bold text-[10px] text-emerald-600">
                      {(comment.author?.username || "A")[0].toUpperCase()}
                    </div>
                  )}
                </Link>
                <div className="text-sm">
                  <Link
                    to={`/profile/${comment.author?._id}`}
                    className="font-bold mr-2 text-gray-900 dark:text-white flex items-center gap-1 inline-flex hover:underline"
                  >
                    {comment.author?.username}
                    {comment.author?.isAdminVerified && (
                      <MdVerified className="text-blue-500" size={10} />
                    )}
                  </Link>
                  <span className="text-gray-700 dark:text-gray-300">
                    {comment.content}
                  </span>
                  <div className="flex gap-3 mt-1 opacity-40 text-[10px] font-bold">
                    <span>
                      {new Date(comment.createdAt).toLocaleDateString()}
                    </span>
                    <button className="hover:text-emerald-500 transition">
                      Reply
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Footer: Actions & Input */}
          <div className="p-4 border-t border-gray-100 dark:border-white/5 bg-gray-50/50 dark:bg-transparent">
            <div className="flex items-center gap-4 mb-4">
              <button
                onClick={handleLike}
                className="hover:scale-110 transition-transform"
              >
                <FiHeart
                  size={24}
                  className={
                    likesCount > 0 ? "fill-red-500 text-red-500" : "opacity-70"
                  }
                />
              </button>
              <button className="hover:scale-110 transition-transform opacity-70">
                <FiMessageCircle size={24} />
              </button>
              <button className="hover:scale-110 transition-transform opacity-70">
                <FiRepeat size={24} />
              </button>
              <button className="ml-auto hover:scale-110 transition-transform opacity-70">
                <FiBookmark size={24} />
              </button>
            </div>
            <p className="text-sm font-bold mb-3 text-gray-900 dark:text-white">
              {likesCount} likes
            </p>

            <form
              onSubmit={handleSubmitComment}
              className="flex items-center gap-3"
            >
              <div className="flex-1 relative">
                <input
                  type="text"
                  placeholder="Add a comment..."
                  className="w-full bg-gray-100 dark:bg-white/5 rounded-xl py-2 px-4 pr-10 text-sm focus:outline-none focus:ring-1 focus:ring-emerald-500/30 text-gray-900 dark:text-white"
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                />
                <button
                  type="submit"
                  disabled={!commentText.trim() || loading}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-emerald-500 opacity-60 hover:opacity-100 transition-opacity disabled:opacity-20"
                >
                  <FiSend size={18} />
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>

      {/* ── Delete Confirmation Modal ── */}
      <AnimatePresence>
        {showDeleteConfirm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 z-[3100] flex items-center justify-center p-6"
          >
            <div
              className="absolute inset-0 bg-black/70 backdrop-blur-sm"
              onClick={() => !isDeleting && setShowDeleteConfirm(false)}
            />
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="relative bg-white dark:bg-[#161b22] rounded-3xl overflow-hidden w-full max-w-[340px] shadow-2xl border border-gray-100 dark:border-white/10"
            >
              <div className="p-8 text-center">
                <div className="w-16 h-16 bg-red-500/10 text-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
                  <FiAlertTriangle size={28} />
                </div>
                <h3 className="text-gray-900 dark:text-white font-bold text-lg mb-2">
                  Delete this post?
                </h3>
                <p className="text-gray-500 dark:text-gray-400 text-sm leading-relaxed">
                  This will permanently remove the post and all its media from
                  storage. This action{" "}
                  <span className="font-bold text-red-500">
                    cannot be undone
                  </span>
                  .
                </p>
              </div>

              <div className="flex flex-col border-t border-gray-100 dark:border-white/5">
                <button
                  onClick={handleDeleteConfirmed}
                  disabled={isDeleting}
                  className="w-full py-4 text-red-500 font-bold hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors border-b border-gray-100 dark:border-white/5 flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {isDeleting ? (
                    <>
                      <span className="w-4 h-4 border-2 border-red-400/30 border-t-red-500 rounded-full animate-spin" />
                      Deleting...
                    </>
                  ) : (
                    <>
                      <FiTrash2 size={16} />
                      Delete Forever
                    </>
                  )}
                </button>
                <button
                  onClick={() => setShowDeleteConfirm(false)}
                  disabled={isDeleting}
                  className="w-full py-4 text-gray-700 dark:text-gray-300 font-semibold hover:bg-gray-50 dark:hover:bg-white/5 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showReportOptions && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 z-[3100] flex items-center justify-center p-6"
          >
            <div
              className="absolute inset-0 bg-black/70 backdrop-blur-sm"
              onClick={() => {
                if (!isReporting) {
                  setShowReportOptions(false);
                  setTimeout(() => {
                    setSelectedReportReason("");
                    setReportSuccess(false);
                  }, 300);
                }
              }}
            />
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="relative bg-white dark:bg-[#161b22] rounded-3xl overflow-hidden w-full max-w-[340px] shadow-2xl border border-gray-100 dark:border-white/10"
            >
              {!reportSuccess ? (
                <>
                  <div className="p-6 text-center border-b border-gray-100 dark:border-white/5">
                    <h3 className="text-gray-900 dark:text-white font-bold text-lg">
                      Report
                    </h3>
                  </div>
                  <div className="flex flex-col">
                    {[
                      "Spam",
                      "Nudity or sexual activity",
                      "Hate speech or symbols",
                      "Violence or dangerous organizations",
                      "Bullying or harassment",
                      "False information",
                      "I just don't like it",
                    ].map((reason) => (
                      <button
                        key={reason}
                        onClick={() => setSelectedReportReason(reason)}
                        disabled={isReporting}
                        className="w-full py-4 px-6 text-left text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-white/5 transition-colors border-b border-gray-100 dark:border-white/5 flex items-center justify-between group disabled:opacity-50"
                      >
                        {reason}
                        <div className={`w-5 h-5 rounded-full border flex items-center justify-center transition-colors ${selectedReportReason === reason ? 'border-emerald-500 bg-emerald-500' : 'border-gray-300 dark:border-gray-600 group-hover:border-emerald-500'}`}>
                          {selectedReportReason === reason && (
                            <div className="w-2 h-2 bg-white rounded-full" />
                          )}
                        </div>
                      </button>
                    ))}

                    {selectedReportReason ? (
                      <button
                        onClick={submitReport}
                        disabled={isReporting}
                        className="w-full py-4 bg-emerald-500 text-white font-bold hover:bg-emerald-600 transition-colors flex items-center justify-center"
                      >
                        {isReporting ? (
                          <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        ) : (
                          "Submit Report"
                        )}
                      </button>
                    ) : (
                      <button
                        onClick={() => setShowReportOptions(false)}
                        disabled={isReporting}
                        className="w-full py-4 text-gray-900 dark:text-white font-bold hover:bg-gray-50 dark:hover:bg-white/5 transition-colors"
                      >
                        Cancel
                      </button>
                    )}
                  </div>
                </>
              ) : (
                <div className="p-8 flex flex-col items-center text-center">
                  <div className="w-16 h-16 bg-emerald-500/10 text-emerald-500 flex items-center justify-center rounded-full mb-4">
                    <MdVerified size={32} />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                    Thanks for letting us know
                  </h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mb-6 leading-relaxed">
                    Your feedback helps keep {settings.general.platformName || "TailCareVerse"} a safe and supportive community for everyone.
                  </p>
                  <button
                    onClick={() => {
                      setShowReportOptions(false);
                      window.setTimeout(() => {
                        setSelectedReportReason("");
                        setReportSuccess(false);
                        setMenuOpen(false);
                      }, 300);
                    }}
                    className="w-full py-3 bg-gray-100 dark:bg-white/10 text-gray-900 dark:text-white font-bold rounded-xl hover:bg-gray-200 dark:hover:bg-white/20 transition-colors"
                  >
                    Close
                  </button>
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>,
    document.body,
  );
}
