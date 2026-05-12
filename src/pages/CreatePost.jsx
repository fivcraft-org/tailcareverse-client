import React, { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import { useNavigate } from "react-router-dom";
import {
  FiChevronLeft,
  FiX,
  FiMapPin,
  FiUsers,
  FiChevronRight,
  FiCamera,
  FiVideo,
  FiSearch,
} from "react-icons/fi";
import { motion, AnimatePresence } from "framer-motion";
import { useTheme } from "../context/ThemeContext";
import { searchUsers } from "../api/api-user";
import { createPost } from "../api/api-post";
import "../styles/create-post.css";
import {
  notifySuccess,
  notifyError,
} from "../utils/services/toast/toast-service";
import ImageCropper from "../components/common/ImageCropper";

const CreatePost = () => {
  const navigate = useNavigate();
  const { theme: t } = useTheme();

  // Post States
  const [media, setMedia] = useState(null);
  const [mediaFile, setMediaFile] = useState(null);
  const [mediaType, setMediaType] = useState(null);
  const [caption, setCaption] = useState("");
  const [location, setLocation] = useState("");
  const [taggedUsers, setTaggedUsers] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Modal States
  const [showLocationModal, setShowLocationModal] = useState(false);
  const [showTagModal, setShowTagModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);

  const [imageToCrop, setImageToCrop] = useState(null);
  const [isCropping, setIsCropping] = useState(false);
  const [aspect, setAspect] = useState(1); // Store selected aspect ratio

  const fileInputRef = useRef(null);

  // User Search Logic
  useEffect(() => {
    if (!showTagModal) return;

    const delay = setTimeout(async () => {
      if (searchQuery.trim().length > 0) {
        setIsSearching(true);
        try {
          const res = await searchUsers(searchQuery);
          setSearchResults(res.data?.users || []);
        } catch (err) {
          console.error("User search failed", err);
        } finally {
          setIsSearching(false);
        }
      } else {
        setSearchResults([]);
      }
    }, 500);

    return () => clearTimeout(delay);
  }, [searchQuery, showTagModal]);

  const handleMediaUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.type.startsWith("image")) {
        setImageToCrop(URL.createObjectURL(file));
        setIsCropping(true);
      } else {
        setMediaFile(file);
        setMediaType("video");
        setMedia(URL.createObjectURL(file));
      }
    }
  };

  const onCropComplete = (croppedFile, croppedUrl, selectedAspect) => {
    setMediaFile(croppedFile);
    setMediaType("image");
    setMedia(croppedUrl);
    setAspect(selectedAspect);
    setIsCropping(false);
    setImageToCrop(null);
  };

  const onCropCancel = () => {
    setIsCropping(false);
    setImageToCrop(null);
  };

  const removeMedia = () => {
    setMedia(null);
    setMediaFile(null);
    setMediaType(null);
  };

  const handleShare = async () => {
    if (!mediaFile || isSubmitting) return;

    if (!caption.trim()) {
      notifyError("Please add a description before sharing!");
      return;
    }

    setIsSubmitting(true);
    try {
      const formData = new FormData();
      formData.append("content", caption);
      formData.append("visibility", "public");
      formData.append("location", location);
      formData.append("tags", JSON.stringify(taggedUsers.map((u) => u._id)));
      formData.append("files", mediaFile);

      await createPost(formData);
      notifySuccess(
        mediaType === "video"
          ? "Your reel has been posted!"
          : "Your post has been shared!",
      );
      navigate("/home");
    } catch (err) {
      console.error("Failed to create post", err);
      const errorMessage =
        err.response?.data?.message ||
        "Something went wrong. Please try again.";
      notifyError(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const toggleTagUser = (user) => {
    if (taggedUsers.find((u) => u._id === user._id)) {
      setTaggedUsers(taggedUsers.filter((u) => u._id !== user._id));
    } else {
      setTaggedUsers([...taggedUsers, user]);
    }
  };

  const mockLocations = [
    "Chennai, Tamil Nadu",
    "Bangalore, Karnataka",
    "Mumbai, Maharashtra",
    "Delhi, NCR",
    "Hyderabad, Telangana",
  ];
  const locationResults = searchQuery
    ? mockLocations.filter((loc) =>
        loc.toLowerCase().includes(searchQuery.toLowerCase()),
      )
    : mockLocations;

  return (
    <div
      className="create-post-container"
      style={{ background: t.background, color: t.text }}
    >
      <div className="create-post-header">
        <button onClick={() => navigate(-1)} style={{ color: t.text }}>
          <FiChevronLeft size={28} />
        </button>
        <h2>New {mediaType === "video" ? "Reel" : "Post"}</h2>
        <button
          className="share-btn"
          disabled={!mediaFile || isSubmitting}
          onClick={handleShare}
        >
          {isSubmitting ? "Sharing..." : "Share"}
        </button>
      </div>

      <div className="media-upload-section">
        <input
          type="file"
          hidden
          ref={fileInputRef}
          accept="image/jpeg,image/png,image/webp,image/jpg,video/mp4,video/quicktime"
          onChange={handleMediaUpload}
        />
        <div
          className={`media-preview-container ${media ? "has-media" : ""} ${
            mediaType === "video" ? "is-reel" : "is-post"
          }`}
          onClick={() => !media && fileInputRef.current.click()}
          style={mediaType === "image" && aspect ? { aspectRatio: aspect } : {}}
        >
          {media ? (
            <>
              {mediaType === "video" ? (
                <video
                  src={media}
                  className="preview-video"
                  autoPlay
                  muted
                  loop
                />
              ) : (
                <img src={media} className="preview-image" alt="preview" />
              )}
              <button
                className="remove-media-btn"
                onClick={(e) => {
                  e.stopPropagation();
                  removeMedia();
                }}
              >
                <FiX size={20} />
              </button>
            </>
          ) : (
            <div className="upload-placeholder">
              {mediaType === "video" ? (
                <FiVideo size={48} className="opacity-30" />
              ) : (
                <FiCamera size={48} className="opacity-30" />
              )}
              <span>Tap to select photo or video</span>
            </div>
          )}
        </div>
      </div>

      <div className="post-form-section">
        <textarea
          placeholder="Write a caption..."
          className="caption-area"
          value={caption}
          onChange={(e) => setCaption(e.target.value)}
          style={{ color: t.text }}
        />

        <div
          className="form-row"
          onClick={() => {
            setShowLocationModal(true);
            setSearchQuery("");
          }}
        >
          <FiMapPin className="form-row-icon" size={20} />
          <div className="flex-1 flex flex-col">
            <span>Add Location</span>
            {location && (
              <span className="selected-location-text">{location}</span>
            )}
          </div>
          <FiChevronRight className="form-row-chevron" size={20} />
        </div>

        <div
          className="form-row"
          onClick={() => {
            setShowTagModal(true);
            setSearchQuery("");
          }}
        >
          <FiUsers className="form-row-icon" size={20} />
          <div className="flex-1 flex flex-col">
            <span>Tag People</span>
            {taggedUsers.length > 0 && (
              <div className="selected-tags mt-1">
                {taggedUsers.map((user) => (
                  <div key={user._id} className="tag-pill">
                    @{user.username}
                  </div>
                ))}
              </div>
            )}
          </div>
          <FiChevronRight className="form-row-chevron" size={20} />
        </div>

        <div className="advanced-options">
          <button className="advanced-toggle" style={{ color: t.textDimmed }}>
            <span>Advanced Settings</span>
            <FiChevronRight size={18} />
          </button>
        </div>
      </div>

      {/* Location Modal */}
      {createPortal(
        <AnimatePresence>
          {showLocationModal && (
            <div
              className="modal-overlay"
              onClick={() => setShowLocationModal(false)}
            >
              <motion.div
                initial={{ y: "100%" }}
                animate={{ y: 0 }}
                exit={{ y: "100%" }}
                className="modal-content"
                onClick={(e) => e.stopPropagation()}
                style={{ background: t.surface }}
              >
                <div className="modal-header">
                  <h3 style={{ color: t.text }}>Select Location</h3>
                  <FiX
                    size={24}
                    onClick={() => setShowLocationModal(false)}
                    className="cursor-pointer"
                    style={{ color: t.text }}
                  />
                </div>
                <div className="search-input-container">
                  <FiSearch className="search-icon" />
                  <input
                    autoFocus
                    className="modal-search-input"
                    placeholder="Search location..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    style={{
                      background: t.background,
                      color: t.text,
                      borderColor: t.border,
                    }}
                  />
                </div>
                <div className="results-list">
                  {locationResults.map((loc) => (
                    <div
                      key={loc}
                      className="result-item"
                      onClick={() => {
                        setLocation(loc);
                        setShowLocationModal(false);
                      }}
                    >
                      <FiMapPin className="text-gray-400" />
                      <span style={{ color: t.text }}>{loc}</span>
                    </div>
                  ))}
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>,
        document.body,
      )}

      {/* Tag People Modal */}
      {createPortal(
        <AnimatePresence>
          {showTagModal && (
            <div
              className="modal-overlay"
              onClick={() => setShowTagModal(false)}
            >
              <motion.div
                initial={{ y: "100%" }}
                animate={{ y: 0 }}
                exit={{ y: "100%" }}
                className="modal-content"
                onClick={(e) => e.stopPropagation()}
                style={{ background: t.surface }}
              >
                <div className="modal-header">
                  <h3 style={{ color: t.text }}>Tag People</h3>
                  <FiX
                    size={24}
                    onClick={() => setShowTagModal(false)}
                    className="cursor-pointer"
                    style={{ color: t.text }}
                  />
                </div>
                <div className="search-input-container">
                  <FiSearch className="search-icon" />
                  <input
                    autoFocus
                    className="modal-search-input"
                    placeholder="Search users..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    style={{
                      background: t.background,
                      color: t.text,
                      borderColor: t.border,
                    }}
                  />
                </div>

                <div className="results-list">
                  {isSearching ? (
                    <div className="p-4 text-center opacity-50">
                      Searching...
                    </div>
                  ) : searchResults.length > 0 ? (
                    searchResults.map((user) => (
                      <div
                        key={user._id}
                        className="result-item"
                        onClick={() => toggleTagUser(user)}
                      >
                        {user.avatar?.url ? (
                          <img
                            src={user.avatar.url}
                            className="avatar-mini"
                            alt={user.username}
                          />
                        ) : (
                          <div className="avatar-placeholder">
                            {user.username[0].toUpperCase()}
                          </div>
                        )}
                        <div className="flex-1">
                          <div className="font-bold" style={{ color: t.text }}>
                            {user.username}
                          </div>
                          <div
                            className="text-sm opacity-50"
                            style={{ color: t.textDimmed }}
                          >
                            {user.fullName || user.email}
                          </div>
                        </div>
                        {taggedUsers.find((u) => u._id === user._id) && (
                          <div className="w-6 h-6 rounded-full bg-emerald-500 flex items-center justify-center text-white">
                            <FiX size={14} />
                          </div>
                        )}
                      </div>
                    ))
                  ) : (
                    searchQuery && (
                      <div className="p-4 text-center opacity-50">
                        No users found
                      </div>
                    )
                  )}
                </div>

                <button
                  className="w-full py-4 mt-4 bg-emerald-500 text-white font-bold rounded-2xl"
                  onClick={() => setShowTagModal(false)}
                >
                  Done ({taggedUsers.length} tagged)
                </button>
              </motion.div>
            </div>
          )}
        </AnimatePresence>,
        document.body,
      )}

      {isCropping && (
        <ImageCropper
          image={imageToCrop}
          onCropComplete={onCropComplete}
          onCancel={onCropCancel}
        />
      )}
    </div>
  );
};

export default CreatePost;
