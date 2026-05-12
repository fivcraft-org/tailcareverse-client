import { Link } from "react-router-dom";
import { truncateText } from "../../utils/helpers";
import { formatDistanceToNow } from "../../utils/time-utils";

const ConversationItem = ({ chat, onClick, isActive }) => {
  const defaultAvatar = "https://cdn-icons-png.flaticon.com/512/149/149071.png";
  const avatarUrl = chat.avatar || defaultAvatar;

  return (
    <div
      className={`conversation-item ${isActive ? "active" : ""}`}
      onClick={onClick}
    >
      <Link
        to={`/profile/${chat.id}`}
        className="conversation-avatar"
        onClick={(e) => e.stopPropagation()}
      >
        <img src={avatarUrl} alt={chat.name} />
        <div className="online-indicator"></div>
      </Link>
      <div className="conversation-info">
        <div className="conversation-header">
          <h4>{chat.name}</h4>
          <span className="timestamp">
            {chat.lastMessageAt ? formatDistanceToNow(chat.lastMessageAt) : ""}
          </span>
        </div>
        <p>
          {truncateText(chat.lastMessage, 40) ||
            (chat.username ? `@${chat.username}` : "No messages yet")}
        </p>
      </div>
    </div>
  );
};

export default ConversationItem;
