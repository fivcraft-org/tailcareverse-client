import { useAuth } from "../../hooks/useAuth";
import { formatTime } from "../../utils/helpers";

const MessageBubble = ({ message }) => {
  const { user } = useAuth();

  if (message.sender === "system") {
    return <div className="message-bubble system">{message.text}</div>;
  }

  const isMe =
    message.sender === "me" ||
    message.sender === user?._id ||
    message.sender?._id === user?._id;

  return (
    <div className={`message-bubble-container ${isMe ? "sent" : "received"}`}>
      <div className={`message-bubble ${isMe ? "sent" : "received"}`}>
        <div className="message-text">{message.text}</div>
        <div className="message-time">{formatTime(message.createdAt)}</div>
      </div>
    </div>
  );
};

export default MessageBubble;
