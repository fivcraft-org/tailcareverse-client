import React, { useState, useEffect } from "react";
import {
  FiSearch,
  FiPlay,
  FiCopy,
  FiX,
  FiHeart,
  FiMessageCircle,
} from "react-icons/fi";
import { fetchExplorePosts } from "../api/api-post";
import { searchUsers } from "../api/api-user";
import { useTheme } from "../context/ThemeContext";
import { Link } from "react-router-dom";
import PostDetailModal from "../components/common/PostDetailModal";

export default function Explore() {
  const { theme: t } = useTheme();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedPost, setSelectedPost] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [searchLoading, setSearchLoading] = useState(false);

  useEffect(() => {
    loadExplorePosts();
  }, []);

  // Debounced Search
  useEffect(() => {
    const delay = setTimeout(() => {
      if (searchQuery.trim().length > 0) {
        performSearch(searchQuery);
      } else {
        setIsSearching(false);
        setSearchResults([]);
      }
    }, 500);

    return () => clearTimeout(delay);
  }, [searchQuery]);

  const loadExplorePosts = async () => {
    try {
      setLoading(true);
      const res = await fetchExplorePosts();
      const apiPosts = res.data?.posts || [];

      // Dummy posts
      setPosts(apiPosts);
    } catch (err) {
      console.error("Error fetching posts:", err);
    } finally {
      setLoading(false);
    }
  };

  const performSearch = async (query) => {
    setIsSearching(true);
    setSearchLoading(true);
    try {
      const res = await searchUsers(query);
      setSearchResults(res.data?.users || []);
    } catch (err) {
      console.error("Search error:", err);
      setSearchResults([]);
    } finally {
      setSearchLoading(false);
    }
  };

  const clearSearch = () => {
    setSearchQuery("");
    setIsSearching(false);
    setSearchResults([]);
    setSearchLoading(false);
  };

  const getFullName = (user) => {
    const firstName = user?.profile?.firstName || user?.firstName || "";
    const lastName = user?.profile?.lastName || user?.lastName || "";
    return `${firstName} ${lastName}`.trim() || user.username || "Pet Lover";
  };

  const getAvatar = (user) => {
    return user?.profile?.avatar?.url || user?.avatar?.url || null;
  };

  return (
    <div className="w-full mx-auto px-3 md:px-6 py-4">
      {/* Premium Dark Search */}
      <div className="sticky top-[52px] md:top-0 z-50 pb-5 backdrop-blur-xl  ">
        <div className="relative group">
          <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
            {searchLoading ? (
              <div className="w-4 h-4 border-2 border-emerald-400 border-t-transparent rounded-full animate-spin"></div>
            ) : (
              <FiSearch className="text-gray-400 group-focus-within:text-emerald-400 transition text-lg" />
            )}
          </div>

          <input
            type="text"
            placeholder="Search people or pets..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onFocus={() => searchQuery.length > 0 && setIsSearching(true)}
            className="w-full bg-gray-100 dark:bg-[#111827] text-gray-900 dark:text-white border border-gray-200 dark:border-gray-800 rounded-2xl py-3 pl-12 pr-12
                       focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20
                       outline-none transition-all placeholder:text-gray-500"
          />

          {searchQuery && (
            <button
              onClick={clearSearch}
              className="absolute inset-y-0 right-4 flex items-center text-gray-400 hover:text-white transition"
            >
              <FiX />
            </button>
          )}
        </div>

        {/* Search Results */}
        {isSearching && (
          <div
            className="absolute top-full left-0 right-0 mt-3 bg-white dark:bg-[#0f172a]
                          border border-gray-100 dark:border-gray-800 rounded-2xl shadow-2xl
                          overflow-hidden max-h-[70vh] overflow-y-auto"
          >
            {searchLoading ? (
              <div className="p-8 text-center text-gray-400">Searching...</div>
            ) : searchResults.length > 0 ? (
              searchResults.map((user) => (
                <Link
                  key={user._id}
                  to={`/profile/${user._id}`}
                  onClick={() => setIsSearching(false)}
                  className="flex items-center gap-3 px-4 py-3 hover:bg-emerald-500/10 transition"
                >
                  <div className="w-12 h-12 rounded-full bg-emerald-100 flex items-center justify-center overflow-hidden">
                    {getAvatar(user) ? (
                      <img
                        src={getAvatar(user)}
                        alt={user.username}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <span className="text-emerald-700 font-bold">
                        {(user.username || "?")[0].toUpperCase()}
                      </span>
                    )}
                  </div>

                  <div>
                    <p className="text-gray-900 dark:text-white font-semibold text-sm">
                      {user.username}
                    </p>
                    <p className="text-gray-500 dark:text-gray-400 text-xs">
                      {getFullName(user)}
                    </p>
                  </div>
                </Link>
              ))
            ) : (
              <div className="p-8 text-center text-gray-400">
                No results found
              </div>
            )}
          </div>
        )}
      </div>

      {/* Explore Grid */}
      <div className="grid grid-cols-3 gap-1 md:gap-4">
        {loading
          ? [...Array(9)].map((_, i) => (
              <div
                key={i}
                className="aspect-square bg-gray-800 animate-pulse rounded-xl"
              />
            ))
          : posts.map((post, index) => {
              const isLarge = index % 7 === 2;
              return (
                <div
                  key={post.id || post._id || index}
                  onClick={() => {
                    setSelectedPost(post);
                    setIsModalOpen(true);
                  }}
                  className={`relative group overflow-hidden rounded-xl bg-gray-900 cursor-pointer
                  ${isLarge ? "row-span-2" : "aspect-square"}`}
                >
                  {post.media?.[0]?.type === "video" ||
                  post.media?.[0]?.url?.match(/\.(mp4|mov|avi|wmv)$/) ? (
                    <video
                      src={post.media[0].url}
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                      muted
                      playsInline
                      onMouseEnter={(e) => e.target.play()}
                      onMouseLeave={(e) => {
                        e.target.pause();
                        e.target.currentTime = 0;
                      }}
                    />
                  ) : (
                    <img
                      src={
                        post.media?.[0]?.url ||
                        post.url ||
                        "https://via.placeholder.com/500"
                      }
                      alt="post"
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                    />
                  )}

                  {/* Overlay */}
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition flex items-center justify-center gap-6 text-white text-sm font-bold">
                    <span className="flex items-center gap-1">
                      <FiHeart className="fill-white" /> {post.likesCount || 0}
                    </span>
                    <span className="flex items-center gap-1">
                      <FiMessageCircle className="fill-white" />{" "}
                      {post.commentsCount || 0}
                    </span>
                  </div>

                  {/* Icons */}
                  <div className="absolute top-2 right-2 text-white text-lg">
                    {post.media?.[0]?.type === "video" ||
                    post.media?.[0]?.url?.match(/\.(mp4|mov|avi|wmv)$/) ? (
                      <FiPlay />
                    ) : (
                      post.media?.length > 1 && <FiCopy />
                    )}
                  </div>
                </div>
              );
            })}
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

      {!loading && posts.length === 0 && (
        <div className="text-center py-20 text-gray-400">No posts yet</div>
      )}

      <div className="h-24 md:hidden" />
    </div>
  );
}
