import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { useParams, useNavigate } from "react-router-dom";
import {
  FiMapPin,
  FiCheckCircle,
  FiShare2,
  FiHeart,
  FiChevronLeft,
  FiMessageCircle,
  FiPhone,
  FiChevronRight,
  FiX,
} from "react-icons/fi";
import { motion, AnimatePresence } from "framer-motion";
import { useTheme } from "../context/ThemeContext";
import { AuthContext } from "../context/AuthContext";
import {
  fetchMarketplaceItemById,
  toggleListingFavorite,
} from "../api/api-marketplace";
import "../styles/marketplace.css";

import { notifications } from "@mantine/notifications";

const ListingDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { theme: t } = useTheme();
  const { user } = React.useContext(AuthContext);

  const [listing, setListing] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeImage, setActiveImage] = useState(0);
  const [isLiked, setIsLiked] = useState(false);
  const [showLightbox, setShowLightbox] = useState(false);

  useEffect(() => {
    if (showLightbox) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [showLightbox]);

  useEffect(() => {
    const loadListing = async () => {
      try {
        const res = await fetchMarketplaceItemById(id);
        setListing(res.data.data);
      } catch (err) {
        console.error("Failed to fetch listing", err);
      } finally {
        setLoading(false);
      }
    };
    loadListing();
  }, [id]);

  const handleShare = async () => {
    const shareData = {
      title: listing.title,
      text: listing.description?.substring(0, 100) + "...",
      url: window.location.href,
    };

    try {
      if (navigator.share) {
        await navigator.share(shareData);
      } else {
        await navigator.clipboard.writeText(window.location.href);
        notifications.show({
          title: "Link Copied",
          message: "The link has been copied to your clipboard.",
          color: "emerald",
        });
      }
    } catch (err) {
      console.error("Error sharing:", err);
    }
  };

  const handleLike = async () => {
    try {
      const res = await toggleListingFavorite(id);
      setIsLiked(res.data.isLiked);
      notifications.show({
        title: res.data.isLiked ? "Added to Favorites" : "Removed from Favs",
        message: res.data.message,
        color: res.data.isLiked ? "red" : "gray",
      });
    } catch (err) {
      console.error("Error liking listing:", err);
      notifications.show({
        title: "Action Failed",
        message: "Could not update favorites. Please try again.",
        color: "red",
      });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-emerald-500/30 border-t-emerald-500 rounded-full animate-spin" />
      </div>
    );
  }

  if (!listing) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center">
        <h2 className="text-xl font-bold mb-4">Listing not found</h2>
        <button
          onClick={() => navigate("/marketplace")}
          className="text-emerald-500 font-bold"
        >
          Back to Marketplace
        </button>
      </div>
    );
  }

  const images =
    listing.images?.length > 0
      ? listing.images
      : [{ url: listing.image || "https://placehold.co/800" }];

  return (
    <>
      <motion.div
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      className="bg-transparent min-h-screen pb-32"
    >
      {/* Top Banner with Carousel */}
      <div className="relative w-full aspect-video md:aspect-video lg:aspect-[21/9] overflow-hidden md:rounded-3xl shadow-lg bg-black/5">
        <button
          onClick={() => navigate(-1)}
          className="absolute top-6 left-6 z-20 p-3 bg-white/90 dark:bg-gray-900/90 backdrop-blur-md rounded-2xl shadow-xl active:scale-95 transition-all text-black dark:text-white border border-white/50 dark:border-gray-800"
        >
          <FiChevronLeft size={24} />
        </button>

        <div className="absolute top-6 right-6 z-20 flex gap-3">
          <button
            onClick={handleShare}
            className="p-3 bg-white/90 dark:bg-gray-900/90 backdrop-blur-md rounded-2xl shadow-xl active:scale-95 transition-all text-black dark:text-white border border-white/50 dark:border-gray-800 group"
          >
            <FiShare2
              size={20}
              className="group-hover:text-emerald-500 transition-colors"
            />
          </button>
          <button
            onClick={handleLike}
            className={`p-3 backdrop-blur-md rounded-2xl shadow-xl active:scale-95 transition-all border ${
              isLiked
                ? "bg-red-500 text-white border-red-500"
                : "bg-white/90 dark:bg-gray-900/90 text-red-500 border-white/50 dark:border-gray-800"
            }`}
          >
            <FiHeart size={20} fill={isLiked ? "currentColor" : "none"} />
          </button>
        </div>

        <div className="absolute inset-0 z-0 bg-black/20">
          <img
            src={images[activeImage].url}
            alt=""
            className="w-full h-full object-cover blur-3xl opacity-30 scale-110"
          />
        </div>

        <AnimatePresence mode="wait">
          <motion.img
            key={activeImage}
            src={images[activeImage].url}
            alt={listing.title}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.05 }}
            className="w-full h-full object-contain relative z-10 cursor-pointer"
            onClick={() => setShowLightbox(true)}
          />
        </AnimatePresence>

        {images.length > 1 && (
          <>
            <button
              onClick={() =>
                setActiveImage((prev) =>
                  prev === 0 ? images.length - 1 : prev - 1,
                )
              }
              className="absolute left-4 top-1/2 -translate-y-1/2 p-2 bg-black/20 hover:bg-black/40 text-white rounded-full backdrop-blur-sm transition-all z-20"
            >
              <FiChevronLeft size={20} />
            </button>
            <button
              onClick={() =>
                setActiveImage((prev) =>
                  prev === images.length - 1 ? 0 : prev + 1,
                )
              }
              className="absolute right-4 top-1/2 -translate-y-1/2 p-2 bg-black/20 hover:bg-black/40 text-white rounded-full backdrop-blur-sm transition-all z-20"
            >
              <FiChevronRight size={20} />
            </button>
            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-1.5 z-20">
              {images.map((_, i) => (
                <div
                  key={i}
                  className={`h-1.5 rounded-full transition-all ${
                    activeImage === i ? "w-6 bg-white" : "w-1.5 bg-white/50"
                  }`}
                />
              ))}
            </div>
          </>
        )}
      </div>

      <div className="px-5 py-8 container mx-auto max-w-4xl">
        <div className="flex justify-between items-start mb-4">
          <div>
            <div className="text-3xl font-black text-emerald-500 mb-1">
              {listing.type === "adoption" || listing.price === 0
                ? "Free / Adoption"
                : `₹${listing.price}`}
            </div>
            <h1
              className="text-2xl font-bold leading-tight"
              style={{ color: t.text }}
            >
              {listing.title}
            </h1>
          </div>
        </div>

        <div
          className="flex items-center gap-3 text-sm opacity-60 mb-8 font-medium"
          style={{ color: t.textDimmed }}
        >
          <div className="flex items-center gap-1">
            <FiMapPin size={16} className="text-emerald-500" />
            {listing.location}
          </div>
          <span>•</span>
          <span>{new Date(listing.createdAt).toLocaleDateString()}</span>
        </div>

        <div className="mt-10">
          <h2
            className="text-xl font-extrabold mb-4 flex items-center gap-2"
            style={{ color: t.text }}
          >
            Description
          </h2>
          <p
            className="leading-relaxed opacity-80 text-[15px] font-medium p-5 rounded-3xl border"
            style={{
              background: t.surface,
              borderColor: t.border,
              color: t.text,
            }}
          >
            {listing.description}
          </p>
        </div>

        {listing.type === "product" && listing.condition && (
          <div className="mt-6 flex items-center gap-2 px-4 py-2 bg-emerald-500/10 text-emerald-500 w-fit rounded-full text-xs font-black uppercase">
            Condition: {listing.condition}
          </div>
        )}
      </div>

      {/* Fixed Bottom Actions */}
      {user?._id !== listing.seller?._id && (
        <div
          className="fixed bottom-20 md:bottom-0 left-0 right-0 md:left-64 lg:right-80 p-5 flex gap-4 z-[110] border-t backdrop-blur-xl md:px-10"
          style={{
            background: t.background,
            borderColor: t.border,
          }}
        >
          <button
            onClick={() => navigate(`/messages?userId=${listing.seller?._id}`)}
            className="flex-1 h-14 font-black rounded-2xl shadow-xl active:scale-[0.98] transition-all text-lg tracking-tight"
            style={{ background: "#2FBF9F", color: "#fff" }}
          >
            Contact Seller
          </button>
        </div>
      )}
      </motion.div>

      {/* Lightbox / Full View Modal */}
      {showLightbox && createPortal(
        <AnimatePresence>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[9999] bg-black/95 backdrop-blur-xl flex items-center justify-center p-4 md:p-10"
          >
            <button
              onClick={() => setShowLightbox(false)}
              className="absolute top-6 right-6 p-3 bg-white/10 hover:bg-white/20 text-white rounded-full transition-all z-[10000]"
            >
              <FiX size={28} />
            </button>

            <div className="relative w-full h-full flex items-center justify-center pointer-events-none">
              <motion.img
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                src={images[activeImage].url}
                alt={listing.title}
                className="max-w-full max-h-full object-contain shadow-2xl rounded-lg pointer-events-auto"
              />

              {images.length > 1 && (
                <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 flex justify-between px-4 pointer-events-none">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setActiveImage((prev) =>
                        prev === 0 ? images.length - 1 : prev - 1,
                      );
                    }}
                    className="p-4 bg-white/10 hover:bg-white/20 text-white rounded-full transition-all pointer-events-auto"
                  >
                    <FiChevronLeft size={32} />
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setActiveImage((prev) =>
                        prev === images.length - 1 ? 0 : prev + 1,
                      );
                    }}
                    className="p-4 bg-white/10 hover:bg-white/20 text-white rounded-full transition-all pointer-events-auto"
                  >
                    <FiChevronRight size={32} />
                  </button>
                </div>
              )}
            </div>

            <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex gap-2 z-[10000]">
              {images.map((_, i) => (
                <div
                  key={i}
                  className={`h-2 rounded-full transition-all ${
                    activeImage === i ? "w-8 bg-emerald-500" : "w-2 bg-white/30"
                  }`}
                />
              ))}
            </div>
          </motion.div>
        </AnimatePresence>,
        document.body
      )}
    </>
  );
};

export default ListingDetail;
