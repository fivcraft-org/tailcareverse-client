import React, { useState, useEffect } from "react";
import { FiX, FiSearch, FiUserPlus, FiUserCheck } from "react-icons/fi";
import { Link } from "react-router-dom";
import { getFollowers, getFollowing } from "../../api/api-user";
import { followUser, unfollowUser } from "../../api/api-follow";

export default function FollowModal({
  isOpen,
  onClose,
  userId,
  type,
  currentUserId,
}) {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredUsers, setFilteredUsers] = useState([]);

  useEffect(() => {
    if (isOpen && userId) {
      fetchUsers();
    }
  }, [isOpen, userId, type]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const res =
        type === "followers"
          ? await getFollowers(userId)
          : await getFollowing(userId);

      const userList =
        type === "followers" ? res.data.followers : res.data.following;
      setUsers(userList || []);
      setFilteredUsers(userList || []);
    } catch (err) {
      console.error(`Failed to fetch ${type}`, err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const filtered = users.filter(
      (u) =>
        u.username?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        u.profile?.firstName
          ?.toLowerCase()
          .includes(searchQuery.toLowerCase()) ||
        u.profile?.lastName?.toLowerCase().includes(searchQuery.toLowerCase()),
    );
    setFilteredUsers(filtered);
  }, [searchQuery, users]);

  if (!isOpen) return null;

  const getFullName = (u) => {
    const first = u.profile?.firstName || "";
    const last = u.profile?.lastName || "";
    return `${first} ${last}`.trim() || u.username;
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="bg-white dark:bg-gray-900 w-full max-w-md rounded-[2rem] shadow-2xl overflow-hidden flex flex-col h-[80vh] md:h-[600px] animate-in zoom-in-95 duration-300">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between bg-white dark:bg-gray-900 sticky top-0 z-10">
          <h3 className="text-xl font-bold text-gray-800 dark:text-white capitalize">
            {type}
          </h3>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors text-gray-500"
          >
            <FiX size={24} />
          </button>
        </div>

        {/* Search */}
        <div className="p-4 border-b border-gray-50 dark:border-gray-800">
          <div className="relative group">
            <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-emerald-500 transition-colors" />
            <input
              type="text"
              placeholder={`Search ${type}...`}
              className="w-full bg-gray-50 dark:bg-gray-800 border-none rounded-2xl py-3 pl-12 pr-4 focus:ring-2 focus:ring-emerald-500/20 focus:bg-white dark:focus:bg-gray-700 transition-all outline-none text-sm text-gray-800 dark:text-gray-100"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        {/* List */}
        <div className="flex-1 overflow-y-auto p-2 scrollbar-hide">
          {loading ? (
            <div className="flex flex-col items-center justify-center h-full gap-3 text-gray-400">
              <div className="w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
              <p className="text-sm font-medium">Loading {type}...</p>
            </div>
          ) : filteredUsers.length > 0 ? (
            <div className="space-y-1">
              {filteredUsers.map((u) => (
                <div
                  key={u._id}
                  className="flex items-center justify-between px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-2xl transition-all group"
                >
                  <Link
                    to={`/profile/${u._id}`}
                    onClick={onClose}
                    className="flex items-center gap-3 flex-1 min-w-0"
                  >
                    <div className="w-12 h-12 rounded-full border-2 border-white dark:border-gray-800 shadow-sm overflow-hidden bg-emerald-50 dark:bg-emerald-900/30 shrink-0">
                      {u.profile?.avatar?.url ? (
                        <img
                          src={u.profile.avatar.url}
                          alt={u.username}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-emerald-600 dark:text-emerald-400 font-bold text-lg">
                          {u.username[0]}
                        </div>
                      )}
                    </div>
                    <div className="truncate">
                      <p className="font-bold text-gray-800 dark:text-gray-100 text-sm group-hover:text-emerald-600 transition-colors">
                        {u.username}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                        {getFullName(u)}
                      </p>
                    </div>
                  </Link>

                  <Link
                    to={`/profile/${u._id}`}
                    onClick={onClose}
                    className="px-4 py-1.5 bg-gray-100 dark:bg-gray-800 hover:bg-emerald-500 hover:text-white text-gray-700 dark:text-gray-300 text-xs font-bold rounded-lg transition-all"
                  >
                    View
                  </Link>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-center px-6">
              <div className="w-16 h-16 bg-gray-50 dark:bg-gray-800 rounded-full flex items-center justify-center mb-4">
                <FiSearch
                  size={32}
                  className="text-gray-200 dark:text-gray-700"
                />
              </div>
              <p className="text-gray-800 dark:text-gray-200 font-bold">
                No results found
              </p>
              <p className="text-gray-400 dark:text-gray-500 text-sm mt-1">
                Try searching for a different name or username
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
