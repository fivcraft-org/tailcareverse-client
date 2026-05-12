import { useState, useEffect } from "react";
import ConversationItem from "./ConversationItem";
import { searchUsers } from "../../api/api-user";
import { Search, X, SquarePen } from "lucide-react";

const ConversationList = ({
  conversations,
  loading,
  selectedChat,
  onSelect,
}) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);

  useEffect(() => {
    const delayDebounceFn = setTimeout(async () => {
      if (searchQuery.trim().length > 1) {
        setIsSearching(true);
        try {
          const res = await searchUsers(searchQuery);
          // The API returns { success: true, data: { users: [...], pagination: {...} } }
          const users = res.data.users || [];
          const formattedResults = users.map((user) => ({
            id: user._id,
            name: user.profile?.firstName
              ? `${user.profile.firstName} ${user.profile.lastName || ""}`
              : user.username,
            username: user.username,
            avatar: user.profile?.avatar?.url,
            isNew: true, // Tag it as new so the Chat component knows
          }));
          setSearchResults(formattedResults);
        } catch (err) {
          console.error("Search error:", err);
        } finally {
          setIsSearching(false);
        }
      } else {
        setSearchResults([]);
      }
    }, 500);

    return () => clearTimeout(delayDebounceFn);
  }, [searchQuery]);

  const clearSearch = () => {
    setSearchQuery("");
    setSearchResults([]);
  };

  return (
    <>
      <div className="chat-sidebar-header">
        <h3 className="chat-title">Messages</h3>
        <div className="chat-sidebar-actions">
          <SquarePen size={20} className="new-msg-icon" />
        </div>
      </div>

      <div className="chat-search-container">
        <div className="chat-search-box">
          <Search size={18} className="search-icon" />
          <input
            type="text"
            placeholder="Search users..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          {searchQuery && (
            <X size={18} className="clear-icon" onClick={clearSearch} />
          )}
        </div>
      </div>

      <div className="conversation-list-scroll">
        {searchQuery.trim().length > 0 ? (
          <>
            <div className="search-results-label">
              {isSearching ? "Searching..." : "Search Results"}
            </div>
            {searchResults.length === 0 && !isSearching ? (
              <div className="sidebar-empty">No users found.</div>
            ) : (
              searchResults.map((user) => (
                <ConversationItem
                  key={user.id}
                  chat={user}
                  isActive={selectedChat?.id === user.id}
                  onClick={() => {
                    onSelect(user);
                    clearSearch();
                  }}
                />
              ))
            )}
          </>
        ) : loading ? (
          <div className="sidebar-loading">Loading chats...</div>
        ) : conversations.length === 0 ? (
          <div className="sidebar-empty">No conversations yet.</div>
        ) : (
          conversations.map((chat) => (
            <ConversationItem
              key={chat.id}
              chat={chat}
              isActive={selectedChat?.id === chat.id}
              onClick={() => onSelect(chat)}
            />
          ))
        )}
      </div>
    </>
  );
};

export default ConversationList;
