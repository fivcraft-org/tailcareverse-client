import React, { useState, useEffect, useContext } from "react";
import { Link } from "react-router-dom";
import {
  fetchPosts,
  likePost,
  addComment,
  getPostComments,
} from "../api/api-post";
import {
  FiHeart,
  FiMessageCircle,
  FiRepeat,
  FiBookmark,
  FiSend,
  FiPlay,
  FiCopy,
  FiPlus,
  FiVolume2,
  FiVolumeX,
} from "react-icons/fi";
import { MdVerified } from "react-icons/md";
import { useTheme } from "../context/ThemeContext";
import { AuthContext } from "../context/AuthContext";
import PostDetailModal from "../components/common/PostDetailModal";
import MomentViewer from "../components/common/MomentViewer";
import MomentPreviewModal from "../components/common/MomentPreviewModal";
import {
  fetchMoments,
  createMoment,
  markMomentAsViewed,
} from "../api/api-moments";
import {
  notifySuccess,
  notifyError,
} from "../utils/services/toast/toast-service";

const AutoPlayVideo = ({ src, globalMuted, setGlobalMuted, t }) => {
  const videoRef = React.useRef(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        setInView(entry.isIntersecting);
      },
      { threshold: 0.6 },
    );

    if (videoRef.current) {
      observer.observe(videoRef.current);
    }

    return () => {
      if (videoRef.current) {
        observer.unobserve(videoRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (videoRef.current) {
      if (inView) {
        videoRef.current.play().catch((err) => console.log("Play failed", err));
      } else {
        videoRef.current.pause();
      }
    }
  }, [inView]);

  return (
    <div className="relative group">
      <video
        ref={videoRef}
        src={src}
        className="w-full object-contain max-h-[500px] block mx-auto"
        loop
        playsInline
        muted={globalMuted}
      />

      <button
        onClick={(e) => {
          e.stopPropagation();
          setGlobalMuted(!globalMuted);
        }}
        className="absolute bottom-4 right-4 z-20 p-2 bg-black/50 backdrop-blur-md rounded-full text-white hover:bg-black/70 transition-all opacity-0 group-hover:opacity-100 focus:opacity-100"
      >
        {globalMuted ? <FiVolumeX size={18} /> : <FiVolume2 size={18} />}
      </button>

      {!inView && (
        <div className="absolute inset-0 bg-black/20 flex items-center justify-center pointer-events-none">
          <FiPlay className="text-white/40" size={48} />
        </div>
      )}
    </div>
  );
};

export default function Home() {
  const { theme: t } = useTheme();
  const { user: currentUser } = useContext(AuthContext);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [commentInputs, setCommentInputs] = useState({});
  const [showComments, setShowComments] = useState({});
  const [postComments, setPostComments] = useState({});
  const [selectedPost, setSelectedPost] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeMomentIndex, setActiveMomentIndex] = useState(null);
  const [isMomentOpen, setIsMomentOpen] = useState(false);
  const [viewedMoments, setViewedMoments] = useState({});
  const [isUploadingMoment, setIsUploadingMoment] = useState(false);
  const [selectedMomentFile, setSelectedMomentFile] = useState(null);
  const [isPreviewModalOpen, setIsPreviewModalOpen] = useState(false);
  const [realMoments, setRealMoments] = useState([]);
  const [globalMuted, setGlobalMuted] = useState(true);
  const fileInputRef = React.useRef(null);

  const handleAddMomentClick = () => {
    fileInputRef.current?.click();
  };

  const handleMomentFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedMomentFile(file);
      setIsPreviewModalOpen(true);
    }
  };

  const handleShareMoment = async () => {
    if (!selectedMomentFile) return;

    setIsPreviewModalOpen(false);
    setIsUploadingMoment(true);

    try {
      const formData = new FormData();
      formData.append("file", selectedMomentFile);
      formData.append(
        "type",
        selectedMomentFile.type.startsWith("video") ? "video" : "image",
      );

      await createMoment(formData);
      // Reload moments
      const momentRes = await fetchMoments();
      setRealMoments(momentRes.data || []);
      setSelectedMomentFile(null);

      // Play upload sound
      const audio = new Audio(
        "https://cdn.pixabay.com/audio/2022/03/15/audio_5b66d5b942.mp3",
      );
      audio.play().catch((e) => console.log("Audio play blocked", e));
      notifySuccess("Your moment has been shared!");
    } catch (err) {
      console.error("Error sharing moment:", err);
      notifyError("Failed to share moment. Please try again.");
    } finally {
      setIsUploadingMoment(false);
    }
  };

  const loadFeed = async () => {
    try {
      setLoading(true);
      const [postRes, momentRes] = await Promise.all([
        fetchPosts(),
        fetchMoments(),
      ]);
      setPosts(postRes.data?.posts || []);
      setRealMoments(momentRes.data || []);
    } catch (err) {
      console.error("Error loading feed:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadFeed();
  }, []);

  const handleLike = async (postId) => {
    try {
      await likePost(postId);
      setPosts((prev) =>
        prev.map((p) =>
          p._id === postId ? { ...p, likesCount: p.likesCount + 1 } : p,
        ),
      );
    } catch (err) {
      console.error("Like failed", err);
    }
  };

  const toggleComments = async (postId) => {
    if (showComments[postId]) {
      setShowComments((prev) => ({ ...prev, [postId]: false }));
      return;
    }

    try {
      const res = await getPostComments(postId);
      setPostComments((prev) => ({
        ...prev,
        [postId]: res.data?.comments || [],
      }));
      setShowComments((prev) => ({ ...prev, [postId]: true }));
    } catch (err) {
      console.error("Error fetching comments:", err);
    }
  };

  const handleCommentSubmit = async (postId) => {
    const text = commentInputs[postId];
    if (!text?.trim()) return;

    try {
      const res = await addComment(postId, text);
      const newComment = res.data?.comment || {
        content: text,
        author: currentUser,
        createdAt: new Date().toISOString(),
      };

      setPostComments((prev) => ({
        ...prev,
        [postId]: [newComment, ...(prev[postId] || [])],
      }));
      setCommentInputs((prev) => ({ ...prev, [postId]: "" }));
      setPosts((prev) =>
        prev.map((p) =>
          p._id === postId
            ? { ...p, commentsCount: (p.commentsCount || 0) + 1 }
            : p,
        ),
      );
    } catch (err) {
      console.error("Comment failed", err);
    }
  };

  return (
    <div
      className="flex flex-col items-center py-4 md:py-6"
      style={{ background: t.background }}
    >
      {/* Moments */}
      <div className="w-full md:max-w-2xl px-4 mb-8 overflow-x-auto flex gap-5 no-scrollbar">
        {/* Current User Add Moment */}
        {(() => {
          const myMomentIndex = realMoments.findIndex(
            (s) => s.userId === currentUser?._id,
          );
          const hasMoments = myMomentIndex !== -1;
          const myViewed = hasMoments ? viewedMoments[currentUser?._id] : false;

          return (
            <div className="flex flex-col items-center flex-shrink-0 cursor-pointer group">
              <div
                className="relative w-16 h-16 md:w-20 md:h-20 rounded-full p-[3px] transition-transform active:scale-95"
                style={{
                  background: hasMoments
                    ? myViewed
                      ? "rgba(156, 163, 175, 0.3)"
                      : `linear-gradient(45deg, #2fbf9f, #6C5CE7)`
                    : "transparent",
                }}
                onClick={() => {
                  if (hasMoments) {
                    setActiveMomentIndex(myMomentIndex);
                    setIsMomentOpen(true);
                  } else {
                    handleAddMomentClick();
                  }
                }}
              >
                <div
                  className={`w-full h-full rounded-full border-2 border-white dark:border-[#0d1117] overflow-hidden bg-gray-300 ${isUploadingMoment ? "animate-pulse opacity-50" : ""}`}
                >
                  {currentUser?.profile?.avatar?.url ? (
                    <img
                      src={currentUser.profile.avatar.url}
                      className="w-full h-full object-cover transition-transform group-hover:scale-110"
                      alt="Your moment"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center font-bold text-gray-500 bg-white">
                      {currentUser?.username?.[0]?.toUpperCase() || "Y"}
                    </div>
                  )}
                </div>

                {isUploadingMoment ? (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                  </div>
                ) : (
                  <div
                    className="absolute bottom-0 right-0 w-6 h-6 md:w-7 md:h-7 bg-blue-500 rounded-full border-2 border-white dark:border-[#0d1117] flex items-center justify-center text-white shadow-lg group-hover:scale-110 transition-transform z-10"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleAddMomentClick();
                    }}
                  >
                    <FiPlus size={16} strokeWidth={4} />
                  </div>
                )}
              </div>
              <p
                className="text-[11px] font-bold mt-2 tracking-widest opacity-40 group-hover:opacity-100 transition-opacity"
                style={{ color: t.text }}
              >
                Your story
              </p>
              <input
                type="file"
                ref={fileInputRef}
                className="hidden"
                accept="image/*,video/*"
                onChange={handleMomentFileChange}
              />
            </div>
          );
        })()}

        {realMoments
          .filter((m) => m.userId !== currentUser?._id)
          .map((moment) => {
            const indexInReal = realMoments.findIndex(
              (rm) => rm.userId === moment.userId,
            );
            return (
              <div
                key={moment.userId}
                className="flex flex-col items-center flex-shrink-0 cursor-pointer"
                onClick={() => {
                  setActiveMomentIndex(indexInReal);
                  setIsMomentOpen(true);
                }}
              >
                <div
                  className="w-16 h-16 md:w-20 md:h-20 rounded-full p-[3px] transition-transform active:scale-90"
                  style={{
                    background: viewedMoments[moment.userId]
                      ? "rgba(156, 163, 175, 0.3)"
                      : `linear-gradient(45deg, #2fbf9f, #6C5CE7)`,
                  }}
                >
                  <div
                    className="w-full h-full rounded-full border-2 border-white dark:border-[#0d1117] overflow-hidden bg-gray-200"
                    style={{
                      background: moment.isAnnouncement
                        ? "linear-gradient(45deg, #FFD700, #FF8C00)"
                        : "#f3f4f6",
                    }}
                  >
                    {moment.isAnnouncement ? (
                      <div className="w-full h-full flex items-center justify-center text-white text-xl md:text-2xl transition-transform hover:scale-110">
                        🐾
                      </div>
                    ) : moment.avatar ? (
                      <img
                        src={moment.avatar}
                        className="w-full h-full object-cover"
                        alt={moment.name}
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center font-bold text-gray-500">
                        {moment.name?.[0]?.toUpperCase()}
                      </div>
                    )}
                  </div>
                </div>
                <p
                  className="text-[11px] font-bold mt-2 uppercase tracking-widest opacity-60"
                  style={{ color: t.text }}
                >
                  {moment.name}
                </p>
              </div>
            );
          })}
      </div>

      {/* Feed */}
      <div className="w-full md:max-w-xl space-y-8">
        {loading ? (
          [...Array(2)].map((_, i) => (
            <div key={i} className="animate-pulse px-4">
              <div className="h-10 w-10 bg-gray-300 rounded-full mb-4"></div>
              <div className="h-64 bg-gray-300 rounded-3xl"></div>
            </div>
          ))
        ) : posts.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-center px-6">
            <div className="w-24 h-24 mb-6 bg-gradient-to-tr from-emerald-500/10 to-6C5CE7/10 rounded-[40px] flex items-center justify-center text-emerald-500 shadow-inner">
              <FiPlus size={40} className="opacity-40" />
            </div>
            <h3
              className="text-2xl font-black tracking-tight mb-3"
              style={{ color: t.text }}
            >
              No Feed Activity
            </h3>
            <p
              className="text-sm opacity-50 max-w-[280px] leading-relaxed mx-auto font-medium"
              style={{ color: t.text }}
            >
              It looks a bit quiet here. Start following your friends or share
              your first pet moment to see posts and reels!
            </p>
            <button
              onClick={() => (window.location.href = "/explore")}
              className="mt-8 px-8 py-3 bg-emerald-500 text-white rounded-full font-black text-sm tracking-widest uppercase hover:scale-105 active:scale-95 transition-all shadow-lg shadow-emerald-500/20"
            >
              Explore Community
            </button>
          </div>
        ) : (
          posts.map((post) => (
            <div key={post._id} className="group" style={{ color: t.text }}>
              {/* Header */}
              <div className="flex items-center justify-between p-4">
                <Link
                  to={`/profile/${post.author?._id}`}
                  className="flex items-center gap-3 hover:opacity-80 transition-opacity"
                >
                  <div className="w-11 h-11 rounded-full bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20 overflow-hidden">
                    {post.author?.profile?.avatar?.url ? (
                      <img
                        src={post.author.profile.avatar.url}
                        className="w-full h-full object-cover"
                        alt=""
                      />
                    ) : (
                      <span className="font-bold text-emerald-600">
                        {(post.author?.username || "P")[0].toUpperCase()}
                      </span>
                    )}
                  </div>
                  <div>
                    <h4 className="font-black text-sm tracking-tight flex items-center gap-1">
                      {post.author?.username || "Anonymous"}
                      {post.author?.isAdminVerified && (
                        <MdVerified className="text-blue-500" size={14} />
                      )}
                    </h4>
                    {post.location && (
                      <p className="text-[10px] font-bold uppercase tracking-widest text-emerald-500">
                        {post.location}
                      </p>
                    )}
                  </div>
                </Link>
                <button className="opacity-40">
                  <FiRepeat size={20} />
                </button>
              </div>

              <div className="px-3">
                <div
                  className="relative rounded-[32px] overflow-hidden shadow-2xl shadow-emerald-900/10 bg-black/5 cursor-pointer"
                  onClick={() => {
                    setSelectedPost(post);
                    setIsModalOpen(true);
                  }}
                >
                  {post.media?.[0]?.type === "video" ||
                  post.media?.[0]?.url?.match(/\.(mp4|mov|avi|wmv)$/) ? (
                    <AutoPlayVideo
                      src={post.media[0].url}
                      globalMuted={globalMuted}
                      setGlobalMuted={setGlobalMuted}
                      t={t}
                    />
                  ) : (
                    <img
                      src={
                        post.media?.[0]?.url ||
                        "https://images.unsplash.com/photo-1543466835-00a7907e9de1?q=80&w=1200"
                      }
                      alt="post"
                      className="w-full object-contain max-h-[500px] block mx-auto transition-transform duration-700 group-hover:scale-105"
                    />
                  )}
                </div>
              </div>

              {/* Actions */}
              <div className="p-5">
                <div className="flex items-center gap-6 mb-4">
                  <button
                    onClick={() => handleLike(post._id)}
                    className="flex items-center gap-2 hover:scale-110 transition-transform"
                  >
                    <FiHeart
                      size={26}
                      className={
                        post.likesCount > 0
                          ? "fill-red-500 text-red-500"
                          : "opacity-70"
                      }
                    />
                    <span className="font-black text-sm">
                      {post.likesCount || 0}
                    </span>
                  </button>
                  <button
                    onClick={() => toggleComments(post._id)}
                    className="flex items-center gap-2 hover:scale-110 transition-transform"
                  >
                    <FiMessageCircle
                      size={26}
                      className={
                        showComments[post._id]
                          ? "text-emerald-500"
                          : "opacity-70"
                      }
                    />
                    <span className="font-black text-sm">
                      {post.commentsCount || 0}
                    </span>
                  </button>
                  <button className="ml-auto opacity-70">
                    <FiBookmark size={26} />
                  </button>
                </div>

                {/* Caption & Content */}
                <div className="space-y-2">
                  <p className="text-sm leading-relaxed">
                    <Link
                      to={`/profile/${post.author?._id}`}
                      className="font-black mr-2 tracking-tight flex items-center gap-1 inline-flex hover:underline"
                    >
                      {post.author?.username}
                      {post.author?.isAdminVerified && (
                        <MdVerified className="text-blue-500" size={12} />
                      )}
                    </Link>
                    <span className="opacity-80">{post.content}</span>
                  </p>
                  {post.tags?.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {post.tags.map((tag) => (
                        <span
                          key={tag._id || tag}
                          className="text-emerald-500 text-xs font-bold"
                        >
                          #{typeof tag === "object" ? tag.username : tag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                {/* Comment Section - Only show when toggled */}
                {showComments[post._id] && (
                  <div className="mt-4 animate-fadeIn">
                    {/* Comment Input */}
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-8 h-8 rounded-full overflow-hidden flex-shrink-0 bg-gray-200">
                        {currentUser?.profile?.avatar?.url ? (
                          <img
                            src={currentUser.profile.avatar.url}
                            className="w-full h-full object-cover"
                            alt=""
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center font-bold text-xs text-emerald-600">
                            {(currentUser?.username || "Y")[0].toUpperCase()}
                          </div>
                        )}
                      </div>
                      <div className="flex-1 relative">
                        <input
                          type="text"
                          placeholder="Add a comment..."
                          className="w-full bg-gray-100 dark:bg-white/5 rounded-full py-2 px-4 pr-10 text-sm outline-none focus:ring-1 focus:ring-emerald-500/30"
                          value={commentInputs[post._id] || ""}
                          onChange={(e) =>
                            setCommentInputs((prev) => ({
                              ...prev,
                              [post._id]: e.target.value,
                            }))
                          }
                          onKeyPress={(e) =>
                            e.key === "Enter" && handleCommentSubmit(post._id)
                          }
                        />
                        <button
                          onClick={() => handleCommentSubmit(post._id)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-emerald-500 opacity-60 hover:opacity-100 transition-opacity"
                        >
                          <FiSend size={18} />
                        </button>
                      </div>
                    </div>

                    {/* Comments List */}
                    <div className="space-y-3 pt-4 border-t border-gray-100 dark:border-white/5">
                      {(postComments[post._id] || []).length > 0 ? (
                        postComments[post._id].map((comment, idx) => (
                          <div key={comment._id || idx} className="flex gap-3">
                            <Link
                              to={`/profile/${comment.author?._id}`}
                              className="w-7 h-7 rounded-full overflow-hidden flex-shrink-0 bg-gray-200 hover:opacity-80 transition-opacity"
                            >
                              {comment.author?.profile?.avatar?.url ? (
                                <img
                                  src={comment.author.profile.avatar.url}
                                  className="w-full h-full object-cover"
                                  alt=""
                                />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center font-bold text-[10px] text-emerald-600">
                                  {(comment.author?.username ||
                                    "A")[0].toUpperCase()}
                                </div>
                              )}
                            </Link>
                            <div className="text-sm">
                              <Link
                                to={`/profile/${comment.author?._id}`}
                                className="font-bold mr-2 flex items-center gap-1 inline-flex hover:underline"
                              >
                                {comment.author?.username}
                                {comment.author?.isAdminVerified && (
                                  <MdVerified
                                    className="text-blue-500"
                                    size={10}
                                  />
                                )}
                              </Link>
                              <span className="opacity-80">
                                {comment.content}
                              </span>
                            </div>
                          </div>
                        ))
                      ) : (
                        <p className="text-xs opacity-40 text-center py-2">
                          No comments yet. Be the first!
                        </p>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>
      <PostDetailModal
        post={selectedPost}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onUpdate={(postId, updates) => {
          setPosts((prev) =>
            prev.map((p) => (p._id === postId ? { ...p, ...updates } : p)),
          );
        }}
        onDeleted={(postId) => {
          setPosts((prev) => prev.filter((p) => p._id !== postId));
          setIsModalOpen(false);
        }}
      />
      <MomentViewer
        moments={realMoments}
        initialUserIndex={activeMomentIndex}
        isOpen={isMomentOpen}
        currentUser={currentUser}
        onMomentDeleted={() => {
          // Re-fetch moments from server to have a clean state
          fetchMoments().then((res) => {
            if (res.success) setRealMoments(res.data);
          });
        }}
        onClose={() => {
          setIsMomentOpen(false);
          if (activeMomentIndex !== null && realMoments[activeMomentIndex]) {
            const viewedUser = realMoments[activeMomentIndex];
            setViewedMoments((prev) => ({
              ...prev,
              [viewedUser.userId]: true,
            }));
            // Call API to mark moments as viewed
            viewedUser.items.forEach((item) => markMomentAsViewed(item.id));
          }
        }}
      />
      <MomentPreviewModal
        file={selectedMomentFile}
        isOpen={isPreviewModalOpen}
        onClose={() => {
          setIsPreviewModalOpen(false);
          setSelectedMomentFile(null);
        }}
        onShare={handleShareMoment}
      />
    </div>
  );
}
