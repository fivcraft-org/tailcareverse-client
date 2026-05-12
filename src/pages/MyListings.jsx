import React, { useState, useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";
import {
  FiChevronLeft,
  FiEdit2,
  FiTrash2,
  FiEye,
  FiHeart,
  FiPackage,
  FiAlertCircle,
  FiMapPin,
} from "react-icons/fi";
import { motion, AnimatePresence } from "framer-motion";
import { useTheme } from "../context/ThemeContext";
import { AuthContext } from "../context/AuthContext";
import {
  fetchUserListings,
  deleteMarketplaceItem,
  fetchFavoriteListings,
} from "../api/api-marketplace";
import { notifications } from "@mantine/notifications";
import "../styles/marketplace.css";

const MyListings = () => {
  const navigate = useNavigate();
  const { theme: t } = useTheme();
  const { user } = useContext(AuthContext);
  const [activeTab, setActiveTab] = useState("Active");
  const [listings, setListings] = useState([]);
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modal state
  const [deleteModal, setDeleteModal] = useState({ show: false, id: null });

  const fetchContent = async () => {
    setLoading(true);
    try {
      const [listingsRes, favoritesRes] = await Promise.all([
        fetchUserListings(user._id),
        fetchFavoriteListings(),
      ]);
      setListings(listingsRes.data.data.listings);
      setFavorites(favoritesRes.data.data.listings);
    } catch (err) {
      console.error("Error fetching listings:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user?._id) {
      fetchContent();
    }
  }, [user?._id]);

  const confirmDelete = async () => {
    const id = deleteModal.id;
    try {
      await deleteMarketplaceItem(id);
      setListings((prev) => prev.filter((l) => l._id !== id));
      notifications.show({
        title: "Listing Deleted",
        message: "The item has been removed from marketplace",
        color: "gray",
      });
      setDeleteModal({ show: false, id: null });
    } catch (err) {
      notifications.show({
        title: "Error",
        message: "Failed to delete listing",
        color: "red",
      });
    }
  };

  const currentListings = activeTab === "Favorites" ? favorites : listings;

  if (loading) {
    return (
      <div
        className="min-h-screen flex items-center justify-center"
        style={{ background: t.background }}
      >
        <div className="w-10 h-10 border-2 border-emerald-500/20 border-t-emerald-500 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="min-h-screen pb-24 relative"
      style={{ background: t.background }}
    >
      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {deleteModal.show && (
          <div className="fixed inset-0 z-[1000] flex items-center justify-center p-6">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setDeleteModal({ show: false, id: null })}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="relative w-full max-w-sm bg-white dark:bg-[#1a1f26] rounded-[32px] p-8 text-center shadow-2xl border border-black/5 dark:border-white/5"
            >
              <div className="w-20 h-20 bg-red-500/10 text-red-500 rounded-full flex items-center justify-center mx-auto mb-6">
                <FiAlertCircle size={40} />
              </div>
              <h3 className="text-xl font-bold mb-2" style={{ color: t.text }}>
                Are you sure?
              </h3>
              <p className="text-sm opacity-50 mb-8" style={{ color: t.text }}>
                This action cannot be undone. The listing will be permanently
                removed.
              </p>

              <div className="flex gap-3">
                <button
                  onClick={() => setDeleteModal({ show: false, id: null })}
                  className="flex-1 py-4 rounded-2xl font-bold text-sm bg-black/5 dark:bg-white/5 hover:bg-black/10 transition-all"
                  style={{ color: t.text }}
                >
                  Cancel
                </button>
                <button
                  onClick={confirmDelete}
                  className="flex-1 py-4 rounded-2xl font-bold text-sm bg-red-500 text-white hover:bg-red-600 shadow-lg shadow-red-500/20 transition-all active:scale-95"
                >
                  Delete
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Premium Header */}
      <div
        className="sticky top-0 z-50 px-6 py-4 flex items-center gap-4 backdrop-blur-md border-b"
        style={{
          background:
            t.background === "#0d1117"
              ? "rgba(13,17,23,0.7)"
              : "rgba(255,255,255,0.7)",
          borderColor: t.border,
        }}
      >
        <button
          onClick={() => navigate(-1)}
          className="p-2 rounded-xl transition-all active:scale-95 hover:bg-black/5 dark:hover:bg-white/5"
          style={{ color: t.text }}
        >
          <FiChevronLeft size={24} />
        </button>
        <h1
          className="text-xl font-bold tracking-tight"
          style={{ color: t.text }}
        >
          My Marketplace
        </h1>
      </div>

      {/* Simplified Tabs */}
      <div className="px-6 mt-6">
        <div
          className="inline-flex p-1 rounded-2xl gap-1 mb-8"
          style={{ background: t.surface, border: `1px solid ${t.border}` }}
        >
          {["Active", "Favorites"].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-8 py-2.5 rounded-xl text-sm font-bold transition-all flex items-center gap-2 ${
                activeTab === tab ? "shadow-sm" : "opacity-50 hover:opacity-100"
              }`}
              style={{
                background: activeTab === tab ? t.buttonBg : "transparent",
                color: activeTab === tab ? t.buttonText : t.text,
              }}
            >
              {tab === "Favorites" && (
                <FiHeart
                  size={14}
                  fill={activeTab === tab ? "currentColor" : "none"}
                />
              )}
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* Grid Layout */}
      <div className="px-6">
        <AnimatePresence mode="popLayout">
          {currentListings.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {currentListings.map((listing) => (
                <motion.div
                  layout
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  key={listing._id}
                  className="group bg-white dark:bg-[#1a1f26] rounded-[32px] overflow-hidden border border-black/[0.05] dark:border-white/[0.05] hover:shadow-2xl hover:shadow-black/10 transition-all duration-500"
                >
                  {/* Realistic Image Container */}
                  <div className="relative aspect-[4/3] overflow-hidden">
                    <img
                      src={
                        listing.images?.length > 0
                          ? listing.images[0].url
                          : listing.image || "https://placehold.co/600x450"
                      }
                      alt={listing.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                    />
                    <div className="absolute top-3 right-3 flex gap-2">
                      <div className="px-3 py-1.5 rounded-full bg-black/40 backdrop-blur-md text-white text-[10px] font-bold flex items-center gap-1.5">
                        <FiEye size={12} />
                        {listing.views || 0}
                      </div>
                    </div>
                  </div>

                  {/* Refined Content Area */}
                  <div className="p-5">
                    <div className="flex justify-between items-start mb-1">
                      <h3
                        className="font-bold text-lg leading-tight truncate flex-1"
                        style={{ color: t.text }}
                      >
                        {listing.title}
                      </h3>
                    </div>

                    <p
                      className="font-bold text-xl mb-1"
                      style={{ color: "#10b981" }}
                    >
                      ₹{listing.price?.toLocaleString()}
                    </p>

                    <p
                      className="text-[11px] mb-2 line-clamp-2"
                      style={{ color: t.text }}
                    >
                      {listing.description}
                    </p>

                    <div
                      className="flex items-center gap-1 text-[10px] mb-4"
                      style={{ color: t.text }}
                    >
                      <FiMapPin size={10} />
                      <span className="uppercase font-bold">
                        {listing.location}
                      </span>
                    </div>

                    {/* Action Row */}
                    <div className="flex items-center gap-2 pt-2 border-t border-black/[0.03] dark:border-white/[0.03]">
                      <button
                        onClick={() =>
                          navigate(`/marketplace/item/${listing._id}`)
                        }
                        className="flex-1 py-2.5 rounded-xl font-bold text-xs bg-emerald-500 text-white hover:bg-emerald-600 transition-colors active:scale-95"
                      >
                        View Detail
                      </button>

                      {activeTab !== "Favorites" && (
                        <>
                          <button
                            onClick={() =>
                              navigate(`/marketplace/edit/${listing._id}`)
                            }
                            className="p-2.5 rounded-xl border border-black/[0.08] dark:border-white/[0.08] hover:bg-black/5 dark:hover:bg-white/5 transition-all active:scale-90"
                            style={{ color: t.text }}
                          >
                            <FiEdit2 size={16} />
                          </button>
                          <button
                            onClick={() =>
                              setDeleteModal({ show: true, id: listing._id })
                            }
                            className="p-2.5 rounded-xl border border-red-500/10 text-red-500 hover:bg-red-500 hover:text-white transition-all active:scale-90"
                          >
                            <FiTrash2 size={16} />
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="py-32 text-center"
            >
              <div
                className="w-16 h-16 bg-black/[0.02] dark:bg-white/[0.02] rounded-2xl flex items-center justify-center mx-auto mb-6 border border-black/[0.05] dark:border-white/[0.05]"
                style={{ color: t.text }}
              >
                {activeTab === "Favorites" ? (
                  <FiHeart className="opacity-20" size={32} />
                ) : (
                  <FiPackage className="opacity-20" size={32} />
                )}
              </div>
              <h3 className="text-xl font-bold mb-1" style={{ color: t.text }}>
                {activeTab === "Favorites"
                  ? "No favorites yet"
                  : "No active listings"}
              </h3>
              <p className="text-sm opacity-40" style={{ color: t.text }}>
                {activeTab === "Favorites"
                  ? "Explore items to add them here"
                  : "Your marketplace items will appear here"}
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
};

export default MyListings;
